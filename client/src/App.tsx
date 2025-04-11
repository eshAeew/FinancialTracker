import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Analytics from "@/pages/Analytics";
import BudgetGoals from "@/pages/BudgetGoals";
import Recurring from "@/pages/Recurring";
import Accounts from "@/pages/Accounts";
import Settings from "@/pages/Settings";
import { FinanceProvider } from "./context/FinanceContext";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect } from "react";

// Routes that should use the dashboard layout
const DASHBOARD_ROUTES = [
  "/", 
  "/dashboard", 
  "/transactions", 
  "/analytics", 
  "/goals", 
  "/recurring", 
  "/accounts", 
  "/settings"
];

// Component to handle redirect from old home to dashboard
function HomeRedirect() {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/dashboard");
  }, [setLocation]);
  
  return null;
}

function Router() {
  const [location] = useLocation();
  const useDashboardLayout = DASHBOARD_ROUTES.includes(location);
  
  const routes = (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/goals" component={BudgetGoals} />
      <Route path="/recurring" component={Recurring} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
  
  if (useDashboardLayout) {
    return <DashboardLayout>{routes}</DashboardLayout>;
  }
  
  return routes;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProvider>
        <Router />
        <Toaster />
      </FinanceProvider>
    </QueryClientProvider>
  );
}

export default App;