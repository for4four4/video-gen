// News — two variants
// V1: Timeline + "release notes" feel with tags, grouped by month
// V2: Ticker-strip + big latest release

const monthLabel = (d) => {
  const [y, m] = d.split('-');
  return ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][+m - 1] + ' ' + y;
};
const groupByMonth = (arr) => {
  const out = {};
  arr.forEach(n => {
    const k = monthLabel(n.date);
    (out[k] ||= []).push(n);
  });
  return out;
};

const tagColor = (t) => ({
  release: { bg: 'rgba(180,120,253,0.12)', fg: '#c49bff', border: 'rgba(180,120,253,0.3)' },
  update: { bg: 'rgba(106,223,255,0.1)', fg: '#8feaff', border: 'rgba(106,223,255,0.25)' },
  platform: { bg: 'rgba(255,255,255,0.05)', fg: '#d4d4d4', border: 'rgba(255,255,255,0.14)' },
}[t] || { bg: 'rgba(255,255,255,0.05)', fg: '#d4d4d4', border: 'rgba(255,255,255,0.14)' });

const tagLabel = (t) => ({ release: 'NEW', update: 'UPDATE', platform: 'PLATFORM' }[t] || t.toUpperCase());

const NewsV1 = () => {
  const grouped = groupByMonth(NEWS);
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="news" />
      <div className="relative max-w-[900px] mx-auto px-8 pt-16 pb-24">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full animate-ping" style={{ background: TOKENS.accent, opacity: 0.4 }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: TOKENS.accent }} />
            </span>
            <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.textMuted }}>
              Changelog · Live
            </span>
          </div>
          <h1 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 72, fontWeight: 400 }}>
            Что <em style={{ color: TOKENS.accent }}>нового</em>
          </h1>
          <p className="mt-4 text-[15px] max-w-lg" style={{ color: TOKENS.textMuted }}>
            Релизы моделей, обновления платформы, ускорения. Коротко и по делу.
          </p>
          <div className="mt-6 flex gap-2">
            {['Все','Модели','Платформа','Обновления'].map((t, i) => (
              <button key={t} className="text-[12px] px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: i === 0 ? TOKENS.text : 'transparent',
                  color: i === 0 ? TOKENS.bg : TOKENS.textMuted,
                  border: `1px solid ${i === 0 ? 'transparent' : TOKENS.border}`,
                  fontWeight: i === 0 ? 500 : 400,
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[108px] top-2 bottom-2 w-px" style={{ background: TOKENS.border }} />
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="mb-10">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-[84px] text-right text-[11px] tracking-[0.25em] uppercase" style={{ color: TOKENS.textDim }}>
                  {month}
                </div>
                <div className="w-3 h-3 rounded-full" style={{ background: TOKENS.bg, border: `1.5px solid ${TOKENS.borderStrong}` }} />
                <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
              </div>
              <div className="space-y-3 pl-[132px]">
                {items.map(n => {
                  const tc = tagColor(n.tag);
                  return (
                    <a key={n.slug} className="group block rounded-[14px] p-5 transition-all"
                      style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}>
                          {tagLabel(n.tag)}
                        </span>
                        {n.model && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: 'rgba(255,255,255,0.04)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>
                            {n.model}
                          </span>
                        )}
                        <span className="ml-auto text-[10px]" style={{ color: TOKENS.textDim }}>{n.date}</span>
                      </div>
                      <h3 className="font-medium text-[17px] tracking-tight group-hover:text-[#c49bff] transition-colors">
                        {n.title}
                      </h3>
                      <p className="text-[13px] mt-1" style={{ color: TOKENS.textMuted }}>{n.excerpt}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── V2: Hero latest + ticker ──
const NewsV2 = () => {
  const latest = NEWS[0];
  const rest = NEWS.slice(1);
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="news" />

      {/* Ticker */}
      <div className="relative overflow-hidden border-y" style={{ borderColor: TOKENS.border, background: 'rgba(180,120,253,0.04)' }}>
        <div className="flex gap-10 py-2.5 whitespace-nowrap" style={{ animation: 'ticker 40s linear infinite' }}>
          {[...NEWS, ...NEWS].map((n, i) => (
            <span key={i} className="text-[12px] flex items-center gap-2 shrink-0">
              <span style={{ color: TOKENS.accent }}>●</span>
              <span className="font-mono text-[10px]" style={{ color: TOKENS.textDim }}>{n.date}</span>
              <span>{n.title}</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      <div className="max-w-[1200px] mx-auto px-10 pt-16 pb-24">
        {/* Headline */}
        <div className="mb-12">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: TOKENS.textDim }}>
            News · Changelog · Releases
          </div>
          <h1 className="font-serif tracking-tight leading-[0.92]" style={{ fontSize: 112, fontWeight: 400 }}>
            Свежие <em style={{ color: TOKENS.accent }}>апдейты</em>
          </h1>
        </div>

        {/* Latest — big card */}
        <a className="block group mb-14">
          <div className="grid grid-cols-12 gap-0 rounded-[20px] overflow-hidden"
            style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
            <div className="col-span-6 p-10 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[9px] font-mono tracking-wider px-2 py-1 rounded"
                  style={{ background: 'rgba(180,120,253,0.15)', color: TOKENS.accent, border: `1px solid rgba(180,120,253,0.3)` }}>
                  NEW · RELEASE
                </span>
                <span className="text-[11px]" style={{ color: TOKENS.textDim }}>{latest.date}</span>
              </div>
              <h2 className="font-serif tracking-tight leading-[1.02] mb-5" style={{ fontSize: 48, fontWeight: 400 }}>
                {latest.title}
              </h2>
              <p className="text-[15px] leading-relaxed mb-8" style={{ color: TOKENS.textMuted }}>
                {latest.excerpt} Мы протестировали модель на 200+ промптах и добавили её в чат с ценой 90 поинтов за генерацию. Работает с текстом, картинкой-референсом и даёт на выходе 1080p до 10 секунд.
              </p>
              <div className="mt-auto flex items-center gap-3">
                <button className="text-[12px] px-4 py-2 rounded-md" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 500 }}>
                  Попробовать в чате →
                </button>
                <button className="text-[12px] px-4 py-2 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}>
                  Читать полностью
                </button>
              </div>
            </div>
            <Placeholder seed={latest.slug} label="veo 3 · 1080p · sound" aspect="16/11" className="col-span-6" />
          </div>
        </a>

        {/* Rest — compact 2 cols with tag columns */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: TOKENS.textDim }}>
            Предыдущие обновления
          </span>
          <span className="text-[11px] font-mono" style={{ color: TOKENS.textDim }}>
            {rest.length} entries
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rest.map(n => {
            const tc = tagColor(n.tag);
            return (
              <a key={n.slug} className="group block rounded-[14px] p-5 transition-all"
                style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: tc.bg, color: tc.fg, border: `1px solid ${tc.border}` }}>
                      {tagLabel(n.tag)}
                    </span>
                    {n.model && <span className="text-[10px]" style={{ color: TOKENS.textMuted }}>{n.model}</span>}
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>{n.date}</span>
                </div>
                <h3 className="font-medium text-[17px] tracking-tight mb-1 group-hover:text-[#c49bff] transition-colors">
                  {n.title}
                </h3>
                <p className="text-[13px]" style={{ color: TOKENS.textMuted }}>{n.excerpt}</p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { NewsV1, NewsV2 });
