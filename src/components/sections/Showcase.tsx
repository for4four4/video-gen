import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import showcase4 from "@/assets/showcase-4.jpg";
import showcase5 from "@/assets/showcase-5.jpg";
import showcase6 from "@/assets/showcase-6.jpg";

const images = [showcase1, showcase2, showcase3, showcase4, showcase5, showcase6];

const Showcase = () => {
  const row1 = [...images, ...images];
  const row2 = [...images.slice().reverse(), ...images.slice().reverse()];

  return (
    <section className="py-24 overflow-hidden">
      <div className="container text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Создано в Imagination</p>
        <h2 className="font-display text-4xl md:text-6xl tracking-tight">
          Бесконечная <span className="italic text-gradient-brand">палитра</span> возможностей
        </h2>
      </div>

      <div className="space-y-6 marquee">
        <div className="flex gap-6 animate-marquee">
          {row1.map((src, i) => (
            <div key={`r1-${i}`} className="shrink-0 w-72 h-72 rounded-2xl overflow-hidden border border-white/5 shadow-card">
              <img src={src} alt="AI artwork" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex gap-6 animate-marquee-reverse">
          {row2.map((src, i) => (
            <div key={`r2-${i}`} className="shrink-0 w-72 h-72 rounded-2xl overflow-hidden border border-white/5 shadow-card">
              <img src={src} alt="AI artwork" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
