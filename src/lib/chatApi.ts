// API клиент для работы с chat endpoints
const API_BASE = "/api";

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export interface ModelParameter {
  required?: boolean;
  description?: string;
  max_length?: number;
  values?: string[];
  min?: number;
  max?: number;
  default?: string | number;
}

export interface ChatModel {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  type: "image" | "video";
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
  /** Parsed parameters for UI */
  parameters: Record<string, ModelParameter>;
  /** Parsed pricing tiers */
  pricing?: any;
  iconUrl?: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  video?: string;
  model?: string;
  cost?: number;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  modelSlug: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  points: number;
  rubles: number;
}

export interface GenerationResult {
  id: string;
  status: "success" | "running" | "failed";
  result?: string;
  messages?: ChatMessage[];
  cost: number;
  modelSlug: string;
  remainingBalance?: number;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Network error" }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

function parseModelParameters(raw: string | null): { parameters: Record<string, ModelParameter>; pricing?: any } {
  if (!raw) return { parameters: {} };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const { _pricing, _endpoints, ...params } = parsed;
    return { parameters: params, pricing: _pricing };
  } catch {
    return { parameters: {} };
  }
}

/** GET /api/chat/models — получить каталог моделей (image + video) */
export async function fetchChatModels(): Promise<ChatModel[]> {
  const response = await fetch(`${API_BASE}/chat/models`);
  const data = await handleResponse<{ data: any[]; meta: any }>(response);

  return (data.data || []).map((row: any) => {
    const { parameters, pricing } = parseModelParameters(row.parameters_json);
    return {
      id: row.id || row.slug,
      slug: row.slug,
      name: row.name,
      vendor: row.vendor || extractVendor(row.slug),
      type: row.type,
      base_price_rub: parseFloat(row.base_price_rub) || 0,
      coefficient: parseFloat(row.coefficient) || 1.5,
      price_points: parseInt(row.price_points) || 0,
      description: row.description || row.short_description || '',
      short_description: row.short_description || '',
      featured: row.featured || false,
      speed: row.speed || 'medium',
      popularity: row.popularity || 50,
      input_modalities: row.input_modalities || '[]',
      output_modalities: row.output_modalities || '[]',
      parameters_json: row.parameters_json || '{}',
      parameters,
      pricing,
      iconUrl: row.icon_url,
    };
  });
}

function extractVendor(slug: string): string {
  const parts = slug.split('/');
  return parts.length > 1 ? parts[0] : '';
}

/** POST /api/chat/image — генерация изображения с параметрами модели */
export async function generateImage(data: {
  model: string;
  prompt: string;
  aspect_ratio?: string;
  image_resolution?: string;
  quality?: string;
  output_format?: string;
  seed?: number;
  n?: number;
  sessionId?: string;
}): Promise<GenerationResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: data.model,
      prompt: data.prompt,
      aspect_ratio: data.aspect_ratio,
      image_resolution: data.image_resolution,
      quality: data.quality,
      output_format: data.output_format,
      seed: data.seed,
      n: data.n,
      sessionId: data.sessionId,
    }),
  });
  const result = await handleResponse<{
    imageUrl: string;
    allImages?: string[];
    pointsSpent: number;
    remainingBalance: number;
  }>(response);
  return {
    id: `img_${Date.now()}`,
    status: "success",
    result: result.imageUrl,
    cost: result.pointsSpent,
    remainingBalance: result.remainingBalance,
    modelSlug: data.model,
    messages: [{ role: "assistant", content: "Изображение сгенерировано" }],
  };
}

/** POST /api/chat/video — генерация видео с параметрами модели */
export async function generateVideo(data: {
  model: string;
  prompt: string;
  aspect_ratio?: string;
  duration?: string;
  resolution?: string;
  sound?: string;
  mode?: string;
  sessionId?: string;
}): Promise<GenerationResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: data.model,
      prompt: data.prompt,
      aspect_ratio: data.aspect_ratio,
      duration: data.duration,
      resolution: data.resolution,
      sound: data.sound,
      mode: data.mode,
      sessionId: data.sessionId,
    }),
  });
  const result = await handleResponse<{
    videoUrl: string;
    pointsSpent: number;
    remainingBalance: number;
  }>(response);
  return {
    id: `vid_${Date.now()}`,
    status: "success",
    result: result.videoUrl,
    cost: result.pointsSpent,
    remainingBalance: result.remainingBalance,
    modelSlug: data.model,
    messages: [{ role: "assistant", content: "Видео сгенерировано" }],
  };
}

/** POST /api/chat/send — текстовый чат */
export async function sendChatMessage(data: {
  modelSlug: string;
  message: string;
  sessionId?: string;
}): Promise<GenerationResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: data.modelSlug,
      messages: [{ role: "user", content: data.message }],
    }),
  });
  const result = await handleResponse<{ response: any; pointsSpent: number; remainingBalance: number }>(response);
  return {
    id: `msg_${Date.now()}`,
    status: "success",
    cost: result.pointsSpent,
    remainingBalance: result.remainingBalance,
    modelSlug: data.modelSlug,
    messages: [{
      role: "assistant",
      content: result.response?.choices?.[0]?.message?.content || "Готово!"
    }],
  };
}

/** GET /api/chat/sessions — real sessions with messages */
export async function fetchSessions(): Promise<Array<{
  id: string; title: string; model_slug: string; model_name: string;
  created_at: string; updated_at: string; message_count: number; last_image?: string;
}>> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/sessions`, {
    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
  });
  return handleResponse(response);
}

/** GET /api/chat/sessions/:id/messages */
export async function fetchSessionMessages(sessionId: string): Promise<Array<{
  id: string; role: string; content: string; result_url?: string;
  model_slug: string; points_spent: number; created_at: string;
}>> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
  });
  return handleResponse(response);
}

/** POST /api/chat/sessions */
export async function createSession(data: { title?: string; model_slug?: string }): Promise<{
  id: string; user_id: string; title: string; model_slug: string | null;
  created_at: string; updated_at: string;
}> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/** PATCH /api/chat/sessions/:id */
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const token = getToken();
  await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
    body: JSON.stringify({ title }),
  });
}

/** DELETE /api/chat/sessions/:id */
export async function deleteSession(sessionId: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Delete failed" }));
    throw new Error(error.message);
  }
}

/** GET /api/chat/balance */
export async function fetchUserBalance(): Promise<UserBalance> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/balance`, {
    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
  });
  const data = await handleResponse<{ balance: number }>(response);
  return { points: data.balance, rubles: data.balance };
}
