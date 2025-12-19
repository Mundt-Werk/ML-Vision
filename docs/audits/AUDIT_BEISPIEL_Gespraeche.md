# 📞 Modul-Audit: Gespräche (gespraeche.html)

**Status:** KEEP & AUSBAUEN (Kern-Modul für MVP)
**Audit-Datum:** 10.12.2024
**Priorität:** 🔴 HOCH (MVP-kritisch)

---

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Übersicht aller eingehenden Voice-Anrufe (Twilio)
- Detailansicht einzelner Gespräche mit Transkript
- Audio-Wiedergabe und Download der Aufnahmen
- Filterung nach Datum, Ergebnis und Sentiment
- Export der Gespräche als CSV für eigene Auswertungen

**Use Cases:**
1. Kunde schaut sich alle Anrufe der letzten Woche an
2. Kunde hört sich ein Gespräch nochmal an (Qualitätskontrolle)
3. Kunde exportiert Daten für Reporting
4. Kunde filtert nach "Termin gebucht" um Erfolgsquote zu prüfen

---

## 2. Ist-Status: Was ist tatsächlich vorhanden?

### ✅ UI/Frontend (Vollständig implementiert)
- **Sidebar-Navigation** - Hardcoded, zeigt ALLE 9 Module (nicht dynamisch)
- **Filter-Sektion** - 4 Filter (Von/Bis Datum, Ergebnis, Sentiment) - UI vorhanden, aber nicht funktional
- **Tabelle** - 5 Spalten (Datum, Dauer, Ergebnis, Sentiment, Aktionen)
- **Beispiel-Daten** - 5 hardcodierte Einträge (18.11.2025, 17.11.2025)
- **Modal** - Gesprächsdetails mit Transkript (statisch, immer gleicher Inhalt)
- **Buttons** - "Abspielen", "Download", "CSV Export" vorhanden
- **Responsive** - Mobile-optimiert (Sidebar klappt ein)

### ❌ Backend/Funktionalität (Nicht implementiert)
- **Keine Datenbank-Anbindung** - Keine Firebase/Firestore Integration
- **Keine API-Calls** - Kein Twilio-Import
- **Keine dynamischen Daten** - Alle Daten sind Platzhalter
- **Audio-Funktionen fehlen** - Buttons zeigen nur `alert()` (Zeilen 900-906)
- **Filter nicht funktional** - Button vorhanden, aber ohne Event-Handler (Zeile 700)
- **CSV-Export fehlt** - Button vorhanden, ohne Funktion (Zeile 709)
- **Pagination fehlt** - Nur 5 Einträge, keine "Weiter"/"Zurück"
- **KPIs fehlen** - Keine Zusammenfassung (Anzahl Calls, Erfolgsquote, Durchschnittsdauer)

### 📊 Hardcodierte Werte
```html
Line 708: "342 Gespräche gefunden" (fest im HTML)
Line 722-821: 5 Beispiel-Einträge mit fiktiven Daten
Line 869-878: Statisches Transkript (immer gleich im Modal)
```

---

## 3. Externe Abhängigkeiten (APIs/Provider)

### Erforderliche Integrationen für MVP:

**A) Twilio Voice API** (Primär)
- **Zweck:** Import aller eingehenden Anrufe
- **Daten:** Call SID, Datum/Zeit, Dauer, Status, Recording URL, Telefonnummer
- **API-Endpunkte:**
  - `GET /v1/Calls.json` - Liste aller Calls
  - `GET /v1/Recordings.json` - Audio-Aufnahmen
- **Kosten:** Bereits im Twilio-Vertrag enthalten
- **Risiko:** Niedrig (Standard-API, gut dokumentiert)

**B) OpenAI Whisper API** (für Transkripte)
- **Zweck:** Audio → Text-Transkription
- **Input:** Twilio Recording URL
- **Output:** Transkript mit Timestamps
- **Kosten:** ~$0.006 pro Minute Audio
- **Risiko:** Niedrig (bereits genutzt?)

**C) Sentiment Analysis** (Optional für MVP)
- **Zweck:** Stimmungsanalyse des Gesprächs
- **Provider:** OpenAI GPT-4 oder eigenes Modell
- **Output:** Positive/Neutral/Negative + Keywords
- **Risiko:** Mittel (kann später hinzugefügt werden)

**D) Firebase Firestore** (Datenspeicher)
- **Collection:** `events_raw` (Roh-Events) + `call_transcripts` (Transkripte)
- **Struktur:**
```javascript
{
  callId: "CA123...",
  customerId: "cust_001",
  timestamp: "2024-11-18T14:32:00Z",
  duration: 225, // Sekunden
  result: "success", // success|pending|failed
  sentiment: "positive",
  phoneNumber: "+491234567890",
  recordingUrl: "https://api.twilio.com/...",
  transcriptId: "trans_123"
}
```

---

## 4. Gaps zum MVP-Ziel

### 🔴 KRITISCH (Blocker)
1. **Keine Daten-Anbindung** - Twilio API Import fehlt komplett
2. **Keine Audio-Wiedergabe** - Funktion nicht implementiert
3. **Keine KPIs** - Dashboard braucht Summen (Anzahl, Erfolgsquote)
4. **Keine Pagination** - Nur 5 Einträge sichtbar, keine Navigation
5. **WhatsApp fehlt** - Im Plan erwähnt, aber nicht in UI

### 🟡 WICHTIG (MVP-relevant)
1. **Filter nicht funktional** - Buttons da, aber keine Logik
2. **CSV-Export fehlt** - Button vorhanden, Funktion fehlt
3. **Sentiment fehlt** - UI zeigt Emojis, aber keine echte Analyse
4. **Transkript statisch** - Modal zeigt immer gleichen Text
5. **Keine Fehlerbehandlung** - Was wenn Twilio down ist?

### 🟢 NICE-TO-HAVE (später)
1. **Search-Funktion** - Suche nach Telefonnummer/Keyword
2. **Sortierung** - Tabelle nach Spalten sortieren
3. **Bulk-Actions** - Mehrere Gespräche exportieren
4. **Notizen** - Kommentare zu Gesprächen hinzufügen

---

## 5. Empfehlung: KEEP & STARK AUSBAUEN

**Begründung:**
- ✅ Kern-Funktion für Voice-Modul (MVP-kritisch)
- ✅ UI bereits fertig und modern
- ✅ Kunde-Feedback gewünscht (Qualitätskontrolle)
- ✅ Messbare KPIs ableitbar (Erfolgsquote, Dauer)

**ABER:** Massive Backend-Entwicklung nötig!

---

## 6. Quick Wins (2-3 konkrete Schritte)

### Quick Win 1: Twilio Import (Mock-Daten) - 4h
**Ziel:** Zeige echte Twilio-Calls statt Platzhalter

**Schritte:**
1. Twilio SDK einbinden (`npm install twilio`)
2. Firebase Function: `importTwilioCalls()` - läuft täglich
3. Schreibe in Firestore Collection `events_raw`
4. Frontend: Lese aus Firestore statt hardcoded Array

**Code-Snippet:**
```javascript
// Firebase Function (backend)
async function importTwilioCalls() {
  const calls = await twilioClient.calls.list({ limit: 100 });

  for (const call of calls) {
    await db.collection('events_raw').doc(call.sid).set({
      type: 'voice',
      callId: call.sid,
      timestamp: call.startTime,
      duration: call.duration,
      status: mapTwilioStatus(call.status),
      phoneNumber: call.from
    });
  }
}

// Frontend (gespraeche.html)
async function loadCalls() {
  const snapshot = await db.collection('events_raw')
    .where('type', '==', 'voice')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();

  // Render in Tabelle
}
```

**Erfolg messbar:** Tabelle zeigt echte Twilio-Daten

---

### Quick Win 2: Audio-Player einbauen - 2h
**Ziel:** Kunde kann Aufnahme direkt anhören

**Schritte:**
1. HTML5 `<audio>` Element in Modal hinzufügen
2. Twilio Recording URL in Firestore speichern
3. Button "Abspielen" lädt Recording URL und spielt ab

**Code-Snippet:**
```javascript
// gespraeche.html Line 900
function playAudio(callId) {
  const call = calls.find(c => c.id === callId);

  const audioPlayer = document.createElement('audio');
  audioPlayer.src = call.recordingUrl; // von Twilio
  audioPlayer.controls = true;
  audioPlayer.play();

  // Zeige Player im Modal
  document.getElementById('audioContainer').appendChild(audioPlayer);
}
```

**Erfolg messbar:** Audio spielt direkt im Browser ab

---

### Quick Win 3: KPIs berechnen - 2h
**Ziel:** Dashboard zeigt "Anzahl Gespräche heute"

**Schritte:**
1. Firebase Function: `aggregateDailyCalls()` - läuft nachts
2. Schreibe in `metrics_daily` Collection
3. Dashboard liest Aggregation statt Roh-Events

**Struktur:**
```javascript
// metrics_daily Collection
{
  date: "2024-12-10",
  customerId: "cust_001",
  voice: {
    totalCalls: 42,
    avgDuration: 180, // Sekunden
    successRate: 0.71, // 71%
    sentimentPositive: 25,
    sentimentNeutral: 12,
    sentimentNegative: 5
  }
}
```

**Erfolg messbar:** Dashboard Widget "42 Gespräche heute"

---

## 7. Risiken

### 🔴 HOCH
1. **Twilio Quota** - Was wenn Kunde 10.000 Calls/Monat hat? (Pagination zwingend)
2. **Audio-Größe** - Twilio Recordings können groß sein (Streaming statt Download)
3. **Transkript-Kosten** - Whisper API kostet pro Minute (Budget klären!)

### 🟡 MITTEL
1. **WhatsApp-Integration fehlt** - Im Plan erwähnt, aber UI zeigt nur Voice
2. **Real-time Updates** - Aktuell müsste Kunde Seite neu laden (WebSocket?)
3. **DSGVO** - Aufnahmen speichern? Wie lange? (Rechtliche Klärung!)

### 🟢 NIEDRIG
1. **Browser-Kompatibilität** - HTML5 Audio funktioniert in allen modernen Browsern
2. **Responsive Design** - Bereits gut umgesetzt

---

## 8. Betroffene Dateien

### Haupt-Dateien:
- `customer/pages/gespraeche.html` (32 KB) - Frontend UI
- `assets/css/style.css` - Shared Styles (bereits vorhanden)

### NEU zu erstellen (Backend):
- `functions/importTwilioCalls.js` - Twilio Import (Cloud Function)
- `functions/aggregateCalls.js` - Tägliche KPI-Aggregation
- `functions/transcribeCall.js` - Whisper API Integration (Optional)

### Firestore Collections:
- `events_raw` - Roh-Events (Call, Message, etc.)
- `call_transcripts` - Transkripte (separiert wegen Größe)
- `metrics_daily` - Tägliche Aggregationen

### Zu ändern (Integration):
- `customer/dashboard.html` - KPI-Widget "Gespräche heute"
- `admin/pages/customers.html` - Modul-Toggle "Voice aktiviert"

---

## 9. MVP-Abnahmekriterien (Gespräche-Modul)

✅ **Funktional:**
1. Tabelle zeigt echte Twilio-Calls (nicht hardcoded)
2. Audio-Player funktioniert (Play/Pause)
3. CSV-Export funktioniert (Download)
4. Filter nach Datum funktioniert
5. Pagination funktioniert (20 Einträge pro Seite)

✅ **KPIs (Dashboard):**
1. "Anzahl Gespräche heute" == Summe in Tabelle
2. "Erfolgsquote" (%) korrekt berechnet
3. "Durchschnittsdauer" in Minuten

✅ **Performance:**
1. Laden der Tabelle < 2 Sekunden
2. Audio-Player startet < 3 Sekunden
3. Dashboard-KPIs laden < 1 Sekunde (aus Aggregation)

✅ **Sicherheit:**
1. Nur eingeloggter Kunde sieht seine Calls
2. Twilio Recording URLs sind time-limited (Ablaufdatum)
3. Firestore Rules: User kann nur eigene Daten lesen

---

## 10. Zusammenfassung & Nächste Schritte

### Status: 🟡 40% fertig
- ✅ **UI/UX:** 100% (modern, responsive, gut)
- ⚠️ **Backend:** 0% (komplett fehlt)
- ❌ **Daten:** 0% (nur Platzhalter)

### Empfohlene Reihenfolge:
1. **Phase 1 (1 Woche):** Twilio Import + Firestore Anbindung
2. **Phase 2 (3 Tage):** Audio-Player + Download
3. **Phase 3 (2 Tage):** KPI-Aggregation für Dashboard
4. **Phase 4 (1 Tag):** CSV-Export + Filter

### Aufwand gesamt: ~10 Arbeitstage
- Backend-Entwicklung: 6 Tage
- Frontend-Integration: 2 Tage
- Testing: 2 Tage

---

**Feedback erwünscht:**
Passt das Audit-Format? Soll ich für die anderen 8 Module genauso vorgehen?
