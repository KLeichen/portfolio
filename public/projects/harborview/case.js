// Harborview full case study. Rebuilds the whole page on language change; all numbers come from case.json / model.json.
let J, E, M;
const t = (es, en) => (HV.lang === 'es' ? es : en);
const $ = (s, r = document) => r.querySelector(s);
const nf = (x, d) => HV.nf(x, d), pct = (x, d) => HV.pct(x, d), esc = HV.esc;
const N_DOCS = 14638;

// ------------------------------------------------------------------ chart kit
function hbars(host, rows, { max, fmt = (v) => pct(v), w = 640, rowH = 26, labelW = 170, valueW = 60 } = {}) {
  const h = rows.length * rowH + 6, s = HV.svg(w, h); max = max || Math.max(...rows.map((r) => r.v));
  rows.forEach((r, i) => {
    const y = i * rowH + 4, bw = Math.max(1, (w - labelW - valueW) * r.v / max);
    HV.txt(s, labelW - 8, y + rowH / 2 + 1, r.label, { 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': 13 });
    const rect = HV.el('rect', { x: labelW, y: y + 4, width: bw, height: rowH - 10, rx: 3, fill: r.color || 'var(--blue)' }, s);
    HV.txt(s, labelW + bw + 6, y + rowH / 2 + 1, fmt(r.v), { 'dominant-baseline': 'middle', 'font-size': 12, 'font-family': 'var(--mono)' });
    if (r.tip) HV.bindTip(rect, () => r.tip);
  });
  s.style.minWidth = Math.min(w, w > 700 ? 620 : 400) + 'px';
  host.appendChild(s); return s;
}

function lines(host, series, xs, { w = 680, h = 260, yfmt = (v) => nf(v), ymax, vline, vlabel, xstep = 1, yLabel } = {}) {
  const L = 46, R = 14, T = 12, B = 30, s = HV.svg(w, h);
  ymax = ymax || (() => { const m = Math.max(...series.flatMap((se) => se.y.filter((v) => v != null))) * 1.08 || 1; const p = 10 ** Math.floor(Math.log10(m)); return [1, 2, 2.5, 4, 5, 8, 10].map((k) => k * p).find((k) => k >= m); })();
  const X = (i) => L + (w - L - R) * i / Math.max(1, xs.length - 1), Y = (v) => T + (h - T - B) * (1 - v / ymax);
  for (let k = 0; k <= 4; k++) { const v = ymax * k / 4; HV.el('line', { x1: L, x2: w - R, y1: Y(v), y2: Y(v), class: 'gl' }, s); HV.txt(s, L - 6, Y(v) + 4, yfmt(v), { 'text-anchor': 'end', 'font-size': 11 }); }
  xs.forEach((x, i) => { if (i % xstep === 0) HV.txt(s, X(i), h - 10, x, { 'text-anchor': i === 0 ? 'start' : i === xs.length - 1 ? 'end' : 'middle', 'font-size': 11 }); });
  if (yLabel) HV.txt(s, 4, 10, yLabel, { 'font-size': 11 });
  if (vline != null) { HV.el('line', { x1: X(vline), x2: X(vline), y1: T, y2: h - B, stroke: 'var(--ink)', 'stroke-dasharray': '4 4' }, s); if (vlabel) HV.txt(s, X(vline) + 5, T + 10, vlabel, { 'font-size': 11, fill: 'var(--ink)' }); }
  series.forEach((se) => {
    const pts = se.y.map((v, i) => (v == null ? null : [X(i), Y(v)])).filter(Boolean);
    HV.el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: se.color, 'stroke-width': se.width || 2.2, 'stroke-dasharray': se.dash || '', 'stroke-linejoin': 'round', opacity: se.opacity || 1 }, s);
  });
  const hover = HV.el('rect', { x: L, y: T, width: w - L - R, height: h - T - B, fill: 'transparent' }, s);
  const guide = HV.el('line', { y1: T, y2: h - B, stroke: 'var(--muted)', opacity: 0 }, s);
  HV.bindTip(hover, (ev) => {
    const r = s.getBoundingClientRect(), x = (ev.clientX - r.left) * w / r.width, i = Math.max(0, Math.min(xs.length - 1, Math.round((x - L) / ((w - L - R) / Math.max(1, xs.length - 1)))));
    guide.setAttribute('x1', X(i)); guide.setAttribute('x2', X(i)); guide.setAttribute('opacity', .6);
    return `<b>${esc(xs[i])}</b><br>` + series.filter((se) => !se.noTip).map((se) => `<span style="color:${se.color === 'var(--grid)' ? '#bbb' : se.color}">■</span> ${esc(se.name)}: <b>${se.y[i] == null ? '–' : yfmt(se.y[i])}</b>${se.extra ? ' ' + se.extra(i) : ''}`).join('<br>');
  });
  hover.addEventListener('pointerleave', () => guide.setAttribute('opacity', 0));
  s.style.minWidth = Math.min(w, 420) + 'px';
  host.appendChild(s); return s;
}

function heat(host, rows, cols, val, { color, tipFn, cellW, cellH = 24, labelW = 190, colLabelH = 60, w, fmt = (v) => nf(v), showVal = true, rotate = true } = {}) {
  cellW = cellW || Math.max(26, ((w || 700) - labelW) / cols.length);
  const W = labelW + cellW * cols.length + (rotate ? 50 : 0), H = colLabelH + cellH * rows.length, s = HV.svg(W, H);
  cols.forEach((c, j) => { const x = labelW + cellW * j + cellW / 2; HV.txt(s, x, colLabelH - 8, c, rotate ? { transform: `rotate(-40 ${x} ${colLabelH - 8})`, 'font-size': 11 } : { 'text-anchor': 'middle', 'font-size': 11 }); });
  rows.forEach((r, i) => {
    HV.txt(s, labelW - 8, colLabelH + cellH * i + cellH / 2 + 4, r, { 'text-anchor': 'end', 'font-size': 12 });
    cols.forEach((c, j) => {
      const v = val(i, j); const rect = HV.el('rect', { x: labelW + cellW * j + 1, y: colLabelH + cellH * i + 1, width: cellW - 2, height: cellH - 2, rx: 3, fill: color(v, i, j) }, s);
      if (showVal && v != null) HV.txt(s, labelW + cellW * j + cellW / 2, colLabelH + cellH * i + cellH / 2 + 4, fmt(v, i, j), { 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': 'var(--mono)', fill: 'var(--ink)', 'pointer-events': 'none' });
      if (tipFn) HV.bindTip(rect, () => tipFn(i, j, v));
    });
  });
  s.style.minWidth = Math.round(Math.min(W, 420 + cols.length * 18)) + 'px';
  host.appendChild(s); return s;
}
const mix = (c, a) => `color-mix(in srgb, ${c} ${Math.round(Math.max(0, Math.min(1, a)) * 100)}%, var(--card))`;

// ------------------------------------------------------------------ sections
const SECTIONS = () => [
  ['problema', t('El problema', 'The problem')], ['datos', t('Datos y limpieza', 'Data & cleaning')], ['piden', t('Qué piden', 'What they ask')],
  ['nlp', t('NLP paso a paso', 'NLP step by step')], ['emergencias', t('Emergencias', 'Emergencies')], ['esperas', t('Esperas', 'Waiting')],
  ['proveedores', t('Proveedores', 'Vendors')], ['resultado', t('Resultado', 'Result')], ['mesa', t('Probalo', 'Try it')],
];
const head = (id, n, title) => `${n === '01' ? '' : '</section>'}<section id="${id}"><div class="sh"><span class="n">${n}</span><h2>${title}</h2></div>`;

function render() {
  const O = J.overview, G = J.gold, EM = J.emergency, W = J.wait, V = J.vendors.did;
  document.title = t('Triage de pedidos de mantenimiento · Kevin Leichen', 'Maintenance request triage · Kevin Leichen');
  $('#home').href = HV.lang === 'en' ? '/en/projects/triage-mantenimiento/' : '/proyectos/triage-mantenimiento/';
  $('#tabs').innerHTML = SECTIONS().map(([id, l]) => `<a href="#${id}" data-s="${id}">${l}</a>`).join('');
  const missedEm = EM.intake_missed;
  $('#app').innerHTML = `
  <header class="hero">
    <div class="kicker">${t('Caso completo · NLP · Operaciones', 'Full case study · NLP · Operations')} · Harborview Residential</div>
    <h1>${t('Leer 700 pedidos de mantenimiento por mes para que ninguna emergencia espere hasta la mañana', 'Reading 700 maintenance requests a month so no emergency waits until morning')}</h1>
    <p class="lede">${t('Una administradora de 18 edificios recibía pedidos por portal, app, email y teléfono, en inglés y en español. Dos personas los leían a mano para decidir el oficio y si era una emergencia, y 4 de cada 10 emergencias quedaban en la cola normal. Construí un modelo de texto que hace esa lectura al instante, lo evalué contra lo que el equipo revisó a mano, y de paso encontré un proveedor caro, una caldera fallando y una plaga que sube piso por piso.',
      'A property manager with 18 buildings received requests through a portal, an app, email and phone, in English and Spanish. Two people read them by hand to decide the trade and whether it was an emergency, and 4 in 10 emergencies ended up in the normal queue. I built a text model that does that reading instantly, evaluated it against what the team checked by hand, and along the way found an expensive vendor, a failing boiler and a pest outbreak climbing floor by floor.')}</p>
    <div class="kpis">
      <div class="slip kpi"><b>${pct(G.acc, 1)}</b><span>${t('de oficios correctos en 1.400 pedidos revisados a mano (el menú del portal: 45%)', 'trades right on 1,400 hand-checked requests (the portal dropdown: 45%)')}</span></div>
      <div class="slip kpi"><b class="em">${pct(J.emergency.intake_c.recall)} → ${pct(J.emergency.curve.find((c) => c.th === 0.15).recall_c)}</b><span>${t('de emergencias reales detectadas (recepción hoy → modelo, pedidos revisados a mano)', 'of real emergencies caught (intake today → model, hand-checked requests)')}</span></div>
      <div class="slip kpi"><b>${nf(W.med_missed, 1)} h → ~1 h</b><span>${t('espera mediana de una emergencia que recepción no marcó', 'median wait for an emergency intake missed')}</span></div>
      <div class="slip kpi"><b>32 / 32</b><span>${t('emergencias reales encontradas en el lote nuevo, según la clienta', 'real emergencies found in the new batch, per the client')}</span></div>
    </div>
    <p class="note">${t('Escenario simulado: Harborview, Lena y los datos son ficticios, creados para practicar. El análisis, el código y los modelos son reales.', 'Simulated scenario: Harborview, Lena and the data are fictional, created for practice. The analysis, code and models are real.')}</p>
  </header>

  ${head('problema', '01', t('El problema', 'The problem'))}
    <div class="prose">
      <p class="quote">${t('“Ahora recibimos unos 700 pedidos por mes y las cosas se escapan. El invierno pasado una inquilina esperó hasta la mañana siguiente con agua cayendo del techo, porque su email quedó en la cola normal durante la noche.”', '“Now we get around 700 requests a month, and things slip. Last winter a tenant waited until the next morning with water coming through her ceiling because her email sat in the normal queue overnight.”')}<cite>Lena Okafor, ${t('directora de operaciones', 'Director of Operations')}</cite></p>
      <p>${t('Harborview administra 18 edificios de alquiler (921 departamentos). Todo pedido termina en una sola cola, y alguien tiene que leerlo para decidir dos cosas: <b>qué oficio necesita</b> (plomero, electricista, calefacción…) y <b>si es una emergencia</b> que justifica despertar a la persona de guardia. El menú del portal no ayuda: los inquilinos eligen “Otro” un tercio de las veces. Y uno de cada ocho escribe en español.', 'Harborview manages 18 rental buildings (921 units). Every request lands in one queue, and someone has to read it to decide two things: <b>which trade it needs</b> (plumber, electrician, heating…) and <b>whether it is an emergency</b> worth waking the on-call person. The portal dropdown doesn\'t help: tenants pick “Other” a third of the time. And one in eight writes in Spanish.')}</p>
    </div>
    <div class="card fig flow" id="flow"></div>
    <div class="prose"><p>${t('Lena pidió siete cosas. Las agrupé en tres preguntas que guían el resto de la página:', 'Lena asked for seven things. I grouped them into three questions that drive the rest of this page:')}</p>
    <ol>
      <li><b>${t('¿Una computadora puede leer el pedido como lo lee su equipo?', 'Can a computer read a request the way her team does?')}</b> ${t('Oficio y emergencia, en inglés, en español y en las notas abreviadas de la recepción.', 'Trade and emergency, in English, Spanish and the front desk\'s shorthand notes.')}</li>
      <li><b>${t('¿Cuánto cuesta hoy no hacerlo?', 'What does not doing it cost today?')}</b> ${t('Cuánto esperan las emergencias que nadie marcó.', 'How long the emergencies nobody flagged wait.')}</li>
      <li><b>${t('¿Qué más dicen los pedidos?', 'What else are the requests saying?')}</b> ${t('Edificios con problemas y proveedores que no cumplen.', 'Buildings with problems and vendors that underdeliver.')}</li>
    </ol></div>

  ${head('datos', '02', t('Los datos y la limpieza', 'The data and the clean-up'))}
    <div class="prose"><p>${t(`Seis archivos CSV: ${nf(O.raw_rows)} pedidos (enero 2025 a octubre 2026), ${nf(O.wo)} órdenes de trabajo, 1.400 pedidos que el equipo de Lena etiquetó a mano, 334 pedidos nuevos para clasificar, y las tablas de edificios y departamentos. Los datos estaban ordenados pero no limpios, y cada problema tenía que resolverse antes de que cualquier número signifique algo.`, `Six CSV files: ${nf(O.raw_rows)} requests (January 2025 to October 2026), ${nf(O.wo)} work orders, 1,400 requests Lena's team labelled by hand, 334 new requests to classify, and the building and unit tables. The data was organised but not clean, and each problem had to be fixed before any number meant anything.`)}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t(`De ${nf(O.raw_rows)} filas a ${nf(O.requests)} pedidos reales`, `From ${nf(O.raw_rows)} rows to ${nf(O.requests)} real requests`)}</h4><div id="funnel"></div>
        <p class="cap">${t('Un “reenvío” es el mismo pedido enviado otra vez desde el mismo departamento en menos de 6 horas, con texto casi idéntico. Validación: solo el 1,4% de esas copias recibió su propia orden de trabajo, contra el 97% de pedidos parecidos enviados días después.', 'A “resubmission” is the same request sent again from the same unit within 6 hours, with near-identical text. Check: only 1.4% of those copies got their own work order, against 97% of similar requests sent days later.')}</p></div>
      <div class="card fig"><h4>${t('Hora del día en que llegan los pedidos', 'Hour of day requests arrive')}</h4>
        <div class="seg" id="tzseg" style="margin-bottom:8px"><button data-v="raw">${t('Como vienen', 'As typed')}</button><button data-v="fixed">${t('Corregido', 'Fixed')}</button></div>
        <div id="tz"></div>
        <p class="cap">${t('El portal y la app guardan la hora en UTC; email y teléfono en hora local. Leídas tal cual, el portal parece recibir pedidos a las 3 de la mañana y 614 órdenes de trabajo salen <i>antes</i> de que llegue el pedido. Convertidas a la hora de Nueva York, las cuatro curvas coinciden y esas 614 quedan en cero.', 'The portal and app store times in UTC; email and phone in local time. Read as typed, the portal seems busy at 3 am and 614 work orders go out <i>before</i> the request arrives. Converted to New York time, all four curves line up and those 614 drop to zero.')}</p></div>
    </div>
    <div class="card fig"><h4>${t('Antes y después: el mismo pedido, como llega y como queda', 'Before and after: the same request, as it arrives and as it ends up')}</h4><div class="tbl" id="cleanex"></div></div>
    <div class="row2">
      <div class="card fig"><h4>${t('Un reenvío típico', 'A typical resubmission')}</h4><div id="resub"></div></div>
      <div class="card fig"><h4>${t('18 formas de escribir 8 proveedores', '18 ways to spell 8 vendors')}</h4><div id="vendors-sp"></div></div>
    </div>

  ${head('piden', '03', t('Qué piden los inquilinos de verdad', 'What tenants actually ask for'))}
    <div class="prose"><p>${t('Antes de modelar, miré qué piden. Acá “oficio real” es el de la orden de trabajo: el despachante lo pone después de leer el pedido y acierta 93–95% de las veces, así que sirve para ver patrones.', 'Before modelling, I looked at what tenants ask for. Here “real trade” is the one on the work order: the dispatcher sets it after reading the request and is right 93–95% of the time, so it is good enough to see patterns.')}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('La mezcla real de oficios', 'The real mix of trades')}</h4><div id="mixbars"></div></div>
      <div class="card fig"><h4>${t('Lo que elige el inquilino en el menú vs. lo que era', 'What the tenant picks in the dropdown vs what it was')}</h4><div id="ddmat"></div>
        <p class="cap">${t(`El menú dice “Otro” el ${pct(J.dropdown.other)} de las veces, y cuando elige un oficio acierta el ${pct(J.dropdown.right_when_picked)}. En total, da el oficio correcto en solo el <b>${pct(J.dropdown.right_overall)}</b> de los pedidos del portal y la app. Pasá el mouse para ver los números.`, `The dropdown says “Other” ${pct(J.dropdown.other)} of the time, and when a trade is picked it is right ${pct(J.dropdown.right_when_picked)}. Overall it gives the right trade for only <b>${pct(J.dropdown.right_overall)}</b> of portal and app requests. Hover for the numbers.`)}</p></div>
    </div>
    <div class="card fig"><h4>${t('Pedidos por cada 100 departamentos por año, por edificio y oficio', 'Requests per 100 units per year, by building and trade')}</h4>
      <div class="legend"><span><i style="background:${mix('var(--em)', .75)}"></i>${t('muy por encima del promedio', 'far above average')}</span><span><i style="background:${mix('var(--blue)', .45)}"></i>${t('por debajo', 'below')}</span></div>
      <div class="tbl" id="bheat"></div>
      <p class="cap">${t('El color compara cada celda con el promedio de todos los edificios para ese oficio. Los edificios más viejos (1904–1938) piden casi el doble que los nuevos con bomba de calor. Dos celdas se salen de todo: <b>HV11 en calefacción</b> y <b>HV06 en plagas</b>.', 'Colour compares each cell with the all-building average for that trade. Older buildings (1904–1938) ask almost twice as much as the new heat-pump ones. Two cells stand out from everything: <b>HV11 on heating</b> and <b>HV06 on pests</b>.')}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('HV11 Elmhurst Manor: pedidos de calefacción por mes', 'HV11 Elmhurst Manor: heating requests per month')}</h4><div id="hv11"></div>
        <p class="cap">${t('Por cada 100 departamentos. En cada temporada de calefacción, HV11 tiene 4 a 5 veces los pedidos del resto, y pasa desde enero de 2025. No es mala suerte: es una caldera de vapor de 1962 que no da más.', 'Per 100 units. Every heating season HV11 gets 4–5× the requests of the rest, and it has since January 2025. That is not bad luck: it is a 1962 steam boiler at the end of its life.')}</p></div>
      <div class="card fig"><h4>${t('HV06 Fenwick Place: pedidos de plagas por piso y mes', 'HV06 Fenwick Place: pest requests by floor and month')}</h4><div id="hv06"></div>
        <p class="cap">${t('Desde mayo–junio de 2026 la plaga empieza en los pisos bajos y va subiendo. Fumigar departamento por departamento, como hacía Pestaway, no la frena: hace falta tratar el edificio entero.', 'From May–June 2026 the outbreak starts on the low floors and climbs. Treating unit by unit, as Pestaway did, doesn\'t stop it: the whole building needs treating.')}</p></div>
    </div>

  ${head('nlp', '04', t('NLP paso a paso: cómo una computadora lee un pedido', 'NLP step by step: how a computer reads a request'))}
    <div class="prose">
      <p>${t('Esta es la parte central del proyecto, así que la explico entera y con ejemplos que podés cambiar. Un modelo solo sabe hacer cuentas, entonces el trabajo es convertir cada texto en una fila de números sin perder lo que importa. El camino completo es:', 'This is the heart of the project, so I explain all of it, with examples you can change. A model can only do arithmetic, so the job is to turn each text into a row of numbers without losing what matters. The full path is:')}</p>
      <pre class="code">${t('texto → minúsculas → tokens → vocabulario → conteos → pesos TF-IDF (+ pares de palabras, + fragmentos de letras) → regresión logística → probabilidades', 'text → lowercase → tokens → vocabulary → counts → TF-IDF weights (+ word pairs, + letter pieces) → logistic regression → probabilities')}</pre>
      <p>${t('Escribí un pedido acá arriba (o elegí un ejemplo) y todos los pasos de abajo se recalculan con <b>el mismo modelo que entrené en Python</b>, exportado a JavaScript con los mismos pesos.', 'Type a request up here (or pick an example) and every step below recalculates with <b>the same model I trained in Python</b>, exported to JavaScript with the same weights.')}</p>
    </div>
    <div class="play">
      <label for="pin">${t('Tu pedido de prueba', 'Your test request')}</label>
      <div class="in"><input id="pin" spellcheck="false" autocomplete="off"></div>
      <div class="ex" id="pex"></div>
    </div>

    <h3><span class="step">${t('PASO 1', 'STEP 1')}</span>${t('Minúsculas y tokens', 'Lowercase and tokens')}</h3>
    <div class="prose"><p>${t('<b>Tokenizar</b> es cortar el texto en unidades. Acá un token es una seguidilla de 2 o más letras o números (la regla por defecto de scikit-learn). Pasar todo a minúsculas hace que <code>Light</code>, <code>LIGHT</code> y <code>light</code> sean lo mismo, clave porque la recepción escribe todo en MAYÚSCULAS. Fijate que <code>won\'t</code> queda como <code>won</code>: la <code>t</code> sola se descarta. Es una decisión, no una verdad.', '<b>Tokenizing</b> means cutting text into units. Here a token is a run of 2 or more letters or digits (scikit-learn\'s default rule). Lowercasing makes <code>Light</code>, <code>LIGHT</code> and <code>light</code> the same, which matters because the front desk types in ALL CAPS. Notice <code>won\'t</code> becomes <code>won</code>: the lone <code>t</code> is dropped. That is a choice, not a truth.')}</p></div>
    <div class="card fig"><div class="tokens" id="s1"></div></div>

    <h3><span class="step">${t('PASO 2', 'STEP 2')}</span>${t('Vocabulario y bolsa de palabras', 'Vocabulary and bag of words')}</h3>
    <div class="prose"><p>${t(`Juntando todos los tokens de los ${nf(N_DOCS)} pedidos (y quedándome con los que aparecen al menos 2 veces) sale un <b>vocabulario</b> de ${nf(M.word.terms.length)} columnas. Cada pedido se convierte en una fila con un número por columna: cuántas veces aparece esa palabra. Se llama <b>bolsa de palabras</b> porque el orden se pierde: “door won't lock” y “lock won't door” dan la misma fila.`, `Collecting every token from the ${nf(N_DOCS)} requests (keeping those that appear at least twice) gives a <b>vocabulary</b> of ${nf(M.word.terms.length)} columns. Each request becomes a row with one number per column: how many times that word appears. It is called a <b>bag of words</b> because order is lost: “door won't lock” and “lock won't door” get the same row.`)}</p></div>
    <div class="card fig"><canvas class="strip" id="s2c" width="1000" height="34"></canvas><p class="cap" id="s2t"></p></div>

    <h3><span class="step">${t('PASO 3', 'STEP 3')}</span>TF-IDF: ${t('pesar cada palabra según cuánto informa', 'weighing each word by how much it tells')}</h3>
    <div class="prose"><p>${t('Contar no alcanza: <code>the</code>, <code>please</code> y <code>hi</code> pesarían lo mismo que <code>thermostat</code>. La <b>IDF</b> (frecuencia inversa de documento) castiga las palabras que están en todos lados y premia las específicas:', 'Counting isn\'t enough: <code>the</code>, <code>please</code> and <code>hi</code> would weigh the same as <code>thermostat</code>. <b>IDF</b> (inverse document frequency) punishes words that are everywhere and rewards specific ones:')}</p>
    <div class="formula">idf(w) = ln( (1 + N) / (1 + df(w)) ) + 1 &nbsp;&nbsp;·&nbsp;&nbsp; tf-idf = (1 + ln(${t('conteo', 'count')})) × idf, ${t('después cada fila se escala a largo 1', 'then each row is scaled to length 1')}</div>
    <p>${t(`N es la cantidad de pedidos (${nf(N_DOCS)}) y df(w) en cuántos aparece la palabra. Por ejemplo, <code>thermostat</code> está en unos 180 pedidos: ln(14.639 / 184) + 1 ≈ <b>5,4</b>. <code>the</code> está en la mitad: ≈ <b>1,7</b>. Nadie borró las palabras de relleno a mano; la IDF las achica sola. El logaritmo en el conteo evita que repetir una palabra cinco veces valga cinco veces más.`, `N is the number of requests (${nf(N_DOCS)}) and df(w) how many contain the word. For example, <code>thermostat</code> is in about 180 requests: ln(14,639 / 184) + 1 ≈ <b>5.4</b>. <code>the</code> is in half of them: ≈ <b>1.7</b>. Nobody deleted filler words by hand; IDF shrinks them on its own. The log on the count stops a word repeated five times from counting five times as much.`)}</p></div>
    <div class="card fig tbl" id="s3"></div>

    <h3><span class="step">${t('PASO 4', 'STEP 4')}</span>${t('Pares de palabras (bigramas)', 'Word pairs (bigrams)')}</h3>
    <div class="prose"><p>${t('Una palabra sola puede significar cosas distintas. <code>light</code> aparece en “ceiling light is out” (electricidad), “leak coming through the light fixture” (plomería) y “burner won\'t light” (electrodomésticos). Sumar cada par de palabras seguidas como columna extra le da contexto: <code>light fixture</code>, <code>ceiling light</code> y <code>won light</code> son columnas distintas, y el modelo aprende que cada una apunta a otro oficio.', 'A single word can mean different things. <code>light</code> appears in “ceiling light is out” (electrical), “leak coming through the light fixture” (plumbing) and “burner won\'t light” (appliance). Adding every pair of consecutive words as an extra column gives context: <code>light fixture</code>, <code>ceiling light</code> and <code>won light</code> are different columns, and the model learns each points to a different trade.')}</p></div>
    <div class="card fig"><div class="tokens" id="s4"></div><p class="cap">${t('Azul: el par está en el vocabulario (apareció en al menos 2 pedidos). Gris: no existe, así que no suma nada.', 'Blue: the pair is in the vocabulary (it appeared in at least 2 requests). Grey: unknown, so it adds nothing.')}</p></div>

    <h3><span class="step">${t('PASO 5', 'STEP 5')}</span>${t('Fragmentos de letras: sobrevivir a los errores de tipeo', 'Letter pieces: surviving typos')}</h3>
    <div class="prose"><p>${t('Los inquilinos escriben <code>toilte</code>, <code>refridgerator</code>, <code>calefaccoin</code>. Para el vocabulario de palabras eso es una palabra nueva y desconocida. La solución: cortar cada palabra en <b>fragmentos superpuestos de 3 a 5 letras</b> (con un espacio en cada borde). Un error rompe algunos fragmentos, pero la mayoría sigue coincidiendo. Son otras ' + nf(M.char.terms.length) + ' columnas.', 'Tenants type <code>toilte</code>, <code>refridgerator</code>, <code>calefaccoin</code>. For the word vocabulary that is a new, unknown word. The fix: cut every word into <b>overlapping pieces of 3 to 5 letters</b> (with a space on each edge). A typo breaks some pieces, but most still match. That is another ' + nf(M.char.terms.length) + ' columns.')}</p></div>
    <div class="card fig">
      <div class="seg-wrap"><span>${t('Comparar', 'Compare')}</span><input id="ca" value="refrigerator" class="cmp"> <span>vs</span> <input id="cb" value="refridgerator" class="cmp"></div>
      <div id="s5"></div>
    </div>

    <h3><span class="step">${t('PASO 6', 'STEP 6')}</span>${t('El clasificador: qué palabra empuja hacia qué oficio', 'The classifier: which word pushes towards which trade')}</h3>
    <div class="prose"><p>${t('TF-IDF sabe qué tan rara es una palabra, pero no <i>qué dice sobre el oficio</i>: nunca vio una etiqueta. Eso lo aprende una <b>regresión logística</b>. Para cada oficio guarda un peso por columna. El puntaje de un oficio es la suma de (peso × valor TF-IDF) de las palabras del pedido, más una constante:', 'TF-IDF knows how rare a word is, but not <i>what it says about the trade</i>: it never saw a label. A <b>logistic regression</b> learns that. For each trade it keeps one weight per column. A trade\'s score is the sum of (weight × TF-IDF value) over the request\'s words, plus a constant:')}</p>
    <div class="formula">${t('puntaje', 'score')}<sub>${t('oficio', 'trade')}</sub> = b + Σ w<sub>${t('oficio, palabra', 'trade, word')}</sub> × x<sub>${t('palabra', 'word')}</sub> &nbsp;→&nbsp; P(${t('oficio', 'trade')}) = e<sup>${t('puntaje', 'score')}</sup> / Σ e<sup>${t('puntajes', 'scores')}</sup></div>
    <p>${t('Entrenar es arrancar con todos los pesos en cero e ir ajustándolos para que la probabilidad del oficio correcto suba en los pedidos de entrenamiento. Una penalización (C) evita que memorice accidentes, como un error de tipeo que justo apareció en dos pedidos de plagas. Elegí C con validación cruzada de 5 partes, sin mirar el examen.', 'Training means starting with every weight at zero and nudging them so the correct trade\'s probability goes up on the training requests. A penalty (C) stops it memorising accidents, like a typo that happened to appear in two pest requests. I picked C with 5-fold cross-validation, without looking at the test set.')}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('Tu pedido: puntaje y probabilidad por oficio', 'Your request: score and probability per trade')}</h4><div id="s6a"></div></div>
      <div class="card fig"><h4 id="s6bh"></h4><div id="s6b"></div><p class="cap">${t('Barra a la derecha: suma para el oficio ganador. A la izquierda: resta. Los fragmentos de letras se suman a la palabra que los contiene.', 'Bar to the right: adds to the winning trade. To the left: subtracts. Letter pieces are credited to the word that contains them.')}</p></div>
    </div>
    <div class="card fig"><h4>${t('Lo que aprendió: las palabras más fuertes de cada oficio', 'What it learned: the strongest words for each trade')}</h4>
      <div class="seg" id="tsel" style="flex-wrap:wrap"></div><div class="tokens" id="s6c" style="margin-top:12px"></div>
      <p class="cap">${t('Nadie escribió estas listas: salen de los pesos. Aparecen inglés, español (<code>agua</code>, <code>enchufe</code>, <code>cucarachas</code>, <code>no cierra</code>) y las abreviaturas de la recepción (<code>wtr</code>, <code>kit</code>) porque estaban en los pedidos de entrenamiento. Probé primero con reglas de palabras clave escritas a mano: acertaban 11% en español y 49% en notas telefónicas.', 'Nobody wrote these lists: they come from the weights. English, Spanish (<code>agua</code>, <code>enchufe</code>, <code>cucarachas</code>, <code>no cierra</code>) and front-desk shorthand (<code>wtr</code>, <code>kit</code>) appear because they were in the training requests. I tried hand-written keyword rules first: they got 11% right in Spanish and 49% on phone notes.')}</p></div>

    <h3><span class="step">${t('PASO 7', 'STEP 7')}</span>${t('¿Con qué etiquetas entrenar?', 'Which labels to train on?')}</h3>
    <div class="prose"><p>${t('Había dos fuentes de respuestas: 12.898 oficios puestos por el despachante en las órdenes de trabajo (muchos, pero con errores) y 1.400 etiquetas cuidadosas del equipo de Lena (pocas). Las comparé de forma justa: 5 rondas, en cada una 1.120 etiquetas de Lena pueden usarse para entrenar y 280 son el examen.', 'There were two sources of answers: 12,898 trades set by the dispatcher on work orders (many, but with mistakes) and 1,400 careful labels from Lena\'s team (few). I compared them fairly: 5 rounds, each with 1,120 of Lena\'s labels allowed for training and 280 kept as the exam.')}</p></div>
    <div class="card fig"><div id="s7"></div>
      <p class="cap">${t('<b>El modelo (95,5%) le gana a las etiquetas con las que se entrenó (92,9%).</b> Parece imposible, pero los errores del despachante son al azar: por cada “sink clogged” etiquetado como calefacción hay cientos bien etiquetados, y el modelo aprende la mayoría. Con ruido al azar, la cantidad le gana a la calidad. Mi idea de “corregir primero las etiquetas ruidosas con las de Lena” (D) cambió solo ~3 etiquetas de 12.898: el modelo ya las estaba ignorando. Me quedé con la opción más simple (A).', '<b>The model (95.5%) beats the labels it was trained on (92.9%).</b> That sounds impossible, but the dispatcher\'s mistakes are random: for every “sink clogged” tagged heating there are hundreds tagged right, and the model learns the majority. With random noise, quantity beats quality. My idea of “correcting the noisy tags with Lena\'s first” (D) changed only ~3 of 12,898 tags: the model was already ignoring them. I kept the simplest option (A).')}</p></div>

    <h3><span class="step">${t('PASO 8', 'STEP 8')}</span>${t('Evaluar en serio', 'Evaluating properly')}</h3>
    <div class="prose"><p>${t(`El examen final son los 1.400 pedidos que el equipo revisó a mano, que el modelo nunca vio al entrenar. Acierta el <b>${pct(G.acc, 1)}</b>. Pero un solo número esconde dónde falla, así que lo abrí por oficio, por canal, por idioma, y leí los errores uno por uno.`, `The final exam is the 1,400 requests the team checked by hand, which the model never saw in training. It gets <b>${pct(G.acc, 1)}</b> right. But one number hides where it fails, so I broke it down by trade, channel and language, and read the mistakes one by one.`)}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('Matriz de confusión (filas: etiqueta, columnas: modelo)', 'Confusion matrix (rows: label, columns: model)')}</h4><div id="cm"></div><p class="cap">${t('Pasá el mouse por una celda fuera de la diagonal para leer los pedidos que se confundieron.', 'Hover a cell off the diagonal to read the requests that were confused.')}</p></div>
      <div class="card fig"><h4>${t('Precisión y cobertura por oficio', 'Precision and recall per trade')}</h4><div class="tbl" id="pc"></div>
        <h4 style="margin-top:16px">${t('Por canal e idioma', 'By channel and language')}</h4><div id="bg"></div></div>
    </div>
    <div class="prose"><p>${t('Leí los 63 errores y caen en cuatro grupos. Solo 3 son errores “de verdad” del modelo:', 'I read all 63 mistakes and they fall into four groups. Only 3 are “real” model errors:')}</p></div>
    <div class="errs" id="errs"></div>
    <div class="card fig"><h4>${t('Que el modelo diga “no estoy seguro”', 'Letting the model say “I\'m not sure”')}</h4>
      <div class="seg-wrap"><span>${t('Umbral de confianza', 'Confidence threshold')}</span><input type="range" id="cov" min="0" max="7" step="1" value="3"><b id="covv" class="mono"></b></div>
      <div class="stat-row" id="covs"></div>
      <p class="cap">${t('Si la probabilidad del oficio ganador está debajo del umbral, el pedido va a una persona. Con 0,5, el modelo resuelve solo el 95% de los pedidos con 98% de acierto, y 1 de cada 20 (casi todos “ver foto” o “not working”) va a alguien que igual habría tenido que mirar la foto.', 'If the winning trade\'s probability is below the threshold, the request goes to a person. At 0.5 the model handles 95% of requests on its own at 98% accuracy, and 1 in 20 (mostly “ver foto” or “not working”) goes to someone who would have needed to look at the photo anyway.')}</p></div>

  ${head('emergencias', '05', t('Detectar emergencias', 'Detecting emergencies'))}
    <div class="prose">
      <p>${t('El oficio es un problema de clasificación cómodo: hay miles de ejemplos. La emergencia es más difícil. Solo las 1.400 etiquetas de Lena dicen sí/no (130 sí), es <b>desbalanceado</b> (un modelo que siempre dice “no” acierta 91% y no sirve para nada), y equivocarse no cuesta lo mismo para los dos lados: un aviso falso se descarta en un minuto, un techo goteando toda la noche cuesta miles de dólares. Por eso optimicé la <b>cobertura</b> (recall): de las emergencias reales, cuántas generan aviso.', 'Trade is a comfortable classification problem: there are thousands of examples. Emergency is harder. Only Lena\'s 1,400 labels say yes/no (130 yes), it is <b>imbalanced</b> (a model that always says “no” is 91% accurate and useless), and mistakes don\'t cost the same both ways: a false page is dismissed in a minute, a ceiling leaking all night costs thousands of dollars. So I optimised <b>recall</b>: of the real emergencies, how many raise a page.')}</p>
      <h3><span class="step">A</span>${t('La lista de Lena como reglas', 'Lena\'s list as rules')}</h3>
      <p>${t('Lena tiene una lista escrita de emergencias. La pasé a patrones de texto en inglés, español y abreviaturas de recepción. Antes de buscar, el texto se normaliza: minúsculas, sin tildes, y las palabras clave mal escritas se corrigen si se parecen mucho (este paso lo agregué después de la revisión de Lena, porque “No hay calefacción” y “Carbon monox<b>di</b>e” se escapaban).', 'Lena has a written emergency list. I turned it into text patterns in English, Spanish and front-desk shorthand. Before matching, the text is normalised: lowercase, no accents, and misspelled key words are snapped back if they are very close (I added this step after Lena\'s review, because “No hay calefacción” and “Carbon monox<b>di</b>e” were slipping through).')}</p>
    </div>
    <div class="row2">
      <div class="card fig"><h4>${t('Las 8 categorías y algunos de sus patrones', 'The 8 categories and some of their patterns')}</h4><div id="rl"></div></div>
      <div class="card fig"><h4>${t('Normalización en vivo', 'Live normalisation')}</h4><input id="nin" value="No hay calefacción, el Cabon monoxdie suena"><div id="nout" style="margin-top:10px"></div></div>
    </div>
    <div class="prose">
      <p>${t('Las reglas solas ya son muy precisas (94%), pero se pierden lo que no está dicho con esas palabras: “hay agua en el piso del baño y sigue saliendo”, “huele a algo como plástico”. Y no entienden el tiempo: “toilet <b>overflowed earlier</b>, I cleaned it up and it flushes now” tiene la palabra <i>overflow</i>, pero la emergencia ya pasó.', 'Rules alone are already very precise (94%), but they miss what isn\'t said in those words: “water on the bathroom floor and it keeps coming”, “smells something like plastic”. And they don\'t understand time: “toilet <b>overflowed earlier</b>, I cleaned it up and it flushes now” has the word <i>overflow</i>, but the emergency is over.')}</p>
      <h3><span class="step">B</span>${t('Modelo híbrido: reglas + palabras', 'Hybrid model: rules + words')}</h3>
      <p>${t('La solución más común en NLP real: en vez de elegir entre reglas o modelo, cada categoría de regla se vuelve una columna más (1 si se cumple) junto a las 13.044 columnas de texto. El modelo aprende <i>cuánto confiar en cada regla</i> (todas terminan con pesos de +1,7 a +2,6) y las combina con palabras que la lista no conoce, como <code>keeps coming</code> (sube) o <code>cleaned it up</code> (baja).', 'The most common pattern in real NLP: instead of choosing rules or a model, each rule category becomes one more column (1 if it fires) next to the 13,044 text columns. The model learns <i>how much to trust each rule</i> (they all end up weighted +1.7 to +2.6) and combines them with words the list doesn\'t know, like <code>keeps coming</code> (up) or <code>cleaned it up</code> (down).')}</p>
    </div>
    <div class="card fig"><h4>${t('Elegí el umbral: cuántas emergencias atrapar y cuántos avisos falsos aceptar', 'Pick the threshold: how many emergencies to catch and how many false pages to accept')}</h4>
      <div class="seg-wrap"><span>${t('Comparar contra', 'Compare against')}</span><div class="seg" id="lseg"><button data-v="l">${t('Etiquetas del equipo', 'Team labels')}</button><button data-v="c">${t('Lista de Lena (etiquetas corregidas)', 'Lena\'s list (corrected labels)')}</button></div></div>
      <div class="seg-wrap"><span>${t('Umbral', 'Threshold')}</span><input type="range" id="th" min="0.02" max="0.9" step="0.01" value="0.15"><b id="thv" class="mono"></b></div>
      <div class="row2" style="align-items:start"><div id="pr"></div><div><div class="stat-row" id="ths"></div><div id="thnote" class="cap"></div></div></div>
      <p class="cap">${t('Cada punto de la curva es un umbral. Las probabilidades son “fuera de muestra”: cada pedido se puntuó con un modelo que no lo vio al entrenar (validación cruzada de 5 partes). Elegí 0,15: más o menos un aviso falso por cada uno real, que es lo que Lena dijo que acepta.', 'Each point on the curve is a threshold. Probabilities are “out of fold”: each request was scored by a model that didn\'t see it in training (5-fold cross-validation). I chose 0.15: roughly one false page per real one, which is what Lena said she accepts.')}</p></div>
    <div class="callout blue prose"><b>${t('Un detalle que cambió el resultado:', 'A detail that changed the result:')}</b> ${t(`${EM.suspicious} pedidos estaban etiquetados como emergencia pero no coinciden con nada de la lista y tienen texto claro: “paint peeling on the bathroom ceiling”, “water pressure is really weak”, “hay cucarachas en la cocina”. Se los mostré a Lena y confirmó que eran errores de su equipo. Con esas etiquetas corregidas, de las ${missedEm.n_c} emergencias reales que recepción no marcó, el modelo atrapa <b>${missedEm.caught_c}</b>. Las 2 que se le escapan no tienen texto útil (“ver foto”).`, `${EM.suspicious} requests were labelled emergency but match nothing on the list and have clear text: “paint peeling on the bathroom ceiling”, “water pressure is really weak”, “hay cucarachas en la cocina”. I showed them to Lena and she confirmed they were her team's mistakes. With those labels fixed, of the ${missedEm.n_c} real emergencies intake missed, the model catches <b>${missedEm.caught_c}</b>. The 2 it misses have no useful text (“ver foto”).`)}</div>
    <div class="prose"><p>${t('<b>Lo que todavía no puede ver:</b> pedidos sin texto (solo foto, “not working”). Por eso los pedidos vagos reciben una probabilidad intermedia y generan aviso a propósito: si no se puede saber, que alguien llame. Y la regla de la ciudad (sin calefacción solo es emergencia del 15 de octubre al 15 de abril) no se puede aprender de los datos porque no hay ejemplos fuera de temporada, así que la apliqué como regla fija.', '<b>What it still can\'t see:</b> requests with no text (photo only, “not working”). So vague requests get a middling probability and page on purpose: if you can\'t tell, someone should call. And the city rule (no heat is only an emergency 15 October to 15 April) can\'t be learned from the data because there are no off-season examples, so I applied it as a fixed rule.')}</p></div>

  ${head('esperas', '06', t('Cuánto esperan hoy las emergencias', 'How long emergencies wait today'))}
    <div class="prose"><p>${t(`Para toda la historia usé la lista de Lena como definición de emergencia (${nf(W.n_caught + W.n_missed)} emergencias con orden de trabajo). “Esperar” es desde que llega el pedido hasta que sale la primera orden de trabajo.`, `For the full history I used Lena's list as the definition of emergency (${nf(W.n_caught + W.n_missed)} emergencies with a work order). “Waiting” is from the request arriving to the first work order going out.`)}</p></div>
    <div class="card fig"><h4>${t('Horas hasta despachar, según recepción la marcó o no', 'Hours to dispatch, by whether intake flagged it')}</h4>
      <div class="legend"><span><i style="background:var(--blue)"></i>${t(`Recepción la marcó urgente (${nf(W.n_caught)}) · mediana ${nf(W.med_caught, 1)} h`, `Intake flagged it urgent (${nf(W.n_caught)}) · median ${nf(W.med_caught, 1)} h`)}</span><span><i style="background:var(--em)"></i>${t(`Recepción no la marcó (${nf(W.n_missed)}) · mediana ${nf(W.med_missed, 1)} h`, `Intake missed it (${nf(W.n_missed)}) · median ${nf(W.med_missed, 1)} h`)}</span></div>
      <div id="wh"></div>
      <p class="cap">${t(`Una emergencia que recepción no marca espera como un pedido de rutina: hasta la mañana siguiente. 1 de cada 10 espera más de ${nf(W.p90_missed, 0)} horas.`, `An emergency intake misses waits like a routine request: until the next morning. 1 in 10 waits more than ${nf(W.p90_missed, 0)} hours.`)}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('¿Dónde se pierden? Emergencias no marcadas, por canal', 'Where are they missed? Unflagged emergencies, by channel')}</h4><div id="wch"></div>
        <p class="cap">${t('Por teléfono la recepción escucha al inquilino y casi no falla. Lo escrito (portal, app, email) se pierde ~58% de las veces, sin importar el tipo de emergencia: no es que no sepan qué es una emergencia, es que nadie lee la cola a tiempo.', 'On the phone intake hears the tenant and rarely misses. Written requests (portal, app, email) are missed ~58% of the time, whatever the type of emergency: it isn\'t that staff don\'t know what an emergency is, it\'s that nobody reads the queue in time.')}</p></div>
      <div class="card fig"><h4>${t('Con triage automático', 'With automatic triage')}</h4>
        <div class="stat-row"><div><b>${nf(W.overnight)}</b>${t('emergencias no habrían esperado toda la noche', 'emergencies would not have waited overnight')}</div><div><b>${nf(W.hours_saved)} h</b>${t('de espera evitadas en 21 meses', 'of waiting avoided in 21 months')}</div></div>
        <div class="stat-row"><div><b>${W.pages_intake} → ${W.pages_model}</b>${t('avisos por mes (hoy → modelo)', 'pages a month (today → model)')}</div><div><b>${pct(W.real_intake)} → ${pct(W.real_model)}</b>${t('de avisos que son emergencias reales', 'of pages that are real emergencies')}</div></div>
        <p class="cap">${t('Casi la misma cantidad de avisos que hoy, pero apuntados a los pedidos correctos.', 'About as many pages as today, but aimed at the right requests.')}</p></div>
    </div>

  ${head('proveedores', '07', t('Proveedores: el plomero barato que sale caro', 'Vendors: the cheap plumber that costs more'))}
    <div class="prose"><p>${t('Para comparar proveedores “de igual a igual” hay que comparar el mismo oficio y, si se puede, los mismos edificios. En marzo de 2026 los edificios HV01–09 pasaron de BlueLine a Rapid Rooter para ahorrar (tarifa por hora 20% más baja), y HV10–18 siguieron con BlueLine. Eso arma un experimento natural: <b>diferencia en diferencias</b>. El cambio en los edificios que cambiaron, menos el cambio en los que no.', 'To compare vendors “like with like” you have to compare the same trade and, if possible, the same buildings. In March 2026 buildings HV01–09 moved from BlueLine to Rapid Rooter to save money (20% lower hourly rate), and HV10–18 kept BlueLine. That makes a natural experiment: <b>difference in differences</b>. The change in the buildings that switched, minus the change in those that didn\'t.')}</p></div>
    <div class="row2">
      <div class="card fig"><h4>${t('Mediana de horas para terminar un trabajo de plomería', 'Median hours to finish a plumbing job')}</h4><div id="vq1"></div></div>
      <div class="card fig"><h4>${t('% de trabajos que vuelven a pedirse en 30 días', '% of jobs re-requested within 30 days')}</h4><div id="vq2"></div></div>
    </div>
    <div class="card fig tbl" id="did"></div>
    <div class="prose"><p>${t(`Los edificios que siguieron con BlueLine no cambiaron nada; los que pasaron a Rapid Rooter empeoraron en todo. Desde marzo: unos <b>${J.vendors.extra_comebacks} pedidos repetidos de más</b> y <b>US$ ${nf(J.vendors.extra_cost)}</b> más en costo de trabajos. La tarifa por hora era más baja, pero cada trabajo tarda más, cuesta más y vuelve más seguido. En los demás oficios, los proveedores son parecidos entre sí.`, `The buildings that kept BlueLine didn't change at all; those that moved to Rapid Rooter got worse on everything. Since March: about <b>${J.vendors.extra_comebacks} extra repeat requests</b> and <b>US$ ${nf(J.vendors.extra_cost)}</b> more in job costs. The hourly rate was lower, but each job takes longer, costs more and comes back more often. In the other trades, vendors are similar to each other.`)}</p></div>

  ${head('resultado', '08', t('Resultado y recomendaciones', 'Result and recommendations'))}
    <div class="prose"><p>${t(`Clasifiqué los 334 pedidos nuevos (15 al 28 de octubre) y Lena los comparó con lo que encontró su equipo: <b>330 de 334 oficios correctos (98,8%)</b> y <b>las 32 emergencias reales detectadas</b>, con 46 avisos en total. Su primera revisión encontró 2 emergencias perdidas (una en español con tilde, otra con un error de tipeo); las corregí con la normalización del paso A y no volvieron a fallar. Me dio el visto bueno y van a probar el triage en el portal.`, `I classified the 334 new requests (15 to 28 October) and Lena checked them against what her team found: <b>330 of 334 trades right (98.8%)</b> and <b>all 32 real emergencies caught</b>, with 46 pages in total. Her first review found 2 missed emergencies (one in Spanish with an accent, one with a typo); I fixed them with the normalisation in step A and they no longer fail. She signed off and they will pilot the triage in the portal.`)}</p></div>
    <ol class="recs">
      <li class="card"><b>${t('Activar el triage automático en cada pedido nuevo.', 'Turn on automatic triage for every new request.')}</b>${t('El 1 de cada 20 en que el modelo duda va a una persona, como hoy.', 'The 1 in 20 the model is unsure about goes to a person, as today.')}</li>
      <li class="card"><b>${t('Sumar dos preguntas sí/no al portal y la app.', 'Add two yes/no questions to the portal and app.')}</b>${t('“¿Está saliendo agua ahora?” y “¿Podés cerrar la puerta / tenés calefacción y luz?”. Cierran el hueco de los pedidos que solo traen una foto.', '“Is water leaking right now?” and “Can you lock your door / do you have heat and power?”. They close the gap for requests that only have a photo.')}</li>
      <li class="card"><b>${t('Revisar el contrato de Rapid Rooter en HV01–09.', 'Review the Rapid Rooter contract for HV01–09.')}</b>${t('+28 h por trabajo, 1 de cada 3 vuelve, +US$ 39 por trabajo.', '+28 h per job, 1 in 3 comes back, +US$39 per job.')}</li>
      <li class="card"><b>${t('Inspeccionar la caldera de HV11 antes del invierno y fumigar HV06 entero.', 'Inspect the HV11 boiler before winter and treat HV06 building-wide.')}</b>${t('Los dos problemas se ven en los pedidos meses antes de que alguien los nombre.', 'Both problems show up in the requests months before anyone names them.')}</li>
      <li class="card"><b>${t('Mantener el modelo vivo.', 'Keep the model alive.')}</b>${t('Reentrenar cada mes con las órdenes de trabajo nuevas y vigilar si cae la confianza promedio (nuevos edificios, nuevas formas de escribir).', 'Retrain monthly with new work orders and watch for a drop in average confidence (new buildings, new ways of writing).')}</li>
    </ol>
    <div class="prose"><h3>${t('Lo que haría con más tiempo', 'What I would do with more time')}</h3><ul>
      <li>${t('Separar los pedidos con dos problemas (“la heladera no enfría. También la luz parpadea”) en dos órdenes de trabajo.', 'Split requests with two problems (“the fridge isn\'t cooling. Also the light flickers”) into two work orders.')}</li>
      <li>${t('Probar embeddings de oraciones multilingües: entenderían sinónimos que TF-IDF no relaciona, a cambio de un modelo más pesado y menos explicable.', 'Try multilingual sentence embeddings: they would understand synonyms TF-IDF doesn\'t connect, at the cost of a heavier, less explainable model.')}</li>
      <li>${t('Medir el efecto real del piloto con un antes/después de tiempos de espera.', 'Measure the pilot\'s real effect with a before/after on waiting times.')}</li></ul>
      <h3>${t('Herramientas', 'Tools')}</h3>
      <p><span class="chip">Python</span> <span class="chip">pandas</span> <span class="chip">scikit-learn</span> <span class="chip">TF-IDF</span> <span class="chip">${t('regresión logística', 'logistic regression')}</span> <span class="chip">regex</span> <span class="chip">Jupyter</span> <span class="chip">JavaScript</span></p>
    </div>

  ${head('mesa', '09', t('Probalo: la mesa de triage', 'Try it: the triage desk'))}
    <div class="prose"><p>${t('Los 334 pedidos nuevos con lo que dijo el modelo y por qué. Elegí un pedido o escribí uno propio.', 'The 334 new requests with what the model said and why. Pick a request or write your own.')}</p></div>
    <iframe class="desk-frame" src="triage.html${HV.lang === 'en' ? '?lang=en' : ''}" title="Triage desk" loading="lazy"></iframe>

    <footer><span>${t('Escenario con datos sintéticos. Harborview Residential y sus personas son ficticios.', 'Scenario with synthetic data. Harborview Residential and its people are fictional.')}</span><span>Kevin Leichen · 2026</span></footer>
  </section>`;

  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === HV.lang));
  drawAll();
  spy();
}

// ------------------------------------------------------------------ drawings
function drawAll() {
  drawFlow(); drawFunnel(); drawTZ('fixed'); drawCleanEx(); drawResub(); drawVendorSp();
  drawMix(); drawDD(); drawBHeat(); drawHV11(); drawHV06();
  setupPlay(); drawS5(); drawTradeWords('plumbing'); drawS7(); drawCM(); drawPC(); drawBG(); drawErrs(); setupCov();
  drawRules(); setupNorm(); setupPR(); drawWait(); drawWCh(); drawVendors();
}

function drawFlow() {
  const host = $('#flow'), w = 900, h = 190, s = HV.svg(w, h);
  const ch = [['Portal', '42%'], ['App', '18%'], ['Email', '22%'], [t('Teléfono', 'Phone'), '18%']];
  ch.forEach(([n, p], i) => {
    const y = 14 + i * 44; HV.el('rect', { x: 10, y, width: 150, height: 34, rx: 7, fill: 'var(--card)', stroke: 'var(--rule)' }, s);
    HV.txt(s, 22, y + 22, n, { 'font-size': 14, 'font-weight': 600, fill: 'var(--ink)' }); HV.txt(s, 148, y + 22, p, { 'font-size': 12, 'text-anchor': 'end', 'font-family': 'var(--mono)' });
    HV.el('path', { d: `M160 ${y + 17} C 220 ${y + 17}, 220 95, 270 95`, fill: 'none', stroke: 'var(--rule)', 'stroke-width': 2 }, s);
  });
  HV.el('rect', { x: 270, y: 70, width: 170, height: 50, rx: 8, fill: 'var(--ink)' }, s);
  HV.txt(s, 355, 92, t('Una sola cola', 'One queue'), { 'text-anchor': 'middle', fill: 'var(--paper)', 'font-size': 14, 'font-weight': 600 });
  HV.txt(s, 355, 110, t('~700 pedidos/mes', '~700 requests/mo'), { 'text-anchor': 'middle', fill: '#b9c3cc', 'font-size': 12 });
  HV.el('path', { d: 'M440 95 L 500 95', stroke: 'var(--ink)', 'stroke-width': 2, 'marker-end': 'url(#ar)' }, s);
  const defs = HV.el('defs', {}, s); const mk = HV.el('marker', { id: 'ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); HV.el('path', { d: 'M0 0 L10 5 L0 10z', fill: 'var(--ink)' }, mk);
  HV.el('rect', { x: 500, y: 62, width: 180, height: 66, rx: 8, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-dasharray': '4 3' }, s);
  HV.txt(s, 590, 86, t('2 personas leen', '2 people read'), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: 'var(--ink)' });
  HV.txt(s, 590, 106, t('¿oficio? ¿emergencia?', 'trade? emergency?'), { 'text-anchor': 'middle', 'font-size': 12.5 });
  HV.el('path', { d: 'M680 85 C 720 85, 720 45, 760 45', fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2 }, s);
  HV.el('path', { d: 'M680 105 C 720 105, 720 145, 760 145', fill: 'none', stroke: 'var(--em)', 'stroke-width': 2 }, s);
  HV.el('rect', { x: 760, y: 26, width: 130, height: 38, rx: 7, fill: mix('var(--blue)', .12), stroke: 'var(--blue)' }, s);
  HV.txt(s, 825, 50, t('Aviso a guardia', 'Page on-call'), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: 'var(--blue)' });
  HV.el('rect', { x: 760, y: 126, width: 130, height: 38, rx: 7, fill: 'var(--em-soft)', stroke: 'var(--em)' }, s);
  HV.txt(s, 825, 150, t('Cola normal', 'Normal queue'), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: 'var(--em)' });
  HV.txt(s, 890, 182, t('40% de las emergencias terminan acá', '40% of emergencies end up here'), { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--em)' });
  s.style.minWidth = '640px';
  host.appendChild(s);
}

function drawFunnel() {
  const O = J.overview;
  const rows = [
    { label: t('Filas en tickets.csv', 'Rows in tickets.csv'), v: O.raw_rows, color: 'var(--ink-2)' },
    { label: t('− duplicados exactos', '− exact duplicates'), v: O.exact_dups, color: 'var(--muted)' },
    { label: t('− reenvíos (< 6 h)', '− resubmissions (< 6 h)'), v: O.resubmissions, color: 'var(--em)' },
    { label: t('= pedidos reales', '= real requests'), v: O.requests, color: 'var(--blue)' },
    { label: t('de ellos, repetidos (“still not fixed”)', 'of which repeats (“still not fixed”)'), v: O.repeats, color: 'var(--warn)' },
  ];
  rows.forEach((r) => (r.tip = `<b>${esc(r.label)}</b>: ${nf(r.v)}`));
  hbars($('#funnel'), rows, { fmt: (v) => nf(v), w: 520, labelW: 230 });
}

function drawTZ(mode) {
  const host = $('#tz'); host.innerHTML = '';
  document.querySelectorAll('#tzseg button').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.v === mode); b.onclick = () => drawTZ(b.dataset.v); });
  const H = J.hours[mode], C = { portal: 'var(--blue)', app: 'var(--hvac)', email: 'var(--appliance)', phone: 'var(--doors_windows)' };
  lines(host, Object.keys(H).map((k) => ({ name: HV.channel(k), color: C[k], y: H[k] })), [...Array(24).keys()].map((h) => h + 'h'), { w: 520, h: 220, yfmt: (v) => pct(v, 1), xstep: 3, ymax: 0.11 });
  const lg = document.createElement('div'); lg.className = 'legend'; lg.innerHTML = Object.keys(C).map((k) => `<span><i style="background:${C[k]}"></i>${HV.channel(k)}</span>`).join(''); host.prepend(lg);
}

function drawCleanEx() {
  const lab = { utc_lower: t('Portal: hora en UTC, unidad en minúscula', 'Portal: UTC time, lowercase unit'), email_address: t('Email: edificio por dirección, “Apt 1F”', 'Email: building by street address, “Apt 1F”'),
    email_signature: t('Email: unidad solo en la firma', 'Email: unit only in the signature'), phone_short: t('Teléfono: código corto “HV5-3L”', 'Phone: short code “HV5-3L”'), email_upper: t('Email: dirección en mayúsculas, asunto y “Sent from my iPhone”', 'Email: uppercase address, subject line and “Sent from my iPhone”') };
  $('#cleanex').innerHTML = `<table><thead><tr><th>${t('Caso', 'Case')}</th><th>${t('Como llega', 'As it arrives')}</th><th>${t('Como queda', 'As it ends up')}</th></tr></thead><tbody>${J.clean_examples.map((e) => `<tr>
    <td style="min-width:150px">${lab[e.note] || ''}</td>
    <td class="mono" style="font-size:12.5px"><span class="muted">${esc(e.submitted_at)}</span> · ${esc(e.building) || '<i>—</i>'} · ${esc(e.unit) || '<i class="muted">' + t('(vacío)', '(blank)') + '</i>'}<br>${esc(e.description).replace(/\n/g, '<span class="em">↵</span>')}</td>
    <td class="mono" style="font-size:12.5px"><b>${esc(e.ts)}</b> · <b>${esc(e.bcode)}</b> · <b>${esc(e.unit_id)}</b><br>${esc(e.text)}</td></tr>`).join('')}</tbody></table>`;
}

function drawResub() {
  const r = J.resub_examples[0];
  $('#resub').innerHTML = `<div class="slip" style="padding:10px 12px 10px 26px;margin-bottom:8px"><div class="mono muted" style="font-size:12px">${r.orig} · ${HV.channel(r.ch)} · ${esc(r.t1)} · ${esc(r.unit)}</div><div class="mono" style="font-size:13px">${esc(r.d1)}</div></div>
    <div class="slip" style="padding:10px 12px 10px 26px;border-color:var(--em)"><div class="mono muted" style="font-size:12px">${r.copy} · ${esc(r.t2)} · <span class="em">${t('reenvío, sin orden de trabajo', 'resubmission, no work order')}</span></div><div class="mono" style="font-size:13px">${esc(r.d2)}</div></div>
    <p class="cap">${t('Para compararlos le saco al texto los saludos, “Re:”, “??”, despedidas y frases de relleno, y mido la similitud de lo que queda (≥ 80%). Así cuentan una vez y el tiempo de espera se mide desde el primero.', 'To compare them I strip greetings, “Re:”, “??”, sign-offs and filler phrases, and measure the similarity of what is left (≥ 80%). That way they count once and waiting is measured from the first one.')}</p>`;
}

function drawVendorSp() {
  const rows = Object.entries(J.vendor_spellings).map(([v, sp]) => `<tr><td><b>${esc(v)}</b></td><td class="mono" style="font-size:12px">${sp.map(([s, n]) => `${esc(s)} <span class="muted">(${nf(n)})</span>`).join('<br>')}</td></tr>`);
  $('#vendors-sp').innerHTML = `<div class="tbl" style="max-height:330px;overflow:auto"><table>${rows.join('')}</table></div>`;
}

function drawMix() {
  const rows = HV.TRADES.map((k) => ({ label: HV.trade(k), v: J.mix[k], color: `var(--${k})` })).sort((a, b) => b.v - a.v);
  rows.forEach((r) => (r.tip = `<b>${r.label}</b>: ${pct(r.v, 1)}`));
  hbars($('#mixbars'), rows, { w: 480, labelW: 150, fmt: (v) => pct(v, 1) });
  const sm = J.season_mix; const p = document.createElement('p'); p.className = 'cap';
  p.innerHTML = t(`Calefacción pasa de ${pct(sm.summer.hvac)} de los pedidos en verano a ${pct(sm.winter.hvac)} en invierno; plagas se duplica en verano.`, `Heating goes from ${pct(sm.summer.hvac)} of requests in summer to ${pct(sm.winter.hvac)} in winter; pests double in summer.`);
  $('#mixbars').appendChild(p);
}

function drawDD() {
  const D = J.dropdown.matrix, rowsK = ['Plumbing', 'Heating/AC', 'Electrical', 'Appliance', 'Pests', 'Doors/Locks/Windows', 'Other'];
  const cols = ['plumbing', 'hvac', 'electrical', 'appliance', 'pest', 'doors_windows', 'general'];
  const tot = (r) => cols.reduce((a, c) => a + (D[r]?.[c] || 0), 0);
  const DDm = { Plumbing: 'plumbing', 'Heating/AC': 'hvac', Electrical: 'electrical', Appliance: 'appliance', Pests: 'pest', 'Doors/Locks/Windows': 'doors_windows' };
  heat($('#ddmat'), rowsK.map((r) => (r === 'Other' ? t('Otro', 'Other') : HV.trade(DDm[r]))), cols.map(HV.trade), (i, j) => (D[rowsK[i]]?.[cols[j]] || 0) / tot(rowsK[i]),
    { w: 480, labelW: 140, cellH: 26, colLabelH: 74, fmt: (v) => (v < 0.005 ? '' : Math.round(v * 100)),
      color: (v, i, j) => (DDm[rowsK[i]] === cols[j] ? mix('var(--ok)', 0.15 + v * .8) : mix('var(--em)', v * 1.4)),
      tipFn: (i, j, v) => `${t('Eligió', 'Picked')} <b>${esc(rowsK[i] === 'Other' ? t('Otro', 'Other') : HV.trade(DDm[rowsK[i]]))}</b>, ${t('era', 'was')} <b>${HV.trade(cols[j])}</b>: ${pct(v)} (${nf(D[rowsK[i]]?.[cols[j]] || 0)} ${t('pedidos', 'requests')})` });
}

function drawBHeat() {
  const B = J.buildings.slice().sort((a, b) => a.code.localeCompare(b.code)), A = J.avg_rate;
  const cols = HV.TRADES;
  heat($('#bheat'), B.map((b) => `${b.code} ${b.name} · ${b.year}`), cols.map(HV.trade), (i, j) => B[i].rate[cols[j]],
    { w: 860, labelW: 230, cellH: 25, colLabelH: 30, rotate: false, fmt: (v) => Math.round(v),
      color: (v, i, j) => { const r = Math.log2(v / A[cols[j]]); return r > 0 ? mix('var(--em)', Math.min(1, r / 1.6) * .85) : mix('var(--blue)', Math.min(1, -r / 1.6) * .6); },
      tipFn: (i, j, v) => `<b>${B[i].code} ${esc(B[i].name)}</b> (${B[i].year}, ${esc(B[i].heating)}, ${B[i].units} ${t('deptos', 'units')})<br>${HV.trade(cols[j])}: <b>${nf(v, 1)}</b> ${t('por 100 deptos/año', 'per 100 units/yr')}<br><span class="k">${t('promedio', 'average')} ${nf(A[cols[j]], 1)} · ${nf(v / A[cols[j]], 1)}×</span> · ${nf(B[i].n[cols[j]])} ${t('pedidos', 'requests')}` });
}

function drawHV11() {
  const H = J.monthly.hvac, ms = J.months, others = Object.keys(H).filter((k) => k !== 'HV11');
  const avg = ms.map((_, i) => others.reduce((a, k) => a + H[k][i], 0) / others.length);
  lines($('#hv11'), [
    ...others.map((k) => ({ name: k, color: 'var(--grid)', y: H[k], width: 1, noTip: true })),
    { name: t('Promedio de los otros 17', 'Average of the other 17'), color: 'var(--blue)', y: avg, dash: '5 4' },
    { name: 'HV11 Elmhurst Manor', color: 'var(--hvac)', y: H.HV11, width: 3 },
  ], ms.map((m) => m.slice(2)), { w: 520, h: 240, xstep: 3, yfmt: (v) => nf(v, 0) });
}

function drawHV06() {
  const F = J.hv06_floor, ms = J.months, floors = Object.keys(F).sort((a, b) => b - a), start = 12;
  const cols = ms.slice(start);
  heat($('#hv06'), floors.map((f) => t('Piso ', 'Floor ') + f), cols.map((m) => m.slice(2)), (i, j) => F[floors[i]][start + j],
    { w: 520, labelW: 70, cellH: 34, colLabelH: 50, fmt: (v) => (v ? v : ''), color: (v) => (v ? mix('var(--pest)', 0.15 + Math.min(1, v / 10) * .85) : 'var(--paper-2)'),
      tipFn: (i, j, v) => `HV06, ${t('piso', 'floor')} ${floors[i]}, ${cols[j]}: <b>${v}</b> ${t('pedidos de plagas', 'pest requests')}` });
}

// ------------------------------------------------------------------ NLP playground
const PEX = () => [t('Light in the bedroom flickers URGENT', 'Light in the bedroom flickers URGENT'), 'leak coming through the light fixture in the kitchen', 'KIT SINK CLOGGED, TEN CALLED TWICE', 'la luz del baño no prende', 'refridgerator not cooling', "burner won't light"];
let playText = 'Light in the bedroom flickers URGENT';
function setupPlay() {
  const inp = $('#pin'); inp.value = playText;
  $('#pex').innerHTML = ''; PEX().forEach((x) => { const b = document.createElement('button'); b.textContent = x; b.onclick = () => { inp.value = x; playText = x; updatePlay(); }; $('#pex').appendChild(b); });
  inp.oninput = () => { playText = inp.value; updatePlay(); };
  updatePlay();
}
function updatePlay() {
  const text = playText || '';
  const { toks } = HarborviewTriage.wordFeatures(text);
  const all = (text.toLowerCase().match(/[\p{L}\p{N}_]+/gu) || []);
  // step 1
  $('#s1').innerHTML = all.map((w) => `<span class="${w.length < 2 ? 'out' : ''}">${esc(w)}</span>`).join('') || '—';
  // step 2: vocabulary strip
  const cv = $('#s2c'), ctx = cv.getContext('2d'), nW = M.word.terms.length; ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#ebe6da'; ctx.fillRect(0, 0, cv.width, cv.height);
  const idx = M.word.terms; const known = [...new Set(toks)].map((w) => idx.indexOf(w)).filter((i) => i >= 0);
  ctx.fillStyle = '#24527a'; known.forEach((i) => ctx.fillRect(Math.floor(i / nW * cv.width), 0, 2, cv.height));
  const counts = {}; toks.forEach((w) => (counts[w] = (counts[w] || 0) + 1));
  $('#s2t').innerHTML = t(`Tu pedido enciende <b>${known.length}</b> de ${nf(nW)} columnas de palabras sueltas (cada raya azul es una). El resto, ${pct(1 - known.length / nW, 2)}, son ceros. Eso es normal en NLP: las filas son casi vacías (“dispersas”).`, `Your request lights up <b>${known.length}</b> of ${nf(nW)} single-word columns (each blue tick is one). The other ${pct(1 - known.length / nW, 2)} are zeros. That is normal in NLP: rows are almost empty (“sparse”).`)
    + ' ' + Object.entries(counts).map(([w, c]) => `<code>${esc(w)}:${c}</code>`).join(' ');
  // step 3: tf-idf table over unigrams
  const uni = [...new Set(toks)];
  const rows = uni.map((w) => { const idf = E.idfOf(w); const c = counts[w]; return { w, c, idf, df: idf ? Math.round((1 + N_DOCS) / Math.exp(idf - 1) - 1) : null, raw: idf ? (1 + Math.log(c)) * idf : 0 }; });
  const norm = Math.sqrt(rows.reduce((a, r) => a + r.raw * r.raw, 0)) || 1;
  const mx = Math.max(...rows.map((r) => r.raw / norm), 0.01);
  $('#s3').innerHTML = `<table><thead><tr><th>${t('palabra', 'word')}</th><th class="num">${t('veces', 'count')}</th><th class="num">${t('en cuántos pedidos (df)', 'in how many requests (df)')}</th><th class="num">idf</th><th>${t('peso final (normalizado)', 'final weight (normalised)')}</th></tr></thead><tbody>${rows.sort((a, b) => b.raw - a.raw).map((r) => `<tr><td class="mono">${esc(r.w)}</td><td class="num">${r.c}</td><td class="num">${r.df == null ? `<span class="muted">${t('no está en el vocabulario', 'not in vocabulary')}</span>` : nf(r.df)}</td><td class="num">${r.idf ? nf(r.idf, 2) : '–'}</td><td><span class="w-bar" style="width:${(r.raw / norm / mx * 160).toFixed(0)}px"></span> <span class="mono" style="font-size:12px">${nf(r.raw / norm, 3)}</span></td></tr>`).join('')}</tbody></table>
    <p class="cap">${t('Probá agregar “please” o “URGENT”: aparecen en miles de pedidos, así que su idf es baja y casi no pesan. Una palabra fuera del vocabulario (un error de tipeo, por ejemplo) no suma nada acá: para eso está el paso 5.', 'Try adding “please” or “URGENT”: they appear in thousands of requests, so their idf is low and they barely weigh anything. A word outside the vocabulary (a typo, say) adds nothing here: that is what step 5 is for.')}</p>`;
  // step 4: bigrams
  const bis = []; for (let i = 0; i + 1 < toks.length; i++) bis.push(toks[i] + ' ' + toks[i + 1]);
  $('#s4').innerHTML = bis.map((b) => `<span class="bi ${E.idfOf(b) ? 'hit' : 'miss'}">${esc(b)}</span>`).join('') || '—';
  // step 6
  const v = E.classify(text);
  const scores = HV.TRADES.map((k) => ({ k, p: v.probs[k] })).sort((a, b) => b.p - a.p);
  $('#s6a').innerHTML = ''; hbars($('#s6a'), scores.map((r) => ({ label: HV.trade(r.k), v: r.p, color: `var(--${r.k})`, tip: `<b>${HV.trade(r.k)}</b>: ${pct(r.p, 1)}` })), { w: 460, labelW: 150, max: 1, fmt: (x) => pct(x, 1) });
  $('#s6bh').textContent = t(`Por qué ${HV.trade(v.trade)}: aporte de cada palabra`, `Why ${HV.trade(v.trade)}: each word's contribution`);
  const cr = HV.wordCredits(text, v.wordContrib(v.trade));
  const agg = {}; cr.forEach((c) => (agg[c.w] = (agg[c.w] || 0) + c.v));
  const list = Object.entries(agg).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 9);
  drawContrib($('#s6b'), list, v.trade);
  const q = $('.play'); q.querySelector('.res')?.remove();
  const r = document.createElement('div'); r.className = 'res'; r.style.cssText = 'margin-top:8px;font-size:13px';
  r.innerHTML = `${t('Resultado', 'Result')}: <span class="mini trade t-${v.trade}" style="font:600 11px var(--mono);padding:3px 7px;border-radius:4px;color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent);text-transform:uppercase">${HV.trade(v.trade)} ${pct(v.confidence)}</span> ${v.emergency ? `<span class="tag solid">${t('emergencia', 'emergency')} ${nf(v.pEmergency, 2)}</span>` : `<span class="muted">${t('rutina', 'routine')} (p ${nf(v.pEmergency, 2)})</span>`}`;
  q.appendChild(r);
}
function drawContrib(host, list, trade) {
  host.innerHTML = ''; const w = 460, rowH = 24, h = list.length * rowH + 8, s = HV.svg(w, h), mid = 200, mx = Math.max(0.3, ...list.map((l) => Math.abs(l[1])));
  HV.el('line', { x1: mid, x2: mid, y1: 0, y2: h, class: 'ax' }, s);
  list.forEach(([wd, val], i) => {
    const y = i * rowH + 4, bw = Math.abs(val) / mx * (w - mid - 60);
    HV.txt(s, 10, y + 15, wd, { 'font-size': 12.5, 'font-family': 'var(--mono)' });
    const rc = HV.el('rect', { x: val >= 0 ? mid : mid - Math.min(bw, mid - 110), y: y + 4, width: val >= 0 ? bw : Math.min(bw, mid - 110), height: rowH - 10, rx: 3, fill: val >= 0 ? `var(--${trade})` : '#a3abb5' }, s);
    HV.txt(s, val >= 0 ? mid + bw + 5 : mid + 5, y + 15, (val >= 0 ? '+' : '') + val.toFixed(2), { 'font-size': 11.5, 'font-family': 'var(--mono)' });
    HV.bindTip(rc, () => `<b>${esc(wd)}</b> → ${HV.trade(trade)}: ${(val >= 0 ? '+' : '') + val.toFixed(3)}`);
  });
  host.appendChild(s);
}
function drawS5() {
  const run = () => {
    const a = $('#ca').value.toLowerCase().trim(), b = $('#cb').value.toLowerCase().trim();
    const pa = HarborviewTriage.charFeatures(a), pb = HarborviewTriage.charFeatures(b), sb = new Set(pb), sa = new Set(pa);
    const shared = [...new Set(pa)].filter((x) => sb.has(x));
    const ua = new Set(pa), ub = new Set(pb); const jac = shared.length / new Set([...ua, ...ub]).size;
    const va = E.vectorize(a), vb = E.vectorize(b);
    const cos = (x, y, lo, hi) => { let d = 0, nx = 0, ny = 0; for (const [i, v] of x) if (i >= lo && i < hi) { nx += v * v; if (y.has(i)) d += v * y.get(i); } for (const [i, v] of y) if (i >= lo && i < hi) ny += v * v; return nx && ny ? d / Math.sqrt(nx * ny) : 0; };
    const nW = M.n_word, nC = M.char.terms.length;
    const show = (arr, other) => [...new Set(arr)].map((x) => `<span class="${other.has(x) ? 'hit' : 'miss'}">${esc(x.replace(/ /g, '·'))}</span>`).join('');
    $('#s5').innerHTML = `<div class="tokens">${show(pa, sb)}</div><div class="tokens" style="margin-top:8px">${show(pb, sa)}</div>
      <div class="stat-row" style="margin-top:12px"><div><b>${shared.length} / ${new Set([...ua, ...ub]).size}</b>${t('fragmentos en común', 'pieces in common')}</div>
      <div><b>${nf(cos(va, vb, 0, nW), 2)}</b>${t('similitud con palabras', 'similarity with words')}</div><div><b>${nf(cos(va, vb, nW, nW + nC), 2)}</b>${t('similitud con fragmentos', 'similarity with pieces')}</div></div>
      <p class="cap">${t('La similitud coseno va de 0 (nada en común) a 1 (idénticos). Con palabras, un error de tipeo es otra palabra: similitud 0. Con fragmentos, la parte que el error no tocó sigue sumando. Probá con “toilet” vs “toilte”: en palabras cortas el error rompe más fragmentos y el parecido baja. “·” marca el borde de la palabra.', 'Cosine similarity goes from 0 (nothing in common) to 1 (identical). With words, a typo is a different word: similarity 0. With pieces, the part the typo didn\'t touch still counts. Try “toilet” vs “toilte”: in short words a typo breaks more pieces and the similarity drops. “·” marks the word edge.')}</p>`;
  };
  $('#ca').oninput = run; $('#cb').oninput = run; run();
}
function drawTradeWords(sel) {
  const seg = $('#tsel'); seg.innerHTML = '';
  HV.TRADES.forEach((k) => { const b = document.createElement('button'); b.textContent = HV.trade(k); b.setAttribute('aria-pressed', k === sel); b.onclick = () => drawTradeWords(k); seg.appendChild(b); });
  const k = M.trade.classes.indexOf(sel), c = M.trade.coef[k], nW = M.n_word;
  const idx = [...Array(nW).keys()].sort((a, b) => c[b] - c[a]).slice(0, 30);
  $('#s6c').innerHTML = idx.map((i) => `<span class="t-${sel}" style="border-color:var(--c);background:color-mix(in srgb,var(--c) ${Math.round(8 + c[i] / c[idx[0]] * 22)}%,var(--card))">${esc(M.word.terms[i])} <b style="font-size:11px">${(c[i] / 1000).toFixed(1)}</b></span>`).join('');
}
function drawS7() {
  const S = [[t('A · 12.898 etiquetas ruidosas', 'A · 12,898 noisy tags'), .955], [t('B · solo 1.120 etiquetas de Lena', 'B · only 1,120 of Lena\'s labels'), .913], [t('C · ambas', 'C · both'), .954], [t('D · corregir y después entrenar', 'D · correct, then train'), .955], [t('El oficio del despachante, tal cual', 'The dispatcher\'s tag, as is'), .929]];
  hbars($('#s7'), S.map(([l, v], i) => ({ label: l, v, color: i === 0 ? 'var(--blue)' : i === 4 ? 'var(--warn)' : 'var(--ink-2)', tip: `<b>${esc(l)}</b>: ${pct(v, 1)}` })), { w: 980, labelW: 300, max: 1, fmt: (v) => pct(v, 1) });
}
function drawCM() {
  const C = J.confusion, ks = ['plumbing', 'general', 'electrical', 'hvac', 'doors_windows', 'appliance', 'pest'];
  heat($('#cm'), ks.map(HV.trade), ks.map(HV.trade), (i, j) => C[i][j], { w: 500, labelW: 140, cellH: 30, colLabelH: 78,
    color: (v, i, j) => (i === j ? mix('var(--ok)', 0.2 + Math.min(1, v / 200) * 0.6) : v ? mix('var(--em)', 0.15 + Math.min(1, v / 12) * 0.7) : 'var(--paper-2)'), fmt: (v) => (v ? v : ''),
    tipFn: (i, j, v) => i === j ? `<b>${HV.trade(ks[i])}</b>: ${v} ${t('bien', 'right')}` : `${t('Etiqueta', 'Label')} <b>${HV.trade(ks[i])}</b>, ${t('modelo', 'model')} <b>${HV.trade(ks[j])}</b>: ${v}<br>${(J.confusion_examples[ks[i] + '|' + ks[j]] || []).map((x) => '<span class="k">“' + esc(x) + '”</span>').join('<br>')}` });
}
function drawPC() {
  const P = J.per_class;
  $('#pc').innerHTML = `<table><thead><tr><th>${t('Oficio', 'Trade')}</th><th class="num">${t('Precisión', 'Precision')}</th><th class="num">${t('Cobertura', 'Recall')}</th><th class="num">F1</th><th class="num">n</th></tr></thead><tbody>${HV.TRADES.map((k) => `<tr><td><span class="chip"><i class="tb t-${k}"></i>${HV.trade(k)}</span></td><td class="num">${pct(P[k].p, 1)}</td><td class="num">${pct(P[k].r, 1)}</td><td class="num">${nf(P[k].f1, 3)}</td><td class="num">${P[k].n}</td></tr>`).join('')}</tbody></table>
    <p class="cap">${t('Precisión: de los que el modelo llamó “plagas”, cuántos eran plagas. Cobertura: de las plagas reales, cuántas encontró. Plomería tiene cobertura 99,8% y precisión más baja porque es donde el modelo “tira” los pedidos sin texto útil.', 'Precision: of those the model called “pests”, how many were pests. Recall: of the real pests, how many it found. Plumbing has 99.8% recall and lower precision because that is where the model “drops” requests with no useful text.')}</p>`;
}
function drawBG() {
  const B = J.by_group, rows = [['portal', 'Portal'], ['app', 'App'], ['email', 'Email'], ['phone', t('Teléfono (abreviado)', 'Phone (shorthand)')], ['en', t('Inglés', 'English')], ['es', t('Español', 'Spanish')]];
  hbars($('#bg'), rows.map(([k, l]) => ({ label: l, v: B[k].acc, color: ['en', 'es'].includes(k) ? 'var(--ink-2)' : 'var(--blue)', tip: `<b>${l}</b>: ${pct(B[k].acc, 1)} (n = ${B[k].n})` })), { w: 460, labelW: 160, max: 1, fmt: (v) => pct(v, 1) });
}
function drawErrs() {
  const G = { 1: [t('El texto no dice nada', 'The text says nothing'), t('“ver foto”, “not working”, vacío. La etiqueta salió de mirar la foto o de la visita: ningún método de texto puede saberlo. Acá el modelo debe decir “no sé”.', '“ver foto”, “not working”, empty. The label came from the photo or the visit: no text method can know. Here the model should say “I don\'t know”.')],
    2: [t('La etiqueta de Lena está mal', 'Lena\'s label is wrong'), t('El modelo coincide con el despachante y la etiqueta es la rara (“kitchen sink is clogged” como calefacción). Le pasé la lista de 22 a Lena: las 22 eran errores.', 'The model agrees with the dispatcher and the label is the odd one (“kitchen sink is clogged” as heating). I sent Lena the list of 22: all 22 were mistakes.')],
    3: [t('Dos problemas en un pedido', 'Two problems in one request'), t('“La heladera no enfría. También la luz parpadea.” ¿Cuál es <i>el</i> oficio? Un sistema mejor partiría el pedido en dos.', '“The fridge isn\'t cooling. Also the light flickers.” Which is <i>the</i> trade? A better system would split it in two.')],
    4: [t('Errores reales del modelo', 'Real model mistakes'), t('Solo 3. Leyéndolos, incluso estos tienen etiquetas dudosas.', 'Only 3. Reading them, even these have doubtful labels.')] };
  $('#errs').innerHTML = Object.entries(G).map(([k, [h, d]]) => { const e = J.errors[k] || { n: 0, ex: [] }; return `<div class="card slip"><b class="n">${e.n}</b> <b>${h}</b><p style="margin:4px 0;font-size:14px">${d}</p><div class="ex">${e.ex.slice(0, 2).map((x) => `“${esc(x[0])}” <span class="muted">${t('etiqueta', 'label')} ${HV.trade(x[1])} · ${t('modelo', 'model')} ${HV.trade(x[3])}</span>`).join('<br>')}</div></div>`; }).join('');
}
function setupCov() {
  const C = J.coverage, r = $('#cov');
  const up = () => { const c = C[+r.value]; $('#covv').textContent = nf(c.th, 1);
    $('#covs').innerHTML = `<div><b>${pct(c.auto, 1)}</b>${t('resuelve solo', 'handled alone')}</div><div><b>${pct(c.acc, 1)}</b>${t('de acierto en esos', 'accuracy on those')}</div><div><b>${c.human}</b>${t('de 1.400 van a una persona', 'of 1,400 go to a person')}</div>`; };
  r.oninput = up; up();
}

// ------------------------------------------------------------------ emergency
function drawRules() {
  const R = M.rules;
  $('#rl').innerHTML = Object.entries(R).map(([k, ps]) => `<div style="margin-bottom:9px"><b style="font-size:13.5px">${HV.rule(k)}</b> <span class="muted mono" style="font-size:11.5px">${ps.length} ${t('patrones', 'patterns')}</span><br>${ps.slice(0, 2).map((p) => `<code style="font-size:11px;word-break:break-all">${esc(p.length > 70 ? p.slice(0, 70) + '…' : p)}</code>`).join(' ')}</div>`).join('');
}
function setupNorm() {
  const run = () => { const x = $('#nin').value, n = E.normalise(x), hits = E.matchRules(x, true);
    const a = x.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z]+|[^a-z]+/g) || [], b = n.match(/[a-z]+|[^a-z]+/g) || [];
    $('#nout').innerHTML = `<div class="mono" style="font-size:13.5px;line-height:1.8">${b.map((w, i) => (a[i] && a[i] !== w ? `<span style="background:var(--em-soft);border-radius:3px;padding:0 3px" title="${esc(a[i])}">${esc(w)}</span>` : esc(w))).join('')}</div>
      <div style="margin-top:8px">${hits.length ? hits.map((h) => `<span class="tag solid" style="margin:2px">${HV.rule(h.cat)}</span> <code>${esc(h.match)}</code>`).join('<br>') : `<span class="muted">${t('Ninguna regla coincide', 'No rule matches')}</span>`}</div>
      <p class="cap">${t('Resaltado: palabras corregidas (“cabon” → “carbon”). Solo se corrigen palabras de 5+ letras, con la misma primera letra y ≥ 85% de parecido a una palabra clave. La primera versión, más suelta, convertía “pared” en “sparked”.', 'Highlighted: corrected words (“cabon” → “carbon”). Only words of 5+ letters, with the same first letter and ≥ 85% similar to a key word, are corrected. The first, looser version turned “pared” (wall) into “sparked”.')}</p>`; };
  $('#nin').oninput = run; run();
}
let prMode = 'c';
function setupPR() {
  document.querySelectorAll('#lseg button').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.v === prMode); b.onclick = () => { prMode = b.dataset.v; setupPR(); }; });
  const EM = J.emergency, C = EM.curve, m = prMode, host = $('#pr'); host.innerHTML = '';
  const w = 420, h = 320, L = 44, R = 22, T = 10, B = 36, s = HV.svg(w, h);
  const X = (r) => L + (w - L - R) * r, Y = (p) => T + (h - T - B) * (1 - p);
  for (let k = 0; k <= 4; k++) { HV.el('line', { x1: L, x2: w - R, y1: Y(k / 4), y2: Y(k / 4), class: 'gl' }, s); HV.txt(s, L - 6, Y(k / 4) + 4, pct(k / 4), { 'text-anchor': 'end', 'font-size': 11 }); HV.txt(s, X(k / 4), h - 18, pct(k / 4), { 'text-anchor': 'middle', 'font-size': 11 }); }
  HV.txt(s, (L + w) / 2, h - 2, t('cobertura (emergencias atrapadas)', 'recall (emergencies caught)'), { 'text-anchor': 'middle', 'font-size': 11.5 });
  HV.txt(s, L + 6, T + 14, t('↑ precisión (avisos reales)', '↑ precision (real pages)'), { 'font-size': 11.5 });
  HV.el('polyline', { points: C.map((c) => `${X(c['recall_' + m])},${Y(c['precision_' + m])}`).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.2 }, s);
  const pts = [[EM['intake' + (m === 'c' ? '_c' : '')], t('Recepción hoy', 'Intake today'), 'var(--warn)'], [EM['rules' + (m === 'c' ? '_c' : '')], t('Solo reglas', 'Rules only'), 'var(--blue)']];
  pts.forEach(([p, l, c]) => { const g = HV.el('circle', { cx: X(p.recall), cy: Y(p.precision), r: 7, fill: c, stroke: '#fff', 'stroke-width': 2 }, s); HV.txt(s, X(p.recall) - 10, Y(p.precision) + 4, l, { 'font-size': 12, fill: c, 'font-weight': 600, 'text-anchor': 'end' }); HV.bindTip(g, () => `<b>${l}</b><br>${t('cobertura', 'recall')} ${pct(p.recall)} · ${t('precisión', 'precision')} ${pct(p.precision)}`); });
  const dot = HV.el('circle', { r: 8, fill: 'var(--em)', stroke: '#fff', 'stroke-width': 2 }, s);
  host.appendChild(s);
  const th = $('#th');
  const up = () => { const v = +th.value, c = C.reduce((a, b) => (Math.abs(b.th - v) < Math.abs(a.th - v) ? b : a));
    dot.setAttribute('cx', X(c['recall_' + m])); dot.setAttribute('cy', Y(c['precision_' + m])); $('#thv').textContent = nf(c.th, 2);
    const yes = m === 'c' ? EM.yes_corrected : EM.yes;
    $('#ths').innerHTML = `<div><b class="em">${pct(c['recall_' + m])}</b>${t('de emergencias atrapadas', 'of emergencies caught')}</div><div><b>${pct(c['precision_' + m])}</b>${t('de avisos son reales', 'of pages are real')}</div><div><b>${c['missed_' + m]} / ${yes}</b>${t('emergencias perdidas', 'emergencies missed')}</div><div><b>~${c.pages}</b>${t('avisos por mes', 'pages a month')}</div>`;
    $('#thnote').innerHTML = t(`En la muestra revisada a mano. Recepción hoy: ${pct(EM['intake' + (m === 'c' ? '_c' : '')].recall)} atrapadas, ${pct(EM.intake.precision)} de avisos reales, ~${EM.intake_pages} avisos por mes.`, `On the hand-checked sample. Intake today: ${pct(EM['intake' + (m === 'c' ? '_c' : '')].recall)} caught, ${pct(EM.intake.precision)} of pages real, ~${EM.intake_pages} pages a month.`); };
  th.oninput = up; up();
}

// ------------------------------------------------------------------ waits + vendors
function drawWait() {
  const W = J.wait, host = $('#wh'), w = 900, h = 250, L = 40, R = 10, T = 10, B = 30, s = HV.svg(w, h);
  const n = W.caught.length, mx = 140, bw = (w - L - R) / n;
  const Y = (v) => T + (h - T - B) * (1 - v / mx);
  for (let k = 0; k <= 4; k++) { const v = mx * k / 4; HV.el('line', { x1: L, x2: w - R, y1: Y(v), y2: Y(v), class: 'gl' }, s); HV.txt(s, L - 6, Y(v) + 4, nf(v), { 'text-anchor': 'end', 'font-size': 11 }); }
  for (let i = 0; i < n; i++) {
    const x = L + i * bw;
    const a = HV.el('rect', { x: x + 1, y: Y(Math.min(mx, W.caught[i])), width: bw / 2 - 1, height: h - B - Y(Math.min(mx, W.caught[i])), fill: 'var(--blue)', rx: 1 }, s);
    if (W.caught[i] > mx) HV.txt(s, x + bw / 2 + 4, T + 12, '↑ ' + nf(W.caught[i]), { 'font-size': 11, fill: 'var(--blue)', 'font-weight': 600 });
    const b = HV.el('rect', { x: x + bw / 2, y: Y(W.missed[i]), width: bw / 2 - 1, height: h - B - Y(W.missed[i]), fill: 'var(--em)', rx: 1 }, s);
    const tp = () => `<b>${W.bins[i]}–${W.bins[i + 1]} h</b><br><span style="color:#8db4dc">■</span> ${t('marcadas', 'flagged')}: ${W.caught[i]}<br><span style="color:#f19a7e">■</span> ${t('no marcadas', 'missed')}: ${W.missed[i]}`;
    HV.bindTip(a, tp); HV.bindTip(b, tp);
    if (i % 6 === 0) HV.txt(s, x, h - 10, W.bins[i] + ' h', { 'font-size': 11 });
  }
  s.style.minWidth = '600px';
  HV.txt(s, w - R, h - 10, '72+ h', { 'font-size': 11, 'text-anchor': 'end' });
  host.appendChild(s);
}
function drawWCh() {
  const C = J.wait.by_channel, order = ['email', 'app', 'portal', 'phone'];
  hbars($('#wch'), order.map((k) => ({ label: HV.channel(k), v: C[k].missed, color: k === 'phone' ? 'var(--blue)' : 'var(--em)', tip: `<b>${HV.channel(k)}</b>: ${pct(C[k].missed)} ${t('no marcadas', 'missed')} (${C[k].n} ${t('emergencias', 'emergencies')})` })), { w: 460, labelW: 110, max: 1, fmt: (v) => pct(v) });
}
function drawVendors() {
  const Q = J.vendors.quarterly, qs = [...new Set(Q.map((q) => q.q))];
  const get = (g, f) => qs.map((q) => Q.find((x) => x.q === q && x.group === g)?.[f] ?? null);
  const vi = qs.indexOf('2026Q1') + 2 / 3 - 1 + 1;
  const ser = (f) => [{ name: 'HV01–09 (' + t('cambiaron a Rapid Rooter', 'switched to Rapid Rooter') + ')', color: 'var(--em)', y: get('HV01-09', f), width: 3 }, { name: 'HV10–18 (' + t('siguieron con BlueLine', 'kept BlueLine') + ')', color: 'var(--blue)', y: get('HV10-18', f) }];
  lines($('#vq1'), ser('hours'), qs, { w: 480, h: 230, yfmt: (v) => nf(v, 0) + ' h', vline: qs.indexOf('2026Q1') + 0.66, vlabel: t('marzo 2026', 'March 2026'), ymax: 55 });
  lines($('#vq2'), ser('comeback'), qs, { w: 480, h: 230, yfmt: (v) => pct(v), vline: qs.indexOf('2026Q1') + 0.66, vlabel: t('marzo 2026', 'March 2026'), ymax: 0.45 });
  const D = J.vendors.did, f = (k, g, p) => D[`${g}|${p}`][k];
  const row = (k, l, fm) => { const a = f(k, 'HV01-09', 'after') - f(k, 'HV01-09', 'before'), b = f(k, 'HV10-18', 'after') - f(k, 'HV10-18', 'before');
    return `<tr><td>${l}</td><td class="num">${fm(f(k, 'HV01-09', 'before'))} → ${fm(f(k, 'HV01-09', 'after'))}</td><td class="num">${fm(f(k, 'HV10-18', 'before'))} → ${fm(f(k, 'HV10-18', 'after'))}</td><td class="num"><b class="em">${(a - b >= 0 ? '+' : '') + fm(a - b)}</b></td></tr>`; };
  $('#did').innerHTML = `<table><thead><tr><th>${t('Plomería, primera visita', 'Plumbing, first visit')}</th><th class="num">HV01–09 (${t('antes → después', 'before → after')})</th><th class="num">HV10–18 (${t('antes → después', 'before → after')})</th><th class="num">${t('Efecto del cambio', 'Effect of the switch')}</th></tr></thead><tbody>
    ${row('hours', t('Mediana de horas para terminar', 'Median hours to complete'), (v) => nf(v, 1) + ' h')}${row('comeback', t('Vuelven a pedirlo en 30 días', 'Re-requested within 30 days'), (v) => pct(v, 1))}${row('cost', t('Costo promedio por trabajo', 'Average cost per job'), (v) => 'US$ ' + nf(v, 0))}</tbody></table>`;
}

// ------------------------------------------------------------------ scroll spy + boot
function spy() {
  const links = [...document.querySelectorAll('#tabs a')];
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.toggle('on', l.dataset.s === e.target.id)); const on = links.find((l) => l.dataset.s === e.target.id); on?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }), { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('main section').forEach((s) => io.observe(s));
}
(async function () {
  [M, J] = await Promise.all([fetch('model.json').then((r) => r.json()), fetch('case.json').then((r) => r.json())]);
  E = HarborviewTriage.Engine(M);
  document.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => { HV.setLang(b.dataset.lang); render(); }));
  HV.setLang(HV.lang); render();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
