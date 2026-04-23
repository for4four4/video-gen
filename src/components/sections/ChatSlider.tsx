import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import showcase1 from "@/assets/showcase-1.jpg";
import showcase2 from "@/assets/showcase-2.jpg";
import showcase3 from "@/assets/showcase-3.jpg";
import showcase4 from "@/assets/showcase-4.jpg";
import showcase5 from "@/assets/showcase-5.jpg";

const slides = [
  { img: showcase1, prompt: "Ethereal woman with cosmic galaxy hair, hyper detailed", model: "Midjourney v7" },
  { img: showcase2, prompt: "Cyberpunk neon city street at night, cinematic", model: "Flux Pro" },
  { img: showcase3, prompt: "Floating islands above clouds at golden hour", model: "Stable Diffusion XL" },
  { img: showcase4, prompt: "Mythical glowing fox with crystal horns in dark forest", model: "Midjourney v7" },
  { img: showcase5, prompt: "Astronaut helmet reflecting nebula, sci-fi portrait", model: "DALL·E 3" },
];

const ChatSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setActive((p) => (p + 1) % slides.length);

  const slide = slides[active];

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Чат вживую</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight">
            Просто <span className="italic text-gradient-brand">опишите</span> — получите результат
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-elegant bg-card">
            {/* Mock chat header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-[hsl(0_70%_60%)]" />
              <span className="w-3 h-3 rounded-full bg-[hsl(45_90%_60%)]" />
              <span className="w-3 h-3 rounded-full bg-[hsl(140_60%_55%)]" />
              <span className="ml-3 text-xs text-muted-foreground">lumen.ai / chat</span>
            </div>

            <div className="grid md:grid-cols-2">
              {/* Chat side */}
              <div className="p-6 md:p-8 space-y-5 bg-background/30">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/5 border border-white/10 px-4 py-3">
                    <p className="text-sm">{slide.prompt}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary shrink-0 flex items-center justify-center text-xs font-medium">L</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Модель:</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">{slide.model}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Готово за 8 секунд · 12 поинтов</p>
                  </div>
                </div>
              </div>

              {/* Image preview */}
              <div className="relative aspect-square md:aspect-auto bg-black">
                <img
                  key={active}
                  src={slide.img}
                  alt={slide.prompt}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1 rounded-full transition-all ${i === active ? "w-8 bg-accent" : "w-4 bg-white/20"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSlider;
