# Firebase Cloud Functions - ML Vision Dashboard

Firebase Cloud Functions für das ML Vision Dashboard mit automatischen Imports und Benachrichtigungen.

## 📋 Übersicht

Dieses Projekt enthält alle Backend-Funktionen für:
- **Gespräche (Voice):** Twilio Call Import
- **Support (Tickets):** E-Mail-Benachrichtigungen
- **Rechnungen:** Stripe Invoice Import

## 🚀 Setup

### 1. Dependencies installieren

```bash
cd functions
npm install
```

### 2. Environment Variables konfigurieren

Die Functions benötigen folgende Konfigurationswerte:

```bash
# Twilio
firebase functions:config:set twilio.account_sid="YOUR_TWILIO_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_TWILIO_AUTH_TOKEN"

# Stripe
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"

# E-Mail (Gmail App Password empfohlen)
firebase functions:config:set email.user="noreply@ml-vision.de"
firebase functions:config:set email.password="YOUR_EMAIL_APP_PASSWORD"
firebase functions:config:set email.support="support@ml-vision.de"

# Hosting Domain (für Links in E-Mails)
firebase functions:config:set hosting.domain="dashboard.ml-vision.de"
```

### 3. Firebase Project initialisieren

```bash
# Im Hauptverzeichnis
firebase init

# Wähle:
# - Functions
# - Firestore
# - Hosting (optional)
```

### 4. Deploy

```bash
# Alle Functions deployen
firebase deploy --only functions

# Nur Firestore Rules + Indexes
firebase deploy --only firestore

# Alles auf einmal
firebase deploy
```

## 📦 Functions im Detail

### Gespräche (Voice)

#### `importTwilioCalls`
- **Type:** Scheduled (täglich um 03:00 Uhr)
- **Zweck:** Importiert Twilio Voice Calls in Firestore
- **Collection:** `calls`
- **Felder:**
  - `callId` - Twilio Call SID
  - `customerId` - Zuordnung zum Kunden
  - `timestamp` - Call-Zeitpunkt
  - `duration` - Dauer in Sekunden
  - `status` - completed | failed | unknown
  - `phoneNumber` - Anrufer-Nummer
  - `recordingUrl` - Link zur Aufnahme (MP3)
  - `importedAt` - Import-Zeitstempel

#### `manualImportCalls`
- **Type:** HTTP Callable (Admin only)
- **Zweck:** Manueller Trigger für Twilio Import
- **Aufruf:** `firebase functions:call manualImportCalls`

### Support (Tickets)

#### `sendTicketNotification`
- **Type:** Firestore Trigger (onCreate)
- **Trigger:** `tickets/{ticketId}`
- **Zweck:** E-Mail an Support bei neuem Ticket
- **E-Mail enthält:** Ticket-Details, Kunde, Link zum Ticket

#### `sendReplyNotification`
- **Type:** Firestore Trigger (onUpdate)
- **Trigger:** `tickets/{ticketId}`
- **Zweck:** E-Mail bei neuer Antwort auf Ticket
- **Empfänger:**
  - Kunde antwortet → Support wird benachrichtigt
  - Support antwortet → Kunde wird benachrichtigt

### Rechnungen

#### `importStripeInvoices`
- **Type:** Scheduled (täglich um 04:00 Uhr)
- **Zweck:** Importiert Stripe Invoices in Firestore
- **Collection:** `invoices`
- **Felder:**
  - `invoiceId` - Stripe Invoice ID
  - `customerId` - Zuordnung zum Kunden
  - `invoiceNumber` - Rechnungsnummer
  - `date` - Rechnungsdatum
  - `amount` - Betrag in Euro
  - `status` - paid | open | uncollectible
  - `pdfUrl` - Link zum PDF
  - `importedAt` - Import-Zeitstempel

#### `manualImportInvoices`
- **Type:** HTTP Callable (Admin only)
- **Zweck:** Manueller Trigger für Stripe Import
- **Aufruf:** `firebase functions:call manualImportInvoices`

## 🔒 Security

- API Keys werden nie im Frontend exposed
- Nur über Firebase Config abrufbar
- Firestore Security Rules schützen Collections
- Admin-Functions benötigen `admin: true` Custom Claim

## 🧪 Testing

### Lokales Testen mit Emulator

```bash
# Emulator starten
firebase emulators:start

# In anderer Terminal:
firebase functions:shell
```

### Manuelle Triggers ausführen

```javascript
// In firebase functions:shell
importTwilioCalls()
importStripeInvoices()
```

## 📊 Monitoring

```bash
# Logs anschauen
firebase functions:log

# Spezifische Function
firebase functions:log --only importTwilioCalls

# Letzte 100 Zeilen
firebase functions:log --limit 100
```

## ⚠️ Wichtige Hinweise

### Twilio Recording URLs
- Recording URLs von Twilio sind nur **24 Stunden gültig**
- Option 1: URLs alle 24h refreshen
- Option 2: Recordings in Firebase Storage kopieren (empfohlen für Produktion)

### Customer ID Mapping
Die Function `getCustomerIdFromPhoneNumber()` muss angepasst werden:
- Aktuell: Lookup über `twilioPhoneNumber` in `customers` Collection
- Alternative: Separate `phone_mapping` Collection
- Fallback: `default_customer` (nur für Testing!)

### E-Mail Limits
- Gmail: Max. 500 E-Mails/Tag mit App Password
- Für Produktion: SendGrid/Mailgun verwenden

### Kosten
- Cloud Functions: Free Tier 2M Aufrufe/Monat
- Scheduled Functions: Zählen als Aufruf
- Firestore: Free Tier 50K reads/writes/deletes pro Tag

## 🐛 Troubleshooting

### "Permission denied" beim Deploy
```bash
firebase login --reauth
firebase use ml-vision-273ee
```

### Functions laufen nicht
```bash
# Config prüfen
firebase functions:config:get

# Logs prüfen
firebase functions:log --limit 50
```

### Twilio/Stripe Import liefert keine Daten
- API Keys prüfen
- Customer-Dokumente müssen `stripeCustomerId` / `twilioPhoneNumber` haben
- Firestore Rules prüfen

## 📚 Weitere Ressourcen

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Stripe Node.js SDK](https://stripe.com/docs/api?lang=node)
- [Nodemailer Docs](https://nodemailer.com/)
