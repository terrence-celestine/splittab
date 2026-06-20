import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tabs = pgTable("tabs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  roomCode: text("room_code").notNull().unique(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tabMembers = pgTable("tab_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  tabId: uuid("tab_id")
    .notNull()
    .references(() => tabs.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  tabId: uuid("tab_id")
    .notNull()
    .references(() => tabs.id),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull().default("other"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});
