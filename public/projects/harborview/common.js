// Shared helpers for the Harborview pages: language, labels, tooltip, word highlighting, tiny SVG kit.
(function (root) {
  const qs = new URLSearchParams(location.search);
  let lang = qs.get('lang') === 'en' ? 'en' : 'es';

  const TRADES = ['plumbing', 'electrical', 'hvac', 'appliance', 'pest', 'doors_windows', 'general'];
  const TRADE = {
    es: { plumbing: 'Plomería', electrical: 'Electricidad', hvac: 'Calefacción / AC', appliance: 'Electrodomésticos', pest: 'Plagas', doors_windows: 'Puertas y ventanas', general: 'General' },
    en: { plumbing: 'Plumbing', electrical: 'Electrical', hvac: 'Heating / AC', appliance: 'Appliances', pest: 'Pests', doors_windows: 'Doors & windows', general: 'General' },
  };
  const RULE = {
    es: { 'active leak / flooding': 'Pérdida activa / inundación', sewage: 'Cloaca', 'no water': 'Sin agua', 'no heat (season only)': 'Sin calefacción (en temporada)',
      'gas / CO': 'Gas / monóxido', 'electrical hazard': 'Riesgo eléctrico', "lockout / door won't lock / broken glass": 'Sin poder entrar / puerta sin traba / vidrio roto', 'ceiling collapse': 'Techo caído' },
    en: { 'active leak / flooding': 'Active leak / flooding', sewage: 'Sewage', 'no water': 'No water', 'no heat (season only)': 'No heat (in season)',
      'gas / CO': 'Gas / carbon monoxide', 'electrical hazard': 'Electrical hazard', "lockout / door won't lock / broken glass": "Locked out / door won't lock / broken glass", 'ceiling collapse': 'Ceiling collapse' },
  };
  const CHANNEL = { es: { portal: 'Portal', app: 'App', email: 'Email', phone: 'Teléfono' }, en: { portal: 'Portal', app: 'App', email: 'Email', phone: 'Phone' } };
  const color = (t) => getComputedStyle(document.documentElement).getPropertyValue('--' + t).trim() || '#888';

  const nf = (x, d = 0) => (x == null || isNaN(x) ? '–' : Number(x).toLocaleString(lang === 'es' ? 'es-AR' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const pct = (x, d = 0) => (x == null || isNaN(x) ? '–' : nf(x * 100, d) + '%');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- tooltip
  let tipEl;
  function tip(html, ev) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
    if (!html) { tipEl.classList.remove('on'); return; }
    tipEl.innerHTML = html; tipEl.classList.add('on');
    const pad = 14, w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > innerHeight - 8) y = ev.clientY - h - pad;
    tipEl.style.left = Math.max(8, x) + 'px'; tipEl.style.top = Math.max(8, y) + 'px';
  }
  function bindTip(el, fn) {
    el.addEventListener('pointermove', (ev) => { const h = fn(ev); tip(h, ev); });
    el.addEventListener('pointerleave', () => tip(null));
  }

  // ---- per-word credit: unigram + half of each bigram it is in + every char piece inside the word
  function wordCredits(text, contrib) {
    const out = [];
    const re = /[\p{L}\p{N}_]+/gu; let m; const toks = [];
    while ((m = re.exec(text))) toks.push({ s: m.index, e: m.index + m[0].length, w: m[0].toLowerCase() });
    // char pieces are built per whitespace-separated chunk; credit them to the chunk's word tokens
    const chunks = []; const cre = /\S+/g; let c;
    while ((c = cre.exec(text))) chunks.push({ s: c.index, e: c.index + c[0].length, w: c[0].toLowerCase() });
    const credit = new Array(toks.length).fill(0);
    const long = toks.map((t, i) => (t.w.length >= 2 ? i : -1)).filter((i) => i >= 0);
    long.forEach((i, k) => {
      const t = toks[i]; const g = contrib.get(t.w); if (g) credit[i] += g.v;
      if (k + 1 < long.length) { const bg = contrib.get(t.w + ' ' + toks[long[k + 1]].w); if (bg) { credit[i] += bg.v / 2; credit[long[k + 1]] += bg.v / 2; } }
    });
    for (const ch of chunks) {
      const w = ' ' + ch.w + ' '; let sum = 0;
      for (let n = 3; n <= 5; n++) { let off = 0; const seen = [];
        seen.push(w.slice(0, n)); while (off + n < w.length) { off++; seen.push(w.slice(off, off + n)); }
        for (const p of seen) { const g = contrib.get(p); if (g && g.kind === 'char') sum += g.v; }
        if (off === 0) break; }
      const inside = toks.map((t, i) => i).filter((i) => toks[i].s >= ch.s && toks[i].e <= ch.e && toks[i].w.length >= 2);
      inside.forEach((i) => (credit[i] += sum / inside.length));
    }
    toks.forEach((t, i) => out.push({ ...t, v: credit[i] }));
    return out;
  }

  // Render text with backgrounds by credit toward `trade` (colour) and underline for emergency evidence.
  function highlight(text, tradeCredits, emCredits, trade) {
    const max = Math.max(0.25, ...tradeCredits.map((t) => Math.abs(t.v)));
    const emMap = new Map((emCredits || []).map((t) => [t.s, t.v]));
    let html = '', last = 0;
    tradeCredits.forEach((t) => {
      html += esc(text.slice(last, t.s));
      const a = Math.min(1, Math.abs(t.v) / max);
      const bg = t.v > 0 ? `color-mix(in srgb, var(--${trade}) ${Math.round(a * 42)}%, transparent)` : `color-mix(in srgb, #8a94a0 ${Math.round(a * 22)}%, transparent)`;
      const ev = emMap.get(t.s) || 0;
      html += `<span class="w${ev > 0.35 ? ' e' : ''}" data-v="${t.v.toFixed(3)}" data-e="${ev.toFixed(3)}" style="background:${bg}">${esc(text.slice(t.s, t.e))}</span>`;
      last = t.e;
    });
    return html + esc(text.slice(last));
  }

  // ---- svg kit
  const NS = 'http://www.w3.org/2000/svg';
  function svg(w, h, cls) { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('width', '100%'); if (cls) s.setAttribute('class', cls); s.style.display = 'block'; return s; }
  function el(name, attrs = {}, parent) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, attrs = {}) { const t = el('text', { x, y, ...attrs }, parent); t.textContent = s; return t; }

  root.HV = { get lang() { return lang; }, setLang(l) { lang = l; const u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang'); history.replaceState(null, '', u); document.documentElement.lang = l; },
    TRADES, trade: (t) => TRADE[lang][t] || t, rule: (r) => RULE[lang][r] || r, channel: (c) => CHANNEL[lang][c] || c, color,
    nf, pct, esc, tip, bindTip, wordCredits, highlight, svg, el, txt };
})(window);
