# QA Checklist - ML Vision Customer Dashboard

## Phase 2 - Modul-System MVP

### ✅ Modul 0: Navigation & Modul-Flags

**Features**:
- Dynamische Sidebar mit CustomerSidebar.js
- Module-based visibility (voice, support, invoices, settings)
- Logout functionality
- Mobile responsive navigation

**Empty States**:
- N/A (Navigation ist immer sichtbar)

**Error Handling**:
- Redirect zu /public/login.html wenn nicht authentifiziert
- Fallback wenn customers.modules nicht vorhanden (alle Module aktiv)

---

### ✅ Modul 2: Support/Tickets System

**Features**:
- Ticket erstellen mit Title, Category, Priority, Body
- File Upload (max 10 MB, MIME type validation)
- Ticket-Liste mit Status-Badges (open/pending/closed)
- Ticket-Detail mit Messages Thread
- Reply-Funktion mit optionalem File Upload
- Email-Benachrichtigungen (Cloud Functions)
- Pagination (20 Tickets pro Seite)

**Empty States**:
- ✅ "Noch keine Tickets erstellt" mit Icon + CTA Button
- ✅ "Noch keine Antworten" in Ticket-Detail

**Error Handling**:
- ✅ File size validation (> 10 MB → Alert)
- ✅ File type validation (nur erlaubte MIME types)
- ✅ Firestore error catching mit console.error()
- ✅ Storage upload error handling

**Testing**:
```
□ Ticket erstellen ohne Datei
□ Ticket erstellen mit Datei (< 10 MB)
□ Ticket erstellen mit zu großer Datei (> 10 MB) → Error
□ Ticket erstellen mit falschem Dateityp → Error
□ Antwort senden ohne Datei
□ Antwort senden mit Datei
□ Datei Download aus Ticket
□ Pagination testen (> 20 Tickets)
□ Email-Benachrichtigung erhalten
```

---

### ✅ Modul 3: Rechnungen/Invoices

#### 3a: Kundenseite (rechnungen.html)

**Features**:
- Plan Card mit aktuellen Plandaten
- Rechnungs-Liste mit Filtern (Datum von/bis, Status)
- PDF-Download mit signed URLs
- Pagination (20 Rechnungen pro Seite)
- Amount formatting (Cent → Euro)
- Status-Badges (paid/open/uncollectible)

**Empty States**:
- ✅ "Noch keine Rechnungen vorhanden" mit Icon

**Error Handling**:
- ✅ PDF not found (storage/object-not-found)
- ✅ PDF unauthorized (storage/unauthorized)
- ✅ Generic download errors mit Alert

**Testing**:
```
□ Rechnung filtern nach Datum
□ Rechnung filtern nach Status
□ PDF Download (authorized)
□ PDF Download fremder Kunde (unauthorized) → Error
□ Filter zurücksetzen
□ Pagination testen
```

#### 3b: Dashboard Widget

**Features**:
- Letzte Rechnung (Nr., Datum, Beschreibung, Status, Betrag)
- Gesamtsumme aller Rechnungen
- Anzahl Rechnungen
- Link zu rechnungen.html
- Nur sichtbar wenn invoices-Modul aktiv

**Empty States**:
- ✅ "Noch keine Rechnungen vorhanden" wenn leer

**Testing**:
```
□ Widget zeigt letzte Rechnung korrekt
□ Gesamtsumme stimmt mit Einzelsummen überein
□ Widget versteckt wenn invoices-Modul deaktiviert
□ Link zu rechnungen.html funktioniert
```

#### 3c: Admin Upload

**Features**:
- Upload-Modal in Customer Details
- Formular: Rechnungs-Nr., Datum, Beschreibung, Betrag (Cent), Währung, Status, PDF
- Upload-Progress-Bar
- Firebase Storage + Firestore Integration

**Error Handling**:
- ✅ File size validation (> 10 MB)
- ✅ File type validation (nur PDF)
- ✅ Upload error catching

**Testing**:
```
□ Rechnung hochladen für Kunde
□ Rechnung mit zu großer Datei → Error
□ Rechnung mit falschem Dateityp → Error
□ Progress Bar zeigt Fortschritt
□ Rechnung erscheint in Kundenseite
```

---

### ✅ Modul 4: Einstellungen

**Features**:
- Profil-Sektion (Name, Email, Telefon)
- Passwort-Änderung (Firebase Auth Re-Authentication)
- Benachrichtigungs-Toggles (Email, Tickets, Invoices)
- Live-Update in Firestore

**Empty States**:
- N/A (Formular ist immer sichtbar)

**Error Handling**:
- ✅ Passwort stimmt nicht überein → Error Message
- ✅ Passwort zu kurz (< 6 Zeichen) → Error Message
- ✅ Aktuelles Passwort falsch → "Das aktuelle Passwort ist falsch"
- ✅ Schwaches Passwort → "Das Passwort ist zu schwach"
- ✅ Success/Error Messages mit Auto-Hide (5s)

**Testing**:
```
□ Profil aktualisieren (Name, Email, Telefon)
□ Passwort ändern erfolgreich
□ Passwort ändern mit falschem alten Passwort → Error
□ Passwort ändern mit nicht übereinstimmenden Passwörtern → Error
□ Passwort ändern mit zu kurzem Passwort → Error
□ Benachrichtigungs-Toggles umschalten
□ Änderungen persistieren nach Reload
```

---

### ✅ Task 4: Dashboard-Konsistenz

**Features**:
- **Gespräche-Widget** (nur wenn voice-Modul aktiv):
  - Gespräche heute (Count)
  - Ø Gesprächsdauer (Minuten)
  - Erfolgsquote (% abgeschlossene Calls)
- **Tickets-Widget** (nur wenn support-Modul aktiv):
  - Offene Tickets (Count)
- **Rechnungen-Widget** (nur wenn invoices-Modul aktiv):
  - Letzte Rechnung + Gesamtsumme
- **User Info Card**: Avatar, Name, Email, Plan

**Empty States**:
- ✅ Widgets zeigen "0" wenn keine Daten
- ✅ Widgets versteckt wenn Modul deaktiviert

**Testing**:
```
□ Gespräche Widget zeigt korrekte Zahlen (vs. gespraeche.html)
□ Tickets Widget zeigt korrekte Anzahl offener Tickets
□ Rechnungen Widget zeigt letzte Rechnung korrekt
□ Widgets verschwinden bei deaktivierten Modulen
□ User Info zeigt korrekten Avatar/Name/Email/Plan
```

---

## ✅ Task 5: Security & Performance

### Firestore Rules

**Access Control**:
- ✅ `isOwner(customerId)` prüft customerId aus users collection
- ✅ Modul-basierte Access Control mit `hasModuleEnabled()`
- ✅ Default deny all

**Collections**:
- ✅ **calls**: Read nur mit voice-Modul + customerId match
- ✅ **tickets**: Read/Create/Update nur mit support-Modul + customerId match
- ✅ **invoices**: Read nur mit invoices-Modul + customerId match
- ✅ **customers**: Kunde kann Profil ändern, aber NICHT modules-Feld
- ✅ **users**: User kann eigene Daten lesen

**Testing**:
```
□ Kunde A kann Daten von Kunde B NICHT lesen (calls)
□ Kunde A kann Daten von Kunde B NICHT lesen (tickets)
□ Kunde A kann Daten von Kunde B NICHT lesen (invoices)
□ Kunde kann modules-Feld NICHT ändern
□ Admin kann alle Daten lesen/schreiben
```

### Storage Rules

**Access Control**:
- ✅ tickets/{customerId}/{ticketId}/ - nur eigene Dateien
- ✅ invoices/{customerId}/ - nur eigene PDFs lesen, Admin schreiben
- ✅ File size validation (max 10 MB)
- ✅ MIME type validation
- ✅ Default deny all

**Testing**:
```
□ Kunde A kann Datei von Kunde B NICHT downloaden (tickets)
□ Kunde A kann PDF von Kunde B NICHT downloaden (invoices)
□ File Upload > 10 MB wird abgelehnt
□ File Upload mit falschem MIME type wird abgelehnt
```

### Firestore Indexes

**Indexes**:
- ✅ calls: (customerId, timestamp desc)
- ✅ tickets: (customerId, updatedAt desc)
- ✅ tickets: (customerId, status, updatedAt desc)
- ✅ invoices: (customerId, date desc)
- ✅ invoices: (customerId, status, date desc)
- ✅ messages: (createdAt asc)

**Performance**:
```
□ Listenabfragen laden ≤ 300ms bei 20 Items
□ Keine "missing index" Fehler in Console
```

---

## Error Handling Patterns

### Firestore Errors
```javascript
try {
  await someFirestoreOperation();
} catch (error) {
  console.error('Error:', error);
  // User-friendly error message
  alert('Fehler: ' + error.message);
}
```

### Storage Errors
```javascript
try {
  const url = await getDownloadURL(storageRef);
} catch (error) {
  if (error.code === 'storage/object-not-found') {
    alert('Datei nicht gefunden.');
  } else if (error.code === 'storage/unauthorized') {
    alert('Zugriff verweigert.');
  } else {
    alert('Fehler: ' + error.message);
  }
}
```

### Auth Errors
```javascript
try {
  await updatePassword(currentUser, newPassword);
} catch (error) {
  if (error.code === 'auth/wrong-password') {
    errorMsg = 'Das aktuelle Passwort ist falsch';
  } else if (error.code === 'auth/weak-password') {
    errorMsg = 'Das Passwort ist zu schwach';
  }
  showError('passwordErrorMessage', errorMsg);
}
```

---

## Module Visibility Matrix

| Modul | File | Condition |
|-------|------|-----------|
| Dashboard | customer/dashboard.html | Always visible |
| Gespräche | customer/pages/gespraeche.html | `modules.voice === true` |
| Support | customer/pages/support.html | `modules.support === true` |
| Rechnungen | customer/pages/rechnungen.html | `modules.invoices === true` |
| Einstellungen | customer/pages/einstellungen.html | Always visible |

## Known Limitations / Future Improvements

1. **Pagination**: Client-side pagination (könnte server-side sein für sehr große Datenmengen)
2. **Real-time Updates**: Keine real-time listeners (würde mit onSnapshot implementiert werden)
3. **Search**: Keine Volltextsuche in Tickets/Invoices
4. **Stripe Integration**: Noch nicht implementiert (Phase 2b)
5. **Admin Queue**: Ticket-Verwaltung für Support-Team noch nicht implementiert

---

## Deployment Checklist

### Firebase Config
```
□ .firebaserc konfiguriert mit Projekt-ID
□ firebase.json enthält alle Services (firestore, storage, functions, hosting)
□ Environment Variables für Cloud Functions gesetzt (EMAIL_USER, EMAIL_PASSWORD)
```

### Rules Deployment
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Indexes Deployment
```bash
firebase deploy --only firestore:indexes
```

### Functions Deployment
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Hosting Deployment
```bash
firebase deploy --only hosting
```

---

## Support / Handover

**Dokumentation**:
- FIRESTORE_SCHEMA.md - Vollständige Datenbankstruktur
- firestore.rules - Sicherheitsregeln mit Kommentaren
- storage.rules - Storage-Sicherheitsregeln
- firestore.indexes.json - Performante Indexes
- QA_CHECKLIST.md - Diese Datei

**Kontakt bei Fragen**:
- Claude Code Implementation
- Generated with Claude Code (https://claude.com/claude-code)

**Letzte Aktualisierung**: 2025-12-10
