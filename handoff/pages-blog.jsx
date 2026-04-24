// Blog — two variants
// V1: Magazine with big featured + cover grid
// V2: Asymmetric editorial list with large typography + inline covers

const BlogV1 = () => {
  const featured = BLOG[0];
  const rest = BLOG.slice(1);
  const [cat, setCat] = React.useState('Все');
  const categories = ['Все', ...Array.from(new Set(BLOG.map(b => b.category)))];
  const visible = cat === 'Все' ? rest : rest.filter(b => b.category === cat);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="blog" />
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: 0,
          height: 600,
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(180,120,253,0.18), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(106,223,255,0.08), transparent 50%)',
        }}
      />
      <div className="relative max-w-[1320px] mx-auto px-8 pt-16 pb-24">
        {/* Eyebrow + title */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-8 h-px" style={{ background: TOKENS.accent }} />
              <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: TOKENS.textMuted }}>
                Журнал · Imagination
              </span>
            </div>
            <h1 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 84, fontWeight: 400 }}>
              Идеи и <em style={{ color: TOKENS.accent }}>инсайты</em>
            </h1>
            <p className="mt-5 max-w-lg text-[15px]" style={{ color: TOKENS.textMuted }}>
              Как работают модели, как писать промпты, куда идёт индустрия. Материалы от команды Imagination и приглашённых авторов.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}` }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="text-[12px] px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: cat === c ? TOKENS.text : 'transparent',
                  color: cat === c ? TOKENS.bg : TOKENS.textMuted,
                  fontWeight: cat === c ? 500 : 400,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        <a className="block group mb-16">
          <div className="grid grid-cols-12 gap-8 items-stretch rounded-[20px] overflow-hidden"
            style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
            <Placeholder
              seed={featured.slug}
              label="cover · editorial"
              aspect="4/3"
              className="col-span-7 h-full min-h-[440px]"
            />
            <div className="col-span-5 p-10 flex flex-col">
              <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: TOKENS.textDim }}>
                <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: TOKENS.borderStrong, color: TOKENS.accent }}>
                  Featured
                </span>
                <span className="uppercase tracking-widest">{featured.category}</span>
                <span>·</span>
                <span>{featured.read} мин чтения</span>
              </div>
              <h2 className="font-serif tracking-tight leading-[1.05] mb-5" style={{ fontSize: 44, fontWeight: 400 }}>
                {featured.title}
              </h2>
              <p className="text-[15px] leading-relaxed mb-8" style={{ color: TOKENS.textMuted }}>
                {featured.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${TOKENS.accent}, #6adfff)` }} />
                  <div>
                    <div className="text-[13px]">{featured.author}</div>
                    <div className="text-[11px]" style={{ color: TOKENS.textDim }}>{featured.date}</div>
                  </div>
                </div>
                <span className="text-[13px] flex items-center gap-1" style={{ color: TOKENS.accent }}>
                  Читать <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </div>
        </a>

        {/* Grid of rest */}
        <div className="grid grid-cols-3 gap-6">
          {visible.map(p => (
            <a key={p.slug} className="group flex flex-col">
              <Placeholder
                seed={p.slug}
                label={p.category.toLowerCase()}
                aspect="16/11"
                className="rounded-[14px] mb-4 transition-transform group-hover:-translate-y-1"
                style={{ border: `1px solid ${TOKENS.border}` }}
              />
              <div className="flex items-center gap-2 text-[11px] mb-2" style={{ color: TOKENS.textDim }}>
                <span className="uppercase tracking-widest" style={{ color: TOKENS.accent }}>{p.category}</span>
                <span>·</span>
                <span>{p.read} мин</span>
                <span>·</span>
                <span>{p.date}</span>
              </div>
              <h3 className="font-serif tracking-tight mb-2" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.15 }}>
                {p.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: TOKENS.textMuted }}>
                {p.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: TOKENS.textDim }}>
                <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${TOKENS.accent}, #6adfff)` }} />
                {p.author}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── V2: Editorial asymmetric list ──
const BlogV2 = () => {
  const [hover, setHover] = React.useState(null);
  const featured = BLOG[0];
  const rest = BLOG.slice(1);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="blog" />
      <div className="relative max-w-[1200px] mx-auto px-10 pt-20 pb-24">
        {/* Masthead */}
        <div className="border-b pb-8 mb-10" style={{ borderColor: TOKENS.border }}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: TOKENS.textDim }}>
                Vol. 04 · 2025 · Журнал Imagination
              </div>
              <h1 className="font-serif tracking-tight leading-[0.9]" style={{ fontSize: 120, fontWeight: 400 }}>
                The<br/>
                <em style={{ color: TOKENS.accent }}>Journal</em>
              </h1>
            </div>
            <div className="text-right text-[13px]" style={{ color: TOKENS.textMuted }}>
              <div className="mb-1">{BLOG.length} материалов</div>
              <div>обновлено {BLOG[0].date}</div>
            </div>
          </div>
        </div>

        {/* Featured — horizontal band */}
        <a className="block group mb-16">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: TOKENS.accent }}>
                → Сегодня читают
              </div>
              <h2 className="font-serif tracking-tight leading-[0.98] mb-6" style={{ fontSize: 64, fontWeight: 400 }}>
                {featured.title}
              </h2>
              <p className="text-[17px] leading-relaxed max-w-xl mb-6" style={{ color: TOKENS.textMuted }}>
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-[12px]" style={{ color: TOKENS.textDim }}>
                <span>{featured.author}</span>
                <span>·</span>
                <span>{featured.category}</span>
                <span>·</span>
                <span>{featured.read} мин</span>
                <span>·</span>
                <span>{featured.date}</span>
              </div>
            </div>
            <Placeholder
              seed={featured.slug + 'v2'}
              label="midjourney · v7"
              aspect="3/4"
              className="w-[300px] shrink-0 rounded-[4px]"
            />
          </div>
        </a>

        {/* Divider with running type */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: TOKENS.textDim }}>
            Все материалы
          </span>
          <div className="flex-1 h-px" style={{ background: TOKENS.border }} />
          <span className="text-[11px] font-mono" style={{ color: TOKENS.textDim }}>
            {String(rest.length).padStart(2, '0')} / {String(BLOG.length).padStart(2, '0')}
          </span>
        </div>

        {/* Row list */}
        <div className="divide-y" style={{ borderColor: TOKENS.border }}>
          {rest.map((p, i) => (
            <a
              key={p.slug}
              className="group grid grid-cols-12 gap-6 py-7 items-center cursor-pointer"
              style={{ borderTop: i === 0 ? 'none' : undefined, borderBottom: `1px solid ${TOKENS.border}` }}
              onMouseEnter={() => setHover(p.slug)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="col-span-1 text-[11px] font-mono" style={{ color: TOKENS.textDim }}>
                {String(i + 2).padStart(2, '0')}
              </span>
              <div className="col-span-7">
                <h3
                  className="font-serif tracking-tight transition-all"
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: hover === p.slug ? TOKENS.accent : TOKENS.text,
                    fontStyle: hover === p.slug ? 'italic' : 'normal',
                  }}
                >
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] max-w-lg" style={{ color: TOKENS.textMuted }}>
                  {p.excerpt}
                </p>
              </div>
              <div className="col-span-2 text-[11px]" style={{ color: TOKENS.textDim }}>
                <div className="uppercase tracking-widest mb-1" style={{ color: TOKENS.textMuted }}>
                  {p.category}
                </div>
                <div>{p.read} мин · {p.author}</div>
              </div>
              <div className="col-span-2">
                <Placeholder
                  seed={p.slug + 'v2'}
                  aspect="4/3"
                  className="rounded transition-all"
                  style={{
                    opacity: hover === p.slug ? 1 : 0.6,
                    transform: hover === p.slug ? 'scale(1.03)' : 'scale(1)',
                  }}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { BlogV1, BlogV2 });
