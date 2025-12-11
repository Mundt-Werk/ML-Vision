# 🧠 Claude Memory - ML Vision Dashboard Projekt

**Letzte Aktualisierung**: 2025-12-11
**Projekt**: ML Vision Customer Dashboard (Firebase + Vanilla JS)
**Status**: Phase 2 abgeschlossen, Bug-Fixing & Testing läuft

---

## 📌 PROJEKT-ÜBERSICHT

### Was ist das Projekt?
Kundenverwaltungs-Dashboard für ML Vision mit 4 Modulen:
1. **Voice/Gespräche** - Twilio Call Import & Verwaltung
2. **Support/Tickets** - Support-Ticket-System mit Messages
3. **Invoices/Rechnungen** - Rechnungsverwaltung mit PDF-Upload
4. **Settings/Einstellungen** - Kundenprofil & Passwort-Änderung

### Architektur
- **Frontend**: Vanilla JavaScript (kein Framework!)
- **Backend**: Firebase (Firestore DB, Auth, Storage)
- **Hosting**: Static Files (kein Node.js Server)
- **Styling**: Custom CSS (kein Framework)

### Module-System
Jedes Modul kann pro Kunde aktiviert/deaktiviert werden:
```javascript
// customers/{customerId}
{
  modules: {
    voice: true,
    support: true,
    invoices: true,
    settings: true  // Immer aktiv
  }
}
```

---

## 🏗️ PROJEKTSTRUKTUR

```
D:\Projekte\Kunden\ML_Vision\Brand\Webdesign\
├── admin/
│   └── pages/
│       ├── tickets.html        ← NEUE Admin-Ticket-Verwaltung
│       ├── users.html
│       ├── customers.html
│       └── leads-bot.html
├── customer/
│   ├── dashboard.html          ← Hauptseite mit echten Daten
│   └── pages/
│       ├── gespraeche.html     ← Voice-Modul
│       ├── support.html        ← Ticket-System (HEUTE GEFIXED)
│       ├── rechnungen.html     ← Invoices
│       └── einstellungen.html  ← Settings
├── assets/
│   ├── js/
│   │   ├── firebase-config.js  ← Firebase Setup (HEUTE GEFIXED)
│   │   └── components/
│   │       └── CustomerSidebar.js ← Dynamische Navigation
│   └── css/
├── public/
│   └── login.html
├── scripts/
│   └── seed-test-data-browser.html ← Testdaten-Generator
├── firestore.rules              ← HEUTE AKTUALISIERT
├── firestore.indexes.json
└── storage.rules                ← MORGEN KONFIGURIEREN
```

---

## 🔥 WICHTIGE FIREBASE-DETAILS

### Collections
```javascript
// Firestore Collections
customers/          // Kundendaten + modules object
users/              // Auth-User → customerId mapping
calls/              // Voice: Twilio Calls (customerId, timestamp, duration, status)
tickets/            // Support: Tickets (customerId, title, body, category, priority, status)
  └── {ticketId}/messages/  // Subcollection: Messages (sender, message, files, createdAt)
invoices/           // Rechnungen (customerId, invoiceNo, amountGross, status, pdfPath)
```

### Firestore Rules - Wichtige Pattern
```javascript
// Helper Functions
function isAuthenticated() {
  return request.auth != null;
}

function isAdmin() {
  return isAuthenticated() &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function hasModuleEnabled(customerId, moduleName) {
  let customer = get(/databases/$(database)/documents/customers/$(customerId)).data;
  return customer.modules[moduleName] == true;
}

// Collection Pattern
allow read: if isAuthenticated() && (
  (isAdmin()) ||
  (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.customerId == resource.data.customerId &&
   hasModuleEnabled(resource.data.customerId, 'modulename'))
);
```

### Firebase Storage (IN SETUP)
**Status**: User macht gerade Blaze Plan Upgrade
**Benötigt für**: File-Uploads in Tickets + PDF-Upload für Invoices

**Storage Rules** (noch zu deployen):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tickets/{customerId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024; // Max 10 MB
    }
    match /invoices/{customerId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🐛 HEUTE GEFIXTE BUGS (2025-12-11)

### Bug 1: customerId undefined
**Problem**: Alle Customer-Seiten hatten "customerId is undefined" Fehler
**Ursache**: Fehlende Validierung beim Laden des User-Documents
**Fix**: Validierung in allen Seiten (dashboard.html, gespraeche.html, support.html, etc.)
```javascript
const userDoc = await getDoc(doc(db, 'users', user.uid));
if (!userDoc.exists()) {
    alert('Ihr Benutzerprofil wurde nicht gefunden.');
    return;
}
const userData = userDoc.data();
if (!userData.customerId) {
    alert('Ihre Kundennummer fehlt.');
    return;
}
currentCustomerId = userData.customerId;
```

### Bug 2: Storage Export fehlt
**Problem**: `storage` import fehlte in firebase-config.js
**Betroffen**: support.html, rechnungen.html
**Fix**: firebase-config.js:7-8
```javascript
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
const storage = getStorage(app);
export { app, auth, db, storage, analytics };
```

### Bug 3: Firestore Permission Denied
**Problem**: Collection queries wurden blockiert
**Ursache**: Rules verwendeten `isOwner()` Helper der nicht für queries funktionierte
**Fix**: Direkte customerId-Comparison in allen Collections
```javascript
// Vorher (funktionierte nicht für queries):
allow read: if isOwner(resource.data.customerId);

// Nachher (funktioniert):
allow read: if isAuthenticated() && (
  (isAdmin()) ||
  (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.customerId == resource.data.customerId)
);
```

### Bug 4: Composite Indexes fehlen
**Problem**: "The query requires an index" Fehler
**Fix**: User hat Indexes via Firebase Console Links erstellt:
- `calls`: (customerId ASC, timestamp DESC)
- `invoices`: (customerId ASC, date DESC)
- `tickets`: (customerId ASC, updatedAt DESC)

### Bug 5: Ticket Messages zeigen "undefined"/"leer" (KRITISCH!)
**Symptome**:
- Kunde erstellt Ticket → Admin sieht "undefined" als Nachricht
- Admin antwortet → Kunde sieht leere Nachricht

**Root Causes + Fixes**:

1. **Erste Nachricht fehlte in Subcollection**
   - Problem: `body` nur in Ticket-Document, nicht in messages subcollection
   - Fix: support.html:546-554
   ```javascript
   const docRef = await addDoc(collection(db, 'tickets'), ticketData);

   // CREATE FIRST MESSAGE IN SUBCOLLECTION
   const firstMessage = {
       sender: 'customer',
       message: body,
       files: files,
       createdAt: now
   };
   await addDoc(collection(db, 'tickets', docRef.id, 'messages'), firstMessage);
   ```

2. **Field-Name Mismatch**
   - Problem: Code verwendete `text` statt `message`
   - Fix: support.html:208 + admin/tickets.html:326
   ```javascript
   // Vorher:
   text: text

   // Nachher:
   message: text
   ```

3. **Message Display Bug**
   - Problem: Code verwendete `msg.author`, `msg.authorName`, `msg.text`
   - Fix: support.html:456-465, tickets.html:362-370
   ```javascript
   // Korrekt:
   msg.sender      // 'customer' oder 'admin'
   msg.message     // Der Nachrichtentext
   msg.files       // Array von File-Objekten
   msg.createdAt   // ISO String oder Firestore Timestamp
   ```

4. **"Invalid Date" Display**
   - Problem: Gemischte Timestamp-Formate (Firestore Timestamp vs ISO Strings)
   - Fix: admin/tickets.html:98-104
   ```javascript
   function toDate(timestamp) {
       if (!timestamp) return null;
       if (timestamp.toDate) return timestamp.toDate(); // Firestore Timestamp
       return new Date(timestamp); // ISO String
   }
   ```

5. **Kategorie-Mapping**
   - Problem: Select values waren "Frage"/"Problem" aber System erwartet "question"/"problem"
   - Fix: support.html:159-163
   ```javascript
   <select id="ticketCategory">
       <option value="question">Frage</option>
       <option value="problem">Problem</option>
       <option value="feature">Feature-Request</option>
   </select>

   // Display Helper:
   function getCategoryText(category) {
       const map = { 'question': 'Frage', 'problem': 'Problem', 'feature': 'Feature-Request' };
       return map[category] || category;
   }
   ```

---

## 🆕 NEUE FEATURES (HEUTE IMPLEMENTIERT)

### Admin Ticket-Verwaltung (/admin/pages/tickets.html)
**Komplettes Admin-Interface für Ticket-Management** (634 Zeilen)

Features:
- ✅ Ticket-Tabelle mit allen Tickets (alle Kunden)
- ✅ Filter-Chips (All/Open/Pending/Closed)
- ✅ Status-Badges (color-coded)
- ✅ Ticket-Detail-Modal mit Messages-Thread
- ✅ Admin-Reply mit File-Upload
- ✅ Status-Change Dropdown
- ✅ Customer-Name Anzeige (via customerId lookup)
- ✅ Date-Handling für gemischte Timestamp-Formate

Firestore Queries:
```javascript
// Load all tickets
const q = query(
    collection(db, 'tickets'),
    orderBy('updatedAt', 'desc')
);

// Load messages for ticket
const messagesQuery = query(
    collection(db, 'tickets', ticketId, 'messages'),
    orderBy('createdAt', 'asc')
);
```

---

## 🔄 FILE-UPLOAD STATUS (IN PROGRESS)

### Aktueller Stand
**Status**: ⏳ Wartet auf Firebase Blaze Plan Upgrade
**User-Aktion**: Macht gerade Upgrade im Firebase Console

### Was vorbereitet ist
1. ✅ Upload-Code in support.html (Zeile 505-546)
2. ✅ Error-Handling mit Console-Logs
3. ✅ File-Size Validation (max 10 MB)
4. ✅ Fallback wenn Upload fehlschlägt (Ticket ohne Datei erstellen)
5. ⏳ Storage Rules müssen noch deployed werden (siehe oben)

### Code-Snippet (support.html:517-543)
```javascript
try {
    console.log('Starting file upload...');
    btn.textContent = 'Lade Datei hoch...';

    const timestamp = Date.now();
    const storageRef = ref(storage, `tickets/${currentCustomerId}/temp_${timestamp}/${file.name}`);
    console.log('Upload path:', storageRef.fullPath);

    await uploadBytes(storageRef, file);
    console.log('File uploaded, getting download URL...');

    const fileUrl = await getDownloadURL(storageRef);
    console.log('Download URL received:', fileUrl);

    files.push({
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
    });
} catch (uploadError) {
    console.error('File upload failed:', uploadError);
    alert('Datei-Upload fehlgeschlagen: ' + uploadError.message + '\n\nTicket wird ohne Datei erstellt.');
    // Continue without file
}
```

### Nächste Schritte (MORGEN)
1. ✅ User beendet Blaze Plan Upgrade
2. 🔲 Storage Rules deployen (siehe oben)
3. 🔲 File-Upload testen (mit Console-Logs)
4. 🔲 Error-Handling testen
5. 🔲 Gleiches System für Admin-Replies

---

## 📊 TESTDATEN

### Test-Customer
```javascript
// customers/cust_test
{
  customerId: 'cust_test',
  name: 'Test Firma GmbH',
  email: 'kontakt@testfirma.de',
  modules: {
    voice: true,
    support: true,
    invoices: true,
    settings: true
  },
  planName: 'Professional Plan',
  planPrice: 79
}
```

### Test-User
```javascript
// Firebase Auth
Email: test@mlvision.de
Password: testpassword123

// users/{uid}
{
  uid: '{firebase-auth-uid}',
  email: 'test@mlvision.de',
  role: 'customer',
  customerId: 'cust_test'
}
```

### Testdaten erstellen
Tool: `scripts/seed-test-data-browser.html`
- Als Admin einloggen
- HTML-Datei im Browser öffnen
- Button "Testdaten generieren" klicken
- Erstellt: 35 Calls, 8 Tickets mit Messages, 5 Invoices

---

## ⚙️ WICHTIGE CODE-PATTERNS

### CustomerId Validation (ÜBERALL verwenden!)
```javascript
const userDoc = await getDoc(doc(db, 'users', user.uid));
if (!userDoc.exists()) {
    console.error('User document not found');
    alert('Ihr Benutzerprofil wurde nicht gefunden.');
    return;
}

const userData = userDoc.data();
if (!userData.customerId) {
    console.error('customerId not found');
    alert('Ihre Kundennummer fehlt.');
    return;
}

currentCustomerId = userData.customerId;
```

### Message Storage Pattern (Tickets)
```javascript
// IMMER beide erstellen:
// 1. Ticket Document
const ticketData = { customerId, title, body, category, priority, status, createdAt, updatedAt };
const docRef = await addDoc(collection(db, 'tickets'), ticketData);

// 2. First Message in Subcollection
const firstMessage = { sender: 'customer', message: body, files: [], createdAt };
await addDoc(collection(db, 'tickets', docRef.id, 'messages'), firstMessage);
```

### Date Handling (ÜBERALL verwenden!)
```javascript
// Helper für gemischte Formate
function toDate(timestamp) {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate(); // Firestore Timestamp
    return new Date(timestamp); // ISO String
}

// Usage
const date = toDate(ticket.createdAt);
const formatted = date.toLocaleString('de-DE');
```

### File Upload Error-Handling
```javascript
try {
    // Upload code...
} catch (uploadError) {
    console.error('File upload failed:', uploadError);
    alert('Datei-Upload fehlgeschlagen: ' + uploadError.message);
    // WICHTIG: Continue without file, nicht abort!
}
```

---

## 🚨 HÄUFIGE FEHLER & LÖSUNGEN

### "customerId is undefined"
→ Validierung fehlt (siehe Pattern oben)

### "Missing or insufficient permissions"
→ Firestore Rules deployen: `firebase deploy --only firestore:rules`

### "The query requires an index"
→ Composite Index in Firebase Console erstellen (Link wird im Error angezeigt)

### "storage is not exported"
→ firebase-config.js prüfen, storage muss exportiert sein

### "Invalid Date"
→ toDate() Helper verwenden für gemischte Timestamp-Formate

### Ticket Messages zeigen "undefined"
→ Prüfen ob:
1. Erste Nachricht in messages subcollection erstellt wird
2. Field-Name `message` (nicht `text`) verwendet wird
3. `msg.sender` und `msg.message` für Display verwendet wird

---

## 📝 GIT WORKFLOW

### Aktueller Branch
`main` (kein Feature-Branch-Workflow)

### Commit-Pattern
```bash
# Format: <type>: <description>
feat: Neue Feature-Implementierung
fix: Bug-Fix
docs: Dokumentation
refactor: Code-Refactoring
```

### Aktuelle Git-Situation
```
? leads_bot/          # Untracked: Separate Node.js App
? SESSION_NOTES.md    # Wird jetzt gelöscht (veraltet)
```

---

## 🎯 NÄCHSTE TASKS (MORGEN)

### Sofort-Tasks
1. 🔲 **Firebase Storage Setup abschließen**
   - User beendet Blaze Plan Upgrade
   - Storage Rules deployen (siehe oben)
   - File-Upload testen

2. 🔲 **Testing mit Browser Console**
   - Ticket mit File erstellen
   - Console-Logs prüfen
   - Error-Handling testen

3. 🔲 **Admin-Reply File-Upload**
   - Gleiches Pattern wie Customer-Upload
   - Testen

### Optional (später)
- 🔲 PDF-Upload für Invoices-Modul
- 🔲 Email-Notifications für Tickets (Cloud Functions)
- 🔲 Admin-Bereich uncommitted changes reviewen

---

## 💡 WICHTIGE HINWEISE FÜR CLAUDE

### User-Präferenzen
- **Keine Emojis** in Code oder Responses (außer explizit gewünscht)
- **Kosten vermeiden** - Firebase Spark Plan bevorzugen, nur Blaze wenn nötig
- **Vanilla JS** - Kein Framework, kein Build-Process
- **Deutsche UI** - Alle User-facing Texte auf Deutsch
- **Einfache Lösungen** - Nicht over-engineeren

### Code-Style
- Keine TypeScript
- Keine JSDoc-Comments (außer wichtige Funktionen)
- Imports immer von CDN (Firebase 10.8.0)
- CSS: Custom, kein Framework
- Error-Handling: Immer mit Console-Logs + User-friendly Alerts

### Testing-Approach
- Browser Console für Debugging
- Test-User: test@mlvision.de
- Testdaten via scripts/seed-test-data-browser.html
- Firebase Console für Rules/Indexes

### Deployment
- Static Files (kein Server)
- Firebase Hosting (später)
- Rules manuell deployen: `firebase deploy --only firestore:rules`

---

## 📚 WICHTIGE DATEIEN (REFERENZ)

### Core Files
- `assets/js/firebase-config.js` - Firebase Setup & Exports
- `assets/js/components/CustomerSidebar.js` - Dynamische Navigation
- `firestore.rules` - Security Rules
- `firestore.indexes.json` - Composite Indexes
- `storage.rules` - Storage Security (noch zu deployen)

### Customer Pages
- `customer/dashboard.html` - Hauptseite mit Stats
- `customer/pages/support.html` - Ticket-System (HEUTE GEFIXED)
- `customer/pages/gespraeche.html` - Voice/Calls
- `customer/pages/rechnungen.html` - Invoices
- `customer/pages/einstellungen.html` - Settings

### Admin Pages
- `admin/pages/tickets.html` - NEUE Ticket-Verwaltung
- `admin/pages/users.html` - User-Verwaltung
- `admin/pages/customers.html` - Customer-Verwaltung
- `admin/pages/leads-bot.html` - Leads-Bot Config

### Scripts
- `scripts/seed-test-data-browser.html` - Testdaten-Generator
- `scripts/README.md` - Seeding-Dokumentation

---

**Zuletzt bearbeitet**: 2025-12-11 (Feierabend)
**Nächste Session**: Firebase Storage Setup + File-Upload Testing
**Aktueller Status**: Bug-Fixing abgeschlossen, wartet auf Storage-Upgrade
