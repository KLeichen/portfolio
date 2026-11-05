// Home page content that is not plain UI text: per-project colors, the hero chart,
// the "how I work" steps and the tool groups. Kept out of i18n/ui.ts on purpose.
import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

/** Each project keeps its own identity on the home page: accent, paper colour, field and method. */
export const themes: Record<string, { accent: string; paper: string; field: L; method: L }> = {
  'northgate-ausencias': {
    accent: '#3fbfb3', paper: '#f3f5f4',
    field: { es: 'Salud animal', en: 'Veterinary care' },
    method: { es: 'Clasificación + política', en: 'Classification + policy' },
  },
  'panaderia-demanda': {
    accent: '#e0a443', paper: '#f6efe3',
    field: { es: 'Gastronomía', en: 'Food retail' },
    method: { es: 'Pronóstico + optimización', en: 'Forecasting + optimisation' },
  },
  'test-ab-registro': {
    accent: '#f07a48', paper: '#f3f6f5',
    field: { es: 'Suscripciones', en: 'Subscriptions' },
    method: { es: 'Experimento A/B', en: 'A/B experiment' },
  },
  'triage-mantenimiento': {
    accent: '#6ea6dc', paper: '#f3f0e8',
    field: { es: 'Inmobiliaria', en: 'Property management' },
    method: { es: 'NLP bilingüe', en: 'Bilingual NLP' },
  },
};
export const fallbackTheme = {
  accent: '#4fd1c5', paper: '#ffffff',
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

export const copy = {
  es: {
    eyebrow: 'Ciencia de datos · Buenos Aires',
    status: 'Buscando mi primer rol',
    nameA: 'Kevin',
    nameB: 'Leichen',
    lede: 'Convierto datos desordenados en',
    ledeEm: 'decisiones con números.',
    pitch: 'Análisis, modelos predictivos y herramientas interactivas, siempre comparados contra lo que el equipo ya hace.',
    chartTitle: 'Antes y después, en cada caso',
    chartBefore: 'Cómo se hacía',
    chartAfter: 'Con mi trabajo',
    chartHint: 'Pasá el mouse por una fila para ver el detalle · clic para abrir el caso',
    projectsEyebrow: 'Casos',
    projectsTitle: 'Problemas reales de negocio, resueltos de punta a punta',
    projectsSub: 'Cada caso tiene su propio diseño y una herramienta interactiva para probar.',
    open: 'Ver el caso',
    seeCases: 'Ver casos',
    tryTool: 'Incluye herramienta interactiva',
    processEyebrow: 'Cómo trabajo',
    processTitle: 'Del dato crudo a una decisión',
    example: 'Ej.',
    toolsEyebrow: 'Herramientas',
    usedIn: (n: number) => (n === 0 ? 'Lo uso a diario' : n === 1 ? 'Usado en 1 caso' : `Usado en ${n} casos`),
    aboutEyebrow: 'Sobre mí',
    contactEyebrow: 'Contacto',
    contactTitle: '¿Tenés un problema con datos?',
    contactSub: 'Contame qué querés entender o decidir, y vemos cómo te pueden ayudar los datos.',
  },
  en: {
    eyebrow: 'Data science · Buenos Aires',
    status: 'Looking for my first role',
    nameA: 'Kevin',
    nameB: 'Leichen',
    lede: 'I turn messy data into',
    ledeEm: 'decisions backed by numbers.',
    pitch: 'Analysis, predictive models and interactive tools, always measured against what the team already does.',
    chartTitle: 'Before and after, case by case',
    chartBefore: 'How it was done',
    chartAfter: 'With my work',
    chartHint: 'Hover a row to see the detail · click to open the case',
    projectsEyebrow: 'Case studies',
    projectsTitle: 'Real business problems, solved end to end',
    projectsSub: 'Each case has its own design and an interactive tool to try.',
    open: 'Open the case',
    seeCases: 'See the cases',
    tryTool: 'Includes an interactive tool',
    processEyebrow: 'How I work',
    processTitle: 'From raw data to a decision',
    example: 'e.g.',
    toolsEyebrow: 'Tools',
    usedIn: (n: number) => (n === 0 ? 'Part of my daily kit' : n === 1 ? 'Used in 1 case' : `Used in ${n} cases`),
    aboutEyebrow: 'About',
    contactEyebrow: 'Contact',
    contactTitle: 'Have a data problem?',
    contactSub: "Tell me what you want to understand or decide, and we'll see how data can help.",
  },
};
