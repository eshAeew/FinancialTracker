import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Transaction, Category, BudgetGoal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCurrency } from "@/lib/utils";

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

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  addBudgetGoal: (goal: Omit<BudgetGoal, "id">) => void;
  updateBudgetGoal: (goal: BudgetGoal) => void;
  deleteBudgetGoal: (id: string) => void;
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

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("finance-transactions", []);
  const [categories, setCategories] = useLocalStorage<Category[]>("finance-categories", defaultCategories);
  const [budgetGoals, setBudgetGoals] = useLocalStorage<BudgetGoal[]>("finance-budget-goals", defaultBudgetGoals);
  
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>({
    category: "All Categories",
    dateRange: "Last 30 days"
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
      case "Last 30 days":
        startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        break;
      case "This month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "Last month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endOfLastMonth;
        });
        return filteredTransactions;
      case "Last 3 months":
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "This year":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
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

  // Using the imported formatCurrency function from utils

  // Context value
  const value: FinanceContextType = {
    transactions,
    categories,
    budgetGoals,
    addTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
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
