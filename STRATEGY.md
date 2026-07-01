# Portfolio Site Strategy

This document covers strategy specific to the portfolio site (korabeland.github.io). For the master brand strategy, see `STRATEGY.md` in the parent repo (`Korab's Personal Brand/`).

---

## Purpose

A curated, **self-updating index of public work** — proof Korab builds, not a sales pitch. This is "The Workshop" in the hub-and-spoke architecture: korabeland.com carries personhood and writing, this site is the proof-of-building layer. Cards link straight to the repo; there are no on-site case studies or deep dives — that depth lives in repo READMEs, revisited on-site only if a specific project ever warrants it.

## Audience

Hiring managers, technical peers, and collaborators — for CX / product / AI-strategy roles specifically, not positioned as a pure software-engineer portfolio.

## Tone

Portfolio-first and personality-led, not sales-heavy. Competent, evidence-backed, show-don't-tell.

---

## Content Priorities

1. Curation over completeness — the hub stays a deliberately-chosen set, never a full repo dump
2. Each card earns its place with a one-line voice-crafted hook, not a lifted GitHub description
3. Currency without manual upkeep — the watchdog (see `CLAUDE.md`) proposes new cards as repos go public; Korab approves, edits, or skips
4. Link out, don't retell — the repo README is the source of truth for project depth

## Conversion Design

- **Primary CTA:** Email me
- **Secondary CTA:** Click through to a repo
- **Tertiary CTA:** Download resume
- **Cross-link:** Route visitors to korabeland.com for the full picture

---

## Architecture (settled)

Astro 5, static output, single page, deployed to GitHub Pages via GitHub Actions on push to
`main`. Projects are a schema-validated content collection (`src/content/projects/`), not
hand-authored pages — see `CLAUDE.md`'s "Project cards" and "Watchdog" sections for the
current model. The 2026-03 static-HTML → Astro migration and the 2026-06 grayscale →
warm-terminal / case-studies → hub rebuild are both complete; there is no pending migration.
