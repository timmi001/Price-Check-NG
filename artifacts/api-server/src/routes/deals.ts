import { Router, type IRouter } from "express";
import { db, pricesTable, productsTable, vendorsTable, categoriesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import { ListDealsQueryParams, ListDealsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/deals", async (req, res): Promise<void> => {
  const parsed = ListDealsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category_id } = parsed.data;

  // Get cheapest price per product with vendor info
  const cheapestPrices = await db
    .select({
      product_id: productsTable.id,
      product_name: productsTable.name,
      category_name: categoriesTable.name,
      vendor_name: vendorsTable.name,
      vendor_location: vendorsTable.location,
      vendor_verified: vendorsTable.verified,
      price: sql<number>`min(${pricesTable.price})::numeric`,
      unit: productsTable.unit,
      image_url: productsTable.imageUrl,
      avg_price: sql<number>`round(avg(${pricesTable.price})::numeric, 2)`,
    })
    .from(pricesTable)
    .innerJoin(productsTable, eq(productsTable.id, pricesTable.productId))
    .innerJoin(vendorsTable, eq(vendorsTable.id, pricesTable.vendorId))
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .groupBy(
      productsTable.id,
      productsTable.name,
      categoriesTable.name,
      vendorsTable.name,
      vendorsTable.location,
      vendorsTable.verified,
      productsTable.unit,
      productsTable.imageUrl
    )
    .orderBy(sql`min(${pricesTable.price}) asc`)
    .limit(20);

  // If category filter apply
  const filtered = category_id
    ? cheapestPrices.filter((_, i) => i < 20)
    : cheapestPrices;

  const deals = filtered.map((row) => {
    const discountPct = row.avg_price
      ? Number((((Number(row.avg_price) - Number(row.price)) / Number(row.avg_price)) * 100).toFixed(1))
      : 0;
    return {
      product_id: row.product_id,
      product_name: row.product_name,
      category_name: row.category_name ?? "",
      vendor_name: row.vendor_name,
      vendor_location: row.vendor_location,
      vendor_verified: row.vendor_verified ?? false,
      price: Number(row.price),
      unit: row.unit,
      original_avg_price: Number(row.avg_price),
      discount_pct: discountPct,
      image_url: row.image_url ?? null,
    };
  });

  res.json(ListDealsResponse.parse(deals));
});

export default router;
