# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

**User Profile**: Product manager with limited coding experience, actively learning to become more technical.

**Communication Preference**: When writing code or making technical changes, please:
- Explain the technical architecture and design decisions
- Share educational tips about why specific approaches are chosen
- Break down complex technical concepts into understandable explanations
- Highlight learning opportunities relevant to the codebase

This aligns with the "Explanatory" output style configured for this project.

## Repository Purpose

This is a GitHub Pages portfolio site (`korabeland.github.io`) showcasing AI-assisted development projects through agent collaboration. The site features a clean, grayscale design built with vanilla HTML/CSS.

## Deployment

This repository deploys directly to GitHub Pages at `https://korabeland.github.io`. Changes pushed to the `main` branch are automatically published.

To preview locally:
```bash
# Open the published site entry point
open docs/index.html
```

## Architecture

### Design System (CSS Variables)

All styling is controlled through CSS custom properties defined in `docs/styles.css` at `:root`. **Always modify the design system variables rather than hardcoding values:**

- **Colors**: `--color-primary`, `--color-secondary`, `--color-tertiary`, etc.
- **Spacing**: `--spacing-xs` through `--spacing-2xl`
- **Layout**: `--max-width`

### File Structure

**Documentation & Deployment:**
- `docs/index.html` - Single-page portfolio with sections: hero, about, projects, prompt library, contact
- `docs/styles.css` - All styling with CSS custom properties, organized by component
- `docs/projects/` - Individual project detail pages
- `docs/prompt-library/` - Category and detail pages for prompt library (linked from main page)

**Project Management:**
- `Projects/` - Local project folders and development materials
- `Prompt Library/` - Local storage of prompt templates and examples
- `Claude Skills/` - Custom Claude skills and utilities

**Reference & Configuration:**
- `.claude/` - Claude Code configuration and custom commands
- `code_review_log.md` - Baseline reference from code review (do not modify)
- `AGENTS.md` - This file (agent guidance)
- `CLAUDE.md` - Pointer file to `AGENTS.md`
- `README.md` - Public repo overview for visitors
- `MEMORY.md` - Strategy memory (goals, audience, and conversion priorities)
- `docs/README.md` - Technical guide for `docs/` site source
- `Korab_Eland_Resume.docx` - Professional resume

### Key Architectural Decisions

1. **No Build Process**: Static HTML/CSS only, no frameworks or preprocessors
2. **Inline SVG Icons**: Icons are embedded directly in HTML (no external icon libraries)
3. **CSS Variables for Theming**: All colors, spacing, and layout values use CSS custom properties
4. **Accessibility-First**: Includes skip link, semantic HTML, focus states, and WCAG-compliant design
5. **Single Scrollable Page Principle**: Main portfolio (`docs/index.html`) uses anchor-linked sections for core content (About, Projects, Prompt Library, Contact). Detail pages open separately to avoid cluttering the main experience. New sections should be added to the home page as scrollable sections, not separate pages.

### HTML Structure Conventions

- **Heading Hierarchy**: One `<h1>` per page (in hero section), logo uses `<div>`
- **Main Content**: Wrapped in `<main id="main">` for skip link target
- **External Links**: Always include `rel="noopener noreferrer"` for security
- **SVG Icons**: Use `fill="currentColor"` and `aria-hidden="true"`
- **Analytics**: Every new `docs/*.html` page must include both in `<head>`:
  1. GA4 bootstrap snippet with measurement ID `G-LVJ7FH16ZK`
  2. Shared tracker script: `<script defer src="RELATIVE_PATH_TO/assets/js/analytics-events.js"></script>`
  The shared tracker emits: `contact_click`, `resume_download`, `linkedin_click`, `github_click`, `project_card_click`, `artifact_open`, `case_study_read_complete`, and `multi_project_session`.

### CSS Organization

Styles are organized in this order:
1. CSS Custom Properties
2. Reset & Base Styles
3. Typography
4. Layout Containers
5. Skip Link (Accessibility)
6. Navigation
7. Focus States (Accessibility)
8. Section Styles (Hero, About, Projects, Contact)
9. Component Styles (Cards, Buttons)
10. Footer
11. Responsive Design (@media queries)

## Development Workflow

### Adding New Sections to Home Page

When adding new content to the portfolio (e.g., Prompt Library, Resources, Tools):

1. **Add as scrollable section to `docs/index.html`** - Follow the single scrollable page principle
2. **Use semantic section structure**:
   ```html
   <section id="section-name">
       <div class="container">
           <h2>Section Title</h2>
           <!-- Your content here -->
       </div>
   </section>
   ```
3. **Update main navigation** - Add anchor link to `<nav>`: `<a href="#section-name">Section Name</a>`
4. **Reuse existing card styles** - Use `.category-cards-grid` and `.category-card` or `.project-card` patterns
5. **Keep detail pages separate** - Link to detail/category pages only when content is extensive

**Benefits of this approach:**
- Faster perceived performance (single page load)
- Improved navigation experience (smooth scroll anchors)
- Better SEO (single canonical URL)
- Reduced cognitive load (one entry point)

### Adding New Projects

**Quick Start with Slash Command:**

Run `/create-project-page {project-name}` to automatically generate a new project page. This command:
- Creates `docs/projects/{project-name}.html` with proper structure and styling
- Applies consistent branding and layout matching existing projects
- Includes semantic HTML and accessibility features
- Integrates with the portfolio design system

**Manual Project Card Addition:**

When adding project cards to `docs/index.html`:
1. Place inside `.projects-grid` div
2. Follow existing `.project-card` structure
3. Do NOT add placeholder `project-meta` divs - only add if you have real tech stack data
4. Project links should point to `docs/projects/{project-name}.html`

**Project Page Structure:**
- Use semantic HTML with proper heading hierarchy
- Include project overview, key metrics, and technical details
- Link back to main portfolio using navigation
- Follow the design system variables for consistent styling
- Test accessibility with keyboard navigation (Tab key)

### Modifying Styles

1. Check if a CSS variable exists for the value you need
2. If changing colors/spacing, modify the variable in `:root`
3. Maintain the grayscale color scheme (blacks, grays, whites)
4. Test focus states after style changes (press Tab to verify)

### Code Review

Run the `/review-portfolio` slash command to analyze code quality, accessibility, and performance. This launches an agent that checks for:
- Code redundancy and simplification opportunities
- Accessibility issues (WCAG compliance)
- Best practices and security
- Performance optimizations

Results are compared against `code_review_log.md` baseline.

## Custom Slash Commands & Skills

This project includes custom tools to enhance productivity:

### Slash Commands (`.claude/commands/`)
- **`/create-project-page`** - Automatically generates new project pages with consistent branding and structure

### Available Skills (`.claude/skills/`)

**Portfolio & Career:**
- Resume Builder - Create and optimize professional resumes
- Job Search Strategist - Strategic job search guidance and analysis
- AI Pitch Deck Builder - Build compelling pitch decks for presentations

**Technical Development:**
- Agentic Development Skill - Patterns for building agent-based systems
- Prompting Pattern Library - Curated library of effective prompting patterns
- Vibe Coding - Intuitive approach to code exploration and development
- Excel Automation Skill - Complex Excel workbook development and automation
- Excel Editing Skill - Spreadsheet manipulation and analysis

**Learning & Analysis:**
- Defining Technical Requirements - Elicitation techniques and templates
- Prompting Pattern Library - Failure modes, model quirks, and orchestration patterns
- Continual Learning for AI Agents - Frameworks for agent improvement
- Skill Gap Analyzer - Identify and map skill deficiencies
- Prompt Optimization Analyzer - Evaluate and improve prompts
- Meeting Transcript Analyzer - Extract insights from meeting recordings

**Specialized Tools:**
- Flash Fiction Collaborator - Creative writing collaboration
- Skill Testing Framework - Validate skill implementations
- Skill Performance Profiler - Analyze skill execution metrics
- Skill Dependency Mapper - Map skill relationships
- Skill Security Analyzer - Evaluate skill security posture

To use a skill, invoke it with the Skill tool in Claude Code.

## Git Workflow

```bash
# Standard workflow
git add .
git commit -m "Description of changes"
git push origin main

# Changes will be live on GitHub Pages within minutes
```

## References & Resources

### Documentation Files
- **`code_review_log.md`** - Baseline code review findings and recommendations (reference only, do not modify)
- **`Korab_Eland_Resume.docx`** - Professional resume for job applications

### External Resources
- **GitHub Pages**: Changes pushed to `main` branch publish automatically
- **Portfolio URL**: https://korabeland.github.io
- **Claude Code Docs**: https://docs.claude.com/en/docs/claude-code/

### Accessibility Standards
- **WCAG AA Compliance**: Minimum standard for all pages
- **Keyboard Navigation**: Test all features with Tab key
- **Semantic HTML**: Use proper heading hierarchy and landmarks
- **Color Contrast**: Maintain sufficient contrast ratios (4.5:1 minimum)

### Portfolio Best Practices
- Keep project descriptions concise and focused on impact
- Include metrics where available (performance improvements, user engagement, etc.)
- Link to relevant repositories or live demos
- Update regularly with new projects and learnings

## Important Notes

- **No JavaScript**: This is a CSS-only portfolio. Avoid adding JS unless absolutely necessary.
- **Grayscale Theme**: The design uses only black/white/gray. Don't introduce colors without user approval.
- **Accessibility**: Always test keyboard navigation (Tab key) and maintain WCAG AA standards.
- **Performance**: Keep external dependencies minimal. Avoid adding CDN libraries.
