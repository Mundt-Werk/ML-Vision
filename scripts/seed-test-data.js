/**
 * Firebase Testdaten-Generator
 *
 * Erstellt komplette Testdaten für ML Vision Customer Dashboard:
 * - Customer (cust_test) mit allen Modulen aktiv
 * - User (test@mlvision.de) verknüpft mit cust_test
 * - 30-40 Calls mit verschiedenen Status & Dauer
 * - 8 Tickets mit Messages + File-Referenzen
 * - 5 Invoices mit PDF-Referenzen
 *
 * Usage: node scripts/seed-test-data.js
 */

const admin = require('firebase-admin');

// Firebase Admin SDK initialisieren
// WICHTIG: Service Account Key erforderlich!
// Download von: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'YOUR_PROJECT_ID.appspot.com' // Ersetze mit deiner Project ID
});

const db = admin.firestore();
const storage = admin.storage().bucket();

// Testdaten Konstanten
const TEST_CUSTOMER_ID = 'cust_test';
const TEST_USER_UID = 'test_user_uid_12345';
const TEST_USER_EMAIL = 'test@mlvision.de';
const TEST_USER_PASSWORD = 'testpassword123';

// Helper: Zufällige Auswahl aus Array
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Zufällige Zahl zwischen min und max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Datum X Tage in der Vergangenheit
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Helper: Mock PDF erstellen und hochladen
async function uploadMockPDF(customerId, filename, content) {
  const filePath = `invoices/${customerId}/${filename}`;
  const file = storage.file(filePath);

  // Einfacher PDF-Inhalt (minimal gültig)
  const pdfContent = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000315 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
408
%%EOF`);

  await file.save(pdfContent, {
    contentType: 'application/pdf',
    metadata: {
      contentType: 'application/pdf'
    }
  });

  // Get public URL
  await file.makePublic();
  return `https://storage.googleapis.com/${storage.name}/${filePath}`;
}

// 1. Customer erstellen
async function createCustomer() {
  console.log('📦 Creating customer...');

  await db.collection('customers').doc(TEST_CUSTOMER_ID).set({
    customerId: TEST_CUSTOMER_ID,
    name: 'Test Firma GmbH',
    email: 'kontakt@testfirma.de',
    phone: '+49 30 12345678',

    // Alle Module aktiv
    modules: {
      voice: true,
      support: true,
      invoices: true,
      settings: true
    },

    // Stripe-Daten (optional)
    stripeCustomerId: 'cus_test_stripe123',
    stripeSubscriptionId: 'sub_test_stripe456',
    planName: 'Professional Plan',
    planPrice: 79,
    planFeatures: [
      '500 Voice-Calls/Monat',
      'Unbegrenzte Support-Tickets',
      'Rechnungsverwaltung'
    ],

    // Benachrichtigungen
    notifications: {
      email: true,
      tickets: true,
      invoices: true
    },

    createdAt: admin.firestore.Timestamp.fromDate(daysAgo(90)),
    updatedAt: admin.firestore.Timestamp.now()
  });

  console.log('✅ Customer created: cust_test');
}

// 2. User erstellen (Firebase Auth + Firestore)
async function createUser() {
  console.log('👤 Creating user...');

  try {
    // Firebase Auth User erstellen
    await admin.auth().createUser({
      uid: TEST_USER_UID,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      displayName: 'Test User',
      emailVerified: true
    });

    console.log('✅ Auth user created:', TEST_USER_EMAIL);
  } catch (error) {
    if (error.code === 'auth/uid-already-exists') {
      console.log('ℹ️  Auth user already exists, skipping...');
    } else {
      throw error;
    }
  }

  // Firestore User Document
  await db.collection('users').doc(TEST_USER_UID).set({
    uid: TEST_USER_UID,
    email: TEST_USER_EMAIL,
    role: 'customer',
    customerId: TEST_CUSTOMER_ID,
    createdAt: admin.firestore.Timestamp.fromDate(daysAgo(90)),
    lastLogin: admin.firestore.Timestamp.now()
  });

  console.log('✅ User document created');
  console.log('📧 Login: test@mlvision.de / testpassword123');
}

// 3. Calls erstellen (30-40 Einträge)
async function createCalls() {
  console.log('📞 Creating calls...');

  const statuses = ['completed', 'completed', 'completed', 'failed', 'unknown'];
  const batch = db.batch();
  const numCalls = randomInt(30, 40);

  for (let i = 0; i < numCalls; i++) {
    const callId = `CA${Date.now()}${i}${randomInt(1000, 9999)}`;
    const status = randomChoice(statuses);
    const duration = status === 'completed' ? randomInt(30, 600) : 0; // 30s - 10min
    const daysOld = randomInt(0, 30);

    const callRef = db.collection('calls').doc(callId);
    batch.set(callRef, {
      callId: callId,
      customerId: TEST_CUSTOMER_ID,
      timestamp: admin.firestore.Timestamp.fromDate(daysAgo(daysOld)),
      duration: duration,
      status: status,
      phoneNumber: `+4915${randomInt(10000000, 99999999)}`,
      recordingUrl: status === 'completed'
        ? `https://api.twilio.com/recordings/${callId}.mp3`
        : null,
      twilioData: {
        direction: randomChoice(['inbound', 'outbound']),
        price: '-0.013',
        priceUnit: 'USD'
      },
      importedAt: admin.firestore.Timestamp.now()
    });
  }

  await batch.commit();
  console.log(`✅ ${numCalls} calls created`);
}

// 4. Tickets + Messages erstellen
async function createTickets() {
  console.log('🎫 Creating tickets...');

  const ticketTemplates = [
    {
      title: 'Wie exportiere ich Gespräche?',
      body: 'Ich finde den Export-Button nicht. Können Sie mir helfen?',
      category: 'Frage',
      status: 'open',
      priority: 'normal'
    },
    {
      title: 'Rechnung vom Januar fehlt',
      body: 'In meiner Übersicht fehlt die Rechnung vom Januar 2025. Können Sie diese nachträglich hochladen?',
      category: 'Problem',
      status: 'pending',
      priority: 'high'
    },
    {
      title: 'Feature-Request: Anruffilter',
      body: 'Wäre es möglich, in der Gesprächsübersicht nach Telefonnummern zu filtern?',
      category: 'Feature-Request',
      status: 'open',
      priority: 'low'
    },
    {
      title: 'Voice-Agent antwortet nicht',
      body: 'Seit gestern Abend nimmt der Voice-Agent keine Anrufe mehr entgegen. Können Sie das prüfen?',
      category: 'Problem',
      status: 'closed',
      priority: 'high'
    },
    {
      title: 'Wie ändere ich mein Passwort?',
      body: 'Ich möchte mein Passwort ändern, finde aber die Option nicht.',
      category: 'Frage',
      status: 'closed',
      priority: 'normal'
    },
    {
      title: 'API-Integration Dokumentation',
      body: 'Gibt es eine API-Dokumentation für die Integration in unser CRM?',
      category: 'Frage',
      status: 'pending',
      priority: 'normal'
    },
    {
      title: 'Fehler beim PDF-Download',
      body: 'Beim Versuch, die Rechnung vom Februar herunterzuladen, bekomme ich einen Fehler.',
      category: 'Problem',
      status: 'open',
      priority: 'high'
    },
    {
      title: 'Upgrade auf Business Plan',
      body: 'Wir möchten gerne auf den Business Plan upgraden. Wie funktioniert das?',
      category: 'Frage',
      status: 'open',
      priority: 'normal'
    }
  ];

  for (let i = 0; i < ticketTemplates.length; i++) {
    const template = ticketTemplates[i];
    const daysOld = randomInt(1, 20);

    // Ticket erstellen
    const ticketRef = await db.collection('tickets').add({
      customerId: TEST_CUSTOMER_ID,
      title: template.title,
      body: template.body,
      category: template.category,
      status: template.status,
      priority: template.priority,
      files: [],
      lastAgent: template.status !== 'open' ? 'support@ml-vision.de' : null,
      createdAt: admin.firestore.Timestamp.fromDate(daysAgo(daysOld)),
      updatedAt: admin.firestore.Timestamp.fromDate(daysAgo(Math.max(0, daysOld - randomInt(0, 5))))
    });

    // Messages hinzufügen (1-3 pro Ticket)
    const numMessages = randomInt(1, 3);
    for (let j = 0; j < numMessages; j++) {
      const isSupport = j % 2 === 1; // Abwechselnd Customer/Support

      await ticketRef.collection('messages').add({
        ticketId: ticketRef.id,
        author: isSupport ? 'support' : 'customer',
        authorId: isSupport ? 'admin_uid' : TEST_USER_UID,
        authorName: isSupport ? 'ML Vision Support' : 'Test User',
        text: isSupport
          ? 'Vielen Dank für Ihre Anfrage. Wir kümmern uns darum und melden uns in Kürze.'
          : 'Danke für die schnelle Antwort!',
        files: [],
        createdAt: admin.firestore.Timestamp.fromDate(daysAgo(Math.max(0, daysOld - j)))
      });
    }

    console.log(`✅ Ticket ${i + 1}/8 created with ${numMessages} messages`);
  }

  console.log('✅ All tickets created');
}

// 5. Invoices + PDFs erstellen
async function createInvoices() {
  console.log('💰 Creating invoices...');

  const invoiceTemplates = [
    { month: 'Dezember 2024', amount: 7900, status: 'paid', daysAgo: 40 },
    { month: 'Januar 2025', amount: 7900, status: 'paid', daysAgo: 10 },
    { month: 'Februar 2025', amount: 7900, status: 'paid', daysAgo: 5 },
    { month: 'März 2025', amount: 7900, status: 'open', daysAgo: 1 },
    { month: 'Setup-Gebühr', amount: 19900, status: 'paid', daysAgo: 90 }
  ];

  for (let i = 0; i < invoiceTemplates.length; i++) {
    const template = invoiceTemplates[i];
    const invoiceNo = template.month === 'Setup-Gebühr'
      ? 'SETUP-2024-001'
      : `INV-2025-${String(i + 1).padStart(3, '0')}`;
    const date = daysAgo(template.daysAgo);

    // Mock PDF hochladen
    console.log(`  📄 Uploading PDF for ${invoiceNo}...`);
    const pdfFilename = `${invoiceNo}.pdf`;
    const pdfContent = `Rechnung ${invoiceNo} - ${template.month} - ${(template.amount / 100).toFixed(2)} EUR`;

    let pdfUrl;
    try {
      pdfUrl = await uploadMockPDF(TEST_CUSTOMER_ID, pdfFilename, pdfContent);
    } catch (error) {
      console.log(`  ⚠️  PDF upload failed (Storage might not be configured):`, error.message);
      pdfUrl = null;
    }

    // Invoice Document erstellen
    await db.collection('invoices').add({
      invoiceNo: invoiceNo,
      customerId: TEST_CUSTOMER_ID,
      date: admin.firestore.Timestamp.fromDate(date),
      description: template.month === 'Setup-Gebühr'
        ? 'Einmalige Setup-Gebühr'
        : `Professional Plan - ${template.month}`,
      amountGross: template.amount,
      currency: 'EUR',
      status: template.status,
      pdfPath: pdfUrl ? `invoices/${TEST_CUSTOMER_ID}/${pdfFilename}` : null,
      pdfUrl: pdfUrl,
      planName: 'Professional Plan',
      period: template.month,
      createdAt: admin.firestore.Timestamp.fromDate(date),
      updatedAt: admin.firestore.Timestamp.fromDate(date)
    });

    console.log(`  ✅ Invoice ${invoiceNo} created`);
  }

  console.log('✅ All invoices created');
}

// Main Funktion
async function seedTestData() {
  console.log('🚀 Starting test data seeding...\n');

  try {
    await createCustomer();
    await createUser();
    await createCalls();
    await createTickets();
    await createInvoices();

    console.log('\n✅ Test data seeding completed!\n');
    console.log('📊 Summary:');
    console.log('  - Customer: cust_test (all modules enabled)');
    console.log('  - User: test@mlvision.de / testpassword123');
    console.log('  - Calls: 30-40 entries with varied status & duration');
    console.log('  - Tickets: 8 tickets with 1-3 messages each');
    console.log('  - Invoices: 5 invoices with mock PDFs');
    console.log('\n🎯 Ready for testing!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Script ausführen
seedTestData();
