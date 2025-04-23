import * as React from "react"
import { format, addMonths, isSameMonth, setMonth, setYear, getMonth, getYear } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { DateRange, DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { useTranslation } from "react-i18next"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const [month1, setMonth1] = React.useState<Date>(value?.from || new Date());
  const [month2, setMonth2] = React.useState<Date>(addMonths(value?.from || new Date(), 1));
  
  React.useEffect(() => {
    if (value?.from) {
      setMonth1(value.from);
      setMonth2(addMonths(value.from, 1));
    }
  }, [value?.from]);

  // Ensure month2 is always after month1
  React.useEffect(() => {
    if (isSameMonth(month1, month2) || month2 < month1) {
      setMonth2(addMonths(month1, 1));
    }
  }, [month1, month2]);

  const handlePrevMonthLeft = () => {
    setMonth1(prevMonth => addMonths(prevMonth, -1));
  };

  const handleNextMonthLeft = () => {
    const nextMonth = addMonths(month1, 1);
    if (nextMonth < month2) {
      setMonth1(nextMonth);
    }
  };

  const handlePrevMonthRight = () => {
    const prevMonth = addMonths(month2, -1);
    if (prevMonth > month1) {
      setMonth2(prevMonth);
    }
  };

  const handleNextMonthRight = () => {
    setMonth2(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Get translated month names
  const monthNames = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => t(`settings.dateRangePicker.months.${i}`));
  }, [t]);
  
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 10}, (_, i) => currentYear - 5 + i);
  }, []);
  
  const handleMonth1Change = (monthIndex: string) => {
    const newDate = setMonth(month1, parseInt(monthIndex));
    setMonth1(newDate);
  };
  
  const handleYear1Change = (year: string) => {
    const newDate = setYear(month1, parseInt(year));
    setMonth1(newDate);
  };
  
  const handleMonth2Change = (monthIndex: string) => {
    const newDate = setMonth(month2, parseInt(monthIndex));
    setMonth2(newDate);
  };
  
  const handleYear2Change = (year: string) => {
    const newDate = setYear(month2, parseInt(year));
    setMonth2(newDate);
  };
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>{t('settings.dateRangePicker.pickDateRange')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col md:flex-row p-3 gap-4 relative">
            {/* Left Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 items-center">
                  <Select value={getMonth(month1).toString()} onValueChange={handleMonth1Change}>
                    <SelectTrigger className="w-[110px] h-8">
                      <SelectValue placeholder={t('settings.dateRangePicker.month')} />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={getYear(month1).toString()} onValueChange={handleYear1Change}>
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue placeholder={t('settings.dateRangePicker.year')} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={handlePrevMonthLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={handleNextMonthLeft}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <DayPicker
                mode="range"
                selected={value}
                onSelect={onChange}
                month={month1}
                showOutsideDays={true}
                className="border-0 p-0"
                classNames={{
                  months: "",
                  month: "space-y-4",
                  caption: "hidden",
                  caption_label: "hidden",
                  nav: "hidden",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md",
                  day_range_end: "day-range-end",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            {/* Right Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 items-center">
                  <Select value={getMonth(month2).toString()} onValueChange={handleMonth2Change}>
                    <SelectTrigger className="w-[110px] h-8">
                      <SelectValue placeholder={t('settings.dateRangePicker.month')} />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={getYear(month2).toString()} onValueChange={handleYear2Change}>
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={handlePrevMonthRight}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    onClick={handleNextMonthRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <DayPicker
                mode="range"
                selected={value}
                onSelect={onChange}
                month={month2}
                showOutsideDays={true}
                className="border-0 p-0"
                classNames={{
                  months: "",
                  month: "space-y-4",
                  caption: "hidden",
                  caption_label: "hidden",
                  nav: "hidden",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md",
                  day_range_end: "day-range-end",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
          
          {/* Footer with quick date ranges */}
          <div className="p-3 border-t flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date();
                lastWeek.setDate(today.getDate() - 7);
                onChange({ from: lastWeek, to: today });
              }}
            >
              Last 7 days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date();
                lastMonth.setDate(today.getDate() - 30);
                onChange({ from: lastMonth, to: today });
              }}
            >
              Last 30 days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastYear = new Date();
                lastYear.setFullYear(today.getFullYear() - 1);
                onChange({ from: lastYear, to: today });
              }}
            >
              Last year
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}