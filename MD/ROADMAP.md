# ML Vision Website – Design-Angleichung Roadmap

> **Ziel:** Alle `public/`-Seiten (Blog, Service-Pages, Impressum, Datenschutz, public/index.html)
> an das neue Design der Root-`index.html` angleichen.
>
> **Was NICHT angefasst wird:**
> - `index.html` (Root) → fertig, kein Eingriff
> - `public/login.html` → fertig, kein Eingriff
> - `public/password-reset.html` → fertig, kein Eingriff
> - `admin/` → alles unberührt
> - `customer/` → alles unberührt

---

## Referenz-Design (Root `index.html`)

Das neue Design nutzt:
- Dunkles Theme (`bg-dark`, CSS Custom Properties)
- Glasmorphism-Karten
- Gradient-Orbs im Hintergrund
- Navigation: Logo links, Links mittig, CTA + Login rechts, Hamburger-Burger mobile
- Lucide Icons
- Button-Klassen: `btn-primary`, `btn-outline`, `btn-ghost`, `btn-sm`, `btn-lg`
- Footer mit Links zu Impressum / Datenschutz
- `assets/css/style.css` + `assets/js/script.js`

---

## Phase 1 – Fundament: Header & Footer Komponente definieren

- [x] **1.1** – Neue Nav-HTML-Struktur für Unterseiten dokumentieren (Pfad-Anpassung `../assets/`)
- [x] **1.2** – Footer-HTML-Struktur für Unterseiten dokumentieren (Links relativ)

*Warum zuerst:* Alle anderen Seiten bauen auf Header + Footer auf. Einmal definieren, dann kopieren.

---

## Phase 2 – `public/index.html` (alte Startseite ersetzen)

- [x] **2.1** – `public/index.html` mit Root-`index.html` inhaltlich vergleichen (Diff)
- [x] **2.2** – `public/index.html` auf Weiterleitung zu `../index.html` umgebaut (noindex + meta-refresh + JS-redirect)
- [x] **2.3** – Keine internen Links mehr nötig – Redirect-Seite hat keinen eigenen Inhalt

---

## Phase 3 – Impressum anpassen

- [x] **3.1** – `public/impressum.html` geprüft: alter back-button, kaputte Footer-Bildpfade, `#`-Social-Links
- [x] **3.2** – Neue Nav-Leiste (mit Burger-Menü) eingebaut
- [x] **3.3** – Neuer Footer (footer-top/footer-brand/footer-links-col) mit korrekten Pfaden & echten Social-Links eingebaut
- [x] **3.4** – `back-button` entfernt, durch Nav ersetzt
- [x] **3.5** – legal-section erbt dark theme über style.css, kein Handlungsbedarf

---

## Phase 4 – Datenschutz anpassen

- [x] **4.1** – `public/datenschutz.html` geprüft: identische Probleme wie Impressum
- [x] **4.2** – Neue Nav-Leiste eingebaut
- [x] **4.3** – Neuer Footer eingebaut
- [x] **4.4** – `back-button` entfernt, durch Nav ersetzt
- [x] **4.5** – legal-section erbt dark theme, Stand auf 2026 aktualisiert

---

## Phase 5 – Blog-Index anpassen

- [x] **5.1** – `public/blog.html` öffnen und Struktur prüfen
- [x] **5.2** – Nav einbauen (neues Design)
- [x] **5.3** – Hero-Bereich / Seitentitel an neues Design anpassen
- [x] **5.4** – Blog-Karten-Design auf Glasmorphism / dark theme umstellen
- [x] **5.5** – Footer einbauen

---

## Phase 6 – Blog-Artikel anpassen (3 Seiten)

- [x] **6.1** – `public/blog-ki-automatisierung-dueren.html` → Nav + Footer + dark theme
- [x] **6.2** – `public/blog-voice-agents-nrw.html` → Nav + Footer + dark theme
- [x] **6.3** – `public/blog-workflow-automatisierung.html` → Nav + Footer + dark theme

---

## Phase 7 – Service-Pages anpassen (3 Seiten)

- [x] **7.1** – `public/ki-automatisierung-dueren.html` → Nav + Footer + dark theme
- [x] **7.2** – `public/voice-agents-chatbots.html` → Nav + Footer + dark theme
- [x] **7.3** – `public/workflow-automatisierung.html` → Nav + Footer + dark theme

---

## Phase 8 – Abschluss & Qualitätssicherung

- [x] **8.1** – Alle internen Links seitenübergreifend geprüft – keine toten Links gefunden
- [x] **8.2** – Mobile CSS geprüft: alle Seiten binden `../assets/css/style.css` korrekt ein, kein inline-Style mehr
- [x] **8.3** – Meta-Tags geprüft: `<meta name="description">` auf impressum.html + datenschutz.html ergänzt
- [x] **8.4** – Favicon-Pfade geprüft: alle Seiten nutzen `../assets/img/` korrekt
- [ ] **8.5** – Finaler Commit mit sauberem Changelog

---

---

# Tagebuch

*Hier wird nach jedem abgeschlossenen Schritt eingetragen, was gemacht wurde.
Format: `[Datum] Schritt X.Y – Kurzbeschreibung`*

---

**2026-03-09** – Phase 8 abgeschlossen (bis auf Commit). QA-Audit aller 10 public/-Seiten: keine toten Links, alle Favicon-Pfade korrekt, CSS korrekt eingebunden. Meta-Description auf impressum.html + datenschutz.html nachgepflegt. Finaler Commit steht noch aus.

**2026-03-09** – Phasen 5, 6, 7 abgeschlossen (en bloc). Alle 7 verbleibenden `public/`-Seiten auf dark theme umgestellt: neue Nav + Footer eingebaut, back-buttons entfernt, inline-Styles entfernt, interne Links auf `../index.html#...` korrigiert, ElevenLabs-Widget vereinfacht. CSS-Erweiterung für `.legal-section`, `.blog-grid`, `.blog-card`, `.article-cta-box` etc. in `assets/css/style.css` ergänzt.

**2026-03-09** – Phase 4 abgeschlossen. `public/datenschutz.html`: back-button entfernt, neue Nav + Footer eingebaut, Social-Links korrigiert, Stand auf 2026 aktualisiert.

**2026-03-09** – Phase 3 abgeschlossen. `public/impressum.html`: back-button entfernt, neue Nav + Footer (neues Markup: footer-top/footer-brand/footer-links-col) eingebaut, kaputte `./img/`-Pfade auf `../assets/img/` korrigiert, echte Social-Links eingesetzt, Copyright auf 2024–2026 aktualisiert.

**2026-03-09** – Phase 2 abgeschlossen. `public/index.html` auf Redirect zu `../index.html` umgebaut. Meta-Refresh (0s), JS-Fallback und `noindex`-Tag gesetzt. Duplicate-Content vermieden.

**2026-03-09** – Phase 1 abgeschlossen. Nav- und Footer-Komponenten für `public/`-Unterseiten in `MD/components.md` dokumentiert. Alle Pfade auf `../assets/`, `../index.html#...` und relative Geschwister-Links angepasst. Differenz-Tabelle Root vs. Unterseiten ergänzt.

**2026-03-09** – Roadmap angelegt.
Projektstatus analysiert: Root `index.html` ist das neue Referenz-Design. `public/index.html` ist die alte Startseite und muss ersetzt werden. `public/datenschutz.html` und `public/impressum.html` haben nur ein primitives "Zurück"-Button-Layout ohne Nav/Footer. Blog-Index, 3 Blog-Artikel und 3 Service-Pages existieren in `public/` und nutzen noch das alte Layout. Admin- und Customer-Bereich bleiben unberührt. Roadmap mit 8 Phasen und 26 Einzelschritten erstellt.

