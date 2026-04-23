import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export const Login = () => {
  useEffect(() => { document.title = "Вход — Imagination AI"; }, []);
  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">С возвращением</h1>
            <p className="text-muted-foreground text-sm mb-8">Войдите, чтобы продолжить творить</p>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.info("Авторизация подключится после интеграции бэкенда"); }}>
              <Input type="email" placeholder="Email" required />
              <Input type="password" placeholder="Пароль" required />
              <Button type="submit" variant="hero" className="w-full" size="lg">Войти</Button>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Нет аккаунта? <Link to="/signup" className="text-foreground hover:text-accent">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export const Signup = () => {
  useEffect(() => { document.title = "Регистрация — Imagination AI"; }, []);
  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">Создать аккаунт</h1>
            <p className="text-muted-foreground text-sm mb-8">50 поинтов в подарок ✦</p>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.info("Регистрация подключится после интеграции бэкенда"); }}>
              <Input type="text" placeholder="Имя" required />
              <Input type="email" placeholder="Email" required />
              <Input type="password" placeholder="Пароль" required />
              <Button type="submit" variant="glow" className="w-full" size="lg">Создать аккаунт</Button>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Уже с нами? <Link to="/login" className="text-foreground hover:text-accent">Войти</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};
