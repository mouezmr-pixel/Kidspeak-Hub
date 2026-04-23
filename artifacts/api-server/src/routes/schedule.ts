import { Router, type Request, type Response } from "express";
import { eq, and, gte, lte, or, desc } from "drizzle-orm";
import {
  db,
  eventsTable,
  eventInvitationsTable,
  usersTable,
  groupsTable,
  groupStudentsTable,
  classSessionsTable,
  adhocSessionsTable,
  consultationsTable,
  studentsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── GET /schedule/my — role-based calendar items for the logged-in user ────────
router.get("/schedule/my", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { id: number; role: string };
  const items: any[] = [];

  // Date range: 4 weeks back + 12 weeks ahead
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 28);
  const end = new Date(now);
  end.setDate(end.getDate() + 84);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  // ── CLASS SESSIONS ──────────────────────────────────────────────────────────
  if (["admin", "teacher", "psychologist", "branch_manager"].includes(user.role)) {
    const sessionFilter = user.role === "admin" || user.role === "branch_manager"
      ? and(gte(classSessionsTable.sessionDate, startStr), lte(classSessionsTable.sessionDate, endStr))
      : user.role === "teacher"
        ? and(eq(classSessionsTable.teacherId, user.id), gte(classSessionsTable.sessionDate, startStr), lte(classSessionsTable.sessionDate, endStr))
        : and(eq(classSessionsTable.psychologistId, user.id), gte(classSessionsTable.sessionDate, startStr), lte(classSessionsTable.sessionDate, endStr));

    const sessions = await db
      .select({
        id: classSessionsTable.id,
        groupId: classSessionsTable.groupId,
        date: classSessionsTable.sessionDate,
        time: classSessionsTable.sessionTime,
        title: classSessionsTable.lessonTitle,
        notes: classSessionsTable.notes,
        status: classSessionsTable.status,
        sessionType: classSessionsTable.sessionType,
        groupName: groupsTable.name,
      })
      .from(classSessionsTable)
      .leftJoin(groupsTable, eq(classSessionsTable.groupId, groupsTable.id))
      .where(sessionFilter);

    for (const s of sessions) {
      items.push({
        id: `cs-${s.id}`,
        type: "session",
        color: "blue",
        title: s.title || s.groupName || "Class Session",
        subtitle: s.groupName ?? undefined,
        date: s.date,
        startTime: s.time ?? undefined,
        notes: s.notes ?? undefined,
        status: s.status ?? undefined,
        sessionType: s.sessionType ?? undefined,
        sourceId: s.id,
        sourceTable: "class_sessions",
      });
    }
  }

  // ── PARENT: children's group sessions ──────────────────────────────────────
  if (user.role === "parent") {
    const children = await db
      .select({ id: studentsTable.id, name: studentsTable.name })
      .from(studentsTable)
      .where(eq(studentsTable.parentId, user.id));

    for (const child of children) {
      const groupLinks = await db
        .select({ groupId: groupStudentsTable.groupId })
        .from(groupStudentsTable)
        .where(eq(groupStudentsTable.studentId, child.id));

      const groupIds = groupLinks.map(g => g.groupId);
      if (groupIds.length === 0) continue;

      for (const gid of groupIds) {
        const sessions = await db
          .select({
            id: classSessionsTable.id,
            date: classSessionsTable.sessionDate,
            time: classSessionsTable.sessionTime,
            title: classSessionsTable.lessonTitle,
            groupName: groupsTable.name,
            status: classSessionsTable.status,
          })
          .from(classSessionsTable)
          .leftJoin(groupsTable, eq(classSessionsTable.groupId, groupsTable.id))
          .where(and(
            eq(classSessionsTable.groupId, gid),
            gte(classSessionsTable.sessionDate, startStr),
            lte(classSessionsTable.sessionDate, endStr),
          ));

        for (const s of sessions) {
          items.push({
            id: `cs-${s.id}-${child.id}`,
            type: "session",
            color: "blue",
            title: s.groupName || "Class Session",
            subtitle: child.name,
            date: s.date,
            startTime: s.time ?? undefined,
            status: s.status ?? undefined,
            childName: child.name,
            sourceId: s.id,
            sourceTable: "class_sessions",
          });
        }
      }
    }
  }

  // ── PSYCHOLOGIST: adhoc sessions ───────────────────────────────────────────
  if (["admin", "psychologist"].includes(user.role)) {
    const adhocFilter = user.role === "admin"
      ? and(gte(adhocSessionsTable.sessionDate, startStr), lte(adhocSessionsTable.sessionDate, endStr))
      : and(eq(adhocSessionsTable.psychologistId, user.id), gte(adhocSessionsTable.sessionDate, startStr), lte(adhocSessionsTable.sessionDate, endStr));

    const adhocs = await db
      .select({
        id: adhocSessionsTable.id,
        date: adhocSessionsTable.sessionDate,
        durationMinutes: adhocSessionsTable.durationMinutes,
        title: adhocSessionsTable.title,
        notes: adhocSessionsTable.notes,
        studentName: studentsTable.name,
      })
      .from(adhocSessionsTable)
      .leftJoin(studentsTable, eq(adhocSessionsTable.studentId, studentsTable.id))
      .where(adhocFilter);

    for (const a of adhocs) {
      items.push({
        id: `adhoc-${a.id}`,
        type: "session",
        color: "blue",
        title: a.title || "Support Session",
        subtitle: a.studentName ?? undefined,
        date: a.date,
        durationMinutes: a.durationMinutes ?? undefined,
        notes: a.notes ?? undefined,
        sourceId: a.id,
        sourceTable: "adhoc_sessions",
      });
    }
  }

  // ── CONSULTATIONS (scheduled) ───────────────────────────────────────────────
  if (["admin", "psychologist", "parent"].includes(user.role)) {
    const consultFilter =
      user.role === "admin"
        ? and(eq(consultationsTable.status, "approved"))
        : user.role === "psychologist"
          ? and(eq(consultationsTable.psychologistId, user.id), eq(consultationsTable.status, "approved"))
          : and(eq(consultationsTable.parentId, user.id), eq(consultationsTable.status, "approved"));

    const consultations = await db
      .select({
        id: consultationsTable.id,
        scheduledDate: consultationsTable.scheduledDate,
        type: consultationsTable.type,
        status: consultationsTable.status,
        parentNotes: consultationsTable.parentNotes,
        adminDescription: consultationsTable.adminDescription,
        parentName: usersTable.name,
        studentName: studentsTable.name,
      })
      .from(consultationsTable)
      .leftJoin(usersTable, eq(consultationsTable.parentId, usersTable.id))
      .leftJoin(studentsTable, eq(consultationsTable.studentId, studentsTable.id))
      .where(consultFilter);

    for (const c of consultations) {
      if (!c.scheduledDate) continue;
      if (c.scheduledDate < startStr || c.scheduledDate > endStr) continue;
      items.push({
        id: `consult-${c.id}`,
        type: "consultation",
        color: "teal",
        title: "Consultation",
        subtitle: c.parentName ?? c.studentName ?? undefined,
        date: c.scheduledDate,
        notes: c.adminDescription || c.parentNotes || undefined,
        consultType: c.type,
        sourceId: c.id,
        sourceTable: "consultations",
      });
    }
  }

  // ── SCHOOL EVENTS (invitations) ─────────────────────────────────────────────
  let eventItems: any[] = [];
  if (user.role === "admin") {
    eventItems = await db
      .select()
      .from(eventsTable)
      .where(and(gte(eventsTable.date, startStr), lte(eventsTable.date, endStr)))
      .orderBy(eventsTable.date);
  } else {
    const invites = await db
      .select({ eventId: eventInvitationsTable.eventId })
      .from(eventInvitationsTable)
      .where(eq(eventInvitationsTable.userId, user.id));

    if (invites.length > 0) {
      const eventIds = invites.map(i => i.eventId);
      for (const eid of eventIds) {
        const [ev] = await db.select().from(eventsTable).where(eq(eventsTable.id, eid));
        if (ev && ev.date >= startStr && ev.date <= endStr) eventItems.push(ev);
      }
    }
  }

  const colorMap: Record<string, string> = {
    meeting: "orange",
    workshop: "green",
    school_event: "purple",
    other: "gray",
  };

  for (const ev of eventItems) {
    items.push({
      id: `ev-${ev.id}`,
      type: ev.type,
      color: colorMap[ev.type] ?? "gray",
      title: ev.title,
      subtitle: ev.location ?? undefined,
      date: ev.date,
      startTime: ev.startTime ?? undefined,
      endTime: ev.endTime ?? undefined,
      description: ev.description ?? undefined,
      location: ev.location ?? undefined,
      isPaid: ev.isPaid,
      price: ev.price ?? undefined,
      sourceId: ev.id,
      sourceTable: "events",
    });
  }

  // Sort all by date then time
  items.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });

  res.json(items);
});

// ── GET /events — list all events (admin) ─────────────────────────────────────
router.get("/events", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const events = await db.select().from(eventsTable).orderBy(desc(eventsTable.date));

  const enriched = await Promise.all(events.map(async (ev) => {
    const invites = await db
      .select({ userId: eventInvitationsTable.userId, userName: usersTable.name })
      .from(eventInvitationsTable)
      .leftJoin(usersTable, eq(eventInvitationsTable.userId, usersTable.id))
      .where(eq(eventInvitationsTable.eventId, ev.id));
    return { ...ev, invitees: invites };
  }));

  res.json(enriched);
});

// ── POST /events — create event (admin) ───────────────────────────────────────
router.post("/events", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { id: number; role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const { type, title, description, date, startTime, endTime, location, isPaid, price, inviteeIds } = req.body as any;
  if (!title || !date) { res.status(400).json({ error: "title and date are required" }); return; }

  const [ev] = await db.insert(eventsTable).values({
    type: type ?? "other",
    title,
    description: description || null,
    date,
    startTime: startTime || null,
    endTime: endTime || null,
    location: location || null,
    isPaid: !!isPaid,
    price: isPaid && price ? parseFloat(price) : null,
    createdBy: user.id,
  }).returning();

  // Create invitations
  if (inviteeIds && Array.isArray(inviteeIds) && inviteeIds.length > 0) {
    await db.insert(eventInvitationsTable).values(
      inviteeIds.map((uid: number) => ({ eventId: ev.id, userId: uid }))
    );
  }

  res.status(201).json(ev);
});

// ── PUT /events/:id — update event (admin) ────────────────────────────────────
router.put("/events/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { type, title, description, date, startTime, endTime, location, isPaid, price } = req.body as any;

  const [ev] = await db.update(eventsTable).set({
    ...(type !== undefined && { type }),
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description: description || null }),
    ...(date !== undefined && { date }),
    ...(startTime !== undefined && { startTime: startTime || null }),
    ...(endTime !== undefined && { endTime: endTime || null }),
    ...(location !== undefined && { location: location || null }),
    ...(isPaid !== undefined && { isPaid: !!isPaid }),
    ...(price !== undefined && { price: isPaid && price ? parseFloat(price) : null }),
  }).where(eq(eventsTable.id, id)).returning();

  if (!ev) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(ev);
});

// ── DELETE /events/:id — delete event (admin) ─────────────────────────────────
router.delete("/events/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(eventsTable).where(eq(eventsTable.id, id));
  res.json({ success: true });
});

// ── POST /events/:id/invitations — invite users (admin) ───────────────────────
router.post("/events/:id/invitations", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { userIds } = req.body as { userIds: number[] };
  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({ error: "userIds array required" }); return;
  }

  // Avoid duplicates — delete existing then re-insert
  for (const uid of userIds) {
    const existing = await db.select().from(eventInvitationsTable)
      .where(and(eq(eventInvitationsTable.eventId, id), eq(eventInvitationsTable.userId, uid)));
    if (existing.length === 0) {
      await db.insert(eventInvitationsTable).values({ eventId: id, userId: uid });
    }
  }

  res.status(201).json({ success: true });
});

// ── DELETE /events/:id/invitations/:userId — remove invite (admin) ────────────
router.delete("/events/:id/invitations/:userId", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as { role: string };
  if (user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const id = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  if (isNaN(id) || isNaN(userId)) { res.status(400).json({ error: "Invalid ids" }); return; }

  await db.delete(eventInvitationsTable).where(
    and(eq(eventInvitationsTable.eventId, id), eq(eventInvitationsTable.userId, userId))
  );
  res.json({ success: true });
});

export default router;
