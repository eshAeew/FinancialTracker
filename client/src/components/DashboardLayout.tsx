import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sun, Moon, LayoutDashboard, PieChart, ListChecks, CreditCard, Wallet, Plus, ArrowLeftRight, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check system preference for dark mode
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setIsDarkMode(e.matches);
    });
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Navigation items
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    { icon: <CreditCard size={20} />, label: "Transactions", path: "/transactions" },
    { icon: <PieChart size={20} />, label: "Analytics", path: "/analytics" },
    { icon: <ListChecks size={20} />, label: "Budget Goals", path: "/goals" },
    { icon: <ArrowLeftRight size={20} />, label: "Recurring", path: "/recurring" },
    { icon: <Wallet size={20} />, label: "Accounts", path: "/accounts" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card">
        <div className="p-4 flex items-center border-b h-16">
          <h1 className="text-xl font-bold text-primary">FinTrackr</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location === item.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left h-10",
                location === item.path ? "font-medium" : "font-normal"
              )}
              onClick={() => setLocation(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-full justify-start h-10 gap-3">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile header & sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0">
              <div className="p-4 flex items-center justify-between border-b h-16">
                <h1 className="text-xl font-bold text-primary">FinTrackr</h1>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <nav className="flex flex-col p-2 space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location === item.path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-left h-10",
                      location === item.path ? "font-medium" : "font-normal"
                    )}
                    onClick={() => {
                      setLocation(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  size="default" 
                  onClick={toggleTheme} 
                  className="w-full justify-start h-10 gap-3"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-primary ml-2">FinTrackr</h1>
        </div>
        <div>
          {/* Mobile Action Buttons */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Add Transaction Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 rounded-full shadow-lg z-20 w-14 h-14"
              size="icon"
              onClick={() => setLocation("/add-transaction")}
            >
              <Plus size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add New Transaction</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}