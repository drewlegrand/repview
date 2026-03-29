import { create } from 'zustand';
import { opportunities as demoOpps, tasks as demoTasks, type Opportunity, type Task, type OppStage } from '@/data/demo-data';

interface AppState {
  opportunities: Opportunity[];
  tasks: Task[];
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  moveOpportunityStage: (id: string, newStage: OppStage) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  opportunities: [...demoOpps],
  tasks: [...demoTasks],
  updateOpportunity: (id, updates) =>
    set((s) => ({
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  moveOpportunityStage: (id, newStage) =>
    set((s) => ({
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, stage: newStage } : o)),
    })),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}));
