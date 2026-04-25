import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  LineChart,
  CreditCard,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  Languages,
  Brain,
  UserCog,
  BookOpen,
  Wallet,
  MessageCircle,
  Megaphone,
  Inbox,
  MapPin,
  GalleryHorizontalEnd,
  UserCircle,
  ShieldAlert,
  FileText,
  Palette,
  Lightbulb,
  ClipboardList,
  Globe,
  Building2,
  ChevronDown,
  Banknote,
  CalendarDays,
} from "lucide-react";
import { useBranch } from "@/contexts/branch-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { AiAssistant } from "@/components/ai-assistant";
import { NotificationBell } from "@/components/notification-bell";

// ── Brand tokens ────────────────────────────────────────────────────────────
const SB_BG      = "#0D1B2E";
const SB_GOLD    = "#F5A800";
const SB_ACTIVE_BG     = "rgba(245,168,0,0.15)";
const SB_ACTIVE_BORDER = "rgba(245,168,0,0.25)";
const SB_TEXT_MUTED    = "rgba(255,255,255,0.6)";
const SB_SECTION_LABEL = "rgba(255,255,255,0.25)";
const SB_DIVIDER       = "rgba(255,255,255,0.07)";
const SB_HOVER_BG      = "rgba(255,255,255,0.05)";
const SB_USER_CARD_BG  = "rgba(255,255,255,0.04)";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: string;
  badge?: number;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

// ── Role display names ───────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  admin:          "مدير",
  teacher:        "أستاذ",
  psychologist:   "أخصائي نفسي",
  parent:         "ولي أمر",
  accountant:     "محاسب",
  branch_manager: "مدير فرع",
  photographer:   "مصور",
  designer:       "مصمم",
  marketer:       "مسوّق",
  receptionist:   "مساعدة إدارية",
};

// ── KidSpeak SVG Logo Icon ───────────────────────────────────────────────────
function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: `1px solid ${SB_DIVIDER}` }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="18" r="8" fill={SB_GOLD} />
        <path d="M18 13 Q21 10 24 13" stroke={SB_GOLD} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M20 10 Q24 6 28 10" stroke={SB_GOLD} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.15 }}>
          <span style={{ color: "#fff" }}>kid</span>
          <span style={{ color: SB_GOLD }}>Speak</span>
        </div>
        <div style={{ fontSize: 10, color: SB_SECTION_LABEL, marginTop: 2 }}>أكاديمية اللغة</div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const { mutate: logout } = useLogout();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newMediaCount,  setNewMediaCount]  = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newIdeaCount,   setNewIdeaCount]   = useState(0);
  // Admin collapsible groups — all open by default
  const [openGroups, setOpenGroups] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 6])
  );
  const { language, setLanguage, t, isRTL, pupilLabel } = useLanguage();
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();
  const role = user?.role ?? "";

  // Fetch new media count
  useEffect(() => {
    if (!user) return;
    if (!["parent", "admin", "teacher", "photographer", "designer", "marketer"].includes(user.role)) return;
    fetch("/api/media/new-count", { credentials: "include" })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(data => setNewMediaCount(data.count ?? 0))
      .catch(() => {});
  }, [user]);

  // Fetch new idea count
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      fetch("/api/ideas/new-count", { credentials: "include" })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => setNewIdeaCount(data.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;
    if (!["parent", "admin", "teacher", "branch_manager", "receptionist"].includes(user.role)) return;
    const fetchUnread = () => {
      fetch("/api/messages/unread-count", { credentials: "include" })
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(data => setUnreadMsgCount(data.count ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Auto-open admin group containing current route
  useEffect(() => {
    if (role !== "admin") return;
    const groupPaths: Record<number, string[]> = {
      1: ["/groups", "/programs", "/students", "/evaluations", "/performance", "/behavioral"],
      2: ["/revenue", "/payments", "/admin/financial-requests", "/admin/salaries"],
      3: ["/inbox", "/admin/consultations", "/news", "/requests"],
      4: ["/users", "/branches", "/admin/registration-requests", "/admin/marketing-hub", "/admin/web-content", "/settings"],
      5: ["/gallery", "/studio"],
      6: ["/idea-box", "/my-profile", "/schedule"],
    };
    Object.entries(groupPaths).forEach(([idx, paths]) => {
      if (paths.some(href => location === href || location.startsWith(href + "/"))) {
        setOpenGroups(prev => new Set([...prev, Number(idx)]));
      }
    });
  }, [location, role]);

  if (!user) return <>{children}</>;

  const isCustomRoleUser = !!(user as any).customRoleId;
  const userPermissions: string[] = (user as any).permissions ?? [];

  function canSee(permissionKey: string): boolean {
    if (!isCustomRoleUser) return true;
    return userPermissions.includes(permissionKey);
  }

  function toggleGroup(idx: number) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  // ── Admin: grouped + collapsible navigation ──────────────────────────────
  const adminNavGroups: NavGroup[] = [
    {
      items: [
        { href: "/dashboard", label: isRTL ? "لوحة التحكم" : "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
      ],
    },
    {
      label: isRTL ? "الأكاديمية" : "Academic",
      items: [
        { href: "/groups",      label: t.nav.groups,      icon: BookOpen,      permission: "groups" },
        { href: "/programs",    label: t.nav.programs,    icon: GraduationCap, permission: "programs" },
        { href: "/students",    label: pupilLabel,         icon: Users,         permission: "students" },
        { href: "/evaluations", label: t.nav.evaluations, icon: LineChart,     permission: "evaluations" },
        { href: "/performance", label: t.nav.performance, icon: LineChart,     permission: "performance" },
        { href: "/behavioral",  label: t.nav.behavioral,  icon: Brain,         permission: "behavioral" },
      ],
    },
    {
      label: isRTL ? "المالية" : "Finance",
      items: [
        { href: "/revenue",                  label: t.nav.revenue,               icon: DollarSign, permission: "revenue" },
        { href: "/payments",                 label: t.nav.payments,              icon: CreditCard, permission: "payments" },
        { href: "/admin/salaries",           label: isRTL ? "الرواتب" : "Salaries", icon: Banknote, permission: "users" },
        { href: "/admin/financial-requests", label: t.nav.staffFinancialRequests, icon: FileText,  permission: "financial_requests" },
      ],
    },
    {
      label: isRTL ? "التواصل" : "Communication",
      items: [
        { href: "/inbox",               label: t.nav.inbox,         icon: Inbox,         badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
        { href: "/admin/consultations", label: t.nav.consultations, icon: MessageCircle, permission: "consultations" },
        { href: "/news",                label: t.nav.news,          icon: Megaphone,     permission: "news" },
        { href: "/schedule",            label: isRTL ? "الجدول" : "Schedule", icon: CalendarDays, permission: "my_profile" },
        { href: "/requests",            label: t.nav.requests,      icon: MapPin,        permission: "requests" },
      ],
    },
    {
      label: isRTL ? "النظام" : "System",
      items: [
        { href: "/users",                       label: t.nav.users,                icon: UserCog,     permission: "users" },
        { href: "/branches",                    label: isRTL ? "الفروع" : "Branches", icon: Building2, permission: "branches" },
        { href: "/admin/registration-requests", label: t.nav.registrationRequests, icon: ClipboardList, permission: "registration_requests" },
        { href: "/admin/marketing-hub",         label: isRTL ? "مركز التسويق" : "Marketing", icon: Megaphone, permission: "marketing_hub" },
        { href: "/admin/web-content",           label: isRTL ? "إدارة المحتوى" : "Web Content", icon: Globe, permission: "web_content" },
        { href: "/settings",                    label: t.nav.settings, icon: Settings, permission: "settings" },
      ],
    },
    {
      label: isRTL ? "الإبداع" : "Creative",
      items: [
        { href: "/gallery", label: t.nav.gallery, icon: GalleryHorizontalEnd, permission: "gallery" },
        { href: "/studio",  label: t.nav.studio,  icon: Palette,              permission: "studio" },
      ],
    },
    {
      items: [
        { href: "/psychologist/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "my_profile" },
        { href: "/idea-box",   label: t.nav.ideaBox,   icon: Lightbulb, badge: newIdeaCount > 0 ? newIdeaCount : undefined, permission: "idea_box" },
        { href: "/my-profile", label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
      ],
    },
  ];

  // ── Per-role grouped navigation ──────────────────────────────────────────
  const roleNavGroups: NavGroup[] = (() => {
    if (role === "teacher") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/employee-dashboard", label: isRTL ? "لوحة المتابعة" : "My Overview", icon: LayoutDashboard, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "صفي" : "My Class",
        items: [
          { href: "/students",  label: pupilLabel,           icon: Users,       permission: "students" },
          { href: "/groups",    label: isRTL ? "حصصي" : "My Groups", icon: BookOpen, permission: "groups" },
          { href: "/schedule",  label: isRTL ? "جدولتي" : "Schedule", icon: CalendarDays, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "التقييم" : "Assessment",
        items: [
          { href: "/evaluations", label: t.nav.evaluations, icon: LineChart, permission: "evaluations" },
          { href: "/performance", label: t.nav.performance, icon: LineChart, permission: "performance" },
          { href: "/behavioral",  label: t.nav.behavioral,  icon: Brain,     permission: "behavioral" },
        ],
      },
      {
        label: isRTL ? "أخرى" : "Other",
        items: [
          { href: "/groups/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "groups" },
          { href: "/inbox",           label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
          { href: "/gallery",         label: t.nav.gallery, icon: GalleryHorizontalEnd, permission: "gallery" },
          { href: "/idea-box",        label: t.nav.ideaBox, icon: Lightbulb, badge: newIdeaCount > 0 ? newIdeaCount : undefined, permission: "idea_box" },
          { href: "/my-profile",      label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
        ],
      },
    ];

    if (role === "psychologist") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/employee-dashboard", label: isRTL ? "لوحة المتابعة" : "My Overview", icon: LayoutDashboard, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "عملي" : "My Work",
        items: [
          { href: "/psychologist/sessions",      label: t.nav.mySessions,    icon: BookOpen,      permission: "psychologist_sessions" },
          { href: "/psychologist/consultations", label: t.nav.consultations, icon: MessageCircle, permission: "consultations" },
          { href: "/schedule",                   label: isRTL ? "جدولتي" : "Schedule", icon: CalendarDays, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "التلاميذ" : "Students",
        items: [
          { href: "/students",   label: pupilLabel,        icon: Users, permission: "students" },
          { href: "/behavioral", label: t.nav.behavioral,  icon: Brain, permission: "behavioral" },
        ],
      },
      {
        label: isRTL ? "أخرى" : "Other",
        items: [
          { href: "/psychologist/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "psychologist_earnings" },
          { href: "/psychologist/feed",     label: t.nav.priorityQueue, icon: ShieldAlert, permission: "psychologist_feed" },
          { href: "/idea-box",              label: t.nav.ideaBox, icon: Lightbulb, badge: newIdeaCount > 0 ? newIdeaCount : undefined, permission: "idea_box" },
          { href: "/my-profile",            label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
        ],
      },
    ];

    if (role === "parent") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/parent-dashboard", label: isRTL ? "لوحة المتابعة" : "My Overview", icon: LayoutDashboard, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "أطفالي" : "My Children",
        items: [
          { href: "/students",   label: t.nav.myChildren,                             icon: Users,       permission: "students" },
          { href: "/our-method", label: isRTL ? "منهجنا" : "Our Method",              icon: Lightbulb,   permission: "" },
          { href: "/schedule",   label: isRTL ? "جدولتي" : "Schedule",                icon: CalendarDays, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "المدرسة" : "School",
        items: [
          { href: "/gallery",      label: t.nav.gallery,  icon: GalleryHorizontalEnd, badge: newMediaCount > 0 ? newMediaCount : undefined, permission: "gallery" },
          { href: "/news",         label: t.nav.news,     icon: Megaphone,            permission: "news" },
          { href: "/requests",     label: t.nav.requests, icon: MapPin,               permission: "requests" },
          { href: "/inbox",        label: t.nav.inbox,    icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
          { href: "/payments",     label: t.nav.payments, icon: CreditCard,           permission: "payments" },
          { href: "/consultations",label: t.nav.consultations, icon: MessageCircle,   permission: "consultations" },
        ],
      },
    ];

    if (role === "accountant") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
        ],
      },
      {
        label: isRTL ? "المالية" : "Finance",
        items: [
          { href: "/payments", label: t.nav.payments, icon: CreditCard,  permission: "payments" },
          { href: "/revenue",  label: t.nav.revenue,  icon: DollarSign,  permission: "revenue" },
          { href: "/students", label: pupilLabel,      icon: Users,       permission: "students" },
        ],
      },
      {
        items: [
          { href: "/psychologist/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "my_profile" },
          { href: "/schedule",   label: isRTL ? "جدولتي" : "Schedule", icon: CalendarDays, permission: "my_profile" },
          { href: "/my-profile", label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
        ],
      },
    ];

    if (role === "branch_manager") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
        ],
      },
      {
        label: isRTL ? "الأكاديمية" : "Academic",
        items: [
          { href: "/students",    label: pupilLabel,        icon: Users,       permission: "students" },
          { href: "/groups",      label: t.nav.groups,      icon: BookOpen,    permission: "groups" },
          { href: "/evaluations", label: t.nav.evaluations, icon: LineChart,   permission: "evaluations" },
        ],
      },
      {
        label: isRTL ? "المالية" : "Finance",
        items: [
          { href: "/payments", label: t.nav.payments, icon: CreditCard,  permission: "payments" },
          { href: "/revenue",  label: t.nav.revenue,  icon: DollarSign,  permission: "revenue" },
        ],
      },
      {
        label: isRTL ? "أخرى" : "Other",
        items: [
          { href: "/psychologist/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "my_profile" },
          { href: "/users",    label: t.nav.users,   icon: UserCog,             permission: "users" },
          { href: "/news",     label: t.nav.news,    icon: Megaphone,           permission: "news" },
          { href: "/inbox",    label: t.nav.inbox,   icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
          { href: "/gallery",  label: t.nav.gallery, icon: GalleryHorizontalEnd, permission: "gallery" },
          { href: "/schedule", label: isRTL ? "جدولتي" : "Schedule", icon: CalendarDays, permission: "my_profile" },
          { href: "/my-profile", label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
        ],
      },
    ];

    if ((role as string) === "receptionist") return [
      {
        label: isRTL ? "الرئيسية" : "Home",
        items: [
          { href: "/students", label: isRTL ? "الرئيسية" : "Home", icon: LayoutDashboard, permission: "students" },
        ],
      },
      {
        label: isRTL ? "التسجيل" : "Enrollment",
        items: [
          { href: "/admin/registration-requests", label: isRTL ? "طلبات التسجيل" : "Registrations", icon: ClipboardList, permission: "registration_requests" },
          { href: "/students", label: isRTL ? "التلاميذ" : "Students", icon: Users, permission: "students" },
        ],
      },
      {
        label: isRTL ? "المالية" : "Finance",
        items: [
          { href: "/payments", label: isRTL ? "تسجيل دفعة" : "Payments", icon: CreditCard, permission: "payments" },
        ],
      },
      {
        label: isRTL ? "الأفواج" : "Groups",
        items: [
          { href: "/groups",   label: isRTL ? "الأفواج" : "Groups",    icon: BookOpen,    permission: "groups" },
          { href: "/schedule", label: isRTL ? "الجداول" : "Schedules", icon: CalendarDays, permission: "my_profile" },
        ],
      },
      {
        label: isRTL ? "التواصل" : "Communication",
        items: [
          { href: "/inbox",    label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
          { href: "/news",     label: t.nav.news,  icon: Megaphone, permission: "news" },
        ],
      },
      {
        items: [
          { href: "/psychologist/earnings", label: isRTL ? "مستحقاتي" : "My Earnings", icon: Wallet, permission: "my_profile" },
          { href: "/my-profile", label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" },
        ],
      },
    ];

    // Creative roles (photographer, designer, marketer)
    return [
      {
        items: [
          { href: "/studio",    label: t.nav.studio,     icon: Palette,         permission: "studio" },
          { href: "/gallery",   label: t.nav.gallery,    icon: GalleryHorizontalEnd, badge: newMediaCount > 0 ? newMediaCount : undefined, permission: "gallery" },
          { href: "/my-profile",label: t.nav.myProfile,  icon: UserCircle,      permission: "my_profile" },
        ],
      },
    ];
  })();

  const activeGroups = role === "admin" ? adminNavGroups : roleNavGroups;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => { window.location.href = "/"; },
      onError: (error) => {
        toast({
          title: t.nav.logout,
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      },
    });
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  // ── Nav item renderer ─────────────────────────────────────────────────────
  function NavItemRow({ item, onNavClick }: { item: NavItem; onNavClick?: () => void }) {
    const Icon = item.icon;
    const isActive = location === item.href || location.startsWith(item.href + "/");
    return (
      <Link href={item.href}>
        <div
          onClick={onNavClick}
          className="flex items-center gap-2.5 cursor-pointer transition-colors"
          style={{
            padding: "9px 11px",
            borderRadius: 9,
            backgroundColor: isActive ? SB_ACTIVE_BG : "transparent",
            border: `0.5px solid ${isActive ? SB_ACTIVE_BORDER : "transparent"}`,
            color: isActive ? SB_GOLD : SB_TEXT_MUTED,
            fontWeight: isActive ? 500 : 400,
            fontSize: 13,
          }}
          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = SB_HOVER_BG; }}
          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
        >
          <Icon className="shrink-0" style={{ width: 15, height: 15 }} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && (
            <span style={{
              fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              borderRadius: 9, padding: "0 5px",
              background: isActive ? "rgba(245,168,0,0.3)" : "#ef4444",
              color: isActive ? SB_GOLD : "#fff",
            }}>
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // ── Section label (non-collapsible for non-admin) ─────────────────────────
  function SectionLabel({ label }: { label: string }) {
    return (
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "1.8px",
        textTransform: "uppercase", color: SB_SECTION_LABEL,
        padding: "10px 11px 4px",
      }}>
        {label}
      </div>
    );
  }

  // ── Admin: collapsible group header ──────────────────────────────────────
  function AdminGroupHeader({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle} className="w-full flex items-center gap-2" style={{ padding: "10px 11px 4px" }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "1.8px",
          textTransform: "uppercase", color: SB_SECTION_LABEL, flex: 1, textAlign: "start",
        }}>
          {label}
        </span>
        <ChevronDown
          style={{ width: 11, height: 11, color: SB_SECTION_LABEL, transition: "transform 0.2s", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>
    );
  }

  // ── Sidebar inner content ─────────────────────────────────────────────────
  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full" style={{ backgroundColor: SB_BG }}>
      {/* Logo */}
      <SidebarLogo />

      {/* Branch switcher — admin only */}
      {role === "admin" && branches.length > 0 && (
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${SB_DIVIDER}` }}>
          <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: SB_SECTION_LABEL, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Building2 style={{ width: 10, height: 10 }} />
            {isRTL ? "الفرع الحالي" : "Branch Filter"}
          </div>
          <select
            value={selectedBranchId?.toString() ?? "all"}
            onChange={e => setSelectedBranchId(e.target.value === "all" ? null : parseInt(e.target.value))}
            style={{
              width: "100%", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 600,
              border: "0.5px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.07)",
              color: "#fff", outline: "none", cursor: "pointer",
            }}
          >
            <option value="all" style={{ background: SB_BG }}>{isRTL ? "🏫 كل الفروع" : "🏫 All Branches"}</option>
            {branches.map(b => (
              <option key={b.id} value={b.id.toString()} style={{ background: SB_BG }}>
                {isRTL && b.nameAr ? b.nameAr : b.name}
                {selectedBranchId === b.id ? " ✓" : ""}
              </option>
            ))}
          </select>
          {selectedBranchId !== null && (
            <button onClick={() => setSelectedBranchId(null)} style={{ marginTop: 4, width: "100%", fontSize: 10, color: SB_GOLD, textAlign: "center" }}>
              {isRTL ? "× مسح الفلتر" : "× Clear filter"}
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 8px 4px" }}>
        {activeGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => canSee(item.permission ?? ""));
          if (visibleItems.length === 0) return null;

          const isAdminGroup = role === "admin";
          const isOpen = openGroups.has(groupIdx);

          return (
            <div key={groupIdx}>
              {group.label && (
                isAdminGroup
                  ? <AdminGroupHeader label={group.label} isOpen={isOpen} onToggle={() => toggleGroup(groupIdx)} />
                  : <SectionLabel label={group.label} />
              )}
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                style={{ gridTemplateRows: (!group.label || !isAdminGroup || isOpen) ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {visibleItems.map(item => (
                      <NavItemRow key={item.href} item={item} onNavClick={onNavClick} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Language toggle */}
      <div style={{ padding: "6px 8px 0", borderTop: `1px solid ${SB_DIVIDER}` }}>
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-2 transition-colors"
          style={{ padding: "8px 11px", borderRadius: 8, color: SB_TEXT_MUTED, fontSize: 12 }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = SB_HOVER_BG)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Languages style={{ width: 14, height: 14 }} />
          <span>{t.language.toggle}</span>
        </button>
      </div>

      {/* User card */}
      <div style={{ margin: "6px 8px 10px", background: SB_USER_CARD_BG, border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 11, padding: "10px 12px" }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "rgba(245,168,0,0.2)", border: "1.5px solid rgba(245,168,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: SB_GOLD, fontWeight: 600, fontSize: 12 }}>
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{user.name}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 1 }}>
              {ROLE_LABELS[role] ?? role}
            </div>
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${SB_DIVIDER}`, paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: "rgba(240,100,100,0.8)", fontSize: 12 }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            <span>{t.nav.logout}</span>
          </button>
          <NotificationBell />
        </div>
      </div>
    </div>
  );

  // ── Mobile drawer content ─────────────────────────────────────────────────
  const MobileContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full" style={{ backgroundColor: SB_BG }}>
      <div className="px-1 pb-4">
        <img src="/logo-full.png" alt="Kidspeak" className="h-8 w-auto" />
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 6px" }}>
        {activeGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => canSee(item.permission ?? ""));
          if (visibleItems.length === 0) return null;
          const isAdminGroup = role === "admin";
          const isOpen = openGroups.has(groupIdx);
          return (
            <div key={groupIdx}>
              {group.label && (
                isAdminGroup
                  ? <AdminGroupHeader label={group.label} isOpen={isOpen} onToggle={() => toggleGroup(groupIdx)} />
                  : <SectionLabel label={group.label} />
              )}
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                style={{ gridTemplateRows: (!group.label || !isAdminGroup || isOpen) ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {visibleItems.map(item => (
                      <NavItemRow key={item.href} item={item} onNavClick={onNavClick} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "6px 8px 0", borderTop: `1px solid ${SB_DIVIDER}` }}>
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-2"
          style={{ padding: "8px 11px", borderRadius: 8, color: SB_TEXT_MUTED, fontSize: 12 }}
        >
          <Languages style={{ width: 14, height: 14 }} />
          <span>{t.language.toggle}</span>
        </button>
      </div>
      <div style={{ margin: "6px 8px 10px", background: SB_USER_CARD_BG, border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 11, padding: "10px 12px" }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(245,168,0,0.2)", border: "1.5px solid rgba(245,168,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: SB_GOLD, fontWeight: 600, fontSize: 12 }}>{user.name?.charAt(0)?.toUpperCase() ?? "?"}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{user.name}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{ROLE_LABELS[role] ?? role}</div>
          </div>
        </div>
        <div style={{ borderTop: `0.5px solid ${SB_DIVIDER}`, paddingTop: 8 }}>
          <button onClick={handleLogout} className="flex items-center gap-1.5 w-full" style={{ color: "rgba(240,100,100,0.8)", fontSize: 12 }}>
            <LogOut style={{ width: 13, height: 13 }} />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar — 215px */}
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 overflow-hidden"
        style={{ width: 215, minWidth: 215, backgroundColor: SB_BG }}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
          <img src="/logo-full.png" alt="Kidspeak" className="h-7 w-auto" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="text-xs font-semibold px-2 py-1 rounded border text-primary border-primary/30 hover:bg-primary/5 transition-colors"
            >
              {t.language.toggle}
            </button>
            <NotificationBell isMobile />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-0 flex flex-col overflow-hidden">
                <MobileContent onNavClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <AiAssistant role={(user as any)?.role} />
    </div>
  );
}
