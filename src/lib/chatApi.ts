// API клиент для работы с chat endpoints
const API_BASE = "/api";

// Получение токена из localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export interface ChatModel {
  id: string;
  slug: string;
  name: string;
  type: "chat" | "image" | "video" | "embedding" | "audio";
  inputModalities: string[];
  outputModalities: string[];
  contextLength?: number;
  pricePoints: number;
  coefficient: number;
  enabled: boolean;
}

interface PolzaModel {
  id: string;
  name: string;
  type: string;
  created: number;
  architecture: {
    input_modalities: string[];
    output_modalities: string[];
  };
  top_provider: {
    context_length?: number;
    max_completion_tokens?: number;
    pricing?: {
      prompt_per_million?: string;
      completion_per_million?: string;
      request_per_thousand?: string;
      video_per_second?: string;
      currency?: string;
    };
  };
  endpoints?: string[];
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
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

export interface SendChatRequest {
  modelSlug: string;
  message: string;
  sessionId?: string;
}

export interface SendImageRequest {
  modelSlug: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface SendVideoRequest {
  modelSlug: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  seed?: number;
}

export interface GenerationResult {
  id: string;
  status: "success" | "running" | "failed";
  result?: string; // URL изображения/видео
  messages?: ChatMessage[];
  cost: number;
  modelSlug: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

/** GET /api/chat/models - получить каталог моделей (только image и video) */
export async function fetchChatModels(): Promise<ChatModel[]> {
  const response = await fetch(`${API_BASE}/chat/models?type=image&type=video`);
  const data = await handleResponse<{ data: PolzaModel[] }>(response);
  
  // Преобразуем данные из polza.ai в формат ChatModel
  return (data.data || []).map((model: PolzaModel) => {
    // Получаем цену из pricing
    const pricing = model.top_provider?.pricing || {};
    let pricePoints = 10; // значение по умолчанию
    
    if (pricing.prompt_per_million) {
      pricePoints = Math.round(parseFloat(pricing.prompt_per_million));
    } else if (pricing.request_per_thousand) {
      pricePoints = Math.round(parseFloat(pricing.request_per_thousand) * 100);
    } else if (pricing.video_per_second) {
      pricePoints = Math.round(parseFloat(pricing.video_per_second) * 100);
    }
    
    return {
      id: model.id,
      slug: model.id,
      name: model.name,
      type: model.type as ChatModel["type"],
      inputModalities: model.architecture?.input_modalities || [],
      outputModalities: model.architecture?.output_modalities || [],
      contextLength: model.top_provider?.context_length,
      pricePoints,
      coefficient: 1.5, // коэффициент по умолчанию
      enabled: true,
    };
  });
}

/** POST /api/chat/send - отправить сообщение в чат */
export async function sendChatMessage(data: SendChatRequest): Promise<GenerationResult> {
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
  // Преобразуем ответ сервера в формат клиента
  return {
    id: `msg_${Date.now()}`,
    status: "success",
    cost: result.pointsSpent,
    modelSlug: data.modelSlug,
    messages: [{ 
      role: "assistant", 
      content: result.response?.choices?.[0]?.message?.content || "Готово!" 
    }],
  };
}

/** POST /api/chat/image - генерация изображения */
export async function generateImage(data: SendImageRequest): Promise<GenerationResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/image`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: data.modelSlug,
      prompt: data.prompt,
      negativePrompt: data.negativePrompt,
      size: data.width && data.height ? `${data.width}x${data.height}` : undefined,
    }),
  });
  const result = await handleResponse<{ imageUrl: string; pointsSpent: number; remainingBalance: number }>(response);
  // Преобразуем ответ сервера в формат клиента
  return {
    id: `img_${Date.now()}`,
    status: "success",
    result: result.imageUrl,
    cost: result.pointsSpent,
    modelSlug: data.modelSlug,
    messages: [{ role: "assistant", content: "Image generated" }],
  };
}

/** POST /api/chat/video - генерация видео */
export async function generateVideo(data: SendVideoRequest): Promise<GenerationResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/video`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: data.modelSlug,
      prompt: data.prompt,
      duration: data.duration,
      resolution: data.resolution,
    }),
  });
  const result = await handleResponse<{ videoUrl: string; pointsSpent: number; remainingBalance: number }>(response);
  // Преобразуем ответ сервера в формат клиента
  return {
    id: `vid_${Date.now()}`,
    status: "success",
    result: result.videoUrl,
    cost: result.pointsSpent,
    modelSlug: data.modelSlug,
    messages: [{ role: "assistant", content: "Video generated" }],
  };
}

/** GET /api/chat/history - история чатов */
export async function fetchChatHistory(): Promise<ChatSession[]> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/history`, {
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  return handleResponse<ChatSession[]>(response);
}

/** GET /api/chat/session/:id - конкретная сессия */
export async function fetchChatSession(sessionId: string): Promise<ChatSession> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/session/${sessionId}`, {
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  return handleResponse<ChatSession>(response);
}

/** DELETE /api/chat/session/:id - удалить сессию */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/session/${sessionId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Delete failed" }));
    throw new Error(error.message);
  }
}

/** GET /api/chat/balance - баланс пользователя */
export async function fetchUserBalance(): Promise<UserBalance> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/chat/balance`, {
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  const data = await handleResponse<{ balance: number }>(response);
  // Сервер возвращает { balance: number }, преобразуем в формат клиента
  return { points: data.balance, rubles: data.balance };
}
