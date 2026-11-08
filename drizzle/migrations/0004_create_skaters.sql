CREATE TABLE public.skaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 60 AND name !~ '[<>]'),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 300 AND bio !~ '[<>]'),
  home_park text NOT NULL CHECK (char_length(btrim(home_park)) BETWEEN 2 AND 100 AND home_park !~ '[<>]'),
  instagram text NOT NULL DEFAULT '' CHECK (instagram ~ '^[A-Za-z0-9._]{0,30}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skaters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skaters TO authenticated;
GRANT ALL ON public.skaters TO service_role;
ALTER TABLE public.skaters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skaters are public" ON public.skaters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Own skater insert" ON public.skaters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own skater update" ON public.skaters FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own skater delete" ON public.skaters FOR DELETE TO authenticated USING (auth.uid() = user_id);