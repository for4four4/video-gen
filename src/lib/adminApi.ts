// Заглушки API для админ-панели.
// После подключения Lovable Cloud замените реализации на реальные вызовы edge-функций / БД.
// Контракты намеренно описаны явно, чтобы фронт не пришлось переписывать.

export type Range = "24h" | "7d" | "30d" | "90d";

export interface MetricPoint {
  date: string; // ISO
  value: number;
}

export interface OverviewMetrics {
  visits: { total: number; change: number; series: MetricPoint[] };
  users: { total: number; change: number; series: MetricPoint[] };
  generations: { total: number; change: number; series: MetricPoint[] };
  revenueRub: { total: number; change: number; series: MetricPoint[] };
}

export interface UserRow {
  id: string;
  email: string;
  createdAt: string;
  pointsBalance: number;
  totalSpentRub: number;
  generations: number;
  status: "active" | "blocked";
}

export interface PaymentRow {
  id: string;
  userEmail: string;
  amountRub: number;
  points: number;
  status: "succeeded" | "pending" | "failed";
  createdAt: string;
  provider: "manual" | "yookassa" | "stripe";
}

export interface ModelCoefficient {
  slug: string;
  name: string;
  vendor: string;
  type: "image" | "video";
  basePriceUsd: number; // приходит из polza.ai
  coefficient: number; // редактируется админом
  pointsPrice: number; // расчётное
  enabled: boolean;
}

export interface GenerationLog {
  id: string;
  userEmail: string;
  modelSlug: string;
  pointsSpent: number;
  status: "success" | "failed" | "running";
  createdAt: string;
}

export interface AdminSettings {
  pointToRubRate: number; // 1 поинт = N рублей
  signupBonusPoints: number;
  minTopUpPoints: number;
  polzaApiBaseUrl: string;
}

// ── Заглушечные данные ───────────────────────────────────────────────────────
const sleep = (ms = 300) => new Promise(r => setTimeout(r, ms));

const seriesMock = (n: number, base: number) =>
  Array.from({ length: n }, (_, i) => ({
    date: new Date(Date.now() - (n - i) * 86_400_000).toISOString(),
    value: Math.round(base + Math.sin(i / 2) * base * 0.2 + Math.random() * base * 0.1),
  }));

// ── Endpoints ────────────────────────────────────────────────────────────────

/** GET /admin/overview?range=30d */
export async function fetchOverview(range: Range = "30d"): Promise<OverviewMetrics> {
  const response = await fetch(`/api/admin/overview?range=${range}`);
  if (!response.ok) {
    throw new Error('Failed to fetch overview');
  }
  return response.json();
}

/** GET /admin/users */
export async function fetchUsers(): Promise<UserRow[]> {
  const response = await fetch('/api/admin/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

/** PATCH /admin/users/:id  body: { status } */
export async function updateUser(id: string, patch: Partial<Pick<UserRow, "status" | "pointsBalance">>): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error('Update failed');
  }
}

/** GET /admin/payments */
export async function fetchPayments(): Promise<PaymentRow[]> {
  const response = await fetch('/api/admin/payments');
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }
  return response.json();
}

/** GET /admin/models  — синхронизирует с polza.ai и применяет коэффициенты */
export async function fetchModelCoefficients(): Promise<ModelCoefficient[]> {
  await sleep();
  const response = await fetch('/api/admin/models');
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }
  return response.json();
}

/** POST /admin/models/sync  — pull актуальные цены с polza.ai */
export async function syncModelsFromPolza(): Promise<{ updated: number }> {
  await sleep(800);
  const response = await fetch('/api/admin/models/sync', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  return response.json();
}

/** GET /admin/generations */
export async function fetchGenerations(): Promise<GenerationLog[]> {
  const response = await fetch('/api/admin/generations');
  if (!response.ok) {
    throw new Error('Failed to fetch generations');
  }
  return response.json();
}

/** GET /admin/settings */
export async function fetchSettings(): Promise<AdminSettings> {
  const response = await fetch('/api/admin/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

/** PUT /admin/settings */
export async function updateSettings(patch: Partial<AdminSettings>): Promise<void> {
  const response = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error('Update failed');
  }
}

/** PATCH /admin/models/:slug  body: { coefficient?, enabled? } */
export async function updateModel(slug: string, patch: Partial<Pick<ModelCoefficient, "coefficient" | "enabled">>): Promise<void> {
  const response = await fetch(`/api/admin/models/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error('Update failed');
  }
}
