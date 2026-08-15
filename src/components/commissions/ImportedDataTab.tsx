import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CommissionInvoiceLine,
  money,
  pct,
  useCommissionInvoicesWithLines,
  useManufacturers,
} from '@/hooks/useCommissions';

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

export function ImportedDataTab() {
  const { data: invoices = [], isLoading } = useCommissionInvoicesWithLines();
  const { data: manufacturers = [] } = useManufacturers();
  const [search, setSearch] = useState('');
  const [manufacturerId, setManufacturerId] = useState('all');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesManufacturer = manufacturerId === 'all' || inv.manufacturer_id === manufacturerId;
      if (!term) return matchesManufacturer;
      const haystack = [
        inv.invoice_number,
        inv.customer_name,
        inv.customer_number,
        inv.project_name,
        inv.project_reference,
        inv.salesman,
        inv.salesman_number,
        inv.manufacturer_name,
        inv.manufacturer_office,
      ]
        .join(' ')
        .toLowerCase();
      return matchesManufacturer && haystack.includes(term);
    });
  }, [invoices, search, manufacturerId]);

  const rows = useMemo(() => {
    const out: Array<
      | { kind: 'invoice'; inv: (typeof filtered)[number] }
      | { kind: 'line'; inv: (typeof filtered)[number]; line: CommissionInvoiceLine }
    > = [];
    for (const inv of filtered) {
      const lines = inv.commission_invoice_lines;
      if (lines && lines.length) {
        for (const line of lines) {
          out.push({ kind: 'line', inv, line });
        }
      } else {
        out.push({ kind: 'invoice', inv });
      }
    }
    return out;
  }, [filtered]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        const sales = r.kind === 'line' ? r.line.sales_amount ?? 0 : r.inv.sales_amount;
        const commission = r.kind === 'line' ? r.line.commission_amount ?? 0 : r.inv.commission_amount;
        acc.sales += sales;
        acc.commission += commission;
        return acc;
      },
      { sales: 0, commission: 0 },
    );
  }, [rows]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imported data</CardTitle>
          <CardDescription>
            Every invoice and line item that has been saved from your manufacturer reports. Line-level
            reports are shown one row per line; invoice-level reports show one row per invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search invoice, customer, project, salesman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-80"
            />
            <select
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              aria-label="Filter by manufacturer"
              className={cn(
                'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'sm:w-56',
              )}
            >
              <option value="all">All manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Manufacturer</th>
                  <th className="p-2 text-left">Manufacturer Office</th>
                  <th className="p-2 text-left">Customer #</th>
                  <th className="p-2 text-left">Customer Name</th>
                  <th className="p-2 text-left">Invoice</th>
                  <th className="p-2 text-left">Project #</th>
                  <th className="p-2 text-left">Project Name</th>
                  <th className="p-2 text-left">Product #</th>
                  <th className="p-2 text-left">Product Name</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Sales Amount</th>
                  <th className="p-2 text-right">Commission Rate</th>
                  <th className="p-2 text-right">Commission Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-muted-foreground">
                      Loading imported data…
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  rows.map((r, idx) => {
                    const inv = r.inv;
                    const line = r.kind === 'line' ? r.line : null;
                    return (
                      <tr key={`${inv.id}-${idx}`} className="border-t">
                        <td className="p-2">{formatDate(inv.invoice_date)}</td>
                        <td className="p-2">{inv.manufacturer_name ?? '—'}</td>
                        <td className="p-2">{inv.manufacturer_office ?? '—'}</td>
                        <td className="p-2">{inv.customer_number ?? '—'}</td>
                        <td className="p-2">{inv.customer_name ?? '—'}</td>
                        <td className="p-2 font-mono">{inv.invoice_number}</td>
                        <td className="p-2">{inv.project_reference ?? '—'}</td>
                        <td className="p-2">{inv.project_name ?? '—'}</td>
                        <td className="p-2">{line ? line.product_code ?? '—' : '—'}</td>
                        <td className="p-2">{line ? line.product_name ?? '—' : '—'}</td>
                        <td className="p-2 text-right">{line ? line.quantity ?? '—' : '—'}</td>
                        <td className="p-2 text-right">
                          {line ? money(line.unit_price) : '—'}
                        </td>
                        <td className="p-2 text-right">
                          {line ? money(line.sales_amount) : money(inv.sales_amount)}
                        </td>
                        <td className="p-2 text-right">
                          {line ? pct(line.commission_rate) : pct(inv.commission_rate)}
                        </td>
                        <td className="p-2 text-right">
                          {line ? money(line.commission_amount) : money(inv.commission_amount)}
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && !rows.length && (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-muted-foreground">
                      No imported data yet. Upload a report on the Import report tab.
                    </td>
                  </tr>
                )}
              </tbody>
              {!isLoading && rows.length > 0 && (
                <tfoot className="bg-muted/50 text-xs font-medium">
                  <tr>
                    <td colSpan={12} className="p-2 text-right">
                      {rows.length} row{rows.length === 1 ? '' : 's'}
                    </td>
                    <td className="p-2 text-right">{money(totals.sales)}</td>
                    <td className="p-2 text-right" />
                    <td className="p-2 text-right">{money(totals.commission)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
