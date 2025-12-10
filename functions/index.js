const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const stripe = require('stripe');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// MODUL 1: GESPRÄCHE (VOICE) - Twilio Integration
// ============================================================================

/**
 * Importiert Twilio Voice Calls täglich in Firestore
 * Collection: calls
 * Schedule: Täglich um 03:00 Uhr
 */
exports.importTwilioCalls = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    console.log('Starting Twilio import...');

    // Twilio Client initialisieren
    const accountSid = functions.config().twilio.account_sid;
    const authToken = functions.config().twilio.auth_token;
    const twilioClient = twilio(accountSid, authToken);

    try {
      // Hole alle Calls der letzten 24 Stunden
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const calls = await twilioClient.calls.list({
        startTime: yesterday,
        limit: 1000
      });

      console.log(`Found ${calls.length} calls to import`);

      // Verarbeite jeden Call
      for (const call of calls) {
        // Hole Recording URL (falls vorhanden)
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

        // Ermittle customerId aus der Twilio-Nummer
        // TODO: Mapping von Twilio-Nummer zu customerId implementieren
        const customerId = await getCustomerIdFromPhoneNumber(call.to);

        // Schreibe Call in Firestore
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

/**
 * Helper: Mapped Twilio Status zu unserem Status
 */
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

/**
 * Helper: Ermittelt customerId aus Telefonnummer
 * TODO: Implementiere Mapping-Logik (z.B. über customer_phone_numbers Collection)
 */
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

  // Fallback: Default customer (für Testing)
  return 'default_customer';
}

// ============================================================================
// MODUL 2: SUPPORT (TICKETS) - E-Mail Benachrichtigungen
// ============================================================================

/**
 * Sendet E-Mail bei neuem Ticket
 * Trigger: onCreate in Collection 'tickets'
 */
exports.sendTicketNotification = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snap, context) => {
    const ticket = snap.data();
    const ticketId = context.params.ticketId;

    console.log(`New ticket created: ${ticketId}`);

    try {
      // Hole Customer-Daten
      const customerDoc = await db.collection('customers').doc(ticket.customerId).get();
      const customer = customerDoc.data();

      // E-Mail-Transporter konfigurieren
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: functions.config().email.user,
          pass: functions.config().email.password
        }
      });

      // E-Mail senden
      await transporter.sendMail({
        from: functions.config().email.user,
        to: functions.config().email.support,
        subject: `[Support] Neues Ticket: ${ticket.title}`,
        html: `
          <h2>Neues Support-Ticket</h2>
          <p><strong>Ticket-ID:</strong> ${ticketId}</p>
          <p><strong>Kunde:</strong> ${customer?.name || ticket.customerId}</p>
          <p><strong>E-Mail:</strong> ${customer?.email || 'N/A'}</p>
          <p><strong>Kategorie:</strong> ${ticket.category}</p>
          <p><strong>Priorität:</strong> ${ticket.priority}</p>
          <hr>
          <p><strong>Nachricht:</strong></p>
          <p>${ticket.messages[0]?.text || 'Keine Nachricht'}</p>
          <hr>
          <p><a href="https://${functions.config().hosting.domain}/admin/tickets/${ticketId}" style="background: #04A9D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ticket öffnen</a></p>
        `
      });

      console.log(`Email sent for ticket ${ticketId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending ticket notification:', error);
      throw error;
    }
  });

/**
 * Sendet E-Mail bei Antwort auf Ticket
 * Trigger: onUpdate in Collection 'tickets' (wenn neue Message hinzugefügt wird)
 */
exports.sendReplyNotification = functions.firestore
  .document('tickets/{ticketId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const ticketId = context.params.ticketId;

    // Prüfe ob neue Message hinzugefügt wurde
    if (after.messages.length === before.messages.length) {
      return null; // Keine neue Message
    }

    const newMessage = after.messages[after.messages.length - 1];
    console.log(`New reply on ticket ${ticketId} from ${newMessage.author}`);

    try {
      // Hole Customer-Daten
      const customerDoc = await db.collection('customers').doc(after.customerId).get();
      const customer = customerDoc.data();

      // E-Mail-Transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: functions.config().email.user,
          pass: functions.config().email.password
        }
      });

      // Bestimme Empfänger basierend auf Author
      const recipient = newMessage.author === 'customer'
        ? functions.config().email.support  // Kunde antwortet → Support benachrichtigen
        : customer?.email;                   // Support antwortet → Kunde benachrichtigen

      if (!recipient) {
        console.log('No recipient found, skipping email');
        return null;
      }

      // E-Mail senden
      await transporter.sendMail({
        from: functions.config().email.user,
        to: recipient,
        subject: `[Support] Neue Antwort: ${after.title}`,
        html: `
          <h2>Neue Antwort auf Ticket #${ticketId}</h2>
          <p><strong>Von:</strong> ${newMessage.authorName}</p>
          <p><strong>Ticket:</strong> ${after.title}</p>
          <hr>
          <p>${newMessage.text}</p>
          <hr>
          <p><a href="https://${functions.config().hosting.domain}/${newMessage.author === 'customer' ? 'admin' : 'customer'}/tickets/${ticketId}" style="background: #04A9D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ticket öffnen</a></p>
        `
      });

      console.log(`Reply notification sent for ticket ${ticketId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending reply notification:', error);
      throw error;
    }
  });

// ============================================================================
// MODUL 3: RECHNUNGEN - Stripe Integration
// ============================================================================

/**
 * Importiert Stripe Invoices täglich in Firestore
 * Collection: invoices
 * Schedule: Täglich um 04:00 Uhr
 */
exports.importStripeInvoices = functions.pubsub
  .schedule('0 4 * * *')
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    console.log('Starting Stripe import...');

    // Stripe Client initialisieren
    const stripeClient = stripe(functions.config().stripe.secret_key);

    try {
      // Hole alle Customers
      const customersSnapshot = await db.collection('customers').get();

      let totalInvoices = 0;

      for (const customerDoc of customersSnapshot.docs) {
        const customer = customerDoc.data();

        if (!customer.stripeCustomerId) {
          console.log(`Skipping customer ${customerDoc.id} - no Stripe ID`);
          continue;
        }

        // Hole Invoices für diesen Customer
        const invoices = await stripeClient.invoices.list({
          customer: customer.stripeCustomerId,
          limit: 100
        });

        console.log(`Found ${invoices.data.length} invoices for customer ${customerDoc.id}`);

        // Verarbeite jede Invoice
        for (const invoice of invoices.data) {
          await db.collection('invoices').doc(invoice.id).set({
            invoiceId: invoice.id,
            customerId: customerDoc.id,
            invoiceNumber: invoice.number,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: invoice.amount_due / 100, // Cent → Euro
            currency: invoice.currency,
            status: invoice.status, // paid | open | uncollectible
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Manual Trigger zum sofortigen Import (für Testing)
 * Aufruf: firebase functions:call manualImportCalls
 */
exports.manualImportCalls = functions.https.onCall(async (data, context) => {
  // Nur für authentifizierte Admin-User
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  console.log('Manual Twilio import triggered');
  // Rufe die scheduled function auf
  return await exports.importTwilioCalls.run(context);
});

/**
 * Manual Trigger für Stripe Import
 */
exports.manualImportInvoices = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  console.log('Manual Stripe import triggered');
  return await exports.importStripeInvoices.run(context);
});
