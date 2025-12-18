import { initCustomerSidebar } from '../../assets/js/components/CustomerSidebar.js';
import { auth, db } from '../../assets/js/firebase-config.js';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;
let currentCustomerId = null;
let currentNotifications = {
    email: true,
    tickets: true,
    invoices: false
};

// Initialize page
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

        // Initialize sidebar
        await initCustomerSidebar(currentCustomerId, 'einstellungen');

        // Load customer data
        await loadCustomerData(currentCustomerId);
    });

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.signOut();
        window.location.href = '/public/login.html';
    });
});

// Load customer data
async function loadCustomerData(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'customers', customerId));
        if (customerDoc.exists()) {
            const customer = customerDoc.data();

            // Fill profile form
            document.getElementById('profileName').value = customer.name || '';
            document.getElementById('profileEmail').value = customer.email || '';
            document.getElementById('profilePhone').value = customer.phone || '';

            // Load notifications
            if (customer.notifications) {
                currentNotifications = customer.notifications;
                updateNotificationToggles();
            }
        }
    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}

// Update notification toggles UI
function updateNotificationToggles() {
    document.getElementById('toggleEmail').classList.toggle('active', currentNotifications.email);
    document.getElementById('toggleTickets').classList.toggle('active', currentNotifications.tickets);
    document.getElementById('toggleInvoices').classList.toggle('active', currentNotifications.invoices);
}

// Toggle notification
window.toggleNotification = async function(type) {
    try {
        currentNotifications[type] = !currentNotifications[type];
        updateNotificationToggles();

        // Update in Firestore
        await updateDoc(doc(db, 'customers', currentCustomerId), {
            notifications: currentNotifications
        });

        showMessage('notificationsSuccessMessage', 'Benachrichtigungseinstellungen gespeichert');
    } catch (error) {
        console.error('Error updating notifications:', error);
        currentNotifications[type] = !currentNotifications[type]; // Revert
        updateNotificationToggles();
    }
};

// Profile form submit
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;

    try {
        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird gespeichert...';

        await updateDoc(doc(db, 'customers', currentCustomerId), {
            name: name,
            email: email,
            phone: phone
        });

        showMessage('profileSuccessMessage', 'Profil erfolgreich aktualisiert');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Profil aktualisieren';
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('profileErrorMessage', 'Fehler beim Aktualisieren: ' + error.message);
        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Profil aktualisieren';
    }
});

// Password form submit
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate
    if (newPassword !== confirmPassword) {
        showError('passwordErrorMessage', 'Die Passwörter stimmen nicht überein');
        return;
    }

    if (newPassword.length < 6) {
        showError('passwordErrorMessage', 'Das Passwort muss mindestens 6 Zeichen lang sein');
        return;
    }

    try {
        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wird geändert...';

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);

        // Update password
        await updatePassword(currentUser, newPassword);

        showMessage('passwordSuccessMessage', 'Passwort erfolgreich geändert');

        // Reset form
        e.target.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Passwort ändern';
    } catch (error) {
        console.error('Error updating password:', error);
        let errorMsg = 'Fehler beim Ändern des Passworts';

        if (error.code === 'auth/wrong-password') {
            errorMsg = 'Das aktuelle Passwort ist falsch';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'Das Passwort ist zu schwach';
        }

        showError('passwordErrorMessage', errorMsg);
        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Passwort ändern';
    }
});

// Helper functions
function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}
