import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";
import { transactionSchema, categorySchema, Transaction, Category } from "@shared/schema";
import { z } from "zod";
import EmojiPicker from "emoji-picker-react";

// Extended schema for form validation
const formSchema = transactionSchema.extend({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
  const { 
    categories, 
    addTransaction, 
    addCategory, 
    activeTransactionType, 
    setActiveTransactionType 
  } = useFinance();
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  
  // Form for new category
  const categoryForm = useForm({
    defaultValues: {
      categoryName: "",
      categoryEmoji: "📦",
      categoryType: "both"
    }
  });
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: activeTransactionType,
      amount: "",
      category: "",
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
    },
  });
  
  // Submit handler
  const onSubmit = (data: FormValues) => {
    addTransaction({
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      emoji: categories.find(c => c.name === data.category)?.emoji || "📦",
      date: data.date,
      note: data.note || "",
    });
    
    form.reset({
      type: activeTransactionType,
      amount: "",
      category: "",
      date: format(new Date(), "yyyy-MM-dd"),
      note: "",
    });
  };
  
  // Handle type toggle
  const handleTypeToggle = (type: "income" | "expense") => {
    setActiveTransactionType(type);
    form.setValue("type", type);
  };
  
  // Handle adding a new category
  const handleAddCategory = (data: { categoryName: string, categoryEmoji: string, categoryType: string }) => {
    if (data.categoryName.trim()) {
      const newCat = {
        name: data.categoryName,
        emoji: data.categoryEmoji,
        type: data.categoryType as Category["type"],
      };
      
      addCategory(newCat);
      
      // If we were in the middle of creating a transaction, set the category
      form.setValue("category", newCat.name);
      
      // Reset the category form
      categoryForm.reset({
        categoryName: "",
        categoryEmoji: "📦",
        categoryType: "both"
      });
      
      setShowCategoryDialog(false);
    }
  };
  
  // Filter categories by transaction type
  const filteredCategories = categories.filter(
    c => c.type === "both" || c.type === activeTransactionType
  );

  return (
    <Card className="border border-neutral-100">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <div className="flex rounded-md overflow-hidden border border-neutral-200">
                      <button
                        type="button"
                        className={cn(
                          "flex-1 h-10 flex justify-center items-center text-sm font-medium transition-colors",
                          activeTransactionType === "income" 
                            ? "bg-green-100 text-green-700 font-medium hover:bg-green-200" 
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => handleTypeToggle("income")}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "flex-1 h-10 flex justify-center items-center text-sm font-medium transition-colors",
                          activeTransactionType === "expense" 
                            ? "bg-red-100 text-red-700 font-medium hover:bg-red-200" 
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => handleTypeToggle("expense")}
                      >
                        Expense
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-neutral-500">₹</span>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          className="pl-8"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        if (value === "add_new") {
                          // Immediately show the dialog when "Add new category" is selected
                          setShowCategoryDialog(true);
                          // Don't actually set the value to "add_new"
                          return;
                        }
                        field.onChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            <span className="flex items-center gap-2">
                              <span>{category.emoji}</span>
                              <span>{category.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                        <SelectItem value="add_new">
                          <span className="flex items-center gap-2">
                            <span>➕</span>
                            <span>Add new category...</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(new Date(field.value), "PP") : "Select a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add a note" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => form.reset()}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </Form>
        
        {/* New Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="space-y-4">
                <div className="grid gap-4 py-2">
                  <FormField
                    control={categoryForm.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={categoryForm.control}
                    name="categoryEmoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emoji</FormLabel>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-md border px-3 py-2">
                            <span className="text-2xl">{field.value}</span>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button 
                                type="button" 
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                Choose Emoji
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <EmojiPicker
                                onEmojiClick={(emojiData) => {
                                  field.onChange(emojiData.emoji);
                                }}
                                width="100%"
                                height="350px"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={categoryForm.control}
                    name="categoryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => {
                      categoryForm.reset();
                      setShowCategoryDialog(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
