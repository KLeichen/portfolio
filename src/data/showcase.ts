// Home page content that is not plain UI text: per-project colors, the hero chart,
// the "how I work" steps and the tool groups. Kept out of i18n/ui.ts on purpose.
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

/** Each project keeps its own identity on the home page: accent, paper colour, field and method. */
export const themes: Record<string, { accent: string; paper: string; short: L; field: L; method: L; tags: string[] }> = {
  'northgate-ausencias': {
    tags: ['classification', 'ml'],
    short: { es: 'Veterinaria', en: 'Vet clinic' },
    accent: '#3fbfb3', paper: '#f3f5f4',
    field: { es: 'Salud animal', en: 'Veterinary care' },
    method: { es: 'Clasificación + política', en: 'Classification + policy' },
  },
  'panaderia-demanda': {
    tags: ['forecasting', 'optimisation', 'ml'],
    short: { es: 'Panadería', en: 'Bakery' },
    accent: '#e0a443', paper: '#f6efe3',
    field: { es: 'Gastronomía', en: 'Food retail' },
    method: { es: 'Pronóstico + optimización', en: 'Forecasting + optimisation' },
  },
  'test-ab-registro': {
    tags: ['experiments', 'statistics'],
    short: { es: 'Test A/B', en: 'A/B test' },
    accent: '#f07a48', paper: '#f3f6f5',
    field: { es: 'Suscripciones', en: 'Subscriptions' },
    method: { es: 'Experimento A/B', en: 'A/B experiment' },
  },
  'triage-mantenimiento': {
    tags: ['nlp', 'classification', 'ml'],
    short: { es: 'Triage NLP', en: 'NLP triage' },
    accent: '#6ea6dc', paper: '#f3f0e8',
    field: { es: 'Inmobiliaria', en: 'Property management' },
    method: { es: 'NLP bilingüe', en: 'Bilingual NLP' },
  },
};
export const fallbackTheme = {
  tags: [] as string[], accent: '#4fd1c5', paper: '#ffffff', short: { es: 'Proyecto', en: 'Project' },
  field: { es: 'Proyecto', en: 'Project' }, method: { es: 'Ciencia de datos', en: 'Data science' },
};

/** Hero chart: one before/after pair per project, on a 0–100 scale where higher is better. */
export const heroMetrics: {
  page: string; before: number; after: number; label: L; beforeLabel: L; afterLabel: L; detail: L;
}[] = [
  {
    page: 'triage-mantenimiento', before: 56, after: 100,
    label: { es: 'Emergencias detectadas', en: 'Emergencies caught' },
    beforeLabel: { es: 'Lectura manual: 18 de 32', en: 'Manual intake: 18 of 32' },
    afterLabel: { es: 'Modelo de texto: 32 de 32', en: 'Text model: 32 of 32' },
    detail: {
      es: 'Clasifica cada pedido de mantenimiento al llegar, en inglés o español, y avisa a la guardia.',
      en: 'Reads each maintenance request on arrival, in English or Spanish, and pages on-call.',
    },
  },
  {
    page: 'northgate-ausencias', before: 27, after: 48,
    label: { es: 'Ausencias alcanzadas con 40 llamadas', en: 'No-shows reached with 40 calls' },
    beforeLabel: { es: 'Llamando al azar: 27%', en: 'Calling at random: 27%' },
    afterLabel: { es: 'Priorizando con el modelo: 48%', en: 'Model-ranked list: 48%' },
    detail: {
      es: 'El mismo esfuerzo de recepción llega a casi el doble de turnos que se iban a perder.',
      en: 'The same front-desk effort reaches almost twice as many appointments at risk.',
    },
  },
  {
    page: 'panaderia-demanda', before: 67.5, after: 78.6,
    label: { es: 'Precisión del pronóstico (1 − WAPE)', en: 'Forecast accuracy (1 − WAPE)' },
    beforeLabel: { es: 'Regla actual: error 32.5%', en: 'Current rule: 32.5% error' },
    afterLabel: { es: 'Mi pronóstico: error 21.4%', en: 'My forecast: 21.4% error' },
    detail: {
      es: 'Validado en 13 ventanas pasadas; en la prueba real dio +6.9% de ganancia.',
      en: 'Validated on 13 past windows; +6.9% profit in the live test.',
    },
  },
];

export const process: { title: L; desc: L; example: L }[] = [
  {
    title: { es: 'Auditar los datos', en: 'Audit the data' },
    desc: {
      es: 'Busco lo roto antes de modelar: duplicados, husos horarios, códigos que cambian.',
      en: 'I find what is broken before modelling: duplicates, time zones, codes that change.',
    },
    example: { es: 'Demanda oculta en días agotados', en: 'Hidden demand on sold-out days' },
  },
  {
    title: { es: 'Modelar con honestidad', en: 'Model honestly' },
    desc: {
      es: 'Comparo contra lo que el equipo ya hace y valido en datos nuevos.',
      en: 'Compared against what the team already does, validated on unseen data.',
    },
    example: { es: '13 ventanas de backtest', en: '13 backtest windows' },
  },
  {
    title: { es: 'Traducir a plata', en: 'Put a price on it' },
    desc: {
      es: 'Traduzco cada opción a costo, ganancia o tiempo para poder decidir.',
      en: 'Every option turned into cost, profit or time, so the choice is clear.',
    },
    example: { es: '+25% registros, pero −10% ingresos', en: '+25% signups, but −10% revenue' },
  },
  {
    title: { es: 'Dejar una herramienta', en: 'Leave a tool behind' },
    desc: {
      es: 'Cierro con algo que el equipo usa: un planificador, un tablero o una lista.',
      en: 'It ends with something the team uses: a planner, a dashboard or a ranked list.',
    },
    example: { es: 'Planificador de horneado', en: 'Bake planner' },
  },
];

export const toolGroups: { name: L; tools: string[] }[] = [
  { name: { es: 'Lenguajes', en: 'Languages' }, tools: ['Python', 'SQL', 'R', 'JavaScript'] },
  { name: { es: 'Análisis', en: 'Analysis' }, tools: ['pandas', 'NumPy', 'SciPy', 'matplotlib'] },
  { name: { es: 'Modelos', en: 'Modelling' }, tools: ['scikit-learn', 'TF-IDF', 'regex'] },
  { name: { es: 'Entrega', en: 'Delivery' }, tools: ['Jupyter', 'Git', 'Astro'] },
];

/** Where each headline number comes from, in the same order as the project's highlights. */
export const sources: Record<string, L[]> = {
  'northgate-ausencias': [
    { es: '03_eda.ipynb · celda 1', en: '03_eda.ipynb · cell 1' },
    { es: '04_model.ipynb · celda 7 (back-test de 26 semanas)', en: '04_model.ipynb · cell 7 (26-week back-test)' },
    { es: '05_policy.ipynb · RECOMMENDATIONS.md', en: '05_policy.ipynb · RECOMMENDATIONS.md' },
  ],
  'panaderia-demanda': [
    { es: 'Prueba real de 2 semanas (15–28 oct), medida con las ventas reales', en: 'Live 2-week test (15–28 Oct), scored on real sales' },
    { es: 'Prueba real de 2 semanas (15–28 oct), medida con las ventas reales', en: 'Live 2-week test (15–28 Oct), scored on real sales' },
    { es: '04_losses.ipynb · REPORT.md', en: '04_losses.ipynb · REPORT.md' },
  ],
  'test-ab-registro': [
    { es: '05_conversion.ipynb · celda 3', en: '05_conversion.ipynb · cell 3' },
    { es: '06_after_signup.ipynb · MESSAGE_TO_PRIYA.md', en: '06_after_signup.ipynb · MESSAGE_TO_PRIYA.md' },
    { es: '06_after_signup.ipynb · MESSAGE_TO_PRIYA.md', en: '06_after_signup.ipynb · MESSAGE_TO_PRIYA.md' },
  ],
  'triage-mantenimiento': [
    { es: '07_nlp4_evaluation.ipynb · celda 12', en: '07_nlp4_evaluation.ipynb · cell 12' },
    { es: '11_score_new_requests.ipynb · revisado con las etiquetas de la clienta', en: "11_score_new_requests.ipynb · checked against the client's labels" },
    { es: '09_emergency_response.ipynb · celda 5', en: '09_emergency_response.ipynb · cell 5' },
  ],
};
export const heroSources: Record<string, L> = {
  'triage-mantenimiento': { es: '11_score_new_requests.ipynb', en: '11_score_new_requests.ipynb' },
  'northgate-ausencias': { es: '04_model.ipynb · celda 7', en: '04_model.ipynb · cell 7' },
  'panaderia-demanda': { es: 'Prueba real de 2 semanas, medida con las ventas reales', en: 'Live 2-week test, scored on real sales' },
};
export const focusValues = ['all', 'nlp', 'classification', 'forecasting', 'experiments', 'optimisation'];

export const processFns = ['audit(raw)', 'fit(model, baseline)', 'to_money(results)', 'ship(tool)'];

/** Career timeline for the gantt chart (months as YYYY-MM; end null = ongoing). */
export const career: { start: string; end: string | null; label: L; where: L; kind: 'study' | 'work' }[] = [
  { start: '2024-03', end: null, kind: 'study', label: { es: 'Lic. en Ciencias de Datos', en: 'BSc in Data Science' }, where: { es: 'Universidad Austral · 2024 – hoy', en: 'Universidad Austral · 2024 – now' } },
  { start: '2025-01', end: '2025-01', kind: 'work', label: { es: 'Data & Cataloging Assistant', en: 'Data & Cataloging Assistant' }, where: { es: 'Empresa numismática · Ene 2025', en: 'Numismatics company · Jan 2025' } },
  { start: '2024-01', end: '2024-02', kind: 'work', label: { es: 'Data Operations Analyst', en: 'Data Operations Analyst' }, where: { es: 'Plataforma de restaurantes · Ene – Feb 2024', en: 'Restaurant platform · Jan – Feb 2024' } },
];

export const copy = {
  es: {
    status: 'open_to_work',
    run: 'Ejecutar',
    runLabel: 'Código editable: cambiá los argumentos y ejecutalo',
    tryLabel: 'Probá:',
    src: 'fuente:',
    out: {
      header: (n: number, focus: string) => `${n} ${n === 1 ? 'caso' : 'casos'} con focus="${focus}"`,
      none: (focus: string) => `0 casos con focus="${focus}" (todavía)`,
      badFocus: (f: string, list: string) => `ValueError: focus="${f}" no es válido. Opciones: ${list}`,
      switching: 'Cambiando a inglés…',
      same: 'Ya estás en español.',
      badLang: (v: string) => `ValueError: lang="${v}" no es válido. Opciones: "es", "en"`,
    },
    runsTitle: 'Mis corridas, analizadas',
    runsSub: (n: number, km: number) => `Un proyecto propio: ${n} corridas y ${km} km desde marzo, exportadas de Strava. Cambiá el eje para ver qué explica mi ritmo.`,
    fig3: 'Fig. 3 · Ritmo por corrida',
    runsAxis: 'Eje x',
    runsModes: { date: 'fecha', temp: 'temperatura', km: 'distancia' },
    runsStat: (mode: 'date' | 'temp' | 'km', s: { b: number; r: number; n: number }) =>
      `pendiente ${s.b > 0 ? '+' : ''}${s.b.toFixed(1)} s/km ${mode === 'date' ? 'cada 30 días' : mode === 'temp' ? 'por °C' : 'por km'} · r = ${s.r.toFixed(2)} · n = ${s.n}`,
    runsF1: (b: number) => `de ritmo según la recta: unos ${b.toFixed(0)} s/km más rápido por mes desde marzo.`,
    runsF2: (n: number) => `entre ritmo y temperatura en ${n} corridas: el calor no me frena, o todavía no hay datos para verlo.`,
    runsF3: 'entre distancia y ritmo: las corridas largas son más lentas, como era de esperar.',
    role: 'Científico de datos en Buenos Aires',
    mainAction: 'Enviar un mensaje',
    roleSub: 'Estudiante de 3.er año de Ciencias de Datos · Universidad Austral',
    lede: 'Convierto datos desordenados en decisiones con números.',
    pitch: 'Auditoría de datos, modelos predictivos, experimentos y herramientas interactivas, siempre comparados contra lo que el equipo ya hace.',
    seeCases: 'Ver casos',
    fig1: 'Fig. 1 · Antes y después, por caso',
    fig1Before: 'cómo se hacía',
    fig1After: 'con mi trabajo',
    fig1Hint: 'Pasá el mouse por una fila · clic para abrir el caso',
    casesTitle: (n: number) => `${n} casos de ciencia de datos`,
    casesSub: 'Problemas de negocio resueltos de punta a punta, cada uno con una herramienta interactiva.',
    cols: ['caso', 'sector', 'método', 'resultado_clave'],
    shape: (r: number) => `${r} filas × 4 columnas`,
    open: 'Abrir caso',
    tool: 'herramienta interactiva',
    processTitle: 'Mi proceso de trabajo',
    processSub: 'Los mismos cuatro pasos en cada caso, del dato crudo a una herramienta.',
    example: 'ej.',
    heatTitle: 'Herramientas usadas en cada caso',
    heatSub: 'Sale de los proyectos publicados; cada celda marca una herramienta usada en ese caso.',
    heatTotal: 'casos',
    heatAlso: 'También uso:',
    heatUsed: (tool: string, c: string) => `${tool} · usado en ${c}`,
    aboutTitle: 'Sobre mí',
    fig2: 'Fig. 2 · Trayectoria',
    now: 'hoy',
    kv: { year: 'año_de_carrera', cases: 'casos_publicados', english: 'nivel_de_inglés', city: 'ciudad' },
    contactTitle: 'Contacto para empleo y proyectos',
    contactSub: 'Contame qué querés entender o decidir, y vemos cómo te pueden ayudar los datos.',
    send: 'enviar()',
    build: 'Último build',
  },
  en: {
    status: 'open_to_work',
    run: 'Run',
    runLabel: 'Editable code: change the arguments and run it',
    tryLabel: 'Try:',
    src: 'source:',
    out: {
      header: (n: number, focus: string) => `${n} ${n === 1 ? 'case' : 'cases'} with focus="${focus}"`,
      none: (focus: string) => `0 cases with focus="${focus}" (yet)`,
      badFocus: (f: string, list: string) => `ValueError: focus="${f}" is not valid. Options: ${list}`,
      switching: 'Switching to Spanish…',
      same: 'You are already reading it in English.',
      badLang: (v: string) => `ValueError: lang="${v}" is not valid. Options: "es", "en"`,
    },
    runsTitle: 'My own running data, analysed',
    runsSub: (n: number, km: number) => `A side project: ${n} runs and ${km} km since March, exported from Strava. Switch the axis to see what explains my pace.`,
    fig3: 'Fig. 3 · Pace per run',
    runsAxis: 'x axis',
    runsModes: { date: 'date', temp: 'temperature', km: 'distance' },
    runsStat: (mode: 'date' | 'temp' | 'km', s: { b: number; r: number; n: number }) =>
      `slope ${s.b > 0 ? '+' : ''}${s.b.toFixed(1)} s/km ${mode === 'date' ? 'per 30 days' : mode === 'temp' ? 'per °C' : 'per km'} · r = ${s.r.toFixed(2)} · n = ${s.n}`,
    runsF1: (b: number) => `fitted pace: about ${b.toFixed(0)} s/km faster each month since March.`,
    runsF2: (n: number) => `between pace and temperature over ${n} runs: heat doesn't slow me down, or there isn't enough data to see it yet.`,
    runsF3: 'between distance and pace: longer runs are slower, as expected.',
    role: 'Data scientist in Buenos Aires',
    mainAction: 'Send a message',
    roleSub: 'Third-year Data Science student · Universidad Austral',
    lede: 'I turn messy data into decisions backed by numbers.',
    pitch: 'Data audits, predictive models, experiments and interactive tools, always measured against what the team already does.',
    seeCases: 'See the cases',
    fig1: 'Fig. 1 · Before and after, by case',
    fig1Before: 'how it was done',
    fig1After: 'with my work',
    fig1Hint: 'Hover a row · click to open the case',
    casesTitle: (n: number) => `${n} data science case studies`,
    casesSub: 'Business problems solved end to end, each with an interactive tool.',
    cols: ['case', 'field', 'method', 'key_result'],
    shape: (r: number) => `${r} rows × 4 columns`,
    open: 'Open case',
    tool: 'interactive tool',
    processTitle: 'My working process',
    processSub: 'The same four steps in every case, from raw data to a tool.',
    example: 'e.g.',
    heatTitle: 'Tools used in each case',
    heatSub: 'Built from the published projects; each filled cell is a tool used in that case.',
    heatTotal: 'cases',
    heatAlso: 'Also use:',
    heatUsed: (tool: string, c: string) => `${tool} · used in ${c}`,
    aboutTitle: 'About me',
    fig2: 'Fig. 2 · Timeline',
    now: 'now',
    kv: { year: 'year_of_degree', cases: 'cases_published', english: 'english_level', city: 'city' },
    contactTitle: 'Contact for jobs and projects',
    contactSub: "Tell me what you want to understand or decide, and we'll see how data can help.",
    send: 'send()',
    build: 'Last build',
  },
};
