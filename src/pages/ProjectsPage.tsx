import { projects, type Project } from '@/data/demo-data';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getProjectStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getDisplayContractor(p: Project) {
  if (p.contractors.length === 0) return '—';
  const primary = p.contractors.find(c => c.isPrimary) || p.contractors[0];
  const extra = p.contractors.length > 1 ? ` +${p.contractors.length - 1}` : '';
  return (
    <span>
      {primary.name}
      {extra && <span className="text-muted-foreground text-xs ml-1">{extra}</span>}
    </span>
  );
}

const columns = [
  { key: 'name', label: 'Project', render: (p: Project) => <span className="font-medium text-primary">{p.name}</span> },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', render: (p: Project) => <StatusBadge label={p.status} variant={getProjectStatusVariant(p.status)} /> },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'sqft', label: 'Sq Ft', render: (p: Project) => p.sqft.toLocaleString() },
  { key: 'bidDate', label: 'Bid Date' },
  { key: 'architect', label: 'Architect' },
  { key: 'contractors', label: 'Contractor', render: (p: Project) => getDisplayContractor(p) },
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
      <DataTable data={projects} columns={columns} searchPlaceholder="Search projects..." onRowClick={(p) => navigate(`/projects/${p.id}`)} />
    </div>
  );
}
