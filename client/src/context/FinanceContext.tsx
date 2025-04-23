import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Transaction, Category, BudgetGoal, RecurringTransaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCookieStorage } from "@/hooks/useCookieStorage";
import { formatCurrency } from "@/lib/utils";
import { format, isAfter, isBefore, isSameDay, addDays, addWeeks, addMonths } from "date-fns";
import { COOKIE_KEYS } from "@/lib/cookieStorage";

// Default categories with emojis
const defaultCategories: Category[] = [
  { id: "1", name: "Housing", emoji: "🏠", type: "expense" },
  { id: "2", name: "Food", emoji: "🍔", type: "expense" },
  { id: "3", name: "Transportation", emoji: "🚗", type: "expense" },
  { id: "4", name: "Entertainment", emoji: "🎬", type: "expense" },
  { id: "5", name: "Shopping", emoji: "👕", type: "expense" },
  { id: "6", name: "Others", emoji: "📦", type: "expense" },
  { id: "7", name: "Salary", emoji: "💰", type: "income" },
  { id: "8", name: "Gifts", emoji: "🎁", type: "income" },
  { id: "9", name: "Investments", emoji: "📈", type: "income" },
  { id: "10", name: "Bonus", emoji: "🎯", type: "income" },
];

// Default budget goals
const defaultBudgetGoals: BudgetGoal[] = [
  { id: "1", category: "Monthly Expenses", limit: 25000, current: 13700, period: "monthly" },
  { id: "2", category: "Food Budget", limit: 5000, current: 3100, period: "monthly" },
  { id: "3", category: "Entertainment Budget", limit: 3000, current: 2600, period: "monthly" },
];

// Default recurring transactions
const defaultRecurringTransactions: RecurringTransaction[] = [
  { 
    id: "1",
    name: "Monthly Rent",
    type: "expense",
    amount: 15000,
    category: "Housing",
    frequency: "monthly",
    startDate: "2024-01-01",
    nextDate: "2024-05-01",
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "Salary",
    type: "income",
    amount: 50000,
    category: "Salary",
    frequency: "monthly",
    startDate: "2024-01-01",
    nextDate: "2024-05-01",
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  recurringTransactions: RecurringTransaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  addBudgetGoal: (goal: Omit<BudgetGoal, "id">) => void;
  updateBudgetGoal: (goal: BudgetGoal) => void;
  deleteBudgetGoal: (id: string) => void;
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, "id" | "createdAt" | "nextDate">) => void;
  updateRecurringTransaction: (transaction: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransaction: (id: string) => void;
  toggleRecurringTransactionStatus: (id: string) => void;
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  getFilteredTransactions: (filter: TransactionFilter) => Transaction[];
  activeFilter: TransactionFilter;
  setActiveFilter: React.Dispatch<React.SetStateAction<TransactionFilter>>;
  activeTransactionType: "income" | "expense";
  setActiveTransactionType: React.Dispatch<React.SetStateAction<"income" | "expense">>;
}

interface TransactionFilter {
  category: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

interface FinanceProviderProps {
  children: ReactNode;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: FinanceProviderProps) {
  const { toast } = useToast();

  const [transactions, setTransactions] = useCookieStorage<Transaction[]>(COOKIE_KEYS.TRANSACTIONS, []);
  const [categories, setCategories] = useCookieStorage<Category[]>(COOKIE_KEYS.CATEGORIES, defaultCategories);
  const [budgetGoals, setBudgetGoals] = useCookieStorage<BudgetGoal[]>(COOKIE_KEYS.BUDGET_GOALS, defaultBudgetGoals);
  const [recurringTransactions, setRecurringTransactions] = useCookieStorage<RecurringTransaction[]>(
    COOKIE_KEYS.RECURRING_TRANSACTIONS,
    defaultRecurringTransactions
  );
  
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>({
    category: "All Categories",
    dateRange: "last30Days"
  });

  const [activeTransactionType, setActiveTransactionType] = useState<"income" | "expense">("income");

  // Calculate financial summaries
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  // Transaction CRUD operations
  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Update budget goals for expenses
    if (transaction.type === "expense") {
      const updatedGoals = budgetGoals.map(goal => {
        if (goal.category === "Monthly Expenses" || 
            goal.category === `${transaction.category} Budget`) {
          return { ...goal, current: goal.current + transaction.amount };
        }
        return goal;
      });
      setBudgetGoals(updatedGoals);
    }
    
    toast({
      title: "Transaction Added",
      description: `${transaction.type === "income" ? "Income" : "Expense"} of ${formatCurrency(transaction.amount)} has been added.`,
    });
  };

  const deleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    
    if (transactionToDelete) {
      setTransactions(transactions.filter(t => t.id !== id));
      
      // Update budget goals for expenses
      if (transactionToDelete.type === "expense") {
        const updatedGoals = budgetGoals.map(goal => {
          if (goal.category === "Monthly Expenses" || 
              goal.category === `${transactionToDelete.category} Budget`) {
            return { ...goal, current: Math.max(0, goal.current - transactionToDelete.amount) };
          }
          return goal;
        });
        setBudgetGoals(updatedGoals);
      }
      
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been deleted successfully.",
      });
    }
  };

  // Category CRUD operations
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setCategories([...categories, newCategory]);
    toast({
      title: "Category Added",
      description: `${category.name} has been added to your categories.`,
    });
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({
      title: "Category Deleted",
      description: "The category has been deleted successfully.",
    });
  };

  // Budget goals CRUD operations
  const addBudgetGoal = (goal: Omit<BudgetGoal, "id">) => {
    const newGoal: BudgetGoal = {
      ...goal,
      id: Date.now().toString()
    };
    setBudgetGoals([...budgetGoals, newGoal]);
    toast({
      title: "Budget Goal Added",
      description: `${goal.category} budget goal has been created.`,
    });
  };

  const updateBudgetGoal = (goal: BudgetGoal) => {
    setBudgetGoals(budgetGoals.map(g => g.id === goal.id ? goal : g));
    toast({
      title: "Budget Goal Updated",
      description: `${goal.category} budget goal has been updated.`,
    });
  };

  const deleteBudgetGoal = (id: string) => {
    setBudgetGoals(budgetGoals.filter(g => g.id !== id));
    toast({
      title: "Budget Goal Deleted",
      description: "The budget goal has been deleted successfully.",
    });
  };

  // Recurring transactions CRUD operations
  const addRecurringTransaction = (transaction: Omit<RecurringTransaction, "id" | "createdAt" | "nextDate">) => {
    const startDate = new Date(transaction.startDate);
    
    // Calculate the next occurrence date based on frequency
    let nextDate = new Date(startDate);
    
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: Date.now().toString(),
      nextDate: startDate.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setRecurringTransactions([...recurringTransactions, newTransaction]);
    
    toast({
      title: "Recurring Transaction Added",
      description: `${transaction.name} has been set up for ${transaction.frequency} ${transaction.type}.`,
    });
  };

  const updateRecurringTransaction = (transaction: RecurringTransaction) => {
    setRecurringTransactions(
      recurringTransactions.map(t => t.id === transaction.id ? transaction : t)
    );
    
    toast({
      title: "Recurring Transaction Updated",
      description: `${transaction.name} has been updated.`,
    });
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(recurringTransactions.filter(t => t.id !== id));
    
    toast({
      title: "Recurring Transaction Deleted",
      description: "The recurring transaction has been deleted.",
    });
  };

  // Toggle active status of a recurring transaction
  const toggleRecurringTransactionStatus = (id: string) => {
    const transaction = recurringTransactions.find(t => t.id === id);
    
    if (transaction) {
      const updatedTransaction = {
        ...transaction,
        active: !transaction.active
      };
      
      setRecurringTransactions(
        recurringTransactions.map(t => t.id === id ? updatedTransaction : t)
      );
      
      toast({
        title: `Recurring Transaction ${updatedTransaction.active ? "Activated" : "Paused"}`,
        description: `${transaction.name} has been ${updatedTransaction.active ? "activated" : "paused"}.`,
      });
    }
  };

  // Process a recurring transaction manually
  const processRecurringTransaction = (id: string) => {
    const recurringTransaction = recurringTransactions.find(t => t.id === id);
    
    if (!recurringTransaction || !recurringTransaction.active) return;
    
    // Create a regular transaction from the recurring one
    const newTransaction: Omit<Transaction, "id" | "createdAt"> = {
      type: recurringTransaction.type,
      amount: recurringTransaction.amount,
      category: recurringTransaction.category,
      date: new Date().toISOString(),
      note: `Auto-generated from recurring transaction: ${recurringTransaction.name}`
    };
    
    // Add the transaction
    addTransaction(newTransaction);
    
    // Calculate next occurrence date
    const currentDate = new Date(recurringTransaction.nextDate);
    let nextDate = new Date(currentDate);
    
    switch (recurringTransaction.frequency) {
      case "daily":
        nextDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case "biweekly":
        nextDate.setDate(currentDate.getDate() + 14);
        break;
      case "monthly":
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(currentDate.getMonth() + 3);
        break;
      case "yearly":
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
    
    // Update the recurring transaction with the new next date
    const updatedRecurringTransaction = {
      ...recurringTransaction,
      nextDate: nextDate.toISOString(),
      lastProcessed: new Date().toISOString()
    };
    
    // Save the updated recurring transaction
    setRecurringTransactions(
      recurringTransactions.map(t => t.id === id ? updatedRecurringTransaction : t)
    );
    
    toast({
      title: "Recurring Transaction Processed",
      description: `${recurringTransaction.name} has been processed. Next occurrence on ${format(nextDate, 'PP')}.`,
    });
  };

  // Filter transactions based on category and date range
  const getFilteredTransactions = (filter: TransactionFilter) => {
    let filteredTransactions = [...transactions];
    
    // Filter by category
    if (filter.category !== "All Categories") {
      filteredTransactions = filteredTransactions.filter(t => t.category === filter.category);
    }
    
    // Filter by date range
    const today = new Date();
    let startDate: Date;
    
    switch (filter.dateRange) {
      case "last30Days":
        startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endOfLastMonth;
        });
        return filteredTransactions;
      case "last3Months":
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "allTime":
        // Return all transactions without date filtering
        return filteredTransactions;
      case "Custom range":
        if (filter.startDate && filter.endDate) {
          const start = new Date(filter.startDate);
          const end = new Date(filter.endDate);
          filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
          });
          return filteredTransactions;
        }
        return filteredTransactions;
      default:
        startDate = new Date();
        startDate.setDate(today.getDate() - 30);
    }
    
    return filteredTransactions.filter(t => new Date(t.date) >= startDate);
  };

  // Import data from JSON
  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!data.transactions && !data.categories && !data.budgetGoals && !data.recurringTransactions) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Invalid data format. The file must contain at least one valid data section.",
        });
        return false;
      }
      
      // Import transactions if present
      if (Array.isArray(data.transactions)) {
        // Make sure all required fields are present
        const validTransactions = data.transactions.filter((t: any) => 
          t.type && (t.type === "income" || t.type === "expense") && 
          typeof t.amount === "number" && 
          t.date && 
          t.id
        );
        
        // Add createdAt if missing
        const formattedTransactions = validTransactions.map((t: any) => ({
          ...t,
          createdAt: t.createdAt || new Date().toISOString()
        }));
        
        setTransactions(formattedTransactions);
      }
      
      // Import categories if present
      if (Array.isArray(data.categories)) {
        const validCategories = data.categories.filter((c: any) => 
          c.name && c.type && c.id
        );
        setCategories(validCategories);
      }
      
      // Import budget goals if present
      if (Array.isArray(data.budgetGoals)) {
        const validBudgetGoals = data.budgetGoals.filter((g: any) => 
          g.category && typeof g.limit === "number" && g.period && g.id
        );
        setBudgetGoals(validBudgetGoals);
      }
      
      // Import recurring transactions if present
      if (Array.isArray(data.recurringTransactions)) {
        const validRecurringTransactions = data.recurringTransactions.filter((r: any) => 
          r.name && 
          r.type && 
          typeof r.amount === "number" && 
          r.category && 
          r.frequency && 
          r.startDate && 
          r.id
        );
        
        // Add nextDate and createdAt if missing
        const formattedRecurringTransactions = validRecurringTransactions.map((r: any) => ({
          ...r,
          nextDate: r.nextDate || r.startDate,
          createdAt: r.createdAt || new Date().toISOString(),
          active: r.active !== undefined ? r.active : true
        }));
        
        setRecurringTransactions(formattedRecurringTransactions);
      }
      
      toast({
        title: "Import Successful",
        description: "Your finance data has been successfully imported.",
      });
      
      return true;
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to parse the imported file. Please make sure it's a valid JSON file.",
      });
      return false;
    }
  };
  
  // Export data to JSON
  const exportData = (): string => {
    const data = {
      transactions,
      categories,
      budgetGoals,
      recurringTransactions
    };
    
    return JSON.stringify(data, null, 2);
  };

  // Context value
  const value: FinanceContextType = {
    transactions,
    categories,
    budgetGoals,
    recurringTransactions,
    addTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransaction,
    toggleRecurringTransactionStatus,
    importData,
    exportData,
    totalBalance,
    totalIncome,
    totalExpenses,
    getFilteredTransactions,
    activeFilter,
    setActiveFilter,
    activeTransactionType,
    setActiveTransactionType
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
