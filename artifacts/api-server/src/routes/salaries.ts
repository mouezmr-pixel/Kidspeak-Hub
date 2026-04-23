import { Router, type Request, type Response } from "express";
import { db, salariesTable, expensesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /salaries/my — own salary history (any authenticated employee)
router.get("/salaries/my", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { id: number };

  const rows = await db
    .select({
      id: salariesTable.id,
      employeeId: salariesTable.employeeId,
      amount: salariesTable.amount,
      period: salariesTable.period,
      note: salariesTable.note,
      paidAt: salariesTable.paidAt,
      createdAt: salariesTable.createdAt,
    })
    .from(salariesTable)
    .where(eq(salariesTable.employeeId, user.id))
    .orderBy(desc(salariesTable.paidAt));

  res.json(rows);
});

// GET /salaries — list all (admin only)
router.get("/salaries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string; id: number };
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const rows = await db
    .select({
      id: salariesTable.id,
      employeeId: salariesTable.employeeId,
      amount: salariesTable.amount,
      period: salariesTable.period,
      note: salariesTable.note,
      paidAt: salariesTable.paidAt,
      createdAt: salariesTable.createdAt,
      employeeName: usersTable.name,
    })
    .from(salariesTable)
    .leftJoin(usersTable, eq(salariesTable.employeeId, usersTable.id))
    .orderBy(desc(salariesTable.paidAt));

  res.json(rows);
});

// GET /salaries/employee/:id — salary history for a specific employee (admin only)
router.get("/salaries/employee/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string; id: number };
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const empId = parseInt(req.params.id);
  if (isNaN(empId)) {
    res.status(400).json({ error: "Invalid employee id" });
    return;
  }

  const rows = await db
    .select()
    .from(salariesTable)
    .where(eq(salariesTable.employeeId, empId))
    .orderBy(desc(salariesTable.paidAt));

  res.json(rows);
});

// POST /salaries — add salary payment (admin only)
router.post("/salaries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string; id: number; branchId?: number | null };
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const { employeeId, amount, period, note, paidAt } = req.body as {
    employeeId: number;
    amount: number;
    period: string;
    note?: string;
    paidAt: string;
  };

  if (!employeeId || !amount || !period || !paidAt) {
    res.status(400).json({ error: "employeeId, amount, period and paidAt are required" });
    return;
  }

  const [salary] = await db
    .insert(salariesTable)
    .values({ employeeId, amount, period, note: note || null, paidAt })
    .returning();

  // Fetch employee name for the expense description
  const [emp] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, employeeId));

  // Auto-create expense entry for this salary payment
  await db.insert(expensesTable).values({
    category: "salaries",
    description: `راتب ${emp?.name ?? `#${employeeId}`} — ${period}`,
    amount,
    expenseDate: paidAt,
    notes: note || null,
    branchId: (user as any).branchId || null,
  });

  res.status(201).json(salary);
});

// DELETE /salaries/:id — remove salary entry (admin only)
router.delete("/salaries/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(salariesTable).where(eq(salariesTable.id, id));
  res.json({ success: true });
});

export default router;
