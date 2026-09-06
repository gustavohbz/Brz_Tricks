REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO service_role;