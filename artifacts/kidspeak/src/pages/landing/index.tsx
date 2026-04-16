import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Phone, Mail, MapPin, Instagram, Facebook, Youtube,
  Check, ChevronDown, ArrowRight, Star, Shield, Zap, BookOpen,
  Mic, Eye, MessageCircle, Award, Users, BarChart3, Heart,
  GraduationCap, Brain, TrendingUp, AlertCircle, X, UserPlus,
  FlaskConical, ArrowRightCircle, Headphones, PenLine,
  Video, CalendarCheck, Smartphone, Timer, CheckCircle2, Lock,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(to / 50);
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); } else setVal(start);
        }, 30);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Science methodology comparison chart ──────────────────────────────────────
const scienceData = [
  { month: 1,  tradGrammar: 18, tradSpeaking: 5,  ksSpeaking: 15, ksCommunication: 12 },
  { month: 2,  tradGrammar: 30, tradSpeaking: 6,  ksSpeaking: 28, ksCommunication: 24 },
  { month: 3,  tradGrammar: 42, tradSpeaking: 6,  ksSpeaking: 40, ksCommunication: 37 },
  { month: 4,  tradGrammar: 52, tradSpeaking: 7,  ksSpeaking: 53, ksCommunication: 50 },
  { month: 5,  tradGrammar: 60, tradSpeaking: 7,  ksSpeaking: 63, ksCommunication: 61 },
  { month: 6,  tradGrammar: 68, tradSpeaking: 8,  ksSpeaking: 72, ksCommunication: 70 },
  { month: 7,  tradGrammar: 74, tradSpeaking: 8,  ksSpeaking: 79, ksCommunication: 78 },
  { month: 8,  tradGrammar: 79, tradSpeaking: 8,  ksSpeaking: 84, ksCommunication: 83 },
  { month: 9,  tradGrammar: 82, tradSpeaking: 8,  ksSpeaking: 88, ksCommunication: 87 },
  { month: 10, tradGrammar: 85, tradSpeaking: 9,  ksSpeaking: 91, ksCommunication: 90 },
  { month: 11, tradGrammar: 86, tradSpeaking: 9,  ksSpeaking: 94, ksCommunication: 93 },
  { month: 12, tradGrammar: 87, tradSpeaking: 9,  ksSpeaking: 96, ksCommunication: 95 },
];

function ScienceChart({ isAr }: { isAr: boolean }) {
  const labels = {
    tradGrammar:      isAr ? "التعليم التقليدي — معرفة القواعد" : "Conventional — Grammar Knowledge",
    tradSpeaking:     isAr ? "التعليم التقليدي — الثقة في الكلام" : "Conventional — Speaking Confidence",
    ksSpeaking:       isAr ? "كيدسبيك — الثقة في الكلام" : "Kidspeak — Speaking Confidence",
    ksCommunication:  isAr ? "كيدسبيك — القدرة التواصلية" : "Kidspeak — Communication Ability",
    month:            isAr ? "الشهر" : "Month",
    score:            isAr ? "النتيجة (%)" : "Score (%)",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0a0f2e] border border-white/20 rounded-xl p-4 shadow-xl text-sm">
        <p className="text-white/60 font-semibold mb-2">{labels.month} {label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white/80 text-xs">{entry.name}:</span>
            <span className="font-bold text-white text-xs">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scienceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            tickFormatter={(v) => `${isAr ? "ش" : "M"}${v}`}
            label={{ value: labels.month, position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "16px", fontSize: "11px" }}
            formatter={(value) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{value}</span>}
          />
          {/* Conventional paths */}
          <Line type="monotone" dataKey="tradGrammar"     name={labels.tradGrammar}     stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="6 3" />
          <Line type="monotone" dataKey="tradSpeaking"    name={labels.tradSpeaking}    stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="3 3" />
          {/* Kidspeak paths */}
          <Line type="monotone" dataKey="ksSpeaking"      name={labels.ksSpeaking}      stroke="#F5A600" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="ksCommunication" name={labels.ksCommunication} stroke="#60a5fa" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Level card ─────────────────────────────────────────────────────────────────
interface Level { id: number; name: string; nameAr?: string | null; description?: string | null; descriptionAr?: string | null; price?: number; durationWeeks?: number; sessionsPerWeek?: number; }

// ── Main landing page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { language, setLanguage, isRTL } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const isAr = language === "ar";

  const [settings, setSettings] = useState<any>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [cmsHero, setCmsHero] = useState<any>(null);
  const [cmsTestimonials, setCmsTestimonials] = useState<any[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [cmsOpenDay, setCmsOpenDay] = useState<any>(null);
  const [regSource, setRegSource] = useState<string | null>(null);

  // Enquiry form state
  const [formData, setFormData] = useState({
    parentName: "", parentPhone: "", parentEmail: "",
    childName: "", childAge: "", preferredLevel: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Parent registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: "", email: "", phone: "", whatsappPhone: "", address: "",
  });

  useEffect(() => {
    fetch("/api/public/settings")
      .then(r => r.ok ? r.json() : null)
      .then(s => s && setSettings(s))
      .catch(() => {});
    fetch("/api/public/levels")
      .then(r => r.ok ? r.json() : [])
      .then(setLevels)
      .catch(() => {});
    // Load CMS content
    fetch("/api/public/cms/settings/hero")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && Object.keys(d.data).length > 0) setCmsHero(d.data); })
      .catch(() => {});
    fetch("/api/public/cms/settings/testimonials")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && Array.isArray(d.data) && d.data.length > 0) setCmsTestimonials(d.data); })
      .catch(() => {});
    fetch("/api/public/pages")
      .then(r => r.ok ? r.json() : [])
      .then(data => setCustomPages(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/public/cms/settings/open_day")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data && typeof d.data === "object" && !Array.isArray(d.data)) setCmsOpenDay(d.data); })
      .catch(() => {});
  }, []);

  const t = {
    en: {
      nav: { login: "Login", register: "Register", lang: "عربي" },
      hero: {
        badge: "Speaking-First Methodology",
        h1a: "Stop Studying English.",
        h1b: "Start Speaking It.",
        sub: "Kidspeak is Algeria's first school that teaches children English the natural way — through speaking, confidence, and joy.",
        cta1: "Register Your Child",
        cta2: "Login",
        scroll: "Discover the Method",
      },
      stats: { students: "Students Enrolled", sessions: "Sessions Completed", confidence: "Confidence Rate", levels: "Program Levels" },
      problem: {
        badge: "The Problem",
        title: "Most kids know English but are too afraid to speak.",
        sub: "Traditional schools teach grammar and vocabulary — but forget the most important skill: actually opening your mouth.",
        cards: [
          { icon: "😰", title: "Fear of mistakes", desc: "Kids study for years and still freeze when asked to speak." },
          { icon: "📚", title: "Grammar overload", desc: "Too much theory, not enough practice." },
          { icon: "🎯", title: "No real-world application", desc: "What's the point of knowing English if you can't use it?" },
        ],
      },
      method: {
        badge: "The Kidspeak Method",
        title: "Speaking-First. Always.",
        sub: "We follow the same path every human uses to learn their mother tongue.",
        steps: [
          { num: "01", icon: Mic, label: "Hear", desc: "Immersive listening to authentic English content.", ar: "اسمع" },
          { num: "02", icon: Eye, label: "Imitate", desc: "Confident repetition without fear of judgment.", ar: "قلّد" },
          { num: "03", icon: MessageCircle, label: "Speak", desc: "Real conversations in a safe, encouraging space.", ar: "تحدث" },
          { num: "04", icon: BookOpen, label: "Read & Write", desc: "Literacy builds naturally on a speaking foundation.", ar: "اقرأ واكتب" },
        ],
      },
      usp: {
        badge: "Why Kidspeak?",
        title: "A system built for transformation.",
        cards: [
          {
            icon: Shield,
            color: "#7c3aed",
            title: "Confidence Compass",
            desc: "Our psychologist Dr. Amina tracks each child's confidence weekly, breaking the fear barrier systematically.",
          },
          {
            icon: Zap,
            color: "#F5A600",
            title: "The Talk Show",
            desc: "Every child becomes a star. Kids perform in real talk-show style productions to build public speaking confidence.",
          },
          {
            icon: BarChart3,
            color: "#0891b2",
            title: "Visual Learning Journey",
            desc: "Parents see a real-time roadmap of their child's progress — from first word to fluent speaker.",
          },
          {
            icon: Users,
            color: "#059669",
            title: "Bilingual Parent Hub",
            desc: "24/7 access to progress reports, session notes, evaluations and direct messaging with teachers.",
          },
        ],
      },
      programs: {
        badge: "The Program",
        title: "4 Levels to Fluency",
        sub: "Each level is designed as an 8-week journey of transformation.",
        weeks: "weeks",
        sessions: "sessions/week",
        perMonth: "DZD / session",
        enrollBtn: "Enroll in This Level",
        defaultDesc: ["Foundation — Listening & Basic Sounds", "Discovery — Core Vocabulary & Phrases", "Expression — Real Conversations", "Mastery — Fluency & Public Speaking"],
      },
      transparency: {
        badge: "Kidspeak Transparency Window",
        title: "Your Child's World on Your Phone",
        sub: "Every parent deserves total visibility — not just a grade at the end of the term.",
        phone: {
          headline: "The Parent Dashboard",
          items: [
            { icon: "eye", label: "Psychological Eyes", desc: "See the behavioral notes Dr. Amina writes after every session." },
            { icon: "video", label: "The Talk Show Archive", desc: "Watch every video of your child speaking English from Day 1 to graduation." },
            { icon: "calendar", label: "Real-Time Attendance", desc: "Track attendance and progress with total transparency." },
          ],
        },
        guarantees: {
          badge: "Kidspeak Triple Guarantee",
          title: "We Don't Just Teach. We Promise.",
          items: [
            { icon: "shield", tag: "NO SHYNESS", title: "Fear-Free in 4 Sessions", desc: "Within 4 sessions, your child will break the fear barrier. If not, we provide additional 1-on-1 support at no extra cost." },
            { icon: "mic", tag: "NATURAL FLUENCY", title: "Real Expression, Not Robots", desc: "No robotic memorization. Your child will use English to express their real feelings and ideas — the way humans were meant to." },
            { icon: "brain", tag: "BEYOND ENGLISH", title: "A Sharper Mind Overall", desc: "Better focus in other school subjects and stronger social leadership skills that last a lifetime." },
          ],
        },
        rule: {
          badge: "The 15-Minute Rule",
          title: "The Kidspeak 15-Minute Magic",
          desc: "In every session, your child is guaranteed at least 15 minutes of active, high-quality individual speaking time.",
          compare: "Compare this to the 30 seconds they get in traditional schools!",
          us: "15 min",
          them: "30 sec",
          usLabel: "Kidspeak — Per Child",
          themLabel: "Traditional School — Per Child",
        },
      },
      testimonials: {
        badge: "Parent Reviews",
        title: "What our parents say",
        items: [
          { name: "Nour's Mother", text: "After just 3 months at Kidspeak, my daughter speaks English without hesitation. The confidence transformation is unbelievable.", stars: 5 },
          { name: "Yacine's Father", text: "I love the parent portal. I can see exactly what my son is working on and watch his progress every week.", stars: 5 },
          { name: "Amira's Mother", text: "The psychologist's involvement is what makes Kidspeak different. My shy daughter is now a star in class!", stars: 5 },
        ],
      },
      enroll: {
        badge: "Get Started",
        title: "Register Your Child Today",
        sub: "Fill in the form below and our team will contact you within 24 hours to arrange a free assessment session.",
        labels: {
          parentName: "Parent Name *", parentPhone: "Phone Number *", parentEmail: "Email Address",
          childName: "Child's Name *", childAge: "Child's Age", preferredLevel: "Preferred Level",
          notes: "Additional Notes", submit: "Send Registration",
        },
        ageOptions: ["5–6 years", "7–8 years", "9–10 years", "11–12 years", "13+ years"],
        success: "Your request has been received! We'll contact you within 24 hours.",
      },
      footer: { rights: "All rights reserved.", contact: "Contact Us" },
      reg: {
        title: "Join Kidspeak as a Parent",
        subtitle: "Submit your details and our team will review your request and send you login credentials within 24 hours.",
        fullName: "Full Name *",
        email: "Email Address *",
        phone: "Primary Phone Number *",
        whatsappPhone: "WhatsApp Number",
        address: "Home Address",
        submit: "Send Registration Request",
        successTitle: "Request Submitted! 🎉",
        successMsg: "Thank you! Your request has been sent to the administration. We will contact you shortly with your login credentials.",
        successBtn: "Close",
        placeholders: {
          fullName: "e.g. Ahmed Benali",
          email: "your@email.com",
          phone: "0555 123 456",
          whatsappPhone: "0555 123 456 (if different)",
          address: "Neighbourhood, City",
        },
      },
    },
    ar: {
      nav: { login: "دخول", register: "تسجيل", lang: "English" },
      hero: {
        badge: "منهج التحدث أولاً",
        h1a: "توقف عن دراسة الإنجليزية..",
        h1b: "ابدأ بالتحدث بها.",
        sub: "كيدسبيك أول مدرسة في الجزائر تُعلّم الأطفال الإنجليزية بالطريقة الطبيعية — عبر التحدث والثقة والمتعة.",
        cta1: "سجّل طفلك",
        cta2: "دخول",
        scroll: "اكتشف المنهج",
      },
      stats: { students: "تلميذ مسجّل", sessions: "حصة مكتملة", confidence: "معدل الثقة", levels: "مستويات البرنامج" },
      problem: {
        badge: "المشكلة",
        title: "معظم الأطفال يعرفون الإنجليزية لكنهم يخافون من التحدث.",
        sub: "المدارس التقليدية تُعلّم القواعد والمفردات — لكنها تنسى المهارة الأهم: فتح الفم والتحدث.",
        cards: [
          { icon: "😰", title: "الخوف من الأخطاء", desc: "الأطفال يدرسون سنوات وما يزالون يجمدون حين يُطلب منهم التحدث." },
          { icon: "📚", title: "اكتظاظ القواعد", desc: "نظرية كثيرة وتطبيق قليل." },
          { icon: "🎯", title: "لا تطبيق في الواقع", desc: "ما فائدة معرفة الإنجليزية إن لم تستطع استخدامها؟" },
        ],
      },
      method: {
        badge: "منهج كيدسبيك",
        title: "التحدث أولاً. دائماً.",
        sub: "نتبع نفس المسار الذي يسلكه كل إنسان في تعلم لغته الأم.",
        steps: [
          { num: "01", icon: Mic, label: "Hear", desc: "استماع غامر لمحتوى إنجليزي أصيل.", ar: "اسمع" },
          { num: "02", icon: Eye, label: "Imitate", desc: "تكرار واثق بدون خوف من الحكم.", ar: "قلّد" },
          { num: "03", icon: MessageCircle, label: "Speak", desc: "محادثات حقيقية في فضاء آمن ومُشجّع.", ar: "تحدث" },
          { num: "04", icon: BookOpen, label: "Read & Write", desc: "القراءة والكتابة تنمو طبيعياً على أساس التحدث.", ar: "اقرأ واكتب" },
        ],
      },
      usp: {
        badge: "لماذا كيدسبيك؟",
        title: "منظومة مصمّمة للتحول.",
        cards: [
          {
            icon: Shield, color: "#7c3aed",
            title: "بوصلة الثقة",
            desc: "تتابع أخصائيتنا النفسية د. أمينة مستوى ثقة كل طفل أسبوعياً وتكسر حاجز الخوف بشكل منهجي.",
          },
          {
            icon: Zap, color: "#F5A600",
            title: "برنامج التوك شو",
            desc: "كل طفل نجم. يؤدي الأطفال عروضاً بأسلوب برامج التوك شو لبناء ثقتهم في التحدث أمام الجمهور.",
          },
          {
            icon: BarChart3, color: "#0891b2",
            title: "خريطة التقدم المرئية",
            desc: "يرى الوالدان خريطة طريق حية لتقدم طفلهما — من الكلمة الأولى حتى الطلاقة.",
          },
          {
            icon: Users, color: "#059669",
            title: "مركز الوالدين ثنائي اللغة",
            desc: "وصول على مدار الساعة لتقارير التقدم وملاحظات الحصص والتقييمات والتواصل المباشر مع المعلمين.",
          },
        ],
      },
      programs: {
        badge: "البرنامج",
        title: "٤ مستويات نحو الطلاقة",
        sub: "كل مستوى هو رحلة تحول من ٨ أسابيع.",
        weeks: "أسابيع",
        sessions: "حصة/أسبوع",
        perMonth: "د.ج / حصة",
        enrollBtn: "الالتحاق بهذا المستوى",
        defaultDesc: ["الأساس — الاستماع والأصوات الأولى", "الاستكشاف — المفردات والعبارات الأساسية", "التعبير — محادثات حقيقية", "الإتقان — الطلاقة والتحدث أمام الجمهور"],
      },
      transparency: {
        badge: "نافذة الشفافية المطلقة",
        title: "عالم طفلك في هاتفك",
        sub: "كل ولي أمر يستحق رؤية كاملة — لا مجرد نقطة في نهاية الفصل.",
        phone: {
          headline: "لوحة تحكم ولي الأمر",
          items: [
            { icon: "eye", label: "عين الأخصائية", desc: "شاهد الملاحظات السلوكية التي تكتبها الدكتورة أمينة بعد كل حصة." },
            { icon: "video", label: "أرشيف النجوم", desc: "شاهد كل فيديوهات طفلك وهو يتحدث الإنجليزية من اليوم الأول وحتى التخرج." },
            { icon: "calendar", label: "خريطة الانضباط", desc: "تابع الحضور والتقدم بكل شفافية وفي الوقت الفعلي." },
          ],
        },
        guarantees: {
          badge: "وعود كيدسبيك الثلاثة",
          title: "لا نُعلِّم فحسب — نعد.",
          items: [
            { icon: "shield", tag: "لا خجل بعد اليوم", title: "تجاوز حاجز الخوف في ٤ حصص", desc: "خلال ٤ حصص، سيكسر طفلك حاجز الخوف. وإن لم يحدث، نقدم دعمًا فرديًا إضافيًا مجانًا." },
            { icon: "mic", tag: "طلاقة طبيعية", title: "تعبير حقيقي، لا حفظ آلي", desc: "لا حفظ آلي. سيستخدم طفلك الإنجليزية للتعبير عن مشاعره وأفكاره الحقيقية — كما يفعل المتحدثون الأصليون." },
            { icon: "brain", tag: "أكثر من لغة", title: "عقل أحدّ في كل المواد", desc: "تحسّن في التركيز في بقية المواد الدراسية ومهارات القيادة الاجتماعية التي تدوم مدى الحياة." },
          ],
        },
        rule: {
          badge: "قاعدة الـ ١٥ دقيقة",
          title: "سحر الـ ١٥ دقيقة في كيدسبيك",
          desc: "في كل حصة، نضمن لطفلك ١٥ دقيقة على الأقل من التحدث الفردي النشط عالي الجودة.",
          compare: "قارن هذا بـ ٣٠ ثانية فقط يحصل عليها في المدارس التقليدية!",
          us: "١٥ د",
          them: "٣٠ ث",
          usLabel: "كيدسبيك — لكل طفل",
          themLabel: "المدرسة التقليدية — لكل طفل",
        },
      },
      testimonials: {
        badge: "آراء الآباء",
        title: "ماذا يقول أولياء الأمور",
        items: [
          { name: "والدة نور", text: "بعد ثلاثة أشهر فقط في كيدسبيك، ابنتي تتحدث الإنجليزية بلا تردد. التحول في الثقة لا يصدَّق.", stars: 5 },
          { name: "والد ياسين", text: "أحب بوابة الوالدين. أرى بالضبط ما يتعلمه ابني وأتابع تقدمه كل أسبوع.", stars: 5 },
          { name: "والدة أميرة", text: "مشاركة الأخصائية النفسية هي ما يجعل كيدسبيك مختلفة. ابنتي الخجولة أصبحت نجمة الفصل!", stars: 5 },
        ],
      },
      enroll: {
        badge: "ابدأ الآن",
        title: "سجّل طفلك اليوم",
        sub: "أملأ النموذج أدناه وسيتواصل معك فريقنا خلال ٢٤ ساعة لتحديد موعد جلسة تقييم مجانية.",
        labels: {
          parentName: "اسم ولي الأمر *", parentPhone: "رقم الهاتف *", parentEmail: "البريد الإلكتروني",
          childName: "اسم الطفل *", childAge: "عمر الطفل", preferredLevel: "المستوى المفضّل",
          notes: "ملاحظات إضافية", submit: "إرسال الطلب",
        },
        ageOptions: ["٥–٦ سنوات", "٧–٨ سنوات", "٩–١٠ سنوات", "١١–١٢ سنة", "١٣ سنة فأكثر"],
        success: "تم استلام طلبك! سنتواصل معك خلال ٢٤ ساعة.",
      },
      footer: { rights: "جميع الحقوق محفوظة.", contact: "اتصل بنا" },
      reg: {
        title: "انضم إلى كيدسبيك كوليّ أمر",
        subtitle: "أرسل بياناتك وسيراجع فريقنا طلبك ويرسل لك بيانات الدخول خلال ٢٤ ساعة.",
        fullName: "الاسم الكامل *",
        email: "البريد الإلكتروني *",
        phone: "رقم الهاتف الأساسي *",
        whatsappPhone: "رقم واتساب",
        address: "العنوان",
        submit: "إرسال طلب الانضمام",
        successTitle: "تم إرسال الطلب! 🎉",
        successMsg: "شكراً لك! لقد أُرسل طلبك إلى الإدارة. سنتواصل معك قريباً ونمنحك بيانات الدخول.",
        successBtn: "إغلاق",
        placeholders: {
          fullName: "مثال: أحمد بن علي",
          email: "بريدك@مثال.com",
          phone: "0555 123 456",
          whatsappPhone: "0555 123 456 (إن اختلف)",
          address: "الحي، المدينة",
        },
      },
    },
  };

  const txt = isAr ? t.ar : t.en;

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.email || !regForm.phone) return;
    setRegSubmitting(true);
    try {
      const res = await fetch("/api/public/registration-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regForm, ...(regSource ? { source: regSource } : {}) }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegSubmitted(true);
      } else if (res.status === 409) {
        toast({ title: isAr ? "يوجد طلب بهذا البريد الإلكتروني مسبقاً." : "A request with this email already exists.", variant: "destructive" });
      } else {
        toast({ title: data.error || (isAr ? "حدث خطأ. حاول مجدداً." : "Error. Please try again."), variant: "destructive" });
      }
    } catch {
      toast({ title: isAr ? "خطأ في الشبكة. حاول مجدداً." : "Network error. Please try again.", variant: "destructive" });
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName || !formData.parentPhone || !formData.childName) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ parentName: "", parentPhone: "", parentEmail: "", childName: "", childAge: "", preferredLevel: "", notes: "" });
        toast({ title: txt.enroll.success });
      } else {
        toast({ title: "Error submitting. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ══════ NAV ══════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#1B2E8F]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            {settings?.logoWhiteUrl ? (
              <img src={`/api/storage/public-objects/${settings.logoWhiteUrl}`} alt="Kidspeak" className="h-9 object-contain" />
            ) : (
              <span className="text-white font-black text-xl tracking-tight">
                kid<span style={{ color: "#F5A600" }}>speak</span>
              </span>
            )}
          </a>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(isAr ? "en" : "ar")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{txt.nav.lang}</span>
            </button>
            {/* Login */}
            <button
              onClick={() => setLocation("/login")}
              className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {txt.nav.login}
            </button>
            {/* Register */}
            <button
              onClick={() => { setRegSource(null); setShowRegModal(true); setRegSubmitted(false); setRegForm({ fullName: "", email: "", phone: "", whatsappPhone: "", address: "" }); }}
              className="text-[#1B2E8F] font-semibold text-sm px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: "#F5A600" }}
            >
              {txt.nav.register}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════ OPEN DAY BANNER ══════════════════════════════════════════════════ */}
      {cmsOpenDay?.enabled && (
        <section id="open-day" className="relative overflow-hidden pt-16" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #1B2E8F 60%, #2d1870 100%)" }}>
          {/* Festive background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #F5A600, transparent)", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 start-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", transform: "translate(-20%, 30%)" }} />
            {/* Confetti dots */}
            {[
              { top: "15%", left: "8%", bg: "#F5A600", size: 8 },
              { top: "25%", left: "90%", bg: "#F5A600", size: 6 },
              { top: "60%", left: "5%", bg: "#7c3aed", size: 10 },
              { top: "70%", left: "85%", bg: "#ffffff", size: 5 },
              { top: "40%", left: "92%", bg: "#F5A600", size: 7 },
              { top: "80%", left: "12%", bg: "#ffffff", size: 4 },
            ].map((dot, i) => (
              <div key={i} className="absolute rounded-full opacity-60" style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size, backgroundColor: dot.bg }} />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="text-center mb-10">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-6 animate-pulse" style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}>
                <span className="w-2 h-2 rounded-full bg-[#1B2E8F] inline-block" />
                {isAr ? "🎉 اليوم المفتوح — الآن!" : "🎉 OPEN DAY — TODAY!"}
              </div>

              {/* Main greeting */}
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                {isAr ? (cmsOpenDay.greetingAr || "مرحباً بكم في اليوم المفتوح لكيدسبيك!") : (cmsOpenDay.greetingEn || "Welcome to Kidspeak Open Day!")}
              </h1>

              {/* Strategic message */}
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                {isAr
                  ? "نحن اليوم لا نريك مدرسة، بل نريك مستقبل طفلك الواثق."
                  : "Today, we don't just show you a school; we show you your child's future confidence."}
              </p>
            </div>

            {/* Offer card + gallery row */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">

              {/* ── Offer / Discount Card ── */}
              <div className="flex-1 rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, #F5A600 0%, #e09300 100%)", boxShadow: "0 20px 60px rgba(245,166,0,0.4)" }}>
                <p className="text-[#1B2E8F] text-xs font-black uppercase tracking-widest mb-3">
                  {isAr ? "عرض اليوم المفتوح الحصري" : "OPEN DAY EXCLUSIVE"}
                </p>
                <div className="text-[#1B2E8F] font-black mb-2" style={{ fontSize: "clamp(3rem, 10vw, 5rem)", lineHeight: 1 }}>
                  {cmsOpenDay.discount ?? 20}%
                </div>
                <p className="text-[#1B2E8F] font-black text-xl mb-1">{isAr ? "خصم" : "OFF"}</p>
                <p className="text-[#1B2E8F]/80 text-sm font-semibold mb-6">
                  {isAr ? (cmsOpenDay.discountDescAr || "للتسجيلات المقدمة اليوم فقط!") : (cmsOpenDay.discountDescEn || "For registrations made today only!")}
                </p>
                <button
                  onClick={() => { setRegSource("open_day"); setShowRegModal(true); setRegSubmitted(false); setRegForm({ fullName: "", email: "", phone: "", whatsappPhone: "", address: "" }); }}
                  className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "#1B2E8F", color: "white", boxShadow: "0 8px 20px rgba(27,46,143,0.4)" }}
                >
                  {isAr ? (cmsOpenDay.ctaTextAr || "احصل على خصمي الآن") : (cmsOpenDay.ctaTextEn || "Claim My Discount Now")} →
                </button>
              </div>

              {/* ── Video / Gallery Placeholder ── */}
              <div className="flex-1 rounded-3xl overflow-hidden border-2 border-white/20 flex flex-col">
                <div className="relative flex-1 min-h-[240px] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="text-center p-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30" style={{ backgroundColor: "rgba(245,166,0,0.2)" }}>
                      <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10 opacity-90">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-bold text-lg mb-1">{isAr ? "شاهد كيف نعمل" : "See Kidspeak in Action"}</p>
                    <p className="text-white/60 text-sm">{isAr ? "فيديو عرض اليوم المفتوح" : "Open Day Activity Highlights"}</p>
                  </div>
                  {/* Image gallery dots */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="rounded-full transition-all" style={{ width: i === 0 ? 20 : 8, height: 8, backgroundColor: i === 0 ? "#F5A600" : "rgba(255,255,255,0.3)" }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0.5" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {[
                    { emoji: "🎤", label: isAr ? "حصص تجريبية" : "Sample Sessions" },
                    { emoji: "👨‍👩‍👧", label: isAr ? "لقاء الأهل" : "Parent Meetup" },
                    { emoji: "🏆", label: isAr ? "عروض الطلاب" : "Student Shows" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 text-center border-t border-white/10">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <p className="text-white/70 text-[10px] font-semibold leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom scroll hint */}
            <div className="text-center mt-10">
              <p className="text-white/40 text-xs">
                {isAr ? "↓ اكتشف المزيد عن كيدسبيك أدناه" : "↓ Discover more about Kidspeak below"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ══════ HERO ═════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1c5c 0%, #1B2E8F 50%, #1a3a9c 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -end-40 w-[600px] h-[600px] bg-[#F5A600]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -start-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
            style={{ background: "radial-gradient(circle, rgba(245,166,0,0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
          >
            <Zap className="w-4 h-4" />
            {isAr ? (cmsHero?.badgeAr || txt.hero.badge) : (cmsHero?.badgeEn || txt.hero.badge)}
          </div>

          {/* Headline — CMS-powered with fallback */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            {cmsHero ? (
              <span className="block">
                {isAr ? (cmsHero.h1Ar || txt.hero.h1a + " " + txt.hero.h1b) : (cmsHero.h1En || txt.hero.h1a + " " + txt.hero.h1b)}
              </span>
            ) : (
              <>
                <span className="block opacity-80">{txt.hero.h1a}</span>
                <span className="block" style={{ color: "#F5A600" }}>{txt.hero.h1b}</span>
              </>
            )}
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {isAr ? (cmsHero?.subtitleAr || txt.hero.sub) : (cmsHero?.subtitleEn || txt.hero.sub)}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => { setRegSource(null); setShowRegModal(true); setRegSubmitted(false); setRegForm({ fullName: "", email: "", phone: "", whatsappPhone: "", address: "" }); }}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-2xl"
              style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
            >
              {txt.hero.cta1}
              <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setLocation("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
            >
              {txt.hero.cta2}
            </button>
          </div>

          {/* Scroll down */}
          <button
            onClick={() => scrollTo("problem")}
            className="mt-16 flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors mx-auto"
          >
            <span className="text-sm">{txt.hero.scroll}</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: 120, suffix: "+", label: txt.stats.students },
              { num: 2400, suffix: "+", label: txt.stats.sessions },
              { num: 94, suffix: "%", label: txt.stats.confidence },
              { num: 4, suffix: "", label: txt.stats.levels },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-black" style={{ color: "#F5A600" }}>
                  <Counter to={s.num} suffix={s.suffix} />
                </div>
                <p className="text-white/60 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PROBLEM ══════════════════════════════════════════════════════════ */}
      <section id="problem" className="py-24 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-red-500/20 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {txt.problem.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 max-w-3xl mx-auto leading-tight">
              {txt.problem.title}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">{txt.problem.sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {txt.problem.cards.map((c, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-white">{c.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ REALITY OF TRADITIONAL LEARNING ═══════════════════════════════ */}
      <section id="reality" className="py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #1B2E8F 60%, #0a0f2e 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <AlertCircle className="w-4 h-4" />
              {isAr ? "واقع التعليم التقليدي" : "The Reality of Traditional Learning"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-4xl mx-auto mb-6">
              {isAr
                ? "يدرسون الإنجليزية لسنوات... ولا يستطيعون التحدث بجملة واحدة."
                : "They study English for years... and still can't say a single sentence with confidence."
              }
            </h2>
          </div>

          {/* Big quote */}
          <div className="max-w-4xl mx-auto mb-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-4 -start-4 text-[120px] opacity-5 font-serif leading-none select-none">"</div>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed relative z-10">
              {isAr
                ? "الأطفال يقضون مئات الساعات في الدراسة ويحصلون على درجات عالية في المدرسة... ومع ذلك لا يستطيعون قول جملة واحدة بثقة."
                : "Children spend hundreds of hours studying, earn top grades in school — yet they cannot hold a simple conversation in English."
              }
            </p>
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl" style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}>
              <span className="text-2xl font-black">💬</span>
              <p className="font-black text-base">
                {isAr ? "الدرجات ليست اللغة. التحدث هو اللغة." : "Grades are not the language. Speaking is the language."}
              </p>
            </div>
          </div>

          {/* Comparison: Academic Success vs Real-World Communication */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Academic "Success" — red/warning */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-white">{isAr ? "النجاح الأكاديمي" : "Academic \"Success\""}</p>
                  <p className="text-xs text-red-300">{isAr ? "ما تعلّمه المدارس التقليدية" : "What traditional schools measure"}</p>
                </div>
              </div>
              <div className="space-y-3">
                {(isAr ? [
                  "نتائج إملاء ممتازة ✓",
                  "قواعد نحوية محفوظة ✓",
                  "ترجمة من وإلى العربية ✓",
                  "درجات مرتفعة في الاختبارات ✓",
                ] : [
                  "Perfect spelling test scores ✓",
                  "Grammar rules memorized ✓",
                  "Translation exercises ✓",
                  "High marks on written exams ✓",
                ]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                  <p className="text-red-300 text-xs font-semibold">
                    {isAr ? "❌ النتيجة: طفل يعرف الإنجليزية لكنه يخاف من التحدث بها" : "❌ Result: A child who \"knows\" English but is too afraid to speak it"}
                  </p>
                </div>
              </div>
            </div>

            {/* Real-World Communication — green/positive */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white">{isAr ? "التواصل الحقيقي" : "Real-World Communication"}</p>
                  <p className="text-xs text-emerald-300">{isAr ? "ما يعلّمه كيدسبيك" : "What Kidspeak builds"}</p>
                </div>
              </div>
              <div className="space-y-3">
                {(isAr ? [
                  "إجراء محادثات حقيقية بثقة",
                  "طرح الأسئلة والإجابة عليها",
                  "التعبير عن الأفكار بحرية",
                  "الأداء أمام الجمهور دون خوف",
                ] : [
                  "Hold real conversations with confidence",
                  "Ask and answer questions naturally",
                  "Express ideas and emotions freely",
                  "Perform in front of an audience fearlessly",
                ]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                  <p className="text-emerald-300 text-xs font-semibold">
                    {isAr ? "✅ النتيجة: طفل يتحدث الإنجليزية بثقة وفرح" : "✅ Result: A child who speaks English with joy and confidence"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={() => scrollTo("method")}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              {isAr ? "اكتشف الطريقة الكيدسبيك" : "Discover the Kidspeak way"}
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════ SCIENCE BEHIND KIDSPEAK ═══════════════════════════════════════ */}
      <section id="science" className="py-24 bg-[#0a0f2e] text-white relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "linear-gradient(#1B2E8F 1px, transparent 1px), linear-gradient(90deg, #1B2E8F 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ backgroundColor: "#F5A60020", color: "#F5A600", border: "1px solid #F5A60040" }}>
              <FlaskConical className="w-4 h-4" />
              {isAr ? "مدعوم بالعلم" : "Evidence-Based"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {isAr ? "العلم خلف" : "The Science Behind"}
              {" "}
              <span style={{ color: "#F5A600" }}>Kidspeak</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {isAr
                ? "ليس مجرد طريقة — بل هو نهج مثبت علمياً ونفسياً يغير كيف يكتسب الأطفال اللغة للأبد."
                : "Not just a method — a scientifically and psychologically proven approach that permanently changes how children acquire language."}
            </p>
          </div>

          {/* ── 1. Methodology Comparison Chart ─────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {isAr ? "مقارنة مسارات التعلم على مدى 12 شهراً" : "Learning Path Comparison Over 12 Months"}
                </h3>
                <p className="text-white/50 text-sm">
                  {isAr ? "مستوى الثقة في الكلام والقدرة التواصلية" : "Speaking confidence & communication ability progression"}
                </p>
              </div>
              {/* Key stats pills */}
              <div className="flex gap-3 flex-wrap">
                <div className="px-4 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: "#F5A60020", color: "#F5A600", border: "1px solid #F5A60040" }}>
                  {isAr ? "وقت الكلام في كيدسبيك: 80%" : "Speaking time at Kidspeak: 80%"}
                </div>
                <div className="px-4 py-2 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  {isAr ? "وقت الكلام في المدارس: 5%" : "Speaking time in schools: 5%"}
                </div>
              </div>
            </div>
            <ScienceChart isAr={isAr} />
            {/* Legend explanation */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-2xl p-4">
                <div className="w-3 h-3 rounded-full bg-red-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-300 mb-1">{isAr ? "التعليم التقليدي" : "Conventional Learning"}</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {isAr
                      ? "معرفة قواعدية عالية — لكن الثقة في الكلام تبقى منخفضة جداً طوال العام."
                      : "High grammar knowledge — but speaking confidence stays very low throughout the year."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#F5A600]/5 border border-[#F5A600]/20 rounded-2xl p-4">
                <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: "#F5A600" }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#F5A600" }}>{isAr ? "منهج كيدسبيك" : "Kidspeak Method"}</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {isAr
                      ? "منحنى صاعد حاد في الثقة والتواصل — الطفل يتكلم من الأسبوع الأول."
                      : "Steep upward curve in confidence & communication — child speaks from week one."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2 & 3: Two columns — Acquisition Order + Confidence Factor ──── */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Brain & Language Infographic */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#7c3aed20" }}>
                  <Brain className="w-5 h-5" style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? "الجانب العصبي" : "The Brain & Language Path"}
                  </h3>
                  <p className="text-xs text-white/40">{isAr ? "ترتيب الاكتساب الطبيعي" : "Natural acquisition order"}</p>
                </div>
              </div>

              {/* Wrong way */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
                  {isAr ? "الطريقة الخاطئة — المدارس التقليدية" : "The Wrong Way — Traditional Schools"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { icon: <PenLine className="w-4 h-4" />, label: isAr ? "اقرأ / اكتب" : "Read / Write" },
                    { icon: <Headphones className="w-4 h-4" />, label: isAr ? "استمع" : "Listen" },
                    { icon: <Mic className="w-4 h-4" />, label: isAr ? "تكلم" : "Speak" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-300 text-sm font-medium">
                        {step.icon}
                        {step.label}
                      </div>
                      {i < 2 && <ArrowRightCircle className={`w-4 h-4 text-red-500/50 shrink-0 ${isAr ? "rotate-180" : ""}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right way */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F5A600" }}>
                  {isAr ? "الطريقة الصحيحة — منهج كيدسبيك" : "The Right Way — Kidspeak Method"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { icon: <Headphones className="w-4 h-4" />, label: isAr ? "استمع" : "Listen", highlight: false },
                    { icon: <Mic className="w-4 h-4" />, label: isAr ? "تكلم ← المحور" : "SPEAK ← Core", highlight: true },
                    { icon: <PenLine className="w-4 h-4" />, label: isAr ? "اقرأ / اكتب" : "Read / Write", highlight: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border ${
                        step.highlight
                          ? "text-[#1B2E8F] font-black text-sm"
                          : "bg-white/5 border-white/10 text-white/70"
                      }`}
                        style={step.highlight ? { backgroundColor: "#F5A600", borderColor: "#F5A600" } : {}}
                      >
                        {step.icon}
                        {step.label}
                      </div>
                      {i < 2 && <ArrowRightCircle className={`w-4 h-4 shrink-0 ${isAr ? "rotate-180" : ""}`} style={{ color: "#F5A60060" }} />}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-white/40 leading-relaxed">
                  {isAr
                    ? "تماماً كما تعلمت لغتك الأم — بالسماع والكلام أولاً، ثم القراءة والكتابة."
                    : "Just like your mother tongue — listening and speaking first, reading and writing come naturally after."}
                </p>
              </div>
            </div>

            {/* Confidence Factor */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5A60020" }}>
                  <Shield className="w-5 h-5" style={{ color: "#F5A600" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? "عامل الثقة" : "The Confidence Factor"}
                  </h3>
                  <p className="text-xs text-white/40">{isAr ? "مدعوم بالبحث النفسي" : "Backed by psychological research"}</p>
                </div>
              </div>

              {/* Big stat */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div className="relative mb-4">
                  <div className="text-8xl font-black leading-none" style={{ color: "#F5A600" }}>90%</div>
                  <div className="absolute -top-2 -end-4 w-8 h-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <p className="text-white/80 text-lg font-semibold mb-3 max-w-xs">
                  {isAr
                    ? "من فشل الأطفال في اللغة سببه القلق — وليس نقص الذكاء."
                    : "of children's language failure is caused by anxiety — not lack of intelligence."}
                </p>
                <div className="w-12 h-0.5 rounded-full mb-4" style={{ backgroundColor: "#F5A600" }} />
                <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                  {isAr
                    ? "منهجنا المعتمد على الأخصائية النفسية يكسر حاجز القلق ويبني ثقة حقيقية — لأن الطفل الواثق من نفسه يتعلم أسرع بمرات."
                    : "Our psychologist-led approach eliminates this anxiety barrier and builds genuine confidence — because a confident child learns exponentially faster."}
                </p>
              </div>

              {/* Retention comparison */}
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">
                  {isAr ? "احتفاظ المفردات النشطة" : "Active vocabulary retention"}
                </p>
                {[
                  { label: isAr ? "كيدسبيك — يستخدم الكلمات" : "Kidspeak — uses words", pct: 87, color: "#F5A600" },
                  { label: isAr ? "التعليم التقليدي — يحفظ الكلمات" : "Conventional — memorises words", pct: 23, color: "#ef4444" },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{row.label}</span>
                      <span className="font-bold" style={{ color: row.color }}>{row.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════ BEYOND LANGUAGE ══════════════════════════════════════════════════ */}
      <section id="beyond" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 50%, #fdf8f0 100%)" }}>
        {/* Decorative background blobs */}
        <div className="absolute top-0 start-0 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #1B2E8F, transparent)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 end-0 w-80 h-80 rounded-full opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #F5A600, transparent)", transform: "translate(30%, 30%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* ── Section badge + headline ── */}
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: "#1B2E8F12", color: "#1B2E8F", border: "1px solid #1B2E8F20" }}
            >
              {isAr ? "أكثر من مجرد لغة" : "Beyond Language"}
            </span>

            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4 text-gray-900">
              {isAr
                ? <>بناء <span style={{ color: "#1B2E8F" }}>عقل أقوى</span></>
                : <>Building a <span style={{ color: "#1B2E8F" }}>Stronger Mind</span></>}
            </h2>

            {/* "Honesty & Value" sub-message */}
            <div className="max-w-2xl mx-auto mt-6 p-6 rounded-2xl border-2 text-start"
              style={{ borderColor: "#F5A60050", backgroundColor: "#FFFBF0" }}>
              <p className="text-lg sm:text-xl font-black text-gray-900 mb-2 leading-snug">
                {isAr
                  ? "«الإنجليزية ليست سهلة، ولهذا السبب هي تغيّر الشخصية.»"
                  : "\"English is Hard, and That's Why It's Transformative.\""}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isAr
                  ? "تعلّم التحدث بلغة ثانية هو تمرين معرفي حقيقي. فهو يُنمّي مهارات تُستخدم في جميع المواد الدراسية — من الرياضيات إلى التاريخ — وتُعدّ طريقة كيدسبيك مُصمَّمة خصيصاً لتحويل هذا التحدي إلى قوة دائمة."
                  : "Learning to speak a second language is a real cognitive workout — one that builds skills used across every school subject, from Maths to History. Kidspeak is engineered to turn this challenge into permanent intellectual strength."}
              </p>
            </div>
          </div>

          {/* ── 3 Ripple-Effect skill cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                emoji: "🎤",
                color: "#1B2E8F",
                bg: "#EEF2FF",
                border: "#1B2E8F20",
                titleEn: "Public Speaking & Leadership",
                titleAr: "الإلقاء والقيادة",
                bodyEn: "If they can speak English with confidence, they will lead in their Arabic and History classes too.",
                bodyAr: "إذا استطاع طفلك التحدث بالإنجليزية بثقة، فإنه سيتصدّر في حصص اللغة العربية والتاريخ أيضاً.",
                tagEn: "Transfers to: Arabic · History · Social Studies",
                tagAr: "ينعكس على: العربية · التاريخ · الدراسات الاجتماعية",
              },
              {
                emoji: "🧠",
                color: "#7c3aed",
                bg: "#F3EFFE",
                border: "#7c3aed20",
                titleEn: "Cognitive Focus",
                titleAr: "التركيز المعرفي",
                bodyEn: "Our 'Speaking-First' method trains active listening and memory — directly boosting performance in Maths and Science.",
                bodyAr: "طريقتنا 'الكلام أولاً' تُدرّب الاستماع الفعّال والذاكرة — وهو ما يرفع مستوى أداء الطفل في الرياضيات والعلوم مباشرةً.",
                tagEn: "Transfers to: Maths · Science · Languages",
                tagAr: "ينعكس على: الرياضيات · العلوم · اللغات",
              },
              {
                emoji: "💪",
                color: "#16a34a",
                bg: "#F0FDF4",
                border: "#16a34a20",
                titleEn: "Emotional Resilience",
                titleAr: "المرونة النفسية",
                bodyEn: "Overcoming the fear of making mistakes in English teaches kids how to handle any challenge — including high-stakes exams.",
                bodyAr: "التغلّب على خوف الخطأ في الإنجليزية يُعلّم الطفل كيف يواجه أي تحدٍّ — بما في ذلك الامتحانات الكبرى.",
                tagEn: "Transfers to: Every exam · Every subject",
                tagAr: "ينعكس على: كل امتحان · كل مادة",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border-2 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                style={{ backgroundColor: card.bg, borderColor: card.border }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{card.emoji}</span>
                  <h3 className="font-black text-base leading-tight text-gray-900">
                    {isAr ? card.titleAr : card.titleEn}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">
                  {isAr ? card.bodyAr : card.bodyEn}
                </p>
                <p className="text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                  style={{ color: card.color, backgroundColor: `${card.color}12`, border: `1px solid ${card.color}25` }}>
                  {isAr ? card.tagAr : card.tagEn}
                </p>
              </div>
            ))}
          </div>

          {/* ── Positive Reflection Infographic ── */}
          <div className="rounded-3xl p-8 sm:p-10 mb-12"
            style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #1B2E8F 100%)" }}>
            <p className="text-center text-white/70 text-xs font-semibold uppercase tracking-widest mb-8">
              {isAr ? "انعكاس إيجابي" : "The Positive Reflection Effect"}
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 ${isAr ? "sm:flex-row-reverse" : ""}`}>
              {/* Step 1 */}
              <div className="flex-1 max-w-[200px] text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: "#F5A60020", border: "2px solid #F5A60050" }}>
                  🎯
                </div>
                <p className="text-white font-black text-sm">
                  {isAr ? "مهارات كيدسبيك" : "Kidspeak Skills"}
                </p>
                <div className="flex gap-1.5 mt-2 justify-center flex-wrap">
                  {(isAr ? ["ثقة", "ممارسة", "جرأة"] : ["Confidence", "Practice", "Boldness"]).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: "#F5A60025", color: "#F5A600", border: "1px solid #F5A60040" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className={`text-[#F5A600] text-2xl font-black opacity-80 rotate-90 sm:rotate-0 ${isAr ? "sm:scale-x-[-1]" : ""}`}>➡️</div>

              {/* Step 2 */}
              <div className="flex-1 max-w-[200px] text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: "#7c3aed20", border: "2px solid #7c3aed50" }}>
                  🔄
                </div>
                <p className="text-white font-black text-sm">
                  {isAr ? "انعكاس إيجابي" : "Positive Reflection"}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {isAr ? "مهارات معرفية ونفسية" : "Cognitive & emotional growth"}
                </p>
              </div>

              {/* Arrow */}
              <div className={`text-[#F5A600] text-2xl font-black opacity-80 rotate-90 sm:rotate-0 ${isAr ? "sm:scale-x-[-1]" : ""}`}>➡️</div>

              {/* Step 3 */}
              <div className="flex-1 max-w-[200px] text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: "#16a34a20", border: "2px solid #16a34a50" }}>
                  🏆
                </div>
                <p className="text-white font-black text-sm">
                  {isAr ? "التفوق في كل المواد" : "Academic Excellence"}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {isAr ? "في جميع المواد الدراسية" : "Across ALL subjects"}
                </p>
              </div>
            </div>
          </div>

          {/* ── CTA link to Our Method page ── */}
          <div className="text-center">
            <button
              onClick={() => setLocation("/our-method")}
              className="inline-flex items-center gap-2 text-sm font-bold group"
              style={{ color: "#1B2E8F" }}
            >
              <span className="underline underline-offset-4 group-hover:no-underline">
                {isAr ? "اكتشف كيف نطبّق هذا في برنامجنا" : "See how we do this in our program"}
              </span>
              <span className={`transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}>→</span>
            </button>
          </div>

        </div>
      </section>

      {/* ══════ METHOD ═══════════════════════════════════════════════════════════ */}
      <section id="method" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: "#1B2E8F22", color: "#1B2E8F" }}
            >
              {txt.method.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">{txt.method.title}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{txt.method.sub}</p>
          </div>

          {/* 4-step diagram */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-16 start-[12.5%] end-[12.5%] h-0.5 bg-gradient-to-r from-[#F5A600] to-[#1B2E8F]" />
            {txt.method.steps.map((step, i) => {
              const Icon = step.icon;
              const colors = ["#F5A600", "#f97316", "#7c3aed", "#1B2E8F"];
              return (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  {/* Step circle */}
                  <div
                    className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: colors[i] }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                    <span
                      className="absolute -top-2 -end-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center bg-white shadow"
                      style={{ color: colors[i] }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  {/* Label */}
                  <div
                    className="text-2xl font-black mb-1"
                    style={{ color: colors[i] }}
                  >
                    {step.ar}
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-2">{step.label}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ USPs ═════════════════════════════════════════════════════════════ */}
      <section id="usp" className="py-24" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: "#F5A60022", color: "#b37800" }}
            >
              {txt.usp.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900">{txt.usp.title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {txt.usp.cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${card.color}22` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ PROGRAMS ═════════════════════════════════════════════════════════ */}
      <section id="programs" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: "#1B2E8F22", color: "#1B2E8F" }}
            >
              {txt.programs.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">{txt.programs.title}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{txt.programs.sub}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(levels.length > 0 ? levels : [1, 2, 3, 4].map((n) => ({ id: n, name: `Level ${n}` }))).map((level, i) => {
              const levelColors = ["#F5A600", "#f97316", "#7c3aed", "#1B2E8F"];
              const color = levelColors[i % levelColors.length];
              const lv = level as Level;
              const displayName = (isAr && lv.nameAr) ? lv.nameAr : lv.name;
              const desc = (isAr && lv.descriptionAr) ? lv.descriptionAr : (lv.description || txt.programs.defaultDesc[i] || `Level ${i + 1}`);
              const price = lv.price;
              const weeks = (level as Level).durationWeeks ?? 8;
              const spw = (level as Level).sessionsPerWeek ?? 2;
              const isPopular = i === 1;

              return (
                <div
                  key={level.id}
                  className={`relative rounded-3xl border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isPopular ? "shadow-lg" : "shadow-sm"}`}
                  style={{ borderColor: isPopular ? color : "#e5e7eb" }}
                >
                  {isPopular && (
                    <div
                      className="absolute top-0 inset-x-0 text-center text-xs font-bold py-1.5 text-white"
                      style={{ backgroundColor: color }}
                    >
                      ⭐ {isAr ? "الأكثر شعبية" : "Most Popular"}
                    </div>
                  )}
                  <div className={`p-6 ${isPopular ? "pt-10" : ""}`}>
                    {/* Level indicator */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm mb-4"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{displayName}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{desc}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="text-gray-600">{weeks} {txt.programs.weeks}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="text-gray-600">{spw} {txt.programs.sessions}</span>
                      </div>
                      {price && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 shrink-0" style={{ color }} />
                          <span className="font-bold" style={{ color }}>{price.toLocaleString()} {txt.programs.perMonth}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { setRegSource(null); setShowRegModal(true); setRegSubmitted(false); setRegForm({ fullName: "", email: "", phone: "", whatsappPhone: "", address: "" }); }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: isPopular ? color : `${color}22`, color: isPopular ? "white" : color }}
                    >
                      {txt.programs.enrollBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ TRANSPARENCY WINDOW ══════════════════════════════════════════════ */}
      <section id="transparency" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0f2e 0%, #0f1c5c 50%, #0a0f2e 100%)" }}>
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,166,0,0.08) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* ── Section header ── */}
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full mb-5 border" style={{ backgroundColor: "rgba(245,166,0,0.12)", borderColor: "rgba(245,166,0,0.35)", color: "#F5A600" }}>
              <Lock className="w-3.5 h-3.5" />
              {txt.transparency.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
              {txt.transparency.title}
            </h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">{txt.transparency.sub}</p>
          </div>

          {/* ── Part 1: Phone mockup + features ── */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-28">
            {/* Left: Phone mockup */}
            <div className={`flex justify-center ${isAr ? "lg:order-2" : ""}`}>
              <div className="relative w-72 sm:w-80">
                {/* Phone frame */}
                <div className="rounded-[2.5rem] border-4 p-1 shadow-2xl" style={{ borderColor: "rgba(245,166,0,0.5)", background: "linear-gradient(180deg, #1B2E8F, #0a0f2e)" }}>
                  <div className="rounded-[2rem] overflow-hidden bg-[#0a0f2e]">
                    {/* Phone status bar */}
                    <div className="flex items-center justify-between px-5 py-2 text-xs text-white/60 bg-black/30">
                      <span>9:41</span>
                      <div className="w-16 h-4 bg-black/50 rounded-full" />
                      <div className="flex gap-1">
                        <div className="w-3 h-2 bg-white/60 rounded-sm" />
                        <div className="w-1 h-2 bg-white/60 rounded-sm" />
                      </div>
                    </div>
                    {/* App header */}
                    <div className="px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #1B2E8F, #2d3e9f)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#1B2E8F]" style={{ backgroundColor: "#F5A600" }}>K</div>
                      <span className="text-white font-semibold text-sm">{txt.transparency.phone.headline}</span>
                    </div>
                    {/* Dashboard cards */}
                    <div className="p-3 space-y-2">
                      {/* Attendance mini card */}
                      <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(245,166,0,0.1)", border: "1px solid rgba(245,166,0,0.2)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarCheck className="w-4 h-4" style={{ color: "#F5A600" }} />
                          <span className="text-xs font-semibold text-white">{isAr ? "الحضور هذا الشهر" : "Attendance This Month"}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1,1,1,1,1,1,1,0,1,1,1,1].map((v, i) => (
                            <div key={i} className="flex-1 h-2 rounded-full" style={{ backgroundColor: v ? "#F5A600" : "rgba(255,255,255,0.15)" }} />
                          ))}
                        </div>
                        <div className="text-right mt-1">
                          <span className="text-[10px]" style={{ color: "#F5A600" }}>11/12 ✓</span>
                        </div>
                      </div>
                      {/* Progress mini chart */}
                      <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-semibold text-white">{isAr ? "نقاط التقدم" : "Progress Score"}</span>
                        </div>
                        <div className="flex items-end gap-1 h-10">
                          {[3,4,4,5,6,7,7,8].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t" style={{ height: `${h * 10}%`, backgroundColor: i === 7 ? "#F5A600" : "rgba(245,166,0,0.35)" }} />
                          ))}
                        </div>
                      </div>
                      {/* Video entry */}
                      <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "rgba(27,46,143,0.5)", border: "1px solid rgba(100,130,255,0.2)" }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,166,0,0.2)" }}>
                          <Video className="w-5 h-5" style={{ color: "#F5A600" }} />
                        </div>
                        <div>
                          <div className="text-xs text-white font-medium">{isAr ? "حصة التحدث — الأسبوع ١٢" : "Speaking Session — Week 12"}</div>
                          <div className="text-[10px] text-white/50">{isAr ? "٢:٤٥ دقيقة" : "2:45 min"} · ⭐⭐⭐⭐⭐</div>
                        </div>
                      </div>
                      {/* Psych note */}
                      <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Brain className="w-4 h-4" style={{ color: "#a78bfa" }} />
                          <span className="text-xs font-semibold text-white">{isAr ? "ملاحظة الأخصائية" : "Psychologist Note"}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: "#c4b5fd" }}>
                          {isAr ? '"أظهر تحسنًا ملحوظًا في المبادرة بالكلام. أنصح بتشجيعه في المنزل..."' : '"Showed remarkable improvement in initiating speech. Encourage at home..."'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow ring */}
                <div className="absolute -inset-4 rounded-[3rem] -z-10 blur-2xl opacity-30" style={{ background: "radial-gradient(circle, #F5A600 0%, #1B2E8F 70%)" }} />
              </div>
            </div>

            {/* Right: Feature points */}
            <div className={`space-y-6 ${isAr ? "lg:order-1" : ""}`}>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {txt.transparency.phone.headline}
              </h3>
              {txt.transparency.phone.items.map((item: any, i: number) => {
                const icons: Record<string, JSX.Element> = {
                  eye: <Eye className="w-5 h-5" />,
                  video: <Video className="w-5 h-5" />,
                  calendar: <CalendarCheck className="w-5 h-5" />,
                };
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: "rgba(245,166,0,0.15)", border: "1px solid rgba(245,166,0,0.4)", color: "#F5A600" }}>
                      {icons[item.icon]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.label}</h4>
                      <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Part 2: Triple Guarantee ── */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-3 tracking-widest uppercase" style={{ backgroundColor: "rgba(245,166,0,0.15)", color: "#F5A600", border: "1px solid rgba(245,166,0,0.35)" }}>
                {txt.transparency.guarantees.badge}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white">{txt.transparency.guarantees.title}</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {txt.transparency.guarantees.items.map((item: any, i: number) => {
                const icons: Record<string, JSX.Element> = {
                  shield: <Shield className="w-6 h-6" />,
                  mic: <Mic className="w-6 h-6" />,
                  brain: <Brain className="w-6 h-6" />,
                };
                const accentColors = ["#F5A600", "#F5A600", "#F5A600"];
                return (
                  <div key={i} className="relative rounded-2xl p-7 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(245,166,0,0.25)" }}>
                    {/* Top accent bar */}
                    <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl" style={{ backgroundColor: accentColors[i] }} />
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(245,166,0,0.15)", color: accentColors[i] }}>
                      {icons[item.icon]}
                    </div>
                    <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: accentColors[i] }}>
                      {item.tag}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">{item.title}</h4>
                    <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
                    <div className="mt-5 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#F5A600" }} />
                      <span className="text-xs font-semibold" style={{ color: "#F5A600" }}>{isAr ? "مضمون من كيدسبيك" : "Kidspeak Guarantee"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Part 3: 15-Minute Rule ── */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(245,166,0,0.08) 0%, rgba(245,166,0,0.03) 100%)", border: "1px solid rgba(245,166,0,0.3)" }}>
              <div className="px-8 py-10 text-center">
                <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase" style={{ backgroundColor: "rgba(245,166,0,0.15)", color: "#F5A600", border: "1px solid rgba(245,166,0,0.4)" }}>
                  <Timer className="w-3.5 h-3.5" />
                  {txt.transparency.rule.badge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">{txt.transparency.rule.title}</h3>
                <p className="text-blue-100 mb-8 leading-relaxed max-w-lg mx-auto">{txt.transparency.rule.desc}</p>

                {/* Visual comparison bars */}
                <div className="space-y-5 mb-8">
                  {/* Kidspeak bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-white">{txt.transparency.rule.usLabel}</span>
                      <span className="font-black text-2xl" style={{ color: "#F5A600" }}>{txt.transparency.rule.us}</span>
                    </div>
                    <div className="h-6 rounded-full overflow-hidden bg-white/10">
                      <div className="h-full rounded-full flex items-center justify-end pe-3" style={{ width: "100%", background: "linear-gradient(90deg, #F5A600, #ffcc44)" }}>
                        <span className="text-[10px] font-bold text-[#1B2E8F]">✓✓✓</span>
                      </div>
                    </div>
                  </div>
                  {/* Traditional school bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-white/60">{txt.transparency.rule.themLabel}</span>
                      <span className="font-black text-2xl text-white/40">{txt.transparency.rule.them}</span>
                    </div>
                    <div className="h-6 rounded-full overflow-hidden bg-white/10">
                      <div className="h-full rounded-full" style={{ width: "3.3%", backgroundColor: "rgba(255,255,255,0.3)" }} />
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold" style={{ color: "#F5A600" }}>
                  ⚡ {txt.transparency.rule.compare}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════ TESTIMONIALS ═════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: "#F5A60022", color: "#b37800" }}
            >
              {txt.testimonials.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900">{txt.testimonials.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(cmsTestimonials.length > 0 ? cmsTestimonials : txt.testimonials.items).map((item: any, i) => {
              const name = item.nameAr && isAr ? item.nameAr : item.name;
              const text = item.textAr && isAr ? item.textAr : item.text;
              const stars = item.stars ?? 5;
              return (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: stars }).map((_, si) => (
                      <Star key={si} className="w-5 h-5 fill-[#F5A600] text-[#F5A600]" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: "#1B2E8F" }}
                    >
                      {(name || "?")[0]}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            {[
              { icon: Award, text: isAr ? "شهادات رقمية بـ QR" : "Smart QR Certificates", color: "#F5A600" },
              { icon: Shield, text: isAr ? "دعم نفسي متخصص" : "Psychological Support", color: "#7c3aed" },
              { icon: Heart, text: isAr ? "بيئة آمنة وحنون" : "Safe & Caring Environment", color: "#e11d48" },
            ].map(({ icon: Icon, text, color }, i) => (
              <div key={i} className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
                <Icon className="w-5 h-5" style={{ color }} />
                <span className="text-sm font-medium text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ ENROLLMENT FORM ══════════════════════════════════════════════════ */}
      <section id="enroll" className="py-24" style={{ background: "linear-gradient(135deg, #0f1c5c 0%, #1B2E8F 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
            >
              {txt.enroll.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">{txt.enroll.title}</h2>
            <p className="text-white/70 text-lg">{txt.enroll.sub}</p>
          </div>

          {submitted ? (
            <div className="bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-black text-white mb-2">{isAr ? "تم الاستلام!" : "Received!"}</h3>
              <p className="text-white/70">{txt.enroll.success}</p>
              <button
                className="mt-6 px-6 py-3 rounded-xl font-semibold text-[#1B2E8F]"
                style={{ backgroundColor: "#F5A600" }}
                onClick={() => setSubmitted(false)}
              >
                {isAr ? "تسجيل طفل آخر" : "Register Another Child"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.parentName}</label>
                  <Input
                    required
                    value={formData.parentName}
                    onChange={e => setFormData(f => ({ ...f, parentName: e.target.value }))}
                    placeholder={isAr ? "أحمد بن علي" : "Ahmed Benali"}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.parentPhone}</label>
                  <Input
                    required
                    type="tel"
                    value={formData.parentPhone}
                    onChange={e => setFormData(f => ({ ...f, parentPhone: e.target.value }))}
                    placeholder="0555 123 456"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.parentEmail}</label>
                  <Input
                    type="email"
                    value={formData.parentEmail}
                    onChange={e => setFormData(f => ({ ...f, parentEmail: e.target.value }))}
                    placeholder={isAr ? "بريدك@مثال.com" : "your@email.com"}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.childName}</label>
                  <Input
                    required
                    value={formData.childName}
                    onChange={e => setFormData(f => ({ ...f, childName: e.target.value }))}
                    placeholder={isAr ? "اسم الطفل" : "Child's name"}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.childAge}</label>
                  <Select value={formData.childAge} onValueChange={v => setFormData(f => ({ ...f, childAge: v }))}>
                    <SelectTrigger className="h-11"><SelectValue placeholder={isAr ? "اختر العمر" : "Select age"} /></SelectTrigger>
                    <SelectContent>
                      {txt.enroll.ageOptions.map((o, i) => <SelectItem key={i} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.preferredLevel}</label>
                  <Select value={formData.preferredLevel} onValueChange={v => setFormData(f => ({ ...f, preferredLevel: v }))}>
                    <SelectTrigger className="h-11"><SelectValue placeholder={isAr ? "اختر المستوى" : "Select level"} /></SelectTrigger>
                    <SelectContent>
                      {(levels.length > 0 ? levels : [{ id: 1, name: "Level 1" }, { id: 2, name: "Level 2" }, { id: 3, name: "Level 3" }, { id: 4, name: "Level 4" }]).map(lv => (
                        <SelectItem key={lv.id} value={lv.name}>{lv.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">{txt.enroll.labels.notes}</label>
                <Textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  placeholder={isAr ? "أي معلومات إضافية تودّ مشاركتها…" : "Any additional information you'd like to share…"}
                  className="resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-xl font-black text-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#1B2E8F", color: "white" }}
              >
                {submitting ? (isAr ? "جاري الإرسال…" : "Sending…") : txt.enroll.labels.submit}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══════ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              {settings?.logoWhiteUrl ? (
                <img src={`/api/storage/public-objects/${settings.logoWhiteUrl}`} alt="Kidspeak" className="h-10 mb-4 object-contain" />
              ) : (
                <div className="text-2xl font-black mb-4">
                  kid<span style={{ color: "#F5A600" }}>speak</span>
                </div>
              )}
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                {isAr ? settings?.sloganAr || "حيث يلتقي التقدم بالدقة." : settings?.slogan || "Where Progress Meets Precision."}
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {settings?.instagram && (
                  <a href={settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram}`}
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-[#F5A600] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.facebook && (
                  <a href={settings.facebook.startsWith("http") ? settings.facebook : `https://facebook.com/${settings.facebook}`}
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-[#F5A600] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.youtube && (
                  <a href={settings.youtube.startsWith("http") ? settings.youtube : `https://youtube.com/@${settings.youtube}`}
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-white/10 hover:bg-[#F5A600] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-bold text-white mb-5">{isAr ? "روابط سريعة" : "Quick Links"}</h4>
              <nav className="space-y-3">
                {[
                  ...(cmsOpenDay?.enabled ? [{ label: isAr ? "🎉 اليوم المفتوح" : "🎉 Open Day", id: "open-day" }] : []),
                  { label: isAr ? "العلم خلف كيدسبيك" : "The Science", id: "science" },
                  { label: isAr ? "أكثر من مجرد لغة" : "Beyond Language", id: "beyond" },
                  { label: isAr ? "الطريقة" : "The Method", id: "method" },
                  { label: isAr ? "الميزات" : "Features", id: "usp" },
                  { label: isAr ? "البرامج" : "Programs", id: "programs" },
                  { label: isAr ? "نافذة الشفافية" : "Transparency", id: "transparency" },
                  { label: isAr ? "آراء الأهل" : "Testimonials", id: "testimonials" },
                  { label: isAr ? "التسجيل" : "Register", id: "enroll" },
                ].map(link => (
                  <button key={link.id} onClick={() => scrollTo(link.id)}
                    className="block text-white/50 hover:text-[#F5A600] text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                {/* Custom CMS pages in footer */}
                {customPages.filter(p => p.showInFooter && p.status === "published").map(p => (
                  <a key={p.id} href={`/p${p.slug}`}
                    className="block text-white/50 hover:text-[#F5A600] text-sm transition-colors"
                  >
                    {isAr ? (p.titleAr || p.titleEn) : p.titleEn}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-5">{txt.footer.contact}</h4>
              <div className="space-y-4">
                {settings?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F5A600" }} />
                    <span className="text-white/50 text-sm">{settings.address}</span>
                  </div>
                )}
                {settings?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: "#F5A600" }} />
                    <a href={`tel:${settings.phone}`} className="text-white/50 hover:text-white text-sm transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                )}
                {settings?.phone2 && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: "#F5A600" }} />
                    <a href={`tel:${settings.phone2}`} className="text-white/50 hover:text-white text-sm transition-colors">
                      {settings.phone2}
                    </a>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: "#F5A600" }} />
                    <a href={`mailto:${settings.email}`} className="text-white/50 hover:text-white text-sm transition-colors">
                      {settings.email}
                    </a>
                  </div>
                )}
                {!settings?.address && !settings?.phone && !settings?.email && (
                  <p className="text-white/30 text-sm">{isAr ? "تواصل معنا عبر وسائل التواصل الاجتماعي" : "Contact us via social media"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} {settings?.schoolName ?? "Kidspeak Language Center"}. {txt.footer.rights}
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              {txt.nav.login}
            </button>
          </div>
        </div>
      </footer>

      {/* ══════ PARENT REGISTRATION MODAL ══════════════════════════════════════ */}
      {showRegModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowRegModal(false); }}
        >
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ animation: "slideUp 0.3s ease" }}
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-6 text-center" style={{ background: "linear-gradient(135deg, #1B2E8F 0%, #2a3fa0 100%)" }}>
              <button
                onClick={() => setShowRegModal(false)}
                className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#F5A600" }}>
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              {settings?.logoWhiteUrl ? (
                <img src={`/api/storage/public-objects/${settings.logoWhiteUrl}`} alt="Kidspeak" className="h-7 object-contain mx-auto mb-3" />
              ) : (
                <p className="text-white font-black text-xl tracking-tight mb-3">
                  kid<span style={{ color: "#F5A600" }}>speak</span>
                </p>
              )}
              <h2 className="text-xl font-black text-white">{txt.reg.title}</h2>
              <p className="text-white/70 text-sm mt-1.5 leading-relaxed">{txt.reg.subtitle}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {regSubmitted ? (
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-black text-[#1B2E8F] mb-2">{txt.reg.successTitle}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{txt.reg.successMsg}</p>
                  <button
                    onClick={() => setShowRegModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#1B2E8F" }}
                  >
                    {txt.reg.successBtn}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{txt.reg.fullName}</label>
                    <Input
                      required
                      value={regForm.fullName}
                      onChange={e => setRegForm(f => ({ ...f, fullName: e.target.value }))}
                      placeholder={txt.reg.placeholders.fullName}
                      className="h-11"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{txt.reg.email}</label>
                    <Input
                      required
                      type="email"
                      value={regForm.email}
                      onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                      placeholder={txt.reg.placeholders.email}
                      className="h-11"
                    />
                  </div>

                  {/* Phone + WhatsApp */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{txt.reg.phone}</label>
                      <Input
                        required
                        type="tel"
                        value={regForm.phone}
                        onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={txt.reg.placeholders.phone}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">{txt.reg.whatsappPhone}</label>
                      <Input
                        type="tel"
                        value={regForm.whatsappPhone}
                        onChange={e => setRegForm(f => ({ ...f, whatsappPhone: e.target.value }))}
                        placeholder={txt.reg.placeholders.whatsappPhone}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">{txt.reg.address}</label>
                    <Input
                      value={regForm.address}
                      onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))}
                      placeholder={txt.reg.placeholders.address}
                      className="h-11"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full h-12 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    style={{ backgroundColor: "#1B2E8F" }}
                  >
                    {regSubmitting ? (isAr ? "جاري الإرسال…" : "Sending…") : txt.reg.submit}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    {isAr ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => { setShowRegModal(false); setLocation("/login"); }}
                      className="font-semibold underline"
                      style={{ color: "#1B2E8F" }}
                    >
                      {isAr ? "سجّل الدخول" : "Log in"}
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
