import { quotes } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getQuoteStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = (n: number) => '$' + n.toLocaleString();

const columns = [
  { key: 'number', label: 'Quote #', render: (q: typeof quotes[0]) => <span className="font-medium text-primary font-mono">{q.number}</span> },
  { key: 'oppName', label: 'Opportunity' },
  { key: 'accountName', label: 'Account' },
  { key: 'manufacturerLine', label: 'Mfg Line' },
  { key: 'status', label: 'Status', render: (q: typeof quotes[0]) => <StatusBadge label={q.status} variant={getQuoteStatusVariant(q.status)} /> },
  { key: 'total', label: 'Total', render: (q: typeof quotes[0]) => <span className="font-semibold">{fmt(q.total)}</span> },
  { key: 'version', label: 'Ver', render: (q: typeof quotes[0]) => `v${q.version}` },
  { key: 'created', label: 'Created' },
  { key: 'expires', label: 'Expires' },
];

export default function QuotesPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-subtitle">{quotes.length} quotes · {quotes.filter(q => q.status === 'Submitted' || q.status === 'Internal Review').length} pending</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Quote</Button>
      </div>
      <DataTable data={quotes} columns={columns} searchPlaceholder="Search quotes..." onRowClick={(q) => navigate(`/quotes/${q.id}`)} />
    </div>
  );
}
