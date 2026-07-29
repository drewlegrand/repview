import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
  money,
  pct,
  useCommissionInvoices,
  useManufacturers,
  useMarkReceived,
  useTrackedOrders,
} from '@/hooks/useCommissions';

export function OutstandingTab() {
  const { data: invoices = [], isLoading } = useCommissionInvoices();
  const { data: orders = [] } = useTrackedOrders();
  const { data: manufacturers = [] } = useManufacturers();
  const markReceived = useMarkReceived();
  const [search, setSearch] = useState('');

  const mfgName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? '—';
  const orderByInvoice = useMemo(
    () => new Map(orders.map((o) => [o.invoice_number_norm, o])),
    [orders],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) =>
      [i.invoice_number, i.customer_name, i.project_name, i.order_reference]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [invoices, search]);

  const owed = filtered.filter((i) => !i.marked_received);
  const received = filtered.filter((i) => i.marked_received);
  const unmatchedOrders = useMemo(() => {
    const known = new Set(invoices.map((i) => i.invoice_number_norm));
    return orders.filter((o) => o.shipped && !known.has(o.invoice_number_norm));
  }, [orders, invoices]);

  const sum = (rows: typeof invoices) => rows.reduce((s, i) => s + Number(i.commission_amount), 0);

  if (isLoading) {
    return <div className="flex items-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Outstanding commission" value={money(sum(owed))} sub={`${owed.length} invoices`} />
        <Stat label="Confirmed received" value={money(sum(received))} sub={`${received.length} invoices`} />
        <Stat
          label="Reported unpaid"
          value={String(owed.filter((i) => !i.commission_paid).length)}
          sub="shipped, no commission on report"
        />
        <Stat label="Shipped, not on any report" value={String(unmatchedOrders.length)} sub="from your order tracking" />
      </div>

      <Input placeholder="Search invoice, customer, project…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <Tabs defaultValue="owed">
        <TabsList>
          <TabsTrigger value="owed">Owed ({owed.length})</TabsTrigger>
          <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
          <TabsTrigger value="gaps">Gaps ({unmatchedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="owed" className="mt-4">
          <InvoiceTable
            rows={owed}
            mfgName={mfgName}
            orderByInvoice={orderByInvoice}
            action={(id) => (
              <Button size="sm" variant="outline" onClick={() => markReceived.mutate({ id, received: true })}>
                Mark received
              </Button>
            )}
          />
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          <InvoiceTable
            rows={received}
            mfgName={mfgName}
            orderByInvoice={orderByInvoice}
            action={(id) => (
              <Button size="sm" variant="ghost" onClick={() => markReceived.mutate({ id, received: false })}>
                Undo
              </Button>
            )}
          />
        </TabsContent>

        <TabsContent value="gaps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipped orders with no invoice on any report</CardTitle>
              <CardDescription>These are the ones to chase with the manufacturer.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr><Th>Invoice</Th><Th>Order #</Th><Th>Customer</Th><Th>Project</Th><Th right>Order amount</Th><Th>Shipped</Th></tr>
                </thead>
                <tbody>
                  {unmatchedOrders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <Td mono>{o.invoice_number}</Td>
                      <Td>{o.order_number ?? '—'}</Td>
                      <Td>{o.customer_name ?? '—'}</Td>
                      <Td>{o.project_name ?? '—'}</Td>
                      <Td right>{money(o.order_amount)}</Td>
                      <Td>{o.shipped_date ?? '—'}</Td>
                    </tr>
                  ))}
                  {!unmatchedOrders.length && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nothing outstanding here.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InvoiceTable({
  rows,
  mfgName,
  orderByInvoice,
  action,
}: {
  rows: ReturnType<typeof useCommissionInvoices>['data'] extends (infer T)[] | undefined ? T[] : never;
  mfgName: (id: string) => string;
  orderByInvoice: Map<string, { order_number: string | null }>;
  action: (id: string) => React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <Th>Invoice</Th><Th>Manufacturer</Th><Th>Customer</Th><Th>Date</Th>
              <Th right>Sales</Th><Th right>Rate</Th><Th right>Commission</Th>
              <Th>Status</Th><Th>Tracking</Th><Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const tracked = orderByInvoice.get(i.invoice_number_norm);
              return (
                <tr key={i.id} className="border-t">
                  <Td mono>{i.invoice_number}</Td>
                  <Td>{mfgName(i.manufacturer_id)}</Td>
                  <Td>{i.customer_name ?? '—'}</Td>
                  <Td>{i.invoice_date ?? '—'}</Td>
                  <Td right>{money(Number(i.sales_amount))}</Td>
                  <Td right>{pct(i.commission_rate === null ? null : Number(i.commission_rate))}</Td>
                  <Td right>{money(Number(i.commission_amount))}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {i.document_type === 'credit_memo' && <Badge variant="destructive">Credit memo</Badge>}
                      <Badge variant={i.commission_paid ? 'default' : 'secondary'}>
                        {i.commission_paid ? 'Commission on report' : 'No commission'}
                      </Badge>
                      {i.discrepancy_note && <Badge variant="outline" title={i.discrepancy_note}>Check math</Badge>}
                    </div>
                  </Td>
                  <Td>{tracked ? <Badge variant="outline">{tracked.order_number ?? 'Matched'}</Badge> : <span className="text-muted-foreground">Not tracked</span>}</Td>
                  <Td>{action(i.id)}</Td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No invoices here yet.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`p-2 font-medium ${right ? 'text-right' : 'text-left'}`}>{children}</th>;
}
function Td({ children, right, mono }: { children?: React.ReactNode; right?: boolean; mono?: boolean }) {
  return <td className={`p-2 ${right ? 'text-right' : ''} ${mono ? 'font-mono' : ''}`}>{children}</td>;
}
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}