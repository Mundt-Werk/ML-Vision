// Audit Log Helper — schreibt Admin-Aktionen in audit_logs Collection
// Nie werfen — Audit-Fehler dürfen den Haupt-Workflow nicht unterbrechen
import { db, auth } from './firebase-config.js';
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Schreibt eine Admin-Aktion in audit_logs
 * @param {string} action       z.B. 'user_created', 'customer_deleted', 'ticket_status_changed'
 * @param {string} entityType   z.B. 'user', 'customer', 'ticket'
 * @param {string} entityId     Firestore-Dokument-ID oder null
 * @param {object} details      Zusätzliche Infos (Name, E-Mail, alter/neuer Status, etc.)
 */
export async function logAction(action, entityType, entityId = null, details = {}) {
    const user = auth.currentUser;
    if (!user) return; // Nicht eingeloggt — kein Log

    try {
        await addDoc(collection(db, 'audit_logs'), {
            uid: user.uid,
            email: user.email,
            action,
            entityType,
            entityId,
            details,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        // Leise fehlschlagen — Audit-Fehler darf keine UX-Unterbrechung verursachen
        console.warn('[Audit] Log fehlgeschlagen:', error.message);
    }
}
