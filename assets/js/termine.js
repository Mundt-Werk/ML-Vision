import { db, auth } from './firebase-config.js';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { initCustomerSidebar } from './components/CustomerSidebar.js';

// ========================================================================
// STATE
// ========================================================================
let currentCustomerId = null;
let allTermine = [];

// ========================================================================
// INITIALIZATION
// ========================================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '/public/login.html';
        return;
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
        showError('Ihr Benutzerprofil wurde nicht gefunden. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
        return;
    }

    const userData = userDoc.data();
    if (!userData.customerId) {
        showError('Ihre Kundennummer fehlt. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
        return;
    }

    currentCustomerId = userData.customerId;
    await initCustomerSidebar(currentCustomerId, 'termine');
    await loadTermine();
});

// ========================================================================
// LOAD TERMINE FROM FIRESTORE
// ========================================================================
async function loadTermine() {
    try {
        // Composite index erforderlich: customerId ASC + outcome ASC + timestamp DESC
        const q = query(
            collection(db, 'calls'),
            where('customerId', '==', currentCustomerId),
            where('outcome', '==', 'termin'),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        allTermine = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        console.log(`Loaded ${allTermine.length} Termine`);
        renderTermine(allTermine);
        updateHeader(allTermine.length);
    } catch (error) {
        console.error('Error loading Termine:', error);
        showError('Fehler beim Laden der Termine. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.');
    }
}

// ========================================================================
// RENDER TERMINE TABLE
// ========================================================================
function renderTermine(termine) {
    const tbody = document.querySelector('#termineTable tbody');
    const mobileList = document.getElementById('mobileTermineList');
    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    if (termine.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:#6b7280;">
                    Keine Termine gefunden
                </td>
            </tr>`;
        mobileList.innerHTML = `
            <div style="text-align:center; padding:40px; color:#6b7280; background:rgba(255,255,255,0.04); border-radius:12px;">
                Keine Termine gefunden
            </div>`;
        return;
    }

    termine.forEach(t => {
        // Desktop Zeile
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div><strong>${formatDate(t.timestamp)}</strong></div>
                <div class="call-time">${formatTime(t.timestamp)}</div>
            </td>
            <td style="font-weight:500; color:#e1e8ed;">${formatWunschtermin(t.wunschtermin)}</td>
            <td>${getTerminartBadge(t.terminart)}</td>
            <td style="font-weight:500;">${t.name || '–'}</td>
            <td style="color:#9ca3af; font-size:13px;">
                ${normalizePhone(t.telefon) || '–'}
                ${callbackBtn(t.telefon)}
            </td>
            <td style="color:#9ca3af; font-size:13px;">${t.email || '–'}</td>
            <td style="color:#9ca3af; font-size:13px;">${t.immoNr || '–'}</td>
        `;
        tbody.appendChild(tr);

        // Mobile Card
        const card = document.createElement('div');
        card.className = 'mobile-call-card';
        card.innerHTML = `
            <div class="mobile-call-header">
                <div class="mobile-call-date">
                    <strong>${formatDate(t.timestamp)}</strong>
                    <span class="call-time">${formatTime(t.timestamp)}</span>
                </div>
                ${getTerminartBadge(t.terminart)}
            </div>
            <div class="mobile-call-info">
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Wunschtermin</span>
                    <span>${formatWunschtermin(t.wunschtermin)}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Anrufer</span>
                    <span>${t.name || '–'}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Telefon</span>
                    <span>${normalizePhone(t.telefon) || '–'}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">E-Mail</span>
                    <span>${t.email || '–'}</span>
                </div>
                ${t.immoNr ? `
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Immobilien-Nr.</span>
                    <span>${t.immoNr}</span>
                </div>` : ''}
            </div>
            <div class="mobile-call-actions">
                ${callbackBtn(t.telefon)}
            </div>
        `;
        mobileList.appendChild(card);
    });
}

// ========================================================================
// FILTER
// ========================================================================
document.querySelector('.filter-button').addEventListener('click', () => {
    const terminartFilter = document.getElementById('terminartFilter').value;

    let filtered = [...allTermine];
    if (terminartFilter) {
        filtered = filtered.filter(t => t.terminart === terminartFilter);
    }

    renderTermine(filtered);
    updateHeader(filtered.length);
});

// ========================================================================
// CSV EXPORT
// ========================================================================
document.getElementById('exportBtn').addEventListener('click', () => {
    const terminartFilter = document.getElementById('terminartFilter').value;
    let data = [...allTermine];
    if (terminartFilter) {
        data = data.filter(t => t.terminart === terminartFilter);
    }

    const headers = ['Buchungsdatum', 'Buchungszeit', 'Wunschtermin', 'Terminart', 'Anrufer', 'Telefon', 'E-Mail', 'Immobilien-Nr.'];
    const rows = data.map(t => [
        formatDate(t.timestamp),
        formatTime(t.timestamp),
        formatWunschtermin(t.wunschtermin),
        t.terminart || '',
        t.name || '',
        normalizePhone(t.telefon),
        t.email || '',
        t.immoNr || ''
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `termine_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================
function parseTimestamp(ts) {
    if (!ts) return null;
    if (ts.toDate) return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
}

function formatDate(ts) {
    const d = parseTimestamp(ts);
    if (!d || isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(ts) {
    const d = parseTimestamp(ts);
    if (!d || isNaN(d.getTime())) return 'N/A';
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatWunschtermin(value) {
    if (!value) return '–';
    // Firestore Timestamp Objekt
    if (value && typeof value === 'object' && value.seconds) {
        const d = new Date(value.seconds * 1000);
        return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    }
    // ISO-String (z.B. "2026-04-08T16:00:00")
    if (typeof value === 'string' && value.includes('T')) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
        }
    }
    // Freitext (z.B. "Montag 14 Uhr") — unverändert anzeigen
    return value;
}

function normalizePhone(telefon) {
    if (!telefon) return '';
    const s = String(telefon).trim();
    const hasPlus = s.startsWith('+');
    const digits = s.replace(/[^\d]/g, '');
    if (hasPlus) return '+' + digits;
    // Country code 49 without + (e.g. "491625120065")
    if (digits.startsWith('49') && digits.length >= 11) return '+' + digits;
    // Already has leading zero
    if (digits.startsWith('0')) return digits;
    // Missing leading zero — prepend it (stored as number in Firestore)
    return '0' + digits;
}

function callbackBtn(telefon) {
    if (!telefon) return '';
    const normalized = normalizePhone(telefon);
    // tel: href: use +49 format for best device compatibility
    const telHref = normalized.startsWith('0') ? '+49' + normalized.slice(1) : normalized;
    return `<a href="tel:${telHref}" class="callback-btn" onclick="event.stopPropagation()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        Rückruf
    </a>`;
}

function getTerminartBadge(terminart) {
    const map = {
        'Besichtigung': 'besichtigung',
        'Erstgespräch': 'erstgespraech',
        'Beratung': 'beratung'
    };
    const cls = map[terminart] || 'default';
    return `<span class="terminart-badge ${cls}">${terminart || '–'}</span>`;
}

function updateHeader(count) {
    const header = document.querySelector('.table-header h2');
    header.textContent = `${count} Termin${count !== 1 ? 'e' : ''} gefunden`;
}

function showError(message) {
    const tbody = document.querySelector('#termineTable tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center; padding:40px; color:#ef4444;">
                ${message}
            </td>
        </tr>`;
}

// ========================================================================
// SIDEBAR & MISC
// ========================================================================
window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('active');
};

document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.signOut();
        window.location.href = '/public/login.html';
    });
}
