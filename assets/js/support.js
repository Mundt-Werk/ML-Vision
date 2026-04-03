import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp, startAfter } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { initCustomerSidebar, checkModuleAccess } from './components/CustomerSidebar.js';

let currentCustomerId = null;
let currentUser = null;
let currentTicketId = null;
let allTickets = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

document.addEventListener('DOMContentLoaded', async () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '../../public/login.html';
            return;
        }

        currentUser = user;

        try {
            // Load customerId
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
            const hasAccess = await checkModuleAccess(currentCustomerId, 'support');
            if (!hasAccess) return;

            // Initialize sidebar
            await initCustomerSidebar(currentCustomerId, 'support');

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

            // Load tickets
            await loadTickets();

            // Initialize event listeners
            initEventListeners();

        } catch (error) {
            console.error('Error loading user data:', error);
            window.location.href = '../../public/login.html';
        }
    });
});

function initEventListeners() {
    // New ticket button
    document.getElementById('newTicketBtn').addEventListener('click', () => {
        showView('create');
    });

    // Cancel create
    document.getElementById('cancelCreateBtn').addEventListener('click', () => {
        showView('list');
        document.getElementById('createTicketForm').reset();
    });

    // Create ticket form
    document.getElementById('createTicketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTicket();
    });

    // Back to list
    document.getElementById('backToListBtn').addEventListener('click', () => {
        showView('list');
        currentTicketId = null;
    });

    // Reply form
    document.getElementById('replyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendReply();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTickets();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(allTickets.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderTickets();
        }
    });
}

function showView(view) {
    document.querySelectorAll('.view-mode').forEach(el => el.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
}

async function loadTickets() {
    try {
        const q = query(
            collection(db, 'tickets'),
            where('customerId', '==', currentCustomerId),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        allTickets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
        document.getElementById('ticketsList').innerHTML = `
            <div class="empty-state">
                <h3>Fehler beim Laden</h3>
                <p>Tickets konnten nicht geladen werden.</p>
            </div>
        `;
    }
}

function renderTickets() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageTickets = allTickets.slice(start, end);

    if (pageTickets.length === 0) {
        document.getElementById('ticketsList').innerHTML = `
            <div class="empty-state">
                <h3>Keine Tickets vorhanden</h3>
                <p>Erstellen Sie Ihr erstes Support-Ticket.</p>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    const html = pageTickets.map(ticket => `
        <div class="ticket-item" onclick="window.viewTicket('${ticket.id}')">
            <div class="ticket-header">
                <h3 class="ticket-title">${escapeHtml(ticket.title)}</h3>
                <span class="ticket-status ${ticket.status}">${getStatusText(ticket.status)}</span>
            </div>
            <p class="ticket-body">${escapeHtml(ticket.body?.substring(0, 200))}${ticket.body?.length > 200 ? '...' : ''}</p>
            <div class="ticket-meta">
                ${getCategoryText(ticket.category)} • Erstellt: ${formatDate(ticket.createdAt)} • Aktualisiert: ${formatDate(ticket.updatedAt)}
            </div>
        </div>
    `).join('');

    document.getElementById('ticketsList').innerHTML = html;

    // Pagination
    const totalPages = Math.ceil(allTickets.length / ITEMS_PER_PAGE);
    document.getElementById('pageInfo').textContent = `Seite ${currentPage} von ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('pagination').style.display = totalPages > 1 ? 'flex' : 'none';
}

window.viewTicket = async function(ticketId) {
    currentTicketId = ticketId;
    showView('detail');
    await loadTicketDetail(ticketId);
};

async function loadTicketDetail(ticketId) {
    try {
        // Load ticket
        const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
        const ticket = ticketDoc.data();

        document.getElementById('detailTitle').textContent = ticket.title;
        document.getElementById('detailMeta').innerHTML = `
            <span class="ticket-status ${ticket.status}">${getStatusText(ticket.status)}</span> •
            ${ticket.category || 'Allgemein'} •
            Erstellt: ${formatDate(ticket.createdAt)}
        `;

        // Load messages
        const messagesQuery = query(
            collection(db, 'tickets', ticketId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Render messages
        const messagesHtml = messages.map(msg => {
            const isCustomer = msg.sender === 'customer';
            const authorName = isCustomer ? 'Sie' : '🛠️ Support';

            return `
                <div class="message-item ${msg.sender}">
                    <div class="message-header">
                        <span class="message-author">${escapeHtml(authorName)}</span>
                        <span class="message-time">${formatDate(msg.createdAt)}</span>
                    </div>
                    <div class="message-text">${escapeHtml(msg.message || '')}</div>
                    ${msg.files && msg.files.length > 0 ? `
                        <div class="message-files">
                            ${msg.files.map(file => `
                                <a href="${file.fileUrl}" target="_blank" class="file-attachment">
                                    📎 ${escapeHtml(file.fileName)}
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        document.getElementById('messagesThread').innerHTML = messagesHtml || '<p style="text-align: center; color: #6b7280;">Noch keine Nachrichten</p>';
    } catch (error) {
        console.error('Error loading ticket detail:', error);
        document.getElementById('messagesThread').innerHTML = `
            <div class="empty-state">
                <h3>Fehler beim Laden</h3>
                <p>Ticket konnte nicht geladen werden.</p>
            </div>
        `;
    }
}

async function createTicket() {
    const title = document.getElementById('ticketTitle').value;
    const category = document.getElementById('ticketCategory').value;
    const priority = document.getElementById('ticketPriority').value;
    const body = document.getElementById('ticketBody').value;
    const fileInput = document.getElementById('ticketFile');

    try {
        const btn = document.querySelector('#createTicketForm button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Erstelle Ticket...';

        // Upload file if exists
        let files = [];
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            console.log('File selected:', file.name, file.size, 'bytes');

            // Check file size
            if (file.size > 10 * 1024 * 1024) {
                alert('Datei ist zu groß (max 10 MB)');
                btn.disabled = false;
                btn.textContent = 'Ticket erstellen';
                return;
            }

            try {
                console.log('Starting file upload...');
                btn.textContent = 'Lade Datei hoch...';

                // Upload to storage
                const timestamp = Date.now();
                const storageRef = ref(storage, `tickets/${currentCustomerId}/temp_${timestamp}/${file.name}`);
                console.log('Upload path:', storageRef.fullPath);

                await uploadBytes(storageRef, file);
                console.log('File uploaded, getting download URL...');

                const fileUrl = await getDownloadURL(storageRef);
                console.log('Download URL received:', fileUrl);

                files.push({
                    fileName: file.name,
                    fileUrl: fileUrl,
                    fileSize: file.size,
                    mimeType: file.type,
                    uploadedAt: new Date().toISOString()
                });
            } catch (uploadError) {
                console.error('File upload failed:', uploadError);
                alert('Datei-Upload fehlgeschlagen: ' + uploadError.message + '\n\nTicket wird ohne Datei erstellt.');
                // Continue without file
            }

            btn.textContent = 'Erstelle Ticket...';
        }

        // Create ticket
        const now = new Date().toISOString();
        const ticketData = {
            customerId: currentCustomerId,
            title: title,
            body: body,
            category: category,
            priority: priority,
            status: 'open',
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, 'tickets'), ticketData);

        // Create first message in messages subcollection
        const firstMessage = {
            sender: 'customer',
            message: body,
            files: files,
            createdAt: now
        };

        await addDoc(collection(db, 'tickets', docRef.id, 'messages'), firstMessage);

        // n8n: Neues Ticket → Brevo Bestätigungs-Mail (fire-and-forget)
        fetch('https://n8n.vision-ml.de/webhook/mlv-ticket-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action:        'ticket_created',
                ticketId:      docRef.id,
                title:         ticketData.title,
                priority:      ticketData.priority,
                customerEmail: currentUser.email,
                customerName:  currentUser.email.split('@')[0]
            })
        }).catch(() => {});

        alert('Ticket erfolgreich erstellt!');
        document.getElementById('createTicketForm').reset();
        showView('list');
        await loadTickets();
    } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Fehler beim Erstellen des Tickets: ' + error.message);
    } finally {
        const btn = document.querySelector('#createTicketForm button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Ticket erstellen';
    }
}

async function sendReply() {
    const text = document.getElementById('replyText').value;
    const fileInput = document.getElementById('replyFile');

    try {
        const btn = document.querySelector('#replyForm button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sende Antwort...';

        // Upload file if exists
        let files = [];
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];

            if (file.size > 10 * 1024 * 1024) {
                alert('Datei ist zu groß (max 10 MB)');
                btn.disabled = false;
                btn.textContent = 'Antwort senden';
                return;
            }

            const timestamp = Date.now();
            const storageRef = ref(storage, `tickets/${currentCustomerId}/${currentTicketId}/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            files.push({
                fileName: file.name,
                fileUrl: fileUrl,
                fileSize: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString()
            });
        }

        // Create message
        const messageData = {
            sender: 'customer',
            message: text,
            files: files,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'tickets', currentTicketId, 'messages'), messageData);

        // Update ticket updatedAt
        await updateDoc(doc(db, 'tickets', currentTicketId), {
            updatedAt: new Date().toISOString()
        });

        document.getElementById('replyForm').reset();
        await loadTicketDetail(currentTicketId);
        alert('Antwort gesendet!');
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Fehler beim Senden der Antwort: ' + error.message);
    } finally {
        const btn = document.querySelector('#replyForm button[type="submit"]');
        btn.disabled = false;
        btn.textContent = 'Antwort senden';
    }
}

function getStatusText(status) {
    const statusMap = {
        'open': 'Offen',
        'pending': 'In Bearbeitung',
        'closed': 'Geschlossen'
    };
    return statusMap[status] || status;
}

function getCategoryText(category) {
    const categoryMap = {
        'question': 'Frage',
        'problem': 'Problem',
        'feature': 'Feature-Request',
        'other': 'Sonstiges'
    };
    return categoryMap[category] || category;
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
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
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
