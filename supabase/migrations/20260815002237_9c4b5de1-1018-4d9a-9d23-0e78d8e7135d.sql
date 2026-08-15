REVOKE ALL ON FUNCTION public.delete_commission_report(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.delete_commission_report(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;