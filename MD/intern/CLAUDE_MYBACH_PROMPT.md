# Prompt für neuen Claude Chat — Mybach System-Optimierung

---

## KONTEXT

Du bist technischer Assistent für **ML Vision** (Schauerte & Mundt GbR), eine KI-Agentur.
Wir betreiben einen **KI-Telefonassistenten für Mybach & Co Immobilien** (Düren).
Du hast Zugriff auf alle Systeme und sollst das Setup vollständig analysieren, optimieren und absichern.

---

## DAS SYSTEM (Aktueller Stand)

**Stack:**
- **ElevenLabs** — KI-Stimme / Conversational AI Agent ("Mybach & Co Immobilien – Telefonassistent")
- **n8n** (self-hosted auf `https://n8n.vision-ml.de`) — Workflow-Automatisierung
- **Google Firebase / Firestore** — Datenspeicher (Projekt: `ml-vision-273ee`)
- **Brevo** — E-Mail Versand (Büro-Benachrichtigung + Anrufer-Bestätigung)
- **Twilio** — Telefonnummer des Agenten (noch nicht vollständig integriert)
- **Hostinger VPS** — Server für n8n (Ubuntu 24.04, IP: `72.62.48.218`, Hostname: `mlvision-n8n.cloud`)

**Flow-Architektur (n8n Workflow "Mybach – Termineingang"):**
```
ElevenLabs Call endet
→ ElevenLabs Post-Call Webhook → n8n
→ Code-Node: Daten extrahieren (Name, Telefon, Email, Terminart, Wunschtermin, Notizen, ImmoNr)
→ IF: Name vorhanden?
   TRUE →
     ├── Brevo: Mail ans Büro (mybach@vision-ml.de)
     ├── IF: Email vorhanden? → Brevo: Bestätigung an Anrufer
     └── Firestore: Anruf speichern (Collection: "calls", Doc-ID: convId)
   FALSE → Ende
```

**Was kürzlich geändert wurde:**
- Firestore-Node wurde von `googleFirebaseCloudFirestoreOAuth2Api` auf **HTTP Request + Generic OAuth2** umgebaut
  (OAuth2 Client ID: `669617565330-3tj0injnk0eco0s076m17gqivibp7g85.apps.googleusercontent.com`)
- Neue n8n Credential angelegt: "Google Firestore Mybach (OAuth2)" (ID: `Ki6DiuTHhDid2Jve`)
- **NOCH OFFEN:** Diese Credential muss in n8n einmalig mit Google authentifiziert werden (Sign in with Google)

**Bekannte Probleme:**
- Firestore-Authentifizierung läuft regelmäßig ab → Hauptursache der Fehler (~70% Failure Rate)
- Webhook hat kein Signing-Secret (offen für Fake-Requests)
- Error Workflow ("Mybach – Error Handler") muss nach jedem JSON-Import manuell in Settings verlinkt werden

---

## ZUGÄNGE

Alle Login-Daten stehen in:
`D:\Projekte\Kunden\ML_Vision\Brand\Webdesign\.env`

Enthält Zugänge für:
- Google / Firebase Console (`marcomundt@mundtwerk.com`)
- n8n (`ml-vision@vision-ml.de`)
- ElevenLabs (`ml-vision@vision-ml.de`)
- Twilio (`ml-vision@vision-ml.de`)
- Hostinger VPS (`ml-vision@vision-ml.de`, SSH root@72.62.48.218)
- E-Mail Postfach vision-ml.de

OAuth2 Client Secret JSON:
`D:\Projekte\Kunden\ML_Vision\Brand\Webdesign\kunden\mybach\client_secret_669617565330-3tj0injnk0eco0s076m17gqivibp7g85.apps.googleusercontent.com.json`

n8n Session: Verwende POST `/rest/login` mit den Credentials aus der .env, dann Session-Cookie für API-Calls.

---

## DEINE AUFGABE

**Schritt 1 — Credential verbinden (falls noch nicht erledigt):**
Prüfe ob die n8n Credential "Google Firestore Mybach (OAuth2)" (ID: `Ki6DiuTHhDid2Jve`) bereits
einen gültigen Token hat. Falls nicht → leite den User durch den Google OAuth2 Flow.

**Schritt 2 — Vollständige System-Analyse:**
Logg dich in ALLE Systeme ein und analysiere:

1. **n8n:**
   - Alle Workflows auflisten (nicht nur Mybach)
   - Execution-History der letzten 7 Tage prüfen (Fehlerrate, Fehlertypen)
   - Credential-Status prüfen (welche sind abgelaufen?)
   - Webhook-URLs dokumentieren

2. **ElevenLabs:**
   - Agent-Konfiguration prüfen (System Prompt, Conversation Flow, Data Collection Fields)
   - Konversations-History analysieren (Erfolgsrate, häufige Abbrüche, Probleme)
   - Webhook-Konfiguration prüfen (URL korrekt? Signing Secret aktiv?)
   - Call-Limits prüfen (Daily Limit, Max Duration)

3. **Firebase / Firestore:**
   - `calls` Collection prüfen (wie viele Einträge? Fehlende Felder?)
   - Security Rules prüfen (zu offen? Lücken?)
   - `customers/mybach` Dokument prüfen (Module konfiguriert?)

4. **Twilio:**
   - Welche Telefonnummer ist konfiguriert?
   - Ist sie mit ElevenLabs verbunden?
   - Call-Logs der letzten 7 Tage prüfen
   - Anrufer-Nummern verfügbar? (für Rückruf-Feature)

5. **VPS / n8n Server:**
   - SSH einloggen, n8n Prozess prüfen (Docker? PM2?)
   - Logs der letzten Fehler anschauen
   - Disk/Memory-Status
   - Ist n8n auf aktuellem Stand?

**Schritt 3 — Optimierungsvorschläge erarbeiten:**
Basierend auf der Analyse konkrete Vorschläge für:

- **Flow-Verbesserungen:** Was macht der Agent gut/schlecht? Wo brechen Calls ab?
- **Twilio-Integration:** Anrufer-Nummer in Firestore speichern, Rückruf-Tracking
- **Webhook-Sicherheit:** ElevenLabs Signing Secret aktivieren + n8n-seitige Verifikation
- **Monitoring:** Wie können wir Fehler früher erkennen? (Brevo Alert ist gut, aber reicht das?)
- **Datenschutz:** DSGVO-konforme Speicherung, Löschfristen für Anrufdaten
- **Dashboard:** Mybach-Kundenbereich zeigt Anrufe — ist die Firestore-Collection korrekt befüllt?
- **Agent-Qualität:** System Prompt optimieren basierend auf echten Konversations-Daten

**Schritt 4 — Priorisierte Roadmap:**
Erstelle eine priorisierte To-Do-Liste:
- Was ist kaputt und muss sofort gefixt werden?
- Was verbessert die Qualität spürbar?
- Was ist nice-to-have?

---

## WICHTIGE REGELN

- **Nichts zerstören.** Der Kunde nutzt das System täglich. Immer erst testen, dann produktiv.
- **Keine Breaking Changes ohne Bestätigung.** Vor größeren Änderungen kurz fragen.
- **Session-Cookie für n8n.** Du kannst dich via `/rest/login` einloggen und den Cookie für alle weiteren API-Calls nutzen.
- **ElevenLabs API Key** ist in `config/config.php` im Projekt oder in der .env.
- **Firebase ist unter `marcomundt@mundtwerk.com`**, n8n/Hostinger unter `ml-vision@vision-ml.de`.
- Service Account Keys sind durch Org-Policy gesperrt — stattdessen OAuth2 Client verwenden.

---

## PROJEKTSTRUKTUR (lokal)

`D:\Projekte\Kunden\ML_Vision\Brand\Webdesign\`
- `n8n/` — Workflow JSON Dateien (Source of Truth)
- `MD/kunden/mybach/` — Dokumentation (N8N_WORKFLOW_DOKU.md, IMPL_MYBACH_TELEFONASSISTENT.md)
- `functions/` — Firebase Cloud Functions
- `config/` — Firebase Config, PHP Config (enthält ElevenLabs API Key)
- `kunden/mybach/` — Privat (OAuth2 Client JSON)
- `.env` — Alle Zugänge

---

Starte mit Schritt 1, dann gib mir einen vollständigen Analyse-Bericht bevor du Änderungen machst.
