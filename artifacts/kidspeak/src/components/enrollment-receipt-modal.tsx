import { useQuery } from "@tanstack/react-query";
import { useSettings } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, GraduationCap, Users, UserCheck, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

const BRAND_BLUE   = "#1B2E8F";
const BRAND_YELLOW = "#F5A600";

// ── print helpers ─────────────────────────────────────────────────────────────
function injectEnrollmentPrintStyles() {
  const id = "ks-enrollment-print-style";
  document.getElementById(id)?.remove();
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @media print {
      body > *:not(.enrollment-print-root) { display: none !important; }
      .enrollment-print-root { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; }
      .enrollment-print-hide { display: none !important; }
      .enrollment-print-only { display: flex !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    .enrollment-print-only { display: none; }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => { document.getElementById(id)?.remove(); }, 2000);
}

// ── row helper ─────────────────────────────────────────────────────────────────
function Row({ label, value, valueClass = "", pending = false }: { label: string; value: React.ReactNode; valueClass?: string; pending?: boolean }) {
  return (
    <div className="grid grid-cols-2 px-5 py-2.5 border-b border-gray-100 text-sm last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className={`font-semibold text-end ${pending ? "text-amber-700 italic" : "text-gray-900"} ${valueClass}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

// ── currency format ────────────────────────────────────────────────────────────
function fmtDZD(amount: number): string {
  return amount.toLocaleString("fr-DZ", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " د.ج";
}

// ── status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, isAr }: { status: string; isAr: boolean }) {
  const map: Record<string, { en: string; ar: string; color: string }> = {
    paid:           { en: "Paid",           ar: "مدفوع",        color: "#16a34a" },
    partially_paid: { en: "Partially Paid", ar: "مدفوع جزئياً", color: "#d97706" },
    pending:        { en: "Pending",        ar: "قيد الانتظار", color: "#6b7280" },
    overdue:        { en: "Overdue",        ar: "متأخر",        color: "#dc2626" },
  };
  const entry = map[status] ?? { en: status, ar: status, color: "#6b7280" };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: entry.color + "18", color: entry.color, border: `1px solid ${entry.color}30` }}>
      {isAr ? entry.ar : entry.en}
    </span>
  );
}

// ── the modal ─────────────────────────────────────────────────────────────────
interface EnrollmentReceiptModalProps {
  paymentId: number;
  onClose: () => void;
  isAr: boolean;
}

export function EnrollmentReceiptModal({ paymentId, onClose, isAr }: EnrollmentReceiptModalProps) {
  const { data: receipt, isLoading } = useQuery<any>({
    queryKey: ["enrollment-receipt", paymentId],
    queryFn: async () => {
      const res = await fetch(`/api/payments/${paymentId}/enrollment-receipt`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load receipt");
      return res.json();
    },
    enabled: paymentId > 0,
  });

  const { data: settings } = useSettings();

  const lbl = (en: string, ar: string) => isAr ? ar : en;
  const dir = isAr ? "rtl" : "ltr";

  const schoolName  = (settings as any)?.schoolName  ?? "Kidspeak Language Center";
  const schoolAddr  = (settings as any)?.address     ?? "";
  const schoolPhone = (settings as any)?.phone       ?? "";
  const logoWhite   = (settings as any)?.logoWhiteUrl;
  const logoFull    = (settings as any)?.logoUrl;

  // Format schedule: days + time + duration
  const scheduleStr = (() => {
    if (!receipt) return null;
    const parts: string[] = [];
    if (receipt.recurringDays) parts.push(receipt.recurringDays);
    if (receipt.sessionStartTime) parts.push(receipt.sessionStartTime);
    if (receipt.sessionDurationMins) parts.push(`(${receipt.sessionDurationMins} ${lbl("min", "دقيقة")})`);
    if (receipt.schedule && !parts.length) parts.push(receipt.schedule);
    return parts.length ? parts.join("  •  ") : null;
  })();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 overflow-hidden w-full max-w-2xl enrollment-print-root" dir={dir}>

        {/* ── Modal action bar (hidden on print) ── */}
        <div className="enrollment-print-hide flex items-center justify-between px-5 py-3 border-b bg-muted/30">
          <DialogTitle className="text-base font-semibold">
            {lbl("Enrollment Receipt", "إيصال التسجيل")}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isLoading && receipt && (
              <Button size="sm" onClick={injectEnrollmentPrintStyles}
                style={{ backgroundColor: BRAND_BLUE, color: "white" }}
                className="font-semibold gap-1.5"
              >
                <Printer className="w-4 h-4" />
                {lbl("Print", "طباعة")}
              </Button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {lbl("Generating receipt…", "جاري إنشاء الإيصال…")}
          </div>
        ) : !receipt ? (
          <div className="py-16 text-center text-destructive text-sm">
            {lbl("Failed to load receipt.", "تعذّر تحميل الإيصال.")}
          </div>
        ) : (
          <div className="bg-white text-black" style={{ fontFamily: "'Cairo','Segoe UI',Tahoma,Arial,sans-serif" }}>

            {/* ── DIGITAL header (blue) ── */}
            <div className="enrollment-print-hide flex items-center justify-between px-8 py-5"
              style={{ backgroundColor: BRAND_BLUE, minHeight: "80px" }}>
              <div>
                <div className="text-white font-bold text-base leading-tight">{schoolName}</div>
                <div className="text-sm mt-0.5" style={{ color: BRAND_YELLOW }}>
                  {lbl("Enrollment & Payment Receipt", "إيصال التسجيل والدفع")}
                </div>
              </div>
              {logoWhite
                ? <img src={`/api/storage/public-objects/${logoWhite}`} alt="Logo" className="h-10 w-auto object-contain" style={{ maxWidth: 160 }} />
                : <div className="text-white font-black text-2xl">kid<span style={{ color: BRAND_YELLOW }}>speak</span></div>
              }
            </div>

            {/* ── PRINT header (white, high-contrast) ── */}
            <div className="enrollment-print-only flex-row items-center justify-between px-8 py-5 border-b-4" style={{ borderColor: BRAND_YELLOW }}>
              <div>
                <div className="font-black text-xl leading-tight" style={{ color: BRAND_BLUE }}>{schoolName}</div>
                {schoolAddr  && <div className="text-sm text-gray-600 mt-0.5">{schoolAddr}</div>}
                {schoolPhone && <div className="text-sm text-gray-600">📞 {schoolPhone}</div>}
              </div>
              {logoFull
                ? <img src={`/api/storage/public-objects/${logoFull}`} alt="Logo" className="h-16 w-auto object-contain" style={{ maxWidth: 180 }} />
                : <div className="font-black text-3xl" style={{ color: BRAND_BLUE }}>kid<span style={{ color: BRAND_YELLOW }}>speak</span></div>
              }
            </div>

            {/* ── Receipt type bar ── */}
            <div className="px-8 py-3 flex items-center justify-between"
              style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND_BLUE }}>
                {lbl("Enrollment Receipt", "إيصال التسجيل")}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">{lbl("Receipt No.", "رقم الإيصال")}</span>
                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: BRAND_BLUE, color: "white" }}>
                  {receipt.receiptNumber}
                </span>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">

              {/* ── Issued date + status row ── */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b" style={{ color: BRAND_BLUE, borderColor: BRAND_YELLOW }}>
                    {lbl("Date Issued", "تاريخ الإصدار")}
                  </div>
                  <div className="font-semibold text-gray-800">{format(new Date(receipt.issuedAt), "MMMM d, yyyy")}</div>
                  {receipt.dueDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      {lbl("Due:", "تاريخ الاستحقاق:")} {format(new Date(receipt.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b" style={{ color: BRAND_BLUE, borderColor: BRAND_YELLOW }}>
                    {lbl("Status", "الحالة")}
                  </div>
                  <StatusBadge status={receipt.status} isAr={isAr} />
                </div>
              </div>

              {/* ══ SECTION A: Educational Details ══════════════════════════════ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                  <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
                    {lbl("Enrollment Details", "تفاصيل التسجيل")}
                  </h3>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  {/* Section header */}
                  <div className="grid grid-cols-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: BRAND_BLUE }}>
                    <span>{lbl("Field", "الحقل")}</span>
                    <span className="text-end">{lbl("Details", "التفاصيل")}</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    <Row label={lbl("Pupil Name", "اسم التلميذ")} value={receipt.studentName} />
                    {receipt.parentName && (
                      <Row label={lbl("Parent / Guardian", "ولي الأمر")} value={receipt.parentName} />
                    )}
                    <Row
                      label={lbl("Level", "المستوى")}
                      value={receipt.levelName ?? lbl("—", "—")}
                      pending={!receipt.levelName}
                    />

                    {/* Group row */}
                    <div className="grid grid-cols-2 px-5 py-2.5 border-b border-gray-100 text-sm">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND_BLUE }} />
                        {lbl("Assigned Group", "الفوج")}
                      </span>
                      <span className={`font-semibold text-end ${receipt.groupName ? "text-gray-900" : "text-amber-700 italic"}`}>
                        {receipt.groupName ?? lbl("Pending Assignment", "قيد التعيين")}
                      </span>
                    </div>

                    {/* Teacher row */}
                    <div className="grid grid-cols-2 px-5 py-2.5 border-b border-gray-100 text-sm">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND_BLUE }} />
                        {lbl("Teacher", "الأستاذ المسير")}
                      </span>
                      <span className={`font-semibold text-end ${receipt.teacherName ? "text-gray-900" : "text-amber-700 italic"}`}>
                        {receipt.teacherName ?? lbl("To be assigned", "سيتحدد لاحقاً")}
                      </span>
                    </div>

                    {/* Schedule row — show actual schedule if available, or pending label if assigned without one */}
                    <div className="grid grid-cols-2 px-5 py-2.5 text-sm">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND_BLUE }} />
                        {lbl("Schedule", "التوقيت والأيام")}
                      </span>
                      {scheduleStr ? (
                        <span className="font-semibold text-gray-900 text-end text-xs leading-relaxed">{scheduleStr}</span>
                      ) : (
                        <span className="font-semibold text-end text-amber-700 italic">
                          {lbl("Pending Class Schedule", "سيتحدد الجدول لاحقاً")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ SECTION B: Financial Summary ═════════════════════════════════ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4" style={{ color: BRAND_BLUE }} />
                  <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
                    {lbl("Financial Summary", "الملخص المالي")}
                  </h3>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: BRAND_BLUE }}>
                    <span>{lbl("Item", "البند")}</span>
                    <span className="text-end">{lbl("Amount (DZD)", "المبلغ (د.ج)")}</span>
                  </div>
                  <div className="bg-gray-50 divide-y divide-gray-100">
                    <Row
                      label={receipt.levelName ? `${receipt.levelName} — ${lbl("Tuition Fee", "رسوم التسجيل")}` : lbl("Tuition Fee", "رسوم التسجيل")}
                      value={fmtDZD(receipt.amountDue)}
                    />
                    {receipt.discount > 0 && (
                      <Row
                        label={lbl("Discount", "تخفيض")}
                        value={"− " + fmtDZD(receipt.discount)}
                        valueClass="text-red-600"
                      />
                    )}
                    {receipt.discount > 0 && (
                      <Row
                        label={lbl("Net Total", "المجموع بعد التخفيض")}
                        value={fmtDZD(receipt.netTotal)}
                        valueClass="font-black"
                      />
                    )}
                    <Row
                      label={lbl("Amount Paid", "المبلغ المدفوع")}
                      value={fmtDZD(receipt.amountPaid)}
                      valueClass="text-emerald-700"
                    />
                    {receipt.paidAt && (
                      <Row
                        label={lbl("Payment Date", "تاريخ الدفع")}
                        value={format(new Date(receipt.paidAt), "MMMM d, yyyy")}
                      />
                    )}
                    <div className="grid grid-cols-2 px-5 py-3 text-sm font-black"
                      style={{ color: receipt.balance > 0 ? "#dc2626" : "#16a34a" }}>
                      <span>{lbl("Remaining Balance", "الرصيد المتبقي")}</span>
                      <span className="text-end">{fmtDZD(receipt.balance)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ SECTION C: Signature & Stamp ════════════════════════════════ */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: BRAND_BLUE }}>
                    {lbl("Parent Signature", "توقيع ولي الأمر")}
                  </div>
                  <div className="border-b-2 border-dashed border-gray-300 mt-6 min-h-[36px]" />
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: BRAND_BLUE }}>
                    {lbl("Authorized Signature & Stamp", "ختم وتوقيع الإدارة")}
                  </div>
                  <div className="border-b-2 border-dashed border-gray-300 mt-6 min-h-[36px]" />
                </div>
              </div>

              {/* ══ Footer ══════════════════════════════════════════════════════ */}
              <div className="rounded-xl px-6 py-4 text-center space-y-1"
                style={{ backgroundColor: "#f0f4ff", border: `1px solid #c7d2fe` }}>
                <div className="text-sm font-bold" style={{ color: BRAND_BLUE, direction: "rtl" }}>
                  كيدسبيك — حيث تبدأ الطلاقة
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Kidspeak Language Center — Where Fluency Begins
                </div>
                {(schoolAddr || schoolPhone) && (
                  <div className="text-xs text-gray-400">
                    {[schoolAddr, schoolPhone].filter(Boolean).join("  •  ")}
                  </div>
                )}
              </div>

              {receipt.notes && (
                <div className="text-sm text-gray-500 italic border-s-2 ps-3" style={{ borderColor: BRAND_YELLOW }}>
                  {receipt.notes}
                </div>
              )}

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
