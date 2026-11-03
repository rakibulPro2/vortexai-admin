# VortexAI - Premium SaaS & AI Admin Dashboard

Responsive HTML + Tailwind CSS admin template with light and dark mode. 11 pages, vanilla JavaScript, no third-party scripts, works 100% offline.

## Folder structure
```
vortexai-admin/
├── index.html          Dashboard: KPIs, live system monitor, charts, transactions, activity feed, API key generator
├── analytics.html      Retention heatmap, traffic sources, performance table, top countries
├── users.html          User management (search, filters, add / edit / delete)
├── products.html       Product catalog (category chips, search, Add Product modal)
├── chat.html           Messaging app (conversation list, bubbles, attachments)
├── file-manager.html   Storage overview, drag & drop upload, folders, files table/grid
├── billing.html        Plan overview, saved cards, invoice history with PDF download
├── calendar.html       Month / week / day calendar, upcoming events, add & edit events
├── settings.html       Tabs: profile, password & security, system alerts
├── login.html          Split-screen sign-in
├── register.html       Split-screen sign-up with live password checklist
├── assets/
│   ├── css/style.css   Compiled + minified stylesheet
│   ├── js/app.js       All interactivity, organised in numbered sections
│   ├── js/theme-init.js Applies the saved light/dark theme before first paint
│   └── img/favicon.svg
├── src/input.css       Stylesheet source: base layer, reusable components, design extras
├── tailwind.config.js  Design tokens: colours, type scale, shadows, animations, small plugin
└── package.json        Build scripts
```

## Quick start
Unzip and open `index.html` in any modern browser. No install, no internet connection needed.
For production, upload the whole folder to any static host.

## Design system
| Token | Value | Use |
|---|---|---|
| `midnight-950` | `#0B0F19` | Dark-mode page background |
| `volt-500` | `#10B981` | Electric Emerald accent |
| `cyber-500` | `#8B5CF6` | Cyber Purple accent |
| `bg-vortex-gradient` | volt to cyber | Brand gradient |

Other tokens in `tailwind.config.js`: `font-display` / `font-mono` stacks, `text-display-*` and `text-eyebrow` sizes, shadows (`shadow-card`, `shadow-glow-volt`, `shadow-glow-cyber`, `shadow-neon`, `shadow-inner-glow`), animations (`animate-neon-pulse`, `animate-slide-up`, `animate-slide-in-right`, `animate-shimmer`, `animate-orbit`, `animate-gradient-shift`, `animate-float`) and utilities (`tabular`, `scrollbar-subtle`, `bg-grid`).

Reusable components live in `src/input.css` (`@layer components`): `vx-card`, `vx-input`, `vx-label`, `vx-btn-primary`, `vx-btn-ghost`, `vx-btn-icon`, `vx-thead`, `vx-row`, `vx-pill`, `vx-nav-link`, `vx-modal-panel`, `vx-dropdown`. Change one of them and every page follows.

## Dashboard widgets (index.html)
- **Live System Resource & API Performance Monitor**: SVG progress rings for CPU, memory and API response time plus a response-time sparkline. Values are simulated and refresh every 2 seconds. Replace `nextSample()` in `assets/js/app.js` (section 12) with a call to your metrics endpoint.
- **Quick API Key Generator**: scoped key form (name, environment, expiry, scopes), cryptographically random key via `crypto.getRandomValues`, show/hide, copy to clipboard (with fallback), revoke list. Keys exist only in the browser and are not stored.
- **Recent System Activity Feed**: timeline with staggered entrance animation (`animate-slide-up` plus `[animation-delay:Nms]`).

## Customising
- **Brand**: search for `VortexAI` (sidebar, titles, footer, auth pages). The logo is an inline SVG in each page.
- **Colours / fonts / shadows**: edit `tailwind.config.js`, then rebuild.
- **Demo data**: arrays at the top of each section in `assets/js/app.js`.
- **New page**: copy any page, change the content inside `<main>`, and add the sidebar link on every page.
- **Default theme**: light. To start in dark, change the check in `assets/js/theme-init.js`.

## Rebuilding the stylesheet
Requires Node.js 16+.
```
npm install
npm run build     # writes assets/css/style.css (minified)
npm run watch     # rebuild while you edit
```
Tailwind scans `./*.html` and `./assets/js/app.js`.

## Important notes
- Everything is front-end demo code. Forms, uploads, payments, chat and sign-in do not talk to a server.
- Never handle raw card numbers yourself. Use a payment provider such as Stripe Elements.
- Typography uses system font stacks, so no web fonts are downloaded. To add one, self-host it and put its name first in `fontFamily` in `tailwind.config.js` (check its licence first).
- Images: only CSS and inline SVG artwork, so no third-party image licences apply.

## Credits and licences
- Tailwind CSS v3.4 (MIT), https://tailwindcss.com. The compiled `style.css` includes its base styles.
- Icons are inline SVG paths in the style of the open Lucide / Feather icon sets (MIT / ISC).
- The Google and GitHub logos on the auth pages are trademarks of their owners and are used only as sign-in button icons.

## How this template was built
This template was created with the help of an AI assistant and then reviewed, tested and refined by the author. Replace this paragraph with your own accurate description of your involvement, and follow the marketplace's current AI-disclosure rules when you submit.
