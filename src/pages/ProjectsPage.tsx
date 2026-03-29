import { projects } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getProjectStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'name', label: 'Project', render: (p: typeof projects[0]) => <span className="font-medium text-primary">{p.name}</span> },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', render: (p: typeof projects[0]) => <StatusBadge label={p.status} variant={getProjectStatusVariant(p.status)} /> },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'sqft', label: 'Sq Ft', render: (p: typeof projects[0]) => p.sqft.toLocaleString() },
  { key: 'bidDate', label: 'Bid Date' },
  { key: 'architect', label: 'Architect' },
  { key: 'gc', label: 'GC' },
  { key: 'oppCount', label: 'Opps' },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} construction projects tracked</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1.5" />New Project</Button>
      </div>
      <DataTable data={projects} columns={columns} searchPlaceholder="Search projects..." />
    </div>
  );
}
