import { contacts } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'name', label: 'Name', render: (c: typeof contacts[0]) => <span className="font-medium text-primary">{c.name}</span> },
  { key: 'title', label: 'Title' },
  { key: 'accountName', label: 'Account' },
  { key: 'role', label: 'Role', render: (c: typeof contacts[0]) => <StatusBadge label={c.role} variant="muted" /> },
  { key: 'influenceLevel', label: 'Influence', render: (c: typeof contacts[0]) => (
    <StatusBadge label={c.influenceLevel} variant={c.influenceLevel === 'High' ? 'success' : c.influenceLevel === 'Medium' ? 'warning' : 'muted'} />
  )},
  { key: 'email', label: 'Email', render: (c: typeof contacts[0]) => <span className="text-muted-foreground">{c.email}</span> },
  { key: 'phone', label: 'Phone' },
  { key: 'lastActivity', label: 'Last Activity' },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">{contacts.length} contacts across all accounts</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Contact</Button>
      </div>
      <DataTable data={contacts} columns={columns} searchPlaceholder="Search contacts..." />
    </div>
  );
}
