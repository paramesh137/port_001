import { useEffect, useMemo, useRef, type MouseEvent } from "react";

const R = 175;
const palette = ["border-neon/60 text-sakura", "border-aqua/60 text-aqua", "border-gold/60 text-gold"];

/** CSS-3D rotating "skill orb" with magic-circle orbit rings. Driven by refs (no per-frame React renders). */
export default function SkillSphere({ skills }: { skills: string[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const tags = useRef<(HTMLSpanElement | null)[]>([]);
  const rot = useRef({ x: -10, y: 0 });
  const vel = useRef({ x: 0.12, y: 0.28 });

  const points = useMemo(() => {
    const n = skills.length;
    return skills.map((s, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      return { s, x: R * Math.cos(theta) * Math.sin(phi), y: R * Math.sin(theta) * Math.sin(phi), z: R * Math.cos(phi) };
    });
  }, [skills]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;
      const { x, y } = rot.current;
      const a = (x * Math.PI) / 180;
      const b = (y * Math.PI) / 180;
      if (wrap.current) wrap.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
      points.forEach((p, i) => {
        const el = tags.current[i];
        if (!el) return;
        const z1 = -p.x * Math.sin(b) + p.z * Math.cos(b);
        const depth = p.y * Math.sin(a) + z1 * Math.cos(a); // -R..R, positive = towards viewer
        const k = (depth + R) / (2 * R);
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${-y}deg) rotateX(${-x}deg) translate(-50%, -50%) scale(${0.75 + k * 0.4})`;
        el.style.opacity = String(0.25 + k * 0.75);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    vel.current = {
      x: -((e.clientY - r.top) / r.height - 0.5) * 1.2,
      y: ((e.clientX - r.left) / r.width - 0.5) * 1.2,
    };
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={() => (vel.current = { x: 0.12, y: 0.28 })}
      className="relative mx-auto flex h-[460px] w-full max-w-[460px] items-center justify-center"
      style={{ perspective: 900 }}
    >
      <div className="absolute inset-14 rounded-full bg-neon/15 blur-3xl" />
      <div className="orbit-ring a" />
      <div className="orbit-ring b" />
      <div ref={wrap} style={{ transformStyle: "preserve-3d" }} className="relative h-0 w-0">
        {points.map((p, i) => (
          <span
            key={p.s}
            ref={(el) => {
              tags.current[i] = el;
            }}
            className={`absolute whitespace-nowrap border bg-ink/70 px-3 py-1 text-sm font-semibold tracking-wide backdrop-blur-md ${palette[i % 3]}`}
          >
            {p.s}
          </span>
        ))}
      </div>
    </div>
  );
}
