// src/lib/adminApi.ts

export type Range = "24h" | "7d" | "30d" | "90d";

export interface MetricPoint { date: string; value: number; }

export interface OverviewMetrics {
  visits: { total: number; change: number; series: MetricPoint[] };
  users: { total: number; change: number; series: MetricPoint[] };
  generations: { total: number; change: number; series: MetricPoint[] };
  revenueRub: { total: number; change: number; series: MetricPoint[] };
}

export interface UserRow {
  id: string; email: string; createdAt: string;
  pointsBalance: number; totalSpentRub: number;
  generations: number; status: "active" | "blocked";
}

export interface PaymentRow {
  id: string; userEmail: string; amountRub: number; points: number;
  status: "succeeded" | "pending" | "failed";
  createdAt: string; provider: "manual" | "yookassa" | "stripe";
}

export interface ModelCoefficient {
  slug: string; name: string; vendor: string; type: "image" | "video";
  basePriceUsd: number; coefficient: number; pointsPrice: number; enabled: boolean;
  iconUrl?: string; coverImage?: string;
}

export interface GenerationLog {
  id: string; userEmail: string; modelSlug: string;
  pointsSpent: number; status: "success" | "failed" | "running"; createdAt: string;
}

export interface AdminSettings {
  pointToRubRate: number; signupBonusPoints: number;
  minTopUpPoints: number; polzaApiBaseUrl: string;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const adminFetch = async (path: string, method = 'GET', body?: any) => {
  const token = getToken();
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (method === 'DELETE') return;
  return res.json();
};

// ── API ───────────────────────────────────────────────────────────────────────

export const fetchOverview = (range: Range = '30d'): Promise<OverviewMetrics> =>
  adminFetch(`/overview?range=${range}`);

export const fetchUsers = (): Promise<UserRow[]> => adminFetch('/users');

export const updateUser = (id: string, patch: Partial<Pick<UserRow, 'status' | 'pointsBalance'>>) =>
  adminFetch(`/users/${id}`, 'PATCH', patch);

export const fetchPayments = (): Promise<PaymentRow[]> => adminFetch('/payments');

export const fetchModelCoefficients = (): Promise<ModelCoefficient[]> => adminFetch('/models');

export const syncModelsFromPolza = (): Promise<{ updated: number }> =>
  adminFetch('/models/sync', 'POST');

export const fetchGenerations = (): Promise<GenerationLog[]> => adminFetch('/generations');

export const fetchSettings = (): Promise<AdminSettings> => adminFetch('/settings');

export const updateSettings = (patch: Partial<AdminSettings>) =>
  adminFetch('/settings', 'PUT', patch);

export const updateModel = (slug: string, patch: { coefficient?: number; enabled?: boolean; icon_url?: string; cover_image?: string }) =>
  adminFetch(`/models/${slug}`, 'PATCH', patch);

// File upload helper — uses FormData
export const uploadFile = async (file: File): Promise<string> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/admin/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.url;
};
