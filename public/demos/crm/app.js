(function () {
  'use strict';
  const C = window.CRM_CONFIG;
  const STORE = 'crm-template-v1';

  // ---------------------------------------------------------------- state
  const load = () => {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.db && s.db.contacts) return s; } catch (e) {}
    return null;
  };
  const saved = load();
  let db = saved ? saved.db : JSON.parse(JSON.stringify(window.CRM_SEED));
  let prefs = Object.assign({ lang: C.lang, accent: C.accent, brand: C.brand, company: C.company, currency: C.currency, target: C.monthlyTarget }, (saved && saved.prefs) || {});
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify({ db, prefs })); } catch (e) {} };

  // ---------------------------------------------------------------- i18n
  const T = {
    es: {
      nav_main: 'Principal', nav_manage: 'Gestión', nav_insights: 'Análisis',
      dashboard: 'Panel', contacts: 'Contactos', companies: 'Empresas', deals: 'Negocios', tasks: 'Tareas',
      calendar: 'Calendario', reports: 'Reportes', settings: 'Ajustes',
      search: 'Buscar contactos, empresas, negocios…', new: 'Nuevo', reset: 'Restaurar demo',
      hello: 'Hola', dash_sub: 'Esto es lo que pasa hoy en tu negocio.',
      kpi_revenue: 'Ingresos del mes', kpi_pipeline: 'Pipeline abierto', kpi_win: 'Tasa de cierre', kpi_contacts: 'Contactos activos',
      last_month: 'mes anterior', open_short: 'Abiertos', rev_chart: 'Ingresos de los últimos 6 meses', won: 'Ganado', forecast: 'Pronóstico',
      goal: 'Meta mensual', of: 'de', funnel: 'Pipeline por etapa', recent: 'Actividad reciente', upcoming: 'Próximas tareas',
      top_deals: 'Negocios principales', view_all: 'Ver todo',
      name: 'Nombre', email: 'Email', phone: 'Teléfono', company: 'Empresa', title: 'Cargo', status: 'Estado', owner: 'Responsable',
      source: 'Origen', last_contact: 'Último contacto', tags: 'Etiquetas', all: 'Todos', industry: 'Industria', city: 'Ciudad', size: 'Tamaño', website: 'Sitio web',
      st_lead: 'Lead', st_active: 'Activo', st_customer: 'Cliente', st_inactive: 'Inactivo',
      contacts_sub: 'Todas las personas con las que trabajás.', companies_sub: 'Cuentas y organizaciones.',
      deals_sub: 'Arrastrá las tarjetas para cambiar de etapa.', tasks_sub: 'Seguimientos y pendientes del equipo.',
      cal_sub: 'Reuniones, llamadas y vencimientos.', reports_sub: 'Cómo viene el equipo y el embudo.', settings_sub: 'Personalizá el CRM para tu negocio.',
      export: 'Exportar CSV', showing: 'Mostrando', results: 'resultados', prev: 'Anterior', next: 'Siguiente',
      new_contact: 'Nuevo contacto', new_company: 'Nueva empresa', new_deal: 'Nuevo negocio', new_task: 'Nueva tarea', new_event: 'Nuevo evento',
      edit: 'Editar', delete: 'Eliminar', save: 'Guardar', cancel: 'Cancelar', confirm_del: '¿Eliminar este registro?',
      value: 'Valor', stage: 'Etapa', close_date: 'Fecha de cierre', contact: 'Contacto', due: 'Vence', priority: 'Prioridad',
      high: 'Alta', medium: 'Media', low: 'Baja', today: 'Hoy', overdue: 'Vencidas', upcoming_t: 'Próximas', completed: 'Completadas',
      details: 'Detalles', activity: 'Actividad', add_note: 'Agregar una nota…', add: 'Agregar', open_deals: 'Negocios abiertos',
      people: 'Personas', deals_n: 'Negocios', revenue: 'Ingresos', call: 'Llamar', send_email: 'Email', log_call: 'Registrar llamada',
      board: 'Tablero', list: 'Lista', weighted: 'ponderado', date: 'Fecha', time: 'Hora', type: 'Tipo',
      meeting: 'Reunión', demo: 'Demo', task: 'Tarea', month: 'Mes',
      by_owner: 'Ingresos ganados por responsable', by_source: 'Contactos por origen', conversion: 'Conversión entre etapas',
      avg_deal: 'Ticket promedio', cycle: 'Ciclo de venta', days: 'días', deals_won: 'Negocios ganados', lost_rate: 'Tasa de pérdida',
      brand_sec: 'Marca', brand_name: 'Nombre del CRM', biz_name: 'Nombre del negocio', accent: 'Color de acento', regional: 'Regional',
      currency: 'Moneda', language: 'Idioma', target: 'Meta mensual de ingresos', pipeline_sec: 'Etapas del pipeline', data_sec: 'Datos',
      data_note: 'Los datos de esta demo se guardan solo en tu navegador.', saved: 'Cambios guardados', deleted: 'Eliminado', created: 'Creado',
      required: 'Completá los campos obligatorios', no_results: 'Sin resultados', moved: 'Movido a', note: 'Nota',
      ac_call: 'Llamada', ac_email: 'Email', ac_meeting: 'Reunión', ac_note: 'Nota', ac_deal: 'Negocio',
    },
    en: {
      nav_main: 'Main', nav_manage: 'Manage', nav_insights: 'Insights',
      dashboard: 'Dashboard', contacts: 'Contacts', companies: 'Companies', deals: 'Deals', tasks: 'Tasks',
      calendar: 'Calendar', reports: 'Reports', settings: 'Settings',
      search: 'Search contacts, companies, deals…', new: 'New', reset: 'Reset demo',
      hello: 'Hi', dash_sub: "Here's what's happening in your business today.",
      kpi_revenue: 'Revenue this month', kpi_pipeline: 'Open pipeline', kpi_win: 'Win rate', kpi_contacts: 'Active contacts',
      last_month: 'last month', open_short: 'Open', rev_chart: 'Revenue, last 6 months', won: 'Won', forecast: 'Forecast',
      goal: 'Monthly goal', of: 'of', funnel: 'Pipeline by stage', recent: 'Recent activity', upcoming: 'Upcoming tasks',
      top_deals: 'Top deals', view_all: 'View all',
      name: 'Name', email: 'Email', phone: 'Phone', company: 'Company', title: 'Title', status: 'Status', owner: 'Owner',
      source: 'Source', last_contact: 'Last contact', tags: 'Tags', all: 'All', industry: 'Industry', city: 'City', size: 'Size', website: 'Website',
      st_lead: 'Lead', st_active: 'Active', st_customer: 'Customer', st_inactive: 'Inactive',
      contacts_sub: 'Everyone you work with.', companies_sub: 'Accounts and organizations.',
      deals_sub: 'Drag cards to move them between stages.', tasks_sub: 'Follow-ups and to-dos for the team.',
      cal_sub: 'Meetings, calls and due dates.', reports_sub: 'How the team and funnel are doing.', settings_sub: 'Make the CRM your own.',
      export: 'Export CSV', showing: 'Showing', results: 'results', prev: 'Previous', next: 'Next',
      new_contact: 'New contact', new_company: 'New company', new_deal: 'New deal', new_task: 'New task', new_event: 'New event',
      edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', confirm_del: 'Delete this record?',
      value: 'Value', stage: 'Stage', close_date: 'Close date', contact: 'Contact', due: 'Due', priority: 'Priority',
      high: 'High', medium: 'Medium', low: 'Low', today: 'Today', overdue: 'Overdue', upcoming_t: 'Upcoming', completed: 'Completed',
      details: 'Details', activity: 'Activity', add_note: 'Add a note…', add: 'Add', open_deals: 'Open deals',
      people: 'People', deals_n: 'Deals', revenue: 'Revenue', call: 'Call', send_email: 'Email', log_call: 'Log call',
      board: 'Board', list: 'List', weighted: 'weighted', date: 'Date', time: 'Time', type: 'Type',
      meeting: 'Meeting', demo: 'Demo', task: 'Task', month: 'Month',
      by_owner: 'Won revenue by owner', by_source: 'Contacts by source', conversion: 'Stage conversion',
      avg_deal: 'Average deal', cycle: 'Sales cycle', days: 'days', deals_won: 'Deals won', lost_rate: 'Loss rate',
      brand_sec: 'Brand', brand_name: 'CRM name', biz_name: 'Business name', accent: 'Accent color', regional: 'Regional',
      currency: 'Currency', language: 'Language', target: 'Monthly revenue goal', pipeline_sec: 'Pipeline stages', data_sec: 'Data',
      data_note: 'Demo data is stored only in your browser.', saved: 'Changes saved', deleted: 'Deleted', created: 'Created',
      required: 'Fill in the required fields', no_results: 'No results', moved: 'Moved to', note: 'Note',
      ac_call: 'Call', ac_email: 'Email', ac_meeting: 'Meeting', ac_note: 'Note', ac_deal: 'Deal',
    },
  };
  const t = (k) => (T[prefs.lang] && T[prefs.lang][k]) || T.es[k] || k;
  const stageName = (id) => { const s = C.stages.find(x => x.id === id); return s ? s[prefs.lang] : id; };

  // ---------------------------------------------------------------- helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loc = () => (prefs.lang === 'en' ? 'en-US' : C.locale);
  const money = (n, compact) => new Intl.NumberFormat(loc(), { style: 'currency', currency: prefs.currency, maximumFractionDigits: 0, notation: compact ? 'compact' : 'standard' }).format(n);
  const num = (n) => new Intl.NumberFormat(loc()).format(n);
  const pct = (n) => Math.round(n * 100) + '%';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isoD = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const isoToday = isoD(today);
  const parse = (d) => new Date(d + 'T00:00:00');
  const fmtDate = (d, opts) => parse(d).toLocaleDateString(loc(), opts || { day: 'numeric', month: 'short' });
  const daysFrom = (d) => Math.round((parse(d) - today) / 864e5);
  const relTime = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 6e4;
    const rtf = new Intl.RelativeTimeFormat(prefs.lang, { numeric: 'auto' });
    if (diff < 60) return rtf.format(-Math.max(1, Math.round(diff)), 'minute');
    if (diff < 1440) return rtf.format(-Math.round(diff / 60), 'hour');
    return rtf.format(-Math.round(diff / 1440), 'day');
  };
  const initials = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const byId = (list, id) => db[list].find(x => x.id === id);
  const coName = (id) => (byId('companies', id) || {}).name || '—';
  const ctName = (id) => (byId('contacts', id) || {}).name || '—';
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const owners = () => [...new Set([...db.contacts, ...db.deals].map(x => x.owner))];

  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    contacts: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    companies: '<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 9h2a2 2 0 0 1 2 2v10"/><path d="M9 7h2M9 11h2M9 15h2"/>',
    deals: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
    tasks: '<path d="m9 11 3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',
    reports: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    money: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    meeting: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    deal: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  };
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  const statusBadge = (s) => `<span class="badge ${{ lead: 'b-info', active: 'b-accent', customer: 'b-good', inactive: 'b-muted' }[s]}">${t('st_' + s)}</span>`;
  const stageBadge = (s) => `<span class="badge ${s === 'won' ? 'b-good' : s === 'lost' ? 'b-bad' : s === 'negotiation' ? 'b-warn' : 'b-accent'}">${esc(stageName(s))}</span>`;
  const prioBadge = (p) => `<span class="badge ${{ high: 'b-bad', medium: 'b-warn', low: 'b-muted' }[p]}">${t(p)}</span>`;

  let toastTimer;
  const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); };

  // ---------------------------------------------------------------- metrics
  const monthKey = (d) => d.slice(0, 7);
  const monthsBack = (n) => { const out = []; for (let i = n - 1; i >= 0; i--) { out.push(isoD(new Date(today.getFullYear(), today.getMonth() - i, 1)).slice(0, 7)); } return out; };
  const wonIn = (mk) => db.deals.filter(d => d.stage === 'won' && monthKey(d.closeDate) === mk);
  const openDeals = () => db.deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const prob = (id) => (C.stages.find(s => s.id === id) || { prob: 0 }).prob / 100;

  // ---------------------------------------------------------------- charts (inline SVG)
  function areaChart(labels, series, h = 230, W = 640) {
    const H = h, pl = 46, pr = 10, pt = 14, pb = 26;
    const max = Math.max(1, ...series.flatMap(s => s.values).filter(v => v != null)) * 1.15;
    const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
    const y = (v) => pt + (1 - v / max) * (H - pt - pb);
    let out = `<svg viewBox="0 0 ${W} ${H}" role="img">`;
    for (let g = 0; g <= 4; g++) { const v = (max / 4) * g; out += `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${money(v, true)}</text>`; }
    labels.forEach((l, i) => { out += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
    series.forEach((s, si) => {
      const pts = s.values.map((v, i) => [x(i), v == null ? null : y(v), i, v]).filter(p => p[1] != null);
      const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      if (s.fill) {
        out += `<defs><linearGradient id="g${si}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".35"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>`;
        out += `<path d="${line} L${pts[pts.length - 1][0]} ${y(0)} L${pts[0][0]} ${y(0)} Z" fill="url(#g${si})"/>`;
      }
      out += `<path d="${line}" fill="none" stroke="${s.color}" stroke-width="2.5" ${s.dash ? 'stroke-dasharray="6 5"' : ''} stroke-linecap="round" stroke-linejoin="round"/>`;
      pts.forEach((p, i) => { out += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--surface)" stroke="${s.color}" stroke-width="2"><title>${esc(labels[p[2]])}: ${money(p[3])}</title></circle>`; });
    });
    return out + '</svg>';
  }
  function ring(value, size = 120, stroke = 12) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.min(1, value);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * v} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="var(--text)" font-size="20" font-weight="800">${pct(value)}</text></svg>`;
  }
  function barsH(rows) {
    const max = Math.max(1, ...rows.map(r => r[1]));
    return rows.map(([l, v, fmt]) => `<div class="funnel-row"><span>${esc(l)}</span><div class="bar"><span style="width:${(v / max) * 100}%"></span></div><b>${fmt || num(v)}</b></div>`).join('');
  }
  function donut(rows, size = 150) {
    const total = sum(rows, r => r[1]) || 1, r = 52, c = 2 * Math.PI * r; let acc = 0;
    const colors = ['var(--accent)', 'var(--info)', 'var(--warn)', 'var(--good)', 'var(--bad)', '#b39ddb', '#94a6b6'];
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 130 130">`;
    rows.forEach((row, i) => { const len = (row[1] / total) * c; svg += `<circle cx="65" cy="65" r="${r}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="18" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 65 65)"><title>${esc(row[0])}: ${row[1]}</title></circle>`; acc += len; });
    svg += `<text x="65" y="62" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="800">${total}</text><text x="65" y="80" text-anchor="middle" fill="var(--muted)" font-size="10">${t('contacts')}</text></svg>`;
    const legend = rows.map((row, i) => `<div style="display:flex;align-items:center;gap:8px;font-size:.84rem;margin:5px 0"><i style="width:10px;height:10px;border-radius:3px;background:${colors[i % colors.length]}"></i>${esc(row[0])}<b style="margin-left:auto">${pct(row[1] / total)}</b></div>`).join('');
    return `<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">${svg}<div style="flex:1;min-width:140px">${legend}</div></div>`;
  }
  const monthLabel = (mk) => parse(mk + '-01').toLocaleDateString(loc(), { month: 'short' });

  // ---------------------------------------------------------------- views
  const views = {};
  const pageHead = (title, sub, actions = '') => `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="actions">${actions}</div></div>`;

  views.dashboard = () => {
    const months = monthsBack(6);
    const thisM = months[5], lastM = months[4];
    const rev = sum(wonIn(thisM), d => d.value);
    const revLast = sum(wonIn(lastM), d => d.value);
    const open = openDeals(), pipe = sum(open, d => d.value);
    const closed = db.deals.filter(d => d.stage === 'won' || d.stage === 'lost');
    const winRate = closed.length ? closed.filter(d => d.stage === 'won').length / closed.length : 0;
    const active = db.contacts.filter(c => c.status === 'active' || c.status === 'customer').length;
    const wonSeries = months.map(m => sum(wonIn(m), d => d.value));
    const forecastVal = rev + sum(open.filter(d => monthKey(d.closeDate) === thisM), d => d.value * prob(d.stage));
    const kpi = (label, val, icon, delta, deltaTxt) => `<div class="card kpi"><div class="top">${label}<span class="ico">${ic(icon)}</span></div><div class="val">${val}</div><div class="delta ${delta >= 0 ? 'up' : 'down'}">${deltaTxt}</div></div>`;
    const stagesOpen = C.stages.filter(s => s.id !== 'won' && s.id !== 'lost');
    const tasksUp = db.tasks.filter(x => !x.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6);
    const top = [...open].sort((a, b) => b.value - a.value).slice(0, 5);
    return pageHead(`${t('hello')}, ${esc(C.user.name.split(' ')[0])} 👋`, t('dash_sub'), `<button class="btn btn-ghost" data-new="deal">${ic('plus')} ${t('new_deal')}</button>`) +
      `<div class="kpis">
        ${kpi(t('kpi_revenue'), money(rev), 'money', 1, `${pct(rev / prefs.target)} ${t('of')} ${t('goal').toLowerCase()} · ${t('last_month')}: ${money(revLast, true)}`)}
        ${kpi(t('kpi_pipeline'), money(pipe), 'deals', 1, `${open.length} ${t('open_deals').toLowerCase()} · ${money(sum(open, d => d.value * prob(d.stage)), true)} ${t('weighted')}`)}
        ${kpi(t('kpi_win'), pct(winRate), 'trophy', winRate - .5, `${closed.filter(d => d.stage === 'won').length} / ${closed.length}`)}
        ${kpi(t('kpi_contacts'), num(active), 'contacts', 1, `${num(db.contacts.length)} ${t('contacts').toLowerCase()}`)}
      </div>
      <div class="grid g-2-1">
        <div class="card card-pad chart"><div class="card-head"><h3>${t('rev_chart')}</h3><div class="legend"><span><i style="background:var(--accent)"></i>${t('won')}</span><span><i style="background:var(--info)"></i>${t('forecast')}</span></div></div>
          ${areaChart(months.map(monthLabel), [{ values: wonSeries.map((v, i) => i >= 4 ? (i === 5 ? forecastVal : v) : null), color: 'var(--info)', dash: true }, { values: wonSeries, color: 'var(--accent)', fill: true }])}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('goal')}</h3></div>
          <div class="goal-ring">${ring(rev / prefs.target)}<div><div class="big">${money(rev, true)}</div><div class="muted">${t('of')} ${money(prefs.target, true)}</div><div class="muted" style="margin-top:8px">${t('forecast')}: <b style="color:var(--text)">${money(forecastVal, true)}</b></div></div></div>
          <div style="margin-top:22px"><div class="card-head" style="margin-bottom:4px"><h3>${t('funnel')}</h3><a href="#deals">${t('view_all')}</a></div>
          ${barsH(stagesOpen.map(s => [s[prefs.lang], sum(open.filter(d => d.stage === s.id), d => d.value), money(sum(open.filter(d => d.stage === s.id), d => d.value), true)]))}</div>
        </div>
      </div>
      <div class="grid g-3">
        <div class="card card-pad"><div class="card-head"><h3>${t('recent')}</h3></div><ul class="feed">${db.activities.slice(0, 6).map(feedItem).join('')}</ul></div>
        <div class="card card-pad"><div class="card-head"><h3>${t('upcoming')}</h3><a href="#tasks">${t('view_all')}</a></div>${tasksUp.map(miniTask).join('') || `<div class="empty">${t('no_results')}</div>`}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('top_deals')}</h3><a href="#deals">${t('view_all')}</a></div>
          ${top.map(d => `<div class="mini-task" data-open="deal:${d.id}" style="cursor:pointer"><span class="co-logo" style="width:34px;height:34px;font-size:.8rem">${initials(coName(d.companyId))}</span><div class="t"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.title)}</div><small>${esc(stageName(d.stage))} · ${fmtDate(d.closeDate)}</small></div><b>${money(d.value, true)}</b></div>`).join('')}</div>
      </div>`;
  };
  const feedItem = (a) => `<li><span class="ico">${ic(a.type, 16)}</span><div><p><b>${esc(ctName(a.contactId))}</b> · ${esc(a.text)}</p><small>${esc(a.user)} · ${relTime(a.at)}</small></div></li>`;
  const dueLabel = (d) => { const n = daysFrom(d); return n === 0 ? t('today') : fmtDate(d); };
  const miniTask = (x) => `<div class="mini-task"><button class="check ${x.done ? 'on' : ''}" data-toggle="${x.id}" aria-label="done">${x.done ? ic('check', 12) : ''}</button><div class="t"><div class="${x.done ? 'done-text' : ''}">${esc(x.title)}</div><small>${esc(ctName(x.contactId))} · <span class="${!x.done && daysFrom(x.due) < 0 ? 'down' : ''}">${dueLabel(x.due)}</span></small></div>${prioBadge(x.priority)}</div>`;

  // ---- contacts
  const ui = { cSort: ['name', 1], cFilter: 'all', cOwner: 'all', cQ: '', cPage: 0, taskTab: 'upcoming_t', dealsMode: 'board', calMonth: new Date(today.getFullYear(), today.getMonth(), 1), coQ: '' };
  const PAGE = 12;
  function contactRows() {
    const q = ui.cQ.toLowerCase();
    let rows = db.contacts.filter(c => (ui.cFilter === 'all' || c.status === ui.cFilter) && (ui.cOwner === 'all' || c.owner === ui.cOwner) &&
      (!q || [c.name, c.email, coName(c.companyId), c.title].join(' ').toLowerCase().includes(q)));
    const [k, dir] = ui.cSort;
    const val = (c) => k === 'company' ? coName(c.companyId) : c[k];
    return rows.sort((a, b) => String(val(a)).localeCompare(String(val(b))) * dir);
  }
  views.contacts = () => {
    const tabs = ['all', 'lead', 'active', 'customer', 'inactive'];
    return pageHead(t('contacts'), t('contacts_sub'), `<button class="btn btn-plain" id="exportBtn">${ic('download')} ${t('export')}</button><button class="btn btn-primary" data-new="contact">${ic('plus')} ${t('new_contact')}</button>`) +
      `<div class="card"><div class="toolbar">
        <div class="tabs" id="cTabs">${tabs.map(s => `<button data-v="${s}" class="${ui.cFilter === s ? 'on' : ''}">${s === 'all' ? t('all') : t('st_' + s)} <span class="muted">${s === 'all' ? db.contacts.length : db.contacts.filter(c => c.status === s).length}</span></button>`).join('')}</div>
        <div class="sp"></div>
        <select id="cOwner"><option value="all">${t('owner')}: ${t('all')}</option>${owners().map(o => `<option ${ui.cOwner === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
        <input id="cQ" placeholder="${t('search')}" value="${esc(ui.cQ)}" />
      </div><div id="cTable"></div></div>`;
  };
  function renderContactTable() {
    const rows = contactRows(), pages = Math.max(1, Math.ceil(rows.length / PAGE));
    ui.cPage = Math.min(ui.cPage, pages - 1);
    const slice = rows.slice(ui.cPage * PAGE, ui.cPage * PAGE + PAGE);
    const th = (k, l) => `<th data-sort="${k}">${l}${ui.cSort[0] === k ? `<span class="arr">${ui.cSort[1] > 0 ? '↑' : '↓'}</span>` : ''}</th>`;
    $('#cTable').innerHTML = `<div class="table-wrap"><table><thead><tr>${th('name', t('name'))}${th('company', t('company'))}${th('status', t('status'))}${th('phone', t('phone'))}${th('owner', t('owner'))}${th('lastContact', t('last_contact'))}</tr></thead><tbody>
      ${slice.map(c => `<tr data-open="contact:${c.id}"><td><div class="who"><span class="avatar">${initials(c.name)}</span><div>${esc(c.name)}<small>${esc(c.email)}</small></div></div></td><td>${esc(coName(c.companyId))}<small class="muted" style="display:block;font-size:.76rem">${esc(c.title)}</small></td><td>${statusBadge(c.status)}</td><td>${esc(c.phone)}</td><td>${esc(c.owner)}</td><td>${fmtDate(c.lastContact)}</td></tr>`).join('') || `<tr><td colspan="6" class="empty">${t('no_results')}</td></tr>`}
      </tbody></table></div><div class="pager"><span>${t('showing')} ${slice.length ? ui.cPage * PAGE + 1 : 0}–${ui.cPage * PAGE + slice.length} ${t('of')} ${rows.length} ${t('results')}</span><div><button class="btn btn-plain" data-page="-1" ${ui.cPage === 0 ? 'disabled' : ''}>${t('prev')}</button><button class="btn btn-plain" data-page="1" ${ui.cPage >= pages - 1 ? 'disabled' : ''}>${t('next')}</button></div></div>`;
  }

  // ---- companies
  views.companies = () => {
    const q = ui.coQ.toLowerCase();
    const list = db.companies.filter(c => !q || (c.name + c.industry + c.city).toLowerCase().includes(q));
    return pageHead(t('companies'), t('companies_sub'), `<button class="btn btn-primary" data-new="company">${ic('plus')} ${t('new_company')}</button>`) +
      `<div class="card" style="margin-bottom:16px"><div class="toolbar" style="border:0"><input id="coQ" placeholder="${t('search')}" value="${esc(ui.coQ)}"/><span class="sp"></span><span class="muted">${list.length} ${t('companies').toLowerCase()}</span></div></div>
      <div class="co-grid">${list.map(c => {
        const people = db.contacts.filter(x => x.companyId === c.id).length;
        const deals = db.deals.filter(x => x.companyId === c.id);
        const won = sum(deals.filter(d => d.stage === 'won'), d => d.value);
        return `<div class="card co-card" data-open="company:${c.id}"><div class="row"><span class="co-logo">${initials(c.name)}</span><div><b>${esc(c.name)}</b><div class="muted" style="font-size:.8rem">${esc(c.industry)} · ${esc(c.city)}</div></div></div>
          <div class="co-stats"><div><b>${people}</b><small>${t('people')}</small></div><div><b>${deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}</b><small>${t('open_short')}</small></div><div><b>${money(won, true)}</b><small>${t('revenue')}</small></div></div></div>`;
      }).join('') || `<div class="empty">${t('no_results')}</div>`}</div>`;
  };

  // ---- deals
  views.deals = () => {
    const open = openDeals();
    const head = pageHead(t('deals'), `${t('deals_sub')} · ${money(sum(open, d => d.value))} ${t('kpi_pipeline').toLowerCase()}`,
      `<div class="tabs" id="dMode"><button data-v="board" class="${ui.dealsMode === 'board' ? 'on' : ''}">${t('board')}</button><button data-v="list" class="${ui.dealsMode === 'list' ? 'on' : ''}">${t('list')}</button></div><button class="btn btn-primary" data-new="deal">${ic('plus')} ${t('new_deal')}</button>`);
    if (ui.dealsMode === 'list') {
      const rows = [...db.deals].sort((a, b) => a.closeDate.localeCompare(b.closeDate));
      return head + `<div class="card"><div class="table-wrap"><table><thead><tr><th>${t('deals')}</th><th>${t('company')}</th><th>${t('stage')}</th><th>${t('value')}</th><th>${t('close_date')}</th><th>${t('owner')}</th></tr></thead><tbody>
        ${rows.map(d => `<tr data-open="deal:${d.id}"><td>${esc(d.title)}</td><td>${esc(coName(d.companyId))}</td><td>${stageBadge(d.stage)}</td><td><b>${money(d.value)}</b></td><td>${fmtDate(d.closeDate)}</td><td>${esc(d.owner)}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    const colors = { won: 'var(--good)', lost: 'var(--bad)', negotiation: 'var(--warn)' };
    return head + `<div class="board">${C.stages.map(s => {
      const closed = s.id === 'won' || s.id === 'lost';
      const ds = db.deals.filter(d => d.stage === s.id && (!closed || daysFrom(d.closeDate) >= -60))
        .sort((a, b) => closed ? b.closeDate.localeCompare(a.closeDate) : b.value - a.value);
      const shown = ds.slice(0, 8), more = ds.length - shown.length;
      return `<div class="col"><div class="col-head"><div class="t">${esc(s[prefs.lang])}<span>${ds.length}</span></div><small>${money(sum(ds, d => d.value))}${closed ? ` · 60 ${t('days')}` : ''}</small><div class="line" style="background:${colors[s.id] || 'var(--accent)'}"></div></div>
        <div class="col-body" data-stage="${s.id}">${shown.map(d => `<div class="card deal" draggable="true" data-id="${d.id}" data-open="deal:${d.id}"><h4>${esc(d.title.split(' · ')[0])}</h4><div class="muted" style="font-size:.8rem">${esc(coName(d.companyId))}</div><div class="meta"><span class="v">${money(d.value)}</span><span style="display:flex;align-items:center;gap:6px">${fmtDate(d.closeDate)}<span class="avatar" title="${esc(d.owner)}">${initials(d.owner)}</span></span></div></div>`).join('')}${more > 0 ? `<button class="link-btn" data-v="list" data-more style="padding:6px">+${more} · ${t('list')}</button>` : ''}</div></div>`;
    }).join('')}</div>`;
  };

  // ---- tasks
  views.tasks = () => {
    const groups = {
      overdue: db.tasks.filter(x => !x.done && daysFrom(x.due) < 0),
      today: db.tasks.filter(x => !x.done && daysFrom(x.due) === 0),
      upcoming_t: db.tasks.filter(x => !x.done && daysFrom(x.due) > 0),
      completed: db.tasks.filter(x => x.done),
    };
    const list = (groups[ui.taskTab] || []).sort((a, b) => a.due.localeCompare(b.due));
    return pageHead(t('tasks'), t('tasks_sub'), `<button class="btn btn-primary" data-new="task">${ic('plus')} ${t('new_task')}</button>`) +
      `<div class="card"><div class="toolbar"><div class="tabs" id="tTabs">${Object.keys(groups).map(k => `<button data-v="${k}" class="${ui.taskTab === k ? 'on' : ''}">${t(k)} <span class="${k === 'overdue' && groups[k].length ? 'down' : 'muted'}">${groups[k].length}</span></button>`).join('')}</div></div>
      <div class="table-wrap"><table><thead><tr><th style="width:40px"></th><th>${t('task')}</th><th>${t('contact')}</th><th>${t('priority')}</th><th>${t('due')}</th><th>${t('owner')}</th><th></th></tr></thead><tbody>
      ${list.map(x => `<tr><td><button class="check ${x.done ? 'on' : ''}" data-toggle="${x.id}">${x.done ? ic('check', 12) : ''}</button></td><td class="${x.done ? 'done-text' : ''}">${esc(x.title)}</td><td><a data-open="contact:${x.contactId}" style="color:var(--accent)">${esc(ctName(x.contactId))}</a></td><td>${prioBadge(x.priority)}</td><td class="${!x.done && daysFrom(x.due) < 0 ? 'down' : ''}">${dueLabel(x.due)}</td><td>${esc(x.owner)}</td><td style="text-align:right"><button class="icon-btn" data-edit="task:${x.id}" style="width:30px;height:30px;display:inline-grid">${ic('edit', 14)}</button></td></tr>`).join('') || `<tr><td colspan="7" class="empty">${t('no_results')}</td></tr>`}
      </tbody></table></div></div>`;
  };

  // ---- calendar
  views.calendar = () => {
    const m = ui.calMonth, start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
    const dows = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' }));
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = isoD(d);
      const evs = db.events.filter(e => e.date === key).sort((a, b) => a.time.localeCompare(b.time));
      const tks = db.tasks.filter(x => x.due === key && !x.done);
      cells += `<div class="cell ${d.getMonth() !== m.getMonth() ? 'other' : ''} ${key === isoToday ? 'today' : ''}"><div class="num">${d.getDate()}</div>
        ${evs.map(e => `<span class="ev ${e.type}" data-edit="event:${e.id}" title="${esc(e.time + ' ' + e.title)}">${esc(e.time)} ${esc(e.title)}</span>`).join('')}
        ${tks.map(x => `<span class="ev task" data-edit="task:${x.id}" title="${esc(x.title)}">✓ ${esc(x.title)}</span>`).join('')}</div>`;
    }
    return pageHead(t('calendar'), t('cal_sub'), `<button class="btn btn-primary" data-new="event">${ic('plus')} ${t('new_event')}</button>`) +
      `<div class="card"><div class="toolbar"><div class="cal-head"><button class="icon-btn" data-cal="-1">${ic('chevL')}</button><h3>${(s => s[0].toUpperCase() + s.slice(1))(m.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }))}</h3><button class="icon-btn" data-cal="1">${ic('chevR')}</button></div><button class="btn btn-plain" data-cal="0">${t('today')}</button><span class="sp"></span>
      <div class="legend"><span><i style="background:var(--accent)"></i>${t('meeting')}</span><span><i style="background:var(--info)"></i>${t('ac_call')}</span><span><i style="background:var(--warn)"></i>${t('demo')}</span><span><i style="background:var(--muted)"></i>${t('task')}</span></div></div>
      <div class="cal">${dows.map(d => `<div class="dow">${d}</div>`).join('')}${cells}</div></div>`;
  };

  // ---- reports
  views.reports = () => {
    const won = db.deals.filter(d => d.stage === 'won'), lost = db.deals.filter(d => d.stage === 'lost');
    const avg = won.length ? sum(won, d => d.value) / won.length : 0;
    const cycle = won.length ? sum(won, d => (parse(d.closeDate) - parse(d.created)) / 864e5) / won.length : 0;
    const months = monthsBack(12);
    const ownersRev = owners().map(o => [o, sum(won.filter(d => d.owner === o), d => d.value)]).sort((a, b) => b[1] - a[1]);
    const src = {}; db.contacts.forEach(c => { src[c.source] = (src[c.source] || 0) + 1; });
    const order = C.stages.filter(s => s.id !== 'lost');
    const reached = order.map((s, i) => db.deals.filter(d => d.stage !== 'lost' ? order.findIndex(o => o.id === d.stage) >= i : i <= 1).length);
    const kpi = (l, v, icon) => `<div class="card kpi"><div class="top">${l}<span class="ico">${ic(icon)}</span></div><div class="val">${v}</div></div>`;
    return pageHead(t('reports'), t('reports_sub')) +
      `<div class="kpis">${kpi(t('deals_won'), won.length, 'trophy')}${kpi(t('avg_deal'), money(avg), 'money')}${kpi(t('cycle'), Math.round(cycle) + ' ' + t('days'), 'calendar')}${kpi(t('lost_rate'), pct(lost.length / Math.max(1, won.length + lost.length)), 'target')}</div>
      <div class="card card-pad chart" style="margin-bottom:16px"><div class="card-head"><h3>${t('revenue')} · 12 ${t('month').toLowerCase()}</h3></div>${areaChart(months.map(monthLabel), [{ values: months.map(m => sum(wonIn(m), d => d.value)), color: 'var(--accent)', fill: true }], 260, 1100)}</div>
      <div class="grid g-3">
        <div class="card card-pad"><div class="card-head"><h3>${t('by_owner')}</h3></div>${barsH(ownersRev.map(([o, v]) => [o.split(' ')[0], v, money(v, true)]))}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('by_source')}</h3></div>${donut(Object.entries(src).sort((a, b) => b[1] - a[1]))}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('conversion')}</h3></div>${barsH(order.map((s, i) => [s[prefs.lang], reached[i], i ? pct(reached[i] / Math.max(1, reached[i - 1])) : num(reached[i])]))}</div>
      </div>`;
  };

  // ---- settings
  views.settings = () => {
    const colors = ['#4fd1c5', '#7cb7f5', '#a78bfa', '#f6c56b', '#f48a8a', '#6ee7a8', '#f59ec9'];
    return pageHead(t('settings'), t('settings_sub')) +
      `<div class="set-grid">
        <div class="card card-pad"><div class="card-head"><h3>${t('brand_sec')}</h3></div><div class="form-grid">
          <div class="field"><label>${t('brand_name')}</label><input id="sBrand" value="${esc(prefs.brand)}"/></div>
          <div class="field"><label>${t('biz_name')}</label><input id="sCompany" value="${esc(prefs.company)}"/></div>
          <div class="field full"><label>${t('accent')}</label><div class="swatches">${colors.map(c => `<button class="swatch ${prefs.accent === c ? 'on' : ''}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}<input type="color" id="sColor" value="${prefs.accent}" style="width:34px;height:34px;padding:0;border:0;background:none;cursor:pointer"/></div></div>
        </div></div>
        <div class="card card-pad"><div class="card-head"><h3>${t('regional')}</h3></div><div class="form-grid">
          <div class="field"><label>${t('currency')}</label><select id="sCurrency">${['USD', 'ARS', 'EUR', 'UYU', 'CLP', 'MXN', 'BRL'].map(c => `<option ${prefs.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>${t('language')}</label><select id="sLang"><option value="es" ${prefs.lang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${prefs.lang === 'en' ? 'selected' : ''}>English</option></select></div>
          <div class="field full"><label>${t('target')}</label><input id="sTarget" type="number" min="0" step="1000" value="${prefs.target}"/></div>
        </div></div>
        <div class="card card-pad"><div class="card-head"><h3>${t('pipeline_sec')}</h3></div><div class="stage-list">${C.stages.map(s => `<div class="stage-item">${stageBadge(s.id)}<b>${esc(s[prefs.lang])}</b><span class="muted">${s.prob}%</span></div>`).join('')}</div><p class="muted" style="margin:12px 0 0;font-size:.8rem">config.js → stages</p></div>
        <div class="card card-pad"><div class="card-head"><h3>${t('data_sec')}</h3></div><p class="muted" style="margin-top:0">${t('data_note')}</p>
          <div class="quick"><button class="btn btn-plain" id="exportAll">${ic('download')} JSON</button><button class="btn btn-danger" id="resetData">${t('reset')}</button></div></div>
      </div>
      <div class="modal-actions"><button class="btn btn-primary" id="saveSettings">${t('save')}</button></div>`;
  };

  // ---------------------------------------------------------------- drawer (record detail)
  const openOverlay = () => $('#overlay').classList.add('open');
  function closeAll() { $('#drawer').classList.remove('open'); $('#modal').classList.remove('open'); $('#overlay').classList.remove('open'); $('#sidebar').classList.remove('open'); }

  function openRecord(kind, id) {
    const d = $('#drawer');
    let html = '';
    if (kind === 'contact') {
      const c = byId('contacts', id); if (!c) return;
      const deals = db.deals.filter(x => x.contactId === id);
      const acts = db.activities.filter(a => a.contactId === id);
      html = `<div class="drawer-head"><span class="avatar lg">${initials(c.name)}</span><div><h2>${esc(c.name)}</h2><div class="muted">${esc(c.title)} · ${esc(coName(c.companyId))}</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${statusBadge(c.status)}${c.tags.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div></div><button class="icon-btn x" data-edit="contact:${c.id}" title="${t('edit')}">${ic('edit', 16)}</button><button class="icon-btn" data-close>${ic('x')}</button></div>
        <div class="drawer-sec"><div class="quick" style="margin:0"><a class="btn btn-ghost" href="tel:${esc(c.phone)}">${ic('call', 16)} ${t('call')}</a><a class="btn btn-ghost" href="mailto:${esc(c.email)}">${ic('email', 16)} ${t('send_email')}</a><button class="btn btn-plain" data-log="${c.id}">${t('log_call')}</button></div></div>
        <div class="drawer-sec"><h4>${t('details')}</h4><dl class="kv"><dt>${t('email')}</dt><dd>${esc(c.email)}</dd><dt>${t('phone')}</dt><dd>${esc(c.phone)}</dd><dt>${t('company')}</dt><dd><a data-open="company:${c.companyId}" style="color:var(--accent)">${esc(coName(c.companyId))}</a></dd><dt>${t('owner')}</dt><dd>${esc(c.owner)}</dd><dt>${t('source')}</dt><dd>${esc(c.source)}</dd><dt>${t('last_contact')}</dt><dd>${fmtDate(c.lastContact, { day: 'numeric', month: 'long', year: 'numeric' })}</dd></dl></div>
        <div class="drawer-sec"><h4>${t('deals_n')} (${deals.length})</h4>${deals.map(x => `<div class="mini-task" data-open="deal:${x.id}" style="cursor:pointer"><div class="t">${esc(x.title.split(' · ')[0])}<small>${fmtDate(x.closeDate)}</small></div>${stageBadge(x.stage)}<b>${money(x.value, true)}</b></div>`).join('') || `<span class="muted">—</span>`}</div>
        <div class="drawer-sec"><h4>${t('activity')}</h4><form class="note-form" data-note="${c.id}"><input placeholder="${t('add_note')}" required/><button class="btn btn-primary">${t('add')}</button></form><ul class="feed" style="margin-top:8px">${acts.map(feedItem).join('') || ''}</ul></div>`;
    } else if (kind === 'company') {
      const c = byId('companies', id); if (!c) return;
      const people = db.contacts.filter(x => x.companyId === id), deals = db.deals.filter(x => x.companyId === id);
      html = `<div class="drawer-head"><span class="co-logo" style="width:56px;height:56px;font-size:1.1rem">${initials(c.name)}</span><div><h2>${esc(c.name)}</h2><div class="muted">${esc(c.industry)} · ${esc(c.city)}</div></div><button class="icon-btn x" data-close>${ic('x')}</button></div>
        <div class="drawer-sec"><div class="quick" style="margin:0"><button class="btn btn-ghost" data-new="deal" data-company="${c.id}">${ic('plus', 16)} ${t('new_deal')}</button><button class="btn btn-plain" data-edit="company:${c.id}">${ic('edit', 16)} ${t('edit')}</button></div></div>
        <div class="drawer-sec"><h4>${t('details')}</h4><dl class="kv"><dt>${t('website')}</dt><dd>${esc(c.website)}</dd><dt>${t('size')}</dt><dd>${esc(c.size)}</dd><dt>${t('owner')}</dt><dd>${esc(c.owner)}</dd><dt>${t('revenue')}</dt><dd>${money(sum(deals.filter(d => d.stage === 'won'), d => d.value))}</dd></dl></div>
        <div class="drawer-sec"><h4>${t('people')} (${people.length})</h4>${people.map(p => `<div class="mini-task" data-open="contact:${p.id}" style="cursor:pointer"><span class="avatar">${initials(p.name)}</span><div class="t">${esc(p.name)}<small>${esc(p.title)}</small></div>${statusBadge(p.status)}</div>`).join('') || '<span class="muted">—</span>'}</div>
        <div class="drawer-sec"><h4>${t('deals_n')} (${deals.length})</h4>${deals.map(x => `<div class="mini-task" data-open="deal:${x.id}" style="cursor:pointer"><div class="t">${esc(x.title.split(' · ')[0])}<small>${fmtDate(x.closeDate)}</small></div>${stageBadge(x.stage)}<b>${money(x.value, true)}</b></div>`).join('') || '<span class="muted">—</span>'}</div>`;
    } else if (kind === 'deal') {
      const x = byId('deals', id); if (!x) return;
      const idx = C.stages.findIndex(s => s.id === x.stage);
      html = `<div class="drawer-head"><span class="co-logo" style="width:56px;height:56px">${ic('deals', 24)}</span><div><h2>${esc(x.title)}</h2><div style="margin-top:6px;display:flex;gap:8px;align-items:center">${stageBadge(x.stage)}<b style="color:var(--accent);font-size:1.1rem">${money(x.value)}</b></div></div><button class="icon-btn x" data-close>${ic('x')}</button></div>
        <div class="drawer-sec"><h4>${t('stage')}</h4><div style="display:flex;gap:4px">${C.stages.filter(s => s.id !== 'lost').map((s, i) => `<button title="${esc(s[prefs.lang])}" data-stage-set="${x.id}:${s.id}" style="flex:1;height:8px;border-radius:4px;border:0;cursor:pointer;background:${x.stage === 'lost' ? 'var(--surface-2)' : i <= idx ? 'var(--accent)' : 'var(--surface-2)'}"></button>`).join('')}</div>
          <div class="quick"><button class="btn btn-ghost" data-stage-set="${x.id}:won">${t('won')} ✓</button><button class="btn btn-danger" data-stage-set="${x.id}:lost">${stageName('lost')}</button><button class="btn btn-plain" data-edit="deal:${x.id}">${ic('edit', 16)} ${t('edit')}</button></div></div>
        <div class="drawer-sec"><h4>${t('details')}</h4><dl class="kv"><dt>${t('company')}</dt><dd><a data-open="company:${x.companyId}" style="color:var(--accent)">${esc(coName(x.companyId))}</a></dd><dt>${t('contact')}</dt><dd><a data-open="contact:${x.contactId}" style="color:var(--accent)">${esc(ctName(x.contactId))}</a></dd><dt>${t('owner')}</dt><dd>${esc(x.owner)}</dd><dt>${t('close_date')}</dt><dd>${fmtDate(x.closeDate, { day: 'numeric', month: 'long', year: 'numeric' })}</dd><dt>${t('forecast')}</dt><dd>${money(x.value * prob(x.stage))} (${Math.round(prob(x.stage) * 100)}%)</dd></dl></div>
        <div class="drawer-sec"><h4>${t('activity')}</h4><ul class="feed">${db.activities.filter(a => a.contactId === x.contactId).slice(0, 5).map(feedItem).join('') || '<span class="muted">—</span>'}</ul></div>`;
    }
    d.innerHTML = html; d.classList.add('open'); openOverlay(); d.scrollTop = 0;
    d.dataset.kind = kind; d.dataset.id = id;
  }
  const refreshDrawer = () => { const d = $('#drawer'); if (d.classList.contains('open')) openRecord(d.dataset.kind, d.dataset.id); };

  // ---------------------------------------------------------------- forms
  const opts = (list, sel, label = (x) => x.name, val = (x) => x.id) => list.map(x => `<option value="${esc(val(x))}" ${val(x) === sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  const strOpts = (list, sel, lab = (x) => x) => list.map(x => `<option value="${esc(x)}" ${x === sel ? 'selected' : ''}>${esc(lab(x))}</option>`).join('');
  const FORMS = {
    contact: (r = {}) => [t(r.id ? 'edit' : 'new_contact'), `
      <div class="field full"><label>${t('name')} *</label><input name="name" required value="${esc(r.name)}"/></div>
      <div class="field"><label>${t('email')} *</label><input name="email" type="email" required value="${esc(r.email)}"/></div>
      <div class="field"><label>${t('phone')}</label><input name="phone" value="${esc(r.phone)}"/></div>
      <div class="field"><label>${t('company')}</label><select name="companyId">${opts(db.companies, r.companyId)}</select></div>
      <div class="field"><label>${t('title')}</label><input name="title" value="${esc(r.title)}"/></div>
      <div class="field"><label>${t('status')}</label><select name="status">${strOpts(['lead', 'active', 'customer', 'inactive'], r.status || 'lead', s => t('st_' + s))}</select></div>
      <div class="field"><label>${t('owner')}</label><select name="owner">${strOpts(owners(), r.owner || C.user.name)}</select></div>
      <div class="field"><label>${t('source')}</label><select name="source">${strOpts(['Web', 'Referido', 'LinkedIn', 'Evento', 'Email', 'Llamada'], r.source)}</select></div>`],
    company: (r = {}) => [t(r.id ? 'edit' : 'new_company'), `
      <div class="field full"><label>${t('name')} *</label><input name="name" required value="${esc(r.name)}"/></div>
      <div class="field"><label>${t('industry')}</label><input name="industry" value="${esc(r.industry)}"/></div>
      <div class="field"><label>${t('city')}</label><input name="city" value="${esc(r.city)}"/></div>
      <div class="field"><label>${t('website')}</label><input name="website" value="${esc(r.website)}"/></div>
      <div class="field"><label>${t('size')}</label><select name="size">${strOpts(['1-10', '11-50', '51-200', '201-500', '500+'], r.size)}</select></div>
      <div class="field full"><label>${t('owner')}</label><select name="owner">${strOpts(owners(), r.owner || C.user.name)}</select></div>`],
    deal: (r = {}) => [t(r.id ? 'edit' : 'new_deal'), `
      <div class="field full"><label>${t('name')} *</label><input name="title" required value="${esc(r.title)}"/></div>
      <div class="field"><label>${t('value')} *</label><input name="value" type="number" min="0" step="500" required value="${esc(r.value)}"/></div>
      <div class="field"><label>${t('stage')}</label><select name="stage">${opts(C.stages, r.stage || 'lead', s => s[prefs.lang])}</select></div>
      <div class="field"><label>${t('company')}</label><select name="companyId">${opts(db.companies, r.companyId)}</select></div>
      <div class="field"><label>${t('contact')}</label><select name="contactId">${opts(db.contacts, r.contactId)}</select></div>
      <div class="field"><label>${t('close_date')}</label><input name="closeDate" type="date" value="${esc(r.closeDate || isoToday)}"/></div>
      <div class="field"><label>${t('owner')}</label><select name="owner">${strOpts(owners(), r.owner || C.user.name)}</select></div>`],
    task: (r = {}) => [t(r.id ? 'edit' : 'new_task'), `
      <div class="field full"><label>${t('task')} *</label><input name="title" required value="${esc(r.title)}"/></div>
      <div class="field"><label>${t('contact')}</label><select name="contactId">${opts(db.contacts, r.contactId)}</select></div>
      <div class="field"><label>${t('due')}</label><input name="due" type="date" value="${esc(r.due || isoToday)}"/></div>
      <div class="field"><label>${t('priority')}</label><select name="priority">${strOpts(['high', 'medium', 'low'], r.priority || 'medium', t)}</select></div>
      <div class="field"><label>${t('owner')}</label><select name="owner">${strOpts(owners(), r.owner || C.user.name)}</select></div>`],
    event: (r = {}) => [t(r.id ? 'edit' : 'new_event'), `
      <div class="field full"><label>${t('name')} *</label><input name="title" required value="${esc(r.title)}"/></div>
      <div class="field"><label>${t('date')}</label><input name="date" type="date" value="${esc(r.date || isoToday)}"/></div>
      <div class="field"><label>${t('time')}</label><input name="time" type="time" value="${esc(r.time || '10:00')}"/></div>
      <div class="field"><label>${t('type')}</label><select name="type">${strOpts(['meeting', 'call', 'demo'], r.type, k => t(k === 'call' ? 'ac_call' : k))}</select></div>
      <div class="field"><label>${t('contact')}</label><select name="contactId">${opts(db.contacts, r.contactId)}</select></div>`],
  };
  const LIST = { contact: 'contacts', company: 'companies', deal: 'deals', task: 'tasks', event: 'events' };

  function openForm(kind, id, preset = {}) {
    const rec = id ? byId(LIST[kind], id) : Object.assign({}, preset);
    const [title, fields] = FORMS[kind](rec);
    $('#modalCard').innerHTML = `<h2>${title}</h2><form id="recForm"><div class="form-grid">${fields}</div>
      <div class="modal-actions">${id ? `<button type="button" class="btn btn-danger" id="delRec" style="margin-right:auto">${ic('trash', 16)} ${t('delete')}</button>` : ''}<button type="button" class="btn btn-plain" data-close-modal>${t('cancel')}</button><button class="btn btn-primary">${t('save')}</button></div></form>`;
    $('#modal').classList.add('open'); openOverlay();
    setTimeout(() => { const f = $('#recForm input'); f && f.focus(); }, 50);
    $('#recForm').onsubmit = (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (data.value != null) data.value = Number(data.value) || 0;
      if (id) Object.assign(rec, data);
      else {
        const n = Object.assign({ id: uid(kind.slice(0, 2)) }, data);
        if (kind === 'contact') Object.assign(n, { lastContact: isoToday, tags: [] });
        if (kind === 'deal') n.created = isoToday;
        if (kind === 'task') n.done = false;
        db[LIST[kind]].unshift(n);
      }
      if (kind === 'deal' && data.contactId && !data.companyId) rec.companyId = (byId('contacts', data.contactId) || {}).companyId;
      persist(); closeModal(); toast(id ? t('saved') : t('created')); render(); refreshDrawer();
    };
    const del = $('#delRec');
    if (del) del.onclick = () => {
      if (!confirm(t('confirm_del'))) return;
      db[LIST[kind]] = db[LIST[kind]].filter(x => x.id !== id);
      persist(); closeAll(); toast(t('deleted')); render();
    };
  }
  function closeModal() {
    $('#modal').classList.remove('open');
    if (!$('#drawer').classList.contains('open')) $('#overlay').classList.remove('open');
  }

  // ---------------------------------------------------------------- shell
  const NAV = [
    ['nav_main', ['dashboard']],
    ['nav_manage', ['contacts', 'companies', 'deals', 'tasks', 'calendar']],
    ['nav_insights', ['reports', 'settings']],
  ];
  const route = () => (location.hash.slice(1) || 'dashboard').split('/')[0];

  function applyBrand() {
    document.documentElement.style.setProperty('--accent', prefs.accent);
    document.documentElement.lang = prefs.lang;
    document.title = `${t(route())} · ${prefs.brand}`;
    $('#brandName').textContent = prefs.brand;
    $('#companyName').textContent = prefs.company;
    $('#logo').textContent = (prefs.brand[0] || C.logoLetter).toUpperCase();
    $('#meAvatar').textContent = C.user.initials;
    $('#meName').textContent = C.user.name;
    $('#meRole').textContent = C.user.role;
    $('#globalSearch').placeholder = t('search');
    $('#quickAdd').innerHTML = `${ic('plus')} <span class="lbl">${t('new')}</span>`;
    $('#menuBtn').innerHTML = ic('menu');
    $('.search .ic').innerHTML = ic('search');
    $('#resetBtn').textContent = t('reset');
    $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === prefs.lang));
  }
  function renderNav() {
    const r = route();
    const counts = { contacts: db.contacts.length, deals: openDeals().length, tasks: db.tasks.filter(x => !x.done).length };
    $('#nav').innerHTML = NAV.map(([g, items]) => `<div class="group">${t(g)}</div>` + items.map(k => `<a href="#${k}" class="${r === k ? 'on' : ''}">${ic(k)}<span>${t(k)}</span>${counts[k] ? `<span class="count">${counts[k]}</span>` : ''}</a>`).join('')).join('');
  }
  function render() {
    const r = views[route()] ? route() : 'dashboard';
    applyBrand(); renderNav();
    $('#view').innerHTML = views[r]();
    if (r === 'contacts') renderContactTable();
  }

  // ---------------------------------------------------------------- events
  document.addEventListener('click', (e) => {
    const el = (s) => e.target.closest(s);
    let n;
    if ((n = el('[data-toggle]'))) { e.stopPropagation(); const x = byId('tasks', n.dataset.toggle); x.done = !x.done; persist(); render(); return; }
    if ((n = el('[data-close]'))) return closeAll();
    if ((n = el('[data-close-modal]'))) return closeModal();
    if ((n = el('[data-stage-set]'))) { const [id, st] = n.dataset.stageSet.split(':'); moveDeal(id, st); refreshDrawer(); return; }
    if ((n = el('[data-edit]'))) { e.stopPropagation(); const [k, id] = n.dataset.edit.split(':'); return openForm(k, id); }
    if ((n = el('[data-new]'))) { const preset = n.dataset.company ? { companyId: n.dataset.company } : {}; return openForm(n.dataset.new, null, preset); }
    if ((n = el('[data-log]'))) { logActivity(n.dataset.log, 'call', t('log_call')); return; }
    if ((n = el('[data-open]'))) { if (el('.deal') && dragMoved) return; const [k, id] = n.dataset.open.split(':'); $('#searchResults').classList.remove('open'); return openRecord(k, id); }
    if ((n = el('#cTabs button'))) { ui.cFilter = n.dataset.v; ui.cPage = 0; return render(); }
    if ((n = el('#tTabs button'))) { ui.taskTab = n.dataset.v; return render(); }
    if ((n = el('[data-more]'))) { ui.dealsMode = 'list'; return render(); }
    if ((n = el('#dMode button'))) { ui.dealsMode = n.dataset.v; return render(); }
    if ((n = el('th[data-sort]'))) { const k = n.dataset.sort; ui.cSort = [k, ui.cSort[0] === k ? -ui.cSort[1] : 1]; return renderContactTable(); }
    if ((n = el('[data-page]'))) { ui.cPage += Number(n.dataset.page); return renderContactTable(); }
    if ((n = el('[data-cal]'))) { const v = Number(n.dataset.cal); ui.calMonth = v ? new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + v, 1) : new Date(today.getFullYear(), today.getMonth(), 1); return render(); }
    if ((n = el('.lang button'))) { prefs.lang = n.dataset.lang; persist(); return render(); }
    if ((n = el('.swatch'))) { prefs.accent = n.dataset.color; applyBrand(); $$('.swatch').forEach(s => s.classList.toggle('on', s === n)); return; }
    if ((n = el('#saveSettings'))) {
      Object.assign(prefs, { brand: $('#sBrand').value || C.brand, company: $('#sCompany').value, currency: $('#sCurrency').value, lang: $('#sLang').value, target: Number($('#sTarget').value) || C.monthlyTarget });
      persist(); render(); return toast(t('saved'));
    }
    if ((n = el('#resetData')) || (n = el('#resetBtn'))) {
      if (!confirm(t('reset') + '?')) return;
      try { localStorage.removeItem(STORE); } catch (err) {}
      db = JSON.parse(JSON.stringify(window.CRM_SEED));
      prefs = { lang: C.lang, accent: C.accent, brand: C.brand, company: C.company, currency: C.currency, target: C.monthlyTarget };
      closeAll(); render(); return toast(t('saved'));
    }
    if ((n = el('#exportBtn'))) return exportCSV();
    if ((n = el('#exportAll'))) return download('crm-data.json', JSON.stringify(db, null, 2), 'application/json');
    if ((n = el('#quickAdd'))) { const r = route(); return openForm({ companies: 'company', deals: 'deal', tasks: 'task', calendar: 'event' }[r] || 'contact'); }
    if ((n = el('#menuBtn'))) { $('#sidebar').classList.add('open'); return openOverlay(); }
    if (el('#overlay')) return closeAll();
    if (el('#nav a')) $('#sidebar').classList.remove('open');
    if (!el('.search')) $('#searchResults').classList.remove('open');
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'cQ') { ui.cQ = e.target.value; ui.cPage = 0; renderContactTable(); }
    if (e.target.id === 'coQ') { ui.coQ = e.target.value; const pos = e.target.selectionStart; render(); const i = $('#coQ'); i.focus(); i.setSelectionRange(pos, pos); }
    if (e.target.id === 'sColor') { prefs.accent = e.target.value; applyBrand(); }
    if (e.target.id === 'globalSearch') globalSearch(e.target.value);
  });
  document.addEventListener('change', (e) => { if (e.target.id === 'cOwner') { ui.cOwner = e.target.value; ui.cPage = 0; renderContactTable(); } });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-note]'); if (!f) return;
    e.preventDefault(); const v = f.querySelector('input').value.trim(); if (v) logActivity(f.dataset.note, 'note', v);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if ($('#modal').classList.contains('open')) closeModal(); else closeAll(); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#globalSearch').focus(); }
  });
  window.addEventListener('hashchange', () => { closeAll(); render(); window.scrollTo(0, 0); });

  function logActivity(contactId, type, text) {
    db.activities.unshift({ id: uid('ac'), type, text, contactId, user: C.user.name, at: new Date().toISOString() });
    const c = byId('contacts', contactId); if (c) c.lastContact = isoToday;
    persist(); refreshDrawer(); toast(t('saved'));
  }
  function moveDeal(id, stage) {
    const d = byId('deals', id); if (!d || d.stage === stage) return;
    d.stage = stage;
    if (stage === 'won' || stage === 'lost') d.closeDate = isoToday;
    db.activities.unshift({ id: uid('ac'), type: 'deal', text: `${t('moved')} ${stageName(stage)}: ${d.title.split(' · ')[0]}`, contactId: d.contactId, user: C.user.name, at: new Date().toISOString() });
    persist(); render(); toast(`${t('moved')} ${stageName(stage)}`);
  }

  // drag & drop for the pipeline board
  let dragId = null, dragMoved = false;
  document.addEventListener('dragstart', (e) => { const c = e.target.closest('.deal'); if (!c) return; dragId = c.dataset.id; dragMoved = true; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
  document.addEventListener('dragend', (e) => { const c = e.target.closest('.deal'); if (c) c.classList.remove('dragging'); $$('.col-body.over').forEach(x => x.classList.remove('over')); setTimeout(() => { dragMoved = false; }, 50); });
  document.addEventListener('dragover', (e) => { const col = e.target.closest('.col-body'); if (!col || !dragId) return; e.preventDefault(); $$('.col-body.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); });
  document.addEventListener('drop', (e) => { const col = e.target.closest('.col-body'); if (!col || !dragId) return; e.preventDefault(); moveDeal(dragId, col.dataset.stage); dragId = null; });

  function globalSearch(q) {
    const box = $('#searchResults'); q = q.trim().toLowerCase();
    if (q.length < 2) { box.classList.remove('open'); return; }
    const hits = [
      ...db.contacts.filter(c => (c.name + c.email).toLowerCase().includes(q)).slice(0, 5).map(c => ['contact', c.id, c.name, t('contacts')]),
      ...db.companies.filter(c => c.name.toLowerCase().includes(q)).slice(0, 4).map(c => ['company', c.id, c.name, t('companies')]),
      ...db.deals.filter(d => d.title.toLowerCase().includes(q)).slice(0, 4).map(d => ['deal', d.id, d.title, t('deals')]),
    ];
    box.innerHTML = hits.map(([k, id, label, kind]) => `<a data-open="${k}:${id}">${k === 'contact' ? `<span class="avatar" style="width:26px;height:26px;font-size:.62rem">${initials(label)}</span>` : ic(k === 'company' ? 'companies' : 'deals', 16)}<span>${esc(label)}</span><small>${kind}</small></a>`).join('') || `<div class="empty" style="padding:14px">${t('no_results')}</div>`;
    box.classList.add('open');
  }
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportCSV() {
    const cols = ['name', 'email', 'phone', 'title', 'company', 'status', 'owner', 'source', 'lastContact'];
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = contactRows().map(c => cols.map(k => q(k === 'company' ? coName(c.companyId) : c[k])).join(','));
    download('contacts.csv', [cols.join(','), ...rows].join('\n'), 'text/csv');
  }

  render();
})();
