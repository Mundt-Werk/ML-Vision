# ML Vision — Tool Preisliste (Vollständig)
> Stand: März 2026 — Vor großen Angeboten IMMER aktuelle Preise prüfen!
> Alle Preise in USD, sofern nicht anders angegeben.
> EUR-Kurs: 1 USD ≈ €0.92 (bitte aktuellen Kurs prüfen!)

---

## 📌 Schnellübersicht: Unsere Kern-Tools

| Tool | Funktion | Unser Plan | Kosten/Monat | Abo-Typ |
|------|----------|-----------|-------------|---------|
| ElevenLabs | TTS + Voice Agent | [Plan] | [Betrag] | Monatlich |
| Twilio | Telefonie | PAYG | variabel | Pay-as-you-go |
| n8n | Automation | Self-hosted | Serverkosten | Fix |
| Firebase | Datenbank | Blaze | meist €0 | PAYG |
| Brevo | E-Mail | [Plan] | [Betrag] | Monatlich |
| Cloudflare | DNS/CDN/CAPTCHA | Free | €0 | Free |
| OpenAI | LLM | PAYG | variabel | Pay-as-you-go |
| Sevdesk | Buchhaltung | [Plan] | [Betrag] | Monatlich |

---

## 1. 🎙️ ElevenLabs
**Website:** https://elevenlabs.io/pricing
**Funktion:** Text-to-Speech (TTS) + Conversational AI (Voice Agent)
**Zuletzt geprüft:** März 2026

### TTS-Pläne (Sprache generieren)
| Plan | Monatlich | Jährlich | Jährlich/Monat | Zeichen inkl./Mo | Overage / 1k Zeichen |
|------|-----------|----------|---------------|------------------|---------------------|
| Free | $0 | — | — | 10.000 | — (kein Overage) |
| Starter | $5 | $50 | $4.17 | 30.000 | — |
| Creator | $22 | $220 | $18.33 | 100.000 | $0.30 |
| Pro | $99 | $990 | $82.50 | 500.000 | $0.24 |
| Scale | $330 | $3.300 | $275 | 2.000.000 | $0.18 |
| Business | $1.320 | $13.200 | $1.100 | 11.000.000 | $0.12 |

**Jahresrabatt:** ~17% Ersparnis bei jährlicher Zahlung

### Conversational AI (Voice Agent) — Minutenpreise
| Plan | Minuten inkl./Mo | Preis/Minute darüber |
|------|-----------------|---------------------|
| Free | 0 | — |
| Starter | 50 | $0.10 |
| Creator | 250 | $0.10 |
| Pro | 1.100 | $0.10 |
| Scale | (laut Plan) | $0.10 |
| Business | (laut Plan) | $0.10 |

**WICHTIG:** ConvAI kostet $0.10/Minute bei Überschreitung des Inklusiv-Volumens.
- LLM-Kosten aktuell von ElevenLabs subventioniert (in $0.10/min enthalten) — KANN SICH ÄNDERN!
- STT + TTS im $0.10/min Preis enthalten

### Faustwerte
- 1 Minute Sprache ≈ 800–1.000 Zeichen
- 1 Stunde Gespräche ≈ 60 × $0.10 = $6.00

---

## 2. 📞 Twilio
**Website:** https://www.twilio.com/voice/pricing/de
**Funktion:** Telefonie (Anrufe rein/raus), SMS
**Modell:** Pay-as-you-go (kein Monatsabo)
**Zuletzt geprüft:** März 2026

### Voice — Deutschland
| Typ | Preis/Minute | Hinweis |
|-----|-------------|---------|
| Inbound (jemand ruft uns an) | $0.0085 | Günstigste Option |
| Outbound → DE Festnetz | $0.0150 | |
| Outbound → DE Mobilfunk | $0.0250 | Teurer — Mobilanteil wichtig! |

### Telefonnummern Deutschland
| Typ | Preis/Monat |
|-----|------------|
| Lokale Festnetz-Nummer (z.B. +49 341...) | $1.15 |
| Nationale Nummer (0800 etc.) | auf Anfrage |
| Mobile Nummer (z.B. +49 151...) | ~$15.00 |

**TIPP:** Lokale Nummer bevorzugen — günstiger und wirkt vertrauenswürdiger!

### SMS — Deutschland
| Typ | Preis/SMS |
|-----|----------|
| Ausgehend (wir → Kunde) | $0.075 |
| Eingehend (Kunde → uns) | $0.0075 |

### Achtung: Doppelt-Berechnung!
Bei manchen Setups (z.B. Twilio Bridge) werden beide Seiten berechnet:
- Inbound: $0.0085 + Outbound (Weiterleitung): $0.015 = $0.0235/min
- Im Zweifel: $0.0235/min einkalkulieren!

---

## 3. 🤖 Vapi.ai
**Website:** https://vapi.ai/pricing
**Funktion:** Voice AI Orchestrierung (baut auf Twilio + STT + LLM + TTS)
**Modell:** Pay-as-you-go
**Zuletzt geprüft:** März 2026

| Kosten | Preis |
|--------|-------|
| Orchestrierung | $0.05/Minute |
| STT, LLM, TTS | Separat (eigene Keys mitbringen!) |
| Telefonie | Separat via Twilio |

**Gesamtkosten Vapi-Stack (typisch):**
| Komponente | $/Minute |
|-----------|---------|
| Vapi (Orchestrierung) | $0.05 |
| Deepgram Nova-3 (STT) | $0.0077 |
| GPT-4o-mini (LLM) | ~$0.02 |
| ElevenLabs/Cartesia (TTS) | ~$0.05 |
| Twilio DE Inbound | $0.0085 |
| **Gesamt** | **~$0.14/min** |

**vs. ElevenLabs All-in-One:** ~$0.115/min (günstiger, weniger Kontrolle)

---

## 4. 🔊 Deepgram
**Website:** https://deepgram.com/pricing
**Funktion:** Speech-to-Text (STT) — Sprache → Text
**Modell:** Pay-as-you-go
**Zuletzt geprüft:** März 2026

| Modell | Pay-as-you-go $/Min | Growth $/Min | Enterprise |
|--------|--------------------|-----------|----|
| Nova-1 & Nova-2 | $0.0058 | $0.0048 | Custom |
| Nova-3 (empfohlen) | $0.0077 | $0.0065 | Custom |
| Nova-3 Medical | $0.0118 | — | Custom |

**Startguthaben:** $200 beim ersten Account (ca. 25.000 Min mit Nova-3)
**Abrechnung:** Sekundengenau, Stille wird gefiltert → spart ~20%
**Empfehlung:** Nova-3 für beste Genauigkeit, Nova-2 für Budget-Projekte

---

## 5. 🧠 OpenAI
**Website:** https://platform.openai.com/pricing
**Funktion:** LLM (Chatbot-Gehirn), STT (Whisper)
**Modell:** Pay-as-you-go
**Zuletzt geprüft:** März 2026

### LLM — Preise pro 1 Mio. Tokens
| Modell | Input $/1M | Output $/1M | Cached Input |
|--------|-----------|------------|-------------|
| GPT-4o | $2.50 | $10.00 | $1.25 |
| GPT-4o-mini | $0.15 | $0.60 | $0.075 |
| o1 (Reasoning) | $15.00 | $60.00 | $7.50 |
| o3-mini | $1.10 | $4.40 | $0.55 |

**Faustwerte Tokens:**
- 1 Minute Gespräch (Bot + Nutzer) ≈ 500–1.500 Tokens
- GPT-4o-mini: ~$0.01–0.03 pro Gesprächsminute
- GPT-4o: ~$0.05–0.15 pro Gesprächsminute
- 1.000 Worte ≈ 750 Tokens

### STT — Preise pro Minute
| Modell | $/Minute |
|--------|---------|
| Whisper-1 | $0.006 |
| GPT-4o Transcription | $0.006 |
| GPT-4o-mini Transcription | $0.003 |

---

## 6. 🗣️ Cartesia
**Website:** https://cartesia.ai/pricing
**Funktion:** Ultra-Low-Latency TTS (~100ms) — Alternative zu ElevenLabs
**Zuletzt geprüft:** März 2026

| Plan | Monatlich | Jährlich | Zeichen inkl. | Overage / 1k Zeichen |
|------|-----------|---------|--------------|---------------------|
| Free | $0 | — | 100.000 | — |
| Starter | $5 | $50 | 100.000 | $0.050 |
| Pro | $50 | $500 | 1.000.000 | $0.050 |
| Scale | $299 | $2.990 | 8.000.000 | $0.037 |
| Enterprise | Custom | Custom | Custom | günstiger |

**Wann Cartesia statt ElevenLabs?**
- Wenn Latenz extrem wichtig ist (Echtzeit-Telefon-Gespräch)
- Wenn Kosten wichtiger als Stimmenqualität
- Wenn großes Volumen → günstiger als ElevenLabs

---

## 7. 📧 Brevo (ehemals Sendinblue)
**Website:** https://www.brevo.com/pricing
**Funktion:** E-Mail Marketing, Transaktions-E-Mails, CRM
**Zuletzt geprüft:** März 2026

### E-Mail Pläne
| Plan | Monatlich | Jährlich/Monat | E-Mails/Mo | Kontakte | Besonderheiten |
|------|-----------|--------------|-----------|----------|----------------|
| Free | €0 | — | 9.000 | unlimitiert | 300/Tag Limit |
| Starter | ab €9 | ab €7.50 | ab 5.000 | unlimitiert | Kein Tageslimit |
| Business | ab €18 | ab €15 | ab 5.000 | unlimitiert | + Automation, A/B |
| Enterprise | Custom | Custom | Custom | Custom | Dedicated IP |

**Hinweis:** Preismodell nach Versandvolumen, NICHT Kontaktanzahl!
**Jahresrabatt:** ~17%

### Transaktions-E-Mails (Relaymail)
- Erste 9.000/Monat kostenlos
- Dann: ab €15/Monat für mehr

---

## 8. 🔥 Firebase / Google Cloud
**Website:** https://firebase.google.com/pricing
**Funktion:** Datenbank (Firestore), Auth, Hosting, Storage
**Unser Plan:** Blaze (Pay-as-you-go)
**Zuletzt geprüft:** März 2026

### Firestore (Datenbank) — nach Free-Tier
| Operation | Preis |
|-----------|-------|
| Reads | $0.03 / 100.000 |
| Writes | $0.18 / 100.000 |
| Deletes | $0.01 / 100.000 |
| Storage | $0.108 / GB / Monat |

### Free-Tier täglich (Spark Plan) / Blaze Plan
| Feature | Spark (Free) | Blaze (PAYG nach Limit) |
|---------|-------------|------------------------|
| Reads | 50.000/Tag | danach $0.03/100k |
| Writes | 20.000/Tag | danach $0.18/100k |
| Deletes | 20.000/Tag | danach $0.01/100k |
| Storage | 1 GB | danach $0.108/GB |
| Hosting | 10 GB / Monat | danach $0.026/GB |
| Functions | 2M Aufruf/Mo | danach $0.40/M |
| Auth | unbegrenzt | kostenlos |

**Für normale Kunden-Apps:** Praktisch €0 monatliche Kosten
**Wann teuer?** Bei > 50.000 Reads/Tag oder > 1 GB Storage

---

## 9. ☁️ Cloudflare
**Website:** https://www.cloudflare.com/plans
**Funktion:** DNS, CDN, Turnstile (CAPTCHA), Workers, Pages
**Unser Plan:** Free (für alles was wir brauchen)
**Zuletzt geprüft:** März 2026

| Feature | Free | Pro ($20/mo) | Business ($200/mo) |
|---------|------|-----------|--------------------|
| DNS / CDN | ✅ Kostenlos | ✅ | ✅ |
| Turnstile | 1M Verif./Mo | Unbegrenzt | Unbegrenzt |
| Workers | 100k Req/Tag | 10M Req/Mo | 100M Req/Mo |
| Pages | ✅ Kostenlos | ✅ | ✅ |
| SSL | ✅ Kostenlos | ✅ | ✅ |

**Für uns:** Free-Plan reicht für alle aktuellen Projekte.

---

## 10. 💬 WhatsApp Business API (Meta)
**Website:** https://developers.facebook.com/docs/whatsapp/pricing
**Funktion:** WhatsApp Nachrichten senden/empfangen (Bots, Notifications)
**Modell:** Pro Nachricht (Per-Message Pricing)
**Zuletzt geprüft:** März 2026
⚠️ **Preise ändern sich häufig — immer neu prüfen!**

### Preise pro Nachricht — Deutschland Region
| Kategorie | Preis/Nachricht | Wann |
|-----------|-----------------|------|
| Marketing | €0.1131 (~$0.12) | Wir schreiben zuerst (Werbung) |
| Utility | €0.0456 (~$0.05) | Transaktionen, Bestätigungen |
| Authentication | €0.0456 (~$0.05) | OTP, Login-Codes |
| Service | €0.00 | Kunde schreibt zuerst (24h gratis!) |

**WICHTIG (Neues Modell):** Seit Mitte 2025 wird strikt **pro zugestellter Template-Nachricht** abgerechnet, nicht mehr pauschal pro 24h-Konversation. Ausnahme: Service-Nachrichten (wenn der Kunde die Unterhaltung initiiert) bleiben innerhalb eines 24h-Fensters kostenlos.

---

## 11. 🤝 HubSpot CRM
**Website:** https://www.hubspot.com/pricing
**Funktion:** CRM, Sales Pipeline, E-Mail Marketing
**Zuletzt geprüft:** März 2026

| Plan | Monatlich | Jährlich/Monat | Kontakte | Nutzer |
|------|-----------|--------------|---------|--------|
| Free | $0 | — | 1M | unlimitiert |
| Starter | $15/Nutzer | $12/Nutzer | unlimitiert | min. 1 |
| Professional | $90/Nutzer | $75/Nutzer | unlimitiert | min. 3 |
| Enterprise | $150/Nutzer | Custom | unlimitiert | min. 10 |

**Hinweis:** Free-Plan reicht für viele kleine Kunden.

---

## 12. 📊 n8n (Self-hosted)
**Website:** https://n8n.io/pricing (nur für Cloud-Version relevant)
**Unser Setup:** Selbst-gehostet auf eigenem Server (`n8n.vision-ml.de`)
**Kosten für uns:** Server-Kosten fix (nicht nach Volumen)

| Variante | Kosten |
|---------|--------|
| Self-hosted (Open Source) | $0 (nur Server) |
| n8n Cloud Starter | $24/Monat |
| n8n Cloud Pro | $60/Monat |
| Enterprise Self-hosted | Custom |

**Für Kunden-Kalkulation:** n8n = $0 (Serverkosten sind Fixkosten bei uns)

---

## 13. 📝 Sevdesk (Buchhaltung)
**Website:** https://sevdesk.de/preise
**Funktion:** Rechnungen, Angebote, Buchhaltung, DATEV
**Zuletzt geprüft:** März 2026

| Plan | Monatlich | Besonderheiten |
|------|-----------|----------------|
| Free | €0.00 | Max. 3 (E-)Rechnungen pro Monat |
| Rechnung | ab €12.90 | Nur Rechnungen/Angebote |
| Buchhaltung | ab €25.90 | + Buchführung, Bankkonto |
| Buchhaltung Pro | ab €34.90 | + Anlagenbuchhaltung, etc. |

**Für uns:** Rechnung-Plan (ab €12.90) ausreichend für Angebote + Rechnungen schreiben.

---

## 🔁 Jährliche Zahlungen — Wann lohnt sich das?

| Tool | Monatlich | Jährlich gespart | Break-even |
|------|-----------|-----------------|------------|
| ElevenLabs Creator | $22 × 12 = $264 | ~$44 (17%) | Sofort |
| ElevenLabs Pro | $99 × 12 = $1.188 | ~$198 (17%) | Sofort |
| Brevo Starter | €9 × 12 = €108 | ~€18 (17%) | Sofort |

**Empfehlung:** Bei Tools die wir sicher > 6 Monate nutzen → immer jährlich!

---

## ⚠️ Preisänderungs-Risiken

| Tool | Risiko | Warum |
|------|--------|-------|
| ElevenLabs ConvAI | ⚠️ HOCH | LLM aktuell subventioniert — kann teurer werden |
| WhatsApp | ⚠️ HOCH | Meta ändert Preise und Modelle regelmäßig |
| OpenAI | 🟡 MITTEL | Preise fallen meist (bessere Modelle) |
| Twilio | 🟢 NIEDRIG | Stabile Preise, langjährig |
| Firebase | 🟢 NIEDRIG | Google — sehr stabile Preise |

---

## 📅 Preise verifiziert

| Tool | Letzter Check | Quelle | Nächster Check |
|------|-------------|--------|---------------|
| ElevenLabs | März 2026 | elevenlabs.io/pricing | Jun 2026 |
| Twilio | März 2026 | twilio.com/voice/pricing/de | Jun 2026 |
| Vapi.ai | März 2026 | vapi.ai/pricing | Jun 2026 |
| Deepgram | März 2026 | deepgram.com/pricing | Jun 2026 |
| OpenAI | März 2026 | platform.openai.com/pricing | Jun 2026 |
| Cartesia | März 2026 | cartesia.ai/pricing | Jun 2026 |
| Brevo | März 2026 | brevo.com/pricing | Jun 2026 |
| Firebase | März 2026 | firebase.google.com/pricing | Sep 2026 |
| Cloudflare | März 2026 | cloudflare.com/plans | Sep 2026 |
| WhatsApp | März 2026 | developers.facebook.com | Jun 2026 |
| HubSpot | März 2026 | hubspot.com/pricing | Jun 2026 |
| Sevdesk | März 2026 | sevdesk.de/preise | Sep 2026 |