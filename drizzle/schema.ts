import { boolean, int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Product data only. There are intentionally no names, emails, patient
 * references, locations, clinical fields, payroll fields, or free-text fields.
 */
export const genericTasks = mysqlTable("generic_tasks", {
  id: int("id").autoincrement().primaryKey(),
  installationKey: varchar("installationKey", { length: 64 }).notNull(),
  templateKey: varchar("templateKey", { length: 48 }).notNull(),
  status: mysqlEnum("status", ["todo", "done"]).default("todo").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const genericPreferences = mysqlTable("generic_preferences", {
  id: int("id").autoincrement().primaryKey(),
  installationKey: varchar("installationKey", { length: 64 }).notNull().unique(),
  reducedMotion: boolean("reducedMotion").default(false).notNull(),
  privacyLock: boolean("privacyLock").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GenericTask = typeof genericTasks.$inferSelect;
export type InsertGenericTask = typeof genericTasks.$inferInsert;
export type GenericPreferences = typeof genericPreferences.$inferSelect;
export type InsertGenericPreferences = typeof genericPreferences.$inferInsert;
