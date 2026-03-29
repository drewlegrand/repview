import { useParams, useNavigate } from 'react-router-dom';
import { orders, accounts, projects } from '@/data/demo-data';
import { StatusBadge, getOrderStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit2, Save, X, Building2, Calendar, DollarSign, Briefcase, Truck, Hash, Package } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) => '$' + n.toLocaleString();
const allStatuses = ['Entered', 'Acknowledged', 'In Production', 'Shipped', 'Delivered', 'Complete', 'Hold', 'Cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(order ? { ...order } : null);

  if (!order || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="outline" onClick={() => navigate('/orders')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Orders</Button>
      </div>
    );
  }

  const account = accounts.find(a => a.name === order.accountName);
  const project = projects.find(p => p.name === order.project);

  const handleSave = () => setEditing(false);
  const handleCancel = () => { setForm({ ...order }); setEditing(false); };

  const DetailField = ({ icon: Icon, label, value, editKey, type = 'text' }: { icon: any; label: string; value: string; editKey?: string; type?: string }) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing && editKey ? (
          <Input value={(form as any)[editKey] || ''} onChange={e => setForm({ ...form, [editKey]: type === 'number' ? Number(e.target.value) : e.target.value })} className="mt-1 h-8 text-sm" type={type} />
        ) : (
          <p className="text-sm font-medium truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );

  // Simple status timeline
  const statusOrder = ['Entered', 'Acknowledged', 'In Production', 'Shipped', 'Delivered', 'Complete'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')} className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono">{order.orderNumber}</h1>
              <StatusBadge label={order.status} variant={getOrderStatusVariant(order.status)} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{order.accountName} · {order.manufacturerLine} · {order.project}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
              <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit2 className="h-4 w-4 mr-1" />Edit</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: fmt(form.total), icon: DollarSign },
          { label: 'Order Date', value: form.orderDate, icon: Calendar },
          { label: 'Expected Ship', value: form.expectedShip, icon: Truck },
          { label: 'Mfg Order #', value: form.mfgOrderNumber, icon: Hash },
        ].map(item => (
          <div key={item.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><item.icon className="h-3.5 w-3.5" />{item.label}</div>
            <p className="text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Status Timeline */}
      {currentIndex >= 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Order Progress</h3>
          <div className="flex items-center gap-0">
            {statusOrder.map((status, i) => (
              <div key={status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`h-3 w-3 rounded-full border-2 ${i <= currentIndex ? 'bg-primary border-primary' : 'border-muted-foreground/30 bg-background'}`} />
                  <span className={`text-xs mt-1.5 text-center ${i <= currentIndex ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{status}</span>
                </div>
                {i < statusOrder.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-4 ${i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Order Details</h3>
            <div className="divide-y">
              {editing && (
                <div className="py-2.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-start gap-3 py-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className={`text-sm font-medium truncate ${account ? 'text-primary cursor-pointer hover:underline' : ''}`}
                    onClick={() => account && navigate(`/accounts/${account.id}`)}>
                    {form.accountName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className={`text-sm font-medium truncate ${project ? 'text-primary cursor-pointer hover:underline' : ''}`}
                    onClick={() => project && navigate(`/projects/${project.id}`)}>
                    {form.project}
                  </p>
                </div>
              </div>
              <DetailField icon={Briefcase} label="Manufacturer Line" value={form.manufacturerLine} />
              <DetailField icon={Hash} label="Mfg Order #" value={form.mfgOrderNumber} editKey="mfgOrderNumber" />
              <DetailField icon={DollarSign} label="Total" value={fmt(form.total)} editKey="total" type="number" />
              <DetailField icon={Calendar} label="Order Date" value={form.orderDate} editKey="orderDate" type="date" />
              <DetailField icon={Truck} label="Expected Ship" value={form.expectedShip} editKey="expectedShip" type="date" />
            </div>
          </div>
          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this order..." />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">Order Line Items</h3>
            <p className="text-sm text-muted-foreground text-center py-8">Line item details will be available when order management is fully implemented.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
