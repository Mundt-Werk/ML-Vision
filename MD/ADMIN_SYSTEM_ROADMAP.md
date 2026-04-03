# ML Vision — Admin System Roadmap
# Admin-Backend → Vollständiges Betriebs-Tool für 2 Personen

> **Status:** In Entwicklung
> **Letzte Aktualisierung:** 19.03.2026
> **Aktueller Fortschritt:** Phase 4 — Tracking (Clarity + Analytics) (→ AKTIV)
> **Vorherige Phasen:** Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

---

## Anleitung für Claude

**Wenn du diese Datei ohne Kontext liest:**

1. Lies zuerst diesen Block komplett
2. Finde die aktuelle Phase — erkennbar am `→ AKTIV` Marker im Header
3. Finde die erste nicht abgehakte Aufgabe (`- [ ]`) in dieser Phase
4. Lies die relevanten Dateien bevor du arbeitest — nie aus dem Gedächtnis
5. Führe die Aufgabe aus
6. Markiere sie als erledigt (`- [x]`)
7. Wenn die Phase vollständig: Status-Block updaten, Phase als `✅` markieren
8. Aktualisiere "Letzte Aktualisierung" und "Aktueller Fortschritt" im Header

**Kontext ML Vision Admin:**
- Nur **2 Personen** haben Admin-Zugang (keine Mitarbeiter, keine Rollen-Komplexität)
- **Kundenbereich** (`customer/`) ist für Kunden — getrennt vom Admin
- Rollen: nur `admin` und `customer` — keine Erweiterung geplant
- Kein eigener Server — alles läuft über **Firebase** (Auth + Firestore + Storage)
- Automationen über **n8n** (Self-hosted: `https://n8n.vision-ml.de`)
- CRM + Email: **Brevo** (bereits im Pricing Calculator referenziert)

**Wichtige Dateien:**
```
admin/dashboard.html                  → Haupt-Dashboard (KPIs waren Fake-Daten → Phase 1 gefixt)
admin/pages/customers.html            → Kundenverwaltung (Firebase CRUD)
admin/pages/users.html                → Benutzerverwaltung (Admin + Kunden-Accounts)
admin/pages/tickets.html              → Support-Tickets (Messaging + File-Upload)
admin/pages/leads-bot.html            → Leads Bot (Google Places API)
admin/pages/pricing-calculator.html  → Preiskalkulator (Brevo bereits referenziert)
admin/pages/workflows.html            → Workflow-Monitor (aktuell statisch)
admin/pages/settings.html             → Einstellungen (Phase 1: Firebase-Persistenz gefixt)
assets/js/firebase-config.js          → Firebase Setup
assets/js/auth.js                     → Auth-Logik (login, logout, protectPage)
assets/js/dashboard.js                → Dashboard Init
assets/js/pricing-calculator.js       → Kalkulator-Logik
n8n/ML-Vision-Leads.json              → n8n Leads-Workflow
```

**Firebase-Konventionen:**
- Collections: `users`, `customers`, `tickets`, `tickets/{id}/messages`, `leads`, `lead_searches`, `system_settings`, `audit_logs`
- Secrets immer in `system_settings/config` speichern — nie im Code
- Storage: `tickets/{customerId}/{ticketId}/{timestamp}_{fileName}`

---

## Aktueller Status

```
Phase:        4 — Tracking (Clarity + Analytics)
Aufgabe:      4.1 — Microsoft Clarity einbinden
Blockiert:    Nein
Nächster Schritt: Clarity Account erstellen → clarity.microsoft.com → Projekt "ML Vision"
                  → Clarity ID in index.html + datenschutz.html einbinden
```

---

## Übersicht aller Phasen

| Phase | Titel | Status |
|-------|-------|--------|
| **1** | **Dashboard & Datenbasis** | ✅ |
| **2** | **Sicherheit & Compliance** | ✅ |
| **3** | **Brevo CRM Integration** | ✅ |
| **4** | **Tracking (Clarity + Analytics)** | → AKTIV |
| **5** | **UX & Mobile Polish** | 🔲 |
| **6** | **Pricing Calculator — Persistenz & PDF** | 🔲 |
| **7** | **Workflows-Seite — n8n Anbindung** | 🔲 |

---

## Phase 1: Dashboard & Datenbasis ✅

> **Ziel:** Kein einziger Fake-Datenwert mehr. Dashboard zeigt echte Echtzeit-Zahlen. Kritische Daten die bisher verloren gehen (Leads, Settings) werden in Firebase gespeichert.
> **Abgeschlossen:** 14.03.2026 — Code fertig, `firebase deploy --only functions` noch ausstehend

### 1.1 Dashboard KPIs — echte Firebase-Daten

- [x] `admin/dashboard.html` — alle hardcoded Zahlen identifiziert
- [x] Firestore `getCountFromServer()` für: `customers`, offene `tickets`, `leads`
- [x] Revenue-KPI vorerst ausgeblendet (zeigt '—') — braucht eigene Collection
- [x] Demo-Aktivitätseintrag "Analytics-Report" entfernt
- [x] System-Status-Karten mit echten Ping-Checks ersetzt:
  - Railway-Backend: `GET /api/health`
  - Firebase: Firestore-Read als Proxy-Test
  - n8n: `GET https://n8n.vision-ml.de/healthz`

### 1.2 Settings — Firebase-Persistenz

- [x] Firestore Collection `system_settings`, Dokument `config` angelegt
- [x] Beim Laden: `getDoc('system_settings/config')` → Felder vorausfüllen
- [x] Beim Speichern: `setDoc` mit `merge: true` statt `console.log`
- [x] Felder: `companyName`, `contactEmail`, `contactPhone`, `notificationLevel`, `notificationEmail`
- [x] Erfolgs-Modal nach Speichern

### 1.3 Leads Bot — Leads in Firestore speichern

- [x] Nach Search-Result: automatisch alle Leads in `leads` Collection speichern
- [x] Felder: `name`, `category`, `city`, `phone`, `website`, `rating`, `reviews`, `priority`, `searchQuery`, `searchDate`, `status: 'new'`, `source: 'leads-bot'`
- [x] Duplikat-Check via `phone` (Batch-Query)
- [x] Erfolgsmeldung: "X Leads gespeichert (Y Duplikate übersprungen)"
- [x] History-Tab: letzte 10 Suchanfragen aus `lead_searches` Collection

### 1.4 User-Deletion — Firestore deleteDoc (kostenlos, kein Server)

- [x] `admin/pages/users.html` — `deleteUser()` löscht Firestore-Doc `users/{uid}` via `deleteDoc()`
  - Kein Cloud Function, kein Railway — 100% kostenlos
  - Auth-Account bleibt technisch, aber ohne Firestore-Doc hat der User keine Rolle → kein Zugriff
  - `checkAuthState()` prüft Firestore-Doc; fehlt es → Redirect zu Login
- [x] `httpsCallable`-Import und `getFunctions`-Import aus `users.html` entfernt
- [ ] **Test:** User anlegen → löschen → Login-Versuch schlägt fehl ✓

### 1.5 Test & Validierung Phase 1

- [ ] Dashboard lädt ohne hardcoded Zahlen — KPIs zeigen echte Firestore-Daten
- [ ] Settings werden nach Browser-Reload korrekt geladen
- [ ] Leads Bot: nach Suche Leads in Firebase Console sichtbar
- [ ] User löschen → Login schlägt fehl

**Phase 1 abgeschlossen:** `[x]` ← Code fertig, manuelle Tests ausstehend (1.5)

---

## Phase 2: Sicherheit & Compliance ✅

> **Ziel:** Jede Admin-Aktion ist nachvollziehbar. Sessions haben ein Verfallsdatum. Firestore ist lückenlos abgesichert.
> **Warum wichtig:** Auch für 2 Personen gilt: ohne Audit-Trail ist das System nicht DSGVO-tauglich.

### 2.1 Audit Log

- [x] `assets/js/audit.js` erstellt: `logAction(action, entityType, entityId, details)` → schreibt in `audit_logs`
- [x] In `admin/pages/users.html` eingebunden: `user_created`, `user_deleted`
- [x] In `admin/pages/customers.html` eingebunden: `customer_created`, `customer_updated`, `customer_deleted`
- [x] In `admin/pages/tickets.html` eingebunden: `ticket_status_changed`, `ticket_reply_sent`
- [x] Audit-Log-Karte in `admin/pages/settings.html`: Tabelle Datum/Benutzer/Aktion/Bereich/Details, letzte 50 Einträge

### 2.2 Session Timeout

- [x] `assets/js/dashboard.js` — Inaktivitäts-Timer (25/30 Minuten)
- [x] Events die Timer zurücksetzen: `mousemove`, `keydown`, `click`, `touchstart`
- [x] Nach 25 Minuten: Warn-Modal mit 5-Minuten-Countdown + "Aktiv bleiben" Button
- [x] Nach 30 Minuten: `logout()` + Redirect zu `/public/login.html`

### 2.3 Firestore Security Rules — neue Collections absichern

- [x] `firestore.rules` ergänzt:
  - `sales_leads`: nur Admin (echte Kundenbasis)
  - `leads`: nur Admin
  - `lead_searches`: nur Admin
  - `system_settings`: nur Admin
  - `audit_logs`: Admin lesen + erstellen; update/delete verboten (unveränderlich)
  - `quotes`: nur Admin (vorbereitet für Phase 6)
- [x] `firebase deploy --only firestore:rules` — manuell in Firebase Console veröffentlicht 19.03.2026
- [ ] Test: mit Customer-Account `system_settings` lesen → muss fehlschlagen

### 2.4 Test & Validierung Phase 2

- [ ] Admin-Aktion (Kunde löschen) → Eintrag in `audit_logs` sichtbar
- [ ] Inaktivität simulieren → Warn-Modal erscheint nach 25 Min
- [ ] Customer-Account kann `leads` und `system_settings` nicht lesen

**Phase 2 abgeschlossen:** `[ ]`

---

## Phase 3: Brevo CRM Integration ✅

> **Ziel:** Jeder neue Lead und Kunde landet automatisch in Brevo. Ticket-Kommunikation läuft über Brevo Transactional Mails. Eine zentrale Pipeline zeigt den Status aller Leads.
> **Entscheidung Brevo:** Gratis bis 9.000 Mails/Monat, volle API, bereits im Pricing Calculator referenziert.
> **Abgeschlossen:** 19.03.2026 — alle 3 Webhooks getestet (PowerShell + Thunderbird-Eingang bestätigt)

### Datenfluss

```
Leads Bot (Firestore leads)
    └──▶ n8n Webhook ──▶ Brevo: Contact + Deal in Pipeline

Neuer Kunde (Firestore customers)
    └──▶ n8n Webhook ──▶ Brevo: Contact (Tag: "Kunde") + Welcome-Mail

Neues Ticket
    └──▶ n8n Webhook ──▶ Brevo: Transactional Mail (Bestätigung an Kunden)

Ticket geschlossen
    └──▶ n8n Webhook ──▶ Brevo: Feedback-Mail
```

### 3.1 Brevo vorbereiten

- [x] Brevo API Key holen → Brevo → Settings → API Keys
- [x] `admin/pages/settings.html` — Brevo-Karte: Felder `brevoApiKey`, `brevoListLeads`, `brevoListCustomers` + `saveBrevoSettings()`
- [x] **Manuell:** Brevo API Key holen → in Settings eintragen + speichern
- [x] **Manuell:** Brevo: Liste "ML Vision Leads" anlegen (ID 3)
- [x] **Manuell:** Brevo: Liste "ML Vision Kunden" anlegen (ID 4)
- [x] **Manuell:** Brevo: Deal-Pipeline: `Neuer Lead → Qualifiziert → Angebot gesendet → Kunde → Verloren` — erledigt 19.03.2026

### 3.2 n8n: Leads Bot → Brevo

- [x] `n8n/MLV-Lead-zu-Brevo.json` erstellt: Webhook-Trigger → Brevo Contact + Deal
- [x] `admin/pages/leads-bot.html` — nach Firestore-Save: Webhook für jeden neuen Lead (fire-and-forget)
- [x] **Manuell:** In n8n importiert, Brevo-Credential "Brevo account" eingetragen, aktiviert

### 3.3 n8n: Neuer Kunde → Brevo

- [x] `n8n/MLV-Kunde-zu-Brevo.json` erstellt: Webhook-Trigger → Brevo Contact + Welcome-Mail
- [x] `admin/pages/customers.html` — nach addDoc: Webhook für neuen Kunden (fire-and-forget)
- [x] **Manuell:** In n8n importiert, Brevo-Credential "Brevo account" eingetragen, aktiviert

### 3.4 n8n: Ticket-Mails

- [x] `n8n/MLV-Ticket-Mails.json` erstellt: Webhook → IF ticket_created/ticket_closed → Brevo Mail
- [x] `assets/js/support.js` — nach Ticket-Create: Webhook `ticket_created` (fire-and-forget)
- [x] `admin/pages/tickets.html` — nach Status `closed`: Webhook `ticket_closed` + Customer-Email aus Firestore
- [x] **Manuell:** In n8n importiert, Brevo-Credential "Brevo account" eingetragen, aktiviert

### 3.5 Test & Validierung Phase 3

- [x] Lead via Bot suchen → Brevo zeigt neuen Kontakt (PowerShell-Test erfolgreich)
- [x] Neuen Kunden anlegen → Welcome-Mail kommt an (Thunderbird-Eingang bestätigt)
- [x] Ticket erstellen → Bestätigungs-Mail kommt an (Thunderbird-Eingang bestätigt)
- [x] Ticket schließen → Feedback-Mail kommt an (PowerShell-Test erfolgreich)
- [ ] Gleiche Telefonnummer nochmal → kein doppelter Brevo-Kontakt (Brevo `updateEnabled: true` — technisch OK)

**Phase 3 abgeschlossen:** `[x]`

---

## Phase 4: Tracking (Clarity + Analytics) → AKTIV

> **Ziel:** Wir sehen wo Landingpage-Besucher abspringen und welche Aktionen im Admin häufig sind. Leads lassen sich zu ihrer Quelle zurückverfolgen.

### 4.1 Microsoft Clarity — Landingpage

- [ ] Clarity Account erstellen → clarity.microsoft.com → Projekt "ML Vision"
- [ ] Clarity ID notieren
- [ ] `index.html` — Clarity Script hinter Cookie-Consent-Check einbinden:
  ```javascript
  // Nur wenn analytics Cookie akzeptiert:
  if (cookieSettings.analytics) { /* Clarity laden */ }
  ```
- [ ] `assets/js/script.js` — bei Cookie-Einwilligung Clarity dynamisch initialisieren
- [ ] `public/datenschutz.html` — Clarity als Tracking-Tool erwähnen

### 4.2 Firebase Analytics — Custom Events

- [ ] Events definieren und `logEvent()` Calls einbauen:

  | Event | Datei | Parameter |
  |-------|-------|-----------|
  | `lead_search_executed` | leads-bot.html | `location`, `result_count` |
  | `lead_saved` | leads-bot.html | `lead_count` |
  | `customer_created` | customers.html | – |
  | `ticket_opened` | tickets.html | `priority` |
  | `ticket_closed` | tickets.html | – |
  | `pricing_quote_generated` | pricing-calculator.html | `bundle`, `total_eur` |

### 4.3 UTM-Tracking für Leads

- [ ] Kontaktformular (`index.html`): UTM-Parameter aus URL auslesen + im Firestore-Lead speichern
  - Felder: `utm_source`, `utm_medium`, `utm_campaign`
- [ ] Brevo-Tag nach Quelle setzen (z.B. Tag "utm_source=instagram")

### 4.4 Test & Validierung Phase 4

- [ ] Clarity: nach 24h Heatmap-Daten sichtbar
- [ ] Firebase Analytics DebugView: Custom Events erscheinen
- [ ] UTM-Parameter in Firestore-Lead-Dokument vorhanden

**Phase 4 abgeschlossen:** `[ ]`

---

## Phase 5: UX & Mobile Polish

> **Ziel:** Admin auf jedem Gerät nutzbar. Keine leeren weißen Seiten. Konsistentes Feedback nach Aktionen.

### 5.1 Pagination

- [ ] Einheitliche Pagination-Komponente `assets/js/components/Pagination.js`
  - Firestore `limit(25)` + `startAfter()` Cursor
  - "Weiter" / "Zurück" Buttons
- [ ] In `customers.html`, `users.html`, `tickets.html` einbinden

### 5.2 Konsistente Empty States

- [ ] CSS-Klasse `.empty-state` (Icon + Titel + Text + CTA) definieren
- [ ] `customers.html` — leere Liste → Empty State "Noch keine Kunden"
- [ ] `tickets.html` — keine Tickets → Empty State "Keine offenen Tickets"
- [ ] `leads-bot.html` — noch keine Suche → Onboarding-Hinweis

### 5.3 Mobile Tabellen

- [ ] Alle Tabellen-Wrapper: `overflow-x: auto` in `assets/css/utilities/responsive.css`
- [ ] Mobile (max-width: 768px): Rows als Cards — Name oben, Details darunter
- [ ] Touch-Targets: alle Buttons mind. 44px Höhe

### 5.4 Konsistentes Toast-System

- [ ] `assets/js/components/Toast.js` — einheitliche Toast-Komponente (Erfolg, Fehler, Info)
- [ ] Alle `alert()` Aufrufe im Admin auf Toast umstellen

### 5.5 Test & Validierung Phase 5

- [ ] 30+ Kunden: Pagination korrekt (25 pro Page)
- [ ] Leere Collections: Empty State mit CTA sichtbar
- [ ] iPhone Safari: Tabellen scrollbar, Sidebar funktioniert
- [ ] Kein nativer `alert()` mehr im Admin sichtbar

**Phase 5 abgeschlossen:** `[ ]`

---

## Phase 6: Pricing Calculator — Persistenz & PDF

> **Ziel:** Erstellte Angebote werden gespeichert und können als PDF exportiert werden.

### 6.1 Angebots-Persistenz

- [ ] Firestore Collection `quotes`:
  - Felder: `bundleId`, `inputs`, `result`, `totalEur`, `margin`, `customerPrice`, `createdAt`, `status` (draft/sent/accepted)
- [ ] "Angebot speichern" Button in `pricing-calculator.html`
- [ ] Sidebar-Liste der letzten 10 gespeicherten Angebote
- [ ] Angebot laden: `getDoc('quotes/{id}')` → Felder vorausfüllen

### 6.2 PDF-Export

- [ ] Print-CSS für Angebots-Layout (ML Vision Branding)
- [ ] "Als PDF exportieren" via `window.print()` — kein externes Package nötig
- [ ] PDF enthält: Bundle-Name, Leistungen, Kostenaufstellung, Kundenpreis, Gültigkeitsdatum

### 6.3 Angebot per Link teilen

- [ ] URL-Parameter: `?quote=QUOTE_ID` → Angebot aus Firestore laden
- [ ] "Link kopieren" Button

### 6.4 Test & Validierung Phase 6

- [ ] Angebot erstellen → speichern → Browser schließen → neu laden → Angebot da
- [ ] PDF-Export zeigt alle Posten korrekt
- [ ] Geteilter Link öffnet dasselbe Angebot

**Phase 6 abgeschlossen:** `[ ]`

---

## Phase 7: Workflows-Seite — n8n Anbindung

> **Ziel:** Die Workflows-Seite zeigt echte Daten aus n8n — keine statischen Demo-Karten mehr.

### 7.1 n8n API anbinden

- [ ] n8n API Key generieren: n8n → Settings → API Keys
- [ ] API Key in `system_settings/config` speichern
- [ ] `admin/pages/workflows.html` — echte Daten laden:
  - `GET https://n8n.vision-ml.de/api/v1/workflows` → Workflow-Liste
  - `GET https://n8n.vision-ml.de/api/v1/executions` → letzte Ausführungen
- [ ] Tabelle: Name, Status (aktiv/inaktiv), letzte Ausführung, Erfolgsrate
- [ ] Error-Log: letzte fehlgeschlagene Executions

### 7.2 Execution-Logging via Firestore

- [ ] n8n Workflows erweitern: bei jeder Ausführung Eintrag in `workflow_stats` schreiben
  - Felder: `workflowId`, `workflowName`, `status`, `executedAt`, `duration`
- [ ] Usage-Cards aus `workflow_stats` laden: Executions diesen Monat, Fehlerrate

### 7.3 Test & Validierung Phase 7

- [ ] Workflows-Seite zeigt echte n8n Workflow-Liste
- [ ] Manuelle n8n-Ausführung erscheint in Executions-Liste
- [ ] Fehlerhafte Execution erscheint im Error-Log

**Phase 7 abgeschlossen:** `[ ]`

---

## Änderungshistorie

| Datum | Änderung |
|-------|----------|
| 14.03.2026 | Roadmap erstellt auf Basis System-Analyse |
| 14.03.2026 | Phase 1 Code abgeschlossen (User-Deletion: kostenlos via Firestore deleteDoc statt Cloud Function) |
| 14.03.2026 | Phase 2 abgeschlossen: Audit Log, Session Timeout (25/30 Min), Firestore Security Rules |
| 19.03.2026 | Phase 3 abgeschlossen: 3 n8n Workflows (Leads/Kunden/Tickets) → Brevo, alle Tests bestanden |

---

## Offene Entscheidungen

```
[ ] PDF-Export: window.print() oder jsPDF?
    → window.print() bevorzugt (kein Package, kein Build)

[ ] Error Monitoring: Sentry einbinden?
    → Sentry Free: 5.000 Errors/Monat, 1 Script-Tag
    → Entscheidung ausstehend
```
