# ML Vision — Automatisierter Präsentations-Personalizer
## Projektdokumentation & Umsetzungsplan

---

## 📌 Die Idee

Ein potenzieller Kunde landet auf der ML Vision Website und klickt auf einen Call-to-Action Button.  
Statt einer generischen Kontaktseite bekommt er ein kurzes, intelligentes Formular — **5 Felder, 60 Sekunden, fertig**.

Danach passiert folgendes automatisch:

1. Seine Eingaben fließen in einen **n8n Workflow**
2. n8n sendet die Daten an **Gamma.app**
3. Gamma generiert eine **individuell zugeschnittene Präsentation** — z.B. für einen Handwerker: Welche Prozesse können automatisiert werden, was kostet das ungefähr, welche Tools kommen zum Einsatz
4. Die fertige Präsentation geht **per Mail direkt an den Kunden**
5. Gleichzeitig wird der Lead in **HubSpot** angelegt
6. Marco und Leon bekommen eine **Slack/Telegram-Benachrichtigung**

**Ergebnis:**  
Der Kunde erhält innerhalb von Minuten eine professionelle, auf ihn zugeschnittene Präsentation — noch bevor ein einziges persönliches Gespräch stattgefunden hat.  
ML Vision demonstriert damit gleichzeitig **live was Automatisierung kann** — der Prozess selbst ist das Produkt.

---

## 🎯 Warum das funktioniert

| Für den Kunden | Für ML Vision |
|---|---|
| Bekommt sofort konkreten Mehrwert | Qualifizierter Lead mit echten Daten |
| Sieht Automatisierung in Aktion | Kein manueller Aufwand pro Lead |
| Keine generische Pitch-Folie | Personalisierter Gesprächseinstieg |
| Fühlt sich verstanden | HubSpot-Eintrag vollautomatisch |
| Kostenlos & ohne Risiko | Gamma-Präsentation = hohe Qualität |

> **Das System verkauft Automatisierung — indem es selbst automatisiert. Das ist der eigentliche Pitch.**

---

## 🛠️ Technologie-Stack

| Komponente | Tool | Zweck |
|---|---|---|
| Frontend-Formular | HTML / CSS / JS | Einbindung auf ML Vision Website |
| Workflow-Engine | n8n (Hostinger VPS) | Orchestrierung des gesamten Flows |
| Präsentation | Gamma.app | KI-generierte Slides, hochwertig |
| CRM | HubSpot | Lead-Anlage, Pipeline-Einstieg |
| E-Mail-Versand | Brevo | Präsentation an den Kunden senden |
| Benachrichtigung | Telegram / Slack | Marco + Leon informieren |

---

## 🔍 Gamma.app — Die technische Herausforderung

Gamma bietet **keine öffentliche API**. Das bedeutet: Wir müssen die internen API-Calls, die Gamma beim Erstellen einer Präsentation macht, **reverse-engineeren**.

Dieses Vorgehen ist bekannt aus dem Projekt **Nonna Di Mia** (Atavolo / Butter.place) — dort haben wir auf dieselbe Weise eine geschlossene Reservierungsplattform via n8n angebunden.

### Vorgehensweise

**Schritt 1 — Network Analysis**
- Marco loggt sich bei Gamma ein
- DevTools öffnen → Network Tab → Filter: `Fetch/XHR`
- Eine neue KI-Präsentation manuell erstellen
- Alle Requests mitschneiden

**Schritt 2 — Relevante Endpoints identifizieren**

Wir suchen gezielt nach:
- `POST /generate` oder ähnlich — der initiale Erstellungs-Request
- Auth-Mechanismus — Bearer Token? Session Cookie? OAuth?
- Payload-Struktur — wie werden Prompt/Kontext übergeben?
- Response-Format — kommt eine URL zurück? Ein Präsentations-Objekt?

**Schritt 3 — Session & Auth verstehen**

Mögliche Szenarien:
- **Bearer Token** im Authorization-Header → in n8n als HTTP Header speicherbar
- **Session Cookie** → komplexer, aber handhabbar via Cookie-Weitergabe
- **CSRF Token** → müsste vor jedem Request neu abgerufen werden

**Schritt 4 — n8n HTTP Request Node bauen**

Sobald die Struktur klar ist, bauen wir in n8n:
```
HTTP Request Node
  Method: POST
  URL: [Gamma interner Endpoint]
  Headers:
    Authorization: Bearer {{$credentials.gamma_token}}
    Content-Type: application/json
  Body:
    prompt: [generiert aus Formular-Daten]
    template: [ML Vision Branding Template]
```

**Schritt 5 — Präsentations-URL abfangen**

Gamma gibt nach der Generierung vermutlich eine URL zur fertigen Präsentation zurück.  
Diese URL wird dann in die Brevo-Mail eingebunden.

---

## 📋 Das Formular — Felder & Logik

### Felder (maximal 5 für hohe Conversion)

| # | Feld | Typ | Zweck |
|---|---|---|---|
| 1 | Vorname | Text | Personalisierung der Präsentation |
| 2 | E-Mail | E-Mail | Pflichtfeld — Zustellung |
| 3 | Branche | Dropdown | Kernvariable für GPT-Kontext |
| 4 | Unternehmensgröße | Dropdown | Skalierung der Empfehlungen |
| 5 | Größte Zeitfresser | Mehrfachauswahl | Konkrete Automatisierungsansätze |

### Dropdown: Branche
- Handwerk (Elektriker, Sanitär, Maler, etc.)
- Gastronomie & Hotellerie
- Einzelhandel & E-Commerce
- Beratung & Dienstleistung
- Gesundheit & Praxis
- Immobilien
- Sonstige

### Dropdown: Unternehmensgröße
- Solo / 1 Person
- 2–5 Mitarbeiter
- 6–20 Mitarbeiter
- 21–50 Mitarbeiter
- 50+ Mitarbeiter

### Mehrfachauswahl: Zeitfresser
- Terminplanung & Kalender
- Kundenanfragen & Support
- Angebote & Rechnungen schreiben
- Lead-Nachverfolgung
- Social Media & Content
- Buchhaltung & Controlling
- Bestellungen & Logistik

---

## 🔄 n8n Workflow — Node für Node

```
┌─────────────────────────────────────────────┐
│           TRIGGER: Webhook                  │
│  POST /webhook/gamma-lead                   │
│  Empfängt Formular-Daten                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         NODE 1: Daten validieren            │
│  - Pflichtfelder prüfen (Name, Mail)        │
│  - Zeitstempel hinzufügen                   │
│  - Lead-ID generieren                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         NODE 2: Prompt aufbauen             │
│  - Branchen-spezifischen Kontext setzen     │
│  - Zeitfresser zu Use Cases mappen          │
│  - Präsentations-Prompt formulieren         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         NODE 3: Gamma API Call              │
│  - HTTP Request an Gamma Endpoint           │
│  - Auth Header mitschicken                  │
│  - Prompt + Template übergeben              │
│  - Präsentations-URL empfangen              │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
┌─────────────────┐  ┌──────────────────────┐
│  NODE 4a:       │  │  NODE 4b:            │
│  HubSpot        │  │  Brevo Mail          │
│  Lead anlegen   │  │  an Kunden senden    │
│  Deal erstellen │  │  mit Gamma-Link      │
└────────┬────────┘  └──────────┬───────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
┌─────────────────────────────────────────────┐
│         NODE 5: Notification                │
│  Telegram/Slack an Marco + Leon             │
│  "Neuer Lead: [Name], [Branche]"            │
│  + Link zur Präsentation                    │
│  + Link zum HubSpot Deal                   │
└─────────────────────────────────────────────┘
```

---

## 📧 Die Kunden-Mail (Brevo)

**Betreff:** `[Vorname], deine persönliche Automatisierungs-Analyse ist fertig`

**Inhalt:**
- Persönliche Ansprache
- Kurze Erklärung was die Präsentation enthält
- **CTA-Button → Präsentation öffnen** (Gamma-Link)
- Hinweis: "Diese Analyse wurde vollautomatisch für dich erstellt — das ist nur ein kleines Beispiel für das was wir für dein Business tun können"
- Kontakt-Optionen: Kalender-Link, Telefon, Mail

> Der Mail-Text selbst ist bereits Teil des Verkaufsprozesses — er macht deutlich, dass diese Automatisierung eben genau das ist, was ML Vision verkauft.

---

## 📊 HubSpot — Lead-Struktur

**Contact-Properties (automatisch befüllt):**
- Vorname, E-Mail
- Lead Source: `Website — Gamma Präsentations-Flow`
- Branche (Custom Property)
- Unternehmensgröße (Custom Property)
- Zeitfresser (Custom Property, Multi-Select)
- Datum des Leads

**Deal erstellen:**
- Pipeline: `Aquamentum – Sales Pipeline V1` (oder ML Vision Pipeline, falls separate)
- Stage: `Neuer Lead / Eingehend`
- Deal Name: `[Vorname] — [Branche] — Gamma Lead`

---

## 🔔 Notification — Marco & Leon

**Telegram Bot** (@schichtplan_mundtwerk_bot oder neuer dedizierter Bot):

```
🚀 Neuer Gamma Lead!

👤 Name: Max Mustermann
🏢 Branche: Handwerk
👥 Größe: 2–5 Mitarbeiter
⏱️ Zeitfresser: Terminplanung, Angebote schreiben

🎯 Präsentation: [Gamma Link]
💼 HubSpot Deal: [Deal Link]
```

---

## 📅 Roadmap — Schritt für Schritt

> Jeder Punkt ist ein einzelnes, abgeschlossenes Feature.
> Nie mehrere auf einmal. Immer einen Haken machen, dann erst weiter.

---

### Phase 1 — Gamma Reverse Engineering

- [ ] Chrome DevTools öffnen → Network Tab → Filter: Fetch/XHR
- [ ] Gamma öffnen, einloggen, neue KI-Präsentation manuell starten
- [ ] Alle Requests während der Generierung aufzeichnen
- [ ] Den POST-Request für die Generierung identifizieren
- [ ] Auth-Header (Bearer Token / Cookie) aus dem Request kopieren
- [ ] Payload-Struktur des POST-Requests dokumentieren
- [ ] Response-Format analysieren (URL? Präsentations-ID? Objekt?)
- [ ] Token-Ablaufzeit testen (wie lange ist der Token gültig?)
- [ ] Ersten manuellen Test-Request via curl oder Postman senden
- [ ] Ersten Test-Request erfolgreich aus n8n (HTTP Request Node) senden

---

### Phase 2a — n8n Webhook & Validierung

- [ ] n8n Webhook Node anlegen (POST /webhook/gamma-lead)
- [ ] Webhook URL notieren und mit Postman testen
- [ ] Validierungs-Node: Pflichtfelder Name + E-Mail prüfen
- [ ] Validierungs-Node: Zeitstempel hinzufügen
- [ ] Validierungs-Node: Lead-ID generieren (UUID)

---

### Phase 2b — Prompt-Builder

- [ ] Branchen-Mapping Tabelle anlegen (Branche → Kontext-Text)
- [ ] Zeitfresser-Mapping anlegen (Checkbox-Auswahl → Use Cases)
- [ ] Prompt-Template schreiben (statischer Text mit Variablen)
- [ ] Prompt in n8n Set-Node zusammenbauen und Ausgabe prüfen

---

### Phase 2c — Gamma Node in n8n

- [ ] Gamma HTTP Request Node anlegen
- [ ] Auth-Credentials in n8n hinterlegen (Token / Cookie)
- [ ] Prompt + Template an Gamma-Endpoint übergeben
- [ ] Präsentations-URL aus der Response extrahieren
- [ ] Erfolgreichen Durchlauf Webhook → Gamma-URL testen

---

### Phase 2d — HubSpot Node

- [ ] HubSpot API Key / OAuth in n8n einrichten
- [ ] Custom Properties in HubSpot anlegen (Branche, Größe, Zeitfresser)
- [ ] Contact anlegen (Vorname, Mail, alle Custom Properties)
- [ ] Deal anlegen (Name-Format, Pipeline, Stage: "Neuer Lead")
- [ ] HubSpot Deal-Link aus Response extrahieren für Notification

---

### Phase 2e — Brevo Mail

- [ ] Brevo ML Vision Account einrichten / API Key holen
- [ ] Mail-Template in Brevo erstellen (HTML, mit Gamma-Link-Placeholder)
- [ ] Brevo Node in n8n konfigurieren
- [ ] Gamma-Link dynamisch in Mail einfügen
- [ ] Test-Mail versenden und auf Zustellung + Darstellung prüfen

---

### Phase 2f — Telegram Notification

- [ ] Telegram Bot anlegen (oder bestehenden Bot verwenden)
- [ ] Bot Token in n8n hinterlegen
- [ ] Telegram Node mit Nachrichtenformat konfigurieren
- [ ] Test-Nachricht mit Name, Branche, Gamma-Link, HubSpot-Link senden

---

### Phase 3 — Frontend Formular

- [ ] HTML-Grundstruktur des Formulars erstellen
- [ ] Feld 1: Vorname (Text-Input)
- [ ] Feld 2: E-Mail (Email-Input)
- [ ] Feld 3: Branche (Dropdown, 7 Optionen)
- [ ] Feld 4: Unternehmensgröße (Dropdown, 5 Optionen)
- [ ] Feld 5: Zeitfresser (Mehrfachauswahl, 7 Optionen)
- [ ] DSGVO-Hinweis + Pflicht-Checkbox einfügen
- [ ] CSS-Styling nach ML Vision Branding
- [ ] Submit-Button + Loading-Spinner während Absenden
- [ ] Erfolgs-Meldung nach erfolgreichem Absenden
- [ ] Fehler-Meldung bei fehlenden Pflichtfeldern
- [ ] Formular per JS fetch an Webhook-URL anbinden
- [ ] Formular auf Website einbinden (CTA-Button ersetzt)

---

### Phase 4 — Testing

- [ ] End-to-End Test: Handwerk / Solo / Zeitfresser: Terminplanung
- [ ] End-to-End Test mit zweitem Profil (z.B. Gastronomie / 6–20 MA)
- [ ] Präsentations-Qualität beider Tests bewerten
- [ ] Mail-Zustellung prüfen (Spam-Ordner? Formatierung? Links klickbar?)
- [ ] HubSpot Contact + Deal prüfen (alle Felder korrekt?)
- [ ] Telegram-Nachricht prüfen (alle Links vorhanden?)

---

### Phase 5 — Go Live

- [ ] Webhook URL auf Produktions-VPS umstellen
- [ ] Gamma Token auf Prod-Account setzen
- [ ] n8n Workflow aktivieren (aus Test-Modus raus)
- [ ] Formular live schalten auf Website
- [ ] n8n Error-Alert / Monitoring einrichten
- [ ] Ersten echten Lead abwarten und vollständig prüfen

---

## ⚡ Wichtige Hinweise & Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Gamma ändert interne API | Mittel | Session-Token regelmäßig erneuern, Monitoring |
| Auth-Token läuft ab | Hoch | Auto-Refresh-Logik in n8n bauen |
| Gamma Rate Limiting | Niedrig | Queue in n8n, max. 1 Request/Minute |
| Präsentations-Qualität variiert | Mittel | Prompt-Optimierung, Template festlegen |
| DSGVO (Kundendaten) | Zu beachten | Datenschutzhinweis im Formular, Brevo EU |

---

## 🗒️ Offene Fragen

1. **Gamma Account** — Welcher Plan ist aktiv? Gibt es ein Limit für KI-Generierungen?
2. **Template** — Wollen wir ein ML Vision Branded Template in Gamma als Basis?
3. **Sprache** — Präsentation immer auf Deutsch?
4. **ML Vision Pipeline in HubSpot** — Separat von Aquamentum oder gleiche Pipeline?
5. **Brevo** — Ist der ML Vision Account dort schon eingerichtet?

---

*Erstellt: März 2026 | ML Vision — Marco & Leon*

---

## 📓 Tagebuch — Was wurde wann gemacht?

> Hier wird nach jedem abgeschlossenen Schritt eingetragen was gemacht wurde.
> Ziel: Mit null Kontext reinlesen und sofort wissen wo man steht.
> Format: `[DATUM] — Was wurde gemacht. Was funktioniert. Was offen ist.`

---

<!-- EINTRÄGE AB HIER — neueste oben -->

**[2026-03-09] — Projektdoku erstellt**
- Workflow-Konzept vollständig dokumentiert (Idee, Stack, Formular, n8n Flow, HubSpot, Brevo, Telegram)
- Roadmap in atomare Einzelschritte aufgeteilt (Phase 1–5)
- Tagebuch-Sektion angelegt
- Status: Noch kein einziger technischer Schritt umgesetzt — Phase 1 (Gamma Reverse Engineering) ist der nächste Schritt
