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

/** GET /api/chat/models - получить каталог моделей */
export async function fetchChatModels(): Promise<ChatModel[]> {
  const response = await fetch(`${API_BASE}/chat/models`);
  return handleResponse<ChatModel[]>(response);
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
    body: JSON.stringify(data),
  });
  return handleResponse<GenerationResult>(response);
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
    body: JSON.stringify(data),
  });
  return handleResponse<GenerationResult>(response);
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
    body: JSON.stringify(data),
  });
  return handleResponse<GenerationResult>(response);
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
  return handleResponse<UserBalance>(response);
}
