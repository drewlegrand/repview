import { useState } from 'react';
import { useAppStore } from '@/stores/app-store.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, LayoutGrid, List, Calendar as CalendarIcon, Trash2, Search } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Task } from '@/data/demo-data';
import type { BadgeVariant } from '@/components/StatusBadge';
import { toast } from 'sonner';

type View = 'board' | 'list' | 'calendar';
const taskStatuses = ['Open', 'In Progress', 'Complete'] as const;
const priorities = ['High', 'Medium', 'Low'] as const;

function getPriorityVariant(p: string): BadgeVariant {
  return p === 'High' ? 'destructive' : p === 'Medium' ? 'warning' : 'muted';
}
function getStatusVariant(s: string): BadgeVariant {
  return s === 'Complete' ? 'success' : s === 'In Progress' ? 'info' : 'default';
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useAppStore();
  const [view, setView] = useState<View>('board');
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'Medium' as Task['priority'], linkedTo: '', owner: '' });

  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    updateTask(result.draggableId, { status: result.destination.droppableId as Task['status'] });
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    addTask({
      id: `t-${Date.now()}`,
      title: form.title,
      dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
      priority: form.priority,
      status: 'Open',
      linkedTo: form.linkedTo,
      owner: form.owner || 'Mike Torres',
    });
    toast.success('Task created');
    setForm({ title: '', dueDate: '', priority: 'Medium', linkedTo: '', owner: '' });
    setNewOpen(false);
  };

  const handleEditSave = () => {
    if (!editTask) return;
    updateTask(editTask.id, editTask);
    toast.success('Task updated');
    setEditTask(null);
  };

  // Calendar helpers
  const today = new Date();
  const calYear = today.getFullYear();
  const calMonth = today.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.filter((t) => t.status !== 'Complete').length} open · {tasks.filter((t) => t.status === 'Complete').length} completed</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {([['board', LayoutGrid], ['list', List], ['calendar', CalendarIcon]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm ${view === v ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-1" />New Task</Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
      </div>

      {/* Board View */}
      {view === 'board' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {taskStatuses.map((status) => {
              const statusTasks = filtered.filter((t) => t.status === status);
              return (
                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <StatusBadge label={status} variant={getStatusVariant(status)} />
                        <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
                      </div>
                      <div className={`space-y-2 min-h-[100px] rounded-lg p-1.5 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'}`}>
                        {statusTasks.map((t, i) => (
                          <Draggable key={t.id} draggableId={t.id} index={i}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                onClick={() => setEditTask({ ...t })}
                                className={`bg-card border rounded-lg p-3 cursor-pointer transition-all ${snap.isDragging ? 'shadow-lg ring-2 ring-primary/30' : 'hover:shadow-md hover:border-primary/30'}`}
                              >
                                <p className="text-sm font-medium">{t.title}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <StatusBadge label={t.priority} variant={getPriorityVariant(t.priority)} />
                                  <span className="text-xs text-muted-foreground">{t.dueDate}</span>
                                </div>
                                {t.linkedTo && <p className="text-[11px] text-muted-foreground mt-1.5 truncate">🔗 {t.linkedTo}</p>}
                                <p className="text-[11px] text-muted-foreground mt-0.5">{t.owner}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Task</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Linked To</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setEditTask({ ...t })}>
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3"><StatusBadge label={t.status} variant={getStatusVariant(t.status)} /></td>
                  <td className="px-4 py-3"><StatusBadge label={t.priority} variant={getPriorityVariant(t.priority)} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{t.dueDate}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{t.linkedTo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.owner}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteTask(t.id); toast.success('Task deleted'); }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No tasks found</div>}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{monthName}</h2>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-muted/50 px-2 py-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="bg-card min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTasks = filtered.filter((t) => t.dueDate === dateStr);
              const isToday = day === today.getDate();
              return (
                <div key={day} className={`bg-card min-h-[80px] p-1.5 ${isToday ? 'ring-2 ring-primary/30 ring-inset' : ''}`}>
                  <span className={`text-xs font-medium ${isToday ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center' : 'text-muted-foreground'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setEditTask({ ...t })}
                        className="text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs text-muted-foreground">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Linked To</Label><Input value={form.linkedTo} onChange={(e) => setForm({ ...form, linkedTo: e.target.value })} placeholder="Opportunity name…" /></div>
            <div><Label className="text-xs text-muted-foreground">Owner</Label><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Mike Torres" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim()}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {editTask && (
            <div className="grid gap-3">
              <div><Label className="text-xs text-muted-foreground">Title</Label><Input value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Due Date</Label><Input type="date" value={editTask.dueDate} onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })} /></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select value={editTask.priority} onValueChange={(v) => setEditTask({ ...editTask, priority: v as Task['priority'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={editTask.status} onValueChange={(v) => setEditTask({ ...editTask, status: v as Task['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{taskStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">Linked To</Label><Input value={editTask.linkedTo} onChange={(e) => setEditTask({ ...editTask, linkedTo: e.target.value })} /></div>
              <div><Label className="text-xs text-muted-foreground">Owner</Label><Input value={editTask.owner} onChange={(e) => setEditTask({ ...editTask, owner: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => { deleteTask(editTask!.id); setEditTask(null); toast.success('Task deleted'); }}>Delete</Button>
            <Button variant="outline" onClick={() => setEditTask(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
