// ---------------------------------------------------------------
// Personalize per client here. Everything else reads from this.
// Text that starts with @ is a translation key (see i18n.js).
// ---------------------------------------------------------------
window.CRM_CONFIG = {
  brand: 'Nexo CRM',          // product name shown in the header
  company: 'Estudio Demo',    // client business name
  accent: '#4fd1c5',          // main accent color (any hex)
  theme: 'dark',              // 'dark' | 'light'
  currency: 'USD',            // ISO code used for money formatting
  locale: 'es-AR',            // number/date formatting in Spanish
  lang: 'es',                 // default UI language: 'es' | 'en'
  user: { name: 'Kevin Leichen', role: 'Admin' },
  // Sales team. Owners in data.js must match these names.
  team: [
    { name: 'Kevin Leichen', role: 'Admin' },
    { name: 'Ana Paz', role: 'Ventas' },
    { name: 'Leo Ríos', role: 'Ventas' },
  ],
  // Deal pipeline stages, in order. Keep the ids 'won' and 'lost'.
  stages: [
    { id: 'lead',        es: 'Lead',        en: 'Lead',        prob: 10,  color: 'var(--info)' },
    { id: 'qualified',   es: 'Calificado',  en: 'Qualified',   prob: 25,  color: 'var(--violet)' },
    { id: 'proposal',    es: 'Propuesta',   en: 'Proposal',    prob: 50,  color: 'var(--accent)' },
    { id: 'negotiation', es: 'Negociación', en: 'Negotiation', prob: 75,  color: 'var(--warn)' },
    { id: 'won',         es: 'Ganado',      en: 'Won',         prob: 100, color: 'var(--good)' },
    { id: 'lost',        es: 'Perdido',     en: 'Lost',        prob: 0,   color: 'var(--bad)' },
  ],
  monthlyTarget: 120000,      // revenue goal shown on the dashboard
};
