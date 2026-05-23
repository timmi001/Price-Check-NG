import { Router, type IRouter } from "express";
import { db, pricesTable, vendorsTable, productsTable, priceHistoryTable, vendorReviewsTable } from "@workspace/db";
import { sql, eq, asc } from "drizzle-orm";
import {
  ListPricesQueryParams,
  ListPricesResponse,
  SubmitPriceBody,
  GetPriceHistoryQueryParams,
  GetPriceHistoryResponse,
  GetPriceSummaryQueryParams,
  GetPriceSummaryResponse,
  UpdatePriceParams,
  UpdatePriceBody,
  UpdatePriceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/prices", async (req, res): Promise<void> => {
  const parsed = ListPricesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { product_id, sort } = parsed.data;

  const allPrices = await db
    .select({
      id: pricesTable.id,
      product_id: pricesTable.productId,
      vendor_id: pricesTable.vendorId,
      vendor_name: vendorsTable.name,
      vendor_location: vendorsTable.location,
      vendor_logo_url: vendorsTable.logoUrl,
      vendor_verified: vendorsTable.verified,
      vendor_whatsapp: vendorsTable.whatsapp,
      vendor_stock_available: vendorsTable.stockAvailable,
      vendor_delivery_options: vendorsTable.deliveryOptions,
      vendor_response_time: vendorsTable.responseTime,
      vendor_rating: sql<number>`round(avg(${vendorReviewsTable.rating})::numeric, 1)::float8`,
      vendor_rating_count: sql<number>`count(${vendorReviewsTable.id})::int`,
      price: sql<number>`${pricesTable.price}::float8`,
      quantity: pricesTable.quantity,
      updated_at: pricesTable.updatedAt,
    })
    .from(pricesTable)
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .leftJoin(vendorReviewsTable, eq(vendorReviewsTable.vendorId, vendorsTable.id))
    .where(eq(pricesTable.productId, Number(product_id)))
    .groupBy(pricesTable.id, vendorsTable.id)
    .orderBy(asc(pricesTable.price));

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices.map((p) => Number(p.price))) : null;
  const maxRating = allPrices.length > 0 ? Math.max(...allPrices.map((p) => Number(p.vendor_rating ?? 0))) : null;

  let sorted = [...allPrices];
  if (sort === "high_to_low") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === "best_rated") {
    sorted.sort((a, b) => Number(b.vendor_rating ?? 0) - Number(a.vendor_rating ?? 0));
  } else if (sort === "recently_updated") {
    sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  const result = sorted.map((p) => ({
    ...p,
    vendor_logo_url: p.vendor_logo_url ?? null,
    vendor_whatsapp: p.vendor_whatsapp ?? null,
    vendor_verified: p.vendor_verified ?? false,
    vendor_stock_available: p.vendor_stock_available ?? true,
    vendor_delivery_options: p.vendor_delivery_options ?? null,
    vendor_response_time: p.vendor_response_time ?? null,
    vendor_rating: p.vendor_rating ?? null,
    vendor_rating_count: p.vendor_rating_count ?? 0,
    is_cheapest: minPrice !== null && Number(p.price) === minPrice,
    is_best_rated: maxRating !== null && maxRating > 0 && Number(p.vendor_rating ?? 0) === maxRating,
    updated_at: new Date(p.updated_at).toISOString(),
  }));

  res.json(ListPricesResponse.parse(result));
});

router.post("/prices", async (req, res): Promise<void> => {
  const parsed = SubmitPriceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [price] = await db
    .insert(pricesTable)
    .values({
      productId: parsed.data.product_id,
      vendorId: parsed.data.vendor_id,
      price: String(parsed.data.price),
      quantity: parsed.data.quantity,
    })
    .returning();

  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, price.vendorId));

  res.status(201).json({
    id: price.id,
    product_id: price.productId,
    vendor_id: price.vendorId,
    vendor_name: vendor?.name ?? "",
    vendor_location: vendor?.location ?? "",
    vendor_logo_url: vendor?.logoUrl ?? null,
    vendor_verified: vendor?.verified ?? false,
    vendor_whatsapp: vendor?.whatsapp ?? null,
    vendor_stock_available: vendor?.stockAvailable ?? true,
    vendor_delivery_options: vendor?.deliveryOptions ?? null,
    vendor_response_time: vendor?.responseTime ?? null,
    vendor_rating: null,
    vendor_rating_count: 0,
    price: Number(price.price),
    quantity: price.quantity,
    is_cheapest: false,
    is_best_rated: false,
    updated_at: price.updatedAt.toISOString(),
  });
});

router.patch("/prices/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePriceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdatePriceBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.price !== undefined) updateData.price = String(body.data.price);
  if (body.data.quantity !== undefined) updateData.quantity = body.data.quantity;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(pricesTable)
    .set(updateData)
    .where(eq(pricesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Price not found" });
    return;
  }

  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, updated.vendorId));

  res.json(
    UpdatePriceResponse.parse({
      id: updated.id,
      product_id: updated.productId,
      vendor_id: updated.vendorId,
      vendor_name: vendor?.name ?? "",
      vendor_location: vendor?.location ?? "",
      vendor_logo_url: vendor?.logoUrl ?? null,
      vendor_verified: vendor?.verified ?? false,
      vendor_whatsapp: vendor?.whatsapp ?? null,
      vendor_stock_available: vendor?.stockAvailable ?? true,
      vendor_delivery_options: vendor?.deliveryOptions ?? null,
      vendor_response_time: vendor?.responseTime ?? null,
      vendor_rating: null,
      vendor_rating_count: 0,
      price: Number(updated.price),
      quantity: updated.quantity,
      is_cheapest: false,
      is_best_rated: false,
      updated_at: new Date(updated.updatedAt).toISOString(),
    })
  );
});

router.get("/price-history", async (req, res): Promise<void> => {
  const parsed = GetPriceHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const history = await db
    .select({
      date: priceHistoryTable.date,
      average_price: sql<number>`${priceHistoryTable.averagePrice}::float8`,
      min_price: sql<number>`${priceHistoryTable.minPrice}::float8`,
    })
    .from(priceHistoryTable)
    .where(eq(priceHistoryTable.productId, Number(parsed.data.product_id)))
    .orderBy(asc(priceHistoryTable.date))
    .limit(30);

  res.json(GetPriceHistoryResponse.parse(history));
});

router.get("/price-summary", async (req, res): Promise<void> => {
  const parsed = GetPriceSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const productId = Number(parsed.data.product_id);

  const [stats] = await db
    .select({
      average_price: sql<number>`round(avg(${pricesTable.price})::numeric, 2)::float8`,
      min_price: sql<number>`round(min(${pricesTable.price})::numeric, 2)::float8`,
      max_price: sql<number>`round(max(${pricesTable.price})::numeric, 2)::float8`,
      vendor_count: sql<number>`count(distinct ${pricesTable.vendorId})::int`,
    })
    .from(pricesTable)
    .where(eq(pricesTable.productId, productId));

  const cheapestVendorRow = await db
    .select({ name: vendorsTable.name })
    .from(pricesTable)
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .where(eq(pricesTable.productId, productId))
    .orderBy(asc(pricesTable.price))
    .limit(1);

  const [history30] = await db
    .select({
      avg30: sql<number>`round(avg(${priceHistoryTable.averagePrice})::numeric, 2)::float8`,
    })
    .from(priceHistoryTable)
    .where(eq(priceHistoryTable.productId, productId));

  const avg30 = history30?.avg30 ?? null;
  const currentAvg = stats?.average_price ?? null;
  const priceChangePct =
    avg30 && currentAvg
      ? Number((((Number(currentAvg) - Number(avg30)) / Number(avg30)) * 100).toFixed(1))
      : 0;

  res.json(
    GetPriceSummaryResponse.parse({
      product_id: productId,
      average_price: Number(stats?.average_price ?? 0),
      min_price: Number(stats?.min_price ?? 0),
      max_price: Number(stats?.max_price ?? 0),
      price_change_pct: priceChangePct,
      vendor_count: stats?.vendor_count ?? 0,
      cheapest_vendor: cheapestVendorRow[0]?.name ?? null,
    })
  );
});

export default router;
