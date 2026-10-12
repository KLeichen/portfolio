// Sample data, generated from a fixed seed and anchored to today's date so the
// demo always looks current. Text that starts with @ is a translation key.
// Replace with real data per client (or import a JSON export from Settings).
window.CRM_SEED = (function () {
  let s = 20261011;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const weighted = (pairs) => {
    let r = rnd() * pairs.reduce((t, p) => t + p[1], 0);
    for (const [v, w] of pairs) if ((r -= w) < 0) return v;
    return pairs[0][0];
  };
  const DAY = 864e5;
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const offset = (n) => iso(today.getTime() + n * DAY);
  const workday = (n) => { const d = new Date(today.getTime() + n * DAY); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return iso(d); };
  const owners = (window.CRM_CONFIG.team || [{ name: 'Admin' }]).map((m) => m.name);

  const companies = [
    ['Andes Analytics', '@ind_software', 'Mendoza'], ['Puerto Verde', '@ind_agro', 'Rosario'], ['Lumen Salud', '@ind_health', 'Córdoba'],
    ['Rutas del Sur', '@ind_logistics', 'Neuquén'], ['Campo Claro', '@ind_agro', 'Pergamino'], ['Brújula Viajes', '@ind_tourism', 'Bariloche'],
    ['Faro Finanzas', '@ind_finance', 'Buenos Aires'], ['Aula Viva', '@ind_education', 'La Plata'], ['Nodo Retail', '@ind_retail', 'Buenos Aires'],
    ['Cumbre Logística', '@ind_logistics', 'Montevideo'], ['Pampa Foods', '@ind_food', 'Córdoba'], ['Delta Seguros', '@ind_finance', 'Buenos Aires'],
    ['Quanta Labs', '@ind_software', 'Santiago'], ['Sierra Motors', '@ind_auto', 'Mendoza'],
  ].map(([name, industry, city], i) => ({
    id: 'co' + (i + 1), name, industry, city,
    size: pick(['1-10', '11-50', '51-200', '201-500', '500+']),
    website: name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') + '.com',
    owner: pick(owners),
  }));

  const firstNames = ['Lucía', 'Martín', 'Sofía', 'Joaquín', 'Valentina', 'Tomás', 'Camila', 'Nicolás', 'Julieta', 'Federico',
    'Agustina', 'Mateo', 'Florencia', 'Santiago', 'Paula', 'Diego', 'Carla', 'Ignacio', 'Micaela', 'Bruno'];
  const lastNames = ['García', 'Fernández', 'López', 'Martínez', 'Romero', 'Sosa', 'Álvarez', 'Torres', 'Ruiz', 'Benítez',
    'Acosta', 'Medina', 'Herrera', 'Castro', 'Rojas', 'Molina', 'Ortiz', 'Silva'];
  const titles = ['@jt_ceo', '@jt_cfo', '@jt_buyer', '@jt_data', '@jt_sales', '@jt_coo', '@jt_mkt', '@jt_cto', '@jt_analyst'];
  const contacts = [];
  for (let i = 0; i < 48; i++) {
    const f = firstNames[i % firstNames.length];
    const co = i < companies.length ? companies[i] : pick(companies); // every company gets at least one person
    let l = pick(lastNames);
    while (contacts.some((c) => c.name === f + ' ' + l)) l = pick(lastNames);
    const age = Math.floor(Math.pow(rnd(), 1.5) * 400); // days since created, skewed to recent
    contacts.push({
      id: 'ct' + (i + 1), name: f + ' ' + l,
      email: (f + '.' + l).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@' + co.website,
      phone: '+54 9 11 ' + int(4000, 6999) + '-' + int(1000, 9999),
      title: pick(titles), companyId: co.id,
      status: weighted([['lead', 25], ['active', 30], ['customer', 30], ['inactive', 15]]),
      source: weighted([['web', 26], ['referral', 22], ['linkedin', 18], ['event', 12], ['email', 12], ['call', 10]]),
      owner: pick(owners),
      created: offset(-age),
      lastContact: offset(-int(0, Math.min(45, age))),
      tags: rnd() > 0.75 ? ['@tag_vip'] : rnd() > 0.6 ? ['@tag_news'] : [],
    });
  }

  const products = ['@p_license', '@p_impl', '@p_consult', '@p_dash', '@p_renewal', '@p_migration',
    '@p_pro', '@p_training', '@p_api', '@p_support', '@p_model', '@p_audit'];
  const deals = [];
  const addDeal = (o) => {
    const ct = pick(contacts), co = companies.find((c) => c.id === ct.companyId);
    deals.push(Object.assign({ id: 'dl' + (deals.length + 1), title: pick(products) + ' · ' + co.name, contactId: ct.id, companyId: co.id, owner: pick(owners) }, o));
  };
  // Won: a steady upward trend over the last 12 months; the current month is partial.
  for (let m = 11; m >= 0; m--) {
    const m0 = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const lastDay = m === 0 ? today.getDate() : new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
    const n = m === 0 ? 3 : int(3, 5);
    for (let k = 0; k < n; k++) {
      const close = new Date(m0.getFullYear(), m0.getMonth(), int(1, lastDay));
      addDeal({ stage: 'won', value: Math.round(int(8, 26) * (1 + (11 - m) * 0.06)) * 1000, closeDate: iso(close), created: iso(close.getTime() - int(18, 75) * DAY), stageSince: iso(close) });
    }
  }
  // Lost, with the reason and the stage where each deal was lost.
  for (let i = 0; i < 16; i++) {
    const c = i < 2 ? -int(3, 25) : -int(3, 330);
    addDeal({
      stage: 'lost', value: int(5, 40) * 1000, closeDate: offset(c), created: offset(c - int(15, 70)), stageSince: offset(c),
      lostReason: weighted([['price', 30], ['competitor', 25], ['budget', 18], ['timing', 12], ['no_response', 10], ['other', 5]]),
      lostStage: weighted([['lead', 20], ['qualified', 35], ['proposal', 30], ['negotiation', 15]]),
    });
  }
  // Open pipeline.
  [['lead', 8], ['qualified', 6], ['proposal', 5], ['negotiation', 4]].forEach(([stage, n]) => {
    for (let i = 0; i < n; i++) {
      const since = -int(1, 45);
      addDeal({ stage, value: int(4, 48) * 1000, closeDate: offset(int(4, 80)), created: offset(since - int(0, 40)), stageSince: offset(since) });
    }
  });
  // Two open deals already past their close date...
  deals.filter((d) => d.stage === 'lead').slice(0, 2).forEach((d) => { d.closeDate = offset(-int(1, 6)); });
  // ...and three expected to close this month, which feed the forecast.
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const left = Math.max(0, Math.round((monthEnd - today) / DAY));
  for (const stage of ['proposal', 'negotiation', 'negotiation']) {
    addDeal({ stage, value: int(14, 32) * 1000, closeDate: offset(int(0, left)), created: offset(-int(25, 60)), stageSince: offset(-int(2, 20)) });
  }

  // Activities over the last 90 days, mostly on weekdays and office hours.
  const actText = {
    call: ['@a_call1', '@a_call2', '@a_call3'],
    email: ['@a_email1', '@a_email2', '@a_email3'],
    meeting: ['@a_meet1', '@a_meet2', '@a_meet3'],
    note: ['@a_note1', '@a_note2', '@a_note3'],
    deal: ['@a_deal1', '@a_deal2', '@a_deal3'],
  };
  const hours = [[8, 1], [9, 3], [10, 5], [11, 5], [12, 3], [13, 1], [14, 3], [15, 5], [16, 4], [17, 3], [18, 2], [19, 1]];
  const activities = [];
  for (let i = 0; i < 230; i++) {
    let d;
    do { d = int(0, 89); } while ([0, 6].includes(new Date(today.getTime() - d * DAY).getDay()) && rnd() < 0.85);
    const type = weighted([['call', 30], ['email', 35], ['meeting', 15], ['note', 12], ['deal', 8]]);
    let at = new Date(today.getTime() - d * DAY + weighted(hours) * 36e5 + int(0, 59) * 6e4);
    if (at > now) at = new Date(now.getTime() - int(5, 180) * 6e4);
    activities.push({ id: 'ac' + (i + 1), type, text: pick(actText[type]), contactId: pick(contacts).id, user: pick(owners), at: at.toISOString() });
  }
  activities.sort((a, b) => b.at.localeCompare(a.at));

  const taskTitles = ['@tk_follow', '@tk_proposal', '@tk_demo', '@tk_contract', '@tk_meeting', '@tk_invoice', '@tk_update', '@tk_reply', '@tk_refs', '@tk_onboard'];
  const tasks = [];
  const addTask = (due, done) => tasks.push({
    id: 'tk' + (tasks.length + 1), title: pick(taskTitles), contactId: pick(contacts).id, due: offset(due),
    priority: weighted([['high', 25], ['medium', 45], ['low', 30]]), done, owner: pick(owners),
  });
  for (let i = 0; i < 3; i++) addTask(0, false);                   // due today
  for (let i = 0; i < 3; i++) addTask(-int(1, 5), false);          // overdue
  for (let i = 0; i < 12; i++) addTask(int(1, 20), rnd() > 0.92);  // upcoming
  for (let i = 0; i < 10; i++) addTask(-int(1, 14), true);         // done

  const evTitles = { meeting: ['@ev_meeting', '@ev_kickoff', '@ev_review', '@ev_lunch'], call: ['@ev_call', '@ev_followup'], demo: ['@ev_demo'] };
  const events = [];
  for (let i = 0; i < 36; i++) {
    const ct = pick(contacts), type = weighted([['meeting', 45], ['call', 35], ['demo', 20]]);
    events.push({
      id: 'ev' + (i + 1), title: pick(evTitles[type]) + ' · ' + ct.name.split(' ')[0], type, contactId: ct.id,
      date: workday(int(-20, 35)), time: String(int(9, 17)).padStart(2, '0') + ':' + pick(['00', '30']),
    });
  }

  return { companies, contacts, deals, tasks, activities, events };
})();
