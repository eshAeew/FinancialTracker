import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table remains as it was
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// New Transaction schema for the finance tracker
export const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string(),
  emoji: z.string().optional(),
  date: z.string(),
  note: z.string().optional(),
  createdAt: z.string().optional()
});

// Category schema 
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  type: z.enum(["income", "expense", "both"]).default("both")
});

// Budget goal schema
export const budgetGoalSchema = z.object({
  id: z.string(),
  category: z.string(),
  limit: z.number().positive(),
  current: z.number().default(0),
  period: z.enum(["weekly", "monthly", "yearly"]).default("monthly")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = z.infer<typeof transactionSchema>;
export type Category = z.infer<typeof categorySchema>;
export type BudgetGoal = z.infer<typeof budgetGoalSchema>;
