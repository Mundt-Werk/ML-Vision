import { initDashboard } from '../assets/js/dashboard.js';
import { initCustomerSidebar } from '../assets/js/components/CustomerSidebar.js';
import { auth, db } from '../assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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
            alert('Ihr Benutzerprofil wurde nicht gefunden. Bitte kontaktieren Sie den Administrator.');
            return;
        }

        const userData = userDoc.data();
        if (!userData.customerId) {
            console.error('customerId not found in user document');
            alert('Ihre Kundennummer fehlt. Bitte kontaktieren Sie den Administrator.');
            return;
        }

        currentCustomerId = userData.customerId;

        // Initialize sidebar with module flags
        await initCustomerSidebar(currentCustomerId, 'dashboard');

        // Load invoice widget
        await loadInvoiceWidget(currentCustomerId);

        // Load stats widgets
        await loadStatsWidgets(currentCustomerId);

        // Initialize dashboard
        await initDashboard('customer');
    });
});

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
        // Get today's date range (start of day to now)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Query calls for today
        const callsQuery = query(
            collection(db, 'calls'),
            where('customerId', '==', customerId),
            where('timestamp', '>=', startOfDay.toISOString())
        );

        const callsSnapshot = await getDocs(callsQuery);
        const calls = callsSnapshot.docs.map(doc => doc.data());

        // Calculate stats
        const callsToday = calls.length;
        const completedCalls = calls.filter(call => call.status === 'completed');
        const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
        const avgDuration = completedCalls.length > 0
            ? Math.round(totalDuration / completedCalls.length / 60) // Convert to minutes
            : 0;
        const successRate = calls.length > 0
            ? Math.round((completedCalls.length / calls.length) * 100)
            : 0;

        // Update UI
        document.getElementById('callsTodayValue').textContent = callsToday;
        document.getElementById('avgDurationValue').textContent = avgDuration + ' Min';
        document.getElementById('callSuccessRateValue').textContent = successRate + '%';

        // Show cards
        document.getElementById('callsTodayCard').style.display = 'block';
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
