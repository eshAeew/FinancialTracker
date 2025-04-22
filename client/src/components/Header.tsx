import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFinance } from "@/context/FinanceContext";
import { Transaction } from "@shared/schema";
import { ExternalLink, CheckSquare } from "lucide-react";

// Import Remixicon CSS
import "remixicon/fonts/remixicon.css";

export default function Header() {
  const { transactions } = useFinance();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Create a pulse effect every 10 seconds to draw attention to the TaskManager button
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 2000);
    }, 10000);
    
    // Initial pulse after 3 seconds
    const initialTimeout = setTimeout(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 2000);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

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
    <header className="bg-background shadow-sm sticky top-0 z-10 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <i className="ri-funds-line text-2xl text-primary"></i>
          <h1 className="text-xl font-semibold">Finance Tracker</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="https://pro-taskmanager.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`relative overflow-visible group ${pulseEffect ? 'animate-pulse' : ''} z-20`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button 
              variant="outline"
              className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform group-hover:scale-105 relative z-20 ${pulseEffect ? 'ring-2 ring-blue-300 dark:ring-blue-500 ring-opacity-60' : ''}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 blur opacity-30 transition-opacity duration-300 ${isHovered ? 'opacity-60' : 'opacity-0'} ${pulseEffect ? 'animate-ping opacity-40' : ''} -z-10`} />
              <div className="flex items-center gap-2 z-10">
                <CheckSquare className={`h-4 w-4 transition-transform duration-300 ${pulseEffect ? 'animate-bounce' : ''} group-hover:rotate-12`} />
                <span className="font-medium">TaskManager</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              {pulseEffect && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              )}
            </Button>
          </a>
          
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
