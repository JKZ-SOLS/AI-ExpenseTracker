import { pgTable, text, serial, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Category Schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("ri-file-list-line"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Transaction Schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull(),
  date: timestamp("date", { precision: 3 }).notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// User Settings Schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  currency: text("currency").notNull().default("PKR"),
  darkMode: integer("dark_mode").notNull().default(0),
  fingerprintEnabled: integer("fingerprint_enabled").notNull().default(1),
  pin: text("pin").notNull().default("1234"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
