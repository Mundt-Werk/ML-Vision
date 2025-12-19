# 📞 Modul-Audit: Gespräche (gespraeche.html)

**Modul-Entscheidung:** ✅ **KEEP** (MVP-Kern-Modul)
**Grund:** Echte Twilio-Daten vorhanden, messbare KPIs, Kundenmehrwert klar
**Audit-Datum:** 10.12.2024
**Priorität:** 🔴 HOCH (MVP-kritisch)

---

## 1. Zweck (aus Kundensicht)

**Was soll das Modul leisten?**
- Liste aller Voice-Anrufe aus Twilio anzeigen
- Kunde sieht: Datum, Dauer, Status (erfolgreich/fehlgeschlagen)
- Audio-Aufnahme anhören (direkt aus Twilio)
- Filtern nach Datumsbereich
- Einfacher CSV-Export für Excel

**Use Cases:**
1. Kunde prüft: "Wie viele Anrufe gab es diese Woche?"
2. Kunde hört sich 2-3 Gespräche zur Qualitätskontrolle an
3. Kunde exportiert Liste für eigenes Reporting

---

## 2. Ist-Status: Was ist vorhanden?

### ✅ UI (100% fertig)
- Sidebar-Navigation (hardcoded, zeigt ALLE 9 Module)
- Filter-Sektion (Von/Bis Datum, Status-Filter)
- Tabelle mit 5 Spalten: Datum, Dauer, Ergebnis, Sentiment, Aktionen
- 5 Beispiel-Einträge (statisch)
- Modal für Gesprächsdetails
- Responsive Design (funktioniert)

### ❌ Backend/Daten (0% vorhanden)
- Keine Twilio-Anbindung
- Keine Firebase-Integration
- Alle Daten sind Platzhalter
- Audio-Buttons zeigen nur `alert()`
- Filter-Button ohne Funktion
- CSV-Export-Button ohne Funktion

---

## 3. Datenquelle & Integration

### Echte Datenquelle: Twilio Voice API ✅

**Was wir aus Twilio bekommen:**
- Call-ID (SID)
- Datum/Zeit des Anrufs
- Dauer in Sekunden
- Status (completed, busy, no-answer, failed)
- Recording-URL (Audio-Datei)
- Anrufer-Telefonnummer

**API-Endpunkt:**
```
GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json
```

**Twilio SDK:**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

const calls = await client.calls.list({ limit: 100 });
```

### Firestore-Struktur (MVP-simpel)

**Collection:** `calls` (eine Collection reicht)

**Dokument-Struktur:**
```javascript
{
  callId: "CAxxxxxxxx",           // Twilio Call SID
  customerId: "cust_001",          // Welcher Kunde
  timestamp: "2024-12-10T14:30:00Z",
  duration: 185,                   // Sekunden
  status: "completed",             // completed | busy | no-answer | failed
  phoneNumber: "+491234567890",
  recordingUrl: "https://api.twilio.com/2010-04-01/Accounts/.../Recordings/...",
  importedAt: "2024-12-10T15:00:00Z"
}
```

**Keine separaten Collections!** Alles in `calls`, simpel halten.

---

## 4. MVP-Entscheidungen

### ✅ KEEP (umsetzen)
1. **Twilio-Import** - Täglich alle Calls importieren
2. **Liste anzeigen** - Datum, Dauer, Status
3. **Audio abspielen** - Twilio Recording URL direkt im `<audio>`-Tag
4. **Filter nach Datum** - Von/Bis
5. **CSV-Export** - Einfacher Download der Tabelle
6. **Pagination** - 20 Einträge pro Seite

### 🔴 STREICHEN (raus aus MVP)
1. ~~**Transkripte**~~ - Zu teuer, zu komplex (Whisper API)
2. ~~**Sentiment-Analyse**~~ - Nice-to-have, nicht messbar kritisch
3. ~~**Keywords**~~ - Braucht Transkript, fällt weg
4. ~~**Echtzeit-Updates**~~ - WebSockets unnötig, Import 1x täglich reicht
5. ~~**Notizen/Kommentare**~~ - Später, nicht MVP
6. ~~**Sentiment-Emojis**~~ - UI zeigt es, aber ohne Daten sinnlos → raus

### 📋 BACKLOG (später)
1. **WhatsApp-Integration** - Wenn Messaging-Provider steht
2. **Search-Funktion** - Nach Telefonnummer suchen
3. **Bulk-Download** - Mehrere Audios auf einmal
4. **Transkripte** - Wenn Budget für Whisper da ist

---

## 5. Quick Wins (MVP-Umsetzung)

### Quick Win 1: Twilio Import → Firebase (1 Tag)

**Ziel:** Echte Twilio-Calls in Firestore schreiben

**Firebase Cloud Function:**
```javascript
// functions/importTwilioCalls.js
exports.importCalls = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const calls = await twilioClient.calls.list({
      startTime: yesterday,
      limit: 1000
    });

    for (const call of calls) {
      await db.collection('calls').doc(call.sid).set({
        callId: call.sid,
        customerId: getCustomerIdFromCall(call), // aus Config
        timestamp: call.startTime.toISOString(),
        duration: call.duration,
        status: call.status,
        phoneNumber: call.from,
        recordingUrl: await getRecordingUrl(call.sid),
        importedAt: new Date().toISOString()
      });
    }
  });
```

**Aufwand:** 4-6 Stunden
**Erfolg messbar:** Firestore Collection `calls` gefüllt mit echten Daten

---

### Quick Win 2: Frontend → Firestore lesen (0.5 Tage)

**Ziel:** Tabelle zeigt echte Daten statt Platzhalter

**gespraeche.html (Zeile 884+):**
```javascript
import { db } from '../../assets/js/firebase-config.js';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

async function loadCalls() {
  const q = query(
    collection(db, 'calls'),
    where('customerId', '==', currentCustomerId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  const calls = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderCallsTable(calls);
}

function renderCallsTable(calls) {
  const tbody = document.querySelector('.calls-table tbody');
  tbody.innerHTML = '';

  calls.forEach(call => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div><strong>${formatDate(call.timestamp)}</strong></div>
        <div class="call-time">${formatTime(call.timestamp)}</div>
      </td>
      <td><span class="call-duration">${formatDuration(call.duration)}</span></td>
      <td><span class="call-result ${getStatusClass(call.status)}">${getStatusText(call.status)}</span></td>
      <td>-</td> <!-- Sentiment: leer, da gestrichen -->
      <td>
        <button class="action-btn" onclick="playAudio('${call.recordingUrl}')">▶ Abspielen</button>
        <button class="action-btn" onclick="downloadAudio('${call.recordingUrl}')">⬇ Download</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
```

**Aufwand:** 3-4 Stunden
**Erfolg messbar:** Tabelle zeigt echte Twilio-Daten

---

### Quick Win 3: Audio abspielen (0.5 Tage)

**Ziel:** Button "Abspielen" spielt Twilio-Recording ab

**gespraeche.html (Zeile 900+):**
```javascript
function playAudio(recordingUrl) {
  // Twilio Recording URL direkt nutzen
  const audio = new Audio(recordingUrl);
  audio.play();

  // Optional: Player im Modal zeigen
  const modal = document.getElementById('callModal');
  modal.querySelector('.modal-body').innerHTML = `
    <audio controls autoplay>
      <source src="${recordingUrl}" type="audio/mpeg">
    </audio>
  `;
  modal.classList.add('active');
}

function downloadAudio(recordingUrl) {
  // Direkter Download
  const a = document.createElement('a');
  a.href = recordingUrl;
  a.download = `call_${Date.now()}.mp3`;
  a.click();
}
```

**Aufwand:** 2 Stunden
**Erfolg messbar:** Audio spielt ab, Download funktioniert

---

### Quick Win 4: CSV-Export (0.25 Tage)

**Ziel:** Button "Als CSV exportieren" lädt Tabelle als Excel-Datei

**gespraeche.html:**
```javascript
function exportCSV() {
  const rows = [
    ['Datum', 'Uhrzeit', 'Dauer (Sek)', 'Status', 'Telefonnummer']
  ];

  calls.forEach(call => {
    rows.push([
      formatDate(call.timestamp),
      formatTime(call.timestamp),
      call.duration,
      call.status,
      call.phoneNumber
    ]);
  });

  const csv = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `calls_${Date.now()}.csv`;
  a.click();
}
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** CSV-Download funktioniert, öffnet in Excel

---

### Quick Win 5: Filter nach Datum (0.25 Tage)

**Ziel:** Filter-Button lädt Calls im Datumsbereich

**gespraeche.html:**
```javascript
document.querySelector('.filter-button').addEventListener('click', async () => {
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  const q = query(
    collection(db, 'calls'),
    where('customerId', '==', currentCustomerId),
    where('timestamp', '>=', dateFrom),
    where('timestamp', '<=', dateTo),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  const calls = snapshot.docs.map(doc => doc.data());
  renderCallsTable(calls);
});
```

**Aufwand:** 1-2 Stunden
**Erfolg messbar:** Filter funktioniert, Tabelle wird neu geladen

---

## 6. KPIs für Dashboard

**Was das Dashboard aus diesem Modul zeigen soll:**

### Dashboard-Widget "Voice-Gespräche"
```
📞 Gespräche heute: 12
⏱️ Ø Dauer: 3:45 Min
✅ Erfolgsquote: 75% (9 von 12)
```

**Berechnung (einfach):**
```javascript
// Dashboard-Widget Daten holen
async function getVoiceKPIs() {
  const today = new Date().toISOString().split('T')[0];

  const q = query(
    collection(db, 'calls'),
    where('customerId', '==', currentCustomerId),
    where('timestamp', '>=', today)
  );

  const snapshot = await getDocs(q);
  const calls = snapshot.docs.map(doc => doc.data());

  const totalCalls = calls.length;
  const avgDuration = calls.reduce((sum, c) => sum + c.duration, 0) / totalCalls;
  const successCalls = calls.filter(c => c.status === 'completed').length;
  const successRate = (successCalls / totalCalls) * 100;

  return { totalCalls, avgDuration, successRate };
}
```

**KEINE separate `metrics_daily` Collection!**
→ Für MVP reicht Live-Berechnung (unter 1000 Calls/Tag performant genug)

---

## 7. Risiken & Mitigation

### 🔴 HOCH
**Twilio Recording URLs ablaufen**
→ URLs sind nur 24h gültig, müssen refreshed werden
→ **Lösung:** Beim Import die Recordings dauerhaft in Firebase Storage kopieren (Alternative)

### 🟡 MITTEL
**Große Kunden mit 1000+ Calls/Tag**
→ Pagination zwingend, sonst Browser-Crash
→ **Lösung:** Pagination bereits im MVP (20 Calls/Seite)

**DSGVO: Aufnahmen speichern?**
→ Rechtliche Frage: Wie lange dürfen Recordings bleiben?
→ **Lösung:** Aufnahmen nach 30 Tagen automatisch löschen (Twilio + Firebase)

### 🟢 NIEDRIG
**Twilio API Quota**
→ Free Tier: 200 Requests/Monat
→ **Lösung:** 1x täglich importieren = 30 Requests/Monat (unkritisch)

---

## 8. Betroffene Dateien

### Zu ändern:
- `customer/pages/gespraeche.html` - Firestore-Anbindung statt Platzhalter
- `customer/dashboard.html` - KPI-Widget "Voice-Gespräche"
- `admin/pages/customers.html` - Modul-Toggle "Voice aktiv: Ja/Nein"

### Neu zu erstellen:
- `functions/importTwilioCalls.js` - Twilio → Firebase Import (Cloud Function)
- `functions/cleanupOldRecordings.js` - DSGVO: Recordings nach 30 Tagen löschen

### Firestore Collections:
- `calls` - Alle Voice-Anrufe

### NICHT erstellen (gestrichen):
- ~~`call_transcripts`~~ - Transkripte fallen weg
- ~~`metrics_daily`~~ - Unnötig, Live-Berechnung reicht
- ~~`sentiment_analysis`~~ - Sentiment gestrichen

---

## 9. MVP-Abnahmekriterien

### ✅ Funktional
1. Tabelle zeigt echte Twilio-Calls (≥ 10 Einträge)
2. Audio-Player funktioniert (Play direkt im Browser)
3. CSV-Export lädt vollständige Datei
4. Filter nach Datum funktioniert
5. Pagination zeigt max. 20 Einträge

### ✅ Dashboard-KPIs
1. "Gespräche heute" = Anzahl Calls in Tabelle (heute)
2. "Ø Dauer" zeigt Minuten:Sekunden
3. "Erfolgsquote" korrekt berechnet (completed / total)

### ✅ Performance
1. Laden der Tabelle < 2 Sekunden (20 Einträge)
2. Audio-Player startet < 3 Sekunden
3. Dashboard-KPIs laden < 1 Sekunde

### ✅ Sicherheit
1. Kunde sieht nur eigene Calls (`where customerId == ...`)
2. Firestore Rules: User kann nur eigene Daten lesen
3. Twilio Credentials nur in Cloud Functions (nicht im Frontend)

---

## 10. Aufwand & Timeline

**Gesamt: 2-3 Arbeitstage**

| Task | Aufwand | Verantwortlich |
|------|---------|----------------|
| Twilio Import Cloud Function | 4-6h | Backend-Dev |
| Frontend Firestore-Anbindung | 3-4h | Frontend-Dev |
| Audio-Player + Download | 2h | Frontend-Dev |
| CSV-Export | 1-2h | Frontend-Dev |
| Filter + Pagination | 2-3h | Frontend-Dev |
| Dashboard KPI-Widget | 2h | Frontend-Dev |
| Testing + Bugfixes | 4h | QA |

**Start möglich:** Sofort (Twilio-Zugang vorhanden)

---

## 11. Zusammenfassung

### Status: 🟡 UI fertig (100%), Backend fehlt (0%)

**Modul-Entscheidung:** ✅ **KEEP - MVP-Kern**

**Begründung:**
- Echte Datenquelle (Twilio) vorhanden
- Messbare KPIs (Anzahl, Dauer, Erfolgsquote)
- Direkter Kundenmehrwert (Qualitätskontrolle)
- Umsetzung realistisch (2-3 Tage)

**Gestrichen (nicht MVP):**
- Transkripte (Whisper zu teuer)
- Sentiment-Analyse (nice-to-have)
- Keywords (braucht Transkript)
- Echtzeit-Updates (unnötig komplex)

**Nächster Schritt:**
Twilio Import implementieren → Dann Frontend anbinden → Fertig in 3 Tagen

---

**Passt dieses MVP-Audit? Soll ich so für die anderen 8 Module weitermachen?**
