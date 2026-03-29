import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAppStore } from '@/stores/app-store';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getOrderStatusVariant, getOrderStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List } from 'lucide-react';
import type { Order, OrderStage } from '@/data/demo-data';

const orderStages: OrderStage[] = ['Pending', 'Booked', 'Shipped'];

const fmt = (n: number) => '$' + n.toLocaleString();

const columns = [
  { key: 'orderNumber', label: 'Order #', render: (o: Order) => <span className="font-medium text-primary font-mono">{o.orderNumber}</span> },
  { key: 'mfgOrderNumber', label: 'Mfg Order #', render: (o: Order) => <span className="font-mono text-muted-foreground">{o.mfgOrderNumber}</span> },
  { key: 'project', label: 'Project' },
  { key: 'accountName', label: 'Account' },
  { key: 'manufacturerLine', label: 'Mfg Line' },
  { key: 'status', label: 'Status', render: (o: Order) => <StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} /> },
  { key: 'orderStage', label: 'Order Stage', render: (o: Order) => <StatusBadge label={o.orderStage} variant={getOrderStageVariant(o.orderStage)} /> },
  { key: 'total', label: 'Total', render: (o: Order) => <span className="font-semibold">{fmt(o.total)}</span> },
  { key: 'orderDate', label: 'Ordered' },
  { key: 'expectedShip', label: 'Expected Ship' },
];

export default function OrdersPage() {
  const [view, setView] = useState<'list' | 'board'>('list');
  const navigate = useNavigate();
  const { orders, moveOrderStage } = useAppStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    moveOrderStage(result.draggableId, result.destination.droppableId as OrderStage);
  };

  const renderKanbanColumn = (stage: OrderStage) => {
    const stageOrders = orders.filter(o => o.orderStage === stage);
    const stageValue = stageOrders.reduce((s, o) => s + o.total, 0);

    return (
      <Droppable droppableId={stage} key={stage}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <StatusBadge label={stage} variant={getOrderStageVariant(stage)} />
                <span className="text-xs text-muted-foreground font-medium">{stageOrders.length}</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{fmt(stageValue)}</span>
            </div>
            <div className={`space-y-2 min-h-[120px] rounded-lg p-1.5 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'}`}>
              {stageOrders.map((o, index) => (
                <Draggable key={o.id} draggableId={o.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className={`bg-card border rounded-lg p-3 shadow-sm cursor-pointer transition-all ${snap.isDragging ? 'shadow-lg ring-2 ring-primary/30 rotate-1' : 'hover:shadow-md hover:border-primary/30'}`}
                    >
                      <p className="text-sm font-medium font-mono truncate">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">{o.accountName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary">{fmt(o.total)}</span>
                        <StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground">{o.manufacturerLine}</span>
                        <span className="text-[11px] text-muted-foreground">{o.project}</span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {stageOrders.length === 0 && (
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
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} orders tracked · {orders.filter(o => o.orderStage !== 'Shipped').length} in progress</p>
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
          <Button><Plus className="h-4 w-4 mr-1.5" />New Order</Button>
        </div>
      </div>

      {view === 'list' ? (
        <DataTable data={orders} columns={columns} searchPlaceholder="Search orders..." onRowClick={(o) => navigate(`/orders/${o.id}`)} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div
            className="grid w-full gap-3 pb-4"
            style={{ gridTemplateColumns: `repeat(${orderStages.length}, minmax(0, 1fr))` }}
          >
            {orderStages.map(stage => renderKanbanColumn(stage))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
