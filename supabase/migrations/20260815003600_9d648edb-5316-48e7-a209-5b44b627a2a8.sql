ALTER TABLE public.commission_invoices
  ADD COLUMN IF NOT EXISTS salesman_number text,
  ADD COLUMN IF NOT EXISTS salesman text,
  ADD COLUMN IF NOT EXISTS manufacturer_name text,
  ADD COLUMN IF NOT EXISTS manufacturer_office text,
  ADD COLUMN IF NOT EXISTS line_type text;

ALTER TABLE public.commission_invoice_lines
  ADD COLUMN IF NOT EXISTS salesman_number text,
  ADD COLUMN IF NOT EXISTS salesman text;