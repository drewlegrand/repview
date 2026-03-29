import { useState, useCallback, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Building2, Users, FolderKanban, Target, FileText,
  Package, BarChart3, RefreshCw, Settings, ChevronLeft,
  ChevronRight, Search, Bell, Command, CheckSquare, Sun, Moon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AICommandBar } from '@/components/AICommandBar';
import { FloatingAIChat } from '@/components/FloatingAIChat';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Opportunities', icon: Target, path: '/opportunities' },
  
  { label: 'Orders', icon: Package, path: '/orders' },
  { label: 'Projects', icon: FolderKanban, path: '/projects' },
  { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { label: 'Accounts', icon: Building2, path: '/accounts' },
  { label: 'Contacts', icon: Users, path: '/contacts' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Admin', icon: Settings, path: '/admin' },
  { label: 'Sync Center', icon: RefreshCw, path: '/sync' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('repview-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('repview-theme', darkMode ? 'dark' : 'light');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [darkMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(true);
    }
  }, []);

  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-sidebar-accent-foreground truncate">Repview</p>
              <p className="text-[10px] text-sidebar-foreground truncate">Conner-Legrand, Inc.</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'nav-item',
                  active ? 'nav-item-active' : 'nav-item-inactive',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item nav-item-inactive w-full justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 w-full rounded-lg border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search or ask AI...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">3</span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              MT
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <AICommandBar open={commandOpen} onOpenChange={setCommandOpen} />
      <FloatingAIChat />
    </div>
  );
}
