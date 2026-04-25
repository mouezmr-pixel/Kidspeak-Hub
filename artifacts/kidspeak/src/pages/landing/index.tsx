import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Phone, Mail, MapPin, Instagram, Facebook, Youtube,
  Star, Users, GraduationCap, BookOpen, Heart,
  ChevronDown, Menu, X, Clock, Layers, User as UserIcon,
} from "lucide-react";

// ── Palette ───────────────────────────────────────────────────────────────────
const NAVY   = "#0A1628";
const ORANGE = "#F5A623";
const TEAL   = "#5EC4A0";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.max(1, Math.ceil(to / 60));
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); }
          else setVal(start);
        }, 25);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString("ar-DZ")}{suffix}</span>;
}

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5" fill={i < n ? ORANGE : "none"} stroke={i < n ? ORANGE : "#555"} />
      ))}
    </div>
  );
}

// ── Day name maps (Arabic) ────────────────────────────────────────────────────
const AR_DAY_NAMES_FULL = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_DAY_NAMES_SHORT = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

// Format the schedule string for a public-group card.
// Priority: sessionDayTimes (per-day map) → recurringDays + sessionStartTime → schedule text → null
function formatSchedule(g: any): string | null {
  // Per-day mapping: { "0": "15:00", "2": "17:00" }
  if (g.sessionDayTimes && typeof g.sessionDayTimes === "object" && !Array.isArray(g.sessionDayTimes)) {
    const entries = Object.entries(g.sessionDayTimes as Record<string, string>);
    if (entries.length > 0) {
      return entries
        .map(([day, time]) => `${AR_DAY_NAMES_SHORT[Number(day)] ?? day} ${time}`)
        .join(" • ");
    }
  }
  // Days array + a shared start time
  if (g.recurringDays) {
    let days: number[] = [];
    try {
      days = typeof g.recurringDays === "string" ? JSON.parse(g.recurringDays) : g.recurringDays;
    } catch {/* fallthrough */}
    if (Array.isArray(days) && days.length > 0) {
      const dayLabels = days.map(d => AR_DAY_NAMES_SHORT[d] ?? String(d)).join("، ");
      return g.sessionStartTime ? `${dayLabels} • ${g.sessionStartTime}` : dayLabels;
    }
  }
  // Free-text schedule
  if (g.schedule) return String(g.schedule);
  return null;
}

// Public-group card component. Renders capacity, schedule, and teacher info
// for a single open group. Used inside each level card on the landing page.
function PublicGroupCard({ group, accent }: { group: any; accent: string }) {
  const max = group.maxStudents ?? 10;
  const enrolled = group.enrolledCount ?? 0;
  const remaining = group.spotsRemaining ?? Math.max(0, max - enrolled);
  const scheduleText = formatSchedule(group);

  return (
    <div
      className="rounded-xl px-3 py-2.5 space-y-2"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Top row: name + capacity badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{group.name}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
        >
          {enrolled}/{max} • متبقي {remaining}
        </span>
      </div>

      {/* Schedule */}
      {scheduleText && (
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
          <Clock className="w-3 h-3 shrink-0" />
          <span>{scheduleText}</span>
        </div>
      )}

      {/* Teacher */}
      {group.teacherName && (
        <div className="flex items-center gap-2">
          {group.teacherPhoto ? (
            <img
              src={group.teacherPhoto}
              alt={group.teacherName}
              className="w-6 h-6 rounded-full object-cover shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              <UserIcon className="w-3 h-3" />
            </div>
          )}
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            الأستاذ: <span className="font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{group.teacherName}</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Level icons ───────────────────────────────────────────────────────────────
const LEVEL_ICONS = [BookOpen, Layers, GraduationCap, Star];
const LEVEL_COLORS = [TEAL, ORANGE, "#7C6FCD", "#E85D75"];

// ── Default CMS data (shown if admin hasn't saved yet) ────────────────────────
const DEFAULT_CMS = {
  hero: {
    title: "علِّم طفلك الإنجليزية بالطريقة الطبيعية",
    subtitle: "كيدسبيك أول مركز في الجزائر يعتمد منهج التحدث أولاً — حيث تبني الثقة قبل القواعد، والمتعة قبل الحفظ.",
    cta1: "سجّل الآن",
    cta2: "تعرّف على البرامج",
  },
  stats: [
    { label: "تلميذ", value: 350, suffix: "+" },
    { label: "أستاذ", value: 18,  suffix: "" },
    { label: "برنامج", value: 4,  suffix: "" },
    { label: "رضا الأولياء", value: 97, suffix: "%" },
  ],
  sections: { programs: true, testimonials: true, ctaBanner: true, footer: true },
  testimonials: [
    { name: "والدة نور", text: "بعد ثلاثة أشهر في كيدسبيك، أصبحت ابنتي تتحدث الإنجليزية بلا خوف. التحول مذهل حقاً.", stars: 5 },
    { name: "والد ياسين", text: "ما يميز كيدسبيك هو متابعة الأخصائية النفسية لكل طفل. ابني أصبح أكثر جرأة وثقة بنفسه.", stars: 5 },
    { name: "والدة أميرة", text: "التطبيق يتيح لي متابعة تقدم ابنتي يومياً. شفافية تامة ونتائج حقيقية.", stars: 5 },
  ],
};

// ── Main landing page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [settings, setSettings] = useState<any>(null);
  const [levels,   setLevels]   = useState<any[]>([]);
  const [cms,      setCms]       = useState<typeof DEFAULT_CMS>(DEFAULT_CMS);
  const [menuOpen, setMenuOpen]  = useState(false);

  const [form, setForm] = useState({
    parentName: "", parentPhone: "", parentEmail: "",
    childName: "", childAge: "", preferredLevel: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  useEffect(() => {
    fetch("/api/public/settings")
      .then(r => r.ok ? r.json() : null).then(s => s && setSettings(s)).catch(() => {});

    fetch("/api/public/levels")
      .then(r => r.ok ? r.json() : []).then(setLevels).catch(() => {});

    fetch("/api/public/cms/settings/landing_v2")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data && typeof d.data === "object" && !Array.isArray(d.data)) {
          setCms(prev => ({
            hero:         { ...prev.hero,     ...(d.data.hero     ?? {}) },
            stats:        d.data.stats        ?? prev.stats,
            sections:     { ...prev.sections, ...(d.data.sections ?? {}) },
            testimonials: d.data.testimonials ?? prev.testimonials,
          }));
        }
      }).catch(() => {});
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parentName || !form.parentPhone || !form.childName) {
      toast({ title: "يرجى ملء الحقول الإلزامية", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/public/enquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { setSubmitted(true); }
      else { toast({ title: "حدث خطأ. يرجى المحاولة لاحقاً.", variant: "destructive" }); }
    } catch { toast({ title: "حدث خطأ. يرجى المحاولة لاحقاً.", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const schoolName  = settings?.schoolName  ?? "Kidspeak";
  const phone       = settings?.phone       ?? "";
  const email       = settings?.email       ?? "";
  const address     = settings?.address     ?? "";
  const instagram   = settings?.instagram   ?? "";
  const facebook    = settings?.facebook    ?? "";
  const youtube     = settings?.youtube     ?? "";
  const logoWhite   = settings?.logoWhiteUrl ?? "";
  const logoUrl     = settings?.logoUrl     ?? "";

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif", backgroundColor: NAVY, color: "white", minHeight: "100vh" }}
    >

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
           className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {logoWhite || logoUrl ? (
              <img src={logoWhite || logoUrl} alt={schoolName} className="h-9 object-contain" />
            ) : (
              <span style={{ color: ORANGE, fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
                Kidspeak
              </span>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { label: "البرامج",     id: "programs" },
              { label: "الأفواج",     id: "levels" },
              { label: "تواصل معنا",  id: "contact" },
            ].map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + login */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setLocation("/login")}
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              دخول
            </button>
            <button
              onClick={() => scrollTo("register")}
              className="text-sm font-bold px-5 py-2 rounded-full transition-transform active:scale-95"
              style={{ backgroundColor: ORANGE, color: NAVY }}
            >
              {cms.hero.cta1}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: "#0d1e36", borderTop: "1px solid rgba(255,255,255,0.08)" }}
               className="md:hidden px-4 py-4 space-y-3">
            {[
              { label: "البرامج",    id: "programs" },
              { label: "الأفواج",    id: "levels" },
              { label: "تواصل معنا", id: "contact" },
            ].map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)}
                      className="block w-full text-right text-sm py-2 border-b border-white/5"
                      style={{ color: "rgba(255,255,255,0.8)" }}>
                {link.label}
              </button>
            ))}
            <button onClick={() => { setMenuOpen(false); scrollTo("register"); }}
                    className="mt-2 w-full py-2.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: ORANGE, color: NAVY }}>
              {cms.hero.cta1}
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 40%, rgba(94,196,160,0.08) 0%, transparent 60%),
                       radial-gradient(ellipse 60% 50% at 80% 70%, rgba(245,166,35,0.06) 0%, transparent 60%),
                       ${NAVY}`,
          paddingTop: "6rem", paddingBottom: "5rem",
        }}
        className="px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-6 flex">
            <span
              className="text-xs font-bold px-4 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(94,196,160,0.15)", color: TEAL, border: `1px solid rgba(94,196,160,0.3)` }}
            >
              منهج التحدث أولاً — Speaking First
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6" style={{ lineHeight: 1.2 }}>
            {cms.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl"
             style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
            {cms.hero.subtitle}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-16">
            <button
              onClick={() => scrollTo("register")}
              className="px-8 py-3.5 rounded-full text-base font-bold transition-transform active:scale-95 shadow-lg"
              style={{ backgroundColor: ORANGE, color: NAVY }}
            >
              {cms.hero.cta1}
            </button>
            <button
              onClick={() => scrollTo("programs")}
              className="px-8 py-3.5 rounded-full text-base font-semibold transition-colors"
              style={{ border: `1.5px solid rgba(255,255,255,0.25)`, color: "rgba(255,255,255,0.85)" }}
            >
              {cms.hero.cta2}
              <ChevronDown className="inline w-4 h-4 mr-1 -mt-0.5" />
            </button>
          </div>

          {/* ── STAT CARDS ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users,         color: TEAL   },
              { icon: GraduationCap, color: ORANGE },
              { icon: BookOpen,      color: "#7C6FCD" },
              { icon: Heart,         color: "#E85D75" },
            ].map((cfg, i) => {
              const stat = cms.stats[i] ?? { label: "—", value: 0, suffix: "" };
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 flex flex-col gap-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1"
                       style={{ backgroundColor: `${cfg.color}22` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: cfg.color, width: 18, height: 18 }} />
                  </div>
                  <div className="text-3xl font-black" style={{ color: cfg.color }}>
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS SECTION ────────────────────────────────────────────────── */}
      {cms.sections.programs && (
        <section id="programs" className="px-4 sm:px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block"
                    style={{ backgroundColor: "rgba(245,166,35,0.12)", color: ORANGE, border: `1px solid rgba(245,166,35,0.25)` }}>
                البرامج
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 mb-4">برامجنا التعليمية</h2>
              <p className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
                مستويات مصممة لكل مرحلة عمرية — من المبتدئ إلى المتقدم
              </p>
            </div>

            {levels.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {["المستوى الأساسي", "مستوى الاكتشاف", "مستوى التعبير", "مستوى الإتقان"].map((name, i) => {
                  const Icon  = LEVEL_ICONS[i % LEVEL_ICONS.length];
                  const color = LEVEL_COLORS[i % LEVEL_COLORS.length];
                  const isFirst = i === 0;
                  return (
                    <div key={i} className="rounded-2xl p-6"
                         style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                           style={{ backgroundColor: `${color}20` }}>
                        <Icon style={{ color, width: 20, height: 20 }} />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{name}</h3>
                      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                        رحلة تعليمية شاملة مدتها ٨ أسابيع لبناء الطلاقة والثقة في التحدث.
                      </p>
                      {isFirst ? (
                        <button onClick={() => scrollTo("register")}
                                className="text-xs font-bold px-4 py-2 rounded-full transition-opacity"
                                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}44` }}>
                          سجّل في هذا المستوى
                        </button>
                      ) : (
                        <a href={`tel:`}
                           className="text-xs font-bold px-4 py-2 rounded-full transition-opacity inline-block"
                           style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
                          للاستفسار تواصل معنا
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div id="levels" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {levels.map((lv, i) => {
                  const Icon  = LEVEL_ICONS[i % LEVEL_ICONS.length];
                  const color = LEVEL_COLORS[i % LEVEL_COLORS.length];
                  const isLevel1 = i === 0;
                  const availableGroups: any[] = lv.groups ?? [];
                  const desc = lv.landingDescription || lv.descriptionAr || lv.description;
                  return (
                    <div key={lv.id} className="rounded-2xl p-6 flex flex-col gap-3"
                         style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                             style={{ backgroundColor: `${color}20` }}>
                          <Icon style={{ color, width: 20, height: 20 }} />
                        </div>
                        {lv.price && (
                          <div className="text-sm font-bold px-3 py-1 rounded-full"
                               style={{ backgroundColor: `${color}15`, color }}>
                            {Number(lv.price).toLocaleString("fr-DZ")} دج / حصة
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold">{lv.nameAr || lv.name}</h3>
                      {desc && (
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {desc}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1">
                        {lv.durationWeeks && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <Clock className="w-3.5 h-3.5" />{lv.durationWeeks} أسبوع
                          </div>
                        )}
                        {lv.sessionsPerWeek && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <BookOpen className="w-3.5 h-3.5" />{lv.sessionsPerWeek} حصة/أسبوع
                          </div>
                        )}
                      </div>

                      {/* Available groups (أفواج) */}
                      {availableGroups.length > 0 && (
                        <div className="mt-1 space-y-1.5">
                          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                            الأفواج المتاحة ({availableGroups.length})
                          </p>
                          {availableGroups.map((g: any) => (
                            <PublicGroupCard key={g.id} group={g} accent={color} />
                          ))}
                        </div>
                      )}
                      {availableGroups.length === 0 && isLevel1 && (
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                          لا توجد أفواج متاحة حالياً — تواصل معنا للاستفسار
                        </p>
                      )}

                      {/* Action button */}
                      {isLevel1 ? (
                        <button
                          onClick={() => scrollTo("register")}
                          className="mt-2 w-full py-2.5 rounded-full text-sm font-bold transition-opacity"
                          style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }}
                        >
                          سجّل في هذا المستوى
                        </button>
                      ) : (
                        <button
                          onClick={() => scrollTo("register")}
                          className="mt-2 w-full py-2.5 rounded-full text-sm font-bold transition-opacity"
                          style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
                        >
                          للاستفسار تواصل معنا
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      {cms.sections.testimonials && cms.testimonials.length > 0 && (
        <section className="px-4 sm:px-6 py-20" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block"
                    style={{ backgroundColor: "rgba(94,196,160,0.12)", color: TEAL, border: `1px solid rgba(94,196,160,0.25)` }}>
                آراء الأولياء
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4">ماذا يقول الأولياء؟</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cms.testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl p-6 flex flex-col gap-4"
                     style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Stars n={t.stars ?? 5} />
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ backgroundColor: TEAL + "30", color: TEAL }}>
                      {t.name?.charAt(0) ?? "أ"}
                    </div>
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REGISTRATION CTA ────────────────────────────────────────────────── */}
      {cms.sections.ctaBanner && (
        <section className="px-4 sm:px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-3xl px-8 py-14"
                 style={{
                   background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(245,166,35,0.08) 0%, transparent 70%), rgba(255,255,255,0.03)`,
                   border: `1px solid rgba(245,166,35,0.2)`,
                 }}>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                ابدأ رحلة طفلك اليوم
              </h2>
              <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.9 }}>
                سجّل اهتمامك الآن وسيتواصل معك فريقنا خلال ٢٤ ساعة لترتيب جلسة تقييم مجانية.
              </p>
              <button
                onClick={() => scrollTo("register")}
                className="px-10 py-3.5 rounded-full text-base font-bold shadow-xl transition-transform active:scale-95"
                style={{ backgroundColor: ORANGE, color: NAVY }}
              >
                سجّل الآن مجاناً
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── REGISTRATION FORM ───────────────────────────────────────────────── */}
      <section id="register" className="px-4 sm:px-6 py-20" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold px-4 py-1.5 rounded-full mb-4 inline-block"
                  style={{ backgroundColor: "rgba(245,166,35,0.12)", color: ORANGE, border: `1px solid rgba(245,166,35,0.25)` }}>
              التسجيل
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 mb-3">سجّل طفلك الآن</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              أرسل لنا طلبك وسنتواصل معك خلال ٢٤ ساعة لترتيب جلسة تقييم مجانية
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl p-10 text-center"
                 style={{ background: "rgba(94,196,160,0.08)", border: `1px solid ${TEAL}44` }}>
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-black mb-2" style={{ color: TEAL }}>تم استلام طلبك!</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                سيتواصل معك فريقنا خلال ٢٤ ساعة.
              </p>
            </div>
          ) : (
            <form onSubmit={submitForm} className="rounded-2xl p-6 sm:p-8 space-y-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="اسم الولي *" value={form.parentName}
                       onChange={v => setForm(p => ({ ...p, parentName: v }))} placeholder="مثال: أحمد بوعلي" />
                <Field label="رقم الهاتف *" value={form.parentPhone}
                       onChange={v => setForm(p => ({ ...p, parentPhone: v }))} placeholder="0555 123 456" type="tel" />
              </div>
              <Field label="البريد الإلكتروني" value={form.parentEmail}
                     onChange={v => setForm(p => ({ ...p, parentEmail: v }))} placeholder="example@email.com" type="email" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="اسم الطفل *" value={form.childName}
                       onChange={v => setForm(p => ({ ...p, childName: v }))} placeholder="مثال: أميرة" />
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                    سن الطفل
                  </label>
                  <select
                    value={form.childAge}
                    onChange={e => setForm(p => ({ ...p, childAge: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                  >
                    <option value="">اختر...</option>
                    {["5–6 سنوات", "7–8 سنوات", "9–10 سنوات", "11–12 سنة", "13 سنة فأكثر"].map(o => (
                      <option key={o} value={o} style={{ backgroundColor: "#0d1e36" }}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              {levels.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                    المستوى المفضل
                  </label>
                  <select
                    value={form.preferredLevel}
                    onChange={e => setForm(p => ({ ...p, preferredLevel: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                  >
                    <option value="">اختر مستوى...</option>
                    {levels.map(lv => (
                      <option key={lv.id} value={lv.nameAr || lv.name} style={{ backgroundColor: "#0d1e36" }}>
                        {lv.nameAr || lv.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  ملاحظات إضافية
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="أي معلومات تريد مشاركتها..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full text-base font-bold transition-opacity"
                style={{ backgroundColor: ORANGE, color: NAVY, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      {cms.sections.footer && (
        <footer id="contact"
                style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                className="px-4 sm:px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
              {/* Brand */}
              <div>
                {logoWhite || logoUrl ? (
                  <img src={logoWhite || logoUrl} alt={schoolName} className="h-10 object-contain mb-4" />
                ) : (
                  <div className="text-2xl font-black mb-4" style={{ color: ORANGE }}>Kidspeak</div>
                )}
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  مركز كيدسبيك لتعليم اللغات — منهج التحدث أولاً
                </p>
                {/* Social */}
                <div className="flex gap-3 mt-4">
                  {instagram && (
                    <a href={instagram} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                       style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <Instagram className="w-4 h-4" style={{ color: ORANGE }} />
                    </a>
                  )}
                  {facebook && (
                    <a href={facebook} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <Facebook className="w-4 h-4" style={{ color: ORANGE }} />
                    </a>
                  )}
                  {youtube && (
                    <a href={youtube} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <Youtube className="w-4 h-4" style={{ color: ORANGE }} />
                    </a>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="text-sm font-bold mb-4" style={{ color: ORANGE }}>روابط سريعة</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "البرامج التعليمية", id: "programs" },
                    { label: "الأفواج",            id: "levels" },
                    { label: "التسجيل",            id: "register" },
                  ].map(lnk => (
                    <li key={lnk.id}>
                      <button onClick={() => scrollTo(lnk.id)}
                              className="text-sm transition-colors"
                              style={{ color: "rgba(255,255,255,0.5)" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "white")}
                              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                        {lnk.label}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button onClick={() => setLocation("/login")}
                            className="text-sm"
                            style={{ color: "rgba(255,255,255,0.5)" }}>
                      دخول المنصة
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-bold mb-4" style={{ color: ORANGE }}>تواصل معنا</h4>
                <ul className="space-y-3">
                  {phone && (
                    <li className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
                    </li>
                  )}
                  {email && (
                    <li className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                    </li>
                  )}
                  {address && (
                    <li className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <span>{address}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="pt-6 text-center">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                &copy; {new Date().getFullYear()} {schoolName} — جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// ── Reusable form field ───────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
        }}
      />
    </div>
  );
}
