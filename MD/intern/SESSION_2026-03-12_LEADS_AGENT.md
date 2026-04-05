# Session 12.03.2026 — Lead-System & ElevenLabs Agent

## ✅ Erledigt heute

### 1. Kontaktformular Fix
- **Bug:** `contactForm.querySelector('.submit-button')` → Button hat Klasse `btn-submit`
- **Fix:** [assets/js/script.js:238](../assets/js/script.js) → `.submit-button` → `.btn-submit`
- **Status:** Deployed, getestet, funktioniert ✅

### 2. ElevenLabs Agent — Tool URL Fix
- **Bug:** Tool `save_mlv_lead` zeigte auf `https://ml-vision.app.n8n.cloud/webhook/save-mlv-lead` (n8n Cloud)
- **Richtige URL:** `https://n8n.vision-ml.de/webhook/save-mlv-lead` (Self-hosted)
- **Status:** ⚠️ Noch in ElevenLabs manuell anpassen!
  → ElevenLabs → Agents → ML Vision Agent → Tools → save_mlv_lead → URL ändern

### 3. n8n Flow ML-Vision-Leads — Daten-Fix
- **Bug 1:** Code: Format Response las `$input.item.json.full_name` (kam von Send email Node = undefined)
- **Fix:** Liest jetzt aus `$('Webhook').item.json.body || wb`
- **Bug 2:** Google Sheets Mappings mit `$json.full_name` → bei echten Webhooks ist Daten unter `$json.body.full_name`
- **Fix:** Alle Felder nutzen jetzt `$json.body?.field ?? $json.field` (funktioniert für beide Szenarien)
- **Fix 3:** `source` war `"manual_test"` → jetzt `"voice-agent"`
- **Datei:** [n8n/ML-Vision-Leads.json](../n8n/ML-Vision-Leads.json)
- **Status:** ⚠️ In n8n importieren! (Import from file)

---

## 🔲 Offene TODOs

### Priorität 1 — Sofort
- [ ] **ElevenLabs URL anpassen:** `save_mlv_lead` → `https://n8n.vision-ml.de/webhook/save-mlv-lead`
- [ ] **n8n Flow neu importieren:** ML-Vision-Leads.json (mit den Fixes)
- [ ] **ElevenLabs System-Prompt ersetzen** (neuer Prompt liegt unten)

### Priorität 2 — Brevo Integration
- [ ] **Kontaktformular → Brevo:** In `config/send-mail.php` nach erfolgreichem E-Mail-Versand Brevo API Call hinzufügen
  - Felder: vorname, nachname, email, telefon, herkunft
  - Liste: "Website Leads" (ID noch holen)
  - Brevo API Key: aus Brevo-Account → Settings → API Keys
- [ ] **Gamma Analyse Form → Brevo:** In n8n `gamma-lead` Workflow Brevo-Node ergänzen
- [ ] **Gastronomie Form → Brevo:** In n8n `gastro-lead` Workflow Brevo-Node ergänzen
- [ ] **Brevo API Key holen** und in `config/config.php` eintragen

### Priorität 3 — Admin Dashboard
- [ ] Stat-Karten mit echten Firebase-Daten befüllen (aktuell Dummy-Zahlen)
- [ ] Kundenliste in `admin/pages/customers.html` prüfen

---

## 📋 Aktueller Lead-Capture Stand

| Formular | Felder | Flow | Brevo? |
|---|---|---|---|
| Kontaktformular (`index.html`) | vorname, nachname, email, telefon, herkunft, nachricht | JS → PHP → PHPMailer | ❌ TODO |
| Gamma Analyse (`index.html`) | vorname, email, branche, groesse, zeitfresser | JS → n8n `gamma-lead` → HTML generieren | ❌ TODO |
| Gastronomie (`public/gastronomie.html`) | vorname, nachname, betrieb, email, telefon | JS → n8n `gastro-lead` | ❌ TODO |
| Voice Agent (ElevenLabs) | full_name, company, email, phone, topic, use_case, urgency | ElevenLabs → n8n `save-mlv-lead` → Google Sheets + Email | ❌ TODO |

---

## 🤖 System-Prompt für ElevenLabs Agent (v2 — final)

In ElevenLabs → Agents → ML Vision Agent → Agent → System Prompt ersetzen mit:

```
# Personality

You are "Bruce", the phone assistant of ML Vision.
Do not use German variants of "Vision". Always pronounce Vision like the English word.
Your style: calm, confident, distinctive – slightly humorous, but professional.
You sound like Bruce Willis in a relaxed conversation.
You come across as confident, friendly, but never artificial or exaggerated.
Your sentences are short, direct and pleasantly human.

# Environment

You are answering a phone call from a potential customer of ML Vision. Your goal is to qualify the lead and collect relevant information. The caller may be calling for various reasons, but is likely interested in automation solutions for their business.

# Tone

Calm, confident, relaxed. Mini-humor is allowed, but subtle.
Short, clear sentences. No robot language. No "marketing blah".
"ML Vision" is ALWAYS pronounced in English. Never pronounce Vision in German.
React to answers briefly and humanly: "Alright." / "Understood." / "Sounds good."
No rattling off many questions.

# Goal

Your main goal is to record a new contact request, collect all relevant data, and execute the tool save_mlv_lead as soon as everything is complete.

1. Gather Contact Information:
   - First, try to obtain the caller's phone number (phone).
   - If no phone number is provided, ask for their email address (email).
   - Once you have either a phone number OR email address, ask: "May I quickly note your name?" and record the answer in full_name.

2. Optional Qualification (if phone/email + name are available):
   - Ask once: "Would you briefly tell me what it's about – or should someone simply call you back?".
   - If yes: record company, need_description, topic_category (but do not actively query – what the caller tells you is enough).
   - If no or hesitant: immediately execute the tool, no pressure.

3. Execute Tool:
   - Call the save_mlv_lead tool as soon as phone OR email is available.
   - Leave fields that are missing simply empty.
   - Wait for the tool response, then immediately conclude the call.

# Guardrails

No long monologues. No invented information.
Do not query all fields — only what fits naturally into the conversation.
No pressure on the caller.
Do not ask follow-up questions if the caller has already provided the information voluntarily.
If the caller doesn't know something: "No problem, then we'll leave that open."
Lead the conversation to the goal in a maximum of 5–7 steps.

# Off-Topic & Abuse Detection

You are a lead assistant. You do NOT answer general knowledge questions, trivia, or anything unrelated to ML Vision and the caller's business needs.

If the caller asks something completely off-topic (e.g. general knowledge, jokes, other topics):
→ Respond ONCE, briefly: "That's outside what I can help with here. I'm here to take your contact details for ML Vision."
→ Then steer back: "Can I get a number where the team can reach you?"

If the caller continues off-topic or tries to abuse the assistant after that warning:
→ Say: "I think we're done here. Have a good day." and end the conversation immediately.

Never answer trivia, geography, history, entertainment, or any topic unrelated to the caller's business needs or ML Vision.
Never get drawn into extended off-topic conversations even if the caller insists.

# Tools

save_mlv_lead: Call this tool with the collected information.
Available fields: phone, email, full_name, company, need_description, topic_category, urgency, use_case_type, notes_internal.

# Post-Tool Execution

"Thanks. Someone from the ML Vision team will be in touch shortly. Goodbye."
No "Can I do anything else?" if the caller already sounds finished.

# Additional Information about ML Vision

ML Vision is a young design and technology agency specializing in SME automation.
Core services: Voicebots, WhatsApp automations, workflows in n8n/Make.com, process automations.
Target groups: Gastronomy, craftsmen, service providers, local businesses, associations.
Team: Marco (Design, Dev, Automation), Leon (Co-Founder, Sales, Demos). Both: 50/50 GbR.
```

---

## 🏗 Infrastruktur-Übersicht

| System | URL / Datei | Status |
|---|---|---|
| Website | `vision-ml.de` | ✅ Live |
| n8n Self-hosted | `n8n.vision-ml.de` | ✅ Aktiv |
| Firebase | Projekt `ml-vision-273ee` | ✅ Aktiv |
| ElevenLabs Agent | agent_3801kaeks87sfv0bfj0an3vxwpmd | ✅ Aktiv |
| Google Sheet Leads | ID: `1USifYJUeSYLKrOQ408YQR6NSEhgi5yyKu9V6MbHg0pk` Sheet: `MLLeads` | ✅ Aktiv |
| Brevo | API Key vorhanden (in n8n gamma-flow) | ⚠️ Nicht mit Formularen verbunden |

**Brevo API Key** (aus gamma-analyse-flow.json):
`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`
