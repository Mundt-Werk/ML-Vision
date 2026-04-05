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
- [x] **8.5** – Finaler Commit mit sauberem Changelog (`24565cf`)

---

---

## Phase 9 – Bug-Fix: Domain-Redirect, FOUC & CSP

> **Ziel:** 6 identifizierte Bugs beheben, die User beim ersten Seitenaufruf abspringen lassen.
> **Priorität:** 9.1 und 9.2 zuerst – direkt sichtbar, kosten Conversions.

---

### 9.1 – www-Redirect fehlt ⚠️ KRITISCH

**Problem:** `vision-ml.de` (ohne www) leitet nicht auf `www.vision-ml.de` um.
User, die die Adresse ohne www eingeben, landen auf einer falschen/leeren Seite.

**Ursache:** `.htaccess` enthält keine Redirect-Regel für die Non-www-Domain.

**Fix:** In `.htaccess` vor den bestehenden RewriteRules einfügen:
```apache
# Non-www → www Redirect (301 Permanent)
RewriteCond %{HTTP_HOST} ^vision-ml\.de$ [NC]
RewriteRule ^(.*)$ https://www.vision-ml.de/$1 [R=301,L]
```

- [x] **9.1** – `.htaccess`: `vision-ml.de` → `www.vision-ml.de` 301-Redirect einbauen

---

### 9.2 – Render-blockierender ContentSquare-Script ⚠️ KRITISCH

**Problem:** `index.html:43` – Script ohne `async`/`defer` → Browser pausiert Rendering.
Das Script wird von der CSP sowieso blockiert, der Render-Block passiert trotzdem.
**Erklärt den weißen Blank-Flash beim ersten Seitenaufruf.**

**Fix:** Script-Tag komplett entfernen (kein Nutzen, nur Schaden).

```html
<!-- ENTFERNEN: -->
<script src="https://t.contentsquare.net/uxa/dbd887ec42dfe.js"></script>
```

- [x] **9.2** – `index.html:43`: ContentSquare `<script>`-Tag entfernen

---

### 9.3 – FOUC durch `scroll-reveal` (opacity: 0) ⚠️ KRITISCH

**Problem:** CSS setzt `.scroll-reveal { opacity: 0 }` – 20+ Elemente (alle Karten, FAQ,
Team, Kontakt) starten **unsichtbar**. JS ist `defer` → wird erst nach HTML-Parse aktiv.
In diesem Zeitfenster sieht der User eine leere, weiße Seite.

**Fix:** Body bekommt initial Klasse `no-js`. JS entfernt sie sofort → `scroll-reveal`
nur aktiv wenn JS läuft:

```html
<body class="no-js">
```
```js
// Ganz oben in script.js (vor defer-Wartezeit):
document.documentElement.classList.remove('no-js');
```
```css
/* style.css: scroll-reveal nur wenn JS aktiv */
body:not(.no-js) .scroll-reveal { opacity: 0; transform: translateY(24px); }
```

- [x] **9.3a** – `index.html`: `<body class="no-js">` setzen
- [x] **9.3b** – `script.js`: `no-js`-Klasse am Anfang entfernen
- [x] **9.3c** – `style.css`: `.scroll-reveal`-Regel auf `body:not(.no-js) .scroll-reveal` ändern
- [x] **9.3d** – `public/`-Seiten nutzen kein `scroll-reveal` → kein Handlungsbedarf

---

### 9.4 – CSP blockiert GA4 Regional-Endpoint ⚠️ MITTEL

**Problem:** `.htaccess:28` – `connect-src` erlaubt `https://www.google-analytics.com`
aber **nicht** `https://region1.google-analytics.com`. GA4 sendet Daten an den
regionalen Endpoint → alle Analytics-Daten gehen verloren.

**Fix:** In der CSP `connect-src` ergänzen:
```
https://region1.google-analytics.com
```

- [x] **9.4** – `.htaccess`: `region1.google-analytics.com` zu `connect-src` hinzufügen

---

### 9.5 – Analytics-Placeholder-ID wird nicht geblockt ⚠️ MITTEL

**Problem:** `analytics.js:3` – `hasId()` prüft ob der String *nur* X's enthält (`/^X{4,}$/`).
Die ID `G-XXXXXXXXXX` beginnt mit `G-` → Check schlägt fehl → GA-Script wird mit
Fake-ID geladen → erzeugt Console-Fehler + keine echten Daten.

**Lösung A (empfohlen):** Echte GA-ID in `index.html:38` eintragen.
**Lösung B (Fallback):** `hasId()`-Regex verbessern:
```js
!/^(YOUR_|[A-Z]+-X{4,}|X{4,})/.test(id.trim())
```

- [ ] **9.5a** – `index.html:38`: Echte GA-ID `G-XXXXXXXXXX` → reale ID ersetzen *(manuell – ID beim Kunden erfragen)*
- [x] **9.5b** – `analytics.js:3`: `hasId()`-Regex verbessert (blockt jetzt `G-XXXXXXXX`-Muster)

---

### 9.6 – CSP blockiert Lucide Sourcemap (DevTools) ℹ️ MINOR

**Problem:** `.htaccess:28` – `unpkg.com` steht in `script-src` (Script laden ✓)
aber nicht in `connect-src` (Sourcemap laden ✗). Betrifft nur DevTools-Debugging,
keine Funktionalität. Erzeugt aber Console-Noise.

**Fix:** In `connect-src` ergänzen:
```
https://unpkg.com
```

- [x] **9.6** – `.htaccess`: `https://unpkg.com` zu `connect-src` hinzufügen

---

### 9.7 – Abschluss & Test

- [ ] **9.7a** – Live-Test: `vision-ml.de` → landet auf `www.vision-ml.de` (301) *(nach Deploy)*
- [ ] **9.7b** – Live-Test: Kein weißer Flash beim ersten Laden *(nach Deploy)*
- [ ] **9.7c** – Console: Keine CSP-Fehler mehr *(nach Deploy)*
- [ ] **9.7d** – Analytics: GA4 empfängt Daten *(nach Eintragen der echten GA-ID, 9.5a)*

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

**2026-03-10** – Phase 9 abgeschlossen (9.5a offen – echte GA-ID muss manuell eingetragen werden). Fixes: www-Redirect in .htaccess (301), ContentSquare-Script entfernt, FOUC durch no-js-Guard gefixt (style.css + script.js + index.html), CSP um region1.google-analytics.com + unpkg.com erweitert, hasId()-Regex in analytics.js verbessert.

**2026-03-10** – Phase 9 angelegt. 6 Bugs identifiziert: www-Redirect fehlt (.htaccess), render-blockierender ContentSquare-Script (index.html:43), scroll-reveal FOUC (opacity:0 ohne no-js-Guard), CSP blockiert GA4-Regional-Endpoint, Analytics-Placeholder-ID hasId()-Bypass, Lucide-Sourcemap CSP-Fehler.

**2026-03-09** – Roadmap angelegt.
Projektstatus analysiert: Root `index.html` ist das neue Referenz-Design. `public/index.html` ist die alte Startseite und muss ersetzt werden. `public/datenschutz.html` und `public/impressum.html` haben nur ein primitives "Zurück"-Button-Layout ohne Nav/Footer. Blog-Index, 3 Blog-Artikel und 3 Service-Pages existieren in `public/` und nutzen noch das alte Layout. Admin- und Customer-Bereich bleiben unberührt. Roadmap mit 8 Phasen und 26 Einzelschritten erstellt.

