import { Star } from "lucide-react";

const reviews = [
  { name: "Алексей М.", role: "Дизайнер", text: "Раньше платил за пять подписок. Сейчас — только Imagination. Все модели тут, поинты не сгорают. Магия." },
  { name: "Мария К.", role: "Маркетолог", text: "Sora и Veo для рекламы, Midjourney для постеров — прямо из одного чата. Сэкономила кучу времени." },
  { name: "Дмитрий П.", role: "Видеограф", text: "Kling и Runway бок о бок — можно сравнить генерации и выбрать лучшую. Это меняет подход." },
  { name: "Елена С.", role: "Иллюстратор", text: "Цены прозрачные. 100 ₽ — 100 поинтов, понятно сразу. Не нужно разбираться в тарифах." },
  { name: "Игорь В.", role: "SMM-специалист", text: "За день делаю контент на неделю. Скорость и качество — это то, что мне нужно." },
  { name: "Анна Т.", role: "Арт-директор", text: "Интерфейс минималистичный, не отвлекает. Чувствуется забота о пользователе." },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Отзывы</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl mx-auto">
            Творцы <span className="italic text-gradient-brand">любят</span> Imagination
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className="rounded-2xl p-6 border border-white/10 bg-card/40 hover:bg-card transition-colors"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 mb-6">"{r.text}"</p>
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
