# CRM template

Standalone front-end CRM demo: plain HTML, CSS and JavaScript, no build step and no backend. Open `index.html` or deploy the folder as a static site.

## Files
| File | What it holds |
| --- | --- |
| `config.js` | Per-client settings: brand, business name, accent color, theme, currency, locale, language, user, team, pipeline stages, monthly goal. |
| `i18n.js` | Spanish and English text. Config values starting with `@` are translation keys. |
| `data.js` | Sample data, generated from a fixed seed with dates anchored to today. Swap it for the client's data. |
| `charts.js` | Small SVG chart kit (line, bars, donut, ring, sparkline, heatmap, funnel) with hover details built in. |
| `app.js` | Screens, drawers, forms, search, drag and drop, persistence. |
| `styles.css` | Design tokens for the dark and light themes at the top, then components and breakpoints. |

## Personalize for a client
1. Edit `config.js` (brand, business, accent, team, stages, goal).
2. Replace the generators in `data.js` with the client's records, or import a JSON export from **Settings**.
3. Optional: tweak colors in the `:root` and `[data-theme="light"]` blocks of `styles.css`.

Users can change brand, accent, theme, currency, language and goal from **Ajustes / Settings**. Records and preferences are saved in the browser (localStorage); "Restaurar demo" resets them, and JSON export/import moves data between browsers.

## What it does
- **Navigation:** tabs across the top with live counts, a search and jump-to palette (`Ctrl K` / `⌘K` or `/`), notifications for overdue and due-today tasks and deals closing this week, and a quick "New" menu.
- **Hover details everywhere:** every chart shows the numbers behind the point, bar, slice or cell (crosshair on line charts, donut center and legend in sync). KPI cards, summary chips, deal cards, column headers, calendar events and timestamps explain themselves on hover too.
- **Drill-downs:** clicking a month, bar or stage opens the deals behind it; drawers link contacts, companies and deals to each other, with a back button.
- **Deals board:** all stages side by side on one screen. When a column would need to scroll, the board steps down to tighter cards and finally one-line cards, so every deal stays visible. Drag and drop between stages (lost deals ask for a reason), owner filter, closed-deals window, list view and undo.
- **Contacts:** status tabs, owner filter, sort, search, pagination, bulk actions (status, owner, export, delete), CSV export, and a detail drawer with the activity timeline and notes.
- **Companies:** industry filter, search, sort by revenue, open pipeline or name, with revenue share per company.
- **Tasks and calendar:** grouped task tabs with quick add, and a month calendar with drag-to-reschedule plus an agenda.
- **Reports:** revenue by month and owner, win rate, average deal, sales cycle, funnel, lead sources, activity heatmap and leaderboard, over 3, 6 or 12 months and per owner.
- Dark and light themes, Spanish and English, responsive down to phone width, reduced-motion support.

## Deploy on Vercel
New project → import the repo/folder → Framework preset "Other", no build command, output directory `.`. In the portfolio repo it lives in `public/demos/crm/` and is served at `/demos/crm/`.
