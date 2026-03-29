import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import AccountsPage from "./pages/AccountsPage";
import ContactsPage from "./pages/ContactsPage";
import ProjectsPage from "./pages/ProjectsPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import QuotesPage from "./pages/QuotesPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import SyncCenterPage from "./pages/SyncCenterPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
                <Route path="/quotes" element={<QuotesPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/sync" element={<SyncCenterPage />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
