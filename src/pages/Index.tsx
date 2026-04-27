import SiteLayout from "@/components/layout/SiteLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";
import { getModels, type ModelFromDB } from "@/lib/api";
import ReviewsSliderHome from "@/components/sections/ReviewsSliderHome";
import HomeFaqBlock from "@/components/sections/HomeFaqBlock";

// ─── Gradient placeholders ─────────────────────────────────────────────────
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
  <div
    className={`relative overflow-hidden ${className}`}
    style={{ aspectRatio: aspect, background: gradFor(seed) }}
  >
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }}
    />
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
      style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")" }}
    />
    {label && (
      <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur text-[9px] font-mono tracking-tight text-white/80 uppercase">
        {label}
      </div>
    )}
  </div>
);

// ─── Index ─────────────────────────────────────────────────────────────────
const Index = () => {
  const [marqueeModels, setMarqueeModels] = useState<ModelFromDB[]>([]);

  useEffect(() => {
    document.title = "Imagination AI — Чат с ИИ для генерации видео и изображений";
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Imagination AI",
      url: window.location.origin,
      description: "Единый чат с десятками ИИ-моделей для генерации изображений и видео.",
    });
    document.head.appendChild(ld);

    getModels().then(m => setMarqueeModels(m.slice(0, 12))).catch(() => {});

    return () => { document.head.removeChild(ld); };
  }, []);

  return (
    <SiteLayout>
      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden" style={{ minHeight: 780 }}>
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover" style={{ opacity: 0.55 }}>
            <source src={heroVideo.url} type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(10,10,10,0.4), rgba(10,10,10,0.85) 70%)" }} />
        </div>

        <div className="relative max-w-[1320px] mx-auto px-8 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8"
            style={{ background: "rgba(180,120,253,0.12)", border: "1px solid rgba(180,120,253,0.3)", backdropFilter: "blur(10px)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--accent))" }} />
            <span className="text-[11px] tracking-wide">Veo 3 и Midjourney v7 — в чате</span>
          </div>

          <h1 className="font-display tracking-tight leading-[0.92] mb-6" style={{ fontSize: "clamp(64px, 9vw, 128px)", fontWeight: 400 }}>
            Все AI-модели<br />в <em className="text-accent not-italic">одном</em> чате
          </h1>

          <p className="text-[18px] max-w-xl mx-auto mb-10" style={{ color: "hsl(var(--muted-foreground))" }}>
            Midjourney, Sora, Flux, Veo, Kling. Одна цена в поинтах. Без подписок и VPN.
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Link to="/signup" className="px-6 py-3.5 rounded-xl text-[14px] flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 600 }}>
              Попробовать бесплатно →
            </Link>
            <Link to="/models" className="px-6 py-3.5 rounded-xl text-[14px] transition-colors hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.08)", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", backdropFilter: "blur(10px)" }}>
              Смотреть галерею
            </Link>
          </div>

          <div className="text-[12px]" style={{ color: "rgba(250,250,250,0.42)" }}>
            50 поинтов в подарок · без карты · ~3 минуты до первой картинки
          </div>
        </div>
      </div>

      {/* ══ MARQUEE ══ */}
      <div className="py-10 overflow-hidden" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))", background: "rgba(255,255,255,0.015)" }}>
        <div className="text-center text-[10px] tracking-[0.4em] uppercase mb-6" style={{ color: "rgba(250,250,250,0.42)" }}>Доступные модели</div>
        <div className="relative" style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
          <div className="flex gap-8 whitespace-nowrap" style={{ animation: "marquee 40s linear infinite" }}>
            {[...marqueeModels, ...marqueeModels].map((m, i) => (
              <div key={i} className="inline-flex items-center gap-2.5 shrink-0">
                {m.icon_url ? (
                  <img src={m.icon_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                ) : (
                  <Placeholder seed={m.slug + "mq"} aspect="1/1" className="w-8 h-8 rounded-md" />
                )}
                <span className="font-display text-[20px]">{m.name}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: "hsl(var(--accent))", background: "rgba(180,120,253,0.08)" }}>
                  {m.price_points} пт
                </span>
                <span className="text-[16px]" style={{ color: "rgba(250,250,250,0.42)" }}>·</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <div className="max-w-[1320px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>Почему Imagination</div>
          <h2 className="font-display tracking-tight leading-[0.95]" style={{ fontSize: "clamp(42px, 5vw, 72px)", fontWeight: 400 }}>
            Студия, <em className="text-accent not-italic">а не зоопарк</em> подписок
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { seed: "f1", title: "Одна цена", desc: "Платите поинтами. 1 пт = 1 ₽. Midjourney — 12 пт, Sora — 80 пт, Flux — 8 пт." },
            { seed: "f2", title: "Без VPN", desc: "Российские реквизиты, СБП, карты. Работает из любой точки." },
            { seed: "f3", title: "История и права", desc: "Всё в одной ленте. Коммерческие права на все генерации." },
          ].map((f) => (
            <div key={f.title} className="rounded-[20px] p-7" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <Placeholder seed={f.seed} aspect="16/10" className="rounded-lg mb-6" />
              <h3 className="font-display text-[28px] mb-2 tracking-tight">{f.title}</h3>
              <p className="text-[14px]" style={{ color: "hsl(var(--muted-foreground))" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ GALLERY ══ */}
      <div className="max-w-[1320px] mx-auto px-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display tracking-tight leading-[0.95]" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 400 }}>
            Свежие <em className="text-accent not-italic">работы</em> сообщества
          </h2>
          <Link to="/models" className="text-[13px] flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: "hsl(var(--accent))" }}>
            Вся галерея →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"] as const).map((s, i) => (
            <Placeholder
              key={s}
              seed={s}
              aspect={i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3"}
              label={marqueeModels.length > 0 ? marqueeModels[i % marqueeModels.length].name.toLowerCase() : 'ai'}
              className="rounded-[12px]"
            />
          ))}
        </div>
      </div>

      {/* ══ REVIEWS SLIDER (new section) ══ */}
      <ReviewsSliderHome />

      {/* ══ HOME FAQ (new section) ══ */}
      <HomeFaqBlock />

      {/* ══ CTA ══ */}
      <div className="max-w-[1320px] mx-auto px-8 pb-24">
        <div className="rounded-[24px] p-14 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #2d0a4e 50%, #6b2a8a 100%)", border: "1px solid rgba(180,120,253,0.3)" }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(180,120,253,0.5), transparent 40%), radial-gradient(circle at 80% 20%, rgba(106,223,255,0.3), transparent 40%)" }} />
          <div className="relative">
            <h2 className="font-display tracking-tight leading-[0.95] mb-5" style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 400 }}>
              Генерируйте <em className="text-accent not-italic">сейчас</em>
            </h2>
            <p className="text-[15px] mb-8 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
              50 поинтов бесплатно. Этого хватит на 4 картинки в Midjourney или 6 в Flux.
            </p>
            <Link to="/signup" className="inline-block px-8 py-4 rounded-xl text-[15px] transition-opacity hover:opacity-90"
              style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 600 }}>
              Начать бесплатно →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </SiteLayout>
  );
};

export default Index;
