import { initCustomerSidebar } from './components/CustomerSidebar.js';
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;
let currentCustomerId = null;
let currentModalSubject = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '../../public/login.html';
            return;
        }

        currentUser = user;

        try {
            // Resolve customerId from users collection
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                alert('Ihr Benutzerprofil wurde nicht gefunden. Bitte kontaktieren Sie den Administrator.');
                return;
            }
            const userData = userDoc.data();
            if (!userData.customerId) {
                alert('Ihre Kundennummer fehlt. Bitte kontaktieren Sie den Administrator.');
                return;
            }

            currentCustomerId = userData.customerId;

            // Initialize sidebar
            await initCustomerSidebar(currentCustomerId, 'einstellungen');

            // Load agent & settings data
            await loadSettingsData(currentCustomerId);

        } catch (error) {
            console.error('Error initializing einstellungen:', error);
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = '../../public/login.html';
    });

    // Change request modal form
    document.getElementById('changeRequestForm').addEventListener('submit', handleChangeRequest);
});

// ─── Load Settings Data ───────────────────────────────────────────────────────

async function loadSettingsData(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (!customerDoc.exists()) {
            console.error('Customer document not found:', customerId);
            return;
        }

        const c = customerDoc.data();

        // 7.1 Agent Info
        setText('agentName', c.agentName || 'Mybach Telefonassistent');
        setText('agentVoice', c.agentVoice || 'Deutsch (weiblich)');
        setText('agentLanguage', c.agentLanguage || 'Deutsch');
        setText('agentPlan', formatPlan(c.plan));

        const statusEl = document.getElementById('agentStatus');
        const statusVal = c.agentStatus || 'inactive';
        statusEl.innerHTML = statusVal === 'active'
            ? '<span class="status-badge status-active">Aktiv</span>'
            : '<span class="status-badge status-inactive">Inaktiv</span>';

        // 7.2 Limits (from customer doc or fallback defaults)
        const maxSec = c.maxCallDuration ?? 300;
        setText('maxCallDuration', formatDuration(maxSec));
        setText('dailyCallLimit', c.dailyCallLimit ? `${c.dailyCallLimit} Anrufe/Tag` : '20 Anrufe/Tag');

        // 7.3 Begrüßungstext
        const greetingEl = document.getElementById('greetingText');
        greetingEl.value = c.greetingText || 'Noch nicht konfiguriert. Bitte wenden Sie sich an ML Vision.';

        // 7.4 E-Mail-Weiterleitung
        setText('callbackEmail', c.callbackEmail || '—');

    } catch (error) {
        console.error('Error loading settings data:', error);
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatPlan(plan) {
    const labels = { standard: 'Standard', professional: 'Professional', enterprise: 'Enterprise' };
    return labels[plan] || (plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Standard');
}

function formatDuration(seconds) {
    if (!seconds) return '—';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min} Min ${sec} Sek` : `${min} Minuten`;
}

// ─── Change Request Modal (7.5) ───────────────────────────────────────────────

window.openChangeModal = function(subject, bodyTemplate) {
    currentModalSubject = subject;
    document.getElementById('modalTitle').textContent = subject;
    document.getElementById('changeRequestBody').value = bodyTemplate || '';
    document.getElementById('changeRequestSuccess').style.display = 'none';
    document.getElementById('changeRequestError').style.display = 'none';
    document.getElementById('changeRequestSubmit').disabled = false;
    document.getElementById('changeRequestSubmit').textContent = 'Anfrage senden';
    document.getElementById('changeModal').classList.add('open');
};

window.closeChangeModal = function() {
    document.getElementById('changeModal').classList.remove('open');
};

window.closeChangeModalOnOverlay = function(event) {
    if (event.target === document.getElementById('changeModal')) {
        closeChangeModal();
    }
};

async function handleChangeRequest(e) {
    e.preventDefault();

    const body = document.getElementById('changeRequestBody').value.trim();
    if (!body) return;

    const btn = document.getElementById('changeRequestSubmit');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet…';

    try {
        const now = new Date().toISOString();
        const ticketData = {
            customerId: currentCustomerId,
            title: currentModalSubject,
            body: body,
            category: 'question',
            priority: 'normal',
            status: 'open',
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'tickets'), ticketData);

        // First message in subcollection
        await addDoc(collection(db, 'tickets', docRef.id, 'messages'), {
            sender: 'customer',
            message: body,
            files: [],
            createdAt: now
        });

        // n8n notification (fire-and-forget)
        fetch('https://n8n.vision-ml.de/webhook/mlv-ticket-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'ticket_created',
                ticketId: docRef.id,
                title: ticketData.title,
                priority: ticketData.priority,
                customerEmail: currentUser.email,
                customerName: currentUser.email.split('@')[0]
            })
        }).catch(() => {});

        const successEl = document.getElementById('changeRequestSuccess');
        successEl.textContent = 'Anfrage gesendet! Wir melden uns so schnell wie möglich bei Ihnen.';
        successEl.style.display = 'block';
        document.getElementById('changeRequestError').style.display = 'none';
        document.getElementById('changeRequestForm').reset();

        setTimeout(() => closeChangeModal(), 3000);

    } catch (error) {
        console.error('Error submitting change request:', error);
        const errorEl = document.getElementById('changeRequestError');
        errorEl.textContent = 'Fehler beim Senden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Anfrage senden';
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function showMessage(elementId, type, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
}
