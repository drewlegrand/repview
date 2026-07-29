import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { money, normalizeInvoiceNumber, useTrackedOrders } from '@/hooks/useCommissions';

const pick = (headers: string[], candidates: string[]) =>
  headers.findIndex((h) => candidates.some((c) => h.toLowerCase().replace(/[^a-z]/g, '').includes(c)));

export function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useTrackedOrders();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: true });
      const grid = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], {
        header: 1,
        raw: true,
        defval: null,
      });
      const headerRow = grid.findIndex((r) => (r ?? []).filter(Boolean).length >= 3);
      if (headerRow < 0) throw new Error('Could not find a header row');
      const headers = (grid[headerRow] ?? []).map((v) => String(v ?? ''));
      const cols = {
        invoice: pick(headers, ['invoice']),
        order: pick(headers, ['ordernumber', 'orderno', 'order']),
        customer: pick(headers, ['customer', 'account']),
        project: pick(headers, ['project', 'job']),
        amount: pick(headers, ['amount', 'total', 'value']),
        shipped: pick(headers, ['ship']),
      };
      if (cols.invoice < 0) throw new Error('No invoice number column found');

      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) throw new Error('Not signed in');

      const rows = [];
      for (let r = headerRow + 1; r < grid.length; r++) {
        const row = grid[r];
        const raw = row?.[cols.invoice];
        if (raw === null || raw === undefined || String(raw).trim() === '') continue;
        const invoiceNumber = String(raw).trim();
        const shippedRaw = cols.shipped >= 0 ? row?.[cols.shipped] : null;
        const shippedDate =
          shippedRaw instanceof Date ? shippedRaw.toISOString().slice(0, 10) : null;
        rows.push({
          user_id: userId,
          invoice_number: invoiceNumber,
          invoice_number_norm: normalizeInvoiceNumber(invoiceNumber),
          order_number: cols.order >= 0 ? String(row?.[cols.order] ?? '') || null : null,
          customer_name: cols.customer >= 0 ? String(row?.[cols.customer] ?? '') || null : null,
          project_name: cols.project >= 0 ? String(row?.[cols.project] ?? '') || null : null,
          order_amount: cols.amount >= 0 && typeof row?.[cols.amount] === 'number' ? (row[cols.amount] as number) : null,
          shipped: shippedRaw !== null && shippedRaw !== undefined && String(shippedRaw).trim() !== '',
          shipped_date: shippedDate,
        });
      }
      if (!rows.length) throw new Error('No rows with an invoice number');
      const { error } = await supabase
        .from('tracked_orders')
        .upsert(rows, { onConflict: 'user_id,invoice_number_norm' });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['tracked_orders'] });
      toast.success(`Imported ${rows.length} tracked orders`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your order tracking</CardTitle>
          <CardDescription>
            Import the spreadsheet you maintain. It needs an invoice number column; order #, customer, project,
            amount and ship date are picked up when present.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={input}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
          <Button onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import tracking sheet
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Invoice</th><th className="p-2 text-left">Order #</th>
                <th className="p-2 text-left">Customer</th><th className="p-2 text-left">Project</th>
                <th className="p-2 text-right">Amount</th><th className="p-2 text-left">Shipped</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 font-mono">{o.invoice_number}</td>
                  <td className="p-2">{o.order_number ?? '—'}</td>
                  <td className="p-2">{o.customer_name ?? '—'}</td>
                  <td className="p-2">{o.project_name ?? '—'}</td>
                  <td className="p-2 text-right">{money(o.order_amount)}</td>
                  <td className="p-2">
                    {o.shipped ? <Badge>{o.shipped_date ?? 'Shipped'}</Badge> : <span className="text-muted-foreground">Not shipped</span>}
                  </td>
                </tr>
              ))}
              {!orders.length && !isLoading && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No tracked orders imported yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}