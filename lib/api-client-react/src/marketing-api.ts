import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export type CampaignType = "open_day" | "early_registration" | "summer_school" | "custom";
export type CampaignStatus = "active" | "paused" | "ended";
export type LeadStatus = "new" | "contacted" | "interested" | "registered" | "not_interested";
export type LeadSource = "whatsapp" | "form" | "call" | "other";

export interface Campaign {
  id: number;
  name: string;
  nameAr: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  ctaType: "whatsapp" | "form" | "call";
  whatsappNumber: string | null;
  description: string | null;
  descriptionAr: string | null;
  slug: string;
  branchId: number | null;
  assignedTo: number | null;
  createdAt: string;
  leadsCount: number;
  newLeadsCount: number;
  registeredCount: number;
  conversionRate: number | null;
  assignee: { id: number; name: string } | null;
  landingPageEnabled: boolean;
  landingPageTitle: string | null;
  landingPageSubtitle: string | null;
  landingPageColor: string | null;
}

export interface Lead {
  id: number;
  campaignId: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  childName: string;
  childAge: string | null;
  preferredLevel: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  followUpDate: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignExpense {
  id: number;
  campaignId: number;
  description: string;
  amount: number;
  category: string;
  createdAt: string;
}

export interface ROIData {
  registeredLeads: { id: number; childName: string; preferredLevel: string | null }[];
  expenses: CampaignExpense[];
  levels: { id: number; name: string; price: number }[];
  totalExpenses: number;
  registeredCount: number;
}

export interface CreateCampaignBody {
  name: string;
  nameAr: string;
  type: CampaignType;
  startDate: string;
  endDate: string;
  ctaType: "whatsapp" | "form" | "call";
  whatsappNumber?: string;
  description?: string;
  descriptionAr?: string;
  branchId?: number;
  assignedTo?: number;
  landingPageEnabled?: boolean;
  landingPageTitle?: string;
  landingPageSubtitle?: string;
  landingPageColor?: string;
}

export interface CreateLeadBody {
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  childName: string;
  childAge?: string;
  preferredLevel?: string;
  source?: LeadSource;
  notes?: string;
  followUpDate?: string;
  assignedTo?: number;
}

export interface UpdateLeadBody {
  status?: LeadStatus;
  notes?: string;
  followUpDate?: string;
  assignedTo?: number;
}

// ── Campaign hooks ─────────────────────────────────────────────────────────────

export const useListCampaigns = () =>
  useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => customFetch("/api/campaigns"),
  });

export const useGetCampaign = (id: number) =>
  useQuery<Campaign>({
    queryKey: ["campaigns", id],
    queryFn: () => customFetch(`/api/campaigns/${id}`),
    enabled: id > 0,
  });

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCampaignBody) =>
      customFetch<Campaign>("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

export const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<CreateCampaignBody> & { id: number; status?: CampaignStatus }) =>
      customFetch<Campaign>(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

export const useDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/campaigns/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
};

// ── Lead hooks (campaign-scoped) ───────────────────────────────────────────────

export const useListLeads = (campaignId: number) =>
  useQuery<Lead[]>({
    queryKey: ["campaigns", campaignId, "leads"],
    queryFn: () => customFetch(`/api/campaigns/${campaignId}/leads`),
    enabled: campaignId > 0,
  });

export const useAddLead = (campaignId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLeadBody) =>
      customFetch<Lead>(`/api/campaigns/${campaignId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "leads"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useUpdateLead = (campaignId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateLeadBody & { id: number }) =>
      customFetch<Lead>(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      if (campaignId) qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "leads"] });
      qc.invalidateQueries({ queryKey: ["leads", "standalone"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useDeleteLead = (campaignId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      if (campaignId) qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "leads"] });
      qc.invalidateQueries({ queryKey: ["leads", "standalone"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

// ── Standalone lead hooks ──────────────────────────────────────────────────────

export const useListStandaloneLeads = () =>
  useQuery<Lead[]>({
    queryKey: ["leads", "standalone"],
    queryFn: () => customFetch("/api/leads"),
  });

export const useAddStandaloneLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLeadBody) =>
      customFetch<Lead>("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads", "standalone"] }),
  });
};

// ── ROI hooks ─────────────────────────────────────────────────────────────────

export const useGetCampaignROI = (campaignId: number) =>
  useQuery<ROIData>({
    queryKey: ["campaigns", campaignId, "roi"],
    queryFn: () => customFetch(`/api/campaigns/${campaignId}/roi`),
    enabled: campaignId > 0,
  });

export const useAddCampaignExpense = (campaignId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { description: string; amount: number; category: string }) =>
      customFetch<CampaignExpense>(`/api/campaigns/${campaignId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "roi"] }),
  });
};

export const useDeleteCampaignExpense = (campaignId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/campaigns/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "roi"] }),
  });
};

export interface ConvertLeadBody {
  name: string;
  gender?: string;
  dateOfBirth?: string;
  levelId?: number;
  branchId?: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianPhone2?: string;
  notes?: string;
  enrollmentDate?: string;
}

export const useConvertLeadToStudent = (campaignId: number | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, ...body }: ConvertLeadBody & { leadId: number }) =>
      customFetch<{ success: boolean; student: any; payment: any }>(
        `/api/leads/${leadId}/convert-to-student`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      ),
    onSuccess: () => {
      if (campaignId) {
        qc.invalidateQueries({ queryKey: ["campaigns", campaignId, "leads"] });
        qc.invalidateQueries({ queryKey: ["campaigns"] });
      }
      qc.invalidateQueries({ queryKey: ["standalone-leads"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
