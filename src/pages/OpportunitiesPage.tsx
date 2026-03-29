import { opportunities } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewOpportunityDialog from '@/components/NewOpportunityDialog';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

const stages = ['Lead', 'Spec Influence', 'Budget Pricing', 'Quoted', 'Bid Submitted', 'Negotiation', 'Awarded'];

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
  const [view, setView] = useState<'table' | 'board'>('table');
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
          <div className="flex border rounded-md overflow-hidden">
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView('board')} className={`px-3 py-1.5 text-sm ${view === 'board' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setNewOppOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New Opportunity</Button>
        </div>
      </div>

      {view === 'table' ? (
        <DataTable data={opportunities} columns={columns} searchPlaceholder="Search opportunities..." onRowClick={(o) => navigate(`/opportunities/${o.id}`)} />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageOpps = opportunities.filter(o => o.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-sm font-semibold">{stage}</span>
                  <span className="text-xs text-muted-foreground">{stageOpps.length}</span>
                </div>
                <div className="space-y-2">
                  {stageOpps.map(o => (
                    <div key={o.id} className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/opportunities/${o.id}`)}>
                      <p className="text-sm font-medium truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{o.accountName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold">{fmt(o.value)}</span>
                        <span className="text-xs text-muted-foreground">{o.probability}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{o.manufacturerLine}</p>
                    </div>
                  ))}
                  {stageOpps.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No opportunities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewOpportunityDialog open={newOppOpen} onOpenChange={setNewOppOpen} />
    </div>
  );
}
