-- Limita feedback a 5 envios por endereço IP a cada 10 minutos.
-- O IP vem do X-Forwarded-For disponibilizado pelo gateway do Supabase.
-- O endereço fica restrito a esta tabela e registros expirados são limpos
-- quando novos feedbacks são enviados.

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
