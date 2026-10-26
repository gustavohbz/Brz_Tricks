CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$ SELECT false $function$;
REVOKE ALL ON TABLE public.subscriptions FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid) FROM anon, service_role, PUBLIC;
COMMENT ON TABLE public.subscriptions IS 'DEPRECATED: retired billing history; the application is free to use and does not create or consume subscriptions.';
COMMENT ON FUNCTION public.has_active_subscription(uuid) IS 'DEPRECATED: billing disabled; account features never depend on subscriptions.';