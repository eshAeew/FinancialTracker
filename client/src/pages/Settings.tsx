import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/context/FinanceContext";
import { useAppearance } from "@/components/AppearanceProvider";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette,
  Download,
  CloudUpload,
  Trash2,
  Check,
  User,
  Languages,
  Globe,
  Currency,
  CreditCard,
  Calculator,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  Info,
  LifeBuoy,
  Database,
  RefreshCw,
  Zap,
  PieChart,
  LineChart,
  BarChart2,
  BarChart,
  Mail,
  ExternalLink
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCurrency } from "@/lib/utils";

export default function Settings() {
  const { toast } = useToast();
  const finance = useFinance();
  const { appearanceSettings, setAppearanceSettings } = useAppearance();
  
  // Initialize theme state based on localStorage or system preference
  const storedTheme = localStorage.getItem("theme");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    storedTheme 
      ? storedTheme === "dark" 
      : window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  
  // Currency and locale settings
  const [currencySettings, setCurrencySettings] = useLocalStorage("currencySettings", {
    defaultCurrency: "USD",
    currencyPosition: "before",
    locale: "en-US",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    firstDayOfWeek: "sunday"
  });
  
  // Calculation settings
  const [calculationSettings, setCalculationSettings] = useLocalStorage("calculationSettings", {
    roundToNearest: "cent",
    taxRate: 7.5,
    budgetWarningThreshold: 80,
    budgetDangerThreshold: 95,
    roundUpTransactions: false,
    includePendingInTotals: true,
    investmentReturnRate: 7
  });
  
  // Report and chart settings
  const [reportSettings, setReportSettings] = useLocalStorage("reportSettings", {
    defaultChart: "bar",
    includeSubCategories: true,
    compareToLastPeriod: true,
    showAverageSpending: true,
    excludeTransfers: true,
    defaultTimeRange: "month",
    groupSmallerCategories: false,
    showTrendLines: true,
    chartColorScheme: "default",
    printHeaderFooter: true
  });
  
  // Handle theme toggle
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
    
    toast({
      title: `${!isDarkMode ? "Dark" : "Light"} theme applied`,
      description: `The application theme has been changed to ${!isDarkMode ? "dark" : "light"} mode.`,
    });
  };
  
  // Export data
  const exportData = () => {
    const data = {
      transactions: finance.transactions,
      categories: finance.categories,
      budgetGoals: finance.budgetGoals,
      recurringTransactions: finance.recurringTransactions
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `fintrackr-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data exported successfully",
      description: "Your financial data has been exported to a JSON file.",
    });
  };
  
  // Import data function
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          
          // Here you would implement the actual import logic
          console.log("Data to import:", jsonData);
          
          toast({
            title: "Data imported successfully",
            description: "Your financial data has been imported.",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "There was an error importing your data. Please check the file format.",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Reset all data
  const resetData = () => {
    // Here you would implement the actual reset logic
    console.log("Resetting all data");
    
    toast({
      title: "Data reset completed",
      description: "All your financial data has been reset. Starting fresh!",
      variant: "destructive"
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and data.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <div className="bg-card border rounded-lg p-1 overflow-x-auto">
          <TabsList className="w-full inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger 
              value="appearance" 
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="currencies"
              className="flex items-center gap-1 px-3 text-sm font-medium whitespace-nowrap"
            >
              <Currency className="h-4 w-4" />
              <span>Currency & Locale</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calculations"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <BarChart className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data"
              className="flex items-center gap-1 px-3 text-sm font-medium whitespace-nowrap"
            >
              <Database className="h-4 w-4" />
              <span>Data Management</span>
            </TabsTrigger>
            <TabsTrigger 
              value="help"
              className="flex items-center gap-1 px-3 text-sm font-medium whitespace-nowrap"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </TabsTrigger>
            <TabsTrigger 
              value="about"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the application's appearance to your preference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch 
                  id="theme-mode" 
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adjust the text size across the application
                  </p>
                  <RadioGroup 
                    defaultValue={appearanceSettings.fontSize}
                    onValueChange={(value) => {
                      setAppearanceSettings({ ...appearanceSettings, fontSize: value });
                      toast({
                        title: "Font size updated",
                        description: `Font size has been set to ${value}.`
                      });
                    }}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="font-small" />
                      <Label htmlFor="font-small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="font-medium" />
                      <Label htmlFor="font-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="font-large" />
                      <Label htmlFor="font-large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adjust the roundness of UI elements
                  </p>
                  <Slider
                    id="border-radius"
                    min={0}
                    max={2}
                    step={1}
                    value={appearanceSettings.borderRadius === "none" ? [0] : 
                          appearanceSettings.borderRadius === "medium" ? [1] : [2]}
                    onValueChange={(value) => {
                      const mapping = ["none", "medium", "large"];
                      const newValue = mapping[value[0]];
                      setAppearanceSettings({ ...appearanceSettings, borderRadius: newValue });
                      
                      toast({
                        title: "Border radius updated",
                        description: `Corners have been set to ${newValue}.`
                      });
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Square</span>
                    <span>Medium</span>
                    <span>Rounded</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Layout Preferences</CardTitle>
              <CardDescription>
                Customize how the application interface is arranged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable interface animations
                  </p>
                </div>
                <Switch 
                  id="enable-animations" 
                  checked={appearanceSettings.animations}
                  onCheckedChange={(checked) => {
                    setAppearanceSettings({ ...appearanceSettings, animations: checked });
                    toast({
                      title: checked ? "Animations enabled" : "Animations disabled",
                      description: `Interface animations have been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing to fit more content on screen
                  </p>
                </div>
                <Switch 
                  id="compact-mode" 
                  checked={appearanceSettings.compactMode}
                  onCheckedChange={(checked) => {
                    setAppearanceSettings({ ...appearanceSettings, compactMode: checked });
                    toast({
                      title: checked ? "Compact mode enabled" : "Compact mode disabled",
                      description: `Interface density has been set to ${checked ? "compact" : "comfortable"}.`
                    });
                  }}
                />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose how widgets are arranged on your dashboard
                </p>
                <Select 
                  value={appearanceSettings.dashboardLayout}
                  onValueChange={(value) => {
                    setAppearanceSettings({ ...appearanceSettings, dashboardLayout: value });
                    toast({
                      title: "Dashboard layout updated",
                      description: `Layout has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiles">Tiles</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="focus">Focus Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Currency & Locale Settings - Enhanced with formatCurrency examples */}
        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Configure how monetary values are displayed throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="default-currency">Default Currency</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select which currency should be used for all transactions
                </p>
                <Select 
                  value={currencySettings.defaultCurrency}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, defaultCurrency: value });
                    toast({
                      title: "Default currency updated",
                      description: `Currency has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                    <SelectItem value="JPY">¥ JPY (Japanese Yen)</SelectItem>
                    <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                    <SelectItem value="CAD">$ CAD (Canadian Dollar)</SelectItem>
                    <SelectItem value="AUD">$ AUD (Australian Dollar)</SelectItem>
                    <SelectItem value="CNY">¥ CNY (Chinese Yuan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency preview section */}
              <div className="bg-muted p-4 rounded-md mt-4">
                <Label>Currency Preview</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-card rounded-md">
                    <p className="text-sm font-medium">Positive Amount:</p>
                    <p className="text-lg text-green-600">{formatCurrency(1234.56, currencySettings.defaultCurrency, currencySettings.locale)}</p>
                  </div>
                  <div className="p-2 bg-card rounded-md">
                    <p className="text-sm font-medium">Negative Amount:</p>
                    <p className="text-lg text-red-600">{formatCurrency(-789.01, currencySettings.defaultCurrency, currencySettings.locale)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure date, time, and number formatting based on your region.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="locale">Locale</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select your region for localized formatting
                </p>
                <Select 
                  value={currencySettings.locale}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, locale: value });
                    toast({
                      title: "Locale updated",
                      description: `Region has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (United States)</SelectItem>
                    <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                    <SelectItem value="fr-FR">French (France)</SelectItem>
                    <SelectItem value="de-DE">German (Germany)</SelectItem>
                    <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                    <SelectItem value="it-IT">Italian (Italy)</SelectItem>
                    <SelectItem value="ja-JP">Japanese (Japan)</SelectItem>
                    <SelectItem value="zh-CN">Chinese (China)</SelectItem>
                    <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="date-format">Date Format</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose how dates are displayed throughout the application
                </p>
                <RadioGroup 
                  value={currencySettings.dateFormat}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, dateFormat: value });
                    toast({
                      title: "Date format updated",
                      description: `Dates will now be displayed in ${value} format.`
                    });
                  }}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MM/DD/YYYY" id="date-mdy" />
                    <Label htmlFor="date-mdy">MM/DD/YYYY (e.g., 04/18/2025)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DD/MM/YYYY" id="date-dmy" />
                    <Label htmlFor="date-dmy">DD/MM/YYYY (e.g., 18/04/2025)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YYYY-MM-DD" id="date-ymd" />
                    <Label htmlFor="date-ymd">YYYY-MM-DD (e.g., 2025-04-18)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="time-format">Time Format</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose between 12-hour or 24-hour time format
                </p>
                <RadioGroup 
                  value={currencySettings.timeFormat}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, timeFormat: value });
                    toast({
                      title: "Time format updated",
                      description: `Time will now be displayed in ${value === "12h" ? "12-hour" : "24-hour"} format.`
                    });
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12h" id="time-12h" />
                    <Label htmlFor="time-12h">12-hour (2:30 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="time-24h" />
                    <Label htmlFor="time-24h">24-hour (14:30)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="first-day">First Day of Week</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select which day should be considered the start of the week
                </p>
                <RadioGroup 
                  value={currencySettings.firstDayOfWeek}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, firstDayOfWeek: value });
                    toast({
                      title: "First day of week updated",
                      description: `Week will now start on ${value}.`
                    });
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sunday" id="day-sun" />
                    <Label htmlFor="day-sun">Sunday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monday" id="day-mon" />
                    <Label htmlFor="day-mon">Monday</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Locale preview section */}
              <div className="bg-muted p-4 rounded-md mt-4">
                <Label>Locale Preview</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <div className="p-2 bg-card rounded-md">
                    <p className="text-sm font-medium">Date & Time:</p>
                    <p className="text-lg">
                      {new Date().toLocaleDateString(currencySettings.locale)} 
                      {' '}
                      {new Date().toLocaleTimeString(currencySettings.locale, 
                        { hour12: currencySettings.timeFormat === '12h' })}
                    </p>
                  </div>
                  <div className="p-2 bg-card rounded-md">
                    <p className="text-sm font-medium">Large Number:</p>
                    <p className="text-lg">
                      {new Intl.NumberFormat(currencySettings.locale).format(1234567.89)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Calculations Settings */}
        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Preferences</CardTitle>
              <CardDescription>
                Configure how financial calculations are performed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="rounding">Transaction Rounding</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select how transaction amounts should be rounded
                </p>
                <Select 
                  value={calculationSettings.roundToNearest}
                  onValueChange={(value) => {
                    setCalculationSettings({ ...calculationSettings, roundToNearest: value });
                    toast({
                      title: "Rounding method updated",
                      description: `Amounts will be rounded to the nearest ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rounding method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cent">Cent (0.01)</SelectItem>
                    <SelectItem value="five-cents">5 Cents (0.05)</SelectItem>
                    <SelectItem value="ten-cents">10 Cents (0.10)</SelectItem>
                    <SelectItem value="quarter">Quarter (0.25)</SelectItem>
                    <SelectItem value="half-dollar">Half Dollar (0.50)</SelectItem>
                    <SelectItem value="dollar">Dollar (1.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="round-up">Round Up Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically round up transactions and save the difference
                  </p>
                </div>
                <Switch 
                  id="round-up" 
                  checked={calculationSettings.roundUpTransactions}
                  onCheckedChange={(checked) => {
                    setCalculationSettings({ ...calculationSettings, roundUpTransactions: checked });
                    toast({
                      title: checked ? "Round up enabled" : "Round up disabled",
                      description: `Transaction round up has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="include-pending">Include Pending in Totals</Label>
                  <p className="text-sm text-muted-foreground">
                    Count pending transactions in balance calculations
                  </p>
                </div>
                <Switch 
                  id="include-pending" 
                  checked={calculationSettings.includePendingInTotals}
                  onCheckedChange={(checked) => {
                    setCalculationSettings({ ...calculationSettings, includePendingInTotals: checked });
                    toast({
                      title: checked ? "Pending transactions included" : "Pending transactions excluded",
                      description: `Pending transactions will ${checked ? "now be included in" : "be excluded from"} totals.`
                    });
                  }}
                />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Set the default tax rate for tax calculations
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="tax-rate"
                    min={0}
                    max={30}
                    step={0.5}
                    value={[calculationSettings.taxRate]}
                    onValueChange={(value) => {
                      setCalculationSettings({ ...calculationSettings, taxRate: value[0] });
                    }}
                    className="flex-grow"
                  />
                  <span className="w-16 text-right">{calculationSettings.taxRate}%</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="investment-rate">Investment Return Rate (%)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Set the expected annual return rate for investment projections
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="investment-rate"
                    min={0}
                    max={15}
                    step={0.5}
                    value={[calculationSettings.investmentReturnRate]}
                    onValueChange={(value) => {
                      setCalculationSettings({ ...calculationSettings, investmentReturnRate: value[0] });
                    }}
                    className="flex-grow"
                  />
                  <span className="w-16 text-right">{calculationSettings.investmentReturnRate}%</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="budget-warning">Budget Warning Threshold (%)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Receive a warning when budget categories exceed this percentage
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="budget-warning"
                    min={50}
                    max={100}
                    step={5}
                    value={[calculationSettings.budgetWarningThreshold]}
                    onValueChange={(value) => {
                      setCalculationSettings({ ...calculationSettings, budgetWarningThreshold: value[0] });
                    }}
                    className="flex-grow"
                  />
                  <span className="w-16 text-right">{calculationSettings.budgetWarningThreshold}%</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="budget-danger">Budget Danger Threshold (%)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Receive an alert when budget categories exceed this percentage
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="budget-danger"
                    min={80}
                    max={100}
                    step={1}
                    value={[calculationSettings.budgetDangerThreshold]}
                    onValueChange={(value) => {
                      setCalculationSettings({ ...calculationSettings, budgetDangerThreshold: value[0] });
                    }}
                    className="flex-grow"
                  />
                  <span className="w-16 text-right">{calculationSettings.budgetDangerThreshold}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Report Settings */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Preferences</CardTitle>
              <CardDescription>
                Configure how charts and reports are generated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="default-chart">Default Chart Type</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose the default visualization for your financial data
                </p>
                <Select 
                  value={reportSettings.defaultChart}
                  onValueChange={(value) => {
                    setReportSettings({ ...reportSettings, defaultChart: value });
                    toast({
                      title: "Default chart updated",
                      description: `Default chart type has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="default-range">Default Time Range</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Set the default time period for reports and visualizations
                </p>
                <Select 
                  value={reportSettings.defaultTimeRange}
                  onValueChange={(value) => {
                    setReportSettings({ ...reportSettings, defaultTimeRange: value });
                    toast({
                      title: "Default time range updated",
                      description: `Default period has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="compare-periods">Compare to Previous Period</Label>
                  <p className="text-sm text-muted-foreground">
                    Show comparison with previous time periods in reports
                  </p>
                </div>
                <Switch 
                  id="compare-periods" 
                  checked={reportSettings.compareToLastPeriod}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, compareToLastPeriod: checked });
                    toast({
                      title: checked ? "Period comparison enabled" : "Period comparison disabled",
                      description: `Period comparison has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="show-average">Show Average Spending</Label>
                  <p className="text-sm text-muted-foreground">
                    Display average spending amounts in reports
                  </p>
                </div>
                <Switch 
                  id="show-average" 
                  checked={reportSettings.showAverageSpending}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, showAverageSpending: checked });
                    toast({
                      title: checked ? "Average spending enabled" : "Average spending disabled",
                      description: `Average spending has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="exclude-transfers">Exclude Transfers</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove transfer transactions from reports
                  </p>
                </div>
                <Switch 
                  id="exclude-transfers" 
                  checked={reportSettings.excludeTransfers}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, excludeTransfers: checked });
                    toast({
                      title: checked ? "Transfers excluded" : "Transfers included",
                      description: `Transfers will ${checked ? "be excluded from" : "now appear in"} reports.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="include-subcategories">Include Subcategories</Label>
                  <p className="text-sm text-muted-foreground">
                    Break down categories into their subcategories in reports
                  </p>
                </div>
                <Switch 
                  id="include-subcategories" 
                  checked={reportSettings.includeSubCategories}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, includeSubCategories: checked });
                    toast({
                      title: checked ? "Subcategories included" : "Subcategories excluded",
                      description: `Subcategories will ${checked ? "now be included in" : "be excluded from"} reports.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="group-small">Group Smaller Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Combine small categories into "Other" in pie charts
                  </p>
                </div>
                <Switch 
                  id="group-small" 
                  checked={reportSettings.groupSmallerCategories}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, groupSmallerCategories: checked });
                    toast({
                      title: checked ? "Small categories grouped" : "All categories shown",
                      description: `Small categories will ${checked ? "be grouped as 'Other'" : "be shown individually"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="trend-lines">Show Trend Lines</Label>
                  <p className="text-sm text-muted-foreground">
                    Display trend lines in line and bar charts
                  </p>
                </div>
                <Switch 
                  id="trend-lines" 
                  checked={reportSettings.showTrendLines}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, showTrendLines: checked });
                    toast({
                      title: checked ? "Trend lines enabled" : "Trend lines disabled",
                      description: `Trend lines have been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="chart-colors">Chart Color Scheme</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select a color palette for all charts and graphs
                </p>
                <Select 
                  value={reportSettings.chartColorScheme}
                  onValueChange={(value) => {
                    setReportSettings({ ...reportSettings, chartColorScheme: value });
                    toast({
                      title: "Chart colors updated",
                      description: `Color scheme has been set to ${value}.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="pastel">Pastel</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                    <SelectItem value="rainbow">Rainbow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="print-header">Include Header/Footer in Exports</Label>
                  <p className="text-sm text-muted-foreground">
                    Add headers and footers when printing or exporting reports
                  </p>
                </div>
                <Switch 
                  id="print-header" 
                  checked={reportSettings.printHeaderFooter}
                  onCheckedChange={(checked) => {
                    setReportSettings({ ...reportSettings, printHeaderFooter: checked });
                    toast({
                      title: checked ? "Headers and footers included" : "Headers and footers excluded",
                      description: `Headers and footers will ${checked ? "be included" : "be excluded"} in exports.`
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, or reset your financial data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your financial data as a JSON file
                </p>
                <Button 
                  onClick={exportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload and restore your financial data from a backup file
                </p>
                <Button 
                  onClick={importData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CloudUpload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Reset Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Delete all your financial data and start fresh (cannot be undone)
                </p>
                <Button 
                  onClick={resetData}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Help & Support */}
        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Find answers to common questions and get help.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                <div className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">How do I add a recurring transaction?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Navigate to the Recurring tab from the main menu, then click the "Add Recurring" button. Fill in the transaction details and select the frequency.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Can I categorize my transactions?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Yes! When adding or editing a transaction, you can select a category from the dropdown menu or create a new one.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">How do budget goals work?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Budget goals allow you to set spending limits for different categories. Go to the Budget Goals tab, set a target amount and period, and the app will track your progress.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Contact Support</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  If you need further assistance, please don't hesitate to reach out.
                </p>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="flex items-center justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@fintrackr.com</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    <span>Visit Help Center</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Fintrackr</CardTitle>
              <CardDescription>
                Information about this application and its current version.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Application Information</h3>
                <div className="grid grid-cols-2 gap-y-2 mt-2">
                  <p className="text-sm font-medium">Version:</p>
                  <p className="text-sm">1.0.0</p>
                  
                  <p className="text-sm font-medium">Released:</p>
                  <p className="text-sm">April 18, 2025</p>
                  
                  <p className="text-sm font-medium">Framework:</p>
                  <p className="text-sm">React + Express</p>
                  
                  <p className="text-sm font-medium">License:</p>
                  <p className="text-sm">MIT</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Credits</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This application uses the following open-source libraries:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>React (Frontend Framework)</li>
                  <li>Express (Backend Server)</li>
                  <li>Shadcn UI (Component Library)</li>
                  <li>Tailwind CSS (Styling)</li>
                  <li>Recharts (Data Visualization)</li>
                  <li>Lucide Icons (Icon Set)</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <small className="text-xs text-muted-foreground">
                © 2025 Fintrackr. All rights reserved.
              </small>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}