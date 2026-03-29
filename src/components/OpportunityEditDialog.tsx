import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import type { Opportunity, OppStage, ForecastStatus } from '@/data/demo-data';
import { StatusBadge, getOppStageVariant } from '@/components/StatusBadge';
import { toast } from 'sonner';

const defaultStages: OppStage[] = ['Prospect', 'Specification', 'Specified', 'Bid', 'Awarded'];
const forecastStatuses: ForecastStatus[] = ['Open', 'Closed Won', 'Closed Lost'];

interface Props {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityEditDialog({ opportunity, open, onOpenChange }: Props) {
  const { updateOpportunity, addTask } = useAppStore();
  const [form, setForm] = useState<Partial<Opportunity>>({});
  const [taskTitle, setTaskTitle] = useState('');
  const [customStage, setCustomStage] = useState('');
  const [showCustomStage, setShowCustomStage] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setForm({ ...opportunity });
      setShowCustomStage(false);
      setCustomStage('');
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n.toLocaleString());

  const handleSave = () => {
    const updates = { ...form };
    if (showCustomStage && customStage.trim()) {
      updates.stage = customStage.trim() as OppStage;
    }
    updateOpportunity(opportunity.id, updates);
    toast.success('Opportunity updated');
    onOpenChange(false);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    addTask({
      id: `t-${Date.now()}`,
      title: taskTitle,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: 'Medium',
      status: 'Open',
      linkedTo: opportunity.name,
      owner: opportunity.owner,
    });
    toast.success('Task created');
    setTaskTitle('');
  };

  const currentStage = form.stage || opportunity.stage;
  const currentForecast = form.forecastStatus || opportunity.forecastStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Opportunity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge label={currentStage} variant={getOppStageVariant(currentStage)} />
              <StatusBadge label={currentForecast} variant={currentForecast === 'Closed Won' ? 'success' : currentForecast === 'Closed Lost' ? 'destructive' : 'muted'} />
            </div>
            <span className="text-lg font-bold text-primary">{fmt(form.value ?? opportunity.value)}</span>
          </div>

          <div className="grid gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Stage</Label>
                {showCustomStage ? (
                  <div className="flex gap-1.5 mt-0.5">
                    <Input
                      value={customStage}
                      onChange={(e) => setCustomStage(e.target.value)}
                      placeholder="Custom stage name"
                      className="h-9 text-sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => { setShowCustomStage(false); setCustomStage(''); }}>✕</Button>
                  </div>
                ) : (
                  <Select
                    value={form.stage}
                    onValueChange={(v) => {
                      if (v === '__custom__') {
                        setShowCustomStage(true);
                      } else {
                        setForm({ ...form, stage: v as OppStage });
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {defaultStages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      <SelectItem value="__custom__">+ Custom Stage…</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Value ($)</Label>
                <Input type="number" value={form.value ?? ''} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Forecast Status</Label>
              <Select value={form.forecastStatus || 'Open'} onValueChange={(v) => setForm({ ...form, forecastStatus: v as ForecastStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {forecastStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Probability (%)</Label>
                <Input type="number" value={form.probability ?? ''} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Close Date</Label>
                <Input type="date" value={form.closeDate || ''} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Account</Label>
                <Input value={form.accountName || ''} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <Input value={form.owner || ''} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Mfg Line</Label>
              <Input value={form.manufacturerLine || ''} onChange={(e) => setForm({ ...form, manufacturerLine: e.target.value })} />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Add Task</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="e.g. Follow up on pricing…"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button size="sm" onClick={handleAddTask} disabled={!taskTitle.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" />Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
