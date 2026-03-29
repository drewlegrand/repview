import { MetricCard } from '@/components/MetricCard';
import { StatusBadge, getOppStageVariant, getOrderStatusVariant } from '@/components/StatusBadge';
import { dashboardStats, pipelineByStage, revenueByLine, monthlyTrend, forecastByRep, opportunities, orders, tasks, activities } from '@/data/demo-data';
import { Target, FileText, Package, TrendingUp, DollarSign, Activity, BarChart3, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(220,70%,50%)', 'hsl(32,95%,52%)', 'hsl(142,71%,45%)', 'hsl(280,65%,60%)', 'hsl(199,89%,48%)', 'hsl(350,70%,50%)', 'hsl(170,60%,45%)'];

const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K');

export default function Dashboard() {
  const openOpps = opportunities.filter(o => !['Lost', 'Closed/Installed', 'Deferred'].includes(o.stage));
  const urgentTasks = tasks.filter(t => t.status !== 'Complete').slice(0, 4);
  const recentActivities = activities.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Mike Torres · Northeast Territory</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Pipeline Value" value={fmt(dashboardStats.pipelineValue)} change="+12% vs last quarter" changeType="positive" icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Weighted Forecast" value={fmt(dashboardStats.weightedForecast)} change="Q2 2026" changeType="neutral" icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard title="Won YTD" value={fmt(dashboardStats.wonThisYear)} change="+34% vs prior year" changeType="positive" icon={<Target className="h-5 w-5" />} />
        <MetricCard title="Open Opportunities" value={dashboardStats.openOpps} subtitle={`${dashboardStats.quotesOutstanding} quotes outstanding`} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline by Stage */}
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Manufacturer Line */}
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">Pipeline by Manufacturer Line</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={revenueByLine} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {revenueByLine.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">Monthly Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Area type="monotone" dataKey="pipeline" stroke="hsl(220,70%,50%)" fill="hsl(220,70%,50%)" fillOpacity={0.1} />
              <Area type="monotone" dataKey="won" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.15} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">Forecast by Rep</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={forecastByRep} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="rep" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="commit" fill="hsl(142,71%,45%)" radius={[0, 4, 4, 0]} name="Commit" />
              <Bar dataKey="bestCase" fill="hsl(220,70%,50%)" radius={[0, 4, 4, 0]} name="Best Case" />
              <Bar dataKey="upside" fill="hsl(199,89%,48%)" radius={[0, 4, 4, 0]} name="Upside" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Tasks + Activities + Recent Opps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-3">Upcoming Tasks</h3>
          <div className="space-y-3">
            {urgentTasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 text-sm">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${t.priority === 'High' ? 'bg-destructive' : t.priority === 'Medium' ? 'bg-warning' : 'bg-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Due {t.dueDate} · {t.owner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-3">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map(a => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.subject}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {a.date} · {a.accountName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Orders */}
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-3">Active Orders</h3>
          <div className="space-y-3">
            {orders.filter(o => !['Complete', 'Cancelled', 'Delivered'].includes(o.status)).map(o => (
              <div key={o.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.project}</p>
                  <p className="text-xs text-muted-foreground">{o.manufacturerLine} · Ship {o.expectedShip}</p>
                </div>
                <StatusBadge label={o.status} variant={getOrderStatusVariant(o.status)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
