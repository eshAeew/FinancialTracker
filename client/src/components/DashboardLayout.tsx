import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sun, Moon, LayoutDashboard, PieChart, ListChecks, CreditCard, Wallet, ArrowLeftRight, Settings, Menu, X, CheckSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLayoutPreferences } from "@/hooks/useLayoutPreferences";
import { useTranslation } from "react-i18next";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  // Initialize and use layout preferences to apply CSS classes
  useLayoutPreferences();

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

  // Navigation items with translations
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: t('navigation.dashboard'), path: "/" },
    { icon: <CreditCard size={20} />, label: t('navigation.transactions'), path: "/transactions" },
    { icon: <PieChart size={20} />, label: t('navigation.analytics'), path: "/analytics" },
    { icon: <ListChecks size={20} />, label: t('navigation.budgetGoals'), path: "/goals" },
    { icon: <ArrowLeftRight size={20} />, label: t('navigation.recurring'), path: "/recurring" },
    { icon: <Wallet size={20} />, label: t('navigation.accounts'), path: "/accounts" },
    { icon: <Settings size={20} />, label: t('navigation.settings'), path: "/settings" },
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
        <div className="p-4 border-t space-y-2">
          {/* TaskManager Button for Desktop */}
          <a 
            href="https://pro-taskmanager.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <button
              className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              type="button"
              aria-label="TaskManager"
            >
              <CheckSquare size={20} />
              <span className="font-medium">TaskManager</span>
              <ExternalLink size={16} className="ml-auto" />
            </button>
          </a>
          
          {/* Theme Toggle Button */}
          <button 
            className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={toggleTheme}
            type="button"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? t('settings.appearance.light') : t('settings.appearance.dark')}</span>
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
                {/* TaskManager Button for Mobile Menu */}
                <a 
                  href="https://pro-taskmanager.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <button
                    className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                    type="button"
                    aria-label="TaskManager"
                  >
                    <CheckSquare size={20} />
                    <span className="font-medium">TaskManager</span>
                    <ExternalLink size={16} className="ml-auto" />
                  </button>
                </a>
                
                {/* Theme Toggle Button */}
                <button 
                  className="w-full flex items-center justify-start h-10 gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={toggleTheme} 
                  type="button"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDarkMode ? t('settings.appearance.light') : t('settings.appearance.dark')}</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-primary ml-2">FinTrackr</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* TaskManager Button */}
          <a 
            href="https://pro-taskmanager.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative"
          >
            <button
              className="h-10 inline-flex items-center justify-center gap-2 rounded-md px-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              type="button"
              aria-label="TaskManager"
            >
              <CheckSquare size={18} />
              <span className="font-medium">TaskManager</span>
            </button>
          </a>
          
          {/* Theme Toggle Button */}
          <button 
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={toggleTheme}
            type="button"
            aria-label={isDarkMode ? t('settings.appearance.light') : t('settings.appearance.dark')}
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
    </div>
  );
}