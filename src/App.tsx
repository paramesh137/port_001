import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { resume } from "./data/resume";
import TiltCard from "./components/TiltCard";
import SkillSphere from "./components/SkillSphere";

const Scene = lazy(() => import("./components/Scene"));

const nav = [
  { label: "About", jp: "自己紹介" },
  { label: "Experience", jp: "経験" },
  { label: "Projects", jp: "作品" },
  { label: "Skills", jp: "能力" },
  { label: "Credentials", jp: "資格" },
  { label: "Contact", jp: "連絡" },
];

const catMeta: Record<string, { color: string; jp: string }> = {
  ML: { color: "#ff2d95", jp: "機械学習" },
  AI: { color: "#22d3ee", jp: "人工知能" },
  Web: { color: "#a3e635", jp: "ウェブ" },
  Data: { color: "#ffd166", jp: "データ" },
  Hardware: { color: "#c084fc", jp: "ハードウェア" },
};

const ticker = [
  "Data Analyst", "データアナリスト",
  "ML Engineer", "機械学習エンジニア",
  "Full-Stack Developer", "フルスタック開発者",
  "SDE", "ソフトウェアエンジニア",
];

const faces = ["front", "back", "right", "left", "top", "bottom"];

function useReveal(dep: unknown) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("revealed")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

function useTyping(words: string[]) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del) {
          const next = word.slice(0, text.length + 1);
          setText(next);
          if (next === word) setTimeout(() => setDel(true), 1400);
        } else {
          const next = word.slice(0, text.length - 1);
          setText(next);
          if (next === "") {
            setDel(false);
            setI((v) => v + 1);
          }
        }
      },
      del ? 45 : 90
    );
    return () => clearTimeout(t);
  }, [text, del, i, words]);
  return text;
}

function Section({ id, num, jp, sub, title, children }: { id: string; num: string; jp: string; sub: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="reveal mb-12 flex items-end gap-5">
        <span className="font-display text-7xl leading-none text-neon/25 md:text-8xl">{num}</span>
        <div>
          <p className="font-jp text-sm tracking-[0.35em] text-aqua">
            {jp} <span className="font-body text-white/40">/ {sub}</span>
          </p>
          <h2 className="font-display text-4xl tracking-wide text-white md:text-6xl">{title}</h2>
          <span className="mt-2 block h-1 w-28 -skew-x-12 bg-gradient-to-r from-neon to-aqua" />
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-white/10 pb-1.5">
      <dt className="shrink-0 font-mono text-[11px] tracking-[0.3em] text-white/45">{k}</dt>
      <dd className="text-right font-semibold text-white">{v}</dd>
    </div>
  );
}

export default function App() {
  const [filter, setFilter] = useState("All");
  useReveal(filter);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState(true);
  const typed = useTyping(resume.roles);

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(resume.projects.map((p) => p.category)))], []);
  const projects = filter === "All" ? resume.projects : resume.projects.filter((p) => p.category === filter);
  const allSkills = useMemo(() => resume.skillGroups.flatMap((g) => g.items), []);
  const socials = resume.socials.filter((s) => s.url);
  const [firstName, ...restName] = resume.name.split(" ");
  const cgpaPct = `${(parseFloat(resume.cgpa) / 10) * 100}%`;

  return (
    <div className={`relative min-h-screen text-white/80 selection:bg-neon/40 ${intro ? "" : "ready"}`}>
      <Suspense fallback={<div className="fixed inset-0 -z-10 bg-ink" />}>
        <Scene />
      </Suspense>

      {/* Intro title card */}
      <div
        onClick={() => setIntro(false)}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink px-6 text-center transition-opacity duration-700 ${intro ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <p className="font-jp text-xl tracking-[0.6em] text-aqua">{resume.jpName}</p>
        <h1 className="mt-2 font-display text-5xl tracking-wider text-white md:text-7xl">
          <span className="glitch">{resume.name.toUpperCase()}</span>
        </h1>
        <div className="mt-8 h-1.5 w-64 overflow-hidden bg-white/10">
          <div className="loader-bar h-full bg-gradient-to-r from-neon via-gold to-aqua" />
        </div>
        <p className="mt-3 font-mono text-xs tracking-[0.3em] text-white/50">LOADING EPISODE 01 ▸ PORTFOLIO</p>
      </div>

      <div className="scanlines pointer-events-none fixed inset-0 z-30 mix-blend-overlay" />
      <div className="fixed left-0 top-0 z-50 h-1 bg-gradient-to-r from-neon via-gold to-aqua" style={{ width: `${progress * 100}%` }} />

      {/* Nav */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all ${scrolled ? "border-b border-white/10 bg-ink/75 backdrop-blur-xl" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 -skew-x-12 place-items-center bg-gradient-to-br from-neon to-aqua font-display text-lg tracking-wider text-ink">
              <span className="skew-x-12">PH</span>
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-lg tracking-wider text-white">{resume.name}</span>
              <span className="block font-jp text-[10px] tracking-[0.4em] text-aqua">{resume.jpName}</span>
            </span>
          </a>
          <nav className="hidden gap-7 md:flex">
            {nav.map((n) => (
              <a key={n.label} href={`#${n.label.toLowerCase()}`} className="group flex flex-col items-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:text-white">
                {n.label}
                <span className="font-jp text-[10px] text-neon/70 transition group-hover:text-neon">{n.jp}</span>
              </a>
            ))}
          </nav>
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-neon" />
              <span className="block h-0.5 w-6 bg-white" />
              <span className="block h-0.5 w-4 bg-aqua" />
            </div>
          </button>
        </div>
        {menu && (
          <div className="flex flex-col gap-4 border-t border-white/10 bg-ink/95 px-6 py-6 md:hidden">
            {nav.map((n) => (
              <a key={n.label} href={`#${n.label.toLowerCase()}`} onClick={() => setMenu(false)} className="flex items-center justify-between font-semibold uppercase tracking-widest text-white/80">
                {n.label}
                <span className="font-jp text-xs text-neon">{n.jp}</span>
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
        <div className="speedlines pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-24">
          <span className="absolute left-4 top-20 hidden h-8 w-8 border-l-2 border-t-2 border-neon/70 md:block" />
          <span className="absolute right-4 top-20 hidden h-8 w-8 border-r-2 border-t-2 border-aqua/70 md:block" />
          <span className="absolute bottom-10 left-4 hidden h-8 w-8 border-b-2 border-l-2 border-aqua/70 md:block" />
          <span className="absolute bottom-10 right-4 hidden h-8 w-8 border-b-2 border-r-2 border-neon/70 md:block" />

          <div className="max-w-3xl">
            <div className="hero-in mb-5 inline-flex items-center gap-2 border border-neon/40 bg-neon/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-sakura" style={{ animationDelay: "0.05s" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
              </span>
              Now open to roles · Season 2027
            </div>
            <p className="hero-in font-jp text-lg tracking-[0.4em] text-aqua" style={{ animationDelay: "0.15s" }}>
              {resume.jpName}
            </p>
            <h1 className="hero-in mt-1 font-display leading-[0.92] tracking-wide text-white" style={{ animationDelay: "0.25s" }}>
              <span className="glitch text-5xl sm:text-7xl lg:text-[6.5rem]">{firstName.toUpperCase()}</span>
              <span className="neon-text block text-5xl text-neon sm:text-7xl lg:text-[6.5rem]">{restName.join(" ").toUpperCase()}</span>
            </h1>
            <p className="hero-in mt-5 h-8 font-mono text-lg text-aqua md:text-2xl" style={{ animationDelay: "0.4s" }}>
              <span className="text-neon">▶</span> {typed}
              <span className="ml-1 inline-block h-6 w-2.5 animate-pulse bg-aqua align-middle" />
            </p>
            <p className="hero-in mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl" style={{ animationDelay: "0.55s" }}>
              {resume.tagline}
            </p>
            <div className="hero-in mt-9 flex flex-wrap gap-4" style={{ animationDelay: "0.7s" }}>
              <a href="#projects" className="btn btn-primary">
                <span>▶ Start · Projects</span>
              </a>
              {resume.resumeUrl ? (
                <a href={resume.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  <span>Download CV</span>
                </a>
              ) : (
                <a href="#contact" className="btn btn-ghost">
                  <span>Contact me</span>
                </a>
              )}
            </div>
            <div className="hero-in mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60" style={{ animationDelay: "0.85s" }}>
              <span>📍 {resume.location}</span>
              <span>🎓 B.E. CSE · CGPA {resume.cgpa}</span>
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="transition hover:text-aqua">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="vertical-jp absolute right-8 top-1/2 hidden -translate-y-1/2 font-jp text-sm tracking-[0.6em] text-white/30 xl:block">ポートフォリオ・二〇二七</div>
        <a href="#about" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">
          Scroll <span className="font-jp">スクロール</span>
          <span className="flex h-10 w-6 justify-center border border-white/30 pt-2">
            <span className="h-2 w-1 animate-bounce bg-neon" />
          </span>
        </a>
      </section>

      {/* Ticker */}
      <div className="relative left-1/2 z-10 w-[104vw] -translate-x-1/2 -rotate-1 border-y-2 border-ink bg-neon py-2.5 text-ink shadow-[0_0_40px_rgba(255,45,149,0.5)]">
        <div className="overflow-hidden">
          <div className="marquee items-center">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className={`flex items-center ${i % 2 ? "font-jp text-base font-bold" : "font-display text-2xl tracking-widest"}`}>
                {t}
                <span className="mx-6 text-sm">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <Section id="about" num="01" jp="自己紹介" sub="About" title="Character Profile">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="reveal space-y-5 text-lg leading-relaxed lg:col-span-3">
            {resume.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {resume.education.map((e) => (
              <TiltCard key={e.school} glow="#ffd166" className="p-5">
                <p className="font-mono text-[11px] tracking-[0.3em] text-gold">GUILD · 学校</p>
                <p className="mt-1 text-xl font-bold text-white">🎓 {e.degree}</p>
                <p className="text-base text-white/70">{e.school}</p>
                <p className="mt-1 font-mono text-sm text-aqua">{e.period}</p>
              </TiltCard>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <TiltCard className="p-4" glow="#22d3ee">
                <p className="mb-2 font-mono text-[11px] tracking-[0.3em] text-aqua">LANGUAGES · 言語</p>
                <div className="flex flex-wrap gap-2">
                  {resume.languages.map((l) => (
                    <span key={l} className="border border-aqua/40 bg-aqua/10 px-3 py-0.5 text-sm text-aqua">{l}</span>
                  ))}
                </div>
              </TiltCard>
              <TiltCard className="p-4" glow="#ff2d95">
                <p className="mb-2 font-mono text-[11px] tracking-[0.3em] text-neon">INTERESTS · 趣味</p>
                <div className="flex flex-wrap gap-2">
                  {resume.interests.map((l) => (
                    <span key={l} className="border border-neon/40 bg-neon/10 px-3 py-0.5 text-sm text-sakura">{l}</span>
                  ))}
                </div>
              </TiltCard>
            </div>
          </div>

          <div className="reveal lg:col-span-2">
            <TiltCard className="p-6" glow="#22d3ee">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-3xl tracking-wider text-white">STATUS</p>
                <span className="font-jp text-xs tracking-[0.3em] text-aqua">ステータス</span>
              </div>
              <dl className="space-y-2.5 text-sm">
                <Row k="NAME" v={resume.name} />
                <Row k="CLASS" v="ML × Full-Stack" />
                <Row k="LEVEL" v="Final Year · Class of 2027" />
                <Row k="GUILD" v="PSV College of Engg. & Tech." />
                <Row k="BASE" v="Tirupattur, Tamil Nadu" />
              </dl>
              <div className="mt-6">
                <div className="flex justify-between font-mono text-xs">
                  <span className="tracking-[0.3em] text-white/50">CGPA</span>
                  <span className="text-gold">{resume.cgpa} / 10</span>
                </div>
                <div className="mt-1.5 h-3 w-full -skew-x-12 bg-white/10">
                  <div className="stat-bar h-full bg-gradient-to-r from-neon via-gold to-aqua" style={{ "--w": cgpaPct } as CSSProperties} />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {resume.stats.map((s) => (
                  <div key={s.label} className="border border-white/10 bg-white/[0.03] p-3">
                    <p className="bg-gradient-to-br from-sakura to-aqua bg-clip-text font-display text-3xl tracking-wider text-transparent">{s.value}</p>
                    <p className="text-xs uppercase tracking-widest text-white/55">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="mb-2 font-mono text-[11px] tracking-[0.3em] text-white/45">JOB CLASSES · 目標職種</p>
                <div className="flex flex-wrap gap-2">
                  {resume.roles.map((r) => (
                    <span key={r} className="border border-aqua/40 bg-aqua/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-aqua">{r}</span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </Section>

      {/* Experience */}
      <Section id="experience" num="02" jp="修行編" sub="Internships" title="Training Arc">
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-neon via-aqua to-transparent md:left-1/2" />
          <div className="space-y-12">
            {resume.experience.map((job, i) => (
              <div key={job.company} className={`reveal relative flex flex-col md:flex-row ${i % 2 ? "md:flex-row-reverse" : ""}`}>
                <div className="absolute left-4 top-6 z-10 h-4 w-4 -translate-x-1/2 rotate-45 border-2 border-ink bg-neon shadow-[0_0_18px] shadow-neon md:left-1/2" />
                <div className={`pl-12 md:w-1/2 md:pl-0 ${i % 2 ? "md:pl-12" : "md:pr-12"}`}>
                  <TiltCard className="p-6" glow={i % 2 ? "#22d3ee" : "#ff2d95"}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg tracking-wider text-neon">EP.0{i + 1}</span>
                      <span className="font-mono text-[11px] tracking-[0.3em] text-white/45">INTERNSHIP</span>
                    </div>
                    <h3 className="mt-1 text-2xl font-bold text-white">{job.role}</h3>
                    <p className="text-sm font-semibold text-aqua">
                      {job.company}
                      {job.location && ` · ${job.location}`}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {job.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-neon" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tech.map((t) => (
                        <span key={t} className="bg-white/5 px-2 py-0.5 font-mono text-xs text-white/70">{t}</span>
                      ))}
                    </div>
                  </TiltCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section id="projects" num="03" jp="プロジェクト編" sub="Projects" title="Project Arc">
        <div className="reveal mb-8 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = filter === c;
            const count = c === "All" ? resume.projects.length : resume.projects.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`-skew-x-12 border px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                  active ? "border-transparent bg-gradient-to-r from-neon to-aqua text-ink" : "border-white/15 bg-white/5 text-white/70 hover:border-neon/60 hover:text-white"
                }`}
              >
                <span className="inline-block skew-x-12">
                  {c} <span className="opacity-60">{count}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const meta = catMeta[p.category] ?? catMeta.ML;
            const ep = String(resume.projects.indexOf(p) + 1).padStart(2, "0");
            return (
              <div key={p.title} className="reveal" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <TiltCard className="h-full" glow={meta.color}>
                  <div
                    className="relative h-36 overflow-hidden"
                    style={{ background: `radial-gradient(circle at 25% 30%, ${meta.color}55, transparent 60%), radial-gradient(circle at 85% 80%, ${meta.color}33, transparent 50%), #0e0824` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px]" />
                    <span className="absolute right-6 top-6 font-jp text-4xl font-bold text-white/[0.07]">{meta.jp}</span>
                    <div className="cube absolute left-1/2 top-1/2" style={{ "--c": meta.color } as CSSProperties}>
                      {faces.map((f) => (
                        <div key={f} className={`face ${f}`} />
                      ))}
                    </div>
                    <span className="absolute left-4 top-3 font-display text-xl tracking-wider text-white/90">EP.{ep}</span>
                    <span className="absolute bottom-3 left-4 -skew-x-12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink" style={{ background: meta.color }}>
                      {p.category}
                    </span>
                    {p.badge && <span className="absolute bottom-3 right-3 border border-gold/50 bg-ink/70 px-2 py-0.5 text-[11px] text-gold backdrop-blur">{p.badge}</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{p.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span key={t} className="border px-2.5 py-0.5 text-xs" style={{ borderColor: `${meta.color}66`, color: meta.color }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold uppercase tracking-wider text-white hover:text-aqua">
                        View project ↗
                      </a>
                    )}
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>

        {/* SIH special arc */}
        <div className="reveal mb-8 mt-20">
          <p className="font-jp text-sm tracking-[0.35em] text-neon">
            特別編 <span className="font-body text-white/40">/ Special Arc · Smart India Hackathon 2026</span>
          </p>
          <h3 className="font-display text-3xl tracking-wide text-white md:text-5xl">SIH 2026 Submissions</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {resume.sih.map((s, i) => (
            <div key={s.title} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <TiltCard className="h-full p-6" glow="#ff2d95">
                <div className="flex items-center justify-between">
                  <span className="bg-neon/15 px-2 py-0.5 font-mono text-xs text-neon">{s.code}</span>
                  {s.lead && <span className="border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">👑 TEAM LEADER</span>}
                </div>
                <h4 className="mt-4 text-xl font-bold text-white">{s.title}</h4>
                <p className="mt-2 text-sm">{s.description}</p>
              </TiltCard>
            </div>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section id="skills" num="04" jp="スキル" sub="Abilities" title="Skill Tree">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {resume.skillGroups.map((g, i) => (
              <div key={g.title} className="reveal" style={{ transitionDelay: `${(i % 2) * 0.08}s` }}>
                <TiltCard className="h-full p-4" glow={i % 2 ? "#22d3ee" : "#ff2d95"}>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                    <span className="mr-1.5">{g.icon}</span>
                    {g.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((s) => (
                      <span key={s} className="bg-white/5 px-2 py-0.5 text-xs text-white/75">{s}</span>
                    ))}
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
          <div className="reveal">
            <SkillSphere skills={allSkills} />
            <p className="text-center font-mono text-[11px] tracking-[0.3em] text-white/40">SKILL ORB · move cursor to spin</p>
          </div>
        </div>
      </Section>

      {/* Credentials */}
      <Section id="credentials" num="05" jp="資格・実績" sub="Certifications & achievements" title="Achievements Unlocked">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
            {resume.certifications.map((c, i) => (
              <div key={c.name} className="reveal" style={{ transitionDelay: `${(i % 2) * 0.08}s` }}>
                <TiltCard className="h-full p-4" glow="#22d3ee">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 -skew-x-6 place-items-center bg-gradient-to-br from-neon/30 to-aqua/30 text-sm">📜</span>
                    <div>
                      <p className="text-sm font-bold leading-snug text-white">{c.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] tracking-wider text-aqua/80">{c.issuer}</p>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
          <div className="space-y-4 lg:col-span-2">
            <h3 className="reveal font-display text-2xl tracking-wider text-white">
              🏅 TROPHIES <span className="font-jp text-sm text-gold">トロフィー</span>
            </h3>
            {resume.achievements.map((a, i) => (
              <div key={a.text} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <TiltCard className="p-5" glow="#ffd166">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{a.icon}</span>
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.3em] text-gold">ACHIEVEMENT UNLOCKED</p>
                      <p className="text-sm text-white/85">{a.text}</p>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact" num="06" jp="連絡先" sub="Contact" title="Send a Signal">
        <div className="reveal">
          <TiltCard className="p-8 md:p-12">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-lg">
                  I'm looking for opportunities as a <span className="text-aqua">Data Analyst</span>, <span className="text-neon">ML Engineer</span>,{" "}
                  <span className="text-lime-300">Full-Stack Developer</span> or <span className="text-gold">SDE</span>. Drop me a message to talk projects, internships or full-time roles.
                </p>
                <div className="mt-8 space-y-3 text-white/70">
                  {resume.email && (
                    <a href={`mailto:${resume.email}`} className="block text-xl font-bold text-white hover:text-aqua">{resume.email}</a>
                  )}
                  {resume.phone && <p>📞 {resume.phone}</p>}
                  <p>📍 {resume.location}</p>
                  <div className="flex gap-4 pt-2">
                    {socials.map((s) => (
                      <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-aqua">{s.label} ↗</a>
                    ))}
                  </div>
                </div>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  window.location.href = `mailto:${resume.email}?subject=${encodeURIComponent(`Hello from ${f.get("name")}`)}&body=${encodeURIComponent(String(f.get("message")))}`;
                }}
              >
                <input name="name" required placeholder="Your name" className="w-full border-2 border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-neon" />
                <input name="email" type="email" required placeholder="Your email" className="w-full border-2 border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-neon" />
                <textarea name="message" required rows={4} placeholder="Your message" className="w-full resize-none border-2 border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-neon" />
                <button className="btn btn-primary w-full justify-center">
                  <span>Transmit ▶</span>
                </button>
              </form>
            </div>
          </TiltCard>
        </div>
      </Section>

      <footer className="relative border-t border-white/10 py-12 text-center">
        <p className="font-jp text-3xl font-bold text-white">つづく</p>
        <p className="mt-1 font-display text-xl tracking-[0.3em] text-neon">TO BE CONTINUED…</p>
        <p className="mt-6 text-sm text-white/40">
          © {new Date().getFullYear()} {resume.name} · Built with React Three Fiber · Anime edition
        </p>
      </footer>
    </div>
  );
}
