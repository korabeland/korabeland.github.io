# Portfolio Site Strategy

This document covers strategy specific to the portfolio site (korabeland.github.io). For the master brand strategy, see `STRATEGY.md` in the parent repo (`Korab's Personal Brand/`).

---

## Purpose

Deep-dive proof of work — case studies, decision frameworks, project detail. This is "The Workshop" in the hub-and-spoke architecture.

## Audience

Hiring managers, technical peers, and collaborators who want to see how Korab thinks and builds.

## Tone

Portfolio-first and personality-led, not sales-heavy. Competent, evidence-backed, show-don't-tell.

---

## Content Priorities

1. Highlight decision-making framework before feature detail
2. Lead with business impact metrics in case studies
3. Keep prompt library as supporting evidence, not the core narrative
4. Show real work — process, tradeoffs, and outcomes

## Conversion Design

- **Primary CTA:** Email me
- **Secondary CTA:** View case studies / read project details
- **Tertiary CTA:** Download resume
- **Cross-link:** Route visitors to korabeland.com for the full picture

---

## Migration Plan

**Current state:** Static HTML/CSS, no build process, deployed to GitHub Pages via `docs/` folder.

**Target state:** Astro site with MDX content, component library, and structured frontmatter for agent-writability.

### Migration Steps
1. Clone repo from GitHub into parent folder as `portfolio-site/`
2. Initialize Astro project alongside existing `docs/`
3. Migrate content page by page — preserve URLs and analytics
4. Update deployment pipeline for Astro build output
5. Archive Drive copy once clone is verified working

### What Stays the Same
- GitHub Pages deployment at korabeland.github.io
- GA4 analytics (measurement ID: G-LVJ7FH16ZK)
- Accessibility standards (WCAG AA)
- Project case study structure

### What Changes
- Static HTML → Astro components + MDX content
- Manual project pages → templated from frontmatter
- No build process → Astro build pipeline
- CSS-only → potential for component-scoped styles
