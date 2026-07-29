-- MANUFACTURERS
CREATE TABLE public.manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  default_commission_rate numeric,
  mapping_profile jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manufacturers TO authenticated;
GRANT ALL ON public.manufacturers TO service_role;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own manufacturers" ON public.manufacturers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REPORTS
CREATE TABLE public.commission_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text,
  sheet_name text,
  period_label text,
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'pending',
  detected_mapping jsonb,
  grain text NOT NULL DEFAULT 'invoice',
  rows_parsed integer NOT NULL DEFAULT 0,
  rows_new integer NOT NULL DEFAULT 0,
  rows_changed integer NOT NULL DEFAULT 0,
  rows_unchanged integer NOT NULL DEFAULT 0,
  reported_total_commission numeric,
  parsed_total_commission numeric,
  totals_match boolean,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_reports TO authenticated;
GRANT ALL ON public.commission_reports TO service_role;
ALTER TABLE public.commission_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own reports" ON public.commission_reports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_commission_reports_mfr ON public.commission_reports (user_id, manufacturer_id);

-- INVOICES
CREATE TABLE public.commission_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  first_report_id uuid REFERENCES public.commission_reports(id) ON DELETE SET NULL,
  last_report_id uuid REFERENCES public.commission_reports(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  invoice_number_norm text NOT NULL,
  document_type text NOT NULL DEFAULT 'invoice',
  invoice_date date,
  period_label text,
  customer_name text,
  customer_number text,
  order_reference text,
  project_reference text,
  project_name text,
  sales_amount numeric NOT NULL DEFAULT 0,
  commission_base numeric NOT NULL DEFAULT 0,
  commission_rate numeric,
  commission_amount numeric NOT NULL DEFAULT 0,
  commission_paid boolean NOT NULL DEFAULT false,
  marked_received boolean NOT NULL DEFAULT false,
  marked_received_at timestamptz,
  discrepancy_note text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, manufacturer_id, invoice_number_norm)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_invoices TO authenticated;
GRANT ALL ON public.commission_invoices TO service_role;
ALTER TABLE public.commission_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own commission invoices" ON public.commission_invoices
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_commission_invoices_norm ON public.commission_invoices (user_id, invoice_number_norm);
CREATE INDEX idx_commission_invoices_open ON public.commission_invoices (user_id, marked_received, commission_paid);

-- LINES
CREATE TABLE public.commission_invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.commission_invoices(id) ON DELETE CASCADE,
  report_id uuid REFERENCES public.commission_reports(id) ON DELETE SET NULL,
  line_type text,
  product_code text,
  product_name text,
  quantity numeric,
  unit_price numeric,
  sales_amount numeric,
  commission_rate numeric,
  commission_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_invoice_lines TO authenticated;
GRANT ALL ON public.commission_invoice_lines TO service_role;
ALTER TABLE public.commission_invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own invoice lines" ON public.commission_invoice_lines
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_commission_lines_invoice ON public.commission_invoice_lines (invoice_id);

-- HISTORY (audit log)
CREATE TABLE public.commission_invoice_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.commission_invoices(id) ON DELETE CASCADE,
  report_id uuid REFERENCES public.commission_reports(id) ON DELETE SET NULL,
  change_type text NOT NULL,
  field_name text,
  old_value text,
  new_value text,
  source text NOT NULL DEFAULT 'import',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.commission_invoice_history TO authenticated;
GRANT ALL ON public.commission_invoice_history TO service_role;
ALTER TABLE public.commission_invoice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own invoice history" ON public.commission_invoice_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert their own invoice history" ON public.commission_invoice_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_commission_history_invoice ON public.commission_invoice_history (user_id, created_at DESC);

-- TRACKED ORDERS
CREATE TABLE public.tracked_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  invoice_number_norm text NOT NULL,
  order_number text,
  customer_name text,
  project_name text,
  order_amount numeric,
  expected_commission numeric,
  shipped boolean NOT NULL DEFAULT false,
  shipped_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, invoice_number_norm)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracked_orders TO authenticated;
GRANT ALL ON public.tracked_orders TO service_role;
ALTER TABLE public.tracked_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own tracked orders" ON public.tracked_orders
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_tracked_orders_norm ON public.tracked_orders (user_id, invoice_number_norm);

-- updated_at triggers
CREATE TRIGGER trg_manufacturers_updated BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_commission_reports_updated BEFORE UPDATE ON public.commission_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_commission_invoices_updated BEFORE UPDATE ON public.commission_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tracked_orders_updated BEFORE UPDATE ON public.tracked_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();