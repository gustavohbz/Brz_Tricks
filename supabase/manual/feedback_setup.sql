-- Execute este script no SQL Editor do Supabase do projeto.
-- A migration 20261027000000_add_anonymous_feedback.sql já versiona a mesma tabela.
-- Este arquivo idempotente facilita configurar um banco onde ela ainda não foi criada.

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT feedback_message_plain_text CHECK (
    char_length(btrim(message)) BETWEEN 1 AND 1000
    AND message !~ '[<>]'
  )
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(message)) BETWEEN 1 AND 1000
  AND message !~ '[<>]'
);
