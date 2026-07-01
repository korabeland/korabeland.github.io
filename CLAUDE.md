# CLAUDE.md — Portfolio Site (korabeland.github.io)

Portfolio site ("The Workshop") — curated layer over GitHub repos that contextualizes the code with case studies.

## Tech Stack & Deployment

- **Astro 5.x** — Static site generator, `.astro` component format
- **TypeScript** — Strict mode
- **CSS Custom Properties** — Design system in `src/styles/global.css`
- **GA4 Analytics** — Measurement ID `G-LVJ7FH16ZK`
- **Hosting:** GitHub Pages via GitHub Actions. Push to `main` triggers build + deploy.

```bash
npm run dev        # Dev server with hot reload
npm run build      # Production build
npm run preview    # Preview production build
```

## Key Architectural Decisions

1. **Static output** — all pages pre-rendered to HTML, no client-side JS framework
2. **Layout hierarchy** — BaseLayout -> specialized layouts -> page content via `<slot />`
3. **Header/Footer variants** — `variant='home'` uses anchor links, `variant='subpage'` uses absolute paths
4. **CSS variables for theming** — all colors, spacing, layout values in `:root`
5. **Warm-terminal design system** — dark-first, warm amber-on-near-black, oversized Space Grotesk + JetBrains Mono. See `DESIGN.md`. (Supersedes the old grayscale-only system; the redesign is tracked in `docs/brainstorms/portfolio-hub-redesign-requirements.md`.)
6. **Accessibility-first** — skip link, semantic HTML, focus states, WCAG AA minimum

## Design System

**Always read `DESIGN.md` before any visual or UI work.** It is the source of truth for
typography, color tokens (light + dark), spacing, layout, decoration, and a11y. Do not
deviate without Korab's approval. In QA, flag any code that doesn't match `DESIGN.md`.

The current `src/styles/global.css` still reflects the *old* grayscale system — it will be
replaced when the warm-terminal redesign is implemented.

## Adding Content

### New Project Case Study
1. Create `src/pages/projects/{project-name}.astro`
2. Use `ProjectLayout` with props: `title`, `description`, `githubHref`
3. Add `ProjectCard` entry to homepage projects grid
4. Follow existing structure: stat cards -> sections -> role breakdown -> learnings

### New Prompt Library Content
- **Category page:** `src/pages/prompt-library/categories/{name}.astro` using `PromptCategoryLayout`
- **Detail page:** `src/pages/prompt-library/details/{category}/{name}.astro` using `PromptDetailLayout`
- **Download-only:** Use `PromptDownloadCard` component within category pages

## Component Conventions

- Define `interface Props {}` in frontmatter for type safety
- Use `<slot />` for composable content
- Use `is:inline` on scripts that must execute immediately
- External links: always `rel="noopener noreferrer"`

## Analytics

GA4 included on every page via `Analytics` component in `BaseLayout`. Custom events: `contact_click`, `resume_download`, `linkedin_click`, `github_click`, `project_card_click`, `artifact_open`, `case_study_read_complete`, `multi_project_session`.

## Important Notes

- **Minimal JS** — only add client-side JS when truly needed
- **Performance** — keep external dependencies minimal, no CDN libraries
- **`docs/` folder** — legacy static HTML, not part of Astro build

## Brand Context

Read these from the parent repo when brand-level context is needed:
- `../CLAUDE.md` — architecture, collaboration model, session hygiene
- `../STRATEGY.md` — mission, positioning, audience, content pillars
- `../identity/` — brand foundation (voice, values, personality, archetype)
