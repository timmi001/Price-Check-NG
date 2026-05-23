import { Router, type IRouter } from "express";
import { db, vendorsTable, pricesTable, vendorReviewsTable, productsTable, categoriesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import {
  ListVendorsQueryParams,
  ListVendorsResponse,
  CreateVendorBody,
  GetVendorParams,
  GetVendorResponse,
  UpdateVendorParams,
  UpdateVendorBody,
  GetVendorProductsParams,
  GetVendorProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const vendorWithRating = {
  id: vendorsTable.id,
  name: vendorsTable.name,
  location: vendorsTable.location,
  address: vendorsTable.address,
  logo_url: vendorsTable.logoUrl,
  verified: vendorsTable.verified,
  whatsapp: vendorsTable.whatsapp,
  stock_available: vendorsTable.stockAvailable,
  delivery_options: vendorsTable.deliveryOptions,
  response_time: vendorsTable.responseTime,
  price_count: sql<number>`count(distinct ${pricesTable.id})::int`,
  average_rating: sql<number>`round(avg(${vendorReviewsTable.rating})::numeric, 1)::float8`,
  rating_count: sql<number>`count(distinct ${vendorReviewsTable.id})::int`,
};

router.get("/vendors", async (req, res): Promise<void> => {
  const parsed = ListVendorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { location, verified } = parsed.data;

  let query = db
    .select(vendorWithRating)
    .from(vendorsTable)
    .leftJoin(pricesTable, eq(pricesTable.vendorId, vendorsTable.id))
    .leftJoin(vendorReviewsTable, eq(vendorReviewsTable.vendorId, vendorsTable.id))
    .groupBy(vendorsTable.id)
    .$dynamic();

  if (location) {
    query = query.where(sql`lower(${vendorsTable.location}) like lower(${"%" + location + "%"})`);
  }
  if (verified !== undefined) {
    query = query.where(eq(vendorsTable.verified, verified));
  }

  const vendors = await query.orderBy(vendorsTable.name);
  res.json(ListVendorsResponse.parse(vendors));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const parsed = CreateVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [vendor] = await db
    .insert(vendorsTable)
    .values({
      name: parsed.data.name,
      location: parsed.data.location,
      address: parsed.data.address,
      logoUrl: parsed.data.logo_url,
      whatsapp: parsed.data.whatsapp,
      deliveryOptions: parsed.data.delivery_options,
      responseTime: parsed.data.response_time,
    })
    .returning();

  res.status(201).json(
    GetVendorResponse.parse({
      ...vendor,
      logo_url: vendor.logoUrl,
      stock_available: vendor.stockAvailable,
      delivery_options: vendor.deliveryOptions,
      response_time: vendor.responseTime,
      price_count: 0,
      average_rating: null,
      rating_count: 0,
    })
  );
});

router.get("/vendors/:id/products", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetVendorProductsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const listings = await db
    .select({
      price_id: pricesTable.id,
      product_id: productsTable.id,
      product_name: productsTable.name,
      category_name: categoriesTable.name,
      unit: productsTable.unit,
      price: sql<number>`${pricesTable.price}::float8`,
      quantity: pricesTable.quantity,
      updated_at: pricesTable.updatedAt,
      stock_available: vendorsTable.stockAvailable,
    })
    .from(pricesTable)
    .innerJoin(productsTable, eq(productsTable.id, pricesTable.productId))
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(eq(pricesTable.vendorId, params.data.id))
    .orderBy(productsTable.name);

  res.json(
    GetVendorProductsResponse.parse(
      listings.map((l) => ({ ...l, updated_at: new Date(l.updated_at).toISOString() }))
    )
  );
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetVendorParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [vendor] = await db
    .select(vendorWithRating)
    .from(vendorsTable)
    .leftJoin(pricesTable, eq(pricesTable.vendorId, vendorsTable.id))
    .leftJoin(vendorReviewsTable, eq(vendorReviewsTable.vendorId, vendorsTable.id))
    .where(eq(vendorsTable.id, params.data.id))
    .groupBy(vendorsTable.id);

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  const recentReviews = await db
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
    .orderBy(sql`${vendorReviewsTable.createdAt} desc`)
    .limit(5);

  res.json(
    GetVendorResponse.parse({
      ...vendor,
      recent_reviews: recentReviews.map((r) => ({
        ...r,
        created_at: new Date(r.created_at).toISOString(),
      })),
    })
  );
});

router.patch("/vendors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateVendorParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateVendorBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.stock_available !== undefined) updateData.stockAvailable = body.data.stock_available;
  if (body.data.delivery_options !== undefined) updateData.deliveryOptions = body.data.delivery_options;
  if (body.data.response_time !== undefined) updateData.responseTime = body.data.response_time;
  if (body.data.whatsapp !== undefined) updateData.whatsapp = body.data.whatsapp;
  if (body.data.address !== undefined) updateData.address = body.data.address;

  const [updated] = await db
    .update(vendorsTable)
    .set(updateData)
    .where(eq(vendorsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  res.json(
    GetVendorResponse.parse({
      ...updated,
      logo_url: updated.logoUrl,
      stock_available: updated.stockAvailable,
      delivery_options: updated.deliveryOptions,
      response_time: updated.responseTime,
      price_count: 0,
      average_rating: null,
      rating_count: 0,
    })
  );
});

export default router;
