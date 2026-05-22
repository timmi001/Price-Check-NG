import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pricesTable = pgTable("prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  quantity: text("quantity").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPriceSchema = createInsertSchema(pricesTable).omit({ id: true, updatedAt: true });
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type Price = typeof pricesTable.$inferSelect;
