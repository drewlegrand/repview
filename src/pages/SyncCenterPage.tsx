import { manufacturerLines } from '@/data/demo-data';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const syncLogs = [
  { id: 1, connector: 'Carlisle SynTec', direction: 'Inbound', object: 'Orders', records: 12, status: 'Success', timestamp: '2026-03-28 14:32' },
  { id: 2, connector: 'VELUX Skylights', direction: 'Bidirectional', object: 'Opportunities', records: 5, status: 'Success', timestamp: '2026-03-28 14:30' },
  { id: 3, connector: 'Tremco Roofing', direction: 'Inbound', object: 'Pricing', records: 248, status: 'Success', timestamp: '2026-03-28 14:15' },
  { id: 4, connector: 'Soprema', direction: 'Outbound', object: 'Quotes', records: 3, status: 'Warning', timestamp: '2026-03-28 13:45' },
  { id: 5, connector: 'Carlisle SynTec', direction: 'Inbound', object: 'Shipments', records: 0, status: 'Error', timestamp: '2026-03-28 12:00' },
];

export default function SyncCenterPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sync Center</h1>
          <p className="page-subtitle">Manage manufacturer API integrations and data sync</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Connector</Button>
      </div>

      {/* Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {manufacturerLines.filter(m => m.status === 'Active').map(m => (
          <div key={m.id} className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{m.categories.join(', ')}</p>
              </div>
              {m.apiConnected ? (
                <StatusBadge label="Connected" variant="success" />
              ) : (
                <StatusBadge label="Not Connected" variant="muted" />
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Accounts ✓</span>
                <span>Orders ✓</span>
                <span>Pricing {m.apiConnected ? '✓' : '—'}</span>
              </div>
              <Button variant="outline" size="sm" disabled={!m.apiConnected}>
                <RefreshCw className="h-3 w-3 mr-1" />Sync
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Logs */}
      <div className="data-table-wrapper">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Sync Activity</h3>
          <Button variant="ghost" size="sm"><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Connector</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Direction</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Object</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Records</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {syncLogs.map(l => (
              <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  {l.status === 'Success' && <CheckCircle className="h-4 w-4 text-success" />}
                  {l.status === 'Warning' && <AlertCircle className="h-4 w-4 text-warning" />}
                  {l.status === 'Error' && <XCircle className="h-4 w-4 text-destructive" />}
                </td>
                <td className="px-4 py-3 font-medium">{l.connector}</td>
                <td className="px-4 py-3"><StatusBadge label={l.direction} variant="muted" /></td>
                <td className="px-4 py-3">{l.object}</td>
                <td className="px-4 py-3">{l.records}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
