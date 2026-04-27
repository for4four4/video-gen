import { gradFor } from "@/data/content";

interface PlaceholderProps {
  seed: string;
  label?: string;
  aspect?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Placeholder = ({ seed = 'x', label, aspect = '1/1', className = '', style = {}, children }: PlaceholderProps) => {
  const grad = gradFor(seed);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspect, background: grad, ...style }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 8px)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {label && (
        <div className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur text-[9px] font-mono tracking-tight text-white/80 uppercase">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

export default Placeholder;
