// Dashboard Authentication and Utilities
import { protectPage, logout } from './auth.js';

// Initialize dashboard with auth check
export async function initDashboard(requiredRole) {
    const authData = await protectPage(requiredRole);

    if (authData) {
        // User is authenticated and has correct role
        displayUserInfo(authData.user, authData.role);
        setupLogout();
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
