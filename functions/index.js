const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const stripe = require('stripe');
const nodemailer = require('nodemailer');
const https = require('https');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// MODUL 1: GESPRÄCHE (VOICE) - Twilio Integration
// ============================================================================

exports.importTwilioCalls = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    console.log('Starting Twilio import...');

    const accountSid = functions.config().twilio.account_sid;
    const authToken = functions.config().twilio.auth_token;
    const twilioClient = twilio(accountSid, authToken);

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const calls = await twilioClient.calls.list({
        startTime: yesterday,
        limit: 1000
      });

      console.log(`Found ${calls.length} calls to import`);

      for (const call of calls) {
        let recordingUrl = null;
        try {
          const recordings = await twilioClient.recordings.list({
            callSid: call.sid,
            limit: 1
          });
          if (recordings.length > 0) {
            recordingUrl = `https://api.twilio.com${recordings[0].uri.replace('.json', '.mp3')}`;
          }
        } catch (error) {
          console.error(`Error fetching recording for call ${call.sid}:`, error);
        }

        const customerId = await getCustomerIdFromPhoneNumber(call.to);

        await db.collection('calls').doc(call.sid).set({
          callId: call.sid,
          customerId: customerId,
          timestamp: call.startTime?.toISOString() || new Date().toISOString(),
          duration: parseInt(call.duration) || 0,
          status: mapTwilioStatus(call.status),
          phoneNumber: call.from,
          recordingUrl: recordingUrl,
          twilioData: {
            direction: call.direction,
            price: call.price,
            priceUnit: call.priceUnit
          },
          importedAt: new Date().toISOString()
        }, { merge: true });
      }

      console.log(`Successfully imported ${calls.length} calls`);
      return { success: true, imported: calls.length };
    } catch (error) {
      console.error('Error importing Twilio calls:', error);
      throw error;
    }
  });

function mapTwilioStatus(twilioStatus) {
  const statusMap = {
    'completed': 'completed',
    'busy': 'failed',
    'no-answer': 'failed',
    'failed': 'failed',
    'canceled': 'failed'
  };
  return statusMap[twilioStatus] || 'unknown';
}

async function getCustomerIdFromPhoneNumber(phoneNumber) {
  try {
    const snapshot = await db.collection('customers')
      .where('twilioPhoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
  }

  return 'default_customer';
}

// ============================================================================
// MODUL 2: SUPPORT (TICKETS) - E-Mail Benachrichtigungen
// ============================================================================

function getEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email?.user || process.env.EMAIL_USER,
      pass: functions.config().email?.password || process.env.EMAIL_PASSWORD
    }
  });
}

exports.sendTicketNotification = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snap, context) => {
    const ticket = snap.data();
    const ticketId = context.params.ticketId;

    console.log(`New ticket created: ${ticketId}`);

    try {
      const customerDoc = await db.collection('customers').doc(ticket.customerId).get();
      const customer = customerDoc.data();

      const transporter = getEmailTransporter();
      const supportEmail = functions.config().email?.support || process.env.EMAIL_SUPPORT || 'support@ml-vision.de';

      await transporter.sendMail({
        from: functions.config().email?.user || process.env.EMAIL_USER,
        to: supportEmail,
        subject: `[Support] Neues Ticket #${ticketId.substring(0, 8)}: ${ticket.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #04A9D4;">Neues Support-Ticket</h2>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket-ID:</strong> ${ticketId}</p>
              <p><strong>Kunde:</strong> ${customer?.name || ticket.customerId}</p>
              <p><strong>E-Mail:</strong> ${customer?.email || 'N/A'}</p>
              <p><strong>Kategorie:</strong> ${ticket.category || 'Allgemein'}</p>
              <p><strong>Priorität:</strong> ${ticket.priority || 'normal'}</p>
              <p><strong>Status:</strong> ${ticket.status}</p>
            </div>
            <div style="background: #fff; padding: 20px; border-left: 4px solid #04A9D4; margin: 20px 0;">
              <h3 style="margin-top: 0;">Nachricht:</h3>
              <p style="white-space: pre-wrap;">${ticket.body || 'Keine Nachricht'}</p>
            </div>
          </div>
        `
      });

      console.log(`Email sent for ticket ${ticketId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending ticket notification:', error);
      return { success: false, error: error.message };
    }
  });

exports.sendMessageNotification = functions.firestore
  .document('tickets/{ticketId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const ticketId = context.params.ticketId;
    const messageId = context.params.messageId;

    console.log(`New message in ticket ${ticketId}: ${messageId}`);

    try {
      const ticketDoc = await db.collection('tickets').doc(ticketId).get();
      const ticket = ticketDoc.data();

      if (!ticket) {
        console.error(`Ticket ${ticketId} not found`);
        return { success: false, error: 'Ticket not found' };
      }

      const customerDoc = await db.collection('customers').doc(ticket.customerId).get();
      const customer = customerDoc.data();

      const transporter = getEmailTransporter();
      const supportEmail = functions.config().email?.support || process.env.EMAIL_SUPPORT || 'support@ml-vision.de';

      if (message.author === 'customer') {
        await transporter.sendMail({
          from: functions.config().email?.user || process.env.EMAIL_USER,
          to: supportEmail,
          subject: `[Support] Antwort zu Ticket #${ticketId.substring(0, 8)}: ${ticket.title}`,
          html: `<div style="font-family: Arial, sans-serif;"><h2>Neue Antwort vom Kunden</h2><p>${message.text}</p></div>`
        });
      } else if (message.author === 'support' && customer?.email) {
        await transporter.sendMail({
          from: functions.config().email?.user || process.env.EMAIL_USER,
          to: customer.email,
          subject: `Antwort zu Ihrem Support-Ticket: ${ticket.title}`,
          html: `<div style="font-family: Arial, sans-serif;"><h2>Antwort vom ML Vision Support</h2><p>${message.text}</p></div>`
        });
      }

      await db.collection('tickets').doc(ticketId).update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Email sent for message ${messageId} in ticket ${ticketId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending message notification:', error);
      return { success: false, error: error.message };
    }
  });

// ============================================================================
// MODUL 3: RECHNUNGEN - Stripe Integration
// ============================================================================

exports.importStripeInvoices = functions.pubsub
  .schedule('0 4 * * *')
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    console.log('Starting Stripe import...');

    const stripeClient = stripe(functions.config().stripe.secret_key);

    try {
      const customersSnapshot = await db.collection('customers').get();
      let totalInvoices = 0;

      for (const customerDoc of customersSnapshot.docs) {
        const customer = customerDoc.data();

        if (!customer.stripeCustomerId) continue;

        const invoices = await stripeClient.invoices.list({
          customer: customer.stripeCustomerId,
          limit: 100
        });

        for (const invoice of invoices.data) {
          await db.collection('invoices').doc(invoice.id).set({
            invoiceId: invoice.id,
            customerId: customerDoc.id,
            invoiceNumber: invoice.number,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: invoice.amount_due / 100,
            currency: invoice.currency,
            status: invoice.status,
            pdfUrl: invoice.invoice_pdf,
            hostedInvoiceUrl: invoice.hosted_invoice_url,
            stripeData: {
              subtotal: invoice.subtotal / 100,
              tax: invoice.tax ? invoice.tax / 100 : 0,
              total: invoice.total / 100
            },
            importedAt: new Date().toISOString()
          }, { merge: true });

          totalInvoices++;
        }
      }

      console.log(`Successfully imported ${totalInvoices} invoices`);
      return { success: true, imported: totalInvoices };
    } catch (error) {
      console.error('Error importing Stripe invoices:', error);
      throw error;
    }
  });

// ============================================================================
// MODUL 4: BENUTZERVERWALTUNG
// ============================================================================

exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Nicht authentifiziert');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin-Berechtigung erforderlich');
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'uid fehlt');
  }

  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Eigener Account kann nicht gelöscht werden');
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw new functions.https.HttpsError('internal', 'Auth-Löschung fehlgeschlagen: ' + err.message);
    }
  }

  await db.collection('users').doc(uid).delete();

  console.log(`User ${uid} deleted by admin ${context.auth.uid}`);
  return { success: true };
});

exports.manualImportCalls = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  return await exports.importTwilioCalls.run(context);
});

exports.manualImportInvoices = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  return await exports.importStripeInvoices.run(context);
});

// ============================================================================
// MODUL 5: MYBACH – ElevenLabs Call Speichern (von n8n aufgerufen)
// ============================================================================

// HTTP-Helper für ElevenLabs API Calls (kein externes npm-Paket nötig)
function elevenLabsRequest(path) {
  return new Promise((resolve, reject) => {
    const apiKey = functions.config().mlvision.elevenlabs_key;
    const options = {
      hostname: 'api.elevenlabs.io',
      path: path,
      method: 'GET',
      headers: { 'xi-api-key': apiKey }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Felder aus ElevenLabs data_collection_results extrahieren + in Firestore schreiben
async function saveConversationToFirestore(conv) {
  const col = conv.analysis?.data_collection_results || {};
  const duration = conv.call_duration_secs || conv.metadata?.call_duration_secs || 0;

  const name         = (col.anrufer_name?.value  || '').trim();
  const telefon      = (col.telefonnummer?.value || '').trim();
  const email        = (col.email?.value         || '').trim();
  const terminart    = (col.terminart?.value     || '').trim();
  const wunschtermin = (col.wunschtermin?.value  || '').trim();
  const notizen      = (col.notizen?.value       || '').trim();
  const immoNr       = (col.immo_nr?.value       || '').trim();

  // Transcript vereinfachen — nur role, message, time
  const transcript = (conv.transcript || [])
    .filter(t => t.message && t.role)
    .map(t => ({ role: t.role, message: t.message, t: Math.round(t.time_in_call_secs || 0) }));

  // Twilio-Anrufernummer aus ElevenLabs-Metadaten — immer verfügbar, auch bei Auflegern
  const anruferNummer = (
    conv.metadata?.phone_call?.external_number ||
    conv.conversation_initiation_client_data?.dynamic_variables?.system__caller_id ||
    ''
  ).trim();
  const twilioCallSid = (conv.metadata?.phone_call?.call_sid || '').trim();

  let outcome;
  if (duration < 5)                 outcome = 'hung_up';
  else if (name && wunschtermin)    outcome = 'termin';
  else if (name)                    outcome = 'info';
  else if (telefon || anruferNummer) outcome = 'callback';
  else                              outcome = 'missed';

  let wunschterminFormatiert = '';
  if (wunschtermin) {
    try {
      const d = new Date(wunschtermin);
      if (!isNaN(d.getTime())) {
        wunschterminFormatiert = d.toLocaleDateString('de-DE', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
      }
    } catch (e) { wunschterminFormatiert = wunschtermin; }
  }

  const timestamp = conv.start_time_unix_secs || conv.metadata?.start_time_unix_secs
    ? new Date((conv.start_time_unix_secs || conv.metadata.start_time_unix_secs) * 1000).toISOString()
    : new Date().toISOString();

  await db.collection('calls').doc(conv.conversation_id).set({
    customerId: 'mybach',
    callId: conv.conversation_id,
    convId: conv.conversation_id,
    name, telefon, email, terminart,
    wunschtermin, wunschterminFormatiert,
    notizen, immoNr,
    anruferNummer, twilioCallSid,
    transcript,
    duration,
    timestamp,
    outcome,
    source: 'elevenlabs_sync',
    syncedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return outcome;
}

/**
 * Von n8n aufgerufen nach jedem ElevenLabs-Call.
 * Ersetzt den direkten Firestore REST API Aufruf (OAuth2 ist weg).
 * Auth: Bearer Token aus Firebase Config (mlvision.n8n_secret)
 */
exports.saveElevenLabsCall = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  const expected = functions.config().mlvision?.n8n_secret;
  if (!expected || token !== expected) {
    console.error('saveElevenLabsCall: unauthorized attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const d = req.body;
  if (!d || !d.convId) {
    return res.status(400).json({ error: 'Missing required field: convId' });
  }

  try {
    await db.collection('calls').doc(d.convId).set({
      customerId: 'mybach',
      callId: d.callId || d.convId,
      convId: d.convId,
      name: d.name || '',
      telefon: d.telefon || '',
      email: d.email || '',
      terminart: d.terminart || '',
      wunschtermin: d.wunschtermin || '',
      wunschterminFormatiert: d.wunschterminFormatiert || '',
      notizen: d.notizen || '',
      immoNr: d.immoNr || '',
      anruferNummer: d.anruferNummer || '',
      twilioCallSid: d.twilioCallSid || '',
      transcript: Array.isArray(d.transcript) ? d.transcript : [],
      duration: d.duration || 0,
      timestamp: d.timestamp || new Date().toISOString(),
      outcome: d.outcome || 'missed',
      source: 'elevenlabs',
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`saveElevenLabsCall: saved ${d.convId} (outcome: ${d.outcome})`);
    return res.status(200).json({ success: true, id: d.convId });
  } catch (err) {
    console.error('saveElevenLabsCall error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// MODUL 6: MYBACH – ElevenLabs Sync (läuft alle 30 Minuten automatisch)
// ============================================================================

/**
 * Holt alle Conversations der letzten 2 Stunden von ElevenLabs
 * und speichert fehlende in Firestore. Fängt verpasste Webhook-Calls auf.
 */
exports.syncMybachCalls = functions.pubsub
  .schedule('every 30 minutes')
  .timeZone('Europe/Berlin')
  .onRun(async () => {
    const agentId = functions.config().mlvision?.elevenlabs_agent_id || 'agent_9201kn7pbsb4ffetwq9wt6rq3d0p';
    console.log('syncMybachCalls: starting...');

    // Conversations der letzten 2 Stunden holen
    const listData = await elevenLabsRequest(
      `/v1/convai/conversations?agent_id=${agentId}&page_size=100`
    );

    const since = Math.floor(Date.now() / 1000) - (2 * 60 * 60);
    const recent = (listData.conversations || []).filter(
      c => (c.start_time_unix_secs || 0) >= since
    );

    console.log(`syncMybachCalls: ${recent.length} conversations in last 2h`);

    let saved = 0;
    let skipped = 0;

    for (const conv of recent) {
      // Nur Null-Sekunden-Calls überspringen (nie verbunden) — Aufleger mit Nummer werden gespeichert
      if ((conv.call_duration_secs || 0) === 0) {
        skipped++;
        continue;
      }

      try {
        // Überspringen nur wenn bereits vollständig synchronisiert (hat Transcript)
        const existing = await db.collection('calls').doc(conv.conversation_id).get();
        if (existing.exists && Array.isArray(existing.data().transcript) && existing.data().transcript.length > 0) {
          skipped++;
          continue;
        }

        // Vollständige Conversation-Daten holen (enthält data_collection_results)
        const detail = await elevenLabsRequest(
          `/v1/convai/conversations/${conv.conversation_id}`
        );

        await saveConversationToFirestore({ ...conv, ...detail });
        saved++;
      } catch (err) {
        console.error(`syncMybachCalls: error on ${conv.conversation_id}: ${err.message}`);
      }
    }

    console.log(`syncMybachCalls: saved=${saved}, skipped=${skipped}`);
    return { saved, skipped };
  });

// ============================================================================
// MODUL 7: MYBACH – Historischer Backfill (einmalig ausführen)
// ============================================================================

/**
 * Holt ALLE bisherigen Conversations von ElevenLabs und speichert sie in Firestore.
 * Einmalig aufrufen um den Rückstand aufzuholen.
 * Auth: gleicher Bearer Token wie saveElevenLabsCall
 */
exports.backfillMybachCalls = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  .https.onRequest(async (req, res) => {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '');
    const expected = functions.config().mlvision?.n8n_secret;
    if (!expected || token !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const agentId = functions.config().mlvision?.elevenlabs_agent_id || 'agent_9201kn7pbsb4ffetwq9wt6rq3d0p';

    let cursor = null;
    let totalSaved = 0;
    let totalSkipped = 0;
    let page = 0;

    console.log('backfillMybachCalls: starting full backfill...');

    do {
      const path = `/v1/convai/conversations?agent_id=${agentId}&page_size=100${cursor ? '&cursor=' + cursor : ''}`;
      const data = await elevenLabsRequest(path);
      const conversations = data.conversations || [];

      for (const conv of conversations) {
        if ((conv.call_duration_secs || 0) === 0) {
          totalSkipped++;
          continue;
        }

        try {
          const detail = await elevenLabsRequest(`/v1/convai/conversations/${conv.conversation_id}`);
          await saveConversationToFirestore({ ...conv, ...detail });
          totalSaved++;
        } catch (err) {
          console.error(`backfillMybachCalls: error on ${conv.conversation_id}: ${err.message}`);
        }
      }

      cursor = data.next_cursor || null;
      page++;
      console.log(`backfillMybachCalls: page ${page}, saved so far: ${totalSaved}`);
    } while (cursor && page < 30);

    console.log(`backfillMybachCalls: done. saved=${totalSaved}, skipped=${totalSkipped}`);
    return res.status(200).json({ success: true, saved: totalSaved, skipped: totalSkipped });
  });

// ============================================================================
// MODUL 8: MYBACH — Automatische Monatsrechnung (HTML + FTP + Firestore)
// ============================================================================

const ftp  = require('basic-ftp');
const fs   = require('fs');
const path = require('path');

const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

const FTP_CONFIG = {
  host: 'w02058ff.kasserver.com',
  user: 'w02058ff',
  get password() { return functions.config().allinkl?.ftp_pass || process.env.FTP_PASS; },
  secure: false,
};
const FTP_REMOTE_DIR = '/vision-ml.de/admin/angebote/mybach-co-immobilien/';

function generateMybachInvoiceHTML(invoiceNo, year, month) {
  const monthName = MONTH_NAMES_DE[month - 1];
  const pad2 = n => String(n).padStart(2, '0');
  const dateStr = `01. ${monthName} ${year}`;
  const monthYear = `${monthName} ${year}`;

  const templatePath = path.join(__dirname, 'templates', 'mybach-invoice.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html.split('{{INVOICE_NO}}').join(invoiceNo);
  html = html.split('{{DATE_STR}}').join(dateStr);
  html = html.split('{{MONTH_YEAR}}').join(monthYear);

  return html;
}

async function uploadInvoiceViaFtp(invoiceNo, htmlContent) {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  const tmpPath = path.join('/tmp', `${invoiceNo}.html`);
  fs.writeFileSync(tmpPath, htmlContent, 'utf8');

  try {
    await client.access(FTP_CONFIG);
    await client.uploadFrom(tmpPath, `${FTP_REMOTE_DIR}${invoiceNo}.html`);
    console.log(`FTP upload OK: ${invoiceNo}.html`);
  } finally {
    client.close();
    try { fs.unlinkSync(tmpPath); } catch (_) {}
  }
}

async function createMybachInvoiceForMonth(year, month) {
  const monthPadded = String(month).padStart(2, '0');
  const invoiceId = `RE-MYB-${year}-${monthPadded}`;
  const monthName = MONTH_NAMES_DE[month - 1];
  const issueDate = new Date(year, month - 1, 1);

  const existing = await db.collection('invoices').doc(invoiceId).get();
  if (existing.exists) {
    console.log(`Invoice ${invoiceId} already exists, skipping`);
    return { skipped: true, id: invoiceId };
  }

  // HTML generieren
  const html = generateMybachInvoiceHTML(invoiceId, year, month);

  // Per FTP auf vision-ml.de hochladen
  await uploadInvoiceViaFtp(invoiceId, html);

  const pdfUrl = `https://vision-ml.de/admin/angebote/mybach-co-immobilien/${invoiceId}.html`;

  // Firestore-Dokument anlegen
  await db.collection('invoices').doc(invoiceId).set({
    customerId: 'mybach',
    invoiceNo: invoiceId,
    date: admin.firestore.Timestamp.fromDate(issueDate),
    description: `KI-Telefonassistent Standard – ${monthName} ${year}`,
    amountGross: 4760,
    currency: 'EUR',
    status: 'open',
    pdfUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'auto'
  });

  console.log(`createMybachInvoice: ${invoiceId} → ${pdfUrl}`);
  return { success: true, id: invoiceId, pdfUrl };
}

// Jeden 1. des Monats um 07:00 Uhr (Europe/Berlin)
exports.createMybachMonthlyInvoice = functions.pubsub
  .schedule('0 7 1 * *')
  .timeZone('Europe/Berlin')
  .onRun(async () => {
    const now = new Date();
    return createMybachInvoiceForMonth(now.getFullYear(), now.getMonth() + 1);
  });

// Manueller Trigger — z.B. für die Juni-Rechnung jetzt sofort
// POST /createMybachInvoiceNow mit Bearer-Token und Body {"year": 2026, "month": 6}
// Ohne Body: aktueller Monat
exports.createMybachInvoiceNow = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  const expected = functions.config().mlvision?.n8n_secret;
  if (!expected || token !== expected) return res.status(401).json({ error: 'Unauthorized' });

  const now = new Date();
  const year  = Number(req.body?.year)  || now.getFullYear();
  const month = Number(req.body?.month) || (now.getMonth() + 1);

  try {
    const result = await createMybachInvoiceForMonth(year, month);
    return res.status(200).json(result);
  } catch (err) {
    console.error('createMybachInvoiceNow error:', err);
    return res.status(500).json({ error: err.message });
  }
});
