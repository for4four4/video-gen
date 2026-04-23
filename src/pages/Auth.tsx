import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authService, LoginDto } from "@/services/auth";
import { AxiosError } from "axios";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    document.title = "Вход — Imagination AI"; 
    // Если уже авторизован, редиректим на дашборд
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.login({ email, password } as LoginDto);
      toast.success("Успешный вход!");
      navigate("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Ошибка входа. Проверьте данные.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">С возвращением</h1>
            <p className="text-muted-foreground text-sm mb-8">Войдите, чтобы продолжить творить</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <Input 
                type="password" 
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-accent">
                  Забыли пароль?
                </Link>
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
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
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    document.title = "Регистрация — Imagination AI";
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.register({ email, password, name });
      toast.success("Аккаунт создан! 50 поинтов начислено ✦");
      navigate("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Ошибка регистрации. Попробуйте другой email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">Создать аккаунт</h1>
            <p className="text-muted-foreground text-sm mb-8">50 поинтов в подарок ✦</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                type="text" 
                placeholder="Имя" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                disabled={isLoading}
              />
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <Input 
                type="password" 
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="glow" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Создание..." : "Создать аккаунт"}
              </Button>
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
