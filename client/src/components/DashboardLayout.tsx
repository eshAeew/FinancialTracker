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
            className="block relative group mb-2"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600 group-hover:from-violet-500 group-hover:via-blue-500 group-hover:to-purple-500 opacity-80 blur group-hover:blur-md transition-all duration-500 group-hover:animate-gradient-slow"></div>
            <div className="absolute inset-0.5 bg-card rounded-md group-hover:bg-opacity-0 transition-all duration-500"></div>
            <button
              className="w-full flex items-center justify-start h-12 gap-3 px-4 py-2 rounded-md text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative z-10 shadow-lg transition-all duration-300 overflow-hidden group-hover:shadow-indigo-700/40 border border-indigo-700/20"
              type="button"
              aria-label="TaskManager"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-slow bg-[length:200%_100%]"></span>
              <CheckSquare size={20} className="relative z-10 text-white group-hover:animate-float" />
              <span className="font-bold relative z-10 bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-100 group-hover:animate-pulse-glow">TaskManager</span>
              <div className="relative z-10 ml-auto">
                <ExternalLink size={16} className="group-hover:animate-float" />
              </div>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse-glow"></span>
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
                  className="block relative group my-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 blur-sm group-hover:blur-md group-hover:animate-gradient-fast transition-all duration-300"></div>
                  <button
                    className="w-full flex items-center justify-start h-11 gap-3 px-4 py-2 rounded-md text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 relative overflow-hidden border border-indigo-500/30 shadow-md"
                    type="button"
                    aria-label="TaskManager"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1IiBoZWlnaHQ9IjEwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIj48L3JlY3Q+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIj48L3JlY3Q+PC9zdmc+')]"></div>
                    <CheckSquare size={20} className="relative z-10 group-hover:text-white group-hover:animate-pulse-glow" />
                    <span className="font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-50">TaskManager</span>
                    <div className="ml-auto relative z-10 flex items-center">
                      <span className="mr-1 h-2 w-2 rounded-full bg-green-400 animate-pulse-glow"></span>
                      <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
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
            className="relative group"
          >
            <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 animate-gradient-slow"></span>
            <button
              className="relative h-10 inline-flex items-center justify-center gap-2 rounded-md px-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-indigo-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-700/40 border border-indigo-700/20 z-10 overflow-hidden"
              type="button"
              aria-label="TaskManager"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                <CheckSquare size={18} className="mr-1 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold">TaskManager</span>
                <ExternalLink size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <span className="absolute top-0 right-0 size-2 rounded-full bg-green-400 animate-pulse"></span>
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