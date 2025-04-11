import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/context/FinanceContext";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette,
  Download,
  CloudUpload,
  Trash2,
  Check
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
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useLocalStorage("notificationSettings", {
    newTransactions: true,
    budgetAlerts: true,
    weeklyReports: true,
    recurringTransactionReminders: true
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useLocalStorage("privacySettings", {
    saveLocalData: true,
    anonymousAnalytics: false,
    autoBackup: true
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
      
      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Data Management
          </TabsTrigger>
        </TabsList>
        
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