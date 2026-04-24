// src/lib/api.ts — единый клиент для публичных API эндпоинтов

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/api$/, '') || '';
const API = `${API_BASE}/api`;

const getToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function authGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tag: 'release' | 'update' | 'platform';
  model_name?: string;
  cover_image?: string;
  seo_title?: string;
  seo_description?: string;
  published: boolean;
  published_at: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_minutes: number;
  cover_image?: string;
  featured: boolean;
  published: boolean;
  published_at: string;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  points: number;
  price_rub: number;
  bonus_points: number;
  popular: boolean;
}

export interface ModelFromDB {
  slug: string;
  id: string;
  name: string;
  vendor: string;
  type: 'image' | 'video';
  base_price_rub: number;
  coefficient: number;
  price_points: number;
  description?: string;
  short_description?: string;
  featured: boolean;
  speed: string;
  popularity: number;
  input_modalities: string;
  output_modalities: string;
  parameters_json: string;
}

export interface ModelExample {
  id: string;
  image_url: string;
  prompt?: string;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const getNewsList = () => get<NewsItem[]>('/news');
export const getNewsItem = (slug: string) => get<NewsItem>(`/news/${slug}`);

export const getBlogList = () => get<BlogPost[]>('/blog');
export const getBlogPost = (slug: string) => get<BlogPost>(`/blog/${slug}`);

export const getPricingPlans = () => get<PricingPlan[]>('/pricing');

export const getModels = (type?: 'image' | 'video', search?: string) => {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (search) params.set('search', search);
  const qs = params.toString();
  return get<ModelFromDB[]>(`/models${qs ? `?${qs}` : ''}`);
};

export const getModelExamples = (slug: string) =>
  get<ModelExample[]>(`/models/${slug}/examples`);

// ── Admin API ─────────────────────────────────────────────────────────────────

const adminFetch = async (path: string, method = 'GET', body?: any) => {
  const res = await fetch(`${API}/admin${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (method === 'DELETE') return;
  return res.json();
};

// News admin
export const adminGetNews = () => adminFetch('/news');
export const adminGetNewsItem = (id: string) => adminFetch(`/news/${id}`);
export const adminCreateNews = (data: Partial<NewsItem>) => adminFetch('/news', 'POST', data);
export const adminUpdateNews = (id: string, data: Partial<NewsItem>) => adminFetch(`/news/${id}`, 'PUT', data);
export const adminDeleteNews = (id: string) => adminFetch(`/news/${id}`, 'DELETE');

// Blog admin
export const adminGetBlog = () => adminFetch('/blog');
export const adminGetBlogPost = (id: string) => adminFetch(`/blog/${id}`);
export const adminCreateBlogPost = (data: Partial<BlogPost>) => adminFetch('/blog', 'POST', data);
export const adminUpdateBlogPost = (id: string, data: Partial<BlogPost>) => adminFetch(`/blog/${id}`, 'PUT', data);
export const adminDeleteBlogPost = (id: string) => adminFetch(`/blog/${id}`, 'DELETE');

// Pricing admin
export const adminGetPricing = () => adminFetch('/pricing');
export const adminCreatePlan = (data: Partial<PricingPlan>) => adminFetch('/pricing', 'POST', data);
export const adminUpdatePlan = (id: string, data: Partial<PricingPlan>) => adminFetch(`/pricing/${id}`, 'PUT', data);
export const adminDeletePlan = (id: string) => adminFetch(`/pricing/${id}`, 'DELETE');

// Model examples admin
export const adminGetModelExamples = (slug: string) => adminFetch(`/models/${slug}/examples`);
export const adminAddModelExample = (slug: string, data: { image_url: string; prompt?: string; sort_order?: number }) =>
  adminFetch(`/models/${slug}/examples`, 'POST', data);
export const adminUpdateModelExample = (id: string, data: any) => adminFetch(`/model-examples/${id}`, 'PATCH', data);
export const adminDeleteModelExample = (id: string) => adminFetch(`/model-examples/${id}`, 'DELETE');
