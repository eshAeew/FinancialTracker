import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tag, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useFinance } from "@/context/FinanceContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Transaction } from "@shared/schema";
import { format, subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function TransactionHistory() {
  const { 
    categories, 
    getFilteredTransactions, 
    deleteTransaction, 
    activeFilter, 
    setActiveFilter 
  } = useFinance();
  const { currencySettings } = useCurrency();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const filtered = getFilteredTransactions(activeFilter);
    setTransactions(filtered);
    setCurrentPage(1);
  }, [activeFilter, getFilteredTransactions]);

  const handleCategoryFilterChange = (category: string) => {
    setActiveFilter({
      ...activeFilter,
      category
    });
  };

  const handleDateRangeFilterChange = (dateRange: string) => {
    if (dateRange === "Custom range") {
      setIsCustomDateOpen(true);
      return;
    }
    
    setActiveFilter({
      ...activeFilter,
      dateRange
    });
  };

  const handleCustomDateConfirm = () => {
    if (customDateRange.from && customDateRange.to) {
      setActiveFilter({
        ...activeFilter,
        dateRange: "Custom range",
        startDate: format(customDateRange.from, "yyyy-MM-dd"),
        endDate: format(customDateRange.to, "yyyy-MM-dd")
      });
      setIsCustomDateOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setIsDeleteDialogOpen(false);
    }
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <Card className="overflow-hidden shadow-md border-opacity-50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-background">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6 py-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 tracking-tight">Transaction History</h2>
          <div className="flex items-center gap-3">
            <Select
              value={activeFilter.category}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors duration-200">
                <Tag className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="max-h-[320px] overflow-y-auto">
                <SelectItem value="All Categories" className="font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="text-primary">📋</span>
                    <span>All Categories</span>
                  </span>
                </SelectItem>
                <Separator className="my-1" />
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-green-500 dark:text-green-400 px-2 py-1.5 bg-green-50/50 dark:bg-green-900/20 rounded">
                    Income Categories
                  </SelectLabel>
                  {categories
                    .filter(cat => cat.type === 'income' || cat.type === 'both')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name} className="hover:bg-green-50/50 dark:hover:bg-green-900/20 focus:bg-green-50/70 dark:focus:bg-green-900/30">
                        <span className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))
                  }
                </SelectGroup>
                <Separator className="my-1" />
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-red-500 dark:text-red-400 px-2 py-1.5 bg-red-50/50 dark:bg-red-900/20 rounded">
                    Expense Categories
                  </SelectLabel>
                  {categories
                    .filter(cat => cat.type === 'expense' || cat.type === 'both')
                    .map((category) => (
                      <SelectItem key={category.id} value={category.name} className="hover:bg-red-50/50 dark:hover:bg-red-900/20 focus:bg-red-50/70 dark:focus:bg-red-900/30">
                        <span className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select
              value={activeFilter.dateRange}
              onValueChange={handleDateRangeFilterChange}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors duration-200">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="last30Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30Days" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>Last 30 days</span>
                  </span>
                </SelectItem>
                <SelectItem value="thisMonth" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">📆</span>
                    <span>This month</span>
                  </span>
                </SelectItem>
                <SelectItem value="lastMonth" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">🗓️</span>
                    <span>Last month</span>
                  </span>
                </SelectItem>
                <SelectItem value="last3Months" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">📊</span>
                    <span>Last 3 months</span>
                  </span>
                </SelectItem>
                <SelectItem value="thisYear" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">📈</span>
                    <span>This year</span>
                  </span>
                </SelectItem>
                <SelectItem value="Custom range" className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">📝</span>
                    <span>Custom range</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-muted/20">
          {currentTransactions.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm bg-muted/30">
                  <th className="py-3.5 px-4 font-medium text-muted-foreground rounded-tl-md">Category</th>
                  <th className="py-3.5 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="py-3.5 px-4 font-medium text-muted-foreground">Note</th>
                  <th className="py-3.5 px-4 font-medium text-muted-foreground text-right">Amount</th>
                  <th className="py-3.5 px-4 font-medium text-muted-foreground text-right rounded-tr-md">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {currentTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className={`transition-colors duration-200 hover:bg-muted/10 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                          transaction.type === "income" 
                            ? "bg-gradient-to-br from-green-50 to-green-100 text-green-600 dark:from-green-950/40 dark:to-green-900/30 dark:text-green-400" 
                            : "bg-gradient-to-br from-red-50 to-red-100 text-red-600 dark:from-red-950/40 dark:to-red-900/30 dark:text-red-400"
                        }`}>
                          <span className="text-lg">{transaction.emoji}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.category}</span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.type === "income" ? "Income" : "Expense"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{formatDate(transaction.date)}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {transaction.note ? transaction.note : <span className="text-muted-foreground/50 text-sm italic">No note</span>}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-medium ${
                      transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      <span className="text-sm mr-1">{transaction.type === "income" ? "+" : "-"}</span>
                      {formatCurrency(
                        transaction.amount, 
                        currencySettings.defaultCurrency,
                        currencySettings.locale,
                        currencySettings.currencyPosition
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                        onClick={() => confirmDelete(transaction.id!)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex flex-col items-center gap-2 p-6 rounded-lg bg-muted/5 border border-dashed border-muted/20">
                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground">
                  <i className="ri-file-list-3-line text-xl"></i>
                </div>
                <h3 className="text-lg font-medium">No transactions found</h3>
                <p className="text-sm text-muted-foreground">Add a transaction to get started tracking your finances.</p>
              </div>
            </div>
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="p-2 px-3 rounded-md bg-muted/10 border border-muted/20">
              <span className="flex items-center gap-1.5">
                <i className="ri-file-list-line text-primary"></i>
                Showing <strong className="text-foreground">{indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)}</strong> of <strong className="text-foreground">{transactions.length}</strong> transactions
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-muted/10 p-1 rounded-lg border border-muted/20">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors duration-200"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="ri-arrow-left-s-line"></i>
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                // Logic to show pagination numbers
                let pageNumber;
                
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all page numbers
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  // If on pages 1-3, show pages 1-5
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If on last 3 pages, show last 5 pages
                  pageNumber = totalPages - 4 + index;
                } else {
                  // Otherwise show current page and 2 pages before/after
                  pageNumber = currentPage - 2 + index;
                }
                
                // Skip rendering if we have too many pages
                if (totalPages > 5 && ((currentPage > 3 && index === 0) || (currentPage < totalPages - 2 && index === 4))) {
                  return (
                    <span key={index} className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                      …
                    </span>
                  );
                }
                
                return (
                  <Button
                    key={index}
                    variant={currentPage === pageNumber ? "default" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 rounded-md ${
                      currentPage === pageNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted/30'
                    } transition-colors duration-200`}
                    onClick={() => paginate(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors duration-200"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this transaction? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Custom Date Range Dialog */}
        <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Date Range</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Calendar
                mode="range"
                selected={customDateRange}
                onSelect={setCustomDateRange as any}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCustomDateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomDateConfirm}>
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
