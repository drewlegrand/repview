import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAppStore } from '@/stores/app-store';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { OpportunityEditDialog } from '@/components/OpportunityEditDialog';
import type { Opportunity, OppStage } from '@/data/demo-data';

const pipelineStages: OppStage[] = ['Lead', 'Spec Influence', 'Budget Pricing', 'Quoted', 'Bid Submitted', 'Negotiation', 'Awarded'];

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

export default function PipelinePage() {
  const { opportunities, moveOpportunityStage } = useAppStore();
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null);

  const openOpps = opportunities.filter((o) => !['Lost', 'Closed/Installed', 'Deferred'].includes(o.stage));
  const totalValue = openOpps.reduce((s, o) => s + o.value, 0);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStage = result.destination.droppableId as OppStage;
    moveOpportunityStage(result.draggableId, newStage);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-subtitle">{openOpps.length} open opportunities · {fmt(totalValue)} pipeline value</p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageOpps = opportunities.filter((o) => o.stage === stage);
            const stageValue = stageOpps.reduce((s, o) => s + o.value, 0);
            return (
              <Droppable droppableId={stage} key={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-shrink-0 w-64"
                  >
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={stage} variant={getOppStageVariant(stage)} />
                        <span className="text-xs text-muted-foreground font-medium">{stageOpps.length}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{fmt(stageValue)}</span>
                    </div>
                    <div
                      className={`space-y-2 min-h-[120px] rounded-lg p-1.5 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      {stageOpps.map((o, index) => (
                        <Draggable key={o.id} draggableId={o.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => setEditOpp(o)}
                              className={`bg-card border rounded-lg p-3 shadow-sm cursor-pointer transition-all ${
                                snap.isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : 'hover:shadow-md hover:border-primary/30'
                              }`}
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
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {stageOpps.length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <OpportunityEditDialog opportunity={editOpp} open={!!editOpp} onOpenChange={(open) => !open && setEditOpp(null)} />
    </div>
  );
}
