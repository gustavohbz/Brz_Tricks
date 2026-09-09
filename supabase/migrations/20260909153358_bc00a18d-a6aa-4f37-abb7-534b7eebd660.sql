DROP POLICY IF EXISTS "Qualquer um cria comentário" ON public.pista_comentarios;
DROP POLICY IF EXISTS "Qualquer um edita comentário" ON public.pista_comentarios;
DROP POLICY IF EXISTS "Qualquer um apaga comentário" ON public.pista_comentarios;

CREATE POLICY "Usuário cria seu comentário"
ON public.pista_comentarios FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autor edita seu comentário"
ON public.pista_comentarios FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autor apaga seu comentário"
ON public.pista_comentarios FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON public.pista_comentarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pista_comentarios TO authenticated;
GRANT ALL ON public.pista_comentarios TO service_role;