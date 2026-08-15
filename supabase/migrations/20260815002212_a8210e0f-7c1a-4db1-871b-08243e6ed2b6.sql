-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bootstrap: existing accounts become administrators
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Admin-only report deletion
CREATE OR REPLACE FUNCTION public.delete_commission_report(_report_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _deleted_invoices int := 0;
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'Only administrators can delete imported reports';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.commission_reports WHERE id = _report_id AND user_id = _uid) THEN
    RAISE EXCEPTION 'Report not found';
  END IF;

  DELETE FROM public.commission_invoice_lines WHERE report_id = _report_id;
  DELETE FROM public.commission_invoice_history WHERE report_id = _report_id;

  WITH gone AS (
    DELETE FROM public.commission_invoices
    WHERE user_id = _uid
      AND (first_report_id = _report_id OR last_report_id = _report_id)
      AND COALESCE(first_report_id, _report_id) = _report_id
      AND COALESCE(last_report_id, _report_id) = _report_id
    RETURNING 1
  )
  SELECT count(*) INTO _deleted_invoices FROM gone;

  UPDATE public.commission_invoices
    SET last_report_id = NULL WHERE last_report_id = _report_id;
  UPDATE public.commission_invoices
    SET first_report_id = NULL WHERE first_report_id = _report_id;

  DELETE FROM public.commission_reports WHERE id = _report_id;

  RETURN jsonb_build_object('deleted_invoices', _deleted_invoices);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_commission_report(uuid) TO authenticated;