import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Video as VideoIcon, Zap, Clock, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export type Model = {
  slug: string;
  name: string;
  type: "image" | "video";
  vendor: string;
  pricePoints: number;
  speed: "fast" | "medium" | "slow";
  description: string;
  longDescription: string;
  tags: string[];
  featured?: boolean;
  popularity: number;
  previews?: string[]; // real URLs in prod; falls back to gradient placeholders
};

export const MODELS: Model[] = [
  {
    slug: "midjourney-v7",
    name: "Midjourney v7",
    type: "image",
    vendor: "Midjourney",
    pricePoints: 12,
    speed: "medium",
    description: "Эталон фотореалистичной и художественной генерации.",
    longDescription:
      "Midjourney v7 — флагманская модель с непревзойдённым уровнем художественности. Идеальна для постеров, концепт-арта, fashion и редакторских иллюстраций.",
    tags: ["фотореализм", "арт", "постеры"],
    featured: true,
    popularity: 98,
  },
  {
    slug: "flux-pro",
    name: "Flux Pro",
    type: "image",
    vendor: "Black Forest Labs",
    pricePoints: 8,
    speed: "fast",
    description: "Молниеносная генерация с филигранной детализацией.",
    longDescription:
      "Flux Pro — быстрая модель с отличной читаемостью текста на изображениях и точностью композиции.",
    tags: ["скорость", "текст", "детали"],
    featured: true,
    popularity: 92,
  },
  {
    slug: "dalle-3",
    name: "DALL·E 3",
    type: "image",
    vendor: "OpenAI",
    pricePoints: 10,
    speed: "medium",
    description: "Понимает сложные промпты буквально.",
    longDescription:
      "DALL·E 3 отлично интерпретирует длинные промпты, сохраняя все детали — от композиции до конкретных объектов.",
    tags: ["промпт", "иллюстрация"],
    popularity: 85,
  },
  {
    slug: "stable-diffusion-xl",
    name: "Stable Diffusion XL",
    type: "image",
    vendor: "Stability AI",
    pricePoints: 5,
    speed: "fast",
    description: "Открытая модель с безграничной кастомизацией.",
    longDescription: "SDXL — мощная open-source модель с поддержкой LoRA и тонкой настройкой стиля.",
    tags: ["open-source", "стиль"],
    popularity: 76,
  },
  {
    slug: "sora",
    name: "Sora",
    type: "video",
    vendor: "OpenAI",
    pricePoints: 80,
    speed: "slow",
    description: "Кинематографичное видео из текста.",
    longDescription:
      "Sora — флагманская text-to-video модель OpenAI. До 20 секунд видео с консистентной физикой и сюжетом.",
    tags: ["text-to-video", "кино"],
    featured: true,
    popularity: 97,
  },
  {
    slug: "veo-3",
    name: "Veo 3",
    type: "video",
    vendor: "Google DeepMind",
    pricePoints: 90,
    speed: "slow",
    description: "1080p видео с синхронным звуком.",
    longDescription:
      "Veo 3 от Google DeepMind генерирует видео с естественным движением камеры и встроенной аудиодорожкой.",
    tags: ["1080p", "звук"],
    featured: true,
    popularity: 94,
  },
  {
    slug: "kling-2",
    name: "Kling 2",
    type: "video",
    vendor: "Kuaishou",
    pricePoints: 60,
    speed: "medium",
    description: "Реалистичное движение и динамика.",
    longDescription: "Kling slavится плавностью движения людей и животных. Отличный выбор для коротких рекламных роликов.",
    tags: ["движение", "реклама"],
    popularity: 81,
  },
  {
    slug: "runway-gen3",
    name: "Runway Gen-3",
    type: "video",
    vendor: "Runway",
    pricePoints: 70,
    speed: "medium",
    description: "Кинематограф для творцов.",
    longDescription:
      "Runway Gen-3 даёт полный контроль над камерой и стилем. Используется в продакшене кино и клипов.",
    tags: ["клипы", "контроль"],
    popularity: 88,
  },
];

// ─── Gradient placeholders (deterministic by slug) ───────────────────────────
const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
  "linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)",
  "linear-gradient(150deg, #1c1c2e 0%, #4a4a7a 50%, #b0b0d0 100%)",
  "linear-gradient(135deg, #3a1a0f 0%, #8a3a1a 50%, #f5b078 100%)",
  "linear-gradient(140deg, #0a1a2a 0%, #1a3a5a 50%, #5a8aba 100%)",
  "linear-gradient(135deg, #2e1a3a 0%, #5a2a6e 50%, #b47adc 100%)",
  "linear-gradient(145deg, #1a2a1a 0%, #4a6a3a 50%, #c0d48a 100%)",
  "linear-gradient(135deg, #3a2e1a 0%, #7a6a3a 50%, #e8d898 100%)",
  "linear-gradient(150deg, #2a1a2e 0%, #6a3a5a 50%, #d88aaa 100%)",
];

const gradFor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  return PLACEHOLDER_GRADIENTS[h % PLACEHOLDER_GRADIENTS.length];
};

// ─── Gradient placeholder image ───────────────────────────────────────────────
const Placeholder = ({
  seed,
  label,
  aspect = "1/1",
  className = "",
}: {
  seed: string;
  label?: string;
  aspect?: string;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{ aspectRatio: aspect, background: gradFor(seed) }}
  >
    {/* diagonal stripes */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)",
      }}
    />
    {/* SVG noise */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
    {label && (
      <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur text-[9px] font-mono tracking-tight text-white/80 uppercase">
        {label}
      </div>
    )}
  </div>
);

// ─── Auto-rotating preview carousel ──────────────────────────────────────────
const PreviewCarousel = ({
  seed,
  count = 4,
  aspect = "1/1",
  className = "",
}: {
  seed: string;
  count: number;
  aspect?: string;
  className?: string;
}) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const interval = 2800 + (seed.length % 3) * 400;

  const start = () => {
    timerRef.current = setInterval(() => setIdx((x) => (x + 1) % count), interval);
  };
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    start();
    return stop;
  }, [count, seed]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <Placeholder seed={`${seed}:${idx}`} label={`${idx + 1}/${count}`} aspect={aspect} />
      {/* dot nav */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {Array.from({ length: count }).map((_, n) => (
          <button
            key={n}
            onClick={(e) => { e.preventDefault(); setIdx(n); }}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: n === idx ? "#fff" : "rgba(255,255,255,0.35)" }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Speed label ─────────────────────────────────────────────────────────────
const speedLabel: Record<string, string> = {
  fast: "Быстрая",
  medium: "Средняя",
  slow: "Медленная",
};

// ─── ModelsList ───────────────────────────────────────────────────────────────
export const ModelsList = () => {
  useEffect(() => { document.title = "Каталог моделей — Imagination AI"; }, []);

  const [type, setType] = useState<"all" | "image" | "video">("all");
  const [vendor, setVendor] = useState("all");
  const [sort, setSort] = useState<"popular" | "cheap" | "fast">("popular");

  const vendors = ["all", ...Array.from(new Set(MODELS.map((m) => m.vendor)))];

  let list = MODELS
    .filter((m) => type === "all" || m.type === type)
    .filter((m) => vendor === "all" || m.vendor === vendor);

  if (sort === "popular") list = [...list].sort((a, b) => b.popularity - a.popularity);
  if (sort === "cheap") list = [...list].sort((a, b) => a.pricePoints - b.pricePoints);
  if (sort === "fast") {
    const rank = { fast: 0, medium: 1, slow: 2 };
    list = [...list].sort((a, b) => rank[a.speed] - rank[b.speed]);
  }

  const flagships = list.filter((m) => m.featured);
  const others = list.filter((m) => !m.featured);

  return (
    <SiteLayout ambient="models">
      {/* subtle top glow */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          top: 0,
          height: 500,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(180,120,253,0.16), transparent 60%)",
        }}
      />

      <section className="relative py-16">
        <div className="container max-w-[1320px] px-8">

          {/* ── Page header ── */}
          <div className="mb-10">
            <p
              className="text-[11px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Каталог · {MODELS.length} моделей
            </p>
            <h1
              className="font-display tracking-tight leading-[0.95] mb-4"
              style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 400 }}
            >
              Все <em className="text-accent not-italic">модели</em> в одном чате
            </h1>
            <p className="text-[15px] max-w-xl" style={{ color: "hsl(var(--muted-foreground))" }}>
              Одна цена в поинтах. Одна очередь. Выберите под задачу — или сравните несколько.
            </p>
          </div>

          {/* ── Sticky filter bar ── */}
          <div
            className="sticky top-14 z-20 -mx-2 px-2 py-3 mb-10 flex flex-wrap items-center gap-3"
            style={{
              background: "rgba(10,10,10,0.82)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            {/* Type segmented control */}
            <div
              className="flex items-center gap-1 p-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid hsl(var(--border))",
              }}
            >
              {(
                [
                  ["all", "Все"],
                  ["image", "Изображения"],
                  ["video", "Видео"],
                ] as const
              ).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setType(k)}
                  className="text-[12px] px-3.5 py-1.5 rounded-full transition-all"
                  style={{
                    background: type === k ? "hsl(var(--foreground))" : "transparent",
                    color:
                      type === k ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                    fontWeight: type === k ? 500 : 400,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Vendor select */}
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="text-[12px] px-3 py-1.5 rounded-full outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              {vendors.map((v) => (
                <option key={v} value={v} style={{ background: "#0a0a0a" }}>
                  {v === "all" ? "Все вендоры" : v}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div
              className="ml-auto flex items-center gap-1 text-[12px]"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <span className="mr-2">Сортировка:</span>
              {(
                [
                  ["popular", "Популярные"],
                  ["cheap", "Дешёвые"],
                  ["fast", "Быстрые"],
                ] as const
              ).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className="px-3 py-1.5 rounded-full transition-all"
                  style={{
                    color:
                      sort === k ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    background: sort === k ? "rgba(255,255,255,0.06)" : "transparent",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* ── Flagships ── */}
          {flagships.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[11px] tracking-[0.28em] uppercase"
                  style={{ color: "hsl(var(--accent))" }}
                >
                  ★ Флагманы
                </span>
                <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {flagships.map((m) => (
                  <FlagshipCard key={m.slug} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* ── All models grid ── */}
          {others.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-[11px] tracking-[0.28em] uppercase"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Все модели
                </span>
                <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "rgba(250,250,250,0.42)" }}
                >
                  {others.length} шт
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((m) => (
                  <CompactCard key={m.slug} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* ── Live-demo CTA ── */}
          <div
            className="rounded-[20px] p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(180,120,253,0.12), rgba(106,223,255,0.06))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <div className="flex-1">
              <div
                className="text-[11px] tracking-[0.28em] uppercase mb-2"
                style={{ color: "hsl(var(--accent))" }}
              >
                Live demo
              </div>
              <h3
                className="font-display tracking-tight mb-2"
                style={{ fontSize: 28, fontWeight: 400 }}
              >
                Попробуйте промпт, не выходя со страницы
              </h3>
              <p className="text-[14px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                Одна генерация бесплатно на любой модели — зарегистрируйтесь и получите ещё 50
                поинтов.
              </p>
            </div>
            <div
              className="flex items-center gap-2 p-2 rounded-xl w-full md:w-[380px]"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <input
                placeholder="a cat wearing a spacesuit, studio light..."
                className="flex-1 bg-transparent text-[13px] outline-none px-2"
                style={{ color: "hsl(var(--foreground))" }}
              />
              <Button
                asChild
                size="sm"
                className="shrink-0 text-[12px] px-3 py-1.5 rounded-md"
                style={{
                  background: "hsl(var(--accent))",
                  color: "#1a0a2a",
                  fontWeight: 600,
                }}
              >
                <Link to="/chat">Запустить</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

// ─── Flagship card with carousel ─────────────────────────────────────────────
const FlagshipCard = ({ m }: { m: Model }) => (
  <Link
    to={`/models/${m.slug}`}
    className="group rounded-[20px] overflow-hidden transition-all hover:-translate-y-1"
    style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
    }}
  >
    <PreviewCarousel seed={m.slug} count={4} aspect="16/10" />

    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className="text-[11px] uppercase tracking-widest mb-1"
            style={{ color: "rgba(250,250,250,0.42)" }}
          >
            {m.vendor}
          </div>
          <h3
            className="font-display tracking-tight"
            style={{ fontSize: 30, fontWeight: 400 }}
          >
            {m.name}
          </h3>
        </div>
        <div className="text-right">
          <div
            className="font-mono text-[20px]"
            style={{ color: "hsl(var(--accent))" }}
          >
            {m.pricePoints}
            <span
              className="text-[11px] ml-0.5"
              style={{ color: "rgba(250,250,250,0.42)" }}
            >
              пт
            </span>
          </div>
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(250,250,250,0.42)" }}
          >
            за генерацию
          </div>
        </div>
      </div>

      <p className="text-[14px] mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
        {m.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {m.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "hsl(var(--muted-foreground))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Speed badge */}
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-3.5 w-3.5" style={{ color: "rgba(250,250,250,0.42)" }} />
        <span className="text-[12px]" style={{ color: "rgba(250,250,250,0.42)" }}>
          {speedLabel[m.speed]}
        </span>
        <div
          className="ml-auto w-24 h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${m.popularity}%`,
              background: "hsl(var(--accent))",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="text-[12px] flex-1 px-3 py-2 rounded-md transition-colors"
          style={{
            background: "hsl(var(--foreground))",
            color: "hsl(var(--background))",
            fontWeight: 500,
          }}
        >
          Попробовать →
        </button>
        <button
          className="text-[12px] px-3 py-2 rounded-md"
          style={{
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}
        >
          Сравнить
        </button>
      </div>
    </div>
  </Link>
);

// ─── Compact card ─────────────────────────────────────────────────────────────
const CompactCard = ({ m }: { m: Model }) => (
  <Link
    to={`/models/${m.slug}`}
    className="group rounded-[16px] overflow-hidden transition-all hover:-translate-y-0.5"
    style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
    }}
  >
    <PreviewCarousel seed={m.slug} count={3} aspect="4/3" />

    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(250,250,250,0.42)" }}
        >
          {m.vendor}
        </div>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {m.type === "image" ? "IMG" : "VID"}
        </span>
      </div>

      <h3 className="font-medium text-[16px] mb-1.5">{m.name}</h3>

      <p
        className="text-[12px] mb-3 line-clamp-2"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {m.description}
      </p>

      <div className="flex items-center justify-between text-[11px]">
        <span className="font-mono" style={{ color: "hsl(var(--accent))" }}>
          {m.pricePoints} пт
        </span>
        <span style={{ color: "rgba(250,250,250,0.42)" }}>{speedLabel[m.speed]}</span>
      </div>
    </div>
  </Link>
);

// ─── ModelDetail ──────────────────────────────────────────────────────────────
export const ModelDetail = () => {
  const { slug } = useParams();
  const model = MODELS.find((m) => m.slug === slug);

  useEffect(() => {
    if (model) document.title = `${model.name} — Imagination AI`;
  }, [model]);

  if (!model) {
    return (
      <SiteLayout ambient="models">
        <div className="container py-32 text-center">
          <h1 className="text-2xl mb-4">Модель не найдена</h1>
          <Button asChild variant="outlineGlow">
            <Link to="/models">К каталогу</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout ambient="models">
      <section className="py-20">
        <div className="container max-w-4xl">
          <Link
            to="/models"
            className="text-sm inline-flex items-center gap-1 mb-8 transition-colors hover:text-accent"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            ← Все модели
          </Link>

          <p className="text-sm mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            {model.vendor} · {model.type === "image" ? "Изображения" : "Видео"}
          </p>

          <h1
            className="font-display tracking-tight mb-6"
            style={{ fontSize: "clamp(48px, 7vw, 84px)", fontWeight: 400, lineHeight: 0.95 }}
          >
            {model.name}
          </h1>

          <p className="text-xl mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            {model.description}
          </p>

          {/* Preview */}
          <div className="rounded-[20px] overflow-hidden mb-10">
            <PreviewCarousel seed={model.slug} count={4} aspect="16/9" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {model.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Long description */}
          <div
            className="rounded-2xl p-8 mb-10"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <p className="leading-relaxed" style={{ color: "rgba(250,250,250,0.9)" }}>
              {model.longDescription}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Цена", value: `${model.pricePoints} пт`, mono: true },
              { label: "Скорость", value: speedLabel[model.speed], mono: false },
              { label: "Популярность", value: `${model.popularity}%`, mono: true },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[14px] p-5"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-widest mb-2"
                  style={{ color: "rgba(250,250,250,0.42)" }}
                >
                  {s.label}
                </div>
                <div
                  className={s.mono ? "font-mono text-[22px]" : "text-[18px] font-medium"}
                  style={{ color: "hsl(var(--accent))" }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
            style={{
              background: "rgba(180,120,253,0.08)",
              border: "1px solid rgba(180,120,253,0.25)",
            }}
          >
            <div>
              <p className="text-sm mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Цена за генерацию
              </p>
              <p className="font-display text-3xl">
                {model.pricePoints}{" "}
                <span className="text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
                  поинтов
                </span>
              </p>
            </div>
            <Button asChild variant="glow" size="lg">
              <Link to="/chat">
                Попробовать в чате <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};
