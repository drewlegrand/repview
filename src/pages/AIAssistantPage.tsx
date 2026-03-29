import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, User, Bot } from 'lucide-react';

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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant for EnvelopeCRM. I can help you create records, run reports, summarize data, and more. What would you like to do?" }
  ]);
  const [input, setInput] = useState('');

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            AI Assistant
          </h1>
          <p className="page-subtitle">Natural language CRM commands and intelligence</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
            )}
            <div className={`max-w-2xl rounded-lg px-4 py-3 text-sm ${
              m.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
            {m.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t">
        <Input
          placeholder="Ask anything... 'Show open opportunities', 'Summarize Henderson account', 'Find delayed orders'"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
