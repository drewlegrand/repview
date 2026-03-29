import { useParams, useNavigate } from 'react-router-dom';
import { accounts, contacts, opportunities, orders, activities } from '@/data/demo-data';
import { StatusBadge, getOppStageVariant, getOrderStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit2, Save, X, Building2, MapPin, Phone, Globe, User, Calendar, Mail, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());
const allTypes = ['Architect', 'Consultant', 'Building Owner', 'General Contractor', 'Roofing Contractor', 'Waterproofing Contractor', 'Glazing Contractor', 'Distributor', 'Manufacturer', 'Developer', 'Facilities Owner'];
const territories = ['Northeast', 'Mid-Atlantic', 'Southeast', 'Midwest', 'West'];

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const account = accounts.find(a => a.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(account ? { ...account } : null);

  if (!account || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Account not found.</p>
        <Button variant="outline" onClick={() => navigate('/accounts')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Accounts</Button>
      </div>
    );
  }

  const relatedContacts = contacts.filter(c => c.accountName === account.name);
  const relatedOpps = opportunities.filter(o => o.accountName === account.name);
  const relatedOrders = orders.filter(o => o.accountName === account.name);
  const relatedActivities = activities.filter(a => a.accountName === account.name).slice(0, 8);

  const handleSave = () => setEditing(false);
  const handleCancel = () => { setForm({ ...account }); setEditing(false); };

  const DetailField = ({ icon: Icon, label, value, editKey, type = 'text' }: { icon: any; label: string; value: string; editKey?: string; type?: string }) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing && editKey ? (
          <Input value={(form as any)[editKey] || ''} onChange={e => setForm({ ...form, [editKey]: e.target.value })} className="mt-1 h-8 text-sm" type={type} />
        ) : (
          <p className="text-sm font-medium truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')} className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{account.name}</h1>
              <StatusBadge label={account.type} variant="muted" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{account.city}, {account.state} · {account.territory}</p>
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
          { label: 'Contacts', value: String(relatedContacts.length), icon: User },
          { label: 'Opportunities', value: String(relatedOpps.length), icon: Target },
          { label: 'Pipeline Value', value: fmt(relatedOpps.filter(o => !['Lost', 'Closed/Installed'].includes(o.stage)).reduce((s, o) => s + o.value, 0)), icon: DollarSign },
          { label: 'Last Activity', value: account.lastActivity, icon: Calendar },
        ].map(item => (
          <div key={item.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><item.icon className="h-3.5 w-3.5" />{item.label}</div>
            <p className="text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Account Details</h3>
            <div className="divide-y">
              {editing && (
                <div className="py-2.5">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{allTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {editing && (
                <div className="py-2.5">
                  <Label className="text-xs text-muted-foreground">Territory</Label>
                  <Select value={form.territory} onValueChange={v => setForm({ ...form, territory: v })}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <DetailField icon={MapPin} label="City" value={form.city} editKey="city" />
              <DetailField icon={MapPin} label="State" value={form.state} editKey="state" />
              <DetailField icon={Phone} label="Phone" value={form.phone} editKey="phone" />
              <DetailField icon={Globe} label="Website" value={form.website} editKey="website" />
              <DetailField icon={User} label="Owner" value={form.owner} editKey="owner" />
            </div>
          </div>
          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this account..." />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="contacts">Contacts ({relatedContacts.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities ({relatedOpps.length})</TabsTrigger>
              <TabsTrigger value="orders">Orders ({relatedOrders.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity ({relatedActivities.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="mt-4">
              <div className="space-y-3">
                {relatedContacts.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No contacts for this account.</p>}
                {relatedContacts.map(c => (
                  <div key={c.id} className="bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.title} · {c.role}</p>
                      </div>
                      <StatusBadge label={c.influenceLevel} variant={c.influenceLevel === 'High' ? 'success' : c.influenceLevel === 'Medium' ? 'warning' : 'default'} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-4">
              <div className="space-y-3">
                {relatedOpps.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No opportunities for this account.</p>}
                {relatedOpps.map(o => (
                  <div key={o.id} className="bg-card border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/opportunities/${o.id}`)}>
                    <div>
                      <p className="text-sm font-medium">{o.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.manufacturerLine} · {o.owner}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{fmt(o.value)}</span>
                      <StatusBadge label={o.stage} variant={getOppStageVariant(o.stage)} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="space-y-3">
                {relatedOrders.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No orders for this account.</p>}
                {relatedOrders.map(o => (
                  <div key={o.id} className="bg-card border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/orders/${o.id}`)}>
                    <div>
                      <p className="text-sm font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.manufacturerLine} · {o.project}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{fmt(o.total)}</span>
                      <StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                {relatedActivities.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No activities found.</p>}
                {relatedActivities.map(a => (
                  <div key={a.id} className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={a.type} variant={a.type === 'Meeting' || a.type === 'Site Visit' ? 'info' : a.type === 'Call' ? 'warning' : 'default'} />
                        <span className="text-sm font-medium">{a.subject}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.contactName} · {a.owner}</p>
                    <p className="text-sm mt-2 text-muted-foreground">{a.notes}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
