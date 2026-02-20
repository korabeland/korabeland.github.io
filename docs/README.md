# docs/ Site Source Guide

This folder is the publishable website source for GitHub Pages.

## Scope
- `index.html`: Homepage narrative and conversion flow.
- `styles.css`: Shared design system and component styles.
- `projects/`: Individual project/case-study pages.
- `prompt-library/`: Prompt library pages, categories, and downloadable assets.

## Editing Rules
1. Keep the homepage portfolio-first, with a calm recruiter-friendly tone.
2. Prioritize business outcomes and decision logic in project summaries.
3. Keep accessibility intact (semantic headings, focus styles, keyboard support).
4. Use existing CSS variables and component patterns in `styles.css`.
5. Add GA4 tracking to every new `docs/*.html` page, including the shared event tracker.

## Analytics (Required on all pages)
Include both snippets before `</head>` on every page in `docs/`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LVJ7FH16ZK"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-LVJ7FH16ZK');
</script>
<script defer src="RELATIVE_PATH_TO/assets/js/analytics-events.js"></script>
```

`RELATIVE_PATH_TO` examples:
- `assets/js/analytics-events.js` for files directly under `docs/`
- `../assets/js/analytics-events.js` for files under `docs/projects/` or `docs/prompt-library/`
- `../../assets/js/analytics-events.js` for files under `docs/prompt-library/categories/`
- `../../../assets/js/analytics-events.js` for files under `docs/prompt-library/details/document-templates/`

## Local Preview
Open `docs/index.html` in a browser.

## Publishing
Use `scripts/publish-docs.ps1` from repo root to publish only `docs/` into the public site repository.
