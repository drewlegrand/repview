import { useParams, useNavigate } from 'react-router-dom';
import { opportunities, activities, quotes, contacts, tasks } from '@/data/demo-data';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit2, Save, X, Phone, Mail, Calendar, FileText, CheckCircle2, Clock, User, Building2, Target, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

const allStages = ['Lead', 'Spec Influence', 'Budget Pricing', 'Quoted', 'Bid Submitted', 'Negotiation', 'Awarded', 'Lost', 'Deferred', 'Closed/Installed'];

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const opp = opportunities.find(o => o.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(opp ? { ...opp } : null);

  if (!opp || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Opportunity not found.</p>
        <Button variant="outline" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />Back to Opportunities
        </Button>
      </div>
    );
  }

  const relatedQuotes = quotes.filter(q => q.oppName === opp.name);
  const relatedActivities = activities.filter(a => a.accountName === opp.accountName).slice(0, 5);
  const relatedContacts = contacts.filter(c => c.accountName === opp.accountName);
  const relatedTasks = tasks.filter(t => t.linkedTo === opp.name);

  const handleSave = () => {
    // In a real app, this would persist changes
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...opp });
    setEditing(false);
  };

  const DetailField = ({ icon: Icon, label, value, editKey, type = 'text' }: { icon: any; label: string; value: string; editKey?: string; type?: string }) => (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing && editKey ? (
          <Input
            value={(form as any)[editKey] || ''}
            onChange={e => setForm({ ...form, [editKey]: type === 'number' ? Number(e.target.value) : e.target.value })}
            className="mt-1 h-8 text-sm"
            type={type}
          />
        ) : (
          <p className="text-sm font-medium truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/opportunities')} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{opp.name}</h1>
              <StatusBadge label={opp.stage} variant={getOppStageVariant(opp.stage)} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{opp.accountName} · {opp.territory} · {opp.manufacturerLine}</p>
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

      {/* Value banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Value', value: fmt(form.value), icon: DollarSign },
          { label: 'Probability', value: `${form.probability}%`, icon: Target },
          { label: 'Weighted', value: fmt(Math.round(form.value * form.probability / 100)), icon: DollarSign },
          { label: 'Close Date', value: form.closeDate, icon: Calendar },
        ].map(item => (
          <div key={item.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <item.icon className="h-3.5 w-3.5" />{item.label}
            </div>
            <p className="text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Opportunity Details</h3>
            <div className="divide-y">
              {editing ? (
                <div className="py-2.5">
                  <Label className="text-xs text-muted-foreground">Stage</Label>
                  <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v as any })}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <DetailField icon={Building2} label="Account" value={form.accountName} />
              <DetailField icon={Briefcase} label="Manufacturer Line" value={form.manufacturerLine} />
              <DetailField icon={Target} label="Product Category" value={form.productCategory} editKey="productCategory" />
              <DetailField icon={DollarSign} label="Value" value={fmt(form.value)} editKey="value" type="number" />
              <DetailField icon={Target} label="Probability" value={`${form.probability}%`} editKey="probability" type="number" />
              <DetailField icon={Calendar} label="Close Date" value={form.closeDate} editKey="closeDate" type="date" />
              <DetailField icon={Calendar} label="Bid Date" value={form.bidDate || '—'} editKey="bidDate" type="date" />
              <DetailField icon={User} label="Owner" value={form.owner} editKey="owner" />
              <DetailField icon={MapPin} label="Territory" value={form.territory} />
              <DetailField icon={Briefcase} label="Source" value={form.source} editKey="source" />
              {form.projectName && <DetailField icon={Building2} label="Project" value={form.projectName} />}
            </div>
          </div>

          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this opportunity..." />
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="activity">Activity ({relatedActivities.length})</TabsTrigger>
              <TabsTrigger value="quotes">Quotes ({relatedQuotes.length})</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({relatedContacts.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({relatedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <div className="space-y-3">
                {relatedActivities.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No activities yet.</p>}
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

            <TabsContent value="quotes" className="mt-4">
              <div className="space-y-3">
                {relatedQuotes.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No quotes linked to this opportunity.</p>}
                {relatedQuotes.map(q => (
                  <div key={q.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{q.number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">v{q.version} · {q.created} · Expires {q.expires}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{fmt(q.total)}</span>
                      <StatusBadge label={q.status} variant={q.status === 'Accepted' ? 'success' : q.status === 'Submitted' ? 'info' : q.status === 'Draft' ? 'default' : 'warning'} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-4">
              <div className="space-y-3">
                {relatedContacts.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No contacts found.</p>}
                {relatedContacts.map(c => (
                  <div key={c.id} className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.title} · {c.role}</p>
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

            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-3">
                {relatedTasks.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No tasks linked to this opportunity.</p>}
                {relatedTasks.map(t => (
                  <div key={t.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-4 w-4 ${t.status === 'Complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.owner} · Due {t.dueDate}</p>
                      </div>
                    </div>
                    <StatusBadge label={t.priority} variant={t.priority === 'High' ? 'destructive' : t.priority === 'Medium' ? 'warning' : 'default'} />
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
