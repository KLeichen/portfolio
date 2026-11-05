// Home page content that is not plain UI text: per-project colors, the hero chart,
// the "how I work" steps and the tool groups. Kept out of i18n/ui.ts on purpose.
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

/** Each project keeps its own identity on the home page: accent, paper colour, field and method. */
export const themes: Record<string, { accent: string; paper: string; short: L; field: L; method: L }> = {
  'northgate-ausencias': {
    short: { es: 'Veterinaria', en: 'Vet clinic' },
    accent: '#3fbfb3', paper: '#f3f5f4',
    field: { es: 'Salud animal', en: 'Veterinary care' },
    method: { es: 'Clasificación + política', en: 'Classification + policy' },
  },
  'panaderia-demanda': {
    short: { es: 'Panadería', en: 'Bakery' },
    accent: '#e0a443', paper: '#f6efe3',
    field: { es: 'Gastronomía', en: 'Food retail' },
    method: { es: 'Pronóstico + optimización', en: 'Forecasting + optimisation' },
  },
  'test-ab-registro': {
    short: { es: 'Test A/B', en: 'A/B test' },
    accent: '#f07a48', paper: '#f3f6f5',
    field: { es: 'Suscripciones', en: 'Subscriptions' },
    method: { es: 'Experimento A/B', en: 'A/B experiment' },
  },
  'triage-mantenimiento': {
    short: { es: 'Triage NLP', en: 'NLP triage' },
    accent: '#6ea6dc', paper: '#f3f0e8',
    field: { es: 'Inmobiliaria', en: 'Property management' },
    method: { es: 'NLP bilingüe', en: 'Bilingual NLP' },
  },
};
export const fallbackTheme = {
  accent: '#4fd1c5', paper: '#ffffff', short: { es: 'Proyecto', en: 'Project' },
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
      es: 'Antes de modelar, busco lo que está roto: duplicados, husos horarios, códigos que cambian, ventas que el sistema no ve.',
      en: 'Before modelling I look for what is broken: duplicates, time zones, codes that change, sales the till never saw.',
    },
    example: { es: 'Demanda oculta en días agotados', en: 'Hidden demand on sold-out days' },
  },
  {
    title: { es: 'Modelar con honestidad', en: 'Model honestly' },
    desc: {
      es: 'Comparo siempre contra lo que el equipo ya hace, y valido en datos que el modelo nunca vio.',
      en: 'I always compare against what the team already does, and validate on data the model never saw.',
    },
    example: { es: '13 ventanas de backtest', en: '13 backtest windows' },
  },
  {
    title: { es: 'Traducir a plata', en: 'Put a price on it' },
    desc: {
      es: 'Un buen modelo no alcanza: traduzco cada opción a costo, ganancia o tiempo para decidir.',
      en: 'A good model is not enough: I turn every option into cost, profit or time so the decision is clear.',
    },
    example: { es: '+25% registros, pero −10% ingresos', en: '+25% signups, but −10% revenue' },
  },
  {
    title: { es: 'Dejar una herramienta', en: 'Leave a tool behind' },
    desc: {
      es: 'Cierro con algo que el equipo usa el lunes: un planificador, un tablero o una lista priorizada.',
      en: 'I finish with something the team uses on Monday: a planner, a dashboard or a ranked list.',
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
    role: 'Científico de datos',
    roleSub: 'Estudiante de 3.er año de Ciencias de Datos · Universidad Austral',
    lede: 'Convierto datos desordenados en decisiones con números.',
    pitch: 'Auditoría de datos, modelos predictivos, experimentos y herramientas interactivas, siempre comparados contra lo que el equipo ya hace.',
    seeCases: 'Ver casos',
    fig1: 'Fig. 1 · Antes y después, por caso',
    fig1Before: 'cómo se hacía',
    fig1After: 'con mi trabajo',
    fig1Hint: 'Pasá el mouse por una fila · clic para abrir el caso',
    casesTitle: 'Casos',
    casesSub: 'Problemas de negocio resueltos de punta a punta. Pasá el mouse por una fila para ver el resumen; cada caso tiene su propio diseño y una herramienta para probar.',
    cols: ['caso', 'sector', 'método', 'resultado_clave'],
    shape: (r: number) => `${r} filas × 4 columnas`,
    open: 'Abrir caso',
    tool: 'herramienta interactiva',
    processTitle: 'Cómo trabajo',
    processSub: 'El mismo pipeline en cada caso: del dato crudo a algo que el equipo usa el lunes.',
    example: 'ej.',
    heatTitle: 'Herramientas, por caso',
    heatSub: 'Lo que usé en cada proyecto publicado. Pasá el mouse por una celda.',
    heatTotal: 'casos',
    heatAlso: 'También uso:',
    heatUsed: (tool: string, c: string) => `${tool} · usado en ${c}`,
    aboutTitle: 'Sobre mí',
    fig2: 'Fig. 2 · Trayectoria',
    now: 'hoy',
    kv: { year: 'año_de_carrera', cases: 'casos_publicados', english: 'nivel_de_inglés', city: 'ciudad' },
    contactTitle: '¿Tenés un problema con datos?',
    contactSub: 'Contame qué querés entender o decidir, y vemos cómo te pueden ayudar los datos.',
    send: 'enviar()',
    build: 'Último build',
  },
  en: {
    status: 'open_to_work',
    role: 'Data scientist',
    roleSub: 'Third-year Data Science student · Universidad Austral',
    lede: 'I turn messy data into decisions backed by numbers.',
    pitch: 'Data audits, predictive models, experiments and interactive tools, always measured against what the team already does.',
    seeCases: 'See the cases',
    fig1: 'Fig. 1 · Before and after, by case',
    fig1Before: 'how it was done',
    fig1After: 'with my work',
    fig1Hint: 'Hover a row · click to open the case',
    casesTitle: 'Case studies',
    casesSub: 'Business problems solved end to end. Hover a row for the summary; each case has its own design and a tool to try.',
    cols: ['case', 'field', 'method', 'key_result'],
    shape: (r: number) => `${r} rows × 4 columns`,
    open: 'Open case',
    tool: 'interactive tool',
    processTitle: 'How I work',
    processSub: 'The same pipeline every time: from raw data to something the team uses on Monday.',
    example: 'e.g.',
    heatTitle: 'Tools, by case',
    heatSub: 'What I used in each published project. Hover a cell.',
    heatTotal: 'cases',
    heatAlso: 'Also use:',
    heatUsed: (tool: string, c: string) => `${tool} · used in ${c}`,
    aboutTitle: 'About me',
    fig2: 'Fig. 2 · Timeline',
    now: 'now',
    kv: { year: 'year_of_degree', cases: 'cases_published', english: 'english_level', city: 'city' },
    contactTitle: 'Have a data problem?',
    contactSub: "Tell me what you want to understand or decide, and we'll see how data can help.",
    send: 'send()',
    build: 'Last build',
  },
};
