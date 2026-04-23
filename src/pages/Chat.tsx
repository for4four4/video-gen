import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Plus,
  BookOpen,
  Star,
  Trash2,
  Search,
  History,
  Lightbulb,
  Keyboard,
} from "lucide-react";
import { MODELS } from "./Models";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Msg = { role: "user" | "assistant"; text: string; image?: string; model?: string; cost?: number };

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  modelSlug: string;
  messages: Msg[];
  starred?: boolean;
};

type Prompt = { id: string; title: string; category: "Портрет" | "Пейзаж" | "Видео" | "Концепт" | "3D"; text: string };

const PROMPT_LIBRARY: Prompt[] = [
  { id: "p1", title: "Кинематографичный портрет", category: "Портрет", text: "cinematic portrait of a young woman, soft rim light, 85mm lens, shallow depth of field, film grain, moody color palette" },
  { id: "p2", title: "Минималистичный пейзаж", category: "Пейзаж", text: "minimalist landscape, foggy mountains at dawn, muted pastel colors, large negative space, ultra-wide composition" },
  { id: "p3", title: "Неоновый киберпанк", category: "Концепт", text: "cyberpunk street at night, neon signs reflecting on wet asphalt, anamorphic lens flares, blade runner style, hyperdetailed" },
  { id: "p4", title: "Плавный traveling-shot", category: "Видео", text: "smooth dolly shot moving forward through a misty forest, golden hour, cinematic 35mm, slow camera movement" },
  { id: "p5", title: "Изометрический 3D", category: "3D", text: "isometric 3D illustration of a cozy room, soft pastel colors, blender style, ambient occlusion, low poly" },
  { id: "p6", title: "Editorial fashion", category: "Портрет", text: "editorial fashion photography, high contrast lighting, vogue style, bold makeup, clean studio background" },
  { id: "p7", title: "Архитектурный hero-shot", category: "Концепт", text: "modern architecture, brutalist concrete building, dramatic shadows, clear blue sky, wide-angle lens" },
  { id: "p8", title: "Анимированный логотип", category: "Видео", text: "elegant logo reveal animation, particles forming the shape, soft glow, premium tech aesthetic, 3 seconds" },
  { id: "p9", title: "Фуд-фотография", category: "Портрет", text: "professional food photography, top-down view, natural light from window, rustic wooden table, steam rising" },
  { id: "p10", title: "Фантастический ландшафт", category: "Пейзаж", text: "alien landscape with floating islands, two suns in purple sky, bioluminescent plants, epic scale, matte painting" },
];

const TIPS = [
  "Уточняйте свет: golden hour, soft rim, hard studio.",
  "Добавляйте оптику: 35mm, 85mm, anamorphic, macro.",
  "Описывайте настроение одним прилагательным: dramatic, serene, eerie.",
  "Для видео указывайте движение камеры: dolly in, pan left, static.",
  "Негативные промпты убирают: lowres, watermark, deformed, extra fingers.",
];

const seed: ChatSession[] = [
  {
    id: "c_demo",
    title: "Новый чат",
    updatedAt: Date.now(),
    modelSlug: MODELS[0].slug,
    messages: [
      { role: "assistant", text: "Привет! Опишите, что хотите сгенерировать. Можно картинку или видео — выберите модель сверху.", model: "Imagination" },
    ],
  },
  {
    id: "c_1",
    title: "Постеры для кофейни",
    updatedAt: Date.now() - 86400000,
    modelSlug: "midjourney-v7",
    messages: [],
    starred: true,
  },
  {
    id: "c_2",
    title: "Лого для стартапа",
    updatedAt: Date.now() - 86400000 * 2,
    modelSlug: "flux-pro",
    messages: [],
  },
  {
    id: "c_3",
    title: "Видео-интро для канала",
    updatedAt: Date.now() - 86400000 * 5,
    modelSlug: "sora",
    messages: [],
  },
];

const formatDate = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 86400000) return "сегодня";
  if (diff < 86400000 * 2) return "вчера";
  return `${Math.floor(diff / 86400000)} дн. назад`;
};

const Chat = () => {
  useEffect(() => {
    document.title = "Чат — Imagination AI";
  }, []);

  const [sessions, setSessions] = useState<ChatSession[]>(seed);
  const [activeId, setActiveId] = useState<string>(seed[0].id);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [promptCat, setPromptCat] = useState<string>("Все");

  const active = sessions.find(s => s.id === activeId)!;
  const model = MODELS.find(m => m.slug === active.modelSlug) ?? MODELS[0];

  const setActive = (patch: Partial<ChatSession>) => {
    setSessions(curr => curr.map(s => (s.id === activeId ? { ...s, ...patch, updatedAt: Date.now() } : s)));
  };

  const newChat = () => {
    const id = `c_${Date.now()}`;
    const fresh: ChatSession = {
      id,
      title: "Новый чат",
      updatedAt: Date.now(),
      modelSlug: model.slug,
      messages: [
        { role: "assistant", text: "Новый чат начат. Что генерируем?", model: "Imagination" },
      ],
    };
    setSessions(curr => [fresh, ...curr]);
    setActiveId(id);
  };

  const deleteChat = (id: string) => {
    setSessions(curr => {
      const next = curr.filter(s => s.id !== id);
      if (id === activeId && next.length) setActiveId(next[0].id);
      return next.length ? next : seed.slice(0, 1);
    });
  };

  const toggleStar = (id: string) => {
    setSessions(curr => curr.map(s => (s.id === id ? { ...s, starred: !s.starred } : s)));
  };

  const send = (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt) return;
    setInput("");
    const userMsg: Msg = { role: "user", text: prompt };
    const isFirstUserMsg = !active.messages.some(m => m.role === "user");
    setActive({
      messages: [...active.messages, userMsg],
      title: isFirstUserMsg ? prompt.slice(0, 40) : active.title,
    });
    setTimeout(() => {
      setSessions(curr =>
        curr.map(s =>
          s.id === activeId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [
                  ...s.messages,
                  {
                    role: "assistant",
                    text: "Готово! Это демо-результат. После подключения polza.ai тут появится реальная генерация.",
                    image: Math.random() > 0.5 ? showcase1 : showcase3,
                    model: model.name,
                    cost: model.pricePoints,
                  },
                ],
              }
            : s,
        ),
      );
    }, 800);
  };

  const usePrompt = (p: Prompt) => {
    setPromptOpen(false);
    setInput(p.text);
  };

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const starred = filteredSessions.filter(s => s.starred);
  const recent = filteredSessions.filter(s => !s.starred);

  const promptCategories = ["Все", ...Array.from(new Set(PROMPT_LIBRARY.map(p => p.category)))];
  const visiblePrompts = promptCat === "Все" ? PROMPT_LIBRARY : PROMPT_LIBRARY.filter(p => p.category === promptCat);

  return (
    <SiteLayout>
      <section className="py-10">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 h-[calc(100vh-160px)] min-h-[640px]">
            {/* ─── SIDEBAR ─── */}
            <aside className="hidden lg:flex flex-col rounded-3xl border border-white/10 bg-card overflow-hidden">
              {/* New chat */}
              <div className="p-4 border-b border-white/5">
                <Button variant="hero" className="w-full" onClick={newChat}>
                  <Plus className="h-4 w-4" /> Новый чат
                </Button>
              </div>

              {/* Quick actions */}
              <div className="p-3 border-b border-white/5 grid grid-cols-3 gap-2">
                <SidebarAction icon={BookOpen} label="Промпты" onClick={() => setPromptOpen(true)} />
                <SidebarAction icon={Lightbulb} label="Советы" onClick={() => setTipsOpen(true)} />
                <SidebarAction icon={Keyboard} label="Шорткаты" onClick={() => setShortcutsOpen(true)} />
              </div>

              {/* Search */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Поиск чатов"
                    className="w-full bg-background/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/40"
                  />
                </div>
              </div>

              {/* History */}
              <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {starred.length > 0 && (
                  <ChatGroup
                    label="Избранное"
                    icon={Star}
                    items={starred}
                    activeId={activeId}
                    onSelect={setActiveId}
                    onStar={toggleStar}
                    onDelete={deleteChat}
                  />
                )}
                <ChatGroup
                  label="Недавние"
                  icon={History}
                  items={recent}
                  activeId={activeId}
                  onSelect={setActiveId}
                  onStar={toggleStar}
                  onDelete={deleteChat}
                />
                {filteredSessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Ничего не найдено</p>
                )}
              </div>

              {/* Footer balance */}
              <div className="p-4 border-t border-white/5">
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Баланс</p>
                  <p className="font-display text-2xl">50 <span className="text-sm text-muted-foreground">поинтов</span></p>
                  <Button asChild size="sm" variant="outlineGlow" className="w-full mt-3">
                    <a href="/dashboard">Пополнить</a>
                  </Button>
                </div>
              </div>
            </aside>

            {/* ─── CHAT ─── */}
            <div className="rounded-3xl border border-white/10 bg-card overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-white/5 p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm">Модель:</span>
                  <select
                    value={model.slug}
                    onChange={e => setActive({ modelSlug: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/50"
                  >
                    <optgroup label="Изображения">
                      {MODELS.filter(m => m.type === "image").map(m => (
                        <option key={m.slug} value={m.slug}>{m.name} — {m.pricePoints} пт</option>
                      ))}
                    </optgroup>
                    <optgroup label="Видео">
                      {MODELS.filter(m => m.type === "video").map(m => (
                        <option key={m.slug} value={m.slug}>{m.name} — {m.pricePoints} пт</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPromptOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Промпты
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Баланс: <span className="text-foreground font-medium">50 пт</span>
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {active.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-primary shrink-0 mr-3 flex items-center justify-center text-xs font-medium">i</div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl ${m.role === "user" ? "bg-white/5 border border-white/10 rounded-tr-sm" : "bg-background/40 border border-white/10 rounded-tl-sm"} overflow-hidden`}>
                      {m.image && (
                        <img src={m.image} alt="generated" className="w-full max-w-md aspect-square object-cover" loading="lazy" />
                      )}
                      <div className="p-4">
                        <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                        {m.model && m.cost !== undefined && (
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">{m.model}</span>
                            <span className="text-muted-foreground">{m.cost} пт</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-white/5 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/30 p-2 focus-within:border-accent/40 transition-colors">
                  {model.type === "image" ? <ImageIcon className="h-4 w-4 text-muted-foreground ml-2" /> : <VideoIcon className="h-4 w-4 text-muted-foreground ml-2" />}
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={`Опишите ${model.type === "image" ? "изображение" : "видео"}...`}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                  <Button variant="hero" size="sm" onClick={() => send()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Стоимость: {model.pricePoints} поинтов · Enter — отправить
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prompt library dialog ── */}
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">Библиотека промптов</DialogTitle>
            <DialogDescription>Готовые шаблоны — кликните, чтобы вставить в чат.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mb-4">
            {promptCategories.map(c => (
              <button
                key={c}
                onClick={() => setPromptCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  promptCat === c
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {visiblePrompts.map(p => (
              <button
                key={p.id}
                onClick={() => usePrompt(p)}
                className="text-left rounded-xl border border-white/10 bg-background/40 p-4 hover:border-accent/40 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{p.title}</p>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{p.text}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tips dialog ── */}
      <Dialog open={tipsOpen} onOpenChange={setTipsOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Советы по промптам</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3">
            {TIPS.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-accent mt-0.5">{i + 1}.</span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      {/* ── Shortcuts dialog ── */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Горячие клавиши</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3 text-sm">
            {[
              ["Enter", "Отправить промпт"],
              ["Ctrl + N", "Новый чат"],
              ["Ctrl + K", "Открыть промпты"],
              ["Ctrl + /", "Поиск чатов"],
              ["Esc", "Закрыть окно"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="text-muted-foreground">{v}</span>
                <kbd className="text-xs px-2 py-1 rounded border border-white/15 bg-white/5 font-mono">{k}</kbd>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
};

const SidebarAction = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-white/10 bg-background/40 hover:border-accent/40 hover:bg-white/[0.04] transition-colors"
  >
    <Icon className="h-3.5 w-3.5 text-accent" />
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </button>
);

const ChatGroup = ({
  label,
  icon: Icon,
  items,
  activeId,
  onSelect,
  onStar,
  onDelete,
}: {
  label: string;
  icon: typeof History;
  items: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="space-y-0.5">
        {items.map(s => (
          <div
            key={s.id}
            className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
              s.id === activeId ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
            }`}
          >
            <button
              onClick={() => onSelect(s.id)}
              className="flex-1 text-left px-3 py-2 min-w-0"
            >
              <p className="text-sm truncate">{s.title}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(s.updatedAt)}</p>
            </button>
            <button
              onClick={() => onStar(s.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/5 transition-opacity"
              aria-label="star"
            >
              <Star className={`h-3.5 w-3.5 ${s.starred ? "fill-accent text-accent" : "text-muted-foreground"}`} />
            </button>
            <button
              onClick={() => onDelete(s.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/5 transition-opacity"
              aria-label="delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
