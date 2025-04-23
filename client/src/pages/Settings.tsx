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
import { useCookieStorage } from "@/hooks/useCookieStorage";
import { formatCurrency } from "@/lib/utils";
import { COOKIE_KEYS, getCookie, setCookie } from "@/lib/cookieStorage";
import { useCurrency } from "@/context/CurrencyContext";

export default function Settings() {
  const { toast } = useToast();
  const finance = useFinance();
  const { appearanceSettings, setAppearanceSettings } = useAppearance();
  const { currencySettings, setCurrencySettings } = useCurrency();
  
  // Initialize theme state based on cookie or system preference
  const storedTheme = getCookie("theme");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    storedTheme 
      ? storedTheme === "dark" 
      : window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  
  // Calculation settings
  const [calculationSettings, setCalculationSettings] = useCookieStorage(COOKIE_KEYS.CALCULATION_SETTINGS, {
    roundToNearest: "cent",
    taxRate: 7.5,
    budgetWarningThreshold: 80,
    budgetDangerThreshold: 95,
    roundUpTransactions: false,
    includePendingInTotals: true,
    investmentReturnRate: 7
  });
  
  // Report and chart settings
  const [reportSettings, setReportSettings] = useCookieStorage(COOKIE_KEYS.REPORT_SETTINGS, {
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
  
  // Calculator state
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [calculatorMemory, setCalculatorMemory] = useState<number>(0);
  const [calculationHistory, setCalculationHistory] = useState<string[]>([]);
  const [calculatorMode, setCalculatorMode] = useState<"standard" | "scientific" | "programmer" | "financial">("scientific");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [currentOperator, setCurrentOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(true);
  
  // Financial calculator states
  const [loanAmount, setLoanAmount] = useState<string>("100000");
  const [loanInterestRate, setLoanInterestRate] = useState<string>("5");
  const [loanTermYears, setLoanTermYears] = useState<string>("30");
  const [investmentInitial, setInvestmentInitial] = useState<string>("10000");
  const [investmentMonthly, setInvestmentMonthly] = useState<string>("500");
  const [investmentRate, setInvestmentRate] = useState<string>("7");
  const [investmentYears, setInvestmentYears] = useState<string>("30");
  
  // Basic calculator functions
  const clearDisplay = () => {
    setDisplayValue("0");
    setPreviousOperand(null);
    setCurrentOperator(null);
    setWaitingForOperand(true);
  };
  
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
    } else if (displayValue.indexOf(".") === -1) {
      setDisplayValue(displayValue + ".");
    }
  };
  
  const toggleSign = () => {
    setDisplayValue(String(-parseFloat(displayValue)));
  };
  
  const performOperation = (operator: string) => {
    const currentValue = parseFloat(displayValue);
    
    if (previousOperand === null) {
      setPreviousOperand(displayValue);
      setWaitingForOperand(true);
      setCurrentOperator(operator);
      return;
    }
    
    if (waitingForOperand) {
      setCurrentOperator(operator);
      return;
    }
    
    let result: number;
    const previousValue = parseFloat(previousOperand);
    
    switch (currentOperator) {
      case "+":
        result = previousValue + currentValue;
        break;
      case "−":
        result = previousValue - currentValue;
        break;
      case "×":
        result = previousValue * currentValue;
        break;
      case "÷":
        result = previousValue / currentValue;
        break;
      default:
        result = currentValue;
    }
    
    setDisplayValue(String(result));
    setPreviousOperand(String(result));
    setWaitingForOperand(true);
    setCurrentOperator(operator);
    
    // Add to history
    const historyEntry = `${previousValue} ${currentOperator} ${currentValue} = ${result}`;
    setCalculationHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
  };
  
  const calculateResult = () => {
    if (previousOperand === null || waitingForOperand) {
      return;
    }
    
    performOperation(currentOperator || "=");
    setCurrentOperator(null);
  };
  
  // Scientific calculator functions
  const calculateSin = () => {
    const result = Math.sin(parseFloat(displayValue) * (Math.PI / 180)); // Using degrees
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`sin(${displayValue}°) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateCos = () => {
    const result = Math.cos(parseFloat(displayValue) * (Math.PI / 180)); // Using degrees
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`cos(${displayValue}°) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateTan = () => {
    const result = Math.tan(parseFloat(displayValue) * (Math.PI / 180)); // Using degrees
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`tan(${displayValue}°) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateLog = () => {
    const result = Math.log10(parseFloat(displayValue));
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`log(${displayValue}) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateLn = () => {
    const result = Math.log(parseFloat(displayValue));
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`ln(${displayValue}) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateSquare = () => {
    const value = parseFloat(displayValue);
    const result = value * value;
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`${displayValue}² = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateCube = () => {
    const value = parseFloat(displayValue);
    const result = value * value * value;
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`${displayValue}³ = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculateSqrt = () => {
    const result = Math.sqrt(parseFloat(displayValue));
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`√(${displayValue}) = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  const calculatePi = () => {
    setDisplayValue(String(Math.PI));
    setWaitingForOperand(true);
  };
  
  const calculateE = () => {
    setDisplayValue(String(Math.E));
    setWaitingForOperand(true);
  };
  
  const calculateInverse = () => {
    const result = 1 / parseFloat(displayValue);
    setDisplayValue(String(result));
    setCalculationHistory(prev => [`1/${displayValue} = ${result}`, ...prev.slice(0, 9)]);
    setWaitingForOperand(true);
  };
  
  // Memory functions
  const memoryClear = () => {
    setCalculatorMemory(0);
    toast({
      title: "Memory cleared",
      description: "Calculator memory has been cleared."
    });
  };
  
  const memoryRecall = () => {
    setDisplayValue(String(calculatorMemory));
    setWaitingForOperand(true);
  };
  
  const memoryAdd = () => {
    setCalculatorMemory(calculatorMemory + parseFloat(displayValue));
    setWaitingForOperand(true);
    toast({
      title: "Added to memory",
      description: `${displayValue} added to memory.`
    });
  };
  
  const memorySubtract = () => {
    setCalculatorMemory(calculatorMemory - parseFloat(displayValue));
    setWaitingForOperand(true);
    toast({
      title: "Subtracted from memory",
      description: `${displayValue} subtracted from memory.`
    });
  };
  
  const memorySet = () => {
    setCalculatorMemory(parseFloat(displayValue));
    setWaitingForOperand(true);
    toast({
      title: "Memory set",
      description: `Memory set to ${displayValue}.`
    });
  };
  
  // Financial calculator functions
  const calculateLoanPayment = () => {
    const principal = parseFloat(loanAmount);
    const interestRate = parseFloat(loanInterestRate) / 100 / 12; // Monthly interest rate
    const payments = parseFloat(loanTermYears) * 12; // Total number of payments
    
    const x = Math.pow(1 + interestRate, payments);
    const monthlyPayment = (principal * x * interestRate) / (x - 1);
    
    const totalPayment = monthlyPayment * payments;
    const totalInterest = totalPayment - principal;
    
    setDisplayValue(monthlyPayment.toFixed(2));
    setCalculationHistory(prev => [
      `Loan: $${principal} at ${loanInterestRate}% for ${loanTermYears} years`,
      `Monthly payment: $${monthlyPayment.toFixed(2)}`,
      `Total payment: $${totalPayment.toFixed(2)}`,
      `Total interest: $${totalInterest.toFixed(2)}`,
      ...prev.slice(0, 6)
    ]);
    setWaitingForOperand(true);
  };
  
  const calculateCompoundInterest = () => {
    const principal = parseFloat(investmentInitial);
    const monthlyContribution = parseFloat(investmentMonthly);
    const rate = parseFloat(investmentRate) / 100 / 12; // Monthly interest rate
    const time = parseFloat(investmentYears) * 12; // Total months
    
    let futureValue = principal;
    for (let i = 0; i < time; i++) {
      futureValue = (futureValue + monthlyContribution) * (1 + rate);
    }
    
    const totalContributions = principal + (monthlyContribution * time);
    const interestEarned = futureValue - totalContributions;
    
    setDisplayValue(futureValue.toFixed(2));
    setCalculationHistory(prev => [
      `Investment: $${principal} initial + $${monthlyContribution}/month at ${investmentRate}% for ${investmentYears} years`,
      `Future value: $${futureValue.toFixed(2)}`,
      `Total contributions: $${totalContributions.toFixed(2)}`,
      `Interest earned: $${interestEarned.toFixed(2)}`,
      ...prev.slice(0, 6)
    ]);
    setWaitingForOperand(true);
  };
  
  // Calculate break-even point
  const calculateBreakEven = (fixedCosts: number, revenuePerUnit: number, costPerUnit: number) => {
    const breakEvenUnits = fixedCosts / (revenuePerUnit - costPerUnit);
    const breakEvenRevenue = breakEvenUnits * revenuePerUnit;
    
    setDisplayValue(breakEvenUnits.toFixed(2));
    setCalculationHistory(prev => [
      `Break-even: Fixed costs $${fixedCosts}, Revenue/unit $${revenuePerUnit}, Cost/unit $${costPerUnit}`,
      `Break-even units: ${breakEvenUnits.toFixed(2)}`,
      `Break-even revenue: $${breakEvenRevenue.toFixed(2)}`,
      ...prev.slice(0, 7)
    ]);
    setWaitingForOperand(true);
  };
  
  // Handle theme toggle
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setCookie("theme", "light", 365);
    } else {
      document.documentElement.classList.add("dark");
      setCookie("theme", "dark", 365);
    }
    setIsDarkMode(!isDarkMode);
    
    toast({
      title: `${!isDarkMode ? "Dark" : "Light"} theme applied`,
      description: `The application theme has been changed to ${!isDarkMode ? "dark" : "light"} mode.`,
    });
  };
  
  // Export data function using the finance context's exportData method
  const exportFinanceData = () => {
    // Get data as JSON string from the context
    const dataStr = finance.exportData();
    
    // Create a download link
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
  
  // Import data function using finance context's importData method
  const importFinanceData = () => {
    // Create a file input element
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
          if (!event.target?.result) {
            throw new Error("Failed to read file");
          }
          
          const jsonData = event.target.result as string;
          
          // Use the importData function from context
          const success = finance.importData(jsonData);
          
          if (!success) {
            // Error messages are already handled in the context
            return;
          }
          
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
              <span>Currency Symbol</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calculations"
              className="flex items-center gap-1 px-3 text-sm font-medium"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
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
        
        {/* Currency Symbol Settings */}
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
        </TabsContent>
        
        {/* Calculations Settings */}
        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scientific Calculator</CardTitle>
              <CardDescription>
                Perform advanced scientific and mathematical calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-1">
                {/* Calculator display */}
                <div className="bg-muted rounded-md p-4 mb-4">
                  <input 
                    type="text" 
                    className="w-full text-right text-2xl font-mono bg-transparent border-none focus:outline-none focus:ring-0" 
                    value={displayValue} 
                    readOnly 
                  />
                </div>
                
                {/* Calculator mode selection */}
                <div className="flex space-x-2 mb-4">
                  <Button 
                    variant={calculatorMode === "standard" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setCalculatorMode("standard")}
                  >
                    Standard
                  </Button>
                  <Button 
                    variant={calculatorMode === "scientific" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setCalculatorMode("scientific")}
                  >
                    Scientific
                  </Button>
                  <Button 
                    variant={calculatorMode === "financial" ? "default" : "outline"} 
                    className="flex-1" 
                    onClick={() => setCalculatorMode("financial")}
                  >
                    Financial
                  </Button>
                </div>
                
                {calculatorMode === "scientific" && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <Button variant="outline" onClick={calculateSin}>sin</Button>
                    <Button variant="outline" onClick={calculateCos}>cos</Button>
                    <Button variant="outline" onClick={calculateTan}>tan</Button>
                    <Button variant="outline" onClick={calculateLog}>log</Button>
                    <Button variant="outline" onClick={calculateLn}>ln</Button>
                    <Button variant="outline" onClick={calculateSquare}>x²</Button>
                    <Button variant="outline" onClick={calculateCube}>x³</Button>
                    <Button variant="outline" onClick={() => {
                      // Power function requires two inputs, so we use the regular operation
                      performOperation("^");
                    }}>xʸ</Button>
                    <Button variant="outline" onClick={calculateSqrt}>√</Button>
                    <Button variant="outline" onClick={() => {
                      const result = Math.cbrt(parseFloat(displayValue));
                      setDisplayValue(String(result));
                      setCalculationHistory(prev => [`∛(${displayValue}) = ${result}`, ...prev.slice(0, 9)]);
                      setWaitingForOperand(true);
                    }}>∛</Button>
                    <Button variant="outline" onClick={calculatePi}>π</Button>
                    <Button variant="outline" onClick={calculateE}>e</Button>
                    <Button variant="outline" onClick={() => {
                      const result = Math.abs(parseFloat(displayValue));
                      setDisplayValue(String(result));
                      setCalculationHistory(prev => [`|${displayValue}| = ${result}`, ...prev.slice(0, 9)]);
                      setWaitingForOperand(true);
                    }}>|x|</Button>
                    <Button variant="outline" onClick={() => {
                      // Factorial
                      const num = parseInt(displayValue);
                      let result = 1;
                      for (let i = 2; i <= num; i++) {
                        result *= i;
                      }
                      setDisplayValue(String(result));
                      setCalculationHistory(prev => [`${displayValue}! = ${result}`, ...prev.slice(0, 9)]);
                      setWaitingForOperand(true);
                    }}>n!</Button>
                    <Button variant="outline" onClick={calculateInverse}>1/x</Button>
                    <Button variant="outline" onClick={() => {
                      // Modulo requires two inputs, so we use the regular operation
                      performOperation("%");
                    }}>mod</Button>
                  </div>
                )}
                
                {calculatorMode === "financial" && (
                  <div className="space-y-6 mb-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Loan Calculator</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="loan-amount">Loan Amount ($)</Label>
                          <Input 
                            id="loan-amount"
                            type="number" 
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan-interest">Interest Rate (%)</Label>
                          <Input 
                            id="loan-interest"
                            type="number" 
                            value={loanInterestRate}
                            onChange={(e) => setLoanInterestRate(e.target.value)}
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loan-term">Term (years)</Label>
                          <Input 
                            id="loan-term"
                            type="number" 
                            value={loanTermYears}
                            onChange={(e) => setLoanTermYears(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="default"
                            className="w-full"
                            onClick={calculateLoanPayment}
                          >
                            Calculate Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Investment Calculator</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="inv-initial">Initial Investment ($)</Label>
                          <Input 
                            id="inv-initial"
                            type="number" 
                            value={investmentInitial}
                            onChange={(e) => setInvestmentInitial(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inv-monthly">Monthly Addition ($)</Label>
                          <Input 
                            id="inv-monthly"
                            type="number" 
                            value={investmentMonthly}
                            onChange={(e) => setInvestmentMonthly(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inv-rate">Annual Return (%)</Label>
                          <Input 
                            id="inv-rate"
                            type="number" 
                            value={investmentRate}
                            onChange={(e) => setInvestmentRate(e.target.value)}
                            step="0.1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inv-years">Time Period (years)</Label>
                          <Input 
                            id="inv-years"
                            type="number" 
                            value={investmentYears}
                            onChange={(e) => setInvestmentYears(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        variant="default"
                        onClick={calculateCompoundInterest}
                      >
                        Calculate Future Value
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Break-Even Calculator</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="fixed-costs">Fixed Costs ($)</Label>
                          <Input 
                            id="fixed-costs"
                            type="number" 
                            placeholder="10000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="revenue-unit">Revenue Per Unit ($)</Label>
                          <Input 
                            id="revenue-unit"
                            type="number" 
                            placeholder="100"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cost-unit">Cost Per Unit ($)</Label>
                          <Input 
                            id="cost-unit"
                            type="number" 
                            placeholder="60"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <Button 
                        variant="default"
                        onClick={() => {
                          const fixedCostsInput = document.getElementById('fixed-costs') as HTMLInputElement;
                          const revenueInput = document.getElementById('revenue-unit') as HTMLInputElement;
                          const costInput = document.getElementById('cost-unit') as HTMLInputElement;
                          
                          if (fixedCostsInput && revenueInput && costInput) {
                            const fixedCosts = parseFloat(fixedCostsInput.value);
                            const revenuePerUnit = parseFloat(revenueInput.value);
                            const costPerUnit = parseFloat(costInput.value);
                            
                            if (!isNaN(fixedCosts) && !isNaN(revenuePerUnit) && !isNaN(costPerUnit)) {
                              calculateBreakEven(fixedCosts, revenuePerUnit, costPerUnit);
                            } else {
                              toast({
                                title: "Missing values",
                                description: "Please enter valid numbers for all fields.",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                      >
                        Calculate Break-Even
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Memory functions */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={memoryClear}>MC</Button>
                  <Button variant="ghost" size="sm" onClick={memoryRecall}>MR</Button>
                  <Button variant="ghost" size="sm" onClick={memoryAdd}>M+</Button>
                  <Button variant="ghost" size="sm" onClick={memorySubtract}>M-</Button>
                  <Button variant="ghost" size="sm" onClick={memorySet}>MS</Button>
                </div>
                
                {/* Main calculator buttons - only show for standard and scientific modes */}
                {calculatorMode !== "financial" && (
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" onClick={clearDisplay}>C</Button>
                    <Button variant="outline" onClick={() => inputDigit("(")}>&#40;</Button>
                    <Button variant="outline" onClick={() => inputDigit(")")}>&#41;</Button>
                    <Button variant="outline" onClick={() => performOperation("÷")}>÷</Button>
                    
                    <Button variant="secondary" onClick={() => inputDigit("7")}>7</Button>
                    <Button variant="secondary" onClick={() => inputDigit("8")}>8</Button>
                    <Button variant="secondary" onClick={() => inputDigit("9")}>9</Button>
                    <Button variant="outline" onClick={() => performOperation("×")}>×</Button>
                    
                    <Button variant="secondary" onClick={() => inputDigit("4")}>4</Button>
                    <Button variant="secondary" onClick={() => inputDigit("5")}>5</Button>
                    <Button variant="secondary" onClick={() => inputDigit("6")}>6</Button>
                    <Button variant="outline" onClick={() => performOperation("−")}>−</Button>
                    
                    <Button variant="secondary" onClick={() => inputDigit("1")}>1</Button>
                    <Button variant="secondary" onClick={() => inputDigit("2")}>2</Button>
                    <Button variant="secondary" onClick={() => inputDigit("3")}>3</Button>
                    <Button variant="outline" onClick={() => performOperation("+")}>+</Button>
                    
                    <Button variant="secondary" onClick={toggleSign}>±</Button>
                    <Button variant="secondary" onClick={() => inputDigit("0")}>0</Button>
                    <Button variant="secondary" onClick={inputDecimal}>.</Button>
                    <Button variant="default" onClick={calculateResult}>=</Button>
                  </div>
                )}
                
                {/* History section */}
                <div className="mt-6">
                  <Label>Calculation History</Label>
                  <div className="bg-muted rounded-md p-4 mt-2 h-32 overflow-y-auto">
                    <div className="text-sm text-muted-foreground">
                      {calculationHistory.length > 0 ? (
                        calculationHistory.map((item, index) => (
                          <div className="mb-2" key={index}>
                            <div>{item}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-3">
                          No calculation history yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Finance-specific tools */}
                {calculatorMode === "standard" && (
                  <div className="mt-6">
                    <Label>Financial Tools</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Tax Calculation",
                            description: `Applying ${calculationSettings.taxRate}% tax to ${displayValue}`
                          });
                          const value = parseFloat(displayValue);
                          const tax = value * (calculationSettings.taxRate / 100);
                          const total = value + tax;
                          setDisplayValue(total.toFixed(2));
                          setCalculationHistory(prev => [
                            `${displayValue} + ${calculationSettings.taxRate}% tax = ${total.toFixed(2)}`,
                            ...prev.slice(0, 9)
                          ]);
                        }}
                      >
                        Add Tax ({calculationSettings.taxRate}%)
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Tip Calculation",
                            description: "Adding 15% tip"
                          });
                          const value = parseFloat(displayValue);
                          const tip = value * 0.15;
                          const total = value + tip;
                          setDisplayValue(total.toFixed(2));
                          setCalculationHistory(prev => [
                            `${displayValue} + 15% tip = ${total.toFixed(2)}`,
                            ...prev.slice(0, 9)
                          ]);
                        }}
                      >
                        Add Tip (15%)
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Discount Calculation",
                            description: "Applying 10% discount"
                          });
                          const value = parseFloat(displayValue);
                          const discount = value * 0.10;
                          const total = value - discount;
                          setDisplayValue(total.toFixed(2));
                          setCalculationHistory(prev => [
                            `${displayValue} - 10% discount = ${total.toFixed(2)}`,
                            ...prev.slice(0, 9)
                          ]);
                        }}
                      >
                        Apply Discount (10%)
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Currency Conversion",
                            description: "Switching to financial calculator"
                          });
                          setCalculatorMode("financial");
                        }}
                      >
                        Currency Conversion
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Report Settings */}

        
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
              <div className="bg-gradient-to-br from-muted/30 to-background rounded-xl p-6 border border-border/50 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Export Data
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Download all your financial data as a JSON file
                    </p>
                  </div>
                  <Button 
                    onClick={exportFinanceData}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-md">
                  <Badge variant="outline" className="bg-primary/5 text-primary">Transactions</Badge>
                  <Badge variant="outline" className="bg-primary/5 text-primary">Categories</Badge>
                  <Badge variant="outline" className="bg-primary/5 text-primary">Budget Goals</Badge>
                  <Badge variant="outline" className="bg-primary/5 text-primary">Recurring Transactions</Badge>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-muted/30 to-background rounded-xl p-6 border border-border/50 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CloudUpload className="h-5 w-5 text-primary" />
                      Import Data
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload and restore your financial data from a JSON file
                    </p>
                  </div>
                  <Button 
                    onClick={importFinanceData}
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <CloudUpload className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-muted-foreground bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Important Note
                    </p>
                    <p>
                      Importing data will replace your current data with the contents of the uploaded file. 
                      Make sure to back up your existing data before importing.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
                    <p className="font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" />
                      Valid Import Format
                    </p>
                    <p>
                      Import files should be in JSON format and contain valid transaction, category, budget goal, 
                      and/or recurring transaction data in the correct structure.
                    </p>
                  </div>
                </div>
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

          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}