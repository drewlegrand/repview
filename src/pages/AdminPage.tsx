import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Shield, Users, MapPin, Building2, Upload, Key, Database } from 'lucide-react';

const users = [
  { name: 'Mike Torres', email: 'mtorres@envelopecrm.com', role: 'Outside Rep', territory: 'Northeast', status: 'Active' },
  { name: 'Sarah Chen', email: 'schen@envelopecrm.com', role: 'Outside Rep', territory: 'Mid-Atlantic', status: 'Active' },
  { name: 'James Wright', email: 'jwright@envelopecrm.com', role: 'Outside Rep', territory: 'Mid-Atlantic', status: 'Active' },
  { name: 'Karen Douglas', email: 'kdouglas@envelopecrm.com', role: 'Inside Sales', territory: 'All', status: 'Active' },
  { name: 'David Kim', email: 'dkim@envelopecrm.com', role: 'Sales Manager', territory: 'All', status: 'Active' },
  { name: 'Rachel Foster', email: 'rfoster@envelopecrm.com', role: 'Admin', territory: 'All', status: 'Active' },
];

const territories = [
  { name: 'Northeast', states: 'MA, CT, RI, NH, VT, ME', reps: 'Mike Torres', accounts: 6 },
  { name: 'Mid-Atlantic', states: 'NY, NJ, PA, MD, VA, DC, DE', reps: 'Sarah Chen, James Wright', accounts: 4 },
];

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">Users, roles, territories, and system settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card flex items-center gap-3 cursor-pointer hover:border-primary/30">
          <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="font-semibold">Users & Roles</p><p className="text-xs text-muted-foreground">{users.length} active users</p></div>
        </div>
        <div className="metric-card flex items-center gap-3 cursor-pointer hover:border-primary/30">
          <div className="rounded-lg bg-accent/10 p-3"><MapPin className="h-5 w-5 text-accent" /></div>
          <div><p className="font-semibold">Territories</p><p className="text-xs text-muted-foreground">{territories.length} territories defined</p></div>
        </div>
        <div className="metric-card flex items-center gap-3 cursor-pointer hover:border-primary/30">
          <div className="rounded-lg bg-success/10 p-3"><Upload className="h-5 w-5 text-success" /></div>
          <div><p className="font-semibold">Data Import</p><p className="text-xs text-muted-foreground">CSV import tools</p></div>
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table-wrapper">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Users</h3>
          <Button size="sm">Add User</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Territory</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><StatusBadge label={u.role} variant={u.role === 'Admin' ? 'destructive' : u.role === 'Sales Manager' ? 'warning' : 'default'} /></td>
                <td className="px-4 py-3">{u.territory}</td>
                <td className="px-4 py-3"><StatusBadge label={u.status} variant="success" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Territories */}
      <div className="data-table-wrapper">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Territories</h3>
          <Button size="sm" variant="outline">Add Territory</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Territory</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">States</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigned Reps</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accounts</th>
            </tr>
          </thead>
          <tbody>
            {territories.map((t, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.states}</td>
                <td className="px-4 py-3">{t.reps}</td>
                <td className="px-4 py-3">{t.accounts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
