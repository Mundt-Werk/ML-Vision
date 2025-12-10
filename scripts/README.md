# Testdaten Generator - ML Vision Customer Dashboard

Dieses Verzeichnis enthält Scripts zum Generieren von Testdaten für das ML Vision Customer Dashboard.

## 📋 Was wird erstellt?

### Customer
- **ID**: `cust_test`
- **Name**: Test Firma GmbH
- **Email**: kontakt@testfirma.de
- **Alle Module aktiv**: voice, support, invoices, settings
- **Plan**: Professional Plan (79€/Monat)

### User (Firebase Auth + Firestore)
- **Email**: test@mlvision.de
- **Passwort**: testpassword123
- **Rolle**: customer
- **Verknüpft mit**: cust_test

### Calls
- **Anzahl**: 30-40 Einträge
- **Status**: completed (70%), failed (20%), unknown (10%)
- **Dauer**: 30s - 10min (nur bei completed)
- **Zeitraum**: Letzte 30 Tage

### Tickets
- **Anzahl**: 8 Tickets
- **Kategorien**: Frage, Problem, Feature-Request
- **Status**: open, pending, closed
- **Messages**: 1-3 Antworten pro Ticket (Customer ↔ Support)
- **Zeitraum**: Letzte 20 Tage

### Invoices
- **Anzahl**: 5 Rechnungen
- **Beträge**: 79,00€ (monatlich) + 199,00€ (Setup-Gebühr)
- **Status**: paid (4x), open (1x)
- **Zeitraum**: Letzte 90 Tage
- **PDFs**: Referenzen (müssen separat hochgeladen werden)

---

## 🚀 Methode 1: Browser-basiert (EMPFOHLEN)

**Vorteile**:
- ✅ Einfach & schnell
- ✅ Keine Service Account Keys nötig
- ✅ Visuelles Feedback mit Live-Log
- ✅ Nutzt bestehende Firebase Config

### Schritte:

1. **Als Admin anmelden**
   ```
   Öffne: https://your-domain.com/public/login.html
   Login mit Admin-Account
   ```

2. **Testdaten-Generator öffnen**
   ```
   Öffne: scripts/seed-test-data-browser.html
   Im Browser (z.B. via Live Server oder direkt als file://)
   ```

3. **Testdaten generieren**
   ```
   Klicke auf "Testdaten generieren"
   Warte bis alle Einträge erstellt sind (ca. 30-60 Sekunden)
   ```

4. **Test-User erstellen** (manuell via Firebase Console)
   ```
   Firebase Console > Authentication > Add User
   Email: test@mlvision.de
   Password: testpassword123

   Dann in Firestore > users > Create Document:
   Document ID: [Die UID vom neu erstellten User]
   Fields:
     - uid: [Die UID]
     - email: test@mlvision.de
     - role: customer
     - customerId: cust_test
     - createdAt: [Current timestamp]
   ```

5. **Fertig!**
   ```
   Logout als Admin
   Login als test@mlvision.de / testpassword123
   Dashboard sollte jetzt echte Daten anzeigen
   ```

---

## 🛠️ Methode 2: Node.js Script (ERWEITERT)

**Vorteile**:
- ✅ Erstellt auch Firebase Auth User automatisch
- ✅ Kann PDFs hochladen (optional)
- ✅ Batch-Operations (schneller bei vielen Daten)

**Nachteile**:
- ❌ Benötigt Service Account Key
- ❌ Mehr Setup erforderlich

### Schritte:

1. **Service Account Key herunterladen**
   ```
   Firebase Console > Project Settings > Service Accounts
   > Generate New Private Key

   Speichere die JSON-Datei als:
   firebase-service-account.json
   (im Hauptverzeichnis des Projekts)
   ```

2. **Dependencies installieren**
   ```bash
   cd scripts
   npm install
   ```

3. **Script konfigurieren**
   ```javascript
   // In seed-test-data.js:

   // Zeile 20: Ersetze mit deiner Project ID
   storageBucket: 'YOUR_PROJECT_ID.appspot.com'

   // z.B.:
   storageBucket: 'ml-vision-dashboard.appspot.com'
   ```

4. **Script ausführen**
   ```bash
   npm run seed
   ```

5. **Fertig!**
   ```
   Login als test@mlvision.de / testpassword123
   Dashboard sollte jetzt echte Daten anzeigen
   ```

---

## 📄 PDFs für Invoices hochladen

Die Rechnungs-PDFs müssen **manuell** über das Admin-Panel hochgeladen werden:

### Via Admin-Panel:

1. **Als Admin anmelden**
   ```
   Login mit Admin-Account
   ```

2. **Customers öffnen**
   ```
   Admin > Customers > "Test Firma GmbH" > Details
   ```

3. **Rechnung hochladen**
   ```
   Klicke auf "Rechnung hochladen"

   Fülle aus:
   - Rechnungs-Nr.: INV-2025-001
   - Datum: [Aktuelles Datum]
   - Beschreibung: Professional Plan - Januar 2025
   - Betrag: 7900 (= 79,00€)
   - Währung: EUR
   - Status: paid
   - PDF: [Beliebige PDF-Datei hochladen]
   ```

4. **Wiederholen** für alle 5 Rechnungen:
   - SETUP-2024-001 (199,00€)
   - INV-2025-001 (79,00€)
   - INV-2025-002 (79,00€)
   - INV-2025-003 (79,00€)
   - INV-2025-004 (79,00€)

### Alternativ: Mock-PDFs mit Python erstellen

```bash
# Python-Script zum Erstellen von Mock-PDFs
python3 -c "
from reportlab.pdfgen import canvas

for i in range(1, 5):
    filename = f'INV-2025-{str(i).zfill(3)}.pdf'
    c = canvas.Canvas(filename)
    c.drawString(100, 750, f'Rechnung {filename}')
    c.drawString(100, 700, 'Professional Plan - 79,00 EUR')
    c.save()
    print(f'Created {filename}')
"
```

---

## ✅ Nach dem Seeding testen

### Dashboard
```
□ Widgets zeigen echte Zahlen (nicht 0)
□ Gespräche Widget: X Calls heute, Ø X Minuten
□ Tickets Widget: X offene Tickets
□ Rechnungen Widget: Letzte Rechnung sichtbar
□ User Info: Name, Email, Plan korrekt
```

### Gespräche (Voice Module)
```
□ Liste zeigt 30-40 Calls
□ Verschiedene Status (completed, failed, unknown)
□ Sortierung nach Datum funktioniert
□ Filter nach Status funktioniert
```

### Support (Tickets Module)
```
□ Liste zeigt 8 Tickets
□ Verschiedene Status (open, pending, closed)
□ Ticket-Detail zeigt Messages
□ Neues Ticket erstellen funktioniert
□ Antworten funktioniert
```

### Rechnungen (Invoices Module)
```
□ Liste zeigt 5 Rechnungen
□ Filter nach Status funktioniert (paid/open)
□ Plan Card zeigt "Professional Plan"
□ PDF-Download funktioniert (nach Upload)
```

### Einstellungen
```
□ Profil zeigt: Test Firma GmbH
□ Email zeigt: kontakt@testfirma.de
□ Passwort ändern funktioniert
□ Benachrichtigungs-Toggles funktionieren
```

---

## 🧹 Testdaten löschen

**Via Firebase Console**:
```
1. Firestore Database
2. Lösche Collections:
   - customers/cust_test
   - calls (alle Dokumente mit customerId: cust_test)
   - tickets (alle Dokumente mit customerId: cust_test)
   - invoices (alle Dokumente mit customerId: cust_test)

3. Authentication
   - Lösche User: test@mlvision.de

4. Storage (optional)
   - Lösche Ordner: invoices/cust_test/
```

**Via Script** (TODO):
```bash
# Noch nicht implementiert
npm run clean
```

---

## 🐛 Troubleshooting

### "Permission denied" Fehler
```
Problem: Firebase Rules blockieren Schreibzugriff
Lösung: Als Admin anmelden (Methode 1) oder Service Account verwenden (Methode 2)
```

### "Missing index" Fehler
```
Problem: Composite Indexes fehlen
Lösung:
  firebase deploy --only firestore:indexes
```

### PDFs nicht sichtbar
```
Problem: Storage Rules oder fehlende PDFs
Lösung:
  1. PDFs manuell via Admin-Panel hochladen
  2. Storage Rules prüfen: firebase deploy --only storage:rules
```

### User kann sich nicht anmelden
```
Problem: Firebase Auth User fehlt oder falsche customerId
Lösung:
  1. Firebase Console > Authentication > Add User
  2. Firestore > users/{uid} mit customerId: cust_test
```

---

## 📞 Support

Bei Fragen oder Problemen:
- Siehe QA_CHECKLIST.md für vollständige Testing-Anleitung
- Siehe FIRESTORE_SCHEMA.md für Datenbankstruktur
- Siehe firestore.rules & storage.rules für Security Rules

---

**Zuletzt aktualisiert**: 2025-12-10
**Version**: 1.0.0
