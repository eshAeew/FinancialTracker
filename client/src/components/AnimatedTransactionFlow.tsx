import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { CreditCard, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export default function AnimatedTransactionFlow() {
  const { transactions } = useFinance();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [visibleTransactions, setVisibleTransactions] = useState<Array<any>>([]);
  const [animationStep, setAnimationStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to get the month name
  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('default', { month: 'long' });
  };
  
  // Function to navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setAnimationStep(0);
    setVisibleTransactions([]);
  };
  
  // Function to navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setAnimationStep(0);
    setVisibleTransactions([]);
  };
  
  // Filter transactions for the current month
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get the total income and expenses for the current month
  const monthlyIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Animation steps
  useEffect(() => {
    if (filteredTransactions.length === 0) return;
    
    // Animation steps:
    // 0: Initial state
    // 1: Show income
    // 2: Show expenses
    // 3: Show transactions flowing
    // 4: Final state with all transactions visible
    
    const timer = setTimeout(() => {
      if (animationStep < 4) {
        setAnimationStep(prev => prev + 1);
        
        if (animationStep === 2) {
          // Start showing transactions one by one
          let counter = 0;
          const interval = setInterval(() => {
            if (counter < filteredTransactions.length) {
              setVisibleTransactions(prev => [
                ...prev,
                filteredTransactions[counter]
              ]);
              counter++;
            } else {
              clearInterval(interval);
              setAnimationStep(4);
            }
          }, 300);
          
          return () => clearInterval(interval);
        }
      }
    }, animationStep === 0 ? 500 : 1000);
    
    return () => clearTimeout(timer);
  }, [animationStep, filteredTransactions]);
  
  // Reset animation when month changes
  useEffect(() => {
    setAnimationStep(0);
    setVisibleTransactions([]);
  }, [currentMonth, currentYear]);
  
  // Start animation
  useEffect(() => {
    if (animationStep === 0 && filteredTransactions.length > 0) {
      const timer = setTimeout(() => {
        setAnimationStep(1);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [animationStep, filteredTransactions]);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Transaction Flow</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {getMonthName(currentMonth)} {currentYear}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative h-[400px]" ref={containerRef}>
          {filteredTransactions.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CreditCard className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No transactions for {getMonthName(currentMonth)} {currentYear}
              </p>
            </div>
          ) : (
            <>
              {/* Income Container */}
              <motion.div 
                className="absolute left-4 top-4 w-[calc(50%-32px)] bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800"
                initial={{ y: -20, opacity: 0 }}
                animate={animationStep >= 1 ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium">Income</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(monthlyIncome)}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  {visibleTransactions
                    .filter(t => t.type === 'income')
                    .map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{transaction.emoji}</span>
                          <span className="text-sm">{transaction.category}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </motion.div>
                    ))
                  }
                </div>
              </motion.div>
              
              {/* Expense Container */}
              <motion.div 
                className="absolute right-4 top-4 w-[calc(50%-32px)] bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800"
                initial={{ y: -20, opacity: 0 }}
                animate={animationStep >= 2 ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                      <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium">Expenses</span>
                  </div>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(monthlyExpenses)}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  {visibleTransactions
                    .filter(t => t.type === 'expense')
                    .map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{transaction.emoji}</span>
                          <span className="text-sm">{transaction.category}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </motion.div>
                    ))
                  }
                </div>
              </motion.div>
              
              {/* Flow Visualization */}
              <AnimatePresence>
                {animationStep >= 3 && visibleTransactions.map((transaction, index) => {
                  const isIncome = transaction.type === 'income';
                  const direction = isIncome ? 1 : -1;
                  const size = Math.min(Math.max(transaction.amount / 500, 0.5), 2);
                  
                  return (
                    <motion.div
                      key={`flow-${transaction.id}`}
                      className={`absolute top-1/2 w-4 h-4 rounded-full ${
                        isIncome ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      initial={{ 
                        x: isIncome ? -50 : window.innerWidth, 
                        y: 100 + (index * 10 % 100),
                        scale: 0
                      }}
                      animate={{ 
                        x: isIncome ? window.innerWidth / 2 : window.innerWidth / 2,
                        scale: size
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: index * 0.2,
                        type: 'spring', 
                        stiffness: 50
                      }}
                      style={{
                        left: isIncome ? 0 : 'auto',
                        right: isIncome ? 'auto' : 0,
                      }}
                    />
                  );
                })}
              </AnimatePresence>
              
              {/* Balance Result */}
              <motion.div
                className="absolute bottom-4 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 mx-auto w-2/3 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
                initial={{ y: 50, opacity: 0 }}
                animate={animationStep >= 4 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Monthly Balance</span>
                  <span className={`text-xl font-bold ${
                    monthlyIncome - monthlyExpenses > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(monthlyIncome - monthlyExpenses)}
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}