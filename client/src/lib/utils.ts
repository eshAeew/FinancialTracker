import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with the specified symbol
 */
export function formatCurrency(amount: number, symbol = "₹"): string {
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Groups transactions by date, category, or type
 */
export function groupTransactionsByPeriod(transactions: any[], groupBy: "day" | "week" | "month") {
  const grouped: Record<string, any[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    let key: string;
    
    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${weekNumber}`;
        break;
      case "month":
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      default:
        key = date.toISOString().split("T")[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(transaction);
  });
  
  return grouped;
}

/**
 * Calculates total income, expense, and balance for a given period
 */
export function calculatePeriodSummary(transactions: any[]) {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expense += transaction.amount;
      }
      summary.balance = summary.income - summary.expense;
      return summary;
    },
    { income: 0, expense: 0, balance: 0 }
  );
}

/**
 * Generates a random color for charts
 */
export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
