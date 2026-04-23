import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const packs = [
  { points: 100, price: 100, popular: false },
  { points: 500, price: 500, popular: false, bonus: "+25" },
  { points: 1000, price: 1000, popular: true, bonus: "+100" },
  { points: 5000, price: 5000, popular: false, bonus: "+750" },
];

const benefits = [
  "Все модели по одной цене за поинт",
  "Поинты не сгорают",
  "Без подписки и скрытых платежей",
  "Коммерческие права на генерации",
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Тарифы</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl mx-auto mb-4">
            Один тариф. <span className="italic text-gradient-brand">Гибкие</span> поинты.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            При регистрации мы дарим 50 поинтов. Дальше докупайте сколько нужно — от 100 ₽.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {packs.map((p) => (
            <div
              key={p.points}
              className={`relative rounded-2xl p-6 border transition-all duration-500 ${
                p.popular
                  ? "border-accent/50 bg-gradient-to-b from-accent/5 to-transparent shadow-glow"
                  : "border-white/10 bg-card hover:border-white/20"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  Популярный
                </div>
              )}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl">{p.points}</span>
                <span className="text-muted-foreground text-sm">поинтов</span>
              </div>
              {p.bonus && <p className="text-xs text-accent mb-3">бонус {p.bonus}</p>}
              <p className="text-3xl font-medium mb-6">{p.price} ₽</p>
              <Button asChild variant={p.popular ? "glow" : "outlineGlow"} className="w-full">
                <Link to="/signup">Купить</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/50 p-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-medium mb-4">Что входит в любую покупку</h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
