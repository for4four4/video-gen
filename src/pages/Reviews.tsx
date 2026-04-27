import SiteLayout from "@/components/layout/SiteLayout";
import { REVIEWS } from "@/data/content";
import { ReviewCard } from "@/components/sections/ReviewsSliderHome";
import Placeholder from "@/components/Placeholder";
import { useEffect, useState } from "react";

const Stat = ({ n, l }: { n: string; l: string }) => (
  <div className="rounded-[12px] p-3" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="font-display text-[28px] leading-tight" style={{ fontWeight: 400 }}>{n}</div>
    <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(250,250,250,0.42)' }}>{l}</div>
  </div>
);

const ReviewsPage = () => {
  const [filter, setFilter] = useState('Все');
  const tags = ['Все', ...Array.from(new Set(REVIEWS.map(r => r.tag)))];
  const visible = filter === 'Все' ? REVIEWS : REVIEWS.filter(r => r.tag === filter);
  const featured = REVIEWS[2]; // Бюро 9

  useEffect(() => {
    document.title = "Отзывы — Imagination AI";

    // JSON-LD AggregateRating + Review
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Imagination AI",
      "description": "Агрегатор AI-моделей для генерации изображений и видео",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "2412",
        "bestRating": "5",
      },
      "review": REVIEWS.slice(0, 5).map(r => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.name },
        "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating), "bestRating": "5" },
        "reviewBody": r.text,
      })),
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, []);

  return (
    <SiteLayout>
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 480,
        background: 'radial-gradient(ellipse at 30% 0%, rgba(180,120,253,0.14), transparent 60%)' }} />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-28 pb-24">
        {/* Hero */}
        <div className="grid grid-cols-12 gap-10 items-end mb-12">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>Отзывы · 2 400+ оценок</div>
            <h1 className="font-display tracking-tight leading-[0.92]" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 400 }}>
              Что говорят <em style={{ color: 'hsl(var(--accent))' }}>пользователи</em>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-2 pb-2">
            <Stat n="4.8" l="средний рейтинг" />
            <Stat n="2 412" l="оценок" />
            <Stat n="92%" l="рекомендуют" />
            <Stat n="500K+" l="генераций/мес" />
          </div>
        </div>

        {/* Featured big quote */}
        <div className="rounded-[24px] grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-10 mb-12 items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(180,120,253,0.12), rgba(106,223,255,0.04))',
            border: '1px solid rgba(180,120,253,0.3)',
          }}>
          <div className="md:col-span-5 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(i => (
              <Placeholder key={i} seed={featured.name + 'big' + i} aspect="1/1" className="rounded-lg" />
            ))}
          </div>
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[18px]" style={{ color: 'hsl(var(--accent))' }}>★</span>
              ))}
              <span className="ml-2 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))' }}>избранный отзыв</span>
            </div>
            <p className="font-display leading-[1.2] mb-6" style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 400 }}>
              «{featured.text}»
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[16px]"
                style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))', border: '1px solid rgba(180,120,253,0.25)' }}>
                {featured.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="text-[14px] font-medium">{featured.name}</div>
                <div className="text-[12px]" style={{ color: 'rgba(250,250,250,0.62)' }}>{featured.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-4 py-2 rounded-full text-[12px] transition-all"
              style={{
                background: filter === t ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.04)',
                color: filter === t ? '#1a0a2a' : 'rgba(250,250,250,0.62)',
                border: `1px solid ${filter === t ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.08)'}`,
                fontWeight: filter === t ? 600 : 400,
              }}>{t}</button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-[20px] p-8 flex flex-col sm:flex-row items-center justify-between gap-8"
          style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: 'rgba(250,250,250,0.62)' }}>Поделитесь опытом</div>
            <h3 className="font-display text-[36px] tracking-tight">Оставьте свой <em style={{ color: 'hsl(var(--accent))' }}>отзыв</em></h3>
          </div>
          <button className="px-6 py-3 rounded-xl text-[14px]" style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
            Написать отзыв →
          </button>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ReviewsPage;
