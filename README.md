# Parameshwaran H — Anime-themed 3D Portfolio

React 19 + Vite + Tailwind CSS v4 + React Three Fiber / drei.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/index.html (single file, deploy anywhere: Vercel / Netlify / GitHub Pages)
```

## Complete source — file map

| File | What it does |
|---|---|
| `index.html` | Page shell, title/meta, Google Fonts (Bangers, Rajdhani, Noto Sans JP) |
| `src/main.tsx` | React entry point |
| `src/index.css` | Tailwind import, theme tokens (`neon`, `aqua`, `sakura`, `gold`, `ink`, display/body/jp fonts), manga-panel card styles, glitch text, speed lines, scanlines, marquee, loaders, orbit rings, CSS cube |
| `src/App.tsx` | The whole page: intro title card, nav, hero (typing roles, glitch name), role ticker, Character Profile (status card), Training Arc (internships), Project Arc (filterable 12 projects + SIH special arc), Skill Tree, Achievements Unlocked, Contact, "つづく" footer |
| `src/components/Scene.tsx` | Fixed full-screen 3D background: cel-shaded torii gate, giant anime moon with glow, floating paper lanterns, 240 instanced falling sakura petals, neon grid floor, stars & sparkles, scroll/mouse camera rig |
| `src/components/TiltCard.tsx` | Manga-panel card: cut corner, halftone screentone, cursor-follow glow, 3D tilt |
| `src/components/SkillSphere.tsx` | CSS-3D rotating "skill orb" with magic-circle orbit rings |
| `src/data/resume.ts` | **All content lives here** — edit this file to update the portfolio |
| `src/utils/cn.ts` | Tailwind class-merge helper |

## Customize

1. **Content** — everything (name, roles, projects, skills, certifications, SIH entries, achievements) is in `src/data/resume.ts`.
2. **Contact details** — fill in `email`, `phone`, `resumeUrl` and the GitHub / LinkedIn `url`s (blank fields are hidden automatically).
3. **Project links** — add a `link` to any project and a "View project ↗" button appears on its card.
4. **Colors** — change the `--color-*` tokens in `src/index.css` (`@theme` block). 3D scene colors are constants at the top of `Scene.tsx`.
5. **Intro card** — duration is the `setTimeout(..., 1700)` in `App.tsx`; click anywhere to skip it.
"# port_001" 
