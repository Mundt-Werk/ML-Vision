/**
 * Mybach Monatsrechnung erstellen
 * Generiert HTML aus Template, lädt per FTP hoch, legt Firestore-Eintrag an.
 *
 * Nutzung:
 *   node create-mybach-invoice.js          → aktueller Monat
 *   node create-mybach-invoice.js 2026 7   → Juli 2026
 */

require('dotenv').config({ path: __dirname + '/.env' });

const ftp    = require('basic-ftp');
const fs     = require('fs');
const path   = require('path');
const admin  = require('firebase-admin');

// ── Firebase Init ─────────────────────────────────────────────────────────────
admin.initializeApp({ projectId: 'ml-vision-273ee' });
const db = admin.firestore();

// ── Konfiguration ─────────────────────────────────────────────────────────────
const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

const FTP_HOST     = 'w02058ff.kasserver.com';
const FTP_USER     = 'w02058ff';
const FTP_PASS     = process.env.FTP_PASS;
const FTP_REMOTE   = '/vision-ml.de/admin/angebote/mybach-co-immobilien/';
const TEMPLATE     = path.join(__dirname, '..', 'functions', 'templates', 'mybach-invoice.html');

// ── HTML generieren ───────────────────────────────────────────────────────────
function generateHtml(invoiceNo, year, month) {
  const monthName = MONTH_NAMES_DE[month - 1];
  const dateStr   = `01. ${monthName} ${year}`;
  const monthYear = `${monthName} ${year}`;

  let html = fs.readFileSync(TEMPLATE, 'utf8');
  html = html.split('{{INVOICE_NO}}').join(invoiceNo);
  html = html.split('{{DATE_STR}}').join(dateStr);
  html = html.split('{{MONTH_YEAR}}').join(monthYear);
  return html;
}

// ── FTP Upload ────────────────────────────────────────────────────────────────
async function uploadFtp(invoiceNo, html) {
  const tmp = path.join(require('os').tmpdir(), `${invoiceNo}.html`);
  fs.writeFileSync(tmp, html, 'utf8');

  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS, secure: false });
    await client.uploadFrom(tmp, `${FTP_REMOTE}${invoiceNo}.html`);
    console.log(`✓ FTP: ${invoiceNo}.html hochgeladen`);
  } finally {
    client.close();
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
}

// ── Firestore Eintrag ─────────────────────────────────────────────────────────
async function createFirestoreEntry(invoiceNo, year, month) {
  const existing = await db.collection('invoices').doc(invoiceNo).get();
  if (existing.exists) {
    console.log(`⚠ Firestore: ${invoiceNo} existiert bereits – übersprungen`);
    return false;
  }

  const monthName = MONTH_NAMES_DE[month - 1];
  const pdfUrl    = `https://vision-ml.de/admin/angebote/mybach-co-immobilien/${invoiceNo}.html`;

  await db.collection('invoices').doc(invoiceNo).set({
    customerId:  'mybach',
    invoiceNo,
    date:        admin.firestore.Timestamp.fromDate(new Date(year, month - 1, 1)),
    description: `KI-Telefonassistent Standard – ${monthName} ${year}`,
    amountGross: 4760,
    currency:    'EUR',
    status:      'open',
    pdfUrl,
    createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    createdBy:   'script',
  });

  console.log(`✓ Firestore: invoices/${invoiceNo} angelegt`);
  console.log(`✓ URL: ${pdfUrl}`);
  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const now   = new Date();
  const year  = parseInt(process.argv[2]) || now.getFullYear();
  const month = parseInt(process.argv[3]) || (now.getMonth() + 1);
  const pad2  = n => String(n).padStart(2, '0');
  const invoiceNo = `RE-MYB-${year}-${pad2(month)}`;

  console.log(`\nMybach Rechnung erstellen: ${invoiceNo}`);
  console.log('────────────────────────────────');

  if (!FTP_PASS) {
    console.error('Fehler: FTP_PASS nicht gesetzt (scripts/.env fehlt)');
    process.exit(1);
  }

  const html = generateHtml(invoiceNo, year, month);
  await uploadFtp(invoiceNo, html);
  await createFirestoreEntry(invoiceNo, year, month);

  console.log('\n✅ Fertig.');
  process.exit(0);
}

run().catch(err => {
  console.error('Fehler:', err.message);
  process.exit(1);
});
