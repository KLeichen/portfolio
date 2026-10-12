(function () {
  'use strict';
  const C = window.CRM_CONFIG, CH = window.CRMCharts, I18N = window.CRM_I18N;
  const STORE = 'crm-template-v2';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ================================================================ state
  const defaults = () => ({ lang: C.lang, theme: C.theme || 'dark', accent: C.accent, brand: C.brand, company: C.company, currency: C.currency, target: C.monthlyTarget });
  let db = null, prefs = null;
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    if (s && s.db && Array.isArray(s.db.contacts)) { db = s.db; prefs = Object.assign(defaults(), s.prefs); }
  } catch (e) { /* storage unavailable: run on seed data */ }
  if (!db) { db = clone(window.CRM_SEED); prefs = defaults(); }
  const persist = () => { try { localStorage.setItem(STORE, JSON.stringify({ db, prefs })); } catch (e) {} };
  let persistT;
  const persistSoon = () => { clearTimeout(persistT); persistT = setTimeout(persist, 300); };

  // One level of undo: take a snapshot before a change, restore it on demand.
  let undoSnap = null;
  const snap = () => { undoSnap = JSON.stringify(db); };

  // ================================================================ helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = CH.esc;
  const t = (k) => { const d = I18N[prefs.lang] || I18N.es; return d[k] != null ? d[k] : I18N.es[k] != null ? I18N.es[k] : k; };
  const tr = (s) => String(s == null ? '' : s).replace(/@([a-z][a-z0-9_]*)/g, (m, k) => (I18N.es[k] != null ? t(k) : m));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const split2 = (s) => { const i = s.indexOf(':'); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; };
  const loc = () => (prefs.lang === 'en' ? 'en-US' : C.locale);
  const money = (n, compact) => {
    try {
      return new Intl.NumberFormat(loc(), { style: 'currency', currency: prefs.currency, notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact && Math.abs(n) >= 1000 ? 1 : 0 }).format(n);
    } catch (e) { return Math.round(n) + ' ' + prefs.currency; }
  };
  const num = (n) => new Intl.NumberFormat(loc()).format(Math.round(n));
  const pct = (n) => Math.round(n * 100) + '%';
  const FMT = { money: (v) => money(v), num, pct, days: (v) => num(v) + ' ' + t('days') };
  const isoD = (x) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isoToday = isoD(today);
  const thisMonth = isoToday.slice(0, 7);
  const parse = (d) => new Date(d + 'T00:00:00');
  const addDays = (d, n) => { const x = parse(d); x.setDate(x.getDate() + n); return isoD(x); };
  const daysFrom = (d) => Math.round((parse(d) - today) / 864e5);
  const fmtDate = (d, o) => parse(d).toLocaleDateString(loc(), o || { day: 'numeric', month: 'short' });
  const fullDate = (d) => fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' });
  const longDate = (d) => cap(fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }));
  const rtf = () => new Intl.RelativeTimeFormat(prefs.lang, { numeric: 'auto' });
  const relDays = (d) => cap(rtf().format(daysFrom(d), 'day'));
  const relTime = (iso) => {
    const m = (Date.now() - new Date(iso)) / 6e4, f = rtf();
    if (m < 60) return f.format(-Math.max(1, Math.round(m)), 'minute');
    if (m < 1440) return f.format(-Math.round(m / 60), 'hour');
    return f.format(-Math.round(m / 1440), 'day');
  };
  const monthKey = (d) => String(d).slice(0, 7);
  const monthsBack = (n) => { const out = []; for (let i = n - 1; i >= 0; i--) out.push(isoD(new Date(today.getFullYear(), today.getMonth() - i, 1)).slice(0, 7)); return out; };
  const monthLabel = (mk) => cap(parse(mk + '-01').toLocaleDateString(loc(), { month: 'short' }).replace('.', ''));
  const monthLong = (mk) => cap(parse(mk + '-01').toLocaleDateString(loc(), { month: 'long', year: 'numeric' }));
  const weekdayShort = (i) => cap(new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' }).replace('.', '')); // 2024-01-01 is a Monday
  const initials = (n) => String(n).split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const byId = (list, id) => db[list].find((x) => x.id === id);
  const coName = (id) => (byId('companies', id) || {}).name || '—';
  const ctName = (id) => (byId('contacts', id) || {}).name || '—';
  const dealName = (d) => tr(d.title);
  const dealProduct = (d) => dealName(d).split(' · ')[0];
  const byName = (a, b) => a.name.localeCompare(b.name);

  // ================================================================ domain
  const PALETTE = ['var(--accent)', 'var(--info)', 'var(--warn)', 'var(--violet)', 'var(--good)', 'var(--bad)'];
  const team = () => C.team.map((m) => m.name);
  const ownerColor = (name) => { const i = C.team.findIndex((m) => m.name === name); return i < 0 ? 'var(--faint)' : PALETTE[i % PALETTE.length]; };
  const stage = (id) => C.stages.find((s) => s.id === id);
  const stageName = (id) => { const s = stage(id); return s ? s[prefs.lang] || s.es : id; };
  const stageColor = (id) => (stage(id) || {}).color || 'var(--accent)';
  const prob = (id) => ((stage(id) || {}).prob || 0) / 100;
  const isOpen = (d) => d.stage !== 'won' && d.stage !== 'lost';
  const openStages = () => C.stages.filter((s) => s.id !== 'won' && s.id !== 'lost');
  const STATUSES = ['lead', 'active', 'customer', 'inactive'];
  const SOURCES = ['web', 'referral', 'linkedin', 'event', 'email', 'call'];
  const LOST = ['price', 'competitor', 'budget', 'timing', 'no_response', 'other'];
  const ACT_TYPES = ['call', 'email', 'meeting', 'note', 'deal'];
  const ACT_COLOR = { call: 'var(--info)', email: 'var(--accent)', meeting: 'var(--warn)', note: 'var(--violet)', deal: 'var(--good)' };
  const EV_COLOR = { meeting: 'var(--accent)', call: 'var(--info)', demo: 'var(--warn)' };
  const EV_LABEL = { meeting: 'meeting', call: 'ac_call', demo: 'demo' };
  const PRIO_RANK = { high: 0, medium: 1, low: 2 };

  const wonIn = (mk) => db.deals.filter((d) => d.stage === 'won' && monthKey(d.closeDate) === mk);
  const wonSum = (mk) => sum(wonIn(mk), (d) => d.value);
  // Deals closed between `a` and `b` days ago (a < b).
  const closedBetween = (a, b) => db.deals.filter((d) => !isOpen(d) && daysFrom(d.closeDate) <= -a && daysFrom(d.closeDate) > -b);
  const winRate = (list) => (list.length ? list.filter((d) => d.stage === 'won').length / list.length : null);
  const deltaSpan = (good, txt) => `<span class="${good ? 'up' : 'down'}">${good ? '▲' : '▼'} ${txt}</span>`;
  const stageAge = (d) => -daysFrom(d.stageSince || d.created || isoToday);

  // ================================================================ icons
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
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    money: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    meeting: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    deal: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  // ================================================================ small markup pieces
  const avatar = (name, cls = '', color, withTip) =>
    `<span class="avatar ${cls}" style="--c:${color || ownerColor(name)}"${withTip ? ` data-tip="${esc(CH.tip(name))}"` : ''}>${esc(initials(name))}</span>`;
  const statusBadge = (s) => `<span class="badge ${{ lead: 'b-info', active: 'b-accent', customer: 'b-good', inactive: 'b-muted' }[s] || 'b-muted'}">${t('st_' + s)}</span>`;
  const stageBadge = (s) => `<span class="badge" style="--c:${stageColor(s)}">${esc(stageName(s))}</span>`;
  const prioBadge = (p) => `<span class="badge ${{ high: 'b-bad', medium: 'b-warn', low: 'b-muted' }[p] || 'b-muted'}">${t(p)}</span>`;
  const tagChip = (x) => `<span class="chip">${esc(tr(x))}</span>`;
  const empty = (msg) => `<div class="empty">${ic('info', 20)}<span>${esc(msg || t('no_items'))}</span></div>`;
  const head = (title, sub, actions = '') => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="actions">${actions}</div></div>`;
  // Segmented control. Options are [value, label, tooltip?]; icon-only labels should pass a tooltip.
  const seg = (key, options, cur, cls = '') =>
    `<div class="seg ${cls}" role="group">${options.map(([v, l, tp]) => `<button type="button" data-seg="${key}" data-v="${esc(v)}" class="${String(cur) === String(v) ? 'on' : ''}"${tp ? ` aria-label="${esc(tp)}" data-tip="${esc(CH.tip(tp))}"` : ''}>${l}</button>`).join('')}</div>`;
  const helpTip = (title, text) => `data-tip="${esc(CH.tip(title, [], text))}"`;

  let toastT;
  function toast(msg, canUndo) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${canUndo ? `<button class="toast-undo" data-act="undo">${t('undo')}</button>` : ''}`;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), canUndo ? 5200 : 2400);
  }
  function undo() {
    if (!undoSnap) return;
    db = JSON.parse(undoSnap); undoSnap = null;
    persist(); render(); refreshDrawer(); toast(t('undone'));
  }

  // ================================================================ charts mounting
  // Views emit placeholders; charts are drawn once the placeholder has a width,
  // and redrawn on resize.
  const chartDefs = new Map();
  let chartSeq = 0;
  const chart = (build, cls = '') => { const k = 'ch' + ++chartSeq; chartDefs.set(k, build); return `<div class="chart-host ${cls}" data-chart="${k}"></div>`; };
  function mountCharts(root = document) {
    $$('.chart-host', root).forEach((el) => { const b = chartDefs.get(el.dataset.chart); if (b) el.innerHTML = b(Math.max(160, Math.floor(el.clientWidth))); });
  }
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { hideTip(); mountCharts(); fitBoard(); }, 120); });

  // ================================================================ tooltips and chart hover
  const tipEl = $('#tip');
  let tipSrc = null, tipTimer = null, curBand = null, curArc = null, lastXY = [0, 0];
  function placeTip(x, y) {
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight, pad = 10;
    let left = x + 16, top = y + 18;
    if (left + w > innerWidth - pad) left = x - w - 16;
    if (top + h > innerHeight - pad) top = y - h - 14;
    tipEl.style.transform = `translate(${Math.round(Math.max(pad, left))}px, ${Math.round(Math.max(pad, top))}px)`;
  }
  function hideTip() { clearTimeout(tipTimer); tipSrc = null; tipEl.classList.remove('show'); syncBand(null); syncArc(null); }
  function syncBand(band) {
    if (band === curBand) return;
    if (curBand && curBand.ownerSVGElement) {
      const svg = curBand.ownerSVGElement;
      svg.classList.remove('hovering');
      $$('.pt.on', svg).forEach((p) => p.classList.remove('on'));
    }
    curBand = band;
    if (!band) return;
    const svg = band.ownerSVGElement, xh = svg.querySelector('.xhair');
    if (xh) { xh.setAttribute('x1', band.dataset.x); xh.setAttribute('x2', band.dataset.x); }
    svg.classList.add('hovering');
    $$(`.pt[data-i="${band.dataset.i}"]`, svg).forEach((p) => p.classList.add('on'));
  }
  function syncArc(el) {
    let svg = null, i = null;
    if (el) {
      svg = el.classList.contains('arc') ? el.ownerSVGElement : document.getElementById(el.dataset.arcFor);
      i = el.dataset.i;
    }
    const key = svg ? svg.id + ':' + i : null;
    if (key === curArc) return;
    if (curArc) {
      const sid = curArc.split(':')[0], s = document.getElementById(sid);
      if (s) {
        delete s.dataset.active;
        $$('.arc.on', s).forEach((a) => a.classList.remove('on'));
        $('.dc-v', s).textContent = s.dataset.dv;
        $('.dc-l', s).textContent = s.dataset.dl;
      }
      $$(`[data-arc-for="${sid}"]`).forEach((x) => x.classList.remove('on'));
    }
    curArc = key;
    if (!svg) return;
    const a = $(`.arc[data-i="${i}"]`, svg);
    if (!a) return;
    svg.dataset.active = i;
    a.classList.add('on');
    $('.dc-v', svg).textContent = a.dataset.v;
    $('.dc-l', svg).textContent = a.dataset.l;
    $$(`[data-arc-for="${svg.id}"][data-i="${i}"]`).forEach((x) => x.classList.add('on'));
  }
  function onPoint(e) {
    if (drag) return;
    lastXY = [e.clientX, e.clientY];
    const tg = e.target instanceof Element ? e.target : null;
    const src = tg && tg.closest('[data-tip]');
    if (src !== tipSrc) {
      clearTimeout(tipTimer);
      tipSrc = src;
      tipEl.classList.remove('show');
      // No tooltip over an open menu's button, or over a button whose own label is
      // showing (data-tip-lbl buttons only need one when narrow screens hide it).
      const lbl = src && src.hasAttribute('data-tip-lbl') && src.querySelector('.lbl');
      if (src && src.getAttribute('aria-expanded') !== 'true' && !(lbl && lbl.offsetWidth)) {
        const show = () => {
          if (tipSrc !== src || !src.isConnected) return;
          tipEl.innerHTML = src.getAttribute('data-tip');
          tipEl.classList.add('show');
          placeTip(lastXY[0], lastXY[1]);
        };
        if (src.hasAttribute('data-tip-delay')) tipTimer = setTimeout(show, 420); else show();
      }
    } else if (src && tipEl.classList.contains('show')) placeTip(e.clientX, e.clientY);
    syncBand(tg && tg.closest('.band'));
    syncArc(tg && tg.closest('.arc, [data-arc-for]'));
  }
  document.addEventListener('pointermove', onPoint, { passive: true });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') onPoint(e); else if (tipSrc && tipSrc.hasAttribute('data-tip-delay')) hideTip(); }, { passive: true });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hideTip(); });
  window.addEventListener('scroll', () => { if (tipSrc) hideTip(); }, { passive: true, capture: true });

  function countUp(root) {
    $$('[data-count]', root).forEach((el) => {
      const to = +el.dataset.count, f = FMT[el.dataset.fmt] || num, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 800), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = f(to * eased);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ================================================================ UI state
  const ui = {
    dashRange: 6, actFilter: 'all',
    cStatus: 'all', cOwner: 'all', cQ: '', cSort: ['name', 1], cPage: 0, cSize: 12, sel: new Set(),
    coQ: '', coInd: 'all', coSort: 'revenue',
    dMode: 'board', dQ: '', dOwners: new Set(), dWindow: 30, dSort: ['closeDate', 1], flash: null,
    tTab: 'pending', tOwner: 'all',
    calMonth: new Date(today.getFullYear(), today.getMonth(), 1), calView: 'month',
    rPeriod: 6, rOwner: 'all', rHidden: new Set(), lbSort: 'rev',
    palIdx: 0, stack: [],
  };

  // ================================================================ views
  const views = {}, fills = {};

  // ---------------------------------------------------------------- dashboard
  views.dashboard = () => {
    const m6 = monthsBack(6), months = monthsBack(ui.dashRange);
    const target = prefs.target || 1;
    const rev = wonSum(thisMonth), revLast = wonSum(m6[4]);
    const open = db.deals.filter(isOpen);
    const pipe = sum(open, (d) => d.value), weighted = sum(open, (d) => d.value * prob(d.stage));
    const closingNow = open.filter((d) => monthKey(d.closeDate) === thisMonth);
    const forecast = rev + sum(closingNow, (d) => d.value * prob(d.stage));
    const wrNow = winRate(closedBetween(0, 90)), wrPrev = winRate(closedBetween(90, 180));
    const wrDelta = wrNow != null && wrPrev != null ? Math.round((wrNow - wrPrev) * 100) : null;
    const active = db.contacts.filter((c) => c.status === 'active' || c.status === 'customer').length;
    const newBy = (mk) => db.contacts.filter((c) => c.created && monthKey(c.created) === mk).length;
    const createdBy = (mk) => sum(db.deals.filter((d) => d.created && monthKey(d.created) === mk), (d) => d.value);
    const wrBy = (mk) => winRate(db.deals.filter((d) => !isOpen(d) && monthKey(d.closeDate) === mk));

    const kpis = [
      { label: t('kpi_revenue'), icon: 'money', help: t('help_revenue'), value: rev, fmt: 'money',
        sub: `<b>${pct(rev / target)}</b> ${t('of_goal')} · ${t('last_month')} ${money(revLast, true)}`, spark: m6.map(wonSum), sfmt: (v) => money(v) },
      { label: t('kpi_pipeline'), icon: 'deals', help: t('help_pipeline'), value: pipe, fmt: 'money',
        sub: `${open.length} ${t('open_n')} · ${money(weighted, true)} ${t('weighted')}`, spark: m6.map(createdBy), sfmt: (v) => money(v), slabel: t('created_n') },
      { label: t('kpi_win'), icon: 'trophy', help: t('help_win'), value: wrNow || 0, fmt: 'pct',
        sub: wrDelta == null ? '—' : `${deltaSpan(wrDelta >= 0, `${Math.abs(wrDelta)} ${t('pts')}`)} ${t('vs_prev90')}`, spark: m6.map(wrBy), sfmt: (v) => (v == null ? '—' : pct(v)) },
      { label: t('kpi_contacts'), icon: 'contacts', help: t('help_contacts'), value: active, fmt: 'num',
        sub: `<span class="up">+${newBy(thisMonth)}</span> ${t('new_this_month')}`, spark: m6.map(newBy), sfmt: num, slabel: t('new_contacts') },
    ];
    const kpiCard = (k) => `<div class="card kpi">
        <div class="kpi-top"><span>${k.label}</span><span class="ico" ${helpTip(k.label, k.help)}>${ic(k.icon)}</span></div>
        <div class="kpi-val" data-count="${k.value}" data-fmt="${k.fmt}">${FMT[k.fmt](k.value)}</div>
        <div class="kpi-sub">${k.sub}</div>
        ${chart((w) => CH.spark({ width: w, height: 38, values: k.spark, color: 'var(--accent)', tips: (i) => CH.tip(monthLong(m6[i]), [['var(--accent)', k.slabel || k.label, k.sfmt(k.spark[i])]]) }), 'spark-host')}
      </div>`;

    const wonSeries = months.map(wonSum);
    const fcSeries = months.map((m, i) => (i === months.length - 2 ? wonSeries[i] : i === months.length - 1 ? forecast : null));
    const prevOf = (i) => (i ? wonSeries[i - 1] : wonSum(monthsBack(months.length + 1)[0]));
    const monthTip = (i) => {
      const mk = months[i], v = wonSeries[i], prev = prevOf(i);
      const rows = [['var(--accent)', t('won'), `<b>${money(v)}</b>`], [null, t('deals_won'), num(wonIn(mk).length)]];
      if (prev) rows.push([null, t('vs_last'), deltaSpan(v >= prev, pct(Math.abs((v - prev) / prev)))]);
      if (mk === thisMonth) rows.push(['var(--info)', t('forecast'), money(forecast)]);
      rows.push(['var(--warn)', t('goal'), pct(v / target)]);
      return CH.tip(monthLong(mk), rows, t('click_detail'));
    };

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate();
    const remaining = Math.max(0, target - rev);
    const goalRows = [
      ['var(--accent)', t('won'), money(rev)],
      ['var(--info)', t('forecast'), money(forecast)],
      [null, t('remaining'), remaining ? money(remaining) : `<span class="up">${t('goal_hit')} ✓</span>`],
      [null, t('days_left'), num(daysLeft)],
      [null, t('pace'), remaining ? money(daysLeft ? remaining / daysLeft : remaining) + t('per_day') : '—'],
    ];
    const ring = CH.ring({
      size: 132, value: rev / target, extra: (forecast - rev) / target, label: pct(rev / target), sub: t('of_goal'),
      tipMain: CH.tip(t('won'), [['var(--accent)', monthLong(thisMonth), money(rev)]], `${pct(rev / target)} ${t('of_goal')} (${money(target)})`),
      tipExtra: CH.tip(t('forecast'), [['var(--info)', cap(t('weighted')), money(forecast - rev)], [null, t('total'), money(forecast)]], `${closingNow.length} ${t('closing_deals')}`),
    });

    const stageRows = openStages().map((s) => {
      const ds = open.filter((d) => d.stage === s.id), tot = sum(ds, (d) => d.value);
      return {
        label: s[prefs.lang], value: tot, display: money(tot, true), color: stageColor(s.id), act: 'stage:' + s.id,
        tip: CH.tip(s[prefs.lang], [[stageColor(s.id), t('total'), money(tot)], [null, t('count'), num(ds.length)], [null, `${cap(t('weighted'))} (${s.prob}%)`, money((tot * s.prob) / 100)], [null, t('avg'), ds.length ? money(tot / ds.length) : '—']], t('click_stage')),
      };
    });

    const upcoming = db.tasks.filter((x) => !x.done).sort((a, b) => a.due.localeCompare(b.due) || PRIO_RANK[a.priority] - PRIO_RANK[b.priority]).slice(0, 6);
    const top = open.slice().sort((a, b) => b.value - a.value).slice(0, 5);
    const legend = `<div class="legend"><span><i style="background:var(--accent)"></i>${t('won')}</span><span><i class="dash" style="border-color:var(--info)"></i>${t('forecast')}</span><span><i class="dash" style="border-color:var(--warn)"></i>${t('goal')}</span></div>`;

    return head(`${t('hello')}, ${esc(C.user.name.split(' ')[0])}`, `${longDate(isoToday)} · ${t('dash_sub')}`, `<button class="btn btn-ghost" data-new="deal">${ic('plus')} ${t('new_deal')}</button>`) +
      `<div class="kpis">${kpis.map(kpiCard).join('')}</div>
      <div class="grid g-2-1">
        <div class="card card-pad">
          <div class="card-head"><h3>${t('rev_chart')}</h3><div class="card-tools">${legend}${seg('dashRange', [[6, '6M'], [12, '12M']], ui.dashRange, 'sm')}</div></div>
          ${chart((w) => CH.line({ width: w, height: 286, labels: months.map(monthLabel), fmtAxis: (v) => money(v, true), goal: { value: target, label: t('goal') },
              series: [{ values: fcSeries, color: 'var(--info)', dash: true }, { values: wonSeries, color: 'var(--accent)', fill: true }],
              tips: monthTip, act: (i) => 'month:' + months[i] }))}
          <p class="hint">${ic('info', 14)} ${t('chart_hint')}</p>
        </div>
        <div class="card card-pad goal-card">
          <div class="card-head"><h3>${t('goal_title')}</h3><span class="muted sm">${monthLong(thisMonth)}</span></div>
          <div class="goal-wrap">${ring}<div class="goal-list">${goalRows.map(([c, l, v]) => `<div><span>${c ? `<i style="background:${c}"></i>` : '<i class="none"></i>'}${l}</span><b>${v}</b></div>`).join('')}</div></div>
          <div class="card-head mt"><h3>${t('funnel')}</h3><a href="#deals">${t('view_all')}</a></div>
          ${CH.hbars(stageRows)}
        </div>
      </div>
      <div class="grid g-3">
        <div class="card card-pad"><div class="card-head"><h3>${t('recent')}</h3></div>
          <div class="chips mb">${['all', 'call', 'email', 'meeting', 'note', 'deal'].map((k) => `<button class="chip-btn ${ui.actFilter === k ? 'on' : ''}" data-seg="actFilter" data-v="${k}">${k === 'all' ? t('all') : t('ac_' + k)}</button>`).join('')}</div>
          <ul class="feed" id="feed"></ul></div>
        <div class="card card-pad"><div class="card-head"><h3>${t('upcoming')}</h3><a href="#tasks">${t('view_all')}</a></div>${upcoming.map(miniTask).join('') || empty()}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('top_deals')}</h3><a href="#deals">${t('view_all')}</a></div>${top.map(dealRow).join('') || empty()}</div>
      </div>`;
  };
  fills.dashboard = () => renderFeed();
  function renderFeed() {
    const el = $('#feed');
    if (el) el.innerHTML = db.activities.filter((a) => ui.actFilter === 'all' || a.type === ui.actFilter).slice(0, 7).map((a) => feedItem(a)).join('') || `<li>${empty()}</li>`;
  }
  const feedItem = (a, hideName) => `<li><span class="ico" style="--c:${ACT_COLOR[a.type] || 'var(--accent)'}">${ic(a.type === 'deal' ? 'deal' : a.type, 15)}</span><div>
      <p>${hideName ? `<b>${t('ac_' + a.type)}</b>` : `<a data-open="contact:${a.contactId}">${esc(ctName(a.contactId))}</a>`} · ${esc(tr(a.text))}</p>
      <small>${esc(a.user)} · <span data-tip="${esc(CH.tip(new Date(a.at).toLocaleString(loc(), { dateStyle: 'medium', timeStyle: 'short' })))}">${relTime(a.at)}</span></small></div></li>`;
  const miniTask = (x) => {
    const late = !x.done && daysFrom(x.due) < 0;
    return `<div class="mini-row" data-edit="task:${x.id}"><button class="check ${x.done ? 'on' : ''}" data-toggle="${x.id}" aria-label="${t('done')}">${x.done ? ic('check', 12) : ''}</button>
      <div class="t"><span class="${x.done ? 'done-text' : ''}">${esc(tr(x.title))}</span><small>${esc(ctName(x.contactId))} · <span class="${late ? 'down' : ''}">${relDays(x.due)}</span></small></div>${prioBadge(x.priority)}</div>`;
  };
  const dealTip = (d) => {
    const open = isOpen(d), late = open && daysFrom(d.closeDate) < 0, age = stageAge(d), stale = open && age > 30;
    const rows = [[stageColor(d.stage), t('stage'), esc(stageName(d.stage))], [null, t('value'), `<b>${money(d.value)}</b>`]];
    if (open) rows.push([null, cap(t('weighted')), `${money(d.value * prob(d.stage))} (${Math.round(prob(d.stage) * 100)}%)`]);
    rows.push([null, t('contact'), esc(ctName(d.contactId))], [null, t('close_date'), `<span class="${late ? 'down' : ''}">${fmtDate(d.closeDate)} · ${relDays(d.closeDate)}</span>`]);
    if (open) rows.push([null, t('days_in_stage'), num(age)]);
    if (d.stage === 'lost' && d.lostReason) rows.push([null, t('lost_reason'), t('lr_' + d.lostReason)]);
    rows.push([ownerColor(d.owner), t('owner'), esc(d.owner)]);
    return CH.tip(dealName(d), rows, late ? `<span class="down">${t('overdue_close')}</span>` : stale ? `<span class="warn-t">${t('stale')}</span>` : '');
  };
  const dealRow = (d) => `<div class="mini-row" data-open="deal:${d.id}" data-tip-delay data-tip="${esc(dealTip(d))}"><span class="co-logo sm">${esc(initials(coName(d.companyId)))}</span>
      <div class="t"><span>${esc(dealProduct(d))}</span><small>${esc(coName(d.companyId))} · ${esc(stageName(d.stage))}</small></div><b>${money(d.value, true)}</b></div>`;

  // ---------------------------------------------------------------- contacts
  function contactRows() {
    const q = ui.cQ.trim().toLowerCase();
    const rows = db.contacts.filter((c) => (ui.cStatus === 'all' || c.status === ui.cStatus) && (ui.cOwner === 'all' || c.owner === ui.cOwner) &&
      (!q || [c.name, c.email, coName(c.companyId), tr(c.title), c.phone].join(' ').toLowerCase().includes(q)));
    const [k, dir] = ui.cSort;
    const val = (c) => (k === 'company' ? coName(c.companyId) : k === 'status' ? STATUSES.indexOf(c.status) : c[k] || '');
    return rows.sort((a, b) => { const x = val(a), y = val(b); return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), loc())) * dir; });
  }
  function contactPage() {
    const rows = contactRows(), pages = Math.max(1, Math.ceil(rows.length / ui.cSize));
    ui.cPage = Math.max(0, Math.min(ui.cPage, pages - 1));
    return { rows, pages, slice: rows.slice(ui.cPage * ui.cSize, (ui.cPage + 1) * ui.cSize) };
  }
  views.contacts = () => head(t('contacts'), t('contacts_sub'),
    `<button class="btn btn-plain" data-act="export-contacts">${ic('download')} ${t('export')}</button><button class="btn btn-primary" data-new="contact">${ic('plus')} ${t('new_contact')}</button>`) +
    `<div class="card"><div class="toolbar">
      ${seg('cStatus', ['all', ...STATUSES].map((s) => [s, `${s === 'all' ? t('all') : t('st_' + s)} <span class="n">${s === 'all' ? db.contacts.length : db.contacts.filter((c) => c.status === s).length}</span>`]), ui.cStatus)}
      <span class="sp"></span>
      <select id="cOwner" aria-label="${t('owner')}"><option value="all">${t('owner')}: ${t('all')}</option>${team().map((o) => `<option ${ui.cOwner === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
      <label class="input-ic">${ic('search', 16)}<input id="cQ" type="search" placeholder="${t('search_contacts')}" value="${esc(ui.cQ)}" autocomplete="off"/></label>
    </div><div id="cBulk"></div><div id="cTable"></div></div>`;
  fills.contacts = () => renderContactTable();
  function renderContactTable() {
    const host = $('#cTable');
    if (!host) return;
    const { rows, pages, slice } = contactPage();
    const allOn = slice.length > 0 && slice.every((c) => ui.sel.has(c.id)), someOn = slice.some((c) => ui.sel.has(c.id));
    const th = (k, l, cls = '') => `<th data-sort="${k}" class="sortable ${cls}">${l}${ui.cSort[0] === k ? `<span class="arr">${ui.cSort[1] > 0 ? '↑' : '↓'}</span>` : ''}</th>`;
    host.innerHTML = `<div class="table-wrap"><table class="tbl"><thead><tr>
        <th class="cb"><button class="check ${allOn ? 'on' : someOn ? 'part' : ''}" data-act="sel-page" aria-label="${t('select')}">${allOn ? ic('check', 12) : someOn ? '<i></i>' : ''}</button></th>
        ${th('name', t('name'))}${th('company', t('company'))}${th('status', t('status'))}${th('phone', t('phone'), 'hide-m')}${th('owner', t('owner'), 'hide-m')}${th('lastContact', t('last_contact'))}<th class="hide-m"></th></tr></thead><tbody>
      ${slice.map((c) => `<tr data-open="contact:${c.id}" class="${ui.sel.has(c.id) ? 'sel' : ''}">
        <td class="cb"><button class="check ${ui.sel.has(c.id) ? 'on' : ''}" data-sel="${c.id}" aria-label="${t('select')}">${ui.sel.has(c.id) ? ic('check', 12) : ''}</button></td>
        <td><div class="who">${avatar(c.name, '', 'var(--accent)')}<div><span class="strong">${esc(c.name)}</span> ${c.tags.map(tagChip).join('')}<small>${esc(c.email)}</small></div></div></td>
        <td>${esc(coName(c.companyId))}<small class="sub">${esc(tr(c.title))}</small></td>
        <td>${statusBadge(c.status)}</td>
        <td class="mono hide-m">${esc(c.phone)}</td>
        <td class="hide-m"><div class="who sm">${avatar(c.owner, 'xs')}<span>${esc(c.owner)}</span></div></td>
        <td><span data-tip="${esc(CH.tip(fullDate(c.lastContact)))}">${relDays(c.lastContact)}</span></td>
        <td class="row-acts hide-m"><a class="icon-btn sm" href="tel:${esc(c.phone)}" data-stop aria-label="${t('call')}">${ic('call', 14)}</a><a class="icon-btn sm" href="mailto:${esc(c.email)}" data-stop aria-label="${t('send_email')}">${ic('email', 14)}</a></td>
      </tr>`).join('') || `<tr><td colspan="8">${empty(t('no_results'))}</td></tr>`}
      </tbody></table></div>
      <div class="pager"><span>${t('showing')} ${slice.length ? ui.cPage * ui.cSize + 1 : 0}–${ui.cPage * ui.cSize + slice.length} ${t('of')} ${rows.length}</span>
        <div class="pager-r"><select id="cSize" aria-label="${t('per_page')}">${[12, 25, 50].map((n) => `<option value="${n}" ${n === ui.cSize ? 'selected' : ''}>${n} ${t('per_page')}</option>`).join('')}</select>
        <button class="icon-btn" data-page="-1" ${ui.cPage === 0 ? 'disabled' : ''} aria-label="prev">${ic('chevL')}</button><span>${ui.cPage + 1} / ${pages}</span>
        <button class="icon-btn" data-page="1" ${ui.cPage >= pages - 1 ? 'disabled' : ''} aria-label="next">${ic('chevR')}</button></div></div>`;
    renderBulk();
  }
  function renderBulk() {
    const el = $('#cBulk');
    if (!el) return;
    const n = ui.sel.size;
    el.innerHTML = !n ? '' : `<div class="bulk"><b>${n} ${t('selected')}</b>
      <div class="dd-wrap"><button class="btn btn-plain sm" data-dd="ddBulkStatus" aria-expanded="false">${t('set_status')} ${ic('chevD', 14)}</button><div class="dd" id="ddBulkStatus">${STATUSES.map((s) => `<button class="dd-item" data-act="bulk-status:${s}">${statusBadge(s)}</button>`).join('')}</div></div>
      <div class="dd-wrap"><button class="btn btn-plain sm" data-dd="ddBulkOwner" aria-expanded="false">${t('assign')} ${ic('chevD', 14)}</button><div class="dd" id="ddBulkOwner">${team().map((o) => `<button class="dd-item" data-act="bulk-owner:${esc(o)}">${avatar(o, 'xs')} ${esc(o)}</button>`).join('')}</div></div>
      <button class="btn btn-plain sm" data-act="bulk-export">${ic('download', 14)} CSV</button>
      <button class="btn btn-danger sm" data-act="bulk-delete">${ic('trash', 14)} ${t('delete')}</button>
      <span class="sp"></span><button class="link-btn" data-act="bulk-clear">${t('clear')}</button></div>`;
  }

  // ---------------------------------------------------------------- companies
  views.companies = () => {
    const inds = [...new Set(db.companies.map((c) => c.industry))].sort((a, b) => tr(a).localeCompare(tr(b)));
    return head(t('companies'), t('companies_sub'), `<button class="btn btn-primary" data-new="company">${ic('plus')} ${t('new_company')}</button>`) +
      `<div class="card mb"><div class="toolbar">
        <label class="input-ic">${ic('search', 16)}<input id="coQ" type="search" placeholder="${t('search_companies')}" value="${esc(ui.coQ)}" autocomplete="off"/></label>
        <div class="chips">${['all', ...inds].map((x) => `<button class="chip-btn ${ui.coInd === x ? 'on' : ''}" data-seg="coInd" data-v="${esc(x)}">${x === 'all' ? t('all') : esc(tr(x))}</button>`).join('')}</div>
        <span class="sp"></span>
        <select id="coSort" aria-label="${t('sort_by')}">${[['revenue', t('by_revenue')], ['open', t('by_open')], ['name', t('by_name')]].map(([v, l]) => `<option value="${v}" ${ui.coSort === v ? 'selected' : ''}>${t('sort_by')}: ${l}</option>`).join('')}</select>
      </div></div><div class="co-grid" id="coGrid"></div>`;
  };
  fills.companies = () => renderCompanies();
  function companyStats(c) {
    const deals = db.deals.filter((d) => d.companyId === c.id), open = deals.filter(isOpen);
    return { c, people: db.contacts.filter((x) => x.companyId === c.id).length, open, openVal: sum(open, (d) => d.value), won: sum(deals.filter((d) => d.stage === 'won'), (d) => d.value) };
  }
  function renderCompanies() {
    const el = $('#coGrid');
    if (!el) return;
    const q = ui.coQ.trim().toLowerCase();
    const all = db.companies.map(companyStats);
    const totalWon = sum(all, (x) => x.won) || 1, maxWon = Math.max(1, ...all.map((x) => x.won));
    const list = all.filter(({ c }) => (ui.coInd === 'all' || c.industry === ui.coInd) && (!q || [c.name, tr(c.industry), c.city].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => (ui.coSort === 'name' ? byName(a.c, b.c) : ui.coSort === 'open' ? b.openVal - a.openVal : b.won - a.won));
    el.innerHTML = list.map(({ c, people, open, openVal, won }) => `<div class="card co-card" data-open="company:${c.id}">
        <div class="co-row"><span class="co-logo">${esc(initials(c.name))}</span><div class="co-name"><b>${esc(c.name)}</b><small>${esc(tr(c.industry))} · ${esc(c.city)}</small></div></div>
        <div class="co-stats">
          <div><b>${people}</b><small>${t('people')}</small></div>
          <div data-tip="${esc(CH.tip(t('open_deals'), [['var(--accent)', t('total'), money(openVal)], [null, t('count'), num(open.length)]]))}"><b>${open.length}</b><small>${t('open_short')}</small></div>
          <div><b>${money(won, true)}</b><small>${t('revenue')}</small></div>
        </div>
        <div class="share" data-tip="${esc(CH.tip(c.name, [['var(--accent)', t('revenue'), money(won)]], `${pct(won / totalWon)} ${t('share_rev')}`))}"><span style="width:${((won / maxWon) * 100).toFixed(1)}%"></span></div>
      </div>`).join('') || empty(t('no_results'));
  }

  // ---------------------------------------------------------------- deals
  function dealFilter(d) {
    if (ui.dOwners.size && !ui.dOwners.has(d.owner)) return false;
    const q = ui.dQ.trim().toLowerCase();
    return !q || [dealName(d), coName(d.companyId), ctName(d.contactId)].join(' ').toLowerCase().includes(q);
  }
  const inWindow = (d) => isOpen(d) || ui.dWindow === 'all' || daysFrom(d.closeDate) >= -ui.dWindow;
  views.deals = () => {
    const owners = `<div class="owner-filter" role="group" aria-label="${t('owners_filter')}">${team().map((o) =>
      `<button class="of ${ui.dOwners.has(o) ? 'on' : ''} ${ui.dOwners.size && !ui.dOwners.has(o) ? 'dim' : ''}" data-act="owner-toggle:${esc(o)}" aria-label="${esc(o)}" data-tip="${esc(CH.tip(o, [], t('owners_filter')))}">${avatar(o, 'sm')}</button>`).join('')}</div>`;
    return `<div class="page-head deals-head"><div class="ph-l"><h1>${t('deals')}</h1><div class="sum-chips" id="dealSum"></div></div>
      <div class="actions">
        <label class="input-ic sm">${ic('search', 15)}<input id="dQ" type="search" placeholder="${t('search_deals')}" value="${esc(ui.dQ)}" autocomplete="off"/></label>
        ${owners}
        <select id="dWindow" aria-label="${t('closed_window')}">${[[30, t('d30')], [90, t('d90')], ['all', t('all_time')]].map(([v, l]) => `<option value="${v}" ${String(ui.dWindow) === String(v) ? 'selected' : ''}>${t('closed_window')}: ${l}</option>`).join('')}</select>
        ${seg('dMode', [['board', ic('deals', 15), t('board')], ['list', ic('list', 15), t('list')]], ui.dMode, 'icons')}
        <button class="btn btn-primary" data-new="deal" aria-label="${t('new_deal')}" data-tip-lbl data-tip="${esc(CH.tip(t('new_deal'), []))}">${ic('plus')} <span class="lbl">${t('new_deal')}</span></button>
      </div></div><div id="dealsBody"></div>`;
  };
  fills.deals = () => renderDeals();
  function renderDeals() {
    const host = $('#dealsBody');
    if (!host) return;
    const list = db.deals.filter(dealFilter);
    const open = list.filter(isOpen), closing = open.filter((d) => monthKey(d.closeDate) === thisMonth);
    const sumEl = $('#dealSum');
    if (sumEl) sumEl.innerHTML = [
      [t('kpi_pipeline'), money(sum(open, (d) => d.value), true), CH.tip(t('kpi_pipeline'), [], t('help_pipeline'))],
      [cap(t('weighted')), money(sum(open, (d) => d.value * prob(d.stage)), true), CH.tip(cap(t('weighted')), openStages().map((s) => [stageColor(s.id), s[prefs.lang], money(sum(open.filter((d) => d.stage === s.id), (d) => d.value * prob(d.stage)))]), t('help_weighted'))],
      // The open count repeats the tab badge, so narrow screens drop this chip first
      [t('open_deals'), num(open.length), '', 'opt'],
      [t('closing_month'), money(sum(closing, (d) => d.value), true), CH.tip(t('closing_month'), closing.map((d) => [stageColor(d.stage), dealProduct(d) + ' · ' + coName(d.companyId), money(d.value)]))],
    ].map(([l, v, tp, cls]) => `<span class="sum${cls ? ' ' + cls : ''}"${tp ? ` data-tip="${esc(tp)}"` : ''}><small>${l}</small><b>${v}</b></span>`).join('');
    $('#view').classList.toggle('fit', ui.dMode !== 'list');
    host.innerHTML = ui.dMode === 'list' ? dealTable(list) : dealBoard(list);
    fitBoard();
    if (ui.flash) {
      const col = host.querySelector(`.col[data-col="${ui.flash}"]`);
      if (col) { col.classList.add('flash'); setTimeout(() => col.classList.remove('flash'), 1800); }
      ui.flash = null;
    }
  }
  // Keep every deal visible at a glance: when a column would need to scroll, the
  // board steps down through tighter layouts, ending with one-line cards (the full
  // details stay in the hover tooltip).
  const FIT_LEVELS = ['compact', 'tight', 'dense'];
  function fitBoard() {
    const b = $('.board');
    if (!b) return;
    const over = () => $$('.col-body', b).some((c) => c.scrollHeight > c.clientHeight + 1);
    b.classList.remove(...FIT_LEVELS);
    for (const level of FIT_LEVELS) { if (!over()) break; b.classList.add(level); }
  }
  function lostReasonRows(ds) {
    const by = {};
    ds.forEach((d) => { if (d.lostReason) by[d.lostReason] = (by[d.lostReason] || 0) + 1; });
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([r, n]) => [null, t('lr_' + r), num(n)]);
  }
  function dealBoard(list) {
    const windowLabel = ui.dWindow === 'all' ? t('all_time') : t('last_n_days').replace('{n}', ui.dWindow);
    const windowShort = ui.dWindow === 'all' ? t('all_time') : `${ui.dWindow} ${t('days')}`;
    return `<div class="board">${C.stages.map((s) => {
      const closed = s.id === 'won' || s.id === 'lost';
      const ds = list.filter((d) => d.stage === s.id && inWindow(d)).sort((a, b) => (closed ? b.closeDate.localeCompare(a.closeDate) : b.value - a.value));
      const tot = sum(ds, (d) => d.value);
      const avgAge = ds.length ? sum(ds, stageAge) / ds.length : 0;
      const colTip = closed
        ? CH.tip(s[prefs.lang], [[stageColor(s.id), t('total'), money(tot)], [null, t('count'), num(ds.length)]].concat(s.id === 'lost' ? lostReasonRows(ds) : []), windowLabel)
        : CH.tip(s[prefs.lang], [[stageColor(s.id), t('total'), money(tot)], [null, `${cap(t('weighted'))} (${s.prob}%)`, money((tot * s.prob) / 100)], [null, t('count'), num(ds.length)], [null, t('avg_days_stage'), ds.length ? FMT.days(avgAge) : '—']]);
      const add = closed ? '' : `<button class="col-add" data-new="deal" data-stage="${s.id}" aria-label="${t('new_deal')}" data-tip="${esc(CH.tip(t('new_deal'), [], esc(s[prefs.lang])))}">${ic('plus', 14)}</button>`;
      return `<section class="col" data-col="${s.id}" style="--c:${stageColor(s.id)}">
        <header class="col-head" data-tip="${esc(colTip)}"><div class="col-t"><span class="dot"></span><span class="col-name">${esc(s[prefs.lang])}</span><span class="n">${ds.length}</span></div>${add}
          <div class="col-v"><b>${money(tot, true)}</b><small>${closed ? windowShort : s.prob + '%'}</small></div></header>
        <div class="col-body" data-stage="${s.id}">${ds.map(dealCard).join('') || `<div class="col-empty">${t('drop_here')}</div>`}</div>
      </section>`;
    }).join('')}</div>`;
  }
  function dealCard(d) {
    const open = isOpen(d), late = open && daysFrom(d.closeDate) < 0, stale = open && stageAge(d) > 30;
    return `<article class="deal ${late ? 'late' : ''} ${stale ? 'stale' : ''}" draggable="true" data-id="${d.id}" data-open="deal:${d.id}" data-tip-delay data-tip="${esc(dealTip(d))}">
      <div class="deal-top"><span class="deal-t">${esc(dealProduct(d))}</span><span class="deal-v">${money(d.value, true)}</span></div>
      <div class="deal-bot"><span class="deal-co">${esc(coName(d.companyId))}</span><span class="deal-d">${late || stale ? '<i class="flag"></i>' : ''}${fmtDate(d.closeDate)}</span>${avatar(d.owner, 'xs')}</div>
    </article>`;
  }
  function dealTable(list) {
    const [k, dir] = ui.dSort;
    const val = (d) => (k === 'company' ? coName(d.companyId) : k === 'title' ? dealProduct(d) : k === 'stage' ? C.stages.findIndex((s) => s.id === d.stage) : k === 'value' ? d.value : k === 'owner' ? d.owner : d.closeDate);
    const rows = list.filter(inWindow).sort((a, b) => { const x = val(a), y = val(b); return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), loc())) * dir; });
    const th = (key, l, cls = '') => `<th data-dsort="${key}" class="sortable ${cls}">${l}${k === key ? `<span class="arr">${dir > 0 ? '↑' : '↓'}</span>` : ''}</th>`;
    return `<div class="card"><div class="table-wrap"><table class="tbl"><thead><tr>${th('title', t('deal'))}${th('company', t('company'))}${th('stage', t('stage'))}${th('value', t('value'), 'num')}<th class="num hide-m">${t('prob')}</th>${th('closeDate', t('close_date'))}${th('owner', t('owner'), 'hide-m')}</tr></thead><tbody>
      ${rows.map((d) => {
        const late = isOpen(d) && daysFrom(d.closeDate) < 0;
        return `<tr data-open="deal:${d.id}"><td class="strong">${esc(dealProduct(d))}</td><td>${esc(coName(d.companyId))}</td>
          <td><select class="stage-sel" data-stage-of="${d.id}" style="--c:${stageColor(d.stage)}" aria-label="${t('stage')}">${C.stages.map((s) => `<option value="${s.id}" ${s.id === d.stage ? 'selected' : ''}>${esc(s[prefs.lang])}</option>`).join('')}</select></td>
          <td class="num strong">${money(d.value)}</td><td class="num muted hide-m">${Math.round(prob(d.stage) * 100)}%</td>
          <td class="${late ? 'down' : ''}">${fmtDate(d.closeDate)}</td><td class="hide-m"><div class="who sm">${avatar(d.owner, 'xs')}<span>${esc(d.owner)}</span></div></td></tr>`;
      }).join('') || `<tr><td colspan="7">${empty(t('no_results'))}</td></tr>`}
      </tbody><tfoot><tr><td colspan="3">${rows.length} ${t('deals_count')}</td><td class="num strong">${money(sum(rows, (d) => d.value))}</td><td colspan="3" class="hide-m"></td></tr></tfoot></table></div></div>`;
  }

  // ---------------------------------------------------------------- tasks
  const taskGroups = () => ({
    pending: db.tasks.filter((x) => !x.done),
    overdue: db.tasks.filter((x) => !x.done && daysFrom(x.due) < 0),
    today: db.tasks.filter((x) => !x.done && daysFrom(x.due) === 0),
    upcoming_t: db.tasks.filter((x) => !x.done && daysFrom(x.due) > 0),
    completed: db.tasks.filter((x) => x.done),
  });
  views.tasks = () => {
    const g = taskGroups();
    return head(t('tasks'), t('tasks_sub'),
      `<select id="tOwner" aria-label="${t('owner')}"><option value="all">${t('owner')}: ${t('all')}</option>${team().map((o) => `<option ${ui.tOwner === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select><button class="btn btn-primary" data-new="task">${ic('plus')} ${t('new_task')}</button>`) +
      `<form class="card quick-add" id="quickTask" autocomplete="off">
        <span class="qa-ic">${ic('plus', 18)}</span><input name="title" placeholder="${t('add_task_ph')}" required aria-label="${t('task')}"/>
        <select name="due" aria-label="${t('due')}">${[[0, t('today')], [1, t('tomorrow')], [7, t('next_week')]].map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
        <select name="priority" aria-label="${t('priority')}">${['medium', 'high', 'low'].map((p) => `<option value="${p}">${t(p)}</option>`).join('')}</select>
        <select name="contactId" aria-label="${t('contact')}"><option value="">${t('no_contact')}</option>${db.contacts.slice().sort(byName).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        <button class="btn btn-primary">${t('add')}</button></form>
      <div class="card"><div class="toolbar">${seg('tTab', Object.keys(g).map((k) => [k, `${t(k)} <span class="n ${k === 'overdue' && g[k].length ? 'bad' : ''}">${g[k].length}</span>`]), ui.tTab)}</div><div id="tList" class="t-list"></div></div>`;
  };
  fills.tasks = () => renderTasks();
  function renderTasks() {
    const el = $('#tList');
    if (!el) return;
    const done = ui.tTab === 'completed';
    const list = taskGroups()[ui.tTab].filter((x) => ui.tOwner === 'all' || x.owner === ui.tOwner)
      .sort((a, b) => (done ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due)) || PRIO_RANK[a.priority] - PRIO_RANK[b.priority]);
    let last = null, html = '';
    list.forEach((x) => {
      if (x.due !== last) { last = x.due; html += `<div class="t-grp"><b class="${!done && daysFrom(x.due) < 0 ? 'down' : ''}">${relDays(x.due)}</b><span>${longDate(x.due)}</span></div>`; }
      html += taskRow(x);
    });
    el.innerHTML = html || empty();
  }
  const taskRow = (x) => {
    const late = !x.done && daysFrom(x.due) < 0;
    return `<div class="t-row ${x.done ? 'done' : ''}" data-edit="task:${x.id}">
      <button class="check ${x.done ? 'on' : ''}" data-toggle="${x.id}" aria-label="${t('done')}">${x.done ? ic('check', 12) : ''}</button>
      <div class="t-main"><span class="t-title">${esc(tr(x.title))}</span>${x.contactId ? `<a class="t-ct" data-open="contact:${x.contactId}">${esc(ctName(x.contactId))}</a>` : ''}</div>
      ${prioBadge(x.priority)}<span class="t-due ${late ? 'down' : ''}">${late ? ic('alert', 13) : ic('clock', 13)} ${fmtDate(x.due)}</span>${avatar(x.owner, 'xs', null, true)}</div>`;
  };

  // ---------------------------------------------------------------- calendar
  function dayItems(key) {
    const evs = db.events.filter((e) => e.date === key).sort((a, b) => a.time.localeCompare(b.time)).map((e) => ({ kind: 'event', e }));
    return evs.concat(db.tasks.filter((x) => x.due === key && !x.done).map((x) => ({ kind: 'task', e: x })));
  }
  function itemTip(it) {
    const e = it.e;
    if (it.kind === 'task') return CH.tip(tr(e.title), [['var(--muted)', t('type'), t('task')], [null, t('priority'), t(e.priority)], [null, t('contact'), esc(ctName(e.contactId))], [ownerColor(e.owner), t('owner'), esc(e.owner)]], longDate(e.due));
    const ct = byId('contacts', e.contactId);
    return CH.tip(tr(e.title), [[EV_COLOR[e.type], t('type'), t(EV_LABEL[e.type])], [null, t('time'), e.time], [null, t('contact'), esc(ctName(e.contactId))], [null, t('company'), esc(ct ? coName(ct.companyId) : '—')]], longDate(e.date));
  }
  const calChip = (it) => it.kind === 'event'
    ? `<span class="ev ${it.e.type}" draggable="true" data-drag="event:${it.e.id}" data-edit="event:${it.e.id}" data-tip="${esc(itemTip(it))}"><b>${it.e.time}</b> ${esc(tr(it.e.title))}</span>`
    : `<span class="ev task" draggable="true" data-drag="task:${it.e.id}" data-edit="task:${it.e.id}" data-tip="${esc(itemTip(it))}">${ic('check', 11)} ${esc(tr(it.e.title))}</span>`;
  views.calendar = () => {
    const m = ui.calMonth;
    const legend = `<div class="legend">${['meeting', 'call', 'demo'].map((k) => `<span><i style="background:${EV_COLOR[k]}"></i>${t(EV_LABEL[k])}</span>`).join('')}<span><i style="background:var(--muted)"></i>${t('task')}</span></div>`;
    return head(t('calendar'), t('cal_sub'), `<button class="btn btn-primary" data-new="event">${ic('plus')} ${t('new_event')}</button>`) +
      `<div class="card"><div class="toolbar cal-bar">
        <div class="cal-nav"><button class="icon-btn" data-cal="-1" aria-label="prev">${ic('chevL')}</button><h3>${cap(m.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }))}</h3><button class="icon-btn" data-cal="1" aria-label="next">${ic('chevR')}</button><button class="btn btn-plain sm" data-cal="0">${t('today')}</button></div>
        <span class="sp"></span>${legend}${seg('calView', [['month', t('month')], ['agenda', t('agenda')]], ui.calView)}</div>
        ${ui.calView === 'agenda' ? agendaView() : monthGrid()}</div><p class="hint">${ic('info', 14)} ${t('click_day')}</p>`;
  };
  function monthGrid() {
    const m = ui.calMonth, start = new Date(m);
    start.setDate(1 - ((m.getDay() + 6) % 7));
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = isoD(d), items = dayItems(key), shown = items.slice(0, 3), more = items.length - shown.length;
      const cls = [d.getMonth() !== m.getMonth() && 'other', key === isoToday && 'today', (d.getDay() === 0 || d.getDay() === 6) && 'wkend'].filter(Boolean).join(' ');
      cells += `<div class="cell ${cls}" data-day="${key}"><span class="num">${d.getDate()}</span>${shown.map(calChip).join('')}${more > 0 ? `<button class="more" data-act="day:${key}">+${more} ${t('more')}</button>` : ''}</div>`;
    }
    return `<div class="cal">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<div class="dow">${weekdayShort(i)}</div>`).join('')}${cells}</div>`;
  }
  function agendaView() {
    const m = ui.calMonth, days = [];
    const isCur = m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth();
    const last = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let d = isCur ? today.getDate() : 1; d <= last; d++) {
      const key = isoD(new Date(m.getFullYear(), m.getMonth(), d)), items = dayItems(key);
      if (items.length) days.push([key, items]);
    }
    const row = (it) => it.kind === 'event'
      ? `<div class="ag-it" data-edit="event:${it.e.id}" data-tip-delay data-tip="${esc(itemTip(it))}"><span class="ag-time">${it.e.time}</span><span class="ag-bar" style="background:${EV_COLOR[it.e.type]}"></span><div><b>${esc(tr(it.e.title))}</b><small>${t(EV_LABEL[it.e.type])} · ${esc(ctName(it.e.contactId))}</small></div></div>`
      : `<div class="ag-it" data-edit="task:${it.e.id}"><span class="ag-time">—</span><span class="ag-bar" style="background:var(--muted)"></span><div><b>${esc(tr(it.e.title))}</b><small>${t('task')} · ${esc(ctName(it.e.contactId))}</small></div></div>`;
    return `<div class="agenda">${days.map(([key, items]) => `<div class="ag-day"><div class="ag-date ${key === isoToday ? 'today' : ''}"><b>${parse(key).getDate()}</b><span>${weekdayShort((parse(key).getDay() + 6) % 7)}</span></div><div class="ag-items">${items.map(row).join('')}</div></div>`).join('') || empty()}</div>`;
  }

  // ---------------------------------------------------------------- reports
  views.reports = () => {
    const P = ui.rPeriod, months = monthsBack(P), from = months[0] + '-01';
    const prevFrom = monthsBack(2 * P)[0] + '-01';
    const own = (d) => ui.rOwner === 'all' || d.owner === ui.rOwner;
    const inP = (date) => date >= from && date <= isoToday;
    const closed = db.deals.filter((d) => own(d) && !isOpen(d));
    const cur = closed.filter((d) => inP(d.closeDate)), prev = closed.filter((d) => d.closeDate >= prevFrom && d.closeDate < from);
    const stats = (list) => {
      const won = list.filter((d) => d.stage === 'won'), rev = sum(won, (d) => d.value);
      return { rev, wr: list.length ? won.length / list.length : null, avg: won.length ? rev / won.length : null, cycle: won.length ? sum(won, (d) => (parse(d.closeDate) - parse(d.created)) / 864e5) / won.length : null, n: won.length };
    };
    const S = stats(cur), Sp = stats(prev), hasPrev = prev.some((d) => d.stage === 'won');
    const dl = (a, b, kind) => {
      if (!hasPrev || a == null || b == null || (kind !== 'pts' && !b)) return `<span class="muted">${t('no_prev')}</span>`;
      if (kind === 'pts') { const v = Math.round((a - b) * 100); return `${deltaSpan(v >= 0, `${Math.abs(v)} ${t('pts')}`)} ${t('vs_prev')}`; }
      const r = (a - b) / b;
      return `<span class="${(kind === 'inv' ? r <= 0 : r >= 0) ? 'up' : 'down'}">${r >= 0 ? '▲' : '▼'} ${pct(Math.abs(r))}</span> ${t('vs_prev')}`;
    };
    const kpi = (label, help, icon, value, fmt, sub) => `<div class="card kpi"><div class="kpi-top"><span>${label}</span><span class="ico" ${helpTip(label, help)}>${ic(icon)}</span></div>
      <div class="kpi-val"${value == null ? '' : ` data-count="${value}" data-fmt="${fmt}"`}>${value == null ? '—' : FMT[fmt](value)}</div><div class="kpi-sub">${sub}</div></div>`;

    const owners = team().filter((o) => ui.rOwner === 'all' || o === ui.rOwner);
    const rows = months.map((mk) => owners.map((o) => sum(wonIn(mk).filter((d) => d.owner === o), (d) => d.value)));
    const barTip = (i) => CH.tip(monthLong(months[i]),
      owners.map((o, j) => [ownerColor(o), o, ui.rHidden.has(j) ? '—' : money(rows[i][j])]).concat([[null, t('total'), `<b>${money(rows[i].reduce((a, v, j) => a + (ui.rHidden.has(j) ? 0 : v), 0))}</b>`]]), t('click_detail'));

    // Funnel: deals created in the period, by the furthest stage they reached.
    const order = C.stages.filter((s) => s.id !== 'lost');
    const created = db.deals.filter((d) => own(d) && d.created && d.created >= from);
    const reach = (d) => order.findIndex((s) => s.id === (d.stage === 'lost' ? d.lostStage || order[0].id : d.stage));
    const reached = order.map((_, i) => created.filter((d) => reach(d) >= i).length);
    const fnRows = order.map((s, i) => ({
      label: s[prefs.lang], value: reached[i], display: num(reached[i]), color: stageColor(s.id),
      conv: i ? (reached[i - 1] ? pct(reached[i] / reached[i - 1]) : '—') : null,
      tip: CH.tip(s[prefs.lang], [[stageColor(s.id), t('reached'), num(reached[i])]]
        .concat(i ? [[null, t('conv_from'), reached[i - 1] ? pct(reached[i] / reached[i - 1]) : '—'], [null, t('dropped'), num(reached[i - 1] - reached[i])]] : [])
        .concat([[null, t('of_total'), reached[0] ? pct(reached[i] / reached[0]) : '—']])),
    }));

    const lost = cur.filter((d) => d.stage === 'lost');
    const lostRows = LOST.map((r) => { const ds = lost.filter((d) => d.lostReason === r); return { r, ds }; }).filter((x) => x.ds.length).sort((a, b) => b.ds.length - a.ds.length)
      .map(({ r, ds }) => ({ label: t('lr_' + r), value: ds.length, display: num(ds.length), color: 'var(--bad)', tip: CH.tip(t('lr_' + r), [['var(--bad)', t('count'), num(ds.length)], [null, t('value'), money(sum(ds, (d) => d.value))], [null, t('of_total'), pct(ds.length / lost.length)]]) }));

    const contacts = db.contacts.filter((c) => (ui.rOwner === 'all' || c.owner === ui.rOwner) && c.created && c.created >= from);
    const srcRows = SOURCES.map((k, i) => ({ k, n: contacts.filter((c) => c.source === k).length, color: PALETTE.concat(['var(--faint)'])[i] })).filter((x) => x.n).sort((a, b) => b.n - a.n)
      .map((x) => ({ label: t('src_' + x.k), value: x.n, color: x.color, tip: CH.tip(t('src_' + x.k), [[x.color, t('contacts'), num(x.n)], [null, t('of_total'), pct(x.n / contacts.length)]]) }));

    const acts = db.activities.filter((a) => (ui.rOwner === 'all' || a.user === ui.rOwner) && a.at.slice(0, 10) >= from);
    const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const grid = [0, 1, 2, 3, 4, 5, 6].map(() => HOURS.map(() => []));
    acts.forEach((a) => { const d = new Date(a.at), h = HOURS.indexOf(d.getHours()); if (h >= 0) grid[(d.getDay() + 6) % 7][h].push(a); });
    const heatTip = (r, c) => {
      const list = grid[r][c], hh = String(HOURS[c]).padStart(2, '0');
      return CH.tip(`${weekdayShort(r)} · ${hh}:00–${hh}:59`, ACT_TYPES.map((k) => [ACT_COLOR[k], t('ac_' + k), num(list.filter((a) => a.type === k).length)]).filter((x) => x[2] !== '0').concat([[null, t('total'), `<b>${num(list.length)}</b>`]]));
    };
    const typeRows = ACT_TYPES.map((k) => ({ k, n: acts.filter((a) => a.type === k).length })).sort((a, b) => b.n - a.n)
      .map(({ k, n }) => ({ label: t('ac_' + k), value: n, display: num(n), color: ACT_COLOR[k], tip: CH.tip(t('ac_' + k), [[ACT_COLOR[k], t('count'), num(n)], [null, t('of_total'), acts.length ? pct(n / acts.length) : '—']]) }));

    const lb = team().map((o) => {
      const mine = cur.filter((d) => d.owner === o), won = mine.filter((d) => d.stage === 'won'), rev = sum(won, (d) => d.value);
      return { o, rev, n: won.length, wr: mine.length ? won.length / mine.length : null, avg: won.length ? rev / won.length : 0, acts: db.activities.filter((a) => a.user === o && a.at.slice(0, 10) >= from).length, pipe: sum(db.deals.filter((d) => d.owner === o && isOpen(d)), (d) => d.value) };
    });
    const lbKey = ui.lbSort;
    lb.sort((a, b) => (b[lbKey] || 0) - (a[lbKey] || 0));
    const maxRev = Math.max(1, ...lb.map((x) => x.rev));
    const lth = (k, l) => `<th class="num sortable" data-lbsort="${k}">${l}${lbKey === k ? '<span class="arr">↓</span>' : ''}</th>`;

    return head(t('reports'), t('reports_sub'),
      `${seg('rPeriod', [[3, '3M'], [6, '6M'], [12, '12M']], ui.rPeriod)}<select id="rOwner" aria-label="${t('owner')}"><option value="all">${t('owner')}: ${t('all')}</option>${team().map((o) => `<option ${ui.rOwner === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`) +
      `<div class="kpis">
        ${kpi(t('rep_revenue'), t('help_rep_revenue'), 'money', S.rev, 'money', dl(S.rev, Sp.rev))}
        ${kpi(t('rep_win'), t('help_rep_win'), 'trophy', S.wr, 'pct', dl(S.wr, Sp.wr, 'pts'))}
        ${kpi(t('rep_avg'), t('help_rep_avg'), 'target', S.avg, 'money', dl(S.avg, Sp.avg))}
        ${kpi(t('rep_cycle'), t('help_rep_cycle'), 'clock', S.cycle, 'days', dl(S.cycle, Sp.cycle, 'inv'))}
      </div>
      <div class="card card-pad mb">
        <div class="card-head"><h3>${t('rev_by_owner')}</h3><div class="legend toggles">${owners.map((o, j) => `<button class="lg-btn ${ui.rHidden.has(j) ? 'off' : ''}" data-act="series:${j}"><i style="background:${ownerColor(o)}"></i>${esc(o)}</button>`).join('')}</div></div>
        ${chart((w) => CH.bars({ width: w, height: 280, labels: months.map(monthLabel), keys: owners.map((o) => ({ name: o, color: ownerColor(o) })), rows, hidden: ui.rHidden, fmtAxis: (v) => money(v, true), fmtVal: (v) => money(v, true), tips: barTip, act: (i) => 'month:' + months[i] }))}
        <p class="hint">${ic('info', 14)} ${t('toggle_series')}</p>
      </div>
      <div class="grid g-3">
        <div class="card card-pad"><div class="card-head"><h3>${t('conversion')}</h3><span class="muted sm">${t('conv_sub')}</span></div>${created.length ? CH.funnel(fnRows) : empty(t('no_data'))}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('by_source')}</h3></div>${contacts.length ? `<div class="donut-wrap">${CH.donut({ id: 'dnSource', size: 172, rows: srcRows, centerValue: num(contacts.length), centerLabel: t('contacts') })}
          <div class="dn-legend">${srcRows.map((r, i) => `<div class="dn-it" data-arc-for="dnSource" data-i="${i}"><i style="background:${r.color}"></i><span>${esc(r.label)}</span><b>${pct(r.value / contacts.length)}</b></div>`).join('')}</div></div>` : empty(t('no_data'))}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('lost_reasons')}</h3><span class="muted sm">${num(lost.length)}</span></div>${lostRows.length ? CH.hbars(lostRows) : empty(t('no_data'))}</div>
      </div>
      <div class="grid g-2-1">
        <div class="card card-pad"><div class="card-head"><h3>${t('heatmap')}</h3><span class="muted sm">${t('heat_sub')} · ${num(acts.length)} ${t('activities_n')}</span></div>
          ${chart((w) => CH.heatmap({ width: w, rows: [0, 1, 2, 3, 4, 5, 6].map(weekdayShort), cols: HOURS.map((h) => h + 'h'), values: grid.map((r) => r.map((l) => l.length)), color: 'var(--accent)', tips: heatTip }))}</div>
        <div class="card card-pad"><div class="card-head"><h3>${t('act_by_type')}</h3></div>${acts.length ? CH.hbars(typeRows) : empty(t('no_data'))}</div>
      </div>
      <div class="card"><div class="card-head pad"><h3>${t('leaderboard')}</h3></div><div class="table-wrap"><table class="tbl lb"><thead><tr><th>${t('owner')}</th>${lth('rev', t('revenue'))}${lth('n', t('deals_won'))}${lth('wr', t('win_rate'))}${lth('avg', t('rep_avg'))}${lth('acts', t('activities'))}${lth('pipe', t('open_pipeline'))}</tr></thead><tbody>
        ${lb.map((x, i) => `<tr class="static"><td><div class="who"><span class="rank">${i + 1}</span>${avatar(x.o)}<span class="strong">${esc(x.o)}</span></div></td>
          <td class="num"><div class="lb-rev"><span class="lb-bar"><span style="width:${((x.rev / maxRev) * 100).toFixed(1)}%;background:${ownerColor(x.o)}"></span></span><b>${money(x.rev, true)}</b></div></td>
          <td class="num">${num(x.n)}</td><td class="num">${x.wr == null ? '—' : pct(x.wr)}</td><td class="num">${x.avg ? money(x.avg, true) : '—'}</td><td class="num">${num(x.acts)}</td><td class="num">${money(x.pipe, true)}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  };

  // ---------------------------------------------------------------- settings
  views.settings = () => {
    const colors = ['#4fd1c5', '#7cb7f5', '#a78bfa', '#f6c56b', '#f48a8a', '#6ee7a8', '#f59ec9', '#ff9f5a'];
    return head(t('settings'), t('settings_sub')) + `<div class="set-grid">
      <div class="card card-pad"><div class="card-head"><h3>${t('brand_sec')}</h3></div><div class="form-grid">
        <div class="field"><label for="sBrand">${t('brand_name')}</label><input id="sBrand" value="${esc(prefs.brand)}" autocomplete="off"/></div>
        <div class="field"><label for="sCompany">${t('biz_name')}</label><input id="sCompany" value="${esc(prefs.company)}" autocomplete="off"/></div>
        <div class="field full"><label>${t('accent')}</label><div class="swatches">${colors.map((c) => `<button class="swatch ${prefs.accent.toLowerCase() === c ? 'on' : ''}" data-act="accent:${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}
          <label class="swatch custom ${colors.includes(prefs.accent.toLowerCase()) ? '' : 'on'}" data-tip="${esc(CH.tip(t('custom_color')))}"><input type="color" id="sColor" value="${esc(prefs.accent)}"/>${ic('plus', 14)}</label></div></div>
        <div class="field full"><label>${t('theme')}</label>${seg('theme', [['dark', `${ic('moon', 14)} ${t('dark')}`], ['light', `${ic('sun', 14)} ${t('light')}`]], prefs.theme)}</div>
      </div></div>
      <div class="card card-pad"><div class="card-head"><h3>${t('regional')}</h3></div><div class="form-grid">
        <div class="field"><label for="sCurrency">${t('currency')}</label><select id="sCurrency">${['USD', 'ARS', 'EUR', 'UYU', 'CLP', 'MXN', 'BRL', 'COP', 'PEN'].map((c) => `<option ${prefs.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label>${t('language')}</label>${seg('lang', [['es', 'Español'], ['en', 'English']], prefs.lang)}</div>
        <div class="field full"><label for="sTarget">${t('target')}</label><input id="sTarget" type="number" min="0" step="1000" value="${prefs.target}"/></div>
      </div></div>
      <div class="card card-pad"><div class="card-head"><h3>${t('pipeline_sec')}</h3></div>
        <div class="stage-list">${C.stages.map((s) => `<div class="stage-item" style="--c:${s.color}"><span class="dot"></span><b>${esc(s[prefs.lang])}</b><span class="muted">${s.prob}%</span></div>`).join('')}</div>
        <p class="hint">${ic('info', 14)} ${t('config_hint')}</p></div>
      <div class="card card-pad"><div class="card-head"><h3>${t('team')}</h3></div>
        ${C.team.map((m) => `<div class="mini-row static">${avatar(m.name)}<div class="t"><span>${esc(m.name)}</span><small>${esc(tr(m.role))}</small></div></div>`).join('')}
        <div class="card-head mt"><h3>${t('data_sec')}</h3></div><p class="muted">${t('data_note')}</p>
        <div class="quick"><button class="btn btn-plain" data-act="export-json">${ic('download', 16)} ${t('export_json')}</button><button class="btn btn-plain" data-act="import-json">${ic('upload', 16)} ${t('import_json')}</button><button class="btn btn-danger" data-act="reset">${ic('refresh', 16)} ${t('reset')}</button></div></div>
    </div>`;
  };

  // ================================================================ drawers
  function openDrawer(html, keepScroll) {
    const d = $('#drawer'), top = d.scrollTop;
    hideTip();
    d.innerHTML = html;
    d.classList.add('open');
    $('#overlay').classList.add('open');
    d.scrollTop = keepScroll ? top : 0;
  }
  function closeDrawer() { $('#drawer').classList.remove('open'); $('#overlay').classList.remove('open'); ui.stack = []; }
  function showRecord(kind, id, push) {
    if (push) ui.stack.push([kind, id]); else ui.stack = [[kind, id]];
    drawRecord(false);
  }
  function drawRecord(keepScroll) {
    const top = ui.stack[ui.stack.length - 1];
    if (!top) return closeDrawer();
    const html = DRAWERS[top[0]] && DRAWERS[top[0]](top[1]);
    if (!html) { ui.stack.pop(); return ui.stack.length ? drawRecord(false) : closeDrawer(); }
    openDrawer(html, keepScroll);
  }
  const refreshDrawer = () => { if ($('#drawer').classList.contains('open')) drawRecord(true); };
  const drTools = (editRef) => `<div class="dr-tools">${editRef ? `<button class="icon-btn" data-edit="${editRef}" aria-label="${t('edit')}" data-tip="${esc(CH.tip(t('edit')))}">${ic('edit', 16)}</button>` : ''}<button class="icon-btn" data-close aria-label="${t('close')}">${ic('x')}</button></div>`;
  const backBtn = () => (ui.stack.length > 1 ? `<button class="icon-btn back" data-back aria-label="${t('back')}">${ic('arrowL', 16)}</button>` : '');
  const dealMini = (d) => `<div class="mini-row" data-open="deal:${d.id}" data-tip-delay data-tip="${esc(dealTip(d))}"><div class="t"><span>${esc(dealProduct(d))}</span><small>${fmtDate(d.closeDate)}</small></div>${stageBadge(d.stage)}<b>${money(d.value, true)}</b></div>`;
  const composer = (cid) => `<form class="composer" data-note="${cid}" autocomplete="off">
      <div class="seg sm">${['note', 'call', 'email', 'meeting'].map((k, i) => `<label class="seg-radio"><input type="radio" name="type" value="${k}" ${i === 0 ? 'checked' : ''}/><span>${ic(k, 13)} ${t('ac_' + k)}</span></label>`).join('')}</div>
      <div class="composer-row"><input name="text" placeholder="${t('add_note')}" required aria-label="${t('add_note')}"/><button class="btn btn-primary sm">${t('log')}</button></div></form>`;
  const kv = (rows) => `<dl class="kv">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  const stats = (rows) => `<div class="dr-stats">${rows.map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>`;

  const DRAWERS = {
    contact(id) {
      const c = byId('contacts', id);
      if (!c) return null;
      const deals = db.deals.filter((d) => d.contactId === id), open = deals.filter(isOpen);
      const tasks = db.tasks.filter((x) => x.contactId === id && !x.done).sort((a, b) => a.due.localeCompare(b.due));
      const acts = db.activities.filter((a) => a.contactId === id);
      return `<div class="dr-head">${backBtn()}${avatar(c.name, 'lg', 'var(--accent)')}<div class="dr-title"><h2>${esc(c.name)}</h2><p>${esc(tr(c.title))} · <a data-open="company:${c.companyId}">${esc(coName(c.companyId))}</a></p><div class="dr-tags">${statusBadge(c.status)}${c.tags.map(tagChip).join('')}</div></div>${drTools('contact:' + c.id)}</div>
        <div class="dr-sec"><div class="quick">
          <a class="btn btn-ghost sm" href="tel:${esc(c.phone)}" data-stop>${ic('call', 15)} ${t('call')}</a>
          <a class="btn btn-ghost sm" href="mailto:${esc(c.email)}" data-stop>${ic('email', 15)} ${t('send_email')}</a>
          <a class="btn btn-ghost sm" href="https://wa.me/${String(c.phone || '').replace(/\D/g, '')}" target="_blank" rel="noopener" data-stop>${ic('chat', 15)} WhatsApp</a>
          <button class="btn btn-plain sm" data-new="task" data-contact="${c.id}">${ic('plus', 15)} ${t('task')}</button>
          <button class="btn btn-plain sm" data-new="deal" data-contact="${c.id}">${ic('plus', 15)} ${t('deal')}</button></div></div>
        ${stats([[t('open_deals'), money(sum(open, (d) => d.value), true)], [t('won'), money(sum(deals.filter((d) => d.stage === 'won'), (d) => d.value), true)], [t('last_touch'), relDays(c.lastContact)]])}
        <div class="dr-sec"><h4>${t('details')}</h4>${kv([[t('email'), `<a href="mailto:${esc(c.email)}" data-stop>${esc(c.email)}</a>`], [t('phone'), esc(c.phone)], [t('owner'), `<span class="who sm">${avatar(c.owner, 'xs')} ${esc(c.owner)}</span>`], [t('source'), t('src_' + c.source)], [t('created'), c.created ? fullDate(c.created) : '—'], [t('last_contact'), fullDate(c.lastContact)]])}</div>
        <div class="dr-sec"><h4>${t('open_tasks')} <span class="n">${tasks.length}</span></h4>${tasks.map(miniTask).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>
        <div class="dr-sec"><h4>${t('deals_n')} <span class="n">${deals.length}</span></h4>${deals.map(dealMini).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>
        <div class="dr-sec"><h4>${t('activity')}</h4>${composer(c.id)}<ul class="feed timeline">${acts.slice(0, 25).map((a) => feedItem(a, true)).join('')}</ul></div>`;
    },
    company(id) {
      const c = byId('companies', id);
      if (!c) return null;
      const people = db.contacts.filter((x) => x.companyId === id).sort(byName), deals = db.deals.filter((x) => x.companyId === id);
      const open = deals.filter(isOpen);
      return `<div class="dr-head">${backBtn()}<span class="co-logo lg">${esc(initials(c.name))}</span><div class="dr-title"><h2>${esc(c.name)}</h2><p>${esc(tr(c.industry))} · ${esc(c.city)}</p></div>${drTools('company:' + c.id)}</div>
        <div class="dr-sec"><div class="quick"><button class="btn btn-ghost sm" data-new="contact" data-company="${c.id}">${ic('plus', 15)} ${t('new_contact')}</button><button class="btn btn-ghost sm" data-new="deal" data-company="${c.id}">${ic('plus', 15)} ${t('new_deal')}</button></div></div>
        ${stats([[t('revenue'), money(sum(deals.filter((d) => d.stage === 'won'), (d) => d.value), true)], [t('open_pipeline'), money(sum(open, (d) => d.value), true)], [t('people'), num(people.length)]])}
        <div class="dr-sec"><h4>${t('details')}</h4>${kv([[t('website'), `<a href="https://${esc(c.website)}" target="_blank" rel="noopener" data-stop>${esc(c.website)}</a>`], [t('industry'), esc(tr(c.industry))], [t('size'), esc(c.size)], [t('city'), esc(c.city)], [t('owner'), `<span class="who sm">${avatar(c.owner, 'xs')} ${esc(c.owner)}</span>`]])}</div>
        <div class="dr-sec"><h4>${t('people')} <span class="n">${people.length}</span></h4>${people.map((p) => `<div class="mini-row" data-open="contact:${p.id}">${avatar(p.name, '', 'var(--accent)')}<div class="t"><span>${esc(p.name)}</span><small>${esc(tr(p.title))}</small></div>${statusBadge(p.status)}</div>`).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>
        <div class="dr-sec"><h4>${t('deals_n')} <span class="n">${deals.length}</span></h4>${deals.map(dealMini).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>`;
    },
    deal(id) {
      const d = byId('deals', id);
      if (!d) return null;
      const steps = C.stages.filter((s) => s.id !== 'lost');
      const curIdx = d.stage === 'lost' ? steps.findIndex((s) => s.id === d.lostStage) : steps.findIndex((s) => s.id === d.stage);
      const open = isOpen(d), late = open && daysFrom(d.closeDate) < 0;
      const tasks = db.tasks.filter((x) => x.contactId === d.contactId && !x.done);
      const stepper = `<div class="stepper ${d.stage === 'lost' ? 'lost' : ''}">${steps.map((s, i) => `<button class="step ${i <= curIdx ? 'on' : ''} ${s.id === d.stage ? 'cur' : ''}" data-act="move:${d.id}:${s.id}" style="--c:${d.stage === 'lost' ? 'var(--bad)' : stageColor(d.stage)}" data-tip="${esc(CH.tip(s[prefs.lang], [[s.color, t('prob'), s.prob + '%']], s.id === d.stage ? '' : t('click_move')))}"><span class="bar"></span><small>${esc(s[prefs.lang])}</small></button>`).join('')}</div>`;
      return `<div class="dr-head">${backBtn()}<span class="co-logo lg" style="--c:${stageColor(d.stage)}">${ic('deals', 22)}</span><div class="dr-title"><h2>${esc(dealProduct(d))}</h2><p><a data-open="company:${d.companyId}">${esc(coName(d.companyId))}</a></p><div class="dr-tags">${stageBadge(d.stage)}<b class="dr-value">${money(d.value)}</b></div></div>${drTools('deal:' + d.id)}</div>
        <div class="dr-sec"><h4>${t('stage')}</h4>${stepper}
          <div class="quick">${d.stage !== 'won' ? `<button class="btn btn-good sm" data-act="move:${d.id}:won">${ic('check', 15)} ${t('mark_won')}</button>` : ''}${d.stage !== 'lost' ? `<button class="btn btn-danger sm" data-act="move:${d.id}:lost">${ic('x', 15)} ${t('mark_lost')}</button>` : ''}<button class="btn btn-plain sm" data-new="task" data-contact="${d.contactId}">${ic('plus', 15)} ${t('task')}</button></div></div>
        ${stats(open
          ? [[t('prob'), Math.round(prob(d.stage) * 100) + '%'], [cap(t('weighted')), money(d.value * prob(d.stage), true)], [t('days_in_stage'), num(stageAge(d))]]
          : [[t('value'), money(d.value, true)], [t('close_date'), fmtDate(d.closeDate)], [t('created'), d.created ? fmtDate(d.created) : '—']])}
        <div class="dr-sec"><h4>${t('details')}</h4>${kv([
          [t('contact'), `<a data-open="contact:${d.contactId}">${esc(ctName(d.contactId))}</a>`],
          [t('owner'), `<span class="who sm">${avatar(d.owner, 'xs')} ${esc(d.owner)}</span>`],
          [t('close_date'), `<span class="${late ? 'down' : ''}">${fullDate(d.closeDate)} · ${relDays(d.closeDate)}</span>`],
          [t('created'), d.created ? fullDate(d.created) : '—'],
        ].concat(d.stage === 'lost' && d.lostReason ? [[t('lost_reason'), `<span class="down">${t('lr_' + d.lostReason)}</span>`]] : []))}</div>
        <div class="dr-sec"><h4>${t('open_tasks')} <span class="n">${tasks.length}</span></h4>${tasks.map(miniTask).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>
        <div class="dr-sec"><h4>${t('activity')}</h4><ul class="feed">${db.activities.filter((a) => a.contactId === d.contactId).slice(0, 6).map((a) => feedItem(a)).join('') || `<li class="muted sm">${t('no_items')}</li>`}</ul></div>
        <div class="dr-sec"><button class="btn btn-danger sm" data-act="delete:deal:${d.id}">${ic('trash', 15)} ${t('delete')}</button></div>`;
    },
    month(mk) {
      if (!/^\d{4}-\d{2}$/.test(mk)) return null;
      const list = wonIn(mk).sort((a, b) => b.value - a.value), tot = sum(list, (d) => d.value);
      const ownerRows = team().map((o) => { const v = sum(list.filter((d) => d.owner === o), (d) => d.value); return { label: o, value: v, display: money(v, true), color: ownerColor(o) }; }).filter((r) => r.value);
      return `<div class="dr-head">${backBtn()}<span class="co-logo lg">${ic('money', 22)}</span><div class="dr-title"><h2>${monthLong(mk)}</h2><p>${t('month_detail')}</p></div>${drTools()}</div>
        ${stats([[t('revenue'), money(tot, true)], [t('deals_won'), num(list.length)], [t('rep_avg'), list.length ? money(tot / list.length, true) : '—']])}
        ${ownerRows.length ? `<div class="dr-sec"><h4>${t('owner')}</h4>${CH.hbars(ownerRows)}</div>` : ''}
        <div class="dr-sec"><h4>${t('deals_n')}</h4>${list.map((d) => `<div class="mini-row" data-open="deal:${d.id}">${avatar(d.owner, 'xs')}<div class="t"><span>${esc(dealProduct(d))}</span><small>${esc(coName(d.companyId))} · ${fmtDate(d.closeDate)}</small></div><b>${money(d.value)}</b></div>`).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>`;
    },
    day(key) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
      const items = dayItems(key);
      return `<div class="dr-head">${backBtn()}<span class="co-logo lg">${ic('calendar', 22)}</span><div class="dr-title"><h2>${longDate(key)}</h2><p>${relDays(key)}</p></div>${drTools()}</div>
        <div class="dr-sec"><div class="quick"><button class="btn btn-ghost sm" data-new="event" data-date="${key}">${ic('plus', 15)} ${t('new_event')}</button></div></div>
        <div class="dr-sec day-list">${items.map(calChip).join('') || `<p class="muted sm">${t('no_items')}</p>`}</div>`;
    },
  };

  // ================================================================ modals and forms
  function openModal(html, size = '') {
    const card = $('#modalCard');
    card.className = 'modal-card ' + size;
    card.innerHTML = html;
    $('#modal').classList.add('open');
    hideTip();
    setTimeout(() => { const f = card.querySelector('input:not([type=hidden]):not([type=radio]), select'); if (f) f.focus(); }, 60);
  }
  const closeModal = () => $('#modal').classList.remove('open');
  function closeAll() { closeModal(); closeDrawer(); closeDDs(); }
  function confirmModal(text, yes) {
    openModal(`<h2>${esc(text)}</h2><div class="modal-actions"><button class="btn btn-plain" data-close-modal>${t('cancel')}</button><button class="btn btn-danger-solid" id="confirmYes">${t('confirm')}</button></div>`, 'sm');
    $('#confirmYes').onclick = () => { closeModal(); yes(); };
  }

  const opts = (list, sel, label = (x) => x.name) => list.map((x) => `<option value="${esc(x.id)}" ${x.id === sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  const strOpts = (list, sel, lab = (x) => x) => list.map((x) => `<option value="${esc(x)}" ${x === sel ? 'selected' : ''}>${esc(lab(x))}</option>`).join('');
  const field = (label, inner, full) => `<div class="field ${full ? 'full' : ''}"><label>${label}</label>${inner}</div>`;
  const sortedContacts = () => db.contacts.slice().sort(byName);
  const sortedCompanies = () => db.companies.slice().sort(byName);
  const FORMS = {
    contact: (r) => [t(r.id ? 'edit' : 'new_contact'),
      field(t('name') + ' *', `<input name="name" required value="${esc(r.name)}"/>`, true) +
      field(t('email') + ' *', `<input name="email" type="email" required value="${esc(r.email)}"/>`) +
      field(t('phone'), `<input name="phone" value="${esc(r.phone)}"/>`) +
      field(t('company'), `<select name="companyId">${opts(sortedCompanies(), r.companyId)}</select>`) +
      field(t('title'), `<input name="title" value="${esc(tr(r.title))}"/>`) +
      field(t('status'), `<select name="status">${strOpts(STATUSES, r.status || 'lead', (s) => t('st_' + s))}</select>`) +
      field(t('owner'), `<select name="owner">${strOpts(team(), r.owner || C.user.name)}</select>`) +
      field(t('source'), `<select name="source">${strOpts(SOURCES, r.source || 'web', (s) => t('src_' + s))}</select>`)],
    company: (r) => [t(r.id ? 'edit' : 'new_company'),
      field(t('name') + ' *', `<input name="name" required value="${esc(r.name)}"/>`, true) +
      field(t('industry'), `<input name="industry" value="${esc(tr(r.industry))}"/>`) +
      field(t('city'), `<input name="city" value="${esc(r.city)}"/>`) +
      field(t('website'), `<input name="website" value="${esc(r.website)}"/>`) +
      field(t('size'), `<select name="size">${strOpts(['1-10', '11-50', '51-200', '201-500', '500+'], r.size || '11-50')}</select>`) +
      field(t('owner'), `<select name="owner">${strOpts(team(), r.owner || C.user.name)}</select>`, true)],
    deal: (r) => [t(r.id ? 'edit' : 'new_deal'),
      field(t('name') + ' *', `<input name="title" required value="${esc(r.title ? tr(r.title) : '')}"/>`, true) +
      field(t('value') + ' *', `<input name="value" type="number" min="0" step="500" required value="${esc(r.value)}"/>`) +
      field(t('stage'), `<select name="stage">${opts(C.stages, r.stage || 'lead', (s) => s[prefs.lang])}</select>`) +
      field(t('contact'), `<select name="contactId">${opts(sortedContacts(), r.contactId)}</select>`) +
      field(t('company'), `<select name="companyId">${opts(sortedCompanies(), r.companyId)}</select>`) +
      field(t('close_date'), `<input name="closeDate" type="date" value="${esc(r.closeDate || addDays(isoToday, 30))}"/>`) +
      field(t('owner'), `<select name="owner">${strOpts(team(), r.owner || C.user.name)}</select>`)],
    task: (r) => [t(r.id ? 'edit' : 'new_task'),
      field(t('task') + ' *', `<input name="title" required value="${esc(r.title ? tr(r.title) : '')}"/>`, true) +
      field(t('due'), `<input name="due" type="date" value="${esc(r.due || isoToday)}"/><div class="quick-dates">${[[0, t('today')], [1, t('tomorrow')], [7, t('next_week')]].map(([n, l]) => `<button type="button" class="chip-btn" data-qd="${n}">${l}</button>`).join('')}</div>`) +
      field(t('priority'), `<select name="priority">${strOpts(['high', 'medium', 'low'], r.priority || 'medium', t)}</select>`) +
      field(t('contact'), `<select name="contactId"><option value="">${t('no_contact')}</option>${opts(sortedContacts(), r.contactId)}</select>`) +
      field(t('owner'), `<select name="owner">${strOpts(team(), r.owner || C.user.name)}</select>`)],
    event: (r) => [t(r.id ? 'edit' : 'new_event'),
      field(t('name') + ' *', `<input name="title" required value="${esc(r.title ? tr(r.title) : '')}"/>`, true) +
      field(t('date'), `<input name="date" type="date" value="${esc(r.date || isoToday)}"/>`) +
      field(t('time'), `<input name="time" type="time" value="${esc(r.time || '10:00')}"/>`) +
      field(t('type'), `<select name="type">${strOpts(['meeting', 'call', 'demo'], r.type || 'meeting', (k) => t(EV_LABEL[k]))}</select>`) +
      field(t('contact'), `<select name="contactId">${opts(sortedContacts(), r.contactId)}</select>`)],
  };
  const LIST = { contact: 'contacts', company: 'companies', deal: 'deals', task: 'tasks', event: 'events' };

  function openForm(kind, id, preset) {
    if (!FORMS[kind]) return;
    const rec = id ? byId(LIST[kind], id) : Object.assign({}, preset || {});
    if (!rec) return;
    const [title, fields] = FORMS[kind](rec);
    openModal(`<h2>${title}</h2><form id="recForm" autocomplete="off"><div class="form-grid">${fields}</div>
      <div class="modal-actions">${id ? `<button type="button" class="btn btn-danger" data-act="delete:${kind}:${id}">${ic('trash', 16)} ${t('delete')}</button><span class="sp"></span>` : ''}
      <button type="button" class="btn btn-plain" data-close-modal>${t('cancel')}</button><button class="btn btn-primary">${t('save')}</button></div></form>`);
    const form = $('#recForm');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'contactId' && kind === 'deal') {
        const c = byId('contacts', e.target.value);
        if (c) form.elements.companyId.value = c.companyId;
      }
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-qd]');
      if (b) form.elements.due.value = addDays(isoToday, +b.dataset.qd);
    });
    form.onsubmit = (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if ('value' in data) data.value = Math.max(0, Number(data.value) || 0);
      snap();
      if (id) {
        const prevStage = rec.stage;
        Object.assign(rec, data);
        if (kind === 'deal' && data.stage !== prevStage) {
          rec.stageSince = isoToday;
          if (data.stage === 'won' || data.stage === 'lost') rec.closeDate = isoToday;
        }
      } else {
        const n = Object.assign({ id: uid(kind.slice(0, 2)) }, data);
        if (kind === 'contact') Object.assign(n, { created: isoToday, lastContact: isoToday, tags: [] });
        if (kind === 'deal') Object.assign(n, { created: isoToday, stageSince: isoToday });
        if (kind === 'task') n.done = false;
        db[LIST[kind]].unshift(n);
      }
      persist(); closeModal(); render(); refreshDrawer();
      toast(id ? t('saved') : t('created_toast'), true);
    };
  }
  function deleteRecord(kind, id) {
    if (!LIST[kind]) return;
    snap();
    db[LIST[kind]] = db[LIST[kind]].filter((x) => x.id !== id);
    ui.sel.delete(id);
    persist(); closeModal(); render(); refreshDrawer();
    toast(t('deleted'), true);
  }

  // ================================================================ actions
  function requestMove(id, to) {
    const d = byId('deals', id);
    if (!d || d.stage === to || !stage(to)) return;
    if (to === 'lost') return askLostReason(d);
    applyMove(d, to);
  }
  function askLostReason(d) {
    openModal(`<h2>${t('lost_title')}</h2><p class="muted">${esc(dealName(d))} · ${money(d.value)}</p>
      <form id="lostForm"><div class="reasons">${LOST.map((r, i) => `<label class="reason"><input type="radio" name="r" value="${r}" ${i === 0 ? 'checked' : ''}/><span>${t('lr_' + r)}</span></label>`).join('')}</div>
      <div class="modal-actions"><button type="button" class="btn btn-plain" data-act="lost-cancel">${t('cancel')}</button><button class="btn btn-danger-solid">${t('mark_lost')}</button></div></form>`, 'sm');
    $('#lostForm').onsubmit = (e) => { e.preventDefault(); const r = new FormData(e.target).get('r'); closeModal(); applyMove(d, 'lost', r); };
  }
  function applyMove(d, to, reason) {
    snap();
    const from = d.stage;
    d.stage = to;
    d.stageSince = isoToday;
    if (to === 'won' || to === 'lost') d.closeDate = isoToday;
    if (to === 'lost') { d.lostReason = reason || 'other'; d.lostStage = from; } else { delete d.lostReason; delete d.lostStage; }
    db.activities.unshift({ id: uid('ac'), type: 'deal', text: `${t('moved')} ${stageName(to)}: ${dealProduct(d)}`, contactId: d.contactId, user: C.user.name, at: new Date().toISOString() });
    persist(); render(); refreshDrawer();
    toast(to === 'won' ? t('won_toast') : `${t('moved')} ${stageName(to)}`, true);
    const card = $(`.deal[data-id="${d.id}"]`);
    if (card) card.classList.add('pop');
  }
  function reschedule(kind, id, day) {
    const rec = byId(kind === 'event' ? 'events' : 'tasks', id), key = kind === 'event' ? 'date' : 'due';
    if (!rec || rec[key] === day) return;
    snap();
    rec[key] = day;
    persist(); render();
    toast(`${t('rescheduled')} ${fmtDate(day, { weekday: 'long', day: 'numeric', month: 'short' })}`, true);
  }
  function toggleTask(id) {
    const x = byId('tasks', id);
    if (!x) return;
    snap();
    x.done = !x.done;
    persist(); render(); refreshDrawer();
    if (x.done) toast(t('task_done'), true);
  }
  function logActivity(cid, type, text) {
    snap();
    db.activities.unshift({ id: uid('ac'), type, text, contactId: cid, user: C.user.name, at: new Date().toISOString() });
    const c = byId('contacts', cid);
    if (c) c.lastContact = isoToday;
    persist(); render(); refreshDrawer();
    toast(t('saved'), true);
  }
  function quickTask(f) {
    const fd = new FormData(f), title = String(fd.get('title') || '').trim();
    if (!title) return;
    snap();
    const due = addDays(isoToday, +fd.get('due') || 0);
    const id = uid('tk');
    db.tasks.unshift({ id, title, contactId: fd.get('contactId') || '', due, priority: fd.get('priority') || 'medium', done: false, owner: C.user.name });
    if (!taskGroups()[ui.tTab].some((x) => x.id === id)) ui.tTab = 'pending'; // keep the new task in view
    persist(); render();
    toast(t('created_toast'), true);
    const inp = $('#quickTask input[name="title"]');
    if (inp) inp.focus();
  }
  function bulk(name, arg) {
    const n = ui.sel.size;
    if (name === 'bulk-clear') { ui.sel.clear(); return renderContactTable(); }
    if (name === 'bulk-export') return exportCSV(db.contacts.filter((c) => ui.sel.has(c.id)));
    snap();
    if (name === 'bulk-status') db.contacts.forEach((c) => { if (ui.sel.has(c.id)) c.status = arg; });
    if (name === 'bulk-owner') db.contacts.forEach((c) => { if (ui.sel.has(c.id)) c.owner = arg; });
    if (name === 'bulk-delete') { db.contacts = db.contacts.filter((c) => !ui.sel.has(c.id)); ui.sel.clear(); }
    persist(); render();
    toast(name === 'bulk-delete' ? `${t('deleted')} · ${n}` : t('saved'), true);
  }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportCSV(list) {
    const cols = [['name', t('name')], ['email', t('email')], ['phone', t('phone')], ['title', t('title')], ['company', t('company')], ['status', t('status')], ['owner', t('owner')], ['source', t('source')], ['lastContact', t('last_contact')]];
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const val = (c, k) => (k === 'company' ? coName(c.companyId) : k === 'status' ? t('st_' + c.status) : k === 'source' ? t('src_' + c.source) : tr(c[k]));
    download('contacts.csv', '﻿' + [cols.map((c) => q(c[1])).join(','), ...list.map((c) => cols.map(([k]) => q(val(c, k))).join(','))].join('\n'), 'text/csv;charset=utf-8');
  }
  function importJSON(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.contacts) || !Array.isArray(data.deals)) throw new Error('shape');
        snap();
        db = Object.assign({ companies: [], contacts: [], deals: [], tasks: [], activities: [], events: [] }, data);
        persist(); render(); toast(t('imported'), true);
      } catch (e) { toast(t('import_err')); }
    };
    r.readAsText(file);
  }
  function resetDemo() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    db = clone(window.CRM_SEED);
    prefs = defaults();
    undoSnap = null;
    ui.sel.clear(); ui.dOwners.clear(); ui.rHidden.clear();
    closeAll(); render({ anim: true });
    toast(t('saved'));
  }
  function setPref(k, v) {
    prefs[k] = v;
    persist(); render(); refreshDrawer();
    if ($('#palette').classList.contains('open')) renderPalette();
  }

  function act(a, n) {
    const [name, arg] = split2(a);
    switch (name) {
      case 'undo': return undo();
      case 'search': return openPalette();
      case 'month': return showRecord('month', arg, !!n.closest('#drawer'));
      case 'day': return showRecord('day', arg);
      case 'stage':
        ui.flash = arg; ui.dMode = 'board';
        if (route() === 'deals') return renderDeals();
        location.hash = 'deals';
        return undefined;
      case 'move': { const [id, st] = split2(arg); return requestMove(id, st); }
      case 'delete': { const [k, id] = split2(arg); return deleteRecord(k, id); }
      case 'lost-cancel': closeModal(); return renderDeals();
      case 'owner-toggle':
        if (ui.dOwners.has(arg)) ui.dOwners.delete(arg); else ui.dOwners.add(arg);
        return render();
      case 'series': {
        const j = +arg;
        if (ui.rHidden.has(j)) ui.rHidden.delete(j); else ui.rHidden.add(j);
        return render();
      }
      case 'sel-page': {
        const { slice } = contactPage(), all = slice.length && slice.every((c) => ui.sel.has(c.id));
        slice.forEach((c) => (all ? ui.sel.delete(c.id) : ui.sel.add(c.id)));
        return renderContactTable();
      }
      case 'bulk-status': case 'bulk-owner': case 'bulk-delete': case 'bulk-export': case 'bulk-clear': return bulk(name, arg);
      case 'export-contacts': return exportCSV(contactRows());
      case 'export-json': return download('crm-data.json', JSON.stringify(db, null, 2), 'application/json');
      case 'import-json': return $('#importFile').click();
      case 'accent': prefs.accent = arg; persist(); return render();
      case 'reset': return confirmModal(t('reset_q'), resetDemo);
      default: return undefined;
    }
  }

  // ================================================================ command palette
  let palItems = [];
  const TABS = ['dashboard', 'contacts', 'companies', 'deals', 'tasks', 'calendar', 'reports'];
  const go = (k) => { if (route() === k && location.hash) render(); else location.hash = k; };
  function openPalette() {
    closeDDs();
    hideTip();
    $('#palette').classList.add('open');
    const i = $('#palInput');
    i.value = '';
    i.placeholder = t('search');
    ui.palIdx = 0;
    renderPalette();
    setTimeout(() => i.focus(), 30);
  }
  const closePalette = () => $('#palette').classList.remove('open');
  function renderPalette() {
    const q = $('#palInput').value.trim().toLowerCase();
    const match = (s) => !q || String(s).toLowerCase().includes(q);
    const recs = q.length < 2 ? [] : [
      ...db.contacts.filter((c) => match(c.name + ' ' + c.email)).slice(0, 5).map((c) => ({ g: t('contacts'), av: c.name, label: c.name, hint: coName(c.companyId), run: () => showRecord('contact', c.id) })),
      ...db.companies.filter((c) => match(c.name + ' ' + tr(c.industry))).slice(0, 4).map((c) => ({ g: t('companies'), icon: 'companies', label: c.name, hint: tr(c.industry), run: () => showRecord('company', c.id) })),
      ...db.deals.filter((d) => match(dealName(d))).slice(0, 5).map((d) => ({ g: t('deals'), icon: 'deals', label: dealName(d), hint: money(d.value, true), run: () => showRecord('deal', d.id) })),
    ];
    const nav = [...TABS, 'settings'].map((k) => ({ g: t('pal_nav'), icon: k, label: t(k), run: () => go(k) })).filter((x) => match(x.label));
    const acts = [['contact', 'contacts'], ['company', 'companies'], ['deal', 'deals'], ['task', 'tasks'], ['event', 'calendar']]
      .map(([k]) => ({ g: t('pal_actions'), icon: 'plus', label: t('new_' + k), run: () => openForm(k) }))
      .concat([
        { g: t('pal_actions'), icon: prefs.theme === 'dark' ? 'sun' : 'moon', label: t('toggle_theme'), run: () => setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark') },
        { g: t('pal_actions'), icon: 'globe', label: t('switch_lang'), run: () => setPref('lang', prefs.lang === 'es' ? 'en' : 'es') },
      ]).filter((x) => match(x.label));
    palItems = recs.concat(nav, acts);
    ui.palIdx = Math.max(0, Math.min(ui.palIdx, palItems.length - 1));
    let g = null, html = '';
    palItems.forEach((it, i) => {
      if (it.g !== g) { g = it.g; html += `<div class="pal-g">${esc(g)}</div>`; }
      html += `<button class="pal-it ${i === ui.palIdx ? 'on' : ''}" data-pal="${i}">${it.av ? avatar(it.av, 'xs', 'var(--accent)') : `<span class="pal-ic">${ic(it.icon, 16)}</span>`}<span class="pal-l">${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</button>`;
    });
    $('#palList').innerHTML = html || `<div class="pal-empty">${t('no_results')}</div>`;
  }
  function markPal() {
    $$('.pal-it').forEach((b) => b.classList.toggle('on', +b.dataset.pal === ui.palIdx));
    const on = $('.pal-it.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function runPal(i) {
    const it = palItems[i];
    if (!it) return;
    closePalette();
    it.run();
  }
  $('#palette').addEventListener('click', (e) => {
    if (e.target.id === 'palette') return closePalette();
    const b = e.target.closest('[data-pal]');
    if (b) runPal(+b.dataset.pal);
    return undefined;
  });
  $('#palette').addEventListener('pointermove', (e) => {
    const b = e.target.closest('[data-pal]');
    if (b && +b.dataset.pal !== ui.palIdx) { ui.palIdx = +b.dataset.pal; markPal(); }
  });

  // ================================================================ header, notifications, dropdowns
  function notifData() {
    const overdue = db.tasks.filter((x) => !x.done && daysFrom(x.due) < 0);
    const todayT = db.tasks.filter((x) => !x.done && x.due === isoToday);
    const evs = db.events.filter((e) => e.date === isoToday).sort((a, b) => a.time.localeCompare(b.time));
    const closing = db.deals.filter((d) => isOpen(d) && daysFrom(d.closeDate) >= 0 && daysFrom(d.closeDate) <= 7);
    return { overdue, todayT, evs, closing, count: overdue.length + todayT.length + evs.length };
  }
  function renderNotifs() {
    const n = notifData();
    const sec = (title, items) => (items.length ? `<div class="nt-sec"><h5>${title} <span class="n">${items.length}</span></h5>${items.join('')}</div>` : '');
    const item = (ref, icon, cls, title, sub) => `<button class="nt-it" ${ref}><span class="nt-ic ${cls}">${ic(icon, 15)}</span><span class="nt-txt"><b>${title}</b><small>${sub}</small></span></button>`;
    const body =
      sec(t('overdue'), n.overdue.map((x) => item(`data-edit="task:${x.id}"`, 'alert', 'bad', esc(tr(x.title)), `${esc(ctName(x.contactId))} · ${relDays(x.due)}`))) +
      sec(t('today'), n.evs.map((e) => item(`data-edit="event:${e.id}"`, 'calendar', '', `${e.time} · ${esc(tr(e.title))}`, `${t(EV_LABEL[e.type])} · ${esc(ctName(e.contactId))}`))
        .concat(n.todayT.map((x) => item(`data-edit="task:${x.id}"`, 'tasks', '', esc(tr(x.title)), `${t('task')} · ${esc(ctName(x.contactId))}`)))) +
      sec(t('closing_week'), n.closing.map((d) => item(`data-open="deal:${d.id}"`, 'deals', 'good', `${esc(dealProduct(d))} · ${money(d.value, true)}`, `${esc(coName(d.companyId))} · ${relDays(d.closeDate)}`)));
    $('#notifs').innerHTML = `<div class="nt-head"><b>${t('notifications')}</b></div>` + (body || `<div class="nt-empty">${ic('check', 18)} ${t('no_notifs')}</div>`);
  }
  function closeDDs() {
    $$('.dd.open').forEach((x) => x.classList.remove('open'));
    $$('[data-dd][aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }
  function toggleDD(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    const wasOpen = el.classList.contains('open');
    closeDDs();
    if (wasOpen) return;
    if (id === 'notifs') renderNotifs();
    el.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    hideTip();
  }
  // Text color that stays readable on top of the accent.
  const inkFor = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#0b1f1d';
    const n = parseInt(m[1], 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? '#0b1f1d' : '#ffffff';
  };
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  function applyBrand() {
    const root = document.documentElement;
    root.dataset.theme = prefs.theme;
    root.style.setProperty('--accent', prefs.accent);
    root.style.setProperty('--accent-ink', inkFor(prefs.accent));
    root.lang = prefs.lang;
    $('#brandName').textContent = prefs.brand;
    $('#companyName').textContent = prefs.company;
    $('#logo').textContent = (prefs.brand.trim()[0] || 'C').toUpperCase();
    $('#userBtn').innerHTML = avatar(C.user.name, 'md');
    $('#userBtn').setAttribute('aria-label', t('menu'));
    $('#searchIc').innerHTML = ic('search', 16);
    $('#searchLbl').textContent = t('search_short');
    $('#searchBtn').setAttribute('aria-label', t('search'));
    $('#searchBtn').setAttribute('data-tip', CH.tip(t('search'), []));
    $('#searchKbd').textContent = isMac ? '⌘K' : 'Ctrl K';
    $('#bellIc').innerHTML = ic('bell', 18);
    $('#bellBtn').setAttribute('aria-label', t('notifications'));
    $('#bellBtn').setAttribute('data-tip', CH.tip(t('notifications'), []));
    $('#userBtn').setAttribute('data-tip', CH.tip(C.user.name, [], `${esc(tr(C.user.role))} · ${esc(prefs.company)}`));
    $('#palIc').innerHTML = ic('search', 18);
    $('#newBtn').innerHTML = `${ic('plus')} <span class="lbl">${t('new')}</span> ${ic('chevD', 14)}`;
    document.title = `${t(route())} · ${prefs.brand}`;
  }
  function renderHeader() {
    const r = route();
    const overdueN = db.tasks.filter((x) => !x.done && daysFrom(x.due) < 0).length;
    const counts = { deals: db.deals.filter(isOpen).length, tasks: db.tasks.filter((x) => !x.done).length };
    const nav = $('#nav');
    nav.innerHTML = TABS.map((k) => `<a href="#${k}" class="tab ${r === k ? 'on' : ''}"${r === k ? ' aria-current="page"' : ''}>${ic(k, 16)}<span>${t(k)}</span>${counts[k] ? `<span class="n ${k === 'tasks' && overdueN ? 'bad' : ''}">${counts[k]}</span>` : ''}</a>`).join('');
    const on = $('.tab.on', nav); // on narrow screens the tab row scrolls: keep the current tab in view
    if (on && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2;
    const nd = notifData(), badge = $('#bellBadge');
    badge.textContent = nd.count > 9 ? '9+' : String(nd.count);
    badge.hidden = !nd.count;
    $('#newMenu').innerHTML = [['contact', 'contacts'], ['company', 'companies'], ['deal', 'deals'], ['task', 'tasks'], ['event', 'calendar']]
      .map(([k, icn]) => `<button class="dd-item" data-new="${k}">${ic(icn, 16)} ${t('new_' + k)}</button>`).join('');
    $('#userMenu').innerHTML = `<div class="um-head">${avatar(C.user.name, 'md')}<div><b>${esc(C.user.name)}</b><small>${esc(tr(C.user.role))} · ${esc(prefs.company)}</small></div></div>
      <a class="dd-item" href="#settings">${ic('settings', 16)} ${t('settings')}</a>
      <div class="um-row"><span>${t('theme')}</span>${seg('theme', [['dark', ic('moon', 14), t('dark')], ['light', ic('sun', 14), t('light')]], prefs.theme, 'sm')}</div>
      <div class="um-row"><span>${t('language')}</span>${seg('lang', [['es', 'ES'], ['en', 'EN']], prefs.lang, 'sm')}</div>
      <button class="dd-item danger" data-act="reset">${ic('refresh', 16)} ${t('reset')}</button>`;
  }

  // ================================================================ render
  const route = () => { const r = (location.hash.slice(1) || 'dashboard').split('/')[0]; return views[r] ? r : 'dashboard'; };
  let animT;
  function render(o = {}) {
    const r = route(), v = $('#view');
    chartDefs.clear();
    curBand = null; curArc = null;
    applyBrand();
    renderHeader();
    v.className = 'view v-' + r;
    v.innerHTML = views[r]();
    if (fills[r]) fills[r]();
    const anim = o.anim && !reduceMotion;
    if (anim) { v.classList.add('anim'); clearTimeout(animT); animT = setTimeout(() => v.classList.remove('anim'), 1500); }
    mountCharts(v);
    if (anim) countUp(v);
    hideTip();
  }

  // ================================================================ events
  const ACTION_SEL = '[data-toggle],[data-sel],[data-act],[data-new],[data-edit],[data-open],[data-seg],[data-sort],[data-dsort],[data-lbsort],[data-page],[data-cal],[data-dd],[data-close],[data-close-modal],[data-back],[data-day]';
  const PARTIAL = {
    actFilter: () => renderFeed(),
    cStatus: () => { ui.cPage = 0; renderContactTable(); },
    coInd: () => renderCompanies(),
    tTab: () => renderTasks(),
  };
  const ANIM_SEGS = { dashRange: 1, rPeriod: 1 };
  function onSeg(key, v) {
    const val = /^\d+$/.test(v) ? +v : v;
    if (key === 'theme' || key === 'lang') return setPref(key, val);
    ui[key] = val;
    if (PARTIAL[key]) { $$(`[data-seg="${key}"]`).forEach((b) => b.classList.toggle('on', b.dataset.v === String(v))); return PARTIAL[key](); }
    return render({ anim: !!ANIM_SEGS[key] });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-stop]')) return undefined;
    const n = e.target.closest(ACTION_SEL);
    if (n && n.hasAttribute('data-dd')) return toggleDD(n.dataset.dd, n);
    const inDD = e.target.closest('.dd');
    if (!inDD || (n && !n.hasAttribute('data-seg'))) closeDDs();
    if (e.target.id === 'overlay') return closeDrawer();
    if (e.target.id === 'modal') return closeModal();
    if (!n) return undefined;
    const ctrl = e.target.closest('input, select, textarea, label');
    if (ctrl && n.contains(ctrl) && ctrl !== n) return undefined; // let form controls inside clickable rows work
    const ds = n.dataset;
    if (ds.toggle) return toggleTask(ds.toggle);
    if (ds.sel) { if (ui.sel.has(ds.sel)) ui.sel.delete(ds.sel); else ui.sel.add(ds.sel); return renderContactTable(); }
    if (ds.act) return act(ds.act, n);
    if (ds.new) {
      const preset = {};
      if (ds.contact) { preset.contactId = ds.contact; const c = byId('contacts', ds.contact); if (c) preset.companyId = c.companyId; }
      if (ds.company) { preset.companyId = ds.company; if (ds.new === 'deal') { const c = db.contacts.find((x) => x.companyId === ds.company); if (c) preset.contactId = c.id; } }
      if (ds.date) preset.date = ds.date;
      if (ds.stage && ds.new === 'deal') preset.stage = ds.stage;
      return openForm(ds.new, null, preset);
    }
    if (ds.edit) { const [k, id] = split2(ds.edit); return openForm(k, id); }
    if (ds.open) { if (dragMoved) return undefined; const [k, id] = split2(ds.open); return showRecord(k, id, !!n.closest('#drawer')); }
    if (ds.seg) return onSeg(ds.seg, ds.v);
    if (ds.sort) { ui.cSort = [ds.sort, ui.cSort[0] === ds.sort ? -ui.cSort[1] : 1]; return renderContactTable(); }
    if (ds.dsort) { ui.dSort = [ds.dsort, ui.dSort[0] === ds.dsort ? -ui.dSort[1] : 1]; return renderDeals(); }
    if (ds.lbsort) { ui.lbSort = ds.lbsort; return render(); }
    if (ds.page) { ui.cPage += +ds.page; return renderContactTable(); }
    if (ds.cal != null) {
      const v = +ds.cal;
      ui.calMonth = v ? new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + v, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
      return render();
    }
    if (n.hasAttribute('data-close')) return closeDrawer();
    if (n.hasAttribute('data-close-modal')) return closeModal();
    if (n.hasAttribute('data-back')) { ui.stack.pop(); return drawRecord(false); }
    if (ds.day) return openForm('event', null, { date: ds.day });
    return undefined;
  });

  document.addEventListener('input', (e) => {
    const el = e.target, id = el.id;
    if (id === 'cQ') { ui.cQ = el.value; ui.cPage = 0; renderContactTable(); }
    else if (id === 'coQ') { ui.coQ = el.value; renderCompanies(); }
    else if (id === 'dQ') { ui.dQ = el.value; renderDeals(); }
    else if (id === 'palInput') { ui.palIdx = 0; renderPalette(); }
    else if (id === 'sColor') { prefs.accent = el.value; applyBrand(); persistSoon(); }
    else if (id === 'sBrand') { prefs.brand = el.value.trim() || C.brand; applyBrand(); persistSoon(); }
    else if (id === 'sCompany') { prefs.company = el.value; applyBrand(); persistSoon(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target, id = el.id;
    if (id === 'cOwner') { ui.cOwner = el.value; ui.cPage = 0; renderContactTable(); }
    else if (id === 'cSize') { ui.cSize = +el.value; ui.cPage = 0; renderContactTable(); }
    else if (id === 'coSort') { ui.coSort = el.value; renderCompanies(); }
    else if (id === 'dWindow') { ui.dWindow = el.value === 'all' ? 'all' : +el.value; renderDeals(); }
    else if (id === 'tOwner') { ui.tOwner = el.value; renderTasks(); }
    else if (id === 'rOwner') { ui.rOwner = el.value; ui.rHidden.clear(); render({ anim: true }); }
    else if (id === 'sCurrency') { prefs.currency = el.value; persist(); render(); toast(t('saved')); }
    else if (id === 'sTarget') { prefs.target = Math.max(0, +el.value) || C.monthlyTarget; persist(); toast(t('saved')); }
    else if (id === 'sColor') { persist(); render(); }
    else if (id === 'importFile') { importJSON(el.files[0]); el.value = ''; }
    else if (el.classList.contains('stage-sel')) requestMove(el.dataset.stageOf, el.value);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'quickTask') { e.preventDefault(); quickTask(f); }
    else if (f.matches('[data-note]')) {
      e.preventDefault();
      const fd = new FormData(f), text = String(fd.get('text') || '').trim();
      if (text) logActivity(f.dataset.note, fd.get('type') || 'note', text);
    }
  });
  document.addEventListener('keydown', (e) => {
    const palOpen = $('#palette').classList.contains('open');
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); return palOpen ? closePalette() : openPalette(); }
    if (palOpen) {
      if (e.key === 'Escape') { e.preventDefault(); return closePalette(); }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && palItems.length) {
        e.preventDefault();
        ui.palIdx = (ui.palIdx + (e.key === 'ArrowDown' ? 1 : -1) + palItems.length) % palItems.length;
        return markPal();
      }
      if (e.key === 'Enter') { e.preventDefault(); return runPal(ui.palIdx); }
      return undefined;
    }
    if (e.key === 'Escape') {
      if ($('.dd.open')) return closeDDs();
      if ($('#modal').classList.contains('open')) return closeModal();
      return closeDrawer();
    }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openPalette(); }
    return undefined;
  });
  window.addEventListener('hashchange', () => { closeAll(); closePalette(); render({ anim: true }); window.scrollTo(0, 0); });

  // ---------------------------------------------------------------- drag and drop (deals board, calendar)
  let drag = null, dragMoved = false;
  const dropZone = (e) => (drag.kind === 'deal' ? e.target.closest('.col-body') : e.target.closest('.cell[data-day]'));
  const endDrag = () => {
    $$('.dragging').forEach((x) => x.classList.remove('dragging'));
    $$('.over').forEach((x) => x.classList.remove('over'));
    document.body.classList.remove('is-dragging');
    drag = null;
    setTimeout(() => { dragMoved = false; }, 60);
  };
  document.addEventListener('dragstart', (e) => {
    const el = e.target instanceof Element && e.target.closest('.deal, [data-drag]');
    if (!el) return;
    hideTip();
    if (el.classList.contains('deal')) drag = { kind: 'deal', id: el.dataset.id };
    else { const [k, id] = split2(el.dataset.drag); drag = { kind: k, id }; }
    dragMoved = true;
    el.classList.add('dragging');
    document.body.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', drag.id);
  });
  document.addEventListener('dragover', (e) => {
    if (!drag) return;
    const zone = dropZone(e);
    if (!zone) return;
    e.preventDefault();
    if (!zone.classList.contains('over')) { $$('.over').forEach((x) => x.classList.remove('over')); zone.classList.add('over'); }
  });
  document.addEventListener('drop', (e) => {
    if (!drag) return;
    const zone = dropZone(e), d = drag;
    endDrag(); // the source node may be re-rendered away, so dragend is not guaranteed to reach us
    if (!zone) return;
    e.preventDefault();
    if (d.kind === 'deal') requestMove(d.id, zone.dataset.stage);
    else reschedule(d.kind, d.id, zone.dataset.day);
  });
  document.addEventListener('dragend', endDrag);

  render({ anim: true });
})();
