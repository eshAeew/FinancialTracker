import { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import FilterBar from "@/components/FilterBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Download, Filter, MoreHorizontal, Plus, Trash, Calendar } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    deleteTransaction, 
    getFilteredTransactions, 
    activeFilter, 
    setActiveFilter 
  } = useFinance();
  const { currencySettings } = useCurrency();
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  
  // Get filtered transactions from FinanceContext
  const [contextFilteredTransactions, setContextFilteredTransactions] = useState<any[]>([]);
  
  // Update filtered transactions when active filter changes
  useEffect(() => {
    console.log("Transactions: Using filter from context:", activeFilter);
    const filtered = getFilteredTransactions(activeFilter);
    // Apply additional local filters (search, type)
    const localFiltered = filtered.filter(transaction => {
      // Search filter
      const matchesSearch = search === "" || 
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        (transaction.note && transaction.note.toLowerCase().includes(search.toLowerCase()));
        
      // Type filter (not in global filter)
      const matchesType = typeFilter === "" || 
        transaction.type === typeFilter;
        
      return matchesSearch && matchesType;
    });
    
    // Sort by date (newest first)
    const sortedTransactions = localFiltered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setContextFilteredTransactions(sortedTransactions);
  }, [activeFilter, getFilteredTransactions, search, typeFilter]);
  
  // Use the filtered transactions from context
  const filteredTransactions = contextFilteredTransactions;
  
  // Get all unique categories from transactions
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];
  
  // Calculate totals based on filtered transactions
  const incomeTotal = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenseTotal = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = incomeTotal - expenseTotal;
  
  // Export filtered transactions as CSV
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
    link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle transaction deletion
  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteTransaction(id);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setTypeFilter("");
    setDateRange(undefined);
    // Also reset context filters using the correct values
    setActiveFilter({
      category: "All Categories",
      dateRange: "last30Days"
    });
    console.log("Reset filters to default values");
  };
  
  // Update global filter when changing the date range
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      // When date range picker is used, update the global filter with custom range
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      
      console.log("Transactions: Setting custom date range:", startDate, "to", endDate);
      
      const updatedFilter = {
        ...activeFilter,
        dateRange: "Custom range",
        startDate,
        endDate
      };
      
      console.log("Transactions: Setting custom filter:", updatedFilter);
      setActiveFilter(updatedFilter);
    }
  }, [dateRange, setActiveFilter]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
          <p className="text-muted-foreground">
            {t('transactions.subtitle')}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('transactions.new')}
        </Button>
      </div>
      
      <FilterBar
        pageTitle={t('transactions.filters')}
        pageDescription={t('transactions.filterDescription')}
        showSearch={true}
        showTypeFilter={true}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('transactions.totalIncome')}
            </CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, "PP")} ${t('common.to')} ${format(dateRange.to, "PP")}`
                : t('transactions.allTime')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                incomeTotal,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "income").length} {t('common.transactions')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('transactions.totalExpenses')}
            </CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, "PP")} ${t('common.to')} ${format(dateRange.to, "PP")}`
                : t('transactions.allTime')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                expenseTotal,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "expense").length} {t('common.transactions')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('transactions.balance')}
            </CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, "PP")} ${t('common.to')} ${format(dateRange.to, "PP")}`
                : t('transactions.allTime')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatCurrency(
                balance,
                currencySettings.defaultCurrency,
                currencySettings.locale,
                currencySettings.currencyPosition
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.length} {t('common.totalTransactions')}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
          <div>
            <CardTitle>{t('transactions.history')}</CardTitle>
            <CardDescription>
              {t('transactions.description')}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('transactions.date')}</TableHead>
                  <TableHead>{t('transactions.category')}</TableHead>
                  <TableHead>{t('transactions.type')}</TableHead>
                  <TableHead>{t('transactions.amount')}</TableHead>
                  <TableHead>{t('transactions.note')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(transaction.date), "PP")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{transaction.emoji}</span>
                          <span>{transaction.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "success" : "destructive"}>
                          {transaction.type === "income" ? t('transactions.income') : t('transactions.expense')}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(
                          transaction.amount,
                          currencySettings.defaultCurrency,
                          currencySettings.locale,
                          currencySettings.currencyPosition
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.note || "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t('transactions.noTransactionsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{t('transactions.new')}</DialogTitle>
            <DialogDescription>
              {t('transactions.formDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <TransactionForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}