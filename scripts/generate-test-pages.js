#!/usr/bin/env node
// Generiert Test-HTML-Seiten für alle Branchen im neuen Design
// Ausführen: node scripts/generate-test-pages.js

const fs   = require('fs');
const path = require('path');

const OUT_DIR  = path.join(__dirname, '..', 'public', 'analyse');
const BASE_IMG = 'https://www.vision-ml.de/assets/img/analyse';

const branchenMap = {
  'Gastronomie': {
    label: 'Gastronomie & Hotellerie', imgKey: 'gastronomie',
    tagline: 'Mehr Gäste, weniger Verwaltung — KI-Automatisierung für Ihr Restaurant oder Hotel.',
    headline: 'KI in der Gastronomie: Vollständig besetzt, effizienter betrieben',
    zeitDesc: 'Gastronomiebetriebe verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'calendar-check', title: 'Reservierungsmanagement',   desc: 'Automatische Buchungsbestätigungen, Wartelistenverwaltung und Erinnerungen — komplett ohne manuelle Eingriffe.', h: '4–6' },
      { icon: 'star',           title: 'Bewertungsmanagement',       desc: 'KI antwortet professionell auf Google & TripAdvisor Bewertungen im Stil Ihres Hauses — täglich, konsistent.',  h: '2–3' },
      { icon: 'megaphone',      title: 'Marketing-Automatisierung',  desc: 'Tagesmenü, Events und Angebote werden automatisch in Social Media und E-Mail-Newsletter gepublisht.',           h: '3–5' },
    ],
    zeitfresser: [
      { lucide: 'calendar',       label: 'Reservierungen & Buchungen', loesung: 'KI-Buchungssystem mit automatischen Bestätigungen und Erinnerungen', hMin: 4, hMax: 6 },
      { lucide: 'message-circle', label: 'Gästeanfragen & Support',    loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                    hMin: 3, hMax: 5 },
      { lucide: 'megaphone',      label: 'Social Media & Marketing',   loesung: 'KI erstellt und plant Beiträge automatisch für alle Kanäle',         hMin: 3, hMax: 6 },
    ],
  },
  'Handwerk': {
    label: 'Handwerk & Betrieb', imgKey: 'handwerk',
    tagline: 'Maßgeschneiderte Automatisierungsstrategie für Ihren Handwerksbetrieb — weniger Verwaltung, mehr Zeit für das Wesentliche.',
    headline: 'KI im Handwerk: Weniger Büro, mehr Baustelle',
    zeitDesc: 'Handwerksbetriebe verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'calendar',      title: 'KI-Terminbuchung',                    desc: 'Kunden buchen 24/7 online. KI bestätigt, erinnert und koordiniert Absagen selbstständig — ohne ein einziges Telefonat.', h: '5–8' },
      { icon: 'file-text',     title: 'Angebots- & Rechnungsautomatisierung', desc: 'KI generiert individuelle Angebote anhand Leistungsverzeichnis und Kundenwunsch — fertig in 3 Minuten statt 45.',      h: '4–6' },
      { icon: 'message-circle',title: 'KI-Chatbot 24/7',                     desc: 'WhatsApp/E-Mail-Anfragen werden automatisch beantwortet, Rückfragen kategorisiert und weitergeleitet.',                   h: '3–5' },
    ],
    zeitfresser: [
      { lucide: 'calendar',   label: 'Terminplanung & Kalender', loesung: 'KI-Buchungssystem mit automatischen Bestätigungen und Erinnerungen',         hMin: 5, hMax: 8 },
      { lucide: 'file-text',  label: 'Angebote & Rechnungen',    loesung: 'Automatische Angebotsgenerierung + digitale Signatur + Rechnungsversand',     hMin: 4, hMax: 7 },
      { lucide: 'message-circle', label: 'Kundenanfragen & Support', loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                          hMin: 3, hMax: 5 },
    ],
  },
  'Gesundheit': {
    label: 'Gesundheit & Praxis', imgKey: 'gesundheit',
    tagline: 'Mehr Zeit für Patienten — KI übernimmt die Administration.',
    headline: 'KI in der Praxis: Mehr Zeit für Patienten, weniger Verwaltung',
    zeitDesc: 'Gesundheitsbetriebe verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'calendar',       title: 'Online-Terminbuchung',        desc: 'Patienten buchen, verschieben und stornieren selbstständig. Automatische Erinnerungen senken No-Shows um bis zu 40 %.', h: '5–8' },
      { icon: 'clipboard-list', title: 'Dokumentation & Recall',      desc: 'Automatische Recall-Nachrichten, Ergebnis-Mitteilungen und Folgetermin-Empfehlungen per SMS/E-Mail.',                h: '3–5' },
      { icon: 'credit-card',    title: 'Abrechnungsautomatisierung',  desc: 'Automatische Rechnungserstellung, Mahnwesen und Kassenabgleich ohne manuellen Aufwand.',                             h: '4–6' },
    ],
    zeitfresser: [
      { lucide: 'calendar',       label: 'Terminplanung & Kalender',  loesung: 'KI-Buchungssystem mit automatischen Bestätigungen und Erinnerungen',     hMin: 5, hMax: 8 },
      { lucide: 'message-circle', label: 'Kundenanfragen & Support',  loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                         hMin: 6, hMax: 10 },
      { lucide: 'file-text',      label: 'Angebote & Rechnungen',     loesung: 'Automatische Angebotsgenerierung + digitale Signatur + Rechnungsversand', hMin: 4, hMax: 7 },
    ],
  },
  'Einzelhandel': {
    label: 'Einzelhandel & E-Commerce', imgKey: 'einzelhandel',
    tagline: 'Automatisiert verkaufen und wachsen — ohne zusätzlichen manuellen Aufwand.',
    headline: 'KI im Einzelhandel: Automatisiert verkaufen, wachsen ohne Mehraufwand',
    zeitDesc: 'Einzelhandelsbetriebe verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'package',        title: 'Bestandsmanagement',  desc: 'Automatische Nachbestellungen, Bestandswarnungen und Lieferantenkorrespondenz bei kritischen Lagermengen.', h: '5–8' },
      { icon: 'message-circle', title: 'Kundensupport 24/7',  desc: 'KI-Chatbot beantwortet Fragen zu Bestellungen, Rücksendungen und Lieferzeiten rund um die Uhr.',           h: '6–10' },
      { icon: 'mail',           title: 'E-Mail-Marketing',    desc: 'Automatische Segmentierung, personalisierte Produktempfehlungen und Abandonment-Flows.',                   h: '3–5' },
    ],
    zeitfresser: [
      { lucide: 'package',        label: 'Bestellungen & Logistik',  loesung: 'Automatische Bestellvorgänge, Lagerbenachrichtigungen + Liefertracking', hMin: 4, hMax: 8 },
      { lucide: 'message-circle', label: 'Kundenanfragen & Support', loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                         hMin: 6, hMax: 10 },
      { lucide: 'megaphone',      label: 'Social Media & Content',   loesung: 'KI erstellt und plant Beiträge automatisch für alle Kanäle',              hMin: 3, hMax: 6 },
    ],
  },
  'Immobilien': {
    label: 'Immobilien', imgKey: 'immobilien',
    tagline: 'Mehr Abschlüsse, weniger Routine — KI-Automatisierung für Makler.',
    headline: 'KI für Makler: Mehr Abschlüsse, weniger Routine',
    zeitDesc: 'Maklerbüros verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'home',     title: 'Exposé-Automatisierung',     desc: 'KI erstellt professionelle Exposés aus Eckdaten und Fotos in unter 5 Minuten — inklusive Beschreibungstexten.',         h: '6–10' },
      { icon: 'calendar', title: 'Besichtigungskoordination',  desc: 'Automatische Terminvorschläge, Bestätigungen und Erinnerungen für alle Interessenten gleichzeitig.',                    h: '4–6' },
      { icon: 'target',   title: 'Lead-Nurturing',             desc: 'Automatische Follow-up-Sequenzen qualifizieren Interessenten und halten sie warm — ohne manuelle Mails.',               h: '3–5' },
    ],
    zeitfresser: [
      { lucide: 'home',           label: 'Exposé-Erstellung',       loesung: 'KI erstellt professionelle Exposés aus Eckdaten und Fotos in unter 5 Minuten', hMin: 6, hMax: 10 },
      { lucide: 'calendar',       label: 'Terminplanung & Kalender', loesung: 'Automatische Terminvorschläge, Bestätigungen und Erinnerungen',               hMin: 4, hMax: 6 },
      { lucide: 'message-circle', label: 'Kundenanfragen & Support', loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                              hMin: 3, hMax: 5 },
    ],
  },
  'Beratung': {
    label: 'Beratung & Dienstleistung', imgKey: 'beratung',
    tagline: 'Fokus auf Kunden statt Verwaltung — KI für Beratungsunternehmen.',
    headline: 'KI für Berater: Fokus auf Kunden statt Verwaltung',
    zeitDesc: 'Beratungsunternehmen verlieren wöchentlich bis zu',
    potenziale: [
      { icon: 'bar-chart-2', title: 'Automatisches Reporting', desc: 'Monatliche Berichte, Dashboards und KPI-Zusammenfassungen werden automatisch generiert und versendet.', h: '4–8' },
      { icon: 'file-text',   title: 'Angebotserstellung',      desc: 'KI erstellt individuelle Angebote auf Basis von Briefings — fertig in Minuten statt Stunden.',           h: '3–5' },
      { icon: 'refresh-cw',  title: 'CRM-Automatisierung',     desc: 'Kontakte, Notizen und Follow-up-Aufgaben werden automatisch gepflegt und erinnert.',                    h: '2–4' },
    ],
    zeitfresser: [
      { lucide: 'bar-chart-2',    label: 'Reporting & Controlling',  loesung: 'Automatische Auswertungen, Berichte und Dashboards ohne manuelle Excel-Arbeit',             hMin: 4, hMax: 8 },
      { lucide: 'file-text',      label: 'Angebote & Rechnungen',    loesung: 'Automatische Angebotsgenerierung + digitale Signatur + Rechnungsversand',                   hMin: 3, hMax: 5 },
      { lucide: 'message-circle', label: 'Kundenanfragen & Support', loesung: 'KI-Chatbot 24/7 + intelligentes Ticket-Routing',                                            hMin: 2, hMax: 4 },
    ],
  },
};

const icon     = (name, cls = '') => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ''}></i>`;
const imgBlock = (src, alt)       =>
  `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#0c1421,#131d2e)'">`;

function generate(branche, bData) {
  const ztItems   = bData.zeitfresser;
  const totalMinH = ztItems.reduce((a, z) => a + z.hMin, 0);
  const totalMaxH = ztItems.reduce((a, z) => a + z.hMax, 0);
  const avgH      = Math.round((totalMinH + totalMaxH) / 2);
  const roiMonat  = Math.round(avgH * 4 * 35 / 100) * 100;
  const maxBarH   = Math.max(...ztItems.map(z => z.hMax), 1);
  const datum     = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const imgKey    = bData.imgKey;

  const ztRowsHtml = ztItems.map(z => `
  <div class="zt-row">
    <div class="zt-hours">${z.hMin}–${z.hMax}h</div>
    <div class="zt-body">
      <div class="zt-title">${icon(z.lucide, 'zt-icon')} ${z.label}</div>
      <div class="zt-sub">${z.loesung}</div>
    </div>
  </div>`).join('');

  const autoCardsHtml = bData.potenziale.map(p => `
  <div class="auto-card">
    <div class="auto-icon-box">${icon(p.icon, 'auto-icon')}</div>
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
    <div class="auto-badge">${icon('clock', 'badge-clock')} ${p.h} Std/Woche Einsparung</div>
  </div>`).join('');

  const barRowsHtml = ztItems.map(z => {
    const beforePct = Math.round((z.hMax / maxBarH) * 100);
    const afterPct  = Math.max(Math.round(beforePct * 0.15), 5);
    return `
  <div class="bar-row">
    <div class="bar-label">${z.label}</div>
    <div class="bars">
      <div class="bar-wrap"><div class="bar bar-before" style="width:${beforePct}%"><span>${z.hMax}h</span></div></div>
      <div class="bar-wrap"><div class="bar bar-after"  style="width:${afterPct}%"><span>${Math.round(z.hMax*0.15)}h</span></div></div>
    </div>
  </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[TEST] ${branche} KI-Roadmap | ML Vision</title>
<link rel="stylesheet" href="../../assets/css/analyse.css">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script>
</head>
<body>

<div class="test-banner">🧪 TESTSEITE — ${branche} | Bilder: ${imgKey}01.webp · ${imgKey}02.webp · ${imgKey}03.webp</div>

<nav>
  <div class="inner">
    <div class="logo">ML<span>Vision</span></div>
    <div class="nav-badge">Persönliche Analyse · ${datum}</div>
  </div>
</nav>

<div class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">${icon('sparkles')} Kostenlose KI-Prozessanalyse</div>
    <h1>Marias persönliche<br><em>KI-Roadmap</em></h1>
    <p class="hero-sub">${bData.tagline}</p>
    <div class="hero-meta">
      <span class="hero-chip">${icon('building-2')} ${bData.label}</span>
      <span class="hero-chip">${icon('users')} 6–20 Mitarbeiter</span>
      <span class="hero-chip">${icon('zap')} ${ztItems.length} Zeitfresser identifiziert</span>
    </div>
  </div>
  <div class="hero-img">
    ${imgBlock(`${BASE_IMG}/${imgKey}01.webp`, bData.label)}
  </div>
</div>

<section>
  <div class="wrap">
    <div class="zeit-grid">
      <div>
        <p class="sec-label">Ihre Zeitfresser</p>
        <h2 class="sec-title">Wo Ihre Zeit wirklich bleibt</h2>
        <div class="zeit-intro">
          <p class="sec-desc">${bData.zeitDesc} <strong>${totalMaxH}+ Stunden</strong> an administrativen Aufgaben — Zeit, die im Betrieb fehlt.</p>
        </div>
        <div class="zt-rows">${ztRowsHtml}</div>
      </div>
      <div class="zeit-img-wrap">
        ${imgBlock(`${BASE_IMG}/${imgKey}02.webp`, 'Zeitverlust im Betrieb')}
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="sec-label">KI-Lösungen</p>
    <h2 class="sec-title">Top-3 Automatisierungen für Ihren Betrieb</h2>
    <p class="sec-desc">Gezielte KI-Lösungen, direkt auf die größten Zeitfresser in ${bData.label} zugeschnitten.</p>
    <div class="auto-grid">${autoCardsHtml}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="sec-label">Ihr Potenzial</p>
    <h2 class="sec-title">Was Sie konkret gewinnen</h2>
    <p class="sec-desc">Realistische Kennzahlen auf Basis vergleichbarer Betriebe nach 3 Monaten Automatisierung.</p>
    <div class="savings-grid">
      <div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot dot-before"></div> Vorher (Std/Wo)</div>
          <div class="legend-item"><div class="legend-dot dot-after"></div> Nachher (Std/Wo)</div>
        </div>
        <div class="bar-rows">${barRowsHtml}</div>
      </div>
      <div class="savings-nums">
        <div class="savings-num-block">
          <div class="savings-big">${totalMinH}–<span class="accent">${totalMaxH}h</span></div>
          <div class="savings-num-title">Zeitersparnis pro Woche</div>
          <div class="savings-num-sub">Das sind ${totalMinH*4}–${totalMaxH*4} Stunden im Monat</div>
        </div>
        <div class="savings-divider"></div>
        <div class="savings-num-block">
          <div class="savings-big"><span class="accent">${roiMonat.toLocaleString('de-DE')} €</span></div>
          <div class="savings-num-title">ROI / Monat</div>
          <div class="savings-num-sub">Bei 35 €/Std Opportunitätskosten — konservativ kalkuliert</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="plan-grid">
      <div class="plan-img-wrap">
        ${imgBlock(`${BASE_IMG}/${imgKey}03.webp`, 'Aktionsplan mit ML Vision')}
      </div>
      <div>
        <p class="sec-label">Nächste Schritte</p>
        <h2 class="sec-title">Ihr Aktionsplan mit ML Vision</h2>
        <p class="sec-desc">Konkrete nächste Schritte — von der ersten Analyse bis zur laufenden Automatisierung.</p>
        <div class="plan-steps">
          <div class="plan-step"><div class="step-num">1</div><div class="step-content"><h4>Kostenloses Erstgespräch</h4><p>30-Minuten-Analyse Ihrer größten Zeitfresser — individuell, keine generischen Lösungen</p></div></div>
          <div class="plan-step"><div class="step-num">2</div><div class="step-content"><h4>Pilotprojekt starten</h4><p>Wir implementieren die erste Automatisierung innerhalb von 2 Wochen — messbare Ergebnisse ab Tag 1</p></div></div>
          <div class="plan-step"><div class="step-num">3</div><div class="step-content"><h4>Skalieren &amp; optimieren</h4><p>Schritt für Schritt weitere Prozesse automatisieren — Sie behalten stets die Kontrolle</p></div></div>
        </div>
        <div class="plan-cta-inline">
          ${icon('arrow-right')}
          <p><strong>Jetzt handeln:</strong> Vereinbaren Sie noch diese Woche Ihr kostenloses Strategiegespräch mit ML Vision — und starten Sie Ihre persönliche Automatisierungsreise.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="wrap">
    <div class="cta-box">
      <div class="cta-badge">${icon('clock')} Ihr Analyse-Ergebnis · ${datum}</div>
      <h2>Bereit, ${totalMinH}–${totalMaxH} Stunden<br>pro Woche zurückzugewinnen?</h2>
      <p>In einem kostenlosen 30-Minuten-Gespräch zeigen wir Ihnen, wie wir die ersten Automatisierungen in Ihrem Betrieb umsetzen — konkret und direkt umsetzbar.</p>
      <a href="https://www.vision-ml.de/#kontakt" class="btn">Kostenloses Gespräch buchen ${icon('arrow-right')}</a>
      <br>
      <a href="https://www.vision-ml.de" class="btn-ghost">Mehr über ML Vision erfahren ${icon('external-link')}</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <p>TESTSEITE · ${bData.label} · <a href="https://www.vision-ml.de">vision-ml.de</a></p>
  </div>
</footer>

<script>lucide.createIcons();<\/script>
</body>
</html>`;
}

// Alle Branchen generieren
Object.entries(branchenMap).forEach(([branche, bData]) => {
  const filename = `test-${bData.imgKey}.html`;
  const filepath = path.join(OUT_DIR, filename);
  const html = generate(branche, bData);
  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✓ ${filename}  →  /public/analyse/${filename}`);
});

console.log('\nFertig! Alle Testseiten sind in public/analyse/ gespeichert.');
console.log('Jetzt per FTP hochladen und unter /public/analyse/test-[branche].html testen.');
