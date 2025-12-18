import { db, auth } from '../../assets/js/firebase-config.js';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// ========================================================================
// STATE
// ========================================================================
let currentUser = null;
let currentCustomerId = null;
let allCalls = [];
let currentPage = 1;
const callsPerPage = 20;

// ========================================================================
// INITIALIZATION
// ========================================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '/public/login.html';
        return;
    }

    currentUser = user;

    // Get customerId from users collection
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
    await loadCalls();
});

// ========================================================================
// LOAD CALLS FROM FIRESTORE
// ========================================================================
async function loadCalls() {
    try {
        const q = query(
            collection(db, 'calls'),
            where('customerId', '==', currentCustomerId),
            orderBy('timestamp', 'desc'),
            limit(100) // Limit für Performance
        );

        const snapshot = await getDocs(q);
        allCalls = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Loaded ${allCalls.length} calls`);
        renderCalls(allCalls);
        updateHeader(allCalls.length);
    } catch (error) {
        console.error('Error loading calls:', error);
        showError('Fehler beim Laden der Gespräche');
    }
}

// ========================================================================
// RENDER CALLS TABLE
// ========================================================================
function renderCalls(calls) {
    // Desktop Tabelle
    const tbody = document.querySelector('.calls-table tbody');
    tbody.innerHTML = '';

    // Mobile Liste
    const mobileList = document.getElementById('mobileCallsList');
    mobileList.innerHTML = '';

    if (calls.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">
                    Keine Gespräche gefunden
                </td>
            </tr>
        `;
        mobileList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280; background: #fff; border-radius: 12px;">
                Keine Gespräche gefunden
            </div>
        `;
        return;
    }

    // Pagination
    const startIndex = (currentPage - 1) * callsPerPage;
    const endIndex = startIndex + callsPerPage;
    const paginatedCalls = calls.slice(startIndex, endIndex);

    paginatedCalls.forEach(call => {
        // Desktop Tabelle
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openModal(call.id);

        tr.innerHTML = `
            <td>
                <div><strong>${formatDate(call.timestamp)}</strong></div>
                <div class="call-time">${formatTime(call.timestamp)}</div>
            </td>
            <td><span class="call-duration">${formatDuration(call.duration)}</span></td>
            <td><span class="call-result ${call.status}">${getStatusText(call.status)}</span></td>
            <td style="color: #6b7280;">-</td>
            <td>
                <div class="actions">
                    ${call.recordingUrl ? `
                        <button class="action-btn" onclick="event.stopPropagation(); playAudio('${call.recordingUrl}')">▶ Abspielen</button>
                        <button class="action-btn" onclick="event.stopPropagation(); downloadAudio('${call.recordingUrl}', '${call.callId}')">⬇ Download</button>
                    ` : '<span style="color: #6b7280;">Keine Aufnahme</span>'}
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // Mobile Card
        const mobileCard = document.createElement('div');
        mobileCard.className = 'mobile-call-card';
        mobileCard.onclick = () => openModal(call.id);

        mobileCard.innerHTML = `
            <div class="mobile-call-header">
                <div class="mobile-call-date">
                    <strong>${formatDate(call.timestamp)}</strong>
                    <span class="call-time">${formatTime(call.timestamp)}</span>
                </div>
                <span class="call-result ${call.status}">${getStatusText(call.status)}</span>
            </div>
            <div class="mobile-call-info">
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Dauer</span>
                    <span class="call-duration">${formatDuration(call.duration)}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Status</span>
                    <span>${getStatusText(call.status)}</span>
                </div>
            </div>
            ${call.recordingUrl ? `
                <div class="mobile-call-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); playAudio('${call.recordingUrl}')">▶ Abspielen</button>
                    <button class="action-btn" onclick="event.stopPropagation(); downloadAudio('${call.recordingUrl}', '${call.callId}')">⬇ Download</button>
                </div>
            ` : '<div style="color: #6b7280; font-size: 13px;">Keine Aufnahme verfügbar</div>'}
        `;
        mobileList.appendChild(mobileCard);
    });
}

// ========================================================================
// FILTER FUNCTIONALITY
// ========================================================================
document.querySelector('.filter-button').addEventListener('click', () => {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const resultFilter = document.getElementById('resultFilter').value;

    let filtered = [...allCalls];

    // Filter by date range
    if (dateFrom) {
        filtered = filtered.filter(call =>
            new Date(call.timestamp) >= new Date(dateFrom)
        );
    }
    if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59); // End of day
        filtered = filtered.filter(call =>
            new Date(call.timestamp) <= endDate
        );
    }

    // Filter by status
    if (resultFilter) {
        filtered = filtered.filter(call => call.status === resultFilter);
    }

    currentPage = 1; // Reset to first page
    renderCalls(filtered);
    updateHeader(filtered.length);
});

// ========================================================================
// CSV EXPORT
// ========================================================================
document.querySelector('.export-button').addEventListener('click', () => {
    const csvRows = [
        ['Datum', 'Uhrzeit', 'Dauer (Sek)', 'Status', 'Telefonnummer']
    ];

    allCalls.forEach(call => {
        csvRows.push([
            formatDate(call.timestamp),
            formatTime(call.timestamp),
            call.duration,
            getStatusText(call.status),
            call.phoneNumber || 'N/A'
        ]);
    });

    const csv = csvRows.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `gespraeche_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
});

// ========================================================================
// AUDIO PLAYER
// ========================================================================
window.playAudio = function(recordingUrl) {
    // Remove any existing audio player
    const existingPlayer = document.getElementById('audioPlayer');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Create audio element
    const audio = document.createElement('audio');
    audio.id = 'audioPlayer';
    audio.controls = true;
    audio.autoplay = true;
    audio.style.width = '100%';
    audio.style.marginTop = '10px';

    const source = document.createElement('source');
    source.src = recordingUrl;
    source.type = 'audio/mpeg';

    audio.appendChild(source);

    // Add to modal or create floating player
    const modal = document.getElementById('callModal');
    if (modal.classList.contains('active')) {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.insertBefore(audio, modalBody.firstChild);
    } else {
        // Create floating player
        const player = document.createElement('div');
        player.style.position = 'fixed';
        player.style.bottom = '20px';
        player.style.right = '20px';
        player.style.background = 'white';
        player.style.padding = '20px';
        player.style.borderRadius = '12px';
        player.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        player.style.zIndex = '10000';
        player.style.minWidth = '300px';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.float = 'right';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'none';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => player.remove();

        player.appendChild(closeBtn);
        player.appendChild(document.createElement('div')).innerHTML = '<strong>Audio-Wiedergabe</strong>';
        player.appendChild(audio);

        document.body.appendChild(player);
    }
};

window.downloadAudio = function(recordingUrl, callId) {
    const a = document.createElement('a');
    a.href = recordingUrl;
    a.download = `call_${callId}.mp3`;
    a.target = '_blank';
    a.click();
};

// ========================================================================
// MODAL
// ========================================================================
window.openModal = async function(callId) {
    const call = allCalls.find(c => c.id === callId);
    if (!call) return;

    const modal = document.getElementById('callModal');
    const modalBody = modal.querySelector('.modal-body');

    // Update modal content
    modalBody.innerHTML = `
        <div class="call-detail-section">
            <h3>Gesprächsinformationen</h3>
            <div class="call-info-grid">
                <div class="call-info-item">
                    <span class="call-info-label">Datum & Uhrzeit</span>
                    <span class="call-info-value">${formatDate(call.timestamp)}, ${formatTime(call.timestamp)}</span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Dauer</span>
                    <span class="call-info-value">${formatDuration(call.duration)}</span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Status</span>
                    <span class="call-info-value">${getStatusText(call.status)}</span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Telefonnummer</span>
                    <span class="call-info-value">${call.phoneNumber || 'N/A'}</span>
                </div>
                ${call.recordingUrl ? `
                <div class="call-info-item" style="grid-column: 1 / -1;">
                    <span class="call-info-label">Aufnahme</span>
                    <div style="margin-top: 10px;">
                        <button class="action-btn" onclick="playAudio('${call.recordingUrl}')" style="margin-right: 10px;">▶ Abspielen</button>
                        <button class="action-btn" onclick="downloadAudio('${call.recordingUrl}', '${call.callId}')">⬇ Download</button>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        ${call.recordingUrl ? '' : '<p style="color: #6b7280; text-align: center; padding: 20px;">Keine Aufnahme verfügbar für dieses Gespräch.</p>'}
    `;

    modal.classList.add('active');
};

window.closeModal = function() {
    const modal = document.getElementById('callModal');
    modal.classList.remove('active');

    // Stop any playing audio
    const audio = document.getElementById('audioPlayer');
    if (audio) {
        audio.pause();
        audio.remove();
    }
};

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00 Min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} Min`;
}

function getStatusText(status) {
    const statusMap = {
        'completed': 'Erfolgreich',
        'failed': 'Fehlgeschlagen',
        'unknown': 'Unbekannt'
    };
    return statusMap[status] || status;
}

function updateHeader(count) {
    const header = document.querySelector('.table-header h2');
    header.textContent = `${count} Gespräche gefunden`;
}

function showError(message) {
    const tbody = document.querySelector('.calls-table tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">
                ${message}
            </td>
        </tr>
    `;
}

// ========================================================================
// SIDEBAR & MISC
// ========================================================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
};

// Close modal when clicking outside
document.getElementById('callModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

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

// Logout
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        await auth.signOut();
        window.location.href = '/public/login.html';
    });
}
