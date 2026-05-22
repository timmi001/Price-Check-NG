import { Router, type IRouter } from "express";
import { db, alertsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListAlertsResponse,
  CreateAlertBody,
  DeleteAlertParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const alerts = await db
    .select({
      id: alertsTable.id,
      product_id: alertsTable.productId,
      product_name: productsTable.name,
      target_price: alertsTable.targetPrice,
      email: alertsTable.email,
      location: alertsTable.location,
      created_at: alertsTable.createdAt,
    })
    .from(alertsTable)
    .leftJoin(productsTable, eq(productsTable.id, alertsTable.productId))
    .orderBy(alertsTable.createdAt);

  const mapped = alerts.map((a) => ({
    ...a,
    target_price: Number(a.target_price),
    created_at: new Date(a.created_at).toISOString(),
  }));

  res.json(ListAlertsResponse.parse(mapped));
});

router.post("/alerts", async (req, res): Promise<void> => {
  const parsed = CreateAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [alert] = await db
    .insert(alertsTable)
    .values({
      productId: parsed.data.product_id,
      targetPrice: String(parsed.data.target_price),
      email: parsed.data.email,
      location: parsed.data.location,
    })
    .returning();

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, alert.productId));

  res.status(201).json({
    id: alert.id,
    product_id: alert.productId,
    product_name: product?.name ?? null,
    target_price: Number(alert.targetPrice),
    email: alert.email,
    location: alert.location ?? null,
    created_at: alert.createdAt.toISOString(),
  });
});

router.delete("/alerts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteAlertParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(alertsTable)
    .where(eq(alertsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
