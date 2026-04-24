import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setUser(authService.getCurrentUser());
      setIsLoading(false);
    };
    checkAuth();
    const handler = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        setUser(authService.getCurrentUser());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (isLoading) return null;

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const isChatPage = location.pathname === "/chat";

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Glass bar */}
      <div
        style={{
          background: "hsl(0 0% 4% / 0.72)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
        }}
      >
        <div className="max-w-[1320px] mx-auto h-14 px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2">
            {/* conic-gradient orb */}
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{
                background: "conic-gradient(from 120deg, #b478fd, #ff6ba9, #6adfff, #b478fd)",
                filter: "blur(0.3px)",
              }}
            />
            <span
              className="font-display text-[17px] tracking-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Imagination
              <span style={{ color: "hsl(var(--accent))" }}>.ai</span>
            </span>
          </Link>

          {/* ── Nav ── */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-[13px] transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Balance pill */}
                <div
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Баланс</span>
                  <span style={{ color: "hsl(var(--accent))", fontWeight: 600 }}>
                    {user.pointsBalance} пт
                  </span>
                </div>

                {!isChatPage && (
                  <Link
                    to="/chat"
                    className="text-[12px] px-3 py-1.5 rounded-md transition-colors hover:opacity-90"
                    style={{
                      background: "hsl(var(--foreground))",
                      color: "hsl(var(--background))",
                      fontWeight: 500,
                    }}
                  >
                    Открыть чат
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] px-3 py-1.5 rounded-md transition-colors"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Войти
                </Link>
                <Link
                  to="/signup"
                  className="text-[12px] px-3 py-1.5 rounded-md transition-colors hover:opacity-90"
                  style={{
                    background: "hsl(var(--foreground))",
                    color: "hsl(var(--background))",
                    fontWeight: 500,
                  }}
                >
                  Открыть чат
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile burger ── */}
          <button
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            <span
              className="block w-5 h-px transition-transform origin-center"
              style={{
                background: "hsl(var(--foreground))",
                transform: open ? "rotate(45deg) translateY(3px)" : "none",
              }}
            />
            <span
              className="block h-px transition-opacity"
              style={{
                background: "hsl(var(--foreground))",
                width: open ? 0 : "1.25rem",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-transform origin-center"
              style={{
                background: "hsl(var(--foreground))",
                transform: open ? "rotate(-45deg) translateY(-3px)" : "none",
              }}
            />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div
            className="md:hidden border-t py-4 px-6 flex flex-col gap-3"
            style={{
              borderColor: "hsl(var(--border))",
              background: "hsl(0 0% 4% / 0.95)",
            }}
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm py-2 transition-colors"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {l.label}
              </Link>
            ))}

            <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: "hsl(var(--border))" }}>
              {user ? (
                <>
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-md"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(var(--border))" }}
                  >
                    <span className="text-sm">{user.name || user.email}</span>
                    <span className="text-sm font-semibold" style={{ color: "hsl(var(--accent))" }}>
                      {user.pointsBalance} пт
                    </span>
                  </div>
                  {!isChatPage && (
                    <Link
                      to="/chat"
                      onClick={() => setOpen(false)}
                      className="text-center text-[12px] py-2.5 rounded-md"
                      style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 500 }}
                    >
                      Открыть чат
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="text-[13px] py-2"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-[13px] py-2 rounded-md"
                    style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  >
                    Войти
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-[12px] py-2 rounded-md"
                    style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 500 }}
                  >
                    Начать
                  </Link>
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
