import { useState, useRef } from "react";
import {
  useGetStudent,
  useGetStudentProgress,
  useListObservations,
  useCreateObservation,
  useDeleteObservation,
  useDeleteStudent,
  useGetMe,
} from "@workspace/api-client-react";
import { useUpdateStudentProfile } from "@workspace/api-client-react";
import { EnrollmentReceiptModal } from "@/components/enrollment-receipt-modal";
import { LearningJourney } from "@/components/learning-journey";
import { SkillsRadar } from "@/components/skills-radar";
import { AttendanceMap } from "@/components/attendance-map";
import { ConfidenceCompass } from "@/components/confidence-compass";
import { CommunicationRadar } from "@/components/communication-radar";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { format, differenceInYears } from "date-fns";
import {
  Star,
  AlertTriangle,
  UserMinus,
  ArrowLeft,
  Brain,
  Plus,
  Trash2,
  Clock,
  Camera,
  Edit2,
  Save,
  Heart,
  BookOpen,
  CreditCard,
  Map,
  CalendarCheck,
  Sprout,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BarChart3,
  FileText,
  Lightbulb,
  Mic,
  Eye,
  MessageCircle,
  GraduationCap,
  Users,
  CheckCircle,
  PenLine,
  Printer,
  Award,
  Phone,
  Stethoscope,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";
import { useBranch } from "@/contexts/branch-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type ObsType = "fear" | "shyness" | "participation" | "general";

const TYPE_COLORS: Record<ObsType, string> = {
  fear: "bg-red-100 text-red-700 border-red-200",
  shyness: "bg-orange-100 text-orange-700 border-orange-200",
  participation: "bg-emerald-100 text-emerald-700 border-emerald-200",
  general: "bg-blue-100 text-blue-700 border-blue-200",
};

function calcAge(dob: string | null): string | null {
  if (!dob) return null;
  const age = differenceInYears(new Date(), new Date(dob));
  return `${age}`;
}

export default function StudentProfile() {
  const params = useParams();
  const studentId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { t, language, isRTL } = useLanguage();
  const { branches } = useBranch();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isObsOpen, setIsObsOpen] = useState(false);
  const [obsType, setObsType] = useState<ObsType>("general");
  const [obsContent, setObsContent] = useState("");
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [healthData, setHealthData] = useState({
    medicalAlerts: "",
    medicalIssues: "",
    learningDisabilities: "",
    supportInstructions: "",
    preferredTeachingMethod: "",
  });

  const LEARNING_DIFFICULTY_KEYS = [
    "dyslexia", "adhd", "speechDelay", "dyscalculia",
    "dysgraphia", "processingDisorder", "autism", "anxiety",
  ] as const;

  const toggleLearningDifficulty = (key: string) => {
    setHealthData((prev) => {
      const existing = prev.learningDisabilities
        ? prev.learningDisabilities.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const next = existing.includes(key)
        ? existing.filter((k) => k !== key)
        : [...existing, key];
      return { ...prev, learningDisabilities: next.join(", ") };
    });
  };

  const { data: currentUser } = useGetMe();
  const canAddObservations =
    currentUser?.role === "admin" || currentUser?.role === "psychologist";
  const canEditHealth =
    currentUser?.role === "admin" ||
    currentUser?.role === "teacher" ||
    currentUser?.role === "psychologist";
  const canManagePayments =
    currentUser?.role === "admin" || currentUser?.role === "accountant";
  const canViewPrivateTip =
    currentUser?.role === "admin" ||
    currentUser?.role === "psychologist" ||
    (currentUser?.role === "teacher" && (student as any)?.teacherId === currentUser?.id);
  const canEditPrivateTip =
    currentUser?.role === "admin" || currentUser?.role === "psychologist";
  const canShowGrowthProgress =
    currentUser?.role === "parent" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "psychologist";

  const { data: growthSessions = [] } = useQuery<any[]>({
    queryKey: ["growth-sessions", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentId}/growth-sessions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!studentId && canShowGrowthProgress,
  });

  // ── Performance Reports ─────────────────────────────────────────────────────
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [newReportPeriod, setNewReportPeriod] = useState("");
  const [newReportDate, setNewReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportForm, setReportForm] = useState({
    teacherVocabNotes: "",
    teacherStructureNotes: "",
    teacherFluencyNotes: "",
    teacherSummary: "",
    teacherVocabScore: 5,
    teacherStructureScore: 5,
    teacherFluencyScore: 5,
    fearReductionScore: 5,
    socialInitiativeScore: 5,
    selfConfidenceScore: 5,
    psychologistNotes: "",
    psychologistSummary: "",
    status: "draft" as "draft" | "published",
  });

  const { data: performanceReports = [], refetch: refetchReports } = useQuery<any[]>({
    queryKey: ["performance-reports", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/performance-reports/student/${studentId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!studentId,
  });

  const openEditReport = (report: any) => {
    setEditingReportId(report.id);
    setNewReportPeriod(report.period);
    setNewReportDate(report.reportDate);
    setReportForm({
      teacherVocabNotes: report.teacherVocabNotes || "",
      teacherStructureNotes: report.teacherStructureNotes || "",
      teacherFluencyNotes: report.teacherFluencyNotes || "",
      teacherSummary: report.teacherSummary || "",
      teacherVocabScore: report.teacherVocabScore ?? 5,
      teacherStructureScore: report.teacherStructureScore ?? 5,
      teacherFluencyScore: report.teacherFluencyScore ?? 5,
      fearReductionScore: report.fearReductionScore ?? 5,
      socialInitiativeScore: report.socialInitiativeScore ?? 5,
      selfConfidenceScore: report.selfConfidenceScore ?? 5,
      psychologistNotes: report.psychologistNotes || "",
      psychologistSummary: report.psychologistSummary || "",
      status: report.status || "draft",
    });
    setIsEditingReport(true);
  };

  const handleCreateReport = async () => {
    if (!newReportPeriod.trim() || !newReportDate) return;
    setIsSavingReport(true);
    try {
      const res = await fetch("/api/performance-reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, period: newReportPeriod.trim(), reportDate: newReportDate }),
      });
      if (!res.ok) throw new Error();
      const report = await res.json();
      setIsCreatingReport(false);
      setNewReportPeriod("");
      openEditReport(report);
      refetchReports();
      toast({ title: t.report.reportCreated });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleSaveReport = async () => {
    if (!editingReportId) return;
    setIsSavingReport(true);
    try {
      const res = await fetch(`/api/performance-reports/${editingReportId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });
      if (!res.ok) throw new Error();
      toast({ title: t.report.reportSaved });
      setIsEditingReport(false);
      setEditingReportId(null);
      refetchReports();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSavingReport(false);
    }
  };


  /* ── Private Tip state ── */
  const [isEditingTip, setIsEditingTip] = useState(false);
  const [tipValue, setTipValue] = useState("");
  const [isSavingTip, setIsSavingTip] = useState(false);

  const handleEditTip = () => {
    setTipValue((student as any)?.privateTip || "");
    setIsEditingTip(true);
  };

  const handleSaveTip = async () => {
    setIsSavingTip(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privateTip: tipValue }),
      });
      if (!res.ok) throw new Error();
      toast({ title: t.privateTip.saveSuccess });
      setIsEditingTip(false);
      refetchStudent();
    } catch {
      toast({ title: t.privateTip.saveFailed, variant: "destructive" });
    } finally {
      setIsSavingTip(false);
    }
  };

  /* ── Add Payment dialog state ── */
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [enrollmentReceiptPaymentId, setEnrollmentReceiptPaymentId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountDue: "",
    amountPaid: "",
    status: "pending" as "pending" | "paid" | "partially_paid" | "overdue",
    dueDate: "",
    notes: "",
  });

  const { data: student, isLoading: isStudentLoading, refetch: refetchStudent } = useGetStudent(studentId, {
    query: { enabled: !!studentId },
  });

  const { data: progress, isLoading: isProgressLoading } = useGetStudentProgress(studentId, {
    query: { enabled: !!studentId },
  });

  const { data: observations = [], refetch: refetchObs } = useListObservations(
    studentId ? { studentId } : undefined,
    { query: { enabled: !!studentId } }
  );

  const { mutate: createObs, isPending: isCreating } = useCreateObservation();
  const { mutate: deleteObs } = useDeleteObservation();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateStudentProfile();

  const handleCreateObs = () => {
    if (!studentId || !obsContent.trim()) return;
    createObs(
      { data: { studentId, content: obsContent.trim(), observationType: obsType } },
      {
        onSuccess: () => {
          toast({ title: t.behavioral.saveObservation });
          setIsObsOpen(false);
          setObsContent("");
          setObsType("general");
          refetchObs();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save observation.", variant: "destructive" });
        },
      }
    );
  };

  const handleDeleteObs = (id: number) => {
    deleteObs({ id }, { onSuccess: () => { toast({ title: "Observation deleted" }); refetchObs(); } });
  };

  const handleProfilePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateProfile(
        { id: studentId, data: { profilePicture: dataUrl } },
        {
          onSuccess: () => { toast({ title: "Profile picture updated." }); refetchStudent(); },
          onError: () => toast({ title: "Error", variant: "destructive" }),
        }
      );
    };
    reader.readAsDataURL(file);
  };

  const handleEditHealth = () => {
    setHealthData({
      medicalAlerts: (student as any)?.medicalAlerts || "",
      medicalIssues: (student as any)?.medicalIssues || "",
      learningDisabilities: (student as any)?.learningDisabilities || "",
      supportInstructions: (student as any)?.supportInstructions || "",
      preferredTeachingMethod: (student as any)?.preferredTeachingMethod || "",
    });
    setIsEditingHealth(true);
  };

  const handleSaveHealth = () => {
    updateProfile(
      { id: studentId, data: { ...healthData } },
      {
        onSuccess: () => {
          toast({ title: t.studentProfile.healthInfoSaved });
          setIsEditingHealth(false);
          refetchStudent();
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  const handleAddPayment = async () => {
    if (!paymentForm.amountDue || !paymentForm.dueDate) {
      toast({ title: "Amount Due and Due Date are required", variant: "destructive" }); return;
    }
    setIsSavingPayment(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId,
          amountDue: parseFloat(paymentForm.amountDue),
          amountPaid: parseFloat(paymentForm.amountPaid || "0"),
          status: paymentForm.status,
          dueDate: paymentForm.dueDate,
          notes: paymentForm.notes || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.payments.addPayment });
        setIsPaymentOpen(false);
        setPaymentForm({ amountDue: "", amountPaid: "", status: "pending", dueDate: "", notes: "" });
        refetchStudent();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
      }
    } finally {
      setIsSavingPayment(false);
    }
  };

  if (isStudentLoading || isProgressLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">{t.students.loadingStudents}</div>
    );
  }
  if (!student) {
    return <div className="p-8 text-center text-destructive">Student not found</div>;
  }

  const getFlagLabel = (flag: string) => {
    switch (flag) {
      case "high_potential": return t.studentProfile.highPotential;
      case "fear": return t.studentProfile.fear;
      case "shyness": return t.studentProfile.shyness;
      default: return flag;
    }
  };

  const studentExtra = student as any;
  const age = calcAge(student.dateOfBirth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <Link href="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          {currentUser?.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              title={t.students.deletePupil}
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4.5 h-4.5" />
            </Button>
          )}
        </div>

        {/* Avatar / Profile Picture */}
        <div className="relative shrink-0 group">
          {studentExtra.profilePicture ? (
            <img
              src={studentExtra.profilePicture}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2"
              style={{ borderColor: "#1B2E8F" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#1B2E8F" }}
            >
              {student.name[0]}
            </div>
          )}
          <button
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePicture}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{student.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-muted-foreground">
              {student.levelName || t.studentProfile.noLevelAssigned}
            </span>
            {age && (
              <span className="text-muted-foreground text-sm">
                · {t.studentProfile.age}: {age}
              </span>
            )}
            {student.behavioralFlags?.length > 0 && (
              <div className="flex gap-1">
                {student.behavioralFlags.map((flag) => (
                  <Badge
                    key={flag}
                    variant="outline"
                    className="text-xs"
                    style={flag === "high_potential" ? { borderColor: "#F5A600", color: "#F5A600" } : undefined}
                  >
                    {getFlagLabel(flag)}
                  </Badge>
                ))}
              </div>
            )}
            {(() => {
              const studentBranchId = (studentExtra as any)?.branchId;
              const studentBranch = studentBranchId ? branches.find(b => b.id === studentBranchId) : null;
              if (!studentBranch) return null;
              return (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1 font-semibold"
                  style={{ borderColor: "#1B2E8F40", color: "#1B2E8F", backgroundColor: "#1B2E8F08" }}
                >
                  🏫 {isRTL && studentBranch.nameAr ? studentBranch.nameAr : studentBranch.name}
                </Badge>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Teacher Profile Card — visible to parents when teacher has a bio/photo */}
      {currentUser?.role === "parent" && (studentExtra.teacherName || studentExtra.teacherBio) && (
        <div
          className="flex items-start gap-4 rounded-2xl border p-4"
          style={{ background: "linear-gradient(135deg, #1B2E8F08, #F5A60005)", borderColor: "rgba(27,46,143,0.12)" }}
        >
          <div className="shrink-0">
            {studentExtra.teacherProfilePicture ? (
              <img
                src={studentExtra.teacherProfilePicture}
                alt={studentExtra.teacherName}
                className="w-14 h-14 rounded-full object-cover border-2"
                style={{ borderColor: "#1B2E8F" }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: "#1B2E8F" }}
              >
                {studentExtra.teacherName?.[0] ?? "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm" style={{ color: "#1B2E8F" }}>
                {studentExtra.teacherName}
              </p>
              {studentExtra.teacherSpecialization && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#F5A60020", color: "#b37a00" }}
                >
                  {studentExtra.teacherSpecialization}
                </span>
              )}
            </div>
            {studentExtra.teacherBio && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                {studentExtra.teacherBio}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={currentUser?.role === "parent" ? "character" : "overview"} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="journey" className="flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.journey.tabLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.attendance.tabLabel}</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.studentProfile.tabOverview}</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.studentProfile.tabHealth}</span>
          </TabsTrigger>
          <TabsTrigger value="observations" className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.studentProfile.tabObservations}</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.report?.tabLabel ?? "Report"}</span>
          </TabsTrigger>
          {canShowGrowthProgress && (
            <TabsTrigger value="growth" className="flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.growthProgress.tabLabel}</span>
            </TabsTrigger>
          )}
          {canManagePayments && (
            <TabsTrigger value="payments" className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.studentProfile.tabPayments}</span>
            </TabsTrigger>
          )}
          {currentUser?.role === "parent" && (
            <TabsTrigger value="method" className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.method?.tabLabel ?? "Our Method"}</span>
            </TabsTrigger>
          )}
          {currentUser?.role === "parent" && (
            <TabsTrigger value="character" className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.character.tabTitle}</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── JOURNEY TAB ── */}
        <TabsContent value="journey" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <LearningJourney studentId={studentId} supportSessions={growthSessions} />
            <SkillsRadar studentId={studentId} />
          </div>
        </TabsContent>

        {/* ── ATTENDANCE TAB ── */}
        <TabsContent value="attendance" className="space-y-6">
          <div
            className="rounded-2xl border p-6"
            style={{ background: "linear-gradient(135deg, #1B2E8F05, #F5A60005)", borderColor: "rgba(27,46,143,0.12)" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #1B2E8F, #2b42b5)" }}
              >
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg" style={{ color: "#1B2E8F" }}>
                  {t.attendance.attendanceMap}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentUser?.role === "admin" || currentUser?.role === "teacher"
                    ? t.attendance.clickToEdit
                    : t.attendance.attendanceRate}
                </p>
              </div>
            </div>
            <AttendanceMap studentId={studentId} compact={false} />
          </div>
        </TabsContent>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Progress Chart */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{t.studentProfile.developmentTrajectory}</CardTitle>
                {progress?.overallProgressScore !== undefined && progress?.overallProgressScore !== null && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-base px-3 py-1">
                    {t.studentProfile.overall}: {Math.round(progress.overallProgressScore)}%
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="h-[300px]">
                {progress && progress.weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress.weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="weekNumber"
                        tickFormatter={(val) => `W${val}`}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(val) => `Week ${val}`}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Line type="monotone" dataKey="speakingScore" name={t.studentProfile.speaking} stroke="#1B2E8F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="confidenceScore" name={t.studentProfile.confidence} stroke="#F5A600" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="participationScore" name={t.studentProfile.participation} stroke="#3b5fe0" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    {t.studentProfile.noEvaluationData}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t.studentProfile.details}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.dateOfBirth && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{t.studentProfile.dateOfBirth}</div>
                      <div className="font-medium text-sm">
                        {format(new Date(student.dateOfBirth), "MMMM d, yyyy")}
                        {age && <span className="text-muted-foreground text-xs ms-2">({age} yrs)</span>}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{t.studentProfile.enrolled}</div>
                    <div className="font-medium text-sm">{format(new Date(student.enrollmentDate), "MMMM d, yyyy")}</div>
                  </div>
                  {student.parentName && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{t.studentProfile.parentGuardian}</div>
                      <div className="font-medium text-sm">{student.parentName}</div>
                    </div>
                  )}
                  {student.teacherName && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{t.studentProfile.assignedTeacher}</div>
                      <div className="font-medium text-sm">{student.teacherName}</div>
                    </div>
                  )}
                  {student.notes && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">{t.studentProfile.notes}</div>
                      <div className="text-sm bg-muted/50 p-2 rounded">{student.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guardian Info Card */}
              {(studentExtra.guardianName || studentExtra.guardianPhone || studentExtra.guardianPhone2) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: "#1B2E8F" }} />
                      {isRTL ? "معلومات الولي" : "Guardian Info"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentExtra.guardianRelationship && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{isRTL ? "صلة القرابة" : "Relationship"}</div>
                        <div className="font-medium text-sm capitalize">
                          {studentExtra.guardianRelationship === "father" ? (isRTL ? "الأب" : "Father")
                            : studentExtra.guardianRelationship === "mother" ? (isRTL ? "الأم" : "Mother")
                            : (isRTL ? "آخر" : "Other")}
                        </div>
                      </div>
                    )}
                    {studentExtra.guardianName && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{isRTL ? "اسم الولي" : "Guardian Name"}</div>
                        <div className="font-medium text-sm">{studentExtra.guardianName}</div>
                      </div>
                    )}
                    {studentExtra.guardianPhone && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {isRTL ? "الهاتف الرئيسي" : "Primary Phone"}
                        </div>
                        <a
                          href={`tel:${studentExtra.guardianPhone}`}
                          className="font-medium text-sm flex items-center gap-1 hover:underline"
                          style={{ color: "#1B2E8F" }}
                          dir="ltr"
                        >
                          {studentExtra.guardianPhone}
                        </a>
                      </div>
                    )}
                    {studentExtra.guardianPhone2 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {isRTL ? "واتساب / ثانوي" : "WhatsApp / Secondary"}
                        </div>
                        <a
                          href={`https://wa.me/${studentExtra.guardianPhone2.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm flex items-center gap-1 hover:underline text-emerald-700"
                          dir="ltr"
                        >
                          {studentExtra.guardianPhone2}
                        </a>
                      </div>
                    )}
                    {studentExtra.guardianOccupation && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{isRTL ? "المهنة" : "Occupation"}</div>
                        <div className="font-medium text-sm">{studentExtra.guardianOccupation}</div>
                      </div>
                    )}
                    {studentExtra.referralSource && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{isRTL ? "مصدر التعرف" : "Referral Source"}</div>
                        <div className="font-medium text-sm capitalize">
                          {{
                            friend: isRTL ? "توصية صديق" : "Friend / Family",
                            social_media: isRTL ? "وسائل التواصل" : "Social Media",
                            google: "Google",
                            open_day: isRTL ? "يوم مفتوح" : "Open Day",
                            flyer: isRTL ? "منشور" : "Flyer / Banner",
                            other: isRTL ? "أخرى" : "Other",
                          }[studentExtra.referralSource] ?? studentExtra.referralSource}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t.studentProfile.behavioralProfile}</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.behavioralFlags && student.behavioralFlags.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {student.behavioralFlags.map((flag) => (
                        <div key={flag} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          {flag === "high_potential" && <Star className="w-4 h-4 fill-current" style={{ color: "#F5A600" }} />}
                          {flag === "fear" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {flag === "shyness" && <UserMinus className="w-4 h-4 text-orange-400" />}
                          <span className="font-medium text-sm">{getFlagLabel(flag)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">{t.studentProfile.noBehavioralFlags}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Communication Metrics Radar — visible to staff */}
          {currentUser?.role !== "parent" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4" style={{ color: "#7c3aed" }} />
                  {t.groups.communicationMetrics}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t.groups.communicationMetricsHint}</p>
              </CardHeader>
              <CardContent>
                <CommunicationRadar studentId={studentId} compact />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── HEALTH & PSYCHOLOGY TAB ── */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                {t.studentProfile.tabHealth}
              </CardTitle>
              {canEditHealth && !isEditingHealth && (
                <Button variant="outline" size="sm" onClick={handleEditHealth}>
                  <Edit2 className="w-3.5 h-3.5 me-1.5" />
                  {t.studentProfile.editHealthInfo}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingHealth ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      🚨 {isRTL ? "تنبيهات طبية (حساسية / أمراض مزمنة)" : "Medical Alerts (Allergies / Chronic Conditions)"}
                    </label>
                    <Textarea
                      rows={2}
                      placeholder={isRTL ? "مثال: حساسية من البنسلين، ربو…" : "e.g. Allergic to penicillin, asthma, diabetes…"}
                      value={healthData.medicalAlerts}
                      onChange={(e) => setHealthData((p) => ({ ...p, medicalAlerts: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.studentProfile.medicalIssues}</label>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Asthma, penicillin allergy..."
                      value={healthData.medicalIssues}
                      onChange={(e) => setHealthData((p) => ({ ...p, medicalIssues: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.studentProfile.learningDisabilities}</label>
                    <p className="text-xs text-muted-foreground">{t.studentProfile.learningDifficultiesPlaceholder}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {LEARNING_DIFFICULTY_KEYS.map((key) => {
                        const selected = healthData.learningDisabilities
                          .split(",")
                          .map((s) => s.trim())
                          .includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleLearningDifficulty(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selected
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-background text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {(t.studentProfile.learningDifficultyOptions as Record<string, string>)[key] ?? key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.studentProfile.supportInstructions}</label>
                    <Textarea
                      rows={2}
                      placeholder={t.studentProfile.supportInstructionsPlaceholder}
                      value={healthData.supportInstructions}
                      onChange={(e) => setHealthData((p) => ({ ...p, supportInstructions: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.studentProfile.preferredTeachingMethod}</label>
                    <Input
                      placeholder="e.g. Visual aids, repetition, gamification..."
                      value={healthData.preferredTeachingMethod}
                      onChange={(e) => setHealthData((p) => ({ ...p, preferredTeachingMethod: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
                      className="font-semibold"
                      onClick={handleSaveHealth}
                      disabled={isSavingProfile}
                    >
                      <Save className="w-3.5 h-3.5 me-1.5" />
                      {isSavingProfile ? t.behavioral.saving : t.studentProfile.saveHealthInfo}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingHealth(false)}>
                      {t.users.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Medical Alerts Banner */}
                  {studentExtra.medicalAlerts ? (
                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-red-700 mb-1">
                          {isRTL ? "🚨 تنبيهات طبية عاجلة" : "🚨 Medical Alerts"}
                        </div>
                        <div className="text-sm text-red-800 whitespace-pre-line">{studentExtra.medicalAlerts}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-3 flex gap-2 items-center text-sm text-muted-foreground">
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      {isRTL ? "لا توجد تنبيهات طبية مسجلة." : "No medical alerts on file."}
                    </div>
                  )}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.studentProfile.medicalIssues}
                    </div>
                    <div className="text-sm">
                      {studentExtra.medicalIssues || (
                        <span className="text-muted-foreground italic">{t.studentProfile.noMedicalInfo}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.studentProfile.preferredTeachingMethod}
                    </div>
                    <div className="text-sm">
                      {studentExtra.preferredTeachingMethod || (
                        <span className="text-muted-foreground italic">{t.studentProfile.noTeachingMethod}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.studentProfile.learningDisabilities}
                    </div>
                    {studentExtra.learningDisabilities ? (
                      <div className="flex flex-wrap gap-2">
                        {studentExtra.learningDisabilities.split(",").map((k: string) => k.trim()).filter(Boolean).map((key: string) => (
                          <span key={key} className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
                            {(t.studentProfile.learningDifficultyOptions as Record<string, string>)[key] ?? key}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">{t.studentProfile.noLearningInfo}</span>
                    )}
                  </div>
                  {(studentExtra as any).supportInstructions && (
                    <div className="space-y-2 sm:col-span-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.studentProfile.supportInstructions}
                      </div>
                      <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
                        {(studentExtra as any).supportInstructions}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              )}
              {/* Audit trail */}
              {(studentExtra as any).lastUpdatedBy && (
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {t.studentProfile.lastUpdatedBy}{" "}
                    <strong>{(studentExtra as any).lastUpdatedBy}</strong>
                    {(studentExtra as any).lastUpdatedAt && (
                      <> — {format(new Date((studentExtra as any).lastUpdatedAt), "MMM d, yyyy 'at' h:mm a")}</>
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OBSERVATIONS TAB ── */}
        <TabsContent value="observations" className="space-y-4">
          {/* Confidence Compass — visible to psychologist, admin, and assigned teacher */}
          {(canViewPrivateTip || canAddObservations) && (
            <ConfidenceCompass studentId={studentId} canEdit={!!canEditPrivateTip} />
          )}

          {/* Behavioral Observations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: "#1B2E8F" }} />
                {t.behavioral.title}
              </CardTitle>
              {canAddObservations && (
                <Button
                  size="sm"
                  style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
                  className="font-semibold"
                  onClick={() => setIsObsOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 me-1.5" />
                  {t.behavioral.addObservation}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {observations.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.behavioral.noObservations}</p>
              ) : (
                <div className="space-y-3">
                  {observations.map((obs) => (
                    <div
                      key={obs.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/20"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${TYPE_COLORS[obs.observationType as ObsType] ?? "bg-gray-100"}`}
                          >
                            {t.behavioral.types[obs.observationType as ObsType] ?? obs.observationType}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(obs.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{obs.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.behavioral.observedBy}{" "}
                          <span className="font-medium">{obs.authorName}</span>
                        </p>
                      </div>
                      {canAddObservations && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteObs(obs.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Private Tip for Teacher — visible to psychologist, admin, assigned teacher */}
          {canViewPrivateTip && (
            <Card className="border-2 border-dashed" style={{ borderColor: "#7c3aed44" }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base" style={{ color: "#7c3aed" }}>
                      <Edit2 className="w-4 h-4" />
                      {t.privateTip.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.privateTip.subtitle}</p>
                  </div>
                  {canEditPrivateTip && !isEditingTip && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditTip}
                      className="shrink-0 border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                      <Edit2 className="w-3.5 h-3.5 me-1.5" />
                      {t.users.edit}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingTip ? (
                  <div className="space-y-3">
                    <Textarea
                      rows={4}
                      placeholder={t.privateTip.placeholder}
                      value={tipValue}
                      onChange={(e) => setTipValue(e.target.value)}
                      className="border-violet-200 focus-visible:ring-violet-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveTip}
                        disabled={isSavingTip}
                        style={{ backgroundColor: "#7c3aed", color: "white" }}
                        size="sm"
                      >
                        <Save className="w-3.5 h-3.5 me-1.5" />
                        {isSavingTip ? t.privateTip.saving : t.privateTip.save}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingTip(false)}>
                        {t.users.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-violet-50 p-3">
                    {(student as any)?.privateTip ? (
                      <p className="text-sm leading-relaxed text-violet-900 whitespace-pre-wrap">
                        {(student as any).privateTip}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{t.privateTip.none}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── GROWTH PROGRESS TAB — Parent / Admin / Psychologist ── */}
        {canShowGrowthProgress && (
        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5" style={{ color: "#7c3aed" }} />
                {t.growthProgress.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t.growthProgress.subtitle}</p>
            </CardHeader>
            <CardContent>
              {growthSessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <Sprout className="w-8 h-8 opacity-30" />
                  <p className="text-sm">{t.growthProgress.noSessions}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {growthSessions.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-violet-50/40">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">
                          {s.groupName || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" />
                          {s.sessionDate ? format(new Date(s.sessionDate), "PPP") : "—"}
                          {s.durationMinutes && (
                            <span className="ms-2 text-muted-foreground">· {s.durationMinutes} min</span>
                          )}
                        </div>
                        {s.notes && (
                          <div className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{s.notes}</div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {s.status === "present" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" /> {t.growthProgress.status}
                          </span>
                        ) : s.status === "absent" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted border rounded-full px-2 py-0.5">
                            <MinusCircle className="w-3 h-3" /> —
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* ── PAYMENTS TAB — Admin & Accountant only ── */}
        {canManagePayments && (
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" style={{ color: "#1B2E8F" }} />
                  {t.studentProfile.tabPayments}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsPaymentOpen(true)}
                  style={{ backgroundColor: "#1B2E8F", color: "white" }}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.payments.addPayment}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {studentExtra.payments && studentExtra.payments.length > 0 ? (
                <div className="space-y-3">
                  {studentExtra.payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {p.dueDate ? format(new Date(p.dueDate), "MMMM yyyy") : "—"}
                        </div>
                        {p.notes && <div className="text-xs text-muted-foreground truncate">{p.notes}</div>}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {Number(p.amountPaid).toLocaleString()} / {Number(p.amountDue).toLocaleString()} د.ج
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            p.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "overdue"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {t.status[p.status as keyof typeof t.status] ?? p.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1.5 font-semibold border-dashed"
                          style={{ color: "#1B2E8F", borderColor: "#1B2E8F50" }}
                          onClick={() => setEnrollmentReceiptPaymentId(p.id)}
                          title={isRTL ? "طباعة إيصال التسجيل" : "Print Enrollment Receipt"}
                        >
                          <Printer className="w-3 h-3" />
                          <span className="hidden sm:inline">{isRTL ? "إيصال" : "Receipt"}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.payments.noPaymentsFound}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* ── PERFORMANCE REPORT TAB ── */}
        <TabsContent value="report" className="space-y-6">
          {/* Print-only styles */}
          <style>{`
            @media print {
              nav, aside, header, [data-sidebar], .no-print { display: none !important; }
              body { background: white !important; }
              .print-cert { box-shadow: none !important; border: 2px solid #1B2E8F !important; }
            }
          `}</style>

          {/* Header */}
          <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1B2E8F, #7c3aed)" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 opacity-80" />
                <div>
                  <h2 className="text-xl font-bold">{t.report?.title ?? "Performance Report"}</h2>
                  <p className="text-sm opacity-75">{t.report?.subtitle ?? "Linguistic & Behavioral assessment"}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {performanceReports.some((r: any) => r.status === "published") && (
                  <Button
                    variant="outline"
                    className="font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 me-2" />
                    {language === "ar" ? "طباعة / PDF" : "Print / PDF"}
                  </Button>
                )}
                {(currentUser?.role === "admin" || currentUser?.role === "teacher") && !isCreatingReport && !isEditingReport && (
                  <Button
                    style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
                    className="font-semibold"
                    onClick={() => { setNewReportPeriod(""); setNewReportDate(new Date().toISOString().split("T")[0]); setIsCreatingReport(true); }}
                  >
                    <Plus className="w-4 h-4 me-2" />
                    {t.report?.newReport ?? "New Report"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Create new report form */}
          {isCreatingReport && (
            <Card className="border-[#1B2E8F]/20">
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#1B2E8F" }}>{t.report?.newReport ?? "New Report"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.report?.period ?? "Period"} *</label>
                    <Input
                      placeholder={t.report?.periodPlaceholder ?? "e.g. Month 1, Milestone 1"}
                      value={newReportPeriod}
                      onChange={(e) => setNewReportPeriod(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t.report?.reportDate ?? "Report Date"} *</label>
                    <Input type="date" value={newReportDate} onChange={(e) => setNewReportDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingReport(false)}>{t.users.cancel}</Button>
                  <Button
                    style={{ backgroundColor: "#1B2E8F", color: "white" }}
                    onClick={handleCreateReport}
                    disabled={isSavingReport || !newReportPeriod.trim()}
                  >
                    {isSavingReport ? t.groups.saving : (t.report?.create ?? "Create")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit report form */}
          {isEditingReport && editingReportId && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-lg" style={{ color: "#1B2E8F" }}>
                  {newReportPeriod} — {newReportDate}
                </h3>
                <div className="flex gap-2 ms-auto">
                  <Button variant="outline" onClick={() => { setIsEditingReport(false); setEditingReportId(null); }}>
                    {t.users.cancel}
                  </Button>
                  <Button style={{ backgroundColor: "#1B2E8F", color: "white" }} onClick={handleSaveReport} disabled={isSavingReport}>
                    {isSavingReport ? t.groups.saving : t.groups.save}
                  </Button>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t.report?.statusLabel ?? "Status"}:</span>
                <button
                  onClick={() => setReportForm(f => ({ ...f, status: f.status === "draft" ? "published" : "draft" }))}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    reportForm.status === "published"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-amber-100 text-amber-700 border-amber-300"
                  }`}
                >
                  {reportForm.status === "published" ? (t.report?.published ?? "Published") : (t.report?.draft ?? "Draft")}
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* ── Teacher / Linguistic Section ── */}
                {(currentUser?.role === "teacher" || currentUser?.role === "admin") && (
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        <GraduationCap className="w-5 h-5" />
                        {t.report?.linguisticOutcome ?? "Linguistic Outcome"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{t.report?.linguisticSubtitle ?? "Filled by the teacher"}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: "teacherVocabScore", label: t.report?.vocab ?? "Vocabulary" },
                          { key: "teacherStructureScore", label: t.report?.structure ?? "Structure" },
                          { key: "teacherFluencyScore", label: t.report?.fluency ?? "Fluency" },
                        ].map(({ key, label }) => (
                          <div key={key} className="text-center">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setReportForm(f => ({ ...f, [key]: Math.max(1, (f as any)[key] - 1) }))} className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center hover:bg-blue-200">−</button>
                              <span className="w-8 text-center font-bold text-lg" style={{ color: "#1B2E8F" }}>{(reportForm as any)[key]}</span>
                              <button onClick={() => setReportForm(f => ({ ...f, [key]: Math.min(10, (f as any)[key] + 1) }))} className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center hover:bg-blue-200">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Textarea placeholder={t.report?.vocabNotesPlaceholder ?? "Vocabulary notes..."} value={reportForm.teacherVocabNotes} onChange={e => setReportForm(f => ({ ...f, teacherVocabNotes: e.target.value }))} rows={2} className="text-sm" />
                      <Textarea placeholder={t.report?.structureNotesPlaceholder ?? "Structure & grammar notes..."} value={reportForm.teacherStructureNotes} onChange={e => setReportForm(f => ({ ...f, teacherStructureNotes: e.target.value }))} rows={2} className="text-sm" />
                      <Textarea placeholder={t.report?.fluencyNotesPlaceholder ?? "Speaking fluency notes..."} value={reportForm.teacherFluencyNotes} onChange={e => setReportForm(f => ({ ...f, teacherFluencyNotes: e.target.value }))} rows={2} className="text-sm" />
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t.report?.teacherSummaryLabel ?? "Teacher Summary"}</label>
                        <Textarea placeholder={t.report?.teacherSummaryPlaceholder ?? "Overall linguistic summary for this period..."} value={reportForm.teacherSummary} onChange={e => setReportForm(f => ({ ...f, teacherSummary: e.target.value }))} rows={3} className="bg-blue-50 text-sm" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── Psychologist / Behavioral Section ── */}
                {(currentUser?.role === "psychologist" || currentUser?.role === "admin") && (
                  <Card style={{ borderColor: "#7c3aed40" }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2" style={{ color: "#7c3aed" }}>
                        <Brain className="w-5 h-5" />
                        {t.report?.behavioralOutcome ?? "Behavioral Outcome"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{t.report?.behavioralSubtitle ?? "Filled by the psychologist"}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: "fearReductionScore", label: t.report?.fearReduction ?? "Fear Reduction" },
                          { key: "socialInitiativeScore", label: t.report?.socialInitiative ?? "Social Initiative" },
                          { key: "selfConfidenceScore", label: t.report?.selfConfidence ?? "Confidence" },
                        ].map(({ key, label }) => (
                          <div key={key} className="text-center">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setReportForm(f => ({ ...f, [key]: Math.max(1, (f as any)[key] - 1) }))} className="w-6 h-6 rounded font-bold text-sm flex items-center justify-center hover:opacity-80" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>−</button>
                              <span className="w-8 text-center font-bold text-lg" style={{ color: "#7c3aed" }}>{(reportForm as any)[key]}</span>
                              <button onClick={() => setReportForm(f => ({ ...f, [key]: Math.min(10, (f as any)[key] + 1) }))} className="w-6 h-6 rounded font-bold text-sm flex items-center justify-center hover:opacity-80" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Textarea placeholder={t.report?.psychologistNotesPlaceholder ?? "Behavioral observations..."} value={reportForm.psychologistNotes} onChange={e => setReportForm(f => ({ ...f, psychologistNotes: e.target.value }))} rows={4} className="text-sm" />
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7c3aed" }}>{t.report?.psychologistSummaryLabel ?? "Psychologist Summary"}</label>
                        <Textarea placeholder={t.report?.psychologistSummaryPlaceholder ?? "Overall behavioral & emotional summary..."} value={reportForm.psychologistSummary} onChange={e => setReportForm(f => ({ ...f, psychologistSummary: e.target.value }))} rows={3} className="text-sm" style={{ backgroundColor: "#7c3aed08" }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ── Published / Draft Reports list ── */}
          {!isEditingReport && performanceReports.length === 0 && !isCreatingReport && (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart3 className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="font-medium">{t.report?.noReports ?? "No reports yet"}</p>
              <p className="text-sm opacity-70">{t.report?.noReportsHint ?? "Create a report at the end of each month or milestone."}</p>
            </div>
          )}

          {!isEditingReport && performanceReports.map((report: any) => {
            const isPublished = report.status === "published";
            const linguisticAvg = [report.teacherVocabScore, report.teacherStructureScore, report.teacherFluencyScore].filter(Boolean);
            const behavioralAvg = [report.fearReductionScore, report.socialInitiativeScore, report.selfConfidenceScore].filter(Boolean);
            const linguisticScore = linguisticAvg.length ? Math.round(linguisticAvg.reduce((a, b) => a + b, 0) / linguisticAvg.length * 10) : null;
            const behavioralScore = behavioralAvg.length ? Math.round(behavioralAvg.reduce((a, b) => a + b, 0) / behavioralAvg.length * 10) : null;

            const radarData = [
              { subject: t.report?.vocab ?? "Vocab", A: report.teacherVocabScore ?? 0, fullMark: 10 },
              { subject: t.report?.structure ?? "Structure", A: report.teacherStructureScore ?? 0, fullMark: 10 },
              { subject: t.report?.fluency ?? "Fluency", A: report.teacherFluencyScore ?? 0, fullMark: 10 },
              { subject: t.report?.fearReduction ?? "Fear ↓", A: report.fearReductionScore ?? 0, fullMark: 10 },
              { subject: t.report?.socialInitiative ?? "Social", A: report.socialInitiativeScore ?? 0, fullMark: 10 },
              { subject: t.report?.selfConfidence ?? "Confidence", A: report.selfConfidenceScore ?? 0, fullMark: 10 },
            ];

            const isParentView = currentUser?.role === "parent";
            return (
              <div key={report.id} className={`rounded-2xl border overflow-hidden shadow-sm bg-white print:shadow-none print-cert ${isPublished ? "" : "opacity-80"}`}
                style={isPublished && isParentView ? { borderColor: "#1B2E8F30", boxShadow: "0 4px 24px rgba(27,46,143,0.10)" } : {}}>

                {/* Certificate-style header for parents viewing published reports */}
                {isPublished && isParentView && (
                  <div className="px-6 py-5 text-center relative" style={{ background: "linear-gradient(135deg, #1B2E8F, #2a3fa0 50%, #7c3aed)" }}>
                    <div className="absolute top-3 start-4 opacity-30">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute top-3 end-4 opacity-30">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">Kidspeak Academy</p>
                    <h3 className="text-white font-black text-lg mb-0.5">
                      {language === "ar" ? "تقرير الأداء الشامل" : "Comprehensive Performance Report"}
                    </h3>
                    <p className="text-white/70 text-sm">{report.period}</p>
                    <div className="flex justify-center gap-4 mt-3">
                      {linguisticScore != null && (
                        <div className="text-center bg-white/15 rounded-xl px-4 py-2">
                          <div className="font-black text-2xl text-white">{linguisticScore}%</div>
                          <div className="text-[10px] text-white/70 uppercase tracking-wide">{language === "ar" ? "اللغوي" : "Linguistic"}</div>
                        </div>
                      )}
                      {behavioralScore != null && (
                        <div className="text-center bg-white/15 rounded-xl px-4 py-2">
                          <div className="font-black text-2xl text-white">{behavioralScore}%</div>
                          <div className="text-[10px] text-white/70 uppercase tracking-wide">{language === "ar" ? "النفسي" : "Behavioral"}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Standard header for non-parent or unpublished */}
                {(!isPublished || !isParentView) && (
                <div className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap" style={{ background: "linear-gradient(135deg, #1B2E8F08, #7c3aed08)", borderBottom: "1px solid #1B2E8F15" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: "#1B2E8F" }} />
                      <span className="font-bold" style={{ color: "#1B2E8F" }}>{report.period}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {isPublished ? (t.report?.published ?? "Published") : (t.report?.draft ?? "Draft")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.reportDate}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {linguisticScore != null && (
                      <span className="text-xs px-2 py-1 rounded-lg font-bold bg-blue-100 text-blue-700">{t.report?.linguisticShort ?? "Lang"}: {linguisticScore}%</span>
                    )}
                    {behavioralScore != null && (
                      <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>{t.report?.behavioralShort ?? "Beh"}: {behavioralScore}%</span>
                    )}
                    {(currentUser?.role === "admin" || currentUser?.role === "teacher" || currentUser?.role === "psychologist") && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditReport(report)}>
                        <PenLine className="w-3 h-3 me-1" />{t.groups.editSession}
                      </Button>
                    )}
                  </div>
                </div>
                )}

                {/* Only show full report if published or user is staff */}
                {(isPublished || currentUser?.role !== "parent") && (
                  <div className="p-5 grid gap-5 lg:grid-cols-3">
                    {/* Radar */}
                    {radarData.some(d => d.A > 0) && (
                      <div className="lg:col-span-1 flex flex-col items-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{t.report?.profileRadar ?? "Skill Profile"}</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
                            <Radar name="Score" dataKey="A" stroke="#1B2E8F" fill="#1B2E8F" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Linguistic section */}
                    <div className="lg:col-span-1 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm text-blue-700">{t.report?.linguisticOutcome ?? "Linguistic Outcome"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { v: report.teacherVocabScore, label: t.report?.vocab ?? "Vocab" },
                          { v: report.teacherStructureScore, label: t.report?.structure ?? "Structure" },
                          { v: report.teacherFluencyScore, label: t.report?.fluency ?? "Fluency" },
                        ].map(({ v, label }, i) => (
                          v != null ? (
                            <div key={i} className="text-center rounded-xl bg-blue-50 border border-blue-100 py-2">
                              <div className="font-black text-xl text-blue-700">{v}<span className="text-xs font-normal">/10</span></div>
                              <div className="text-[10px] text-muted-foreground">{label}</div>
                            </div>
                          ) : null
                        ))}
                      </div>
                      {report.teacherSummary && (
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-gray-700 leading-relaxed">
                          "{report.teacherSummary}"
                          {report.teacherName && <p className="text-xs text-muted-foreground mt-1">— {report.teacherName}</p>}
                        </div>
                      )}
                    </div>

                    {/* Behavioral section */}
                    <div className="lg:col-span-1 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" style={{ color: "#7c3aed" }} />
                        <span className="font-semibold text-sm" style={{ color: "#7c3aed" }}>{t.report?.behavioralOutcome ?? "Behavioral Outcome"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { v: report.fearReductionScore, label: t.report?.fearReduction ?? "Fear ↓" },
                          { v: report.socialInitiativeScore, label: t.report?.socialInitiative ?? "Social" },
                          { v: report.selfConfidenceScore, label: t.report?.selfConfidence ?? "Confidence" },
                        ].map(({ v, label }, i) => (
                          v != null ? (
                            <div key={i} className="text-center rounded-xl border py-2" style={{ backgroundColor: "#7c3aed10", borderColor: "#7c3aed20" }}>
                              <div className="font-black text-xl" style={{ color: "#7c3aed" }}>{v}<span className="text-xs font-normal">/10</span></div>
                              <div className="text-[10px] text-muted-foreground">{label}</div>
                            </div>
                          ) : null
                        ))}
                      </div>
                      {report.psychologistSummary && (
                        <div className="rounded-xl border p-3 text-sm text-gray-700 leading-relaxed" style={{ backgroundColor: "#7c3aed08", borderColor: "#7c3aed20" }}>
                          "{report.psychologistSummary}"
                          {report.psychologistName && <p className="text-xs text-muted-foreground mt-1">— {report.psychologistName}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parent: show "pending" message for drafts */}
                {!isPublished && currentUser?.role === "parent" && (
                  <div className="px-5 py-4 text-sm text-muted-foreground italic flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t.report?.reportPending ?? "This report is being prepared by your child's specialist team."}
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* ── THE KIDSPEAK METHOD TAB (parent only) ── */}
        {currentUser?.role === "parent" && (
          <TabsContent value="method" className="space-y-6">
            {/* Hero banner */}
            <div
              className="rounded-2xl p-8 text-white text-center"
              style={{ background: "linear-gradient(135deg, #0f1c5c, #1B2E8F 50%, #7c3aed)" }}
            >
              <div className="text-5xl mb-4">🗣️</div>
              <h2 className="text-2xl font-black mb-2">{t.method?.title ?? "The Kidspeak Method"}</h2>
              <p className="text-white/70 max-w-lg mx-auto">{t.method?.subtitle ?? "We believe every child can speak English with confidence. Here's how we make it happen."}</p>
            </div>

            {/* Philosophy quote */}
            <div className="rounded-2xl border-2 border-[#F5A600]/40 bg-[#FFF8E8] p-6 text-center">
              <p className="text-xl font-bold text-gray-800 leading-relaxed italic">
                "{t.method?.quote ?? "Grades are not the language. Speaking is the language."}"
              </p>
              <p className="text-sm text-[#b37800] mt-2 font-semibold">— Kidspeak Philosophy</p>
            </div>

            {/* Speaking-First approach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "#1B2E8F" }}>
                  <Mic className="w-5 h-5" />
                  {t.method?.speakingFirstTitle ?? "Speaking-First Approach"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {t.method?.speakingFirstDesc ?? "Traditional English education teaches grammar and vocabulary first — and hopes that speaking will come naturally. We do the opposite. Like a baby learns to speak before they can read or write, Kidspeak puts speaking at the center of everything."}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: "👂", label: t.method?.step1 ?? "Listen", desc: t.method?.step1Desc ?? "Children immerse in authentic English sounds and rhythms" },
                    { icon: "🗣️", label: t.method?.step2 ?? "Imitate", desc: t.method?.step2Desc ?? "Confident repetition without fear of judgment" },
                    { icon: "💬", label: t.method?.step3 ?? "Speak", desc: t.method?.step3Desc ?? "Real conversations in a safe, encouraging environment" },
                    { icon: "📚", label: t.method?.step4 ?? "Read & Write", desc: t.method?.step4Desc ?? "Literacy builds naturally on a speaking foundation" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border">
                      <span className="text-2xl shrink-0">{step.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Psychological support */}
            <Card style={{ borderColor: "#7c3aed30" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "#7c3aed" }}>
                  <Brain className="w-5 h-5" />
                  {t.method?.psychSupportTitle ?? "Psychological Support"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {t.method?.psychSupportDesc ?? "Fear is the number one barrier to speaking a language. Our resident psychologist works alongside every teacher to systematically reduce anxiety, build self-confidence, and ensure each child feels safe enough to take the risk of speaking."}
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { emoji: "😰→😊", label: t.method?.fearReductionLabel ?? "Fear Reduction", desc: t.method?.fearReductionDesc ?? "From freeze to fluency" },
                    { emoji: "🤝", label: t.method?.socialLabel ?? "Social Initiative", desc: t.method?.socialDesc ?? "Building communication courage" },
                    { emoji: "⭐", label: t.method?.confidenceLabel ?? "Self-Confidence", desc: t.method?.confidenceDesc ?? "Every child is a star" },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 rounded-xl border" style={{ borderColor: "#7c3aed20", backgroundColor: "#7c3aed05" }}>
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <p className="font-semibold text-sm" style={{ color: "#7c3aed" }}>{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 4 Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "#1B2E8F" }}>
                  <GraduationCap className="w-5 h-5" />
                  {t.method?.levelsTitle ?? "The 4 Levels to Fluency"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { num: "01", color: "#F5A600", label: t.method?.level1 ?? "Foundation", desc: t.method?.level1Desc ?? "Listening & Basic Sounds — building the ear for English" },
                    { num: "02", color: "#f97316", label: t.method?.level2 ?? "Discovery", desc: t.method?.level2Desc ?? "Core Vocabulary & Phrases — first real conversations" },
                    { num: "03", color: "#7c3aed", label: t.method?.level3 ?? "Expression", desc: t.method?.level3Desc ?? "Real Conversations — speaking with confidence" },
                    { num: "04", color: "#1B2E8F", label: t.method?.level4 ?? "Mastery", desc: t.method?.level4Desc ?? "Fluency & Public Speaking — the talk show moment" },
                  ].map((level, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow">
                      <span className="text-2xl font-black shrink-0" style={{ color: level.color }}>
                        {level.num}
                      </span>
                      <div>
                        <p className="font-bold text-sm" style={{ color: level.color }}>{level.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{level.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-[#1B2E8F08] border border-[#1B2E8F15] p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.method?.levelNote ?? "Each level is an 8-week journey of transformation. Your child progresses at their natural pace."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Encouragement */}
            <div className="rounded-2xl border-2 border-[#F5A600]/40 p-6 flex items-start gap-4" style={{ backgroundColor: "#FFF8E8" }}>
              <span className="text-4xl shrink-0">🌟</span>
              <div>
                <p className="font-bold" style={{ color: "#b37800" }}>{t.method?.encouragementTitle ?? "You are your child's greatest support"}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {t.method?.encouragementDesc ?? "Celebrate every small win at home. When your child uses a word of English — even one word — celebrate it. That encouragement is the fuel that keeps them speaking."}
                </p>
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── CHARACTER TAB (parent only) ── */}
        {currentUser?.role === "parent" && (
          <TabsContent value="character" className="space-y-6">
            {/* Header */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #1B2E8F)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🧠</span>
                <div>
                  <h2 className="text-xl font-bold">{t.character.tabTitle}</h2>
                  <p className="text-sm opacity-80">{t.character.subtitle}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[
                  { emoji: "💬", label: language === "ar" ? "الطلاقة الكلامية" : "Verbal Fluency" },
                  { emoji: "👁️", label: language === "ar" ? "التواصل البصري" : "Eye Contact" },
                  { emoji: "🤸", label: language === "ar" ? "لغة الجسد" : "Body Language" },
                  { emoji: "⭐", label: language === "ar" ? "تعابير الوجه" : "Facial Expressions" },
                ].map((pill, i) => (
                  <span key={i} className="bg-white/15 rounded-full px-3 py-1 flex items-center gap-1">
                    {pill.emoji} {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Booster of Confidence — Communication Radar (Featured) */}
            <div
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: "#7c3aed40", boxShadow: "0 4px 24px rgba(124,58,237,0.12)" }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: "linear-gradient(90deg, #7c3aed10, #1B2E8F08)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📡</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#7c3aed" }}>
                      {language === "ar" ? "مؤشر النمو النفسي" : "Psychological Growth Radar"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "يعكس تقدم طفلك في التواصل والثقة — يُحدَّث كل شهر"
                        : "Tracks your child's growth in communication & confidence — updated monthly"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "#7c3aed15", color: "#7c3aed" }}>
                  {language === "ar" ? "من 10" : "/ 10"}
                </span>
              </div>
              <div className="p-4 bg-white">
                <CommunicationRadar studentId={studentId} />
              </div>
            </div>

            {/* Learning Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  {t.character.learningProfileTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t.character.learningProfileSubtitle}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentExtra.learningDisabilities ? (
                  <div className="flex flex-wrap gap-2">
                    {studentExtra.learningDisabilities.split(",").map((k: string) => k.trim()).filter(Boolean).map((key: string) => {
                      const parentLabels: Record<string, { en: string; ar: string; emoji: string }> = {
                        dyslexia: { en: "Reading differences", ar: "صعوبات القراءة", emoji: "📖" },
                        adhd: { en: "High energy & focus", ar: "طاقة عالية وتركيز", emoji: "⚡" },
                        speechDelay: { en: "Speech development", ar: "تطوير الكلام", emoji: "💬" },
                        dyscalculia: { en: "Numbers learning style", ar: "أسلوب تعلم الأرقام", emoji: "🔢" },
                        dysgraphia: { en: "Writing style", ar: "أسلوب الكتابة", emoji: "✏️" },
                        processingDisorder: { en: "Thoughtful processor", ar: "معالجة متأنية", emoji: "🧩" },
                        autism: { en: "Unique perspective", ar: "منظور فريد", emoji: "⭐" },
                        anxiety: { en: "Emotionally sensitive", ar: "حساسية عاطفية", emoji: "🌸" },
                      };
                      const info = parentLabels[key];
                      return info ? (
                        <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-violet-50 border-violet-100">
                          <span className="text-xl">{info.emoji}</span>
                          <span className="text-sm font-medium text-violet-800">{info.en}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.character.noDifficultiesParent}</p>
                )}

                {/* Encouragement note */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🌟</span>
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">
                    {t.character.encouragement}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Observation Dialog */}
      <Dialog open={isObsOpen} onOpenChange={setIsObsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t.behavioral.addObservation} — {student.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.behavioral.observationType}</label>
              <Select value={obsType} onValueChange={(v) => setObsType(v as ObsType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["fear", "shyness", "participation", "general"] as ObsType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t.behavioral.types[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.behavioral.observationContent}</label>
              <Textarea
                placeholder={t.behavioral.writeObservation}
                value={obsContent}
                onChange={(e) => setObsContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t.users.cancel}</Button>
            </DialogClose>
            <Button
              style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
              className="font-semibold"
              onClick={handleCreateObs}
              disabled={isCreating || !obsContent.trim()}
            >
              {isCreating ? t.behavioral.saving : t.behavioral.saveObservation}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Payment Dialog (admin / accountant only) ── */}
      {canManagePayments && (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: "#1B2E8F" }} />
                {t.payments.addPayment} — {student.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Amount Due */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t.payments.amountDue} (DZD)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paymentForm.amountDue}
                    onChange={e => setPaymentForm(f => ({ ...f, amountDue: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t.payments.amountPaid} (DZD)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paymentForm.amountPaid}
                    onChange={e => setPaymentForm(f => ({ ...f, amountPaid: e.target.value }))}
                  />
                </div>
              </div>
              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.payments.dueDate}</label>
                <Input
                  type="date"
                  value={paymentForm.dueDate}
                  onChange={e => setPaymentForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.payments.status}</label>
                <Select
                  value={paymentForm.status}
                  onValueChange={v => setPaymentForm(f => ({ ...f, status: v as typeof paymentForm.status }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.status.pending}</SelectItem>
                    <SelectItem value="paid">{t.status.paid}</SelectItem>
                    <SelectItem value="partially_paid">{t.status.partially_paid}</SelectItem>
                    <SelectItem value="overdue">{t.status.overdue}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.payments.notes}</label>
                <Input
                  placeholder={t.payments.optionalNotes}
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSavingPayment}>{t.users.cancel}</Button>
              </DialogClose>
              <Button
                style={{ backgroundColor: "#F5A600", color: "#1B2E8F" }}
                className="font-semibold"
                onClick={handleAddPayment}
                disabled={isSavingPayment || !paymentForm.amountDue || !paymentForm.dueDate}
              >
                {isSavingPayment ? t.payments.updating : t.payments.addPayment}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Pupil Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              {t.students.deletePupil}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {t.students.deletePupilConfirm}
          </p>
          {student && (
            <p className="text-sm font-semibold rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700">
              {student.name}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t.users.cancel}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                deleteStudent({ studentId: studentId.toString() }, {
                  onSuccess: () => {
                    toast({ title: t.students.deletePupilSuccess });
                    navigate("/students");
                  },
                  onError: () => {
                    toast({ title: "Failed to delete pupil", variant: "destructive" });
                  },
                });
              }}
            >
              {isDeleting ? "Deleting…" : t.students.deletePupil}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {enrollmentReceiptPaymentId !== null && (
        <EnrollmentReceiptModal
          paymentId={enrollmentReceiptPaymentId}
          onClose={() => setEnrollmentReceiptPaymentId(null)}
          isAr={language === "ar"}
        />
      )}
    </div>
  );
}
