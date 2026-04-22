import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";
import { Link } from "wouter";

export default function CampaignLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isRTL, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    parentName: "", parentPhone: "", parentEmail: "",
    childName: "", childAge: "", notes: "",
  });
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    fetch(`/api/public/campaigns/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setCampaign(d))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async () => {
    setAttempted(true);
    if (!form.parentName || !form.parentPhone || !form.childName) {
      toast({ title: isRTL ? "الرجاء تعبئة الحقول المطلوبة" : "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/campaigns/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "form" }),
      });
      if (r.ok) setSubmitted(true);
      else throw new Error();
    } catch {
      toast({ title: isRTL ? "حدث خطأ، حاول مجدداً" : "Error, please try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">{isRTL ? "جارٍ التحميل..." : "Loading..."}</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="text-5xl">🔍</div>
        <h1 className="text-2xl font-black text-slate-700">{isRTL ? "الحملة غير موجودة" : "Campaign Not Found"}</h1>
        <p className="text-slate-400">{isRTL ? "هذه الحملة غير موجودة أو غير نشطة" : "This campaign doesn't exist or is no longer active"}</p>
        <Link href="/"><Button style={{ backgroundColor: "#1B2E8F", color: "white" }}>{isRTL ? "الرئيسية" : "Home"}</Button></Link>
      </div>
    );
  }

  const color    = campaign.landingPageColor ?? "#1B2E8F";
  const title    = campaign.landingPageTitle ?? (isRTL ? campaign.nameAr : campaign.name);
  const subtitle = campaign.landingPageSubtitle ?? "";

  const err = (field: string) => attempted && !form[field as keyof typeof form];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center" style={{ background: `linear-gradient(135deg, ${color}12, white)` }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: `${color}20` }}>✅</div>
        <h1 className="text-2xl font-black" style={{ color }}>{isRTL ? "تم التسجيل بنجاح!" : "Registration Successful!"}</h1>
        <p className="text-slate-500 max-w-sm">{isRTL ? "سنتواصل معك قريباً لتأكيد موعدك." : "We'll contact you soon to confirm your appointment."}</p>
        <img src="/logo-dark.png" alt="Kidspeak" className="h-8 mt-4 opacity-40" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"} style={{ background: `linear-gradient(180deg, ${color}06 0%, white 50%)` }}>
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/logo-dark.png" alt="Kidspeak" className="h-7" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="font-black text-sm" style={{ color: "#1B2E8F" }}>Kidspeak</span>
          </a>
        </Link>
        <button
          onClick={() => setLanguage(isRTL ? "en" : "ar")}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700"
        >
          <Globe className="w-3.5 h-3.5" />
          {isRTL ? "English" : "عربي"}
        </button>
      </nav>

      {/* Hero */}
      <div
        className="px-4 py-14 md:py-20 text-center"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="max-w-xl mx-auto">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
          >
            {isRTL ? campaign.nameAr : campaign.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{title}</h1>
          {subtitle && <p className="text-white/75 text-lg">{subtitle}</p>}
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-xl font-black mb-6" style={{ color }}>
            {isRTL ? "سجّل طفلك الآن" : "Register Your Child Now"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${err("parentName") ? "text-red-500" : "text-slate-600"}`}>
                  {isRTL ? "اسم الولي *" : "Parent Name *"}
                </label>
                <Input
                  value={form.parentName}
                  onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))}
                  className={err("parentName") ? "border-red-400" : ""}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${err("parentPhone") ? "text-red-500" : "text-slate-600"}`}>
                  {isRTL ? "رقم الهاتف *" : "Phone *"}
                </label>
                <Input
                  value={form.parentPhone}
                  onChange={e => setForm(p => ({ ...p, parentPhone: e.target.value }))}
                  dir="ltr"
                  className={err("parentPhone") ? "border-red-400" : ""}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <Input
                value={form.parentEmail}
                onChange={e => setForm(p => ({ ...p, parentEmail: e.target.value }))}
                type="email"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${err("childName") ? "text-red-500" : "text-slate-600"}`}>
                  {isRTL ? "اسم الطفل *" : "Child Name *"}
                </label>
                <Input
                  value={form.childName}
                  onChange={e => setForm(p => ({ ...p, childName: e.target.value }))}
                  className={err("childName") ? "border-red-400" : ""}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">{isRTL ? "العمر" : "Age"}</label>
                <Input
                  value={form.childAge}
                  onChange={e => setForm(p => ({ ...p, childAge: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">{isRTL ? "ملاحظات" : "Notes"}</label>
              <Input
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 text-base font-bold rounded-2xl mt-2"
              style={{ backgroundColor: color, color: "white" }}
            >
              {submitting
                ? (isRTL ? "جارٍ الإرسال..." : "Submitting...")
                : (isRTL ? "سجّل الآن ←" : "Register Now →")}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Kidspeak Academy
      </footer>
    </div>
  );
}
