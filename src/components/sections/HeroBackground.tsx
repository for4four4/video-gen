/**
 * HeroBackground — многослойный анимированный фон для hero-блока.
 * Слои (снизу вверх):
 *  1. Видео hero-bg.mp4 (приглушённое)
 *  2. Aurora — два conic-градиента, медленно вращающиеся
 *  3. Глоу-орбы (violet / cyan / pink) с разной скоростью drift
 *  4. Частицы — 24 точки, всплывающие снизу вверх
 *  5. Сетка с медленным сдвигом
 *  6. Лёгкое затемнение по краям
 */

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 3.6 + 2) % 100}%`,
  delay: `-${(i * 0.9) % 14}s`,
  duration: `${12 + (i % 7) * 2}s`,
  size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
}));

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Видео */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/video/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* 2. Aurora */}
      <div
        className="absolute -inset-1/4 opacity-70 animate-aurora"
        style={{
          background:
            "conic-gradient(from 0deg at 30% 40%, hsl(var(--glow-violet) / 0.5), transparent 35%, hsl(var(--glow-cyan) / 0.4) 60%, transparent 80%)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute -inset-1/4 opacity-60 animate-aurora"
        style={{
          background:
            "conic-gradient(from 180deg at 70% 60%, hsl(var(--glow-pink) / 0.45), transparent 40%, hsl(var(--glow-violet) / 0.4) 70%, transparent 90%)",
          filter: "blur(100px)",
          animationDelay: "-7s",
          animationDuration: "30s",
          mixBlendMode: "screen",
        }}
      />

      {/* 3. Глоу-орбы */}
      <div
        className="absolute top-[12%] left-[8%] w-[28rem] h-[28rem] rounded-full animate-drift-slow"
        style={{
          background: "hsl(var(--glow-violet) / 0.45)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute bottom-[8%] right-[6%] w-[32rem] h-[32rem] rounded-full animate-drift-fast"
        style={{
          background: "hsl(var(--glow-cyan) / 0.35)",
          filter: "blur(140px)",
        }}
      />
      <div
        className="absolute top-[55%] left-[45%] w-[22rem] h-[22rem] rounded-full animate-glow-pulse"
        style={{
          background: "hsl(var(--glow-pink) / 0.3)",
          filter: "blur(110px)",
        }}
      />

      {/* 4. Частицы — inline animation чтобы Tailwind не выкинул */}
      <div className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "hsl(var(--foreground) / 0.85)",
              boxShadow: "0 0 8px hsl(var(--glow-violet) / 0.9)",
              animation: `particle-float ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Лёгкое затемнение по краям */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />
    </div>
  );
};

export default HeroBackground;
