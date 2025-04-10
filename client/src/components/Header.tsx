import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFinance } from "@/context/FinanceContext";
import { Transaction } from "@shared/schema";

export default function Header() {
  const { transactions } = useFinance();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const exportToCSV = () => {
    // Convert transactions to CSV format
    const headers = ["Type", "Category", "Amount", "Date", "Note"];
    const csvData = transactions.map((t: Transaction) => [
      t.type,
      t.category,
      t.amount.toString(),
      t.date,
      t.note || ""
    ]);
    
    // Add headers
    csvData.unshift(headers);
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportDialogOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="ri-funds-line text-2xl text-primary"></i>
          <h1 className="text-xl font-semibold">Finance Tracker</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" title="Toggle Theme">
            <i className="ri-moon-line text-lg"></i>
          </Button>
          
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Export Data">
                <i className="ri-download-line text-lg"></i>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Transactions</DialogTitle>
                <DialogDescription>
                  Export your transaction data to a CSV file for backup or analysis in spreadsheet software.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
                <Button onClick={exportToCSV}>Export to CSV</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* "Add Transaction" handled in the form component below */}
        </div>
      </div>
    </header>
  );
}
