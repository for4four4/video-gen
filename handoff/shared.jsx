// Shared tokens, primitives and data for Imagination AI redesign

const TOKENS = {
  bg: '#0a0a0a',
  bgElev: '#0f0f10',
  card: '#121214',
  cardHover: '#17171a',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#fafafa',
  textMuted: 'rgba(250,250,250,0.62)',
  textDim: 'rgba(250,250,250,0.42)',
  accent: '#b478fd',
  accentStrong: '#c49bff',
  accentSoft: 'rgba(180,120,253,0.12)',
  radius: 14,
};

// ──────── Placeholder (Midjourney-ish swatch) ────────
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)',
  'linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)',
  'linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)',
  'linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)',
  'linear-gradient(135deg, #2a0a1c 0%, #8a2a4e 50%, #f4a5c0 100%)',
  'linear-gradient(150deg, #1c1c2e 0%, #4a4a7a 50%, #b0b0d0 100%)',
  'linear-gradient(135deg, #3a1a0f 0%, #8a3a1a 50%, #f5b078 100%)',
  'linear-gradient(140deg, #0a1a2a 0%, #1a3a5a 50%, #5a8aba 100%)',
  'linear-gradient(135deg, #2e1a3a 0%, #5a2a6e 50%, #b47adc 100%)',
  'linear-gradient(145deg, #1a2a1a 0%, #4a6a3a 50%, #c0d48a 100%)',
  'linear-gradient(135deg, #3a2e1a 0%, #7a6a3a 50%, #e8d898 100%)',
  'linear-gradient(150deg, #2a1a2e 0%, #6a3a5a 50%, #d88aaa 100%)',
];

const gradFor = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[h % PLACEHOLDER_GRADIENTS.length];
};

const Placeholder = ({ seed = 'x', label, aspect = '1/1', className = '', style = {}, children }) => {
  const grad = gradFor(seed);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspect,
        background: grad,
        ...style,
      }}
    >
      {/* subtle diagonal stripes */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)',
        }}
      />
      {/* noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {label && (
        <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur text-[9px] font-mono tracking-tight text-white/80 uppercase">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

// ──────── Brand Header (miniature for artboards) ────────
const BrandHeader = ({ active = 'models', compact = true }) => {
  const links = [
    { id: 'models', label: 'Модели' },
    { id: 'pricing', label: 'Тарифы' },
    { id: 'blog', label: 'Блог' },
    { id: 'news', label: 'Новости' },
  ];
  return (
    <div
      className="sticky top-0 z-30 w-full"
      style={{
        background: 'rgba(10,10,10,0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${TOKENS.border}`,
      }}
    >
      <div className="max-w-[1320px] mx-auto h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background:
                'conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)',
              filter: 'blur(0.3px)',
            }}
          />
          <span className="font-serif text-[17px] tracking-tight">
            Imagination<span style={{ color: TOKENS.accent }}>.ai</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.id}
              className="text-[13px] transition-colors"
              style={{
                color: active === l.id ? TOKENS.text : TOKENS.textMuted,
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}` }}
          >
            <span style={{ color: TOKENS.textMuted }}>Баланс</span>
            <span style={{ color: TOKENS.accent, fontWeight: 600 }}>1 240 пт</span>
          </div>
          <button
            className="text-[12px] px-3 py-1.5 rounded-md"
            style={{
              background: TOKENS.text,
              color: TOKENS.bg,
              fontWeight: 500,
            }}
          >
            Открыть чат
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────── Data ────────
const MODELS = [
  { slug: 'midjourney-v7', name: 'Midjourney v7', type: 'image', vendor: 'Midjourney', price: 12, speed: 'medium', desc: 'Эталон фотореалистичной и художественной генерации.', long: 'Флагман для постеров, концепт-арта и fashion. Непревзойдённая художественность.', tags: ['арт','фотореализм','постеры'], featured: true, popularity: 98 },
  { slug: 'flux-pro', name: 'Flux Pro', type: 'image', vendor: 'Black Forest Labs', price: 8, speed: 'fast', desc: 'Молниеносная генерация с филигранной детализацией.', long: 'Быстрая модель с отличной читаемостью текста на изображениях.', tags: ['скорость','текст','детали'], popularity: 92 },
  { slug: 'dalle-3', name: 'DALL·E 3', type: 'image', vendor: 'OpenAI', price: 10, speed: 'medium', desc: 'Понимает сложные промпты буквально.', long: 'Интерпретирует длинные промпты с сохранением деталей.', tags: ['промпт','иллюстрация'], popularity: 85 },
  { slug: 'stable-diffusion-xl', name: 'Stable Diffusion XL', type: 'image', vendor: 'Stability AI', price: 5, speed: 'fast', desc: 'Открытая модель с безграничной кастомизацией.', long: 'SDXL с поддержкой LoRA и тонкой настройки стиля.', tags: ['open-source','стиль'], popularity: 76 },
  { slug: 'sora', name: 'Sora', type: 'video', vendor: 'OpenAI', price: 80, speed: 'slow', desc: 'Кинематографичное видео из текста.', long: 'До 20 секунд видео с консистентной физикой и сюжетом.', tags: ['t2v','кино'], featured: true, popularity: 97 },
  { slug: 'veo-3', name: 'Veo 3', type: 'video', vendor: 'Google DeepMind', price: 90, speed: 'slow', desc: '1080p видео с синхронным звуком.', long: 'Естественное движение камеры и встроенная аудиодорожка.', tags: ['1080p','звук'], popularity: 94 },
  { slug: 'kling-2', name: 'Kling 2', type: 'video', vendor: 'Kuaishou', price: 60, speed: 'medium', desc: 'Реалистичное движение и динамика.', long: 'Плавность движения людей и животных для рекламы.', tags: ['движение','реклама'], popularity: 81 },
  { slug: 'runway-gen3', name: 'Runway Gen-3', type: 'video', vendor: 'Runway', price: 70, speed: 'medium', desc: 'Кинематограф для творцов.', long: 'Полный контроль над камерой и стилем для кино и клипов.', tags: ['клипы','контроль'], popularity: 88 },
];

const BLOG = [
  { slug:'midjourney-vs-flux', title:'Midjourney vs Flux: что выбрать в 2025', excerpt:'Сравниваем две топовые модели по качеству, скорости и цене. 20 генераций одного промпта, разбор артефактов и вердикт по ценам.', date:'2025-04-01', category:'Сравнения', read:8, author:'Лена Орлова', featured:true },
  { slug:'video-ai-guide', title:'Гид по видео-нейросетям: Sora, Veo, Kling', excerpt:'Полный обзор актуальных моделей для генерации видео — где лучше движение, где звук, где сюжет.', date:'2025-03-25', category:'Гайды', read:12, author:'Дима Лавров' },
  { slug:'prompt-engineering', title:'Промпт-инжиниринг для изображений', excerpt:'Как структурировать описание сцены, чтобы получать именно то, что задумано.', date:'2025-03-18', category:'Туториалы', read:6, author:'Аня Верт' },
  { slug:'commercial-use', title:'Можно ли использовать AI-арт коммерчески', excerpt:'Разбираемся с правами на генерации — что можно, что нельзя, какие модели накладывают ограничения.', date:'2025-03-10', category:'Право', read:5, author:'Юр. отдел' },
  { slug:'lighting-recipes', title:'10 рецептов освещения в промптах', excerpt:'Готовые формулы, которые превращают плоскую картинку в постер.', date:'2025-03-02', category:'Туториалы', read:9, author:'Лена Орлова' },
  { slug:'aspect-ratios', title:'Какое соотношение сторон выбрать', excerpt:'21:9 для кино, 4:5 для Instagram, 9:16 для Reels. Когда и почему.', date:'2025-02-24', category:'Гайды', read:4, author:'Дима Лавров' },
];

const NEWS = [
  { slug:'veo3-launch', title:'Veo 3 теперь в Imagination', excerpt:'Подключили флагманскую видео-модель Google DeepMind с поддержкой звука.', date:'2025-04-15', tag:'release', model:'Veo 3' },
  { slug:'midjourney-v7', title:'Midjourney v7 — новый эталон', excerpt:'Обновили модель до v7. Качество выросло, цена осталась прежней.', date:'2025-04-08', tag:'update', model:'Midjourney' },
  { slug:'flux-pro-update', title:'Flux Pro: ускорение в 2 раза', excerpt:'Чёрный лес апдейтнул архитектуру. Генерация теперь быстрее.', date:'2025-03-30', tag:'update', model:'Flux Pro' },
  { slug:'kling-2', title:'Kling 2 в каталоге', excerpt:'Добавили обновлённую версию Kling с улучшенной физикой движения.', date:'2025-03-22', tag:'release', model:'Kling' },
  { slug:'ref-program', title:'Реферальная программа: +10% за друга', excerpt:'Приглашайте коллег — получайте поинты.', date:'2025-03-15', tag:'platform' },
  { slug:'api-beta', title:'API в открытом бета-тесте', excerpt:'Генерируйте из кода. Документация и ключи в дашборде.', date:'2025-03-05', tag:'platform' },
];

Object.assign(window, { TOKENS, Placeholder, gradFor, BrandHeader, MODELS, BLOG, NEWS });
