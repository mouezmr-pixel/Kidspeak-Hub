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

const FEATURES = [
  { labelAr: "جدول حصص طفلك", labelEn: "Child's schedule", subAr: "مواعيد الجلسات والتذكيرات", subEn: "Session times and reminders", color: "#1D9E75", bg: "rgba(29,158,117,0.18)" },
  { labelAr: "تقييمات الأداء", labelEn: "Performance reports", subAr: "متابعة النمو والتطور", subEn: "Growth tracking", color: "#378ADD", bg: "rgba(55,138,221,0.18)" },
  { labelAr: "حالة المدفوعات", labelEn: "Payment status", subAr: "الفواتير والإيصالات", subEn: "Invoices and receipts", color: "#F5A800", bg: "rgba(245,168,0,0.15)" },
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 780,
          minHeight: 540,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "0.5px solid hsl(var(--border))",
          direction: ar ? "rtl" : "ltr",
        }}
      >
        {/* ── RIGHT: Brand panel (dark) ── */}
        <div
          className="flex flex-col justify-between"
          style={{ background: "#0d1520", padding: "2.5rem 2rem" }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                fontSize: 11, color: "#F5A800",
                background: "rgba(245,168,0,0.12)",
                padding: "3px 12px", borderRadius: 20,
                marginBottom: "1.2rem",
              }}
            >
              {ar ? "أكاديمية اللغة" : "Language Academy"}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 500, color: "#fff", lineHeight: 1.4, marginBottom: 6 }}>
              {ar ? <>تابع تقدم طفلك<br /><span style={{ color: "#F5A800" }}>بكل سهولة</span></> : <>Track your child's<br /><span style={{ color: "#F5A800" }}>progress easily</span></>}
            </h2>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: "2rem" }}>
              {ar ? "راقب الحصص، التقييمات، والمدفوعات من مكان واحد" : "Monitor sessions, evaluations, and payments in one place"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {FEATURES.map((f) => (
                <div key={f.labelAr} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{ar ? f.labelAr : f.labelEn}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{ar ? f.subAr : f.subEn}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            kidspeakdz.com · © 2026 KidSpeak
          </div>
        </div>

        {/* ── LEFT: Form panel ── */}
        <div
          className="bg-background flex flex-col items-center justify-center"
          style={{ padding: "2.5rem 2rem" }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2rem" }}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <circle cx="38" cy="58" r="28" fill="#F5A800" />
              <path d="M58 42 Q72 30 80 38" stroke="#F5A800" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M63 32 Q82 16 92 26" stroke="#F5A800" strokeWidth="7" strokeLinecap="round" fill="none" />
            </svg>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              <span style={{ color: "#1a3a7a" }}>kid</span>
              <span style={{ color: "#F5A800" }}>Speak</span>
            </div>
          </div>

          {/* Greeting */}
          <div style={{ fontSize: 20, fontWeight: 500, color: "hsl(var(--foreground))", marginBottom: 4, textAlign: "center" }}>
            {ar ? "مرحباً بك" : "Welcome back"}
          </div>
          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: "1.5rem", textAlign: "center" }}>
            {mode === "parent"
              ? (ar ? "سجّل دخولك لمتابعة تقدم طفلك" : "Sign in to track your child's progress")
              : (ar ? "ادخل ببريدك المهني" : "Sign in with your work email")}
          </div>

          {/* Mode tabs */}
          <div style={{
            display: "flex", gap: 6, width: "100%",
            background: "hsl(var(--muted))", borderRadius: 10, padding: 4,
            marginBottom: "1.5rem",
          }}>
            {(["parent", "staff"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, textAlign: "center", fontSize: 13,
                  padding: "7px", borderRadius: 8, cursor: "pointer",
                  color: mode === m ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  background: mode === m ? "hsl(var(--background))" : "transparent",
                  fontWeight: mode === m ? 500 : 400,
                  border: mode === m ? "0.5px solid hsl(var(--border))" : "0.5px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {m === "parent" ? (ar ? "ولي الأمر" : "Parent") : (ar ? "الفريق" : "Staff")}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: "100%" }}>
            {/* Email/Phone */}
            <div style={{ width: "100%", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 5, textAlign: "right" }}>
                {ar ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or Email"}
              </div>
              <input
                {...form.register("email")}
                type="text"
                placeholder={mode === "parent" ? (ar ? "0551234567" : "name@example.com") : "name@kidspeak.com"}
                autoComplete="username"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: 10, fontSize: 14,
                  color: "hsl(var(--foreground))",
                  background: "hsl(var(--muted) / 0.5)",
                  textAlign: "right", outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {form.formState.errors.email && (
                <p style={{ color: "hsl(var(--destructive))", fontSize: 11, marginTop: 4, textAlign: "right" }}>
                  {ar ? "يرجى إدخال البريد أو رقم الهاتف" : "Please enter your email or phone"}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ width: "100%", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 5, textAlign: "right" }}>
                {ar ? "كلمة المرور" : "Password"}
              </div>
              <input
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "0.5px solid hsl(var(--border))",
                  borderRadius: 10, fontSize: 14,
                  color: "hsl(var(--foreground))",
                  background: "hsl(var(--muted) / 0.5)",
                  outline: "none", fontFamily: "inherit",
                }}
              />
              {form.formState.errors.password && (
                <p style={{ color: "hsl(var(--destructive))", fontSize: 11, marginTop: 4, textAlign: "right" }}>
                  {ar ? "كلمة المرور مطلوبة" : "Password is required"}
                </p>
              )}
            </div>

            {/* Forgot */}
            <div style={{ fontSize: 12, color: "#F5A800", textAlign: "right", marginBottom: "1rem", cursor: "pointer" }}>
              {ar ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%", padding: 11,
                background: "#F5A800", border: "none",
                borderRadius: 10, fontSize: 15,
                fontWeight: 500, color: "#fff",
                cursor: isPending ? "not-allowed" : "pointer",
                marginBottom: "1rem",
                opacity: isPending ? 0.7 : 1,
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
            >
              {isPending ? (ar ? "جارٍ الدخول..." : "Signing in...") : (ar ? "تسجيل الدخول" : "Sign In")}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", width: "100%" }}>
              <div style={{ flex: 1, height: "0.5px", background: "hsl(var(--border))" }} />
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{ar ? "أو" : "or"}</span>
              <div style={{ flex: 1, height: "0.5px", background: "hsl(var(--border))" }} />
            </div>

            {/* Staff/Parent toggle button */}
            <button
              type="button"
              onClick={() => setMode(mode === "parent" ? "staff" : "parent")}
              style={{
                width: "100%", padding: 9,
                border: "0.5px solid hsl(var(--border))",
                borderRadius: 10, fontSize: 13,
                color: "hsl(var(--muted-foreground))",
                background: "transparent", cursor: "pointer",
                textAlign: "center", fontFamily: "inherit",
              }}
            >
              {mode === "parent"
                ? (ar ? "← دخول الفريق — أنت موظف؟" : "Staff login → Are you staff?")
                : (ar ? "← بوابة الأولياء — أنت ولي أمر؟" : "Parent portal → Are you a parent?")}
            </button>
          </form>

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLanguage(ar ? "en" : "ar")}
            style={{
              marginTop: 16, fontSize: 11,
              color: "hsl(var(--muted-foreground))",
              background: "transparent", border: "0.5px solid hsl(var(--border))",
              borderRadius: 6, padding: "3px 10px", cursor: "pointer",
            }}
          >
            {ar ? "EN" : "AR"}
          </button>

          {/* Demo credentials */}
          <div style={{ marginTop: 10, width: "100%", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer" }}
            >
              {showDemo ? (ar ? "▲ إخفاء بيانات التجربة" : "▲ Hide demo") : (ar ? "▼ بيانات التجربة" : "▼ Demo credentials")}
            </button>
            {showDemo && (
              <div
                style={{
                  marginTop: 8, borderRadius: 10, padding: "10px 12px",
                  background: "hsl(var(--muted) / 0.4)",
                  border: "0.5px solid hsl(var(--border))",
                  textAlign: "left",
                }}
              >
                {DEMO_USERS.map(({ role, email }) => (
                  <div key={email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <button
                      type="button"
                      style={{ fontSize: 11, color: "#185FA5", cursor: "pointer", background: "none", border: "none", fontWeight: 500 }}
                      onClick={() => { form.setValue("email", email); form.setValue("password", "admin123"); setShowDemo(false); }}
                    >
                      {email}
                    </button>
                    <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{role}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "0.5px solid hsl(var(--border))", marginTop: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600 }}>admin123</span>
                  <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{ar ? "كلمة المرور" : "Password"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
