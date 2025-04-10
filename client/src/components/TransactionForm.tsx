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
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "📦", type: "both" });
  
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
  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newCat = {
        name: newCategory.name,
        emoji: newCategory.emoji,
        type: newCategory.type as Category["type"],
      };
      
      addCategory(newCat);
      
      // If we were in the middle of creating a transaction, set the category
      form.setValue("category", newCat.name);
      
      setNewCategory({ name: "", emoji: "📦", type: "both" });
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
                      <Button
                        type="button"
                        className={cn(
                          "flex-1 rounded-none",
                          activeTransactionType === "income" 
                            ? "bg-success/10 text-success font-medium hover:bg-success/15" 
                            : "bg-transparent hover:bg-neutral-50"
                        )}
                        onClick={() => handleTypeToggle("income")}
                      >
                        Income
                      </Button>
                      <Button
                        type="button"
                        className={cn(
                          "flex-1 rounded-none",
                          activeTransactionType === "expense" 
                            ? "bg-destructive/10 text-destructive font-medium hover:bg-destructive/15" 
                            : "bg-transparent hover:bg-neutral-50"
                        )}
                        onClick={() => handleTypeToggle("expense")}
                      >
                        Expense
                      </Button>
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
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(new Date(field.value), "PP") : "Select a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit">Save Transaction</Button>
            </div>
          </form>
        </Form>
        
        {/* New Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FormLabel>Category Name</FormLabel>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Enter category name"
                />
              </div>
              <div className="grid gap-2">
                <FormLabel>Emoji</FormLabel>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border px-3 py-2">
                    <span className="text-2xl">{newCategory.emoji}</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline">
                        Choose Emoji
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewCategory({...newCategory, emoji: emojiData.emoji});
                        }}
                        width="100%"
                        height="350px"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <FormLabel>Type</FormLabel>
                <Select
                  value={newCategory.type}
                  onValueChange={(value) => setNewCategory({...newCategory, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
