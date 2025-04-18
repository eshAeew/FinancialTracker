import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isEqual } from "date-fns";
import { AlertTriangle, ArrowDown, ArrowUp, BadgeInfo, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FinancialHealthSnapshot() {
  const { 
    transactions,
    totalIncome, 
    totalExpenses, 
    totalBalance,
    budgetGoals
  } = useFinance();
  const { currencySettings } = useCurrency();
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  // Determine financial health score (0-100)
  let financialHealthScore = 0;
  
  // Factor 1: Savings rate (40% of score)
  const savingsRateScore = Math.min(savingsRate * 2, 40); // Max 40 points
  
  // Factor 2: Budget adherence (30% of score)
  let budgetAdherenceScore = 30;
  if (budgetGoals.length > 0) {
    const goalsWithProgress = budgetGoals.map(goal => {
      const categoryExpenses = transactions
        .filter(t => t.type === "expense" && t.category === goal.category)
        .reduce((sum, t) => sum + t.amount, 0);
      // Use limit as targetAmount if targetAmount is not available
      const targetAmount = goal.targetAmount || goal.limit;
      const progress = targetAmount > 0 ? (categoryExpenses / targetAmount) * 100 : 0;
      return { ...goal, progress };
    });
    
    // Reduce score if over budget
    const overBudgetGoals = goalsWithProgress.filter(g => g.progress > 100);
    budgetAdherenceScore = Math.max(30 - (overBudgetGoals.length * 10), 0);
  }
  
  // Factor 3: Transaction consistency (30% of score)
  let transactionConsistencyScore = 0;
  if (transactions.length > 0) {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Check consistency over last 30 days
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
    
    const transactionDays = new Set(
      sortedTransactions
        .filter(t => last30Days.includes(t.date))
        .map(t => t.date)
    );
    
    transactionConsistencyScore = Math.min(Math.floor((transactionDays.size / 30) * 30), 30);
  }
  
  // Calculate overall score
  financialHealthScore = Math.round(savingsRateScore + budgetAdherenceScore + transactionConsistencyScore);
  
  // Determine health status
  let healthStatus = "Poor";
  let healthColor = "text-destructive";
  let healthBgColor = "bg-destructive/10";
  
  if (financialHealthScore >= 80) {
    healthStatus = "Excellent";
    healthColor = "text-green-600";
    healthBgColor = "bg-green-50";
  } else if (financialHealthScore >= 60) {
    healthStatus = "Good";
    healthColor = "text-blue-600";
    healthBgColor = "bg-blue-50";
  } else if (financialHealthScore >= 40) {
    healthStatus = "Fair";
    healthColor = "text-amber-600";
    healthBgColor = "bg-amber-50";
  }
  
  // Generate spending trend data for current month
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  
  const daysInMonth = eachDayOfInterval({
    start: currentMonthStart,
    end: currentMonthEnd
  });
  
  const spendingTrendData = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date === dayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    const dayIncome = transactions
      .filter(t => t.type === 'income' && t.date === dayStr)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: format(day, 'dd MMM'),
      expenses: dayExpenses,
      income: dayIncome
    };
  });
  
  // Calculate month-over-month change (mock data for now, would use real previous month data)
  const incomeMoMChange = 5.2 as number; // 5.2% increase from previous month
  const expensesMoMChange = -2.1 as number; // 2.1% decrease from previous month
  
  // Financial insights
  const insights = [
    savingsRate < 20 ? 
      "Your savings rate is below 20%. Try to increase income or reduce expenses." : 
      "Your savings rate is healthy, keep it up!",
    totalExpenses > totalIncome ? 
      "You're spending more than you earn. Review your budget to find areas to cut back." : 
      "You're keeping expenses below income, which is excellent financial discipline.",
    transactions.filter(t => t.type === "expense").length === 0 ? 
      "Start tracking your expenses to gain better insights into your spending habits." : 
      "Regular expense tracking is helping you maintain financial awareness.",
  ].filter(Boolean);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Financial Health</h2>
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-3xl font-bold", healthColor)}>{financialHealthScore}</span>
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                  <p className={cn("font-medium", healthColor)}>{healthStatus}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", healthBgColor)}>
                  {financialHealthScore >= 60 ? 
                    <TrendingUp className={healthColor} size={24} /> : 
                    <TrendingDown className={healthColor} size={24} />
                  }
                </div>
              </div>
              <Progress value={financialHealthScore} className="h-2 mt-2" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-muted-foreground">Savings Rate</span>
                  <span className={cn(
                    "text-xs font-medium rounded-full px-2 py-0.5", 
                    savingsRate >= 20 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(savingsRate * 2, 100)} className="h-1 mt-1" />
              </div>
              
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-muted-foreground">Budget Adherence</span>
                  <span className={cn(
                    "text-xs font-medium rounded-full px-2 py-0.5", 
                    budgetAdherenceScore >= 20 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {(budgetAdherenceScore / 0.3).toFixed(1)}%
                  </span>
                </div>
                <Progress value={budgetAdherenceScore / 0.3} className="h-1 mt-1" />
              </div>
              
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-muted-foreground">Consistency</span>
                  <span className={cn(
                    "text-xs font-medium rounded-full px-2 py-0.5", 
                    transactionConsistencyScore >= 20 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {(transactionConsistencyScore / 0.3).toFixed(1)}%
                  </span>
                </div>
                <Progress value={transactionConsistencyScore / 0.3} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">{formatCurrency(
                    totalIncome,
                    currencySettings.defaultCurrency,
                    currencySettings.locale,
                    currencySettings.currencyPosition
                  )}</span>
                  {incomeMoMChange !== 0 && (
                    <div className={cn(
                      "flex items-center ml-2 text-xs",
                      incomeMoMChange > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {incomeMoMChange > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      <span>{Math.abs(incomeMoMChange)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">{formatCurrency(
                    totalExpenses,
                    currencySettings.defaultCurrency,
                    currencySettings.locale,
                    currencySettings.currencyPosition
                  )}</span>
                  {expensesMoMChange !== 0 && (
                    <div className={cn(
                      "flex items-center ml-2 text-xs",
                      expensesMoMChange < 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {expensesMoMChange < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                      <span>{Math.abs(expensesMoMChange)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <div className="flex items-center mt-1">
                  <span className={cn(
                    "text-2xl font-bold",
                    totalBalance > 0 ? "text-green-600" : totalBalance < 0 ? "text-red-600" : ""
                  )}>
                    {formatCurrency(
                      totalBalance,
                      currencySettings.defaultCurrency,
                      currencySettings.locale,
                      currencySettings.currencyPosition
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Key Insights</h3>
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {insight.includes("below") || insight.includes("more than") ? (
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    ) : (
                      <BadgeInfo size={16} className="mt-0.5 shrink-0 text-blue-500" />
                    )}
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Monthly Cash Flow</h2>
          
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#4ade80" 
                      activeDot={{ r: 8 }} 
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#f43f5e" 
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Income Breakdown</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {transactions
                        .filter(t => t.type === 'income')
                        .reduce((acc, t) => {
                          const category = acc.find(c => c.name === t.category);
                          if (category) {
                            category.amount += t.amount;
                          } else {
                            acc.push({ name: t.category, amount: t.amount, emoji: t.emoji || "💰" });
                          }
                          return acc;
                        }, [] as { name: string; amount: number; emoji: string }[])
                        .sort((a, b) => b.amount - a.amount)
                        .map((category, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{category.emoji}</span>
                              <span>{category.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(category.amount)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Expense Breakdown</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, t) => {
                          const category = acc.find(c => c.name === t.category);
                          if (category) {
                            category.amount += t.amount;
                          } else {
                            acc.push({ name: t.category, amount: t.amount, emoji: t.emoji || "💸" });
                          }
                          return acc;
                        }, [] as { name: string; amount: number; emoji: string }[])
                        .sort((a, b) => b.amount - a.amount)
                        .map((category, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{category.emoji}</span>
                              <span>{category.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(category.amount)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Savings Opportunities</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Based on your spending patterns, here are some areas where you might be able to save:
                      </p>
                      
                      {transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, t) => {
                          const category = acc.find(c => c.name === t.category);
                          if (category) {
                            category.amount += t.amount;
                            category.count += 1;
                          } else {
                            acc.push({ 
                              name: t.category, 
                              amount: t.amount, 
                              emoji: t.emoji || '📊',
                              count: 1
                            });
                          }
                          return acc;
                        }, [] as { name: string; amount: number; emoji: string; count: number }[])
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 3)
                        .map((category, i) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{category.emoji}</span>
                                <span className="font-medium">{category.name}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              This is your #{i+1} highest expense category with {category.count} transactions.
                              {i === 0 ? " Consider reviewing these expenses for potential savings." : ""}
                            </p>
                          </div>
                        ))
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}