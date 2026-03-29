import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAppStore } from '@/stores/app-store.tsx';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getOppStageVariant, getOrderStageVariant } from '@/components/StatusBadge';
import { OpportunityEditDialog } from '@/components/OpportunityEditDialog';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, ChevronRight, ChevronDown, Package } from 'lucide-react';
import NewOpportunityDialog from '@/components/NewOpportunityDialog';
import type { Opportunity, OppStage, OrderStage } from '@/data/demo-data';

const defaultOppStages: OppStage[] = ['Prospect', 'Specification', 'Specified', 'Bid', 'Awarded'];
const orderStages: OrderStage[] = ['Pending', 'Booked', 'Shipped'];

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

const columns = [
  { key: 'name', label: 'Opportunity', render: (o: Opportunity) => <span className="font-medium text-primary">{o.name}</span> },
  { key: 'accountName', label: 'Account' },
  { key: 'stage', label: 'Stage', render: (o: Opportunity) => <StatusBadge label={o.stage} variant={getOppStageVariant(o.stage)} /> },
  { key: 'orderStage', label: 'Order Stage', render: (o: Opportunity) => o.orderStage ? <StatusBadge label={o.orderStage} variant={getOrderStageVariant(o.orderStage)} /> : <span className="text-muted-foreground">—</span> },
  { key: 'value', label: 'Value', render: (o: Opportunity) => <span className="font-semibold">{fmt(o.value)}</span> },
  { key: 'probability', label: 'Prob', render: (o: Opportunity) => `${o.probability}%` },
  { key: 'manufacturerLine', label: 'Mfg Line' },
  { key: 'closeDate', label: 'Close Date' },
  { key: 'owner', label: 'Owner' },
  { key: 'territory', label: 'Territory' },
];

export default function OpportunitiesPage() {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [newOppOpen, setNewOppOpen] = useState(false);
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null);
  const [showOrderStages, setShowOrderStages] = useState(true);
  const navigate = useNavigate();
  const { opportunities, moveOpportunityStage, updateOpportunity } = useAppStore();

  // Collect any custom stages from existing opportunities
  const customStages = opportunities
    .map(o => o.stage)
    .filter(s => !defaultOppStages.includes(s) && !orderStages.includes(s as any))
    .filter((s, i, a) => a.indexOf(s) === i);

  const allOppStages = [...defaultOppStages, ...customStages];
  const totalValue = opportunities.reduce((s, o) => s + o.value, 0);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const destId = result.destination.droppableId;
    const oppId = result.draggableId;

    // Check if dropping into an order stage column
    if ((orderStages as string[]).includes(destId)) {
      // Move to Awarded + set order stage
      updateOpportunity(oppId, { stage: 'Awarded', orderStage: destId as OrderStage });
    } else {
      // Moving to an opp stage — clear order stage if not Awarded
      if (destId !== 'Awarded') {
        updateOpportunity(oppId, { stage: destId as OppStage, orderStage: undefined });
      } else {
        moveOpportunityStage(oppId, destId as OppStage);
      }
    }
  };

  const renderKanbanColumn = (stage: string, isOrderStage: boolean, fillWidth: boolean = false) => {
    const stageOpps = isOrderStage
      ? opportunities.filter(o => o.stage === 'Awarded' && o.orderStage === stage)
      : stage === 'Awarded'
        ? opportunities.filter(o => o.stage === 'Awarded' && !o.orderStage)
        : opportunities.filter(o => o.stage === stage);
    const stageValue = stageOpps.reduce((s, o) => s + o.value, 0);

    return (
      <Droppable droppableId={stage} key={stage}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={fillWidth ? "flex-1 min-w-[200px]" : "flex-shrink-0 w-64"}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                {isOrderStage && <Package className="h-3 w-3 text-muted-foreground" />}
                <StatusBadge label={stage} variant={isOrderStage ? getOrderStageVariant(stage) : getOppStageVariant(stage)} />
                <span className="text-xs text-muted-foreground font-medium">{stageOpps.length}</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{fmt(stageValue)}</span>
            </div>
            <div className={`space-y-2 min-h-[120px] rounded-lg p-1.5 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : isOrderStage ? 'bg-accent/30' : 'bg-muted/30'}`}>
              {stageOpps.map((o, index) => (
                <Draggable key={o.id} draggableId={o.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      onClick={() => setEditOpp(o)}
                      className={`bg-card border rounded-lg p-3 shadow-sm cursor-pointer transition-all ${snap.isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : 'hover:shadow-md hover:border-primary/30'}`}
                    >
                      <p className="text-sm font-medium truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{o.accountName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary">{fmt(o.value)}</span>
                        <span className="text-xs text-muted-foreground">{o.probability}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground">{o.manufacturerLine}</span>
                        <span className="text-[11px] text-muted-foreground">{o.closeDate}</span>
                      </div>
                      {isOrderStage && o.orderStage && (
                        <div className="mt-2 pt-2 border-t">
                          <StatusBadge label={`Order: ${o.orderStage}`} variant={getOrderStageVariant(o.orderStage)} />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {stageOpps.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">Drop here</div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Opportunities</h1>
          <p className="page-subtitle">{opportunities.length} total · {fmt(totalValue)} pipeline value</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView('board')} className={`px-3 py-1.5 text-sm ${view === 'board' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setNewOppOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New Opportunity</Button>
        </div>
      </div>

      {view === 'list' ? (
        <DataTable data={opportunities} columns={columns} searchPlaceholder="Search opportunities..." onRowClick={(o) => navigate(`/opportunities/${o.id}`)} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto pb-4">
            {/* Opportunity Stages */}
            <div className="flex gap-3">
              {allOppStages.map(stage => renderKanbanColumn(stage, false))}
            </div>

            {/* Order Stages - Horizontally collapsible */}
            <div className="flex items-start shrink-0">
              <button
                onClick={() => setShowOrderStages(!showOrderStages)}
                className="flex flex-col items-center gap-1 px-2 py-3 ml-1 mr-1 rounded-lg border bg-card hover:bg-muted transition-colors self-stretch"
                title={showOrderStages ? 'Collapse order stages' : 'Expand order stages'}
              >
                {showOrderStages ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rotate-180" />}
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
                  Order Stages
                </span>
              </button>
              {showOrderStages && (
                <div className="flex gap-3 border-l pl-3">
                  {orderStages.map(stage => renderKanbanColumn(stage, true))}
                </div>
              )}
            </div>
          </div>
        </DragDropContext>
      )}

      <NewOpportunityDialog open={newOppOpen} onOpenChange={setNewOppOpen} />
      <OpportunityEditDialog opportunity={editOpp} open={!!editOpp} onOpenChange={(open) => !open && setEditOpp(null)} />
    </div>
  );
}
