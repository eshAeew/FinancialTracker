import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useFinance } from "@/context/FinanceContext";
import { budgetGoalSchema, BudgetGoal } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";

const formSchema = budgetGoalSchema.extend({
  limit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Limit must be a positive number",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function BudgetGoals() {
  const { budgetGoals, addBudgetGoal, updateBudgetGoal, deleteBudgetGoal } = useFinance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<BudgetGoal | null>(null);
  
  // Form for adding new budget goal
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      limit: "",
      period: "monthly",
      current: 0
    },
  });
  
  // Form for editing budget goal
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      category: "",
      limit: "",
      period: "monthly",
      current: 0
    },
  });
  
  const onSubmit = (data: FormValues) => {
    addBudgetGoal({
      category: data.category,
      limit: Number(data.limit),
      period: data.period,
      current: 0
    });
    
    form.reset({
      category: "",
      limit: "",
      period: "monthly",
      current: 0
    });
    
    setIsAddDialogOpen(false);
  };
  
  const onEditSubmit = (data: FormValues) => {
    if (goalToEdit) {
      updateBudgetGoal({
        id: goalToEdit.id,
        category: data.category,
        limit: Number(data.limit),
        period: data.period,
        current: goalToEdit.current
      });
      
      setIsEditDialogOpen(false);
    }
  };
  
  const handleEditClick = (goal: BudgetGoal) => {
    setGoalToEdit(goal);
    editForm.reset({
      id: goal.id,
      category: goal.category,
      limit: goal.limit.toString(),
      period: goal.period,
      current: goal.current
    });
    setIsEditDialogOpen(true);
  };
  
  return (
    <Card className="border border-neutral-100">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Budget Goals</h2>
        <div className="space-y-4">
          {budgetGoals.map((goal) => {
            const percentage = Math.min(Math.round((goal.current / goal.limit) * 100), 100);
            
            // Determine progress color based on percentage
            let progressColor = "bg-primary";
            if (percentage > 85) progressColor = "bg-amber-500";
            if (percentage > 95) progressColor = "bg-destructive";
            
            return (
              <div key={goal.id} className="group relative">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{goal.category}</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.limit)}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5">
                  <div 
                    className={`${progressColor} h-2.5 rounded-full`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Edit/Delete buttons visible on hover */}
                <div className="absolute right-0 top-0 hidden group-hover:flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-neutral-400 hover:text-primary"
                    onClick={() => handleEditClick(goal)}
                  >
                    <i className="ri-pencil-line text-sm" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-neutral-400 hover:text-destructive"
                    onClick={() => deleteBudgetGoal(goal.id)}
                  >
                    <i className="ri-delete-bin-line text-sm" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full py-2 px-4 mt-2 border border-dashed"
              >
                + Add New Budget Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Monthly Expenses" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Limit</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Budget Goal</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Budget Goal Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Budget Goal</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Limit</FormLabel>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-neutral-500">₹</span>
                          </div>
                          <FormControl>
                            <Input 
                              className="pl-8" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Budget Goal</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
