// Fig. 3: Kevin's own runs (Strava export, see src/data/runs.json).
// Shared by the server render and the in-page toggle, so both draw the same chart.

export type Run = { date: string; km: number; min: number; pace: number; temp: number | null; elev: number };
export type Mode = 'date' | 'temp' | 'km';

const DAY = 86400000;
const t0 = Date.UTC(2026, 2, 1);
export const xOf = (r: Run, mode: Mode): number | null =>
  mode === 'date' ? (Date.parse(r.date) - t0) / DAY : mode === 'temp' ? r.temp : r.km;

/** Ordinary least squares y = a + b x, with Pearson r. */
export function ols(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const b = sxy / sxx;
  return { a: my - b * mx, b, r: sxy / Math.sqrt(sxx * syy), n };
}

export const fmtPace = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function fitFor(runs: Run[], mode: Mode) {
  const pts = runs.filter((r) => xOf(r, mode) !== null);
  return { pts, ...ols(pts.map((r) => xOf(r, mode)!), pts.map((r) => r.pace)) };
}

const W = 720, H = 300, L = 52, R = 14, T = 14, B = 34;

export function chartSvg(runs: Run[], mode: Mode, lang: 'es' | 'en'): string {
  const { pts, a, b } = fitFor(runs, mode);
  const xs = pts.map((r) => xOf(r, mode)!);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  const pad = (x1 - x0) * 0.04; x0 -= pad; x1 += pad;
  const p0 = 270, p1 = 480; // 4:30 to 8:00 per km; faster is up
  const sx = (v: number) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const sy = (p: number) => T + ((p - p0) / (p1 - p0)) * (H - T - B);

  const grid: string[] = [];
  for (let p = 300; p <= 480; p += 60) {
    grid.push(`<line x1="0" x2="${W - R}" y1="${sy(p)}" y2="${sy(p)}" class="rc-grid"/><text x="2" y="${sy(p) - 4}" class="rc-tick">${fmtPace(p)}</text>`);
  }
  const months = lang === 'es' ? ['mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov'] : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const ticks: [number, string][] =
    mode === 'date' ? months.map((m, i) => [(Date.UTC(2026, 2 + i, 1) - t0) / DAY, m] as [number, string]).filter(([v]) => v >= x0 && v <= x1)
    : mode === 'temp' ? [5, 10, 15, 20, 25, 30].map((v) => [v, `${v} °C`] as [number, string])
    : [2, 4, 6, 8, 10].map((v) => [v, `${v} km`] as [number, string]);
  for (const [v, label] of ticks) grid.push(`<text x="${sx(v)}" y="${H - 12}" class="rc-tick" text-anchor="middle">${label}</text>`);

  const dots = pts.map((r) => {
    const tip = `${r.date} · ${r.km.toFixed(1)} km · ${fmtPace(r.pace)} /km${r.temp !== null ? ` · ${r.temp.toFixed(0)} °C` : ''}`;
    return `<circle cx="${sx(xOf(r, mode)!).toFixed(1)}" cy="${sy(r.pace).toFixed(1)}" r="${(3 + r.km * 0.55).toFixed(1)}" class="rc-dot" tabindex="0" data-tip="${tip}"/>`;
  }).join('');
  const line = `<line x1="${sx(x0)}" y1="${sy(a + b * x0)}" x2="${sx(x1)}" y2="${sy(a + b * x1)}" class="rc-fit"/>`;
  const yLabel = lang === 'es' ? 'ritmo (min/km) · más rápido ↑' : 'pace (min/km) · faster ↑';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${yLabel}">${grid.join('')}<text x="${L}" y="${T - 2}" class="rc-tick rc-ylabel">${yLabel}</text>${line}${dots}</svg>`;
}
