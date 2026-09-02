ALTER TABLE public.pista_comentarios DROP CONSTRAINT IF EXISTS pista_comentarios_user_id_fkey;

DROP POLICY IF EXISTS "Usuário cria seu comentário" ON public.pista_comentarios;
DROP POLICY IF EXISTS "Usuário edita seu comentário" ON public.pista_comentarios;
DROP POLICY IF EXISTS "Usuário apaga seu comentário" ON public.pista_comentarios;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pista_comentarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pista_comentarios TO authenticated;
GRANT ALL ON public.pista_comentarios TO service_role;

CREATE POLICY "Qualquer um cria comentário" ON public.pista_comentarios
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Qualquer um edita comentário" ON public.pista_comentarios
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Qualquer um apaga comentário" ON public.pista_comentarios
  FOR DELETE TO anon, authenticated USING (true);