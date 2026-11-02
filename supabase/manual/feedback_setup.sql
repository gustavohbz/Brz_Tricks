-- Execute este script no SQL Editor do Supabase do projeto.
-- A migration 20261027000000_add_anonymous_feedback.sql cria a tabela.
-- A migration 20261101000000_harden_feedback_input.sql aplica as mesmas
-- proteções automaticamente quando as migrations são executadas.
-- Este script configura a tabela e as proteções em bancos ainda não migrados.

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
