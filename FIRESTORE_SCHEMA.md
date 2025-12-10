# Firestore Schema - ML Vision Dashboard

## Collections Übersicht

```
firestore
├── users (Firebase Auth Users)
├── customers (Kunden-Stammdaten)
├── calls (Voice-Gespräche)
├── tickets (Support-Tickets)
└── invoices (Rechnungen)
```

---

## 1. Collection: `users`

**Zweck:** Authentifizierung und User-Rollen
**Document ID:** Firebase Auth UID

```javascript
{
  uid: "firebase_auth_uid_123",
  email: "kunde@firma.de",
  role: "customer",              // "admin" | "customer"
  customerId: "cust_001",         // Verknüpfung zu customers
  createdAt: "2024-12-10T10:00:00Z",
  lastLogin: "2024-12-10T14:30:00Z"
}
```

**Firestore Rules:**
```javascript
match /users/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
  allow write: if isAdmin();
}
```

---

## 2. Collection: `customers`

**Zweck:** Kunden-Stammdaten + Modul-Aktivierungen
**Document ID:** Custom (z.B. `cust_001`)

```javascript
{
  customerId: "cust_001",
  name: "Firma GmbH",
  email: "kontakt@firma.de",
  phone: "+49 123 456789",

  // Modul-Flags (Feature-Toggles)
  modules: {
    voice: true,        // Gespräche-Modul
    support: true,      // Support-Modul
    invoices: true,     // Rechnungen-Modul
    settings: true      // Einstellungen (immer true)
  },

  // Stripe Integration
  stripeCustomerId: "cus_stripe123",
  stripeSubscriptionId: "sub_stripe456",
  planName: "Business Plan",
  planPrice: 79,
  planFeatures: [
    "500 Voice-Calls/Monat",
    "WhatsApp Integration",
    "E-Mail Support"
  ],

  // Twilio Integration
  twilioPhoneNumber: "+49 30 12345678",  // Mapping für Call-Import

  // Benachrichtigungen
  notifications: {
    email: true,
    tickets: true,
    invoices: false
  },

  createdAt: "2024-11-01T10:00:00Z",
  updatedAt: "2024-12-10T15:00:00Z"
}
```

**Firestore Rules:**
```javascript
match /customers/{customerId} {
  allow read: if isOwner(customerId) || isAdmin();
  allow update: if isOwner(customerId) || isAdmin();
  allow create, delete: if isAdmin();
}
```

---

## 3. Collection: `calls`

**Zweck:** Voice-Gespräche (Twilio Import)
**Document ID:** Twilio Call SID

```javascript
{
  callId: "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",  // Twilio SID
  customerId: "cust_001",
  timestamp: "2024-12-10T14:32:00Z",
  duration: 185,                    // Sekunden
  status: "completed",              // completed | failed | unknown
  phoneNumber: "+491234567890",     // Anrufer
  recordingUrl: "https://api.twilio.com/2010-04-01/.../Recordings/...mp3",

  // Optional: Twilio Meta-Daten
  twilioData: {
    direction: "inbound",           // inbound | outbound
    price: "-0.013",
    priceUnit: "USD"
  },

  importedAt: "2024-12-10T15:00:00Z"
}
```

**Firestore Rules:**
```javascript
match /calls/{callId} {
  allow read: if isOwner(resource.data.customerId) || isAdmin();
  allow write: if false; // Nur via Cloud Functions
}
```

**Indexes:**
```javascript
// customerId + timestamp (DESC) - für Liste
// customerId + timestamp (ASC/DESC) + status - für Filter
```

---

## 4. Collection: `tickets`

**Zweck:** Support-Tickets
**Document ID:** Auto-generiert

```javascript
{
  ticketId: "ticket_auto_generated_id",
  customerId: "cust_001",
  title: "Wie exportiere ich Gespräche?",
  body: "Ich finde den Export-Button nicht. Können Sie mir helfen?",
  category: "Frage",               // Frage | Problem | Feature-Request
  status: "open",                   // open | pending | closed
  priority: "normal",               // low | normal | high

  // File attachments (initial message)
  files: [
    {
      fileName: "screenshot.png",
      fileUrl: "gs://ml-vision/tickets/cust_001/ticket_123/screenshot.png",
      fileSize: 245680,             // bytes
      mimeType: "image/png",
      uploadedAt: "2024-12-10T14:30:00Z"
    }
  ],

  lastAgent: "support@ml-vision.de",  // E-Mail des letzten Agents (optional)

  createdAt: "2024-12-10T14:30:00Z",
  updatedAt: "2024-12-10T15:00:00Z"
}
```

### Subcollection: `tickets/{ticketId}/messages`

**Zweck:** Nachrichten-Thread für Ticket
**Document ID:** Auto-generiert

```javascript
{
  messageId: "msg_auto_generated_id",
  ticketId: "ticket_123",
  author: "customer",              // customer | support
  authorId: "user_uid_123",        // Firebase Auth UID
  authorName: "Max Mustermann",
  text: "Vielen Dank für die schnelle Antwort!",

  // Optional: File attachments pro Nachricht
  files: [
    {
      fileName: "additional_info.pdf",
      fileUrl: "gs://ml-vision/tickets/cust_001/ticket_123/msg_456/additional_info.pdf",
      fileSize: 156200,
      mimeType: "application/pdf",
      uploadedAt: "2024-12-10T15:05:00Z"
    }
  ],

  createdAt: "2024-12-10T15:05:00Z"
}
```

**Firestore Rules:**
```javascript
match /tickets/{ticketId} {
  allow read: if isOwner(resource.data.customerId) || isAdmin();
  allow create: if isOwner(request.resource.data.customerId);
  allow update: if isOwner(resource.data.customerId) || isAdmin();
  allow delete: if isAdmin();

  // Subcollection: messages
  match /messages/{messageId} {
    allow read: if isOwner(get(/databases/$(database)/documents/tickets/$(ticketId)).data.customerId) || isAdmin();
    allow create: if isAuthenticated() &&
                     (isOwner(get(/databases/$(database)/documents/tickets/$(ticketId)).data.customerId) || isAdmin());
    allow update, delete: if isAdmin();
  }
}
```

**Storage Rules:**
```javascript
match /tickets/{customerId}/{ticketId}/{allPaths=**} {
  allow read: if isOwner(customerId) || isAdmin();
  allow write: if isOwner(customerId) &&
                  request.resource.size < 10 * 1024 * 1024 && // max 10 MB
                  request.resource.contentType.matches('image/.*|application/pdf|text/.*');
}
```

**Indexes:**
```javascript
// customerId + updatedAt (DESC) - für Liste
// customerId + status + updatedAt (DESC) - für Filter
```

---

## 5. Collection: `invoices`

**Zweck:** Rechnungen (Stripe Import)
**Document ID:** Stripe Invoice ID

```javascript
{
  invoiceId: "in_stripe_invoice_123",
  customerId: "cust_001",
  invoiceNumber: "INV-2024-001",
  date: "2024-12-01T00:00:00Z",
  amount: 79.00,                    // Euro
  currency: "eur",
  status: "paid",                   // paid | open | uncollectible
  pdfUrl: "https://pay.stripe.com/invoice/.../pdf",
  hostedInvoiceUrl: "https://invoice.stripe.com/i/...",

  // Optional: Stripe Meta-Daten
  stripeData: {
    subtotal: 79.00,
    tax: 0.00,
    total: 79.00
  },

  importedAt: "2024-12-10T04:00:00Z"
}
```

**Firestore Rules:**
```javascript
match /invoices/{invoiceId} {
  allow read: if isOwner(resource.data.customerId) || isAdmin();
  allow write: if false; // Nur via Cloud Functions
}
```

**Indexes:**
```javascript
// customerId + date (DESC) - für Liste
// customerId + status + date (DESC) - für Filter
```

---

## Modul-Flags im Detail

### Verwendung in `customers.modules`

```javascript
customers/{customerId}.modules = {
  voice: boolean,      // Gespräche-Modul
  support: boolean,    // Support-Modul
  invoices: boolean,   // Rechnungen-Modul
  settings: true       // Immer aktiv (Profil, Passwort)
}
```

### Standard-Konfiguration (neuer Kunde)

```javascript
modules: {
  voice: true,      // Aktiviert
  support: true,    // Aktiviert
  invoices: true,   // Aktiviert
  settings: true    // Immer aktiv
}
```

### Beispiel: Eingeschränkter Kunde

```javascript
modules: {
  voice: false,     // Kein Voice-Modul
  support: true,    // Nur Support
  invoices: true,   // Nur Rechnungen
  settings: true    // Einstellungen
}
```

**Ergebnis:** Sidebar zeigt nur: Dashboard, Support, Rechnungen, Einstellungen

---

## Admin-Panel Integration

### Modul-Aktivierung im Admin-Panel

**In:** `admin/pages/customers.html`

```html
<div class="checkbox-group">
  <div class="checkbox-item">
    <label for="moduleVoice">Voice (Gespräche)</label>
    <input type="checkbox" id="moduleVoice" name="modules.voice">
  </div>
  <div class="checkbox-item">
    <label for="moduleSupport">Support (Tickets)</label>
    <input type="checkbox" id="moduleSupport" name="modules.support">
  </div>
  <div class="checkbox-item">
    <label for="moduleInvoices">Invoices (Rechnungen)</label>
    <input type="checkbox" id="moduleInvoices" name="modules.invoices">
  </div>
</div>
```

**Firestore Update:**
```javascript
await updateDoc(doc(db, 'customers', customerId), {
  'modules.voice': true,
  'modules.support': true,
  'modules.invoices': false
});
```

---

## Security Considerations

### 1. Module-basierte Access Control

**Frontend-Guard:**
```javascript
import { checkModuleAccess } from './assets/js/components/CustomerSidebar.js';

// Bei Seitenaufruf prüfen
const hasAccess = await checkModuleAccess(customerId, 'voice');
if (!hasAccess) {
  window.location.href = '../dashboard.html';
}
```

**Backend-Guard (Firestore Rules):**
```javascript
// Prüfe ob Modul aktiviert ist
function hasModuleEnabled(customerId, moduleName) {
  return get(/databases/$(database)/documents/customers/$(customerId)).data.modules[moduleName] == true;
}

match /calls/{callId} {
  allow read: if isOwner(resource.data.customerId) &&
                 hasModuleEnabled(resource.data.customerId, 'voice');
}
```

### 2. Modul-Flags sind Read-Only für Kunden

```javascript
match /customers/{customerId} {
  // Kunde darf Profil ändern, aber nicht modules
  allow update: if isOwner(customerId) &&
                   !request.resource.data.diff(resource.data).affectedKeys().hasAny(['modules']);
}
```

---

## Migration bestehender Kunden

### Script zum Initialisieren der Module-Flags

```javascript
// Alle Customers ohne modules-Feld updaten
const customersSnapshot = await db.collection('customers').get();

for (const doc of customersSnapshot.docs) {
  if (!doc.data().modules) {
    await doc.ref.update({
      modules: {
        voice: true,
        support: true,
        invoices: true,
        settings: true
      }
    });
  }
}
```

---

## Monitoring & Analytics

### Dashboard-Statistik: Modul-Nutzung

```javascript
// Zähle wie viele Kunden welche Module nutzen
const stats = {
  voice: 0,
  support: 0,
  invoices: 0
};

const snapshot = await db.collection('customers').get();
snapshot.docs.forEach(doc => {
  const modules = doc.data().modules || {};
  if (modules.voice) stats.voice++;
  if (modules.support) stats.support++;
  if (modules.invoices) stats.invoices++;
});

console.log('Module usage:', stats);
```

---

## FAQ

**Q: Warum modules im customers-Document und nicht separate Collection?**
A: Einfacher, weniger Firestore-Reads, atomare Updates. Für MVP ausreichend.

**Q: Kann ein Kunde Module selbst aktivieren?**
A: Nein, nur Admins können modules ändern (Security Rules).

**Q: Was passiert wenn Modul deaktiviert wird während Kunde eingeloggt ist?**
A: Bei nächstem Seitenwechsel wird Sidebar neu geladen → Modul verschwindet.

**Q: Brauchen wir Audit-Log für Modul-Änderungen?**
A: Später sinnvoll. Für MVP: Admin-Aktionen loggen in separate `audit_log` Collection.
