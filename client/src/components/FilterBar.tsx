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
import { Filter, Calendar, Tag, Type, Search, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

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
  const { categories, activeFilter, setActiveFilter } = useFinance();
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
    <Card className="mb-6 overflow-hidden shadow-sm border-opacity-50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between bg-gradient-to-r from-muted/50 to-card">
        {(pageTitle || pageDescription) && (
          <div>
            {pageTitle && <CardTitle>{pageTitle}</CardTitle>}
            {pageDescription && <CardDescription>{pageDescription}</CardDescription>}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 transition-all duration-200 ${showFilters ? 'bg-primary/10' : ''}`}
          >
            <Filter className="h-4 w-4" />
            {t('common.filters')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 font-medium animate-pulse">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {!showFilters && (
            <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
              <SelectTrigger className="w-[180px] bg-secondary/10 border-secondary/20">
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
            <CardContent className="pb-4 pt-2 border-t">
              {/* Active filters summary row */}
              {activeFilterCount > 0 && (
                <div className="mb-4 p-2 bg-muted/30 rounded-md flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground mr-2">
                    {t('common.activeFilters')}:
                  </span>
                  
                  {categoryFilter !== 'All Categories' && (
                    <Badge variant="outline" className="bg-primary/5 gap-1 pl-1.5">
                      <Tag className="h-3 w-3 text-primary" />
                      {categoryFilter}
                    </Badge>
                  )}
                  
                  {typeFilter !== 'all' && (
                    <Badge variant="outline" className="bg-primary/5 gap-1 pl-1.5">
                      <Type className="h-3 w-3 text-primary" />
                      {t(`transactions.${typeFilter}`)}
                    </Badge>
                  )}
                  
                  {dateRange && (
                    <Badge variant="outline" className="bg-primary/5 gap-1 pl-1.5">
                      <Calendar className="h-3 w-3 text-primary" />
                      {formattedDateRange}
                    </Badge>
                  )}
                  
                  {search && (
                    <Badge variant="outline" className="bg-primary/5 gap-1 pl-1.5">
                      <Search className="h-3 w-3 text-primary" />
                      {search}
                    </Badge>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="ml-auto p-1 h-auto text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t('transactions.resetFilters')}
                  </Button>
                </div>
              )}
            
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {showSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('transactions.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 border border-input/50 focus:border-primary/50 transition-colors duration-200"
                    />
                  </div>
                )}
                
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border border-input/50 focus:border-primary/50 transition-colors duration-200">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue placeholder={t('transactions.filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Categories">{t('transactions.filter.all')}</SelectItem>
                      <Separator className="my-1" />
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                          Income Categories
                        </SelectLabel>
                        {categories
                          .filter(cat => cat.type === 'income' || cat.type === 'both')
                          .map((category) => (
                            <SelectItem key={category.id} value={category.name} className="capitalize">
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
                        <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">
                          Expense Categories
                        </SelectLabel>
                        {categories
                          .filter(cat => cat.type === 'expense' || cat.type === 'both')
                          .map((category) => (
                            <SelectItem key={category.id} value={category.name} className="capitalize">
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
                </div>
                
                {showTypeFilter && (
                  <div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border border-input/50 focus:border-primary/50 transition-colors duration-200">
                        <Type className="h-4 w-4 mr-2 text-primary" />
                        <SelectValue placeholder={t('transactions.filterByType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('transactions.filter.all')}</SelectItem>
                        <Separator className="my-1" />
                        <SelectItem value="income" className="text-green-500">{t('transactions.income')}</SelectItem>
                        <SelectItem value="expense" className="text-red-500">{t('transactions.expense')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full [&_button]:border [&_button]:border-input/50 [&_button]:focus:border-primary/50 [&_button]:transition-colors [&_button]:duration-200"
                  />
                </div>
                
                <div className="md:col-span-4 flex justify-between pt-3 border-t mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs flex items-center gap-1 border-dashed"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('transactions.resetFilters')}
                  </Button>
                  
                  <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
                    <SelectTrigger className="max-w-[180px] border border-input/50 focus:border-primary/50 transition-colors duration-200">
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
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}