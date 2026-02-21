# AGENTS.md — Portfolio Site

This file provides guidance to AI coding agents working on the portfolio site (korabeland.github.io). For brand-level context (positioning, voice, content pillars, collaboration model), see `AGENTS.md` in the parent repo (`Korab's Personal Brand/`).

**User Profile**: Product manager and strategic operator, actively building with AI. Limited formal coding background but rapidly technical through agent-assisted development.

**Communication Preference**: When writing code or making technical changes, please:
- Explain the technical architecture and design decisions
- Share educational tips about why specific approaches are chosen
- Break down complex technical concepts into understandable explanations
- Highlight learning opportunities relevant to the codebase

This aligns with the "Explanatory" output style configured for this project.

## Brand Context

This repo is part of a **hub-and-spoke architecture**:
- **korabeland.com** ("The Front Door") — personal site, bio, blog, essays
- **korabeland.github.io** ("The Workshop") — this site, project case studies with thinking and impact
- **LinkedIn & X** — discovery and distribution

User flow: LinkedIn post → korabeland.com → portfolio page → GitHub repo

## Repository Purpose

This is a GitHub Pages portfolio site (`korabeland.github.io`) showcasing AI-assisted development projects. Built with **Astro** (static site generator) using a component-based architecture.

## Deployment

Deployed to GitHub Pages at `https://korabeland.github.io` via GitHub Actions. Pushing to `main` triggers an automated build and deploy workflow (`.github/workflows/deploy.yml`).

```bash
# Local development
npm run dev        # Start dev server with hot reload
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

## Architecture

### Tech Stack

- **Astro 5.x** — Static site generator, `.astro` component format
- **TypeScript** — Strict mode (`tsconfig.json` extends `astro/tsconfigs/strict`)
- **CSS Custom Properties** — Design system in `src/styles/global.css`
- **GA4 Analytics** — Measurement ID `G-LVJ7FH16ZK`

### File Structure

```
src/
├── layouts/
│   ├── BaseLayout.astro           # Root layout: head, nav, footer, analytics
│   ├── ProjectLayout.astro        # Case study pages (extends BaseLayout)
│   ├── PromptCategoryLayout.astro # Prompt library category pages
│   └── PromptDetailLayout.astro   # Individual prompt detail pages
├── components/
│   ├── Analytics.astro            # GA4 snippet (included via BaseLayout)
│   ├── SkipLink.astro             # Accessibility skip-to-main link
│   ├── Header.astro               # Nav bar (variant: 'home' | 'subpage')
│   ├── Footer.astro               # Site footer (variant: 'home' | 'subpage')
│   ├── ProjectCard.astro          # Reusable project card for grid
│   └── PromptDownloadCard.astro   # Download-only prompt card
├── pages/
│   ├── index.astro                # Homepage (hero, about, projects, prompts, contact)
│   ├── projects/
│   │   ├── lead-scoring.astro
│   │   ├── forecasting.astro
│   │   └── chatbot-eval.astro
│   └── prompt-library/
│       ├── categories/            # 5 category listing pages
│       └── details/               # Individual prompt detail pages
└── styles/
    └── global.css                 # Full design system (CSS custom properties)

public/
├── assets/
│   ├── js/analytics-events.js     # GA4 custom event tracking
│   └── resume/                    # Resume downloads
└── downloads/                     # Prompt template .md files
```

### Key Architectural Decisions

1. **Astro Static Output**: Pre-renders all pages to HTML at build time. No client-side JavaScript framework.
2. **Layout Hierarchy**: `BaseLayout` → specialized layouts (`ProjectLayout`, `PromptCategoryLayout`, `PromptDetailLayout`) → page content via `<slot />`
3. **Header/Footer Variants**: `variant='home'` uses anchor links (`#about`), `variant='subpage'` uses absolute paths (`/#about`)
4. **CSS Variables for Theming**: All colors, spacing, and layout values use CSS custom properties in `:root`
5. **Accessibility-First**: Skip link, semantic HTML, focus states, WCAG AA compliance
6. **Clean URLs**: Astro generates `page-name/index.html` for directory-based routing (`/projects/lead-scoring/`)
7. **Inline SVG Icons**: Icons embedded directly in components (no external icon libraries)

### Design System (CSS Variables)

All styling is controlled through CSS custom properties in `src/styles/global.css`:

- **Colors**: `--color-primary`, `--color-secondary`, `--color-tertiary`, etc.
- **Spacing**: `--spacing-xs` through `--spacing-2xl`
- **Layout**: `--max-width`
- **Theme**: Grayscale only (blacks, grays, whites). Don't introduce colors without user approval.

### Analytics

Every page automatically includes GA4 via the `Analytics` component in `BaseLayout`. The shared tracker (`public/assets/js/analytics-events.js`) emits: `contact_click`, `resume_download`, `linkedin_click`, `github_click`, `project_card_click`, `artifact_open`, `case_study_read_complete`, `multi_project_session`.

## Development Workflow

### Adding New Projects

1. Create `src/pages/projects/{project-name}.astro`
2. Import and use `ProjectLayout` with props: `title`, `description`, `githubHref`
3. Add a `ProjectCard` entry to `src/pages/index.astro` in the projects grid
4. Follow existing case study structure: stat cards → sections → role breakdown → learnings

### Adding New Prompt Library Content

**Category page**: Create `src/pages/prompt-library/categories/{name}.astro` using `PromptCategoryLayout`
**Detail page**: Create `src/pages/prompt-library/details/{category}/{name}.astro` using `PromptDetailLayout`
**Download-only**: Use `PromptDownloadCard` component within category pages

### Modifying Styles

1. Check if a CSS variable exists for the value you need
2. If changing colors/spacing, modify the variable in `:root`
3. Maintain the grayscale color scheme
4. Test focus states after style changes (press Tab to verify)

### Component Conventions

- **Props interface**: Define `interface Props {}` in frontmatter for type safety
- **Slots**: Use `<slot />` for composable content in layouts
- **`is:inline`**: Use on `<script>` tags that must execute immediately (e.g., analytics)
- **External links**: Always include `rel="noopener noreferrer"`

## Git Workflow

```bash
git add <specific-files>
git commit -m "Description of changes"
git push origin main
# GitHub Actions deploys automatically
```

## References

- **Portfolio URL**: https://korabeland.github.io
- **Astro Docs**: https://docs.astro.build
- **WCAG AA**: Minimum accessibility standard for all pages
- **GA4 Measurement ID**: `G-LVJ7FH16ZK`

## Important Notes

- **Grayscale Theme**: Only black/white/gray. Don't introduce colors without user approval.
- **Accessibility**: Always test keyboard navigation (Tab key) and maintain WCAG AA standards.
- **Minimal JS**: Astro ships zero JS by default. Only add client-side JS when truly needed.
- **Performance**: Keep external dependencies minimal. No CDN libraries.
- **`docs/` folder**: Legacy static HTML site preserved as reference. Not part of the Astro build.
