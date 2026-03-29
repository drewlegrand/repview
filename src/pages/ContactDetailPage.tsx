import { useParams, useNavigate } from 'react-router-dom';
import { contacts, accounts, opportunities, activities } from '@/data/demo-data';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit2, Save, X, Building2, Phone, Mail, User, Calendar, Briefcase, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());
const roles = ['Decision Maker', 'Specifier', 'Evaluator', 'Champion', 'Technical Buyer', 'Influencer'];
const influenceLevels = ['High', 'Medium', 'Low'];

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contact = contacts.find(c => c.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(contact ? { ...contact } : null);

  if (!contact || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button variant="outline" onClick={() => navigate('/contacts')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Contacts</Button>
      </div>
    );
  }

  const account = accounts.find(a => a.id === contact.accountId);
  const relatedOpps = opportunities.filter(o => o.accountName === contact.accountName);
  const relatedActivities = activities.filter(a => a.contactName === contact.name).slice(0, 8);

  const handleSave = () => setEditing(false);
  const handleCancel = () => { setForm({ ...contact }); setEditing(false); };

  const DetailField = ({ icon: Icon, label, value, editKey }: { icon: any; label: string; value: string; editKey?: string }) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing && editKey ? (
          <Input value={(form as any)[editKey] || ''} onChange={e => setForm({ ...form, [editKey]: e.target.value })} className="mt-1 h-8 text-sm" />
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/contacts')} className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{contact.name}</h1>
              <StatusBadge label={contact.influenceLevel} variant={contact.influenceLevel === 'High' ? 'success' : contact.influenceLevel === 'Medium' ? 'warning' : 'default'} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{contact.title} · {contact.accountName}</p>
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
          { label: 'Role', value: contact.role, icon: Briefcase },
          { label: 'Influence', value: contact.influenceLevel, icon: Target },
          { label: 'Related Opps', value: String(relatedOpps.length), icon: DollarSign },
          { label: 'Last Activity', value: contact.lastActivity, icon: Calendar },
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
            <h3 className="text-sm font-semibold mb-2">Contact Details</h3>
            <div className="divide-y">
              <DetailField icon={User} label="Title" value={form.title} editKey="title" />
              <DetailField icon={Mail} label="Email" value={form.email} editKey="email" />
              <DetailField icon={Phone} label="Phone" value={form.phone} editKey="phone" />
              <div className="flex items-start gap-3 py-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className="text-sm font-medium truncate text-primary cursor-pointer hover:underline" onClick={() => account && navigate(`/accounts/${account.id}`)}>
                    {form.accountName}
                  </p>
                </div>
              </div>
              {editing ? (
                <>
                  <div className="py-2.5">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                      <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="py-2.5">
                    <Label className="text-xs text-muted-foreground">Influence Level</Label>
                    <Select value={form.influenceLevel} onValueChange={v => setForm({ ...form, influenceLevel: v as any })}>
                      <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{influenceLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <DetailField icon={Briefcase} label="Role" value={form.role} />
                </>
              )}
            </div>
          </div>
          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this contact..." />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="activity">Activity ({relatedActivities.length})</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities ({relatedOpps.length})</TabsTrigger>
            </TabsList>

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
                    <p className="text-xs text-muted-foreground mt-1">{a.accountName} · {a.owner}</p>
                    <p className="text-sm mt-2 text-muted-foreground">{a.notes}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-4">
              <div className="space-y-3">
                {relatedOpps.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No opportunities found.</p>}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
