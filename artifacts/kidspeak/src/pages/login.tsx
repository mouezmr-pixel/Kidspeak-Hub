import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
});
type LoginFormValues = z.infer<typeof loginSchema>;

type Mode = "parent" | "staff";

function getRoleRedirect(role: string) {
  if (role === "admin") return "/dashboard";
  if (role === "teacher") return "/evaluations";
  if (role === "psychologist") return "/behavioral";
  if (role === "accountant") return "/payments";
  if (role === "receptionist") return "/registration-requests";
  if (["designer", "photographer", "marketer"].includes(role)) return "/studio";
  return "/students";
}

const DEMO_USERS = [
  { role: "Admin", email: "admin@kidspeak.com" },
  { role: "Teacher", email: "sarah@kidspeak.com" },
  { role: "Parent", email: "emma.parent@kidspeak.com" },
  { role: "Psychologist", email: "amina@kidspeak.com" },
  { role: "Accountant", email: "karim@kidspeak.com" },
  { role: "Designer", email: "designer@kidspeak.com" },
  { role: "Marketer", email: "marketer@kidspeak.com" },
  { role: "Photographer", email: "youcef@kidspeak.com" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language, setLanguage, isRTL } = useLanguage();
  const [mode, setMode] = useState<Mode>("parent");
  const [showDemo, setShowDemo] = useState(false);

  const { data: user, isLoading: isCheckingAuth } = useGetMe();
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any) as Resolver<LoginFormValues>,
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user && !isCheckingAuth) {
      setLocation(getRoleRedirect(user.role));
    }
  }, [user, isCheckingAuth]);

  function onSubmit(data: LoginFormValues) {
    login({ data }, {
      onSuccess: (res) => {
        toast({ title: isRTL ? "مرحباً بك!" : "Welcome back!", description: isRTL ? "تم تسجيل الدخول بنجاح." : "Successfully logged in." });
        setLocation(getRoleRedirect(res.user.role));
      },
      onError: () => {
        toast({
          title: isRTL ? "فشل تسجيل الدخول" : "Login failed",
          description: isRTL ? "تحقق من بياناتك وحاول مرة أخرى." : "Please check your credentials and try again.",
          variant: "destructive",
        });
      },
    });
  }

  if (isCheckingAuth || user) return null;

  const ar = language === "ar";

  const subtitle = mode === "parent"
    ? (ar ? "سجّل دخولك لمتابعة تقدم طفلك" : "Sign in to track your child's progress")
    : (ar ? "ادخل ببريدك المهني" : "Sign in with your work email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          border: "0.5px solid hsl(var(--border))",
          minHeight: 560,
          direction: "ltr",
        }}
      >
        {/* ── LEFT: Form panel ── */}
        <div className="bg-background flex flex-col justify-center px-8 py-8">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-7">
            <button
              type="button"
              onClick={() => setLanguage(ar ? "en" : "ar")}
              className="text-xs text-muted-foreground cursor-pointer px-2.5 py-1 rounded-md hover:bg-muted transition-colors"
              style={{ border: "0.5px solid hsl(var(--border))" }}
            >
              {ar ? "EN" : "AR"}
            </button>
            <div className="flex items-center gap-2" style={{ direction: "ltr" }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#0D1B2E" }}>kid</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#F5A800" }}>Speak</span>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                <circle cx="12" cy="18" r="8" fill="#F5A800" />
                <path d="M18 13 Q21 10 24 13" stroke="#F5A800" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M20 10 Q24 6 28 10" stroke="#F5A800" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="mb-5" style={{ textAlign: ar ? "right" : "left" }}>
            <h1 className="font-bold mb-1" style={{ fontSize: 18, color: "hsl(var(--foreground))" }}>
              {ar ? "مرحباً بك 👋" : "Welcome back 👋"}
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: 12 }}>{subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label
                className="block font-medium text-muted-foreground mb-1"
                style={{ fontSize: 11, textAlign: ar ? "right" : "left" }}
              >
                {ar ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or Email"}
              </label>
              <input
                {...form.register("email")}
                placeholder={ar ? "0551234567" : "name@school.com"}
                autoComplete="username"
                className="w-full rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all"
                style={{
                  padding: "9px 12px",
                  border: "0.5px solid hsl(var(--border))",
                  fontSize: 12,
                  direction: ar ? "rtl" : "ltr",
                  borderRadius: 8,
                }}
              />
              {form.formState.errors.email && (
                <p className="text-destructive mt-1" style={{ fontSize: 11 }}>
                  {ar ? "يرجى إدخال البريد أو رقم الهاتف" : "Please enter your email or phone"}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs cursor-pointer" style={{ color: "#F5A800" }}>
                  {ar ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </span>
                <label className="font-medium text-muted-foreground" style={{ fontSize: 11 }}>
                  {ar ? "كلمة المرور" : "Password"}
                </label>
              </div>
              <input
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all"
                style={{
                  padding: "9px 12px",
                  border: "0.5px solid hsl(var(--border))",
                  fontSize: 12,
                  borderRadius: 8,
                }}
              />
              {form.formState.errors.password && (
                <p className="text-destructive mt-1" style={{ fontSize: 11 }}>
                  {ar ? "كلمة المرور مطلوبة" : "Password is required"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full font-bold transition-opacity hover:opacity-90"
              style={{
                background: "#F5A800",
                color: "#fff",
                padding: "10px",
                borderRadius: 9,
                fontSize: 13,
                marginTop: 4,
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              {isPending ? (ar ? "جارٍ الدخول..." : "Signing in...") : (ar ? "تسجيل الدخول" : "Sign In")}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-muted-foreground mt-3" style={{ fontSize: 11 }}>
            {ar ? "لا تملك حساباً؟ " : "No account? "}
            <span className="cursor-pointer font-medium" style={{ color: "#F5A800" }}>
              {ar ? "سجّل طفلك الآن" : "Register your child"}
            </span>
          </p>

          {/* Staff toggle */}
          <div className="mt-4 pt-4 text-center" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
            <span className="text-muted-foreground" style={{ fontSize: 11 }}>
              {mode === "parent"
                ? (ar ? "أنت موظف؟ " : "Are you staff? ")
                : (ar ? "أنت ولي أمر؟ " : "Are you a parent? ")}
            </span>
            <button
              type="button"
              className="font-medium cursor-pointer"
              style={{ fontSize: 11, color: "#185FA5" }}
              onClick={() => setMode(mode === "parent" ? "staff" : "parent")}
            >
              {mode === "parent"
                ? (ar ? "دخول الفريق ←" : "Staff login →")
                : (ar ? "بوابة الأولياء ←" : "Parent portal →")}
            </button>
          </div>

          {/* Demo credentials toggle */}
          <div className="mt-3 text-center">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 10 }}
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? (ar ? "▲ إخفاء بيانات التجربة" : "▲ Hide demo credentials") : (ar ? "▼ بيانات التجربة" : "▼ Demo credentials")}
            </button>
            {showDemo && (
              <div
                className="mt-2 rounded-xl bg-muted/40 text-left"
                style={{ padding: "10px 12px", border: "0.5px solid hsl(var(--border))" }}
              >
                <div className="space-y-1">
                  {DEMO_USERS.map(({ role, email }) => (
                    <div key={email} className="flex justify-between items-center">
                      <button
                        type="button"
                        className="font-medium hover:underline cursor-pointer text-xs"
                        style={{ color: "#185FA5" }}
                        onClick={() => { form.setValue("email", email); form.setValue("password", "admin123"); setShowDemo(false); }}
                      >
                        {email}
                      </button>
                      <span className="text-muted-foreground text-xs">{role}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1" style={{ borderTop: "0.5px solid hsl(var(--border))" }}>
                    <span className="font-mono text-xs font-medium">admin123</span>
                    <span className="text-muted-foreground text-xs">{ar ? "كلمة المرور" : "Password"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Brand panel ── */}
        <div
          className="flex flex-col justify-between"
          style={{ background: "#0D1B2E", padding: "28px 24px" }}
        >
          <div>
            {/* Mode tabs */}
            <div className="flex gap-2 justify-end mb-5">
              {(["parent", "staff"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    padding: "6px 18px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: mode === m ? "0.5px solid #F5A800" : "0.5px solid rgba(255,255,255,0.15)",
                    background: mode === m ? "#F5A800" : "transparent",
                    color: mode === m ? "#fff" : "rgba(255,255,255,0.5)",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "parent" ? (ar ? "ولي الأمر" : "Parent") : (ar ? "الفريق" : "Staff")}
                </button>
              ))}
            </div>

            {/* Parent content */}
            {mode === "parent" && (
              <div style={{ direction: ar ? "rtl" : "ltr" }}>
                <div
                  className="inline-block mb-4"
                  style={{
                    background: "rgba(245,168,0,0.12)",
                    border: "0.5px solid rgba(245,168,0,0.25)",
                    borderRadius: 20,
                    padding: "3px 14px",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#F5A800" }}>{ar ? "بوابة الأولياء" : "Parent Portal"}</span>
                </div>
                <h2 className="font-black leading-snug mb-2" style={{ color: "#fff", fontSize: 20 }}>
                  {ar ? <>تابع تقدم طفلك<br /><span style={{ color: "#F5A800" }}>بكل سهولة</span></> : <>Track your child's<br /><span style={{ color: "#F5A800" }}>progress easily</span></>}
                </h2>
                <p className="mb-5" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.7 }}>
                  {ar ? "راقب الحصص، التقييمات، والمدفوعات من مكان واحد" : "Monitor sessions, evaluations, and payments in one place"}
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: ar ? "جدول حصص طفلك" : "Child's schedule", sub: ar ? "مواعيد الجلسات والتذكيرات" : "Session times and reminders", color: "#5EC4A0" },
                    { label: ar ? "تقييمات الأداء" : "Performance reports", sub: ar ? "متابعة النمو والتطور" : "Growth and development tracking", color: "#7B8FF5" },
                    { label: ar ? "حالة المدفوعات" : "Payment status", sub: ar ? "الفواتير والإيصالات" : "Invoices and receipts", color: "#F5A800" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 justify-end">
                      <div style={{ textAlign: ar ? "right" : "left" }}>
                        <div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.sub}</div>
                      </div>
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{ width: 28, height: 28, borderRadius: 7, background: `${item.color}26` }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff content */}
            {mode === "staff" && (
              <div style={{ direction: ar ? "rtl" : "ltr" }}>
                <div
                  className="inline-block mb-4"
                  style={{
                    background: "rgba(24,95,165,0.2)",
                    border: "0.5px solid rgba(24,95,165,0.4)",
                    borderRadius: 20,
                    padding: "3px 14px",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#7BB8F5" }}>{ar ? "بوابة الفريق" : "Staff Portal"}</span>
                </div>
                <h2 className="font-black leading-snug mb-2" style={{ color: "#fff", fontSize: 20 }}>
                  {ar ? <>لوحة التحكم<br /><span style={{ color: "#7BB8F5" }}>الخاصة بك</span></> : <>Your personal<br /><span style={{ color: "#7BB8F5" }}>dashboard</span></>}
                </h2>
                <p className="mb-5" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.7 }}>
                  {ar ? "ادخل ببريدك المهني وكلمة المرور" : "Sign in with your professional email and password"}
                </p>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, textAlign: ar ? "right" : "left" }}>
                    {ar ? "الأدوار المتاحة" : "Available roles"}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {[
                      { label: "Admin", color: "#F5A800", bg: "rgba(245,168,0,0.15)" },
                      { label: "Teacher", color: "#5EC4A0", bg: "rgba(94,196,160,0.15)" },
                      { label: "Psychologist", color: "#7B8FF5", bg: "rgba(123,143,245,0.15)" },
                      { label: "Receptionist", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.1)" },
                    ].map((r) => (
                      <span
                        key={r.label}
                        style={{
                          fontSize: 10,
                          padding: "3px 10px",
                          borderRadius: 12,
                          background: r.bg,
                          color: r.color,
                        }}
                      >
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center", margin: 0 }}>
            kidspeakdz.com · © 2026 KidSpeak
          </p>
        </div>
      </div>
    </div>
  );
}
