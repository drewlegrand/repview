import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  muted: 'bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', variantClasses[variant], className)}>
      {label}
    </span>
  );
}

export function getOppStageVariant(stage: string): BadgeVariant {
  switch (stage) {
    case 'Prospect': return 'muted';
    case 'Specification': return 'info';
    case 'Specified': return 'default';
    case 'Bid': return 'warning';
    case 'Awarded': return 'success';
    default: return 'default';
  }
}

export function getOrderStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Booked': return 'info';
    case 'Shipped': return 'success';
    default: return 'default';
  }
}

export function getQuoteStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Draft': return 'muted';
    case 'Internal Review': return 'info';
    case 'Submitted': return 'default';
    case 'Revised': return 'warning';
    case 'Accepted': return 'success';
    case 'Rejected': return 'destructive';
    case 'Expired': return 'muted';
    default: return 'default';
  }
}

export function getOrderStageVariant(stage: string): BadgeVariant {
  switch (stage) {
    case 'Entered': return 'muted';
    case 'Acknowledged': return 'info';
    case 'In Production': return 'default';
    case 'Shipped': return 'warning';
    case 'Complete': return 'success';
    case 'Hold': return 'destructive';
    case 'Cancelled': return 'destructive';
    default: return 'default';
  }
}

export function getProjectStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Pre-Design': return 'muted';
    case 'Design': return 'info';
    case 'Bidding': return 'warning';
    case 'Complete': return 'success';
    default: return 'default';
  }
}
