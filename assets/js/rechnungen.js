import { auth, db, storage } from '../../assets/js/firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { initCustomerSidebar, checkModuleAccess } from '../../assets/js/components/CustomerSidebar.js';

let currentCustomerId = null;
let allInvoices = [];
let filteredInvoices = [];
let currentPage = 1;
let currentStatusFilter = 'all';
const ITEMS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '../../public/login.html';
            return;
        }

        try {
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

            // Check module access
            const hasAccess = await checkModuleAccess(currentCustomerId, 'invoices');
            if (!hasAccess) return;

            // Initialize sidebar
            await initCustomerSidebar(currentCustomerId, 'invoices');

            // Initialize logout
            document.getElementById('logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await signOut(auth);
                    window.location.href = '../../public/login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Fehler beim Abmelden.');
                }
            });

            // Load data
            await loadPlanCard();
            await loadInvoices();
            initEventListeners();

        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '../../public/login.html';
        }
    });
});

function initEventListeners() {
    // Status filter chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentStatusFilter = chip.dataset.status;
            currentPage = 1;
            applyFilters();
        });
    });

    // Apply date filters
    document.getElementById('applyFilters').addEventListener('click', () => {
        currentPage = 1;
        applyFilters();
    });

    // Desktop Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderInvoices();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderInvoices();
        }
    });

    // Mobile Pagination
    document.getElementById('mobilePrevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderInvoices();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('mobileNextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderInvoices();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

async function loadPlanCard() {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', currentCustomerId));
        if (customerDoc.exists()) {
            const customer = customerDoc.data();

            document.getElementById('planName').textContent =
                customer.planName || 'Individuelle Vereinbarung';

            const detailsHtml = `
                <div class="plan-detail">
                    <strong>Preis</strong>
                    <span>${customer.planPrice ? `${customer.planPrice}€/Monat` : 'N/A'}</span>
                </div>
                <div class="plan-detail">
                    <strong>Status</strong>
                    <span>Aktiv</span>
                </div>
                <div class="plan-detail">
                    <strong>Kunde seit</strong>
                    <span>${customer.createdAt ? formatDateShort(customer.createdAt) : 'N/A'}</span>
                </div>
            `;

            document.getElementById('planDetails').innerHTML = detailsHtml;
        }
    } catch (error) {
        console.error('Error loading plan card:', error);
        document.getElementById('planName').textContent = 'Individuelle Vereinbarung';
    }
}

async function loadInvoices() {
    try {
        const q = query(
            collection(db, 'invoices'),
            where('customerId', '==', currentCustomerId),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        allInvoices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        applyFilters();
    } catch (error) {
        console.error('Error loading invoices:', error);
        document.getElementById('invoicesTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <h3>Fehler beim Laden</h3>
                    <p>Rechnungen konnten nicht geladen werden.</p>
                </td>
            </tr>
        `;
    }
}

function applyFilters() {
    const fromDate = document.getElementById('filterFrom').value;
    const toDate = document.getElementById('filterTo').value;

    filteredInvoices = allInvoices.filter(invoice => {
        // Status filter
        if (currentStatusFilter !== 'all' && invoice.status !== currentStatusFilter) {
            return false;
        }

        // Date filter
        const invoiceDate = parseDate(invoice.date);
        if (fromDate && invoiceDate < new Date(fromDate)) {
            return false;
        }
        if (toDate && invoiceDate > new Date(toDate)) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderInvoices();
}

function renderInvoices() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageInvoices = filteredInvoices.slice(start, end);

    // Desktop Tabelle
    const tbody = document.getElementById('invoicesTableBody');
    const mobileList = document.getElementById('mobileInvoicesList');

    if (pageInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>Keine Rechnungen gefunden</h3>
                    <p>Passen Sie die Filter an oder warten Sie auf neue Rechnungen.</p>
                </td>
            </tr>
        `;
        mobileList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6b7280; background: #fff; border-radius: 12px;">
                <h3 style="color: #1a1a1a; margin-bottom: 10px;">Keine Rechnungen gefunden</h3>
                <p>Passen Sie die Filter an oder warten Sie auf neue Rechnungen.</p>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
        document.getElementById('mobilePagination').style.display = 'none';
        return;
    }

    // Desktop Tabelle rendern
    const tableHtml = pageInvoices.map(invoice => `
        <tr>
            <td><strong>${escapeHtml(invoice.invoiceNo)}</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td>${escapeHtml(invoice.description || invoice.planName || 'Rechnung')}</td>
            <td><strong>${formatAmount(invoice.amountGross, invoice.currency)}</strong></td>
            <td><span class="invoice-status ${invoice.status}">${getStatusText(invoice.status)}</span></td>
            <td>
                <button class="download-btn" onclick="window.downloadInvoice('${invoice.id}', '${escapeHtml(invoice.pdfPath)}', '${escapeHtml(invoice.invoiceNo)}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                </button>
            </td>
        </tr>
    `).join('');
    tbody.innerHTML = tableHtml;

    // Mobile Cards rendern
    const mobileHtml = pageInvoices.map(invoice => `
        <div class="mobile-invoice-card">
            <div class="mobile-invoice-header">
                <div class="mobile-invoice-number">
                    <strong>${escapeHtml(invoice.invoiceNo)}</strong>
                    <div class="mobile-invoice-date">${formatDate(invoice.date)}</div>
                </div>
                <span class="invoice-status ${invoice.status}">${getStatusText(invoice.status)}</span>
            </div>
            <div class="mobile-invoice-description">
                ${escapeHtml(invoice.description || invoice.planName || 'Rechnung')}
            </div>
            <div class="mobile-invoice-info">
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Betrag</span>
                    <span class="mobile-info-value">${formatAmount(invoice.amountGross, invoice.currency)}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Status</span>
                    <span class="mobile-info-value">${getStatusText(invoice.status)}</span>
                </div>
            </div>
            <div class="mobile-invoice-footer">
                <span class="mobile-invoice-amount">${formatAmount(invoice.amountGross, invoice.currency)}</span>
                <button class="download-btn" onclick="window.downloadInvoice('${invoice.id}', '${escapeHtml(invoice.pdfPath)}', '${escapeHtml(invoice.invoiceNo)}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                </button>
            </div>
        </div>
    `).join('');
    mobileList.innerHTML = mobileHtml;

    // Pagination (Desktop)
    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const mobilePagination = document.getElementById('mobilePagination');

    if (totalPages > 1) {
        document.getElementById('pageInfo').textContent = `Seite ${currentPage} von ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
        document.getElementById('pagination').style.display = 'flex';

        // Mobile Pagination
        document.getElementById('mobilePageInfo').textContent = `Seite ${currentPage} von ${totalPages}`;
        document.getElementById('mobilePrevPage').disabled = currentPage === 1;
        document.getElementById('mobileNextPage').disabled = currentPage === totalPages;
        mobilePagination.classList.add('show');
        mobilePagination.style.display = 'flex';
    } else {
        document.getElementById('pagination').style.display = 'none';
        mobilePagination.classList.remove('show');
        mobilePagination.style.display = 'none';
    }
}

window.downloadInvoice = async function(invoiceId, pdfPath, invoiceNo) {
    try {
        // Get download URL from Storage
        const storageRef = ref(storage, pdfPath);
        const url = await getDownloadURL(storageRef);

        // Open in new tab or trigger download
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error downloading invoice:', error);
        if (error.code === 'storage/object-not-found') {
            alert('PDF-Datei nicht gefunden. Bitte kontaktieren Sie den Support.');
        } else if (error.code === 'storage/unauthorized') {
            alert('Zugriff verweigert. Sie haben keine Berechtigung für diese Datei.');
        } else {
            alert('Fehler beim Herunterladen der Rechnung: ' + error.message);
        }
    }
};

function getStatusText(status) {
    const statusMap = {
        'paid': 'Bezahlt',
        'open': 'Offen',
        'uncollectible': 'Unbezahlbar'
    };
    return statusMap[status] || status;
}

function formatAmount(amountCents, currency = 'EUR') {
    const amount = (amountCents / 100).toFixed(2);
    return `${amount} ${currency}`;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        date = new Date(timestamp);
    }

    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatDateShort(timestamp) {
    if (!timestamp) return 'N/A';

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        date = new Date(timestamp);
    }

    return date.toLocaleDateString('de-DE', {
        month: 'short',
        year: 'numeric'
    });
}

function parseDate(timestamp) {
    if (!timestamp) return new Date(0);

    if (timestamp.toDate) {
        return timestamp.toDate();
    } else if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000);
    } else {
        return new Date(timestamp);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle sidebar for mobile (MUSS window.toggleSidebar sein!)
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
};

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});
