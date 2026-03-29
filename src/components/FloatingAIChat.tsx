import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, User, Bot, X, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const mockResponses: Record<string, string> = {
  default: "I can help you with:\n\n• **Creating records** — accounts, contacts, opportunities, quotes\n• **Running reports** — pipeline analysis, forecast, activity summaries\n• **Searching data** — find orders, projects, accounts\n• **Summarizing** — account activity, opportunity status\n• **Drafting** — follow-up emails, meeting notes\n\nTry asking me something specific!",
  opportunity: "I found **9 open opportunities** totaling **$3.2M** in pipeline value.\n\n**Top 3 by value:**\n1. Metro Office Complex - Full Envelope — $890K (Negotiation, 75%)\n2. City Center Tower - Roof Replacement — $485K (Quoted, 60%)\n3. Skyline HQ Curtainwall Skylights — $420K (Spec Influence, 35%)\n\nWould you like me to filter by manufacturer line, territory, or rep?",
  orders: "Here are the **active orders** in the system:\n\n| Order # | Project | Mfg Line | Status | Expected Ship |\n|---------|---------|----------|--------|---------------|\n| ORD-2026-0018 | Harbor Medical | Carlisle SynTec | In Production | Apr 10 |\n| ORD-2026-0019 | Capital Center | Soprema | Entered | May 15 |\n| ORD-2026-0017 | Patriot Plaza Ph2 | Tremco | Acknowledged | May 1 |\n\nThe **Harbor Medical** order ships in 13 days. Do you want me to check for potential delays?",
  account: "**Henderson Architecture Group** — Account Summary (90 days)\n\n📊 **Activity:** 6 interactions (2 meetings, 2 emails, 1 lunch & learn, 1 call)\n🎯 **Open Opportunities:** 2 totaling $805K\n📄 **Quotes:** 1 submitted ($485K), 1 pending\n👥 **Key Contacts:** Robert Henderson (Principal), Lisa Chang (Project Architect)\n\n**Recent Highlights:**\n- Mar 25: VELUX lunch & learn — strong interest in modular skylights\n- Mar 27: Roof system review for City Center Tower\n\n**Recommended Next Action:** Schedule spec review with Lisa Chang for Harbor Medical skylight layout.",
};

export function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant for EnvelopeCRM. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    const lower = input.toLowerCase();
    let response = mockResponses.default;
    if (lower.includes('opportunit') || lower.includes('pipeline') || lower.includes('deal')) response = mockResponses.opportunity;
    else if (lower.includes('order') || lower.includes('ship') || lower.includes('deliver')) response = mockResponses.orders;
    else if (lower.includes('account') || lower.includes('henderson') || lower.includes('summar')) response = mockResponses.account;

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
    setInput('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        title="Chat with AI Assistant"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop for expanded mode */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className={cn(
          'fixed z-50 flex flex-col bg-card border rounded-xl shadow-2xl overflow-hidden transition-all duration-300',
          expanded
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px]'
            : 'bottom-6 right-6 w-[380px] h-[500px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={expanded ? 'Minimize' : 'Expand'}
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => { setOpen(false); setExpanded(false); }}
              className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex gap-2.5', m.role === 'user' ? 'justify-end' : '')}>
              {m.role === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 border'
              )}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_table]:text-xs">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
              {m.role === 'user' && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t bg-muted/20">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 h-9 text-sm"
          />
          <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-9 px-3">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );
}
