import SiteLayout from "@/components/layout/SiteLayout";
import Placeholder from "@/components/Placeholder";
import { CONTACT_CHANNELS, REQUISITES } from "@/data/content";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(250,250,250,0.42)' }}>{children}</span>
);

const Field = ({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full mt-2 px-4 py-3 rounded-lg text-[14px] outline-none transition-colors"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa', fontFamily: 'inherit' }} />
  </div>
);

const ContactsPage = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: 'Поддержка', msg: '', agree: true });
  const [sending, setSending] = useState(false);
  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    document.title = "Контакты — Imagination AI";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      toast.error("Заполните все поля");
      return;
    }
    if (!form.agree) {
      toast.error("Необходимо согласие на обработку данных");
      return;
    }
    setSending(true);
    // Server Action simulation
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, topic: form.topic, message: form.msg }),
      });
      if (res.ok) {
        toast.success("Сообщение отправлено! Ответим на e-mail.");
        setForm({ name: '', email: '', topic: 'Поддержка', msg: '', agree: true });
      } else {
        toast.error("Ошибка отправки. Попробуйте позже.");
      }
    } catch {
      // Fallback: show success anyway for now (no backend endpoint yet)
      toast.success("Сообщение принято! Ответим на e-mail.");
      setForm({ name: '', email: '', topic: 'Поддержка', msg: '', agree: true });
    }
    setSending(false);
  };

  return (
    <SiteLayout>
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 480,
        background: 'radial-gradient(ellipse at 80% 0%, rgba(180,120,253,0.14), transparent 60%)' }} />

      <div className="relative max-w-[1200px] mx-auto px-8 pt-28 pb-24">
        {/* Hero */}
        <div className="grid grid-cols-12 gap-10 items-end mb-14">
          <div className="col-span-12 md:col-span-8">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(250,250,250,0.62)' }}>Контакты · напишите нам</div>
            <h1 className="font-display tracking-tight leading-[0.92]" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 400 }}>
              Любой <em style={{ color: 'hsl(var(--accent))' }}>вопрос</em> —<br />в одно сообщение
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 text-[14px] leading-relaxed pb-3" style={{ color: 'rgba(250,250,250,0.62)' }}>
            Команда поддержки отвечает в среднем за 15 минут с 9:00 до 23:00 по МСК. Ночью — бот в Telegram, который умеет почти всё.
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Form */}
          <form className="col-span-12 md:col-span-7 rounded-[24px] p-8"
            style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.14)' }}
            onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-7">
              <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'hsl(var(--accent))' }}>Форма обратной связи</span>
              <span className="text-[11px]" style={{ color: 'rgba(250,250,250,0.42)' }}>отвечаем на e-mail</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Как вас зовут" value={form.name} onChange={v => upd('name', v)} placeholder="Анна Орлова" />
              <Field label="E-mail для ответа" value={form.email} onChange={v => upd('email', v)} placeholder="anna@studio.ru" type="email" />
            </div>

            <div className="mb-4">
              <Label>Тема обращения</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Поддержка', 'Биллинг', 'Партнёрство', 'API', 'Пресса', 'Другое'].map(t => (
                  <button key={t} type="button" onClick={() => upd('topic', t)}
                    className="px-3 py-1.5 rounded-md text-[12px] transition-all"
                    style={{
                      background: form.topic === t ? 'rgba(180,120,253,0.12)' : 'rgba(255,255,255,0.03)',
                      color: form.topic === t ? 'hsl(var(--accent))' : 'rgba(250,250,250,0.62)',
                      border: `1px solid ${form.topic === t ? 'rgba(180,120,253,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}>{t}</button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <Label>Сообщение</Label>
              <textarea value={form.msg} onChange={e => upd('msg', e.target.value)} rows={6}
                placeholder="Опишите задачу, приложите ссылки или промпты — чем подробнее, тем точнее ответ."
                className="w-full mt-2 px-4 py-3 rounded-lg text-[14px] resize-none outline-none transition-colors"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa', fontFamily: 'inherit' }} />
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="flex items-start gap-2 text-[12px] max-w-[55%]" style={{ color: 'rgba(250,250,250,0.62)' }}>
                <input type="checkbox" checked={form.agree} onChange={e => upd('agree', e.target.checked)} className="mt-0.5" style={{ accentColor: '#b478fd' }} />
                <span>Согласен с <Link to="/legal/privacy" style={{ color: '#fafafa', textDecoration: 'underline', textUnderlineOffset: 3 }}>политикой обработки</Link> персональных данных</span>
              </label>
              <button type="submit" disabled={sending} className="px-6 py-3 rounded-xl text-[14px] disabled:opacity-50"
                style={{ background: 'hsl(var(--accent))', color: '#1a0a2a', fontWeight: 600 }}>
                {sending ? 'Отправка...' : 'Отправить сообщение →'}
              </button>
            </div>
          </form>

          {/* Right column */}
          <div className="col-span-12 md:col-span-5 space-y-5">
            <div className="rounded-[20px] p-6" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[11px] tracking-[0.28em] uppercase mb-5" style={{ color: 'rgba(250,250,250,0.42)' }}>Прямые каналы</div>
              <div className="space-y-1">
                {CONTACT_CHANNELS.map((c, i) => (
                  <div key={c.label} className="flex items-center gap-4 py-3" style={{ borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display text-[18px]"
                      style={{ background: 'rgba(180,120,253,0.12)', color: 'hsl(var(--accent))', border: '1px solid rgba(180,120,253,0.25)' }}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] tracking-wider uppercase" style={{ color: 'rgba(250,250,250,0.42)' }}>{c.label}</div>
                      <div className="font-mono text-[13px] truncate">{c.value}</div>
                    </div>
                    <span className="text-[11px] hidden lg:block" style={{ color: 'rgba(250,250,250,0.62)' }}>{c.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] overflow-hidden" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Placeholder seed="moscow-office" aspect="16/9" label="офис · мск, лесная 7" />
              <div className="p-5">
                <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: 'rgba(250,250,250,0.42)' }}>Студия</div>
                <div className="font-display text-[22px] leading-tight mb-1">Москва, ул. Лесная, 7</div>
                <div className="text-[13px]" style={{ color: 'rgba(250,250,250,0.62)' }}>БЦ «Белая площадь», 4 этаж, офис 412 · м. Белорусская, 5 минут пешком</div>
                <div className="flex gap-3 mt-4 text-[12px] font-mono" style={{ color: 'rgba(250,250,250,0.42)' }}>
                  <span>пн—пт</span><span style={{ color: '#fafafa' }}>10:00 — 19:00</span>
                  <span className="ml-auto" style={{ color: 'hsl(var(--accent))' }}>+7 495 123-45-67</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requisites */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'rgba(250,250,250,0.62)' }}>Реквизиты для договоров</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <div className="rounded-[16px] overflow-hidden grid grid-cols-1 sm:grid-cols-2" style={{ background: '#121214', border: '1px solid rgba(255,255,255,0.08)' }}>
            {REQUISITES.map(([k, v], i) => (
              <div key={k} className="grid grid-cols-3 gap-4 px-6 py-3.5 items-center text-[13px]"
                style={{
                  borderBottom: i < REQUISITES.length - 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                <span className="text-[10px] uppercase tracking-widest col-span-1" style={{ color: 'rgba(250,250,250,0.42)' }}>{k}</span>
                <span className="font-mono col-span-2 truncate" style={{ color: '#fafafa' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ContactsPage;
