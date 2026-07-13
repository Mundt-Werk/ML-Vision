import { initDashboard } from './dashboard.js';
import { initCustomerSidebar } from './components/CustomerSidebar.js';
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentCustomerId = null;
let currentUser = null;

// Initialize customer dashboard with role check
document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '/public/login.html';
            return;
        }

        currentUser = user;

        // Get customerId
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            console.error('User document not found in Firestore');
            showBannerError('Ihr Benutzerprofil wurde nicht gefunden. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
            return;
        }

        const userData = userDoc.data();
        if (!userData.customerId) {
            console.error('customerId not found in user document');
            showBannerError('Ihre Kundennummer fehlt. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
            return;
        }

        currentCustomerId = userData.customerId;

        // Initialize sidebar with module flags
        await initCustomerSidebar(currentCustomerId, 'dashboard');

        // Load invoice widget
        await loadInvoiceWidget(currentCustomerId);

        // Load minutes usage widget
        await loadMinutesWidget(currentCustomerId);

        // Load stats widgets
        await loadStatsWidgets(currentCustomerId);

        // Load agent status + last call
        await loadAgentStatus(currentCustomerId);

        // Show quick links
        const quickLinksCard = document.getElementById('quickLinksCard');
        if (quickLinksCard) quickLinksCard.style.display = 'block';

        // Initialize dashboard
        await initDashboard('customer');
    });
});

// Load Minutes Usage Widget
let _minutesCustomerId = null;
let _minutesOffset = 0; // 0 = aktueller Monat, -1 = Vormonat, etc.
let _minutesIncluded = 120;
let _minutesOverageRate = 30;

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

async function loadMinutesWidget(customerId) {
    _minutesCustomerId = customerId;
    _minutesOffset = 0;

    const customerDoc = await getDoc(doc(db, 'customers', customerId));
    if (!customerDoc.exists()) return;
    _minutesIncluded = customerDoc.data().includedMinutes || 120;
    _minutesOverageRate = customerDoc.data().overageRateCents || 30;

    await renderMinutesWidget();
    document.getElementById('minutesUsageCard').style.display = 'block';

    document.getElementById('minutesPrevMonth').onclick = async () => {
        _minutesOffset--;
        await renderMinutesWidget();
    };
    document.getElementById('minutesNextMonth').onclick = async () => {
        if (_minutesOffset >= 0) return;
        _minutesOffset++;
        await renderMinutesWidget();
    };
}

async function renderMinutesWidget() {
    try {
        const now = new Date();
        const year  = now.getFullYear() + Math.floor((now.getMonth() + _minutesOffset) / 12);
        const month = ((now.getMonth() + _minutesOffset) % 12 + 12) % 12;
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth   = new Date(year, month + 1, 1);

        // Label aktualisieren
        const isCurrentMonth = _minutesOffset === 0;
        document.getElementById('minutesMonthLabel').textContent =
            isCurrentMonth ? 'Aktueller Monat' : `${MONTH_NAMES[month]} ${year}`;
        document.getElementById('minutesNextMonth').style.visibility =
            isCurrentMonth ? 'hidden' : 'visible';

        const q = query(
            collection(db, 'calls'),
            where('customerId', '==', _minutesCustomerId),
            where('timestamp', '>=', startOfMonth.toISOString()),
            where('timestamp', '<',  endOfMonth.toISOString())
        );
        const snap = await getDocs(q);

        const totalSeconds = snap.docs.reduce((sum, d) => sum + (d.data().duration || 0), 0);
        const usedMinutes = Math.ceil(totalSeconds / 60);
        const pct = Math.min(Math.round((usedMinutes / _minutesIncluded) * 100), 100);

        document.getElementById('minutesUsageLabel').textContent = `${usedMinutes} / ${_minutesIncluded} Min`;
        const bar = document.getElementById('minutesProgressBar');
        bar.style.width = pct + '%';
        bar.style.background = pct >= 100
            ? 'linear-gradient(90deg,#ef4444,#dc2626)'
            : pct >= 80
                ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                : '';
        document.getElementById('minutesUsedText').textContent = `${usedMinutes} Min genutzt`;
        document.getElementById('minutesIncludedText').textContent = `${_minutesIncluded} Min inkl.`;

        const warning = document.getElementById('minutesOverageWarning');
        if (usedMinutes > _minutesIncluded) {
            const extra = usedMinutes - _minutesIncluded;
            const cost = ((extra * _minutesOverageRate) / 100).toFixed(2).replace('.', ',');
            warning.style.display = 'block';
            warning.textContent = `${extra} Mehrminuten × ${(_minutesOverageRate / 100).toFixed(2).replace('.', ',')} € = ${cost} € Zusatzkosten`;
        } else {
            warning.style.display = 'none';
        }
    } catch (error) {
        console.error('Error rendering minutes widget:', error);
    }
}

// Load Invoice Widget
async function loadInvoiceWidget(customerId) {
    try {
        // Check if invoices module is enabled
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (!customerDoc.exists() || !customerDoc.data().modules?.invoices) {
            // Module not enabled, don't show widget
            return;
        }

        // Query invoices for this customer
        const invoicesQuery = query(
            collection(db, 'invoices'),
            where('customerId', '==', customerId),
            orderBy('date', 'desc')
        );

        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices = invoicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (invoices.length === 0) {
            // Show empty state
            document.getElementById('invoiceEmptyState').style.display = 'block';
            return;
        }

        // Show widget with data
        document.getElementById('invoiceWidget').style.display = 'block';

        // Get latest invoice (first one due to orderBy desc)
        const latestInvoice = invoices[0];

        // Populate latest invoice card
        document.getElementById('invoiceNo').textContent = latestInvoice.invoiceNo || '-';
        document.getElementById('invoiceDate').textContent = formatDate(latestInvoice.date);
        document.getElementById('invoiceDescription').textContent =
            latestInvoice.description || latestInvoice.planName || '-';

        // Status badge
        const statusBadge = document.querySelector('#invoiceStatus .invoice-status-badge');
        statusBadge.textContent = getStatusText(latestInvoice.status);
        statusBadge.className = 'invoice-status-badge ' + latestInvoice.status;

        // Amount
        document.getElementById('invoiceAmount').textContent =
            formatAmount(latestInvoice.amountGross, latestInvoice.currency);

        // Calculate total sum and count
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amountGross || 0), 0);
        document.getElementById('totalInvoicesAmount').textContent =
            formatAmount(totalAmount, invoices[0]?.currency || 'EUR');
        document.getElementById('totalInvoicesCount').textContent = invoices.length;

    } catch (error) {
        console.error('Error loading invoice widget:', error);
    }
}

// Format date
function formatDate(dateValue) {
    if (!dateValue) return '-';

    let date;
    if (dateValue.toDate) {
        date = dateValue.toDate();
    } else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
    } else {
        date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

// Format amount (cents to euros)
function formatAmount(amountCents, currency = 'EUR') {
    const amount = (amountCents / 100).toFixed(2);
    const formatted = amount.replace('.', ',');
    return `${formatted} ${currency}`;
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'paid': 'Bezahlt',
        'open': 'Offen',
        'uncollectible': 'Unbezahlbar'
    };
    return statusMap[status] || status;
}

// Load Stats Widgets
async function loadStatsWidgets(customerId) {
    try {
        // Get customer modules
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (!customerDoc.exists()) return;

        const customer = customerDoc.data();
        const modules = customer.modules || {};

        // Load Voice/Calls stats if module enabled
        if (modules.voice) {
            await loadCallsStats(customerId);
        }

        // Load Support/Tickets stats if module enabled
        if (modules.support) {
            await loadTicketsStats(customerId);
        }

        // Load user info
        loadUserInfo(customer, currentUser);
    } catch (error) {
        console.error('Error loading stats widgets:', error);
    }
}

// Load User Info
function loadUserInfo(customer, user) {
    // Set user avatar (first letters of name or email)
    let initials = '--';
    if (customer.name) {
        const nameParts = customer.name.split(' ');
        initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
    } else if (user.email) {
        initials = user.email.substring(0, 2).toUpperCase();
    }
    document.getElementById('userAvatar').textContent = initials;

    // Set user name
    document.getElementById('userName').textContent = customer.name || user.email || 'Kunde';

    // Set user email
    document.getElementById('userEmail').textContent = customer.email || user.email || '-';

    // Set user plan
    document.getElementById('userPlan').textContent = customer.planName || 'Individuell';
}

// Load Calls Stats
async function loadCallsStats(customerId) {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Start of current week (Monday)
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, …
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

        // Query calls for today
        const callsQuery = query(
            collection(db, 'calls'),
            where('customerId', '==', customerId),
            where('timestamp', '>=', startOfDay.toISOString())
        );
        const callsSnapshot = await getDocs(callsQuery);
        const calls = callsSnapshot.docs.map(doc => doc.data());

        // Query calls this week with outcome == "termin" (2.3)
        const termineQuery = query(
            collection(db, 'calls'),
            where('customerId', '==', customerId),
            where('outcome', '==', 'termin'),
            where('timestamp', '>=', startOfWeek.toISOString())
        );
        const termineSnapshot = await getDocs(termineQuery);
        const termineThisWeek = termineSnapshot.size;

        // Calculate stats
        const callsToday = calls.length;
        const completedCalls = calls.filter(call => call.outcome !== 'missed');
        const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
        const avgDuration = completedCalls.length > 0
            ? Math.round(totalDuration / completedCalls.length / 60)
            : 0;
        const successRate = calls.length > 0
            ? Math.round((completedCalls.length / calls.length) * 100)
            : 0;

        // Update UI
        document.getElementById('callsTodayValue').textContent = callsToday;
        document.getElementById('avgDurationValue').textContent = avgDuration + ' Min';
        document.getElementById('callSuccessRateValue').textContent = successRate + '%';
        document.getElementById('termineWeekValue').textContent = termineThisWeek;

        // Show cards
        document.getElementById('callsTodayCard').style.display = 'block';
        document.getElementById('termineWeekCard').style.display = 'block';
        document.getElementById('avgDurationCard').style.display = 'block';
        document.getElementById('callSuccessRateCard').style.display = 'block';

    } catch (error) {
        console.error('Error loading calls stats:', error);
    }
}

// Load Tickets Stats
async function loadTicketsStats(customerId) {
    try {
        // Query open tickets
        const ticketsQuery = query(
            collection(db, 'tickets'),
            where('customerId', '==', customerId),
            where('status', '==', 'open')
        );

        const ticketsSnapshot = await getDocs(ticketsQuery);
        const openTickets = ticketsSnapshot.size;

        // Update UI
        document.getElementById('openTicketsValue').textContent = openTickets;

        // Show card
        document.getElementById('openTicketsCard').style.display = 'block';

    } catch (error) {
        console.error('Error loading tickets stats:', error);
    }
}

// Load Agent Status + Last Call
async function loadAgentStatus(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (!customerDoc.exists()) return;

        const data = customerDoc.data();
        const agentStatus = data.agentStatus || 'inactive';

        const card = document.getElementById('agentStatusCard');
        const badge = document.getElementById('agentStatusBadge');
        const dot = document.getElementById('agentStatusDot');
        const text = document.getElementById('agentStatusText');
        if (!card) return;

        card.style.display = 'block';

        if (agentStatus === 'active') {
            badge.style.background = 'rgba(16,185,129,0.15)';
            badge.style.border = '1px solid rgba(16,185,129,0.3)';
            badge.style.color = '#10B981';
            dot.style.background = '#10B981';
            dot.style.boxShadow = '0 0 6px #10B981';
            text.textContent = 'KI aktiv';
        } else {
            badge.style.background = 'rgba(239,68,68,0.12)';
            badge.style.border = '1px solid rgba(239,68,68,0.25)';
            badge.style.color = '#EF4444';
            dot.style.background = '#EF4444';
            text.textContent = 'KI inaktiv';
        }

        // Load last call
        const callsQuery = query(
            collection(db, 'calls'),
            where('customerId', '==', customerId),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        const callsSnap = await getDocs(callsQuery);

        if (!callsSnap.empty) {
            const lastCall = callsSnap.docs[0].data();
            const ts = lastCall.timestamp?.toDate?.() || new Date(lastCall.timestamp);
            const timeStr = ts.toLocaleString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            document.getElementById('lastCallTime').textContent = timeStr + ' Uhr';

            const outcomeMap = {
                'termin': { label: 'Termin gebucht', color: '#10B981' },
                'info': { label: 'Info-Anfrage', color: '#04A9D4' },
                'callback': { label: 'Rückruf erbeten', color: '#F59E0B' },
                'missed': { label: 'Kein Ergebnis', color: '#6B7280' }
            };
            const outcome = outcomeMap[lastCall.outcome] || { label: lastCall.outcome || '-', color: '#6B7280' };
            const outcomeEl = document.getElementById('lastCallOutcome');
            outcomeEl.innerHTML = `<span style="display:inline-block; background:${outcome.color}22; color:${outcome.color}; padding:2px 10px; border-radius:12px; font-size:12px; font-weight:600;">${outcome.label}</span>`;
        } else {
            document.getElementById('lastCallTime').textContent = 'Noch kein Anruf';
        }

    } catch (error) {
        console.error('Error loading agent status:', error);
    }
}

// Banner-Fehler (statt alert)
function showBannerError(message) {
    const banner = document.getElementById('errorBanner');
    if (banner) {
        banner.textContent = message;
        banner.style.display = 'block';
    }
}

// Logout
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.signOut();
        window.location.href = '/public/login.html';
    });
}
