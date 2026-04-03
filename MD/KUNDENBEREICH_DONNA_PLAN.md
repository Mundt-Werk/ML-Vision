# Kundenbereich DONNA Ristorante — Implementierungsplan
**Projekt:** KI-Telefonassistent · Paket Standard · VT-202603100
**Kunde:** Henrik Dantz, DONNA Ristorante Napoletano Leipzig
**Stand:** 23. März 2026

---

## Ausgangslage

Der generische `customer/`-Bereich ist bereits als HTML-Template vorhanden mit:
- `customer/dashboard.html` — Stats-Grid, Invoice-Widget (generisch)
- `customer/pages/gespraeche.html` — Gesprächsübersicht
- `customer/pages/statistiken.html` — Statistik-Seite
- `customer/pages/support.html` — Support/Tickets
- `customer/pages/rechnungen.html` — Rechnungen
- `customer/pages/einstellungen.html` — Einstellungen
- `customer/pages/dokumentation.html` — Doku

**Aufgabe:** Diesen generischen Bereich für DONNA konkret befüllen, Firebase-Auth anbinden und ElevenLabs-Daten live einbinden.

---

## Navigation (Sidebar) für DONNA

```
Dashboard          → Übersicht KI-Leistung heute/Monat
Anrufe             → Alle Gespräche mit Verlauf & Ergebnis
Reservierungen     → Was die KI in Atavolo eingetragen hat
Statistiken        → Charts: Volumen, Peaks, Erfolgsquote
Rechnungen         → RE-2026031001, Monatsrechnungen
Einstellungen      → Öffnungszeiten, Handoff, Begrüßungstext
Support            → Tickets & Direktkontakt ML Vision
Dokumentation      → Bedienungsanleitung, FAQ, Videos
```

---

## Phase 1 — Firebase Auth & Zugangschutz

- [ ] **1.1** Firebase Auth in `customer/` aktivieren (E-Mail + Passwort)
- [ ] **1.2** Login-Seite: `public/login.html` (bereits vorhanden) prüfen & für Kunden-Rolle erweitern
- [ ] **1.3** Auth-Guard JS-Snippet in alle `customer/`-Seiten einbauen — ohne Login → Redirect zu `/public/login.html`
- [ ] **1.4** Firebase Firestore: Dokument `customers/donna-leipzig` anlegen mit:
  - `uid` — Firebase Auth UID von DONNA
  - `name`: "DONNA Ristorante Napoletano"
  - `plan`: "standard"
  - `agentId` — ElevenLabs Agent-ID (nach Go-Live befüllen)
  - `atavoloEnabled`: true
  - `goLiveDate` — nach Go-Live befüllen
- [ ] **1.5** DONNA-Benutzer in Firebase Console anlegen: `info@donnaleipzig.de`
- [ ] **1.6** Temporäres Passwort setzen + E-Mail-Link für Erst-Login vorbereiten

---

## Phase 2 — Dashboard (Startseite)

**Datei:** `customer/dashboard.html`

Ziel: DONNA sieht auf einen Blick die wichtigsten KPIs ihres Telefonassistenten.

### KPI-Cards (oben)
- [ ] **2.1** "Anrufe heute" — live aus Firestore (`calls`-Collection, `date == today`)
- [ ] **2.2** "Anrufe diesen Monat" — Monatsaggregat
- [ ] **2.3** "Reservierungen diese Woche" — Calls mit `outcome == "reservation"`
- [ ] **2.4** "Erfolgsquote" — `reservations / totalCalls * 100`%
- [ ] **2.5** "Weiterleitungen" — Calls mit `outcome == "transfer"` (Gruppen >6 Pers.)

### Statusanzeige KI-Agent
- [ ] **2.6** Badge: "KI aktiv 🟢" / "KI inaktiv 🔴" — aus Firestore-Feld `agentStatus`
- [ ] **2.7** Letzter Anruf: Zeitstempel + Ergebnis (Reservierung / Info / Weiterleitung)

### Quick-Links
- [ ] **2.8** Buttons: "Alle Anrufe", "Atavolo öffnen", "Support kontaktieren"

### Offene Aktionen (wenn vorhanden)
- [ ] **2.9** Banner wenn offenes Ticket vorhanden: "Sie haben 1 offenes Support-Ticket"
- [ ] **2.10** Banner wenn Rechnung offen/fällig

---

## Phase 3 — Anrufe / Gesprächsübersicht

**Datei:** `customer/pages/gespraeche.html` (umbenennen → `anrufe.html` oder Titel ändern)

Firestore Collection: `calls/` mit Dokumenten je Anruf

### Datenfelder je Anruf (Firestore)
```
callId        string   — ElevenLabs conversation_id
timestamp     datetime — Anrufzeitpunkt
duration      number   — Dauer in Sekunden
outcome       string   — "reservation" | "info" | "transfer" | "missed" | "error"
callerNumber  string   — anonymisiert (nur letzte 4 Ziffern)
guestName     string   — falls genannt
partySize     number   — Gruppengröße
datetime      string   — gewünschter Termin (falls Reservierung)
notes         string   — Zusammenfassung des Gesprächs
atavoloRef    string   — Atavolo-Buchungsnummer (falls angelegt)
transcript    string   — optional, max 90 Tage (DSGVO)
```

### UI-Elemente
- [ ] **3.1** Tabelle: Datum/Zeit, Dauer, Ergebnis-Badge (Farbe: grün=Reservierung, gelb=Info, orange=Weiterleitung, rot=Missed), Gast, Personen
- [ ] **3.2** Filter: Zeitraum (heute / diese Woche / dieser Monat / custom), Outcome
- [ ] **3.3** Klick auf Zeile → Detail-Panel aufklappen: Notizen + Atavolo-Ref + Transcript (wenn vorhanden)
- [ ] **3.4** Export-Button: CSV-Download der gefilterten Liste
- [ ] **3.5** Paginierung: 25 Einträge pro Seite

---

## Phase 4 — Reservierungen

**Datei:** `customer/pages/reservierungen.html` *(neu erstellen)*

Zeigt nur Anrufe mit `outcome == "reservation"`, aufbereitet als Reservierungsliste.

- [ ] **4.1** Tabelle: Datum der Buchung, Reservierungsdatum, Uhrzeit, Gast, Personen, Atavolo-Ref
- [ ] **4.2** Link "In Atavolo ansehen" wenn `atavoloRef` vorhanden
- [ ] **4.3** Status-Badge: "Bestätigt" / "Ausstehend" / "Storniert"
- [ ] **4.4** Kalender-Ansicht (optional, Phase 2): Monat, Tage mit Reservierungsanzahl anzeigen

---

## Phase 5 — Statistiken

**Datei:** `customer/pages/statistiken.html`

Chart-Bibliothek: Chart.js (bereits verfügbar oder via CDN)

- [ ] **5.1** **Anrufvolumen-Chart** (Balken, letzte 30 Tage) — Calls pro Tag aus Firestore
- [ ] **5.2** **Stunden-Heatmap** (Fr/Sa 16–20 Uhr hervorheben) — Anrufe nach Wochentag + Uhrzeit
- [ ] **5.3** **Outcome-Verteilung** (Donut-Chart): Reservierung / Info / Weiterleitung / Missed
- [ ] **5.4** **Monatlicher Trend** (Linie): Reservierungen vs. Gesamtanrufe über 6 Monate
- [ ] **5.5** **RB-Leipzig-Spieltage** markieren (manuelles Flag `isMatchday: true` in Firestore oder Kalender-API)
- [ ] **5.6** Zeitraum-Picker: Diese Woche / Dieser Monat / Letzter Monat / 3 Monate

---

## Phase 6 — Rechnungen

**Datei:** `customer/pages/rechnungen.html`

Firestore Collection: `invoices/` (pro Rechnung ein Dokument)

- [ ] **6.1** Rechnungs-Liste: Nr., Datum, Beschreibung, Betrag netto, Status (Bezahlt/Offen)
- [ ] **6.2** RE-2026031001 (Anzahlung €995 netto) als erstes Dokument anlegen
- [ ] **6.3** PDF-Download-Link je Rechnung (Firebase Storage oder direkter Link zu `admin/angebote/`)
- [ ] **6.4** Nächste fällige Rechnung prominent anzeigen mit Fälligkeitsdatum

---

## Phase 7 — Einstellungen

**Datei:** `customer/pages/einstellungen.html`

*Anzeige-only für DONNA — Änderungen gehen als Support-Ticket an ML Vision.*

- [ ] **7.1** **Agenten-Info:** Name, Stimme, Sprache, Plan (Standard ElevenLabs)
- [ ] **7.2** **Öffnungszeiten anzeigen** (wann KI aktiv): Mo–So, Uhrzeiten — aus Firestore
- [ ] **7.3** **Handoff-Regeln:** Gruppen >6 Personen → Weiterleitung an Festnetz; anzeigen welche Nummer
- [ ] **7.4** **Begrüßungstext:** Aktuell hinterlegtes Skript (read-only, mit "Änderung beantragen"-Button)
- [ ] **7.5** Button "Einstellung ändern" → öffnet Support-Ticket-Formular mit vorausgefülltem Betreff
- [ ] **7.6** **DSGVO-Infos:** Hinweis zu Datenspeicherung (max. 90 Tage), Unterauftragsverarbeiter

---

## Phase 8 — Support & Tickets

**Datei:** `customer/pages/support.html`

- [ ] **8.1** Neues Ticket erstellen: Betreff, Nachricht, Anhang (optional)
- [ ] **8.2** Ticket-Liste: offene / gelöste Tickets, Zeitstempel, Status-Badge
- [ ] **8.3** Direkt-Kontakt: Telefon & E-Mail ML Vision sichtbar
- [ ] **8.4** Firestore: `tickets/` Collection — bei neuem Ticket → Notification an ML Vision (Cloud Function oder n8n)

---

## Phase 9 — Dokumentation / Onboarding

**Datei:** `customer/pages/dokumentation.html`

- [ ] **9.1** Abschnitt "So funktioniert Ihr KI-Assistent" (Text + Flussdiagramm)
- [ ] **9.2** FAQ: Was passiert wenn die KI nicht weiterkommt? / Wie ändere ich Öffnungszeiten? / Wo sehe ich Reservierungen in Atavolo?
- [ ] **9.3** Kurzanleitung Atavolo-App (Screenshots oder Video-Link)
- [ ] **9.4** DSGVO-Infoblatt zum Download (PDF)
- [ ] **9.5** Notfallkontakt ML Vision (falls KI-System ausfällt)

---

## Phase 10 — Datenpipeline (ElevenLabs → Firestore)

Damit die Daten im Kundenbereich live sind, müssen Anruf-Daten automatisch in Firestore landen.

- [ ] **10.1** ElevenLabs Webhook konfigurieren: POST nach Gesprächsende an Cloud Function
- [ ] **10.2** Firebase Cloud Function `onCallEnd`: Webhook empfangen, in Firestore schreiben
  - Felder: `callId`, `timestamp`, `duration`, `transcript` (optional)
  - Outcome-Logik: aus Transcript/Metadata ableiten
- [ ] **10.3** Atavolo-Bestätigung: wenn Reservierung eingetragen → `atavoloRef` in Firestore nachpflegen (manuell oder API-Callback)
- [ ] **10.4** Fehlerbehandlung: wenn Webhook fehlschlägt → Retry-Logik, Fehler-Log
- [ ] **10.5** DSGVO: Transcript-Auto-Delete nach 90 Tagen (Cloud Function mit Scheduler)

---

## Phase 11 — Deployment & Übergabe

- [ ] **11.1** `customer/`-Bereich auf Firebase Hosting deployen (noindex, nur mit Login erreichbar)
- [ ] **11.2** URL festlegen: z.B. `kundenbereich.ml-vision.de` oder `app.ml-vision.de/customer/`
- [ ] **11.3** DONNA-Login-Zugangsdaten vorbereiten: E-Mail + temporäres Passwort
- [ ] **11.4** Onboarding-Call mit DONNA: Kundenbereich erklären (15–20 Min)
- [ ] **11.5** Benutzerhandbuch PDF für DONNA erstellen (kurz: 1–2 Seiten)

---

## Priorisierung & Reihenfolge

| Phase | Priorität | Voraussetzung | Aufwand |
|-------|-----------|---------------|---------|
| 1 (Auth) | 🔴 Kritisch | — | 2h |
| 2 (Dashboard) | 🔴 Kritisch | Phase 1 | 4h |
| 6 (Rechnungen) | 🟠 Hoch | Phase 1 | 2h |
| 8 (Support) | 🟠 Hoch | Phase 1 | 3h |
| 3 (Anrufe) | 🟠 Hoch | Phase 10 | 4h |
| 10 (Datenpipeline) | 🟠 Hoch | Go-Live | 4h |
| 9 (Dokumentation) | 🟡 Mittel | — | 3h |
| 5 (Statistiken) | 🟡 Mittel | Phase 3 + 10 | 5h |
| 4 (Reservierungen) | 🟡 Mittel | Phase 3 | 2h |
| 7 (Einstellungen) | 🟡 Mittel | Phase 1 | 2h |
| 11 (Deployment) | 🔴 Kritisch | Alle | 2h |

**Empfohlene Reihenfolge für MVP (vor Go-Live):**
Phase 1 → 2 → 6 → 8 → 9 → 11

**Nach Go-Live:** Phase 10 → 3 → 4 → 5 → 7

---

## Firestore Datenstruktur (Übersicht)

```
firestore/
├── customers/
│   └── donna-leipzig/
│       ├── uid, name, plan, agentId, atavoloEnabled, goLiveDate
│       ├── settings/
│       │   ├── openingHours: {Mon: {open: "11:00", close: "23:00"}, ...}
│       │   ├── handoffNumber: "+49 341 39 37 33 00"
│       │   ├── handoffThreshold: 6
│       │   └── greetingScript: "Herzlich willkommen bei DONNA..."
│       ├── calls/ (subcollection)
│       │   └── {callId}: callId, timestamp, duration, outcome, guestName, partySize, ...
│       └── tickets/ (subcollection)
│           └── {ticketId}: subject, message, status, createdAt
├── invoices/
│   └── donna-leipzig/
│       └── invoices/ (subcollection)
│           └── RE-2026031001: nr, date, amount, status, pdfUrl
```

---

## Offene Fragen / Klärungsbedarf

- [ ] Soll DONNA selbst Öffnungszeiten ändern können oder nur über Support-Ticket?
- [ ] Sollen Anruf-Transcripts angezeigt werden? (DSGVO-Abwägung)
- [ ] Mehrere DONNA-Mitarbeiter oder nur Henrik Dantz?
- [ ] Atavolo API-Rückkanal vorhanden oder manuelles Nachpflegen der Buchungsnummer?
- [ ] Soll der Kundenbereich eine eigene Domain bekommen (z.B. `donna.ml-vision.de`)?
