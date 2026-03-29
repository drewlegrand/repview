import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projects, manufacturerLines } from '@/data/demo-data';

const allStages = ['Prospect', 'Specification', 'Specified', 'Bid', 'Awarded'];
const territories = ['Northeast', 'Mid-Atlantic', 'Southeast', 'Midwest', 'West'];
const owners = ['Mike Torres', 'Sarah Chen', 'James Wright'];

interface NewOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectName?: string;
}

export default function NewOpportunityDialog({ open, onOpenChange, defaultProjectName }: NewOpportunityDialogProps) {
  const [form, setForm] = useState({
    name: '',
    accountName: '',
    stage: 'Prospect',
    value: '',
    probability: '15',
    closeDate: '',
    manufacturerLine: '',
    productCategory: '',
    territory: '',
    owner: '',
    projectName: defaultProjectName || '',
    bidDate: '',
    source: '',
  });

  const handleSubmit = () => {
    // In a real app, this would persist the new opportunity
    onOpenChange(false);
    setForm({
      name: '', accountName: '', stage: 'Lead', value: '', probability: '15',
      closeDate: '', manufacturerLine: '', productCategory: '', territory: '',
      owner: '', projectName: defaultProjectName || '', bidDate: '', source: '',
    });
  };

  // Reset projectName when dialog opens with a new default
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && defaultProjectName) {
      setForm(prev => ({ ...prev, projectName: defaultProjectName }));
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Opportunity</DialogTitle>
          <DialogDescription>Create a new opportunity to track in the pipeline.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Opportunity Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. City Center Tower - Roof Replacement"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Account *</Label>
              <Input
                value={form.accountName}
                onChange={e => setForm({ ...form, accountName: e.target.value })}
                placeholder="Account name"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Project</Label>
              <Select value={form.projectName} onValueChange={v => setForm({ ...form, projectName: v === '__none__' ? '' : v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Stage</Label>
              <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Manufacturer Line</Label>
              <Select value={form.manufacturerLine} onValueChange={v => setForm({ ...form, manufacturerLine: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select line" /></SelectTrigger>
                <SelectContent>
                  {manufacturerLines.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Value ($)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                placeholder="0"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Probability (%)</Label>
              <Input
                type="number"
                value={form.probability}
                onChange={e => setForm({ ...form, probability: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Close Date</Label>
              <Input
                type="date"
                value={form.closeDate}
                onChange={e => setForm({ ...form, closeDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Territory</Label>
              <Select value={form.territory} onValueChange={v => setForm({ ...form, territory: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select territory" /></SelectTrigger>
                <SelectContent>
                  {territories.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Owner</Label>
              <Select value={form.owner} onValueChange={v => setForm({ ...form, owner: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Product Category</Label>
              <Input
                value={form.productCategory}
                onChange={e => setForm({ ...form, productCategory: e.target.value })}
                placeholder="e.g. Roofing"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Source</Label>
              <Input
                value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
                placeholder="e.g. Architect Spec"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.accountName}>Create Opportunity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
