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
 * Helper: E-Mail Transporter konfigurieren
 */
function getEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email?.user || process.env.EMAIL_USER,
      pass: functions.config().email?.password || process.env.EMAIL_PASSWORD
    }
  });
}

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
      const transporter = getEmailTransporter();

      // Support E-Mail Adresse
      const supportEmail = functions.config().email?.support || process.env.EMAIL_SUPPORT || 'support@ml-vision.de';

      // E-Mail senden
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
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://your-domain.com/admin/pages/support.html?ticket=${ticketId}"
                 style="background: #04A9D4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ticket öffnen
              </a>
            </p>
          </div>
        `
      });

      console.log(`Email sent for ticket ${ticketId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending ticket notification:', error);
      // Don't throw error to avoid blocking ticket creation
      return { success: false, error: error.message };
    }
  });

/**
 * Sendet E-Mail bei neuer Message in Ticket
 * Trigger: onCreate in Subcollection 'tickets/{ticketId}/messages'
 */
exports.sendMessageNotification = functions.firestore
  .document('tickets/{ticketId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const ticketId = context.params.ticketId;
    const messageId = context.params.messageId;

    console.log(`New message in ticket ${ticketId}: ${messageId}`);

    try {
      // Hole Ticket-Daten
      const ticketDoc = await db.collection('tickets').doc(ticketId).get();
      const ticket = ticketDoc.data();

      if (!ticket) {
        console.error(`Ticket ${ticketId} not found`);
        return { success: false, error: 'Ticket not found' };
      }

      // Hole Customer-Daten
      const customerDoc = await db.collection('customers').doc(ticket.customerId).get();
      const customer = customerDoc.data();

      const transporter = getEmailTransporter();
      const supportEmail = functions.config().email?.support || process.env.EMAIL_SUPPORT || 'support@ml-vision.de';

      // Sende E-Mail abhängig vom Author
      if (message.author === 'customer') {
        // Kunde hat geantwortet → Benachrichtige Support
        await transporter.sendMail({
          from: functions.config().email?.user || process.env.EMAIL_USER,
          to: supportEmail,
          subject: `[Support] Antwort zu Ticket #${ticketId.substring(0, 8)}: ${ticket.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #04A9D4;">Neue Antwort vom Kunden</h2>
              <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket-ID:</strong> ${ticketId}</p>
                <p><strong>Kunde:</strong> ${customer?.name || ticket.customerId}</p>
                <p><strong>Von:</strong> ${message.authorName}</p>
              </div>
              <div style="background: #fff; padding: 20px; border-left: 4px solid #04A9D4; margin: 20px 0;">
                <h3 style="margin-top: 0;">Nachricht:</h3>
                <p style="white-space: pre-wrap;">${message.text}</p>
              </div>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://your-domain.com/admin/pages/support.html?ticket=${ticketId}"
                   style="background: #04A9D4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Ticket öffnen
                </a>
              </p>
            </div>
          `
        });
      } else if (message.author === 'support' && customer?.email) {
        // Support hat geantwortet → Benachrichtige Kunde
        await transporter.sendMail({
          from: functions.config().email?.user || process.env.EMAIL_USER,
          to: customer.email,
          subject: `Antwort zu Ihrem Support-Ticket: ${ticket.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #04A9D4;">Antwort vom ML Vision Support</h2>
              <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket:</strong> ${ticket.title}</p>
                <p><strong>Von:</strong> ${message.authorName}</p>
              </div>
              <div style="background: #fff; padding: 20px; border-left: 4px solid #04A9D4; margin: 20px 0;">
                <h3 style="margin-top: 0;">Nachricht:</h3>
                <p style="white-space: pre-wrap;">${message.text}</p>
              </div>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://your-domain.com/customer/pages/support.html?ticket=${ticketId}"
                   style="background: #04A9D4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Ticket öffnen
                </a>
              </p>
            </div>
          `
        });
      }

      // Update ticket updatedAt timestamp
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

// ============================================================================
// MODUL 4: BENUTZERVERWALTUNG
// ============================================================================

/**
 * Löscht Firebase Auth-Account + Firestore-Dokument eines Benutzers.
 * Wird von admin/pages/users.html via httpsCallable aufgerufen.
 *
 * @param {{ uid: string }} data — UID des zu löschenden Benutzers
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Nur für eingeloggte Benutzer
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Nicht authentifiziert');
  }

  // Überprüfe Admin-Rolle im Firestore
  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin-Berechtigung erforderlich');
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'uid fehlt');
  }

  // Selbst-Löschen verbieten
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Eigener Account kann nicht gelöscht werden');
  }

  // Firebase Auth-Account löschen
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    // Wenn Account in Auth nicht mehr existiert, trotzdem Firestore bereinigen
    if (err.code !== 'auth/user-not-found') {
      throw new functions.https.HttpsError('internal', 'Auth-Löschung fehlgeschlagen: ' + err.message);
    }
  }

  // Firestore-Dokument löschen
  await db.collection('users').doc(uid).delete();

  console.log(`User ${uid} deleted by admin ${context.auth.uid}`);
  return { success: true };
});
