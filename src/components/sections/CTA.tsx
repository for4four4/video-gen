import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center border border-white/10">
          <div className="absolute inset-0 -z-10 bg-gradient-hero" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] -z-10" />

          <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-6">
            Готовы <span className="italic text-gradient-brand">творить</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            50 поинтов в подарок. Без карты. Без подписки. Просто начните.
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/signup">
              Создать аккаунт
              <ArrowRight className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
