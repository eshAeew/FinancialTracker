import { useEffect, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import FinancialHealthSnapshot from "@/components/FinancialHealthSnapshot";
import TransactionForm from "@/components/TransactionForm";
import TransactionHistory from "@/components/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { chartColors } from "@/lib/chartConfig";
import { BadgeDollarSign, Wallet, TrendingUp, Banknote, Receipt, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLayoutPreferences } from "@/hooks/useLayoutPreferences";

export default function Dashboard() {
  const { transactions, categories, totalIncome, totalExpenses, totalBalance } = useFinance();
  const { currencySettings } = useCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const { dashboardLayout, animations, compactMode } = useLayoutPreferences();

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Prepare data for expense breakdown chart
  const expenseByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = acc.find(c => c.name === transaction.category);
      if (category) {
        category.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          emoji: transaction.emoji || "💰", // Provide a default emoji if none exists
        });
      }
      return acc;
    }, [] as { name: string; value: number; emoji: string }[])
    .sort((a, b) => b.value - a.value);
  
  // Stats cards data
  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(
        totalBalance,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: "Current balance",
      icon: <Wallet className="h-5 w-5" />,
      color: totalBalance >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Income",
      value: formatCurrency(
        totalIncome,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: "Total income",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      title: "Expenses",
      value: formatCurrency(
        totalExpenses,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: "Total expenses",
      icon: <BadgeDollarSign className="h-5 w-5" />,
      color: "text-red-500"
    },
    {
      title: "Savings",
      value: formatCurrency(
        Math.max(0, totalIncome - totalExpenses),
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: "Total savings",
      icon: <Banknote className="h-5 w-5" />,
      color: "text-blue-500"
    },
  ];

  // Animation for numbers
  const [animatedStats, setAnimatedStats] = useState(stats.map(stat => ({
    ...stat,
    animatedValue: 0
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => {
        return prev.map((stat, index) => {
          const targetValue = parseFloat(stats[index].value.replace(/[₹,]/g, ''));
          const difference = targetValue - stat.animatedValue;
          
          // If we're close enough, just set to the final value
          if (Math.abs(difference) < targetValue * 0.05) {
            return {
              ...stat,
              animatedValue: targetValue
            };
          }
          
          // Otherwise animate smoothly
          return {
            ...stat,
            animatedValue: stat.animatedValue + difference * 0.1
          };
        });
      });
    }, 50);

    // Cleanup
    return () => clearInterval(interval);
  }, [totalIncome, totalExpenses, totalBalance]);

  // Format animated values
  const getFormattedAnimatedValue = (value: number) => {
    return formatCurrency(
      value,
      currencySettings.defaultCurrency,
      currencySettings.locale,
      currencySettings.currencyPosition
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your finances.
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <Tabs 
          value={dashboardTab} 
          onValueChange={setDashboardTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Financial Health</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="dashboard-grid">
              {animatedStats.map((stat, i) => (
                <Card key={i} className="dashboard-card overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 dashboard-card-header">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} bg-opacity-10 p-2 rounded-full`}>
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 dashboard-card-content">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {getFormattedAnimatedValue(stat.animatedValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="dashboard-grid">
              <Card className="dashboard-card dashboard-primary-content">
                <CardHeader className="pb-2 dashboard-card-header">
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    How your money is being spent
                  </CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  {expenseByCategory.length > 0 ? (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.emoji} ${entry.name}`}
                          >
                            {expenseByCategory.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={chartColors[index % chartColors.length]} 
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => formatCurrency(
                              value,
                              currencySettings.defaultCurrency,
                              currencySettings.locale,
                              currencySettings.currencyPosition
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">No expense data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="dashboard-card dashboard-primary-content">
                <CardHeader className="pb-2 dashboard-card-header">
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest financial activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-base">{transaction.emoji || "💰"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{transaction.category}</p>
                            <p className="text-xs text-muted-foreground truncate dashboard-secondary-content">
                              {transaction.note || transaction.date}
                            </p>
                          </div>
                          <div className={`text-sm font-medium ${
                            transaction.type === "income" ? "text-green-500" : "text-red-500"
                          }`}>
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(
                              transaction.amount,
                              currencySettings.defaultCurrency,
                              currencySettings.locale,
                              currencySettings.currencyPosition
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <h3 className="mt-2 text-sm font-medium">No transactions yet</h3>
                        <p className="mt-1 text-xs text-muted-foreground dashboard-secondary-content">
                          Add your first transaction to start tracking your finances.
                        </p>
                        <Button 
                          className="mt-4" 
                          variant="outline"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Add Transaction
                        </Button>
                      </div>
                    )}
                    
                    {recentTransactions.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full dashboard-secondary-content"
                        onClick={() => window.location.href = '/transactions'}
                      >
                        View All Transactions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="health">
            <FinancialHealthSnapshot />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Record your income or expenses to keep track of your finances.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <TransactionForm />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}