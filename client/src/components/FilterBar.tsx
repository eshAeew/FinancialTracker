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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
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
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
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
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {t('common.filters')}
            {(categoryFilter !== 'All Categories' || typeFilter !== 'all' || dateRange || search) && (
              <Badge variant="secondary" className="ml-1">
                {[
                  categoryFilter !== 'All Categories' && t('transactions.category'),
                  typeFilter !== 'all' && t('transactions.type'),
                  dateRange && t('transactions.date'),
                  search && t('common.search')
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {!showFilters && (
            <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
              <SelectTrigger className="w-[180px]">
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
      
      {showFilters && (
        <CardContent className="pb-2 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {showSearch && (
              <div>
                <Input
                  placeholder={t('transactions.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('transactions.filterByCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">{t('transactions.filter.all')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {showTypeFilter && (
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transactions.filterByType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('transactions.filter.all')}</SelectItem>
                    <SelectItem value="income">{t('transactions.income')}</SelectItem>
                    <SelectItem value="expense">{t('transactions.expense')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                {t('transactions.resetFilters')}
              </Button>
              
              <Select value={activeFilter.dateRange} onValueChange={updateDatePreset}>
                <SelectTrigger className="max-w-[180px] ml-2">
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
      )}
    </Card>
  );
}