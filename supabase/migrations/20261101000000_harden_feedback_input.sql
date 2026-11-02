-- Aplica a validação também a chamadas diretas à API do Supabase.
-- NOT VALID evita que feedback antigo impeça a implantação; a regra vale
-- imediatamente para novas inserções e atualizações.

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
