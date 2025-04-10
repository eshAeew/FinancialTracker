import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/context/FinanceContext";
import { Transaction } from "@shared/schema";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

const CHART_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#ef4444', '#a855f7', '#f59e0b'];

export default function AnalyticsPanel() {
  const { transactions, categories, getFilteredTransactions, activeFilter } = useFinance();
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendRange, setTrendRange] = useState("Last 30 days");

  // Process expenses by category for pie chart
  useEffect(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by category and calculate total amount
    const categoryTotals = expenses.reduce((acc, curr) => {
      const categoryName = curr.category;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          value: 0,
          emoji: curr.emoji
        };
      }
      acc[categoryName].value += curr.amount;
      return acc;
    }, {} as Record<string, { name: string, value: number, emoji: string }>);
    
    // Convert to array and calculate percentages
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const chartData = Object.values(categoryTotals).map(cat => ({
      ...cat,
      percentage: totalExpense ? Math.round((cat.value / totalExpense) * 100) : 0
    }));
    
    // Sort by value (highest first)
    chartData.sort((a, b) => b.value - a.value);
    
    setExpensesByCategory(chartData);
  }, [transactions]);

  // Process trend data for bar chart
  useEffect(() => {
    let filteredTransactions = getFilteredTransactions({
      ...activeFilter,
      dateRange: trendRange
    });
    
    const today = new Date();
    let interval: Date[] = [];
    let format_pattern = "";
    
    // Define date intervals based on selected range
    switch (trendRange) {
      case "Last 30 days":
        // Create weekly intervals for the last 30 days
        interval = eachWeekOfInterval({
          start: subDays(today, 30),
          end: today
        });
        format_pattern = "MMM d";
        break;
      case "This month":
        // Create daily intervals for current month
        interval = eachDayOfInterval({
          start: startOfMonth(today),
          end: today
        });
        // Group by week for readability
        interval = eachWeekOfInterval({
          start: startOfMonth(today),
          end: today
        });
        format_pattern = "MMM d";
        break;
      case "Last 3 months":
        // Create monthly intervals
        interval = eachMonthOfInterval({
          start: subDays(today, 90),
          end: today
        });
        format_pattern = "MMM";
        break;
      case "Last 6 months":
        interval = eachMonthOfInterval({
          start: subDays(today, 180),
          end: today
        });
        format_pattern = "MMM";
        break;
      case "This year":
        interval = eachMonthOfInterval({
          start: new Date(today.getFullYear(), 0, 1),
          end: today
        });
        format_pattern = "MMM";
        break;
      default:
        interval = eachWeekOfInterval({
          start: subDays(today, 30),
          end: today
        });
        format_pattern = "MMM d";
    }
    
    // Create trend data
    const data = interval.map((date, index) => {
      let endDate: Date;
      
      if (index < interval.length - 1) {
        endDate = new Date(interval[index + 1]);
        endDate.setDate(endDate.getDate() - 1);
      } else {
        endDate = today;
      }
      
      const periodTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= date && transactionDate <= endDate;
      });
      
      const income = periodTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = periodTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: format(date, format_pattern),
        income,
        expense
      };
    });
    
    setTrendData(data);
  }, [trendRange, transactions, getFilteredTransactions, activeFilter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 shadow-sm rounded-md">
          <p className="font-medium text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Category Distribution */}
      <Card className="border border-neutral-100">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Expense by Category</h2>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {expensesByCategory.slice(0, 6).map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-sm">
                  {entry.emoji} {entry.name} ({entry.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Trend */}
      <Card className="border border-neutral-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Monthly Trend</h2>
            <Select value={trendRange} onValueChange={setTrendRange}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                <SelectItem value="Last 6 months">Last 6 months</SelectItem>
                <SelectItem value="This year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `₹${(value / 1000).toFixed(0)}k`;
                    }
                    return `₹${value}`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  align="right" 
                  verticalAlign="top" 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: '10px' }}
                />
                <Bar name="Income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Expenses" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
