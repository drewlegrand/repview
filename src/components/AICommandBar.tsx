import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, FileText, Building2, Target, Search } from 'lucide-react';

interface AICommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestions = [
  { icon: Target, text: 'Create a new opportunity for Summit Roofing', category: 'Action' },
  { icon: FileText, text: 'Show open quotes expiring this month', category: 'Report' },
  { icon: Building2, text: 'Summarize activity for Henderson Architecture', category: 'Summary' },
  { icon: Search, text: 'Find delayed orders for skylights', category: 'Search' },
];

export function AICommandBar({ open, onOpenChange }: AICommandBarProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (text: string) => {
    const q = text || query;
    if (!q.trim()) return;
    setResponse(`Processing: "${q}"\n\nThis is a demo of the AI command surface. In production, this would:\n• Parse your natural language request\n• Map it to CRM actions, filters, or reports\n• Execute with your confirmation for write operations\n\nExample capabilities:\n→ Create records, update fields, generate tasks\n→ Build report filters from plain language\n→ Summarize account activity and opportunities\n→ Surface stale deals and forecast risks`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Sparkles className="h-5 w-5 text-accent shrink-0" />
          <Input
            placeholder="Ask AI anything... create records, run reports, summarize data"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit('')}
            className="border-0 shadow-none focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>

        {response ? (
          <div className="p-4 max-h-80 overflow-y-auto">
            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">{response}</div>
            <button
              onClick={() => { setResponse(''); setQuery(''); }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Ask another question
            </button>
          </div>
        ) : (
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Suggestions</p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s.text); handleSubmit(s.text); }}
                className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
              >
                <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1">{s.text}</span>
                <span className="text-xs text-muted-foreground">{s.category}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
