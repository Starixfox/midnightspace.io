// ============================================================
// OPPORTUNITY HUB Ã¢â‚â€ opportunitiesData.js
// Full dataset: 214 entries
//
// Field reference:
//   id                 -unique string, e.g. "SA-001"
//   title              -opportunity name
//   description_short  -1-3 sentence summary
//   type               -grant | tender | accelerator | investment_program | fellowship | other
//   sponsor_institution-issuing organization name(s)
//   country            -e.g. "Saudi Arabia", "UAE", "Global"
//   eligibility_region -Saudi_only | _GCC | GCC | Global_including_Saudi
//   eligibility_entities-e.g. "startups, SMEs, researchers"
//   funding
//   funding_type       -grant | equity | contract | in-kind | mixed
//   application_link   -URL string
//   deadline_date      -human-readable string
//   status             -open | closed_but_recurring | closed
//   language           -e.g. "English", "Arabic"
//   notes              -extra notes string (can be empty "")
//   last_verified      -"YYYY-MM-DD"
//   profiles           -array: ["startup","researcher","government","investor","student"]
//   sectors            -array of sector keys
//                         Valid keys: agriculture | energy | healthcare | environment |
//                         industrial | pharma | chemicals | realestate | financial |
//                         transport | mining | tourism | education | ict | innovation
//   isNew              -true = shown in NEW chip & "Recently added" widget
// ============================================================

const opportunitiesData = window.opportunitiesData;



// ============================================================
// PAGINATION CONFIG Ã¢â‚â€ change PAGE_SIZE to adjust rows per page
// ============================================================
const PAGE_SIZE = 50;

// ============================================================
// APP STATE
// ============================================================
const state = {
  search: '',
  countryGroup: 'all',
  type: 'all',
  status: 'all',
  profile: 'all',
  sector: 'all',
  showNew: false,
  page: 1
};

// Chart instances stored for theme-toggle rebuild
const charts = {};

// ============================================================
// HELPERS
// ============================================================
function getRegionGroup(opp) {
  const id = (opp.id || '').toUpperCase();
  if (id.startsWith('SA-'))  return 'saudi';
  if (id.startsWith('GCC-')) return 'gcc';
  if (id.startsWith('GL-'))  return 'global';
  if (opp.country === 'Saudi Arabia') return 'saudi';
  if (['UAE','Oman','Qatar','Bahrain','Kuwait','GCC'].includes(opp.country)) return 'gcc';
  return 'global';
}

function formatStatusLabel(s) {
  return { open:'Open', closed_but_recurring:'Recurring', closed:'Closed' }[s] || s;
}
function formatTypePill(t) {
  return { grant:'Grant', tender:'Tender', accelerator:'Accelerator',
           investment_program:'Investment', fellowship:'Fellowship', other:'Other' }[t] || t;
}
function getStatusClass(s) {
  return { open:'status-open', closed_but_recurring:'status-recurring', closed:'status-closed' }[s] || 'status-open';
}
function getTypeClass(t) {
  return { grant:'type-grant', tender:'type-tender', accelerator:'type-accel',
           investment_program:'type-invest', fellowship:'type-fellow', other:'type-other' }[t] || 'type-other';
}
function getRegionClass(g) {
  return { saudi:'region-saudi', gcc:'region-gcc', global:'region-global' }[g] || 'region-global';
}
function getRegionLabel(g) {
  return { saudi:'Saudi Arabia', gcc:'GCC', global:'Global' }[g] || 'Global';
}

// ============================================================
// SORT
// ============================================================
function deadlineSortKey(opp) {
  const d = (opp.deadline_date || '').toLowerCase();
  if (!d || d.includes('rolling') || d.includes('open')) return 9000;
  if (d.includes('recurring') || d.includes('closed'))   return 9500;
  const yr = d.match(/20(\d\d)/);
  if (yr) {
    const y = 2000 + parseInt(yr[1]);
    const moMatch = d.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    const mo = moMatch ? {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}[moMatch[1].toLowerCase()] : 6;
    return y * 100 + mo;
  }
  return 8000;
}

function sortOpportunities(list) {
  const ro = { saudi:0, gcc:1, global:2 };
  return [...list].sort((a, b) => {
    const rA = ro[getRegionGroup(a)] ?? 3;
    const rB = ro[getRegionGroup(b)] ?? 3;
    return rA !== rB ? rA - rB : deadlineSortKey(a) - deadlineSortKey(b);
  });
}

// ============================================================
// FILTER
// ============================================================
function profileMatchesEntities(entities, profile) {
  if (!entities || profile === 'all') return true;
  const e = entities.toLowerCase();
  if (profile === 'startup')    return e.includes('startup') || e.includes('sme');
  if (profile === 'researcher') return e.includes('researcher') || e.includes('universit');
  if (profile === 'government') return e.includes('government') || e.includes('public sector') || e.includes('corporation');
  if (profile === 'investor')   return e.includes('investor');
  if (profile === 'student')    return e.includes('student');
  return true;
}

function filterOpportunities() {
  return opportunitiesData.filter(opp => {
    if (state.countryGroup !== 'all' && getRegionGroup(opp) !== state.countryGroup) return false;
    if (state.sector !== 'all') {
      const s = opp.sectors || [];
      if (s.length > 0 && !s.includes(state.sector)) return false;
    }
    if (state.type   !== 'all' && opp.type   !== state.type)   return false;
    if (state.status !== 'all' && opp.status !== state.status) return false;
    if (state.profile !== 'all') {
      const entities  = (opp.eligibility_entities || '').toLowerCase();
      const profiles  = opp.profiles || [];
      if (!profiles.includes(state.profile) && !profileMatchesEntities(entities, state.profile)) return false;
    }
    if (state.showNew && !opp.isNew) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!(opp.title || '').toLowerCase().includes(q) &&
          !(opp.sponsor_institution || '').toLowerCase().includes(q) &&
          !(opp.description_short || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ============================================================
// RENDER TABLE + PAGINATION
// ============================================================
function renderTable() {
  const tbody = document.getElementById('oppsTableBody');
  const paginationEl = document.getElementById('pagination');
  if (!tbody) return;

  const filtered   = sortOpportunities(filterOpportunities());
  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  state.page = Math.max(1, Math.min(state.page, totalPages));

  const start    = (state.page - 1) * PAGE_SIZE;
  const end      = Math.min(start + PAGE_SIZE, total);
  const pageData = filtered.slice(start, end);

  const countEl = document.getElementById('resultsCount');
  if (countEl) {
    if (total === 0) {
      countEl.textContent = '0 opportunities';
    } else if (total === opportunitiesData.length) {
      countEl.textContent = total + ' opportunities';
    } else {
      countEl.textContent = total + ' of ' + opportunitiesData.length + ' opportunities';
    }
  }

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">' +
      '<div class="empty-icon">\uD83D\uDD0D</div>' +
      '<div class="empty-title">No matches found</div>' +
      '<div class="empty-sub">Try adjusting filters or clearing the search</div>' +
      '</td></tr>';
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  tbody.innerHTML = pageData.map(opp => {
    const group    = getRegionGroup(opp);
    const newBadge = opp.isNew ? '<span class="badge-new">NEW</span>' : '';
    const deadline = opp.deadline_date || 'Rolling / Open';
    return '<tr data-id="' + opp.id + '" tabindex="0" role="button" aria-label="View details for ' + opp.title + '">' +
      '<td class="col-title">' +
        '<div class="title-wrap">' +
          '<a href="' + (opp.application_link || '#') + '" target="_blank" rel="noopener noreferrer" class="opp-title-link" onclick="event.stopPropagation()">' + opp.title + '</a>' + newBadge +
        '</div>' +
        '<div class="opp-sponsor">' + opp.sponsor_institution + '</div>' +
      '</td>' +
      '<td><span class="pill ' + getTypeClass(opp.type) + '">' + formatTypePill(opp.type) + '</span></td>' +
      '<td><span class="region-tag ' + getRegionClass(group) + '">' + getRegionLabel(group) + '</span></td>' +
      '<td class="col-eligibility">' + (opp.eligibility_entities || '&mdash;') + '</td>' +
      '<td class="col-funding">' + (opp.funding_amount || '&mdash;') + '</td>' +
      '<td><span class="status-badge ' + getStatusClass(opp.status) + '">' + formatStatusLabel(opp.status) + '</span></td>' +
      '<td class="col-deadline">' + deadline + '</td>' +
    '</tr>';
  }).join('');

  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => openPanel(row.dataset.id));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(row.dataset.id); }
    });
  });

  renderPagination(totalPages, total, start, end);} 
 
// ============================================================
// PAGINATION RENDERER
// ============================================================
function getPageNumbers(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function renderPagination(totalPages, total, start, end) {
  const el = document.getElementById('pagination');
  if (!el) return;

  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const cur = state.page;
  let html = '<button class="page-btn" id="pgPrev" aria-label="Previous page"' + (cur === 1 ? ' disabled' : '') + '>&#8592;</button>';

  let lastEllipsis = false;
  getPageNumbers(cur, totalPages).forEach(p => {
    if (p === '...') {
      if (!lastEllipsis) html += '<span class="page-ellipsis">&hellip;</span>';
      lastEllipsis = true;
    } else {
      lastEllipsis = false;
      html += '<button class="page-btn' + (p === cur ? ' active' : '') + '" data-page="' + p + '" aria-label="Page ' + p + '" aria-current="' + (p === cur ? 'page' : 'false') + '">' + p + '</button>';
    }
  });

  html += '<button class="page-btn" id="pgNext" aria-label="Next page"' + (cur === totalPages ? ' disabled' : '') + '>&#8594;</button>';
  html += '<span class="page-info">Showing ' + (start + 1) + '&ndash;' + end + ' of ' + total + '</span>';

  el.innerHTML = html;

  el.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page);
      renderTable();
      scrollToSection();
    });
  });

  const prev = el.querySelector('#pgPrev');
  const next = el.querySelector('#pgNext');
  if (prev) prev.addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); scrollToSection(); } });
  if (next) next.addEventListener('click', () => { if (state.page < totalPages) { state.page++; renderTable(); scrollToSection(); } });
}

function scrollToSection() {
  const sec = document.getElementById('opportunities');
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// DETAIL PANEL
// ============================================================
let activePanelId = null;

const SECTOR_LABELS = {
  agriculture:'Agriculture & Food Processing', energy:'Energy',
  healthcare:'Healthcare & Life Sciences',    environment:'Environment Services',
  industrial:'Industrial & Manufacturing',    pharma:'Pharma & Biotech',
  chemicals:'Chemicals',                      realestate:'Real Estate',
  financial:'Financial Services',             transport:'Transport & Logistics',
  mining:'Mining & Metals',                   tourism:'Tourism & Quality of Life',
  education:'Education',                      ict:'ICT',
  innovation:'Innovation & Entrepreneurship'
};

function openPanel(id) {
  const opp = opportunitiesData.find(o => o.id === id);
  if (!opp) return;

  activePanelId = id;
  const panel   = document.getElementById('detailPanel');
  const overlay = document.getElementById('panelOverlay');
  if (!panel || !overlay) return;

  const group = getRegionGroup(opp);

  document.getElementById('panelTitle').textContent = opp.title;
  document.getElementById('panelBadges').innerHTML =
    '<span class="pill ' + getTypeClass(opp.type) + '">' + formatTypePill(opp.type) + '</span> ' +
    '<span class="region-tag ' + getRegionClass(group) + '">' + getRegionLabel(group) + '</span> ' +
    '<span class="status-badge ' + getStatusClass(opp.status) + '">' + formatStatusLabel(opp.status) + '</span>' +
    (opp.isNew ? ' <span class="badge-new">NEW</span>' : '');

  document.getElementById('panelDesc').textContent = opp.description_short || '';

  const sectorDisplay = (opp.sectors || []).map(s => SECTOR_LABELS[s] || s).join(', ') || 'Ã¢â‚â€';

  const fields = [
    ['Sponsor / Institution', opp.sponsor_institution],
    ['Sector(s)',             sectorDisplay],
    ['Funding Amount',        opp.funding_amount],
    ['Funding Type',          opp.funding_type],
    ['Eligibility',           opp.eligibility_entities],
    ['Deadline / Timing',     opp.deadline_date || 'Rolling / Open'],
    ['Language',              opp.language],
    opp.notes ? ['Notes', opp.notes] : null,
    ['Last Verified',         opp.last_verified]
  ].filter(Boolean);

  document.getElementById('panelFields').innerHTML = fields.map(([label, value]) =>
    '<div class="panel-field">' +
      '<div class="panel-field-label">' + label + '</div>' +
      '<div class="panel-field-value">' + (value || '&mdash;') + '</div>' +
    '</div>'
  ).join('');

  const linkBtn = document.getElementById('panelLink');
  if (linkBtn) {
    linkBtn.href = opp.application_link || '#';
    linkBtn.textContent = opp.application_link ? 'Visit official page \u2192' : 'No link available';
  }

  document.querySelectorAll('#oppsTableBody tr').forEach(r => r.classList.remove('panel-active'));
  const activeRow = document.querySelector('#oppsTableBody tr[data-id="' + id + '"]');
  if (activeRow) activeRow.classList.add('panel-active');

  panel.classList.add('open');
  overlay.classList.add('visible');
  document.body.classList.add('panel-open');
  panel.setAttribute('aria-hidden', 'false');
  document.getElementById('panelClose').focus();
}

function closePanel() {
  activePanelId = null;
  const panel   = document.getElementById('detailPanel');
  const overlay = document.getElementById('panelOverlay');
  if (panel)   { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('visible');
  document.body.classList.remove('panel-open');
  document.querySelectorAll('#oppsTableBody tr').forEach(r => r.classList.remove('panel-active'));
}

// ============================================================
// KPI COUNTERS
// ============================================================
function updateKPIs() {
  const totals = { saudi: 0, gcc: 0, global: 0 };
  opportunitiesData.forEach(o => { totals[getRegionGroup(o)]++; });

  animateCount('kpiSaudi',  totals.saudi);
  animateCount('kpiGcc',    totals.gcc);
  animateCount('kpiGlobal', totals.global);
  animateCount('kpiTotal',  opportunitiesData.length);

  const aboutTotal = document.getElementById('aboutTotalCount');
  if (aboutTotal) aboutTotal.textContent = opportunitiesData.length + ' opportunities';

  const snap = document.getElementById('landscapeSnapshot');
  if (snap) {
    snap.innerHTML =
      '<strong style="color:var(--text);">Dataset snapshot (March 2026):</strong> ' +
      opportunitiesData.length + ' opportunities tracked across Saudi Arabia (' + totals.saudi + '), ' +
      'GCC (' + totals.gcc + '), and global programs (' + totals.global + ') ' +
      'spanning grants, tenders, accelerators, investment programs, and fellowships ' +
      'across 15 key sectors aligned with Vision 2030.';
  }
}

function animateCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 20);
}

// ============================================================
// RECENTLY ADDED WIDGET
// ============================================================
function renderRecentlyAdded() {
  const container = document.getElementById('recentlyAddedList');
  if (!container) return;

  const newEntries = opportunitiesData.filter(o => o.isNew).slice(0, 12);
  if (newEntries.length === 0) {
    container.innerHTML = '<p class="no-recent">No new entries at this time. Check back soon.</p>';
    return;
  }

  container.innerHTML = newEntries.map(opp => {
    const group = getRegionGroup(opp);
    return '<div class="changelog-item">' +
      '<div class="changelog-item-title">' +
        '<a href="' + (opp.application_link || '#') + '" class="changelog-link" target="_blank" rel="noopener noreferrer">' + opp.title + '</a>' +
      '</div>' +
      '<div class="changelog-item-meta">' +
        '<span class="pill ' + getTypeClass(opp.type) + ' pill-xs">' + formatTypePill(opp.type) + '</span>' +
        '<span class="region-tag ' + getRegionClass(group) + ' tag-xs">' + getRegionLabel(group) + '</span>' +
        '<span class="status-badge ' + getStatusClass(opp.status) + ' badge-xs">' + formatStatusLabel(opp.status) + '</span>' +
        '<span class="changelog-date">Added ' + (opp.last_verified || 'recently') + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ============================================================
// CHARTS
// ============================================================
function destroyCharts() {
  Object.keys(charts).forEach(k => {
    if (charts[k]) { charts[k].destroy(); delete charts[k]; }
  });
}

function initCharts() {
  if (typeof Chart === 'undefined') return;
  destroyCharts();

  const isDark    = document.documentElement.getAttribute('data-theme') !== 'light';
  const textColor = isDark ? '#7c89ab' : '#64748b';
  const gridColor = isDark ? '#1e2840' : '#e2e8f0';
  const bgColor   = isDark ? '#0f1420' : '#ffffff';

  Chart.defaults.color       = textColor;
  Chart.defaults.borderColor = gridColor;
  Chart.defaults.font.family = "'Space Grotesk', 'Inter', sans-serif";

  const data = opportunitiesData;

  const typeCounts = {};
  data.forEach(o => { typeCounts[o.type] = (typeCounts[o.type] || 0) + 1; });
  const typeLabels = { grant:'Grant', tender:'Tender / Competition', accelerator:'Accelerator',
                       investment_program:'Investment Program', fellowship:'Fellowship', other:'Other' };
  const typeColors = ['#00a651','#f5a623','#4f9cf9','#a855f7','#f97316','#7c89ab'];

  const typeEl = document.getElementById('typeChart');
  if (typeEl) {
    charts.type = new Chart(typeEl, {
      type: 'doughnut',
      data: {
        labels: Object.keys(typeCounts).map(k => typeLabels[k] || k),
        datasets: [{ data: Object.values(typeCounts), backgroundColor: typeColors,
                     borderColor: bgColor, borderWidth: 3, hoverBorderWidth: 3, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: '62%',
        plugins: {
          legend: { position: 'right', labels: { padding: 14, boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + ' (' + Math.round(ctx.raw / data.length * 100) + '%)' } }
        }
      }
    });
  }

  const regionCounts = { saudi: 0, gcc: 0, global: 0 };
  data.forEach(o => { regionCounts[getRegionGroup(o)]++; });

  const regionEl = document.getElementById('regionChart');
  if (regionEl) {
    charts.region = new Chart(regionEl, {
      type: 'bar',
      data: {
        labels: ['Saudi Arabia', 'GCC', 'Global'],
        datasets: [{ label: 'Opportunities',
                     data: [regionCounts.saudi, regionCounts.gcc, regionCounts.global],
                     backgroundColor: ['#00a651','#f5a623','#4f9cf9'],
                     borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor, font: { size: 13, weight: '500' } } }
        }
      }
    });
  }

  const statusCounts = { open: 0, closed_but_recurring: 0, closed: 0 };
  data.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const statusEl = document.getElementById('statusChart');
  if (statusEl) {
    charts.status = new Chart(statusEl, {
      type: 'bar',
      data: {
        labels: ['Open', 'Recurring', 'Closed'],
        datasets: [{ label: 'Count',
                     data: [statusCounts.open, statusCounts.closed_but_recurring, statusCounts.closed || 0],
                     backgroundColor: ['#34d97b','#f5c842','#ef9090'],
                     borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
          x: { grid: { display: false }, ticks: { color: textColor, font: { size: 13, weight: '500' } } }
        }
      }
    });
  }

  const sponsorCounts = {};
  data.forEach(o => {
    const name = (o.sponsor_institution || 'Unknown').split(/[+,(]/)[0].trim();
    sponsorCounts[name] = (sponsorCounts[name] || 0) + 1;
  });
  const topSponsors = Object.entries(sponsorCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const sponsorEl = document.getElementById('sponsorChart');
  if (sponsorEl) {
    charts.sponsor = new Chart(sponsorEl, {
      type: 'bar',
      data: {
        labels: topSponsors.map(([k]) => k.length > 30 ? k.slice(0, 28) + '\u2026' : k),
        datasets: [{ label: 'Programs', data: topSponsors.map(([, v]) => v),
                     backgroundColor: '#00a651', borderRadius: 5, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }
        }
      }
    });
  }
}

// ============================================================
// NAV HIGHLIGHT
// ============================================================
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.navbar-links a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector('.navbar-links a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

// ============================================================
// THEME TOGGLE
// ============================================================
function initTheme() {
  const html = document.documentElement;
  const btn  = document.querySelector('[data-theme-toggle]');
  const icon = document.getElementById('themeIcon');
  let currentTheme = 'dark';
  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme, icon);

  if (btn) {
    btn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      updateThemeIcon(currentTheme, icon);
      setTimeout(initCharts, 50);
    });
  }
}

function updateThemeIcon(theme, icon) {
  if (!icon) return;
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    icon.setAttribute('aria-label', 'Switch to light mode');
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    icon.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('mobile-open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================================
// TOOLTIPS
// ============================================================
function initTooltips() {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip-box';
  tooltip.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltip);

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tooltip.textContent = el.dataset.tooltip;
      tooltip.classList.add('visible');
    });
    el.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top  = (e.clientY - 8)  + 'px';
    });
    el.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
  const els = document.querySelectorAll('.kpi-card, .who-item, .insight-card, .audience-card');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => { el.classList.add('fade-up'); observer.observe(el); });
}

// ============================================================
// RESET FILTERS
// ============================================================
function resetAllFilters() {
  state.search = '';
  state.countryGroup = 'all';
  state.type   = 'all';
  state.status = 'all';
  state.profile = 'all';
  state.sector = 'all';
  state.showNew = false;
  state.page = 1;

  ['sectorFilter','countryFilter','typeFilter','statusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 'all';
  });
  const si = document.getElementById('searchInput');
  if (si) si.value = '';

  document.querySelectorAll('.profile-chip').forEach(c => c.classList.remove('active'));
  const allChip = document.querySelector('.profile-chip[data-profile="all"]');
  if (allChip) allChip.classList.add('active');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  updateKPIs();
  renderTable(); // PATCH: initial render happens before reveal

  // PATCH: reveal the real table wrapper only after render + 2 paint frames
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById('oppsTableWrapper')?.classList.add('ready');
    });
  });

  renderRecentlyAdded();
  initNavHighlight();
  initTooltips();
  initScrollAnimations();
  setTimeout(initCharts, 100);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderTable();
    });
  }

  const sectorFilter = document.getElementById('sectorFilter');
  if (sectorFilter) {
    sectorFilter.addEventListener('change', () => {
      state.sector = sectorFilter.value;
      state.page = 1;
      renderTable();
    });
  }

  const countryFilter = document.getElementById('countryFilter');
  if (countryFilter) {
    countryFilter.addEventListener('change', () => {
      state.countryGroup = countryFilter.value;
      state.page = 1;
      renderTable();
    });
  }

  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      state.type = typeFilter.value;
      state.page = 1;
      renderTable();
    });
  }

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      state.status = statusFilter.value;
      state.page = 1;
      renderTable();
    });
  }

  document.querySelectorAll('.profile-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.profile;
      if (value === 'new') {
        state.showNew = !state.showNew;
        chip.classList.toggle('active', state.showNew);
      } else {
        document.querySelectorAll('.profile-chip:not([data-profile="new"])').forEach(c => c.classList.remove('active'));
        state.profile = (state.profile === value) ? 'all' : value;
        if (state.profile !== 'all') chip.classList.add('active');
      }
      state.page = 1;
      renderTable();
    });
  });

  const resetBtn = document.getElementById('resetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetAllFilters();
      renderTable();
    });
  }

  const panelClose = document.getElementById('panelClose');
  if (panelClose) panelClose.addEventListener('click', closePanel);

  const overlay = document.getElementById('panelOverlay');
  if (overlay) overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const text = document.getElementById('feedbackText')?.value?.trim();
      if (!text) return;
      const success = document.getElementById('formSuccess');
      if (success) {
        success.style.display = 'block';
        this.reset();
        setTimeout(() => { success.style.display = 'none'; }, 5000);
      }
    });
  }
});
