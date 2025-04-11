import { useEffect, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedTransactionFlow from "@/components/AnimatedTransactionFlow";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { chartColors } from "@/lib/chartConfig";
import {
  Calendar as CalendarIcon,
  LineChart as LineChartIcon,
  BarChart3 as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  DownloadCloud,
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subYears, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";

export default function Analytics() {
  const { transactions } = useFinance();
  const [activeTab, setActiveTab] = useState("spending");
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("bar");
  
  // Calculate date ranges
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  const lastYear = subYears(today, 1);
  
  // Get date range based on selected time range
  const getDateRange = () => {
    switch (timeRange) {
      case "week":
        return {
          start: subDays(today, 7),
          end: today,
        };
      case "month":
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
      case "quarter":
        return {
          start: subMonths(today, 3),
          end: today,
        };
      case "year":
        return {
          start: startOfYear(today),
          end: endOfYear(today),
        };
      default:
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
    }
  };
  
  const dateRange = getDateRange();
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date >= dateRange.start && date <= dateRange.end;
  });
  
  // Group transactions by day or month depending on time range
  const groupedTransactions = () => {
    if (timeRange === "week" || timeRange === "month") {
      // Group by day
      const days = eachDayOfInterval({
        start: dateRange.start,
        end: dateRange.end,
      });
      
      return days.map(day => {
        const dayTransactions = filteredTransactions.filter(t => 
          isSameDay(new Date(t.date), day)
        );
        
        const income = dayTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expense = dayTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
          
        return {
          date: format(day, "dd MMM"),
          income,
          expense,
          balance: income - expense,
        };
      });
    } else {
      // Group by month
      const months = eachMonthOfInterval({
        start: dateRange.start,
        end: dateRange.end,
      });
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthTransactions = filteredTransactions.filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        });
        
        const income = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expense = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
          
        return {
          date: format(month, "MMM yyyy"),
          income,
          expense,
          balance: income - expense,
        };
      });
    }
  };
  
  // Group transactions by category for pie charts
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = acc.find(c => c.name === transaction.category);
      if (category) {
        category.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          emoji: transaction.emoji || '💰',
        });
      }
      return acc;
    }, [] as { name: string; value: number; emoji: string }[])
    .sort((a, b) => b.value - a.value);
    
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((acc, transaction) => {
      const category = acc.find(c => c.name === transaction.category);
      if (category) {
        category.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          emoji: transaction.emoji || '💰',
        });
      }
      return acc;
    }, [] as { name: string; value: number; emoji: string }[])
    .sort((a, b) => b.value - a.value);
    
  // Create data for radar chart (expense categories as percentage of total)
  const totalExpenses = expensesByCategory.reduce((sum, category) => sum + category.value, 0);
  const radarData = expensesByCategory.slice(0, 5).map(category => ({
    category: category.name,
    value: (category.value / totalExpenses) * 100,
    emoji: category.emoji || '💰',
  }));
    
  // Calculate percentage changes from previous periods
  const calculateTrends = () => {
    // For monthly comparison
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    
    const currentMonthIncome = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentMonthExpenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Calculate percentage changes
    const incomeChange = lastMonthIncome === 0 
      ? 100 
      : ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
      
    const expenseChange = lastMonthExpenses === 0 
      ? 0 
      : ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
      
    // For yearly comparison (similar logic)
    const lastYearStart = startOfYear(lastYear);
    const lastYearEnd = endOfYear(lastYear);
    
    const lastYearTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= lastYearStart && date <= lastYearEnd;
    });
    
    const currentYearIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= startOfYear(today) && date <= today && t.type === "income";
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentYearExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= startOfYear(today) && date <= today && t.type === "expense";
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastYearIncome = lastYearTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastYearExpenses = lastYearTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const yearlyIncomeChange = lastYearIncome === 0 
      ? 100 
      : ((currentYearIncome - lastYearIncome) / lastYearIncome) * 100;
      
    const yearlyExpenseChange = lastYearExpenses === 0 
      ? 0 
      : ((currentYearExpenses - lastYearExpenses) / lastYearExpenses) * 100;
    
    return {
      monthly: {
        income: {
          current: currentMonthIncome,
          previous: lastMonthIncome,
          change: incomeChange,
        },
        expense: {
          current: currentMonthExpenses,
          previous: lastMonthExpenses,
          change: expenseChange,
        },
      },
      yearly: {
        income: {
          current: currentYearIncome,
          previous: lastYearIncome,
          change: yearlyIncomeChange,
        },
        expense: {
          current: currentYearExpenses,
          previous: lastYearExpenses,
          change: yearlyExpenseChange,
        },
      },
    };
  };
  
  const trends = calculateTrends();
  
  // Handle chart rendering based on type
  const renderChart = () => {
    const data = groupedTransactions();
    
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill="#4ade80" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="expense" 
                name="Expense" 
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#4ade80" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expense" 
                stroke="#f43f5e" 
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                name="Balance" 
                stroke="#3b82f6" 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-center">Income by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.emoji} ${entry.name.slice(0, 10)}${entry.name.length > 10 ? '...' : ''}`}
                  >
                    {incomeByCategory.map((_, index) => (
                      <Cell 
                        key={`income-cell-${index}`} 
                        fill={chartColors[index % chartColors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-center">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.emoji} ${entry.name.slice(0, 10)}${entry.name.length > 10 ? '...' : ''}`}
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell 
                        key={`expense-cell-${index}`} 
                        fill={chartColors[index % chartColors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "radar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Expense Categories (%)"
                dataKey="value"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.6}
              />
              <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  
  // Export data as CSV
  const exportCSV = () => {
    // Create CSV content
    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type,
      t.category,
      t.amount,
      t.note
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_data_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visualize and analyze your financial data.
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={exportCSV}
          className="flex items-center gap-2"
        >
          <DownloadCloud className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span className="truncate">
                  {timeRange === "week" && "This Week"}
                  {timeRange === "month" && "This Month"}
                  {timeRange === "quarter" && "This Quarter"}
                  {timeRange === "year" && "This Year"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  This Week
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  This Month
                </div>
              </SelectItem>
              <SelectItem value="quarter">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  This Quarter
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  This Year
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <div className="ml-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  {chartType === "bar" && <BarChartIcon className="h-4 w-4 mr-2" />}
                  {chartType === "line" && <LineChartIcon className="h-4 w-4 mr-2" />}
                  {chartType === "pie" && <PieChartIcon className="h-4 w-4 mr-2" />}
                  {chartType === "radar" && <Activity className="h-4 w-4 mr-2" />}
                  <span className="truncate">
                    {chartType === "bar" && "Bar Chart"}
                    {chartType === "line" && "Line Chart"}
                    {chartType === "pie" && "Pie Chart"}
                    {chartType === "radar" && "Radar Chart"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center">
                    <BarChartIcon className="h-4 w-4 mr-2" />
                    Bar Chart
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2" />
                    Line Chart
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Pie Chart
                  </div>
                </SelectItem>
                <SelectItem value="radar">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Radar Chart
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[360px] mb-6">
          <TabsTrigger value="spending">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Spending
          </TabsTrigger>
          <TabsTrigger value="income">
            <TrendingUp className="h-4 w-4 mr-2" />
            Income
          </TabsTrigger>
          <TabsTrigger value="flow">
            <Activity className="h-4 w-4 mr-2" />
            Cash Flow
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="spending" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <CardDescription>
                  {timeRange === "month" ? "This Month" : 
                   timeRange === "week" ? "This Week" : 
                   timeRange === "quarter" ? "This Quarter" : "This Year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(trends.monthly.expense.current)}
                </div>
                <div className={`flex items-center text-sm mt-1 ${trends.monthly.expense.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {trends.monthly.expense.change > 0 ? 
                    `↑ ${trends.monthly.expense.change.toFixed(1)}%` : 
                    `↓ ${Math.abs(trends.monthly.expense.change).toFixed(1)}%`}
                  <span className="text-muted-foreground ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Biggest Expense
                </CardTitle>
                <CardDescription>
                  Category with highest spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expensesByCategory.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{expensesByCategory[0].emoji}</span>
                      <div>
                        <div className="font-bold">{expensesByCategory[0].name}</div>
                        <div className="text-muted-foreground text-sm">
                          {((expensesByCategory[0].value / totalExpenses) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {formatCurrency(expensesByCategory[0].value)}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No expense data</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Expense Breakdown
                </CardTitle>
                <CardDescription>
                  Top spending categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {expensesByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {expensesByCategory.slice(0, 3).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span className="font-medium truncate" style={{ maxWidth: '120px' }}>
                            {category.name}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">
                            {formatCurrency(category.value)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((category.value / totalExpenses) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No expense data</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>
                  Visualize your spending patterns
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                renderChart()
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transaction data for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Income
                </CardTitle>
                <CardDescription>
                  {timeRange === "month" ? "This Month" : 
                  timeRange === "week" ? "This Week" : 
                  timeRange === "quarter" ? "This Quarter" : "This Year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(trends.monthly.income.current)}
                </div>
                <div className={`flex items-center text-sm mt-1 ${trends.monthly.income.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trends.monthly.income.change > 0 ? 
                    `↑ ${trends.monthly.income.change.toFixed(1)}%` : 
                    `↓ ${Math.abs(trends.monthly.income.change).toFixed(1)}%`}
                  <span className="text-muted-foreground ml-1">from last {timeRange}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Income Source
                </CardTitle>
                <CardDescription>
                  Category with highest income
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeByCategory.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{incomeByCategory[0].emoji}</span>
                      <div>
                        <div className="font-bold">{incomeByCategory[0].name}</div>
                        <div className="text-muted-foreground text-sm">
                          {((incomeByCategory[0].value / trends.monthly.income.current) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {formatCurrency(incomeByCategory[0].value)}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No income data</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Income Sources
                </CardTitle>
                <CardDescription>
                  Top income categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {incomeByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {incomeByCategory.slice(0, 3).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span className="font-medium truncate" style={{ maxWidth: '120px' }}>
                            {category.name}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">
                            {formatCurrency(category.value)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((category.value / trends.monthly.income.current) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No income data</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>
                  Visualize your income patterns
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                renderChart()
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transaction data for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="flow" className="space-y-6 m-0">
          <AnimatedTransactionFlow />
          
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Income vs Expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                renderChart()
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transaction data for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}