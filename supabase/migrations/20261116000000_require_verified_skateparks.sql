-- Oculta registros antigos até que existência, endereço e coordenadas sejam
-- conferidos em uma fonte confiável. A aprovação é feita por operador autorizado.
ALTER TABLE public.pistas
  ADD COLUMN IF NOT EXISTS verificado BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.pistas.verificado IS
  'Somente true após conferir existência, endereço e coordenadas da pista em fonte confiável.';

DROP POLICY IF EXISTS "Pistas são públicas" ON public.pistas;
DROP POLICY IF EXISTS "Pistas verificadas são públicas" ON public.pistas;

CREATE POLICY "Pistas verificadas são públicas"
ON public.pistas
FOR SELECT
USING (verificado IS TRUE);
