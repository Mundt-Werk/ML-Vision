# ML Vision - Projektdokumentation

> **Projekt:** ML Vision - KI-Automatisierung & Voice Agents
> **Typ:** Full-Stack Web-Anwendung
> **Zielgruppe:** Unternehmen in Düren und NRW
> **Stand:** Februar 2026

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Technologie-Stack](#2-technologie-stack)
3. [Verzeichnisstruktur](#3-verzeichnisstruktur)
4. [Hauptkomponenten](#4-hauptkomponenten)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Customer Portal](#6-customer-portal)
7. [Leads Bot System](#7-leads-bot-system)
8. [Firebase Konfiguration](#8-firebase-konfiguration)
9. [Sicherheitsarchitektur](#9-sicherheitsarchitektur)
10. [Assets & Styling](#10-assets--styling)
11. [Externe Services & APIs](#11-externe-services--apis)
12. [Deployment](#12-deployment)
13. [Entwicklung](#13-entwicklung)

---

## 1. Projektübersicht

### Beschreibung

Die ML Vision Website ist eine **professionelle B2B-Plattform** mit vier Hauptkomponenten:

| Komponente | Beschreibung | Pfad |
|------------|--------------|------|
| **Marketing-Website** | SEO-optimierte Landingpages | `/index.html`, `/public/` |
| **Admin Dashboard** | Verwaltungsoberfläche für Administratoren | `/admin/` |
| **Customer Portal** | Kundenzugang zu Diensten | `/customer/` |
| **Leads Bot** | Automatisierte Lead-Generierung | `/leads_bot/` |

### Kernfeatures

- ElevenLabs Voice Agent Integration (KI-Chat)
- Automatisierte Lead-Generierung via Google Places API
- Multi-Tenant System (Admin/Customer)
- Rollenbasierte Zugriffskontrolle
- Support-Ticketsystem mit Messaging
- Rechnungsverwaltung mit PDF-Download
- Responsive Design (Mobile-First)

---

## 2. Technologie-Stack

### Frontend

| Technologie | Verwendung |
|-------------|------------|
| HTML5 | Struktur & Semantik |
| CSS3 | Styling (Grid, Flexbox, Animationen) |
| JavaScript (ES6+) | Interaktivität & Logik |
| Firebase SDK | Authentication & Database Client |

### Backend & Services

| Technologie | Verwendung |
|-------------|------------|
| Firebase Auth | Benutzerauthentifizierung |
| Firebase Firestore | NoSQL Datenbank |
| Firebase Storage | Datei-Speicherung (PDFs, Uploads) |
| Firebase Hosting | Frontend-Deployment |
| Node.js / Express.js | Leads Bot Server |
| Railway | Leads Bot Cloud-Hosting |

### Externe APIs

| API | Verwendung |
|-----|------------|
| ElevenLabs | Voice Agent Widget |
| Cloudflare Turnstile | Bot-Protection (CAPTCHA) |
| Google Places API | Lead-Daten-Sammlung |
| PHPMailer | E-Mail-Versand (optional) |

---

## 3. Verzeichnisstruktur

```
ML_Vision/Brand/Webdesign/
│
├── index.html                    # Hauptlandingpage (26KB)
├── .htaccess                     # Apache Security & Rewriting
├── firebase.json                 # Firebase Hosting Config
├── firestore.rules               # Firestore Security Rules
├── storage.rules                 # Storage Security Rules
├── firestore.indexes.json        # Datenbank-Indizes
├── robots.txt                    # SEO
├── sitemap.xml                   # SEO
│
├── admin/                        # Admin Dashboard
│   ├── dashboard.html
│   └── pages/
│       ├── customers.html        # Kundenverwaltung (71KB)
│       ├── users.html            # Benutzerverwaltung
│       ├── leads-bot.html        # Leads Bot Interface
│       ├── tickets.html          # Support-Tickets
│       ├── workflows.html        # Workflow-Management
│       └── settings.html         # Einstellungen
│
├── customer/                     # Customer Portal
│   ├── dashboard.html
│   └── pages/
│       ├── statistiken.html      # Analytics
│       ├── gespraeche.html       # Call History
│       ├── support.html          # Support Tickets
│       ├── rechnungen.html       # Rechnungen
│       ├── einstellungen.html    # Settings
│       └── dokumentation.html    # Hilfe
│
├── public/                       # Öffentliche Seiten
│   ├── index.html
│   ├── login.html
│   ├── password-reset.html
│   ├── ki-automatisierung-dueren.html
│   ├── voice-agents-chatbots.html
│   ├── workflow-automatisierung.html
│   ├── blog.html
│   ├── blog-*.html               # Blog-Artikel
│   ├── impressum.html
│   └── datenschutz.html
│
├── leads_bot/                    # Node.js Lead-Server
│   ├── package.json
│   ├── src/
│   │   ├── server.js             # Express Server
│   │   ├── api/                  # API Endpoints
│   │   ├── services/             # Business Logic
│   │   ├── models/               # Data Models
│   │   ├── export/               # CSV/JSON Export
│   │   └── utils/                # Helpers
│   └── LEADS/                    # Generated Leads
│
├── assets/                       # Frontend Resources
│   ├── css/
│   │   ├── style.css             # Hauptstylesheet (2763 Zeilen)
│   │   ├── base/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/
│   ├── js/
│   │   ├── script.js             # Hauptscript
│   │   ├── auth.js               # Firebase Auth
│   │   ├── firebase-config.js    # Firebase Config
│   │   ├── elevenlabs-widget.js  # Voice Agent
│   │   ├── dashboard.js          # Admin Dashboard
│   │   ├── customer-dashboard.js # Customer Dashboard
│   │   ├── gespraeche.js         # Calls
│   │   ├── rechnungen.js         # Invoices
│   │   ├── support.js            # Tickets
│   │   └── einstellungen.js      # Settings
│   ├── img/                      # Bilder (WebP, PNG, PSD)
│   └── font/                     # Schriften
│
├── config/                       # Server-Konfiguration
│   ├── config.php
│   ├── send-mail.php             # PHPMailer
│   ├── csrf-token.php
│   └── PHPMailer/
│
├── docs/                         # Dokumentation
│   ├── CLAUDE_MEMORY.md
│   ├── FIRESTORE_SECURITY_RULES.md
│   ├── QA_CHECKLIST.md
│   ├── database/
│   ├── planning/
│   └── audits/
│
├── MD/                           # Projektdokumentation
│   └── PROJEKT_DOKUMENTATION.md  # Diese Datei
│
├── scripts/                      # Utility Scripts
├── ARCHIV_ALTE_DATEIEN/          # Backup/Archive
└── NICHTHOCHLADEN/               # Sensitive Dateien
```

---

## 4. Hauptkomponenten

### index.html - Hauptlandingpage

**Größe:** ~26KB
**Zweck:** Marketing-Landingpage mit SEO-Optimierung

**Features:**
- Meta-Tags für SEO (Title, Description, Keywords)
- Schema.org Structured Data (LocalBusiness)
- Open Graph Tags für Social Media
- Geo-Location Tags für lokale Suche
- Turnstile CAPTCHA Integration
- ElevenLabs Voice Widget
- Responsive Navigation
- Kontaktformular

**Wichtige Sections:**
- Hero mit CTA
- Dienstleistungen
- Vorteile/Benefits
- Testimonials/Referenzen
- Kontaktformular
- Footer mit Links

### firebase.json - Firebase Konfiguration

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": ".",
    "ignore": ["node_modules", "ARCHIV*", ".claude", ".git"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### .htaccess - Apache Security

**Features:**
- Security Headers (XSS, MIME, Frame-Options)
- HSTS (Strict-Transport-Security)
- Content Security Policy (CSP)
- Directory Protection
- URL Rewriting

---

## 5. Admin Dashboard

**Pfad:** `/admin/dashboard.html` + `/admin/pages/`
**Zugriff:** Nur für Benutzer mit `role: 'admin'`

### Seiten

| Seite | Datei | Beschreibung |
|-------|-------|--------------|
| Dashboard | `dashboard.html` | Übersicht & KPIs |
| Kunden | `customers.html` | CRUD für Kundendaten |
| Benutzer | `users.html` | Firebase Auth Verwaltung |
| Leads Bot | `leads-bot.html` | Google Places Suche |
| Tickets | `tickets.html` | Support-Verwaltung |
| Workflows | `workflows.html` | Automatisierungen |
| Settings | `settings.html` | Admin-Einstellungen |

### customers.html - Kundenverwaltung

**Größe:** ~71KB
**Funktionen:**
- Kundenliste mit Suche/Filter
- Kunde hinzufügen/bearbeiten/löschen
- Erweiterte Datenfelder:
  - Stammdaten (Name, E-Mail, Telefon)
  - Adresse
  - Branche & Unternehmensgröße
  - Ansprechpartner
  - Technologie-Stack
  - Notizen
- Modul-Aktivierung pro Kunde
- Firebase Firestore Integration

### leads-bot.html - Lead-Generierung

**Funktionen:**
- Kategorie-Auswahl (Branchen)
- Standort & Radius-Suche
- Filter (Bewertungen, Öffnungszeiten)
- Live-Ergebnisanzeige
- CSV/JSON Export
- Lead-Scoring

---

## 6. Customer Portal

**Pfad:** `/customer/dashboard.html` + `/customer/pages/`
**Zugriff:** Benutzer mit `role: 'customer'` + `customerId`

### Seiten

| Seite | Datei | Beschreibung |
|-------|-------|--------------|
| Dashboard | `dashboard.html` | Kunden-Übersicht |
| Statistiken | `statistiken.html` | Analytics & KPIs |
| Gespräche | `gespraeche.html` | Voice Agent Calls |
| Support | `support.html` | Ticket-System |
| Rechnungen | `rechnungen.html` | Invoices & PDFs |
| Einstellungen | `einstellungen.html` | Profil |
| Dokumentation | `dokumentation.html` | Hilfe |

### Modul-System

Kunden sehen nur Module, die für sie aktiviert sind:

```javascript
// Firestore: customer_modules/{customerId}
{
  statistiken: true,
  gespraeche: true,
  support: true,
  rechnungen: false,  // Nicht aktiviert
  einstellungen: true
}
```

---

## 7. Leads Bot System

**Pfad:** `/leads_bot/`
**Runtime:** Node.js 18+
**Framework:** Express.js
**Deployment:** Railway

### API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| POST | `/api/search` | Google Places Suche |
| POST | `/api/export/csv` | CSV Export |
| POST | `/api/export/json` | JSON Export |
| GET | `/api/categories` | Verfügbare Kategorien |
| GET | `/api/health` | Health Check |

### Services

**LeadCollector.js**
- Google Places API Integration
- Standort-basierte Suche
- Pagination & Rate-Limiting

**LeadProcessor.js**
- Daten-Validierung
- Deduplizierung
- Scoring-Algorithmus

**EmailScraper.js**
- Website-Crawling
- E-Mail-Extraktion
- Kontaktdaten-Ergänzung

### Dependencies

```json
{
  "express": "^4.18.2",
  "axios": "^1.6.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "cheerio": "^1.1.0"
}
```

### Environment Variables

```env
PORT=3000
GOOGLE_MAPS_API_KEY=your_api_key
NODE_ENV=production
```

---

## 8. Firebase Konfiguration

### Firestore Collections

| Collection | Beschreibung | Indexes |
|------------|--------------|---------|
| `users` | Benutzer (Auth-Daten) | - |
| `customers` | Kundenstammdaten | - |
| `calls` | Voice Agent Calls | customerId + timestamp |
| `tickets` | Support-Tickets | customerId + status |
| `tickets/{id}/messages` | Ticket-Nachrichten | createdAt |
| `invoices` | Rechnungen | customerId + date |
| `customer_modules` | Modul-Aktivierung | - |

### Security Rules (Auszug)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Hilfsfunktionen
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isCustomer(customerId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.customerId == customerId;
    }

    // Customers - Admin: alle, Customer: eigene
    match /customers/{customerId} {
      allow read: if isAdmin() || isCustomer(customerId);
      allow write: if isAdmin();
    }

    // Calls - Mit Modul-Check
    match /calls/{callId} {
      allow read: if isAdmin() ||
                    (isCustomer(resource.data.customerId) &&
                     hasModule(resource.data.customerId, 'gespraeche'));
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Ticket-Anhänge (max 10MB)
    match /tickets/{customerId}/{allPaths=**} {
      allow read: if isAdmin() || isCustomer(customerId);
      allow write: if (isAdmin() || isCustomer(customerId)) &&
                      request.resource.size < 10 * 1024 * 1024;
    }

    // Rechnungen (nur Admin schreibt)
    match /invoices/{customerId}/{allPaths=**} {
      allow read: if isAdmin() || isCustomer(customerId);
      allow write: if isAdmin();
    }
  }
}
```

---

## 9. Sicherheitsarchitektur

### Authentication

- **Provider:** Firebase Authentication
- **Methode:** Email/Password
- **Custom Claims:** `role` (admin/customer), `customerId`

### Authorization

| Rolle | Rechte |
|-------|--------|
| `admin` | Alle Daten lesen/schreiben |
| `customer` | Nur eigene Daten, nur aktivierte Module |

### HTTP Security Headers (.htaccess)

```apache
# XSS Protection
Header set X-XSS-Protection "1; mode=block"

# MIME Type Sniffing
Header set X-Content-Type-Options "nosniff"

# Clickjacking Protection
Header set X-Frame-Options "SAMEORIGIN"

# HSTS (1 Jahr)
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Content Security Policy
Header set Content-Security-Policy "default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://elevenlabs.io https://*.firebaseio.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://elevenlabs.io https://ml-vision-leads-bot-production.up.railway.app;
  frame-src https://challenges.cloudflare.com https://elevenlabs.io;"
```

### Geschützte Verzeichnisse

```apache
# config/ - Kein direkter Zugriff
<Directory "config">
  Deny from all
</Directory>

# NICHTHOCHLADEN/ - Kein direkter Zugriff
<Directory "NICHTHOCHLADEN">
  Deny from all
</Directory>
```

### CSRF Protection

- PHP CSRF Token für Formulare
- Firebase SDK handhabt eigene Tokens

---

## 10. Assets & Styling

### CSS-Architektur

**Hauptdatei:** `assets/css/style.css` (2763 Zeilen)

**Unterordner:**
```
css/
├── base/           # Reset, Typography, Variables
├── components/     # Button, Form, Modal, Card
├── layouts/        # Grid, Flexbox, Container
├── pages/          # Page-spezifische Styles
└── utilities/      # Margins, Padding, Display
```

**CSS Custom Properties (Variablen):**
```css
:root {
  --primary-color: #...;
  --secondary-color: #...;
  --text-color: #...;
  --background-color: #...;
  --border-radius: 8px;
  --transition: 0.3s ease;
}
```

### JavaScript-Module

| Datei | Größe | Funktion |
|-------|-------|----------|
| `script.js` | 382 Zeilen | Hauptlogik, Modals, Navigation |
| `auth.js` | 5KB | Firebase Auth Wrapper |
| `firebase-config.js` | - | Firebase Credentials |
| `elevenlabs-widget.js` | 9KB | Voice Agent Integration |
| `dashboard.js` | 3KB | Admin Dashboard |
| `customer-dashboard.js` | 9KB | Customer Dashboard |
| `gespraeche.js` | 16KB | Call Management |
| `rechnungen.js` | 15KB | Invoice Management |
| `support.js` | 16KB | Ticket Management |
| `einstellungen.js` | 7KB | Settings |

### Bilder

**Formate:**
- WebP (Primary - Modern, komprimiert)
- PNG (Fallback)
- PSD (Source Files)

**Typen:**
- Logos (verschiedene Größen)
- Favicons (ICO, SVG, PNG)
- Header/Hero Images
- Icons & Grafiken

---

## 11. Externe Services & APIs

### Firebase

**Projekt:** ML Vision
**Services:**
- Authentication (Email/Password)
- Firestore (NoSQL Database)
- Storage (File Uploads)
- Hosting (Frontend)

**SDK Version:** 10.x (Modular)

### ElevenLabs

**Verwendung:** Voice Agent Widget
**Integration:** JavaScript Embed

```html
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>
<elevenlabs-convai agent-id="YOUR_AGENT_ID"></elevenlabs-convai>
```

### Cloudflare Turnstile

**Verwendung:** Bot-Protection für Formulare
**Site Key:** Im HTML eingebettet

```html
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
```

### Google Places API

**Verwendung:** Lead-Generierung (Leads Bot)
**Endpoints:**
- Place Search
- Place Details
- Place Photos

---

## 12. Deployment

### Frontend (Firebase Hosting)

```bash
# Installation
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

### Leads Bot (Railway)

**URL:** `https://ml-vision-leads-bot-production.up.railway.app`

```bash
# Lokal entwickeln
cd leads_bot
npm install
npm run dev

# Deploy (automatisch via Git Push)
git push origin main
```

### Environment Setup

**Firebase:**
1. Firebase Console öffnen
2. Projekt auswählen
3. Web-App hinzufügen
4. Config in `firebase-config.js` einfügen

**Leads Bot:**
1. Railway Account erstellen
2. Repository verbinden
3. Environment Variables setzen:
   - `GOOGLE_MAPS_API_KEY`
   - `PORT`

---

## 13. Entwicklung

### Lokale Entwicklung

```bash
# Frontend (einfacher HTTP Server)
npx serve .

# Oder mit Live Reload
npx live-server

# Leads Bot
cd leads_bot
npm run dev
```

### Git Workflow

**Branch:** `main` (Production)

**Commit Convention:**
```
feat: Neue Feature
fix: Bugfix
docs: Dokumentation
refactor: Code-Verbesserung
style: Formatting
```

### VS Code Extensions (empfohlen)

- Live Server
- Firebase Explorer
- ESLint
- Prettier

### Debugging

**Browser DevTools:**
- Console für JavaScript Errors
- Network Tab für API Calls
- Application Tab für Firebase Auth State

**Firebase:**
- Emulator Suite für lokales Testing
- Console für Firestore/Auth Monitoring

---

## Anhang

### Wichtige URLs

| Umgebung | URL |
|----------|-----|
| Production | (Firebase Hosting URL) |
| Leads Bot API | https://ml-vision-leads-bot-production.up.railway.app |
| Firebase Console | https://console.firebase.google.com |
| Railway Dashboard | https://railway.app |

### Kontakt & Support

**Projekt:** ML Vision
**Standort:** Düren, NRW
**Website:** (Production URL)

---

*Dokumentation erstellt: Februar 2026*
*Letzte Aktualisierung: 26.02.2026*
