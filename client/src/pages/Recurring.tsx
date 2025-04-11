import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { RecurringTransaction } from "@shared/schema";
import { formatCurrency, formatFrequencyLabel, getTimeUntilNextOccurrence } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  RepeatIcon, 
  Edit, 
  Trash2, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Play,
  Pause,
  ArrowRightCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form validation schema for recurring transactions
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Recurring() {
  const { 
    categories, 
    recurringTransactions, 
    addRecurringTransaction, 
    updateRecurringTransaction, 
    deleteRecurringTransaction,
    processRecurringTransaction,
    toggleRecurringTransactionStatus
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentTransaction, setCurrentTransaction] = useState<RecurringTransaction | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "expense",
      amount: "",
      category: "",
      frequency: "monthly",
      note: ""
    }
  });
  
  // Handle form submission for creating a new recurring transaction
  const onSubmit = (data: FormValues) => {
    const newTransaction = {
      name: data.name,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      frequency: data.frequency,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
      note: data.note,
      active: true
    };
    
    addRecurringTransaction(newTransaction);
    form.reset();
    setIsFormOpen(false);
  };
  
  // Handle form submission for editing an existing recurring transaction
  const onEditSubmit = (data: FormValues) => {
    if (!currentTransaction) return;
    
    const updatedTransaction = {
      ...currentTransaction,
      name: data.name,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      frequency: data.frequency,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
      note: data.note,
    };
    
    updateRecurringTransaction(updatedTransaction);
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentTransaction(null);
  };
  
  // Handle edit button click
  const handleEditClick = (transaction: RecurringTransaction) => {
    setCurrentTransaction(transaction);
    setIsEditMode(true);
    
    form.reset({
      name: transaction.name,
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate),
      endDate: transaction.endDate ? new Date(transaction.endDate) : undefined,
      note: transaction.note || ""
    });
    
    setIsFormOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setAlertDialogOpen(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteRecurringTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setAlertDialogOpen(false);
    }
  };
  
  // Close form and reset
  const handleFormClose = () => {
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentTransaction(null);
  };
  
  // Filter transactions based on active tab
  const filteredTransactions = recurringTransactions.filter(transaction => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return transaction.active;
    if (activeTab === "paused") return !transaction.active;
    if (activeTab === "income") return transaction.type === "income";
    if (activeTab === "expense") return transaction.type === "expense";
    return true;
  });
  
  // Get category emoji
  const getCategoryEmoji = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.emoji || "📋";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            Manage your recurring incomes and expenses.
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setCurrentTransaction(null);
          form.reset();
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring
        </Button>
      </div>
      
      {/* Tabs to filter transactions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <RepeatIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No recurring transactions found</h3>
                <p className="text-muted-foreground text-center mt-2">
                  {activeTab === "all" 
                    ? "You haven't set up any recurring transactions yet." 
                    : `You don't have any ${activeTab} recurring transactions.`
                  }
                </p>
                <Button className="mt-4" onClick={() => {
                  setIsEditMode(false);
                  setCurrentTransaction(null);
                  form.reset();
                  setIsFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Recurring Transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className={
                  !transaction.active 
                    ? "border-gray-200 bg-gray-50/50 dark:bg-gray-900/20 dark:border-gray-800/30" 
                    : transaction.type === "income"
                      ? "border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-800/30"
                      : ""
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          transaction.type === "income" 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-primary/10"
                        )}>
                          <span className="text-lg">
                            {getCategoryEmoji(transaction.category)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{transaction.name}</h3>
                            {!transaction.active && (
                              <Badge variant="outline" className="text-xs font-normal">
                                Paused
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatFrequencyLabel(transaction.frequency)}
                          </p>
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
                          <DropdownMenuItem onClick={() => processRecurringTransaction(transaction.id)}>
                            <ArrowRightCircle className="h-4 w-4 mr-2" />
                            Process Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleRecurringTransactionStatus(transaction.id)}>
                            {transaction.active 
                              ? <Pause className="h-4 w-4 mr-2" /> 
                              : <Play className="h-4 w-4 mr-2" />
                            }
                            {transaction.active ? "Pause" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(transaction)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className={cn(
                          "font-medium",
                          transaction.type === "income" ? "text-green-600 dark:text-green-400" : ""
                        )}>
                          {transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{transaction.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-medium">{format(new Date(transaction.startDate), "PP")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next</p>
                        <div className="flex items-center gap-1">
                          <p className="font-medium">{format(new Date(transaction.nextDate), "PP")}</p>
                          <span className="text-xs text-muted-foreground">
                            ({getTimeUntilNextOccurrence(transaction.nextDate)})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {transaction.note && (
                      <div className="mt-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {transaction.note}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Recurring Transaction Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Recurring Transaction" : "Add Recurring Transaction"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of this recurring transaction." 
                : "Add a new recurring income or expense to your account."
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Rent" {...field} />
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
                      <FormLabel>Type</FormLabel>
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
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories
                            .filter(c => form.getValues("type") === "income" 
                              ? c.type === "income" || c.type === "both"
                              : c.type === "expense" || c.type === "both"
                            )
                            .map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                <span className="flex items-center gap-2">
                                  {category.emoji} {category.name}
                                </span>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                field.onChange(undefined);
                                // Close popover
                                const button = document.activeElement as HTMLElement;
                                button?.blur();
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              // Disable dates before the start date
                              const startDate = form.getValues("startDate");
                              if (!startDate) return false;
                              return date < startDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional details here" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
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
                  {isEditMode ? "Update" : "Add"} Transaction
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
              This will permanently delete this recurring transaction. 
              This action cannot be undone.
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