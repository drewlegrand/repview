import { opportunities } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewOpportunityDialog from '@/components/NewOpportunityDialog';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

const columns = [
  { key: 'name', label: 'Opportunity', render: (o: typeof opportunities[0]) => <span className="font-medium text-primary">{o.name}</span> },
  { key: 'accountName', label: 'Account' },
  { key: 'stage', label: 'Stage', render: (o: typeof opportunities[0]) => <StatusBadge label={o.stage} variant={getOppStageVariant(o.stage)} /> },
  { key: 'value', label: 'Value', render: (o: typeof opportunities[0]) => <span className="font-semibold">{fmt(o.value)}</span> },
  { key: 'probability', label: 'Prob', render: (o: typeof opportunities[0]) => `${o.probability}%` },
  { key: 'manufacturerLine', label: 'Mfg Line' },
  { key: 'closeDate', label: 'Close Date' },
  { key: 'owner', label: 'Owner' },
  { key: 'territory', label: 'Territory' },
];

export default function OpportunitiesPage() {
  const [newOppOpen, setNewOppOpen] = useState(false);
  const navigate = useNavigate();
  const openOpps = opportunities.filter(o => !['Lost', 'Closed/Installed', 'Deferred'].includes(o.stage));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Opportunities</h1>
          <p className="page-subtitle">{openOpps.length} open · {fmt(openOpps.reduce((s, o) => s + o.value, 0))} pipeline value</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setNewOppOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New Opportunity</Button>
        </div>
      </div>

      <DataTable data={opportunities} columns={columns} searchPlaceholder="Search opportunities..." onRowClick={(o) => navigate(`/opportunities/${o.id}`)} />

      <NewOpportunityDialog open={newOppOpen} onOpenChange={setNewOppOpen} />
    </div>
  );
}
