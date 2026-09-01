CREATE TYPE public.pista_nivel AS ENUM ('iniciante', 'intermediario', 'avancado');

CREATE TABLE public.pistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  endereco TEXT,
  tamanho_m2 INTEGER,
  piso TEXT,
  nivel public.pista_nivel NOT NULL DEFAULT 'iniciante',
  descricao TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pistas TO anon;
GRANT SELECT ON public.pistas TO authenticated;
GRANT ALL ON public.pistas TO service_role;
ALTER TABLE public.pistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pistas são públicas" ON public.pistas FOR SELECT USING (true);

CREATE TABLE public.pista_comentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pista_id UUID NOT NULL REFERENCES public.pistas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nome TEXT,
  autor_avatar TEXT,
  nota SMALLINT NOT NULL DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
  texto TEXT NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 1000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pista_comentarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pista_comentarios TO authenticated;
GRANT ALL ON public.pista_comentarios TO service_role;
ALTER TABLE public.pista_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários são públicos" ON public.pista_comentarios FOR SELECT USING (true);
CREATE POLICY "Usuário cria seu comentário" ON public.pista_comentarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário edita seu comentário" ON public.pista_comentarios FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário apaga seu comentário" ON public.pista_comentarios FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX pista_comentarios_pista_id_idx ON public.pista_comentarios (pista_id, created_at DESC);

INSERT INTO public.pistas (nome, cidade, estado, endereco, tamanho_m2, piso, nivel, descricao, lat, lng) VALUES
('Praça Roosevelt', 'São Paulo', 'SP', 'Praça Roosevelt, Consolação', 1200, 'Concreto', 'iniciante', 'Clássico do street paulistano: chão liso, bancos e escadas baixas. Ótimo para treinar ollie e variais.', -23.5462, -46.6444),
('Skate Park do Ibirapuera', 'São Paulo', 'SP', 'Parque Ibirapuera, Portão 10', 2500, 'Concreto', 'intermediario', 'Bowl e área de street no mesmo espaço. Movimento alto nos fins de semana.', -23.5874, -46.6576),
('Pista de Skate do Sesc Pompeia', 'São Paulo', 'SP', 'R. Clélia, 93 - Água Branca', 600, 'Concreto', 'iniciante', 'Pista pequena e coberta, perfeita para primeiros passos e dias de chuva.', -23.5254, -46.6862),
('Praça do Ó', 'Rio de Janeiro', 'RJ', 'Av. Ayrton Senna - Barra da Tijuca', 3000, 'Concreto', 'avancado', 'Um dos maiores complexos do país, com bowl profundo e obstáculos grandes.', -23.0043, -43.3652),
('Pista do Parque Barigui', 'Curitiba', 'PR', 'Parque Barigui - Bigorrilho', 1400, 'Concreto', 'intermediario', 'Bom fluxo de transições e corrimões médios em meio ao parque.', -25.4249, -49.3095),
('Pista da Orla de Copacabana', 'Rio de Janeiro', 'RJ', 'Av. Atlântica - Copacabana', 800, 'Concreto', 'iniciante', 'Pista aberta à beira-mar com obstáculos baixos e chão bem liso.', -22.9711, -43.1822),
('Skatepark da Redenção', 'Porto Alegre', 'RS', 'Parque Farroupilha - Bom Fim', 1000, 'Concreto', 'intermediario', 'Mistura de quarter, banks e caixotes. Comunidade bem ativa.', -30.0421, -51.2178),
('Pista do Parque das Nações', 'Belo Horizonte', 'MG', 'Av. Nossa Senhora do Carmo - Sion', 900, 'Concreto', 'iniciante', 'Espaço tranquilo e sombreado para treinar base e primeiros flips.', -19.9505, -43.9345);