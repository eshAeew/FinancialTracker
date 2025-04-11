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

  // Initialize theme on component mount
  useEffect(() => {
    // First check user's saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Function to toggle between light and dark mode
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    
    // Update the state
    setIsDarkMode(newDarkMode);
    
    // Update the class on the document element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save the preference
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    console.log('Theme toggled:', newDarkMode ? 'dark' : 'light');
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
          <button 
            className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={toggleTheme}
            type="button"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
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
                <button 
                  className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={toggleTheme} 
                  type="button"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-primary ml-2">FinTrackr</h1>
        </div>
        <div>
          {/* Mobile Action Buttons */}
          <button 
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={toggleTheme}
            type="button"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Theme Debug Element - will be removed after fixing */}
      <div className={isDarkMode ? "theme-debug-dark" : "theme-debug-light"}>
        Theme: {isDarkMode ? "Dark" : "Light"}
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