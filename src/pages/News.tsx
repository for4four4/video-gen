import SiteLayout from "@/components/layout/SiteLayout";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────
export type NewsEntry = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: "release" | "update" | "platform";
  model?: string;
};

export const NEWS: NewsEntry[] = [
  { slug: "veo3-launch",       title: "Veo 3 теперь в Imagination",          excerpt: "Подключили флагманскую видео-модель Google DeepMind с поддержкой звука.", date: "2025-04-15", tag: "release",  model: "Veo 3" },
  { slug: "midjourney-v7",     title: "Midjourney v7 — новый эталон",         excerpt: "Обновили модель до v7. Качество выросло, цена осталась прежней.",            date: "2025-04-08", tag: "update",   model: "Midjourney" },
  { slug: "flux-pro-update",   title: "Flux Pro: ускорение в 2 раза",        excerpt: "Чёрный лес апдейтнул архитектуру. Генерация теперь быстрее.",               date: "2025-03-30", tag: "update",   model: "Flux Pro" },
  { slug: "kling-2",           title: "Kling 2 в каталоге",                  excerpt: "Добавили обновлённую версию Kling с улучшенной физикой движения.",            date: "2025-03-22", tag: "release",  model: "Kling" },
  { slug: "ref-program",       title: "Реферальная программа: +10% за друга", excerpt: "Приглашайте коллег — получайте поинты.",                                     date: "2025-03-15", tag: "platform" },
  { slug: "api-beta",          title: "API в открытом бета-тесте",            excerpt: "Генерируйте из кода. Документация и ключи в дашборде.",                      date: "2025-03-05", tag: "platform" },
];

// ─── Tag colors ───────────────────────────────────────────────────────────
const tagColor = (t: NewsEntry["tag"]) => ({
  release:  { bg: "rgba(180,120,253,0.12)", fg: "#c49bff", border: "rgba(180,120,253,0.3)" },
  update:   { bg: "rgba(106,223,255,0.1)",  fg: "#8feaff", border: "rgba(106,223,255,0.25)" },
  platform: { bg: "rgba(255,255,255,0.05)", fg: "#d4d4d4", border: "rgba(255,255,255,0.14)" },
}[t]);

const tagLabel = (t: NewsEntry["tag"]) => ({ release: "NEW", update: "UPDATE", platform: "PLATFORM" }[t]);

// ─── Gradient placeholder ─────────────────────────────────────────────────
const GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
  "linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)",
  "linear-gradient(150deg, #1c1c2e 0%, #4a4a7a 50%, #b0b0d0 100%)",
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
    {label && (
      <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-mono text-white/80 uppercase">{label}</div>
    )}
  </div>
);

// ─── NewsList — V2 ────────────────────────────────────────────────────────
export const NewsList = () => {
  useEffect(() => { document.title = "Новости — Imagination AI"; }, []);

  const latest = NEWS[0];
  const rest = NEWS.slice(1);

  return (
    <SiteLayout ambient="news">
      {/* ── Ticker ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderTop: "1px solid hsl(var(--border))",
          borderBottom: "1px solid hsl(var(--border))",
          background: "rgba(180,120,253,0.04)",
          marginTop: "56px", // below fixed header
        }}
      >
        <div
          className="flex gap-10 py-2.5 whitespace-nowrap"
          style={{ animation: "ticker 40s linear infinite" }}
        >
          {[...NEWS, ...NEWS].map((n, i) => (
            <span key={i} className="text-[12px] flex items-center gap-2 shrink-0">
              <span style={{ color: "hsl(var(--accent))" }}>●</span>
              <span className="font-mono text-[10px]" style={{ color: "rgba(250,250,250,0.42)" }}>{n.date}</span>
              <span>{n.title}</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      <section className="relative py-0">
        <div className="max-w-[1200px] mx-auto px-10 pt-16 pb-24">

          {/* ── Masthead ── */}
          <div className="mb-12">
            <div className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "rgba(250,250,250,0.42)" }}>
              News · Changelog · Releases
            </div>
            <h1
              className="font-display tracking-tight leading-[0.92]"
              style={{ fontSize: "clamp(64px, 9vw, 112px)", fontWeight: 400 }}
            >
              Свежие <em className="text-accent not-italic">апдейты</em>
            </h1>
          </div>

          {/* ── Latest — hero card ── */}
          <Link to={`/news/${latest.slug}`} className="block group mb-14">
            <div
              className="grid overflow-hidden rounded-[20px]"
              style={{
                gridTemplateColumns: "1fr 1fr",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              {/* Left text */}
              <div className="p-10 flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="text-[9px] font-mono tracking-wider px-2 py-1 rounded"
                    style={{ background: "rgba(180,120,253,0.15)", color: "hsl(var(--accent))", border: "1px solid rgba(180,120,253,0.3)" }}
                  >
                    NEW · RELEASE
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>{latest.date}</span>
                </div>

                <h2
                  className="font-display tracking-tight leading-[1.02] mb-5 transition-colors group-hover:text-accent"
                  style={{ fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 400 }}
                >
                  {latest.title}
                </h2>

                <p className="text-[15px] leading-relaxed mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {latest.excerpt} Мы протестировали модель на 200+ промптах и добавили её в чат с ценой 90 поинтов за генерацию.
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <span
                    className="text-[12px] px-4 py-2 rounded-md transition-opacity hover:opacity-90"
                    style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 500 }}
                  >
                    Попробовать в чате →
                  </span>
                  <span
                    className="text-[12px] px-4 py-2 rounded-md"
                    style={{ background: "rgba(255,255,255,0.05)", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
                  >
                    Читать полностью
                  </span>
                </div>
              </div>

              {/* Right image */}
              <Placeholder seed={latest.slug} label="veo 3 · 1080p · sound" aspect="16/11" />
            </div>
          </Link>

          {/* ── Rest grid ── */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "rgba(250,250,250,0.42)" }}>
              Предыдущие обновления
            </span>
            <span className="text-[11px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
              {rest.length} entries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rest.map((n) => {
              const tc = tagColor(n.tag);
              return (
                <Link
                  key={n.slug}
                  to={`/news/${n.slug}`}
                  className="group block rounded-[14px] p-5 transition-all"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}
                      >
                        {tagLabel(n.tag)}
                      </span>
                      {n.model && (
                        <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {n.model}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                      {n.date}
                    </span>
                  </div>

                  <h3
                    className="font-medium text-[17px] tracking-tight mb-1 transition-colors group-hover:text-accent"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {n.title}
                  </h3>
                  <p className="text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {n.excerpt}
                  </p>
                </Link>
              );
            })}
          </div>

        </div>
      </section>
    </SiteLayout>
  );
};

// ─── NewsItem ─────────────────────────────────────────────────────────────
export const NewsItem = () => {
  const { slug } = useParams();
  const n = NEWS.find((x) => x.slug === slug);
  useEffect(() => { if (n) document.title = `${n.title} — Imagination AI`; }, [n]);

  if (!n) {
    return (
      <SiteLayout ambient="news">
        <div className="container py-32 text-center">Новость не найдена</div>
      </SiteLayout>
    );
  }

  const tc = tagColor(n.tag);

  return (
    <SiteLayout ambient="news">
      <article className="py-20">
        <div className="container max-w-3xl">
          <Link to="/news" className="text-sm mb-8 inline-block transition-colors hover:text-accent" style={{ color: "hsl(var(--muted-foreground))" }}>
            ← Все новости
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded"
              style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}
            >
              {tagLabel(n.tag)}
            </span>
            {n.model && <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{n.model}</span>}
            <span className="text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>· {n.date}</span>
          </div>

          <h1 className="font-display tracking-tight mb-6" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, lineHeight: 1.05 }}>
            {n.title}
          </h1>

          <Placeholder seed={n.slug} aspect="16/9" label={n.model} className="rounded-[14px] mb-8" />

          <p className="text-xl leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            {n.excerpt}
          </p>
        </div>
      </article>
    </SiteLayout>
  );
};
