import { createContext, useContext, useState, useCallback, type ReactNode, type Context } from 'react';
import { opportunities as demoOpps, tasks as demoTasks, orders as demoOrders, type Opportunity, type Task, type OppStage, type Order, type OrderStage } from '@/data/demo-data';
import { toast } from 'sonner';

interface AppState {
  opportunities: Opportunity[];
  tasks: Task[];
  orders: Order[];
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  moveOpportunityStage: (id: string, newStage: OppStage) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  moveOrderStage: (id: string, newStage: OrderStage) => void;
}

type AppStoreGlobal = typeof globalThis & { __APP_STORE_CONTEXT__?: Context<AppState | null> };
const storeGlobal = globalThis as AppStoreGlobal;
const AppStoreContext = storeGlobal.__APP_STORE_CONTEXT__ ?? createContext<AppState | null>(null);
storeGlobal.__APP_STORE_CONTEXT__ = AppStoreContext;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([...demoOpps]);
  const [tasks, setTasks] = useState<Task[]>([...demoTasks]);
  const [orders, setOrders] = useState<Order[]>([...demoOrders]);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [...prev, order]);
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const moveOrderStage = useCallback((id: string, newStage: OrderStage) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, orderStage: newStage } : o)));
  }, []);

  const updateOpportunity = useCallback((id: string, updates: Partial<Opportunity>) => {
    setOpportunities((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
      const opp = updated.find((o) => o.id === id);
      if (opp && opp.stage === 'Awarded' && opp.forecastStatus === 'Closed Won') {
        // Check if order already exists for this opportunity
        setOrders((prevOrders) => {
          const existing = prevOrders.find((ord) => ord.opportunityId === id);
          if (!existing) {
            const orderNum = `ORD-2026-${String(prevOrders.length + 20).padStart(4, '0')}`;
            const newOrder: Order = {
              id: `ord-${Date.now()}`,
              orderNumber: orderNum,
              mfgOrderNumber: 'TBD',
              accountName: opp.accountName,
              manufacturerLine: opp.manufacturerLine,
              status: 'Entered',
              total: opp.value,
              orderDate: new Date().toISOString().slice(0, 10),
              expectedShip: '',
              project: opp.projectName || '',
              orderStage: 'Pending',
              opportunityId: id,
            };
            toast.success(`Order ${orderNum} auto-created from "${opp.name}"`);
            return [...prevOrders, newOrder];
          }
          return prevOrders;
        });
      }
      return updated;
    });
  }, []);

  const moveOpportunityStage = useCallback((id: string, newStage: OppStage) => {
    updateOpportunity(id, { stage: newStage });
  }, [updateOpportunity]);

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
    <AppStoreContext.Provider value={{ opportunities, tasks, orders, updateOpportunity, moveOpportunityStage, addTask, updateTask, deleteTask, addOrder, updateOrder, moveOrderStage }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
