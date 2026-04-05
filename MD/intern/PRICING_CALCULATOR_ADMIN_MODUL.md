# Pricing Calculator — Admin Modul

> **Ziel:** Admin-Modul (wie Leads Bot) im Dashboard, mit dem Mitarbeiter für jeden Kunden sofort die Kosten eines KI-Projekts kalkulieren können.
> **Einstiegspunkt:** Admin Dashboard → Sidebar → "Pricing Kalkulator"
> **Datei:** `admin/pages/pricing-calculator.html`
> **Stand Preise:** März 2026 — bei Implementierung verifizieren!

---

## 📋 TODOs — Implementierung

### Phase 1 — Daten & Konzept ✅
- [x] Tool-Liste definieren
- [x] Preise recherchieren
- [x] Bundle-Definitionen festlegen
- [x] Kalkulationslogik entwerfen

### Phase 2 — UI Aufbau ✅
- [x] `admin/pages/pricing-calculator.html` erstellt
- [x] `assets/css/pages/pricing-calculator.css` erstellt
- [x] `assets/js/pricing-calculator.js` erstellt (alle Logik hier)
- [x] Sidebar-Link in allen Admin-Seiten ergänzt (dashboard, leads-bot, customers, tickets, users, settings)

### Phase 3 — Tool-Daten einpflegen ✅
- [x] Tool-Objekte in JS mit aktuellen Preisen (Stand März 2026)
- [x] Bundle-Objekte definiert (Telefonbot, Voice Widget, Outbound, Chatbot, Lead Capture)
- [x] Kalkulationsformeln für jedes Bundle implementiert
- [x] Plan-Empfehlung Logik implementiert

### Phase 4 — Features ✅
- [x] Bundle-Auswahl (5 Bundles mit Tab-Navigation)
- [x] Eingabe: Minuten/Monat, Nachrichten/Monat, E-Mails/Monat, Mobilfunk-Anteil
- [x] Ausgabe: Kosten (USD + EUR), Tool-Aufschlüsselung, Plan-Empfehlung
- [x] "In Zwischenablage" Button → formatierter Text-Export
- [x] Marge-Slider: 0–80%, Kundenpreis und Gewinn live
- [x] Preise-Update Datum anzeigen + Warnung wenn > 90 Tage alt
- [x] Stack-Auswahl (ElevenLabs All-in-One vs. Vapi) beim Telefonbot
- [ ] PDF Export (optional, Erweiterung möglich)

---

## 🛠️ Tool-Datenbank

### Währungshinweis
- Alle Tool-Preise sind in **USD**
- Für EUR: Wechselkurs als Variable im JS (z.B. `USD_TO_EUR = 0.92`)
- Im UI immer beide Währungen zeigen: `$X.XX (~€X.XX)`

---

### 1. ElevenLabs
**Kategorie:** TTS / Voice Agent
**Website:** elevenlabs.io

#### TTS (Text-to-Speech) Pläne
| Plan | $/Monat | Chars inkl. | Overage /1k Chars |
|------|---------|-------------|-------------------|
| Starter | $5 | 30.000 | — |
| Creator | $22 | 100.000 | $0.30 |
| Pro | $99 | 500.000 | $0.24 |
| Scale | $330 | 2.000.000 | $0.18 |
| Business | $1.320 | 11.000.000 | $0.12 |

**Faustregel:** 1 Minute Sprache ≈ 800–1.000 Zeichen

#### Conversational AI (Voice Agent) — WICHTIG für Telefonbot
- **Preis: $0.10/Minute** (auf Creator, Pro, Scale, Business Plänen)
- **Inkl.:** STT (Sprache → Text) + LLM (aktuell kostenlos drin!) + TTS (Text → Sprache)
- **Achtung:** LLM-Kosten sind aktuell von ElevenLabs subventioniert — kann sich ändern!
- Free-Tier: kein Conversational AI

---

### 2. Cartesia
**Kategorie:** TTS (Alternative zu ElevenLabs, extrem niedrige Latenz ~100ms)
**Website:** cartesia.ai
**Modell:** Sonic

| Plan | $/Monat | Chars inkl. | Kosten /1k Chars |
|------|---------|-------------|-----------------|
| Free | $0 | 100.000 | — |
| $5 | $5 | 100.000 | $0.050 |
| $50 | $50 | 1.000.000 | $0.050 |
| $299 | $299 | 8.000.000 | $0.037 |
| Scale/Enterprise | Custom | Custom | noch günstiger |

**Wann Cartesia statt ElevenLabs?** Wenn Latenz kritisch ist (Echtzeit-Gespräch) und Voices weniger wichtig. Günstiger bei hohem Volumen.

---

### 3. Twilio
**Kategorie:** Telefonie (Anrufe, SMS, WhatsApp)
**Website:** twilio.com
**Hinweis:** Pay-as-you-go, keine Monatspläne

#### Voice (Deutschland)
| Typ | $/Minute |
|-----|---------|
| Inbound (Anruf kommt rein) | $0.0085 |
| Outbound → DE Festnetz | $0.0150 |
| Outbound → DE Mobil | $0.0250 |

#### Telefonnummer Deutschland
- Lokale DE-Nummer: ~$1.15/Monat
- Achtung: Beide Seiten werden berechnet bei Bridge (Inbound + Outbound)

#### SMS (Deutschland)
- Ausgehend DE: ~$0.075/SMS
- Eingehend: $0.0075/SMS

---

### 4. Vapi.ai
**Kategorie:** Voice AI Orchestrierung (baut auf Twilio + Deepgram + ElevenLabs/Cartesia + OpenAI)
**Website:** vapi.ai
**Preis:** $0.05/Minute (Orchestrierungsgebühr, kommt ZUSÄTZLICH zu den Tool-Kosten)

**Realistische Gesamtkosten mit Vapi-Stack:**
| Komponente | Tool | $/Minute |
|-----------|------|---------|
| Orchestrierung | Vapi | $0.05 |
| STT | Deepgram Nova-2 | $0.0043 |
| LLM | GPT-4o-mini | ~$0.03 |
| TTS | ElevenLabs (Pro Plan) | ~$0.05 |
| Telefonie | Twilio DE inbound | $0.0085 |
| **Gesamt Vapi-Stack** | | **~$0.14–$0.15/min** |

**Alternative: ElevenLabs ConvAI All-in-one:** $0.10/min (günstiger, weniger flexibel)

---

### 5. Deepgram
**Kategorie:** STT (Speech-to-Text)
**Website:** deepgram.com

| Modell | $/Minute (PAYG) |
|--------|----------------|
| Nova-2 | $0.0043 |
| Nova-3 (empfohlen) | $0.0077 |
| Nova-3 (Growth) | $0.0065 |

**Hinweis:** Abrechnung sekundengenau → Stille wird weggefiltert → spart ~20%
**Free Tier:** $200 Startguthaben (~45.000 Min mit Nova-2)

---

### 6. OpenAI
**Kategorie:** LLM (Gehirn des Bots), STT
**Website:** platform.openai.com

#### LLM Pricing (per 1M Tokens)
| Modell | Input | Output |
|--------|-------|--------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o (Cached) | $1.25 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| GPT-4o-mini (Cached) | $0.075 | $0.60 |

**Faustregel für Chatbot:** 1 Minute Gespräch ≈ 500–1.000 Tokens
→ GPT-4o-mini: ~$0.01–0.03/Minute
→ GPT-4o: ~$0.05–0.15/Minute

#### STT (Sprache → Text)
| Modell | $/Minute |
|--------|---------|
| Whisper-1 | $0.006 |
| GPT-4o Transcribe | $0.006 |
| GPT-4o-mini Transcribe | $0.003 ← Bester Wert |

---

### 7. n8n (Self-hosted)
**Kategorie:** Workflow-Automatisierung
**Unser Setup:** Eigener Server `n8n.vision-ml.de`

**Kosten für Kunden: $0 (in unseren Server-Kosten bereits enthalten)**
→ Serverkosten sind Fixkosten, nicht pro-Kunde abrechenbar
→ Bei sehr hohem Workflow-Volumen: ggf. Server-Upgrade einrechnen

---

### 8. Brevo (ehem. Sendinblue)
**Kategorie:** E-Mail Marketing / Transaktions-E-Mails
**Website:** brevo.com

| Plan | $/Monat | E-Mails/Monat |
|------|---------|---------------|
| Free | $0 | 9.000 (300/Tag) |
| Starter | ab $9 | ab 5.000 (kein Tageslimit) |
| Business | ab $18 | ab 5.000 + Automation |
| Enterprise | Custom | 150.000+ |

**Hinweis:** Preismodell nach Versandvolumen, nicht Kontaktzahl!

---

### 9. Firebase / Firestore
**Kategorie:** Datenbank / Auth
**Setup:** Unser Firebase Projekt

**Blaze Plan (PAYG) — nach Free-Tier:**
| Operation | Preis |
|-----------|-------|
| Reads | $0.03 / 100.000 |
| Writes | $0.18 / 100.000 |
| Deletes | $0.01 / 100.000 |
| Storage | $0.108 / GB / Monat |

**Free-Tier täglich:** 50.000 Reads, 20.000 Writes, 20.000 Deletes
**Für normale Kunden-Apps praktisch kostenlos** solange kein extremes Volumen.

---

### 10. Cloudflare
**Kategorie:** CDN, DNS, Turnstile (CAPTCHA), Workers
**Website:** cloudflare.com

| Feature | Free | Paid ($5/mo) |
|---------|------|-------------|
| Turnstile | Bis 1M verif./Mo | Unbegrenzt |
| Workers | 100k Req/Tag | 10M Req/Mo |
| DNS/CDN | Kostenlos | Kostenlos |

**Für uns:** Turnstile = kostenlos, Workers für kleine Projekte kostenlos

---

## 📦 Bundle-Definitionen

### Bundle 1: Telefonbot (Inbound)
**Was:** KI beantwortet eingehende Anrufe, führt Gespräche, leitet weiter oder erfasst Infos
**Einsatz:** Restaurant-Reservierung, Kundensupport, Lead-Qualifizierung

**Stack Option A — ElevenLabs All-in-One (empfohlen, günstiger):**
| Tool | Zweck | Kosten |
|------|-------|--------|
| ElevenLabs Conversational AI | STT + LLM + TTS | $0.10/min |
| Twilio | Telefonie DE Inbound | $0.0085/min |
| Twilio Phone Number | DE Nummer | $1.15/mo fix |
| n8n | Webhooks / Datenverarbeitung | $0 |
| **Gesamt** | | **~$0.11/min + $1.15/mo** |

**Stack Option B — Vapi (flexibler, teurer):**
| Tool | Zweck | Kosten |
|------|-------|--------|
| Vapi | Orchestrierung | $0.05/min |
| Deepgram Nova-3 | STT | $0.0077/min |
| GPT-4o-mini | LLM | ~$0.02/min |
| ElevenLabs (Pro) | TTS | ~$0.05/min |
| Twilio | Telefonie DE | $0.0085/min |
| **Gesamt** | | **~$0.14/min** |

**Kalkulationsformel (Option A):**
```
monatliche_kosten = (minuten * 0.11) + 1.15
```

**Beispiel 1.000 Min/Monat (Option A):**
- Gesprächskosten: 1.000 × $0.11 = $110
- Telefonnummer: $1.15
- **Gesamt: ~$111/Monat ≈ €102/Monat**
- Empfohlener Plan: ElevenLabs Pro ($99/mo, da ConvAI drin)

---

### Bundle 2: Voice Widget (Website)
**Was:** Sprach-KI direkt auf der Website (kein Telefon, rein im Browser)
**Einsatz:** Website-Chat mit Sprache, FAQ-Bot, Beratungs-Bot

**Stack:**
| Tool | Zweck | Kosten |
|------|-------|--------|
| ElevenLabs Conversational AI | Alles | $0.10/min |
| n8n | Webhooks | $0 |
| **Gesamt** | | **$0.10/min** |

**Kalkulationsformel:**
```
monatliche_kosten = minuten * 0.10
```

**Beispiel 500 Min/Monat:**
- $50/Monat ≈ €46/Monat
- Empfohlener Plan: ElevenLabs Creator ($22/mo — ConvAI inkl.)

---

### Bundle 3: Outbound Kampagne (KI ruft an)
**Was:** KI ruft Kontakte aktiv an (z.B. Terminerinnerungen, Umfragen, Leads)
**Einsatz:** Appointment-Reminders, Lead-Nurturing, Feedback-Calls

**Stack:**
| Tool | Zweck | Kosten |
|------|-------|--------|
| ElevenLabs Conversational AI | STT + LLM + TTS | $0.10/min |
| Twilio Outbound DE Festnetz | Anrufe raus | $0.015/min |
| Twilio Outbound DE Mobil | Anrufe raus | $0.025/min |
| n8n | Auslöser / Scheduling | $0 |
| **Gesamt (Festnetz)** | | **~$0.115/min** |
| **Gesamt (Mobil)** | | **~$0.125/min** |

---

### Bundle 4: Chat Bot (Text only, kein Sprach)
**Was:** Klassischer Text-Chat-Bot (WhatsApp, Website-Chat, etc.)
**Einsatz:** Support, FAQ, Lead-Capture

**Stack:**
| Tool | Zweck | Kosten |
|------|-------|--------|
| GPT-4o-mini | LLM | ~$0.03/1k Nachrichten |
| n8n | Workflow + Webhooks | $0 |
| Brevo (optional) | E-Mail Follow-up | ab $0/mo |
| **Gesamt** | | **~$3–5/Monat (1k Nachrichten)** |

**Kalkulationsformel:**
```
monatliche_kosten = (nachrichten * 0.003) + brevo_plan
// 0.003 = ~$0.003 pro Nachricht (500 Tokens avg, GPT-4o-mini)
```

---

### Bundle 5: Lead-Capture System
**Was:** Formular → KI-Qualifizierung → E-Mail → CRM
**Einsatz:** Website-Leads automatisch qualifizieren und versenden

**Stack:**
| Tool | Zweck | Kosten |
|------|-------|--------|
| GPT-4o-mini | Lead-Analyse | ~$0.01/Lead |
| n8n | Workflow | $0 |
| Brevo | E-Mails | ab $0/mo (Free bis 9k/mo) |
| Firebase | Datenbank | $0 (Free-Tier reicht) |
| **Gesamt** | | **praktisch $0 bei kleinem Volumen** |

---

## 🖥️ UI/UX Konzept

### Layout (analog zu Leads Bot)
```
┌─────────────────────────────────────────────────────────┐
│ Pricing Kalkulator                    [Gespeicherte Kalks] │
│ Berechne Projektkosten für Kunden                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ SCHRITT 1: Bundle wählen                                 │
│ [Telefonbot] [Voice Widget] [Outbound] [Chatbot] [Lead]  │
│                                                          │
│ SCHRITT 2: Volumen eingeben                              │
│ Minuten/Monat: [____1000____]                            │
│ (weitere Felder je nach Bundle)                          │
│                                                          │
│ SCHRITT 3: Stack wählen (optional)                       │
│ ○ Empfohlen  ● Vapi Stack  ○ Custom                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ERGEBNIS                                                 │
│                                                          │
│ Unsere Kosten:     $111.15 / Monat (~€102.26)           │
│                                                          │
│ Tool-Aufschlüsselung:                                    │
│  ElevenLabs Pro    $99.00 (Basis-Plan)                  │
│  ElevenLabs ConvAI $11.00 (110 Min × $0.10)            │
│  Twilio Calls      $8.50  (1000 Min × $0.0085)         │
│  Twilio Nummer     $1.15  (fix)                         │
│                                                          │
│ Empfohlener Plan: ElevenLabs PRO ($99/mo)               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ KUNDENPREIS                                              │
│ Marge: [─────●─────] 40%                                │
│                                                          │
│ Empfohlener Kundenpreis: ~€143/Monat                    │
│ Unser Gewinn: ~€41/Monat                                │
│                                                          │
│ [📋 In Zwischenablage]  [💾 Speichern]                  │
└─────────────────────────────────────────────────────────┘
```

### Wichtige UI-Details
- Dark Theme (wie restliches Admin-Dashboard)
- Wechselkurs-Anzeige oben: `1 USD = €0.92 (aktualisiert: Jan 2026)` — Mitarbeiter kann überschreiben
- **Preise zuletzt aktualisiert:** Datum anzeigen + gelbe Warnung wenn > 90 Tage alt
- Jedes Tool-Detail aufklappbar (Accordion) für mehr Info
- Custom-Tool-Modus: Mitarbeiter kann eigene Preise eintippen

---

## 💻 Technische Implementierung

### Dateistruktur
```
admin/pages/
  pricing-calculator.html        ← Haupt-HTML
assets/
  css/pages/
    pricing-calculator.css       ← Styles
  js/
    pricing-calculator.js        ← Alle Kalkulationslogik
```

### JavaScript Architektur

```javascript
// pricing-calculator.js — Struktur

const TOOLS = {
  elevenlabs: {
    name: "ElevenLabs",
    category: "TTS / Voice Agent",
    plans: [
      { name: "Starter", monthly: 5, chars: 30000 },
      { name: "Creator", monthly: 22, chars: 100000 },
      { name: "Pro", monthly: 99, chars: 500000 },
      { name: "Scale", monthly: 330, chars: 2000000 },
    ],
    convAI: { perMinute: 0.10 },  // Conversational AI
    tts: { overage: { creator: 0.00030, pro: 0.00024, scale: 0.00018 } }
  },
  twilio: {
    name: "Twilio",
    category: "Telefonie",
    voice: {
      inbound_de: 0.0085,
      outbound_de_landline: 0.015,
      outbound_de_mobile: 0.025,
    },
    number_de: 1.15, // pro Monat
    sms_outbound_de: 0.075,
  },
  cartesia: {
    name: "Cartesia",
    category: "TTS (Alternative)",
    plans: [
      { name: "Free", monthly: 0, chars: 100000 },
      { name: "Basis", monthly: 5, chars: 100000 },
      { name: "Pro", monthly: 50, chars: 1000000 },
      { name: "Scale", monthly: 299, chars: 8000000 },
    ]
  },
  vapi: {
    name: "Vapi.ai",
    category: "Voice Orchestrierung",
    perMinute: 0.05
  },
  deepgram: {
    name: "Deepgram",
    category: "STT",
    nova2: 0.0043,
    nova3: 0.0077,
  },
  openai: {
    name: "OpenAI",
    category: "LLM / STT",
    gpt4o: { input: 2.50, output: 10.00 },        // per 1M tokens
    gpt4o_mini: { input: 0.15, output: 0.60 },     // per 1M tokens
    whisper: 0.006,                                 // per minute
    gpt4o_mini_transcribe: 0.003,                  // per minute
  },
  brevo: {
    name: "Brevo",
    category: "E-Mail",
    plans: [
      { name: "Free", monthly: 0, emails: 9000 },
      { name: "Starter", monthly: 9, emails: 5000, unlimited_daily: true },
      { name: "Business", monthly: 18, emails: 5000, automation: true },
    ]
  }
};

const BUNDLES = {
  telefonbot_inbound: {
    name: "Telefonbot (Inbound)",
    description: "KI beantwortet eingehende Anrufe",
    inputs: ["minutes_per_month"],
    calculate: (inputs) => { /* Logik */ },
    recommended_stack: "elevenlabs_allinone",
    stacks: {
      elevenlabs_allinone: { /* ... */ },
      vapi_stack: { /* ... */ }
    }
  }
  // weitere Bundles...
};

const USD_TO_EUR = 0.92; // Manuell aktualisieren
const PRICES_LAST_UPDATED = "2026-03-14";
```

### Sidebar-Eintrag ergänzen
In **allen** Admin-HTML-Seiten (dashboard.html, customers.html, etc.) in der Sidebar unter TOOLS:
```html
<li>
    <a href="pricing-calculator.html" class="nav-item">
        <i class="nav-icon">💰</i>
        <span>Pricing Kalkulator</span>
    </a>
</li>
```

---

## 🔢 Kalkulationsbeispiele (für Tests)

### Test 1: Telefonbot 1.000 Min/Monat
```
Stack: ElevenLabs ConvAI + Twilio
ConvAI: 1000 × $0.10 = $100.00
Twilio Calls: 1000 × $0.0085 = $8.50
Twilio Nummer: $1.15
ElevenLabs Plan: Pro $99.00 (nötig für ConvAI)
─────────────────────────────
Gesamt: $208.65/Monat = ~€192/Monat

ABER: Die ConvAI-Minuten sind im Pro-Plan bereits günstiger
→ Empfehlung: ElevenLabs Pro ($99), der ConvAI-Verbrauch
  kommt ZUSÄTZLICH zum Plan-Preis
```

### Test 2: Voice Widget 200 Min/Monat
```
ElevenLabs ConvAI: 200 × $0.10 = $20.00
ElevenLabs Plan: Creator $22.00 (ConvAI inkl.)
─────────────────────────────
Gesamt: $42/Monat = ~€39/Monat
```

### Test 3: Outbound 500 Anrufe × 3 Min = 1.500 Min
```
ElevenLabs ConvAI: 1500 × $0.10 = $150.00
Twilio Outbound Mobil: 1500 × $0.025 = $37.50
ElevenLabs Plan: Pro $99.00
─────────────────────────────
Gesamt: $286.50/Monat = ~€263/Monat
```

---

## ⚠️ Wichtige Hinweise für Mitarbeiter

1. **ElevenLabs LLM-Kosten:** Aktuell von ElevenLabs subventioniert (LLM im $0.10/min inkl.). Das kann sich ändern — dann wird ConvAI teurer!

2. **Twilio Doppelt-Berechnung:** Bei komplexen Setups können beide Anruf-Seiten berechnet werden. Im Zweifel 2× Twilio-Kosten einkalkulieren.

3. **Plan-Wahl wichtig:** Wenn ElevenLabs ConvAI genutzt wird, braucht man mindestens Starter-Plan. Die Plan-Kosten KOMMEN zu den Minutenkosten dazu.

4. **Wechselkurs:** USD→EUR täglich ändernd. Immer mit etwas Puffer kalkulieren. Im Angebot an Kunden: in EUR mit ~5% Puffer auf den Kurs.

5. **n8n ist kostenlos** (unser Server). Wird nicht in Kundenkalkulation eingerechnet — außer bei extrem hohem Workflow-Volumen.

6. **Preise veralten schnell:** Vor großen Angeboten immer kurz die aktuellen Preise checken!

---

## 📅 Preise zuletzt verifiziert: 14.03.2026

| Tool | Verifiziert | Quelle |
|------|------------|--------|
| ElevenLabs | ✅ März 2026 | elevenlabs.io/pricing |
| Cartesia | ✅ März 2026 | cartesia.ai/pricing |
| Twilio | ✅ März 2026 | twilio.com/voice/pricing/de |
| Vapi.ai | ✅ März 2026 | vapi.ai/pricing |
| Deepgram | ✅ März 2026 | deepgram.com/pricing |
| OpenAI | ✅ März 2026 | platform.openai.com/pricing |
| Brevo | ✅ März 2026 | brevo.com/pricing |
| Cloudflare | ✅ März 2026 | cloudflare.com/plans |
| Firebase | ✅ März 2026 | firebase.google.com/pricing |
