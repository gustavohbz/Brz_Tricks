CREATE FUNCTION public.product_photo_attached(_path text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.products p WHERE _path=ANY(p.photos)) $$;
REVOKE ALL ON FUNCTION public.product_photo_attached(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.product_photo_attached(text) TO authenticated;
DROP POLICY "Read active product photos or admin" ON storage.objects;
CREATE POLICY "Read active product photos or admin" ON storage.objects FOR SELECT TO anon,authenticated USING (bucket_id='product-photos' AND (EXISTS (SELECT 1 FROM public.products p WHERE storage.objects.name=ANY(p.photos) AND p.deleted_at IS NULL) OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(),'admin'))));
DROP POLICY "Remove unattached own photos" ON storage.objects;
CREATE POLICY "Remove unattached own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='product-photos' AND (storage.foldername(name))[1]=auth.uid()::text AND NOT public.product_photo_attached(storage.objects.name));
CREATE FUNCTION public.soft_delete_product(_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE removed uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 UPDATE public.products SET deleted_at=now() WHERE id=_id AND user_id=auth.uid() AND deleted_at IS NULL RETURNING id INTO removed;
 IF removed IS NULL THEN RAISE EXCEPTION 'Product not found or forbidden'; END IF;
 RETURN removed;
END $$;
REVOKE ALL ON FUNCTION public.soft_delete_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_product(uuid) TO authenticated;