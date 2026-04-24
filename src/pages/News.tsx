import SiteLayout from "@/components/layout/SiteLayout";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNewsList, getNewsItem, type NewsItem as NewsItemType } from "@/lib/api";

// Gradient placeholder
const GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
  "linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)",
];
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  return GRADIENTS[h % GRADIENTS.length];
};
const Placeholder = ({ seed, aspect = "1/1", label, className = "" }: { seed: string; aspect?: string; label?: string; className?: string }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect, background: gradFor(seed) }}>
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }} />
    {label && <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-mono text-white/80 uppercase">{label}</div>}
  </div>
);

const tagColor = (t: string) => ({
  release:  { bg: "rgba(180,120,253,0.12)", fg: "#c49bff", border: "rgba(180,120,253,0.3)" },
  update:   { bg: "rgba(106,223,255,0.1)",  fg: "#8feaff", border: "rgba(106,223,255,0.25)" },
  platform: { bg: "rgba(255,255,255,0.05)", fg: "#d4d4d4", border: "rgba(255,255,255,0.14)" },
}[t] || { bg: "rgba(255,255,255,0.05)", fg: "#d4d4d4", border: "rgba(255,255,255,0.14)" });

const tagLabel = (t: string) => ({ release: "NEW", update: "UPDATE", platform: "PLATFORM" }[t] || t.toUpperCase());

export const NewsList = () => {
  useEffect(() => { document.title = "Новости — Imagination AI"; }, []);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: getNewsList,
  });

  const latest = news[0];
  const rest = news.slice(1);

  return (
    <SiteLayout ambient="news">
      {/* Ticker */}
      {news.length > 0 && (
        <div className="relative overflow-hidden" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))", background: "rgba(180,120,253,0.04)", marginTop: "56px" }}>
          <div className="flex gap-10 py-2.5 whitespace-nowrap" style={{ animation: "ticker 40s linear infinite" }}>
            {[...news, ...news].map((n, i) => (
              <span key={i} className="text-[12px] flex items-center gap-2 shrink-0">
                <span style={{ color: "hsl(var(--accent))" }}>●</span>
                <span className="font-mono text-[10px]" style={{ color: "rgba(250,250,250,0.42)" }}>{n.published_at?.slice(0, 10)}</span>
                <span>{n.title}</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
      )}

      <section className="relative py-0">
        <div className="max-w-[1200px] mx-auto px-10 pt-16 pb-24">

          <div className="mb-12">
            <div className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "rgba(250,250,250,0.42)" }}>News · Changelog · Releases</div>
            <h1 className="font-display tracking-tight leading-[0.92]" style={{ fontSize: "clamp(64px, 9vw, 112px)", fontWeight: 400 }}>
              Свежие <em className="text-accent not-italic">апдейты</em>
            </h1>
          </div>

          {isLoading && <div className="text-center py-20 text-muted-foreground">Загрузка...</div>}

          {!isLoading && news.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">Новостей пока нет</div>
          )}

          {latest && (
            <Link to={`/news/${latest.slug}`} className="block group mb-14">
              <div className="grid overflow-hidden rounded-[20px]" style={{ gridTemplateColumns: "1fr 1fr", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <div className="p-10 flex flex-col">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[9px] font-mono tracking-wider px-2 py-1 rounded" style={{ background: "rgba(180,120,253,0.15)", color: "hsl(var(--accent))", border: "1px solid rgba(180,120,253,0.3)" }}>
                      {tagLabel(latest.tag)}
                    </span>
                    <span className="text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>{latest.published_at?.slice(0, 10)}</span>
                  </div>
                  <h2 className="font-display tracking-tight leading-[1.02] mb-5 transition-colors group-hover:text-accent" style={{ fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 400 }}>
                    {latest.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>{latest.excerpt}</p>
                  <div className="mt-auto flex items-center gap-3">
                    <span className="text-[12px] px-4 py-2 rounded-md" style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 500 }}>
                      Читать полностью →
                    </span>
                  </div>
                </div>
                {latest.cover_image
                  ? <img src={latest.cover_image} alt={latest.title} className="w-full object-cover" style={{ aspectRatio: "16/11" }} />
                  : <Placeholder seed={latest.slug} label={latest.model_name || ''} aspect="16/11" />
                }
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "rgba(250,250,250,0.42)" }}>Предыдущие обновления</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rest.map(n => {
                  const tc = tagColor(n.tag);
                  return (
                    <Link key={n.slug} to={`/news/${n.slug}`} className="group block rounded-[14px] p-5 transition-all" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded" style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}>{tagLabel(n.tag)}</span>
                          {n.model_name && <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{n.model_name}</span>}
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>{n.published_at?.slice(0, 10)}</span>
                      </div>
                      <h3 className="font-medium text-[17px] tracking-tight mb-1 transition-colors group-hover:text-accent">{n.title}</h3>
                      <p className="text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>{n.excerpt}</p>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export const NewsItem = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: n, isLoading, isError } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => getNewsItem(slug!),
    enabled: !!slug,
  });

  useEffect(() => { if (n) document.title = `${n.title} — Imagination AI`; }, [n]);

  if (isLoading) return <SiteLayout ambient="news"><div className="container py-32 text-center text-muted-foreground">Загрузка...</div></SiteLayout>;
  if (isError || !n) return <SiteLayout ambient="news"><div className="container py-32 text-center">Новость не найдена</div></SiteLayout>;

  const tc = tagColor(n.tag);

  return (
    <SiteLayout ambient="news">
      <article className="py-20">
        <div className="container max-w-3xl">
          <Link to="/news" className="text-sm mb-8 inline-block transition-colors hover:text-accent" style={{ color: "hsl(var(--muted-foreground))" }}>← Все новости</Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded" style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}>{tagLabel(n.tag)}</span>
            {n.model_name && <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{n.model_name}</span>}
            <span className="text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>· {n.published_at?.slice(0, 10)}</span>
          </div>
          <h1 className="font-display tracking-tight mb-6" style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, lineHeight: 1.05 }}>{n.title}</h1>
          {n.cover_image
            ? <img src={n.cover_image} alt={n.title} className="w-full rounded-[14px] mb-8 object-cover" style={{ aspectRatio: "16/9" }} />
            : <Placeholder seed={n.slug} aspect="16/9" label={n.model_name} className="rounded-[14px] mb-8" />
          }
          <p className="text-xl leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>{n.excerpt}</p>
          {n.content && <div className="leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(250,250,250,0.9)" }}>{n.content}</div>}
        </div>
      </article>
    </SiteLayout>
  );
};
