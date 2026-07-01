# DESIGN.md — korabeland.github.io (Project Hub)

Single source of truth for the korabeland.github.io design system. This is the
"warm terminal" direction: a confident, builder-flavored project hub that is a
**coherent sibling** of korabeland.com, not a clone.

Created by `/design-consultation` on 2026-06-29, grounded in the parent brand
`../DESIGN.md`, `../identity/brand-archetype.md`, `../identity/writing-voice.md`,
and the brainstorm `docs/brainstorms/portfolio-hub-redesign-requirements.md`.

**Relationship to korabeland.com:** the two sites share JetBrains Mono, the amber
accent, the 8px spacing base, light/dark mode, and "whitespace is the design."
They differ on purpose: korabeland.com uses cool near-white minimalism; this hub
uses warm brown-tinted neutrals, oversized Space Grotesk display type, and an
editorial list. Same person, distinct face.

---

## Product Context

- **What this is:** A curated, self-updating project hub — an index of public GitHub repos, each linking out.
- **Who it's for:** Hiring managers, technical peers, collaborators.
- **Project type:** Single-page personal site / portfolio hub (Astro, GitHub Pages).
- **Positioning:** Proof Korab builds, for CX / PM / AI-strategy audiences — not a software-engineer-only portfolio.

---

## Aesthetic Direction

- **Direction:** Warm terminal — dark-first, premium, editorial, builder-flavored.
- **Decoration level:** intentional (three elements only — see below).
- **Mood:** Confident and warm. Flexes through craft and restraint, never through gimmicks. Sincere first (per brand archetype), never performing expertise.
- **Default mode:** Dark. Toggle to light; persist the choice in `localStorage`. If no stored preference, land dark (the signature mode).

---

## Typography

Loaded: Space Grotesk + JetBrains Mono via Google Fonts; General Sans via Fontshare
(`https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap`).

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / project names | Space Grotesk | 500 / 700 | Oversized, geometric, technical character. Hero uses 700; project names 500. |
| Body / UI | General Sans | 400 / 500 | Clean, warm. Deliberately NOT Inter, so the hub has its own voice. |
| Labels / metadata / repo info / indices | JetBrains Mono | 400 / 500 | The builder signal and the family bridge to korabeland.com. Repo names, tech tags, `01 / 03` indices, kicker, footer. |

### Scale (tuned for a ~1040px shell; clamp for responsive)

- Hero display: `clamp(2.75rem, 6vw, 3.5rem)`, line-height 1.02, letter-spacing -0.02em
- Project name: `clamp(1.5rem, 3.5vw, 1.875rem)`, line-height 1.1, letter-spacing -0.01em
- Section label (mono): 0.75rem, letter-spacing 0.1em, uppercase
- Kicker (mono): 0.75rem, letter-spacing 0.08em, uppercase
- Body / project description: 0.9–1rem, line-height 1.55–1.65
- Tags / footer (mono): 0.72–0.78rem

---

## Color

Warm amber on warm near-black. Brown-tinted neutrals distinguish this from
korabeland.com's cool grays. No gradients, no drop shadows.

### Dark mode (default)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0f0d0b` | Page background (warm near-black) |
| `--bg-surface` | `#1a1613` | Card/row hover, header bar |
| `--text` | `#f5f0e8` | Primary text (warm off-white) |
| `--text-muted` | `#a89f92` | Descriptions, metadata, indices |
| `--border` | `#2e2823` | Dividers, hairlines |
| `--accent` | `#f59e0b` | Links, repo arrows, accent bar (amber-500) |
| `--accent-hover` | `#fbbf24` | Hover (amber-400) |

### Light mode

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#faf7f2` | Page background (warm paper) |
| `--bg-surface` | `#ffffff` | Card/row hover, header bar |
| `--text` | `#1a140d` | Primary text (warm near-black) |
| `--text-muted` | `#6b5f4f` | Descriptions, metadata, indices |
| `--border` | `#e8e0d4` | Dividers, hairlines |
| `--accent` | `#d97706` | Links, accent bar (amber-600, brand light accent) |
| `--accent-hover` | `#b45309` | Hover (amber-700) |

### Semantic (both modes)

- Use amber `--accent` for the "live / synced" signal dot.
- success `#3fa86a`, warning `#e3a838`, error `#e2564a` — reserved for build/status UI only, used sparingly.

---

## Spacing

- Base unit: 8px (matches brand).
- Density: spacious. Project rows have tight internal rhythm for scannability.
- Section padding: 96–128px vertical.
- Max content width: ~1040px (wider than the .com prose shell — this is an index, not an essay).
- Row padding: 22px vertical; grows to include 10px horizontal on hover.

---

## Layout

- **Approach:** editorial, left-aligned. NOT a card grid.
- **Hero:** mono kicker → oversized Space Grotesk headline → one-line subtitle (max ~430px).
- **Projects:** a numbered editorial list. Each row: mono `NN / total` index, large project name, one-line voice hook, mono tech tags, `→ github` link aligned right. Hairline divider between rows. Scales cleanly from 3 to 10+ rows.
- **About:** 2–3 sentences, max ~430px, with a cross-link to korabeland.com.
- **Contact:** mono row — Email · GitHub · LinkedIn (X optional).
- **Footer:** mono "synced from github · {date} · {N} public repos".
- **Border radius:** 0 on content (editorial/sharp). 6–8px only on small controls (toggle button). No rounded cards.

---

## Motion

- **Approach:** intentional, restrained.
- **Easing / duration:** 150ms ease on interactive elements (brand standard).
- **Row hover:** background shifts to `--bg-surface`, row gains horizontal padding, the `→` arrow nudges right 3px.
- Respect `prefers-reduced-motion`.

---

## Decoration (intentional — three things only)

Same discipline as the brand doc. Nothing else.

1. **Paper / screen-print grain** — subtle SVG fractal-noise overlay, `pointer-events: none`. ~4% opacity dark, ~3.5% light. Disabled under `prefers-reduced-motion`.
2. **Heading accent bar** — 28px wide, 2.5px amber bar under each section label.
3. **Mono index numbers** (`01 / 03`) — function as ornament and wayfinding.

No gradients. No drop shadows. No glow.

---

## The Technical Flourish

An honest "synced from github · {date}" signal plus real per-repo metadata
(primary language, last push) pulled **at build time**. Demonstrates the
auto-update watchdog is real, with zero gimmickry. Flex through evidence —
exactly what the Sincerity-first archetype calls for.

---

## Accessibility

- Semantic landmarks: `<header>`, `<main>`, `<footer>`.
- Skip-to-content link, visible on focus.
- Keyboard navigation for the theme toggle and all links.
- WCAG AA contrast: 4.5:1 body, 3:1 large text. (Amber `--accent` on dark/light backgrounds verified for links.)
- Minimum 44px touch targets on mobile.
- `prefers-color-scheme` respected as the initial signal when no stored toggle preference exists (default dark otherwise); `prefers-reduced-motion` respected for grain and transitions.

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | <640px | Single column. Index stacks above project name. Hero type scales down via clamp. |
| Tablet | 640–1040px | Content centered in shell. Index inline-left of project content. |
| Desktop | >1040px | Shell at ~1040px max-width, full type scale. |

---

## Sources

- Parent brand system: `../DESIGN.md`
- Brand archetype: `../identity/brand-archetype.md` (Sincerity > Competence > Sophistication)
- Voice: `../identity/writing-voice.md`
- Brainstorm: `docs/brainstorms/portfolio-hub-redesign-requirements.md`
- Taste inputs: `../design/taste/` (screen-print illustration), `../design/reddit_inspiration.md`
- Approved mockup: `~/.gstack/projects/korabeland-personal-brand/designs/portfolio-hub-20260629/`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-29 | Warm-terminal direction adopted | "Confident & warm" over quiet-sibling or bold-flex. Flexes through craft + restraint; stays sincere. |
| 2026-06-29 | Warm brown-tinted neutrals + Space Grotesk + editorial list | Gives the hub its own face, distinct from korabeland.com's cool minimalism. |
| 2026-06-29 | Keep JetBrains Mono + amber + 8px + light/dark | Family resemblance to korabeland.com; the builder signal. |
| 2026-06-29 | Dark-first default | Most on-brief and most distinct from the .com front door; toggle persists in localStorage. |
| 2026-06-29 | "Synced from GitHub" live signal as the one flourish | Honest proof of the watchdog; flex through evidence, not decoration. |
| 2026-06-29 | Project hook copy is voice-crafted, not GitHub descriptions | Hooks written at the curation/draft-card step; GitHub descriptions are placeholders only. |
