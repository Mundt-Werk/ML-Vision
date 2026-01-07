# 🎯 Implementierungsplan: sales_leads Firebase Integration

**Datum:** 2026-01-07
**Zweck:** Admin-Kundenverwaltung (Erstgespräche/Leads) in Firebase speichern
**Collection Name:** `sales_leads`

---

## 📊 Status Quo

### Aktuell
- ✅ Firebase ist konfiguriert und einsatzbereit
- ✅ `customers` Collection existiert (für aktive Kunden im Customer Dashboard)
- ❌ Admin-Kundenverwaltung speichert nur lokal (JavaScript Array)
- ❌ Daten gehen beim Neuladen verloren

### Bestehende Collections
1. **`customers`** - Aktive Kunden (Customer Dashboard)
2. **`calls`** - Anrufe
3. **`tickets`** - Support-Tickets
4. **`invoices`** - Rechnungen

---

## 🎯 Ziel

Neue Collection **`sales_leads`** für Admin-Kundenverwaltung:
- Speichert Erstgespräche und Lead-Informationen
- Persistente Speicherung in Firebase Firestore
- CRUD-Operationen (Create, Read, Update, Delete)
- Automatische Kundennummer-Generierung

---

## 📋 Datenstruktur: sales_leads Collection

### Dokument-ID
- Auto-generiert von Firestore oder Custom ID (z.B. `lead_TIMESTAMP`)

### Felder (basierend auf customers.html Formular)

```javascript
{
  // === META ===
  id: "lead_1704614400000",           // Eindeutige ID
  customerNumber: "K-20241201",        // Kundennummer (manuell generiert)
  createdAt: "2024-12-01T10:30:00Z",  // ISO 8601 String oder Timestamp
  updatedAt: "2024-12-01T10:30:00Z",  // ISO 8601 String oder Timestamp

  // === 1. KUNDE & KONTAKT ===
  companyName: "Meier Handwerk GmbH",
  industry: "Handwerk",
  contactFirstName: "Hans",
  contactLastName: "Meier",
  contactRole: "Geschäftsführer",
  employeeCount: 15,
  email: "hans.meier@meier-handwerk.de",
  phone: "+49 123 456789",
  website: "https://meier-handwerk.de",

  // === 2. PROBLEM & ZIELE ===
  mainProblem: "Zu viele verpasste Anrufe außerhalb der Geschäftszeiten",
  urgency: 4,                          // 1-5 (Slider)
  timeLost: 10,                        // Stunden pro Woche
  currentSolution: "Anrufbeantworter, Rückrufe am nächsten Tag",
  monthlyCost: 2000,                   // Monatliche Kosten in EUR

  // === 3. PROZESSE HEUTE ===
  incomingChannels: [                  // Array von Strings
    "Telefon",
    "E-Mail",
    "Website"
  ],
  responseTime: "2-4 Std",
  requestHandler: "Sekretariat",
  processErrors: "Kunden warten zu lange auf Rückmeldung",
  peakTimes: "Morgens 8-10 Uhr",

  // === 4. GEWÜNSCHTES ZIELBILD ===
  idealProcess: "24/7 Telefon-Assistent zur Aufnahme von Anfragen",
  desiredSolutions: [                  // Array von Strings
    "Telefon-Assistent",
    "Terminvereinbarung"
  ],
  expectedResults: "Keine verpassten Anrufe mehr, bessere Kundenzufriedenheit",

  // === 5. TECHNIK / SYSTEME ===
  domainProvider: "Strato",
  websiteSystem: "WordPress",
  emailSystem: "Google Workspace",
  crmSystem: "",
  projectTool: "",
  cloudStorage: "Google Drive",
  phoneSystem: "Telekom",
  phoneNumberType: "Festnetz",        // Festnetz, Mobil, SIP
  apiAccess: "",

  // === 6. DATENSCHUTZ ===
  customerDataStored: "Ja",           // Ja, Nein
  dataTypes: "Name, Telefon, E-Mail, Adresse",
  avContract: "Benötigt",             // Ja, Nein, Benötigt
  euDataRequired: "Ja",               // Ja, Nein, Unklar
  criticalIndustry: "Nein",           // Nein, Medizin, Recht, Beratung, HR

  // === 7. BUDGET & TIMELINE ===
  budgetRange: "1.000€ - 5.000€",
  decisionMaker: "Hans Meier, Geschäftsführer",
  projectStart: "Innerhalb 1 Monat",  // Sofort, Innerhalb 1 Monat, 1-3 Monate, etc.
  deadline: "",

  // === 8. INTERNE NOTIZEN ===
  shortDescription: "Handwerksbetrieb braucht Telefon-Assistenten",
  challenges: "Technische Anbindung an alte Telefonanlage",
  insights: "Sehr motiviert, schnelle Umsetzung gewünscht",
  nextSteps: "Angebot erstellen, Telefonanlage prüfen"
}
```

### Besonderheiten
- **Arrays**: `incomingChannels`, `desiredSolutions` für Checkboxen
- **Numbers**: `urgency` (1-5), `employeeCount`, `timeLost`, `monthlyCost`
- **Strings**: Alles andere
- **Timestamps**: `createdAt`, `updatedAt` als ISO 8601 Strings

---

## 🔧 Code-Änderungen

### 1. Firebase Imports hinzufügen
**Datei:** `admin/pages/customers.html`

```javascript
// Am Anfang des <script> Blocks
import { db } from '../../assets/js/firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
```

### 2. Funktionen anpassen

#### a) `loadCustomers()` - Aus Firebase laden
```javascript
async function loadCustomers() {
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('customersTable');
  const tbody = document.getElementById('customersTableBody');

  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  table.style.display = 'none';

  try {
    // Aus Firebase laden, sortiert nach createdAt (neueste zuerst)
    const q = query(collection(db, 'sales_leads'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      loadingState.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    customers = [];
    snapshot.forEach((doc) => {
      customers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    tbody.innerHTML = '';
    customers.forEach((customer) => {
      const row = createCustomerRow(customer);
      tbody.appendChild(row);
    });

    loadingState.style.display = 'none';
    table.style.display = 'table';
  } catch (error) {
    console.error('Error loading customers:', error);
    showAlert('Fehler beim Laden der Kunden: ' + error.message, 'Fehler');
    loadingState.style.display = 'none';
  }
}
```

#### b) Form Submit - In Firebase speichern
```javascript
document.getElementById('customerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gespeichert...';

  // Formdata sammeln
  const formData = {
    companyName: document.getElementById('companyName').value,
    industry: document.getElementById('industry').value,
    contactFirstName: document.getElementById('contactFirstName').value,
    contactLastName: document.getElementById('contactLastName').value,
    contactRole: document.getElementById('contactRole').value,
    employeeCount: parseInt(document.getElementById('employeeCount').value) || null,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    website: document.getElementById('website').value,

    mainProblem: document.getElementById('mainProblem').value,
    urgency: parseInt(document.getElementById('urgency').value),
    currentSolution: document.getElementById('currentSolution').value,
    timeLost: parseInt(document.getElementById('timeLost').value) || null,
    monthlyCost: parseInt(document.getElementById('monthlyCost').value) || null,

    incomingChannels: Array.from(document.querySelectorAll('input[name="incoming"]:checked'))
      .map(cb => cb.nextElementSibling.textContent),
    responseTime: document.getElementById('responseTime').value,
    requestHandler: document.getElementById('requestHandler').value,
    processErrors: document.getElementById('processErrors').value,
    peakTimes: document.getElementById('peakTimes').value,

    idealProcess: document.getElementById('idealProcess').value,
    desiredSolutions: Array.from(document.querySelectorAll('input[name="solutions"]:checked'))
      .map(cb => cb.nextElementSibling.textContent),
    expectedResults: document.getElementById('expectedResults').value,

    domainProvider: document.getElementById('domainProvider').value,
    websiteSystem: document.getElementById('websiteSystem').value,
    emailSystem: document.getElementById('emailSystem').value,
    crmSystem: document.getElementById('crmSystem').value,
    projectTool: document.getElementById('projectTool').value,
    cloudStorage: document.getElementById('cloudStorage').value,
    phoneSystem: document.getElementById('phoneSystem').value,
    phoneNumberType: document.getElementById('phoneNumberType').value,
    apiAccess: document.getElementById('apiAccess').value,

    customerDataStored: document.getElementById('customerDataStored').value,
    dataTypes: document.getElementById('dataTypes').value,
    avContract: document.getElementById('avContract').value,
    euDataRequired: document.getElementById('euDataRequired').value,
    criticalIndustry: document.getElementById('criticalIndustry').value,

    budgetRange: document.getElementById('budgetRange').value,
    decisionMaker: document.getElementById('decisionMaker').value,
    projectStart: document.getElementById('projectStart').value,
    deadline: document.getElementById('deadline').value,

    shortDescription: document.getElementById('shortDescription').value,
    challenges: document.getElementById('challenges').value,
    insights: document.getElementById('insights').value,
    nextSteps: document.getElementById('nextSteps').value
  };

  try {
    if (currentEditId) {
      // UPDATE - Bestehenden Lead aktualisieren
      const docRef = doc(db, 'sales_leads', currentEditId);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      showAlert('Lead erfolgreich aktualisiert!', 'Erfolg');
    } else {
      // CREATE - Neuen Lead erstellen
      const customerNumber = generateCustomerNumber();
      await addDoc(collection(db, 'sales_leads'), {
        customerNumber: customerNumber,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showAlert(`Lead erfolgreich angelegt!\nKundennummer: ${customerNumber}`, 'Erfolg');
    }

    closeCustomerModal();
    await loadCustomers(); // Neu laden
  } catch (error) {
    console.error('Error saving customer:', error);
    showAlert('Fehler beim Speichern: ' + error.message, 'Fehler');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
```

#### c) `deleteCustomer()` - Aus Firebase löschen
```javascript
window.deleteCustomer = async function(customerId) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  const confirmed = await showConfirm(
    `Möchten Sie diesen Lead wirklich löschen?\n\nFirma: ${customer.companyName}\nKundennummer: ${customer.customerNumber}\n\nDieser Vorgang kann nicht rückgängig gemacht werden!`,
    'Lead löschen'
  );

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, 'sales_leads', customerId));
    showAlert('Lead erfolgreich gelöscht!', 'Erfolg');
    await loadCustomers(); // Neu laden
  } catch (error) {
    console.error('Error deleting customer:', error);
    showAlert('Fehler beim Löschen: ' + error.message, 'Fehler');
  }
};
```

### 3. Kundennummer-Generator
**Bleibt größtenteils gleich**, aber Counter sollte aus Firebase gelesen werden:

```javascript
// Option 1: Einfach - Timestamp-basiert (eindeutig)
function generateCustomerNumber() {
  const timestamp = Date.now();
  return `K-${timestamp}`;
}

// Option 2: Fortlaufend - Benötigt Counter in Firebase
// (Für später, wenn gewünscht)
```

---

## 📝 Firestore Security Rules

**Wichtig:** Security Rules für `sales_leads` Collection anpassen!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Sales Leads - Nur für authentifizierte Admin-User
    match /sales_leads/{leadId} {
      allow read, write: if request.auth != null &&
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Customers - Bestehende Regel bleibt
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }

    // ... weitere Rules
  }
}
```

---

## 🚀 Implementierungsschritte

### Phase 1: Vorbereitung
1. ✅ Analyse der bestehenden Struktur (erledigt)
2. ✅ Plan erstellt (dieses Dokument)
3. ⏳ Firestore Security Rules anpassen
4. ⏳ Backup der aktuellen customers.html erstellen

### Phase 2: Code-Integration
5. ⏳ Firebase Imports zu customers.html hinzufügen
6. ⏳ `loadCustomers()` auf Firebase umstellen
7. ⏳ Form Submit auf Firebase umstellen
8. ⏳ `deleteCustomer()` auf Firebase umstellen
9. ⏳ `editCustomer()` testen

### Phase 3: Testing
10. ⏳ Neuen Lead erstellen (CREATE)
11. ⏳ Lead bearbeiten (UPDATE)
12. ⏳ Lead löschen (DELETE)
13. ⏳ Lead-Liste laden (READ)
14. ⏳ Formular-Validierung testen

### Phase 4: Migration
15. ⏳ Die 2 Beispiel-Leads in Firebase migrieren
16. ⏳ Statisches Array aus Code entfernen

---

## ⚠️ Wichtige Hinweise

### Daten-Migration
- Die 2 bestehenden Beispiel-Kunden können manuell in Firebase eingefügt werden
- Oder: Einmal im Frontend anlegen nach Go-Live

### Kundennummer
- Aktuell: `K-20241201`, `K-20241202` (Counter-basiert)
- Neu: Entweder Counter in Firebase speichern ODER Timestamp verwenden
- **Empfehlung:** Timestamp (`K-1704614400000`) - einfacher, eindeutig

### Performance
- Bei vielen Leads (>100): Pagination implementieren
- Firestore hat ein Limit von 1 GB pro Dokument (kein Problem hier)

### Kosten
- Firestore Free Tier: 50.000 Reads/Tag, 20.000 Writes/Tag
- Für diese Anwendung: Absolut ausreichend

---

## 🎯 Nächste Schritte

**Nach User-Freigabe:**
1. Firestore Security Rules anpassen
2. Code-Integration durchführen
3. Testing
4. Migration der Beispieldaten

---

## ✅ Abnahme

- [ ] Plan gelesen und verstanden
- [ ] Datenstruktur approved
- [ ] Bereit für Implementierung

**User Feedback:**
_[Hier Kommentare/Änderungswünsche eintragen]_
