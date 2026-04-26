/**
 * SideAmbient — боковые ambient-анимации для внутренних страниц.
 * Похожи на hero-фон, но без видео — только орбы + aurora + частицы по бокам.
 * variant подбирает палитру/мотив под раздел.
 */
import { useMemo } from "react";

type Variant = "models" | "blog" | "news";

const PALETTES: Record<Variant, { a: string; b: string; c: string }> = {
  // Models — фиолет + cyan, технологичный
  models: {
    a: "hsl(var(--glow-violet) / 0.45)",
    b: "hsl(var(--glow-cyan) / 0.35)",
    c: "hsl(var(--glow-violet) / 0.25)",
  },
  // Blog — тёплый: розовый + фиолетовый, редакторский
  blog: {
    a: "hsl(var(--glow-pink) / 0.4)",
    b: "hsl(var(--glow-violet) / 0.4)",
    c: "hsl(var(--glow-pink) / 0.25)",
  },
  // News — холодный: cyan + pink, динамичный
  news: {
    a: "hsl(var(--glow-cyan) / 0.45)",
    b: "hsl(var(--glow-pink) / 0.35)",
    c: "hsl(var(--glow-cyan) / 0.25)",
  },
};

const SideAmbient = ({ variant = "models" }: { variant?: Variant }) => {
  const palette = PALETTES[variant];

  // 14 частиц на каждую сторону, симметрично
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        offset: `${(i * 7 + 5) % 95}%`,
        delay: `-${(i * 1.1) % 14}s`,
        duration: `${14 + (i % 6) * 2}s`,
        size: i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
      })),
    [],
  );

  return (
    <>
      {/* ── Левая колонка ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="hidden lg:block fixed left-0 top-0 w-[18vw] xl:w-[22vw] z-0 pointer-events-none overflow-hidden"
        style={{ bottom: "320px" }}
      >
        {/* Aurora */}
        <div
          className="absolute -inset-1/2 opacity-70 animate-aurora"
          style={{
            background: `conic-gradient(from 0deg at 30% 50%, ${palette.a}, transparent 35%, ${palette.b} 65%, transparent 85%)`,
            filter: "blur(80px)",
            mixBlendMode: "screen",
          }}
        />
        {/* Орбы */}
        <div
          className="absolute top-[15%] -left-20 w-72 h-72 rounded-full animate-drift-slow"
          style={{ background: palette.a, filter: "blur(110px)" }}
        />
        <div
          className="absolute bottom-[20%] -left-10 w-80 h-80 rounded-full animate-drift-fast"
          style={{ background: palette.b, filter: "blur(120px)" }}
        />
        <div
          className="absolute top-[55%] left-1/3 w-56 h-56 rounded-full animate-glow-pulse"
          style={{ background: palette.c, filter: "blur(90px)" }}
        />
        {/* Частицы */}
        {particles.map((p, i) => (
          <span
            key={`l-${i}`}
            className="absolute bottom-0 rounded-full"
            style={{
              left: p.offset,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "hsl(var(--foreground) / 0.7)",
              boxShadow: `0 0 8px ${palette.a}`,
              animation: `particle-float ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
        {/* Затухание к контенту */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background" />
        {/* Затухание к низу */}
        <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </div>

      {/* ── Правая колонка ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="hidden lg:block fixed right-0 top-0 w-[18vw] xl:w-[22vw] z-0 pointer-events-none overflow-hidden"
        style={{ bottom: "320px" }}
      >
        <div
          className="absolute -inset-1/2 opacity-70 animate-aurora"
          style={{
            background: `conic-gradient(from 180deg at 70% 50%, ${palette.b}, transparent 40%, ${palette.a} 70%, transparent 90%)`,
            filter: "blur(90px)",
            mixBlendMode: "screen",
            animationDelay: "-8s",
            animationDuration: "28s",
          }}
        />
        <div
          className="absolute top-[10%] -right-16 w-80 h-80 rounded-full animate-drift-fast"
          style={{ background: palette.b, filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-[15%] -right-20 w-72 h-72 rounded-full animate-drift-slow"
          style={{ background: palette.a, filter: "blur(110px)" }}
        />
        <div
          className="absolute top-[50%] right-1/3 w-56 h-56 rounded-full animate-glow-pulse"
          style={{ background: palette.c, filter: "blur(90px)" }}
        />
        {particles.map((p, i) => (
          <span
            key={`r-${i}`}
            className="absolute bottom-0 rounded-full"
            style={{
              right: p.offset,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "hsl(var(--foreground) / 0.7)",
              boxShadow: `0 0 8px ${palette.b}`,
              animation: `particle-float ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background" />
        {/* Затухание к низу */}
        <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }} />
      </div>
    </>
  );
};

export default SideAmbient;
