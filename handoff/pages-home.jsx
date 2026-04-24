// Home — two variants
// V1: Video hero + model marquee + feature grid + latest works
// V2: Split hero (text + video) + big model cards + use cases

const HomeHero = ({ variant = 1, videoUrl }) => {
  // Shared: black hero with video bg
  return (
    <div className="relative overflow-hidden" style={{ minHeight: variant === 1 ? 720 : 620 }}>
      {/* Video background */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{
            background: `linear-gradient(135deg, #1a0a2e 0%, #2d0a4e 30%, #6b2a8a 60%, #b478fd 100%)`,
          }} />
        )}
        <div className="absolute inset-0" style={{
          background: variant === 1
            ? 'radial-gradient(ellipse at 50% 100%, rgba(10,10,10,0.9), rgba(10,10,10,0.4) 60%), linear-gradient(180deg, rgba(10,10,10,0.6), rgba(10,10,10,0.3))'
            : 'linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.3) 100%)',
        }} />
      </div>
    </div>
  );
};

const HomeV1 = () => {
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="home" />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 780 }}>
        <div className="absolute inset-0">
          <div className="w-full h-full" style={{
            background: `radial-gradient(ellipse at 30% 50%, #6b2a8a 0%, #2d0a4e 40%, #0a0a0a 80%), radial-gradient(ellipse at 80% 20%, rgba(106,223,255,0.3), transparent 40%)`,
          }} />
          {/* Floating image cards — marquee of generations */}
          <div className="absolute inset-0 opacity-60" style={{
            maskImage: 'radial-gradient(ellipse at 50% 60%, black, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 60%, black, transparent 70%)',
          }}>
            <div className="absolute top-[15%] left-[5%] w-40 h-52 rounded-xl overflow-hidden" style={{ transform: 'rotate(-8deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <Placeholder seed="hero1" aspect="4/5" />
            </div>
            <div className="absolute top-[25%] right-[8%] w-44 h-56 rounded-xl overflow-hidden" style={{ transform: 'rotate(6deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <Placeholder seed="hero2" aspect="4/5" />
            </div>
            <div className="absolute bottom-[20%] left-[12%] w-36 h-36 rounded-xl overflow-hidden" style={{ transform: 'rotate(4deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <Placeholder seed="hero3" aspect="1/1" />
            </div>
            <div className="absolute bottom-[15%] right-[15%] w-40 h-28 rounded-xl overflow-hidden" style={{ transform: 'rotate(-4deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <Placeholder seed="hero4" aspect="16/9" label="sora" />
            </div>
          </div>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(10,10,10,0.4), rgba(10,10,10,0.85) 70%)',
          }} />
        </div>

        <div className="relative max-w-[1320px] mx-auto px-8 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8" style={{ background: 'rgba(180,120,253,0.12)', border: `1px solid rgba(180,120,253,0.3)`, backdropFilter: 'blur(10px)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: TOKENS.accent }} />
            <span className="text-[11px] tracking-wide">Veo 3 и Midjourney v7 — в чате</span>
          </div>
          <h1 className="font-serif tracking-tight leading-[0.92] mb-6" style={{ fontSize: 128, fontWeight: 400 }}>
            Все AI-модели<br/>
            в <em style={{ color: TOKENS.accent }}>одном</em> чате
          </h1>
          <p className="text-[18px] max-w-xl mx-auto mb-10" style={{ color: TOKENS.textMuted }}>
            Midjourney, Sora, Flux, Veo, Kling. Одна цена в поинтах. Без подписок и VPN.
          </p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <button className="px-6 py-3.5 rounded-xl text-[14px] flex items-center gap-2" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 600 }}>
              Попробовать бесплатно →
            </button>
            <button className="px-6 py-3.5 rounded-xl text-[14px]" style={{ background: 'rgba(255,255,255,0.08)', color: TOKENS.text, border: `1px solid ${TOKENS.border}`, backdropFilter: 'blur(10px)' }}>
              Смотреть галерею
            </button>
          </div>
          <div className="text-[12px]" style={{ color: TOKENS.textDim }}>
            50 поинтов в подарок · без карты · ~3 минуты до первой картинки
          </div>
        </div>
      </div>

      {/* Model marquee */}
      <div className="py-10 border-y overflow-hidden" style={{ borderColor: TOKENS.border, background: 'rgba(255,255,255,0.015)' }}>
        <div className="text-center text-[10px] tracking-[0.4em] uppercase mb-6" style={{ color: TOKENS.textDim }}>
          Доступные модели
        </div>
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'marquee 40s linear infinite' }}>
          {[...MODELS, ...MODELS].map((m, i) => (
            <div key={i} className="inline-flex items-center gap-2.5 shrink-0">
              <Placeholder seed={m.slug + 'mq'} aspect="1/1" className="w-8 h-8 rounded-md" />
              <span className="font-serif text-[20px]">{m.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: TOKENS.accent, background: 'rgba(180,120,253,0.08)' }}>
                {m.price} пт
              </span>
              <span className="text-[16px]" style={{ color: TOKENS.textDim }}>·</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* Features */}
      <div className="max-w-[1320px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: TOKENS.textMuted }}>Почему Imagination</div>
          <h2 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 72, fontWeight: 400 }}>
            Студия, <em style={{ color: TOKENS.accent }}>а не зоопарк</em> подписок
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { t: 'Одна цена', d: 'Платите поинтами. 1 пт = 1 ₽. Midjourney — 12 пт, Sora — 80 пт, Flux — 8 пт.', seed: 'f1' },
            { t: 'Без VPN', d: 'Российские реквизиты, СБП, карты. Работает из любой точки.', seed: 'f2' },
            { t: 'История и права', d: 'Всё в одной ленте. Коммерческие права на все генерации.', seed: 'f3' },
          ].map(f => (
            <div key={f.t} className="rounded-[20px] p-7" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
              <Placeholder seed={f.seed} aspect="16/10" className="rounded-lg mb-6" />
              <h3 className="font-serif text-[28px] mb-2 tracking-tight">{f.t}</h3>
              <p className="text-[14px]" style={{ color: TOKENS.textMuted }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-[1320px] mx-auto px-8 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 56, fontWeight: 400 }}>
            Свежие <em style={{ color: TOKENS.accent }}>работы</em> сообщества
          </h2>
          <a className="text-[13px] flex items-center gap-1" style={{ color: TOKENS.accent }}>Вся галерея →</a>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['g1','g2','g3','g4','g5','g6','g7','g8'].map((s, i) => (
            <Placeholder key={s} seed={s} aspect={i % 3 === 0 ? '3/4' : i % 3 === 1 ? '1/1' : '4/3'} label={MODELS[i % MODELS.length].name.toLowerCase()} className="rounded-[12px]" />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[1320px] mx-auto px-8 pb-24">
        <div className="rounded-[24px] p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, #1a0a2e 0%, #2d0a4e 50%, #6b2a8a 100%)`, border: `1px solid rgba(180,120,253,0.3)` }}>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(180,120,253,0.5), transparent 40%), radial-gradient(circle at 80% 20%, rgba(106,223,255,0.3), transparent 40%)',
          }} />
          <div className="relative">
            <h2 className="font-serif tracking-tight leading-[0.95] mb-5" style={{ fontSize: 64, fontWeight: 400 }}>
              Генерируйте <em style={{ color: TOKENS.accent }}>сейчас</em>
            </h2>
            <p className="text-[15px] mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              50 поинтов бесплатно. Этого хватит на 4 картинки в Midjourney или 6 в Flux.
            </p>
            <button className="px-8 py-4 rounded-xl text-[15px]" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 600 }}>
              Начать бесплатно →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── V2: Asymmetric split hero ──
const HomeV2 = () => {
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="home" />
      <div className="max-w-[1320px] mx-auto px-8 pt-16 pb-24 grid grid-cols-12 gap-8 items-center">
        <div className="col-span-7">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: TOKENS.textDim }}>
            Imagination.ai · Creative studio
          </div>
          <h1 className="font-serif tracking-tight leading-[0.88] mb-6" style={{ fontSize: 128, fontWeight: 400 }}>
            Ваша<br/>
            <em style={{ color: TOKENS.accent }}>креативная</em><br/>
            студия
          </h1>
          <p className="text-[17px] leading-relaxed max-w-md mb-8" style={{ color: TOKENS.textMuted }}>
            Midjourney, Sora, Veo, Flux и ещё 6 моделей в одном чате. Платите поинтами — без подписок и VPN.
          </p>
          <div className="flex items-center gap-3 mb-10">
            <button className="px-6 py-3.5 rounded-xl text-[14px]" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 600 }}>
              Начать бесплатно →
            </button>
            <button className="px-6 py-3.5 rounded-xl text-[14px]" style={{ background: 'transparent', color: TOKENS.text, border: `1px solid ${TOKENS.borderStrong}` }}>
              Смотреть работы
            </button>
          </div>
          <div className="flex items-center gap-6 text-[12px]" style={{ color: TOKENS.textMuted }}>
            <div>
              <div className="font-serif text-[28px]" style={{ color: TOKENS.text }}>10+</div>
              <div>моделей</div>
            </div>
            <div>
              <div className="font-serif text-[28px]" style={{ color: TOKENS.text }}>500K</div>
              <div>генераций/мес</div>
            </div>
            <div>
              <div className="font-serif text-[28px]" style={{ color: TOKENS.text }}>50 пт</div>
              <div>подарок</div>
            </div>
          </div>
        </div>
        <div className="col-span-5 relative">
          <div className="rounded-[20px] overflow-hidden relative" style={{ aspectRatio: '4/5', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #2a0a1c 0%, #6b2a8a 50%, #c65d8e 100%)` }} />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
              mixBlendMode: 'overlay',
            }} />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] px-2 py-1 rounded font-mono" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(10px)' }}>
                Midjourney v7
              </span>
              <span className="text-[11px] px-2 py-1 rounded font-mono" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(10px)' }}>
                ▶ 00:08
              </span>
            </div>
          </div>
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-[14px] overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: `2px solid ${TOKENS.bg}` }}>
            <Placeholder seed="homev2-small" aspect="1/1" label="flux" />
          </div>
          <div className="absolute -right-4 top-10 w-24 h-32 rounded-[14px] overflow-hidden" style={{ transform: 'rotate(8deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: `2px solid ${TOKENS.bg}` }}>
            <Placeholder seed="homev2-small2" aspect="3/4" />
          </div>
        </div>
      </div>

      {/* Model cards — big */}
      <div className="max-w-[1320px] mx-auto px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: TOKENS.textMuted }}>Флагманы</div>
            <h2 className="font-serif tracking-tight leading-[0.95]" style={{ fontSize: 64, fontWeight: 400 }}>
              Лучшие <em style={{ color: TOKENS.accent }}>модели</em> — выбирайте
            </h2>
          </div>
          <a className="text-[13px]" style={{ color: TOKENS.accent }}>Все 10 →</a>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {MODELS.filter(m => m.featured).concat([MODELS.find(m => m.slug === 'veo-3')]).slice(0, 3).map(m => (
            <a key={m.slug} className="group rounded-[20px] overflow-hidden transition-all" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
              <Placeholder seed={m.slug + 'big'} aspect="4/5" label={m.name} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[11px]" style={{ color: TOKENS.textDim }}>{m.vendor}</div>
                    <h3 className="font-serif text-[26px] tracking-tight">{m.name}</h3>
                  </div>
                  <span className="font-mono text-[16px]" style={{ color: TOKENS.accent }}>{m.price} пт</span>
                </div>
                <p className="text-[13px]" style={{ color: TOKENS.textMuted }}>{m.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="max-w-[1320px] mx-auto px-8 py-16">
        <div className="grid grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: TOKENS.textMuted }}>Для кого</div>
            <h2 className="font-serif tracking-tight leading-[0.95] mb-4" style={{ fontSize: 56, fontWeight: 400 }}>
              Дизайн, <em style={{ color: TOKENS.accent }}>маркетинг</em>, продакшн
            </h2>
            <p className="text-[15px]" style={{ color: TOKENS.textMuted }}>
              Одна платформа закрывает задачи от мудборда до готового ролика. Без прыжков между 5 подписками.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { t: 'Дизайнеры', d: 'Мудборды, концепт-арт, текстуры', ico: '◐' },
              { t: 'Маркетологи', d: 'Обложки, рекламные креативы, Reels', ico: '◑' },
              { t: 'Продакшн', d: 'Сториборды, B-roll, короткие ролики', ico: '◒' },
              { t: 'SMM', d: 'Контент-план на неделю за вечер', ico: '◓' },
            ].map(u => (
              <div key={u.t} className="flex items-center gap-4 p-4 rounded-[14px]" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-[20px]" style={{ background: `linear-gradient(135deg, ${TOKENS.accent}, #6adfff)`, color: '#1a0a2a' }}>
                  {u.ico}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{u.t}</div>
                  <div className="text-[12px]" style={{ color: TOKENS.textMuted }}>{u.d}</div>
                </div>
                <span className="text-[11px]" style={{ color: TOKENS.textDim }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HomeV1, HomeV2 });
