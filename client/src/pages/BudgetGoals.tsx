import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { budgetGoalSchema, BudgetGoal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { chartColors } from "@/lib/chartConfig";
import { 
  Target, 
  Trash2, 
  Edit, 
  Plus, 
  MoreVertical, 
  ArrowUpRight, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock 
} from "lucide-react";

// Form validation schema
const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  targetAmount: z.string().min(1, "Target amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Target amount must be a positive number" }
  ),
  period: z.enum(["weekly", "monthly", "yearly"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BudgetGoals() {
  const { budgetGoals, transactions, categories, addBudgetGoal, updateBudgetGoal, deleteBudgetGoal } = useFinance();
  const { currencySettings } = useCurrency();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<BudgetGoal | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      targetAmount: "",
      period: "monthly",
      notes: "",
    },
  });
  
  // Calculate progress for each goal
  const goalsWithProgress = budgetGoals.map(goal => {
    const categoryTransactions = transactions.filter(
      t => t.type === "expense" && t.category === goal.category
    );
    
    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const progress = goal.limit > 0 ? (spent / goal.limit) * 100 : 0;
    const remaining = Math.max(0, goal.limit - spent);
    
    return {
      ...goal,
      spent,
      progress: Math.min(progress, 100),
      remaining,
      isOverBudget: progress > 100,
      targetAmount: goal.limit // For backward compatibility
    };
  }).sort((a, b) => b.progress - a.progress);
  
  // Handle form submission
  const onSubmit = (data: FormValues) => {
    const newGoal = {
      category: data.category,
      limit: Number(data.targetAmount),
      current: 0,
      period: data.period as BudgetGoal["period"],
      // Notes will be stored differently in a separate field or local storage
    };
    
    addBudgetGoal(newGoal);
    form.reset();
    setIsFormOpen(false);
  };
  
  // Handle edit form submission
  const onEditSubmit = (data: FormValues) => {
    if (!currentGoal) return;
    
    const updatedGoal = {
      ...currentGoal,
      category: data.category,
      limit: Number(data.targetAmount),
      period: data.period as BudgetGoal["period"],
      // Store notes elsewhere or in local metadata
    };
    
    updateBudgetGoal(updatedGoal);
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentGoal(null);
  };
  
  // Handle edit button click
  const handleEditClick = (goal: BudgetGoal) => {
    setCurrentGoal(goal);
    setIsEditMode(true);
    
    form.reset({
      category: goal.category,
      targetAmount: goal.limit.toString(),
      period: goal.period,
      notes: "", // Notes handled separately
    });
    
    setIsFormOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setGoalToDelete(id);
    setAlertDialogOpen(true);
  };
  
  // Handle actual deletion
  const confirmDelete = () => {
    if (goalToDelete) {
      deleteBudgetGoal(goalToDelete);
      setGoalToDelete(null);
      setAlertDialogOpen(false);
    }
  };
  
  // Close form and reset
  const handleFormClose = () => {
    form.reset();
    setIsFormOpen(false);
    setIsEditMode(false);
    setCurrentGoal(null);
  };
  
  // Prepare data for pie chart
  const budgetAllocationData = budgetGoals.map(goal => ({
    name: goal.category,
    value: goal.limit,
    emoji: categories.find(c => c.name === goal.category)?.emoji || "📊",
  }));
  
  // Prepare data for radar chart
  const radarData = goalsWithProgress.map(goal => ({
    category: goal.category,
    spent: goal.spent,
    target: goal.limit,
    completion: goal.progress,
  }));
  
  // Calculate overall budget health
  const totalBudgeted = budgetGoals.reduce((sum, goal) => sum + goal.limit, 0);
  const totalSpent = goalsWithProgress.reduce((sum, goal) => sum + goal.spent, 0);
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const overBudgetCount = goalsWithProgress.filter(g => g.isOverBudget).length;
  
  // Determine overall budget status
  let budgetStatus = "On Track";
  let statusColor = "text-green-600";
  
  if (overallProgress > 100) {
    budgetStatus = "Over Budget";
    statusColor = "text-red-600";
  } else if (overallProgress > 85) {
    budgetStatus = "Near Limit";
    statusColor = "text-amber-600";
  } else if (budgetGoals.length === 0) {
    budgetStatus = "No Goals";
    statusColor = "text-gray-600";
  }
  
  // Helper function to format currency with user settings
  const formatCurrencyWithSettings = (amount: number) => {
    return formatCurrency(
      amount,
      currencySettings.defaultCurrency,
      currencySettings.locale,
      currencySettings.currencyPosition
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Goals</h1>
          <p className="text-muted-foreground">
            Set spending limits and track your budget adherence.
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setCurrentGoal(null);
          form.reset();
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Goal
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Budgeted
                </CardTitle>
                <CardDescription>
                  Across all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    totalBudgeted,
                    currencySettings.defaultCurrency,
                    currencySettings.locale,
                    currencySettings.currencyPosition
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {budgetGoals.length} active budget goals
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
                <CardDescription>
                  Against budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    totalSpent,
                    currencySettings.defaultCurrency,
                    currencySettings.locale,
                    currencySettings.currencyPosition
                  )}
                </div>
                <div className={`text-xs mt-1 ${
                  overallProgress > 100 
                    ? "text-red-600" 
                    : overallProgress > 85 
                      ? "text-amber-600" 
                      : "text-green-600"
                }`}>
                  {overallProgress.toFixed(1)}% of total budget
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Budget Status
                </CardTitle>
                <CardDescription>
                  Overall health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${statusColor}`}>
                  {budgetStatus}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {overBudgetCount > 0 
                    ? `${overBudgetCount} categories over budget` 
                    : "All categories within budget"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Remaining Budget
                </CardTitle>
                <CardDescription>
                  Still available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Math.max(0, totalBudgeted - totalSpent),
                    currencySettings.defaultCurrency,
                    currencySettings.locale,
                    currencySettings.currencyPosition
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {overallProgress > 100 
                    ? "Budget exceeded" 
                    : `${(100 - overallProgress).toFixed(1)}% remaining`}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {budgetGoals.length > 0 ? (
            <div className="grid gap-4">
              {goalsWithProgress.map((goal) => (
                <Card key={goal.id} className={
                  goal.isOverBudget 
                    ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30" 
                    : goal.progress > 85 
                      ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30" 
                      : ""
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg">
                            {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{goal.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} budget
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
                          <DropdownMenuItem onClick={() => handleEditClick(goal)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Goal
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(goal.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Goal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Budget Progress</span>
                        <span className={
                          goal.isOverBudget 
                            ? "text-red-600" 
                            : goal.progress > 85 
                              ? "text-amber-600" 
                              : "text-green-600"
                        }>
                          {goal.progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={goal.progress} 
                        className={
                          goal.isOverBudget 
                            ? "bg-red-100 dark:bg-red-950" 
                            : goal.progress > 85 
                              ? "bg-amber-100 dark:bg-amber-950" 
                              : ""
                        }
                        indicatorClassName={
                          goal.isOverBudget 
                            ? "bg-red-600" 
                            : goal.progress > 85 
                              ? "bg-amber-600" 
                              : ""
                        }
                      />
                      
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Spent</p>
                          <p className="font-medium">{formatCurrencyWithSettings(goal.spent)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target</p>
                          <p className="font-medium">{formatCurrencyWithSettings(goal.targetAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className={`font-medium ${goal.isOverBudget ? "text-red-600" : ""}`}>
                            {goal.isOverBudget 
                              ? `(${formatCurrencyWithSettings(goal.spent - goal.targetAmount)}) over` 
                              : formatCurrencyWithSettings(goal.remaining)}
                          </p>
                        </div>
                      </div>
                      
                      {goal.notes && (
                        <div className="text-sm text-muted-foreground mt-2 border-t pt-2">
                          <p>{goal.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-lg font-medium">No Budget Goals</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Create your first budget goal to start tracking your spending limits.
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          {budgetGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Health Status</CardTitle>
                  <CardDescription>
                    Your budgeting performance by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Over Budget */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <h3 className="font-medium text-red-600">Over Budget</h3>
                      </div>
                      
                      {goalsWithProgress.filter(g => g.isOverBudget).length > 0 ? (
                        <div className="space-y-2">
                          {goalsWithProgress
                            .filter(g => g.isOverBudget)
                            .map(goal => (
                              <div key={goal.id} className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-md p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                  </span>
                                  <span>{goal.category}</span>
                                </div>
                                <div className="text-sm font-medium text-red-600">
                                  {goal.progress.toFixed(1)}% 
                                  <span className="text-xs ml-1">
                                    ({formatCurrencyWithSettings(goal.spent - goal.targetAmount)} over)
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories are over budget. Great job!
                        </p>
                      )}
                    </div>
                    
                    {/* Warning */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <h3 className="font-medium text-amber-600">Approaching Limit</h3>
                      </div>
                      
                      {goalsWithProgress.filter(g => !g.isOverBudget && g.progress > 85).length > 0 ? (
                        <div className="space-y-2">
                          {goalsWithProgress
                            .filter(g => !g.isOverBudget && g.progress > 85)
                            .map(goal => (
                              <div key={goal.id} className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-md p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                  </span>
                                  <span>{goal.category}</span>
                                </div>
                                <div className="text-sm font-medium text-amber-600">
                                  {goal.progress.toFixed(1)}%
                                  <span className="text-xs ml-1">
                                    ({formatCurrencyWithSettings(goal.remaining)} left)
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories are nearing their budget limit.
                        </p>
                      )}
                    </div>
                    
                    {/* On Track */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <h3 className="font-medium text-green-600">On Track</h3>
                      </div>
                      
                      {goalsWithProgress.filter(g => !g.isOverBudget && g.progress <= 85).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {goalsWithProgress
                            .filter(g => !g.isOverBudget && g.progress <= 85)
                            .map(goal => (
                              <div key={goal.id} className="bg-green-50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20 rounded-md p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                  </span>
                                  <span>{goal.category}</span>
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                  {goal.progress.toFixed(1)}%
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories are currently on track with their budget.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget Period Breakdown</CardTitle>
                  <CardDescription>
                    Your budgets by time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Weekly */}
                    <div>
                      <h3 className="font-medium mb-2">Weekly Budgets</h3>
                      {goalsWithProgress.filter(g => g.period === "weekly").length > 0 ? (
                        <div className="space-y-2">
                          {goalsWithProgress
                            .filter(g => g.period === "weekly")
                            .map(goal => (
                              <div key={goal.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                    </span>
                                    <span>{goal.category}</span>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {formatCurrency(goal.targetAmount)}
                                  </div>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(goal.spent)} spent
                                  </span>
                                  <span className={`text-xs ${
                                    goal.isOverBudget 
                                      ? "text-red-600" 
                                      : goal.progress > 85 
                                        ? "text-amber-600" 
                                        : "text-green-600"
                                  }`}>
                                    {goal.progress.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No weekly budgets defined.
                        </p>
                      )}
                    </div>
                    
                    {/* Monthly */}
                    <div>
                      <h3 className="font-medium mb-2">Monthly Budgets</h3>
                      {goalsWithProgress.filter(g => g.period === "monthly").length > 0 ? (
                        <div className="space-y-2">
                          {goalsWithProgress
                            .filter(g => g.period === "monthly")
                            .map(goal => (
                              <div key={goal.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                    </span>
                                    <span>{goal.category}</span>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {formatCurrency(goal.targetAmount)}
                                  </div>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(goal.spent)} spent
                                  </span>
                                  <span className={`text-xs ${
                                    goal.isOverBudget 
                                      ? "text-red-600" 
                                      : goal.progress > 85 
                                        ? "text-amber-600" 
                                        : "text-green-600"
                                  }`}>
                                    {goal.progress.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No monthly budgets defined.
                        </p>
                      )}
                    </div>
                    
                    {/* Yearly */}
                    <div>
                      <h3 className="font-medium mb-2">Yearly Budgets</h3>
                      {goalsWithProgress.filter(g => g.period === "yearly").length > 0 ? (
                        <div className="space-y-2">
                          {goalsWithProgress
                            .filter(g => g.period === "yearly")
                            .map(goal => (
                              <div key={goal.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {categories.find(c => c.name === goal.category)?.emoji || "📊"}
                                    </span>
                                    <span>{goal.category}</span>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {formatCurrency(goal.targetAmount)}
                                  </div>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(goal.spent)} spent
                                  </span>
                                  <span className={`text-xs ${
                                    goal.isOverBudget 
                                      ? "text-red-600" 
                                      : goal.progress > 85 
                                        ? "text-amber-600" 
                                        : "text-green-600"
                                  }`}>
                                    {goal.progress.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No yearly budgets defined.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-lg font-medium">No Budget Goals</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Create your first budget goal to start tracking your spending limits.
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {budgetGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>
                    How your budget is distributed across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={(entry) => `${entry.emoji} ${entry.name.slice(0, 10)}${entry.name.length > 10 ? '...' : ''}`}
                        >
                          {budgetAllocationData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={chartColors[index % chartColors.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Spending</CardTitle>
                  <CardDescription>
                    How your spending compares to your budgets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Budget Completion (%)"
                          dataKey="completion"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-2 text-lg font-medium">No Budget Goals</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-4">
                  Create your first budget goal to see analytics.
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Budget Goal Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Budget Goal" : "Create Budget Goal"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update your budget goal to adjust your spending limits." 
                : "Set a spending limit for a specific category."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isEditMode ? onEditSubmit : onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter(c => c.type === "expense" || c.type === "both")
                          .map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              <div className="flex items-center gap-2">
                                <span>{category.emoji}</span>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground">₹</span>
                        </div>
                        <Input {...field} placeholder="0.00" className="pl-8" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The maximum amount you want to spend in this category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often this budget resets.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Add notes about this budget goal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleFormClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update Goal" : "Create Goal"}
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
              This will permanently delete this budget goal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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