import { orders } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getOrderStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const fmt = (n: number) => '$' + n.toLocaleString();

const columns = [
  { key: 'orderNumber', label: 'Order #', render: (o: typeof orders[0]) => <span className="font-medium text-primary font-mono">{o.orderNumber}</span> },
  { key: 'mfgOrderNumber', label: 'Mfg Order #', render: (o: typeof orders[0]) => <span className="font-mono text-muted-foreground">{o.mfgOrderNumber}</span> },
  { key: 'project', label: 'Project' },
  { key: 'accountName', label: 'Account' },
  { key: 'manufacturerLine', label: 'Mfg Line' },
  { key: 'status', label: 'Status', render: (o: typeof orders[0]) => <StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} /> },
  { key: 'total', label: 'Total', render: (o: typeof orders[0]) => <span className="font-semibold">{fmt(o.total)}</span> },
  { key: 'orderDate', label: 'Ordered' },
  { key: 'expectedShip', label: 'Expected Ship' },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} orders tracked · {orders.filter(o => ['Entered', 'Acknowledged', 'In Production'].includes(o.status)).length} in progress</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Order</Button>
      </div>
      <DataTable data={orders} columns={columns} searchPlaceholder="Search orders..." />
    </div>
  );
}
