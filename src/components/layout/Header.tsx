import { Link, NavLink } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/models", label: "Модели" },
  { to: "/pricing", label: "Тарифы" },
  { to: "/blog", label: "Блог" },
  { to: "/news", label: "Новости" },
];

const Header = () => {
  const [open, setOpen] = useState(false);

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
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Войти</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/signup">Начать бесплатно</Link>
            </Button>
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
              <div className="flex gap-2 pt-2">
                <Button asChild variant="ghost" size="sm" className="flex-1"><Link to="/login">Войти</Link></Button>
                <Button asChild variant="hero" size="sm" className="flex-1"><Link to="/signup">Начать</Link></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
