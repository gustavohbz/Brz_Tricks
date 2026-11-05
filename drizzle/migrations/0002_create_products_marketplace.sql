CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
CREATE TABLE public.products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 name text NOT NULL, description text NOT NULL DEFAULT '', price_cents integer NOT NULL,
 pickup_location text NOT NULL, condition text NOT NULL, whatsapp text NOT NULL,
 photos text[] NOT NULL, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT products_name_valid CHECK (char_length(name) BETWEEN 2 AND 100 AND name ~ '^[[:alnum:] .(),/-]+$'),
 CONSTRAINT products_description_valid CHECK (char_length(description) <= 2000 AND description !~ '[<>]' AND translate(description, E'\n', '') !~ '[[:cntrl:]]'),
 CONSTRAINT products_location_valid CHECK (char_length(pickup_location) BETWEEN 3 AND 160 AND pickup_location ~ '^[[:alnum:] .(),/-]+$'),
 CONSTRAINT products_price_valid CHECK (price_cents BETWEEN 1 AND 999999999),
 CONSTRAINT products_condition_valid CHECK (condition IN ('novo','como_novo','bom','usado')),
 CONSTRAINT products_whatsapp_valid CHECK (whatsapp ~ '^55[1-9][0-9]{9,10}$'),
 CONSTRAINT products_photos_valid CHECK (cardinality(photos) BETWEEN 1 AND 4)
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT (id,user_id,name,description,price_cents,pickup_location,condition,whatsapp,photos), UPDATE (name,description,price_cents,pickup_location,condition,whatsapp,photos,deleted_at), DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT TO anon,authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admins see deleted products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners create products" ON public.products FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND deleted_at IS NULL);
CREATE POLICY "Owners edit active products" ON public.products FOR UPDATE TO authenticated USING (user_id=auth.uid() AND deleted_at IS NULL) WITH CHECK (user_id=auth.uid());
CREATE POLICY "Admins permanently delete removed products" ON public.products FOR DELETE TO authenticated USING (deleted_at IS NOT NULL AND public.has_role(auth.uid(),'admin'));
CREATE INDEX products_active_created ON public.products (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX products_owner ON public.products(user_id);
CREATE FUNCTION public.validate_product() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog,public AS $$
DECLARE photo text;
BEGIN
 NEW.name := btrim(NEW.name); NEW.pickup_location := btrim(NEW.pickup_location); NEW.description := btrim(NEW.description);
 IF NEW.name ~ '[<>]' OR NEW.description ~ '[<>]' OR NEW.pickup_location ~ '[<>]' OR NEW.description ~ '[​-‏‪-‮⁠-⁯﻿]' THEN RAISE EXCEPTION 'Invalid product text'; END IF;
 IF TG_OP='UPDATE' THEN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Immutable product identity'; END IF;
  IF OLD.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Deleted products cannot be edited'; END IF;
 END IF;
 IF NEW.deleted_at IS NOT NULL THEN NEW.deleted_at := now(); END IF;
 IF cardinality(NEW.photos) NOT BETWEEN 1 AND 4 OR (SELECT count(DISTINCT p) FROM unnest(NEW.photos) p) <> cardinality(NEW.photos) THEN RAISE EXCEPTION 'One to four unique photos required'; END IF;
 FOREACH photo IN ARRAY NEW.photos LOOP
  IF photo IS NULL OR photo !~ ('^' || NEW.user_id::text || '/' || NEW.id::text || '/[0-9a-f-]{36}\.jpg$') THEN RAISE EXCEPTION 'Invalid photo path'; END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='product-photos' AND name=photo AND (metadata->>'size')::bigint BETWEEN 1 AND 5242880 AND metadata->>'mimetype'='image/jpeg') THEN RAISE EXCEPTION 'Photo missing or invalid'; END IF;
 END LOOP;
 NEW.updated_at := now(); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_product() FROM PUBLIC;
CREATE TRIGGER validate_product BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_product();
CREATE POLICY "Upload own product photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='product-photos' AND name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$') AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id::text=(storage.foldername(name))[2] AND p.user_id<>auth.uid()));
CREATE POLICY "Read active product photos or admin" ON storage.objects FOR SELECT TO anon,authenticated USING (bucket_id='product-photos' AND (EXISTS (SELECT 1 FROM public.products p WHERE name=ANY(p.photos) AND p.deleted_at IS NULL) OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Remove unattached own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='product-photos' AND (storage.foldername(name))[1]=auth.uid()::text AND NOT EXISTS (SELECT 1 FROM public.products p WHERE name=ANY(p.photos)));
COMMENT ON TABLE public.products IS 'Marketplace listings: owners edit and soft-delete active items; only admins read deleted items and hard-delete them.';