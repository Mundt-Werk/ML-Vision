import { db, auth } from './firebase-config.js';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { initCustomerSidebar } from './components/CustomerSidebar.js';

// ========================================================================
// STATE
// ========================================================================
let currentCustomerId = null;
let allCalls = [];
let currentCalls = [];
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

    // Get customerId from users collection
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
        console.error('User document not found in Firestore');
        showError('Ihr Benutzerprofil wurde nicht gefunden. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
        return;
    }

    const userData = userDoc.data();
    if (!userData.customerId) {
        console.error('customerId not found in user document');
        showError('Ihre Kundennummer fehlt. Bitte kontaktieren Sie den Administrator unter support@vision-ml.de.');
        return;
    }

    currentCustomerId = userData.customerId;
    await initCustomerSidebar(currentCustomerId, 'voice');
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
            limit(500)
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
    currentCalls = calls;

    // Desktop Tabelle
    const tbody = document.querySelector('.calls-table tbody');
    tbody.innerHTML = '';

    // Mobile Liste
    const mobileList = document.getElementById('mobileCallsList');
    mobileList.innerHTML = '';

    if (calls.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #6b7280;">
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
            <td><span class="call-duration">${formatDuration(getDuration(call))}</span></td>
            <td><span class="call-result ${call.outcome}">${getStatusText(call.outcome)}</span></td>
            <td>
                <div style="font-weight:500;">${call.name || '–'}</div>
                <div style="color:#6b7280; font-size:13px;">${normalizeGermanPhone(call.telefon || call.anruferNummer) || ''}</div>
                ${callbackBtn(call.telefon, call.anruferNummer)}
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
                <span class="call-result ${call.outcome}">${getStatusText(call.outcome)}</span>
            </div>
            <div class="mobile-call-info">
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Dauer</span>
                    <span class="call-duration">${formatDuration(getDuration(call))}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Anrufer</span>
                    <span>${call.name || normalizeGermanPhone(call.anruferNummer) || '–'}</span>
                </div>
            </div>
            <div class="mobile-call-actions">
                ${callbackBtn(call.telefon, call.anruferNummer)}
                ${call.recordingUrl ? `
                    <button class="action-btn" onclick="event.stopPropagation(); playAudio('${call.recordingUrl}')">▶ Abspielen</button>
                    <button class="action-btn" onclick="event.stopPropagation(); downloadAudio('${call.recordingUrl}', '${call.callId}')">⬇ Download</button>
                ` : ''}
            </div>
        `;
        mobileList.appendChild(mobileCard);
    });

    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const totalPages = Math.ceil(currentCalls.length / callsPerPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    const pages = [];
    // Zeige max. 5 Seitenzahlen um die aktuelle herum
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    container.innerHTML = `
        <div class="pagination">
            <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Zurück</button>
            ${pages.map(p => `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`).join('')}
            <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Weiter →</button>
            <span class="page-info">Seite ${currentPage} von ${totalPages} · ${currentCalls.length} Gespräche</span>
        </div>
    `;
}

window.goToPage = function(page) {
    const totalPages = Math.ceil(currentCalls.length / callsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCallsPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderCallsPage() {
    const tbody = document.querySelector('.calls-table tbody');
    const mobileList = document.getElementById('mobileCallsList');
    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    const startIndex = (currentPage - 1) * callsPerPage;
    const paginatedCalls = currentCalls.slice(startIndex, startIndex + callsPerPage);

    paginatedCalls.forEach(call => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openModal(call.id);
        tr.innerHTML = `
            <td>
                <div><strong>${formatDate(call.timestamp)}</strong></div>
                <div class="call-time">${formatTime(call.timestamp)}</div>
            </td>
            <td><span class="call-duration">${formatDuration(getDuration(call))}</span></td>
            <td><span class="call-result ${call.outcome}">${getStatusText(call.outcome)}</span></td>
            <td>
                <div style="font-weight:500;">${call.name || '–'}</div>
                <div style="color:#6b7280; font-size:13px;">${normalizeGermanPhone(call.telefon || call.anruferNummer) || ''}</div>
                ${callbackBtn(call.telefon, call.anruferNummer)}
            </td>
        `;
        tbody.appendChild(tr);

        const mobileCard = document.createElement('div');
        mobileCard.className = 'mobile-call-card';
        mobileCard.onclick = () => openModal(call.id);
        mobileCard.innerHTML = `
            <div class="mobile-call-header">
                <div class="mobile-call-date">
                    <strong>${formatDate(call.timestamp)}</strong>
                    <span class="call-time">${formatTime(call.timestamp)}</span>
                </div>
                <span class="call-result ${call.outcome}">${getStatusText(call.outcome)}</span>
            </div>
            <div class="mobile-call-info">
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Dauer</span>
                    <span class="call-duration">${formatDuration(getDuration(call))}</span>
                </div>
                <div class="mobile-info-item">
                    <span class="mobile-info-label">Anrufer</span>
                    <span>${call.name || normalizeGermanPhone(call.anruferNummer) || '–'}</span>
                </div>
            </div>
            <div class="mobile-call-actions">
                ${callbackBtn(call.telefon, call.anruferNummer)}
            </div>
        `;
        mobileList.appendChild(mobileCard);
    });

    renderPagination();
}

// ========================================================================
// FILTER FUNCTIONALITY
// ========================================================================
document.querySelector('.filter-button').addEventListener('click', () => {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const resultFilter = document.getElementById('resultFilter').value;
    const minDuration = parseInt(document.getElementById('durationFilter')?.value || '0');

    let filtered = [...allCalls];

    if (dateFrom) {
        filtered = filtered.filter(call => new Date(call.timestamp) >= new Date(dateFrom));
    }
    if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59);
        filtered = filtered.filter(call => new Date(call.timestamp) <= endDate);
    }
    if (resultFilter) {
        filtered = filtered.filter(call => call.outcome === resultFilter);
    }
    if (minDuration > 0) {
        filtered = filtered.filter(call => (call.duration || 0) >= minDuration);
    }

    currentPage = 1;
    renderCalls(filtered);
    updateHeader(filtered.length);
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
                    <span class="call-info-value">${formatDuration(getDuration(call))}</span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Ergebnis</span>
                    <span class="call-info-value"><span class="call-result ${call.outcome}">${getStatusText(call.outcome)}</span></span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Anrufer</span>
                    <span class="call-info-value">${call.name || '–'}</span>
                </div>
                <div class="call-info-item">
                    <span class="call-info-label">Telefonnummer</span>
                    <span class="call-info-value" style="display:flex; align-items:center; gap:10px;">
                        ${normalizeGermanPhone(call.telefon || call.anruferNummer) || '–'}
                        ${callbackBtn(call.telefon, call.anruferNummer)}
                    </span>
                </div>
                ${call.anruferNummer && call.anruferNummer !== call.telefon ? `
                <div class="call-info-item">
                    <span class="call-info-label">Anrufernummer</span>
                    <span class="call-info-value">${normalizeGermanPhone(call.anruferNummer)}</span>
                </div>` : ''}
                <div class="call-info-item">
                    <span class="call-info-label">E-Mail</span>
                    <span class="call-info-value">${call.email || '–'}</span>
                </div>
                ${call.terminart ? `
                <div class="call-info-item">
                    <span class="call-info-label">Terminart</span>
                    <span class="call-info-value">${call.terminart}</span>
                </div>` : ''}
                ${call.wunschtermin ? `
                <div class="call-info-item">
                    <span class="call-info-label">Wunschtermin</span>
                    <span class="call-info-value">${call.wunschtermin}</span>
                </div>` : ''}
                ${call.immoNr ? `
                <div class="call-info-item">
                    <span class="call-info-label">Immobilien-Nr.</span>
                    <span class="call-info-value">${call.immoNr}</span>
                </div>` : ''}
            </div>
        </div>
        ${call.notizen ? `
        <div class="call-detail-section">
            <h3>Gesprächsnotizen</h3>
            <p style="color:#374151; line-height:1.6; white-space:pre-wrap;">${call.notizen}</p>
        </div>` : ''}
        ${call.recordingUrl ? `
        <div class="call-detail-section">
            <h3>Aufnahme</h3>
            <div>
                <button class="action-btn" onclick="playAudio('${call.recordingUrl}')" style="margin-right: 10px;">▶ Abspielen</button>
                <button class="action-btn" onclick="downloadAudio('${call.recordingUrl}', '${call.callId}')">⬇ Download</button>
            </div>
        </div>` : ''}
        ${Array.isArray(call.transcript) && call.transcript.length > 0 ? `
        <div class="call-detail-section">
            <h3>Gesprächsverlauf</h3>
            <div class="transcript">
                ${call.transcript.map(msg => `
                    <div class="transcript-msg transcript-${msg.role}">
                        <span class="transcript-role">${msg.role === 'agent' ? 'KI-Assistent' : 'Anrufer'}</span>
                        <div class="transcript-bubble">${msg.message}</div>
                        ${msg.t > 0 ? `<span class="transcript-time">${msg.t}s</span>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>` : ''}
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
function parseTimestamp(timestamp) {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
}

function formatDate(timestamp) {
    const date = parseTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(timestamp) {
    const date = parseTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function getDuration(call) {
    return call.duration ?? call.call_duration_secs ?? call.metadata?.call_duration_secs ?? 0;
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00 Min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} Min`;
}

function normalizeGermanPhone(telefon) {
    if (!telefon) return telefon;
    const str = String(telefon).trim();
    if (str.startsWith('+') || str.startsWith('0')) return str;
    // Alle deutschen Nummern ohne führende 0 (Mobil & Festnetz)
    return '0' + str;
}

function callbackBtn(telefon, anruferNummer) {
    const normalized = normalizeGermanPhone(telefon || anruferNummer);
    if (!normalized) return '';
    const telClean = String(normalized).replace(/[^\d+]/g, '');
    return `<a href="tel:${telClean}" class="callback-btn" onclick="event.stopPropagation()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        Rückruf
    </a>`;
}

function getStatusText(outcome) {
    const outcomeMap = {
        'termin':   'Termin gebucht',
        'info':     'Info-Anfrage',
        'callback': 'Rückruf erbeten',
        'hung_up':  'Aufgelegt',
        'missed':   'Kein Ergebnis'
    };
    return outcomeMap[outcome] || outcome || '-';
}

function updateHeader(count) {
    const header = document.querySelector('.table-header h2');
    header.textContent = `${count} Gespräche gefunden`;
}

function showError(message) {
    const tbody = document.querySelector('.calls-table tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
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
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        await auth.signOut();
        window.location.href = '/public/login.html';
    });
}
