import { pipelineByStage, revenueByLine, monthlyTrend, forecastByRep, opportunities, accounts } from '@/data/demo-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Plus, Download, Save } from 'lucide-react';

const COLORS = ['hsl(220,70%,50%)', 'hsl(32,95%,52%)', 'hsl(142,71%,45%)', 'hsl(280,65%,60%)', 'hsl(199,89%,48%)', 'hsl(350,70%,50%)', 'hsl(170,60%,45%)'];
const fmt = (n: number) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K');

const savedReports = [
  { name: 'Open Opportunities - This Year', type: 'Table', lastRun: '2026-03-28' },
  { name: 'Quotes by Manufacturer Line', type: 'Chart', lastRun: '2026-03-27' },
  { name: 'Order Backlog by Status', type: 'Table', lastRun: '2026-03-25' },
  { name: 'Top Accounts by Activity', type: 'Table', lastRun: '2026-03-24' },
  { name: 'Won Opportunities by Rep', type: 'Chart', lastRun: '2026-03-22' },
  { name: 'Forecast by Quarter', type: 'Chart', lastRun: '2026-03-20' },
  { name: 'Historical Trend - 36 Months', type: 'Chart', lastRun: '2026-03-18' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Saved reports, dashboards, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-1.5" />Export All</Button>
          <Button><Plus className="h-4 w-4 mr-1.5" />New Report</Button>
        </div>
      </div>

      {/* Saved Reports */}
      <div className="data-table-wrapper">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Saved Reports</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Report Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Run</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {savedReports.map((r, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer">
                <td className="px-4 py-3 font-medium text-primary">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.lastRun}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">Run</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={revenueByLine} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name }) => name.split(' ')[0]} fontSize={10}>
                {revenueByLine.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="metric-card">
          <h3 className="text-sm font-semibold mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Line type="monotone" dataKey="pipeline" stroke="hsl(220,70%,50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="won" stroke="hsl(142,71%,45%)" strokeWidth={2} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
