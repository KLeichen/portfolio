// Small SVG chart kit. Every chart is built at the pixel width of its
// container, so text never stretches. Hover behaviour lives in app.js and is
// driven by data attributes: data-tip (tooltip HTML), .band (crosshair column),
// .arc (donut segment) and data-act (click action).
window.CRMCharts = (function () {
  'use strict';
  let gid = 0;
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attr = (k, v) => (v == null || v === '' ? '' : ` ${k}="${esc(v)}"`);
  const f1 = (n) => n.toFixed(1);

  // Tooltip body: a title, rows of [color, label, value] and an optional footer.
  // Title and labels are escaped; values and footer may carry markup.
  function tip(title, rows, foot) {
    return `<div class="tip-t">${esc(title)}</div>` +
      (rows || []).map(([c, l, v]) => `<div class="tip-r"><i${c ? ` style="background:${c}"` : ' class="none"'}></i><span>${esc(l)}</span><b>${v}</b></div>`).join('') +
      (foot ? `<div class="tip-f">${foot}</div>` : '');
  }

  // Round an axis maximum up to a value that splits into four clean ticks.
  function niceMax(v) {
    if (!(v > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 1.2, 1.6, 2, 3, 4, 6, 8, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }

  function yGrid(W, pl, pr, y, max, fmtAxis) {
    let s = '';
    for (let g = 0; g <= 4; g++) {
      const v = (max * g) / 4, yy = y(v);
      s += `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${f1(yy)}" y2="${f1(yy)}"/><text class="ax" x="${pl - 8}" y="${f1(yy + 4)}" text-anchor="end">${esc(fmtAxis(v))}</text>`;
    }
    return s;
  }

  // Show every k-th x label, counting back from the last one so it always shows.
  const labelStep = (n, room, min) => Math.max(1, Math.ceil(n / Math.max(1, Math.floor(room / min))));

  // Line/area chart with a hover crosshair.
  // o: { width, height, labels, series:[{values, color, fill, dash}], fmtAxis, goal:{value,label}, tips(i), act(i) }
  function line(o) {
    const W = o.width, H = o.height || 240, pl = 58, pr = 18, pt = 18, pb = 30, n = o.labels.length;
    const vals = o.series.flatMap((s) => s.values).filter((v) => v != null);
    if (o.goal) vals.push(o.goal.value);
    const max = niceMax(Math.max(1, ...vals) * 1.04);
    const x = (i) => pl + (n < 2 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1));
    const y = (v) => pt + (1 - v / max) * (H - pt - pb);
    const id = 'lc' + ++gid;
    let s = `<svg class="chart-svg line" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` + yGrid(W, pl, pr, y, max, o.fmtAxis);
    const step = labelStep(n, W - pl - pr, 52);
    o.labels.forEach((l, i) => { if ((n - 1 - i) % step === 0) s += `<text class="ax" x="${f1(x(i))}" y="${H - 9}" text-anchor="middle">${esc(l)}</text>`; });
    if (o.goal) {
      const gy = y(o.goal.value);
      s += `<line class="goal-line" x1="${pl}" x2="${W - pr}" y1="${f1(gy)}" y2="${f1(gy)}"/><text class="goal-label" x="${pl + 6}" y="${f1(gy - 7)}">${esc(o.goal.label)}</text>`;
    }
    s += `<line class="xhair" x1="${pl}" x2="${pl}" y1="${pt}" y2="${H - pb}"/>`;
    o.series.forEach((se, si) => {
      const pts = se.values.map((v, i) => (v == null ? null : [x(i), y(v), i])).filter(Boolean);
      if (!pts.length) return;
      const d = pts.map((p, k) => (k ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join(' ');
      if (se.fill) {
        s += `<defs><linearGradient id="${id}-${si}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${se.color};stop-opacity:.3"/><stop offset="1" style="stop-color:${se.color};stop-opacity:0"/></linearGradient></defs>`;
        s += `<path class="area" d="${d} L${f1(pts[pts.length - 1][0])} ${f1(y(0))} L${f1(pts[0][0])} ${f1(y(0))} Z" fill="url(#${id}-${si})"/>`;
      }
      s += se.dash
        ? `<path class="ln dash" d="${d}" style="stroke:${se.color}"/>`
        : `<path class="ln draw" pathLength="1" d="${d}" style="stroke:${se.color}"/>`;
      pts.forEach((p) => { s += `<circle class="pt" data-i="${p[2]}" cx="${f1(p[0])}" cy="${f1(p[1])}" r="4" style="stroke:${se.color}"/>`; });
    });
    for (let i = 0; i < n; i++) {
      const x0 = i === 0 ? pl - 12 : (x(i - 1) + x(i)) / 2, x1 = i === n - 1 ? W - pr + 12 : (x(i) + x(i + 1)) / 2;
      s += `<rect class="band" data-i="${i}" data-x="${f1(x(i))}" x="${f1(x0)}" y="${pt}" width="${f1(x1 - x0)}" height="${H - pt - pb}"${attr('data-tip', o.tips && o.tips(i))}${attr('data-act', o.act && o.act(i))}/>`;
    }
    return s + '</svg>';
  }

  // Sparkline for KPI cards. o: { width, height, values, color, tips(i) }
  function spark(o) {
    const W = o.width, H = o.height || 40, p = 5, n = o.values.length;
    const def = o.values.filter((v) => v != null);
    if (!def.length) return '';
    const max = Math.max(...def), min = Math.min(...def);
    const x = (i) => p + (i * (W - 2 * p)) / Math.max(1, n - 1);
    const y = (v) => (max === min ? H / 2 : p + (1 - (v - min) / (max - min)) * (H - 2 * p));
    const pts = o.values.map((v, i) => (v == null ? null : [x(i), y(v), i])).filter(Boolean);
    const d = pts.map((q, k) => (k ? 'L' : 'M') + f1(q[0]) + ' ' + f1(q[1])).join(' ');
    const id = 'sp' + ++gid;
    let s = `<svg class="chart-svg spark" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${o.color};stop-opacity:.22"/><stop offset="1" style="stop-color:${o.color};stop-opacity:0"/></linearGradient></defs>`;
    s += `<path class="area" d="${d} L${f1(pts[pts.length - 1][0])} ${H} L${f1(pts[0][0])} ${H} Z" fill="url(#${id})"/>`;
    s += `<line class="xhair" x1="0" x2="0" y1="0" y2="${H}"/>`;
    s += `<path class="ln draw" pathLength="1" d="${d}" style="stroke:${o.color}"/>`;
    pts.forEach((q) => { s += `<circle class="pt" data-i="${q[2]}" cx="${f1(q[0])}" cy="${f1(q[1])}" r="3" style="stroke:${o.color}"/>`; });
    for (let i = 0; i < n; i++) {
      const x0 = i ? (x(i - 1) + x(i)) / 2 : 0, x1 = i === n - 1 ? W : (x(i) + x(i + 1)) / 2;
      s += `<rect class="band" data-i="${i}" data-x="${f1(x(i))}" x="${f1(x0)}" y="0" width="${f1(x1 - x0)}" height="${H}"${attr('data-tip', o.tips && o.tips(i))}/>`;
    }
    return s + '</svg>';
  }

  // Stacked columns. o: { width, height, labels, keys:[{name,color}], rows:[[value per key]], hidden:Set, fmtAxis, fmtVal, tips(i), act(i) }
  function bars(o) {
    const W = o.width, H = o.height || 260, pl = 58, pr = 12, pt = 24, pb = 30, n = o.labels.length;
    const on = o.keys.map((_, j) => !(o.hidden && o.hidden.has(j)));
    const totals = o.rows.map((r) => r.reduce((a, v, j) => a + (on[j] ? v : 0), 0));
    const max = niceMax(Math.max(1, ...totals) * 1.08);
    const y = (v) => pt + (1 - v / max) * (H - pt - pb);
    const slot = (W - pl - pr) / n, bw = Math.max(6, Math.min(46, slot * 0.58));
    let s = `<svg class="chart-svg bars" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` + yGrid(W, pl, pr, y, max, o.fmtAxis);
    const step = labelStep(n, W - pl - pr, 44);
    o.rows.forEach((r, i) => {
      const cx = pl + slot * i + slot / 2;
      let acc = 0, seg = '';
      r.forEach((v, j) => {
        if (!on[j] || !v) return;
        const y1 = y(acc + v), y0 = y(acc);
        seg += `<rect class="grow" x="${f1(cx - bw / 2)}" y="${f1(y1)}" width="${f1(bw)}" height="${f1(Math.max(0, y0 - y1))}" rx="3" style="fill:${o.keys[j].color}"/>`;
        acc += v;
      });
      s += `<g class="bar-g">${seg}`;
      if (slot > 54 && totals[i]) s += `<text class="bar-v" x="${f1(cx)}" y="${f1(y(totals[i]) - 7)}" text-anchor="middle">${esc(o.fmtVal(totals[i]))}</text>`;
      s += `<rect class="hit" x="${f1(pl + slot * i)}" y="${pt - 18}" width="${f1(slot)}" height="${H - pt - pb + 18}"${attr('data-tip', o.tips && o.tips(i))}${attr('data-act', o.act && o.act(i))}/></g>`;
      if ((n - 1 - i) % step === 0) s += `<text class="ax" x="${f1(cx)}" y="${H - 9}" text-anchor="middle">${esc(o.labels[i])}</text>`;
    });
    return s + '</svg>';
  }

  function arcPath(cx, cy, R, r, a0, a1) {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad, ang) => (cx + rad * Math.cos(ang)).toFixed(2) + ' ' + (cy + rad * Math.sin(ang)).toFixed(2);
    return `M${p(R, a0)} A${R} ${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 ${large} 0 ${p(r, a0)} Z`;
  }

  // Donut with hoverable segments; the centre shows the hovered segment.
  // o: { id, size, rows:[{label, value, color, tip}], centerValue, centerLabel }
  function donut(o) {
    const S = o.size || 168, c = S / 2, R = c - 6, r = R - 24;
    const live = o.rows.filter((x) => x.value > 0);
    const total = live.reduce((a, x) => a + x.value, 0) || 1, gap = live.length > 1 ? 0.014 : 0;
    let a = -Math.PI / 2;
    let s = `<svg class="chart-svg donut" id="${o.id}" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" data-dv="${esc(o.centerValue)}" data-dl="${esc(o.centerLabel)}">`;
    if (!live.length) s += `<circle cx="${c}" cy="${c}" r="${(R + r) / 2}" class="ring-bg" style="stroke-width:${R - r}"/>`;
    o.rows.forEach((row, i) => {
      if (!(row.value > 0)) return;
      const span = (row.value / total) * Math.PI * 2;
      const a1 = a + Math.min(span, Math.PI * 2 - 1e-3);
      s += `<path class="arc" data-i="${i}" data-v="${esc(Math.round((row.value / total) * 100) + '%')}" data-l="${esc(row.label)}" d="${arcPath(c, c, R, r, a + gap, a1 - gap)}" style="fill:${row.color}"${attr('data-tip', row.tip)}/>`;
      a += span;
    });
    s += `<text class="dc-v" x="${c}" y="${c + 2}" text-anchor="middle">${esc(o.centerValue)}</text><text class="dc-l" x="${c}" y="${c + 20}" text-anchor="middle">${esc(o.centerLabel)}</text>`;
    return s + '</svg>';
  }

  // Progress ring with an optional second (forecast) arc behind it.
  // o: { size, value, extra, label, sub, tipMain, tipExtra }
  function ring(o) {
    const S = o.size || 132, sw = 12, r = (S - sw) / 2, C = 2 * Math.PI * r, c = S / 2;
    const v = Math.max(0, Math.min(1, o.value || 0)), e = Math.max(0, Math.min(1 - v, o.extra || 0));
    let s = `<svg class="chart-svg ring" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><circle class="ring-bg" cx="${c}" cy="${c}" r="${r}" style="stroke-width:${sw}"/>`;
    if (e > 0.002) s += `<circle class="ring-fc" cx="${c}" cy="${c}" r="${r}" transform="rotate(-90 ${c} ${c})" style="stroke-width:${sw};stroke-dasharray:${f1(C * (v + e))} ${f1(C)}"${attr('data-tip', o.tipExtra)}/>`;
    if (v > 0.002) s += `<circle class="ring-v" cx="${c}" cy="${c}" r="${r}" transform="rotate(-90 ${c} ${c})" style="stroke-width:${sw};stroke-dasharray:${f1(C * v)} ${f1(C)}"${attr('data-tip', o.tipMain)}/>`;
    s += `<text class="ring-t" x="${c}" y="${c + 4}" text-anchor="middle">${esc(o.label)}</text>`;
    if (o.sub) s += `<text class="ring-s" x="${c}" y="${c + 22}" text-anchor="middle">${esc(o.sub)}</text>`;
    return s + '</svg>';
  }

  // Heatmap grid. o: { width, rows:[labels], cols:[labels], values:[[n]], color, tips(r, c) }
  function heatmap(o) {
    const pl = 42, pt = 4, pb = 24, gap = 4, nc = o.cols.length, nr = o.rows.length;
    const cw = (o.width - pl) / nc, ch = Math.min(30, Math.max(16, cw * 0.62));
    const W = o.width, H = pt + nr * ch + pb;
    const max = Math.max(1, ...o.values.flat());
    let s = `<svg class="chart-svg heat" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    o.rows.forEach((rl, r) => {
      s += `<text class="ax" x="${pl - 10}" y="${f1(pt + r * ch + ch / 2 + 4)}" text-anchor="end">${esc(rl)}</text>`;
      o.cols.forEach((_, c) => {
        const v = o.values[r][c];
        const style = v ? `fill:${o.color};fill-opacity:${(0.16 + 0.84 * (v / max)).toFixed(2)}` : 'fill:var(--surface-2)';
        s += `<rect class="cell" x="${f1(pl + c * cw + gap / 2)}" y="${f1(pt + r * ch + gap / 2)}" width="${f1(cw - gap)}" height="${f1(ch - gap)}" rx="4" style="${style}"${attr('data-tip', o.tips(r, c))}/>`;
      });
    });
    const step = labelStep(nc, W - pl, 40);
    o.cols.forEach((cl, c) => { if (c % step === 0) s += `<text class="ax" x="${f1(pl + c * cw + cw / 2)}" y="${H - 6}" text-anchor="middle">${esc(cl)}</text>`; });
    return s + '</svg>';
  }

  // Horizontal bars as HTML rows. rows: [{label, value, display, color, tip, act}]
  function hbars(rows, max) {
    const m = max || Math.max(1, ...rows.map((r) => r.value));
    return '<div class="hbars">' + rows.map((r) =>
      `<div class="hb${r.act ? ' clickable' : ''}"${attr('data-tip', r.tip)}${attr('data-act', r.act)}><span class="hb-l">${esc(r.label)}</span><span class="hb-bar"><span style="width:${f1((r.value / m) * 100)}%;background:${r.color || 'var(--accent)'}"></span></span><b>${r.display}</b></div>`
    ).join('') + '</div>';
  }

  // Funnel: centred bars that narrow by stage, with the step conversion between them.
  // rows: [{label, value, display, conv, color, tip}]
  function funnel(rows) {
    const m = Math.max(1, ...rows.map((r) => r.value));
    return '<div class="funnel">' + rows.map((r, i) =>
      (i && r.conv != null ? `<div class="fn-conv"><span>${r.conv}</span></div>` : '') +
      `<div class="fn-row"${attr('data-tip', r.tip)}><span class="fn-l">${esc(r.label)}</span><span class="fn-track"><span class="fn-bar" style="width:${f1(Math.max(6, (r.value / m) * 100))}%;background:${r.color || 'var(--accent)'}"></span></span><b class="fn-v">${r.display}</b></div>`
    ).join('') + '</div>';
  }

  return { tip, line, spark, bars, donut, ring, heatmap, hbars, funnel, esc };
})();
