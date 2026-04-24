// Models — two variants
// V1: Featured hero for flagships + filterable compact grid with preview carousels
// V2: Spreadsheet-like comparison table + card preview on hover

const speedLabel = { fast: 'Быстрая', medium: 'Средняя', slow: 'Медленная' };

const PreviewCarousel = ({ seed, count = 4, className = '', aspect = '1/1' }) => {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % count), 2800 + (seed.length % 3) * 400);
    return () => clearInterval(t);
  }, [count, seed]);
  return (
    <div className={`relative ${className}`}>
      <Placeholder seed={seed + ':' + i} label={`variation ${i + 1}/${count}`} aspect={aspect} className="rounded-[10px]" />
      <div className="absolute bottom-2 right-2 flex gap-1">
        {Array.from({ length: count }).map((_, n) => (
          <button key={n} onClick={(e) => { e.preventDefault(); setI(n); }}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: n === i ? '#fff' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>
    </div>
  );
};

const ModelsV1 = () => {
  const [type, setType] = React.useState('all');
  const [sort, setSort] = React.useState('popular');
  const [vendor, setVendor] = React.useState('all');

  const vendors = ['all', ...Array.from(new Set(MODELS.map(m => m.vendor)))];
  let list = MODELS.filter(m => type === 'all' || m.type === type)
                   .filter(m => vendor === 'all' || m.vendor === vendor);
  if (sort === 'popular') list = [...list].sort((a,b) => b.popularity - a.popularity);
  if (sort === 'cheap') list = [...list].sort((a,b) => a.price - b.price);
  if (sort === 'fast') list = [...list].sort((a,b) => ({fast:0,medium:1,slow:2}[a.speed]) - ({fast:0,medium:1,slow:2}[b.speed]));

  const flagships = list.filter(m => m.featured);
  const others = list.filter(m => !m.featured);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="models" />
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: 0, height: 500,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(180,120,253,0.16), transparent 60%)' }} />

      <div className="relative max-w-[1320px] mx-auto px-8 pt-14 pb-24">
        <div className="mb-10">
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: TOKENS.textMuted }}>
            Каталог · {MODELS.length} моделей
          </div>
          <h1 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 72, fontWeight: 400 }}>
            Все <em style={{ color: TOKENS.accent }}>модели</em> в одном чате
          </h1>
          <p className="mt-4 text-[15px] max-w-xl" style={{ color: TOKENS.textMuted }}>
            Одна цена в поинтах. Одна очередь. Выберите под задачу — или сравните несколько.
          </p>
        </div>

        {/* Filter bar */}
        <div className="sticky top-14 z-20 -mx-2 px-2 py-3 mb-8 flex flex-wrap items-center gap-3"
          style={{ background: 'rgba(10,10,10,0.82)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${TOKENS.border}` }}>
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}` }}>
            {[['all','Все'],['image','Изображения'],['video','Видео']].map(([k,v]) => (
              <button key={k} onClick={() => setType(k)}
                className="text-[12px] px-3.5 py-1.5 rounded-full transition-all"
                style={{ background: type===k? TOKENS.text:'transparent', color: type===k? TOKENS.bg:TOKENS.textMuted, fontWeight: type===k?500:400 }}>
                {v}
              </button>
            ))}
          </div>

          <select value={vendor} onChange={e => setVendor(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-full outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}>
            {vendors.map(v => <option key={v} value={v} style={{ background: TOKENS.bg }}>{v === 'all' ? 'Все вендоры' : v}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-1 text-[12px]" style={{ color: TOKENS.textMuted }}>
            <span className="mr-2">Сортировка:</span>
            {[['popular','Популярные'],['cheap','Дешёвые'],['fast','Быстрые']].map(([k,v]) => (
              <button key={k} onClick={() => setSort(k)}
                className="px-3 py-1.5 rounded-full transition-all"
                style={{ color: sort===k? TOKENS.text:TOKENS.textMuted, background: sort===k? 'rgba(255,255,255,0.06)':'transparent' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Flagships */}
        {flagships.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.accent }}>★ Флагманы</span>
              <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
            </div>
            <div className="grid grid-cols-2 gap-5 mb-12">
              {flagships.map(m => (
                <a key={m.slug} className="group rounded-[20px] overflow-hidden transition-all"
                   style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
                  <PreviewCarousel seed={m.slug} count={4} aspect="16/10" className="rounded-none" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: TOKENS.textDim }}>{m.vendor}</div>
                        <h3 className="font-serif tracking-tight" style={{ fontSize: 30, fontWeight: 400 }}>{m.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[20px]" style={{ color: TOKENS.accent }}>{m.price}<span className="text-[11px] ml-0.5" style={{ color: TOKENS.textDim }}>пт</span></div>
                        <div className="text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim }}>за генерацию</div>
                      </div>
                    </div>
                    <p className="text-[14px] mb-4" style={{ color: TOKENS.textMuted }}>{m.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {m.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>#{t}</span>)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[12px] flex-1 px-3 py-2 rounded-md" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 500 }}>Попробовать →</button>
                      <button className="text-[12px] px-3 py-2 rounded-md" style={{ border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}>Сравнить</button>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Others */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.textMuted }}>Все модели</span>
          <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
          <span className="text-[11px] font-mono" style={{ color: TOKENS.textDim }}>{others.length} шт</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {others.map(m => (
            <a key={m.slug} className="group rounded-[16px] overflow-hidden transition-all"
               style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
              <PreviewCarousel seed={m.slug} count={3} aspect="4/3" className="rounded-none" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim }}>{m.vendor}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: TOKENS.textMuted }}>{m.type === 'image' ? 'IMG' : 'VID'}</span>
                </div>
                <h3 className="font-medium text-[16px] mb-1.5">{m.name}</h3>
                <p className="text-[12px] mb-3 line-clamp-2" style={{ color: TOKENS.textMuted }}>{m.desc}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono" style={{ color: TOKENS.accent }}>{m.price} пт</span>
                  <span style={{ color: TOKENS.textDim }}>{speedLabel[m.speed]}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Live-demo strip */}
        <div className="mt-16 rounded-[20px] p-8 flex items-center gap-6"
          style={{ background: `linear-gradient(135deg, rgba(180,120,253,0.12), rgba(106,223,255,0.06))`, border: `1px solid ${TOKENS.border}` }}>
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: TOKENS.accent }}>Live demo</div>
            <h3 className="font-serif text-[28px] tracking-tight mb-2">Попробуйте промпт, не выходя со страницы</h3>
            <p className="text-[14px]" style={{ color: TOKENS.textMuted }}>Одна генерация бесплатно на любой модели — зарегистрируйтесь и получите ещё 50 поинтов.</p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl w-[380px]" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${TOKENS.border}` }}>
            <input placeholder="a cat wearing a spacesuit, studio light..."
              className="flex-1 bg-transparent text-[13px] outline-none px-2" style={{ color: TOKENS.text }} />
            <button className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>Запустить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── V2: Comparison table ──
const ModelsV2 = () => {
  const [compare, setCompare] = React.useState(['midjourney-v7','flux-pro']);
  const [type, setType] = React.useState('image');
  const list = MODELS.filter(m => m.type === type);
  const toggle = (slug) => setCompare(c => c.includes(slug) ? c.filter(s => s !== slug) : (c.length >= 3 ? [c[1], c[2], slug] : [...c, slug]));
  const selected = compare.map(s => MODELS.find(m => m.slug === s)).filter(Boolean);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="models" />
      <div className="relative max-w-[1320px] mx-auto px-8 pt-14 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: TOKENS.textMuted }}>
              Каталог / Сравнение
            </div>
            <h1 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 72, fontWeight: 400 }}>
              Выбрать <em style={{ color: TOKENS.accent }}>модель</em>
            </h1>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}` }}>
            {[['image','Изображения'],['video','Видео']].map(([k,v]) => (
              <button key={k} onClick={() => { setType(k); setCompare([]); }} className="text-[12px] px-4 py-1.5 rounded-full transition-all"
                style={{ background: type===k? TOKENS.text:'transparent', color: type===k? TOKENS.bg:TOKENS.textMuted, fontWeight: type===k?500:400 }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison strip */}
        {selected.length > 0 && (
          <div className="rounded-[20px] mb-10 overflow-hidden" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.borderStrong}` }}>
            <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: `1px solid ${TOKENS.border}`, background: 'rgba(180,120,253,0.05)' }}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.accent }}>Сравнение</span>
                <span className="text-[11px] font-mono" style={{ color: TOKENS.textDim }}>{selected.length}/3 выбрано</span>
              </div>
              <button onClick={() => setCompare([])} className="text-[11px]" style={{ color: TOKENS.textMuted }}>Очистить</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${selected.length}, 1fr)` }}>
              {/* Row: preview */}
              <div className="px-6 py-4 text-[11px] uppercase tracking-widest" style={{ color: TOKENS.textDim, borderRight: `1px solid ${TOKENS.border}` }}>Превью</div>
              {selected.map(m => <div key={m.slug} className="p-4" style={{ borderRight: `1px solid ${TOKENS.border}` }}>
                <PreviewCarousel seed={m.slug + 'cmp'} count={3} aspect="4/3" />
              </div>)}
              {/* Row: name */}
              <div className="px-6 py-4 text-[11px] uppercase tracking-widest flex items-center" style={{ color: TOKENS.textDim, borderTop: `1px solid ${TOKENS.border}`, borderRight: `1px solid ${TOKENS.border}` }}>Модель</div>
              {selected.map(m => <div key={m.slug} className="p-4" style={{ borderTop: `1px solid ${TOKENS.border}`, borderRight: `1px solid ${TOKENS.border}` }}>
                <div className="text-[11px]" style={{ color: TOKENS.textDim }}>{m.vendor}</div>
                <div className="font-serif text-[24px]">{m.name}</div>
              </div>)}
              {/* Row: price */}
              {[['Цена', m => <span className="font-mono text-[18px]" style={{ color: TOKENS.accent }}>{m.price} пт</span>],
                ['Скорость', m => speedLabel[m.speed]],
                ['Лучше всего для', m => m.tags.join(', ')],
                ['Описание', m => <span className="text-[13px]" style={{ color: TOKENS.textMuted }}>{m.long}</span>]].map(([label, render], i) => (
                <React.Fragment key={label}>
                  <div className="px-6 py-4 text-[11px] uppercase tracking-widest flex items-center" style={{ color: TOKENS.textDim, borderTop: `1px solid ${TOKENS.border}`, borderRight: `1px solid ${TOKENS.border}` }}>{label}</div>
                  {selected.map(m => <div key={m.slug} className="p-4 text-[14px]" style={{ borderTop: `1px solid ${TOKENS.border}`, borderRight: `1px solid ${TOKENS.border}` }}>{render(m)}</div>)}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Catalogue list */}
        <div className="rounded-[16px] overflow-hidden" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          <div className="grid grid-cols-[32px_120px_1fr_90px_90px_90px_100px] gap-4 px-5 py-3 text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim, background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${TOKENS.border}` }}>
            <span></span><span>Превью</span><span>Модель</span><span className="text-right">Цена</span><span className="text-center">Скорость</span><span className="text-center">Популярность</span><span></span>
          </div>
          {list.map(m => {
            const isChecked = compare.includes(m.slug);
            return (
              <div key={m.slug} className="grid grid-cols-[32px_120px_1fr_90px_90px_90px_100px] gap-4 px-5 py-4 items-center transition-colors" style={{ borderBottom: `1px solid ${TOKENS.border}`, background: isChecked ? 'rgba(180,120,253,0.05)' : 'transparent' }}>
                <button onClick={() => toggle(m.slug)} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: isChecked ? TOKENS.accent : 'transparent', border: `1px solid ${isChecked ? TOKENS.accent : TOKENS.borderStrong}` }}>
                  {isChecked && <span className="text-[10px]" style={{ color: '#1a0a2a' }}>✓</span>}
                </button>
                <Placeholder seed={m.slug + 'row'} aspect="4/3" className="rounded-md" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim }}>{m.vendor}</div>
                  <div className="font-medium text-[15px]">{m.name} {m.featured && <span style={{ color: TOKENS.accent }}>★</span>}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: TOKENS.textMuted }}>{m.desc}</div>
                </div>
                <div className="text-right font-mono text-[15px]" style={{ color: TOKENS.accent }}>{m.price} пт</div>
                <div className="text-center text-[12px]" style={{ color: TOKENS.textMuted }}>{speedLabel[m.speed]}</div>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${m.popularity}%`, background: TOKENS.accent }} />
                  </div>
                </div>
                <button className="text-[11px] px-3 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${TOKENS.border}`, color: TOKENS.text }}>Открыть →</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ModelsV1, ModelsV2, PreviewCarousel, speedLabel });
