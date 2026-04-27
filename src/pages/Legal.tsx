import SiteLayout from "@/components/layout/SiteLayout";
import { LEGAL_DOCS, DOC_LIST } from "@/data/content";
import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

type DocId = 'offer' | 'privacy' | 'usage' | 'cookies';

const LegalPage = () => {
  const { doc: docParam } = useParams<{ doc: string }>();
  const navigate = useNavigate();

  const doc: DocId = (docParam && docParam in LEGAL_DOCS) ? docParam as DocId : 'offer';
  const d = LEGAL_DOCS[doc];

  useEffect(() => {
    document.title = `${d.title} — Imagination AI`;

    // canonical + robots
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.setAttribute("href", `https://imagination-ai.ru/legal/${doc}`);
  }, [doc, d.title]);

  const switchDoc = (id: string) => {
    navigate(`/legal/${id}`, { replace: true });
  };

  return (
    <SiteLayout>
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 360,
        background: 'radial-gradient(ellipse at 30% 0%, rgba(180,120,253,0.10), transparent 60%)' }} />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-28 pb-24">
        {/* Hero */}
        <div className="grid grid-cols-12 gap-10 items-end mb-12">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>Юридические документы</div>
            <h1 className="font-display tracking-tight leading-[0.92]" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 400 }}>
              Чёрным по <em style={{ color: 'hsl(var(--accent))' }}>белому</em>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 pb-3 text-[14px] leading-relaxed" style={{ color: 'rgba(250,250,250,0.62)' }}>
            Документы, регулирующие отношения между вами и платформой. Все актуальные версии — здесь. Архив старых редакций — по запросу.
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar TOC */}
          <aside className="col-span-12 md:col-span-3">
            <div className="md:sticky md:top-20">
              <div className="text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.42)' }}>Документы</div>
              <div className="space-y-1">
                {DOC_LIST.map(item => (
                  <button key={item.id} onClick={() => switchDoc(item.id)}
                    className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-[13px] transition-all"
                    style={{
                      background: doc === item.id ? 'rgba(180,120,253,0.12)' : 'transparent',
                      color: doc === item.id ? '#fafafa' : 'rgba(250,250,250,0.62)',
                      border: `1px solid ${doc === item.id ? 'rgba(180,120,253,0.3)' : 'transparent'}`,
                    }}>
                    <span className="font-display text-[16px]" style={{ color: doc === item.id ? 'hsl(var(--accent))' : 'rgba(250,250,250,0.42)' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-[14px] p-4" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(250,250,250,0.42)' }}>Версия</div>
                <div className="font-mono text-[14px] mb-1">v {d.version}</div>
                <div className="text-[11px]" style={{ color: 'rgba(250,250,250,0.62)' }}>Обновлено {d.updated}</div>
              </div>
            </div>
          </aside>

          {/* Article */}
          <article className="col-span-12 md:col-span-9">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.42)' }}>{d.short}</div>
            <h2 className="font-display tracking-tight leading-[0.95] mb-3" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400 }}>
              {d.title}
            </h2>
            <div className="flex gap-4 text-[12px] mb-10 pb-6" style={{ color: 'rgba(250,250,250,0.62)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-mono">v {d.version}</span>
              <span>·</span>
              <span>обновлено {d.updated}</span>
              <span className="ml-auto font-mono">{d.sections.length} разделов</span>
            </div>

            {/* Section navigation */}
            <div className="rounded-[14px] p-5 mb-10" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(250,250,250,0.42)' }}>Содержание</div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[13px]">
                {d.sections.map(s => (
                  <li key={s.h} className="truncate" style={{ color: 'rgba(250,250,250,0.62)' }}>
                    <span style={{ color: 'hsl(var(--accent))' }}>›</span> {s.h}
                  </li>
                ))}
              </ol>
            </div>

            {d.sections.map((s, i) => (
              <section key={i} className="mb-10">
                <h3 className="font-display text-[28px] leading-tight tracking-tight mb-5" style={{ fontWeight: 400 }}>
                  {s.h}
                </h3>
                {s.p.map((para, j) => (
                  <p key={j} className="text-[15px] leading-[1.7] mb-3" style={{ color: 'rgba(250,250,250,0.62)' }}>
                    {para}
                  </p>
                ))}
              </section>
            ))}

            {/* Bottom meta */}
            <div className="mt-14 pt-6 flex flex-wrap items-center justify-between text-[12px]" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(250,250,250,0.42)' }}>
              <span className="font-mono">© ООО «Имеджинейшн ЭйАй» · {d.version}</span>
              <span>Вопросы по документу: <span style={{ color: 'hsl(var(--accent))' }} className="font-mono">legal@imagination.ai</span></span>
            </div>
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default LegalPage;
