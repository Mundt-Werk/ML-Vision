# 📊 Komplettes Modul-Audit: Alle Kundenmodule

**Audit-Datum:** 10.12.2024
**Anzahl Module:** 9 gesamt (1 bereits auditiert, 8 verbleibend)
**Bewertungskriterien:**
- ✅ **KEEP** - Echte Datenquelle vorhanden, messbare KPIs, Kundenmehrwert klar
- 🔴 **STREICHEN** - Keine Datenquelle, kein Kundenmehrwert, theoretisches Feature
- 📦 **BACKLOG** - Gute Idee, aber nicht MVP-kritisch
- 👁️ **VERSTECKEN** - Nur für Admin-Bereich, nicht für Kunden

---

## Übersicht: Alle 9 Module

| # | Modul | Datei | Status UI | Entscheidung | Grund | Aufwand |
|---|-------|-------|-----------|--------------|-------|---------|
| 1 | **Gespräche** | gespraeche.html | 100% | ✅ **KEEP** | Twilio-Daten vorhanden, messbare KPIs | 2-3 Tage |
| 2 | **Statistiken** | statistiken.html | 80% | 👁️ **VERSTECKEN** | Generische Analytics, Dashboard reicht | - |
| 3 | **Termine** | termine.html | 100% | 👁️ **VERSTECKEN** | Kalender-Connect nicht gewollt | - |
| 4 | **Workflows** | workflows.html | 100% | 👁️ **VERSTECKEN** | Nur für Admin/Debug relevant | - |
| 5 | **Benutzer** | benutzer.html | 60% | 🔴 **STREICHEN** | Kunden haben nur 1 Login | - |
| 6 | **Dokumentation** | dokumentation.html | 70% | 📦 **BACKLOG** | Gute Idee, aber nicht MVP-kritisch | 1-2 Tage (später) |
| 7 | **Rechnungen** | rechnungen.html | 90% | ✅ **KEEP** | Stripe-Integration möglich | 2-3 Tage |
| 8 | **Support** | support.html | 80% | ✅ **KEEP** | Ticket-System, echte Kommunikation | 1-2 Tage |
| 9 | **Sicherheit** | sicherheit.html | 90% | ✅ **KEEP** (vereinfachen) | Zu "Einstellungen" umbenennen | 0.5 Tage |

---

# 1. ✅ Gespräche (gespraeche.html)

**Siehe:** `AUDIT_MVP_Gespraeche.md`

**Zusammenfassung:**
- ✅ KEEP - MVP-Kern-Modul
- Twilio Voice API vorhanden
- 2-3 Tage Aufwand
- KPIs: Anzahl Calls, Ø Dauer, Erfolgsquote

---

# 2. 👁️ Statistiken (statistiken.html)

**Modul-Entscheidung:** 👁️ **VERSTECKEN** (nicht im Kundenbereich zeigen)
**Grund:** Dashboard zeigt bereits relevante KPIs, separate Statistik-Seite unnötig
**Priorität:** 🟢 NIEDRIG

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Übersicht verschiedener Metriken (Gespräche, Nachrichten, Termine)
- Charts und Grafiken für zeitliche Verläufe
- Vergleich verschiedener Zeiträume
- Export von Reports

**Use Cases:**
1. Kunde schaut sich Wochen-/Monatsvergleich an
2. Kunde will Trend erkennen (steigen die Calls?)
3. Kunde exportiert Report für Management

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (80% fertig)
- 4 KPI-Cards (Gespräche gesamt, Erfolgsquote, Ø Dauer, WhatsApp)
- 2 Chart-Platzhalter (Gespräche pro Tag, Erfolgsquote)
- Filter-Sektion (Zeitraum, Kanal)
- Export-Button (CSV/PDF)
- Responsive Design

### ❌ Backend/Daten (0% vorhanden)
- Keine Charts (nur Platzhalter-Divs)
- Keine echten Metriken
- Alle Zahlen hardcoded
- Keine Chart-Library (Chart.js, Recharts, etc.)
- Export-Button ohne Funktion

### 📊 Hardcodierte Werte
```html
Line 89: "127 Gespräche" (fest im HTML)
Line 95: "76%" (Erfolgsquote, fest im HTML)
Line 101: "3:24 Min" (Ø Dauer, fest im HTML)
Line 107: "89 Nachrichten" (fest im HTML)
```

## 3. Problem: Überschneidung mit Dashboard

**Dashboard zeigt bereits:**
- Gespräche heute
- Erfolgsquote
- Durchschnittsdauer
- Aktive Workflows

**Was würde Statistiken-Modul zusätzlich bringen?**
- ❌ Historische Daten (Dashboard kann erweitert werden)
- ❌ Charts (Dashboard kann Charts enthalten)
- ❌ Vergleich Zeiträume (Dashboard kann Filter bekommen)

**→ Keine echte Differenzierung zum Dashboard!**

## 4. Entscheidung: VERSTECKEN

**Begründung:**
1. **Dashboard ist ausreichend** - KPIs bereits dort vorhanden
2. **Doppelte Arbeit** - Charts müssten zweimal gebaut werden (Dashboard + Statistiken)
3. **Kein Kundenfeedback** - Niemand hat nach "Statistiken" gefragt
4. **Charts kosten Zeit** - Chart.js Integration + Daten-Aggregation = 3-4 Tage
5. **MVP-Fokus** - Dashboard mit erweiterten Filtern reicht für MVP

## 5. Alternative: Dashboard erweitern

**Statt separates Statistik-Modul:**
→ Dashboard bekommt:
- Zeitraum-Filter (Heute / Diese Woche / Dieser Monat)
- 1-2 kleine Charts (z.B. "Gespräche letzte 7 Tage")
- CSV-Export direkt im Dashboard

**Aufwand:** 1 Tag statt 3-4 Tage

## 6. Umsetzung: Modul verstecken

### In Sidebar ausblenden:
```javascript
// customer/dashboard.html - Sidebar Navigation
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html', permission: 'voice' },
  // { name: 'Statistiken', icon: 'chart', url: 'pages/statistiken.html' }, // VERSTECKT
  { name: 'Support', icon: 'help', url: 'pages/support.html' },
  { name: 'Rechnungen', icon: 'invoice', url: 'pages/rechnungen.html' },
  { name: 'Einstellungen', icon: 'settings', url: 'pages/einstellungen.html' }
];
```

### Datei behalten (für später):
- `customer/pages/statistiken.html` → nicht löschen, nur nicht verlinken
- Bei Bedarf später aktivieren (z.B. nach MVP-Launch wenn Zeit ist)

## 7. Zusammenfassung

**Status:** 🔴 Nicht für MVP relevant

**Entscheidung:** 👁️ **VERSTECKEN** (nicht löschen, nur nicht zeigen)

**Begründung:**
- Dashboard übernimmt KPI-Anzeige
- Doppelte Arbeit vermeiden
- 3-4 Tage Entwicklungszeit sparen
- Keine echte Datenquelle (nur Aggregationen)

**Nächster Schritt:**
- Modul aus Sidebar entfernen
- Dashboard mit 1-2 Mini-Charts erweitern (später)
- Datei behalten für mögliche spätere Nutzung

---

# 3. 👁️ Termine (termine.html)

**Modul-Entscheidung:** 👁️ **VERSTECKEN** (Kalender-Connect nicht gewollt)
**Grund:** Kunde will keine externe Kalender-Integration
**Priorität:** 🔴 HOCH (schnell verstecken, da verwirrend)

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Übersicht gebuchter Termine (aus Voice-Calls)
- Kalender-Ansicht (Monat, Woche, Tag)
- Neue Termine manuell eintragen
- Termine exportieren (iCal, Google Calendar)
- Erinnerungen aktivieren

**Use Cases:**
1. Kunde sieht alle gebuchten Termine auf einen Blick
2. Kunde trägt manuellen Termin ein (z.B. Rückruf)
3. Kunde exportiert Termine in eigenen Kalender

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (100% fertig, sehr umfangreich)
- Kalender-Ansicht mit 3 Views (Monat, Woche, Tag)
- Filter-Sektion (Datumsbereich, Termintyp, Status)
- KPI-Cards (Termine gesamt, Heute, Diese Woche, Ausstehend)
- Termin-Liste (5 Beispiel-Termine)
- Modal für Termindetails
- Button "Neuer Termin"
- Export-Button (iCal)
- Sehr aufwändige UI (1015 Zeilen Code!)

### ❌ Backend/Daten (0% vorhanden)
- Keine Kalender-Library (FullCalendar.js o.ä.)
- Keine echten Termine
- Alle Daten hardcoded
- Keine Firestore-Anbindung
- Export-Button ohne Funktion
- Kalender-Views nur Platzhalter

### 📊 Hardcodierte Werte
```html
Line 112: "24 Termine" (fest im HTML)
Line 118: "3 Termine heute" (fest im HTML)
Line 124: "12 Termine diese Woche" (fest im HTML)
Line 327-487: 5 Beispiel-Termine (statisch)
```

## 3. Problem: Datenquelle fehlt komplett

**Woher sollen Termine kommen?**

**Option A: Aus Voice-Calls extrahieren**
- Transkript analysieren: "Termin am Freitag 14 Uhr"
- **Problem:** Braucht Whisper API (gestrichen!) + NLP-Parsing
- **Aufwand:** 5-7 Tage
- **Fehlerquote:** Hoch (falsche Interpretation)

**Option B: Externe Kalender-Integration**
- Google Calendar API, Outlook Calendar, iCal
- **Problem:** User sagt "Kalender-Connect nicht gewollt"
- **Datenschutz:** Sync mit externen Kalendern problematisch
- **Aufwand:** 4-5 Tage

**Option C: Manuelle Eingabe**
- Kunde trägt Termine selbst ein
- **Problem:** Kein Mehrwert (Google Calendar macht das besser)
- **Use Case:** Unklar, warum in diesem Dashboard?

**→ Keine realistische Datenquelle für MVP!**

## 4. Entscheidung: VERSTECKEN

**Begründung:**
1. **Keine Datenquelle** - Weder automatisch (Whisper) noch manuell gewollt
2. **Kalender-Connect abgelehnt** - User will keine externe Integration
3. **Aufwand zu hoch** - Kalender-Library + Backend = 5-7 Tage
4. **Kein Kundenmehrwert** - Google Calendar macht das bereits
5. **UI ist fertig, aber nutzlos** - 1015 Zeilen Code ohne Funktion
6. **Verwirrend für Kunden** - Modul zeigt, aber funktioniert nicht

## 5. Umsetzung: Modul verstecken

### In Sidebar ausblenden:
```javascript
// customer/dashboard.html - Sidebar Navigation
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html', permission: 'voice' },
  // { name: 'Termine', icon: 'calendar', url: 'pages/termine.html' }, // VERSTECKT
  { name: 'Support', icon: 'help', url: 'pages/support.html' }
];
```

### Datei archivieren:
- `customer/pages/termine.html` → umbenennen zu `termine.html.backup`
- Oder in `/archive/` Ordner verschieben
- Dokumentieren: "Kalender-Integration abgelehnt, UI fertig falls später gewünscht"

## 6. Alternative (falls später gewünscht)

**Szenario:** Kunde ändert Meinung, will doch Termine

**Dann einfachste Lösung:**
1. iFrame mit Google Calendar einbetten (1 Stunde)
2. Oder: Termine manuell in Firestore schreiben (1 Tag)
3. Oder: Webhook von externem Kalender (2 Tage)

**Aber:** Erst wenn explizit angefragt, nicht im MVP!

## 7. Zusammenfassung

**Status:** 🔴 Keine Datenquelle, nicht MVP-relevant

**Entscheidung:** 👁️ **VERSTECKEN** (komplett aus Kundenbereich entfernen)

**Begründung:**
- Kalender-Integration nicht gewollt
- Automatische Termin-Extraktion (Whisper) zu komplex/teuer
- Manuelle Eingabe kein Mehrwert
- UI fertig (1015 Zeilen!), aber ohne Backend sinnlos
- Verwirrt Kunden ("Warum ist Termine leer?")

**Nächster Schritt:**
- Sofort aus Sidebar entfernen
- Datei in `/archive/termine.html.backup` verschieben
- In Admin-Panel dokumentieren: "Modul versteckt, UI fertig falls später benötigt"

---

# 4. 👁️ Workflows (workflows.html)

**Modul-Entscheidung:** 👁️ **VERSTECKEN** (nur für Admin/Debug relevant)
**Grund:** Kunde will Ergebnisse sehen, nicht technische Workflows
**Priorität:** 🟡 MITTEL

## 1. Zweck (aus Kundensicht?)

**Was soll das Modul leisten?**
- Übersicht aktiver Workflows (n8n, Make, Zapier)
- Status einzelner Workflow-Runs
- Fehlerprotokoll bei gescheiterten Workflows
- Workflow-Performance (Laufzeit, Erfolgsquote)

**Use Cases (theoretisch):**
1. Kunde sieht: "Lead-Qualifizierung Workflow läuft"
2. Kunde prüft: "Warum wurde kein Lead erstellt?"
3. Kunde monitored: "Wie viele Workflows laufen heute?"

## 2. Problem: Technische Details ≠ Kundenmehrwert

**Kunde interessiert sich für:**
- ✅ "Wie viele Leads wurden heute generiert?" → Dashboard
- ✅ "Warum wurde Anruf als 'fehlgeschlagen' markiert?" → Gespräche-Modul
- ✅ "Wurde E-Mail verschickt?" → Bestätigung im Support-Ticket

**Kunde interessiert sich NICHT für:**
- ❌ "Webhook-Node hatte Timeout"
- ❌ "n8n Workflow-ID: wf_12345 Status: running"
- ❌ "37 Workflow-Steps in 2.4 Sekunden"

**→ Workflow-Monitoring ist Admin-Aufgabe, nicht Kundenaufgabe!**

## 3. Ist-Status: Was ist vorhanden?

### ✅ UI (100% fertig)
- KPI-Cards (Aktive Workflows, Erfolgsquote, Fehler heute)
- Filter-Sektion (Status, Workflow-Typ, Datumsbereich)
- Tabelle mit Workflow-Runs
- Modal für Workflow-Details (Steps, Logs)
- Timeline-Ansicht (Workflow-Schritte)
- Sehr technische Darstellung (863 Zeilen Code)

### ❌ Backend/Daten (0% vorhanden)
- Keine n8n/Make/Zapier Integration
- Keine Workflow-Logs
- Alle Daten hardcoded
- Keine Firestore-Anbindung
- Keine Webhook-Endpoints

### 📊 Hardcodierte Werte
```html
Line 89: "12 Aktive Workflows" (fest im HTML)
Line 95: "94.2% Erfolgsquote" (fest im HTML)
Line 101: "3 Fehler heute" (fest im HTML)
```

## 4. Datenquelle: Vorhanden, aber komplex

**Mögliche Integration:**

**A) n8n Workflow API**
- `GET /api/v1/executions` - Liste aller Runs
- `GET /api/v1/executions/{id}` - Details eines Runs
- **Aufwand:** 3-4 Tage (API-Integration + Firestore-Import)
- **Problem:** n8n hostet wo? Self-hosted oder Cloud?

**B) Webhook-Logging**
- Jeder Workflow schreibt Status in Firestore
- **Collection:** `workflow_logs`
- **Aufwand:** 2-3 Tage (jeden Workflow anpassen)
- **Problem:** Bestehende Workflows müssen alle angefasst werden

**→ Technisch machbar, aber hoher Aufwand für fraglichen Nutzen**

## 5. Entscheidung: VERSTECKEN (nur für Admin)

**Begründung:**
1. **Kein Kundenmehrwert** - Kunde will Ergebnisse, nicht Prozesse
2. **Zu technisch** - "Webhook-Node failed" ist keine Info für Endkunden
3. **Dashboard reicht** - "12 Leads heute generiert" wichtiger als "12 Workflows liefen"
4. **Admin-Funktion** - Bei Problemen schaut ML Vision ins Workflow-Log, nicht der Kunde
5. **Aufwand zu hoch** - 3-4 Tage für Feature, das Kunde nicht braucht

## 6. Alternative: Admin-Bereich

**Workflow-Monitoring gehört in Admin-Panel:**

```javascript
// admin/pages/workflows.html (NEU erstellen)
// Nur für ML Vision Team, nicht für Kunden
```

**Dort sinnvoll:**
- ML Vision sieht: "Kunde X hat 3 fehlgeschlagene Workflows"
- ML Vision kann debuggen: "Twilio-Webhook liefert keine Daten"
- ML Vision monitored: "Alle Workflows laufen stabil"

**→ Verschieben von `/customer/pages/workflows.html` nach `/admin/pages/workflows.html`**

## 7. Umsetzung: Modul aus Kundenbereich entfernen

### In Sidebar ausblenden:
```javascript
// customer/dashboard.html - Sidebar Navigation
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html' },
  // { name: 'Workflows', icon: 'workflow', url: 'pages/workflows.html' }, // VERSTECKT
  { name: 'Support', icon: 'help', url: 'pages/support.html' }
];
```

### Datei verschieben:
```bash
# Von Kundenbereich zu Admin-Bereich
mv customer/pages/workflows.html admin/pages/workflows.html
```

**Dann:**
- Admin-Sidebar erweitern: Menüpunkt "Workflows" (nur für ML Vision Team)
- Später n8n API integrieren (Admin-Funktion)

## 8. Zusammenfassung

**Status:** 🔴 Technisches Monitoring, nicht Kundenfunktion

**Entscheidung:** 👁️ **VERSTECKEN** (aus Kundenbereich entfernen, in Admin verschieben)

**Begründung:**
- Kunde braucht Ergebnisse (Leads, Calls), nicht Workflow-Details
- Zu technisch für Endkunden
- Workflow-Monitoring ist Admin-Aufgabe
- UI fertig (863 Zeilen), aber am falschen Ort
- Später in Admin-Panel integrieren

**Nächster Schritt:**
- Datei nach `/admin/pages/workflows.html` verschieben
- Aus Kunden-Sidebar entfernen
- In Admin-Sidebar hinzufügen (später, wenn n8n API steht)

---

# 5. 🔴 Benutzer (benutzer.html)

**Modul-Entscheidung:** 🔴 **STREICHEN** (komplett löschen)
**Grund:** Kunden haben nur 1 Login, Benutzerverwaltung sinnlos
**Priorität:** 🔴 HOCH (verwirrend, sofort entfernen)

## 1. Zweck (aus Kundensicht?)

**Was soll das Modul leisten?**
- Übersicht aller Benutzer eines Kunden-Accounts
- Neue Benutzer anlegen (Kollegen Zugang geben)
- Benutzer löschen/deaktivieren
- Rollen vergeben (Admin, Viewer)

**Use Cases (theoretisch):**
1. Kunde legt Zugang für Kollegen an
2. Kunde gibt Agentur Zugriff (Viewer-Rolle)
3. Kunde entfernt ehemaligen Mitarbeiter

## 2. Problem: Geschäftsmodell passt nicht

**ML Vision Modell:**
- 1 Kunde = 1 Firma = 1 Login
- Kunde loggt sich ein, sieht seine Daten
- **KEINE** Multi-User-Verwaltung pro Kunde

**Warum?**
- Komplexität steigt massiv (Rollensystem, Permissions)
- Aufwand: 5-7 Tage Entwicklung
- Support-Aufwand: "Kollege kann sich nicht einloggen"
- Abrechnungsmodell unklar: Kosten pro User?

**→ Benutzerverwaltung ist Admin-Funktion, nicht Kundenfunktion!**

## 3. Ist-Status: Was ist vorhanden?

### ✅ UI (60% fertig)
- KPI-Card "3 aktive Benutzer"
- Tabelle mit Benutzer-Liste
- Button "Neuer Benutzer"
- Modal für Benutzer-Details (ohne Funktion)
- Relativ simple UI (140 Zeilen)

### ❌ Backend/Daten (0% vorhanden)
- Keine Firestore-Anbindung
- Keine Rollenverwaltung
- Alle Daten hardcoded
- Modal ohne Logik

### 📊 Hardcodierte Werte
```html
Line 69: "3 aktive Benutzer" (fest im HTML)
Line 91-126: 3 Beispiel-Benutzer (statisch)
```

## 4. Entscheidung: STREICHEN

**Begründung:**
1. **Geschäftsmodell passt nicht** - 1 Kunde = 1 Login
2. **Keine Anforderung** - Kein Kunde hat nach Multi-User gefragt
3. **Hoher Aufwand** - Rollensystem + Permissions = 5-7 Tage
4. **Support-Last** - Passwort-Resets, User-Management, etc.
5. **Admin hat bereits Benutzerverwaltung** - `/admin/pages/users.html` funktioniert
6. **Verwirrend für Kunden** - "Warum sehe ich mich selbst in einer Liste?"

## 5. Was macht Admin-Benutzerverwaltung?

**`/admin/pages/users.html` (bereits fertig!):**
- ML Vision legt Kunden an
- ML Vision setzt Passwort
- ML Vision aktiviert/deaktiviert Kunden
- ML Vision sieht alle Kunden-Accounts

**→ Das ist ausreichend! Kunden brauchen keine eigene Benutzerverwaltung.**

## 6. Umsetzung: Datei löschen

### Datei entfernen:
```bash
# Komplett löschen (keine Archivierung nötig, nur 140 Zeilen)
rm customer/pages/benutzer.html
```

### Aus Sidebar entfernen:
```javascript
// customer/dashboard.html - Sidebar Navigation
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html' },
  // { name: 'Benutzer', icon: 'users', url: 'pages/benutzer.html' }, // GESTRICHEN
  { name: 'Einstellungen', icon: 'settings', url: 'pages/einstellungen.html' }
];
```

## 7. Alternative (falls später gewünscht)

**Szenario:** Kunde will Zugang für Kollegen

**Dann:**
1. **Einfach:** Kunde schreibt Support-Ticket: "Bitte Zugang für max@firma.de anlegen"
2. **ML Vision:** Legt User in Admin-Panel an (1 Minute)
3. **Kunde:** Bekommt E-Mail mit Login-Daten

**→ Kein Bedarf für Self-Service Benutzerverwaltung im MVP**

## 8. Zusammenfassung

**Status:** 🔴 Nicht benötigt, verwirrend

**Entscheidung:** 🔴 **STREICHEN** (komplett löschen)

**Begründung:**
- Geschäftsmodell: 1 Kunde = 1 Login
- Admin-Panel hat bereits Benutzerverwaltung
- Keine Kundenanforderung
- Hoher Aufwand (5-7 Tage) für unnötiges Feature
- Würde nur verwirren

**Nächster Schritt:**
- `customer/pages/benutzer.html` löschen
- Aus Sidebar-Navigation entfernen
- Im Admin-Panel dokumentieren: "Kunden-Benutzerverwaltung nicht vorgesehen (1 Kunde = 1 Login)"

---

# 6. 📦 Dokumentation (dokumentation.html)

**Modul-Entscheidung:** 📦 **BACKLOG** (gute Idee, aber nicht MVP)
**Grund:** Nützlich, aber keine echten Inhalte vorhanden
**Priorität:** 🟢 NIEDRIG (später, wenn Content da ist)

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Hilfe-Artikel zu häufigen Fragen
- Anleitungen zur Nutzung des Dashboards
- API-Dokumentation (falls Kunde eigene Integration baut)
- Video-Tutorials
- FAQ

**Use Cases:**
1. Kunde fragt: "Wie exportiere ich Gespräche als CSV?" → Anleitung lesen
2. Kunde will API nutzen → Dokumentation lesen
3. Neuer Mitarbeiter → Onboarding-Video schauen

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (70% fertig)
- Kategorien-Navigation (6 Kategorien)
- Artikel-Liste (Platzhalter)
- Suchfunktion (UI vorhanden, nicht funktional)
- Breadcrumb-Navigation
- Artikel-Detail-Ansicht (Template)
- Saubere Struktur (177 Zeilen)

### ❌ Content/Daten (0% vorhanden)
- Keine echten Artikel
- Keine Hilfe-Texte
- Keine Screenshots
- Keine Videos
- Keine API-Dokumentation
- Alle Artikel sind Platzhalter

### 📊 Hardcodierte Werte
```html
Line 87-163: 6 Kategorien mit je 2-3 Beispiel-Artikeln
- "Erste Schritte"
- "Gespräche & Anrufe"
- "Support & Tickets"
- "Rechnungen & Zahlungen"
- "API Dokumentation"
- "Häufige Fragen"

Alle Artikel: "Artikel-Titel 1", "Artikel-Titel 2" (keine Inhalte)
```

## 3. Problem: Content fehlt komplett

**Was bräuchte man für echte Dokumentation?**

### A) Hilfe-Artikel schreiben (Content-Arbeit)
- "Wie erstelle ich ein Support-Ticket?"
- "Wie höre ich Gespräche ab?"
- "Wie exportiere ich Rechnungen?"
- **Aufwand:** 1-2 Tage pro 10 Artikel
- **Wer schreibt?** ML Vision Team (nicht Entwickler-Aufgabe!)

### B) Screenshots erstellen
- Für jeden Artikel 2-3 Screenshots
- **Aufwand:** 0.5 Tage
- **Problem:** UI ändert sich noch, Screenshots veralten

### C) API-Dokumentation
- Welche API? Noch nicht definiert
- **Aufwand:** 1-2 Tage (wenn API steht)
- **Problem:** API existiert noch nicht

### D) Video-Tutorials
- "Dashboard-Tour" (3-5 Min Video)
- **Aufwand:** 1 Tag (Aufnahme + Schnitt)
- **Problem:** UI ändert sich noch

**→ Dokumentation braucht Content-Erstellung, nicht Code-Entwicklung!**

## 4. Entscheidung: BACKLOG (später)

**Begründung:**
1. **UI ist fertig** - Struktur und Design passen
2. **Content fehlt** - Keine Artikel, keine Screenshots, keine Videos
3. **Nicht MVP-kritisch** - Kunden können Support-Ticket erstellen
4. **Content-Arbeit** - Kein Entwickler-Task, sondern Content-Erstellung
5. **Nach MVP-Launch sinnvoll** - Wenn UI stabil ist, dann Doku schreiben

## 5. Alternative: Support-Ticket statt Doku

**Für MVP ausreichend:**
- Kunde hat Frage → Support-Ticket erstellen
- ML Vision antwortet direkt
- Häufige Fragen sammeln → später in Doku übernehmen

**Vorteil:**
- Direkter Kontakt zu Kunden
- Lernen, welche Fragen wirklich kommen
- Doku wird relevanter (nur echte FAQs)

## 6. Umsetzung: Modul verstecken (vorerst)

### In Sidebar ausblenden:
```javascript
// customer/dashboard.html - Sidebar Navigation
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html' },
  { name: 'Support', icon: 'help', url: 'pages/support.html' },
  // { name: 'Dokumentation', icon: 'docs', url: 'pages/dokumentation.html' }, // BACKLOG
  { name: 'Einstellungen', icon: 'settings', url: 'pages/einstellungen.html' }
];
```

### Datei behalten:
- `customer/pages/dokumentation.html` → nicht löschen
- UI ist fertig und gut strukturiert
- Später aktivieren, wenn Content geschrieben ist

## 7. Plan für später (nach MVP)

**Phase 1 (1-2 Wochen nach Launch):**
1. Häufige Support-Anfragen sammeln
2. Top 10 FAQs als Artikel schreiben
3. Screenshots vom finalen UI machen
4. Modul in Sidebar aktivieren

**Phase 2 (1-2 Monate nach Launch):**
1. API-Dokumentation (wenn API verfügbar)
2. Video-Tutorial "Dashboard-Tour"
3. Kategorie "Best Practices"

**Aufwand:** 2-3 Tage (Content-Erstellung, nicht Code)

## 8. Quick Win (optional, 1 Stunde)

**Falls Modul doch im MVP gezeigt werden soll:**

Minimale Doku mit 5 Artikeln:
1. "Dashboard-Übersicht" - Was bedeuten die KPIs?
2. "Gespräche anhören" - Wie funktioniert Audio-Player?
3. "Support-Ticket erstellen" - Schritt-für-Schritt
4. "Rechnung herunterladen" - Wo finde ich meine Rechnungen?
5. "Passwort ändern" - In Einstellungen

**Aufwand:** 1 Stunde (simple Texte, keine Screenshots)

## 9. Zusammenfassung

**Status:** 🟡 UI fertig (70%), Content fehlt (0%)

**Entscheidung:** 📦 **BACKLOG** (später aktivieren, wenn Content da ist)

**Begründung:**
- UI/Struktur vorhanden und gut
- Content-Erstellung keine Entwickler-Aufgabe
- Support-Ticket-System reicht für MVP
- Nach Launch: Echte FAQs sammeln, dann Doku schreiben
- Nicht MVP-kritisch

**Nächster Schritt:**
- Modul vorerst aus Sidebar entfernen
- Nach MVP-Launch: Top 10 FAQs als Artikel schreiben (2-3 Tage)
- Dann Modul aktivieren

---

# 7. ✅ Rechnungen (rechnungen.html)

**Modul-Entscheidung:** ✅ **KEEP** (MVP-relevant)
**Grund:** Stripe-Integration möglich, messbare Daten
**Priorität:** 🟡 MITTEL (nach Gespräche-Modul)

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Übersicht aller Rechnungen (monatliches Abo)
- PDF-Download einzelner Rechnungen
- Zahlungsstatus einsehen (bezahlt, offen, überfällig)
- Aktuellen Plan anzeigen (Starter, Business, Enterprise)
- Plan wechseln (Upgrade/Downgrade)

**Use Cases:**
1. Kunde lädt Rechnung für Buchhaltung herunter
2. Kunde prüft: "Wurde November-Rechnung bezahlt?"
3. Kunde will upgraden: "Von Starter zu Business"

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (90% fertig)
- Plan-Card (Aktueller Plan mit Features)
- Rechnungs-Tabelle (5 Spalten: Datum, Nummer, Betrag, Status, Aktionen)
- Filter-Sektion (Zeitraum, Status)
- Button "Rechnung herunterladen" (PDF)
- Button "Plan ändern"
- Zahlungsmethode anzeigen
- Saubere UI (178 Zeilen)

### ❌ Backend/Daten (0% vorhanden)
- Keine Stripe-Integration
- Keine echten Rechnungen
- Alle Daten hardcoded
- PDF-Download ohne Funktion
- Plan-Wechsel ohne Funktion

### 📊 Hardcodierte Werte
```html
Line 72-99: Plan-Card "Starter Plan" (€29/Monat)
Line 143-194: 5 Beispiel-Rechnungen (statisch)
```

## 3. Datenquelle: Stripe (vorhanden!)

**Stripe-Integration ist Standard:**

### A) Stripe Invoices API
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Liste aller Rechnungen für Kunden
const invoices = await stripe.invoices.list({
  customer: 'cus_123456',
  limit: 20
});

// Einzelne Rechnung
const invoice = await stripe.invoices.retrieve('in_123456');

// PDF-URL
const pdfUrl = invoice.invoice_pdf;
```

**Daten:**
- Rechnungsnummer (Invoice ID)
- Datum (created)
- Betrag (amount_due)
- Status (paid, open, uncollectible)
- PDF-URL (invoice_pdf)

### B) Stripe Subscriptions API
```javascript
// Aktueller Plan
const subscription = await stripe.subscriptions.retrieve('sub_123456');

// Plan-Details
const plan = subscription.items.data[0].price;
const planName = plan.nickname; // "Starter", "Business"
const amount = plan.unit_amount / 100; // €29
```

**→ Echte Datenquelle vorhanden, gut dokumentiert, einfach zu integrieren!**

## 4. MVP-Entscheidungen

### ✅ KEEP (umsetzen)
1. **Rechnungsliste** - Stripe Invoices API
2. **PDF-Download** - Direkter Link zu Stripe PDF
3. **Zahlungsstatus** - Paid/Open aus Stripe
4. **Aktueller Plan** - Subscription Details
5. **Filter nach Datum** - Einfacher Datumsfilter

### 🔴 STREICHEN (nicht MVP)
1. ~~**Plan wechseln**~~ - Später, erst mal Support-Ticket
2. ~~**Zahlungsmethode ändern**~~ - Stripe Customer Portal (separater Link)
3. ~~**Rechnungs-Vorschau**~~ - PDF-Download reicht
4. ~~**Mehrere Rechnungen als ZIP**~~ - Nice-to-have

### 📋 BACKLOG (später)
1. **Self-Service Plan-Wechsel** - Stripe Checkout Integration (2 Tage)
2. **Zahlungsmethode im Dashboard** - Stripe Payment Methods (1 Tag)
3. **E-Mail bei neuer Rechnung** - Stripe Webhook (0.5 Tage)

## 5. Quick Wins (MVP-Umsetzung)

### Quick Win 1: Stripe Import → Firebase (0.5 Tage)

**Ziel:** Rechnungen in Firestore schreiben

**Firebase Cloud Function:**
```javascript
// functions/importStripeInvoices.js
exports.importInvoices = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const customers = await db.collection('customers').get();

    for (const customerDoc of customers.docs) {
      const customer = customerDoc.data();
      if (!customer.stripeCustomerId) continue;

      const invoices = await stripe.invoices.list({
        customer: customer.stripeCustomerId,
        limit: 100
      });

      for (const invoice of invoices.data) {
        await db.collection('invoices').doc(invoice.id).set({
          invoiceId: invoice.id,
          customerId: customerDoc.id,
          invoiceNumber: invoice.number,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: invoice.status, // paid | open | uncollectible
          pdfUrl: invoice.invoice_pdf,
          importedAt: new Date().toISOString()
        });
      }
    }
  });
```

**Aufwand:** 3-4 Stunden
**Erfolg messbar:** Firestore Collection `invoices` gefüllt

---

### Quick Win 2: Frontend → Firestore lesen (0.5 Tage)

**Ziel:** Tabelle zeigt echte Rechnungen

**rechnungen.html:**
```javascript
import { db } from '../../assets/js/firebase-config.js';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function loadInvoices() {
  const q = query(
    collection(db, 'invoices'),
    where('customerId', '==', currentCustomerId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  const invoices = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderInvoicesTable(invoices);
}

function renderInvoicesTable(invoices) {
  const tbody = document.querySelector('.invoices-table tbody');
  tbody.innerHTML = '';

  invoices.forEach(invoice => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(invoice.date)}</td>
      <td>${invoice.invoiceNumber}</td>
      <td>€${invoice.amount.toFixed(2)}</td>
      <td><span class="status-${invoice.status}">${getStatusText(invoice.status)}</span></td>
      <td>
        <a href="${invoice.pdfUrl}" target="_blank" class="action-btn">📄 PDF</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusText(status) {
  const statusMap = {
    'paid': 'Bezahlt',
    'open': 'Offen',
    'uncollectible': 'Überfällig'
  };
  return statusMap[status] || status;
}
```

**Aufwand:** 2-3 Stunden
**Erfolg messbar:** Tabelle zeigt echte Stripe-Rechnungen

---

### Quick Win 3: Aktueller Plan anzeigen (0.25 Tage)

**Ziel:** Plan-Card zeigt echten Subscription-Plan

**rechnungen.html:**
```javascript
async function loadCurrentPlan() {
  // Plan aus Firestore (von Customer-Dokument)
  const customerDoc = await db.collection('customers').doc(currentCustomerId).get();
  const customer = customerDoc.data();

  const planCard = document.querySelector('.plan-card');
  planCard.innerHTML = `
    <h3>${customer.planName}</h3>
    <div class="plan-price">€${customer.planPrice}/Monat</div>
    <ul class="plan-features">
      ${customer.planFeatures.map(f => `<li>✓ ${f}</li>`).join('')}
    </ul>
    <button onclick="contactSupport()">Plan ändern (Support kontaktieren)</button>
  `;
}
```

**Firestore Customer-Dokument:**
```javascript
{
  customerId: "cust_001",
  stripeCustomerId: "cus_123456",
  stripeSubscriptionId: "sub_789012",
  planName: "Business Plan",
  planPrice: 79,
  planFeatures: [
    "500 Voice-Calls/Monat",
    "WhatsApp Integration",
    "E-Mail Support"
  ]
}
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** Plan-Card zeigt echten Plan

---

### Quick Win 4: Filter nach Datum (0.25 Tage)

**Ziel:** Filter-Button lädt Rechnungen im Zeitraum

**rechnungen.html:**
```javascript
document.querySelector('.filter-button').addEventListener('click', async () => {
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  const q = query(
    collection(db, 'invoices'),
    where('customerId', '==', currentCustomerId),
    where('date', '>=', dateFrom),
    where('date', '<=', dateTo),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  const invoices = snapshot.docs.map(doc => doc.data());
  renderInvoicesTable(invoices);
});
```

**Aufwand:** 1 Stunde
**Erfolg messbar:** Filter funktioniert

---

## 6. KPIs für Dashboard

**Dashboard-Widget "Rechnungen":**
```
💳 Letzte Rechnung: €79,00 (bezahlt)
📅 Nächste Rechnung: 15.01.2025
✅ Aktueller Plan: Business Plan
```

**Berechnung:**
```javascript
async function getInvoiceKPIs() {
  const q = query(
    collection(db, 'invoices'),
    where('customerId', '==', currentCustomerId),
    orderBy('date', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  const lastInvoice = snapshot.docs[0].data();

  const customerDoc = await db.collection('customers').doc(currentCustomerId).get();
  const customer = customerDoc.data();

  return {
    lastInvoiceAmount: lastInvoice.amount,
    lastInvoiceStatus: lastInvoice.status,
    nextInvoiceDate: calculateNextInvoice(lastInvoice.date), // +1 Monat
    currentPlan: customer.planName
  };
}
```

---

## 7. Firestore-Struktur

**Collection:** `invoices`

**Dokument-Struktur:**
```javascript
{
  invoiceId: "in_1234567890",      // Stripe Invoice ID
  customerId: "cust_001",           // Welcher Kunde
  invoiceNumber: "INV-2024-001",    // z.B. "2024-12-001"
  date: "2024-12-01T00:00:00Z",     // Rechnungsdatum
  amount: 79.00,                    // Betrag in Euro
  currency: "eur",                  // Währung
  status: "paid",                   // paid | open | uncollectible
  pdfUrl: "https://pay.stripe.com/invoice/.../pdf", // PDF-Download
  importedAt: "2024-12-10T15:00:00Z"
}
```

**Collection:** `customers` (erweitern)

**Zusätzliche Felder:**
```javascript
{
  customerId: "cust_001",
  // ... bestehende Felder ...
  stripeCustomerId: "cus_123456",   // Stripe Customer ID
  stripeSubscriptionId: "sub_789012", // Stripe Subscription ID
  planName: "Business Plan",
  planPrice: 79,
  planFeatures: ["Feature 1", "Feature 2"]
}
```

---

## 8. Risiken & Mitigation

### 🟡 MITTEL
**Stripe Webhook-Verzögerung**
→ Neue Rechnung dauert bis zu 24h (täglicher Import)
→ **Lösung:** Stripe Webhook für Echtzeit-Updates (später, 0.5 Tage)

**Plan-Wechsel fehlt**
→ Kunde muss Support-Ticket erstellen
→ **Lösung:** Im MVP Button "Plan ändern" öffnet Support-Modal

### 🟢 NIEDRIG
**PDF-URL von Stripe ablaufen**
→ URLs sind dauerhaft gültig (kein Problem)

**Mehrere Währungen**
→ Aktuell nur EUR, später USD/GBP
→ **Lösung:** Im MVP nur EUR anzeigen

---

## 9. Betroffene Dateien

### Zu ändern:
- `customer/pages/rechnungen.html` - Firestore-Anbindung
- `customer/dashboard.html` - KPI-Widget "Rechnungen"
- `admin/pages/customers.html` - Stripe Customer ID hinzufügen

### Neu zu erstellen:
- `functions/importStripeInvoices.js` - Stripe → Firebase Import
- `functions/webhooks/stripeInvoiceCreated.js` - Echtzeit-Updates (später)

### Firestore Collections:
- `invoices` - Alle Rechnungen
- `customers` - Erweitern um Stripe-Felder

---

## 10. MVP-Abnahmekriterien

### ✅ Funktional
1. Tabelle zeigt echte Stripe-Rechnungen (≥ 5 Einträge)
2. PDF-Download funktioniert (öffnet Stripe PDF)
3. Zahlungsstatus korrekt (Bezahlt/Offen/Überfällig)
4. Filter nach Datum funktioniert
5. Plan-Card zeigt echten Subscription-Plan

### ✅ Dashboard-KPIs
1. "Letzte Rechnung" = Betrag + Status
2. "Nächste Rechnung" = Datum korrekt berechnet
3. "Aktueller Plan" = Plan-Name

### ✅ Performance
1. Laden der Tabelle < 2 Sekunden (20 Rechnungen)
2. PDF-Download startet sofort (Stripe-Link)
3. Dashboard-KPIs laden < 1 Sekunde

### ✅ Sicherheit
1. Kunde sieht nur eigene Rechnungen (`where customerId == ...`)
2. Firestore Rules: User kann nur eigene Daten lesen
3. Stripe API Keys nur in Cloud Functions (nicht im Frontend)

---

## 11. Aufwand & Timeline

**Gesamt: 2-3 Arbeitstage**

| Task | Aufwand | Verantwortlich |
|------|---------|----------------|
| Stripe Import Cloud Function | 3-4h | Backend-Dev |
| Frontend Firestore-Anbindung | 2-3h | Frontend-Dev |
| Plan-Card dynamisch | 1-2h | Frontend-Dev |
| Filter + Sortierung | 1h | Frontend-Dev |
| Dashboard KPI-Widget | 1-2h | Frontend-Dev |
| Testing + Bugfixes | 3-4h | QA |

**Start möglich:** Sofort (Stripe-Account vorhanden?)

---

## 12. Zusammenfassung

**Status:** 🟡 UI fertig (90%), Backend fehlt (0%)

**Modul-Entscheidung:** ✅ **KEEP - MVP-relevant**

**Begründung:**
- Echte Datenquelle (Stripe) vorhanden
- Standard-Integration, gut dokumentiert
- Messbare KPIs (Rechnungsbetrag, Status)
- Direkter Kundenmehrwert (Buchhaltung)
- Umsetzung realistisch (2-3 Tage)

**Gestrichen (nicht MVP):**
- Self-Service Plan-Wechsel (später)
- Zahlungsmethode ändern (Stripe Portal)
- Mehrere PDFs als ZIP (nice-to-have)

**Nächster Schritt:**
Stripe Import implementieren → Frontend anbinden → Fertig in 2-3 Tagen

---

# 8. ✅ Support (support.html)

**Modul-Entscheidung:** ✅ **KEEP** (MVP-kritisch)
**Grund:** Direkter Kundenkontakt, einfache Umsetzung
**Priorität:** 🔴 HOCH (MVP-kritisch für Kommunikation)

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Support-Ticket erstellen (Frage, Problem, Feature-Request)
- Übersicht aller eigenen Tickets
- Status einsehen (Offen, In Bearbeitung, Gelöst)
- Antworten von ML Vision lesen
- Auf Tickets antworten (Dialog)

**Use Cases:**
1. Kunde hat Frage: "Wie exportiere ich Gespräche?" → Ticket erstellen
2. Kunde meldet Bug: "Audio-Player lädt nicht" → Ticket erstellen
3. Kunde prüft: "Wurde mein Ticket beantwortet?" → Status checken
4. Kunde antwortet auf ML Vision Antwort → Dialog

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (80% fertig)
- KPI-Card "3 offene Tickets"
- Filter-Sektion (Status, Kategorie)
- Ticket-Liste (Titel, Status, Datum, Kategorie)
- Button "Neues Ticket"
- Modal für Ticket-Details (mit Antworten)
- Modal für neues Ticket
- Saubere UI (143 Zeilen)

### ❌ Backend/Daten (0% vorhanden)
- Keine Firestore-Anbindung
- Keine Ticket-Erstellung
- Alle Daten hardcoded
- Keine E-Mail-Benachrichtigung
- Modal ohne Funktion

### 📊 Hardcodierte Werte
```html
Line 69: "3 offene Tickets" (fest im HTML)
Line 112-152: 4 Beispiel-Tickets (statisch)
```

## 3. Datenquelle: Firestore (einfach!)

**Kein externer Service nötig, nur Firestore:**

### Firestore-Struktur (simpel)

**Collection:** `tickets`

**Dokument-Struktur:**
```javascript
{
  ticketId: "ticket_001",
  customerId: "cust_001",
  title: "Wie exportiere ich Gespräche?",
  category: "Frage",              // Frage | Problem | Feature-Request
  status: "open",                  // open | in_progress | resolved | closed
  priority: "normal",              // low | normal | high
  createdAt: "2024-12-10T14:30:00Z",
  updatedAt: "2024-12-10T15:00:00Z",
  messages: [
    {
      messageId: "msg_001",
      author: "customer",           // customer | support
      authorName: "Max Mustermann",
      text: "Ich finde den Export-Button nicht.",
      timestamp: "2024-12-10T14:30:00Z"
    },
    {
      messageId: "msg_002",
      author: "support",
      authorName: "ML Vision Support",
      text: "Der Export-Button befindet sich oben rechts in der Gespräche-Tabelle.",
      timestamp: "2024-12-10T15:00:00Z"
    }
  ]
}
```

**→ Keine externe API, keine komplexe Integration, einfach Firestore!**

## 4. MVP-Entscheidungen

### ✅ KEEP (umsetzen)
1. **Ticket-Liste** - Firestore-Abfrage
2. **Ticket erstellen** - Firestore schreiben
3. **Ticket-Details** - Messages anzeigen
4. **Antwort schreiben** - Message zu Ticket hinzufügen
5. **Filter nach Status** - Einfacher Firestore-Filter
6. **E-Mail-Benachrichtigung** - Firebase Cloud Function

### 🔴 STREICHEN (nicht MVP)
1. ~~**Datei-Anhänge**~~ - Später, Screenshots via Firebase Storage
2. ~~**Live-Chat**~~ - Ticket-System reicht, kein WebSocket nötig
3. ~~**Ticket-Bewertung**~~ - "War diese Antwort hilfreich?" → später
4. ~~**Auto-Close nach 7 Tagen**~~ - Manuell reicht für MVP

### 📋 BACKLOG (später)
1. **Screenshot-Upload** - Firebase Storage Integration (1 Tag)
2. **E-Mail-Reply** - Kunde antwortet per E-Mail (Webhook, 2 Tage)
3. **Ticket-Kategorien auto** - KI erkennt Kategorie (später)

## 5. Quick Wins (MVP-Umsetzung)

### Quick Win 1: Ticket erstellen (0.5 Tage)

**Ziel:** Button "Neues Ticket" schreibt in Firestore

**support.html:**
```javascript
import { db } from '../../assets/js/firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function createTicket(formData) {
  const ticket = {
    customerId: currentCustomerId,
    title: formData.title,
    category: formData.category,
    status: 'open',
    priority: 'normal',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messages: [
      {
        messageId: generateId(),
        author: 'customer',
        authorName: currentUser.name,
        text: formData.message,
        timestamp: serverTimestamp()
      }
    ]
  };

  await addDoc(collection(db, 'tickets'), ticket);

  // E-Mail an ML Vision senden (Cloud Function)
  await sendTicketNotification(ticket);

  // Modal schließen, Liste neu laden
  closeModal();
  loadTickets();
}
```

**Aufwand:** 2-3 Stunden
**Erfolg messbar:** Tickets in Firestore sichtbar

---

### Quick Win 2: Ticket-Liste anzeigen (0.25 Tage)

**Ziel:** Tabelle zeigt echte Tickets

**support.html:**
```javascript
async function loadTickets() {
  const q = query(
    collection(db, 'tickets'),
    where('customerId', '==', currentCustomerId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderTicketsTable(tickets);
  updateKPIs(tickets);
}

function renderTicketsTable(tickets) {
  const tbody = document.querySelector('.tickets-table tbody');
  tbody.innerHTML = '';

  tickets.forEach(ticket => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${ticket.title}</strong></td>
      <td><span class="status-${ticket.status}">${getStatusText(ticket.status)}</span></td>
      <td>${formatDate(ticket.createdAt)}</td>
      <td>${ticket.category}</td>
      <td>
        <button class="action-btn" onclick="openTicket('${ticket.id}')">Öffnen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateKPIs(tickets) {
  const openTickets = tickets.filter(t => t.status === 'open').length;
  document.querySelector('.kpi-value').textContent = openTickets;
}
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** Tabelle zeigt echte Tickets

---

### Quick Win 3: Ticket-Details & Antworten (0.5 Tage)

**Ziel:** Modal zeigt Messages, Kunde kann antworten

**support.html:**
```javascript
async function openTicket(ticketId) {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();
  const ticket = ticketDoc.data();

  // Modal mit Messages füllen
  const messagesHtml = ticket.messages.map(msg => `
    <div class="message ${msg.author}">
      <div class="message-header">
        <strong>${msg.authorName}</strong>
        <span class="message-time">${formatDateTime(msg.timestamp)}</span>
      </div>
      <div class="message-text">${msg.text}</div>
    </div>
  `).join('');

  document.getElementById('ticketMessages').innerHTML = messagesHtml;

  // Antwort-Button
  document.getElementById('replyButton').onclick = async () => {
    const replyText = document.getElementById('replyInput').value;

    await updateDoc(doc(db, 'tickets', ticketId), {
      messages: arrayUnion({
        messageId: generateId(),
        author: 'customer',
        authorName: currentUser.name,
        text: replyText,
        timestamp: new Date()
      }),
      updatedAt: serverTimestamp(),
      status: 'in_progress'
    });

    // E-Mail an ML Vision
    await sendReplyNotification(ticketId, replyText);

    openTicket(ticketId); // Neu laden
  };

  document.getElementById('ticketModal').classList.add('active');
}
```

**Aufwand:** 3-4 Stunden
**Erfolg messbar:** Dialog funktioniert

---

### Quick Win 4: E-Mail-Benachrichtigung (0.25 Tage)

**Ziel:** ML Vision bekommt E-Mail bei neuem Ticket

**Firebase Cloud Function:**
```javascript
// functions/sendTicketNotification.js
const nodemailer = require('nodemailer');

exports.sendTicketEmail = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snap, context) => {
    const ticket = snap.data();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: 'noreply@ml-vision.de',
      to: 'support@ml-vision.de',
      subject: `[Support] Neues Ticket: ${ticket.title}`,
      html: `
        <h2>Neues Support-Ticket</h2>
        <p><strong>Kunde:</strong> ${ticket.customerId}</p>
        <p><strong>Kategorie:</strong> ${ticket.category}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${ticket.messages[0].text}</p>
        <p><a href="https://dashboard.ml-vision.de/admin/tickets/${context.params.ticketId}">Ticket öffnen</a></p>
      `
    });
  });
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** E-Mail kommt an bei neuem Ticket

---

## 6. Admin-Panel Integration

**ML Vision braucht Admin-Ansicht:**

**Neue Datei:** `admin/pages/tickets.html` (oder in `support.html` integrieren)

**Funktionen:**
- Alle Tickets aller Kunden sehen
- Ticket öffnen und antworten
- Status ändern (Offen → In Bearbeitung → Gelöst)
- Ticket schließen

**Simple Firestore-Query:**
```javascript
// Admin sieht ALLE Tickets
const q = query(
  collection(db, 'tickets'),
  orderBy('updatedAt', 'desc')
);
```

**Aufwand:** 1-2 Stunden (UI ist fast identisch zu Kunden-Ansicht)

---

## 7. KPIs für Dashboard

**Dashboard-Widget "Support":**
```
🎫 Offene Tickets: 3
✅ Gelöste Tickets (diese Woche): 5
⏱️ Ø Antwortzeit: 2h
```

**Berechnung:**
```javascript
async function getSupportKPIs() {
  const q = query(
    collection(db, 'tickets'),
    where('customerId', '==', currentCustomerId)
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => doc.data());

  const openTickets = tickets.filter(t => t.status === 'open').length;

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const resolvedThisWeek = tickets.filter(t =>
    t.status === 'resolved' &&
    new Date(t.updatedAt) > thisWeek
  ).length;

  const avgResponseTime = calculateAvgResponseTime(tickets);

  return { openTickets, resolvedThisWeek, avgResponseTime };
}
```

---

## 8. Risiken & Mitigation

### 🟡 MITTEL
**Spam-Tickets**
→ Kunde erstellt 100 Tickets/Tag
→ **Lösung:** Rate-Limiting (max. 5 Tickets/Tag) (später)

**E-Mail landet im Spam**
→ Nodemailer-E-Mails werden blockiert
→ **Lösung:** SendGrid/Mailgun verwenden (statt Nodemailer)

### 🟢 NIEDRIG
**Ticket-Anzahl wächst**
→ Nach 6 Monaten 1000+ Tickets
→ **Lösung:** Pagination (20 Tickets/Seite)

---

## 9. Betroffene Dateien

### Zu ändern:
- `customer/pages/support.html` - Firestore-Anbindung
- `customer/dashboard.html` - KPI-Widget "Support"

### Neu zu erstellen:
- `admin/pages/tickets.html` - Admin-Ansicht für ML Vision (oder in support.html)
- `functions/sendTicketNotification.js` - E-Mail bei neuem Ticket
- `functions/sendReplyNotification.js` - E-Mail bei Antwort

### Firestore Collections:
- `tickets` - Alle Support-Tickets

---

## 10. MVP-Abnahmekriterien

### ✅ Funktional
1. Kunde kann Ticket erstellen (Titel + Nachricht)
2. Ticket-Liste zeigt echte Tickets (nicht hardcoded)
3. Ticket-Details zeigen Messages (Dialog)
4. Kunde kann auf Ticket antworten
5. Filter nach Status funktioniert (Offen/Gelöst)

### ✅ E-Mail-Benachrichtigung
1. ML Vision bekommt E-Mail bei neuem Ticket
2. ML Vision bekommt E-Mail bei Kunden-Antwort
3. E-Mail enthält Link zu Ticket

### ✅ Admin-Panel
1. Admin sieht alle Tickets aller Kunden
2. Admin kann Tickets öffnen und antworten
3. Admin kann Status ändern (Offen → Gelöst)

### ✅ Performance
1. Laden der Ticket-Liste < 2 Sekunden
2. Ticket-Details laden < 1 Sekunde
3. Dashboard-KPIs laden < 1 Sekunde

### ✅ Sicherheit
1. Kunde sieht nur eigene Tickets (`where customerId == ...`)
2. Admin sieht alle Tickets
3. Firestore Rules: User kann nur eigene Daten schreiben

---

## 11. Aufwand & Timeline

**Gesamt: 1-2 Arbeitstage**

| Task | Aufwand | Verantwortlich |
|------|---------|----------------|
| Ticket erstellen (Frontend) | 2-3h | Frontend-Dev |
| Ticket-Liste anzeigen | 1-2h | Frontend-Dev |
| Ticket-Details + Antworten | 3-4h | Frontend-Dev |
| E-Mail-Benachrichtigung | 1-2h | Backend-Dev |
| Admin-Panel Tickets | 1-2h | Frontend-Dev |
| Dashboard KPI-Widget | 1h | Frontend-Dev |
| Testing + Bugfixes | 2-3h | QA |

**Start möglich:** Sofort (nur Firestore nötig)

---

## 12. Zusammenfassung

**Status:** 🟡 UI fertig (80%), Backend fehlt (0%)

**Modul-Entscheidung:** ✅ **KEEP - MVP-kritisch**

**Begründung:**
- Direkter Kundenkontakt (wichtigste Funktion!)
- Einfachste Integration (nur Firestore, keine externe API)
- Keine Abhängigkeit von Drittanbietern
- Messbare KPIs (Anzahl Tickets, Antwortzeit)
- Schnellste Umsetzung (1-2 Tage)

**Gestrichen (nicht MVP):**
- Datei-Anhänge (später via Firebase Storage)
- Live-Chat (Ticket-System reicht)
- Auto-Close (manuell reicht)

**Nächster Schritt:**
Firestore-Anbindung → E-Mail-Notification → Admin-Panel → Fertig in 1-2 Tagen

---

# 9. ✅ Sicherheit → Einstellungen (sicherheit.html)

**Modul-Entscheidung:** ✅ **KEEP** (vereinfachen zu "Einstellungen")
**Grund:** Profil + Passwort ändern wichtig, Rest streichen
**Priorität:** 🟡 MITTEL

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten (aktuell)?**
- 2-Faktor-Authentifizierung aktivieren
- API-Keys generieren
- Login-Historie einsehen
- Sicherheits-Logs prüfen
- Session-Management
- Passwort ändern

**Was WIRKLICH gebraucht wird:**
- ✅ Passwort ändern
- ✅ Profil bearbeiten (Name, E-Mail)
- ❌ 2FA (später, nicht MVP)
- ❌ API-Keys (keine API im MVP)
- ❌ Login-Historie (overkill für MVP)
- ❌ Session-Management (unnötig komplex)

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (90% fertig, aber zu komplex)
- 2FA-Toggle (mit QR-Code-Platzhalter)
- API-Keys-Sektion (Generieren/Löschen)
- Login-Historie-Tabelle (letzte 5 Logins)
- Sicherheits-Logs
- Session-Management
- Passwort ändern (ganz unten!)
- Sehr umfangreiche UI (204 Zeilen)

### ❌ Backend/Daten (0% vorhanden)
- Keine 2FA-Integration
- Keine API-Key-Generierung
- Alle Daten hardcoded
- Passwort-Änderung ohne Funktion

### 📊 Hardcodierte Werte
```html
Line 75-95: 2FA-Sektion (nicht funktional)
Line 97-122: API-Keys (statisch)
Line 124-169: Login-Historie (5 Beispiel-Einträge)
Line 171-186: Passwort ändern (ohne Funktion)
```

## 3. Problem: Over-Engineering

**Was ist realistisch für MVP?**

### ❌ 2-Faktor-Authentifizierung
- Braucht: TOTP-Library (speakeasy), QR-Code-Generator, Backup-Codes
- **Aufwand:** 2-3 Tage
- **Use Case:** Kein Kunde hat danach gefragt
- **Risiko:** Support-Last (2FA vergessen, neues Handy, etc.)

### ❌ API-Keys
- Wofür? Es gibt keine API im MVP
- Später sinnvoll wenn Zapier/n8n-Integration steht
- **Aufwand:** 1 Tag (Key-Generierung + Validation)

### ❌ Login-Historie
- Nett, aber nicht kritisch
- "Letzter Login: 10.12.2024 14:30" reicht
- Vollständige Historie übertrieben
- **Aufwand:** 1 Tag (Firestore Logging)

### ❌ Sicherheits-Logs
- "User changed password", "2FA enabled"
- Für 1-Person-Accounts unnötig
- **Aufwand:** 0.5 Tage

## 4. Entscheidung: Vereinfachen zu "Einstellungen"

**Umbenennen:**
- `sicherheit.html` → `einstellungen.html`
- Sidebar: "Sicherheit" → "Einstellungen"

**Behalten:**
1. ✅ Passwort ändern
2. ✅ Profil bearbeiten (Name, E-Mail, Telefon)
3. ✅ Benachrichtigungs-Einstellungen (E-Mail ja/nein)

**Streichen:**
1. ❌ 2FA (später, Backlog)
2. ❌ API-Keys (später, wenn API steht)
3. ❌ Login-Historie (später, Backlog)
4. ❌ Sicherheits-Logs (später, Backlog)
5. ❌ Session-Management (unnötig)

## 5. MVP-Entscheidungen

### ✅ KEEP (umsetzen)
1. **Passwort ändern** - Firebase Auth
2. **Profil bearbeiten** - Firestore Update
3. **E-Mail-Benachrichtigungen** - Ein/Aus-Toggle

### 🔴 STREICHEN (aus MVP)
1. ~~**2FA**~~ - Später, nicht MVP-kritisch
2. ~~**API-Keys**~~ - Keine API im MVP
3. ~~**Login-Historie**~~ - Overkill
4. ~~**Sicherheits-Logs**~~ - Unnötig komplex

### 📋 BACKLOG (später)
1. **2FA** - Wenn mehrere Kunden danach fragen (3 Tage)
2. **Login-Historie** - Letzte 10 Logins (1 Tag)
3. **API-Keys** - Wenn Zapier-Integration steht (1 Tag)

## 6. Quick Wins (MVP-Umsetzung)

### Quick Win 1: Datei umbenennen (5 Minuten)

```bash
# Datei umbenennen
mv customer/pages/sicherheit.html customer/pages/einstellungen.html

# Sidebar-Link aktualisieren
# customer/dashboard.html
{ name: 'Einstellungen', icon: 'settings', url: 'pages/einstellungen.html' }
```

---

### Quick Win 2: UI vereinfachen (0.5 Tage)

**Ziel:** Nur noch 3 Sektionen zeigen

**einstellungen.html:**
```html
<div class="settings-card">
  <h2>Profil</h2>
  <form id="profileForm">
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" value="Max Mustermann">
    </div>
    <div class="form-group">
      <label for="email">E-Mail</label>
      <input type="email" id="email" value="max@firma.de">
    </div>
    <div class="form-group">
      <label for="phone">Telefon</label>
      <input type="tel" id="phone" value="+49 123 456789">
    </div>
    <button type="button" onclick="saveProfile()">Profil speichern</button>
  </form>
</div>

<div class="settings-card">
  <h2>Passwort ändern</h2>
  <form id="passwordForm">
    <div class="form-group">
      <label for="currentPassword">Aktuelles Passwort</label>
      <input type="password" id="currentPassword">
    </div>
    <div class="form-group">
      <label for="newPassword">Neues Passwort</label>
      <input type="password" id="newPassword">
    </div>
    <div class="form-group">
      <label for="confirmPassword">Passwort bestätigen</label>
      <input type="password" id="confirmPassword">
    </div>
    <button type="button" onclick="changePassword()">Passwort ändern</button>
  </form>
</div>

<div class="settings-card">
  <h2>Benachrichtigungen</h2>
  <form id="notificationForm">
    <div class="checkbox-item">
      <label for="emailNotifications">E-Mail-Benachrichtigungen</label>
      <input type="checkbox" id="emailNotifications" checked>
    </div>
    <div class="checkbox-item">
      <label for="newTicketNotification">Neue Support-Antworten</label>
      <input type="checkbox" id="newTicketNotification" checked>
    </div>
    <div class="checkbox-item">
      <label for="invoiceNotification">Neue Rechnungen</label>
      <input type="checkbox" id="invoiceNotification" checked>
    </div>
    <button type="button" onclick="saveNotifications()">Einstellungen speichern</button>
  </form>
</div>
```

**Aufwand:** 2-3 Stunden
**Erfolg messbar:** UI ist simpel und klar

---

### Quick Win 3: Profil speichern (0.25 Tage)

**Ziel:** Profil-Änderungen in Firestore schreiben

**einstellungen.html:**
```javascript
import { db } from '../../assets/js/firebase-config.js';
import { doc, updateDoc } from 'firebase/firestore';

async function saveProfile() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  await updateDoc(doc(db, 'customers', currentCustomerId), {
    name: name,
    email: email,
    phone: phone,
    updatedAt: new Date()
  });

  showAlert('Profil erfolgreich gespeichert!');
}
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** Änderungen in Firestore sichtbar

---

### Quick Win 4: Passwort ändern (0.5 Tage)

**Ziel:** Firebase Auth Passwort ändern

**einstellungen.html:**
```javascript
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validierung
  if (newPassword !== confirmPassword) {
    showAlert('Passwörter stimmen nicht überein!', 'Fehler');
    return;
  }

  if (newPassword.length < 8) {
    showAlert('Passwort muss mindestens 8 Zeichen lang sein!', 'Fehler');
    return;
  }

  const auth = getAuth();
  const user = auth.currentUser;

  // Re-Authentifizierung (Firebase verlangt das)
  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    showAlert('Passwort erfolgreich geändert!', 'Erfolg');

    // Formular leeren
    document.getElementById('passwordForm').reset();
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      showAlert('Aktuelles Passwort ist falsch!', 'Fehler');
    } else {
      showAlert('Fehler beim Ändern des Passworts: ' + error.message, 'Fehler');
    }
  }
}
```

**Aufwand:** 2-3 Stunden
**Erfolg messbar:** Passwort ändern funktioniert

---

### Quick Win 5: Benachrichtigungen speichern (0.25 Tage)

**Ziel:** Toggle-Einstellungen in Firestore

**einstellungen.html:**
```javascript
async function saveNotifications() {
  const emailNotifications = document.getElementById('emailNotifications').checked;
  const newTicketNotification = document.getElementById('newTicketNotification').checked;
  const invoiceNotification = document.getElementById('invoiceNotification').checked;

  await updateDoc(doc(db, 'customers', currentCustomerId), {
    notifications: {
      email: emailNotifications,
      tickets: newTicketNotification,
      invoices: invoiceNotification
    }
  });

  showAlert('Benachrichtigungseinstellungen gespeichert!');
}
```

**Aufwand:** 1 Stunde
**Erfolg messbar:** Einstellungen in Firestore

---

## 7. Firestore-Struktur

**Collection:** `customers` (erweitern)

**Zusätzliche Felder:**
```javascript
{
  customerId: "cust_001",
  // ... bestehende Felder ...
  name: "Max Mustermann",
  email: "max@firma.de",
  phone: "+49 123 456789",
  notifications: {
    email: true,
    tickets: true,
    invoices: false
  },
  updatedAt: "2024-12-10T15:00:00Z"
}
```

---

## 8. Betroffene Dateien

### Zu ändern:
- `customer/pages/sicherheit.html` → `einstellungen.html` (umbenennen + vereinfachen)
- `customer/dashboard.html` - Sidebar-Link anpassen

### NICHT erstellen:
- Keine Cloud Functions nötig
- Keine neue Collection nötig (nur `customers` erweitern)

---

## 9. MVP-Abnahmekriterien

### ✅ Funktional
1. Profil bearbeiten funktioniert (Name, E-Mail, Telefon)
2. Passwort ändern funktioniert (mit Re-Auth)
3. Benachrichtigungs-Toggles speichern
4. Formular-Validierung (Passwort min. 8 Zeichen, E-Mail-Format)

### ✅ Performance
1. Profil speichern < 1 Sekunde
2. Passwort ändern < 2 Sekunden

### ✅ Sicherheit
1. Re-Authentifizierung vor Passwort-Änderung
2. Passwort-Regeln (min. 8 Zeichen, später: Groß-/Kleinbuchstaben)
3. Firestore Rules: User kann nur eigenes Profil ändern

---

## 10. Aufwand & Timeline

**Gesamt: 0.5-1 Arbeitstag**

| Task | Aufwand | Verantwortlich |
|------|---------|----------------|
| Datei umbenennen | 5min | Dev |
| UI vereinfachen (HTML) | 2-3h | Frontend-Dev |
| Profil speichern | 1-2h | Frontend-Dev |
| Passwort ändern | 2-3h | Frontend-Dev |
| Benachrichtigungen speichern | 1h | Frontend-Dev |
| Testing + Bugfixes | 1h | QA |

**Start möglich:** Sofort

---

## 11. Zusammenfassung

**Status:** 🟡 UI fertig (90%), aber zu komplex

**Modul-Entscheidung:** ✅ **KEEP** (vereinfachen zu "Einstellungen")

**Begründung:**
- Passwort ändern MVP-kritisch
- Profil bearbeiten wichtig
- 2FA, API-Keys, Login-Historie overkill für MVP
- Vereinfachen spart 2-3 Tage Entwicklung

**Gestrichen (nicht MVP):**
- 2FA (später, Backlog)
- API-Keys (später, wenn API steht)
- Login-Historie (später, Backlog)
- Sicherheits-Logs (unnötig)
- Session-Management (unnötig)

**Nächster Schritt:**
1. Datei umbenennen: `sicherheit.html` → `einstellungen.html`
2. UI vereinfachen (nur Profil, Passwort, Benachrichtigungen)
3. Firebase-Anbindung → Fertig in 0.5-1 Tag

---

# 📊 Finale Zusammenfassung

## Alle 9 Module - Übersicht

| # | Modul | Entscheidung | Aufwand | Begründung |
|---|-------|--------------|---------|------------|
| 1 | **Gespräche** | ✅ KEEP | 2-3 Tage | Twilio-Daten, messbare KPIs |
| 2 | **Statistiken** | 👁️ VERSTECKEN | - | Dashboard reicht |
| 3 | **Termine** | 👁️ VERSTECKEN | - | Kalender-Connect nicht gewollt |
| 4 | **Workflows** | 👁️ VERSTECKEN | - | Admin-Funktion, nicht Kunde |
| 5 | **Benutzer** | 🔴 STREICHEN | - | 1 Kunde = 1 Login |
| 6 | **Dokumentation** | 📦 BACKLOG | 2-3 Tage (später) | Content fehlt, nach MVP |
| 7 | **Rechnungen** | ✅ KEEP | 2-3 Tage | Stripe-Integration |
| 8 | **Support** | ✅ KEEP | 1-2 Tage | Kritisch für Kommunikation |
| 9 | **Sicherheit** | ✅ KEEP (vereinfachen) | 0.5-1 Tag | Umbenennen zu "Einstellungen" |

---

## MVP-Kundenbereich - Finale Sidebar

```javascript
const customerModules = [
  { name: 'Dashboard', icon: 'dashboard', url: 'dashboard.html' },
  { name: 'Gespräche', icon: 'phone', url: 'pages/gespraeche.html', permission: 'voice' },
  { name: 'Support', icon: 'help', url: 'pages/support.html' },
  { name: 'Rechnungen', icon: 'invoice', url: 'pages/rechnungen.html' },
  { name: 'Einstellungen', icon: 'settings', url: 'pages/einstellungen.html' }
];
```

**= 5 Module statt 9!**

---

## Gesamt-Aufwand MVP

| Modul | Aufwand |
|-------|---------|
| Gespräche | 2-3 Tage |
| Support | 1-2 Tage |
| Rechnungen | 2-3 Tage |
| Einstellungen | 0.5-1 Tag |
| **GESAMT** | **6-9 Tage** |

**Statt:** 20-30 Tage bei allen 9 Modulen mit Over-Engineering

---

## Nächste Schritte

### Phase 1: Aufräumen (0.5 Tage)
1. `customer/pages/benutzer.html` löschen
2. `customer/pages/sicherheit.html` → `einstellungen.html` umbenennen
3. `customer/pages/statistiken.html` aus Sidebar entfernen (Datei behalten)
4. `customer/pages/termine.html` nach `/archive/` verschieben
5. `customer/pages/workflows.html` nach `/admin/pages/workflows.html` verschieben
6. `customer/pages/dokumentation.html` aus Sidebar entfernen (Datei behalten)

### Phase 2: Implementierung (6-9 Tage)
1. **Gespräche-Modul** (2-3 Tage) - Twilio Import + Audio-Player
2. **Support-Modul** (1-2 Tage) - Ticket-System
3. **Rechnungen-Modul** (2-3 Tage) - Stripe-Integration
4. **Einstellungen-Modul** (0.5-1 Tag) - Profil + Passwort

### Phase 3: Testing (1-2 Tage)
1. Alle Module durchklicken
2. Firebase Rules testen
3. E-Mail-Benachrichtigungen testen
4. Responsive Design prüfen

---

## Erfolgs-Kriterien

**MVP ist fertig, wenn:**
1. ✅ Kunde sieht echte Twilio-Gespräche
2. ✅ Kunde kann Support-Ticket erstellen
3. ✅ Kunde kann Rechnungen herunterladen
4. ✅ Kunde kann Passwort ändern
5. ✅ Dashboard zeigt echte KPIs (Gespräche, Tickets, Rechnung)

**= Kunde hat echten Mehrwert, keine SaaS-Illusion!**

---

**Ende des Audits. Bereit für Phase 1 (Aufräumen)?**
