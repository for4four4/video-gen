// Pricing — two variants
// V1: Calculator-led: slider + live model breakdown + comparison with vendors
// V2: Side-by-side packs + "what you get" tiles + use-cases

const VENDOR_COMPARE = [
  { model: 'Midjourney v7', ours: 12, vendorPlan: 'MJ Pro $60/мес', vendorRate: '≈48 ₽/генерация' },
  { model: 'Sora', ours: 80, vendorPlan: 'ChatGPT Plus $20', vendorRate: 'ограниченный доступ' },
  { model: 'Veo 3', ours: 90, vendorPlan: 'Google AI Ultra $250/мес', vendorRate: '≈95 ₽/генерация' },
  { model: 'Flux Pro', ours: 8, vendorPlan: 'Pay-as-you-go', vendorRate: '≈12 ₽/генерация' },
  { model: 'Runway Gen-3', ours: 70, vendorPlan: 'Standard $15/мес', vendorRate: '≈80 ₽/генерация' },
];

const USE_CASES = [
  { title: 'Студент-дизайнер', points: 500, desc: '≈60 образов в Midjourney для мудборда', tag: 'Для себя' },
  { title: 'Маркетолог-одиночка', points: 1000, desc: '100 обложек + 10 роликов в неделю', tag: 'Для работы' },
  { title: 'Продакшн-студия', points: 5000, desc: '60 видео-роликов Sora + 400 hero-шотов', tag: 'Для команды' },
];

const PricingV1 = () => {
  const [pts, setPts] = React.useState(1000);
  const price = pts;
  const bonus = pts >= 5000 ? Math.round(pts * 0.15) : pts >= 1000 ? Math.round(pts * 0.1) : pts >= 500 ? Math.round(pts * 0.05) : 0;
  const total = pts + bonus;

  const breakdown = [
    { name: 'Midjourney v7', price: 12, each: '≈' + Math.floor(total / 12) + ' генераций' },
    { name: 'Flux Pro', price: 8, each: '≈' + Math.floor(total / 8) + ' генераций' },
    { name: 'Sora (видео)', price: 80, each: '≈' + Math.floor(total / 80) + ' роликов' },
    { name: 'Veo 3 (видео)', price: 90, each: '≈' + Math.floor(total / 90) + ' роликов' },
  ];

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="pricing" />
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: 0, height: 500,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(180,120,253,0.16), transparent 60%)' }} />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-14 pb-24">
        <div className="text-center mb-12">
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: TOKENS.textMuted }}>Тарифы · Pay-as-you-go</div>
          <h1 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 84, fontWeight: 400 }}>
            Плати за <em style={{ color: TOKENS.accent }}>картинки</em>,<br/>не за подписку
          </h1>
          <p className="mt-5 text-[15px] max-w-xl mx-auto" style={{ color: TOKENS.textMuted }}>
            50 поинтов в подарок при регистрации. Дальше — докупайте сколько нужно. Поинты не сгорают.
          </p>
        </div>

        {/* Calculator */}
        <div className="rounded-[24px] p-10 mb-14" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.borderStrong}` }}>
          <div className="grid grid-cols-12 gap-10 items-start">
            <div className="col-span-7">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.accent }}>Калькулятор</span>
                <span className="text-[11px]" style={{ color: TOKENS.textDim }}>двигайте слайдер</span>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-serif tracking-tight" style={{ fontSize: 96, fontWeight: 400 }}>{pts.toLocaleString('ru-RU')}</span>
                <span className="text-[18px]" style={{ color: TOKENS.textMuted }}>поинтов</span>
              </div>
              <div className="flex items-center gap-3 mb-8 text-[14px]">
                <span style={{ color: TOKENS.textMuted }}>цена</span>
                <span className="font-mono text-[20px]">{price.toLocaleString('ru-RU')} ₽</span>
                {bonus > 0 && <>
                  <span style={{ color: TOKENS.textDim }}>+</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'rgba(180,120,253,0.15)', color: TOKENS.accent, border: `1px solid rgba(180,120,253,0.3)` }}>
                    бонус {bonus.toLocaleString('ru-RU')} пт ({Math.round(bonus/pts*100)}%)
                  </span>
                </>}
                <span className="ml-auto text-[11px]" style={{ color: TOKENS.textDim }}>к зачислению</span>
                <span className="font-mono text-[16px]" style={{ color: TOKENS.accent }}>{total.toLocaleString('ru-RU')} пт</span>
              </div>
              <input type="range" min={100} max={10000} step={100} value={pts} onChange={e => setPts(+e.target.value)}
                className="w-full accent-[#b478fd]" style={{ accentColor: TOKENS.accent }} />
              <div className="flex justify-between text-[10px] mt-2 font-mono" style={{ color: TOKENS.textDim }}>
                {[100,500,1000,2500,5000,10000].map(v => (
                  <button key={v} onClick={() => setPts(v)} className="transition-colors" style={{ color: pts === v ? TOKENS.accent : TOKENS.textDim }}>
                    {v.toLocaleString('ru-RU')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-10">
                {['Поинты не сгорают','Без подписки','Коммерческие права','Все модели в одном чате'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-[13px]" style={{ color: TOKENS.textMuted }}>
                    <span style={{ color: TOKENS.accent }}>✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-5">
              <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: TOKENS.textDim }}>Что получите</div>
              <div className="rounded-[16px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}` }}>
                {breakdown.map((b, i) => (
                  <div key={b.name} className="grid grid-cols-5 gap-3 px-4 py-3 items-center" style={{ borderBottom: i < breakdown.length - 1 ? `1px solid ${TOKENS.border}` : 'none' }}>
                    <Placeholder seed={b.name} aspect="1/1" className="rounded-md col-span-1" />
                    <div className="col-span-2">
                      <div className="text-[13px] font-medium">{b.name}</div>
                      <div className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>{b.price} пт / ген.</div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="font-serif text-[24px]" style={{ color: TOKENS.accent }}>{b.each.split(' ')[0]}</div>
                      <div className="text-[10px]" style={{ color: TOKENS.textDim }}>{b.each.split(' ').slice(1).join(' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 py-3 rounded-xl text-[14px]" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>
                Купить {total.toLocaleString('ru-RU')} поинтов за {price.toLocaleString('ru-RU')} ₽ →
              </button>
            </div>
          </div>
        </div>

        {/* Vendor comparison */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.textMuted }}>Сравнение с оригиналом</span>
            <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
          </div>
          <div className="rounded-[16px] overflow-hidden" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
            <div className="grid grid-cols-4 gap-4 px-6 py-3 text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim, background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${TOKENS.border}` }}>
              <span>Модель</span><span>У вендора</span><span>Цена у вендора</span><span className="text-right">В Imagination</span>
            </div>
            {VENDOR_COMPARE.map(r => (
              <div key={r.model} className="grid grid-cols-4 gap-4 px-6 py-4 items-center text-[13px]" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <span className="font-medium">{r.model}</span>
                <span style={{ color: TOKENS.textMuted }}>{r.vendorPlan}</span>
                <span style={{ color: TOKENS.textMuted }}>{r.vendorRate}</span>
                <span className="text-right font-mono" style={{ color: TOKENS.accent }}>{r.ours} пт = {r.ours} ₽</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="grid grid-cols-3 gap-4">
          {USE_CASES.map(c => (
            <div key={c.title} className="rounded-[16px] p-5" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>{c.tag}</span>
              <h4 className="font-serif text-[22px] mt-3 mb-1">{c.title}</h4>
              <div className="font-mono text-[12px] mb-2" style={{ color: TOKENS.accent }}>{c.points.toLocaleString('ru-RU')} пт · {c.points} ₽</div>
              <p className="text-[13px]" style={{ color: TOKENS.textMuted }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── V2: Packs grid + simple comparison ──
const PACKS = [
  { pts: 100, price: 100, bonus: 0, desc: '~8 картинок Midjourney', popular: false },
  { pts: 500, price: 500, bonus: 25, desc: '~60 картинок MJ / 6 видео Kling', popular: false },
  { pts: 1000, price: 1000, bonus: 100, desc: '~100 картинок MJ / 12 роликов', popular: true },
  { pts: 5000, price: 5000, bonus: 750, desc: '~600 MJ / 70 видео Sora', popular: false },
];

const PricingV2 = () => {
  const [selected, setSelected] = React.useState(2);
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="pricing" />
      <div className="relative max-w-[1200px] mx-auto px-10 pt-20 pb-24">
        <div className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: TOKENS.textDim }}>
          Тарифы · Поинты · pay-as-you-go
        </div>
        <div className="grid grid-cols-12 gap-10 items-end mb-14">
          <h1 className="col-span-8 font-serif tracking-tight leading-[0.92]" style={{ fontSize: 104, fontWeight: 400 }}>
            Один <em style={{ color: TOKENS.accent }}>тариф</em>,<br/>гибкие поинты
          </h1>
          <div className="col-span-4 text-[14px] leading-relaxed" style={{ color: TOKENS.textMuted }}>
            50 поинтов дарим при регистрации. Остальное покупаете как бензин — сколько залили, столько и ваше. Поинты не сгорают никогда.
          </div>
        </div>

        {/* Packs */}
        <div className="grid grid-cols-4 gap-4 mb-14">
          {PACKS.map((p, i) => {
            const isSel = selected === i;
            return (
              <button key={i} onClick={() => setSelected(i)}
                className="relative text-left rounded-[20px] p-6 transition-all"
                style={{
                  background: p.popular ? `linear-gradient(180deg, rgba(180,120,253,0.14), rgba(180,120,253,0.02))` : TOKENS.card,
                  border: `1px solid ${isSel ? TOKENS.accent : (p.popular ? 'rgba(180,120,253,0.4)' : TOKENS.border)}`,
                  boxShadow: isSel ? '0 0 0 3px rgba(180,120,253,0.15)' : undefined,
                }}>
                {p.popular && (
                  <span className="absolute -top-2.5 left-6 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>
                    ПОПУЛЯРНЫЙ
                  </span>
                )}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-serif" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1 }}>{p.pts}</span>
                  <span className="text-[13px]" style={{ color: TOKENS.textMuted }}>поинтов</span>
                </div>
                {p.bonus > 0 ? (
                  <div className="text-[11px] mb-4" style={{ color: TOKENS.accent }}>+ бонус {p.bonus} пт</div>
                ) : (
                  <div className="text-[11px] mb-4" style={{ color: TOKENS.textDim }}>без бонуса</div>
                )}
                <div className="font-mono text-[22px] mb-4">{p.price} ₽</div>
                <p className="text-[12px] min-h-[36px]" style={{ color: TOKENS.textMuted }}>{p.desc}</p>
                <div className="mt-5 text-[12px] py-2 rounded-md text-center" style={{ background: isSel ? TOKENS.accent : 'rgba(255,255,255,0.05)', color: isSel ? '#1a0a2a' : TOKENS.text, border: isSel ? 'none' : `1px solid ${TOKENS.border}`, fontWeight: isSel ? 600 : 400 }}>
                  {isSel ? 'Выбрано →' : 'Выбрать'}
                </div>
              </button>
            );
          })}
        </div>

        {/* What you get grid */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.textMuted }}>Что входит</span>
            <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { t: 'Все модели', d: 'Midjourney, Flux, Sora, Veo, Kling, Runway, SDXL, DALL·E' },
              { t: 'Не сгорают', d: 'Купленные поинты остаются навсегда' },
              { t: 'Коммерческие права', d: 'Всё, что сгенерили — ваше, для любых проектов' },
              { t: 'История и избранное', d: 'Поиск, теги, звёздочки, общий доступ' },
            ].map(b => (
              <div key={b.t} className="rounded-[14px] p-5" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
                <div className="w-6 h-6 rounded-md mb-4" style={{ background: `linear-gradient(135deg, ${TOKENS.accent}, #6adfff)` }} />
                <div className="font-medium text-[15px] mb-1">{b.t}</div>
                <p className="text-[12px]" style={{ color: TOKENS.textMuted }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases tiles */}
        <div className="grid grid-cols-3 gap-5 mb-14">
          {USE_CASES.map((c, i) => (
            <div key={c.title} className="rounded-[18px] overflow-hidden" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
              <Placeholder seed={c.title} aspect="16/9" label={c.tag.toLowerCase()} />
              <div className="p-5">
                <h4 className="font-serif text-[24px] mb-1">{c.title}</h4>
                <div className="flex items-center gap-2 text-[12px] mb-2">
                  <span className="font-mono" style={{ color: TOKENS.accent }}>{c.points} пт</span>
                  <span style={{ color: TOKENS.textDim }}>·</span>
                  <span style={{ color: TOKENS.textMuted }}>{c.points} ₽</span>
                </div>
                <p className="text-[13px]" style={{ color: TOKENS.textMuted }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: TOKENS.textDim }}>FAQ</div>
            <h2 className="font-serif tracking-tight" style={{ fontSize: 48, fontWeight: 400 }}>
              Частые <em style={{ color: TOKENS.accent }}>вопросы</em>
            </h2>
          </div>
          <div className="col-span-8">
            {[
              ['Что такое поинты?', '1 поинт = 1 рубль. Каждая генерация стоит определённое количество поинтов.'],
              ['Сгорают ли поинты?', 'Нет. Купленные поинты остаются бессрочно.'],
              ['Можно в коммерческих целях?', 'Да, все права передаются вам.'],
              ['Есть ли подписка?', 'Нет. Только pay-as-you-go.'],
            ].map(([q, a]) => (
              <details key={q} className="py-5 group" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-[18px] font-serif">{q}</span>
                  <span className="text-[20px]" style={{ color: TOKENS.textMuted }}>+</span>
                </summary>
                <p className="mt-3 text-[14px]" style={{ color: TOKENS.textMuted }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PricingV1, PricingV2 });
