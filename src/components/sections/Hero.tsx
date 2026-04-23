import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroBackground from "./HeroBackground";

const Hero = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden noise">
      <HeroBackground />

      <div className="container relative z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-in-down">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground tracking-wide">50 поинтов в подарок при регистрации</span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight mb-6 animate-fade-in">
          <span className="block text-gradient">Воображение</span>
          <span className="block italic text-gradient-brand">оживает</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Один чат — десятки лучших нейросетей для генерации изображений и видео.
          Midjourney, Sora, Veo, Flux, Kling и другие в одном месте.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button asChild variant="hero" size="xl">
            <Link to="/signup">
              Начать создавать
              <ArrowRight className="ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outlineGlow" size="xl">
            <Link to="/models">Посмотреть модели</Link>
          </Button>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <span>✦ Без подписок</span>
          <span>✦ Платите только за результат</span>
          <span>✦ От 100 ₽ = 100 поинтов</span>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
