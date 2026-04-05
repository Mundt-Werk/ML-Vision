# KVA-Generator — Implementierungsplan
> **Erstellt:** März 2026 | **Status:** In Planung
> **Ziel:** Leon kann autark einen Kostenvoranschlag für jeden Kunden erstellen

---

## Übersicht: Der Flow

```
admin/pages/customers.html (Kundenprofil)
    └── [📄 KVA erstellen] Button (in Detail-Ansicht)
            └── admin/angebote/kva-form.html
                (Kundendaten via URL-Parameter vorausgefüllt)
                    ├── [📩 Kundenanfrage generieren]
                    │       └── Fertiger Nachrichtentext für Leon
                    │           (E-Mail / WhatsApp an Kunden)
                    └── [📄 KVA generieren]
                            └── admin/angebote/kva-output.html
                                (druckbarer KVA mit 3 Optionen)
```

---

## Phase 1 — Button im Kundenprofil

**Datei:** `admin/pages/customers.html`

- [ ] Button "KVA erstellen" in der Detail-Ansicht hinzufügen
  - Position: neben "Bearbeiten" und "Rechnung hochladen"
  - Farbe: Lila/Gradient (abgrenzend von grünem Rechnungs-Button)
  - Funktion: öffnet `admin/angebote/kva-form.html` mit URL-Parametern:
    ```
    kva-form.html?customerId=K-xxx&companyName=...&contact=...&email=...&phone=...&website=...
    ```

---

## Phase 2 — KVA-Formular

**Datei:** `admin/angebote/kva-form.html` (neu erstellen)

### Design
- Gleiches Dark-Theme wie restliches Admin-Panel
- Sidebar mit Navigation (zurück zu Kunden)
- Kundendaten oben als Read-only Info-Box (vorausgefüllt aus URL-Parametern)
- Formular in Sektionen mit Fortschrittsanzeige

### Sektion A — Produkt *(Pflicht)*

| Feld | Typ | Pflicht |
|------|-----|---------|
| Gewünschtes Produkt | Checkboxen (Mehrfachauswahl) | ✅ |
| → Telefon-Assistent | Checkbox | |
| → Chatbot (Website) | Checkbox | |
| → E-Mail-Sortierung | Checkbox | |
| → Terminbuchung | Checkbox | |
| → Kombination/Sonstiges | Checkbox + Freitext | |

**Wenn Telefon-Assistent gewählt → Sektion B erscheint (dynamisch)**

### Sektion B — Telefonie *(Pflicht wenn Telefon-Assistent)*

| Feld | Typ | Pflicht |
|------|-----|---------|
| Nummernmodell | Radio: "Eigene Nummer + Weiterleitung" / "Neue Twilio-Nummer" | ✅ |
| Telefonanbieter | Dropdown + Freitext (PŸUR, Telekom, Vodafone, VoIP, Sipgate, andere) | wenn eigene Nr. |
| Anrufweiterleitung möglich? | Radio: Ja / Nein / Unbekannt | wenn eigene Nr. |
| IT-Servicepartner vorhanden? | Radio: Ja / Nein | |
| Was soll der Bot tun? | Checkboxen: Reservierung / Terminbuchung / FAQ / Weiterleiten / Stornierung / Sonstiges | ✅ |
| Sprache(n) des Bots | Checkboxen: Deutsch / Englisch / Andere | ✅ |

### Sektion C — Anrufvolumen *(für Kalkulation)*

| Feld | Typ | Pflicht |
|------|-----|---------|
| Anrufe/Tag Wochentage | Zahl (Slider + Input) | ✅ |
| Anrufe/Tag Wochenende | Zahl (Slider + Input) | ✅ |
| Arbeitstage/Monat Wochentage | Zahl (Default: 22) | ✅ |
| Wochenend-Tage/Monat | Zahl (Default: 8) | ✅ |
| Ø Gesprächsdauer | Dropdown: 1 Min / 2 Min / 3 Min / 5 Min | ✅ |
| Peak-Zeiten | Freitext | |
| Besonderheiten (Events, Saison) | Freitext | |

> ⚠️ Hinweis im Formular: "Kundenangaben zur Gesprächsdauer sind oft zu niedrig — reale Dauer durch Bot-Logik oft 2× länger. Bitte realistisch schätzen!"

**Live-Anzeige:** Berechnete Gesamt-Minuten/Monat wird beim Eingeben angezeigt:
```
→ Geschätzte Anrufe/Monat: 1.125
→ Geschätzte Minuten/Monat: 2.250
```

### Sektion D — Systemintegration

| Feld | Typ | Pflicht |
|------|-----|---------|
| CRM/Reservierungssystem | Text (z.B. Atavolo, Calendly, keine) | wenn Reservierung/Termin |
| CRM-Version | Text | |
| API-Zugang vorhanden? | Radio: Ja / Nein / Unbekannt | |
| E-Mail-Bestätigung gewünscht? | Radio: Ja / Nein | |
| Brevo/Mailsystem vorhanden? | Text | |

### Sektion E — Standort & Vor-Ort

| Feld | Typ | Pflicht |
|------|-----|---------|
| Standort / Stadt | Text | ✅ |
| PLZ (für Entfernungsberechnung) | Zahl | |
| Vor-Ort-Termin gewünscht? | Radio: Ja / Nein / Vielleicht | |
| Remote-Setup akzeptiert? | Radio: Ja / Nein | |

### Sektion F — Budget & Sonstiges

| Feld | Typ | Pflicht |
|------|-----|---------|
| Budgetrahmen Einmalig | Dropdown: <500 / 500-1500 / 1500-3000 / >3000 / keine Angabe | |
| Budgetrahmen Monatlich | Dropdown: <200 / 200-500 / 500-1000 / >1000 / keine Angabe | |
| Entscheider (wer unterschreibt) | Text | |
| Angebotsempfänger (Name) | Text (vorausgefüllt aus Kundendaten) | ✅ |
| Angebotsempfänger (E-Mail) | E-Mail (vorausgefüllt) | ✅ |
| Angebotsgültig bis | Datum (Default: heute + 30 Tage) | ✅ |
| Interne Notizen für KVA | Textarea | |

---

## Phase 3a — "Kundenanfrage generieren"

**Button:** "📩 Kundenanfrage erstellen" (sichtbar immer, auch wenn Formular unvollständig)

**Logik:** Schaut welche Felder noch leer sind → generiert daraus eine professionelle Anfrage-Nachricht.

### Ausgabe-Modal mit:
- Betreffzeile (kopierbar)
- Nachrichtentext (kopierbar)
- Toggle: E-Mail-Stil / WhatsApp-Stil (WhatsApp = kürzer, lockerer)

### Beispiel E-Mail-Stil:
```
Betreff: Kurze Rückfragen für Ihr Angebot – [Firmenname]

Hallo [Ansprechpartner],

vielen Dank für Ihr Interesse an unserem KI-Telefonassistenten.
Um Ihnen ein passgenaues Angebot erstellen zu können, benötigen wir
noch ein paar kurze Informationen:

📞 Telefonie:
• Welchen Telefonanbieter nutzen Sie aktuell? (z.B. Telekom, Vodafone, PŸUR)
• Ist bei Ihnen eine Anrufweiterleitung einrichtbar?

📊 Anrufvolumen:
• Wie viele Anrufe erhalten Sie ungefähr pro Tag (Wochentag / Wochenende)?
• Wie lange dauert ein typisches Gespräch bei Ihnen?

🔧 System:
• Welches Reservierungs- / CRM-System nutzen Sie?
• Gibt es eine API oder einen Integrationspartner?

Diese Infos helfen uns, Ihnen ein realistisches und faires Angebot
zu erstellen — das dauert für Sie nur ca. 5 Minuten.

Viele Grüße
[Leon / ML Vision]
```

### Beispiel WhatsApp-Stil:
```
Hey [Name] 👋

für dein Angebot brauche ich noch kurz ein paar Infos:

1. Welchen Telefonanbieter nutzt ihr? (Telekom, Vodafone, PŸUR, andere?)
2. Ungefähr wie viele Anrufe pro Tag? (Wochentag / Wochenende getrennt)
3. Wie lang ist so ein Gespräch bei euch im Schnitt?
4. Welches System nutzt ihr für Reservierungen / Termine?

Dauert nur 5 Min — dann kann ich euch was Konkretes schicken 🙌

Grüße, Leon
```

---

## Phase 3b — "KVA generieren"

**Button:** "📄 KVA generieren" (nur aktiv wenn Pflichtfelder ausgefüllt)

### Kalkulations-Logik (JavaScript, client-side)

```
Anrufe/Monat = (Anrufe_Wochentag × Arbeitstage) + (Anrufe_Wochenende × WE-Tage)
Minuten/Monat = Anrufe/Monat × Ø_Gesprächsdauer

Kosten je nach Option:
  Option 1 (Basis):    Twilio + OpenAI → ca. €X/Min
  Option 2 (Standard): ElevenLabs ConvAI + Twilio → $0.10/Min + $0.0085/Min
  Option 3 (Premium):  Vapi + Cartesia + Deepgram + Twilio → $0.05+$0.0077+.../Min

Preisberechnung:
  EK/Monat = Tech-Kosten + Support (1-2h × €70)
  VK/Monat = EK × Faktor (je Option: 4-5×) + gerundet auf €X90 oder €X90

Setup:
  Stunden × €70 (intern) = EK
  VK = EK × 1.5 + Puffer
```

### KVA-Output (`admin/angebote/kva-output.html`)

**Aufbau des generierten KVA:**
1. Header: ML Vision Logo, Kundendaten, Datum, Angebotsnummer
2. Einleitung (generierter Text basierend auf Produkt-Auswahl)
3. Leistungsumfang (Was ist inklusive / nicht inklusive)
4. 3 Optionen nebeneinander (Basis / Standard ⭐ / Premium)
5. Preistabelle (Netto + MwSt + Brutto)
6. Technische Voraussetzungen
7. Klauseln (Gültigkeit, Zahlung, Kündigung, Technischer Vorbehalt, Drittanbieter)
8. Unterschriftszeile

**Interner Toggle (nur für Leon sichtbar):**
- "🔒 Interne Kalkulation anzeigen" → zeigt EK-Tabelle + Margen

**Aktionen:**
- 🖨️ Drucken / Als PDF speichern
- 📧 Begleitmail generieren (analog zu Stufe 3a, aber für fertiges Angebot)
- Zurück zum Formular (zum Anpassen)

---

## Dateien die erstellt / geändert werden

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `admin/pages/customers.html` | Ändern | Button "KVA erstellen" in Detail-Ansicht |
| `admin/angebote/kva-form.html` | Neu | KVA-Formular mit allen Sektionen |
| `admin/angebote/kva-output.html` | Neu | Druckbarer KVA-Output |
| `assets/css/pages/kva.css` | Neu | Styles für KVA-Formular + Output |
| `assets/js/kva-calculator.js` | Neu | Kalkulations-Logik + Textgenerator |

---

## Reihenfolge der Umsetzung

- [ ] **Schritt 1:** Button in customers.html + URL-Parameter-Übergabe
- [ ] **Schritt 2:** `kva-form.html` Grundstruktur + Design (Dark Theme, Sidebar)
- [ ] **Schritt 3:** Alle Formular-Sektionen A–F implementieren
- [ ] **Schritt 4:** Live-Kalkulation der Minuten beim Eingeben
- [ ] **Schritt 5:** "Kundenanfrage generieren" → Modal mit kopierbarem Text (E-Mail + WhatsApp)
- [ ] **Schritt 6:** `kva-calculator.js` — Kalkulations-Logik für alle 3 Optionen
- [ ] **Schritt 7:** `kva-output.html` — druckbarer KVA mit 3 Optionen
- [ ] **Schritt 8:** Interne Kalkulations-Toggle
- [ ] **Schritt 9:** Begleitmail-Generator für fertiges Angebot
- [ ] **Schritt 10:** Testen mit DONNA-Daten als Referenz

---

## Entscheidungen

- [x] **Firebase-Speicherung:** Ja — KVAs werden in Firestore gespeichert (Collection: `quotes`)
  - Felder: customerId, customerNumber, companyName, formData, calculatedPrices, status, createdAt, createdBy
  - Status-Flow: `draft` → `sent` → `accepted` / `rejected`
- [x] **Preise manuell anpassbar:** Ja — nach automatischer Kalkulation kann Leon jeden Preis überschreiben
  - Input-Felder sind vorausgefüllt aber editierbar
  - Abweichung von Kalkulation wird farblich markiert (zu niedrig = rot, OK = grün)
- [ ] Soll es eine KVA-Übersichtsseite geben? (alle erstellten Angebote je Kunde)
- [ ] Sevdesk-Integration: KVA direkt in Sevdesk anlegen? (aktuell kein API-Zugriff)
- [ ] Angebotsnummern-Format? (z.B. KVA-2026-001)

---

*Erstellt: März 2026 | Basis: DONNA-KVA Erfahrung + MD/TOOLS_PREISLISTE.md*
