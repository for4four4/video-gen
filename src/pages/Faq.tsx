import SiteLayout from "@/components/layout/SiteLayout";
import { FAQ_DATA } from "@/data/content";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const TOTAL_QS = FAQ_DATA.reduce((s, c) => s + c.items.length, 0);

const FaqPage = () => {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(0);
  const [search, setSearch] = useState('');
  const cat = FAQ_DATA[active];

  useEffect(() => {
    document.title = "Вопросы и ответы — Imagination AI";

    // JSON-LD FAQPage
    const allItems = FAQ_DATA.flatMap(c => c.items);
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allItems.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a,
        },
      })),
    });
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, []);

  // Filter items by search
  const filteredItems = search.trim()
    ? cat.items.filter(it => it.q.toLowerCase().includes(search.toLowerCase()) || it.a.toLowerCase().includes(search.toLowerCase()))
    : cat.items;

  return (
    <SiteLayout>
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 420,
        background: 'radial-gradient(ellipse at 20% 0%, rgba(180,120,253,0.14), transparent 55%)' }} />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-28 pb-24">
        {/* Hero */}
        <div className="grid grid-cols-12 gap-10 items-end mb-14">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>Вопросы и ответы · {TOTAL_QS} тем</div>
            <h1 className="font-display tracking-tight leading-[0.92]" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 400 }}>
              Что нужно <em style={{ color: 'hsl(var(--accent))' }}>знать</em>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 pb-3">
            <div className="rounded-xl flex items-center px-4 py-3" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-mono text-[14px]" style={{ color: 'rgba(250,250,250,0.62)' }}>&#x2315;</span>
              <input
                className="flex-1 ml-3 bg-transparent outline-none text-[14px]"
                placeholder="Найти ответ..."
                style={{ color: '#fafafa' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar categories */}
          <aside className="col-span-12 md:col-span-3">
            <div className="text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.42)' }}>Разделы</div>
            <div className="space-y-1">
              {FAQ_DATA.map((c, i) => (
                <button key={c.cat} onClick={() => { setActive(i); setOpen(0); setSearch(''); }}
                  className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-[13px] transition-all"
                  style={{
                    background: active === i ? 'rgba(180,120,253,0.12)' : 'transparent',
                    color: active === i ? '#fafafa' : 'rgba(250,250,250,0.62)',
                    border: `1px solid ${active === i ? 'rgba(180,120,253,0.3)' : 'transparent'}`,
                  }}>
                  <span>{c.cat}</span>
                  <span className="font-mono text-[10px]" style={{ color: active === i ? 'hsl(var(--accent))' : 'rgba(250,250,250,0.42)' }}>{c.items.length}</span>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-[16px] p-5" style={{ background: 'linear-gradient(180deg, rgba(180,120,253,0.12), rgba(180,120,253,0.02))', border: '1px solid rgba(180,120,253,0.3)' }}>
              <div className="font-display text-[22px] leading-tight mb-2">Не нашли ответ?</div>
              <p className="text-[12px] mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>Напишите в поддержку — отвечаем за ~15 минут.</p>
              <Link to="/contacts" className="block w-full py-2 rounded-md text-[12px] text-center" style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
                Спросить →
              </Link>
            </div>
          </aside>

          {/* Accordion */}
          <section className="col-span-12 md:col-span-9">
            <div className="flex items-baseline justify-between mb-7">
              <h2 className="font-display tracking-tight" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400 }}>
                {cat.cat}
              </h2>
              <span className="text-[11px] font-mono" style={{ color: 'rgba(250,250,250,0.42)' }}>{filteredItems.length} вопросов</span>
            </div>

            <div>
              {filteredItems.map((it, i) => {
                const isOpen = open === i;
                return (
                  <div key={i} className="py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex justify-between items-start py-5 text-left gap-6">
                      <span className="font-display text-[22px] leading-tight" style={{ color: isOpen ? '#fafafa' : 'rgba(250,250,250,0.62)' }}>
                        {it.q}
                      </span>
                      <span className="text-[24px] font-mono mt-1 flex-shrink-0" style={{ color: isOpen ? 'hsl(var(--accent))' : 'rgba(250,250,250,0.42)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>+</span>
                    </button>
                    {isOpen && (
                      <div className="pb-6 pr-12 text-[14px] leading-relaxed" style={{ color: 'rgba(250,250,250,0.62)' }}>
                        {it.a}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="py-10 text-center text-[14px]" style={{ color: 'rgba(250,250,250,0.42)' }}>
                  Ничего не найдено. Попробуйте другой запрос.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default FaqPage;
