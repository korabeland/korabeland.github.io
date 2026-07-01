# Korab Eland | Project Hub

Live site: `https://korabeland.github.io`

A curated, self-updating index of what I actually build — a numbered list of public GitHub
repos, each linking straight to the repo. No case studies or write-ups on this site; depth
lives in the repo READMEs. korabeland.github.io is the proof-of-building layer; the fuller
picture — who I am, how I think, what I'm writing — is at
[korabeland.com](https://korabeland.com).

## How it stays current

The hub doesn't get hand-edited when I ship something new. A scheduled GitHub Action
(`.github/workflows/watchdog.yml`) scans my public repos weekly, and opens a pull request
proposing a card for anything genuinely new (excluding forks and the site repos themselves).
Merging the PR publishes it; see `CLAUDE.md`'s "Watchdog" section for the full flow.

## Site Architecture

- Astro 5, static output, single page (`src/pages/index.astro`)
- Projects are a content collection (`src/content/projects/`), not hand-authored markup —
  one file per repo, schema-validated
- `DESIGN.md` is the design-system source of truth ("warm terminal": dark-default, amber
  accent, Space Grotesk + General Sans + JetBrains Mono)
- Deploys to GitHub Pages via GitHub Actions on every push to `main`

## Contact

- Email: `korabeland@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/korabeland`
- GitHub: `https://github.com/korabeland`
