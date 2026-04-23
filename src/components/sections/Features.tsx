import { Image, Video, Zap, Layers, Coins, Shield } from "lucide-react";

const features = [
  { icon: Image, title: "Изображения", desc: "Midjourney, Flux, DALL·E, Stable Diffusion и другие — все в одном чате." },
  { icon: Video, title: "Видео", desc: "Sora, Veo, Kling, Runway — генерация роликов прямо из текста или картинки." },
  { icon: Zap, title: "Молниеносно", desc: "Параллельная генерация. Не ждите очередей — модели работают одновременно." },
  { icon: Layers, title: "Один интерфейс", desc: "Не нужно регистрироваться в десяти сервисах. Всё в Imagination." },
  { icon: Coins, title: "Поинты, не подписка", desc: "Платите только за результат. 100 ₽ = 100 поинтов. Без скрытых платежей." },
  { icon: Shield, title: "Ваше — ваше", desc: "Все генерации остаются у вас. Полные права на коммерческое использование." },
];

const Features = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Возможности</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl mx-auto">
            Всё, что нужно <span className="italic text-gradient-brand">творцу</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {features.map((f) => (
            <div key={f.title} className="bg-background p-8 hover:bg-card transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                <f.icon className="h-5 w-5 text-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
