-- Execute este script no SQL Editor do Supabase do projeto.
-- Ele cria/configura a tabela de feedback, valida texto e limita envios.
-- As migrations versionadas equivalentes são:
-- 20261027000000_add_anonymous_feedback.sql
-- 20261101000000_harden_feedback_input.sql
-- 20261101001000_rate_limit_feedback.sql

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback
  DROP CONSTRAINT IF EXISTS feedback_message_plain_text;

ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_message_plain_text
  CHECK (
    char_length(btrim(message)) BETWEEN 1 AND 1000
    AND message !~ '[<>]'
    AND translate(message, E'\n', '') !~ '[[:cntrl:]]'
  ) NOT VALID;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.feedback FROM PUBLIC, anon, authenticated;
GRANT INSERT (message) ON TABLE public.feedback TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.feedback TO service_role;

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(message)) BETWEEN 1 AND 1000
  AND message !~ '[<>]'
  AND translate(message, E'\n', '') !~ '[[:cntrl:]]'
);

CREATE TABLE IF NOT EXISTS public.feedback_rate_limits (
  client_ip INET PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0)
);

ALTER TABLE public.feedback_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.feedback_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.feedback_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_feedback_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  request_headers JSONB;
  forwarded_ip TEXT;
  client_address INET;
  attempts INTEGER;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  request_headers :=
    COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::jsonb;
  forwarded_ip := btrim(split_part(COALESCE(request_headers->>'x-forwarded-for', ''), ',', 1));

  IF forwarded_ip = '' THEN
    RAISE EXCEPTION 'Unable to determine client IP for feedback rate limit'
      USING ERRCODE = 'P0001';
  END IF;

  BEGIN
    client_address := forwarded_ip::inet;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Unable to determine client IP for feedback rate limit'
      USING ERRCODE = 'P0001';
  END;

  DELETE FROM public.feedback_rate_limits
  WHERE window_started_at < v_now - INTERVAL '24 hours';

  INSERT INTO public.feedback_rate_limits AS limits
    (client_ip, window_started_at, request_count)
  VALUES
    (client_address, v_now, 1)
  ON CONFLICT (client_ip) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= v_now - INTERVAL '10 minutes'
        THEN v_now
      ELSE limits.window_started_at
    END,
    request_count = CASE
      WHEN limits.window_started_at <= v_now - INTERVAL '10 minutes'
        THEN 1
      ELSE limits.request_count + 1
    END
  RETURNING request_count INTO attempts;

  IF attempts > 5 THEN
    RAISE EXCEPTION 'feedback rate limit exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.enforce_feedback_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_feedback_rate_limit ON public.feedback;
CREATE TRIGGER enforce_feedback_rate_limit
BEFORE INSERT ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.enforce_feedback_rate_limit();
