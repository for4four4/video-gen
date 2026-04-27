import { useState } from "react";
import { Link } from "react-router-dom";
import { HOME_FAQ } from "@/data/content";

const HomeFaqBlock = () => {
  const [open, setOpen] = useState(0);

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-20">
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 md:col-span-5">
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>FAQ · вопросы и ответы</div>
          <h2 className="font-display tracking-tight leading-[0.95] mb-5" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400 }}>
            Что чаще всего <em style={{ color: 'hsl(var(--accent))' }}>спрашивают</em>
          </h2>
          <p className="text-[14px] mb-8" style={{ color: 'rgba(250,250,250,0.62)' }}>
            Если вашего вопроса нет в списке — посмотрите полную базу знаний или напишите в поддержку.
          </p>
          <div className="flex gap-2">
            <Link to="/faq" className="px-5 py-2.5 rounded-md text-[13px]"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.14)' }}>
              База знаний →
            </Link>
            <Link to="/contacts" className="px-5 py-2.5 rounded-md text-[13px]"
              style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
              Открыть чат
            </Link>
          </div>
        </div>
        <div className="col-span-12 md:col-span-7">
          {HOME_FAQ.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex justify-between items-start py-5 text-left gap-6">
                  <span className="font-display text-[20px] leading-tight" style={{ color: isOpen ? '#fafafa' : 'rgba(250,250,250,0.62)' }}>
                    {it.q}
                  </span>
                  <span className="text-[20px] font-mono mt-1 flex-shrink-0"
                    style={{ color: isOpen ? 'hsl(var(--accent))' : 'rgba(250,250,250,0.42)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>+</span>
                </button>
                {isOpen && (
                  <div className="pb-5 pr-12 text-[14px] leading-relaxed" style={{ color: 'rgba(250,250,250,0.62)' }}>
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeFaqBlock;
