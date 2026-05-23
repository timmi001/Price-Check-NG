import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorReviewsTable = pgTable("vendor_reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  rating: integer("rating").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(vendorReviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type VendorReview = typeof vendorReviewsTable.$inferSelect;
