import SiteLayout from "@/components/layout/SiteLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPricingPlans, type PricingPlan } from "@/lib/api";

const VENDOR_COMPARE = [
  { model: "Midjourney v7", ours: 12, vendorPlan: "MJ Pro $60/мес",          vendorRate: "≈48 ₽/генерация" },
  { model: "Flux Pro",      ours: 8,  vendorPlan: "Pay-as-you-go",           vendorRate: "≈12 ₽/генерация" },
  { model: "Kling 3.0",    ours: 18, vendorPlan: "Kling API",               vendorRate: "≈25 ₽/сек видео" },
  { model: "GPT Image 1",  ours: 5,  vendorPlan: "OpenAI API",              vendorRate: "≈8 ₽/генерация" },
  { model: "Seedance 2",   ours: 46, vendorPlan: "ByteDance API",           vendorRate: "≈50 ₽/генерация" },
];

const USE_CASES = [
  { title: "Студент-дизайнер",    points: 500,  desc: "≈60 образов в Flux Pro для мудборда",    tag: "Для себя" },
  { title: "Маркетолог-одиночка", points: 1000, desc: "100 обложек + 10 роликов в неделю",       tag: "Для работы" },
  { title: "Продакшн-студия",     points: 5000, desc: "300+ генераций в разных моделях",         tag: "Для команды" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #2a1b4e 0%, #6b2a8a 40%, #c65d8e 100%)",
  "linear-gradient(145deg, #0f2a44 0%, #2e6ca8 50%, #a8d8e8 100%)",
  "linear-gradient(135deg, #1a1a1a 0%, #3d2817 50%, #c6833f 100%)",
  "linear-gradient(140deg, #0d2818 0%, #2d6b47 50%, #9fd4a8 100%)",
];
const gradFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31 + seed.charCodeAt(i)) >>> 0);
  return GRADIENTS[h % GRADIENTS.length];
};
const Placeholder = ({ seed, className = "" }: { seed: string; className?: string }) => (
  <div className={`relative overflow-hidden aspect-square ${className}`} style={{ background: gradFor(seed) }}>
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)" }} />
  </div>
);

const PricingPage = () => {
  useEffect(() => { document.title = "Тарифы — Imagination AI"; }, []);

  const [pts, setPts] = useState(1000);

  const { data: plans = [] } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricingPlans,
  });

  const price = pts;
  const bonus = pts >= 5000 ? Math.round(pts * 0.15) : pts >= 1000 ? Math.round(pts * 0.1) : pts >= 500 ? Math.round(pts * 0.05) : 0;
  const total = pts + bonus;

  // Достаём бонус из реальных планов если совпадает
  const matchedPlan = plans.find(p => p.points === pts);
  const actualBonus = matchedPlan ? matchedPlan.bonus_points : bonus;
  const actualTotal = pts + actualBonus;

  const breakdown = [
    { name: "Flux Pro",     price: 8,   each: `≈${Math.floor(actualTotal / 8)} генераций` },
    { name: "GPT Image 1",  price: 5,   each: `≈${Math.floor(actualTotal / 5)} генераций` },
    { name: "Kling 3.0",   price: 18,  each: `≈${Math.floor(actualTotal / 18)} роликов` },
    { name: "Seedance 2",  price: 46,  each: `≈${Math.floor(actualTotal / 46)} роликов` },
  ];

  return (
    <SiteLayout>
      <div className="pointer-events-none absolute left-0 right-0" style={{ top: 0, height: 500, background: "radial-gradient(ellipse at 50% 0%, rgba(180,120,253,0.16), transparent 60%)" }} />

      <section className="relative py-16">
        <div className="max-w-[1200px] mx-auto px-8">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>Тарифы · Pay-as-you-go</div>
            <h1 className="font-display tracking-tight leading-[0.95] mb-5" style={{ fontSize: "clamp(48px, 7vw, 84px)", fontWeight: 400 }}>
              Плати за <em className="text-accent not-italic">картинки</em>,<br />не за подписку
            </h1>
            <p className="text-[15px] max-w-xl mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
              50 поинтов в подарок при регистрации. Поинты не сгорают.
            </p>
          </div>

          {/* Планы из БД */}
          {plans.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {plans.map(plan => (
                <div key={plan.id} className={`relative rounded-2xl p-6 border transition-all ${plan.popular ? 'border-accent/50 bg-gradient-to-b from-accent/5 to-transparent shadow-glow' : 'border-white/10 bg-card hover:border-white/20'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">Популярный</div>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl">{plan.points.toLocaleString('ru')}</span>
                    <span className="text-muted-foreground text-sm">пт</span>
                  </div>
                  {plan.bonus_points > 0 && <p className="text-xs text-accent mb-3">+{plan.bonus_points} бонус</p>}
                  <p className="text-3xl font-medium mb-6">{plan.price_rub.toLocaleString('ru')} ₽</p>
                  <Link to="/signup" className={`block w-full text-center text-[13px] py-2.5 rounded-md transition-opacity hover:opacity-90 ${plan.popular ? 'bg-accent text-[#1a0a2a] font-semibold' : 'border border-white/20 text-foreground'}`}>
                    Купить
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Calculator */}
          <div className="rounded-[24px] p-10 mb-14" style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.14)" }}>
            <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "7fr 5fr" }}>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: "hsl(var(--accent))" }}>Калькулятор</span>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-display tracking-tight" style={{ fontSize: 96, fontWeight: 400, lineHeight: 1 }}>{pts.toLocaleString('ru')}</span>
                  <span className="text-[18px]" style={{ color: "hsl(var(--muted-foreground))" }}>поинтов</span>
                </div>
                <div className="flex items-center flex-wrap gap-3 mb-8 text-[14px]">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>цена</span>
                  <span className="font-mono text-[20px]">{price.toLocaleString('ru')} ₽</span>
                  {actualBonus > 0 && (
                    <>
                      <span style={{ color: "rgba(250,250,250,0.42)" }}>+</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: "rgba(180,120,253,0.15)", color: "hsl(var(--accent))", border: "1px solid rgba(180,120,253,0.3)" }}>
                        бонус {actualBonus} пт
                      </span>
                    </>
                  )}
                  <span className="ml-auto text-[11px]" style={{ color: "rgba(250,250,250,0.42)" }}>к зачислению</span>
                  <span className="font-mono text-[16px]" style={{ color: "hsl(var(--accent))" }}>{actualTotal.toLocaleString('ru')} пт</span>
                </div>
                <input type="range" min={100} max={10000} step={100} value={pts} onChange={e => setPts(+e.target.value)} className="w-full" style={{ accentColor: "#b478fd", height: 4 }} />
                <div className="flex justify-between text-[10px] mt-2 font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>
                  {[100, 500, 1000, 2500, 5000, 10000].map(v => (
                    <button key={v} onClick={() => setPts(v)} style={{ color: pts === v ? "hsl(var(--accent))" : "rgba(250,250,250,0.42)" }}>{v.toLocaleString('ru')}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-10">
                  {["Поинты не сгорают", "Без подписки", "Коммерческие права", "Все модели в одном чате"].map(b => (
                    <div key={b} className="flex items-center gap-2 text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <span style={{ color: "hsl(var(--accent))" }}>✓</span> {b}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "rgba(250,250,250,0.42)" }}>Что получите</div>
                <div className="rounded-[16px] overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid hsl(var(--border))" }}>
                  {breakdown.map((b, i) => (
                    <div key={b.name} className="grid items-center gap-3 px-4 py-3" style={{ gridTemplateColumns: "1fr 2fr 2fr", borderBottom: i < breakdown.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
                      <Placeholder seed={b.name} className="rounded-md" />
                      <div>
                        <div className="text-[13px] font-medium">{b.name}</div>
                        <div className="text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.42)" }}>{b.price} пт / ген.</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-[24px]" style={{ color: "hsl(var(--accent))" }}>{b.each.split(" ")[0]}</div>
                        <div className="text-[10px]" style={{ color: "rgba(250,250,250,0.42)" }}>{b.each.split(" ").slice(1).join(" ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/signup" className="block w-full mt-5 py-3 rounded-xl text-[14px] text-center transition-opacity hover:opacity-90" style={{ background: "hsl(var(--accent))", color: "#1a0a2a", fontWeight: 600 }}>
                  Купить {actualTotal.toLocaleString('ru')} поинтов за {price.toLocaleString('ru')} ₽ →
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] tracking-[0.28em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>Сравнение с оригиналом</span>
              <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
            </div>
            <div className="rounded-[16px] overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="grid grid-cols-4 gap-4 px-6 py-3 text-[10px] uppercase tracking-widest" style={{ color: "rgba(250,250,250,0.42)", borderBottom: "1px solid hsl(var(--border))" }}>
                <span>Модель</span><span>У вендора</span><span>Цена у вендора</span><span className="text-right">В Imagination</span>
              </div>
              {VENDOR_COMPARE.map(r => (
                <div key={r.model} className="grid grid-cols-4 gap-4 px-6 py-4 items-center text-[13px]" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <span className="font-medium">{r.model}</span>
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{r.vendorPlan}</span>
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{r.vendorRate}</span>
                  <span className="text-right font-mono" style={{ color: "hsl(var(--accent))" }}>{r.ours} пт = {r.ours} ₽</span>
                </div>
              ))}
            </div>
          </div>

          {/* Use cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {USE_CASES.map(c => (
              <div key={c.title} className="rounded-[16px] p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>{c.tag}</span>
                <h4 className="font-display text-[22px] mt-3 mb-1">{c.title}</h4>
                <div className="font-mono text-[12px] mb-2" style={{ color: "hsl(var(--accent))" }}>{c.points.toLocaleString('ru')} пт · {c.points} ₽</div>
                <p className="text-[13px]" style={{ color: "hsl(var(--muted-foreground))" }}>{c.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </SiteLayout>
  );
};

export default PricingPage;
