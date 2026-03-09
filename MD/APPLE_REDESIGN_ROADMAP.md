# ML Vision – Apple-Style Redesign Roadmap

> **Ziel:** Cleaner, moderner Look. Keine Hintergrundbilder. Alle Inhalte bleiben erhalten.
> **Inspiration:** Apple.com – viel Weißraum, große Typografie, subtile Schatten, klare Struktur.
> **Haupt-Dateien:** `index.html` · `assets/css/style.css` · `assets/js/script.js`
> **Stand:** Phasen 1–4 der alten Roadmap sind abgeschlossen. Jetzt visueller Komplettumbau.

---

## KONTEXT FÜR NEUE SESSIONS (hier immer zuerst lesen)

### Was ist ML Vision?
- KI-Automatisierungs-Agentur, Düren / NRW
- Zielgruppe: B2B Mittelstand
- Services: Workflow-Automatisierung, Voice Agents, Chatbots, Beratung
- Tech-Stack: HTML / CSS / JS, Firebase, ElevenLabs Voice Widget
- Seite ist live unter: `vision-ml.de`

### Was wurde bisher gemacht?
Phasen 1–4 der alten Roadmap (`HOMEPAGE_REDESIGN_ROADMAP.md`) sind fertig:
- Cookie-Banner ✅
- Hero mit Value Proposition & Trust Bar ✅
- Services Section mit Icons ✅
- FAQ Section ✅
- Team Section mit LinkedIn ✅
- Kontaktformular ✅

### Was ändert sich JETZT?
- **Kein Hintergrundbild** im Header / in Sections
- **Apple-Style Ästhetik:** weiß/hellgrau, große Schrift, viel Luft
- **Alle Inhalte bleiben 1:1 erhalten** – nur das Visuelle ändert sich
- Neue Farbpalette (hell statt dunkel)
- Saubere Typografie-Hierarchie
- Keine Glow-Effekte, kein `#1A1A1A`-Dunkel

### Apple Design-Prinzipien (Referenz)
```
Hintergrund:   #F5F5F7 (hell) oder #FFFFFF (weiß)
Primärtext:    #1D1D1F (fast schwarz)
Sekundärtext:  #6E6E73 (mittelgrau)
Akzentfarbe:   #04A9D4 (ML Vision Cyan – bleibt)
Cards:         weiß mit box-shadow: 0 4px 20px rgba(0,0,0,0.08)
Radius:        12px–20px für Karten
Nav:           weiß semi-transparent mit backdrop-filter
Spacing:       großzügig, 80px–120px Section-Padding
```

---

## FORTSCHRITTS-ÜBERSICHT

```
PHASE A: Design-Foundation     ██████████ 100% [FERTIG]
PHASE B: Header & Hero         ██████████ 100% [FERTIG]
PHASE C: Sections Redesign     ██████████ 100% [FERTIG]
PHASE D: Typografie & Details  ██████████ 100% [FERTIG]
PHASE E: Mobile Polish         ██████████ 100% [FERTIG]
PHASE G: 3D Apple Redesign     ██████████ 100% [FERTIG] ← NEU (Session 4)
PHASE F: Final Testing         ░░░░░░░░░░  0%  [OFFEN]
```

---

## PHASE A: Design-Foundation (CSS Variables & Reset)

### A.1 – CSS Custom Properties umschreiben
**Status:** ✅ FERTIG | **Priorität:** KRITISCH | **Datei:** `assets/css/style.css`

**Aktuell (dunkel/mixed):**
```css
/* Farben verstreut im CSS, kein zentrales System */
background: #1a1a1a;
color: #04A9D4;
background: rgba(255,255,255,0.452);
```

**Neu (oben in style.css einfügen):**
```css
:root {
  /* Hintergründe */
  --bg-primary:    #FFFFFF;
  --bg-secondary:  #F5F5F7;
  --bg-tertiary:   #E8E8ED;

  /* Text */
  --text-primary:   #1D1D1F;
  --text-secondary: #6E6E73;
  --text-tertiary:  #AEAEB2;

  /* Markenfarbe */
  --accent:         #04A9D4;
  --accent-dark:    #0390b8;
  --accent-light:   rgba(4, 169, 212, 0.1);

  /* Cards & Surfaces */
  --card-bg:        #FFFFFF;
  --card-shadow:    0 4px 20px rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 8px 40px rgba(0, 0, 0, 0.12);
  --border:         rgba(0, 0, 0, 0.08);

  /* Radien */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  28px;

  /* Spacing */
  --section-padding:  120px 40px;
  --section-padding-sm: 80px 24px;
}
```

**Was danach zu tun:**
- Alle hardcodierten `#1a1a1a`, `#475159`, `background: transparent` etc. durch Variablen ersetzen

---

### A.2 – Body & Scrollbar anpassen
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  /* font-family bleibt: 'Futura Book', Arial, sans-serif */
}

/* Scrollbar hell statt dunkel */
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--accent); }
* { scrollbar-color: var(--accent) var(--bg-secondary); }
```

---

## PHASE B: Header & Navigation

### B.1 – Hintergrundbild aus Header entfernen
**Status:** ✅ FERTIG | **Priorität:** KRITISCH | **Datei:** `assets/css/style.css`

**Aktuell:**
```css
header {
  background-image: url(../img/header_new_test.webp);
  background-size: 100% auto;
  background-repeat: no-repeat;
  height: 80vh;
}
```

**Neu – sauberer Apple-Hero:**
```css
header {
  background: var(--bg-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* kein background-image */
}
```

---

### B.2 – Navbar Apple-Style
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

Apple-Nav: weiß, subtiler Blur, sehr feiner Border unten.

```css
.navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--border);
  box-shadow: none; /* kein shadow, nur border */
}
```

**Nav-Buttons überarbeiten:**
```css
.nav-center button,
.nav-right button {
  background: transparent;
  border: none;              /* kein Rahmen */
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 400;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.nav-center button:hover,
.nav-right button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transform: none;           /* kein scale */
  box-shadow: none;
}

/* Login-Button als Pill */
.nav-right button {
  background: var(--accent);
  color: #fff;
  border-radius: 20px;
  padding: 8px 20px;
}
.nav-right button:hover {
  background: var(--accent-dark);
}
```

**Burger-Menu Farbe:**
```css
.burger-menu span {
  background: var(--text-primary); /* statt #04A9D4 */
}
```

---

### B.3 – Hero Content neu gestalten
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css` + `index.html`

Das Hero-Bild fällt weg – der Content muss jetzt selbst tragen.
Apple macht das durch große, mutige Typografie + optional ein Produkt-Visual.

```css
.hero-content {
  margin-top: 160px;   /* war 280px wegen Bild */
  padding: 0 40px;
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.hero-content h1 {
  font-size: 72px;
  font-weight: bold;
  color: var(--text-primary);    /* statt #04A9D4 */
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-transform: none;          /* weg mit uppercase */
}

/* Highlight bleibt Akzentfarbe */
.hero-content h1 .highlight {
  color: var(--accent);
}

.hero-content h2 {
  font-size: 21px;
  color: var(--text-secondary);
  font-weight: 400;
  max-width: 600px;
  margin: 20px auto 40px;
}
```

**Hero Benefits (Badges):**
```css
.hero-benefits {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.benefit {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.benefit-icon {
  color: var(--accent);
  width: 16px;
  height: 16px;
}
```

**CTA Buttons:**
```css
.cta-button.primary {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-xl);
  padding: 16px 32px;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 15px rgba(4, 169, 212, 0.35);
  transition: all 0.3s;
}
.cta-button.primary:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(4, 169, 212, 0.45);
}
/* kein ::before Glow-Effekt mehr */

.cta-button.secondary {
  background: transparent;
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-xl);
  color: var(--accent);
  padding: 16px 32px;
  font-size: 17px;
  transition: all 0.3s;
}
.cta-button.secondary:hover {
  background: var(--accent-light);
}
```

---

## PHASE C: Sections Redesign

### C.1 – Trust Bar
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.trust-bar {
  background: var(--bg-secondary);
  padding: 60px 40px;
  border-top: none;
  border-bottom: none;
}

.trust-number,
.trust-number-static {
  color: var(--text-primary);
  font-size: 48px;
  font-weight: bold;
}

.trust-suffix {
  color: var(--accent);
}

.trust-label {
  color: var(--text-secondary);
  font-size: 15px;
}
```

---

### C.2 – Services Section
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.services-section {
  background: var(--bg-primary);
  padding: var(--section-padding);
}

.section-title {
  color: var(--text-primary);
  font-size: 48px;
  font-weight: bold;
  letter-spacing: -0.02em;
}

.section-subtitle {
  color: var(--text-secondary);
}

.service-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  /* kein dark background */
  transition: box-shadow 0.3s, transform 0.3s;
}

.service-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-4px);
}

.service-icon {
  color: var(--accent);
  background: var(--accent-light);
  border-radius: var(--radius-md);
}

.service-card h3 {
  color: var(--text-primary);
}

.service-card p {
  color: var(--text-secondary);
}

.service-link {
  color: var(--accent);
}
```

---

### C.3 – Prozess Section (Hero-Section)
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.hero-section {           /* die #prozess Section */
  background: var(--bg-secondary);
  padding: var(--section-padding);
}

.automation-title,
.automation-subtitle {
  color: var(--text-primary);
}

.automation-intro {
  color: var(--text-secondary);
}

.timeline-number {
  background: var(--accent);
  color: #fff;
  /* statt dunklem Hintergrund */
}

.timeline-content h4 {
  color: var(--text-primary);
}

.timeline-content p,
.timeline-duration {
  color: var(--text-secondary);
}

.automation-cta-button {
  /* gleiche Styles wie .cta-button.primary */
  background: var(--accent);
  border-radius: var(--radius-xl);
  border: none;
  color: #fff;
}
```

---

### C.4 – Testimonials Section
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.testimonials-section {
  background: var(--bg-primary);
  padding: var(--section-padding);
}

.testimonial-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
}

.testimonial-text {
  color: var(--text-primary);
}

.testimonial-stars {
  color: var(--accent);
}

.author-avatar {
  background: var(--accent-light);
  color: var(--accent);
  /* statt dunklem Avatar */
}

.testimonials-note {
  color: var(--text-tertiary);
}
```

---

### C.5 – FAQ Section
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.faq-section {
  background: var(--bg-secondary);
  padding: var(--section-padding);
}

.faq-item {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  /* kein dark theme */
}

.faq-question {
  color: var(--text-primary);
}

.faq-answer p,
.faq-answer li {
  color: var(--text-secondary);
}

.faq-icon {
  color: var(--accent);
}
```

---

### C.6 – About & Team Section
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.about-section {
  background: var(--bg-primary);
  padding: var(--section-padding);
}

.about-title {
  color: var(--text-primary);
}

.about-subtitle {
  color: var(--text-secondary);
}

.team-member {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
}

.team-content h3 {
  color: var(--text-primary);
}

.team-role {
  color: var(--accent);
}

.team-credentials li,
.team-description {
  color: var(--text-secondary);
}
```

---

### C.7 – Kontakt Section
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.contact-section {
  background: var(--bg-secondary);
  padding: var(--section-padding);
}

.contact-title {
  color: var(--text-primary);
}

.contact-info h3,
.contact-info h4 {
  color: var(--text-primary);
}

.contact-info-intro,
.contact-expectations li,
.contact-alternatives {
  color: var(--text-secondary);
}

/* Formular-Inputs */
.contact-form input,
.contact-form select,
.contact-form textarea {
  background: var(--bg-primary);
  border: 1.5px solid var(--border);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
}

.contact-form input:focus,
.contact-form textarea:focus,
.contact-form select:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-light);
}

.submit-button {
  background: var(--accent);
  border: none;
  border-radius: var(--radius-xl);
  color: #fff;
  font-size: 17px;
  padding: 16px 32px;
}
```

---

### C.8 – Footer
**Status:** ✅ FERTIG | **Datei:** `assets/css/style.css`

```css
.footer {
  background: var(--text-primary);  /* #1D1D1F - einziger dunkler Bereich */
  color: rgba(255,255,255,0.7);
}

.footer h4,
.footer h5 {
  color: #FFFFFF;
}

.footer-links a {
  color: rgba(255,255,255,0.6);
}

.footer-links a:hover {
  color: var(--accent);
}
```

---

## PHASE D: Typografie & Detail-Feinschliff

### D.1 – Text-Stile vereinheitlichen
**Status:** ⬜ OFFEN

- Alle `text-transform: uppercase` bei Headings entfernen (außer explizit gewünscht)
- `letter-spacing: -0.02em` bei großen Headings (h1, h2)
- `line-height: 1.1` bei großen Headings, `1.6` bei Fließtext
- Fließtext-Farbe überall auf `var(--text-secondary)` setzen

### D.2 – Glow-Effekte entfernen
**Status:** ⬜ OFFEN

Folgende CSS-Regeln suchen und entfernen/deaktivieren:
- `.cta-button::before` (Glow-Gradient)
- `glowingBorder` Keyframe Animation
- `box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.15)`
- `filter: blur(4px)` auf Pseudo-Elementen
- `.nav-center button::before`, `.nav-right button::before`

### D.3 – Scroll-Reveal Anpassung
**Status:** ⬜ OFFEN

Apple verwendet sehr subtile Animationen. Aktueller `translateY(30px)` ist etwas viel.
```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(12px);   /* war 30px */
  transition: opacity 0.6s ease, transform 0.6s ease;
}
```

### D.4 – About-Contact Wrapper
**Status:** ⬜ OFFEN | **Datei:** `assets/css/style.css`

```css
.about-contact-wrapper {
  background: var(--bg-primary);
  /* falls aktuell dark background gesetzt */
}
```

---

## PHASE E: Mobile Polish

### E.1 – Hero auf Mobile
**Status:** ⬜ OFFEN

```css
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 40px;
  }
  .hero-content h2 {
    font-size: 18px;
  }
  .hero-content {
    margin-top: 120px;
    padding: 0 24px;
  }
}
```

### E.2 – Section-Padding Mobile
**Status:** ⬜ OFFEN

```css
@media (max-width: 768px) {
  :root {
    --section-padding: 80px 24px;
  }
  .section-title {
    font-size: 32px;
  }
}
```

### E.3 – Mobile Nav Overlay
**Status:** ⬜ OFFEN

Sicherstellen dass das Mobile-Menü auf hellem Hintergrund gut aussieht:
```css
@media (max-width: 768px) {
  .nav-menu {
    background: var(--bg-primary);
    border-top: 1px solid var(--border);
  }
  .nav-menu button {
    color: var(--text-primary);
  }
}
```

---

## PHASE F: Final Testing

### F.1 – Checkliste vor Live-Gang
**Status:** ⬜ OFFEN

- [ ] Alle Sections auf weißem/hellgrauem Hintergrund sichtbar
- [ ] Kein `#1a1a1a` mehr außerhalb Footer
- [ ] Hero ohne Hintergrundbild – sieht gut aus
- [ ] Alle Texte lesbar (Kontrast)
- [ ] Hover-Effekte funktionieren
- [ ] Mobile: alles noch erkennbar und gut?
- [ ] Formulare: Inputs auf hellem BG sichtbar
- [ ] Buttons: primary und secondary erkennbar
- [ ] Cookie-Banner noch korrekt?
- [ ] Voice Widget noch sichtbar?

---

## ARBEITSPROTOKOLL / TAGEBUCH

*Jede Session hier eintragen – so kann man ohne Kontext weitermachen.*

---

### Session 1 – 09.03.2026

**Durchgeführt:**
- Roadmap erstellt (diese Datei)
- Ist-Stand analysiert: Phasen 1–4 abgeschlossen
- Neues Redesign-Ziel definiert: Apple-Style, kein Hintergrundbild

**Stand:**
```
PHASE A: 100%  PHASE B: 0%  PHASE C: 0%  PHASE D: 0%  PHASE E: 0%  PHASE F: 0%
```

**Offene Fragen:**
- Soll der Footer auch hell werden, oder darf er dunkel bleiben? → Vorerst dunkel geplant.
- Logo-Datei: `logo_14.png` (dark) und `logo_white_trans.png` (weiß für Footer) vorhanden ✅

**Nächste Schritte:**
→ Start mit **Phase A** (CSS Variables) – das ist die Basis für alles andere.

---

### Session 2 – 09.03.2026

**Durchgeführt:**
- **B.1** – Header-Hintergrundbild entfernt, `height: 80vh` → `min-height: 100vh`, `background: var(--bg-primary)`
- **B.2** – Navbar: Apple-Blur (`saturate(180%) blur(20px)`), `border-bottom`, `box-shadow: none`. Nav-Center-Buttons: transparent, kein Rahmen, hover via `bg-secondary`. Nav-Right (Login): Accent-Pill. Burger-Striche: `var(--text-primary)`
- **B.3** – Hero h1: 72px, `var(--text-primary)`, kein `uppercase`, `letter-spacing: -0.02em`. Hero h2: 21px, `var(--text-secondary)`. Benefits: `bg-secondary`, Akzent-Icon. CTA primary: Pill-Form, cleaner Shadow. CTA secondary: Accent-Border, kein Glow
- Glow-Effekte von `.cta-button::before` und `.nav-center/right button::before` entfernt

**Stand:**
```
PHASE A: 100%  PHASE B: 100%  PHASE C: 0%  PHASE D: 0%  PHASE E: 0%  PHASE F: 0%
```

**Nächste Schritte:**
→ Start mit **Phase C** (Sections Redesign) – Trust Bar, Services, Prozess, Testimonials, FAQ, About, Kontakt, Footer

---

---

### Session 3 – 09.03.2026

**Durchgeführt:**
- **C.1** – Trust Bar: `background` von dark gradient → `var(--bg-secondary)`. Zahlen-Farbe: `var(--text-primary)`. Trust-Label: `var(--text-secondary)`, kein uppercase
- **C.2** – Services Section: `background` → `var(--bg-primary)`, `padding: var(--section-padding)`. Section-Title: 48px, `var(--text-primary)`, kein uppercase, `-0.02em` letter-spacing. Service-Cards: `var(--card-shadow)`, `var(--border)`, `var(--radius-lg)`. Hover: sauber ohne Cyan-Border
- **C.3** – Prozess Section: Hintergrundbild `middle_new.webp` entfernt → `var(--bg-secondary)`. `automation-title`: 48px, kein uppercase. `automation-intro`: `var(--text-secondary)`. `step-card` h4/p: Vars. `control-btn`: hell statt dark. `automation-cta-button`: Glow entfernt → saubere Pill wie cta-button.primary. `timeline-content`: `var(--card-bg)`, `var(--border)`
- **C.4** – Testimonials: `background: var(--bg-primary)`, `padding: var(--section-padding)`. Cards: `var(--border)`, `var(--card-shadow)`. `testimonial-text`: `var(--text-primary)`. `author-avatar`: `var(--accent-light)` + `var(--accent)`. Author-Info, Notes: vars
- **C.5** – FAQ Section: `background: var(--bg-secondary)`, `padding: var(--section-padding)`. FAQ-Items: `var(--card-bg)`, `var(--border)`, `var(--radius-md)`. Frage/Antwort-Farben: vars
- **C.6** – About & Team: `about-contact-wrapper` → Hintergrundbild `07.webp` entfernt, `background: var(--bg-primary)`. `about-title`: kein uppercase, `-0.02em`. Team-Cards: `var(--card-shadow)`, `var(--border)`, `var(--radius-lg)`. Farben: vars. Team-Credentials: `var(--text-secondary)` statt accent
- **C.7** – Kontakt Section: `background: var(--bg-secondary)`, `padding: var(--section-padding)`. `contact-title`: `var(--text-primary)`, kein uppercase. `contact-container`: `var(--card-bg)`, clean shadow/border (kein glass-dark). `contact-info`: `var(--bg-secondary)`. Alle Farben (`#fff`, `rgba(255,255,255,...)`) → vars. `contact-alt`: hell statt glass. Formular-Focus: sauberer Accent-Ring. `submit-button`: Glow entfernt → saubere Pill
- **C.8** – Footer: `#051d3a` → `var(--text-primary)` (#1D1D1F – einziger dunkler Bereich, wie Apple)
- **Animationen bereinigt**: `pulse`, `float`, `textGlow` und `glowingBorder` Keyframes entfernt

**Stand:**
```
PHASE A: 100%  PHASE B: 100%  PHASE C: 100%  PHASE D: 0%  PHASE E: 0%  PHASE F: 0%
```

**Nächste Schritte:**
→ **Phase D** (Typografie & Detail-Feinschliff): uppercase entfernen, scroll-reveal anpassen, about-contact-wrapper prüfen

---

*[Nächste Session hier eintragen]*

---

## OFFENE FRAGEN AN AUFTRAGGEBER

| # | Frage | Status |
|---|-------|--------|
| 1 | Soll der Header/Hero mit einem sauberen Gradient oder komplett weiß sein? | OFFEN |
| 2 | Darf der Footer dunkel bleiben (wie Apple)? | OFFEN |
| 3 | Sollen die Service-Cards ein dezentes Hintergrundbild bekommen (z.B. Gradient-Fläche statt Foto)? | OFFEN |
| 4 | Gibt es echte Kundenlogos für die Logo-Wall? | Platzhalter |
| 5 | Gibt es echte Testimonials? | Platzhalter |
| 6 | Calendly-Link vorhanden? | OFFEN |

---

## KURZREFERENZ: WICHTIGE DATEIPFADE

```
Hauptseite:    index.html
CSS:           assets/css/style.css
JavaScript:    assets/js/script.js
Bilder:        assets/img/
Logo (hell):   assets/img/logo_14.png
Logo (weiß):   assets/img/logo_white_trans.png
Alte Roadmap:  MD/HOMEPAGE_REDESIGN_ROADMAP.md
Diese Datei:   MD/APPLE_REDESIGN_ROADMAP.md
```

---

*Letzte Aktualisierung: 09.03.2026 – Session 3*
