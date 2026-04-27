import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const COOKIE_KEY = 'imagination_cookie_choice';

export interface CookieChoice {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

/** Read saved cookie choice from localStorage */
export const getCookieChoice = (): CookieChoice | null => {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Check if analytics is consented */
export const isAnalyticsConsented = (): boolean => {
  const choice = getCookieChoice();
  return choice?.analytics === true;
};

/** Check if marketing is consented */
export const isMarketingConsented = (): boolean => {
  const choice = getCookieChoice();
  return choice?.marketing === true;
};

const CookieBanner = () => {
  const [state, setState] = useState<'pill' | 'banner' | 'settings'>(() => {
    const saved = getCookieChoice();
    return saved ? 'pill' : 'banner';
  });

  const [prefs, setPrefs] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  const save = useCallback((choice: Omit<CookieChoice, 'ts'>) => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...choice, ts: Date.now() }));
    } catch {}
    setState('pill');
    // Dispatch event so analytics scripts can check
    window.dispatchEvent(new CustomEvent('cookie_consent_updated'));
  }, []);

  const acceptAll = () => save({ necessary: true, functional: true, analytics: true, marketing: true });
  const acceptNecessary = () => save({ necessary: true, functional: false, analytics: false, marketing: false });
  const acceptCustom = () => save(prefs);
  const togglePref = (k: string) => setPrefs(p => ({ ...p, [k]: !(p as any)[k] }));

  // ── Pill (collapsed, bottom-left) ──
  if (state === 'pill') {
    return (
      <button onClick={() => setState('banner')}
        className="fixed bottom-4 left-4 flex items-center gap-2 px-3.5 py-2.5 rounded-full text-[12px] transition-all hover:scale-[1.03]"
        style={{
          background: 'rgba(15,15,16,0.85)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          color: '#fafafa',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 50,
        }}>
        <span className="w-5 h-5 rounded-full flex items-center justify-center font-display text-[13px]"
          style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))', border: '1px solid rgba(180,120,253,0.3)' }}>◉</span>
        <span style={{ color: 'rgba(250,250,250,0.62)' }}>cookie</span>
        <span>настройки</span>
      </button>
    );
  }

  // ── Settings modal ──
  if (state === 'settings') {
    const cats = [
      { id: 'necessary', t: 'Необходимые', desc: 'Авторизация, корзина, безопасность. Без них сайт не работает.', locked: true },
      { id: 'functional', t: 'Функциональные', desc: 'Запоминают язык, тему, настройки UI и предпочтения.' },
      { id: 'analytics', t: 'Аналитические', desc: 'Яндекс.Метрика — обезличенная статистика, помогает улучшать сервис.' },
      { id: 'marketing', t: 'Маркетинговые', desc: 'Ретаргетинг и контекстная реклама на сторонних площадках.' },
    ];

    return (
      <div className="fixed inset-0 flex items-center justify-center px-4" style={{ zIndex: 60 }}>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setState('banner')} />
        <div className="relative rounded-[20px] w-full max-w-[640px] max-h-[80vh] overflow-hidden flex flex-col"
          style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(180,120,253,0.04)' }}>
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase" style={{ color: 'hsl(var(--accent))' }}>Cookie · настройки</div>
              <div className="font-display text-[24px] mt-0.5">Управление согласием</div>
            </div>
            <button onClick={() => setState('banner')} className="w-8 h-8 rounded-full flex items-center justify-center text-[18px]"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(250,250,250,0.62)', border: '1px solid rgba(255,255,255,0.08)' }}>×</button>
          </div>

          {/* Categories */}
          <div className="overflow-y-auto p-5 space-y-2.5" style={{ flex: 1 }}>
            {cats.map(c => {
              const on = (prefs as any)[c.id];
              return (
                <div key={c.id} className="rounded-[14px] p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[14px]">{c.t}</span>
                        {c.locked && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(250,250,250,0.42)', border: '1px solid rgba(255,255,255,0.08)' }}>всегда</span>
                        )}
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(250,250,250,0.62)' }}>{c.desc}</p>
                    </div>
                    {/* Toggle */}
                    <button disabled={c.locked} onClick={() => !c.locked && togglePref(c.id)}
                      className="relative shrink-0 transition-all"
                      style={{
                        width: 38, height: 22, borderRadius: 999,
                        background: on ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${on ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.08)'}`,
                        cursor: c.locked ? 'not-allowed' : 'pointer',
                        opacity: c.locked ? 0.6 : 1,
                      }}>
                      <span className="absolute top-[1px] transition-all" style={{
                        left: on ? 18 : 2,
                        width: 16, height: 16, borderRadius: 999,
                        background: on ? '#1a0a2a' : '#fff',
                      }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
            <button onClick={acceptNecessary} className="py-2.5 rounded-md text-[12px]"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
              Только нужные
            </button>
            <button onClick={acceptCustom} className="py-2.5 rounded-md text-[12px]"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
              Сохранить выбор
            </button>
            <button onClick={acceptAll} className="py-2.5 rounded-md text-[12px]"
              style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
              Принять все
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Banner (default) ──
  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-[760px] rounded-[18px] p-5 grid grid-cols-12 gap-5 items-center"
      style={{
        background: 'rgba(15,15,16,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: '#fafafa',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,120,253,0.08)',
        zIndex: 50,
      }}>
      <div className="col-span-12 sm:col-span-7">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-6 h-6 rounded-full flex items-center justify-center font-display text-[14px]"
            style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))', border: '1px solid rgba(180,120,253,0.3)' }}>◉</span>
          <span className="text-[10px] tracking-[0.28em] uppercase" style={{ color: 'rgba(250,250,250,0.62)' }}>Cookie</span>
        </div>
        <div className="font-display text-[20px] leading-tight mb-1">
          Мы используем <em style={{ color: 'hsl(var(--accent))' }}>cookie</em>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(250,250,250,0.62)' }}>
          Необходимые работают всегда. Аналитические и маркетинговые — по вашему выбору.{' '}
          <Link to="/legal/cookies" style={{ color: '#fafafa', textDecoration: 'underline', textUnderlineOffset: 3 }}>Подробнее</Link>
        </p>
      </div>
      <div className="col-span-12 sm:col-span-5 grid grid-cols-1 gap-1.5">
        <button onClick={acceptAll} className="py-2.5 rounded-md text-[12px]"
          style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
          Принять все
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={acceptNecessary} className="py-2 rounded-md text-[11px]"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Отклонить
          </button>
          <button onClick={() => setState('settings')} className="py-2 rounded-md text-[11px]"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Настроить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
