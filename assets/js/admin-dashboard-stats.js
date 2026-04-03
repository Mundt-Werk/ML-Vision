// Admin Dashboard — echte Firestore Daten + System-Status-Checks
import { db } from './firebase-config.js';
import {
    collection,
    getCountFromServer,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const N8N_URL = 'https://n8n.vision-ml.de';

export async function loadDashboardStats() {
    try {
        const weekStart = Timestamp.fromDate(getStartOfWeek());

        // customers.html liest aus 'sales_leads' — diese Collection ist die echte Kundenbasis
        const [
            allCustomers,
            allLeads,
            customersThisWeek,
            openTickets
        ] = await Promise.all([
            getCountFromServer(collection(db, 'sales_leads')),
            getCountFromServer(collection(db, 'leads')),
            getCountFromServer(query(
                collection(db, 'sales_leads'),
                where('createdAt', '>=', weekStart)
            )),
            getCountFromServer(query(
                collection(db, 'tickets'),
                where('status', '==', 'open')
            ))
        ]);

        const customerCount = allCustomers.data().count;
        const leadsCount = allLeads.data().count;
        const newCustomersThisWeek = customersThisWeek.data().count;
        const openTicketCount = openTickets.data().count;

        // Karte 1: Gesamte Kunden
        setStatValue('stat-customers', customerCount.toLocaleString('de-DE'));
        setStatChange('stat-customers-change', `+${newCustomersThisWeek} diese Woche`);

        // Karte 2: Aktive Leads
        setStatValue('stat-leads', leadsCount.toLocaleString('de-DE'));
        setStatChange('stat-leads-change', leadsCount === 0 ? 'Noch keine Leads' : 'Leads gesamt');

        // Karte 3: Offene Tickets
        setStatValue('stat-tickets', openTicketCount.toLocaleString('de-DE'));
        setStatChange('stat-tickets-change', openTicketCount === 1 ? '1 Ticket offen' : `${openTicketCount} Tickets offen`);

        // Karte 4: Neue Kunden diese Woche
        setStatValue('stat-new-customers', newCustomersThisWeek.toLocaleString('de-DE'));
        setStatChange('stat-new-customers-change', 'seit Montag');

    } catch (error) {
        console.error('Fehler beim Laden der Dashboard-Stats:', error);
        ['stat-customers', 'stat-leads', 'stat-tickets', 'stat-new-customers'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.textContent === '—') el.textContent = 'N/A';
        });
    }

    // Letzte Kunden + Tickets laden
    loadRecentCustomers();
    loadRecentTickets();
}

async function loadRecentCustomers() {
    const feed = document.getElementById('recent-customers-feed');
    if (!feed) return;

    try {
        const snap = await getDocs(query(
            collection(db, 'sales_leads'),
            orderBy('createdAt', 'desc'),
            limit(5)
        ));

        if (snap.empty) {
            feed.innerHTML = '<li class="activity-item"><div class="activity-content"><p style="color: rgba(225,232,237,0.5)">Noch keine Kunden vorhanden</p></div></li>';
            return;
        }

        feed.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.createdAt ? formatRelativeTime(new Date(d.createdAt)) : '—';
            const li = document.createElement('li');
            li.className = 'activity-item';
            li.innerHTML = `
                <div class="activity-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="activity-content">
                    <strong>${d.companyName || d.name || 'Unbekannt'}</strong>
                    <p>${d.contactName || d.email || '—'}</p>
                </div>
                <div class="activity-time">${date}</div>`;
            feed.appendChild(li);
        });
    } catch (error) {
        console.error('Fehler beim Laden der letzten Kunden:', error);
        feed.innerHTML = '<li class="activity-item"><div class="activity-content"><p style="color: rgba(225,232,237,0.5)">Fehler beim Laden</p></div></li>';
    }
}

async function loadRecentTickets() {
    const feed = document.getElementById('recent-tickets-feed');
    if (!feed) return;

    try {
        const snap = await getDocs(query(
            collection(db, 'tickets'),
            orderBy('createdAt', 'desc'),
            limit(5)
        ));

        if (snap.empty) {
            feed.innerHTML = '<li class="activity-item"><div class="activity-content"><p style="color: rgba(225,232,237,0.5)">Noch keine Tickets vorhanden</p></div></li>';
            return;
        }

        feed.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.createdAt ? formatRelativeTime(new Date(d.createdAt)) : '—';
            const statusColor = d.status === 'open' ? '#ff453a' : d.status === 'in_progress' ? '#ffd60a' : '#30d158';
            const li = document.createElement('li');
            li.className = 'activity-item';
            li.innerHTML = `
                <div class="activity-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                </div>
                <div class="activity-content">
                    <strong>${d.title || 'Ticket'}</strong>
                    <p style="color:${statusColor}">${d.status === 'open' ? 'Offen' : d.status === 'in_progress' ? 'In Bearbeitung' : 'Geschlossen'}</p>
                </div>
                <div class="activity-time">${date}</div>`;
            feed.appendChild(li);
        });
    } catch (error) {
        console.error('Fehler beim Laden der letzten Tickets:', error);
        feed.innerHTML = '<li class="activity-item"><div class="activity-content"><p style="color: rgba(225,232,237,0.5)">Fehler beim Laden</p></div></li>';
    }
}

export async function loadSystemStatus() {
    // Firebase Health via Firestore Read
    checkFirebase();

    // n8n Healthz Ping
    pingEndpoint(
        `${N8N_URL}/healthz`,
        'status-n8n',
        'status-n8n-text',
        'n8n Automatisierungen',
        'n8n aktiv',
        'n8n nicht erreichbar',
        true
    );
}

async function pingEndpoint(url, indicatorId, textId, label, okText, failText, noCors) {
    const indicator = document.getElementById(indicatorId);
    const textEl = document.getElementById(textId);
    if (!indicator || !textEl) return;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const opts = { signal: controller.signal };
        if (noCors) opts.mode = 'no-cors';
        const res = await fetch(url, opts);
        clearTimeout(timeout);
        const ok = noCors ? true : res.ok;
        setStatus(indicator, textEl, ok ? 'success' : 'error', label, ok ? okText : failText);
    } catch {
        setStatus(indicator, textEl, 'error', label, failText);
    }
}

async function checkFirebase() {
    const indicator = document.getElementById('status-firebase');
    const textEl = document.getElementById('status-firebase-text');
    if (!indicator || !textEl) return;

    try {
        await getCountFromServer(collection(db, 'sales_leads'));
        setStatus(indicator, textEl, 'success', 'Firebase Datenbank', 'Verbunden & erreichbar');
    } catch {
        setStatus(indicator, textEl, 'error', 'Firebase Datenbank', 'Verbindung fehlgeschlagen');
    }
}

function setStatus(indicator, textEl, status, label, detail) {
    indicator.className = `status-indicator ${status}`;
    const strong = textEl.querySelector('strong');
    const small = textEl.querySelector('small');
    if (strong) strong.textContent = label;
    if (small) small.textContent = detail;
}

function setStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setStatChange(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
    if (textNodes.length > 0) {
        textNodes[textNodes.length - 1].textContent = '\n                        ' + text + '\n                    ';
    } else {
        el.appendChild(document.createTextNode(text));
    }
}

function getStartOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function formatRelativeTime(date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Gerade eben';
    if (diff < 3600) return `Vor ${Math.floor(diff / 60)} Min`;
    if (diff < 86400) return `Vor ${Math.floor(diff / 3600)} Std`;
    return date.toLocaleDateString('de-DE');
}
