import { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, Tag, Type, Search, Trash2, RefreshCw, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/utils';

interface FilterBarProps {
  showSearch?: boolean;
  showTypeFilter?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

export default function FilterBar({ 
  showSearch = true, 
  showTypeFilter = true,
  pageTitle,
  pageDescription
}: FilterBarProps) {
  const finance = useFinance();
  const { categories, activeFilter, setActiveFilter } = finance;
  const { currencySettings } = useCurrency();
  const { t } = useTranslation();
  
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(activeFilter.category || 'All Categories');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Update local filters when context filter changes
  useEffect(() => {
    setCategoryFilter(activeFilter.category);
    
    // Set date range if custom range is set in context
    if (activeFilter.dateRange === 'Custom range' && activeFilter.startDate && activeFilter.endDate) {
      setDateRange({
        from: new Date(activeFilter.startDate),
        to: new Date(activeFilter.endDate)
      });
    }
  }, [activeFilter]);
  
  // Update context filter when local category filter changes
  useEffect(() => {
    if (categoryFilter !== activeFilter.category) {
      setActiveFilter({
        ...activeFilter,
        category: categoryFilter
      });
    }
  }, [categoryFilter, setActiveFilter]);
  
  // Update context filter when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setActiveFilter({
        ...activeFilter,
        dateRange: 'Custom range',
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      });
    }
  }, [dateRange, setActiveFilter]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('All Categories');
    setTypeFilter('all');
    setDateRange(undefined);
    
    // Reset context filter
    setActiveFilter({
      category: 'All Categories',
      dateRange: 'last30Days'
    });
  };
  
  // Update date filter preset
  const updateDatePreset = (preset: string) => {
    setActiveFilter({
      ...activeFilter,
      dateRange: preset,
      startDate: undefined,
      endDate: undefined
    });
    
    // Clear date range picker
    setDateRange(undefined);
  };
  
  // Count active filters for the badge
  const activeFilterCount = [
    categoryFilter !== 'All Categories',
    typeFilter !== 'all',
    dateRange,
    search
  ].filter(Boolean).length;

  // Format date range for display
  const formattedDateRange = dateRange && dateRange.from && dateRange.to 
    ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
    : '';

  return (
    <Card className="mb-6 overflow-hidden shadow-md border-opacity-50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-background">
      <CardHeader className="pb-4 pt-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between border-b border-muted/40">
        {(pageTitle || pageDescription) && (
          <div className="animate-in slide-in-from-left duration-300 flex flex-col">
            {pageTitle && <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">{pageTitle}</CardTitle>}
            {pageDescription && <CardDescription className="text-sm mt-1">{pageDescription}</CardDescription>}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Button 
            variant={showFilters ? "default" : "outline"}
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 transition-all duration-300 ease-in-out ${showFilters ? 'shadow-inner' : 'hover:shadow-sm'}`}
          >
            <Filter className={`h-4 w-4 ${showFilters ? 'text-primary-foreground' : 'text-primary'} transition-all duration-200 ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
            {t('common.filters')}
            {activeFilterCount > 0 && (
              <Badge variant={showFilters ? "outline" : "secondary"} className="ml-1 font-medium animate-pulse">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {!showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
                <SelectTrigger className="w-[180px] bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors duration-200">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder={t('transactions.timePeriod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30Days">{t('transactions.dateRange.last30Days')}</SelectItem>
                  <SelectItem value="thisMonth">{t('transactions.dateRange.thisMonth')}</SelectItem>
                  <SelectItem value="lastMonth">{t('transactions.dateRange.lastMonth')}</SelectItem>
                  <SelectItem value="last3Months">{t('transactions.dateRange.last3Months')}</SelectItem>
                  <SelectItem value="thisYear">{t('transactions.dateRange.thisYear')}</SelectItem>
                  <SelectItem value="allTime">{t('transactions.dateRange.allTime')}</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pb-6 pt-4 border-t">
              {/* Active filters summary row */}
              {activeFilterCount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 bg-gradient-to-r from-muted/30 to-background rounded-lg flex flex-wrap items-center gap-2 shadow-sm border border-muted/20"
                >
                  <span className="text-sm font-medium flex items-center gap-1.5 text-foreground mr-2">
                    <Filter className="h-3.5 w-3.5 text-primary" />
                    {t('common.activeFilters')}:
                  </span>
                  
                  {categoryFilter !== 'All Categories' && (
                    <Badge variant="outline" className="bg-primary/5 gap-1.5 pl-2 pr-3 py-1.5 border-primary/20 hover:bg-primary/10 transition-colors duration-200">
                      <Tag className="h-3 w-3 text-primary" />
                      <span className="font-medium">{categoryFilter}</span>
                    </Badge>
                  )}
                  
                  {typeFilter !== 'all' && (
                    <Badge variant="outline" className={`gap-1.5 pl-2 pr-3 py-1.5 border-${typeFilter === 'income' ? 'green' : 'red'}-300/30 ${
                      typeFilter === 'income' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-100/50'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100/50'
                    } transition-colors duration-200`}>
                      <Type className="h-3 w-3" />
                      <span className="font-medium">{t(`transactions.${typeFilter}`)}</span>
                    </Badge>
                  )}
                  
                  {dateRange && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 gap-1.5 pl-2 pr-3 py-1.5 border-blue-300/30 hover:bg-blue-100/50 transition-colors duration-200">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">{formattedDateRange}</span>
                    </Badge>
                  )}
                  
                  {search && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 gap-1.5 pl-2 pr-3 py-1.5 border-purple-300/30 hover:bg-purple-100/50 transition-colors duration-200">
                      <Search className="h-3 w-3" />
                      <span className="font-medium max-w-[150px] truncate">{search}</span>
                    </Badge>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="ml-auto p-1.5 h-auto text-xs flex items-center gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t('transactions.resetFilters')}
                  </Button>
                </motion.div>
              )}
            
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {showSearch && (
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Search className="h-4 w-4 transition-all duration-300 group-focus-within:text-primary" />
                    </div>
                    <div className="group">
                      <Input
                        placeholder={t('transactions.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 border border-input/50 focus:border-primary/50 hover:border-primary/30 transition-all duration-300 focus:ring-2 focus:ring-primary/10 focus:shadow-sm"
                      />
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border border-input/50 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 focus:ring-2 focus:ring-primary/10">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue placeholder={t('transactions.filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[320px] overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SelectItem value="All Categories" className="font-semibold">
                          <span className="flex items-center gap-2">
                            <span className="text-primary">📋</span>
                            <span>{t('transactions.filter.all')}</span>
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
                              <SelectItem key={category.id} value={category.name} className="capitalize hover:bg-green-50/50 dark:hover:bg-green-900/20 focus:bg-green-50/70 dark:focus:bg-green-900/30">
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
                              <SelectItem key={category.id} value={category.name} className="capitalize hover:bg-red-50/50 dark:hover:bg-red-900/20 focus:bg-red-50/70 dark:focus:bg-red-900/30">
                                <span className="flex items-center gap-2">
                                  <span>{category.emoji}</span>
                                  <span>{category.name}</span>
                                </span>
                              </SelectItem>
                            ))
                          }
                        </SelectGroup>
                      </motion.div>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                {showTypeFilter && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border border-input/50 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 focus:ring-2 focus:ring-primary/10">
                        <Type className="h-4 w-4 mr-2 text-primary" />
                        <SelectValue placeholder={t('transactions.filterByType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-medium">
                          <span className="flex items-center gap-2">
                            <span className="text-primary">🔄</span>
                            <span>{t('transactions.filter.all')}</span>
                          </span>
                        </SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="income" className="hover:bg-green-50 dark:hover:bg-green-900/20">
                          <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                            <span>⬇️</span>
                            <span>{t('transactions.income')}</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="expense" className="hover:bg-red-50 dark:hover:bg-red-900/20">
                          <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                            <span>⬆️</span>
                            <span>{t('transactions.expense')}</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full [&_button]:border [&_button]:border-input/50 [&_button]:hover:border-primary/30 [&_button]:focus:border-primary/50 [&_button]:transition-colors [&_button]:duration-200 [&_button]:focus:ring-2 [&_button]:focus:ring-primary/10"
                  />
                </motion.div>
                
                <motion.div 
                  className="md:col-span-4 flex justify-between pt-4 border-t mt-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs flex items-center gap-1.5 border-dashed hover:bg-muted/50 transition-colors duration-200"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('transactions.resetFilters')}
                  </Button>
                  
                  <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
                    <SelectTrigger className="max-w-[180px] border border-input/50 hover:border-primary/30 focus:border-primary/50 transition-all duration-300 focus:ring-2 focus:ring-primary/10">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue placeholder={t('transactions.timePeriod')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30Days">{t('transactions.dateRange.last30Days')}</SelectItem>
                      <SelectItem value="thisMonth">{t('transactions.dateRange.thisMonth')}</SelectItem>
                      <SelectItem value="lastMonth">{t('transactions.dateRange.lastMonth')}</SelectItem>
                      <SelectItem value="last3Months">{t('transactions.dateRange.last3Months')}</SelectItem>
                      <SelectItem value="thisYear">{t('transactions.dateRange.thisYear')}</SelectItem>
                      <SelectItem value="allTime">{t('transactions.dateRange.allTime')}</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}