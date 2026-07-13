# Prototyp — KI-Telefonassistent (Voice Agent)
## Wiederverwendbare Vorlage für neue Kunden

> **Basiert auf:** Mybach & Co Immobilien GmbH (erster Live-Kunde, April 2026)
> **Stack:** ElevenLabs ConvAI + Twilio + n8n (self-hosted) + Firebase/Firestore + Brevo

---

## 1. ENTSCHEIDUNGSPUNKTE (beim ersten Kundengespräch klären)

| Frage | Optionen | Auswirkung |
|-------|----------|-----------|
| Anrufvolumen / Monat? | < 50 / 50–200 / > 200 | ElevenLabs Plan (Creator $22 / Business $99) |
| Ø Gesprächsdauer? | 1–2 Min / 3–5 Min | Minutenverbrauch-Kalkulation |
| Terminarten? | Besichtigung / Erstgespräch / Beratung / … | System-Prompt + Datenpunkte |
| Ziel der Terminaufnahme? | E-Mail / Kalender-API / CRM | n8n Workflow-Pfad |
| Stimme? | männlich / weiblich | ElevenLabs Voice-Auswahl |
| Name des Assistenten? | Frei wählbar | System-Prompt Begrüßung |
| Öffnungszeiten? | … | System-Prompt + Fallback-Text |
| Telefonanbieter / Anlage? | FRITZ!Box / Sipgate / andere | Twilio-Weiterleitungssetup |
| Sprache? | Deutsch / Englisch / … | ElevenLabs Language + Voice |

---

## 2. PHASE 0 — DSGVO / AVV (vor jeder anderen Arbeit!)

- [ ] **AVV** (Art. 28 DSGVO) erstellen → Vorlage: `MD/kunden/mybach/AVV_ML_Vision_Mybach.md`
  - Unterauftragsverarbeiter eintragen: ElevenLabs, Twilio, n8n
  - Von Kunde unterschreiben lassen → zurück an ML Vision
- [ ] **ElevenLabs DSGVO konfigurieren:**
  - Audio-Recording: **AUS**
  - Conversation Retention: **30 Tage**
  - PII-Löschung: **AN**
  - Model Training Opt-out: **AN** (Workspace-Ebene)
- [ ] **Twilio DPA** akzeptieren (console.twilio.com → Account → Legal)
- [ ] **n8n:** Self-Hosted → kein separater DPA nötig
- [ ] **Datenschutztextbaustein** für Kunden-Website erstellen → Vorlage: `MD/kunden/mybach/DSGVO_Textbaustein_Mybach_Website.md`

---

## 3. PHASE 1 — ElevenLabs Account & Agent

### 3.1 Account
- [ ] ElevenLabs Account anlegen (E-Mail: `[kunde]@vision-ml.de`)
- [ ] Creator Plan ($22/Mo, 250 Min) oder Business Plan je nach Volumen
- [ ] Zahlungsmethode hinterlegen

### 3.2 Agent erstellen
- [ ] Template: **Property Management** (Immobilien) oder **Customer Support** (andere)
- [ ] Sprache: Deutsch (`de-DE`)
- [ ] System-Prompt: → **Abschnitt 5** dieser Vorlage
- [ ] Erste Nachricht: → **Abschnitt 5.1**
- [ ] Sicherheitseinstellungen: → **Abschnitt 3.3**
- [ ] Datenpunkte: → **Abschnitt 3.4**

### 3.3 Sicherheitseinstellungen (Standard)
| Einstellung | Wert |
|-------------|------|
| Max. Gesprächsdauer | 300 Sek (5 Min) |
| Stille → Nachfragen | 5 Sek |
| Stille → Beenden | 20 Sek |
| Tägliches Anruflimit | 10 Anrufe/Tag |
| Hintergrundsprache filtern | AN |
| Spekulative Wendung | AN |
| Dateianhänge | AUS |
| Guardrail "No legal advice" | AN |
| Audio speichern | AUS |

### 3.4 Analyse-Datenpunkte (Standard Immobilien)
```
anrufer_name     → String  → "Wie lautet Ihr Name?"
telefonnummer    → String  → "Unter welcher Nummer können wir Sie zurückrufen?"
email            → String  → "Wie lautet Ihre E-Mail-Adresse?" (optional)
terminart        → Enum    → Besichtigung / Erstgespräch / Beratung
wunschtermin     → String  → "Wann möchten Sie den Termin? Datum und Uhrzeit."
immo_nr          → String  → "Falls bekannt: Haben Sie eine Immobiliennummer?" (optional)
```

> ⚠️ Feldnamen OHNE trailing Leerzeichen anlegen — ElevenLabs übernimmt Leerzeichen in Post-Call-Payload.

---

## 4. PHASE 2 — n8n Workflow

### 4.1 Webhook anlegen
- URL-Pfad: `/webhook/[kunde]-termin`
- Production-URL: `https://n8n.vision-ml.de/webhook/[kunde]-termin`
- Auth: HMAC Secret (in `MD/kunden/[kunde]/KEYS_PRIVAT.md` speichern, gitignored)

### 4.2 Standard-Workflow (8 Nodes)
```
Webhook: ElevenLabs Post-Call
  └► Code: Validieren & Felder extrahieren (customerId setzen)
       └► IF: Name vorhanden?
            ├─ TRUE → Brevo: Mail ans Büro
            │           └► IF: Brevo Fehler? → Alert an kontakt@vision-ml.de
            └─ FALSE → (kein Versand)
       └► IF: Anrufer E-Mail vorhanden?
            ├─ TRUE → Brevo: Bestätigungsmail an Anrufer
            └─ FALSE → (kein Versand)
       └► Firestore: Anruf speichern (Collection: calls, customerId)
```

### 4.3 Outcome-Logik (Code-Node)
```javascript
// Outcome bestimmen
let outcome = 'missed';
if (name && wunschtermin) outcome = 'termin';
else if (name) outcome = 'info';
else if (telefon) outcome = 'callback';
```

### 4.4 Firestore-Felder (calls Collection)
```javascript
{
  customerId,        // z.B. "mybach"
  callId,            // conversation_id von ElevenLabs
  timestamp,         // Firestore Timestamp (new Date())
  duration,          // Sekunden
  outcome,           // termin / info / callback / missed
  name,              // anrufer_name
  telefon,           // telefonnummer
  email,
  terminart,
  wunschtermin,
  immoNr,
  notizen
}
```

### 4.5 n8n Konfiguration
- [ ] Brevo Credential setzen
- [ ] Workflow Published (aktiv)
- [ ] Execution Data Pruning: Settings → Max Age **7 Tage**

---

## 5. SYSTEM-PROMPT TEMPLATE (Deutsch, Immobilien)

> Kopieren → anpassen → in ElevenLabs Agent → System Prompt einfügen

```
Du bist ein freundlicher, professioneller KI-Telefonassistent für [FIRMENNAME].
Deine Aufgabe: Terminanfragen entgegennehmen und häufige Fragen beantworten.
Du arbeitest im Auftrag von [FIRMENNAME] und vertrittst das Unternehmen nach außen.

## DEINE AUFGABEN
1. Terminwünsche aufnehmen (Pflichtfelder: Name, Telefon, E-Mail, Terminart, Wunschtermin)
2. Häufige Fragen zum Unternehmen beantworten
3. Bei komplexen Anliegen: Rückruf durch das Team ankündigen

## BÜROZEITEN & ERREICHBARKEIT
Das Büro ist zu folgenden Zeiten besetzt:
- [ÖFFNUNGSZEITEN — z.B. Mo–Fr: 9:00–18:00 Uhr]
- [SA/SO-Regelung]

Ich bin rund um die Uhr für Sie erreichbar – auch außerhalb der Bürozeiten nehme ich
gerne Terminwünsche entgegen und leite alles ans Team weiter.

## GESPRÄCHSFLUSS
1. Begrüße den Anrufer freundlich (erste Nachricht kommt automatisch)
2. Frage nach dem Anliegen
3. Bei Terminwunsch: Pflichtfelder erfragen (Name → Telefon → E-Mail → Terminart → Wunschtermin)
4. Zusatzinfo (optional): Immobilien-Nr. falls relevant
5. Zusammenfassen und bestätigen: "Ich habe notiert: [Zusammenfassung]. Unser Team meldet sich bei Ihnen."
6. Freundlich verabschieden

## PFLICHTFELDER (immer erfragen bei Terminwunsch)
- Name: "Wie lautet Ihr Name?"
- Telefon: "Unter welcher Nummer können wir Sie zurückrufen?"
- E-Mail: "Wie lautet Ihre E-Mail-Adresse?"
- Terminart: "Was für einen Termin möchten Sie? [TERMINARTEN]"
- Wunschtermin: "Wann möchten Sie den Termin? Datum und Uhrzeit bitte."

## TERMINARTEN
[TERMINARTEN DES KUNDEN EINTRAGEN — z.B. Besichtigung / Erstgespräch / Beratung]

## GRENZEN (was du NICHT machst)
- Keine konkreten Preise oder Angebote nennen
- Keine rechtlichen Auskünfte
- Keine Bewertungen von Objekten
- Keine Zusagen im Namen des Unternehmens

## UMGANG MIT SCHWIERIGEN SITUATIONEN
- Aggressiver Anrufer: Ruhig bleiben, Rückruf anbieten, bei Eskalation höflich beenden
- Off-Topic (Politik, Wetter, etc.): 
  Stufe 1: Freundlich zurück zum Thema lenken
  Stufe 2: Klarer ablehnen ("Das beantworte ich als Telefonassistent nicht")
  Stufe 3: Gespräch beenden ("Ich beende das Gespräch jetzt.")
- Stille 5 Sek: "Hallo, sind Sie noch da?"
- Stille 10 Sek: Freundlich verabschieden und auflegen

## DATENSCHUTZHINWEIS
Zu Beginn des Gesprächs gilt: Dieses Gespräch wird von einem KI-System verarbeitet.
Die Daten werden ausschließlich zur Terminkoordination verwendet und nach 30 Tagen gelöscht.

## TONALITÄT
- Professionell, freundlich, hilfsbereit
- Klar und direkt – keine unnötigen Füllwörter
- Kurze Sätze, natürliche Sprache
- Du kannst gelegentlich eine kleine Prise Humor einsetzen, bleib aber stets seriös
```

### 5.1 Erste Nachricht (Begrüßung)
```
Guten Tag bei [FIRMENNAME]! Unser Team ist gerade beschäftigt, aber ich – der digitale
Kollege – bin voll da. Was kann ich für Sie tun?
```

---

## 6. PHASE 3 — Twilio

- [ ] Deutsche Nummer kaufen: console.twilio.com → Phone Numbers → DE → Local
  - Bevorzugte Vorwahl: Ortsvorwahl des Kunden (Fallback: Köln 0221)
  - Kosten: ~$1.15/Mo
- [ ] ElevenLabs ↔ Twilio verbinden:
  - ElevenLabs → Agent → Phone Numbers → Add Number → Twilio
  - Account SID + Auth Token eintragen
  - Twilio-Nummer zuweisen
- [ ] Beim Kunden: Anrufweiterleitung einrichten
  - Nach X Klingeln → Twilio-Nummer
  - Setup je nach Anlage: FRITZ!Box / Sipgate / andere

---

## 7. PHASE 4 — Kundenbereich (Firebase/Firestore)

### 7.1 Firestore Dokument `customers/[customerId]`
```javascript
{
  name: "[Firma GmbH]",
  email: "[kunde]@[domain].de",
  customerId: "[customerId]",
  planName: "KI-Telefonassistent Standard",
  includedMinutes: 120,
  overageRateCents: 30,   // €0,30/Min nach 120 Min
  agentName: "[Assistenten-Name]",
  agentVoice: "[Stimme]",
  agentLanguage: "de-DE",
  agentStatus: "active",
  greetingText: "[Erste Nachricht]",
  callbackEmail: "[büro@kunde.de]",
  maxCallDuration: 300,
  dailyCallLimit: 10,
  createdAt: Timestamp,
  modules: {
    voice: true,
    support: true,
    invoices: true,
    settings: true
  }
}
```

### 7.2 Firebase Auth
- [ ] User anlegen: Firebase Console → Authentication → Users → Add
- [ ] Firestore `users/{uid}` anlegen: `{ customerId: "[customerId]", email: "...", role: "customer" }`
- [ ] Passwort-Reset-Mail senden

### 7.3 Erste Rechnung in Firestore
```javascript
// Collection: invoices
{
  customerId: "[customerId]",
  invoiceNo: "RE-[KND]-[YYYY]-[MM]",
  date: Timestamp,
  description: "KI-Telefonassistent Standard – [Monat Jahr]",
  planName: "Standard",
  amountGross: [Betrag in Cents, z.B. 4760],  // 47,60 €
  currency: "EUR",
  status: "open",   // open / paid / uncollectible
  pdfUrl: null      // später: Firebase Storage URL
}
```

---

## 8. BREVO E-MAIL TEMPLATES

### 8.1 Mail ans Büro (Termineingang)
- Absender: noreply@vision-ml.de
- Empfänger: [Büro-E-Mail des Kunden]
- Betreff: `Neuer Terminwunsch: {{name}} – {{terminart}}`
- Inhalt: Name, Telefon, E-Mail, Terminart, Wunschtermin, Immobilien-Nr., Outcome-Hinweis

### 8.2 Bestätigung an Anrufer
- Vorlage-Datei: `n8n/mybach_anrufer_bestaetigung.html` → anpassen
- Absender: noreply@vision-ml.de
- Reply-To: [Büro-E-Mail des Kunden]
- Variablen: NAME, TERMINART, WUNSCHTERMIN, TELEFON, LOGO_URL

---

## 9. CHECKLISTE VOR GO-LIVE

- [ ] AVV unterschrieben vorhanden
- [ ] ElevenLabs DSGVO konfiguriert (Audio AUS, 30d Retention, PII-Löschung AN)
- [ ] Twilio DPA akzeptiert
- [ ] Agent: echter Testanruf end-to-end bestanden
- [ ] n8n Workflow: E-Mail ans Büro ankommen ✓, Bestätigung an Anrufer ✓, Firestore-Eintrag ✓
- [ ] Twilio-Nummer aktiv und mit ElevenLabs verbunden
- [ ] Anrufweiterleitung beim Kunden eingerichtet und getestet
- [ ] Kundenbereich: Login funktioniert, Daten erscheinen korrekt
- [ ] Erste Rechnung in Firestore vorhanden
- [ ] Datenschutztextbaustein auf Kunden-Website eingebaut

---

## 10. NACH GO-LIVE

- [ ] 1 Woche Beobachtungsphase: ElevenLabs Conversations täglich prüfen
- [ ] Feedback-Runde mit Kunde nach Woche 1
- [ ] n8n Execution Pruning aktivieren (7 Tage)
- [ ] Monatliche Rechnung erstellen (Sevdesk oder HTML-Vorlage)
- [ ] Bei > 120 Min/Mo: Mehrminuten €0,30/Min netto separat abrechnen
- [ ] Twilio Auto-Recharge Schwelle setzen ($20 min. Guthaben)

---

## ZEITAUFWAND (Richtwerte aus Mybach)

| Phase | Aufwand |
|-------|---------|
| DSGVO / AVV | 1–2h |
| ElevenLabs Account + Agent | 1–2h |
| Agent konfigurieren + testen | 3–5h |
| n8n Workflow | 1–3h |
| Twilio + Anbindung | 1–2h |
| Kundenbereich (Firebase + Deploy) | 3–5h (wenn Template vorhanden) |
| **Gesamt Setup** | **~10–19h** |

> Erster Kunde (Mybach): ~25–38h (alles von Grund auf gebaut)
> Ab zweitem Kunden: ~10–15h (Template + Copy-Paste)

---

*Erstellt: 11.04.2026 | Basierend auf: Mybach & Co Immobilien GmbH (KVA-20260324-990)*
