import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, PiggyBank, Building, Plus, Edit, Trash2, MoreVertical, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCookieStorage } from "@/hooks/useCookieStorage";
import { COOKIE_KEYS } from "@/lib/cookieStorage";

// Account type schema
interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment" | "other";
  balance: number;
  icon: string;
  color: string;
  isDefault?: boolean;
}

// Form schema for adding/editing accounts
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["cash", "bank", "credit", "investment", "other"]),
  balance: z.string().min(1, "Balance is required").refine(
    (val) => !isNaN(Number(val)),
    { message: "Balance must be a number" }
  ),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Accounts() {
  // Use cookie storage for accounts to persist data
  const [accounts, setAccounts] = useCookieStorage<Account[]>(COOKIE_KEYS.ACCOUNTS, [
    {
      id: "1",
      name: "Cash Wallet",
      type: "cash",
      balance: 5000,
      icon: "💰",
      color: "#4CAF50",
      isDefault: true
    },
    {
      id: "2",
      name: "Main Bank Account",
      type: "bank",
      balance: 25000,
      icon: "🏦",
      color: "#2196F3"
    },
    {
      id: "3",
      name: "Credit Card",
      type: "credit",
      balance: -3500,
      icon: "💳",
      color: "#F44336"
    },
    {
      id: "4",
      name: "Investments",
      type: "investment",
      balance: 50000,
      icon: "📈",
      color: "#9C27B0"
    }
  ]);
  
  const { toast } = useToast();
  const finance = useFinance();
  const { currencySettings } = useCurrency();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Calculate totals by account type
  const cashBalance = accounts
    .filter(a => a.type === "cash")
    .reduce((sum, a) => sum + a.balance, 0);
    
  const bankBalance = accounts
    .filter(a => a.type === "bank")
    .reduce((sum, a) => sum + a.balance, 0);
    
  const creditBalance = accounts
    .filter(a => a.type === "credit")
    .reduce((sum, a) => sum + a.balance, 0);
    
  const investmentBalance = accounts
    .filter(a => a.type === "investment")
    .reduce((sum, a) => sum + a.balance, 0);
  
  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "bank",
      balance: "0",
      color: "#2196F3",
      isDefault: false
    }
  });
  
  // Get account icon based on type
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Wallet className="h-5 w-5" />;
      case "bank":
        return <Building className="h-5 w-5" />;
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "investment":
        return <PiggyBank className="h-5 w-5" />;
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };
  
  // Handle form submission for adding a new account
  const onSubmit = (data: FormValues) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      balance: Number(data.balance),
      icon: data.type === "cash" ? "💰" : data.type === "bank" ? "🏦" : data.type === "credit" ? "💳" : data.type === "investment" ? "📈" : "📊",
      color: data.color || "#2196F3",
      isDefault: data.isDefault || false
    };
    
    setAccounts([...accounts, newAccount]);
    form.reset();
    setIsFormOpen(false);
    
    // Show toast notification
    toast({
      title: "Account Added",
      description: `${data.name} has been added to your accounts.`,
    });
  };
  
  // Handle form submission for editing an existing account
  const onEditSubmit = (data: FormValues) => {
    if (!currentAccount) return;
    
    const updatedAccount: Account = {
      ...currentAccount,
      name: data.name,
      type: data.type,
      balance: Number(data.balance),
      color: data.color || currentAccount.color,
      isDefault: data.isDefault || false
    };
    
    setAccounts(accounts.map(a => a.id === currentAccount.id ? updatedAccount : a));
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentAccount(null);
    
    // Show toast notification
    toast({
      title: "Account Updated",
      description: `${data.name} has been updated.`,
    });
  };
  
  // Handle edit button click
  const handleEditClick = (account: Account) => {
    setCurrentAccount(account);
    setIsEditMode(true);
    
    form.reset({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      color: account.color,
      isDefault: account.isDefault || false
    });
    
    setIsFormOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setAccountToDelete(id);
    setAlertDialogOpen(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (accountToDelete) {
      setAccounts(accounts.filter(a => a.id !== accountToDelete));
      setAccountToDelete(null);
      setAlertDialogOpen(false);
      
      // Show toast notification
      toast({
        title: "Account Deleted",
        description: "The account has been deleted successfully.",
      });
    }
  };
  
  // Close form and reset
  const handleFormClose = () => {
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentAccount(null);
  };
  
  // Filter accounts based on active tab
  const filteredAccounts = accounts.filter(account => {
    if (activeTab === "all") return true;
    return account.type === activeTab;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your cash, bank accounts, credit cards, and investments.
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setCurrentAccount(null);
          form.reset();
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalBalance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                cashBalance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {accounts.filter(a => a.type === "cash").length} account(s)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Bank Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                bankBalance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {accounts.filter(a => a.type === "bank").length} account(s)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Credit Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                creditBalance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {accounts.filter(a => a.type === "credit").length} account(s)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                investmentBalance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {accounts.filter(a => a.type === "investment").length} account(s)
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Account List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="cash">Cash</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredAccounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No accounts found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  {activeTab === "all" 
                    ? "You haven't added any accounts yet." 
                    : `You don't have any ${activeTab} accounts.`
                  }
                </p>
                <Button className="mt-4" onClick={() => {
                  setIsEditMode(false);
                  setCurrentAccount(null);
                  form.reset({
                    ...form.getValues(),
                    type: activeTab !== "all" ? activeTab as any : "bank"
                  });
                  setIsFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAccounts.map(account => (
                <Card key={account.id} className="overflow-hidden">
                  <div className="flex border-l-4" style={{ borderColor: account.color }}>
                    <div className="p-5 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: `${account.color}20` }}
                          >
                            <span className="text-lg">{account.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{account.name}</h3>
                              {account.isDefault && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {account.type} Account
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={cn(
                              "font-medium text-lg",
                              account.balance < 0 ? "text-red-500" : ""
                            )}>
                              {formatCurrency(
                                account.balance,
                                currencySettings.defaultCurrency,
                                currencySettings.locale,
                                currencySettings.currencyPosition
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Current Balance
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(account)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Account
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(account.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Account Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Account" : "Add Account"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of your account." 
                : "Add a new account to track your finances."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isEditMode ? onEditSubmit : onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., My Checking Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Account</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default account</FormLabel>
                      <FormDescription>
                        This account will be selected by default when adding new transactions.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleFormClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update" : "Add"} Account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this account. 
              All associated transactions will remain but won't be linked to this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}