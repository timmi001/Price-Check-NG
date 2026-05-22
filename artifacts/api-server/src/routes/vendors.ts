import { Router, type IRouter } from "express";
import { db, vendorsTable, pricesTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import {
  ListVendorsQueryParams,
  ListVendorsResponse,
  CreateVendorBody,
  GetVendorParams,
  GetVendorResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vendors", async (req, res): Promise<void> => {
  const parsed = ListVendorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { location, verified } = parsed.data;

  let query = db
    .select({
      id: vendorsTable.id,
      name: vendorsTable.name,
      location: vendorsTable.location,
      address: vendorsTable.address,
      logo_url: vendorsTable.logoUrl,
      verified: vendorsTable.verified,
      whatsapp: vendorsTable.whatsapp,
      price_count: sql<number>`count(${pricesTable.id})::int`,
    })
    .from(vendorsTable)
    .leftJoin(pricesTable, eq(pricesTable.vendorId, vendorsTable.id))
    .groupBy(vendorsTable.id)
    .$dynamic();

  if (location) {
    query = query.where(sql`lower(${vendorsTable.location}) like lower(${'%' + location + '%'})`);
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
    })
    .returning();

  res.status(201).json(GetVendorResponse.parse({ ...vendor, logo_url: vendor.logoUrl, price_count: 0 }));
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetVendorParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [vendor] = await db
    .select({
      id: vendorsTable.id,
      name: vendorsTable.name,
      location: vendorsTable.location,
      address: vendorsTable.address,
      logo_url: vendorsTable.logoUrl,
      verified: vendorsTable.verified,
      whatsapp: vendorsTable.whatsapp,
      price_count: sql<number>`count(${pricesTable.id})::int`,
    })
    .from(vendorsTable)
    .leftJoin(pricesTable, eq(pricesTable.vendorId, vendorsTable.id))
    .where(eq(vendorsTable.id, params.data.id))
    .groupBy(vendorsTable.id);

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }

  res.json(GetVendorResponse.parse(vendor));
});

export default router;
