import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useFinance } from "@/context/FinanceContext";
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
    <Card className="border border-neutral-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Select
              value={activeFilter.category}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.emoji} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={activeFilter.dateRange}
              onValueChange={handleDateRangeFilterChange}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Last month">Last month</SelectItem>
                <SelectItem value="Last 3 months">Last 3 months</SelectItem>
                <SelectItem value="This year">This year</SelectItem>
                <SelectItem value="Custom range">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {currentTransactions.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm bg-neutral-50">
                  <th className="py-3 px-4 font-medium text-neutral-500 rounded-tl-md">Category</th>
                  <th className="py-3 px-4 font-medium text-neutral-500">Date</th>
                  <th className="py-3 px-4 font-medium text-neutral-500">Note</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-right rounded-tr-md">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                        }`}>
                          <span>{transaction.emoji}</span>
                        </div>
                        <span>{transaction.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{formatDate(transaction.date)}</td>
                    <td className="py-3 px-4 text-neutral-500">{transaction.note}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-400 hover:text-destructive"
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
            <div className="py-12 text-center text-neutral-500">
              No transactions found. Add a transaction to get started.
            </div>
          )}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-neutral-500">
            <div>
              Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
                // Logic to show first page, current page and last page
                let pageNumber = currentPage;
                if (totalPages <= 3) {
                  pageNumber = index + 1;
                } else if (index === 0) {
                  pageNumber = 1;
                } else if (index === 1) {
                  pageNumber = currentPage;
                } else if (index === 2) {
                  pageNumber = totalPages;
                }
                
                return (
                  <Button
                    key={index}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => paginate(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
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
