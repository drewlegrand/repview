import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Manufacturer = {
  id: string;
  name: string;
  slug: string;
  mapping_profile: MappingProfile | null;
};

export type ColumnMap = Record<string, number | null>;

export type MappingProfile = {
  headerRow: number;
  dataStartRow: number;
  dataEndRow: number;
  grain: 'invoice' | 'line';
  periodLabel: string | null;
  columns: ColumnMap;
};

export type CommissionInvoice = {
  id: string;
  manufacturer_id: string;
  invoice_number: string;
  invoice_number_norm: string;
  document_type: string;
  invoice_date: string | null;
  period_label: string | null;
  customer_name: string | null;
  order_reference: string | null;
  project_reference: string | null;
  project_name: string | null;
  sales_amount: number;
  commission_base: number;
  commission_rate: number | null;
  commission_amount: number;
  commission_paid: boolean;
  marked_received: boolean;
  marked_received_at: string | null;
  discrepancy_note: string | null;
};

export type TrackedOrder = {
  id: string;
  invoice_number: string;
  invoice_number_norm: string;
  order_number: string | null;
  customer_name: string | null;
  project_name: string | null;
  order_amount: number | null;
  shipped: boolean;
  shipped_date: string | null;
  manufacturer_id: string | null;
};

export const DEFAULT_MANUFACTURERS = [
  { name: 'Berridge', slug: 'berridge' },
  { name: 'Soprema', slug: 'soprema' },
];

/** "2232710" and "02232710" must collide; mirrors the server-side rule. */
export function normalizeInvoiceNumber(value: string): string {
  return String(value).trim().toUpperCase().replace(/\s+/g, '').replace(/(^|[^0-9])0+(\d)/g, '$1$2');
}

export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async (): Promise<Manufacturer[]> => {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase.from('manufacturers').select('*').order('name');
      if (error) throw error;
      if (data && data.length) return data as unknown as Manufacturer[];
      const { data: seeded, error: seedErr } = await supabase
        .from('manufacturers')
        .insert(DEFAULT_MANUFACTURERS.map((m) => ({ ...m, user_id: userId })))
        .select();
      if (seedErr) throw seedErr;
      return (seeded ?? []) as unknown as Manufacturer[];
    },
  });
}

export function useCommissionInvoices() {
  return useQuery({
    queryKey: ['commission_invoices'],
    queryFn: async (): Promise<CommissionInvoice[]> => {
      const { data, error } = await supabase
        .from('commission_invoices')
        .select('*')
        .order('invoice_date', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as CommissionInvoice[];
    },
  });
}

export function useTrackedOrders() {
  return useQuery({
    queryKey: ['tracked_orders'],
    queryFn: async (): Promise<TrackedOrder[]> => {
      const { data, error } = await supabase.from('tracked_orders').select('*').order('shipped_date', {
        ascending: false,
        nullsFirst: false,
      });
      if (error) throw error;
      return (data ?? []) as unknown as TrackedOrder[];
    },
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['commission_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ['commission_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_invoice_history')
        .select('*, commission_invoices(invoice_number, customer_name)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMarkReceived() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, received }: { id: string; received: boolean }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('commission_invoices')
        .update({ marked_received: received, marked_received_at: received ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
      if (userRes.user) {
        await supabase.from('commission_invoice_history').insert({
          user_id: userRes.user.id,
          invoice_id: id,
          change_type: 'updated',
          field_name: 'marked_received',
          old_value: String(!received),
          new_value: String(received),
          source: 'manual',
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commission_invoices'] });
      qc.invalidateQueries({ queryKey: ['commission_history'] });
    },
  });
}

export const money = (n: number | null | undefined) =>
  n === null || n === undefined
    ? '—'
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export const pct = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `${(n * 100).toFixed(2)}%`;