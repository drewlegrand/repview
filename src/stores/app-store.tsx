import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([...demoOpps]);
  const [tasks, setTasks] = useState<Task[]>([...demoTasks]);

  const updateOpportunity = useCallback((id: string, updates: Partial<Opportunity>) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const moveOpportunityStage = useCallback((id: string, newStage: OppStage) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage: newStage } : o)));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppStoreContext.Provider value={{ opportunities, tasks, updateOpportunity, moveOpportunityStage, addTask, updateTask, deleteTask }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
