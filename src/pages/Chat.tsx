import SiteLayout from "@/components/layout/SiteLayout";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  fetchChatModels,
  sendChatMessage,
  generateImage,
  generateVideo,
  fetchChatHistory,
  fetchUserBalance,
  type ChatModel,
  type ModelParameter,
} from "@/lib/chatApi";
import { toast } from "sonner";
import { Loader2, Plus, Search, Image as ImageIcon, Video, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
type Msg = {
  role: "user" | "assistant";
  text: string;
  image?: string;
  video?: string;
  model?: string;
  cost?: number;
  paramsSummary?: string;
};

type Session = {
  id: string;
  title: string;
  updatedAt: number;
  modelSlug: string;
  messages: Msg[];
};

// ─── Gradient placeholders ────────────────────────────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
  "linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)",
  "linear-gradient(150deg, #1c1c2e 0%, #4a4a7a 50%, #b0b0d0 100%)",
  "linear-gradient(135deg, #3a1a0f 0%, #8a3a1a 50%, #f5b078 100%)",
  "linear-gradient(140deg, #0a1a2a 0%, #1a3a5a 50%, #5a8aba 100%)",
];
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  return GRADIENTS[h % GRADIENTS.length];
};

const Placeholder = ({ seed, aspect = "1/1", className = "" }: {
  seed: string; aspect?: string; className?: string;
}) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect, background: gradFor(seed) }}>
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }} />
  </div>
);

// ─── Human-readable labels for parameter keys ─────────────────────────────
const PARAM_LABELS: Record<string, string> = {
  aspect_ratio: "Соотношение сторон",
  image_resolution: "Разрешение",
  quality: "Качество",
  output_format: "Формат",
  duration: "Длительность",
  resolution: "Разрешение видео",
  sound: "Звук",
  mode: "Режим",
  style: "Стиль",
  cfg_scale: "CFG Scale",
  strength: "Сила трансформации",
  guidance_scale: "Guidance Scale",
  fixed_lens: "Статичная камера",
  generate_audio: "Генерация звука",
  character_orientation: "Ориентация персонажа",
  negative_prompt: "Негативный промпт",
  isEnhance: "Улучшение промпта",
};

// Parameters to skip in the settings panel (handled differently)
const SKIP_PARAMS = new Set(["prompt", "images", "videos", "mask_url", "tail_image_url"]);

// ─── Build dynamic settings from model parameters ────────────────────────
function getEditableParams(model: ChatModel | undefined): Array<{
  key: string;
  label: string;
  type: "select" | "range" | "toggle";
  values?: string[];
  min?: number;
  max?: number;
  default?: string;
  description?: string;
}> {
  if (!model) return [];
  const params = model.parameters || {};
  const result: Array<any> = [];

  for (const [key, param] of Object.entries(params)) {
    if (SKIP_PARAMS.has(key)) continue;
    if (key.startsWith('_')) continue; // skip _pricing, _endpoints

    const p = param as ModelParameter;
    const label = PARAM_LABELS[key] || key.replace(/_/g, ' ');

    if (p.values && Array.isArray(p.values)) {
      // Select from values
      result.push({
        key,
        label,
        type: "select",
        values: p.values.map(String),
        default: p.default != null ? String(p.default) : p.values[0],
        description: p.description,
      });
    } else if (p.min !== undefined && p.max !== undefined && !p.values) {
      // Range slider
      result.push({
        key,
        label,
        type: "range",
        min: p.min,
        max: p.max,
        default: p.default != null ? String(p.default) : String(p.min),
        description: p.description,
      });
    }
    // Skip params with only required/max_length (like prompt)
  }

  return result;
}

// ─── Model pill ───────────────────────────────────────────────────────────
const ModelPill = ({ m, active, onClick }: { m: ChatModel; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="shrink-0 text-left transition-all" style={{
    padding: "10px 14px",
    borderRadius: 12,
    background: active ? "rgba(180,120,253,0.14)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "hsl(var(--accent))" : "hsl(var(--border))"}`,
  }}>
    <div className="flex items-center gap-2.5">
      {m.iconUrl
        ? <img src={m.iconUrl} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
        : <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{
            background: active ? "rgba(180,120,253,0.2)" : "rgba(255,255,255,0.06)",
          }}>
            {m.type === "video"
              ? <Video className="w-3.5 h-3.5" style={{ color: active ? "hsl(var(--accent))" : "rgba(250,250,250,0.5)" }} />
              : <ImageIcon className="w-3.5 h-3.5" style={{ color: active ? "hsl(var(--accent))" : "rgba(250,250,250,0.5)" }} />}
          </div>
      }
      <div>
        <div className="text-[12px] font-medium leading-tight truncate max-w-[140px]">{m.name}</div>
        <div className="text-[10px] font-mono" style={{ color: active ? "hsl(var(--accent))" : "rgba(250,250,250,0.42)" }}>
          {m.price_points} пт · {m.type === "image" ? "IMG" : "VID"}
        </div>
      </div>
    </div>
  </button>
);

// ─── Chat ─────────────────────────────────────────────────────────────────
const Chat = () => {
  useEffect(() => { document.title = "Чат — Imagination AI"; }, []);

  const [models, setModels] = useState<ChatModel[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState("");
  const [activeModelSlug, setActiveModelSlug] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [seed, setSeed] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);
  const [balance, setBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<"all" | "image" | "video">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const model = models.find((m) => m.slug === activeModelSlug);
  const active = sessions.find((s) => s.id === activeId);

  // Build editable params from current model
  const editableParams = useMemo(() => getEditableParams(model), [model]);

  // Initialize default settings when model changes
  useEffect(() => {
    if (!model) return;
    const defaults: Record<string, string> = {};
    for (const p of getEditableParams(model)) {
      defaults[p.key] = p.default || (p.values ? p.values[0] : "");
    }
    setSettings(defaults);
    setSeed("");
  }, [activeModelSlug]);

  // Filtered models
  const filteredModels = useMemo(() => {
    let list = models;
    if (modelFilter !== "all") list = list.filter(m => m.type === modelFilter);
    return list;
  }, [models, modelFilter]);

  useEffect(() => {
    const boot = async () => {
      try {
        const [loadedModels, history, bal] = await Promise.all([
          fetchChatModels(),
          fetchChatHistory().catch(() => []),
          fetchUserBalance().catch(() => ({ points: 50 })),
        ]);
        setModels(loadedModels);
        setBalance(bal.points);
        if (loadedModels[0]) setActiveModelSlug(loadedModels[0].slug);

        if (history.length > 0) {
          const converted = history.map((s) => ({
            id: s.id,
            title: s.title,
            updatedAt: new Date(s.updatedAt).getTime(),
            modelSlug: s.modelSlug,
            messages: s.messages.map((m) => ({
              role: m.role as "user" | "assistant",
              text: m.content,
              image: m.image,
              model: m.model,
              cost: m.cost,
            })),
          }));
          setSessions(converted);
          setActiveId(converted[0].id);
        } else {
          const demo: Session = {
            id: `c_${Date.now()}`,
            title: "Новый чат",
            updatedAt: Date.now(),
            modelSlug: loadedModels[0]?.slug || "",
            messages: [
              { role: "assistant", text: "Привет! Выберите модель и опишите, что хотите сгенерировать. Параметры справа меняются в зависимости от модели.", model: "Imagination" },
            ],
          };
          setSessions([demo]);
          setActiveId(demo.id);
        }
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setInit(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  const newChat = () => {
    const id = `c_${Date.now()}`;
    const s: Session = {
      id,
      title: "Новый чат",
      updatedAt: Date.now(),
      modelSlug: activeModelSlug,
      messages: [{ role: "assistant", text: "Новый чат начат. Что генерируем?", model: "Imagination" }],
    };
    setSessions((c) => [s, ...c]);
    setActiveId(id);
  };

  const patchActive = (patch: Partial<Session>) => {
    setSessions((c) => c.map((s) => s.id === activeId ? { ...s, ...patch, updatedAt: Date.now() } : s));
  };

  // Build param summary string for message display
  const buildParamsSummary = (): string => {
    const parts: string[] = [];
    for (const p of editableParams) {
      const val = settings[p.key];
      if (val && val !== p.default) {
        parts.push(`${val}`);
      }
    }
    if (seed && seed !== "auto" && seed !== "") parts.push(`seed:${seed}`);
    return parts.join(" · ");
  };

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || !model || loading) return;
    setLoading(true);
    setInput("");

    const paramsSummary = buildParamsSummary();
    const userMsg: Msg = {
      role: "user",
      text: prompt,
      paramsSummary: paramsSummary || undefined,
    };
    const isFirst = !active?.messages.some((m) => m.role === "user");
    patchActive({ messages: [...(active?.messages || []), userMsg], title: isFirst ? prompt.slice(0, 40) : active?.title });

    try {
      let result: any;
      const seedNum = seed && seed !== "auto" && seed !== "" ? parseInt(seed) : undefined;

      if (model.type === "image") {
        result = await generateImage({
          model: model.slug,
          prompt,
          aspect_ratio: settings.aspect_ratio,
          image_resolution: settings.image_resolution,
          quality: settings.quality,
          output_format: settings.output_format,
          seed: seedNum && !isNaN(seedNum) ? seedNum : undefined,
        });
      } else if (model.type === "video") {
        result = await generateVideo({
          model: model.slug,
          prompt,
          aspect_ratio: settings.aspect_ratio,
          duration: settings.duration,
          resolution: settings.resolution,
          sound: settings.sound || settings.generate_audio,
          mode: settings.mode,
        });
      } else {
        result = await sendChatMessage({ modelSlug: model.slug, message: prompt });
      }

      if (result.remainingBalance !== undefined) {
        setBalance(result.remainingBalance);
      } else {
        setBalance((p) => Math.max(0, p - result.cost));
      }

      // Обновить баланс в шапке и других компонентах
      window.dispatchEvent(new CustomEvent("balance_updated"));

      const isVideo = model.type === "video";
      const assistantMsg: Msg = {
        role: "assistant",
        text: result.messages?.[0]?.content || "Готово!",
        image: !isVideo ? result.result : undefined,
        video: isVideo ? result.result : undefined,
        model: model.name,
        cost: result.cost,
      };
      setSessions((c) => c.map((s) => s.id === activeId ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMsg] } : s));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации");
      // Remove the user message on error
      setSessions((c) => c.map((s) => s.id === activeId ? { ...s, messages: s.messages.filter((_, i) => i !== s.messages.length - 1) } : s));
    } finally {
      setLoading(false);
    }
  }, [input, model, loading, active, activeId, settings, seed, editableParams]);

  const filteredSessions = sessions.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (init) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-accent" />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Загрузка моделей...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-[1320px] mx-auto px-4 py-4 pt-20">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "240px 1fr 280px", minHeight: "calc(100vh - 100px)" }}
        >
          {/* ── LEFT SIDEBAR: История ── */}
          <aside className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="p-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <button onClick={newChat} className="w-full text-[12px] py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90" style={{ background: "hsl(var(--accent))", color: "#1a0a2a", fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> Новая генерация
              </button>
            </div>

            <div className="p-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(250,250,250,0.42)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск в истории" className="w-full text-[12px] pl-8 pr-3 py-2 rounded-md outline-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: "rgba(250,250,250,0.42)" }}>История</div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {filteredSessions.map((s) => (
                <button key={s.id} onClick={() => setActiveId(s.id)} className="w-full text-left px-2 py-2 rounded-md flex gap-2.5 items-center transition-colors" style={{ background: s.id === activeId ? "rgba(180,120,253,0.1)" : "transparent" }}>
                  <Placeholder seed={s.id} aspect="1/1" className="w-10 h-10 rounded-md shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] truncate">{s.title}</div>
                    <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>{new Date(s.updatedAt).toLocaleDateString("ru")}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="p-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="rounded-lg p-3" style={{ background: "rgba(180,120,253,0.08)", border: "1px solid rgba(180,120,253,0.2)" }}>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(250,250,250,0.42)" }}>Баланс</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[24px]">{balance}</span>
                  <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>пт</span>
                </div>
                <Link to="/dashboard" className="block w-full mt-2 text-[11px] py-1.5 rounded text-center transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.08)", color: "hsl(var(--foreground))" }}>Пополнить</Link>
              </div>
            </div>
          </aside>

          {/* ── CENTER: Conversation ── */}
          <main className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            {/* Model picker */}
            <div className="p-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(250,250,250,0.42)" }}>Модель</span>
                {/* Type filter */}
                <div className="flex gap-1 ml-auto">
                  {(["all", "image", "video"] as const).map(f => (
                    <button key={f} onClick={() => setModelFilter(f)} className="text-[10px] px-2 py-1 rounded transition-all" style={{
                      background: modelFilter === f ? "rgba(255,255,255,0.1)" : "transparent",
                      color: modelFilter === f ? "hsl(var(--foreground))" : "rgba(250,250,250,0.42)",
                    }}>
                      {f === "all" ? "Все" : f === "image" ? "Фото" : "Видео"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filteredModels.map((m) => (
                  <ModelPill key={m.slug} m={m} active={activeModelSlug === m.slug} onClick={() => setActiveModelSlug(m.slug)} />
                ))}
                {filteredModels.length === 0 && (
                  <p className="text-[12px] py-2" style={{ color: "rgba(250,250,250,0.42)" }}>Нет доступных моделей</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {active?.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full shrink-0 mr-3" style={{ background: "conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)" }} />
                  )}
                  <div className={`max-w-[70%] rounded-[14px] ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} overflow-hidden`} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid hsl(var(--border))" }}>
                    {/* Image result */}
                    {msg.image && (
                      <div className="p-1.5">
                        <img src={msg.image} alt="Generated" className="rounded-lg w-full max-w-md" style={{ aspectRatio: "auto" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    {/* Video result */}
                    {msg.video && (
                      <div className="p-1.5">
                        <video src={msg.video} controls className="rounded-lg w-full max-w-md" />
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <p className="text-[13px] whitespace-pre-wrap">{msg.text}</p>
                      {/* User params summary */}
                      {msg.role === "user" && msg.paramsSummary && (
                        <div className="flex gap-1.5 mt-2 text-[10px] font-mono flex-wrap" style={{ color: "rgba(250,250,250,0.42)" }}>
                          {msg.paramsSummary.split(" · ").map((v, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>{v}</span>
                          ))}
                        </div>
                      )}
                      {/* Assistant meta */}
                      {msg.role === "assistant" && msg.model && (
                        <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span style={{ color: "hsl(var(--foreground))" }}>{msg.model}</span>
                          {msg.cost !== undefined && msg.cost > 0 && <>
                            <span>·</span>
                            <span className="font-mono">{msg.cost} пт</span>
                          </>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)" }} />
                  <div className="rounded-[14px] rounded-tl-sm px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(var(--accent))", animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {model?.type === "video" ? "генерирую видео…" : "генерирую…"}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="rounded-[14px] p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-2 mb-2">
                  <button className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid hsl(var(--border))" }}>
                    <span className="text-[14px]">+</span>
                  </button>
                  <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: "rgba(180,120,253,0.12)", color: "hsl(var(--accent))" }}>
                      {model?.type === "video" ? "/video" : "/imagine"}
                    </span>
                  </div>
                  <div className="ml-auto text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>
                    ~<span style={{ color: "hsl(var(--accent))", fontWeight: 600 }}>{model?.price_points || 0} пт</span>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={`Опишите что нужно сгенерировать в ${model?.name || "модели"}...`}
                  className="w-full bg-transparent text-[14px] outline-none resize-none"
                  style={{ color: "hsl(var(--foreground))" }}
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5 text-[10px]">
                    <span className="px-2 py-1 rounded font-mono" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>Enter</span>
                    <span style={{ color: "rgba(250,250,250,0.42)" }}>отправить</span>
                  </div>
                  <button onClick={send} disabled={loading || !input.trim()} className="text-[12px] px-5 py-2 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-opacity hover:opacity-90" style={{ background: "hsl(var(--accent))", color: "#1a0a2a", fontWeight: 600 }}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Генерировать →"}
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* ── RIGHT SIDEBAR: Настройки (динамические!) ── */}
          <aside className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            {/* Model header */}
            <div className="p-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(250,250,250,0.42)" }}>Настройки генерации</div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ background: model?.type === "video" ? "rgba(106,223,255,0.1)" : "rgba(180,120,253,0.1)" }}>
                  {model?.type === "video"
                    ? <Video className="w-5 h-5" style={{ color: "rgba(106,223,255,0.8)" }} />
                    : <ImageIcon className="w-5 h-5" style={{ color: "rgba(180,120,253,0.8)" }} />
                  }
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{model?.name || "—"}</div>
                  <div className="text-[10px] font-mono truncate" style={{ color: "rgba(250,250,250,0.42)" }}>{model?.vendor || ""}</div>
                </div>
              </div>
            </div>

            {/* Dynamic parameters */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {editableParams.length === 0 && (
                <p className="text-[12px] text-center py-4" style={{ color: "rgba(250,250,250,0.42)" }}>
                  Выберите модель для настройки параметров
                </p>
              )}

              {editableParams.map((p) => (
                <div key={p.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(250,250,250,0.42)" }}>
                      {p.label}
                    </div>
                    {p.description && (
                      <div className="text-[9px] max-w-[120px] truncate" style={{ color: "rgba(250,250,250,0.3)" }} title={p.description}>
                        {p.description}
                      </div>
                    )}
                  </div>

                  {p.type === "select" && p.values && (
                    <div className="flex flex-wrap gap-1">
                      {p.values.map((o) => (
                        <button
                          key={o}
                          onClick={() => setSettings((s) => ({ ...s, [p.key]: o }))}
                          className="text-[11px] px-2.5 py-1.5 rounded-md transition-all"
                          style={{
                            background: settings[p.key] === o ? "hsl(var(--accent))" : "rgba(255,255,255,0.04)",
                            color: settings[p.key] === o ? "#1a0a2a" : "hsl(var(--muted-foreground))",
                            border: `1px solid ${settings[p.key] === o ? "hsl(var(--accent))" : "hsl(var(--border))"}`,
                            fontWeight: settings[p.key] === o ? 600 : 400,
                          }}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}

                  {p.type === "range" && (
                    <div>
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={p.max && p.max <= 1 ? 0.1 : 1}
                        value={settings[p.key] || p.default || p.min}
                        onChange={(e) => setSettings((s) => ({ ...s, [p.key]: e.target.value }))}
                        className="w-full"
                        style={{ accentColor: "#b478fd" }}
                      />
                      <div className="flex justify-between text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                        <span>{p.min}</span>
                        <span className="text-accent">{settings[p.key] || p.default}</span>
                        <span>{p.max}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Seed — всегда показываем */}
              {model && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,250,250,0.42)" }}>Seed</div>
                  <input
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="auto"
                    className="w-full text-[12px] font-mono px-3 py-2 rounded-md outline-none"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  />
                </div>
              )}

              {/* Reference drop zone */}
              {model && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,250,250,0.42)" }}>Референс</div>
                  <label className="aspect-video rounded-md flex flex-col items-center justify-center text-[11px] cursor-pointer transition-colors hover:border-accent/50" style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,255,255,0.14)", color: "rgba(250,250,250,0.42)" }}>
                    <input type="file" accept="image/*" className="sr-only" />
                    + перетащите картинку
                  </label>
                </div>
              )}
            </div>

            {/* Cost footer */}
            <div className="p-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Стоимость</span>
                <span className="font-mono text-[16px]" style={{ color: "hsl(var(--accent))" }}>
                  ~{model?.price_points || 0} пт
                </span>
              </div>
              <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                {model?.base_price_rub?.toFixed(1) || 0} ₽ × {model?.coefficient || 1.5}
              </div>
              {/* Active settings summary */}
              {editableParams.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {editableParams.map(p => {
                    const val = settings[p.key];
                    if (!val) return null;
                    return (
                      <span key={p.key} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(250,250,250,0.5)" }}>
                        {p.label}: {val}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Chat;
