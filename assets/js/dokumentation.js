import { initCustomerSidebar } from './components/CustomerSidebar.js';
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;
let currentCustomerId = null;

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '../../public/login.html';
            return;
        }

        currentUser = user;

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                window.location.href = '../../public/login.html';
                return;
            }

            const userData = userDoc.data();
            if (!userData.customerId) {
                window.location.href = '../../public/login.html';
                return;
            }

            currentCustomerId = userData.customerId;
            await initCustomerSidebar(currentCustomerId, 'dokumentation');

        } catch (error) {
            console.error('Error initializing dokumentation:', error);
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = '../../public/login.html';
    });

    // DSGVO-Infoblatt direkt als Support-Ticket anfordern
    document.getElementById('dsgvoPdfLink').addEventListener('click', async (e) => {
        e.preventDefault();

        if (!currentCustomerId || !currentUser) {
            alert('Bitte laden Sie die Seite neu und versuchen Sie es erneut.');
            return;
        }

        const btn = e.currentTarget;
        const originalHtml = btn.innerHTML;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';

        try {
            const now = new Date().toISOString();
            const ticketBody = 'Bitte senden Sie mir das DSGVO-Infoblatt für den Einsatz des KI-Telefonassistenten zu.';

            const docRef = await addDoc(collection(db, 'tickets'), {
                customerId: currentCustomerId,
                title: 'DSGVO-Infoblatt anfordern',
                body: ticketBody,
                category: 'question',
                priority: 'normal',
                status: 'open',
                createdAt: now,
                updatedAt: now
            });

            await addDoc(collection(db, 'tickets', docRef.id, 'messages'), {
                sender: 'customer',
                message: ticketBody,
                files: [],
                createdAt: now
            });

            fetch('https://n8n.vision-ml.de/webhook/mlv-ticket-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ticket_created',
                    ticketId: docRef.id,
                    title: 'DSGVO-Infoblatt anfordern',
                    priority: 'normal',
                    customerEmail: currentUser.email,
                    customerName: currentUser.email.split('@')[0]
                })
            }).catch(() => {});

            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Anfrage gesendet!
            `;
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.background = '';
                btn.style.pointerEvents = '';
                btn.style.opacity = '';
            }, 4000);

        } catch (error) {
            console.error('Error creating DSGVO ticket:', error);
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
            alert('Fehler beim Senden der Anfrage. Bitte kontaktieren Sie uns direkt unter support@vision-ml.de');
        }
    });
});
