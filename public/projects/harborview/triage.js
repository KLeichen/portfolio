// Harborview triage engine: a line-by-line port of Kevin's scikit-learn pipeline.
// TF-IDF (words 1-2 + char_wb 3-5, sublinear tf, L2 per block) -> logistic regression,
// plus Lena's emergency rules (accents stripped, near-miss key words snapped).
(function (root) {
  const WORD = /[\p{L}\p{N}_]+/gu;

  function wordFeatures(text) {
    const toks = (text.toLowerCase().match(WORD) || []).filter((w) => w.length >= 2);
    const out = toks.slice();
    for (let i = 0; i + 1 < toks.length; i++) out.push(toks[i] + ' ' + toks[i + 1]);
    return { feats: out, toks };
  }

  function charFeatures(text) {
    const out = [];
    const words = text.toLowerCase().replace(/\s\s+/g, ' ').split(/\s+/).filter(Boolean);
    for (const w0 of words) {
      const w = ' ' + w0 + ' ';
      for (let n = 3; n <= 5; n++) {
        let off = 0;
        out.push(w.slice(off, off + n));
        while (off + n < w.length) { off++; out.push(w.slice(off, off + n)); }
        if (off === 0) break;
      }
    }
    return out;
  }

  // ---- difflib.SequenceMatcher(None, a, b).ratio() (no autojunk below 200 chars)
  function longest(a, b, alo, ahi, blo, bhi, b2j) {
    let bi = alo, bj = blo, bs = 0, j2len = new Map();
    for (let i = alo; i < ahi; i++) {
      const nj = new Map();
      for (const j of b2j.get(a[i]) || []) {
        if (j < blo) continue;
        if (j >= bhi) break;
        const k = (j2len.get(j - 1) || 0) + 1;
        nj.set(j, k);
        if (k > bs) { bi = i - k + 1; bj = j - k + 1; bs = k; }
      }
      j2len = nj;
    }
    while (bi > alo && bj > blo && a[bi - 1] === b[bj - 1]) { bi--; bj--; bs++; }
    while (bi + bs < ahi && bj + bs < bhi && a[bi + bs] === b[bj + bs]) bs++;
    return [bi, bj, bs];
  }
  function ratio(a, b) {
    const b2j = new Map();
    for (let j = 0; j < b.length; j++) { if (!b2j.has(b[j])) b2j.set(b[j], []); b2j.get(b[j]).push(j); }
    let m = 0; const q = [[0, a.length, 0, b.length]];
    while (q.length) {
      const [alo, ahi, blo, bhi] = q.pop();
      const [i, j, k] = longest(a, b, alo, ahi, blo, bhi, b2j);
      if (k) { m += k; if (alo < i && blo < j) q.push([alo, i, blo, j]); if (i + k < ahi && j + k < bhi) q.push([i + k, ahi, j + k, bhi]); }
    }
    return (a.length + b.length) ? 2 * m / (a.length + b.length) : 1;
  }

  function Engine(M) {
    const wIdx = new Map(M.word.terms.map((t, i) => [t, i]));
    const cIdx = new Map(M.char.terms.map((t, i) => [t, i]));
    const nW = M.n_word;
    const tc = M.trade.coef.map((r) => Float32Array.from(r, (x) => x / 1000));
    const ec = Float32Array.from(M.emergency.coef, (x) => x / 1000);
    const rules = Object.fromEntries(Object.entries(M.rules).map(([k, ps]) => [k, ps.map((p) => new RegExp(p))]));
    const keyWords = M.key_words;

    function block(feats, idx, idf, offset) {
      const cnt = new Map();
      for (const f of feats) { const i = idx.get(f); if (i !== undefined) cnt.set(i, (cnt.get(i) || 0) + 1); }
      const v = new Map(); let s = 0;
      for (const [i, c] of cnt) { const x = (1 + Math.log(c)) * idf[i]; v.set(i + offset, x); s += x * x; }
      s = Math.sqrt(s) || 1;
      for (const [i, x] of v) v.set(i, x / s);
      return v;
    }

    function vectorize(text) {
      const { feats } = wordFeatures(text);
      const vw = block(feats, wIdx, M.word.idf, 0);
      const vc = block(charFeatures(text), cIdx, M.char.idf, nW);
      return new Map([...vw, ...vc]);
    }

    function normalise(text) {
      const t = text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
      return t.replace(/[a-z]+/g, (w) => {
        if (w.length < 5 || keyWords.includes(w)) return w;
        let best = keyWords[0], br = -1;
        for (const k of keyWords) { const r = ratio(w, k); if (r > br) { br = r; best = k; } }
        return w[0] === best[0] && br >= 0.85 && Math.abs(w.length - best.length) <= 1 ? best : w;
      });
    }

    function matchRules(text, season = true) {
      const t = normalise(text || '');
      const hits = [];
      for (const [k, ps] of Object.entries(rules)) {
        const p = ps.find((re) => re.test(t));
        if (p) hits.push({ cat: k, match: (t.match(p) || [''])[0] });
      }
      return season ? hits : hits.filter((h) => h.cat !== M.heat_cat);
    }

    function classify(text, opts = {}) {
      const season = opts.season !== false;
      const x = vectorize(text || '');
      // trade: one score per class, softmax
      const T = M.trade, scores = T.intercept.slice(), contrib = T.classes.map(() => new Map());
      for (const [i, v] of x) tc.forEach((c, k) => { const w = c[i]; if (w) { scores[k] += w * v; contrib[k].set(i, w * v); } });
      const mx = Math.max(...scores), ex = scores.map((s) => Math.exp(s - mx)), z = ex.reduce((a, b) => a + b, 0);
      const probs = ex.map((e) => e / z);
      const best = probs.indexOf(Math.max(...probs));
      // emergency: text weights + rule columns, sigmoid
      const E = M.emergency, hitsAll = matchRules(text, true), hits = season ? hitsAll : matchRules(text, false);
      let s = E.intercept; const econ = new Map();
      for (const [i, v] of x) { const w = ec[i]; if (w) { s += w * v; econ.set(i, w * v); } }
      const ruleHits = hits.map((h) => h.cat);
      E.cats.forEach((c, k) => { if (ruleHits.includes(c)) s += E.rule_coef[k] * E.rule_value; });
      let pe = 1 / (1 + Math.exp(-s));
      const seasonClamp = !season && hitsAll.some((h) => h.cat === M.heat_cat) && hits.length === 0;
      if (seasonClamp) pe = Math.min(pe, 0.05);
      return {
        trade: T.classes[best], confidence: probs[best], needsReview: probs[best] < T.threshold,
        probs: Object.fromEntries(T.classes.map((c, k) => [c, probs[k]])),
        pEmergency: pe, emergency: pe >= E.threshold, rules: hits, seasonClamp,
        wordContrib: (k) => explain(contrib[T.classes.indexOf(k)]), emergencyContrib: () => explain(econ),
      };
    }

    // Credit each word token: its word/bigram weights plus the char pieces inside it.
    function explain(cmap) {
      const out = new Map();
      for (const [i, v] of cmap) {
        const term = i < nW ? M.word.terms[i] : M.char.terms[i - nW];
        out.set(term, { v, kind: i < nW ? (term.includes(' ') ? 'bigram' : 'word') : 'char' });
      }
      return out;
    }

    return { classify, vectorize, matchRules, normalise, wordFeatures, charFeatures, M, idfOf: (t) => { const i = wIdx.get(t); return i === undefined ? null : M.word.idf[i]; } };
  }

  root.HarborviewTriage = { Engine, wordFeatures, charFeatures, ratio };
})(typeof window !== 'undefined' ? window : globalThis);
