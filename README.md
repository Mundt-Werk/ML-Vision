# ML Vision - KI-Automatisierung & Voice Agents

Professionelle Website mit Admin-Dashboard, Leads-Bot-System und Firebase-Integration für ML Vision - Ihr Partner für KI-Automatisierung in Düren und NRW.

## 📋 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Technologie-Stack](#technologie-stack)
- [Installation](#installation)
- [Projekt-Struktur](#projekt-struktur)
- [Konfiguration](#konfiguration)
- [Deployment](#deployment)
- [Entwicklung](#entwicklung)

## 🎯 Überblick

ML Vision Website ist eine vollständige Web-Plattform mit:
- **Öffentliche Website**: Marketing-Seiten für KI-Automatisierung, Voice Agents und Workflow-Automatisierung
- **Admin Dashboard**: Vollständige Verwaltungsoberfläche für Benutzer, Kunden und Leads
- **Customer Portal**: Kundenzugang für Statistiken, Gespräche und Support
- **Leads Bot**: Automatisches Lead-Generierungssystem mit Google Places API Integration
- **Firebase Authentication**: Sichere Benutzerauthentifizierung mit rollenbasiertem Zugriff

## ✨ Features

### Öffentliche Website
- 🎨 Modernes, responsives Design
- 🚀 Performance-optimiert mit WebP-Bildern
- 🔒 Content Security Policy (CSP) implementiert
- 🤖 ElevenLabs Voice Agent Integration
- 📱 Mobile-First Ansatz
- ♿ Barrierefreiheit

### Admin Dashboard
- 👥 **Benutzerverwaltung**: Firebase-basierte Benutzer- und Rollenverwaltung
- 🤖 **Leads Bot**: Automatische Lead-Generierung mit Google Places API
  - Standortbasierte Suche
  - Kategoriefilterung
  - Prioritäts-Bewertung
  - CSV/JSON Export
- 📊 Dashboard mit Statistiken und Aktivitäten
- 🔐 Rollenbasierte Zugriffskontrolle (Admin/Customer)
- 📱 Vollständig responsive mit Burger-Menü
- 🎨 Custom Modals (keine Browser-Alerts)

### Customer Portal
- 📈 Statistiken und Analytics
- 💬 Gesprächsverlauf
- 🗓️ Terminverwaltung
- 📄 Rechnungsübersicht
- 🔧 Workflow-Management
- 📚 Dokumentation
- 🛡️ Sicherheitseinstellungen

### Leads Bot System
- 🗺️ Google Places API Integration
- 🔍 Erweiterte Suchfilter (Radius, Bewertungen, Kategorien)
- 🎯 Intelligente Lead-Priorisierung
- ✅ Daten-Validierung und Deduplizierung
- 📊 Export-Funktionen (CSV, JSON)
- 🌐 Dynamische API-URL-Erkennung (localhost/production)

## 🛠️ Technologie-Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive Design mit Media Queries
- CSS Grid & Flexbox
- Custom Modals und UI-Komponenten

### Backend & Services
- **Firebase**: Authentication, Firestore Database
- **Node.js**: Leads Bot Server
- **Express.js**: API Server
- **Google Places API**: Lead-Generierung
- **ElevenLabs API**: Voice Agent Integration

### Weitere Tools
- PHPMailer für E-Mail-Versand
- CSRF-Schutz
- Git für Versionskontrolle

## 📦 Installation

### Voraussetzungen
- Node.js (v14 oder höher)
- npm oder yarn
- Webserver (Apache/Nginx)
- Firebase-Account
- Google Cloud Account (für Places API)

### Schritt 1: Repository klonen
```bash
git clone https://github.com/Mundt-Werk/ML-Vision.git
cd ML-Vision
```

### Schritt 2: Leads Bot installieren
```bash
cd leads_bot
npm install
```

### Schritt 3: Umgebungsvariablen konfigurieren
Erstelle eine `.env` Datei im `leads_bot` Verzeichnis:
```env
GOOGLE_MAPS_API_KEY=dein_google_api_key
PORT=3000
```

### Schritt 4: Firebase konfigurieren
1. Erstelle ein Firebase-Projekt auf https://console.firebase.google.com
2. Aktiviere Authentication (E-Mail/Passwort)
3. Erstelle eine Firestore-Datenbank
4. Kopiere die Firebase-Konfiguration in `assets/js/firebase-config.js`

### Schritt 5: Starten
```bash
# Leads Bot Server starten
cd leads_bot
npm start

# Webserver starten (z.B. mit XAMPP, WAMP oder lokalem Server)
```

## 📁 Projekt-Struktur

```
ML-Vision/
├── admin/                      # Admin Dashboard
│   ├── dashboard.html
│   └── pages/
│       ├── users.html         # Benutzerverwaltung
│       ├── leads-bot.html     # Leads Bot Interface
│       ├── customers.html     # Kundenverwaltung
│       └── settings.html      # Einstellungen
├── customer/                  # Customer Portal
│   ├── dashboard.html
│   └── pages/
├── public/                    # Öffentliche Website
│   ├── index.html
│   ├── login.html
│   ├── ki-automatisierung-dueren.html
│   ├── voice-agents-chatbots.html
│   └── workflow-automatisierung.html
├── leads_bot/                 # Leads Bot System
│   ├── src/
│   │   ├── services/
│   │   │   ├── GooglePlacesAPI.js
│   │   │   └── LeadProcessor.js
│   │   └── utils/
│   ├── config/
│   └── server.js
├── assets/                    # Assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── script.js
│   ├── img/
│   └── font/
├── config/                    # Server-Konfiguration
│   ├── PHPMailer/
│   ├── send-mail.php
│   └── csrf-token.php
├── .htaccess                  # Apache-Konfiguration
├── .gitignore
└── README.md
```

## ⚙️ Konfiguration

### Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Apache .htaccess
Die `.htaccess` Datei enthält:
- Security Headers (CSP, XSS-Protection, etc.)
- URL Rewriting
- Schutz sensibler Dateien
- HTTPS-Erzwingung

### Content Security Policy
Optimiert für:
- Firebase
- ElevenLabs Widget
- Google APIs
- Railway Deployment (Leads Bot)

## 🚀 Deployment

### Webserver Deployment
1. Alle Dateien auf den Webserver hochladen
2. `.htaccess` Konfiguration überprüfen
3. Firebase-Credentials konfigurieren
4. PHP-Mailer konfigurieren (für Kontaktformular)

### Leads Bot Deployment (Railway)
1. Repository mit Railway verbinden
2. Umgebungsvariablen setzen
3. `leads_bot` als Service deployen
4. URL in `admin/pages/leads-bot.html` aktualisieren

### Wichtige URLs
- **Production Leads Bot**: `https://ml-vision-leads-bot-production.up.railway.app`
- **Local Development**: `http://localhost:3000`

## 👨‍💻 Entwicklung

### Lokale Entwicklung starten
```bash
# Leads Bot Development Server
cd leads_bot
npm run dev

# Oder mit Nodemon für Auto-Restart
npm install -g nodemon
nodemon server.js
```

### Neuen Admin-User erstellen
1. Navigiere zu `/public/login.html`
2. Registriere einen neuen Benutzer
3. Setze in Firestore die Rolle auf `admin`:
```javascript
users/[userId] {
  email: "admin@example.com",
  role: "admin",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

### Git Workflow
```bash
# Änderungen committen
git add .
git commit -m "Beschreibung der Änderungen"
git push origin main

# Neuen Branch erstellen
git checkout -b feature/neue-funktion
git push origin feature/neue-funktion
```

## 🔐 Sicherheit

### Geschützte Dateien
Die folgenden Dateien/Ordner werden **nicht** ins Repository committed:
- `.env` - Umgebungsvariablen
- `config.php` - PHP-Konfiguration
- `NICHTHOCHLADEN/` - Sensible Daten
- `node_modules/` - NPM-Pakete
- `*.log` - Log-Dateien

### Best Practices
- ✅ HTTPS erzwingen
- ✅ CSRF-Protection aktiviert
- ✅ Content Security Policy implementiert
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Firebase Security Rules konfiguriert
- ✅ Input-Validierung auf Client- und Server-Seite

## 📝 Lizenz

Proprietary - Alle Rechte vorbehalten © 2025 ML Vision

---

**Entwickelt von**: Mundt-Werk
**Kontakt**: ML Vision - KI-Automatisierung in Düren
**Website**: https://ml-vision.de
