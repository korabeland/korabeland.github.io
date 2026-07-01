# CLAUDE.md — Portfolio Site (korabeland.github.io)

Portfolio site ("The Workshop") — a lean, **self-updating project hub**: a curated, numbered index of Korab's public GitHub repos, each linking straight out to the repo. No on-site case studies — depth lives in repo READMEs. A scheduled watchdog keeps the hub current as new repos go public; see "Watchdog" below.

## Tech Stack & Deployment

- **Astro 5.x** — Static site generator, `.astro` component format, content-layer collections (`glob` loader)
- **TypeScript** — Strict mode
- **Vitest** — Test runner (`npm test`). Astro content-collection/DOM logic is extracted into plain `src/lib/*.ts` modules so it's testable without the Astro runtime — see `src/lib/theme.ts`, `src/lib/projects.ts`, `src/lib/github-meta.ts` for the pattern.
- **CSS Custom Properties** — Warm-terminal design system in `src/styles/global.css`
- **GA4 Analytics** — Measurement ID `G-LVJ7FH16ZK`
- **Hosting:** GitHub Pages via GitHub Actions. Push to `main` triggers build + deploy (`.github/workflows/deploy.yml`).

```bash
npm run dev        # Dev server with hot reload (runs predev: GitHub metadata enrichment)
npm run build      # Production build (runs prebuild: GitHub metadata enrichment)
npm run preview    # Preview production build
npm test           # Run the Vitest suite
```

## Key Architectural Decisions

1. **Static output** — all pages pre-rendered to HTML, no client-side JS framework
2. **Single page, single Header/Footer variant** — this is a one-page hub with no subpages; no `variant` prop branching
3. **CSS variables for theming** — all colors, spacing, layout values in `:root` / `[data-theme]`
4. **Warm-terminal design system** — dark-default, warm amber-on-near-black, oversized Space Grotesk + General Sans + JetBrains Mono. See `DESIGN.md` (source of truth, fully implemented).
5. **Projects are data, not markup** — each project card is a file in the `projects` content collection (`src/content/projects/{slug}.md`), not hand-authored page markup. See "Project cards" below.
6. **Accessibility-first** — skip link, semantic HTML, focus states, WCAG AA minimum

## Design System

**Always read `DESIGN.md` before any visual or UI work.** It is the source of truth for
typography, color tokens (light + dark), spacing, layout, decoration, and a11y. Do not
deviate without Korab's approval. In QA, flag any code that doesn't match `DESIGN.md`.

**Known gap:** light-mode `--accent` (`#d97706`) on light-mode `--bg` (`#faf7f2`) computes to ~2.98:1 contrast, which fails WCAG AA as a text color (needs 3:1). Current code works around this locally — `--accent` is reserved for decorative/hover-only uses (see the comments in `ProjectRow.astro` and `Footer.astro`), never as resting body-text color. The token values themselves haven't been changed; if this needs a systemic fix, that's a `DESIGN.md` color decision, not a component-level one.

## Project cards

Each project on the hub is one file: `src/content/projects/{slug}.md`, validated against the Zod schema in `src/content.config.ts` (`name`, `slug`, `hook`, `tech[]`, `repo_url`, `language?`, `last_push?`, `order?`, `status`).

- **`status: live`** (the default) renders on the page. **`status: skipped`** never renders but stays committed — it's the denylist, so the watchdog never re-proposes that repo.
- **`hook`** is the one-line voice-crafted description. For watchdog-drafted cards this starts as the raw GitHub repo description (a placeholder) — rewrite it in voice before merging the card's PR.
- **`order`** (optional) pins manual position; unordered cards sort after ordered ones, by `last_push` descending.
- To add a card by hand: create the file directly. To let a new public repo get proposed automatically: do nothing — the watchdog finds it (see below).

## Watchdog

`.github/workflows/watchdog.yml` runs `scripts/scan-repos.ts` on a weekly schedule (Mondays, also runnable via `workflow_dispatch` for a manual/dry-run check) to find newly-public repos under the `korabeland` GitHub account.

- **Filter:** keeps original, non-archived, non-empty public repos; drops forks, archived/empty repos, and the two site repos (`korabeland.github.io`, `korabeland.com`).
- **Dedup:** a repo already present in `src/content/projects/` under *any* `status`, or with an already-open watchdog PR, is never re-proposed.
- **On a new repo:** writes `src/content/projects/{slug}.md` with `status: live` and the GitHub description as a starter hook, then opens a PR titled exactly `Add project card: {slug}` (this exact title format is load-bearing — `scan-repos.ts` dedups against open PRs by matching this prefix; don't change it in one file without the other).
- **Korab's review of that PR:** merge as-is to publish (ideally after rewriting `hook` in voice); edit `status: live` → `status: skipped` and merge to permanently skip (denylist); close without merging to leave it open for re-proposal next run (no committed record either way).
- Build-time GitHub metadata (`language`, `last_push` per repo, live-project count, freshest-push date) is separate from the cards themselves — see `scripts/enrich-projects.ts`, which writes a gitignored `src/data/github-meta.json` on `predev`/`prebuild`, falling back to the committed `src/data/github-meta.seed.json` if the API is unreachable. The footer's "synced from github" line reads this via `src/lib/github-meta.ts`.

**Doing any of this from a CLI/agent session instead of the GitHub web UI:**
```bash
gh workflow run watchdog.yml                     # trigger a manual scan
gh pr merge <branch> --squash                    # merge as-is: publish
# ...or edit status: live -> status: skipped, commit, push, then:
gh pr merge <branch> --squash                    # merge with skip: denylist
gh pr close <branch>                              # close without merging: leave for re-proposal
```

## Component Conventions

- Define `interface Props {}` in frontmatter for type safety
- Use `<slot />` for composable content
- Use `is:inline` on scripts that must execute immediately (e.g. the pre-paint theme script in `BaseLayout.astro`)
- External links: always `target="_blank" rel="noopener noreferrer"`
- Files under `src/pages/_dev/` are dev-only preview routes (Astro's underscore-prefix convention excludes them from routing entirely, in both `dev` and `build`) — used to build/audit a component against `DESIGN.md` before wiring it into the real page

## Analytics

GA4 included on every page via `Analytics` component in `BaseLayout`. Custom events: `contact_click`, `resume_download`, `linkedin_click`, `github_click`. (`project_card_click`, `case_study_read_complete`, `artifact_open`, and `multi_project_session` were removed — all four tracked multi-page/case-study behavior that a single-page hub can no longer produce.)

## Important Notes

- **Minimal JS** — only add client-side JS when truly needed
- **Performance** — keep external dependencies minimal, no CDN libraries
- **`docs/` folder** — planning artifacts (`docs/brainstorms/`, `docs/plans/`), not part of the Astro build

## Brand Context

Read these from the parent repo when brand-level context is needed:
- `../CLAUDE.md` — architecture, collaboration model, session hygiene
- `../STRATEGY.md` — mission, positioning, audience, content pillars
- `../identity/` — brand foundation (voice, values, personality, archetype)
