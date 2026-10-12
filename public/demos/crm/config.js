// ---------------------------------------------------------------
// Personalize per client here. Everything else reads from this.
// ---------------------------------------------------------------
window.CRM_CONFIG = {
  brand: 'Nexo CRM',          // product name shown in the sidebar
  company: 'Estudio Demo',    // client business name
  logoLetter: 'N',            // letter inside the logo badge
  accent: '#4fd1c5',          // main accent color
  currency: 'USD',            // ISO code used for money formatting
  locale: 'es-AR',            // number/date formatting
  lang: 'es',                 // default UI language: 'es' | 'en'
  user: { name: 'Kevin Leichen', role: 'Admin', initials: 'KL' },
  // Deal pipeline stages (order matters). id must be unique.
  stages: [
    { id: 'lead',        es: 'Lead',          en: 'Lead',          prob: 10 },
    { id: 'qualified',   es: 'Calificado',    en: 'Qualified',     prob: 25 },
    { id: 'proposal',    es: 'Propuesta',     en: 'Proposal',      prob: 50 },
    { id: 'negotiation', es: 'Negociación',   en: 'Negotiation',   prob: 75 },
    { id: 'won',         es: 'Ganado',        en: 'Won',           prob: 100 },
    { id: 'lost',        es: 'Perdido',       en: 'Lost',          prob: 0 },
  ],
  monthlyTarget: 120000,      // revenue goal shown on the dashboard
};
