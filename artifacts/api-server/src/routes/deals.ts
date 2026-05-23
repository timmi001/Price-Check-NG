import { Router, type IRouter } from "express";
import { db, pricesTable, productsTable, vendorsTable, categoriesTable, vendorReviewsTable } from "@workspace/db";
import { sql, eq, asc } from "drizzle-orm";
import {
  ListDealsQueryParams,
  ListDealsResponse,
  GetBestDealQueryParams,
  GetBestDealResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/best-deal", async (req, res): Promise<void> => {
  const parsed = GetBestDealQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const productId = Number(parsed.data.product_id);

  const allPrices = await db
    .select({
      vendor_id: vendorsTable.id,
      vendor_name: vendorsTable.name,
      vendor_location: vendorsTable.location,
      vendor_logo_url: vendorsTable.logoUrl,
      vendor_verified: vendorsTable.verified,
      vendor_whatsapp: vendorsTable.whatsapp,
      vendor_stock_available: vendorsTable.stockAvailable,
      vendor_response_time: vendorsTable.responseTime,
      price: sql<number>`${pricesTable.price}::float8`,
      quantity: pricesTable.quantity,
      vendor_rating: sql<number>`round(avg(${vendorReviewsTable.rating})::numeric, 1)::float8`,
    })
    .from(pricesTable)
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .leftJoin(vendorReviewsTable, eq(vendorReviewsTable.vendorId, vendorsTable.id))
    .where(eq(pricesTable.productId, productId))
    .groupBy(pricesTable.id, vendorsTable.id)
    .orderBy(asc(pricesTable.price));

  if (allPrices.length === 0) {
    res.json(GetBestDealResponse.parse({ product_id: productId, options: [] }));
    return;
  }

  const cheapest = [...allPrices].sort((a, b) => Number(a.price) - Number(b.price))[0];
  const bestRated = [...allPrices].sort((a, b) => Number(b.vendor_rating ?? 0) - Number(a.vendor_rating ?? 0))[0];

  const toOption = (p: typeof allPrices[0], label: string, badge: string) => ({
    label,
    badge,
    vendor_id: p.vendor_id,
    vendor_name: p.vendor_name,
    vendor_location: p.vendor_location,
    vendor_logo_url: p.vendor_logo_url ?? null,
    vendor_verified: p.vendor_verified ?? false,
    vendor_whatsapp: p.vendor_whatsapp ?? null,
    vendor_rating: p.vendor_rating ?? null,
    vendor_stock_available: p.vendor_stock_available ?? true,
    price: Number(p.price),
    quantity: p.quantity,
  });

  const options = [toOption(cheapest, "Best Price", "💰 Cheapest")];

  if (bestRated.vendor_id !== cheapest.vendor_id && (bestRated.vendor_rating ?? 0) > 0) {
    options.push(toOption(bestRated, "Best Rated", "⭐ Top Rated"));
  }

  if (allPrices.length > 2) {
    const mid = allPrices[Math.floor(allPrices.length / 2)];
    if (mid.vendor_id !== cheapest.vendor_id && mid.vendor_id !== bestRated.vendor_id) {
      options.push(toOption(mid, "Popular Choice", "🔥 Popular"));
    }
  }

  res.json(GetBestDealResponse.parse({ product_id: productId, options }));
});

router.get("/deals", async (req, res): Promise<void> => {
  const parsed = ListDealsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category_id } = parsed.data;

  const subquery = db
    .select({
      product_id: pricesTable.productId,
      min_price: sql<number>`min(${pricesTable.price}::float8)`.as("min_price"),
    })
    .from(pricesTable)
    .groupBy(pricesTable.productId)
    .as("min_prices");

  let query = db
    .select({
      product_id: productsTable.id,
      product_name: productsTable.name,
      category_name: categoriesTable.name,
      vendor_id: vendorsTable.id,
      vendor_name: vendorsTable.name,
      vendor_location: vendorsTable.location,
      vendor_verified: vendorsTable.verified,
      vendor_whatsapp: vendorsTable.whatsapp,
      vendor_rating: sql<number>`round(avg(${vendorReviewsTable.rating})::numeric, 1)::float8`,
      price: sql<number>`${pricesTable.price}::float8`,
      unit: productsTable.unit,
      image_url: productsTable.imageUrl,
      avg_price: sql<number>`round((select avg(p2.price) from prices p2 where p2.product_id = ${productsTable.id})::numeric, 2)::float8`,
    })
    .from(pricesTable)
    .innerJoin(productsTable, eq(productsTable.id, pricesTable.productId))
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(vendorReviewsTable, eq(vendorReviewsTable.vendorId, vendorsTable.id))
    .innerJoin(subquery, sql`${subquery.product_id} = ${pricesTable.productId} and ${pricesTable.price}::float8 = ${subquery.min_price}`)
    .groupBy(
      productsTable.id,
      productsTable.name,
      categoriesTable.name,
      vendorsTable.id,
      vendorsTable.name,
      vendorsTable.location,
      vendorsTable.verified,
      vendorsTable.whatsapp,
      pricesTable.price,
      productsTable.unit,
      productsTable.imageUrl
    )
    .$dynamic();

  if (category_id) {
    query = query.where(eq(productsTable.categoryId, Number(category_id)));
  }

  const rows = await query.orderBy(sql`${pricesTable.price}::float8 asc`).limit(20);

  const deals = rows.map((row) => {
    const discountPct = row.avg_price && Number(row.avg_price) > Number(row.price)
      ? Number((((Number(row.avg_price) - Number(row.price)) / Number(row.avg_price)) * 100).toFixed(1))
      : 0;
    return {
      product_id: row.product_id,
      product_name: row.product_name,
      category_name: row.category_name ?? "",
      vendor_id: row.vendor_id,
      vendor_name: row.vendor_name,
      vendor_location: row.vendor_location,
      vendor_verified: row.vendor_verified ?? false,
      vendor_whatsapp: row.vendor_whatsapp ?? null,
      vendor_rating: row.vendor_rating ?? null,
      price: Number(row.price),
      unit: row.unit,
      original_avg_price: Number(row.avg_price ?? row.price),
      discount_pct: discountPct,
      image_url: row.image_url ?? null,
    };
  });

  res.json(ListDealsResponse.parse(deals));
});

export default router;
