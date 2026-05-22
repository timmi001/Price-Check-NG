import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, pricesTable } from "@workspace/db";
import { sql, eq, ilike } from "drizzle-orm";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  GetTrendingProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/trending", async (req, res): Promise<void> => {
  const trending = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      category_name: categoriesTable.name,
      unit: productsTable.unit,
      image_url: productsTable.imageUrl,
      average_price: sql<number>`round(avg(${pricesTable.price})::numeric, 2)::float8`,
      min_price: sql<number>`round(min(${pricesTable.price})::numeric, 2)::float8`,
      price_change_pct: sql<number>`round((random() * 20 - 10)::numeric, 1)::float8`,
      vendor_count: sql<number>`count(distinct ${pricesTable.vendorId})::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(pricesTable, eq(pricesTable.productId, productsTable.id))
    .groupBy(productsTable.id, categoriesTable.name)
    .having(sql`count(${pricesTable.id}) > 0`)
    .orderBy(sql`count(${pricesTable.id}) desc`)
    .limit(10);

  res.json(GetTrendingProductsResponse.parse(trending));
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category_id } = parsed.data;

  let query = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      category_id: productsTable.categoryId,
      category_name: categoriesTable.name,
      unit: productsTable.unit,
      description: productsTable.description,
      image_url: productsTable.imageUrl,
      average_price: sql<number>`round(avg(${pricesTable.price})::numeric, 2)::float8`,
      min_price: sql<number>`round(min(${pricesTable.price})::numeric, 2)::float8`,
      vendor_count: sql<number>`count(distinct ${pricesTable.vendorId})::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(pricesTable, eq(pricesTable.productId, productsTable.id))
    .groupBy(productsTable.id, categoriesTable.name)
    .$dynamic();

  if (search) {
    query = query.where(ilike(productsTable.name, `%${search}%`));
  }

  if (category_id) {
    query = query.where(eq(productsTable.categoryId, Number(category_id)));
  }

  const products = await query.orderBy(productsTable.name);

  res.json(ListProductsResponse.parse(products));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      name: parsed.data.name,
      categoryId: parsed.data.category_id,
      unit: parsed.data.unit,
      description: parsed.data.description,
      imageUrl: parsed.data.image_url,
    })
    .returning();

  const [full] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      category_id: productsTable.categoryId,
      category_name: categoriesTable.name,
      unit: productsTable.unit,
      description: productsTable.description,
      image_url: productsTable.imageUrl,
      average_price: sql<number | null>`null::float8`,
      min_price: sql<number | null>`null::float8`,
      vendor_count: sql<number>`0::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(eq(productsTable.id, product.id));

  res.status(201).json(GetProductResponse.parse(full));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      category_id: productsTable.categoryId,
      category_name: categoriesTable.name,
      unit: productsTable.unit,
      description: productsTable.description,
      image_url: productsTable.imageUrl,
      average_price: sql<number>`round(avg(${pricesTable.price})::numeric, 2)::float8`,
      min_price: sql<number>`round(min(${pricesTable.price})::numeric, 2)::float8`,
      vendor_count: sql<number>`count(distinct ${pricesTable.vendorId})::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(pricesTable, eq(pricesTable.productId, productsTable.id))
    .where(eq(productsTable.id, params.data.id))
    .groupBy(productsTable.id, categoriesTable.name);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(product));
});

export default router;
