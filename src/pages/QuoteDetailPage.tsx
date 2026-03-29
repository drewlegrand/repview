import { useParams, useNavigate } from 'react-router-dom';
import { quotes, opportunities, accounts } from '@/data/demo-data';
import { StatusBadge, getQuoteStatusVariant, getOppStageVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit2, Save, X, FileText, Building2, Calendar, DollarSign, Briefcase, Target, Hash } from 'lucide-react';
import { useState } from 'react';

const fmt = (n: number) => '$' + n.toLocaleString();
const allStatuses = ['Draft', 'Internal Review', 'Submitted', 'Revised', 'Accepted', 'Rejected', 'Expired'];

export default function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quote = quotes.find(q => q.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(quote ? { ...quote } : null);

  if (!quote || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <p className="text-muted-foreground">Quote not found.</p>
        <Button variant="outline" onClick={() => navigate('/quotes')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Quotes</Button>
      </div>
    );
  }

  const relatedOpp = opportunities.find(o => o.name === quote.oppName);
  const account = accounts.find(a => a.name === quote.accountName);

  const handleSave = () => setEditing(false);
  const handleCancel = () => { setForm({ ...quote }); setEditing(false); };

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')} className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono">{quote.number}</h1>
              <StatusBadge label={quote.status} variant={getQuoteStatusVariant(quote.status)} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{quote.oppName} · {quote.accountName}</p>
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
          { label: 'Version', value: `v${form.version}`, icon: Hash },
          { label: 'Created', value: form.created, icon: Calendar },
          { label: 'Expires', value: form.expires, icon: Calendar },
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
            <h3 className="text-sm font-semibold mb-2">Quote Details</h3>
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
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Opportunity</p>
                  <p className={`text-sm font-medium truncate ${relatedOpp ? 'text-primary cursor-pointer hover:underline' : ''}`}
                    onClick={() => relatedOpp && navigate(`/opportunities/${relatedOpp.id}`)}>
                    {form.oppName}
                  </p>
                </div>
              </div>
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
              <DetailField icon={Briefcase} label="Manufacturer Line" value={form.manufacturerLine} />
              <DetailField icon={DollarSign} label="Total" value={fmt(form.total)} editKey="total" type="number" />
              <DetailField icon={Hash} label="Version" value={`v${form.version}`} />
              <DetailField icon={Calendar} label="Created" value={form.created} />
              <DetailField icon={Calendar} label="Expires" value={form.expires} editKey="expires" type="date" />
            </div>
          </div>
          {editing && (
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea className="mt-1 text-sm" rows={4} placeholder="Add notes about this quote..." />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">Line Items</h3>
            <p className="text-sm text-muted-foreground text-center py-8">Line item details will be available when the quote builder is implemented.</p>
          </div>
          {relatedOpp && (
            <div className="bg-card border rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold mb-3">Related Opportunity</h3>
              <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors" onClick={() => navigate(`/opportunities/${relatedOpp.id}`)}>
                <div>
                  <p className="text-sm font-medium">{relatedOpp.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{relatedOpp.manufacturerLine} · {relatedOpp.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{fmt(relatedOpp.value)}</span>
                  <StatusBadge label={relatedOpp.stage} variant={getOppStageVariant(relatedOpp.stage)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
