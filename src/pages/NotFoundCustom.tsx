import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const POPULAR_LINKS = [
  { id: '/', label: 'Главная', desc: 'Лендинг и hero' },
  { id: '/models', label: 'Каталог моделей', desc: '8 моделей · от 5 пт' },
  { id: '/chat', label: 'Чат-студия', desc: 'Где живёт магия' },
  { id: '/pricing', label: 'Тарифы', desc: 'Pay-as-you-go' },
  { id: '/blog', label: 'Блог', desc: 'Гайды и сравнения' },
  { id: '/contacts', label: 'Контакты', desc: 'Поддержка ~15 мин' },
];

const NotFoundPage = () => {
  const location = useLocation();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    document.title = "404 — Страница не найдена — Imagination AI";
    // noindex
    let meta = document.querySelector("meta[name='robots']");
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "robots"); document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    setLogged(authService.isAuthenticated());

    return () => {
      const m = document.querySelector("meta[name='robots']");
      if (m) m.setAttribute("content", "index, follow");
    };
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-clip">
      <Header />
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 600,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(180,120,253,0.18), transparent 65%)' }} />

      <main className="relative z-10 flex-1 pt-16">
        <div className="max-w-[1200px] mx-auto px-8 pt-20 pb-24">
          <div className="grid grid-cols-12 gap-10 items-start mb-16">
            <div className="col-span-12 md:col-span-7">
              <div className="text-[11px] tracking-[0.28em] uppercase mb-5" style={{ color: 'hsl(var(--accent))' }}>
                Ошибка · 404 · страница не найдена
              </div>
              <h1 className="font-display tracking-tight leading-[0.85]" style={{ fontSize: 'clamp(96px, 16vw, 220px)', fontWeight: 400 }}>
                4<em style={{ color: 'hsl(var(--accent))' }}>0</em>4
              </h1>
              <h2 className="font-display tracking-tight leading-[0.95] mt-4" style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 400 }}>
                Эту картинку мы <em style={{ color: 'hsl(var(--accent))' }}>не сгенерировали</em>
              </h2>
              <p className="mt-6 text-[15px] max-w-md" style={{ color: 'rgba(250,250,250,0.62)' }}>
                Страница либо переехала, либо никогда не существовала. Это бывает. Промпт неудачный — попробуйте другой.
              </p>
              <div className="flex gap-3 mt-8">
                <Link to="/" className="px-6 py-3 rounded-xl text-[14px]" style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
                  ← На главную
                </Link>
                {logged && (
                  <Link to="/chat" className="px-6 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.14)' }}>
                    Открыть чат
                  </Link>
                )}
              </div>
            </div>

            {/* Mock generation card */}
            <div className="col-span-12 md:col-span-5">
              <div className="rounded-[20px] p-5" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(250,250,250,0.42)' }}>Промпт #404</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,80,80,0.15)', color: '#ff8a8a' }}>не найдено</span>
                </div>
                <div className="rounded-lg p-3 mb-4 font-mono text-[12px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(250,250,250,0.62)' }}>
                  /imagine prompt: <span style={{ color: '#fafafa' }}>page that does not exist</span>, lost url, broken link --ar 1:1
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="aspect-square rounded-md flex items-center justify-center font-display text-[42px] relative overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(255,255,255,0.15)', color: 'rgba(250,250,250,0.42)' }}>
                      <span style={{ opacity: 0.4 }}>?</span>
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(180,120,253,0.04) 12px 24px)',
                      }} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono" style={{ color: 'rgba(250,250,250,0.42)' }}>
                  <span>code 404 · url {location.pathname}</span>
                  <Link to="/" style={{ color: 'hsl(var(--accent))' }}>↻ перегенерировать</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested pages */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'rgba(250,250,250,0.62)' }}>Куда можно пойти</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(250,250,250,0.42)' }}>популярные страницы</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {POPULAR_LINKS.map(l => (
                <Link key={l.id} to={l.id} className="group rounded-[14px] p-5 flex items-center justify-between transition-all"
                  style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div className="font-display text-[20px] leading-tight">{l.label}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'rgba(250,250,250,0.62)' }}>{l.desc}</div>
                  </div>
                  <span className="text-[18px] transition-transform group-hover:translate-x-1" style={{ color: 'hsl(var(--accent))' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;
