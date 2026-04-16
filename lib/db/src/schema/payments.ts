import { table, text, integer, real, id, timestamp } from "./helpers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { levelsTable } from "./levels";

export const paymentsTable = table("payments", {
  id: id(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  levelId: integer("level_id").references(() => levelsTable.id),
  amountDue: real("amount_due").notNull(),
  discount: real("discount").notNull().default(0),
  amountPaid: real("amount_paid").notNull().default(0),
  status: text("status", { enum: ["paid", "partially_paid", "overdue", "pending"] }).notNull().default("pending"),
  dueDate: text("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
