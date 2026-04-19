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
  Check,
} from "lucide-react";
import { useBranch } from "@/contexts/branch-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const { mutate: logout } = useLogout();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newMediaCount, setNewMediaCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [newIdeaCount, setNewIdeaCount] = useState(0);
  const { language, setLanguage, t, isRTL, pupilLabel } = useLanguage();
  const { branches, selectedBranchId, setSelectedBranchId } = useBranch();

  // Fetch new media count for parents, admins, photographers, designers, marketers
  useEffect(() => {
    if (!user) return;
    if (!["parent", "admin", "teacher", "photographer", "designer", "marketer"].includes(user.role)) return;
    fetch("/api/media/new-count", { credentials: "include" })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(data => setNewMediaCount(data.count ?? 0))
      .catch(() => {});
  }, [user]);

  // Fetch new idea count (admin: pending ideas; others: approved ideas)
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

  // Fetch unread message count for roles that have an inbox
  useEffect(() => {
    if (!user) return;
    if (!["parent", "admin", "teacher", "branch_manager"].includes(user.role)) return;
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

  if (!user) return <>{children}</>;

  const role = user.role as string;
  const isCustomRoleUser = !!(user as any).customRoleId;
  const userPermissions: string[] = (user as any).permissions ?? [];

  // For custom-role users: only show nav items whose permission key is granted
  function canSee(permissionKey: string): boolean {
    if (!isCustomRoleUser) return true;
    return userPermissions.includes(permissionKey);
  }

  const navItems = [
    // Admin-only top-level
    ...(role === "admin" ? [
      { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
      { href: "/revenue", label: t.nav.revenue, icon: DollarSign, permission: "revenue" },
      { href: "/performance", label: t.nav.performance, icon: LineChart, permission: "performance" },
      { href: "/groups", label: t.nav.groups, icon: BookOpen, permission: "groups" },
      { href: "/programs", label: t.nav.programs, icon: GraduationCap, permission: "programs" },
      { href: "/users", label: t.nav.users, icon: UserCog, permission: "users" },
      { href: "/admin/consultations", label: t.nav.consultations, icon: MessageCircle, permission: "consultations" },
    ] : []),
    // Accountant: finance views
    ...(role === "accountant" ? [
      { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
      { href: "/payments", label: t.nav.payments, icon: CreditCard, permission: "payments" },
      { href: "/revenue", label: t.nav.revenue, icon: DollarSign, permission: "revenue" },
      { href: "/students", label: pupilLabel, icon: Users, permission: "students" },
    ] : []),
    // Psychologist: priority feed + behavioral + consultations + sessions + earnings
    ...(role === "psychologist" ? [
      { href: "/psychologist/feed", label: t.nav.priorityQueue, icon: ShieldAlert, permission: "psychologist_feed" },
      { href: "/behavioral", label: t.nav.behavioral, icon: Brain, permission: "behavioral" },
      { href: "/psychologist/sessions", label: t.nav.mySessions, icon: BookOpen, permission: "psychologist_sessions" },
      { href: "/psychologist/earnings", label: t.nav.myEarnings, icon: Wallet, permission: "psychologist_earnings" },
      { href: "/students", label: pupilLabel, icon: Users, permission: "students" },
      { href: "/psychologist/consultations", label: t.nav.consultations, icon: MessageCircle, permission: "consultations" },
    ] : []),
    // My Groups + My Earnings for teacher
    ...(role === "teacher" ? [
      { href: "/groups", label: t.nav.myGroups, icon: BookOpen, permission: "groups" },
      { href: "/groups/earnings", label: t.nav.myEarnings, icon: Wallet, permission: "groups" },
    ] : []),
    // Evaluations for admin + teacher
    ...(role === "admin" || role === "teacher" ? [
      { href: "/evaluations", label: t.nav.evaluations, icon: LineChart, permission: "evaluations" },
    ] : []),
    // Students for admin + teacher
    ...(role === "admin" || role === "teacher" ? [
      { href: "/students", label: pupilLabel, icon: Users, permission: "students" },
    ] : []),
    // Gallery for admin + teacher
    ...(role === "admin" || role === "teacher" ? [
      { href: "/gallery", label: t.nav.gallery, icon: GalleryHorizontalEnd, permission: "gallery" },
    ] : []),
    // Parent-specific links
    ...(role === "parent" ? [
      { href: "/students", label: t.nav.myChildren, icon: Users, permission: "students" },
      { href: "/our-method", label: language === "ar" ? "منهجنا" : "Our Method", icon: Lightbulb, permission: "" },
      { href: "/gallery", label: t.nav.gallery, icon: GalleryHorizontalEnd, badge: newMediaCount > 0 ? newMediaCount : undefined, permission: "gallery" },
      { href: "/news", label: t.nav.news, icon: Megaphone, permission: "news" },
      { href: "/requests", label: t.nav.requests, icon: MapPin, permission: "requests" },
      { href: "/inbox", label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
      { href: "/payments", label: t.nav.payments, icon: CreditCard, permission: "payments" },
      { href: "/consultations", label: t.nav.consultations, icon: MessageCircle, permission: "consultations" },
    ] : []),
    // Creative Studio for admin
    ...(role === "admin" ? [
      { href: "/studio", label: t.nav.studio, icon: Palette, permission: "studio" },
    ] : []),
    // Financial Requests for admin
    ...(role === "admin" ? [
      { href: "/admin/financial-requests", label: t.nav.staffFinancialRequests, icon: FileText, permission: "financial_requests" },
    ] : []),
    // Registration Requests for admin
    ...(role === "admin" ? [
      { href: "/admin/registration-requests", label: t.nav.registrationRequests, icon: ClipboardList, permission: "registration_requests" },
    ] : []),
    // Web Content CMS for admin
    ...(role === "admin" ? [
      { href: "/admin/web-content", label: language === "ar" ? "إدارة المحتوى" : "Web Content", icon: Globe, permission: "web_content" },
    ] : []),
    // News + Inbox + Requests for admin too
    ...(role === "admin" ? [
      { href: "/news", label: t.nav.news, icon: Megaphone, permission: "news" },
      { href: "/requests", label: t.nav.requests, icon: MapPin, permission: "requests" },
      { href: "/inbox", label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
    ] : []),
    // Inbox for teacher
    ...(role === "teacher" ? [
      { href: "/inbox", label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
    ] : []),
    // Payments for admin
    ...(role === "admin" ? [
      { href: "/payments", label: t.nav.payments, icon: CreditCard, permission: "payments" },
    ] : []),
    // Behavioral for admin
    ...(role === "admin" ? [
      { href: "/behavioral", label: t.nav.behavioral, icon: Brain, permission: "behavioral" },
    ] : []),
    // Creative roles: Dashboard, Media Gallery, Creative Studio only
    ...((role === "photographer" || role === "designer" || role === "marketer") ? [
      { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
      { href: "/gallery", label: t.nav.gallery, icon: GalleryHorizontalEnd, badge: newMediaCount > 0 ? newMediaCount : undefined, permission: "gallery" },
      { href: "/studio", label: t.nav.studio, icon: Palette, permission: "studio" },
    ] : []),
    // Branch Manager: local admin for their branch
    ...(role === "branch_manager" ? [
      { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, permission: "dashboard" },
      { href: "/students", label: pupilLabel, icon: Users, permission: "students" },
      { href: "/groups", label: t.nav.groups, icon: BookOpen, permission: "groups" },
      { href: "/evaluations", label: t.nav.evaluations, icon: LineChart, permission: "evaluations" },
      { href: "/payments", label: t.nav.payments, icon: CreditCard, permission: "payments" },
      { href: "/revenue", label: t.nav.revenue, icon: DollarSign, permission: "revenue" },
      { href: "/users", label: t.nav.users, icon: UserCog, permission: "users" },
      { href: "/news", label: t.nav.news, icon: Megaphone, permission: "news" },
      { href: "/inbox", label: t.nav.inbox, icon: Inbox, badge: unreadMsgCount > 0 ? unreadMsgCount : undefined, permission: "inbox" },
      { href: "/gallery", label: t.nav.gallery, icon: GalleryHorizontalEnd, permission: "gallery" },
    ] : []),
    // Branches: Admin only
    ...(role === "admin" ? [{ href: "/branches", label: isRTL ? "الفروع" : "Branches", icon: Building2, permission: "branches" }] : []),
    // Settings: Admin only
    ...(role === "admin" ? [{ href: "/settings", label: t.nav.settings, icon: Settings, permission: "settings" }] : []),
    // Idea Box — universal
    { href: "/idea-box", label: t.nav.ideaBox, icon: Lightbulb, badge: newIdeaCount > 0 ? newIdeaCount : undefined, permission: "idea_box" },
    // My Profile for all staff (not parents)
    ...(role !== "parent" ? [{ href: "/my-profile", label: t.nav.myProfile, icon: UserCircle, permission: "my_profile" }] : []),
  ].filter(item => canSee(item.permission ?? ""));

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
      onError: (error) => {
        toast({
          title: t.nav.logout,
          description: error.error || "An error occurred",
          variant: "destructive",
        });
      }
    });
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="px-5 pt-4 pb-5">
        <img
          src="/logo_white.png"
          alt="Kidspeak"
          className="h-11 w-auto max-w-full object-contain"
          style={{ imageRendering: "auto" }}
        />
      </div>

      {/* Divider under logo */}
      <div className="h-px mx-3 mb-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

      {/* Branch Switcher — admin only, shows when branches exist */}
      {role === "admin" && branches.length > 0 && (
        <div className="px-3 mb-2">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {isRTL ? "الفرع الحالي" : "Branch Filter"}
          </div>
          <select
            value={selectedBranchId?.toString() ?? "all"}
            onChange={e => setSelectedBranchId(e.target.value === "all" ? null : parseInt(e.target.value))}
            className="w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#F5A600] cursor-pointer"
          >
            <option value="all" className="bg-[#1B2E8F] text-white">
              {isRTL ? "🏫 كل الفروع" : "🏫 All Branches"}
            </option>
            {branches.map(b => (
              <option key={b.id} value={b.id.toString()} className="bg-[#1B2E8F] text-white">
                {isRTL && b.nameAr ? b.nameAr : b.name}
                {selectedBranchId === b.id ? " ✓" : ""}
              </option>
            ))}
          </select>
          {selectedBranchId !== null && (
            <button
              onClick={() => setSelectedBranchId(null)}
              className="mt-1 w-full text-xs text-[#F5A600] hover:text-white text-center transition-colors"
            >
              {isRTL ? "× مسح الفلتر" : "× Clear filter"}
            </button>
          )}
        </div>
      )}

      {/* Nav items */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          const badge = (item as any).badge as number | undefined;
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium ${
                  isActive 
                    ? "text-[#1B2E8F] font-semibold shadow-sm" 
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: '#F5A600' } : {}}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge != null && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{
                      background: isActive ? "#1B2E8F" : "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="mt-auto pt-4 border-t border-white/10 px-2">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm mb-1"
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span>{t.language.toggle}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <Avatar className="h-8 w-8 shrink-0" style={{ backgroundColor: 'rgba(245,166,0,0.25)' }}>
            <AvatarFallback className="text-sm font-bold" style={{ color: '#F5A600', backgroundColor: 'transparent' }}>
              {user.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{user.name}</span>
            <span className="text-xs text-white/50 capitalize">{user.role}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t.nav.logout}
        </Button>
      </div>
    </>
  );

  const MobileContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      <div className="px-1 pb-6">
        <img src="/logo-full.png" alt="Kidspeak" className="h-8 w-auto" />
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm mb-2"
        >
          <Languages className="h-4 w-4" />
          <span>{t.language.toggle}</span>
        </button>
        <div className="flex items-center gap-3 px-1 mb-3">
          <Avatar className="h-8 w-8 bg-primary/10 text-primary shrink-0">
            <AvatarFallback>{user.name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t.nav.logout}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 h-screen sticky top-0 py-5"
        style={{ backgroundColor: 'hsl(229, 72%, 17%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Main content area */}
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
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-5 flex flex-col">
                <MobileContent onNavClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
