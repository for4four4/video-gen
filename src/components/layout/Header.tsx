import { Link, NavLink, useLocation } from "react-router-dom";
import { Sparkles, Menu, X, MessageCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authService, User } from "@/services/auth";

const links = [
  { to: "/models", label: "Модели" },
  { to: "/pricing", label: "Тарифы" },
  { to: "/blog", label: "Блог" },
  { to: "/news", label: "Новости" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Слушаем изменения в localStorage (например, при логине/логауте)
    const handleStorageChange = () => {
      setUser(authService.getCurrentUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="glass border-b border-white/[0.06]">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-accent transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 blur-md bg-accent/40 -z-10" />
            </div>
            <span className="font-display text-xl tracking-tight">Imagination<span className="text-accent">.ai</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-4 mr-2">
                  <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
                  <span className="text-sm font-medium text-accent">Баланс: {user.pointsBalance}</span>
                </div>
                {!isChatPage && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/chat" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Чат
                    </Link>
                  </Button>
                )}
                <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Войти</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/signup">Начать бесплатно</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur">
            <div className="container py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="flex flex-col gap-1 pt-2 pb-3 border-b border-white/5">
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                    <span className="text-xs text-accent">Баланс: {user.pointsBalance}</span>
                  </div>
                  {!isChatPage && (
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to="/chat" onClick={() => setOpen(false)} className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Чат
                      </Link>
                    </Button>
                  )}
                  <Button onClick={() => { handleLogout(); setOpen(false); }} variant="ghost" size="sm" className="w-full">
                    Выйти
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="ghost" size="sm" className="flex-1"><Link to="/login">Войти</Link></Button>
                  <Button asChild variant="hero" size="sm" className="flex-1"><Link to="/signup">Начать</Link></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
