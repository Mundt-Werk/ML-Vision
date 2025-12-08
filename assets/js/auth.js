// Authentication Logic
import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check if user is logged in and redirect accordingly
export function checkAuthState() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is logged in
                const userRole = await getUserRole(user.uid);
                resolve({ user, role: userRole });
            } else {
                // User is not logged in
                resolve({ user: null, role: null });
            }
        });
    });
}

// Get user role from Firestore
export async function getUserRole(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().role || 'customer';
        }
        return 'customer';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'customer';
    }
}

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const role = await getUserRole(user.uid);

        return { success: true, user, role };
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login fehlgeschlagen.';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Dieser Account wurde deaktiviert.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Kein Account mit dieser E-Mail gefunden.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Falsches Passwort.';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Ungültige Anmeldedaten.';
                break;
        }

        return { success: false, error: errorMessage };
    }
}

// Register function (Admin only - creates customer accounts)
export async function registerCustomer(email, password, customerData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            ...customerData
        });

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registrierung fehlgeschlagen.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Das Passwort ist zu schwach.';
                break;
        }

        return { success: false, error: errorMessage };
    }
}

// Password reset function
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        let errorMessage = 'Passwort-Reset fehlgeschlagen.';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Kein Account mit dieser E-Mail gefunden.';
                break;
        }

        return { success: false, error: errorMessage };
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: 'Logout fehlgeschlagen.' };
    }
}

// Redirect based on role
export function redirectByRole(role) {
    if (role === 'admin') {
        window.location.href = '/admin/dashboard.html';
    } else {
        window.location.href = '/customer/dashboard.html';
    }
}

// Protect page (redirect if not logged in)
export async function protectPage(requiredRole = null) {
    const { user, role } = await checkAuthState();

    if (!user) {
        // Not logged in - redirect to login
        window.location.href = '/public/login.html';
        return false;
    }

    if (requiredRole && role !== requiredRole) {
        // Wrong role - redirect to correct dashboard
        redirectByRole(role);
        return false;
    }

    return { user, role };
}
