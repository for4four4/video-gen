import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { AxiosError } from "axios";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    document.title = "Восстановление пароля — Imagination AI"; 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.forgotPassword({ email });
      toast.success("Инструкции по сбросу пароля отправлены на email");
      navigate("/login");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Ошибка. Проверьте email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">Забыли пароль?</h1>
            <p className="text-muted-foreground text-sm mb-8">Введите email, и мы отправим инструкции по сбросу</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Отправка..." : "Отправить инструкции"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Вспомнили пароль? <Link to="/login" className="text-foreground hover:text-accent">Войти</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    document.title = "Сброс пароля — Imagination AI"; 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (!token) {
      toast.error("Неверная ссылка для сброса");
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword({ token, password });
      toast.success("Пароль успешно изменен!");
      navigate("/login");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Ошибка сброса пароля. Ссылка могла устареть.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="py-20 min-h-[80vh] flex items-center">
        <div className="container max-w-md">
          <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10">
            <h1 className="font-display text-3xl mb-2">Новый пароль</h1>
            <p className="text-muted-foreground text-sm mb-8">Придумайте надёжный пароль</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                type="password" 
                placeholder="Новый пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading}
                minLength={6}
              />
              <Input 
                type="password" 
                placeholder="Подтвердите пароль" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                disabled={isLoading}
                minLength={6}
              />
              <Button 
                type="submit" 
                variant="glow" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Сохранение..." : "Сменить пароль"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};
