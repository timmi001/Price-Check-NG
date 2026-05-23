import { Router, type IRouter } from "express";
import { db, vendorReviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListVendorReviewsParams,
  ListVendorReviewsResponse,
  ListVendorReviewsResponseItem,
  CreateVendorReviewBody,
  CreateVendorReviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vendors/:id/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListVendorReviewsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select({
      id: vendorReviewsTable.id,
      vendor_id: vendorReviewsTable.vendorId,
      rating: vendorReviewsTable.rating,
      reviewer_name: vendorReviewsTable.reviewerName,
      comment: vendorReviewsTable.comment,
      created_at: vendorReviewsTable.createdAt,
    })
    .from(vendorReviewsTable)
    .where(eq(vendorReviewsTable.vendorId, params.data.id))
    .orderBy(desc(vendorReviewsTable.createdAt))
    .limit(20);

  res.json(
    ListVendorReviewsResponse.parse(
      reviews.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() }))
    )
  );
});

router.post("/vendors/:id/reviews", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateVendorReviewParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateVendorReviewBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (body.data.rating < 1 || body.data.rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  const [review] = await db
    .insert(vendorReviewsTable)
    .values({
      vendorId: params.data.id,
      rating: body.data.rating,
      reviewerName: body.data.reviewer_name,
      comment: body.data.comment ?? null,
    })
    .returning();

  res.status(201).json(
    ListVendorReviewsResponseItem.parse({
      id: review.id,
      vendor_id: review.vendorId,
      rating: review.rating,
      reviewer_name: review.reviewerName,
      comment: review.comment ?? null,
      created_at: new Date(review.createdAt).toISOString(),
    })
  );
});

export default router;
