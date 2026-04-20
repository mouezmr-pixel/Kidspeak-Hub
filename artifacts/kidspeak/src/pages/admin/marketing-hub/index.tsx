import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ClipboardList,
  Sun,
  Sparkles,
  Users,
  TrendingUp,
  Pause,
  Play,
  Eye,
  Edit2,
  Plus,
  Download,
  Megaphone,
  Target,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

function safeFmt(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return format(d, fmt);
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BRAND_BLUE   = "#1B2E8F";
const BRAND_YELLOW = "#F5A600";

// ── Types ─────────────────────────────────────────────────────────────────────
type CampaignType   = "open_day" | "early_registration" | "summer_school" | "custom";
type CampaignStatus = "active" | "paused" | "ended";
type CtaType        = "whatsapp" | "form" | "call";

interface Campaign {
  id: number;
  name: string;
  nameAr: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  leadsCount: number;
  leadsToday: number;
  ctaType: CtaType;
  slug: string;
  conversionRate?: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: "Open Day — Spring 2026",
    nameAr: "اليوم المفتوح — ربيع 2026",
    type: "open_day",
    status: "active",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    leadsCount: 47,
    leadsToday: 3,
    ctaType: "whatsapp",
    slug: "open-day-spring-2026",
  },
  {
    id: 2,
    name: "Early Registration — Sep 2026",
    nameAr: "التسجيل المبكر — سبتمبر 2026",
    type: "early_registration",
    status: "active",
    startDate: "2026-03-15",
    endDate: "2026-05-31",
    leadsCount: 23,
    leadsToday: 1,
    ctaType: "form",
    slug: "early-reg-sep-2026",
  },
  {
    id: 3,
    name: "Summer School 2025",
    nameAr: "المدرسة الصيفية 2025",
    type: "summer_school",
    status: "paused",
    startDate: "2025-06-01",
    endDate: "2025-07-31",
    leadsCount: 12,
    leadsToday: 0,
    ctaType: "whatsapp",
    slug: "summer-2025",
  },
  {
    id: 4,
    name: "Open Day — Fall 2025",
    nameAr: "اليوم المفتوح — خريف 2025",
    type: "open_day",
    status: "ended",
    startDate: "2025-10-01",
    endDate: "2025-10-31",
    leadsCount: 89,
    leadsToday: 0,
    ctaType: "form",
    slug: "open-day-fall-2025",
    conversionRate: 34,
  },
];

// ── Config Maps ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  CampaignType,
  { icon: React.ElementType; label: string; labelAr: string; color: string }
> = {
  open_day:           { icon: CalendarDays,  label: "Open Day",           labelAr: "يوم مفتوح",      color: "#7c3aed" },
  early_registration: { icon: ClipboardList, label: "Early Registration", labelAr: "تسجيل مبكر",     color: BRAND_BLUE },
  summer_school:      { icon: Sun,           label: "Summer School",      labelAr: "مدرسة صيفية",    color: "#ea580c" },
  custom:             { icon: Sparkles,      label: "Custom",             labelAr: "حملة مخصصة",     color: "#16a34a" },
};

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; labelAr: string; color: string; bg: string; border: string; dot: string }
> = {
  active: { label: "Active",  labelAr: "نشطة",   color: "#16a34a", bg: "#f0fdf4", border: "#16a34a", dot: "#16a34a" },
  paused: { label: "Paused",  labelAr: "موقوفة", color: "#b45309", bg: "#fffbeb", border: "#F5A600", dot: "#F5A600" },
  ended:  { label: "Ended",   labelAr: "منتهية", color: "#64748b", bg: "#f8fafc", border: "#cbd5e1", dot: "#94a3b8" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return safeFmt(d, "MMM d, yyyy");
}

// ── Campaign Card ─────────────────────────────────────────────────────────────
function CampaignCard({
  campaign,
  onToggle,
  onView,
  onEdit,
  isRTL,
}: {
  campaign: Campaign;
  onToggle: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  isRTL: boolean;
}) {
  const typeConf   = TYPE_CONFIG[campaign.type];
  const statusConf = STATUS_CONFIG[campaign.status];
  const TypeIcon   = typeConf.icon;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{
        border: "1px solid #f1f5f9",
        borderInlineStart: `4px solid ${statusConf.border}`,
      }}
    >
      {/* Top Section */}
      <div className="p-4 pb-3">

        {/* Type badge + Status pill */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold shrink-0"
            style={{ backgroundColor: `${typeConf.color}15`, color: typeConf.color }}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            {isRTL ? typeConf.labelAr : typeConf.label}
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: statusConf.bg, color: statusConf.color }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${campaign.status === "active" ? "animate-pulse" : ""}`}
              style={{ backgroundColor: statusConf.dot }}
            />
            {isRTL ? statusConf.labelAr : statusConf.label}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bold text-sm text-slate-800 leading-snug mb-2" dir="auto">
          {isRTL ? campaign.nameAr : campaign.name}
        </h3>

        {/* Date range */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
          <CalendarDays className="w-3 h-3 shrink-0" />
          {fmtDate(campaign.startDate)} → {fmtDate(campaign.endDate)}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {/* Total leads */}
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: `${BRAND_BLUE}08` }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3" style={{ color: BRAND_BLUE }} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                {isRTL ? "عملاء" : "Leads"}
              </span>
            </div>
            <p className="text-2xl font-black" style={{ color: BRAND_BLUE }}>
              {campaign.leadsCount}
            </p>
          </div>

          {/* Secondary stat: Today (active) | Conversion (ended) | Dash (paused) */}
          {campaign.status === "active" && (
            <div className="rounded-xl p-3 text-center bg-green-50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-green-600" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                  {isRTL ? "اليوم" : "Today"}
                </span>
              </div>
              <p className="text-2xl font-black text-green-600">+{campaign.leadsToday}</p>
            </div>
          )}
          {campaign.status === "ended" && campaign.conversionRate != null && (
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: `${BRAND_YELLOW}12` }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3 h-3" style={{ color: BRAND_YELLOW }} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                  {isRTL ? "تحويل" : "Conv."}
                </span>
              </div>
              <p className="text-2xl font-black" style={{ color: BRAND_YELLOW }}>
                {campaign.conversionRate}%
              </p>
            </div>
          )}
          {(campaign.status === "paused" ||
            (campaign.status === "ended" && campaign.conversionRate == null)) && (
            <div className="rounded-xl p-3 text-center bg-slate-50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] text-slate-300 uppercase tracking-wide font-medium">
                  {isRTL ? "معدل" : "Rate"}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-300">—</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs font-semibold gap-1.5"
          onClick={() => onView(campaign.id)}
        >
          <Eye className="w-3.5 h-3.5" />
          {isRTL ? "عرض" : "View"}
        </Button>

        {campaign.status !== "ended" && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-semibold gap-1"
            style={
              campaign.status === "active"
                ? { borderColor: "#fcd34d", color: "#92400e", background: "#fffbeb" }
                : { borderColor: "#86efac", color: "#166534", background: "#f0fdf4" }
            }
            onClick={() => onToggle(campaign.id)}
          >
            {campaign.status === "active" ? (
              <><Pause className="w-3.5 h-3.5" />{isRTL ? "إيقاف" : "Pause"}</>
            ) : (
              <><Play  className="w-3.5 h-3.5" />{isRTL ? "استئناف" : "Resume"}</>
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2.5 text-slate-400 hover:text-slate-700"
          onClick={() => onEdit(campaign.id)}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  campaigns,
  onToggle,
  onView,
  onEdit,
  isRTL,
}: {
  status: CampaignStatus;
  campaigns: Campaign[];
  onToggle: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  isRTL: boolean;
}) {
  const conf  = STATUS_CONFIG[status];
  const label = isRTL ? conf.labelAr : conf.label;

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.dot }} />
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex-1">
          {label}
        </h2>
        <span
          className="text-xs font-black px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${conf.dot}20`, color: conf.color }}
        >
          {campaigns.length}
        </span>
      </div>

      {/* Divider under header */}
      <div className="h-0.5 rounded-full mb-4" style={{ backgroundColor: `${conf.border}30` }} />

      {/* Cards stack */}
      <div className="space-y-4 flex-1">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-100 py-10 text-center">
            <p className="text-xs text-slate-300 font-medium">
              {isRTL ? `لا توجد حملات ${label}` : `No ${label.toLowerCase()} campaigns`}
            </p>
          </div>
        ) : (
          campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onToggle={onToggle}
              onView={onView}
              onEdit={onEdit}
              isRTL={isRTL}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketingHub() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const active = campaigns.filter(c => c.status === "active");
  const paused = campaigns.filter(c => c.status === "paused");
  const ended  = campaigns.filter(c => c.status === "ended");

  const totalLeads = campaigns.reduce((sum, c) => sum + c.leadsCount, 0);
  const todayLeads = active.reduce((sum, c) => sum + c.leadsToday, 0);

  const handleToggle = (id: number) => {
    const target = campaigns.find(c => c.id === id);
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    );
    toast({
      title: target?.status === "active"
        ? (isRTL ? "تم إيقاف الحملة مؤقتاً" : "Campaign paused")
        : (isRTL ? "تم استئناف الحملة" : "Campaign resumed"),
    });
  };

  const handleView = (_id: number) => {
    toast({ title: isRTL ? "عرض التفاصيل — قريباً في المرحلة الثانية" : "Campaign detail view — coming in Phase 2." });
  };

  const handleEdit = (_id: number) => {
    toast({ title: isRTL ? "محرر الحملة — قريباً في المرحلة الثانية" : "Campaign editor — coming in Phase 2." });
  };

  const STATS = [
    {
      label: isRTL ? "إجمالي الحملات" : "Total Campaigns",
      value: campaigns.length,
      icon: Megaphone,
      color: BRAND_BLUE,
    },
    {
      label: isRTL ? "الحملات النشطة" : "Active Now",
      value: active.length,
      icon: TrendingUp,
      color: "#16a34a",
    },
    {
      label: isRTL ? "إجمالي العملاء" : "Total Leads",
      value: totalLeads,
      icon: Users,
      color: BRAND_BLUE,
    },
    {
      label: isRTL ? "عملاء اليوم" : "Leads Today",
      value: `+${todayLeads}`,
      icon: Zap,
      color: BRAND_YELLOW,
    },
  ];

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-5"
        style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #0f1e5c 100%)` }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,166,0,0.2)", border: "1px solid rgba(245,166,0,0.3)" }}
            >
              <Megaphone className="w-6 h-6" style={{ color: BRAND_YELLOW }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                {isRTL ? "مركز التسويق" : "Marketing Hub"}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                {isRTL
                  ? "أطلق حملاتك، استقطب عملاء جدد، وتتبع النتائج"
                  : "Launch campaigns, capture leads, and track conversions"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-white border-white/25 hover:bg-white/10 hover:text-white hover:border-white/40"
              onClick={() => toast({ title: "Export leads — coming in Phase 2." })}
            >
              <Download className="w-4 h-4" />
              {isRTL ? "تصدير القوائم" : "Export Leads"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-bold"
              style={{ backgroundColor: BRAND_YELLOW, color: BRAND_BLUE }}
              onClick={() => toast({ title: "Campaign builder — coming in Phase 2." })}
            >
              <Plus className="w-4 h-4" />
              {isRTL ? "حملة جديدة" : "New Campaign"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Kanban Board ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <KanbanColumn
          status="active"
          campaigns={active}
          onToggle={handleToggle}
          onView={handleView}
          onEdit={handleEdit}
          isRTL={isRTL}
        />
        <KanbanColumn
          status="paused"
          campaigns={paused}
          onToggle={handleToggle}
          onView={handleView}
          onEdit={handleEdit}
          isRTL={isRTL}
        />
        <KanbanColumn
          status="ended"
          campaigns={ended}
          onToggle={handleToggle}
          onView={handleView}
          onEdit={handleEdit}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}
