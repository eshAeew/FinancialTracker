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
import { BadgeDollarSign, Wallet, TrendingUp, Banknote, Receipt, CreditCard, BarChart, PieChart as PieChartIcon } from "lucide-react";
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
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { transactions, categories, totalIncome, totalExpenses, totalBalance } = useFinance();
  const { currencySettings } = useCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const { dashboardLayout, animations, compactMode } = useLayoutPreferences();
  const { t } = useTranslation();

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
      title: t('dashboard.totalBalance'),
      value: formatCurrency(
        totalBalance,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: t('dashboard.currentBalance'),
      icon: <Wallet className="h-5 w-5" />,
      color: totalBalance >= 0 ? "text-green-500" : "text-red-500",
      type: "balance"
    },
    {
      title: t('dashboard.income'),
      value: formatCurrency(
        totalIncome,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: t('transactions.income'),
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-500",
      type: "income"
    },
    {
      title: t('dashboard.expenses'),
      value: formatCurrency(
        totalExpenses,
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: t('transactions.expense'),
      icon: <BadgeDollarSign className="h-5 w-5" />,
      color: "text-red-500",
      type: "expense"
    },
    {
      title: t('dashboard.savings'),
      value: formatCurrency(
        Math.max(0, totalIncome - totalExpenses),
        currencySettings.defaultCurrency,
        currencySettings.locale,
        currencySettings.currencyPosition
      ),
      description: t('dashboard.totalSavings'),
      icon: <Banknote className="h-5 w-5" />,
      color: "text-blue-500",
      type: "savings"
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
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.welcomeBack')} {t('dashboard.summary')}
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {t('dashboard.quickAdd')}
          </Button>
        </div>

        <Tabs 
          value={dashboardTab} 
          onValueChange={setDashboardTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
            <TabsTrigger value="health">{t('dashboard.financialInsights')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="dashboard-grid">
              {animatedStats.map((stat, i) => (
                <Card 
                  key={i} 
                  className="dashboard-card overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100/10"
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 dashboard-card-header">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <div className={`${stat.color} mr-2 bg-opacity-10 p-1.5 rounded-full`}>
                        {stat.icon}
                      </div>
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} text-xs font-medium px-2 py-1 rounded-full bg-opacity-10`}>
                      {stat.type === "income" ? "+12%" : stat.type === "expense" ? "-8%" : stat.type === "savings" ? "+5%" : "10%"}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 dashboard-card-content">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {getFormattedAnimatedValue(stat.animatedValue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="dashboard-grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
              <Card className="dashboard-card dashboard-primary-content shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 dashboard-card-header">
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                    {t('analytics.categoryBreakdown')}
                  </CardTitle>
                  <CardDescription>
                    {t('analytics.spendingTrends')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  {expenseByCategory.length > 0 ? (
                    <div className="h-[300px] lg:h-[350px] xl:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
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
                    <div className="h-[300px] lg:h-[350px] xl:h-[400px] flex flex-col items-center justify-center">
                      <BarChart className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                      <p className="text-center text-muted-foreground mb-2">{t('common.noData')}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsDialogOpen(true)}
                        className="mt-2"
                      >
                        {t('common.add')} {t('transactions.title')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="dashboard-card dashboard-primary-content shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 dashboard-card-header">
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-primary" />
                    {t('dashboard.recentTransactions')}
                  </CardTitle>
                  <CardDescription>
                    {t('transactions.title')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      <div className="max-h-[350px] overflow-y-auto pr-1">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center gap-4 p-2 rounded-lg mb-2 hover:bg-primary/5 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg">{transaction.emoji || "💰"}</span>
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Receipt className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                        <h3 className="mt-4 text-sm font-medium">{t('common.noData')}</h3>
                        <p className="mt-2 text-xs text-muted-foreground dashboard-secondary-content">
                          {t('transactions.new')}
                        </p>
                        <Button 
                          className="mt-4" 
                          variant="outline"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          {t('common.add')} {t('transactions.title')}
                        </Button>
                      </div>
                    )}
                    
                    {recentTransactions.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full dashboard-secondary-content mt-4"
                        onClick={() => window.location.href = '/transactions'}
                      >
                        {t('dashboard.viewAll')}
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
            <DialogTitle>{t('transactions.new')}</DialogTitle>
            <DialogDescription>
              {t('transactions.title')}
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