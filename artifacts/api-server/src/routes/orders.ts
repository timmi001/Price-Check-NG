import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, vendorsTable, pricesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const toOrderRow = (o: any) => ({
  ...o,
  created_at: new Date(o.created_at).toISOString(),
});

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { vendor_id, status } = parsed.data;

  let query = db
    .select({
      id: ordersTable.id,
      product_id: ordersTable.productId,
      vendor_id: ordersTable.vendorId,
      product_name: productsTable.name,
      vendor_name: vendorsTable.name,
      vendor_whatsapp: vendorsTable.whatsapp,
      quantity: ordersTable.quantity,
      buyer_name: ordersTable.buyerName,
      buyer_phone: ordersTable.buyerPhone,
      notes: ordersTable.notes,
      status: ordersTable.status,
      price_at_order: sql<number>`(
        select ${pricesTable.price}::float8 from ${pricesTable}
        where ${pricesTable.productId} = ${ordersTable.productId}
          and ${pricesTable.vendorId} = ${ordersTable.vendorId}
        order by ${pricesTable.updatedAt} desc limit 1
      )`,
      created_at: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(productsTable, eq(productsTable.id, ordersTable.productId))
    .leftJoin(vendorsTable, eq(vendorsTable.id, ordersTable.vendorId))
    .$dynamic();

  if (vendor_id) {
    query = query.where(eq(ordersTable.vendorId, Number(vendor_id)));
  }
  if (status) {
    query = query.where(eq(ordersTable.status, String(status)));
  }

  const orders = await query.orderBy(sql`${ordersTable.createdAt} desc`);
  res.json(ListOrdersResponse.parse(orders.map(toOrderRow)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      productId: body.data.product_id,
      vendorId: body.data.vendor_id,
      quantity: body.data.quantity,
      buyerName: body.data.buyer_name,
      buyerPhone: body.data.buyer_phone ?? null,
      notes: body.data.notes ?? null,
    })
    .returning();

  const [product] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, order.productId));
  const [vendor] = await db.select({ name: vendorsTable.name, whatsapp: vendorsTable.whatsapp }).from(vendorsTable).where(eq(vendorsTable.id, order.vendorId));

  res.status(201).json(
    GetOrderResponse.parse({
      id: order.id,
      product_id: order.productId,
      vendor_id: order.vendorId,
      product_name: product?.name ?? null,
      vendor_name: vendor?.name ?? null,
      vendor_whatsapp: vendor?.whatsapp ?? null,
      quantity: order.quantity,
      buyer_name: order.buyerName,
      buyer_phone: order.buyerPhone ?? null,
      notes: order.notes ?? null,
      status: order.status,
      price_at_order: body.data.price_at_order ?? null,
      created_at: new Date(order.createdAt).toISOString(),
    })
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select({
      id: ordersTable.id,
      product_id: ordersTable.productId,
      vendor_id: ordersTable.vendorId,
      product_name: productsTable.name,
      vendor_name: vendorsTable.name,
      vendor_whatsapp: vendorsTable.whatsapp,
      quantity: ordersTable.quantity,
      buyer_name: ordersTable.buyerName,
      buyer_phone: ordersTable.buyerPhone,
      notes: ordersTable.notes,
      status: ordersTable.status,
      price_at_order: sql<number>`null::float8`,
      created_at: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(productsTable, eq(productsTable.id, ordersTable.productId))
    .leftJoin(vendorsTable, eq(vendorsTable.id, ordersTable.vendorId))
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(toOrderRow(order)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateOrderStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const validStatuses = ["pending", "confirmed", "delivered", "cancelled"];
  if (!validStatuses.includes(body.data.status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [product] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, updated.productId));
  const [vendor] = await db.select({ name: vendorsTable.name, whatsapp: vendorsTable.whatsapp }).from(vendorsTable).where(eq(vendorsTable.id, updated.vendorId));

  res.json(
    UpdateOrderStatusResponse.parse({
      id: updated.id,
      product_id: updated.productId,
      vendor_id: updated.vendorId,
      product_name: product?.name ?? null,
      vendor_name: vendor?.name ?? null,
      vendor_whatsapp: vendor?.whatsapp ?? null,
      quantity: updated.quantity,
      buyer_name: updated.buyerName,
      buyer_phone: updated.buyerPhone ?? null,
      notes: updated.notes ?? null,
      status: updated.status,
      price_at_order: null,
      created_at: new Date(updated.createdAt).toISOString(),
    })
  );
});

export default router;
