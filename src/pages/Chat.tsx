import SiteLayout from "@/components/layout/SiteLayout";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchChatModels,
  sendChatMessage,
  generateImage,
  generateVideo,
  fetchChatHistory,
  fetchUserBalance,
  type ChatModel,
} from "@/lib/chatApi";
import { toast } from "sonner";
import { Loader2, Plus, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
type Msg = {
  role: "user" | "assistant";
  text: string;
  image?: string;
  model?: string;
  cost?: number;
  settings?: { ratio?: string; quality?: string; style?: string };
};

type Session = {
  id: string;
  title: string;
  updatedAt: number;
  modelSlug: string;
  messages: Msg[];
};

const CHAT_PRESETS = [
  { id: "ratio",    label: "Соотношение", opts: ["1:1","16:9","9:16","4:5","21:9"], def: "1:1" },
  { id: "quality",  label: "Качество",    opts: ["Draft","Standard","High","Max"],   def: "Standard" },
  { id: "variants", label: "Вариантов",   opts: ["1","2","4"],                       def: "4" },
  { id: "style",    label: "Стиль",       opts: ["Auto","Photo","Illustration","3D","Cinematic"], def: "Auto" },
];

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

const Placeholder = ({ seed, aspect = "1/1", label, className = "" }: {
  seed: string; aspect?: string; label?: string; className?: string;
}) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect, background: gradFor(seed) }}>
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }} />
    {label && <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-mono text-white/80 uppercase">{label}</div>}
  </div>
);

// ─── Model pill ───────────────────────────────────────────────────────────
const ModelPill = ({ m, active, onClick }: { m: ChatModel; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="shrink-0 text-left transition-all"
    style={{
      padding: "10px 14px",
      borderRadius: 12,
      background: active ? "rgba(180,120,253,0.14)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "hsl(var(--accent))" : "hsl(var(--border))"}`,
    }}
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md overflow-hidden shrink-0">
        <Placeholder seed={m.slug + "pill"} aspect="1/1" />
      </div>
      <div>
        <div className="text-[12px] font-medium leading-tight">{m.name}</div>
        <div className="text-[10px] font-mono" style={{ color: active ? "hsl(var(--accent))" : "rgba(250,250,250,0.42)" }}>
          {m.pricePoints} пт · {m.type === "image" ? "IMG" : m.type === "video" ? "VID" : "TXT"}
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
  const [settings, setSettings] = useState<Record<string, string>>({ ratio: "1:1", quality: "Standard", variants: "4", style: "Auto" });
  const [seed, setSeed] = useState("auto");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);
  const [balance, setBalance] = useState(0);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const model = models.find((m) => m.slug === activeModelSlug) || models[0];
  const active = sessions.find((s) => s.id === activeId);

  // Cost formula: price × variants × quality multiplier
  const totalPoints = model
    ? model.pricePoints * parseInt(settings.variants || "1") * (settings.quality === "Max" ? 1.5 : 1)
    : 0;

  useEffect(() => {
    const boot = async () => {
      try {
        const [loadedModels, history, bal] = await Promise.all([
          fetchChatModels(),
          fetchChatHistory().catch(() => []),
          fetchUserBalance().catch(() => ({ points: 50 })),
        ]);
        const enabled = loadedModels.filter((m) => m.enabled !== false);
        setModels(enabled);
        setBalance(bal.points);
        if (enabled[0]) setActiveModelSlug(enabled[0].slug);

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
            modelSlug: enabled[0]?.slug || "",
            messages: [
              { role: "assistant", text: "Привет! Выберите модель сверху и опишите, что хотите сгенерировать.", model: "Imagination" },
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

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || !model || loading) return;
    setLoading(true);
    setInput("");

    const userMsg: Msg = {
      role: "user",
      text: prompt,
      settings: { ratio: settings.ratio, quality: settings.quality, style: settings.style },
    };
    const isFirst = !active?.messages.some((m) => m.role === "user");
    patchActive({ messages: [...(active?.messages || []), userMsg], title: isFirst ? prompt.slice(0, 40) : active?.title });

    try {
      let result: any;
      if (model.type === "image") result = await generateImage({ modelSlug: model.slug, prompt });
      else if (model.type === "video") result = await generateVideo({ modelSlug: model.slug, prompt });
      else result = await sendChatMessage({ modelSlug: model.slug, message: prompt });

      setBalance((p) => Math.max(0, p - result.cost));
      const assistantMsg: Msg = {
        role: "assistant",
        text: result.messages?.[0]?.content || "Готово!",
        image: result.result,
        model: model.name,
        cost: result.cost,
      };
      setSessions((c) => c.map((s) => s.id === activeId ? { ...s, updatedAt: Date.now(), messages: [...s.messages, assistantMsg] } : s));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка генерации");
      setSessions((c) => c.map((s) => s.id === activeId ? { ...s, messages: s.messages.slice(0, -1) } : s));
    } finally {
      setLoading(false);
    }
  }, [input, model, loading, active, activeId, settings]);

  const filteredSessions = sessions.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (init) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-accent" />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Загрузка...</p>
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
          <aside
            className="rounded-[18px] overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {/* New chat */}
            <div className="p-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <button
                onClick={newChat}
                className="w-full text-[12px] py-2.5 rounded-md flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                style={{ background: "hsl(var(--accent))", color: "#1a0a2a", fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> Новая генерация
              </button>
            </div>

            {/* Search */}
            <div className="p-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(250,250,250,0.42)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск в истории"
                  className="w-full text-[12px] pl-8 pr-3 py-2 rounded-md outline-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                />
              </div>
            </div>

            <div
              className="text-[10px] uppercase tracking-widest px-4 pt-3 pb-2"
              style={{ color: "rgba(250,250,250,0.42)" }}
            >
              История
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {filteredSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className="w-full text-left px-2 py-2 rounded-md flex gap-2.5 items-center transition-colors"
                  style={{ background: s.id === activeId ? "rgba(180,120,253,0.1)" : "transparent" }}
                >
                  <Placeholder seed={s.id} aspect="1/1" className="w-10 h-10 rounded-md shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] truncate">{s.title}</div>
                    <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                      {new Date(s.updatedAt).toLocaleDateString("ru")}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="p-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div
                className="rounded-lg p-3"
                style={{ background: "rgba(180,120,253,0.08)", border: "1px solid rgba(180,120,253,0.2)" }}
              >
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(250,250,250,0.42)" }}>Баланс</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[24px]">{balance}</span>
                  <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>пт</span>
                </div>
                <Link
                  to="/dashboard"
                  className="block w-full mt-2 text-[11px] py-1.5 rounded text-center transition-colors hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.08)", color: "hsl(var(--foreground))" }}
                >
                  Пополнить
                </Link>
              </div>
            </div>
          </aside>

          {/* ── CENTER: Conversation ── */}
          <main
            className="rounded-[18px] overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {/* Model picker */}
            <div className="p-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(250,250,250,0.42)" }}>Модель</span>
                <span className="text-[10px]" style={{ color: "rgba(250,250,250,0.42)" }}>· выберите под задачу</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {models.map((m) => (
                  <ModelPill
                    key={m.slug}
                    m={m}
                    active={activeModelSlug === m.slug}
                    onClick={() => setActiveModelSlug(m.slug)}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {active?.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 rounded-full shrink-0 mr-3"
                      style={{ background: "conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)" }}
                    />
                  )}
                  <div
                    className={`max-w-[70%] rounded-[14px] ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} overflow-hidden`}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {/* 2×2 grid for image results (simulated) */}
                    {msg.image && (
                      <div className="grid grid-cols-2 gap-1.5 rounded-[12px] overflow-hidden p-1.5" style={{ border: "1px solid hsl(var(--border))" }}>
                        {[0, 1, 2, 3].map((vi) => (
                          <div key={vi} className="relative group cursor-pointer">
                            <Placeholder seed={msg.image! + vi} aspect="1/1" />
                            <div
                              className="absolute inset-0 flex items-end justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }}
                            >
                              <span className="text-[9px] font-mono text-white">V{vi + 1}</span>
                              <div className="flex gap-1">
                                {["↑", "⤢", "↓"].map((c, ci) => (
                                  <span key={ci} className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-white" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>{c}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <p className="text-[13px] whitespace-pre-wrap">{msg.text}</p>
                      {/* User settings pills */}
                      {msg.role === "user" && msg.settings && (
                        <div className="flex gap-1.5 mt-2 text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                          {Object.values(msg.settings).filter(Boolean).map((v, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>{v}</span>
                          ))}
                        </div>
                      )}
                      {/* Assistant meta */}
                      {msg.role === "assistant" && msg.model && (
                        <div className="flex items-center gap-2 mt-2 text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span style={{ color: "hsl(var(--foreground))" }}>{msg.model}</span>
                          {msg.cost !== undefined && <>
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
                    <span className="text-[12px]" style={{ color: "hsl(var(--muted-foreground))" }}>генерирую…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="rounded-[14px] p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))" }}>
                {/* Top row */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid hsl(var(--border))" }}
                  >
                    <span className="text-[14px]">+</span>
                  </button>
                  <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: "rgba(180,120,253,0.12)", color: "hsl(var(--accent))" }}>
                      /imagine
                    </span>
                    <span>или вставьте референс</span>
                  </div>
                  <div className="ml-auto text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>
                    будет списано{" "}
                    <span style={{ color: "hsl(var(--accent))", fontWeight: 600 }}>
                      {totalPoints} пт
                    </span>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={`Опишите что нужно сгенерировать в ${model?.name || ""}...`}
                  className="w-full bg-transparent text-[14px] outline-none resize-none"
                  style={{ color: "hsl(var(--foreground))" }}
                />

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5 text-[10px]">
                    <span className="px-2 py-1 rounded font-mono" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>Enter</span>
                    <span style={{ color: "rgba(250,250,250,0.42)" }}>отправить</span>
                    <span className="ml-2 px-2 py-1 rounded font-mono" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>/</span>
                    <span style={{ color: "rgba(250,250,250,0.42)" }}>команды</span>
                  </div>
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="text-[12px] px-5 py-2 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: "hsl(var(--accent))", color: "#1a0a2a", fontWeight: 600 }}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Генерировать →"}
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* ── RIGHT SIDEBAR: Настройки ── */}
          <aside
            className="rounded-[18px] overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {/* Model header */}
            <div className="p-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(250,250,250,0.42)" }}>Настройки</div>
              <div className="flex items-center gap-2">
                <Placeholder seed={(model?.slug || "x") + "sett"} aspect="1/1" className="w-10 h-10 rounded-md" />
                <div>
                  <div className="text-[13px] font-medium">{model?.name || "—"}</div>
                  <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>{model?.vendor || ""}</div>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {CHAT_PRESETS.map((p) => (
                <div key={p.id}>
                  <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,250,250,0.42)" }}>
                    {p.label}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.opts.map((o) => (
                      <button
                        key={o}
                        onClick={() => setSettings((s) => ({ ...s, [p.id]: o }))}
                        className="text-[11px] px-2.5 py-1.5 rounded-md transition-all"
                        style={{
                          background: settings[p.id] === o ? "hsl(var(--accent))" : "rgba(255,255,255,0.04)",
                          color: settings[p.id] === o ? "#1a0a2a" : "hsl(var(--muted-foreground))",
                          border: `1px solid ${settings[p.id] === o ? "hsl(var(--accent))" : "hsl(var(--border))"}`,
                          fontWeight: settings[p.id] === o ? 600 : 400,
                        }}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Seed */}
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,250,250,0.42)" }}>Seed</div>
                <input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full text-[12px] font-mono px-3 py-2 rounded-md outline-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                />
              </div>

              {/* Reference drop zone */}
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,250,250,0.42)" }}>Референс</div>
                <label
                  className="aspect-video rounded-md flex flex-col items-center justify-center text-[11px] cursor-pointer transition-colors hover:border-accent/50"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,255,255,0.14)", color: "rgba(250,250,250,0.42)" }}
                >
                  <input type="file" accept="image/*" className="sr-only" />
                  + перетащите картинку
                </label>
              </div>
            </div>

            {/* Cost footer */}
            <div className="p-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Стоимость</span>
                <span className="font-mono text-[16px]" style={{ color: "hsl(var(--accent))" }}>
                  {totalPoints} пт
                </span>
              </div>
              <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                {model?.pricePoints || 0} пт × {settings.variants} вариантов × {settings.quality === "Max" ? "1.5" : "1"}×
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Chat;
