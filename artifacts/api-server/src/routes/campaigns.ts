import { Router, type Request, type Response } from "express";
import { eq, desc, count, and, sql, isNull } from "drizzle-orm";
import {
  db, campaignsTable, leadsTable, usersTable,
  campaignExpensesTable, levelsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function enrichCampaign(c: typeof campaignsTable.$inferSelect) {
  const [stats] = await db
    .select({
      total: count(),
      newCount: sql<number>`SUM(CASE WHEN ${leadsTable.status} = 'new' THEN 1 ELSE 0 END)`,
      registeredCount: sql<number>`SUM(CASE WHEN ${leadsTable.status} = 'registered' THEN 1 ELSE 0 END)`,
    })
    .from(leadsTable)
    .where(eq(leadsTable.campaignId, c.id));

  let assignee = null;
  if (c.assignedTo) {
    const [u] = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, c.assignedTo));
    assignee = u ?? null;
  }

  return {
    ...c,
    leadsCount: stats?.total ?? 0,
    newLeadsCount: stats?.newCount ?? 0,
    registeredCount: stats?.registeredCount ?? 0,
    conversionRate:
      stats && stats.total > 0
        ? Math.round(((stats.registeredCount ?? 0) / stats.total) * 100)
        : null,
    assignee,
  };
}

// ── LIST campaigns ─────────────────────────────────────────────────────────────
router.get("/campaigns", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const rows = await db
    .select()
    .from(campaignsTable)
    .orderBy(desc(campaignsTable.createdAt));

  const enriched = await Promise.all(rows.map(enrichCampaign));
  res.json(enriched);
});

// ── GET single campaign ────────────────────────────────────────────────────────
router.get("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [c] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));
  if (!c) return res.status(404).json({ error: "Campaign not found" });

  res.json(await enrichCampaign(c));
});

// ── CREATE campaign ────────────────────────────────────────────────────────────
router.post("/campaigns", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin"].includes(user.role)) {
    return res.status(403).json({ error: "Admin only" });
  }

  const {
    name, nameAr, type, startDate, endDate, ctaType,
    whatsappNumber, description, descriptionAr, branchId, assignedTo,
    landingPageEnabled, landingPageTitle, landingPageSubtitle, landingPageColor,
  } = req.body;

  if (!name || !nameAr || !startDate || !endDate) {
    return res.status(400).json({ error: "name, nameAr, startDate, endDate are required" });
  }

  let slug = slugify(name);
  const existing = await db
    .select({ id: campaignsTable.id })
    .from(campaignsTable)
    .where(eq(campaignsTable.slug, slug));
  if (existing.length > 0) slug = `${slug}-${Date.now()}`;

  const [campaign] = await db
    .insert(campaignsTable)
    .values({
      name: name.trim(),
      nameAr: nameAr.trim(),
      type: type ?? "custom",
      status: "active",
      startDate,
      endDate,
      ctaType: ctaType ?? "form",
      whatsappNumber: whatsappNumber ?? null,
      description: description ?? null,
      descriptionAr: descriptionAr ?? null,
      slug,
      branchId: branchId ? parseInt(branchId) : null,
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      createdBy: user.id,
      landingPageEnabled: landingPageEnabled ?? false,
      landingPageTitle: landingPageTitle ?? null,
      landingPageSubtitle: landingPageSubtitle ?? null,
      landingPageColor: landingPageColor ?? "#1B2E8F",
    })
    .returning();

  res.status(201).json(await enrichCampaign(campaign));
});

// ── UPDATE campaign ────────────────────────────────────────────────────────────
router.put("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin"].includes(user.role)) {
    return res.status(403).json({ error: "Admin only" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const {
    name, nameAr, type, status, startDate, endDate, ctaType,
    whatsappNumber, description, descriptionAr, branchId, assignedTo,
    landingPageEnabled, landingPageTitle, landingPageSubtitle, landingPageColor,
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (nameAr !== undefined) updates.nameAr = nameAr.trim();
  if (type !== undefined) updates.type = type;
  if (status !== undefined) updates.status = status;
  if (startDate !== undefined) updates.startDate = startDate;
  if (endDate !== undefined) updates.endDate = endDate;
  if (ctaType !== undefined) updates.ctaType = ctaType;
  if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber || null;
  if (description !== undefined) updates.description = description || null;
  if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr || null;
  if (branchId !== undefined) updates.branchId = branchId ? parseInt(branchId) : null;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo ? parseInt(assignedTo) : null;
  if (landingPageEnabled !== undefined) updates.landingPageEnabled = landingPageEnabled;
  if (landingPageTitle !== undefined) updates.landingPageTitle = landingPageTitle || null;
  if (landingPageSubtitle !== undefined) updates.landingPageSubtitle = landingPageSubtitle || null;
  if (landingPageColor !== undefined) updates.landingPageColor = landingPageColor || "#1B2E8F";

  const [updated] = await db
    .update(campaignsTable)
    .set(updates)
    .where(eq(campaignsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Campaign not found" });
  res.json(await enrichCampaign(updated));
});

// ── DELETE campaign ────────────────────────────────────────────────────────────
router.delete("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin"].includes(user.role)) {
    return res.status(403).json({ error: "Admin only" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  await db.delete(campaignsTable).where(eq(campaignsTable.id, id));
  res.json({ message: "Deleted" });
});

// ── LIST leads for a campaign ──────────────────────────────────────────────────
router.get("/campaigns/:id/leads", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const campaignId = parseInt(req.params.id);
  if (isNaN(campaignId)) return res.status(400).json({ error: "Invalid id" });

  const leads = await db
    .select({
      id: leadsTable.id,
      campaignId: leadsTable.campaignId,
      parentName: leadsTable.parentName,
      parentPhone: leadsTable.parentPhone,
      parentEmail: leadsTable.parentEmail,
      childName: leadsTable.childName,
      childAge: leadsTable.childAge,
      preferredLevel: leadsTable.preferredLevel,
      source: leadsTable.source,
      status: leadsTable.status,
      notes: leadsTable.notes,
      followUpDate: leadsTable.followUpDate,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      assigneeName: usersTable.name,
    })
    .from(leadsTable)
    .leftJoin(usersTable, eq(leadsTable.assignedTo, usersTable.id))
    .where(eq(leadsTable.campaignId, campaignId))
    .orderBy(desc(leadsTable.createdAt));

  res.json(leads);
});

// ── LIST standalone leads (no campaign) ───────────────────────────────────────
router.get("/leads", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const leads = await db
    .select({
      id: leadsTable.id,
      campaignId: leadsTable.campaignId,
      parentName: leadsTable.parentName,
      parentPhone: leadsTable.parentPhone,
      parentEmail: leadsTable.parentEmail,
      childName: leadsTable.childName,
      childAge: leadsTable.childAge,
      preferredLevel: leadsTable.preferredLevel,
      source: leadsTable.source,
      status: leadsTable.status,
      notes: leadsTable.notes,
      followUpDate: leadsTable.followUpDate,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      assigneeName: usersTable.name,
    })
    .from(leadsTable)
    .leftJoin(usersTable, eq(leadsTable.assignedTo, usersTable.id))
    .where(isNull(leadsTable.campaignId))
    .orderBy(desc(leadsTable.createdAt));

  res.json(leads);
});

// ── ADD standalone lead ────────────────────────────────────────────────────────
router.post("/leads", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { parentName, parentPhone, parentEmail, childName, childAge, preferredLevel, source, notes, followUpDate, assignedTo } = req.body;
  if (!parentName || !parentPhone || !childName) {
    return res.status(400).json({ error: "parentName, parentPhone, childName required" });
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      campaignId: null,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail ?? null,
      childName: childName.trim(),
      childAge: childAge ?? null,
      preferredLevel: preferredLevel ?? null,
      source: source ?? "call",
      status: "new",
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      notes: notes ?? null,
      followUpDate: followUpDate ?? null,
    })
    .returning();

  res.status(201).json(lead);
});

// ── PUBLIC submit form (no auth) ───────────────────────────────────────────────
router.post("/campaigns/:slug/submit", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.slug, slug), eq(campaignsTable.status, "active")));

  if (!campaign) return res.status(404).json({ error: "Campaign not found or inactive" });

  const { parentName, parentPhone, parentEmail, childName, childAge, preferredLevel, notes } = req.body;
  if (!parentName || !parentPhone || !childName) {
    return res.status(400).json({ error: "parentName, parentPhone, childName are required" });
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      campaignId: campaign.id,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail ?? null,
      childName: childName.trim(),
      childAge: childAge ?? null,
      preferredLevel: preferredLevel ?? null,
      source: "form",
      status: "new",
      assignedTo: campaign.assignedTo ?? null,
      notes: notes ?? null,
    })
    .returning();

  res.status(201).json({ id: lead.id, message: "Submitted successfully" });
});

// ── PUBLIC get campaign info (for landing pages) ───────────────────────────────
router.get("/public/campaigns/:slug", async (req: Request, res: Response) => {
  const [c] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.slug, req.params.slug), eq(campaignsTable.status, "active")));

  if (!c) return res.status(404).json({ error: "Not found" });

  res.json({
    id: c.id,
    name: c.name,
    nameAr: c.nameAr,
    slug: c.slug,
    ctaType: c.ctaType,
    whatsappNumber: c.whatsappNumber,
    landingPageTitle: c.landingPageTitle,
    landingPageSubtitle: c.landingPageSubtitle,
    landingPageColor: c.landingPageColor,
  });
});

// ── ADD lead manually (authenticated) ─────────────────────────────────────────
router.post("/campaigns/:id/leads", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const campaignId = parseInt(req.params.id);
  if (isNaN(campaignId)) return res.status(400).json({ error: "Invalid id" });

  const { parentName, parentPhone, parentEmail, childName, childAge, preferredLevel, source, notes, followUpDate, assignedTo } = req.body;
  if (!parentName || !parentPhone || !childName) {
    return res.status(400).json({ error: "parentName, parentPhone, childName are required" });
  }

  const [campaign] = await db
    .select({ id: campaignsTable.id, assignedTo: campaignsTable.assignedTo })
    .from(campaignsTable)
    .where(eq(campaignsTable.id, campaignId));
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  const [lead] = await db
    .insert(leadsTable)
    .values({
      campaignId,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail ?? null,
      childName: childName.trim(),
      childAge: childAge ?? null,
      preferredLevel: preferredLevel ?? null,
      source: source ?? "call",
      status: "new",
      assignedTo: assignedTo ? parseInt(assignedTo) : (campaign.assignedTo ?? null),
      notes: notes ?? null,
      followUpDate: followUpDate ?? null,
    })
    .returning();

  res.status(201).json(lead);
});

// ── GET campaign ROI ───────────────────────────────────────────────────────────
router.get("/campaigns/:id/roi", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const campaignId = parseInt(req.params.id);
  if (isNaN(campaignId)) return res.status(400).json({ error: "Invalid id" });

  const [registeredLeads, expenses, levels] = await Promise.all([
    db
      .select({ id: leadsTable.id, childName: leadsTable.childName, preferredLevel: leadsTable.preferredLevel })
      .from(leadsTable)
      .where(and(eq(leadsTable.campaignId, campaignId), eq(leadsTable.status, "registered"))),
    db
      .select()
      .from(campaignExpensesTable)
      .where(eq(campaignExpensesTable.campaignId, campaignId))
      .orderBy(desc(campaignExpensesTable.createdAt)),
    db
      .select({ id: levelsTable.id, name: levelsTable.name, price: levelsTable.price })
      .from(levelsTable)
      .orderBy(levelsTable.name),
  ]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  res.json({
    registeredLeads,
    expenses,
    levels,
    totalExpenses,
    registeredCount: registeredLeads.length,
  });
});

// ── ADD campaign expense ───────────────────────────────────────────────────────
router.post("/campaigns/:id/expenses", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const campaignId = parseInt(req.params.id);
  if (isNaN(campaignId)) return res.status(400).json({ error: "Invalid id" });

  const { description, amount, category } = req.body;
  if (!description || amount === undefined) {
    return res.status(400).json({ error: "description and amount required" });
  }

  const [expense] = await db
    .insert(campaignExpensesTable)
    .values({
      campaignId,
      description: description.trim(),
      amount: parseFloat(amount),
      category: category ?? "other",
    })
    .returning();

  res.status(201).json(expense);
});

// ── DELETE campaign expense ────────────────────────────────────────────────────
router.delete("/campaigns/expenses/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  await db.delete(campaignExpensesTable).where(eq(campaignExpensesTable.id, id));
  res.json({ message: "Deleted" });
});

// ── UPDATE lead ────────────────────────────────────────────────────────────────
router.patch("/leads/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin", "accountant"].includes(user.role) && !user.permissions?.includes("marketing_hub")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { status, notes, followUpDate, assignedTo } = req.body;
  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes || null;
  if (followUpDate !== undefined) updates.followUpDate = followUpDate || null;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo ? parseInt(assignedTo) : null;

  const [updated] = await db
    .update(leadsTable)
    .set(updates)
    .where(eq(leadsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Lead not found" });
  res.json(updated);
});

// ── DELETE lead ────────────────────────────────────────────────────────────────
router.delete("/leads/:id", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!["admin"].includes(user.role)) return res.status(403).json({ error: "Admin only" });

  const id = parseInt(req.params.id);
  await db.delete(leadsTable).where(eq(leadsTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
