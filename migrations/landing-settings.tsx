import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  DEFAULT_LANDING_SETTINGS,
  type LandingSettings,
  type StatMode,
} from "@/types/landing-settings";
import { Save, ExternalLink, RotateCcw, Eye, EyeOff, AlertCircle } from "lucide-react";

// ── Editor for the landing-page CMS settings (key: landing_v3) ──────────────
// This is Phase 1 of the editor and covers the highest-leverage fields:
//   • Hero copy + primary/secondary CTA labels + optional video URL
//   • Section visibility toggles (9 sections)
//   • Stats (manual / hidden, value, label, suffix)
//   • CTA banner copy
//   • Register form copy
//   • Footer tagline
// Detailed array editing (pains, method points, differentiators, testimonials,
// gallery) ships in Phase 2 to keep this file focused.
//
// Save behaviour: writes directly to /admin/cms/settings/landing_v3 — the
// public page reads from /public/cms/settings/landing_v3, so changes go live
// the moment the user clicks "حفظ التغييرات".

export default function AdminLandingSettings() {
  const [, navigate] = useLocation();
  const { data: currentUser } = useGetMe();
  const { toast } = useToast();

  const [settings, setSettings] = useState<LandingSettings>(DEFAULT_LANDING_SETTINGS);
  const [original, setOriginal] = useState<LandingSettings>(DEFAULT_LANDING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = (currentUser as any)?.role;
  const canEdit = role === "admin" || role === "branch_manager";

  // ── Permission gate ────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser && !canEdit) {
      toast({
        title: "غير مسموح",
        description: "هذه الصفحة متاحة فقط للمدير ومدير الفرع.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [currentUser, canEdit, navigate, toast]);

  // ── Load current settings ──────────────────────────────────────────────
  useEffect(() => {
    if (!canEdit) return;
    fetch("/api/admin/cms/settings/landing_v3", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (res?.data) {
          // Merge with defaults so any newly-added keys get sensible values
          const merged = { ...DEFAULT_LANDING_SETTINGS, ...res.data };
          setSettings(merged);
          setOriginal(merged);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(`تعذّر تحميل الإعدادات: ${e.message}`);
        setLoading(false);
      });
  }, [canEdit]);

  // ── Detect unsaved changes ─────────────────────────────────────────────
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/cms/settings/landing_v3", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${r.status}`);
      }
      setOriginal(settings);
      toast({
        title: "تم الحفظ ✓",
        description: "التغييرات ظاهرة الآن على الصفحة الرئيسية.",
      });
    } catch (e: any) {
      toast({
        title: "تعذّر الحفظ",
        description: e?.message ?? "حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to last saved ────────────────────────────────────────────────
  const handleDiscard = () => {
    if (!confirm("سيتم إلغاء كل التعديلات غير المحفوظة. متابعة؟")) return;
    setSettings(original);
  };

  // ── Reset to defaults (factory) ────────────────────────────────────────
  const handleResetDefaults = () => {
    if (!confirm("سيُعيد هذا كل النصوص إلى القيم الافتراضية. الإحصائيات والإعدادات الحالية ستُفقد. متابعة؟")) return;
    setSettings(DEFAULT_LANDING_SETTINGS);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">جاري التحميل…</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="rounded-lg p-4 bg-destructive/10 border border-destructive/30 text-destructive flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // ── Section helpers ────────────────────────────────────────────────────
  const setHero = (patch: Partial<LandingSettings["hero"]>) =>
    setSettings(s => ({ ...s, hero: { ...s.hero, ...patch } }));
  const setSection = (key: keyof LandingSettings["sections"], visible: boolean) =>
    setSettings(s => ({ ...s, sections: { ...s.sections, [key]: visible } }));
  const setStat = (
    key: "students" | "teachers" | "programs" | "satisfaction",
    patch: Partial<LandingSettings["stats"]["students"]>,
  ) => setSettings(s => ({ ...s, stats: { ...s.stats, [key]: { ...s.stats[key], ...patch } } }));
  const setStatsTitle = (title: string) =>
    setSettings(s => ({ ...s, stats: { ...s.stats, title } }));
  const setCtaBanner = (patch: Partial<LandingSettings["ctaBanner"]>) =>
    setSettings(s => ({ ...s, ctaBanner: { ...s.ctaBanner, ...patch } }));
  const setRegister = (patch: Partial<LandingSettings["register"]>) =>
    setSettings(s => ({ ...s, register: { ...s.register, ...patch } }));
  const setFooter = (patch: Partial<LandingSettings["footer"]>) =>
    setSettings(s => ({ ...s, footer: { ...s.footer, ...patch } }));

  const sectionLabels: { key: keyof LandingSettings["sections"]; label: string; }[] = [
    { key: "pains",           label: "قسم المخاوف (ربما تواجه…)" },
    { key: "method",          label: "قسم المنهج (Speaking First)" },
    { key: "differentiators", label: "قسم ما يميِّزنا" },
    { key: "stats",           label: "قسم الإحصائيات" },
    { key: "programs",        label: "قسم البرامج والأفواج" },
    { key: "testimonials",    label: "قسم آراء الأولياء" },
    { key: "gallery",         label: "قسم المعرض" },
    { key: "ctaBanner",       label: "بانر التحفيز للتسجيل" },
    { key: "register",        label: "نموذج التسجيل" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 pb-24">
      {/* ── Header bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">إعدادات صفحة الهبوط</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تعديل المحتوى الظاهر على kidspeakdz.com — التغييرات تنعكس فور الحفظ.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md border hover:bg-muted transition-colors">
          <ExternalLink className="w-4 h-4" />
          معاينة الصفحة
        </a>
      </div>

      {/* ── Section 1: HERO ───────────────────────────────────────────── */}
      <SectionCard title="القسم الترحيبي (Hero)" subtitle="أول ما يراه الزائر">
        <Field label="نص الـ badge (فوق العنوان)" value={settings.hero.badge}
               onChange={v => setHero({ badge: v })} />
        <Field label="العنوان الرئيسي" value={settings.hero.title}
               onChange={v => setHero({ title: v })} multiline rows={2} />
        <Field label="العنوان الفرعي" value={settings.hero.subtitle}
               onChange={v => setHero({ subtitle: v })} multiline rows={3} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="نص الزر الأساسي" value={settings.hero.primaryCta}
                 onChange={v => setHero({ primaryCta: v })} />
          <Field label="نص الزر الثانوي" value={settings.hero.secondaryCta}
                 onChange={v => setHero({ secondaryCta: v })} />
        </div>
        <Field label="رابط فيديو الـ Hero (YouTube — اختياري)"
               value={settings.hero.videoUrl ?? ""}
               onChange={v => setHero({ videoUrl: v.trim() ? v : null })}
               placeholder="https://youtube.com/watch?v=…" />
        {!settings.hero.videoUrl && (
          <p className="text-xs text-muted-foreground">
            اتركه فارغاً إذا لا يوجد فيديو — قسم الفيديو يختفي تلقائياً.
          </p>
        )}
      </SectionCard>

      {/* ── Section 2: VISIBILITY TOGGLES ─────────────────────────────── */}
      <SectionCard title="إظهار وإخفاء الأقسام" subtitle="9 أقسام — أخفِ ما لا تحتاجه الآن">
        <div className="grid sm:grid-cols-2 gap-2">
          {sectionLabels.map(({ key, label }) => {
            const visible = settings.sections[key];
            return (
              <button key={key} type="button"
                onClick={() => setSection(key, !visible)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors text-start
                  ${visible ? "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                            : "bg-muted/40 border-muted text-muted-foreground hover:bg-muted/70"}`}>
                <span className="font-medium">{label}</span>
                {visible ? <Eye className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Section 3: STATS ──────────────────────────────────────────── */}
      <SectionCard title="الإحصائيات" subtitle="كل بطاقة: مخفية أو يدوية بقيمة معيّنة">
        <Field label="عنوان قسم الإحصائيات" value={settings.stats.title}
               onChange={setStatsTitle} />
        <div className="space-y-3">
          <StatRow label="التلاميذ"
                   stat={{ ...settings.stats.students }}
                   onChange={p => setStat("students", p)} />
          <StatRow label="الأساتذة"
                   stat={{ ...settings.stats.teachers }}
                   onChange={p => setStat("teachers", p)} />
          <StatRow label="البرامج"
                   stat={{ ...settings.stats.programs }}
                   onChange={p => setStat("programs", p)} />
          <StatRow label="رضا الأولياء"
                   stat={{ ...settings.stats.satisfaction }}
                   onChange={p => setStat("satisfaction", p)} />
        </div>
      </SectionCard>

      {/* ── Section 4: CTA BANNER ─────────────────────────────────────── */}
      <SectionCard title="بانر التحفيز" subtitle="الشريط الأخضر قبل النموذج">
        <Field label="العنوان" value={settings.ctaBanner.title}
               onChange={v => setCtaBanner({ title: v })} />
        <Field label="الوصف" value={settings.ctaBanner.subtitle}
               onChange={v => setCtaBanner({ subtitle: v })} multiline rows={2} />
        <Field label="نص الزر" value={settings.ctaBanner.buttonText}
               onChange={v => setCtaBanner({ buttonText: v })} />
      </SectionCard>

      {/* ── Section 5: REGISTER FORM ──────────────────────────────────── */}
      <SectionCard title="نموذج التسجيل" subtitle="عنوان وشرح فوق الحقول">
        <Field label="العنوان" value={settings.register.title}
               onChange={v => setRegister({ title: v })} />
        <Field label="الشرح" value={settings.register.subtitle}
               onChange={v => setRegister({ subtitle: v })} multiline rows={2} />
      </SectionCard>

      {/* ── Section 6: FOOTER ─────────────────────────────────────────── */}
      <SectionCard title="الفوتر" subtitle="الجملة الصغيرة تحت الشعار">
        <Field label="نص الفوتر" value={settings.footer.tagline}
               onChange={v => setFooter({ tagline: v })} multiline rows={2} />
      </SectionCard>

      {/* ── Phase 2 placeholder ───────────────────────────────────────── */}
      <SectionCard title="باقي الأقسام" subtitle="قريباً — في التحديث القادم">
        <p className="text-sm text-muted-foreground">
          تعديل تفاصيل البطاقات (المخاوف، نقاط المنهج، التميُّز، الشهادات، صور المعرض) سيُتاح في
          المرحلة القادمة. حالياً يمكنك إخفاء أي قسم لا تريده باستخدام مفاتيح "إظهار وإخفاء" في الأعلى.
        </p>
      </SectionCard>

      {/* ── Sticky bottom action bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-2 sm:gap-3 justify-between">
          <div className="text-sm">
            {hasChanges
              ? <span className="text-amber-700 font-medium">● تغييرات غير محفوظة</span>
              : <span className="text-muted-foreground">جميع التغييرات محفوظة</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleResetDefaults}
                    className="text-xs sm:text-sm px-3 py-2 rounded-md border hover:bg-muted text-muted-foreground inline-flex items-center gap-1.5"
                    title="استعادة كل النصوص للقيم الافتراضية">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استعادة الافتراضي</span>
              <span className="sm:hidden">افتراضي</span>
            </button>
            {hasChanges && (
              <button onClick={handleDiscard}
                      className="text-xs sm:text-sm px-3 py-2 rounded-md border hover:bg-muted text-muted-foreground">
                إلغاء
              </button>
            )}
            <button onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4" />
              {saving ? "جاري الحفظ…" : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable section card ────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// ── Reusable input field ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, multiline, rows = 2 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const sharedClass = "w-full px-3 py-2 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30";
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5 text-muted-foreground">{label}</label>
      {multiline ? (
        <textarea value={value} rows={rows} placeholder={placeholder}
                  onChange={e => onChange(e.target.value)}
                  className={sharedClass + " resize-y"} />
      ) : (
        <input type="text" value={value} placeholder={placeholder}
               onChange={e => onChange(e.target.value)}
               className={sharedClass} />
      )}
    </div>
  );
}

// ── Stat row (mode + value + label + suffix) ────────────────────────────
function StatRow({ label, stat, onChange }: {
  label: string;
  stat: { mode: StatMode; value: number; label: string; suffix?: string };
  onChange: (patch: Partial<typeof stat>) => void;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-sm">{label}</span>
        <div className="flex gap-1">
          <ModeButton active={stat.mode === "manual"}
                      onClick={() => onChange({ mode: "manual" })}>
            ظاهر
          </ModeButton>
          <ModeButton active={stat.mode === "hidden"}
                      onClick={() => onChange({ mode: "hidden" })}>
            مخفي
          </ModeButton>
        </div>
      </div>
      {stat.mode === "manual" && (
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold mb-0.5 text-muted-foreground">القيمة</label>
            <input type="number" value={stat.value}
                   onChange={e => onChange({ value: Number(e.target.value) })}
                   className="w-full px-2 py-1.5 rounded border text-sm bg-background outline-none" />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold mb-0.5 text-muted-foreground">اللاحقة</label>
            <input type="text" value={stat.suffix ?? ""} placeholder="+ , %"
                   onChange={e => onChange({ suffix: e.target.value || undefined })}
                   className="w-full px-2 py-1.5 rounded border text-sm bg-background outline-none" />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold mb-0.5 text-muted-foreground">التسمية</label>
            <input type="text" value={stat.label}
                   onChange={e => onChange({ label: e.target.value })}
                   className="w-full px-2 py-1.5 rounded border text-sm bg-background outline-none" />
          </div>
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
            className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors
              ${active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
      {children}
    </button>
  );
}
