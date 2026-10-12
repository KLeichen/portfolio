// Sample data, generated from a fixed seed and anchored to today's date
// so the demo always looks current. Replace with real data per client.
window.CRM_SEED = (function () {
  let s = 20261011;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const day = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const offset = (n) => iso(today.getTime() + n * day);

  const cities = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Montevideo', 'Santiago', 'La Plata', 'Neuquén'];
  const companyNames = ['Andes Analytics', 'Puerto Verde', 'Lumen Salud', 'Rutas del Sur', 'Campo Claro', 'Brújula Viajes',
    'Faro Finanzas', 'Aula Viva', 'Nodo Retail', 'Cumbre Logística', 'Pampa Foods', 'Delta Seguros', 'Quanta Labs', 'Sierra Motors'];
  const first = ['Lucía', 'Martín', 'Sofía', 'Joaquín', 'Valentina', 'Tomás', 'Camila', 'Nicolás', 'Julieta', 'Federico',
    'Agustina', 'Mateo', 'Florencia', 'Santiago', 'Paula', 'Diego', 'Carla', 'Ignacio', 'Micaela', 'Bruno'];
  const last = ['García', 'Fernández', 'López', 'Martínez', 'Romero', 'Sosa', 'Álvarez', 'Torres', 'Ruiz', 'Benítez',
    'Acosta', 'Medina', 'Herrera', 'Castro', 'Rojas', 'Molina', 'Ortiz', 'Silva'];
  const titles = ['CEO', 'CFO', 'Gerente de Compras', 'Head of Data', 'Gerente Comercial', 'COO', 'Jefa de Marketing', 'CTO', 'Analista Senior'];
  const owners = ['Kevin Leichen', 'Ana Paz', 'Leo Ríos'];
  const sources = ['Web', 'Referido', 'LinkedIn', 'Evento', 'Email', 'Llamada'];

  const companies = companyNames.map((name, i) => ({
    id: 'co' + (i + 1), name,
    industry: ['Software', 'Agro', 'Salud', 'Logística', 'Agro', 'Turismo', 'Finanzas', 'Educación', 'Retail', 'Logística', 'Alimentos', 'Finanzas', 'Software', 'Automotriz'][i],
    city: pick(cities),
    size: pick(['1-10', '11-50', '51-200', '201-500', '500+']),
    website: name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '.com',
    owner: pick(owners),
  }));

  const contacts = [];
  for (let i = 0; i < 42; i++) {
    const f = first[i % first.length], co = pick(companies);
    let l = pick(last);
    while (contacts.some(c => c.name === f + ' ' + l)) l = pick(last);
    contacts.push({
      id: 'ct' + (i + 1), name: f + ' ' + l,
      email: (f + '.' + l).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@' + co.website,
      phone: '+54 9 11 ' + int(4000, 6999) + '-' + int(1000, 9999),
      title: pick(titles), companyId: co.id,
      status: (r => r < .25 ? 'lead' : r < .55 ? 'active' : r < .85 ? 'customer' : 'inactive')(rnd()),
      source: pick(sources), owner: pick(owners),
      lastContact: offset(-int(0, 60)),
      tags: rnd() > 0.6 ? ['VIP'] : rnd() > 0.5 ? ['Newsletter'] : [],
    });
  }

  const dealNames = ['Licencia anual', 'Implementación', 'Consultoría', 'Dashboard a medida', 'Renovación', 'Migración de datos',
    'Plan Pro', 'Capacitación', 'Integración API', 'Soporte premium', 'Modelo predictivo', 'Auditoría'];
  const deals = [];
  const addDeal = (stage, value, closeDate, created) => {
    const ct = pick(contacts);
    deals.push({
      id: 'dl' + (deals.length + 1), title: pick(dealNames) + ' · ' + companies.find(c => c.id === ct.companyId).name,
      value, stage, contactId: ct.id, companyId: ct.companyId, owner: pick(owners), closeDate, created,
    });
  };
  // Won deals: a steady upward trend over the last 12 months, current month partial.
  for (let m = 11; m >= 0; m--) {
    const first = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const daysIn = m === 0 ? today.getDate() : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const n = m === 0 ? 3 : int(3, 5);
    for (let k = 0; k < n; k++) {
      const close = new Date(first.getFullYear(), first.getMonth(), int(1, daysIn));
      addDeal('won', Math.round((int(8, 26) * (1 + (11 - m) * 0.06))) * 1000, iso(close), iso(close.getTime() - int(20, 70) * day));
    }
  }
  for (let i = 0; i < 16; i++) { const c = -int(5, 330); addDeal('lost', int(5, 40) * 1000, offset(c), offset(c - int(15, 60))); }
  const openStages = ['lead', 'lead', 'lead', 'qualified', 'qualified', 'proposal', 'proposal', 'negotiation'];
  for (let i = 0; i < 24; i++) addDeal(pick(openStages), int(4, 48) * 1000, offset(int(2, 75)), offset(-int(3, 60)));
  // A few open deals expected to close this month feed the forecast.
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const left = Math.max(1, Math.round((monthEnd - today) / day));
  for (let i = 0; i < 3; i++) addDeal(pick(['proposal', 'negotiation']), int(14, 32) * 1000, offset(int(0, left)), offset(-int(20, 50)));

  const taskTitles = ['Llamar para seguimiento', 'Enviar propuesta', 'Preparar demo', 'Revisar contrato', 'Agendar reunión',
    'Enviar factura', 'Actualizar datos del cliente', 'Responder consulta', 'Pedir referencias', 'Onboarding'];
  const tasks = [];
  for (let i = 0; i < 22; i++) {
    const ct = pick(contacts);
    const due = int(-6, 18);
    tasks.push({
      id: 'tk' + (i + 1), title: pick(taskTitles), contactId: ct.id,
      due: offset(due), priority: pick(['high', 'medium', 'low']),
      done: due < -2 ? rnd() > 0.3 : rnd() > 0.85, owner: pick(owners),
    });
  }

  const actTypes = ['call', 'email', 'meeting', 'note', 'deal'];
  const actText = {
    call: ['Llamada de descubrimiento', 'Seguimiento telefónico', 'Llamada de cierre'],
    email: ['Envió la propuesta', 'Respondió con dudas de precio', 'Confirmó la reunión'],
    meeting: ['Demo del producto', 'Reunión de kickoff', 'Revisión trimestral'],
    note: ['Prefiere contacto por WhatsApp', 'Evalúa a un competidor', 'Presupuesto aprobado para Q4'],
    deal: ['Avanzó a Propuesta', 'Avanzó a Negociación', 'Negocio ganado'],
  };
  const activities = [];
  for (let i = 0; i < 40; i++) {
    const type = pick(actTypes), ct = pick(contacts);
    const when = new Date(today.getTime() - int(0, 30) * day + int(8, 19) * 36e5 + int(0, 59) * 6e4);
    activities.push({ id: 'ac' + (i + 1), type, text: pick(actText[type]), contactId: ct.id, user: pick(owners), at: when.toISOString() });
  }
  activities.sort((a, b) => b.at.localeCompare(a.at));

  const evTitles = { meeting: ['Reunión', 'Kickoff', 'Revisión', 'Almuerzo'], call: ['Llamada', 'Seguimiento'], demo: ['Demo'] };
  const events = [];
  for (let i = 0; i < 26; i++) {
    const ct = pick(contacts), type = pick(['meeting', 'meeting', 'call', 'demo']);
    events.push({
      id: 'ev' + (i + 1), title: pick(evTitles[type]) + ' · ' + ct.name.split(' ')[0],
      date: offset(int(-12, 24)), time: String(int(9, 18)).padStart(2, '0') + ':' + pick(['00', '30']),
      type, contactId: ct.id,
    });
  }

  return { companies, contacts, deals, tasks, activities, events };
})();
