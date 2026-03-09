# Homepage Redesign - Roadmap & Arbeitsprotokoll

> **Projekt:** ML Vision Homepage Modernisierung
> **Ziel:** Conversion-optimierte, moderne Homepage mit Trust Signals & Social Proof
> **Start:** März 2026
> **Haupt-Dateien:** `index.html`, `assets/css/style.css`, `assets/js/script.js`

---

## Schnellübersicht - Aktueller Status

```
PHASE 1: Kritische Fixes        ██████████ 100% [FERTIG]
PHASE 2: Hero & Trust           ██████████ 100% [FERTIG]
PHASE 3: Content & Sections     ██████████ 100% [FERTIG]
PHASE 4: Mobile & Performance   ██████████ 100% [FERTIG]
PHASE 5: Final Polish           ░░░░░░░░░░ 0%   [OFFEN]
```

---

## Kontext für zukünftige Sessions

### Was ist ML Vision?
- KI-Automatisierungs-Agentur in Düren/NRW
- B2B-Zielgruppe (Mittelstand)
- Services: Workflow-Automatisierung, Voice Agents, Chatbots, Beratung
- Tech-Stack: HTML/CSS/JS, Firebase, ElevenLabs Voice Widget

### Hauptprobleme der aktuellen Homepage
1. **DSGVO-Verstoß** - Kein Cookie-Banner!
2. **Keine Trust Signals** - Keine Logos, Zahlen, Testimonials
3. **Schwacher Hero** - Generische Headline, nur 1 CTA
4. **Überladene Sections** - Zu viel Text, keine Icons
5. **Mobile UX** - Header-Bild problematisch

### Wichtige Dateipfade
```
Hauptseite:     d:\Projekte\Kunden\ML_Vision\Brand\Webdesign\index.html
CSS:            d:\Projekte\Kunden\ML_Vision\Brand\Webdesign\assets\css\style.css
JavaScript:     d:\Projekte\Kunden\ML_Vision\Brand\Webdesign\assets\js\script.js
Bilder:         d:\Projekte\Kunden\ML_Vision\Brand\Webdesign\assets\img\
Analyse:        d:\Projekte\Kunden\ML_Vision\Brand\Webdesign\MD\HOMEPAGE_KRITISCHE_ANALYSE.md
```

### Design-Vorgaben
```css
/* Farbpalette */
--primary:      #04A9D4;    /* Cyan - Hauptfarbe */
--primary-dark: #0390b8;    /* Cyan dunkel */
--secondary:    #1A1A1A;    /* Fast Schwarz */
--accent:       #FF6B35;    /* Orange - NEU für Highlights */
--success:      #2ECC71;    /* Grün für Checkmarks */
--neutral:      #F5F7FA;    /* Hellgrau Hintergrund */
--text:         #475159;    /* Textfarbe */

/* Schrift */
font-family: 'Futura Book', Arial, sans-serif;

/* Spacing (8px Grid) */
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 48px;
--space-xl: 80px;
```

---

## PHASE 1: Kritische Fixes (DSGVO & Basics)

### 1.1 Cookie-Banner implementieren
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | KRITISCH | 2-3 Stunden |

**Was zu tun ist:**
- Cookie-Consent-Banner am unteren Bildschirmrand
- Opt-in für Analytics (falls vorhanden)
- Opt-in für Marketing-Cookies
- "Alle akzeptieren" / "Nur notwendige" / "Einstellungen" Buttons
- Link zur Datenschutzerklärung
- Cookie-Präferenzen in localStorage speichern

**Technische Details:**
```html
<!-- Am Ende von body, vor </body> -->
<div id="cookieBanner" class="cookie-banner">
  <div class="cookie-content">
    <p>Wir verwenden Cookies...</p>
    <div class="cookie-buttons">
      <button id="acceptAll">Alle akzeptieren</button>
      <button id="acceptNecessary">Nur notwendige</button>
      <button id="cookieSettings">Einstellungen</button>
    </div>
  </div>
</div>
```

**Dateien zu bearbeiten:**
- `index.html` - Banner HTML einfügen
- `style.css` - Banner Styling
- `script.js` - Cookie-Logik (localStorage)

**Referenz:** DSGVO Art. 6, 7 / ePrivacy-Richtlinie

---

### 1.2 Copyright-Jahr aktualisieren
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | NIEDRIG | 2 Minuten |

**Was zu tun ist:**
```html
<!-- Aktuell -->
<p>&copy; 2025 ML Vision</p>

<!-- Ändern zu -->
<p>&copy; 2024-2026 ML Vision</p>
```

**Datei:** `index.html` Zeile ~473

---

### 1.3 Skip-Link für Accessibility
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 15 Minuten |

**Was zu tun ist:**
```html
<!-- Ganz oben in <body> -->
<a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
```

```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  padding: 10px 20px;
  background: #04A9D4;
  color: #fff;
  z-index: 10000;
}
.skip-link:focus {
  top: 0;
}
```

---

## PHASE 2: Hero Section & Trust Elements

### 2.1 Hero Headline überarbeiten
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | HOCH | 30 Minuten |

**Aktuell (schlecht):**
```html
<h1>Intelligente Automatisierungen.</h1>
<h2>Von smarten Workflows bis zu KI-gestützten Assistenten...
```

**Neu (mit Value Proposition):**
```html
<h1>Reduzieren Sie Ihre Verwaltungszeit um <span class="highlight">70%</span></h1>
<h2>KI-Automatisierung für den Mittelstand in NRW –
    von der Analyse bis zur Umsetzung in nur 30 Tagen.</h2>

<div class="hero-benefits">
  <span class="benefit">✓ Keine Programmierkenntnisse nötig</span>
  <span class="benefit">✓ DSGVO-konform</span>
  <span class="benefit">✓ In 30 Tagen einsatzbereit</span>
</div>
```

**Datei:** `index.html` Zeilen 171-175

---

### 2.2 Dual CTA im Hero
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | HOCH | 20 Minuten |

**Aktuell:**
```html
<a href="#kontakt"><button class="cta-button">Kontakt</button></a>
```

**Neu:**
```html
<div class="hero-ctas">
  <a href="#kontakt" class="cta-button primary">Kostenlose Prozessanalyse</a>
  <a href="#demo" class="cta-button secondary">Demo ansehen</a>
</div>
```

**CSS hinzufügen:**
```css
.hero-ctas {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button.secondary {
  background: transparent;
  border: 2px solid #04A9D4;
  color: #04A9D4;
}

.cta-button.secondary:hover {
  background: rgba(4, 169, 212, 0.1);
}
```

---

### 2.3 Trust-Bar mit Zahlen
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | HOCH | 1 Stunde |

**Neue Section nach Hero:**
```html
<section class="trust-bar">
  <div class="trust-container">
    <div class="trust-item">
      <span class="trust-number" data-count="50">0</span>
      <span class="trust-suffix">+</span>
      <span class="trust-label">Automatisierte Prozesse</span>
    </div>
    <div class="trust-item">
      <span class="trust-number" data-count="10000">0</span>
      <span class="trust-suffix">+</span>
      <span class="trust-label">Eingesparte Stunden</span>
    </div>
    <div class="trust-item">
      <span class="trust-number" data-count="99.8">0</span>
      <span class="trust-suffix">%</span>
      <span class="trust-label">Uptime Garantie</span>
    </div>
    <div class="trust-item">
      <span class="trust-number">24/7</span>
      <span class="trust-label">Support verfügbar</span>
    </div>
  </div>
</section>
```

**Position:** Nach `</header>`, vor `<section class="grid-section">`

**JavaScript für Counter-Animation:**
```javascript
// Animierte Counter bei Scroll
const counters = document.querySelectorAll('.trust-number[data-count]');
const animateCounter = (counter) => {
  const target = parseFloat(counter.dataset.count);
  const duration = 2000;
  const start = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    counter.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(update);
    else counter.textContent = target;
  };
  requestAnimationFrame(update);
};
```

---

### 2.4 Kundenlogo-Leiste
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | HOCH | 1 Stunde |

**Neue Section:**
```html
<section class="logo-wall">
  <p class="logo-wall-title">Diese Unternehmen vertrauen uns bereits</p>
  <div class="logo-container">
    <img src="assets/img/clients/logo1.png" alt="Kunde 1" loading="lazy">
    <img src="assets/img/clients/logo2.png" alt="Kunde 2" loading="lazy">
    <img src="assets/img/clients/logo3.png" alt="Kunde 3" loading="lazy">
    <img src="assets/img/clients/logo4.png" alt="Kunde 4" loading="lazy">
    <img src="assets/img/clients/logo5.png" alt="Kunde 5" loading="lazy">
  </div>
</section>
```

**Hinweis:** Kundenlogos müssen vom Auftraggeber bereitgestellt werden!
Falls keine echten Logos: Platzhalter mit "Ihr Logo hier" oder Section weglassen.

---

### 2.5 Testimonials Section
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | HOCH | 2 Stunden |

**Neue Section (nach Services, vor About):**
```html
<section class="testimonials-section" id="referenzen">
  <h2 class="section-title">Was unsere Kunden sagen</h2>

  <div class="testimonials-container">
    <div class="testimonial-card">
      <div class="testimonial-stars">★★★★★</div>
      <blockquote class="testimonial-text">
        "ML Vision hat unsere Kundenkommunikation revolutioniert.
        Wir sparen jetzt 20 Stunden pro Woche."
      </blockquote>
      <div class="testimonial-author">
        <img src="assets/img/testimonials/person1.jpg" alt="Max Mustermann">
        <div class="author-info">
          <strong>Max Mustermann</strong>
          <span>Geschäftsführer, ABC GmbH</span>
        </div>
      </div>
    </div>

    <!-- Weitere Testimonials... -->
  </div>
</section>
```

**Hinweis:** Echte Testimonials vom Auftraggeber anfordern!

---

## PHASE 3: Content & Section Redesign

### 3.1 Services Section mit Icons
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 2 Stunden |

**Aktuelles Problem:**
- Zu viel Text
- Keine visuellen Icons
- Unklare Hierarchie

**Neues Design:**
```html
<section class="services-section" id="leistungen">
  <h2 class="section-title">Unsere Leistungen</h2>

  <div class="services-grid">
    <div class="service-card">
      <div class="service-icon">
        <!-- SVG Icon hier -->
        <svg>...</svg>
      </div>
      <h3>Workflow-Automatisierung</h3>
      <p>Automatisieren Sie wiederkehrende Aufgaben und sparen Sie wertvolle Zeit.</p>
      <ul class="service-features">
        <li>✓ E-Mail-Automatisierung</li>
        <li>✓ CRM-Integration</li>
        <li>✓ Reporting</li>
      </ul>
      <a href="public/workflow-automatisierung.html" class="service-link">
        Mehr erfahren →
      </a>
    </div>

    <!-- Weitere Cards... -->
  </div>
</section>
```

**Icons benötigt:**
- Workflow: Zahnräder / Prozess-Flow
- Voice Agents: Mikrofon / Sprechblase
- Beratung: Glühbirne / Handschlag

---

### 3.2 Prozess als Timeline (Desktop)
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 2 Stunden |

**Aktuell:** Slider für alle Geräte
**Neu:** Timeline auf Desktop, Slider nur auf Mobile

```html
<section class="process-section" id="prozess">
  <h2 class="section-title">Unser Prozess</h2>

  <div class="process-timeline">
    <div class="timeline-item">
      <div class="timeline-number">1</div>
      <div class="timeline-content">
        <h4>Analyse</h4>
        <p>Kostenlose Potenzialanalyse Ihrer Prozesse</p>
        <span class="timeline-duration">1-2 Tage</span>
      </div>
    </div>
    <div class="timeline-connector"></div>
    <!-- Weitere Steps... -->
  </div>
</section>
```

**CSS:**
```css
.process-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-connector {
  flex: 1;
  height: 2px;
  background: #04A9D4;
  align-self: center;
}

@media (max-width: 768px) {
  .process-timeline {
    flex-direction: column;
  }
  /* Slider-Logik aktivieren */
}
```

---

### 3.3 FAQ Section (NEU)
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 1.5 Stunden |

**Neue Section (vor Kontakt):**
```html
<section class="faq-section" id="faq">
  <h2 class="section-title">Häufig gestellte Fragen</h2>

  <div class="faq-container">
    <details class="faq-item">
      <summary class="faq-question">
        Was kostet eine KI-Automatisierung?
      </summary>
      <div class="faq-answer">
        <p>Die Kosten variieren je nach Komplexität.
           Für eine erste Einschätzung bieten wir eine kostenlose Prozessanalyse an.</p>
      </div>
    </details>

    <details class="faq-item">
      <summary class="faq-question">
        Wie lange dauert die Implementierung?
      </summary>
      <div class="faq-answer">
        <p>Einfache Automatisierungen sind in 1-2 Wochen einsatzbereit.
           Komplexere Projekte dauern 4-8 Wochen.</p>
      </div>
    </details>

    <!-- Weitere FAQs... -->
  </div>
</section>
```

**SEO-Benefit:** FAQ Schema Markup für Google Featured Snippets

---

### 3.4 Team Section verbessern
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | NIEDRIG | 1 Stunde |

**Verbesserungen:**
- LinkedIn-Links hinzufügen
- Credentials/Erfahrung hinzufügen
- Weniger "ich"-fokussiert, mehr kundenorientiert

```html
<div class="team-content">
  <h3>Leon Schauerte</h3>
  <p class="team-role">CEO & Vertrieb</p>
  <ul class="team-credentials">
    <li>5+ Jahre Erfahrung im Vertrieb</li>
    <li>Spezialist für KI-Lösungen im Mittelstand</li>
  </ul>
  <div class="team-social">
    <a href="https://linkedin.com/in/..." aria-label="LinkedIn">
      <svg>...</svg>
    </a>
  </div>
</div>
```

---

### 3.5 Kontaktformular optimieren
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 1 Stunde |

**Änderungen:**
1. Nachname optional machen (nicht required)
2. Erwartungssteuerung hinzufügen
3. Alternative Kontaktmöglichkeiten

```html
<div class="contact-expectations">
  <p>Nach Ihrer Anfrage:</p>
  <ul>
    <li>✓ Antwort innerhalb von 24 Stunden</li>
    <li>✓ Kostenlose 15-Min Erstberatung</li>
    <li>✓ Unverbindlich & ohne Verpflichtung</li>
  </ul>
</div>

<div class="contact-alternatives">
  <p>Oder direkt:</p>
  <a href="tel:+49..." class="contact-alt">📞 Anrufen</a>
  <a href="https://calendly.com/..." class="contact-alt">📅 Termin buchen</a>
</div>
```

---

## PHASE 4: Mobile & Performance

### 4.1 Mobile Hero-Bild
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG (teilweise) | MITTEL | 30 Minuten |

**Problem:** Desktop-Bild wird auf Mobile beschnitten

**Lösung:**
```css
@media (max-width: 768px) {
  header {
    background-image: url(../img/header_mobile.webp);
    background-position: center top;
  }
}
```

**Benötigt:** Separates hochkant-optimiertes Hero-Bild erstellen

---

### 4.2 Lazy Loading für Bilder
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 20 Minuten |

**Alle img-Tags aktualisieren:**
```html
<img src="..." alt="..." loading="lazy">
```

**Ausnahme:** Hero-Bild (above the fold) - kein lazy loading

---

### 4.3 Sticky Mobile CTA
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ✅ FERTIG | MITTEL | 30 Minuten |

**Sticky Button am unteren Rand (nur Mobile):**
```html
<div class="mobile-sticky-cta">
  <a href="#kontakt" class="cta-button">Jetzt Kontakt aufnehmen</a>
</div>
```

```css
.mobile-sticky-cta {
  display: none;
}

@media (max-width: 768px) {
  .mobile-sticky-cta {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 999;
  }

  .mobile-sticky-cta .cta-button {
    width: 100%;
    text-align: center;
  }

  /* Footer Padding anpassen */
  .footer {
    padding-bottom: 100px;
  }
}
```

---

### 4.4 Critical CSS
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ⏭️ ÜBERSPRUNGEN | NIEDRIG | 1 Stunde |

**Above-the-fold CSS inline:**
```html
<head>
  <style>
    /* Kritisches CSS für Hero, Nav, erste Sections */
  </style>
  <link rel="preload" href="assets/css/style.css" as="style" onload="this.rel='stylesheet'">
</head>
```

---

## PHASE 5: Final Polish

### 5.1 Zweite Akzentfarbe einführen
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ⬜ OFFEN | NIEDRIG | 30 Minuten |

**Orange für Highlights:**
```css
:root {
  --accent-orange: #FF6B35;
}

.highlight, .badge-new, .special-offer {
  color: var(--accent-orange);
}
```

---

### 5.2 Scroll-Progress Indicator
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ⬜ OFFEN | NIEDRIG | 20 Minuten |

```html
<div class="scroll-progress"></div>
```

```css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(to right, #04A9D4, #FF6B35);
  width: 0%;
  z-index: 10001;
  transition: width 0.1s;
}
```

```javascript
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.querySelector('.scroll-progress').style.width = scrolled + '%';
});
```

---

### 5.3 Navigation Dropdown
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ⬜ OFFEN | NIEDRIG | 1 Stunde |

**Leistungen mit Dropdown:**
```html
<div class="nav-item has-dropdown">
  <button>Leistungen</button>
  <div class="dropdown-menu">
    <a href="public/workflow-automatisierung.html">Workflow-Automatisierung</a>
    <a href="public/voice-agents-chatbots.html">Voice Agents & Chatbots</a>
    <a href="#leistungen">Beratung & Strategie</a>
  </div>
</div>
```

---

### 5.4 Final Testing Checklist
| Status | Priorität | Geschätzte Zeit |
|--------|-----------|-----------------|
| ⬜ OFFEN | HOCH | 2 Stunden |

**Zu prüfen:**
- [ ] Cross-Browser (Chrome, Firefox, Safari, Edge)
- [ ] Mobile Devices (iOS Safari, Android Chrome)
- [ ] Lighthouse Score (Performance, Accessibility, SEO)
- [ ] DSGVO-Compliance (Cookie-Banner funktioniert)
- [ ] Formulare funktionieren
- [ ] Alle Links funktionieren
- [ ] Bilder laden korrekt
- [ ] Voice Widget funktioniert

---

## Arbeitsprotokoll / Tagebuch

### Session 1 - 08.03.2026
```
Durchgeführt:
- [x] Cookie-Banner HTML implementiert (mit Settings-Modal)
- [x] Cookie-Banner CSS gestylt (responsive, dark theme)
- [x] Cookie-Banner JavaScript (localStorage-Logik, DSGVO-konform)
- [x] Copyright-Jahr auf 2024-2026 aktualisiert
- [x] Skip-Link für Accessibility hinzugefügt
- [x] <main>-Element für semantisches HTML hinzugefügt

Nächste Schritte:
- Phase 2: Hero Section & Trust Elements
- Trust-Bar mit Zahlen
- Dual CTAs im Hero

Notizen:
- Cookie-Banner mit 3 Kategorien: Notwendig (immer an), Analytics, Marketing
- Öffentliche API window.CookieConsent für manuelle Steuerung
- Skip-Link erscheint bei Tab-Navigation für Screenreader
```

---

### Session 2 - 08.03.2026
```
Durchgeführt:
- [x] Hero Headline mit Value Proposition (70% Zeitersparnis) + Hero Benefits
- [x] Dual CTA implementiert (Primär: "Kostenlose Prozessanalyse", Sekundär: "Prozess ansehen")
- [x] Trust-Bar mit 4 Kennzahlen + animierte Counter bei Scroll
- [x] Kundenlogo-Leiste mit Platzhaltern (warten auf echte Logos)
- [x] Testimonials Section mit 3 Platzhalter-Testimonials
- [x] CSS für alle neuen Elemente (responsive)
- [x] JavaScript für Counter-Animation mit Easing

Nächste Schritte:
- Phase 3: Content & Section Redesign
- Services Section mit Icons überarbeiten
- FAQ Section hinzufügen

Notizen:
- Kundenlogos und Testimonials sind Platzhalter - echte Inhalte vom Auftraggeber anfordern
- Trust-Zahlen (50+ Prozesse, 10.000+ Stunden, 99.8% Uptime) sollten verifiziert werden
- Counter animiert beim Scrollen mit easeOutQuart für smoothen Effekt
- Secondary CTA verlinkt auf #prozess statt #demo (da Demo-Section nicht existiert)
```

---

### Session 3 - 09.03.2026
```
Durchgeführt:
- [x] Services Section komplett neu gestaltet mit SVG-Icons
- [x] Service-Cards mit Hover-Effekten und Feature-Listen
- [x] Prozess-Timeline für Desktop implementiert (horizontal mit Pfeilen)
- [x] Mobile Slider bleibt für kleine Bildschirme erhalten
- [x] FAQ Section mit 6 Fragen und Accordion-Design (details/summary)
- [x] FAQ Schema Markup für SEO (Google Featured Snippets)
- [x] Team Section mit LinkedIn-Links und Credentials
- [x] Kundenorientierte Team-Beschreibungen
- [x] Kontaktformular mit Erwartungssteuerung und alternativen Kontaktmöglichkeiten
- [x] Telefonnummer und E-Mail als direkte Kontaktoptionen

Nächste Schritte:
- Phase 4: Mobile & Performance
- Mobile Hero-Bild optimieren
- Lazy Loading für Bilder
- Sticky Mobile CTA

Notizen:
- Services Section: 3 Cards mit SVG-Icons (Beratung, Workflow, Voice Agents)
- Timeline: Desktop horizontal, Mobile Slider (breakpoint 992px)
- FAQ: 6 häufige Fragen mit SEO Schema Markup
- Calendly-Integration ist vorbereitet (auskommentiert), Link vom Auftraggeber nötig
- Telefonnummer verwendet: 02421 969 96 80
- LinkedIn-Links sind Platzhalter, müssen verifiziert werden
```

---

## Offene Fragen an Auftraggeber

| # | Frage | Status | Antwort |
|---|-------|--------|---------|
| 1 | Gibt es echte Kundenlogos zur Verwendung? | Platzhalter nutzen |
| 2 | Gibt es echte Testimonials/Kundenstimmen? | Platzhalter nutzen | - |
| 3 | Soll Calendly integriert werden? Wenn ja, Link? | OFFEN | - |
| 4 | Welche Telefonnummer für Kontakt? | OFFEN | - |
| 5 | Gibt es Case Studies / Erfolgsgeschichten? | OFFEN | - |
| 6 | Sind die Trust-Zahlen (50+ Prozesse etc.) korrekt? | OFFEN | - |
| 7 | Gibt es ein separates Mobile Hero-Bild? | OFFEN | - |

---

## Ressourcen & Links

- **Kritische Analyse:** `MD/HOMEPAGE_KRITISCHE_ANALYSE.md`
- **Projekt-Doku:** `MD/PROJEKT_DOKUMENTATION.md`
- **Aktuelle Homepage:** `index.html`
- **Haupt-CSS:** `assets/css/style.css`

---

## Quick Reference: Wichtige Code-Stellen

| Element | Datei | Zeile(n) |
|---------|-------|----------|
| Hero Section | index.html | 171-176 |
| Services Grid | index.html | 178-223 |
| Prozess Slider | index.html | 225-273 |
| About Section | index.html | 276-309 |
| Kontakt Form | index.html | 311-375 |
| Footer | index.html | 402-475 |
| Hero CSS | style.css | 79-91 |
| Grid Section CSS | style.css | 334-536 |
| Trust Bar CSS | style.css | [NEU ERSTELLEN] |
| Cookie Banner CSS | style.css | [NEU ERSTELLEN] |

---

*Letzte Aktualisierung: März 2026*
*Nächste geplante Session: [EINTRAGEN]*
