import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Что такое поинты?", a: "Поинты — внутренняя валюта Imagination. 1 поинт = 1 рубль. Каждая генерация стоит определённое количество поинтов в зависимости от модели и параметров." },
  { q: "Сколько поинтов даётся при регистрации?", a: "При регистрации мы дарим 50 поинтов — этого хватит на первые тестовые генерации." },
  { q: "Можно ли использовать генерации в коммерческих целях?", a: "Да. Все генерации принадлежат вам, права передаются полностью. Используйте в любых проектах без ограничений." },
  { q: "Какие модели доступны?", a: "Midjourney, Flux, Stable Diffusion, DALL·E 3, Sora, Veo, Kling, Runway и другие — список постоянно расширяется." },
  { q: "Сгорают ли поинты?", a: "Нет. Купленные поинты остаются на счету бессрочно." },
  { q: "Есть ли подписка?", a: "Нет. Imagination работает по модели pay-as-you-go — платите только за то, что используете." },
];

const FAQ = () => {
  return (
    <section className="py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">FAQ</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight">
            Частые <span className="italic text-gradient-brand">вопросы</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-xl bg-card/40 px-5">
              <AccordionTrigger className="text-left hover:no-underline py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
