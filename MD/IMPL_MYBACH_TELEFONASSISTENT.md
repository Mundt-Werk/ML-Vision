# Implementierungsplan — KI-Telefonassistent
## Mybach & Co Immobilien GmbH | Option 2: ElevenLabs ConvAI + Twilio

> **KVA:** KVA-20260324-990 | **Kunde:** Thomas Mybach | **Entschieden:** Option 2 Standard
> **Ziel:** Terminbuchung + FAQ beantworten, ~30 Calls/Mo, Ø 2 Min, 120 Min/Mo inkl.
> **Stack:** ElevenLabs ConvAI + n8n + Twilio
> **Status:** Phase 1 läuft

> **Reihenfolge geändert (03.04.2026):**
> ElevenLabs Agent erst vollständig fertigstellen & testen → dann n8n → dann Twilio.
> Vorteil: Agent kann direkt in ElevenLabs günstig getestet und optimiert werden, bevor Twilio-Kosten entstehen.

---

## PHASE 1 — ElevenLabs Account & Agent einrichten

### 1.1 Account
- [x] ElevenLabs Account anlegen: mybach@vision-ml.de (Creator Plan, $22/Mo, 250 Min)
- [x] Zahlungsmethode hinterlegen (Leon Schauerte)
- [ ] USt-ID nachtragen sobald ML Vision Steuernummer hat (Reverse Charge)

### 1.2 Agent anlegen
- [x] Agent erstellt: `Mybach & Co Immobilien – Telefonassistent`
- [x] Template: Property Management (als Basis)
- [x] Sprache: Deutsch
- [x] System-Prompt: Grundversion eingetragen
- [x] Erste Nachricht: Deutsch, mit DSGVO-Hinweis
- [ ] **Stimme auswählen** → Rückfrage an Mybach: männlich oder weiblich?

---

## PHASE 2 — Agent vollständig konfigurieren & testen

### 2.1 System-Prompt ausarbeiten
- [ ] Konversationsfluss Schritt für Schritt definieren:
  - Begrüßung (mit KI-Hinweis + DSGVO)
  - Anliegen erfassen
  - Bei Terminanfrage: Daten abfragen (Name, Telefon, E-Mail, Terminart, Datum/Uhrzeit, Anliegen)
  - Bei FAQ: antworten
  - Bei komplexen Fragen: Rückruf ankündigen + Nummer aufnehmen
  - Abschluss
- [ ] Umgang mit unklaren Antworten definieren
- [ ] Umgang mit aggressiven / verwirrten Anrufern
- [ ] Umgang mit Stille / kein Input

### 2.2 Terminarten klären (Rückfrage Mybach)
- [ ] Welche Terminarten nimmt der Bot an? (Besichtigung / Erstgespräch / Beratung?)
- [ ] Was passiert nach der Terminaufnahme? (E-Mail an Büro / CRM / Kalender?)

### 2.3 FAQ einpflegen (Rückfrage Mybach)
- [ ] FAQ-Liste von Mybach anfordern
- [ ] Als Wissensdatenbank in ElevenLabs hochladen
- [ ] Firmeninfos hinterlegen (Adresse, Website, Öffnungszeiten, Team)

### 2.4 Stimme konfigurieren
- [ ] Deutsche Stimme auswählen (Voice Library testen)
- [ ] Mit Mybach abstimmen: männlich oder weiblich
- [ ] Name des Assistenten für Begrüßung klären

### 2.5 Sicherheitseinstellungen
- [ ] Max. Gesprächsdauer: 8 Minuten (Schutz vor Minutenklau)
- [ ] Gesperrte Themen: Preisverhandlungen, Vertragskonditionen, Immobilienwerte
- [ ] Profanity Filter aktivieren
- [ ] Silence Timeout konfigurieren
- [ ] Conversation History Retention auf Minimum setzen (DSGVO)
- [ ] Audio-Recording prüfen → ggf. deaktivieren

### 2.6 Testen in ElevenLabs
- [ ] Interner Testanruf über ElevenLabs Vorschau
- [ ] Begrüßung korrekt?
- [ ] Terminerfassung vollständig & natürlich?
- [ ] Fallback funktioniert?
- [ ] Edge Cases: kurze Anrufe, Stille, unklare Anfragen, Dialekte
- [ ] Prompt anpassen nach Testergebnis (mehrere Iterationen)
- [ ] Demo-Anruf mit Mybach zur Stimmen-/Qualitätsabnahme

---

## PHASE 3 — n8n Workflow einrichten

### 3.1 Webhook vorbereiten
- [ ] n8n Instanz prüfen / Workspace vorbereiten
- [ ] Webhook-Endpunkt anlegen (empfängt Daten vom ElevenLabs Agent)

### 3.2 Terminweiterleitung
> **Abhängig von Antwort des Kunden — zwei Wege möglich:**

**Option A — Manueller Rückruf (empfohlen für Start)**
- [ ] n8n schickt E-Mail an Mybach-Büro mit Termininfos
- [ ] Team bestätigt manuell

**Option B — Direktbuchung in Kalender**
- [ ] Google Calendar API oder Outlook API einrichten
- [ ] n8n: Slot prüfen → eintragen → Bestätigungs-E-Mail an Anrufer (via Brevo/SMTP)

### 3.3 Logging
- [ ] Webhook-Logs prüfen — keine dauerhafte Speicherung von Anruferdaten in n8n

---

## PHASE 4 — Twilio einrichten & verbinden

### 4.1 Twilio Account
- [ ] Twilio Account anlegen (twilio.com)
- [ ] Zahlungsmethode + Guthaben aufladen (mind. $20)
- [ ] Deutsche Telefonnummer kaufen → DE → Local (Köln/NRW bevorzugt, ~$1.15/Mo)
- [ ] Twilio DPA akzeptieren (DSGVO)
- [ ] Log Retention auf 90 Tage reduzieren

### 4.2 ElevenLabs ↔ Twilio verbinden
- [ ] ElevenLabs → Agent → Telefonnummern → Twilio verbinden
  - Account SID + Auth Token eintragen
  - Twilio-Nummer zuweisen
- [ ] Webhook Test (eingehender Testanruf)

### 4.3 Anrufweiterleitung beim Kunden
- [ ] Rückfrage Mybach: Welcher Telefonanbieter / Telefonanlage?
- [ ] Weiterleitung einrichten: nach X Klingeln → Twilio-Nummer
- [ ] Twilio-Nummer an Mybach kommunizieren

---

## PHASE 5 — Go-Live

- [ ] Kundentermin (Video/Telefon) für Abnahme-Demo
- [ ] Weiterleitung beim Kunden aktivieren (gemeinsam)
- [ ] 1 Woche Beobachtungsphase:
  - Twilio-Logs täglich prüfen
  - ElevenLabs Conversation History auswerten
  - Probleme sofort beheben
- [ ] Feedback-Runde mit Kunde nach Woche 1

---

## PHASE 6 — Übergabe & laufender Betrieb

- [ ] Kurzanleitung für Kunde:
  - Wie sieht er verpasste Anrufe?
  - Wie meldet er FAQ-Änderungen?
  - Was tun bei technischen Problemen?
- [ ] Monitoring einrichten (monatlicher Report?)
- [ ] Abrechnung:
  - Twilio: Auto-Recharge Schwelle setzen
  - ElevenLabs: Creator $22/Mo → Minutenverbrauch beobachten
  - Bei > 120 Min: Mehrminuten €0,30/Min Netto in Rechnung stellen
- [ ] Erste Monatsrechnung in Sevdesk (40€ Netto + ggf. Mehrminuten)

---

## PHASE 0 — DSGVO & Rechtliches (VOR Go-Live Pflicht!)

> ⚠️ Nichts davon darf auf nach Go-Live verschoben werden.

- [ ] **AVV** mit Mybach abschließen (Art. 28 DSGVO)
  - Parteien: ML Vision (Auftragsverarbeiter) ↔ Mybach (Verantwortlicher)
  - Unterauftragsverarbeiter aufführen: ElevenLabs, Twilio, n8n
  - ✅ **Dokument erstellt:** `MD/AVV_ML_Vision_Mybach.md`
  - → Adressen/Namen eintragen → ausdrucken → von Thomas Mybach unterschreiben lassen → zurück an ML Vision
- [ ] **ElevenLabs DPA** abschließen
  - → elevenlabs.io → Settings → Privacy → „Data Processing Agreement" → Accept
  - Wichtig: DPA abschließen **bevor** Live-Anrufe stattfinden
- [ ] **Twilio DPA** akzeptieren
  - → console.twilio.com → (Account) → Legal → Data Protection → GDPR DPA → Accept
  - Twilio Log Retention: Console → Monitor → Logs → auf 90 Tage reduzieren
- [ ] **n8n** klären: Cloud oder Self-Hosted?
  - Cloud (cloud.n8n.io): n8n ist Unterauftragsverarbeiter → AVV mit n8n abschließen (cloud.n8n.io → Settings → Data Processing)
  - Self-Hosted (eigener Server): n8n fällt weg als Unterauftragsverarbeiter → Server-Hosting ggf. separat eintragen
- [x] Datenschutzhinweis in Begrüßung ✅ (bereits im Prompt)
- [ ] Mybach informieren: Datenschutzerklärung auf Website um KI-Telefonassistent ergänzen
  - ✅ **Textbaustein erstellt:** `MD/DSGVO_Textbaustein_Mybach_Website.md`
  - → Platzhalter befüllen → an Thomas Mybach schicken → einbauen lassen (Webmaster oder selbst)
- [ ] **ElevenLabs Audio-Recording deaktivieren** (§ 201 StGB — heimliche Aufnahme strafbar!)
  - → elevenlabs.io → Agent → Settings → „Enable Audio Recording" → **OFF**
  - Nach Deaktivierung: Textbaustein für Datenschutzerklärung passt (keine Aufnahmen)
  - Falls Recording an bleiben soll: explizite Einwilligung im Begrüßungstext + opt-out Möglichkeit notwendig

---

## OFFENE RÜCKFRAGEN AN MYBACH

| # | Frage | Priorität |
|---|-------|-----------|
| 1 | Welchen Telefonanbieter/Anlage nutzt Mybach? | 🔴 Hoch |
| 2 | Welche Terminarten soll der Bot annehmen? | 🔴 Hoch |
| 3 | Wo sollen Termine landen? (E-Mail, Kalender, CRM?) | 🔴 Hoch |
| 4 | AVV unterschreiben lassen | 🔴 Hoch |
| 5 | FAQ-Liste: Was fragen Anrufer typischerweise? | 🟡 Mittel |
| 6 | Stimme: männlich oder weiblich? | 🟡 Mittel |
| 7 | Wie heißt der Assistent? (Name für Begrüßung) | 🟡 Mittel |
| 8 | Öffnungszeiten / erreichbare Zeiten des Teams | 🟡 Mittel |

---

## ZEITPLAN (angepasst)

| Phase | Aufwand | Wer | Status |
|-------|---------|-----|--------|
| **Phase 0: DSGVO/AVV** | 1–2h | Marco/Leon | ⏳ Offen |
| Phase 1: ElevenLabs Account + Agent Basis | 1–2h | Leon/Marco | ✅ Läuft |
| Phase 2: Agent vollständig + Testing | 3–6h | Leon | ⏳ Offen |
| Phase 3: n8n Workflow | 1–3h | Leon | ⏳ Offen |
| Phase 4: Twilio + Anbindung | 1–2h | Leon | ⏳ Offen |
| Phase 5: Go-Live | 1h + Begleitung | Leon | ⏳ Offen |
| Phase 6: Übergabe/Docs | 1h | Leon | ⏳ Offen |
| **Gesamt** | **~10–18h** | | |

> Setup-EK kalkuliert mit 20h × €70 = €1.400 — liegt im grünen Bereich.

---

*Erstellt: 29. März 2026 | Aktualisiert: 03. April 2026 | Für: Mybach & Co Immobilien GmbH | KVA: KVA-20260324-990*
