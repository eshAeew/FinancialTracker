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
      <Route component={NotFound} />
    </Switch>
  );
  
  if (useDashboardLayout) {
    return <DashboardLayout>{routes}</DashboardLayout>;
  }
  
  return routes;
}

function App() {
  // Check for dark mode preference
  useEffect(() => {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    // Listen for changes in color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);
  
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