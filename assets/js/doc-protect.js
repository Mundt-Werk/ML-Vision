/**
 * doc-protect.js — Dokument-Zugriffsschutz via Firebase Auth
 *
 * Einbindung in jede zu schützende HTML-Datei:
 *   <meta name="doc-customer-id" content="mybach">
 *   <meta name="robots" content="noindex, nofollow">
 *   <script type="module" src="[rel-path]/assets/js/doc-protect.js"></script>
 *
 * Funktionsweise:
 *   1. Seiteninhalt wird sofort versteckt (kein Flash of Content)
 *   2. Firebase Auth prüft vorhandene Session (z.B. aus dem Kundenbereich)
 *   3. Wenn eingeloggt + richtige customerId → Inhalt wird sichtbar
 *   4. Sonst → Login-Overlay erscheint (ML Vision Branding)
 *   5. Nach erfolgreichem Login: customerId-Prüfung → Inhalt freigeben
 */

import { auth, db } from './firebase-config.js';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ── Konfiguration ─────────────────────────────────────────────────────────────
const requiredCustomerId = document.querySelector('meta[name="doc-customer-id"]')?.content || null;

// ── Inhalt sofort ausblenden (verhindert kurzes Aufblitzen) ───────────────────
document.documentElement.style.visibility = 'hidden';

// ── Gate-Styles & HTML ────────────────────────────────────────────────────────
function buildGate() {
    const style = document.createElement('style');
    style.textContent = `
        #doc-gate {
            position: fixed; inset: 0; z-index: 99999;
            background: #0a0f1a;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        #doc-gate-card {
            background: #111827;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 40px 36px;
            width: 100%; max-width: 400px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }
        #doc-gate-logo {
            display: block; height: 36px; margin-bottom: 28px;
        }
        #doc-gate h2 {
            font-size: 18px; font-weight: 700;
            color: #e1e8ed; margin-bottom: 6px;
        }
        #doc-gate p.gate-sub {
            font-size: 13px; color: rgba(225,232,237,0.5);
            margin-bottom: 28px; line-height: 1.6;
        }
        #doc-gate label {
            display: block; font-size: 11px; font-weight: 600;
            letter-spacing: 0.06em; text-transform: uppercase;
            color: rgba(225,232,237,0.45); margin-bottom: 6px;
        }
        #doc-gate input {
            display: block; width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; padding: 11px 14px;
            font-size: 14px; color: #e1e8ed;
            margin-bottom: 14px; outline: none;
            transition: border-color 0.15s;
        }
        #doc-gate input:focus { border-color: #04A9D4; }
        #doc-gate-submit {
            width: 100%; background: #04A9D4;
            color: #fff; border: none; border-radius: 8px;
            padding: 12px; font-size: 14px; font-weight: 600;
            cursor: pointer; margin-top: 4px;
            transition: background 0.15s, opacity 0.15s;
        }
        #doc-gate-submit:hover:not(:disabled) { background: #0391b5; }
        #doc-gate-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        #doc-gate-error {
            font-size: 13px; color: #f87171;
            margin-top: 12px; min-height: 20px;
            text-align: center;
        }
        #doc-gate-lock {
            display: flex; align-items: center; gap: 8px;
            margin-bottom: 20px;
        }
        #doc-gate-lock svg { color: #04A9D4; flex-shrink: 0; }
        #doc-gate-lock span {
            font-size: 12px; color: rgba(225,232,237,0.4);
            line-height: 1.5;
        }
        .gate-pw-wrapper {
            position: relative;
            margin-bottom: 14px;
        }
        .gate-pw-wrapper input {
            display: block; width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; padding: 11px 44px 11px 14px;
            font-size: 14px; color: #e1e8ed;
            margin-bottom: 0; outline: none;
            transition: border-color 0.15s;
        }
        .gate-pw-wrapper input:focus { border-color: #04A9D4; }
        .gate-pw-toggle {
            position: absolute;
            right: 10px; top: 50%;
            transform: translateY(-50%);
            background: none; border: none;
            color: rgba(225,232,237,0.45);
            cursor: pointer; padding: 4px;
            display: flex; align-items: center; justify-content: center;
            transition: color 0.15s;
        }
        .gate-pw-toggle:hover { color: #04A9D4; }
        @media (max-width: 480px) {
            #doc-gate-card { padding: 28px 20px; }
        }
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'doc-gate';
    gate.innerHTML = `
        <div id="doc-gate-card">
            <img id="doc-gate-logo" src="/assets/img/logo_white_trans.png" alt="ML Vision">
            <h2>Dokument geschützt</h2>
            <p class="gate-sub">Melden Sie sich mit Ihrem Kundenbereich-Zugang an, um dieses Dokument einzusehen.</p>

            <div id="doc-gate-lock">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span>Dieser Link ist vertraulich. Bitte teilen Sie ihn nicht weiter.</span>
            </div>

            <form id="gate-form" autocomplete="on">
                <label for="gate-email">E-Mail-Adresse</label>
                <input type="email" id="gate-email" name="email" placeholder="ihre@email.de" required autocomplete="email">
                <label for="gate-password">Passwort</label>
                <div class="gate-pw-wrapper">
                    <input type="password" id="gate-password" name="password" placeholder="••••••••" required autocomplete="current-password">
                    <button type="button" class="gate-pw-toggle" onclick="window._toggleGatePw()" aria-label="Passwort anzeigen">
                        <svg class="pw-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg class="pw-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                </div>
                <button type="submit" id="doc-gate-submit">Anmelden &amp; Dokument öffnen</button>
            </form>
            <div id="doc-gate-error"></div>
        </div>
    `;
    document.body.insertBefore(gate, document.body.firstChild);
}

// ── Passwort-Toggle für Gate ──────────────────────────────────────────────────
window._toggleGatePw = function() {
    const input = document.getElementById('gate-password');
    const btn = input.parentElement.querySelector('.gate-pw-toggle');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.pw-eye').style.display = isHidden ? 'none' : '';
    btn.querySelector('.pw-eye-off').style.display = isHidden ? '' : 'none';
    btn.setAttribute('aria-label', isHidden ? 'Passwort verstecken' : 'Passwort anzeigen');
};

// ── Inhalt freigeben ──────────────────────────────────────────────────────────
function revealContent() {
    const gate = document.getElementById('doc-gate');
    if (gate) gate.remove();
    document.documentElement.style.visibility = '';
}

// ── Gate anzeigen (mit optionaler Fehlermeldung) ──────────────────────────────
function showGate(errorMsg = '') {
    document.documentElement.style.visibility = '';
    const gate = document.getElementById('doc-gate');
    if (gate) gate.style.display = 'flex';
    if (errorMsg) {
        const errEl = document.getElementById('doc-gate-error');
        if (errEl) errEl.textContent = errorMsg;
    }
}

// ── Zugriffsprüfung ───────────────────────────────────────────────────────────
async function checkAccess(user) {
    if (!user) {
        showGate();
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            showGate('Ihr Benutzerprofil wurde nicht gefunden.');
            return;
        }

        const customerId = userDoc.data()?.customerId;

        if (requiredCustomerId && customerId !== requiredCustomerId) {
            showGate('Sie haben keinen Zugriff auf dieses Dokument.');
            return;
        }

        revealContent();
    } catch (err) {
        console.error('[doc-protect] Firestore error:', err);
        showGate('Verbindungsfehler. Bitte Seite neu laden.');
    }
}

// ── Initialisierung ───────────────────────────────────────────────────────────
buildGate();
onAuthStateChanged(auth, checkAccess);

// ── Login-Formular Handler ────────────────────────────────────────────────────
document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'gate-form') return;
    e.preventDefault();

    const email    = document.getElementById('gate-email').value.trim();
    const password = document.getElementById('gate-password').value;
    const btn      = document.getElementById('doc-gate-submit');
    const errEl    = document.getElementById('doc-gate-error');

    btn.disabled = true;
    btn.textContent = 'Wird geprüft …';
    errEl.textContent = '';

    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await checkAccess(cred.user);
    } catch (error) {
        btn.disabled = false;
        btn.textContent = 'Anmelden & Dokument öffnen';
        const invalidCodes = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
        if (invalidCodes.includes(error.code)) {
            errEl.textContent = 'E-Mail oder Passwort ist falsch.';
        } else if (error.code === 'auth/too-many-requests') {
            errEl.textContent = 'Zu viele Versuche. Bitte warten Sie kurz.';
        } else {
            errEl.textContent = 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';
        }
    }
});
