import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth";

const NotFound = () => {
  const location = useLocation();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setLogged(authService.isAuthenticated());
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Subtle radial bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(180,120,253,0.06), transparent 60%)",
        }}
      />

      <div className="relative text-center px-6">
        <div
          className="inline-block font-display mb-6"
          style={{
            fontSize: "clamp(96px, 16vw, 180px)",
            fontWeight: 400,
            color: "hsl(var(--foreground))",
            lineHeight: 1,
          }}
        >
          404
        </div>

        <p className="text-[20px] mb-2" style={{ color: "hsl(var(--foreground))" }}>
          Страница не найдена
        </p>
        <p className="text-[14px] mb-10 max-w-md mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
          Запрошенный путь <span className="font-mono text-[12px]">{location.pathname}</span> не существует.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl text-[14px] transition-opacity hover:opacity-90"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 600 }}
          >
            На главную →
          </Link>

          {logged && (
            <Link
              to="/chat"
              className="px-6 py-3 rounded-xl text-[14px] transition-colors hover:bg-white/10"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                backdropFilter: "blur(10px)",
              }}
            >
              Открыть чат
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
