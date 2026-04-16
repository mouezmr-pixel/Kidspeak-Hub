import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Globe, Plus, Pencil, Trash2, Eye, EyeOff, Save, ChevronDown, ChevronUp,
  Star, FileText, Layout, MessageSquare, Layers, ExternalLink, CalendarDays, ToggleLeft, ToggleRight, Percent, Tag,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

const API = "";

function getLang(en: string, ar: string, lang: string) {
  return lang === "ar" ? (ar || en) : (en || ar);
}

// ── Testimonial editor ────────────────────────────────────────────────────────
interface Testimonial {
  id: string;
  name: string;
  nameAr: string;
  text: string;
  textAr: string;
  stars: number;
}

// ── Default hero data ─────────────────────────────────────────────────────────
const DEFAULT_HERO = {
  h1En: "Stop Studying English. Start Speaking It.",
  h1Ar: "توقف عن دراسة الإنجليزية. ابدأ بالتحدث بها.",
  subtitleEn: "Kidspeak is Algeria's first school that teaches children English the natural way — through speaking, confidence, and joy.",
  subtitleAr: "كيدسبيك أول مدرسة في الجزائر تُعلّم الأطفال الإنجليزية بالطريقة الطبيعية — عبر التحدث والثقة والمتعة.",
  badgeEn: "Speaking-First Methodology",
  badgeAr: "منهج التحدث أولاً",
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "1", name: "Nour's Mother", nameAr: "والدة نور", text: "After just 3 months at Kidspeak, my daughter speaks English without hesitation.", textAr: "بعد 3 أشهر فقط في كيدسبيك، ابنتي تتحدث الإنجليزية دون تردد.", stars: 5 },
  { id: "2", name: "Yacine's Father", nameAr: "والد ياسين", text: "I love the parent portal. I can see exactly what my son is working on.", textAr: "أحب بوابة الوالدين. أستطيع رؤية ما يعمل عليه ابني بالضبط.", stars: 5 },
  { id: "3", name: "Amira's Mother", nameAr: "والدة أميرة", text: "The psychologist's involvement is what makes Kidspeak different.", textAr: "تدخل الأخصائية النفسية هو ما يجعل كيدسبيك مختلفة.", stars: 5 },
];

export default function WebContentPage() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const isAr = language === "ar";

  // ── Hero state ───────────────────────────────────────────────────────────────
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [savingHero, setSavingHero] = useState(false);

  // ── Testimonials state ───────────────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [savingTestimonials, setSavingTestimonials] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);

  // ── Open Day state ───────────────────────────────────────────────────────────
  const DEFAULT_OPEN_DAY = {
    enabled: false,
    greetingEn: "Welcome to Kidspeak Open Day!",
    greetingAr: "مرحباً بكم في اليوم المفتوح لكيدسبيك!",
    discount: 20,
    discountDescEn: "For registrations made today only!",
    discountDescAr: "للتسجيلات المقدمة اليوم فقط!",
    ctaTextEn: "Claim My Discount Now",
    ctaTextAr: "احصل على خصمي الآن",
  };
  const [openDay, setOpenDay] = useState(DEFAULT_OPEN_DAY);
  const [savingOpenDay, setSavingOpenDay] = useState(false);

  // ── Custom pages state ───────────────────────────────────────────────────────
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [isPageOpen, setIsPageOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageForm, setPageForm] = useState({
    titleEn: "", titleAr: "", slug: "",
    contentEn: "", contentAr: "",
    status: "draft", showInNavbar: false, showInFooter: false,
  });
  const [savingPage, setSavingPage] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);

  // ── Load CMS settings on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/public/cms/settings/hero`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && Object.keys(d.data).length > 0) setHero({ ...DEFAULT_HERO, ...d.data }); })
      .catch(() => {});

    fetch(`${API}/api/public/cms/settings/testimonials`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && Array.isArray(d.data) && d.data.length > 0) setTestimonials(d.data); })
      .catch(() => {});

    fetch(`${API}/api/public/cms/settings/open_day`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && typeof d.data === "object" && !Array.isArray(d.data)) setOpenDay(prev => ({ ...prev, ...d.data })); })
      .catch(() => {});

    loadPages();
  }, []);

  function loadPages() {
    setLoadingPages(true);
    fetch(`${API}/api/admin/cms/pages`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPages(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoadingPages(false));
  }

  // ── Save hero ────────────────────────────────────────────────────────────────
  async function saveHero() {
    setSavingHero(true);
    try {
      const res = await fetch(`${API}/api/admin/cms/settings/hero`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      if (!res.ok) throw new Error();
      toast({ title: isAr ? "تم الحفظ ✓" : "Saved ✓", description: isAr ? "تم تحديث الصفحة الرئيسية" : "Landing page updated" });
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setSavingHero(false);
    }
  }

  // ── Save testimonials ────────────────────────────────────────────────────────
  async function saveTestimonials(list: Testimonial[]) {
    setSavingTestimonials(true);
    try {
      const res = await fetch(`${API}/api/admin/cms/settings/testimonials`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });
      if (!res.ok) throw new Error();
      toast({ title: isAr ? "تم الحفظ ✓" : "Saved ✓" });
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setSavingTestimonials(false);
    }
  }

  // ── Save open day ────────────────────────────────────────────────────────────
  async function saveOpenDay() {
    setSavingOpenDay(true);
    try {
      const res = await fetch(`${API}/api/admin/cms/settings/open_day`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(openDay),
      });
      if (!res.ok) throw new Error();
      toast({ title: isAr ? "تم الحفظ ✓" : "Saved ✓", description: isAr ? "تم تحديث إعدادات اليوم المفتوح" : "Open Day settings updated" });
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setSavingOpenDay(false);
    }
  }

  function openNewTestimonial() {
    setEditingTestimonial({ id: Date.now().toString(), name: "", nameAr: "", text: "", textAr: "", stars: 5 });
    setIsTestimonialOpen(true);
  }

  function saveTestimonialEdit() {
    if (!editingTestimonial) return;
    const newList = testimonials.find(t => t.id === editingTestimonial.id)
      ? testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t)
      : [...testimonials, editingTestimonial];
    setTestimonials(newList);
    saveTestimonials(newList);
    setIsTestimonialOpen(false);
  }

  function deleteTestimonial(id: string) {
    const newList = testimonials.filter(t => t.id !== id);
    setTestimonials(newList);
    saveTestimonials(newList);
  }

  // ── Custom page CRUD ─────────────────────────────────────────────────────────
  function openNewPage() {
    setEditingPage(null);
    setPageForm({ titleEn: "", titleAr: "", slug: "", contentEn: "", contentAr: "", status: "draft", showInNavbar: false, showInFooter: false });
    setIsPageOpen(true);
  }

  function openEditPage(page: any) {
    setEditingPage(page);
    setPageForm({
      titleEn: page.titleEn, titleAr: page.titleAr ?? "",
      slug: page.slug.replace(/^\//, ""),
      contentEn: page.contentEn ?? "", contentAr: page.contentAr ?? "",
      status: page.status, showInNavbar: page.showInNavbar, showInFooter: page.showInFooter,
    });
    setIsPageOpen(true);
  }

  async function savePage() {
    setSavingPage(true);
    try {
      const isEdit = !!editingPage;
      const url = isEdit ? `${API}/api/admin/cms/pages/${editingPage.id}` : `${API}/api/admin/cms/pages`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast({ title: isAr ? "تم الحفظ ✓" : "Saved ✓" });
      setIsPageOpen(false);
      loadPages();
    } catch (err: any) {
      toast({ title: err.message || (isAr ? "خطأ" : "Error"), variant: "destructive" });
    } finally {
      setSavingPage(false);
    }
  }

  async function deletePage(id: number) {
    setDeletingPageId(id);
    try {
      await fetch(`${API}/api/admin/cms/pages/${id}`, { method: "DELETE", credentials: "include" });
      loadPages();
      toast({ title: isAr ? "تم الحذف" : "Deleted" });
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setDeletingPageId(null);
    }
  }

  async function togglePageStatus(page: any) {
    const newStatus = page.status === "published" ? "draft" : "published";
    try {
      await fetch(`${API}/api/admin/cms/pages/${page.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, status: newStatus, slug: page.slug.replace(/^\//, "") }),
      });
      loadPages();
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    }
  }

  // ── Auto-generate slug from title ────────────────────────────────────────────
  function handleTitleChange(val: string) {
    setPageForm(prev => ({
      ...prev,
      titleEn: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Page header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, #1B2E8F, #7c3aed)" }}
      >
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 opacity-80" />
          <div>
            <h1 className="text-xl font-black">{isAr ? "إدارة المحتوى" : "Web Content Management"}</h1>
            <p className="text-white/70 text-sm">{isAr ? "تحكم في محتوى الموقع والصفحات المخصصة" : "Control your website content and create custom pages"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="landing" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="landing" className="flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5" />
            {isAr ? "محرر الصفحة الرئيسية" : "Landing Page Editor"}
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {isAr ? "الصفحات المخصصة" : "Custom Pages"}
          </TabsTrigger>
          <TabsTrigger value="open_day" className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {isAr ? "إعدادات اليوم المفتوح" : "Open Day Settings"}
          </TabsTrigger>
        </TabsList>

        {/* ── LANDING PAGE EDITOR ── */}
        <TabsContent value="landing" className="space-y-6">

          {/* Hero Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: "#1B2E8F" }}>
                  <Layout className="w-4 h-4" />
                  {isAr ? "قسم البطولة (Hero)" : "Hero Section"}
                </CardTitle>
                <Button
                  onClick={saveHero}
                  disabled={savingHero}
                  style={{ backgroundColor: "#1B2E8F", color: "white" }}
                  size="sm"
                >
                  <Save className="w-3.5 h-3.5 me-1.5" />
                  {savingHero ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "الشارة (EN)" : "Badge (EN)"}</label>
                  <Input
                    value={hero.badgeEn}
                    onChange={e => setHero(h => ({ ...h, badgeEn: e.target.value }))}
                    placeholder="Speaking-First Methodology"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "الشارة (AR)" : "Badge (AR)"}</label>
                  <Input
                    dir="rtl"
                    value={hero.badgeAr}
                    onChange={e => setHero(h => ({ ...h, badgeAr: e.target.value }))}
                    placeholder="منهج التحدث أولاً"
                  />
                </div>
              </div>

              {/* H1 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "العنوان الرئيسي (EN)" : "Main Title H1 (EN)"}</label>
                  <Textarea
                    value={hero.h1En}
                    onChange={e => setHero(h => ({ ...h, h1En: e.target.value }))}
                    rows={2}
                    placeholder="Stop Studying English. Start Speaking It."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "العنوان الرئيسي (AR)" : "Main Title H1 (AR)"}</label>
                  <Textarea
                    dir="rtl"
                    value={hero.h1Ar}
                    onChange={e => setHero(h => ({ ...h, h1Ar: e.target.value }))}
                    rows={2}
                    placeholder="توقف عن دراسة الإنجليزية. ابدأ بالتحدث بها."
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "النص الثانوي (EN)" : "Subtitle (EN)"}</label>
                  <Textarea
                    value={hero.subtitleEn}
                    onChange={e => setHero(h => ({ ...h, subtitleEn: e.target.value }))}
                    rows={3}
                    placeholder="Kidspeak is Algeria's first school..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "النص الثانوي (AR)" : "Subtitle (AR)"}</label>
                  <Textarea
                    dir="rtl"
                    value={hero.subtitleAr}
                    onChange={e => setHero(h => ({ ...h, subtitleAr: e.target.value }))}
                    rows={3}
                    placeholder="كيدسبيك أول مدرسة في الجزائر..."
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-xl border-2 border-dashed border-[#1B2E8F20] p-4" style={{ backgroundColor: "#1B2E8F04" }}>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  {isAr ? "معاينة حية" : "Live Preview"}
                </p>
                <div className="rounded-xl p-5 text-white text-center" style={{ background: "linear-gradient(135deg, #0f1c5c, #1B2E8F)" }}>
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold mb-3" style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}>
                    {getLang(hero.badgeEn, hero.badgeAr, language)}
                  </span>
                  <div className="text-2xl font-black mb-2 leading-tight">
                    {getLang(hero.h1En, hero.h1Ar, language)}
                  </div>
                  <p className="text-white/70 text-sm">{getLang(hero.subtitleEn, hero.subtitleAr, language)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: "#1B2E8F" }}>
                  <MessageSquare className="w-4 h-4" />
                  {isAr ? "آراء أولياء الأمور" : "Parent Testimonials"}
                  <span className="text-xs font-normal text-muted-foreground">({testimonials.length})</span>
                </CardTitle>
                <Button
                  onClick={openNewTestimonial}
                  style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
                  size="sm"
                >
                  <Plus className="w-3.5 h-3.5 me-1" />
                  {isAr ? "إضافة رأي" : "Add Review"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {testimonials.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-4 rounded-xl border bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{getLang(t.name, t.nameAr, language)}</span>
                      <div className="flex text-[#F5A600]">
                        {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{getLang(t.text, t.textAr, language)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingTestimonial(t); setIsTestimonialOpen(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => deleteTestimonial(t.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{isAr ? "لا توجد آراء" : "No testimonials yet"}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CUSTOM PAGES ── */}
        <TabsContent value="pages" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold" style={{ color: "#1B2E8F" }}>{isAr ? "الصفحات المخصصة" : "Custom Pages"}</h2>
              <p className="text-sm text-muted-foreground">{isAr ? "أنشئ صفحات مخصصة تظهر في الموقع" : "Create custom pages that appear on your website"}</p>
            </div>
            <Button
              onClick={openNewPage}
              style={{ backgroundColor: "#1B2E8F", color: "white" }}
            >
              <Plus className="w-4 h-4 me-2" />
              {isAr ? "إضافة صفحة" : "New Page"}
            </Button>
          </div>

          {loadingPages ? (
            <div className="text-center py-10 text-muted-foreground text-sm">{isAr ? "جاري التحميل..." : "Loading..."}</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed" style={{ borderColor: "#1B2E8F30" }}>
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#1B2E8F" }} />
              <p className="font-semibold text-muted-foreground">{isAr ? "لا توجد صفحات مخصصة" : "No custom pages yet"}</p>
              <p className="text-sm text-muted-foreground mt-1">{isAr ? "أنشئ صفحتك الأولى" : "Create your first page"}</p>
              <Button onClick={openNewPage} className="mt-4" style={{ backgroundColor: "#1B2E8F", color: "white" }}>
                <Plus className="w-4 h-4 me-2" />
                {isAr ? "إنشاء صفحة" : "Create Page"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{getLang(page.titleEn, page.titleAr, language)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${page.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {page.status === "published" ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft")}
                      </span>
                      {page.showInNavbar && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{isAr ? "القائمة" : "Navbar"}</span>}
                      {page.showInFooter && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{isAr ? "التذييل" : "Footer"}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <code className="text-xs text-muted-foreground">{page.slug}</code>
                      {page.status === "published" && (
                        <a href={`/p${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1B2E8F]">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => togglePageStatus(page)}
                      title={page.status === "published" ? (isAr ? "إلغاء النشر" : "Unpublish") : (isAr ? "نشر" : "Publish")}
                    >
                      {page.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => openEditPage(page)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-500 hover:text-red-600"
                      onClick={() => deletePage(page.id)}
                      disabled={deletingPageId === page.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── OPEN DAY SETTINGS ── */}
        <TabsContent value="open_day" className="space-y-6">

          {/* Visibility Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: "#1B2E8F" }}>
                <CalendarDays className="w-4 h-4" />
                {isAr ? "التحكم في اليوم المفتوح" : "Open Day Control"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl border-2" style={{ borderColor: openDay.enabled ? "#F5A600" : "#e5e7eb", backgroundColor: openDay.enabled ? "#FFFBF0" : "#f9fafb" }}>
                <div>
                  <p className="font-bold text-gray-900">{isAr ? "إظهار قسم اليوم المفتوح" : "Show Open Day Section"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isAr
                      ? (openDay.enabled ? "القسم مفعّل ويظهر في صفحة الرئيسية" : "القسم مخفي — لن يظهر في الصفحة الرئيسية")
                      : (openDay.enabled ? "Section is LIVE — visible on the landing page" : "Section is OFF — hidden from the landing page")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDay(d => ({ ...d, enabled: !d.enabled }))}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{ backgroundColor: openDay.enabled ? "#F5A600" : "#e5e7eb", color: openDay.enabled ? "#1B2E8F" : "#6b7280" }}
                >
                  {openDay.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {openDay.enabled ? (isAr ? "مفعّل" : "ON") : (isAr ? "معطّل" : "OFF")}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: "#1B2E8F" }}>
                <MessageSquare className="w-4 h-4" />
                {isAr ? "نص الترحيب الرئيسي" : "Main Greeting"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "الترحيب (EN)" : "Greeting (EN)"}</label>
                  <Input
                    value={openDay.greetingEn}
                    onChange={e => setOpenDay(d => ({ ...d, greetingEn: e.target.value }))}
                    placeholder="Welcome to Kidspeak Open Day!"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "الترحيب (AR)" : "Greeting (AR)"}</label>
                  <Input
                    dir="rtl"
                    value={openDay.greetingAr}
                    onChange={e => setOpenDay(d => ({ ...d, greetingAr: e.target.value }))}
                    placeholder="مرحباً بكم في اليوم المفتوح لكيدسبيك!"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: "#1B2E8F" }}>
                <Percent className="w-4 h-4" />
                {isAr ? "مدير الخصم" : "Discount Manager"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1.5 w-40">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "نسبة الخصم (%)" : "Discount (%)"}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={openDay.discount}
                      onChange={e => setOpenDay(d => ({ ...d, discount: parseInt(e.target.value) || 0 }))}
                      className="pe-8"
                    />
                    <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">%</span>
                  </div>
                </div>
                <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: "#1B2E8F10", border: "2px dashed #1B2E8F30" }}>
                  <p className="text-xs text-muted-foreground mb-1">{isAr ? "معاينة" : "Preview"}</p>
                  <p className="font-black text-2xl" style={{ color: "#1B2E8F" }}>{openDay.discount}% {isAr ? "خصم" : "OFF"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "وصف الخصم (EN)" : "Discount Description (EN)"}</label>
                  <Input
                    value={openDay.discountDescEn}
                    onChange={e => setOpenDay(d => ({ ...d, discountDescEn: e.target.value }))}
                    placeholder="For registrations made today only!"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "وصف الخصم (AR)" : "Discount Description (AR)"}</label>
                  <Input
                    dir="rtl"
                    value={openDay.discountDescAr}
                    onChange={e => setOpenDay(d => ({ ...d, discountDescAr: e.target.value }))}
                    placeholder="للتسجيلات المقدمة اليوم فقط!"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Button Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: "#1B2E8F" }}>
                <Tag className="w-4 h-4" />
                {isAr ? "نص زر الدعوة للتسجيل" : "Call to Action Button"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "نص الزر (EN)" : "Button Text (EN)"}</label>
                  <Input
                    value={openDay.ctaTextEn}
                    onChange={e => setOpenDay(d => ({ ...d, ctaTextEn: e.target.value }))}
                    placeholder="Claim My Discount Now"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isAr ? "نص الزر (AR)" : "Button Text (AR)"}</label>
                  <Input
                    dir="rtl"
                    value={openDay.ctaTextAr}
                    onChange={e => setOpenDay(d => ({ ...d, ctaTextAr: e.target.value }))}
                    placeholder="احصل على خصمي الآن"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={saveOpenDay}
              disabled={savingOpenDay}
              style={{ backgroundColor: "#1B2E8F", color: "white" }}
              size="lg"
            >
              <Save className="w-4 h-4 me-2" />
              {savingOpenDay ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ إعدادات اليوم المفتوح" : "Save Open Day Settings")}
            </Button>
          </div>

        </TabsContent>
      </Tabs>

      {/* ── Testimonial Edit Dialog ── */}
      <Dialog open={isTestimonialOpen} onOpenChange={setIsTestimonialOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل رأي" : "Edit Testimonial"}</DialogTitle>
          </DialogHeader>
          {editingTestimonial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">{isAr ? "الاسم (EN)" : "Name (EN)"}</label>
                  <Input value={editingTestimonial.name} onChange={e => setEditingTestimonial(t => t ? { ...t, name: e.target.value } : t)} placeholder="Parent Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">{isAr ? "الاسم (AR)" : "Name (AR)"}</label>
                  <Input dir="rtl" value={editingTestimonial.nameAr} onChange={e => setEditingTestimonial(t => t ? { ...t, nameAr: e.target.value } : t)} placeholder="اسم الولي" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{isAr ? "النص (EN)" : "Review Text (EN)"}</label>
                <Textarea value={editingTestimonial.text} onChange={e => setEditingTestimonial(t => t ? { ...t, text: e.target.value } : t)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{isAr ? "النص (AR)" : "Review Text (AR)"}</label>
                <Textarea dir="rtl" value={editingTestimonial.textAr} onChange={e => setEditingTestimonial(t => t ? { ...t, textAr: e.target.value } : t)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{isAr ? "التقييم (من 5)" : "Stars (out of 5)"}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingTestimonial(t => t ? { ...t, stars: s } : t)}
                      className="text-2xl"
                    >
                      <Star className={`w-6 h-6 ${s <= editingTestimonial.stars ? "fill-[#F5A600] text-[#F5A600]" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">{isAr ? "إلغاء" : "Cancel"}</Button></DialogClose>
            <Button onClick={saveTestimonialEdit} style={{ backgroundColor: "#1B2E8F", color: "white" }} disabled={savingTestimonials}>
              {isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Custom Page Create/Edit Dialog ── */}
      <Dialog open={isPageOpen} onOpenChange={setIsPageOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: "#1B2E8F" }}>
              {editingPage ? (isAr ? "تعديل الصفحة" : "Edit Page") : (isAr ? "إنشاء صفحة جديدة" : "Create New Page")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Title + Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isAr ? "العنوان (EN) *" : "Page Title (EN) *"}</label>
                <Input
                  value={pageForm.titleEn}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="About Us"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isAr ? "العنوان (AR)" : "Page Title (AR)"}</label>
                <Input dir="rtl" value={pageForm.titleAr} onChange={e => setPageForm(p => ({ ...p, titleAr: e.target.value }))} placeholder="من نحن" />
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">{isAr ? "رابط الصفحة (Slug) *" : "URL Slug *"}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input
                  value={pageForm.slug}
                  onChange={e => setPageForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                  placeholder="about-us"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr ? "سيظهر الرابط:" : "Full URL:"} <code className="text-[#1B2E8F]">/p/{pageForm.slug || "..."}</code>
              </p>
            </div>

            {/* Status + Nav options */}
            <div className="flex flex-wrap gap-4 items-center p-4 rounded-xl bg-muted/30 border">
              <div className="space-y-1">
                <label className="text-xs font-semibold">{isAr ? "حالة الصفحة" : "Page Status"}</label>
                <div className="flex gap-2">
                  {["draft", "published"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPageForm(p => ({ ...p, status: s }))}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${pageForm.status === s ? "bg-[#1B2E8F] text-white border-[#1B2E8F]" : "bg-white text-muted-foreground border-gray-200"}`}
                    >
                      {s === "draft" ? (isAr ? "مسودة" : "Draft") : (isAr ? "منشور" : "Published")}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageForm.showInNavbar}
                  onChange={e => setPageForm(p => ({ ...p, showInNavbar: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">{isAr ? "إظهار في شريط التنقل" : "Show in Navbar"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageForm.showInFooter}
                  onChange={e => setPageForm(p => ({ ...p, showInFooter: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">{isAr ? "إظهار في التذييل" : "Show in Footer"}</span>
              </label>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">{isAr ? "المحتوى (English)" : "Content (English)"}</label>
              <RichTextEditor
                value={pageForm.contentEn}
                onChange={val => setPageForm(p => ({ ...p, contentEn: val }))}
                dir="ltr"
                placeholder="Write your page content here..."
                minHeight={180}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">{isAr ? "المحتوى (عربي)" : "Content (Arabic)"}</label>
              <RichTextEditor
                value={pageForm.contentAr}
                onChange={val => setPageForm(p => ({ ...p, contentAr: val }))}
                dir="rtl"
                placeholder="اكتب محتوى الصفحة هنا..."
                minHeight={180}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">{isAr ? "إلغاء" : "Cancel"}</Button></DialogClose>
            <Button
              onClick={savePage}
              disabled={savingPage || !pageForm.titleEn || !pageForm.slug}
              style={{ backgroundColor: "#1B2E8F", color: "white" }}
            >
              <Save className="w-3.5 h-3.5 me-1.5" />
              {savingPage ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الصفحة" : "Save Page")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
