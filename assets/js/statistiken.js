import { db, auth } from './firebase-config.js';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm';
import { initCustomerSidebar } from './components/CustomerSidebar.js';
Chart.register(...registerables);

// ========================================================================
// COLORS
// ========================================================================
const COLORS = {
    termin:   '#10B981',
    info:     '#04A9D4',
    callback: '#F59E0B',
    missed:   '#6B7280',
    grid:     'rgba(255,255,255,0.06)',
    tick:     'rgba(225,232,237,0.45)',
};

// ========================================================================
// STATE
// ========================================================================
let currentCustomerId = null;
let allCalls = [];
let activePeriod = 'month';
let charts = {};

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
        showGlobalError('Benutzerprofil nicht gefunden. Kontakt: support@vision-ml.de');
        return;
    }

    const userData = userDoc.data();
    if (!userData.customerId) {
        showGlobalError('Kundennummer fehlt. Kontakt: support@vision-ml.de');
        return;
    }

    currentCustomerId = userData.customerId;
    await initCustomerSidebar(currentCustomerId, 'statistiken');
    await loadAllCalls();
    setupPeriodPicker();
    renderAll();
});

// ========================================================================
// LOAD ALL CALLS (letzten 6 Monate genügen für alle Charts)
// ========================================================================
async function loadAllCalls() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const q = query(
        collection(db, 'calls'),
        where('customerId', '==', currentCustomerId),
        orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    allCalls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Loaded ${allCalls.length} calls for statistics`);
}

// ========================================================================
// PERIOD FILTER
// ========================================================================
function getDateRange(period) {
    const now = new Date();
    const start = new Date();

    switch (period) {
        case 'week': {
            const day = now.getDay() || 7; // Mo=1
            start.setDate(now.getDate() - day + 1);
            start.setHours(0, 0, 0, 0);
            break;
        }
        case 'month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'lastmonth': {
            start.setDate(1);
            start.setMonth(start.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end };
        }
        case '3months':
            start.setMonth(start.getMonth() - 3);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
    }

    return { start, end: new Date(now) };
}

function filterByPeriod(calls, period) {
    const { start, end } = getDateRange(period);
    return calls.filter(c => {
        const d = parseTimestamp(c.timestamp);
        return d && d >= start && d <= end;
    });
}

// ========================================================================
// RENDER ALL
// ========================================================================
function renderAll() {
    const filtered = filterByPeriod(allCalls, activePeriod);
    renderKPIs(filtered);
    renderVolumeChart(filtered);
    renderOutcomeChart(filtered);
    renderTrendChart();
}

// ========================================================================
// KPI CARDS
// ========================================================================
function renderKPIs(calls) {
    const total = calls.length;
    const termine = calls.filter(c => c.outcome === 'termin').length;
    const quote = total > 0 ? Math.round((termine / total) * 100) : 0;
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    const grid = document.getElementById('kpiGrid');
    grid.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-value">${total}</div>
            <div class="kpi-label">Anrufe im Zeitraum</div>
        </div>
        <div class="kpi-card kpi-termin">
            <div class="kpi-value">${termine}</div>
            <div class="kpi-label">Gebuchte Termine</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${quote}%</div>
            <div class="kpi-label">Terminquote</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-value">${formatDuration(avgDuration)}</div>
            <div class="kpi-label">Ø Gesprächsdauer</div>
        </div>
    `;
}

// ========================================================================
// CHART 1: ANRUFVOLUMEN (letzte 30 Tage, Balken)
// ========================================================================
function renderVolumeChart(calls) {
    // Immer letzte 30 Tage, unabhängig vom Zeitraumfilter
    const days = 30;
    const labels = [];
    const data = [];
    const terminData = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dEnd = new Date(d);
        dEnd.setHours(23, 59, 59, 999);

        const label = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        labels.push(label);

        const dayTotal = allCalls.filter(c => {
            const ts = parseTimestamp(c.timestamp);
            return ts && ts >= d && ts <= dEnd;
        });
        data.push(dayTotal.length);
        terminData.push(dayTotal.filter(c => c.outcome === 'termin').length);
    }

    destroyChart('volume');
    const ctx = document.getElementById('volumeChart').getContext('2d');
    charts.volume = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Anrufe gesamt',
                    data,
                    backgroundColor: 'rgba(4,169,212,0.25)',
                    borderColor: '#04A9D4',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Termine',
                    data: terminData,
                    backgroundColor: 'rgba(16,185,129,0.35)',
                    borderColor: '#10B981',
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        },
        options: chartDefaults({
            plugins: {
                legend: {
                    display: true,
                    labels: { color: COLORS.tick, font: { size: 12 }, boxWidth: 14 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: COLORS.tick, font: { size: 11 },
                        maxRotation: 45,
                        callback: function(val, idx) {
                            // Nur jeden 3. Tag beschriften
                            return idx % 3 === 0 ? this.getLabelForValue(val) : '';
                        }
                    },
                    grid: { color: COLORS.grid }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: COLORS.tick, stepSize: 1, precision: 0 },
                    grid: { color: COLORS.grid }
                }
            }
        })
    });
}

// ========================================================================
// CHART 2: OUTCOME-DONUT
// ========================================================================
function renderOutcomeChart(calls) {
    const counts = {
        termin:   calls.filter(c => c.outcome === 'termin').length,
        info:     calls.filter(c => c.outcome === 'info').length,
        callback: calls.filter(c => c.outcome === 'callback').length,
        missed:   calls.filter(c => c.outcome === 'missed').length,
    };

    const labels = ['Termin', 'Info-Anfrage', 'Rückruf', 'Kein Ergebnis'];
    const data   = [counts.termin, counts.info, counts.callback, counts.missed];
    const colors = [COLORS.termin, COLORS.info, COLORS.callback, COLORS.missed];

    destroyChart('outcome');
    const ctx = document.getElementById('outcomeChart').getContext('2d');
    charts.outcome = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.map(c => c + '33'),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                            return ` ${ctx.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    // Legende
    const legend = document.getElementById('donutLegend');
    legend.innerHTML = labels.map((l, i) => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${colors[i]};"></span>
            <span class="legend-label">${l}</span>
            <span class="legend-value">${data[i]}</span>
        </div>
    `).join('');
}

// ========================================================================
// CHART 3: MONATLICHER TREND (6 Monate, Linie)
// ========================================================================
function renderTrendChart() {
    const labels = [];
    const totalData = [];
    const terminData = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        d.setHours(0, 0, 0, 0);

        const dEnd = new Date(d);
        dEnd.setMonth(dEnd.getMonth() + 1);
        dEnd.setDate(0);
        dEnd.setHours(23, 59, 59, 999);

        labels.push(d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }));

        const monthCalls = allCalls.filter(c => {
            const ts = parseTimestamp(c.timestamp);
            return ts && ts >= d && ts <= dEnd;
        });
        totalData.push(monthCalls.length);
        terminData.push(monthCalls.filter(c => c.outcome === 'termin').length);
    }

    destroyChart('trend');
    const ctx = document.getElementById('trendChart').getContext('2d');
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Anrufe gesamt',
                    data: totalData,
                    borderColor: '#04A9D4',
                    backgroundColor: 'rgba(4,169,212,0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#04A9D4',
                    tension: 0.3,
                    fill: true,
                },
                {
                    label: 'Termine',
                    data: terminData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#10B981',
                    tension: 0.3,
                    fill: true,
                }
            ]
        },
        options: chartDefaults({
            plugins: {
                legend: {
                    display: true,
                    labels: { color: COLORS.tick, font: { size: 12 }, boxWidth: 14 }
                }
            },
            scales: {
                x: {
                    ticks: { color: COLORS.tick },
                    grid: { color: COLORS.grid }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: COLORS.tick, stepSize: 1, precision: 0 },
                    grid: { color: COLORS.grid }
                }
            }
        })
    });
}

// ========================================================================
// PERIOD PICKER
// ========================================================================
function setupPeriodPicker() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePeriod = btn.dataset.period;
            renderAll();
        });
    });
}

// ========================================================================
// HELPER
// ========================================================================
function parseTimestamp(ts) {
    if (!ts) return null;
    if (ts.toDate) return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

function chartDefaults(extra = {}) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1f2e',
                titleColor: '#e1e8ed',
                bodyColor: 'rgba(225,232,237,0.7)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            },
            ...(extra.plugins || {})
        },
        scales: extra.scales || {},
        ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'plugins' && k !== 'scales'))
    };
}

function showGlobalError(msg) {
    document.querySelector('.main-content').innerHTML = `
        <div style="padding:60px; text-align:center; color:#ef4444;">${msg}</div>
    `;
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
