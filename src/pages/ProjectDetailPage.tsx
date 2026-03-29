import { useParams, useNavigate } from 'react-router-dom';
import { projects, opportunities, quotes, orders, activities } from '@/data/demo-data';
import { StatusBadge, getProjectStatusVariant, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit2, Save, X, Building2, MapPin, Calendar, Ruler, User, Briefcase, HardHat, Target, CloudIcon, Plus } from 'lucide-react';
import OneDriveFileBrowser from '@/components/OneDriveFileBrowser';
import NewOpportunityDialog from '@/components/NewOpportunityDialog';
import { useState } from 'react';

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());
const allStatuses = ['Pre-Design', 'Design', 'Bidding', 'Construction', 'Complete', 'On Hold'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(project ? { ...project } : null);
  const [newOppOpen, setNewOppOpen] = useState(false);

  if (!project || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />Back to Projects
        </Button>
      </div>
    );
  }

  const relatedOpps = opportunities.filter(o => o.projectName === project.name);
  const relatedOrders = orders.filter(o => o.project === project.name);
  const relatedActivities = activities.filter(a =>
    a.accountName === project.architect || a.accountName === project.gc
  ).slice(0, 5);

  const handleSave = () => setEditing(false);
  const handleCancel = () => { setForm({ ...project }); setEditing(false); };

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
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{project.name}</h1>
              <StatusBadge label={project.status} variant={getProjectStatusVariant(project.status)} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{project.address}, {project.city}, {project.state} · {project.type}</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Square Footage', value: form.sqft.toLocaleString() + ' sqft', icon: Ruler },
          { label: 'Bid Date', value: form.bidDate, icon: Calendar },
          { label: 'Opportunities', value: String(relatedOpps.length), icon: Target },
          { label: 'Orders', value: String(relatedOrders.length), icon: Briefcase },
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
            <h3 className="text-sm font-semibold mb-2">Project Details</h3>
            <div className="divide-y">
              {editing && (
                <div className="py-2.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DetailField icon={MapPin} label="Address" value={form.address} editKey="address" />
              <DetailField icon={MapPin} label="City" value={form.city} editKey="city" />
              <DetailField icon={MapPin} label="State" value={form.state} editKey="state" />
              <DetailField icon={Building2} label="Type" value={form.type} editKey="type" />
              <DetailField icon={Ruler} label="Square Footage" value={form.sqft.toLocaleString()} editKey="sqft" type="number" />
              <DetailField icon={Calendar} label="Bid Date" value={form.bidDate} editKey="bidDate" type="date" />
              <DetailField icon={User} label="Owner" value={form.owner} editKey="owner" />
              <DetailField icon={HardHat} label="Architect" value={form.architect} editKey="architect" />
              <DetailField icon={HardHat} label="General Contractor" value={form.gc} editKey="gc" />
            </div>
          </div>

          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this project..." />
            </div>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="opportunities">Opportunities ({relatedOpps.length})</TabsTrigger>
              <TabsTrigger value="orders">Orders ({relatedOrders.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity ({relatedActivities.length})</TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1.5">
                <CloudIcon className="h-3.5 w-3.5" />Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="mt-4">
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setNewOppOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />New Opportunity
                  </Button>
                </div>
                {relatedOpps.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No opportunities linked to this project.</p>}
                {relatedOpps.map(o => (
                  <div
                    key={o.id}
                    className="bg-card border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/opportunities/${o.id}`)}
                  >
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
                {relatedOrders.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No orders linked to this project.</p>}
                {relatedOrders.map(o => (
                  <div key={o.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.manufacturerLine} · {o.mfgOrderNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{fmt(o.total)}</span>
                      <StatusBadge label={o.status} variant={o.status === 'Delivered' || o.status === 'Complete' ? 'success' : o.status === 'Shipped' ? 'info' : 'default'} />
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

            <TabsContent value="files" className="mt-4">
              <OneDriveFileBrowser projectName={project.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NewOpportunityDialog open={newOppOpen} onOpenChange={setNewOppOpen} defaultProjectName={project.name} />
    </div>
  );
}
