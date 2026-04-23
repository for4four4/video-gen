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
  await sleep();
  const days = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return {
    visits: { total: 12480, change: 18, series: seriesMock(days, 400) },
    users: { total: 342, change: 24, series: seriesMock(days, 12) },
    generations: { total: 5218, change: 312, series: seriesMock(days, 170) },
    revenueRub: { total: 184200, change: 12, series: seriesMock(days, 6000) },
  };
}

/** GET /admin/users */
export async function fetchUsers(): Promise<UserRow[]> {
  await sleep();
  return [
    { id: "u_01", email: "ivanov@mail.ru", createdAt: "2025-04-10", pointsBalance: 1240, totalSpentRub: 3000, generations: 84, status: "active" },
    { id: "u_02", email: "anna.k@gmail.com", createdAt: "2025-04-12", pointsBalance: 50, totalSpentRub: 0, generations: 6, status: "active" },
    { id: "u_03", email: "designer@studio.ru", createdAt: "2025-03-28", pointsBalance: 8420, totalSpentRub: 12000, generations: 412, status: "active" },
    { id: "u_04", email: "spammer@x.io", createdAt: "2025-04-20", pointsBalance: 0, totalSpentRub: 0, generations: 0, status: "blocked" },
  ];
}

/** PATCH /admin/users/:id  body: { status } */
export async function updateUser(id: string, patch: Partial<Pick<UserRow, "status" | "pointsBalance">>): Promise<void> {
  await sleep();
  console.info("[stub] PATCH /admin/users", id, patch);
}

/** GET /admin/payments */
export async function fetchPayments(): Promise<PaymentRow[]> {
  await sleep();
  return [
    { id: "p_101", userEmail: "ivanov@mail.ru", amountRub: 1000, points: 1000, status: "succeeded", createdAt: "2025-04-23", provider: "manual" },
    { id: "p_102", userEmail: "anna.k@gmail.com", amountRub: 500, points: 500, status: "succeeded", createdAt: "2025-04-22", provider: "manual" },
    { id: "p_103", userEmail: "designer@studio.ru", amountRub: 5000, points: 5000, status: "succeeded", createdAt: "2025-04-21", provider: "manual" },
    { id: "p_104", userEmail: "test@test.ru", amountRub: 300, points: 300, status: "pending", createdAt: "2025-04-23", provider: "manual" },
    { id: "p_105", userEmail: "fail@x.ru", amountRub: 1000, points: 0, status: "failed", createdAt: "2025-04-20", provider: "manual" },
  ];
}

/** GET /admin/models  — синхронизирует с polza.ai и применяет коэффициенты */
export async function fetchModelCoefficients(): Promise<ModelCoefficient[]> {
  await sleep();
  const raw: Omit<ModelCoefficient, "pointsPrice">[] = [
    { slug: "midjourney-v7", name: "Midjourney v7", vendor: "Midjourney", type: "image", basePriceUsd: 0.08, coefficient: 1.5, enabled: true },
    { slug: "flux-pro", name: "Flux Pro", vendor: "Black Forest Labs", type: "image", basePriceUsd: 0.05, coefficient: 1.6, enabled: true },
    { slug: "dalle-3", name: "DALL·E 3", vendor: "OpenAI", type: "image", basePriceUsd: 0.04, coefficient: 1.5, enabled: true },
    { slug: "stable-diffusion-3", name: "Stable Diffusion 3", vendor: "Stability AI", type: "image", basePriceUsd: 0.02, coefficient: 1.7, enabled: true },
    { slug: "sora", name: "Sora", vendor: "OpenAI", type: "video", basePriceUsd: 0.50, coefficient: 1.4, enabled: true },
    { slug: "kling-1-6", name: "Kling 1.6", vendor: "Kuaishou", type: "video", basePriceUsd: 0.35, coefficient: 1.5, enabled: true },
    { slug: "runway-gen3", name: "Runway Gen-3", vendor: "Runway", type: "video", basePriceUsd: 0.40, coefficient: 1.5, enabled: true },
    { slug: "luma-dream", name: "Luma Dream", vendor: "Luma Labs", type: "video", basePriceUsd: 0.30, coefficient: 1.5, enabled: false },
  ];
  return raw.map(m => ({ ...m, pointsPrice: Math.round(m.basePriceUsd * 100 * m.coefficient) }));
}

/** PATCH /admin/models/:slug  body: { coefficient?, enabled? } */
export async function updateModel(slug: string, patch: Partial<Pick<ModelCoefficient, "coefficient" | "enabled">>): Promise<void> {
  await sleep();
  console.info("[stub] PATCH /admin/models", slug, patch);
}

/** POST /admin/models/sync  — pull актуальные цены с polza.ai */
export async function syncModelsFromPolza(): Promise<{ updated: number }> {
  await sleep(800);
  console.info("[stub] POST /admin/models/sync → polza.ai");
  return { updated: 8 };
}

/** GET /admin/generations */
export async function fetchGenerations(): Promise<GenerationLog[]> {
  await sleep();
  return [
    { id: "g_1", userEmail: "ivanov@mail.ru", modelSlug: "midjourney-v7", pointsSpent: 12, status: "success", createdAt: "2025-04-23T10:12:00Z" },
    { id: "g_2", userEmail: "designer@studio.ru", modelSlug: "sora", pointsSpent: 70, status: "success", createdAt: "2025-04-23T09:50:00Z" },
    { id: "g_3", userEmail: "anna.k@gmail.com", modelSlug: "flux-pro", pointsSpent: 8, status: "failed", createdAt: "2025-04-23T09:30:00Z" },
    { id: "g_4", userEmail: "designer@studio.ru", modelSlug: "kling-1-6", pointsSpent: 52, status: "running", createdAt: "2025-04-23T09:25:00Z" },
  ];
}

/** GET /admin/settings */
export async function fetchSettings(): Promise<AdminSettings> {
  await sleep();
  return {
    pointToRubRate: 1,
    signupBonusPoints: 50,
    minTopUpPoints: 100,
    polzaApiBaseUrl: "https://api.polza.ai/v1",
  };
}

/** PUT /admin/settings */
export async function updateSettings(patch: Partial<AdminSettings>): Promise<void> {
  await sleep();
  console.info("[stub] PUT /admin/settings", patch);
}
