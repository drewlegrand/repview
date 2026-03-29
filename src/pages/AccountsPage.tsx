import { accounts } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'name', label: 'Account Name', render: (a: typeof accounts[0]) => <span className="font-medium text-primary">{a.name}</span> },
  { key: 'type', label: 'Type', render: (a: typeof accounts[0]) => <StatusBadge label={a.type} variant="muted" /> },
  { key: 'territory', label: 'Territory' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'owner', label: 'Owner' },
  { key: 'contactCount', label: 'Contacts', render: (a: typeof accounts[0]) => a.contactCount },
  { key: 'oppCount', label: 'Opps', render: (a: typeof accounts[0]) => a.oppCount },
  { key: 'lastActivity', label: 'Last Activity' },
];

export default function AccountsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">{accounts.length} accounts across all territories</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Account</Button>
      </div>
      <DataTable data={accounts} columns={columns} searchPlaceholder="Search accounts..." onRowClick={(a) => navigate(`/accounts/${a.id}`)} />
    </div>
  );
}
