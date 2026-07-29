import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { money, useHistory, useReports } from '@/hooks/useCommissions';

export function HistoryTab() {
  const { data: history = [] } = useHistory();
  const { data: reports = [] } = useReports();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Imported reports</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-left">File</th><th className="p-2 text-left">Sheet</th>
                <th className="p-2 text-right">New</th><th className="p-2 text-right">Changed</th>
                <th className="p-2 text-right">Unchanged</th><th className="p-2 text-right">Commission</th>
                <th className="p-2 text-left">Ties out</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r: Record<string, unknown>) => (
                <tr key={String(r.id)} className="border-t">
                  <td className="p-2">{String(r.file_name)}</td>
                  <td className="p-2">{String(r.sheet_name ?? '—')}</td>
                  <td className="p-2 text-right">{String(r.rows_new)}</td>
                  <td className="p-2 text-right">{String(r.rows_changed)}</td>
                  <td className="p-2 text-right text-muted-foreground">{String(r.rows_unchanged)}</td>
                  <td className="p-2 text-right">{money(Number(r.parsed_total))}</td>
                  <td className="p-2">
                    {r.reported_total === null ? (
                      <span className="text-muted-foreground">no total on report</span>
                    ) : (
                      <Badge variant={r.totals_match ? 'default' : 'destructive'}>
                        {r.totals_match ? 'Ties out' : 'Off by ' + money(Number(r.parsed_total) - Number(r.reported_total))}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {!reports.length && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No imports yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Every new invoice, changed field and manual update.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-left">When</th><th className="p-2 text-left">Invoice</th>
                <th className="p-2 text-left">Change</th><th className="p-2 text-left">Field</th>
                <th className="p-2 text-left">From</th><th className="p-2 text-left">To</th>
                <th className="p-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: Record<string, unknown>) => {
                const inv = h.commission_invoices as { invoice_number?: string } | null;
                return (
                  <tr key={String(h.id)} className="border-t">
                    <td className="p-2 text-muted-foreground">{new Date(String(h.created_at)).toLocaleString()}</td>
                    <td className="p-2 font-mono">{inv?.invoice_number ?? '—'}</td>
                    <td className="p-2"><Badge variant={h.change_type === 'created' ? 'default' : 'secondary'}>{String(h.change_type)}</Badge></td>
                    <td className="p-2">{String(h.field_name ?? '—')}</td>
                    <td className="p-2 text-muted-foreground">{String(h.old_value ?? '—')}</td>
                    <td className="p-2">{String(h.new_value ?? '—')}</td>
                    <td className="p-2 text-muted-foreground">{String(h.source ?? '—')}</td>
                  </tr>
                );
              })}
              {!history.length && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No changes recorded yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}