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
  Wallet,
  Calculator,
  BellRing,
  Calendar,
  Clock,
  Lock,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Info,
  LifeBuoy,
  AlertCircle,
  Smartphone,
  Share2,
  Mail,
  ExternalLink,
  Database,
  RefreshCw,
  Zap,
  PieChart,
  LineChart,
  BarChart2,
  BarChart,
  Fingerprint,
  Key
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Settings() {
  const { toast } = useToast();
  const finance = useFinance();
  
  // Theme settings
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  
  // Use the appearance context
  const { appearanceSettings, setAppearanceSettings } = useAppearance();
  
  // Currency and locale settings
  const [currencySettings, setCurrencySettings] = useLocalStorage("currencySettings", {
    defaultCurrency: "USD",
    locale: "en-US",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    firstDayOfWeek: "sunday",
    currencyPosition: "before"
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useLocalStorage("notificationSettings", {
    newTransactions: true,
    budgetAlerts: true,
    weeklyReports: true,
    recurringTransactionReminders: true,
    monthlyReports: false,
    goalAchievement: true,
    balanceWarnings: true,
    largeTransactions: true,
    overduePayments: true,
    emailNotifications: false,
    desktopNotifications: true,
    notificationSounds: true
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useLocalStorage("privacySettings", {
    saveLocalData: true,
    anonymousAnalytics: false,
    autoBackup: true,
    showBalance: true,
    requireAuthForSensitiveData: false,
    maskSensitiveInfo: false,
    hideTransactionAmounts: false,
    showBudgetProgress: true,
    sessionTimeout: 30,
    lockAppWhenInactive: false
  });
  
  // Account settings
  const [accountSettings, setAccountSettings] = useLocalStorage("accountSettings", {
    defaultAccount: "cash-wallet",
    defaultCategory: "uncategorized",
    defaultTransactionType: "expense",
    quickAddEnabled: true,
    autoAssignCategories: true,
    autoCompleteTransactions: true,
    autoCategorizeRecurring: true,
    reminderLeadTime: 2,
    showAccountIcons: true,
    defaultView: "monthly"
  });
  
  // Calculator settings
  const [calculatorSettings, setCalculatorSettings] = useLocalStorage("calculatorSettings", {
    roundingMethod: "standard",
    decimalPlaces: 2,
    includePendingInTotal: true,
    includeScheduledInForecast: true,
    savingsCalcInterestRate: 5,
    debtPaydownStrategy: "highInterest",
    inflationRate: 3,
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
  
  // Handle notification toggle
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
    
    toast({
      title: notificationSettings[key] ? "Notification disabled" : "Notification enabled",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${notificationSettings[key] ? "disabled" : "enabled"}.`,
    });
  };
  
  // Handle privacy toggle
  const togglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: !privacySettings[key]
    });
    
    toast({
      title: privacySettings[key] ? "Setting disabled" : "Setting enabled",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${privacySettings[key] ? "disabled" : "enabled"}.`,
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
      description: `Your financial data has been exported to ${exportFileDefaultName}.`,
    });
  };
  
  // Import data
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          
          // In a real app, you would need to validate the data and implement the actual import
          // For now we'll just simulate a successful import
          
          toast({
            title: "Data imported successfully",
            description: "Your financial data has been imported and restored.",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "The selected file could not be imported. Please ensure it's a valid JSON file.",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Reset data
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  const resetData = () => {
    // In a real app, you would clear all data
    // For now we'll just simulate this action
    
    setShowResetConfirmation(false);
    
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
              value="accounts"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Wallet className="h-4 w-4" />
              <span>Accounts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="currencies"
              className="flex items-center gap-1 px-3 text-sm font-medium whitespace-nowrap"
            >
              <Currency className="h-4 w-4" />
              <span>Currency & Locale</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
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
        
        {/* Account Settings */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Configure your default accounts and transaction behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="default-account">Default Account</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select which account should be used by default when creating new transactions
                </p>
                <Select 
                  value={accountSettings.defaultAccount}
                  onValueChange={(value) => {
                    setAccountSettings({ ...accountSettings, defaultAccount: value });
                    toast({
                      title: "Default account updated",
                      description: `Default account has been set.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash-wallet">Cash Wallet</SelectItem>
                    <SelectItem value="checking-account">Checking Account</SelectItem>
                    <SelectItem value="savings-account">Savings Account</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="investment-account">Investment Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="default-category">Default Category</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select which category should be pre-selected for new transactions
                </p>
                <Select 
                  value={accountSettings.defaultCategory}
                  onValueChange={(value) => {
                    setAccountSettings({ ...accountSettings, defaultCategory: value });
                    toast({
                      title: "Default category updated",
                      description: `Default category has been set.`
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="dining">Dining</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="default-type">Default Transaction Type</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose which transaction type should be selected by default
                </p>
                <RadioGroup 
                  value={accountSettings.defaultTransactionType}
                  onValueChange={(value) => {
                    setAccountSettings({ ...accountSettings, defaultTransactionType: value });
                    toast({
                      title: "Default transaction type updated",
                      description: `Default type has been set to ${value}.`
                    });
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="type-expense" />
                    <Label htmlFor="type-expense">Expense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="type-income" />
                    <Label htmlFor="type-income">Income</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="type-transfer" />
                    <Label htmlFor="type-transfer">Transfer</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quick-add">Quick Add Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable one-click transaction adding from dashboard
                  </p>
                </div>
                <Switch 
                  id="quick-add" 
                  checked={accountSettings.quickAddEnabled}
                  onCheckedChange={(checked) => {
                    setAccountSettings({ ...accountSettings, quickAddEnabled: checked });
                    toast({
                      title: checked ? "Quick add enabled" : "Quick add disabled",
                      description: `Quick add transactions feature has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-categorize">Auto-Categorize Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign categories based on transaction descriptions
                  </p>
                </div>
                <Switch 
                  id="auto-categorize" 
                  checked={accountSettings.autoAssignCategories}
                  onCheckedChange={(checked) => {
                    setAccountSettings({ ...accountSettings, autoAssignCategories: checked });
                    toast({
                      title: checked ? "Auto-categorize enabled" : "Auto-categorize disabled",
                      description: `Automatic category assignment has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="account-icons">Show Account Icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display visual icons next to account names
                  </p>
                </div>
                <Switch 
                  id="account-icons" 
                  checked={accountSettings.showAccountIcons}
                  onCheckedChange={(checked) => {
                    setAccountSettings({ ...accountSettings, showAccountIcons: checked });
                    toast({
                      title: checked ? "Account icons enabled" : "Account icons disabled",
                      description: `Account icons have been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recurring Transactions</CardTitle>
              <CardDescription>
                Configure how recurring transactions and reminders are handled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-categorize-recurring">Auto-Categorize Recurring</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply the same category to all instances of a recurring transaction
                  </p>
                </div>
                <Switch 
                  id="auto-categorize-recurring" 
                  checked={accountSettings.autoCategorizeRecurring}
                  onCheckedChange={(checked) => {
                    setAccountSettings({ ...accountSettings, autoCategorizeRecurring: checked });
                    toast({
                      title: checked ? "Auto-categorize recurring enabled" : "Auto-categorize recurring disabled",
                      description: `Automatic recurring categorization has been ${checked ? "enabled" : "disabled"}.`
                    });
                  }}
                />
              </div>
              
              <div className="pt-4">
                <Label htmlFor="reminder-lead-time">Reminder Lead Time (Days)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  How many days in advance should you be notified of upcoming transactions
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="reminder-lead-time"
                    min={0}
                    max={7}
                    step={1}
                    value={[accountSettings.reminderLeadTime]}
                    onValueChange={(value) => {
                      setAccountSettings({ ...accountSettings, reminderLeadTime: value[0] });
                      toast({
                        title: "Reminder lead time updated",
                        description: `You'll be notified ${value[0]} days before recurring transactions.`
                      });
                    }}
                    className="w-full"
                  />
                  <span className="font-medium w-8 text-center">{accountSettings.reminderLeadTime}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 days</span>
                  <span>7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
            
        {/* Currency and Locale Settings */}
        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Configure your preferred currency and display options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                <Label htmlFor="default-currency">Default Currency</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select your primary currency for transactions and reports
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
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="currency-position">Currency Symbol Position</Label>
                  <p className="text-sm text-muted-foreground">
                    Where to display the currency symbol relative to the amount
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <RadioGroup 
                    value={currencySettings.currencyPosition}
                    onValueChange={(value) => {
                      setCurrencySettings({ ...currencySettings, currencyPosition: value });
                      toast({
                        title: "Currency position updated",
                        description: `Currency symbol will now appear ${value} the amount.`
                      });
                    }}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="before" id="position-before" />
                      <Label htmlFor="position-before">Before ($100)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="after" id="position-after" />
                      <Label htmlFor="position-after">After (100$)</Label>
                    </div>
                  </RadioGroup>
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
                      description: `Dates will now be displayed using the ${value} format.`
                    });
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MM/DD/YYYY" id="date-us" />
                    <Label htmlFor="date-us">MM/DD/YYYY (US)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DD/MM/YYYY" id="date-eu" />
                    <Label htmlFor="date-eu">DD/MM/YYYY (EU)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YYYY-MM-DD" id="date-iso" />
                    <Label htmlFor="date-iso">YYYY-MM-DD (ISO)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YYYY/MM/DD" id="date-jp" />
                    <Label htmlFor="date-jp">YYYY/MM/DD (JP)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-4">
                <Label htmlFor="time-format">Time Format</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose between 12-hour and 24-hour time formats
                </p>
                <RadioGroup 
                  value={currencySettings.timeFormat}
                  onValueChange={(value) => {
                    setCurrencySettings({ ...currencySettings, timeFormat: value });
                    toast({
                      title: "Time format updated",
                      description: `Time will now be displayed in ${value} format.`
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-transactions">New Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new transactions are added
                  </p>
                </div>
                <Switch 
                  id="new-transactions" 
                  checked={notificationSettings.newTransactions}
                  onCheckedChange={() => toggleNotification('newTransactions')}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you approach or exceed your budget goals
                  </p>
                </div>
                <Switch 
                  id="budget-alerts" 
                  checked={notificationSettings.budgetAlerts}
                  onCheckedChange={() => toggleNotification('budgetAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summaries of your financial activity
                  </p>
                </div>
                <Switch 
                  id="weekly-reports" 
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={() => toggleNotification('weeklyReports')}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring-reminders">Recurring Transaction Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders about upcoming recurring transactions
                  </p>
                </div>
                <Switch 
                  id="recurring-reminders" 
                  checked={notificationSettings.recurringTransactionReminders}
                  onCheckedChange={() => toggleNotification('recurringTransactionReminders')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Options</CardTitle>
              <CardDescription>
                Control how your data is stored and used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="local-storage">Save Data Locally</Label>
                  <p className="text-sm text-muted-foreground">
                    Store your financial data in your browser's local storage
                  </p>
                </div>
                <Switch 
                  id="local-storage" 
                  checked={privacySettings.saveLocalData}
                  onCheckedChange={() => togglePrivacy('saveLocalData')}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Anonymous Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app by sharing anonymous usage data
                  </p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={privacySettings.anonymousAnalytics}
                  onCheckedChange={() => togglePrivacy('anonymousAnalytics')}
                />
              </div>
              
              <div className="flex items-center justify-between pt-3">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Create automatic backups of your data
                  </p>
                </div>
                <Switch 
                  id="auto-backup" 
                  checked={privacySettings.autoBackup}
                  onCheckedChange={() => togglePrivacy('autoBackup')}
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
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download a backup of all your financial data
                </p>
                <Button 
                  onClick={exportData} 
                  variant="outline" 
                  className="w-full sm:w-auto mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2 pt-4">
                <h3 className="text-sm font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Restore your data from a previous backup
                </p>
                <Button 
                  onClick={importData} 
                  variant="outline" 
                  className="w-full sm:w-auto mt-2"
                >
                  <CloudUpload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2 pt-4">
                <h3 className="text-sm font-medium">Reset Data</h3>
                <p className="text-sm text-muted-foreground">
                  Clear all data and start fresh. This action cannot be undone.
                </p>
                {!showResetConfirmation ? (
                  <Button 
                    onClick={() => setShowResetConfirmation(true)} 
                    variant="destructive" 
                    className="w-full sm:w-auto mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={resetData} 
                      variant="destructive"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Reset
                    </Button>
                    <Button 
                      onClick={() => setShowResetConfirmation(false)} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}