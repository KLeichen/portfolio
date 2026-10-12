# CRM template

Standalone front-end CRM demo (no build step, no backend). Open `index.html` or deploy the folder as a static site.

## Personalize for a client
- `config.js`: brand name, business name, accent color, currency, locale, default language, user, pipeline stages, monthly goal.
- `data.js`: sample data (generated from a fixed seed, dates anchored to today). Swap for the client's data.
- `styles.css`: colors live in `:root` at the top.

Users can also change brand, accent, currency, language and goal from **Ajustes / Settings**. Changes and records are stored in the browser (localStorage); "Restaurar demo" resets them.

## Screens
Dashboard, Contacts (filters, sort, search, pagination, CSV export, detail drawer), Companies, Deals (drag-and-drop pipeline + list), Tasks, Calendar, Reports, Settings. Global search (`/`), quick add, ES/EN toggle, mobile layout.

## Deploy on Vercel
New project → import the repo/folder → Framework preset "Other", no build command, output directory `.`.
