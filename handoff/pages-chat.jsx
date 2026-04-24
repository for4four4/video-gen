// Chat — two variants
// V1: Midjourney-like studio — model picker as cards, settings panel, grid of 4 variations
// V2: Conversational ChatGPT-like with rich media cards + commands bar

const CHAT_PRESETS = [
  { id: 'ratio', label: 'Соотношение', opts: ['1:1','16:9','9:16','4:5','21:9'], def: '1:1' },
  { id: 'quality', label: 'Качество', opts: ['Draft','Standard','High','Max'], def: 'Standard' },
  { id: 'variants', label: 'Вариантов', opts: ['1','2','4'], def: '4' },
  { id: 'style', label: 'Стиль', opts: ['Auto','Photo','Illustration','3D','Cinematic'], def: 'Auto' },
];

const SAMPLE_HISTORY = [
  { id: 's1', title: 'Cyberpunk street at night', date: 'сейчас', model: 'Midjourney v7', seed: 's1' },
  { id: 's2', title: 'Minimalist foggy mountains', date: '2 ч назад', model: 'Flux Pro', seed: 's2' },
  { id: 's3', title: 'Isometric cozy room 3D', date: 'вчера', model: 'DALL·E 3', seed: 's3' },
  { id: 's4', title: 'Dolly shot through forest', date: 'вчера', model: 'Sora', seed: 's4' },
  { id: 's5', title: 'Editorial fashion studio', date: '3 дн', model: 'Midjourney v7', seed: 's5' },
];

const ModelPill = ({ m, active, onClick, compact }) => (
  <button onClick={onClick} className="shrink-0 text-left transition-all"
    style={{
      padding: compact ? '8px 12px' : '10px 14px',
      borderRadius: 12,
      background: active ? 'rgba(180,120,253,0.14)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? TOKENS.accent : TOKENS.border}`,
    }}>
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md overflow-hidden shrink-0">
        <Placeholder seed={m.slug + 'pill'} aspect="1/1" />
      </div>
      <div>
        <div className="text-[12px] font-medium leading-tight">{m.name}</div>
        <div className="text-[10px] font-mono" style={{ color: active ? TOKENS.accent : TOKENS.textDim }}>
          {m.price} пт · {m.type === 'image' ? 'IMG' : 'VID'}
        </div>
      </div>
    </div>
  </button>
);

const ChatV1 = () => {
  const [activeModel, setActiveModel] = React.useState('midjourney-v7');
  const [settings, setSettings] = React.useState({ ratio: '1:1', quality: 'Standard', variants: '4', style: 'Auto' });
  const [activeChat, setActiveChat] = React.useState('s1');
  const model = MODELS.find(m => m.slug === activeModel);

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="models" />
      <div className="max-w-[1320px] mx-auto px-6 py-6 grid gap-4" style={{ gridTemplateColumns: '240px 1fr 280px', minHeight: 900 }}>
        {/* Sidebar */}
        <aside className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          <div className="p-3" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
            <button className="w-full text-[12px] py-2.5 rounded-md flex items-center justify-center gap-1.5" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>
              <span>+</span> Новая генерация
            </button>
          </div>
          <div className="p-3" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
            <input placeholder="Поиск в истории" className="w-full text-[12px] px-3 py-2 rounded-md outline-none"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}`, color: TOKENS.text }} />
          </div>
          <div className="text-[10px] uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: TOKENS.textDim }}>История</div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {SAMPLE_HISTORY.map(h => (
              <button key={h.id} onClick={() => setActiveChat(h.id)}
                className="w-full text-left px-2 py-2 rounded-md flex gap-2.5 items-center transition-colors"
                style={{ background: activeChat === h.id ? 'rgba(180,120,253,0.1)' : 'transparent' }}>
                <Placeholder seed={h.seed} aspect="1/1" className="w-10 h-10 rounded-md shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] truncate">{h.title}</div>
                  <div className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>{h.model} · {h.date}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
            <div className="rounded-lg p-3" style={{ background: 'rgba(180,120,253,0.08)', border: `1px solid rgba(180,120,253,0.2)` }}>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: TOKENS.textDim }}>Баланс</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-[24px]">1 240</span>
                <span className="text-[11px]" style={{ color: TOKENS.textMuted }}>пт</span>
              </div>
              <button className="w-full mt-2 text-[11px] py-1.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: TOKENS.text }}>Пополнить</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          {/* Model picker */}
          <div className="p-4" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: TOKENS.textDim }}>Модель</span>
              <span className="text-[10px]" style={{ color: TOKENS.textDim }}>· выберите под задачу</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MODELS.map(m => <ModelPill key={m.slug} m={m} active={activeModel === m.slug} onClick={() => setActiveModel(m.slug)} />)}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User prompt */}
            <div className="flex justify-end">
              <div className="max-w-[70%] rounded-[14px] rounded-tr-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${TOKENS.border}` }}>
                <p className="text-[13px]">cyberpunk street at night, neon signs reflecting on wet asphalt, anamorphic lens flares, blade runner style, hyperdetailed</p>
                <div className="flex gap-1.5 mt-2 text-[10px] font-mono" style={{ color: TOKENS.textDim }}>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>16:9</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>High</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)' }}>Cinematic</span>
                </div>
              </div>
            </div>

            {/* Assistant — grid of 4 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)' }} />
              <div className="flex-1 max-w-[620px]">
                <div className="flex items-center gap-2 mb-2 text-[11px]" style={{ color: TOKENS.textMuted }}>
                  <span style={{ color: TOKENS.text }}>{model.name}</span>
                  <span>·</span>
                  <span className="font-mono">сгенерировано 4 варианта</span>
                  <span>·</span>
                  <span className="font-mono">{model.price * 4} пт</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 rounded-[12px] overflow-hidden" style={{ border: `1px solid ${TOKENS.border}` }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} className="relative group cursor-pointer">
                      <Placeholder seed={'cyber' + i} aspect="16/9" />
                      <div className="absolute inset-0 flex items-end justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)' }}>
                        <span className="text-[9px] font-mono">V{i+1}</span>
                        <div className="flex gap-1">
                          {['↑','⤢','↓'].map((c, n) => (
                            <span key={n} className="w-6 h-6 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid rgba(255,255,255,0.15)` }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2.5 text-[11px]">
                  {['Upscale V1','Upscale V2','Upscale V3','Upscale V4','Вариации','Remix'].map(b => (
                    <button key={b} className="px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>{b}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
            <div className="rounded-[14px] p-3" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <button className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${TOKENS.border}` }}>
                  <span className="text-[14px]">+</span>
                </button>
                <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: TOKENS.textDim }}>
                  <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(180,120,253,0.12)', color: TOKENS.accent }}>/imagine</span>
                  <span>или вставьте референс</span>
                </div>
                <div className="ml-auto text-[11px]" style={{ color: TOKENS.textDim }}>
                  будет списано <span style={{ color: TOKENS.accent, fontWeight: 600 }}>{model.price * parseInt(settings.variants)} пт</span>
                </div>
              </div>
              <textarea placeholder={`Опишите что нужно сгенерировать в ${model.name}...`} rows={2}
                className="w-full bg-transparent text-[14px] outline-none resize-none" style={{ color: TOKENS.text }}
                defaultValue="editorial fashion photography, high contrast lighting, vogue style" />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5 text-[10px]">
                  <span className="px-2 py-1 rounded font-mono" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>Enter</span>
                  <span style={{ color: TOKENS.textDim }}>отправить</span>
                  <span className="ml-2 px-2 py-1 rounded font-mono" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>/</span>
                  <span style={{ color: TOKENS.textDim }}>команды</span>
                </div>
                <button className="text-[12px] px-5 py-2 rounded-md flex items-center gap-1.5" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>
                  Генерировать →
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Settings panel */}
        <aside className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          <div className="p-4" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: TOKENS.textDim }}>Настройки</div>
            <div className="flex items-center gap-2">
              <Placeholder seed={model.slug + 'sett'} aspect="1/1" className="w-10 h-10 rounded-md" />
              <div>
                <div className="text-[13px] font-medium">{model.name}</div>
                <div className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>{model.vendor}</div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {CHAT_PRESETS.map(p => (
              <div key={p.id}>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: TOKENS.textDim }}>{p.label}</div>
                <div className="flex flex-wrap gap-1">
                  {p.opts.map(o => (
                    <button key={o} onClick={() => setSettings(s => ({ ...s, [p.id]: o }))}
                      className="text-[11px] px-2.5 py-1.5 rounded-md transition-all"
                      style={{
                        background: settings[p.id] === o ? TOKENS.accent : 'rgba(255,255,255,0.04)',
                        color: settings[p.id] === o ? '#1a0a2a' : TOKENS.textMuted,
                        border: `1px solid ${settings[p.id] === o ? TOKENS.accent : TOKENS.border}`,
                        fontWeight: settings[p.id] === o ? 600 : 400,
                      }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: TOKENS.textDim }}>Seed</div>
              <input defaultValue="auto" className="w-full text-[12px] font-mono px-3 py-2 rounded-md outline-none" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}`, color: TOKENS.text }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: TOKENS.textDim }}>Референс</div>
              <div className="aspect-video rounded-md flex items-center justify-center text-[11px] cursor-pointer" style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${TOKENS.borderStrong}`, color: TOKENS.textDim }}>
                + перетащите картинку
              </div>
            </div>
          </div>
          <div className="p-4" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span style={{ color: TOKENS.textMuted }}>Стоимость</span>
              <span className="font-mono text-[16px]" style={{ color: TOKENS.accent }}>{model.price * parseInt(settings.variants)} пт</span>
            </div>
            <div className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>
              {model.price} пт × {settings.variants} вариантов × {settings.quality === 'Max' ? 1.5 : 1}×
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ── V2: Conversational style, single panel, rich results gallery ──
const ChatV2 = () => {
  const [activeModel, setActiveModel] = React.useState('sora');
  const model = MODELS.find(m => m.slug === activeModel);
  const [hist, setHist] = React.useState('s2');

  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: '100%' }}>
      <BrandHeader active="models" />
      <div className="max-w-[1320px] mx-auto px-6 py-6 grid gap-4" style={{ gridTemplateColumns: '280px 1fr', minHeight: 900 }}>
        {/* Sidebar with preview cards */}
        <aside className="rounded-[18px] p-3 overflow-hidden flex flex-col" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          <button className="w-full text-[12px] py-2.5 rounded-md mb-3 flex items-center justify-center gap-1.5" style={{ background: TOKENS.text, color: TOKENS.bg, fontWeight: 500 }}>
            <span>+</span> Новый чат
          </button>
          <div className="flex gap-1 mb-3 text-[11px]">
            <button className="flex-1 py-1.5 rounded-md" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>Все</button>
            <button className="flex-1 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>★</button>
            <button className="flex-1 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>IMG</button>
            <button className="flex-1 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}>VID</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {SAMPLE_HISTORY.map(h => (
              <button key={h.id} onClick={() => setHist(h.id)} className="w-full rounded-[10px] overflow-hidden text-left transition-all" style={{ background: hist === h.id ? 'rgba(180,120,253,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${hist === h.id ? 'rgba(180,120,253,0.3)' : TOKENS.border}` }}>
                <div className="grid grid-cols-4 gap-0.5">
                  {[0,1,2,3].map(i => <Placeholder key={i} seed={h.seed + i} aspect="1/1" />)}
                </div>
                <div className="p-2.5">
                  <div className="text-[12px] truncate leading-tight">{h.title}</div>
                  <div className="flex items-center gap-1 text-[10px] font-mono mt-1" style={{ color: TOKENS.textDim }}>
                    <span style={{ color: TOKENS.accent }}>●</span>{h.model}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(180,120,253,0.08)', border: `1px solid rgba(180,120,253,0.2)` }}>
            <div>
              <div className="text-[10px]" style={{ color: TOKENS.textDim }}>Баланс</div>
              <div className="font-serif text-[18px]">1 240 <span className="text-[11px]" style={{ color: TOKENS.textMuted }}>пт</span></div>
            </div>
            <button className="text-[11px] px-3 py-1.5 rounded" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>+</button>
          </div>
        </aside>

        {/* Chat */}
        <main className="rounded-[18px] overflow-hidden flex flex-col" style={{ background: TOKENS.card, border: `1px solid ${TOKENS.border}` }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
            <div className="flex items-center gap-3">
              <Placeholder seed={model.slug + 'tb'} aspect="1/1" className="w-8 h-8 rounded-md" />
              <div>
                <div className="text-[13px] font-medium">{model.name}</div>
                <div className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>{model.price} пт / генерация · {model.vendor}</div>
              </div>
              <button className="text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>
                Сменить ↓
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span style={{ color: TOKENS.textDim }}>Баланс:</span>
              <span className="font-mono" style={{ color: TOKENS.accent }}>1 240 пт</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* User */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-[72%] rounded-[14px] rounded-tr-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${TOKENS.border}` }}>
                <p className="text-[13px] mb-2">smooth dolly shot moving forward through a misty forest, golden hour, cinematic 35mm, slow camera movement</p>
                <div className="flex items-center gap-1.5">
                  <Placeholder seed="ref1" aspect="1/1" className="w-12 h-12 rounded-md" />
                  <span className="text-[10px] font-mono" style={{ color: TOKENS.textDim }}>reference.jpg</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: '#2a2a2a', border: `1px solid ${TOKENS.border}` }} />
            </div>

            {/* Assistant, video model → single video card */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)' }} />
              <div className="flex-1 max-w-[640px]">
                <div className="rounded-[14px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}` }}>
                  <div className="relative">
                    <Placeholder seed="forest-dolly" aspect="16/9" label="sora · 10s · 1080p" />
                    <button className="absolute inset-0 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', border: `1.5px solid rgba(255,255,255,0.5)`, backdropFilter: 'blur(6px)' }}>
                        <span className="text-[20px] text-white">▶</span>
                      </span>
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-[10px] text-white/80 font-mono">
                      <span>00:00</span>
                      <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full w-1/3 rounded-full" style={{ background: '#fff' }} />
                      </div>
                      <span>00:10</span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(180,120,253,0.15)', color: TOKENS.accent, border: `1px solid rgba(180,120,253,0.3)` }}>Sora</span>
                      <span className="text-[11px]" style={{ color: TOKENS.textMuted }}>80 пт списано</span>
                    </div>
                    <div className="flex gap-1 text-[11px]">
                      {['Скачать','Продлить','Вариации','Remix'].map(b => (
                        <button key={b} className="px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>{b}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User: slash command */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-[60%] rounded-[14px] rounded-tr-sm px-4 py-2.5" style={{ background: 'rgba(180,120,253,0.1)', border: `1px solid rgba(180,120,253,0.3)` }}>
                <p className="text-[13px] font-mono" style={{ color: TOKENS.accent }}>/extend +5s</p>
              </div>
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: '#2a2a2a', border: `1px solid ${TOKENS.border}` }} />
            </div>

            {/* Typing */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: 'conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)' }} />
              <div className="rounded-[14px] px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${TOKENS.border}` }}>
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: TOKENS.accent, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
                <span className="text-[12px]" style={{ color: TOKENS.textMuted }}>генерирую продолжение ролика</span>
                <span className="text-[11px] font-mono" style={{ color: TOKENS.textDim }}>~25 сек</span>
              </div>
            </div>
            <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8) } 50% { opacity: 1; transform: scale(1.2) } }`}</style>
          </div>

          {/* Command palette suggestion */}
          <div className="px-5 py-2 flex items-center gap-2 text-[11px] overflow-x-auto" style={{ borderTop: `1px solid ${TOKENS.border}`, background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ color: TOKENS.textDim }}>Команды:</span>
            {['/imagine','/upscale','/vary','/extend','/remix','/describe','/preset'].map(c => (
              <button key={c} className="px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>{c}</button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
            <div className="rounded-[14px] flex items-center gap-2 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${TOKENS.border}` }}>
              <button className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted }}>
                <span>📎</span>
              </button>
              <input placeholder="Опишите сцену или введите / для команд" className="flex-1 bg-transparent text-[14px] outline-none px-1" style={{ color: TOKENS.text }} defaultValue="" />
              <div className="flex items-center gap-2 text-[11px] pr-1" style={{ color: TOKENS.textDim }}>
                <span>1:1</span><span>·</span><span>High</span><span>·</span>
                <span className="font-mono" style={{ color: TOKENS.accent }}>{model.price} пт</span>
              </div>
              <button className="px-4 py-2 rounded-md text-[12px]" style={{ background: TOKENS.accent, color: '#1a0a2a', fontWeight: 600 }}>Отправить</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

Object.assign(window, { ChatV1, ChatV2 });
