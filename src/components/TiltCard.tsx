import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { cn } from "../utils/cn";

/** Manga-panel style card: cut corner, halftone screentone, cursor-follow glow and 3D tilt. */
export default function TiltCard({
  children,
  className,
  glow = "#ff2d95",
  corner = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  corner?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 12}deg) scale3d(1.02,1.02,1.02)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ "--glow": glow } as CSSProperties} className={cn("panel", className)}>
      {corner && <span className="corner" aria-hidden />}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
