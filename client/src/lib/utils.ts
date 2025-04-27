import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays as dateFnsAddDays, addWeeks as dateFnsAddWeeks, addMonths as dateFnsAddMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency based on locale and currency settings
 */
export function formatCurrency(
  amount: number, 
  currency = "USD",
  locale = "en-US",
  position = "before"
): string {
  // Check if amount is a valid number to avoid NaN
  if (isNaN(amount)) {
    amount = 0;
  }
  
  try {
    // Use Intl.NumberFormat for proper locale formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    // Let the formatter handle the positioning based on locale conventions
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return position === "before" ? `${symbol}${formattedAmount}` : `${formattedAmount}${symbol}`;
  }
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
  };
  
  return symbols[currencyCode] || currencyCode;
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

/**
 * Add days to a date and return the new date
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return dateFnsAddDays(dateObj, days);
}

/**
 * Add weeks to a date and return the new date
 */
export function addWeeks(date: Date | string, weeks: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return dateFnsAddWeeks(dateObj, weeks);
}

/**
 * Add months to a date and return the new date
 */
export function addMonths(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  return dateFnsAddMonths(dateObj, months);
}

/**
 * Calculate next occurrence of a recurring transaction based on frequency
 */
export function calculateNextOccurrence(date: Date | string, frequency: string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  
  switch (frequency) {
    case 'daily':
      return addDays(dateObj, 1);
    case 'weekly':
      return addDays(dateObj, 7);
    case 'biweekly':
      return addDays(dateObj, 14);
    case 'monthly':
      return addMonths(dateObj, 1);
    case 'quarterly':
      return addMonths(dateObj, 3);
    case 'yearly':
      return addMonths(dateObj, 12);
    default:
      return addMonths(dateObj, 1);
  }
}

/**
 * Convert a frequency to a human-readable label
 */
export function formatFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    'biweekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'yearly': 'Yearly'
  };
  
  return labels[frequency] || frequency;
}

/**
 * Get a user-friendly remaining time until next occurrence
 */
export function getTimeUntilNextOccurrence(nextDate: string): string {
  const now = new Date();
  const next = new Date(nextDate);
  
  // If the date is in the past
  if (next < now) {
    return 'Overdue';
  }
  
  const diffTime = Math.abs(next.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays < 7) {
    return `In ${diffDays} days`;
  } else if (diffDays < 30) {
    return `In ${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
  } else {
    return `In ${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
  }
}
