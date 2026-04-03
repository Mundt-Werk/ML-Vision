// Dashboard Authentication and Utilities
import { protectPage, logout } from './auth.js';

const TIMEOUT_WARN_MS  = 25 * 60 * 1000; // 25 Minuten → Warn-Modal
const TIMEOUT_LOGOUT_MS = 30 * 60 * 1000; // 30 Minuten → Auto-Logout

let warnTimer   = null;
let logoutTimer = null;
let warnModalInjected = false;

function resetTimers() {
    clearTimeout(warnTimer);
    clearTimeout(logoutTimer);

    // Warn-Modal nach 25 Min
    warnTimer = setTimeout(() => showSessionWarning(), TIMEOUT_WARN_MS);
    // Auto-Logout nach 30 Min
    logoutTimer = setTimeout(() => doAutoLogout(), TIMEOUT_LOGOUT_MS);
}

function showSessionWarning() {
    // Modal-HTML einmalig in DOM einfügen
    if (!warnModalInjected) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="sessionWarnModal" style="
                position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;
                display:flex;align-items:center;justify-content:center">
                <div style="
                    background:#1a2332;border:1px solid rgba(255,255,255,0.1);
                    border-radius:12px;padding:32px;max-width:380px;width:90%;text-align:center">
                    <h3 style="color:#e1e8ed;margin:0 0 12px">Sitzung läuft ab</h3>
                    <p style="color:rgba(225,232,237,0.7);margin:0 0 24px;font-size:14px">
                        Du wirst in <strong id="sessionCountdown">5:00</strong> automatisch ausgeloggt.
                    </p>
                    <button id="sessionStayBtn" style="
                        background:#04A9D4;color:#fff;border:none;border-radius:8px;
                        padding:10px 28px;font-size:14px;cursor:pointer;font-weight:500">
                        Aktiv bleiben
                    </button>
                </div>
            </div>`;
        document.body.appendChild(div.firstElementChild);
        warnModalInjected = true;

        document.getElementById('sessionStayBtn').addEventListener('click', () => {
            document.getElementById('sessionWarnModal').style.display = 'none';
            clearInterval(countdownInterval);
            resetTimers();
        });
    } else {
        document.getElementById('sessionWarnModal').style.display = 'flex';
    }

    // Countdown 5:00 → 0:00
    let remaining = 5 * 60;
    const countdownEl = document.getElementById('sessionCountdown');
    const countdownInterval = setInterval(() => {
        remaining--;
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        if (countdownEl) countdownEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        if (remaining <= 0) clearInterval(countdownInterval);
    }, 1000);
}

async function doAutoLogout() {
    const modal = document.getElementById('sessionWarnModal');
    if (modal) modal.style.display = 'none';
    await logout();
    window.location.href = '/public/login.html';
}

function startSessionTimeout() {
    // Activity-Events zurücksetzen den Timer
    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimers, { passive: true });
    });
    resetTimers();
}

// Initialize dashboard with auth check
export async function initDashboard(requiredRole) {
    const authData = await protectPage(requiredRole);

    if (authData) {
        // User is authenticated and has correct role
        displayUserInfo(authData.user, authData.role);
        setupLogout();
        startSessionTimeout();
        return authData;
    }

    return null;
}

// Display user info in dashboard
function displayUserInfo(user, role) {
    // Update user email displays
    const emailElements = document.querySelectorAll('.user-email');
    emailElements.forEach(el => {
        el.textContent = user.email;
    });

    // Update role displays
    const roleElements = document.querySelectorAll('.user-role');
    roleElements.forEach(el => {
        if (role === 'admin') {
            el.textContent = 'Administrator';
        } else {
            el.textContent = 'Kunde';
        }
    });

    // Update user name if available (first part of email)
    const nameElements = document.querySelectorAll('.user-name');
    nameElements.forEach(el => {
        const name = user.email.split('@')[0];
        el.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    });
}

// Setup logout functionality
function setupLogout() {
    const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');

    logoutButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            // Use custom modal if available, otherwise use browser confirm
            const confirmed = window.showConfirm
                ? await window.showConfirm('Möchten Sie sich wirklich abmelden?', 'Abmelden')
                : confirm('Möchten Sie sich wirklich abmelden?');

            if (confirmed) {
                const result = await logout();

                if (result.success) {
                    window.location.href = '/public/login.html';
                } else {
                    // Use custom modal if available, otherwise use browser alert
                    if (window.showAlert) {
                        window.showAlert('Fehler beim Abmelden. Bitte versuchen Sie es erneut.', 'Fehler');
                    } else {
                        alert('Fehler beim Abmelden. Bitte versuchen Sie es erneut.');
                    }
                }
            }
        });
    });
}

// Show loading state
export function showLoading() {
    const loader = document.getElementById('dashboard-loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Hide loading state
export function hideLoading() {
    const loader = document.getElementById('dashboard-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show notification
export function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.textContent = message;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
