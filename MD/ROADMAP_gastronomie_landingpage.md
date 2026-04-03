# ML Vision – Landingpage Gastronomie – Roadmap

> **Ziel:** Eigenständige Landingpage für die Zielgruppe Gastronomie bauen.
> Basis-Konzept: `MD/ml_vision_landingpage_gastronomie_konzept.md`
>
> **Was diese Seite ist:**
> Keine allgemeine Agenturseite, sondern eine spitze, problemorientierte Seite
> für Restaurantinhaber, Café-Betreiber, Bars, Hotels – 5 bis 50 MA.
>
> **Kernbotschaft:** Mehr Zeit für Gäste. Weniger Chaos im Hintergrund.
>
> **Ziel-URL:** z. B. `public/gastronomie.html` oder eigene Domain (offen)
>
> **Design-Richtung:** Dark Premium Gastro Tech (Anthrazit + Bronze/Gold-Akzent)
> Farbwerte: BG `#0F1115`, sekundär `#171A20`, Text `#F5F1E8`, Soft `#B8B1A4`,
> Akzent Bronze `#B8845E`, Sand `#D8C7AE`, Tech-Highlight `#6FC2B0`
>
> **Was NICHT verändert wird:**
> - Root `index.html` → unberührt
> - `admin/` und `customer/` → unberührt
> - bestehende `public/`-Seiten → unberührt

---

## Seitenstruktur (Referenz)

1. Hero
2. Problem-Sektion – „Kommt dir das bekannt vor?"
3. Lösungs-Sektion – Was ML Vision konkret macht (4 Blöcke)
4. Nutzen-Sektion – Was dein Betrieb davon hat (6 Karten)
5. Praxisbeispiele – Use Cases (4 Szenarien)
6. Warum ML Vision? (4 Differenzierungspunkte)
7. Prozess-Sektion – So läuft die Zusammenarbeit (4 Schritte)
8. FAQ (4 Fragen)
9. Abschluss-CTA + Kontaktformular

---

## Phase 0 – Positionierung & Messaging finalisieren

> **Ziel:** Bevor eine Zeile HTML geschrieben wird – finale Positionierung in einem Satz,
> Headline-Variante auswählen, Tonalität schriftlich fixieren.

- [x] **0.1** – Einen finalen Positionierungssatz wählen (Grundlage für alle Texte)
  - Gewählt: *„ML Vision hilft Gastronomiebetrieben, Anfragen zu strukturieren, Abläufe zu automatisieren und digital professioneller aufgestellt zu sein."*
- [x] **0.2** – Hero-Headline final auswählen (A/B/C aus Konzept oder neue Variante)
  - Gewählt: Variante B (angepasst) – *„Weniger Chaos im Hintergrund. Mehr Fokus auf Gäste und Umsatz."*
- [x] **0.3** – CTA-Text final festlegen (Primär + Sekundär)
  - Primär: *„Kostenloses Erstgespräch"*
  - Sekundär: *„Leistungen ansehen"* / *„Jetzt Potenziale prüfen"*
- [x] **0.4** – Ziel-URL / Dateiname festlegen
  - Gewählt: `public/gastronomie.html`

---

## Phase 1 – Wireframe (Struktur ohne Design)

> **Ziel:** Jede Section in Textform / Skizze durchdenken bevor Design und Code starten.
> Ergebnis kann ein Figma-Wireframe, ein Markdown-Doc oder eine Skizze sein.

- [x] **1.1** – Hero: Text links / Dashboard-Mockup rechts, 3 Floating UI-Cards, 2 CTA-Buttons
- [x] **1.2** – Problem-Sektion: 3×2-Grid (6 Kacheln) mit Icon + Titel + Text
- [x] **1.3** – Lösungs-Sektion: 2×2-Grid mit nummerierten Blöcken (01–04)
- [x] **1.4** – Nutzen-Sektion: 3×2-Grid mit Icon + Titel + Text
- [x] **1.5** – Use Cases: 2×2-Grid mit Tag + Titel + Text + Vorher/Nachher-Flow
- [x] **1.6** – Warum ML Vision: Statement-Text + 2×2-Grid mit Check-Items
- [x] **1.7** – Prozess: 4 Schritte horizontal mit Verbindungslinie
- [x] **1.8** – FAQ: Accordion (JS-Toggle)
- [x] **1.9** – Abschluss-CTA: Statement zentriert + Formular-Card (6 Felder + Turnstile)

---

## Phase 2 – Finale Copy schreiben

> **Ziel:** Alle Texte für alle Sections in finaler Tonalität (modern, klar, direkt, lösungsorientiert,
> nicht zu technisch). Basis: Konzeptdoc. Tonality-Check: klingt es wie ein Gastronom redet?

- [x] **2.1** – Hero: Headline + Subheadline + CTA-Buttons + Trust-Badges (3 Punkte)
- [x] **2.2** – Problem-Sektion: Überschrift + Intro-Text + 6 Kachel-Labels
- [x] **2.3** – Lösungs-Sektion: Überschrift + 4 Block-Titel + 4 Block-Texte
- [x] **2.4** – Nutzen-Sektion: Überschrift + 6 Karten-Titel + 6 Karten-Texte
- [x] **2.5** – Use Cases: Überschrift + 4 Szenario-Titel + 4 Szenario-Texte
- [x] **2.6** – Warum ML Vision: Überschrift + Intro-Text + 4 Differenzierungspunkte
- [x] **2.7** – Prozess: Überschrift + 4 Schritt-Titel + 4 Schritt-Texte
- [x] **2.8** – FAQ: 4 Fragen + 4 Antworten
- [x] **2.9** – Abschluss-CTA: Überschrift + Intro-Text + 2 CTA-Labels + Formular-Feldbezeichnungen
- [x] **2.10** – Meta-Title + Meta-Description für SEO

---

## Phase 3 – Design-Setup & Assets vorbereiten

> **Ziel:** Alle Designressourcen bereitstellen bevor Umsetzung startet.
> Design-Richtung: Dark Premium Gastro Tech. Passt auf das bestehende ML Vision Dark Theme.

- [x] **3.1** – Farbpalette als CSS Custom Properties in `<style>` der gastronomie.html ergänzt
  - `--g-bronze: #B8845E`, `--g-sand: #D8C7AE`, `--g-tech: #6FC2B0` – als scoped vars
- [x] **3.2** – Typografie: Bleibt bei Futura Book (aus style.css), keine extra Schriftart
- [x] **3.3** – Icons: Lucide Icons (inline SVG für Sections ohne CDN-Load)
- [ ] **3.4** – Hero-Bild noch ausstehend: aktuell CSS-Gradient + Dashboard-Mockup als Placeholder
  - → Sobald Restaurant-Bild verfügbar: als `.g-hero` Background einbauen
- [x] **3.5** – 3 Floating UI-Cards als pure HTML/CSS im Hero umgesetzt
- [x] **3.6** – Vorher/Nachher-Flow als Tag-Chains in Use Case Cards umgesetzt
- [ ] **3.7** – Bilder (wenn beschafft) als `.webp` exportieren und in `assets/img/` ablegen

---

## Phase 4 – HTML-Grundstruktur bauen

> **Ziel:** Datei anlegen, Head + Nav + Footer aus bestehendem Muster übernehmen,
> alle Sections als leere Platzhalter anlegen.

- [x] **4.1** – Neue Datei angelegt: `public/gastronomie.html`
- [x] **4.2** – `<head>`: Meta-Tags, Title, CSS-Pfade (`../assets/css/style.css`), Favicon, OG-Tags
- [x] **4.3** – Nav eingebaut (identisch zu public/-Muster, CTA angepasst auf "Erstgespräch")
- [x] **4.4** – Footer eingebaut (mit gastro-spezifischer Beschreibung)
- [x] **4.5** – Alle 9 Sections mit IDs: `#home`, `#problem`, `#loesung`, `#nutzen`, `#beispiele`, `#warum`, `#prozess`, `#faq`, `#kontakt`
- [x] **4.6** – JS eingebunden: `../assets/js/script.js` + Lucide + Turnstile + page-specific inline JS

---

## Phase 5 – Section-by-Section Umsetzung (HTML + CSS)

> **Ziel:** Jede Section vollständig in HTML + CSS umsetzen.
> Neue CSS-Klassen für gastro-spezifische Elemente in `<style>` der Seite ergänzt.

- [x] **5.1** – **Hero Section** – CSS-Gradient BG + Dashboard-Mockup + 3 Float-Cards + 2 CTAs + 3 Trust-Badges
- [x] **5.2** – **Problem-Sektion** – 3×2-Grid, Lucide SVG Icons, Bronze Hover-Border
- [x] **5.3** – **Lösungs-Sektion** – 2×2-Grid mit Nummerierung (01–04), Bronze-Akzent, CTA unter Section
- [x] **5.4** – **Nutzen-Sektion** – 3×2-Grid mit Icons, Bronze Hover-Glow
- [x] **5.5** – **Use Cases** – 2×2-Grid mit Tag, Titel, Text, Vorher→Nachher Flow-Tags
- [x] **5.6** – **Warum ML Vision** – Intro-Statement + 2×2-Grid mit Check-Items
- [x] **5.7** – **Prozess-Sektion** – 4 Schritte horizontal, dekorative Verbindungslinie via CSS
- [x] **5.8** – **FAQ-Sektion** – 4 Accordion-Items mit eigenem JS-Toggle (toggleFaq)
- [x] **5.9** – **Abschluss-CTA + Formular** – 6 Felder + Turnstile + n8n-Webhook Submit

---

## Phase 6 – Animationen & Micro-Interactions

> **Ziel:** Seite wirkt lebendig aber nicht überladen. Ruhig und hochwertig.

- [x] **6.1** – Hero-Cards: 3 separate float-Animationen (g-float1/2/3, 3–4s, Y-Offset 6–10px)
- [x] **6.2** – Sections: `scroll-reveal` + `no-js`-Guard (`body.no-js`) via script.js
- [ ] **6.3** – Problem-Kacheln: stagger-Delay noch nicht implementiert (nice-to-have)
- [x] **6.4** – Nutzen-Karten: Hover `box-shadow` + `translateY(-3px)` mit Bronze-Glow
- [x] **6.5** – Prozess-Verbindungslinie: CSS `::before` mit Bronze-Gradient (statisch, kein Zeichnen)
- [x] **6.6** – CTA-Buttons: Hover `translateY(-2px)` + Bronze-Glow bereits in `.btn-primary`
- [x] **6.7** – `prefers-reduced-motion`: Media Query schaltet alle Animationen ab
- [x] **6.8** – Hero Hero-Badge: `pulse-dot` Keyframe-Animation

---

## Phase 7 – Formular & Conversion-Logik

> **Ziel:** Kontaktformular vollständig angebunden, Fehlerbehandlung, Bestätigungsseite/Meldung.

- [x] **7.1** – Formular-Felder: Vorname, Nachname, Betrieb, E-Mail, Telefon, 2 Textarea-Felder (Herausforderung, Entlastung)
- [x] **7.2** – Turnstile-Integration: identisch zu `index.html`, `data-sitekey` übernommen
- [x] **7.3** – Formular-Endpoint: n8n-Webhook `https://n8n.vision-ml.de/webhook/gastro-lead`
  - Webhook-Route muss in n8n noch angelegt werden!
- [x] **7.4** – Erfolgs-Meldung inline (`.g-form-success`), Error-Box inline, kein Page-Reload
- [ ] **7.5** – n8n-Workflow für gastro-lead noch zu bauen (CRM-Anbindung, Slack-Notification etc.)
- [ ] **7.6** – Automatische Bestätigungs-E-Mail an Anfragenden über n8n

---

## Phase 8 – SEO & Meta

- [x] **8.1** – `<title>`: *„Digitale Lösungen für Gastronomie | ML Vision"* (48 Zeichen) ✓
- [x] **8.2** – `<meta name="description">`: 152 Zeichen, CTA-orientiert ✓
- [x] **8.3** – `<meta property="og:*">` gesetzt (title, description, image, url, type) ✓
- [x] **8.4** – Canonical-Tag gesetzt ✓
- [ ] **8.5** – Structured Data: optional, noch nicht implementiert
- [ ] **8.6** – Interne Verlinkung: Von `index.html` auf `/public/gastronomie.html` noch nicht verlinkt
  - → Footer-Link oder CTA-Kachel auf Homepage ergänzen
- [ ] **8.7** – robots.txt prüfen: Seite ist auf `index, follow` gesetzt ✓ (robots.txt separat prüfen)

---

## Phase 9 – QA & Launch

- [ ] **9.1** – Desktop-Review: alle Sections auf 1440px + 1920px
- [ ] **9.2** – Mobile-Review: alle Sections auf 375px + 430px
- [ ] **9.3** – Tablet-Review: 768px + 1024px
- [ ] **9.4** – Lighthouse-Audit: Performance, Accessibility, SEO (Ziel: 90+ in allen Bereichen)
- [ ] **9.5** – Alle Links testen (Nav, CTA-Buttons, Footer, interne Verlinkungen)
- [ ] **9.6** – Formular end-to-end testen (Absenden, Erfolgs-Meldung, Lead landet im System)
- [ ] **9.7** – Turnstile-Captcha auf Live-Umgebung testen
- [ ] **9.8** – CSP in `.htaccess` prüfen: keine neuen externen Quellen geblockt?
- [ ] **9.9** – Finaler Commit + Deploy auf Live-Server
- [ ] **9.10** – Live-Test: URL aufrufen, Formular absenden, Analytics-Ping prüfen

---

# Tagebuch

*Format: `[Datum] Schritt X.Y – Kurzbeschreibung`*

---

**2026-03-11** – Roadmap angelegt. Konzeptdoc analysiert: 9 Sections, Design-Richtung Dark Premium Gastro Tech, Farbpalette und Typografie dokumentiert. Alle Phasen (0–9) mit 60+ Einzelschritten definiert. Nächster Schritt: Phase 0 – Positionierung und Ziel-URL festlegen.

**2026-03-11** – Phasen 0–8 (teilweise) in einem Schritt umgesetzt. `public/gastronomie.html` erstellt mit allen 9 Sections vollständig in HTML + CSS + JS. Scoped CSS-Variablen im `<style>`-Block der Seite (kein Eingriff in `style.css`). Formular-Submit via n8n-Webhook `/gastro-lead` (Webhook noch anzulegen). Offen: Hero-Bild, n8n-Workflow, interne Verlinkung, Stagger-Animationen, QA-Phase 9.

---

# Kontext-Gedächtnis (für kontextfreien Wiedereinstieg)

## Was dieses Projekt ist
Eigenständige Landingpage für ML Vision, Zielgruppe: Gastronomiebetriebe.
Kein allgemeiner Agentur-Auftritt, sondern eine spitze Problemlösungs-Seite für
Restaurantinhaber, Café-Betreiber, Bars, Hotels (5–50 Mitarbeitende).

## Wo alles liegt
- **Konzeptdoc:** `MD/ml_vision_landingpage_gastronomie_konzept.md`
- **Diese Roadmap:** `MD/ROADMAP_gastronomie_landingpage.md`
- **Zieldatei (noch zu erstellen):** `public/gastronomie.html`
- **Basis-CSS:** `assets/css/style.css`
- **Basis-JS:** `assets/js/script.js`
- **Referenz-Design:** Root `index.html` (Dark Theme, Glasmorphism, Lucide Icons)
- **Nav/Footer-Muster für public/:** `MD/components.md`
- **Bild-Prompts (MidJourney/AI):** `n8n/analyse-image-prompts.md`

## Design-System
- **BG:** `#0F1115` / Sekundär: `#171A20`
- **Text:** `#F5F1E8` / Soft: `#B8B1A4`
- **Bronze-Akzent:** `#B8845E` / Sand: `#D8C7AE` / Tech: `#6FC2B0`
- **Icons:** Lucide (bereits eingebunden via CDN)
- **Fonts:** Manrope / Inter (bestehend), optional DM Serif Display für Headlines
- **Klassen:** `btn-primary`, `btn-outline`, `btn-ghost`, `scroll-reveal`, Glasmorphism-Cards

## Kritische Technische Details
- Alle `public/`-Seiten nutzen `../assets/` als Pfad-Prefix (nicht `./assets/`)
- `scroll-reveal` erfordert `no-js`-Guard (Body-Klasse, in script.js entfernen) → sonst FOUC
- Turnstile-Captcha für Formulare bereits in `index.html` implementiert → als Vorlage nutzen
- CSP in `.htaccess` beachten: neue externe Ressourcen müssen dort freigeschaltet werden
- Formular-Backend: n8n-Webhook oder Firebase (noch zu entscheiden – Phase 7.3)

## Offene Entscheidungen (vor Phase 1 klären)
- Ziel-URL: `public/gastronomie.html` oder eigene (Sub-)Domain?
- Hero-Headline: Variante A, B oder C (oder neue)?
- Formular-Backend: n8n / Firebase / anderes?
- Hero-Bild: Eigenes Material, Stock oder AI-generiert?
- Typografie-Entscheidung: Bleibt bei Manrope oder DM Serif Display für Headlines?
