import { Router, type IRouter } from "express";
import { db, pricesTable, vendorsTable, productsTable, priceHistoryTable } from "@workspace/db";
import { sql, eq, asc } from "drizzle-orm";
import {
  ListPricesQueryParams,
  ListPricesResponse,
  SubmitPriceBody,
  GetPriceHistoryQueryParams,
  GetPriceHistoryResponse,
  GetPriceSummaryQueryParams,
  GetPriceSummaryResponse,
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
      price: sql<number>`${pricesTable.price}::float8`,
      quantity: pricesTable.quantity,
      updated_at: pricesTable.updatedAt,
    })
    .from(pricesTable)
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .where(eq(pricesTable.productId, Number(product_id)))
    .orderBy(asc(pricesTable.price));

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices.map((p) => Number(p.price))) : null;

  let sorted = allPrices;
  if (sort === "high_to_low") {
    sorted = [...allPrices].sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === "recently_updated") {
    sorted = [...allPrices].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  const result = sorted.map((p) => ({
    ...p,
    vendor_logo_url: p.vendor_logo_url ?? null,
    vendor_whatsapp: p.vendor_whatsapp ?? null,
    vendor_verified: p.vendor_verified ?? false,
    is_cheapest: minPrice !== null && Number(p.price) === minPrice,
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
    price: Number(price.price),
    quantity: price.quantity,
    is_cheapest: false,
    updated_at: price.updatedAt.toISOString(),
  });
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
