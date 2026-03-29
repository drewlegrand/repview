import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  subtitle?: string;
}

export function MetricCard({ title, value, change, changeType = 'neutral', icon, subtitle }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            {icon}
          </div>
        )}
      </div>
      {change && (
        <p className={cn(
          "mt-2 text-xs font-medium",
          changeType === 'positive' && 'text-success',
          changeType === 'negative' && 'text-destructive',
          changeType === 'neutral' && 'text-muted-foreground',
        )}>
          {change}
        </p>
      )}
    </div>
  );
}
