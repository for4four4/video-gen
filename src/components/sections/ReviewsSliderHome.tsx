import { useState } from "react";
import { REVIEWS } from "@/data/content";
import Placeholder from "@/components/Placeholder";

const ReviewCard = ({ review, large = false }: { review: typeof REVIEWS[0]; large?: boolean }) => {
  const r = review;
  return (
    <div className="rounded-[20px] overflow-hidden flex flex-col" style={{ background: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.08)' }}>
      {r.avatar && (
        <div className="grid grid-cols-3">
          {[0, 1, 2].map(i => (
            <Placeholder key={i} seed={r.name + i} aspect="1/1" />
          ))}
        </div>
      )}
      <div className={large ? 'p-7' : 'p-5'}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[14px]" style={{ color: i < r.rating ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.12)' }}>★</span>
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))' }}>{r.tag}</span>
        </div>

        <p className={large ? 'font-display text-[22px] leading-[1.4] mb-6' : 'text-[14px] leading-relaxed mb-5'}
          style={large ? { fontWeight: 400 } : { color: 'rgba(250,250,250,0.62)' }}>
          «{r.text}»
        </p>

        <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-[14px]"
            style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))', border: '1px solid rgba(180,120,253,0.25)' }}>
            {r.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">{r.name}</div>
            <div className="text-[11px] truncate" style={{ color: 'rgba(250,250,250,0.62)' }}>{r.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsSliderHome = () => {
  const [idx, setIdx] = useState(0);
  const total = REVIEWS.length;
  const visible = 2;

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  const slice = Array.from({ length: visible }, (_, i) => REVIEWS[(idx + i) % total]);

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-20">
      <div className="flex items-end justify-between mb-10 gap-8">
        <div>
          <div className="text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: 'rgba(250,250,250,0.62)' }}>Отзывы · 2 400+ оценок</div>
          <h2 className="font-display tracking-tight leading-[0.95]" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 400 }}>
            Слово за <em style={{ color: 'hsl(var(--accent))' }}>пользователями</em>
          </h2>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <span className="font-mono text-[12px] mr-3" style={{ color: 'rgba(250,250,250,0.42)' }}>
            {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button onClick={prev} className="w-10 h-10 rounded-full flex items-center justify-center text-[16px]"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>←</button>
          <button onClick={next} className="w-10 h-10 rounded-full flex items-center justify-center text-[16px]"
            style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>→</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {slice.map((r, i) => (
          <ReviewCard key={(idx + i) + r.name} review={r} large />
        ))}
      </div>

      <div className="flex justify-center gap-1.5">
        {REVIEWS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 6, height: 6, borderRadius: 999,
              background: i === idx ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.15)',
              transition: 'all 200ms',
            }} />
        ))}
      </div>
    </div>
  );
};

export { ReviewCard };
export default ReviewsSliderHome;
