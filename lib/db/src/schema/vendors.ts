import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  logoUrl: text("logo_url"),
  verified: boolean("verified").notNull().default(false),
  whatsapp: text("whatsapp"),
  stockAvailable: boolean("stock_available").notNull().default(true),
  deliveryOptions: text("delivery_options"),
  responseTime: text("response_time"),
});

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({ id: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendorsTable.$inferSelect;
