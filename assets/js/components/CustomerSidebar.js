/**
 * Customer Sidebar Component mit Modul-Flags
 * Zeigt nur Module an, die für den Kunden aktiviert sind
 */

import { db } from '../firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export class CustomerSidebar {
    constructor(customerId, currentPage = 'dashboard') {
        this.customerId = customerId;
        this.currentPage = currentPage;
        this.enabledModules = {
            voice: false,
            support: false,
            invoices: false,
            settings: true // Einstellungen immer aktiv
        };
    }

    /**
     * Lädt Modul-Flags aus Firestore
     */
    async loadModuleFlags() {
        try {
            const customerDoc = await getDoc(doc(db, 'customers', this.customerId));
            if (customerDoc.exists()) {
                const data = customerDoc.data();

                // Option 1: modules direkt im Customer-Document
                if (data.modules) {
                    this.enabledModules = {
                        voice: data.modules.voice || false,
                        support: data.modules.support || false,
                        invoices: data.modules.invoices || false,
                        settings: true // Immer aktiv
                    };
                }
                // Option 2: Separate customer_modules Collection (falls gewünscht)
                // const moduleDoc = await getDoc(doc(db, 'customer_modules', this.customerId));
                // if (moduleDoc.exists()) { ... }

                console.log('Enabled modules:', this.enabledModules);
            }
        } catch (error) {
            console.error('Error loading module flags:', error);
            // Bei Fehler: Alle Module aktivieren (Fallback)
            this.enabledModules = {
                voice: true,
                support: true,
                invoices: true,
                settings: true
            };
        }
    }

    /**
     * Generiert die Sidebar-Navigation
     */
    generateNavigation() {
        const modules = [
            {
                id: 'dashboard',
                name: 'Dashboard',
                url: '../dashboard.html',
                icon: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
                enabled: true // Dashboard immer sichtbar
            },
            {
                id: 'voice',
                name: 'Gespräche',
                url: 'gespraeche.html',
                icon: '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
                enabled: this.enabledModules.voice
            },
            {
                id: 'support',
                name: 'Support',
                url: 'support.html',
                icon: '<path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>',
                enabled: this.enabledModules.support
            },
            {
                id: 'invoices',
                name: 'Rechnungen',
                url: 'rechnungen.html',
                icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>',
                enabled: this.enabledModules.invoices
            },
            {
                id: 'settings',
                name: 'Einstellungen',
                url: 'einstellungen.html',
                icon: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
                enabled: this.enabledModules.settings
            }
        ];

        // Nur aktivierte Module
        const enabledModules = modules.filter(m => m.enabled);

        return enabledModules.map(module => {
            const isActive = this.currentPage === module.id;
            const activeClass = isActive ? ' class="active"' : '';

            // URL-Anpassung für Dashboard (ein Level höher)
            const url = module.id === 'dashboard' ? module.url : `pages/${module.url}`;

            return `
                <li>
                    <a href="${url}"${activeClass}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            ${module.icon}
                        </svg>
                        ${module.name}
                    </a>
                </li>
            `;
        }).join('');
    }

    /**
     * Prüft ob aktuelles Modul aktiviert ist
     * Für Route-Guards
     */
    isModuleEnabled(moduleId) {
        if (moduleId === 'dashboard' || moduleId === 'settings') {
            return true; // Immer verfügbar
        }
        return this.enabledModules[moduleId] || false;
    }

    /**
     * Rendert die komplette Sidebar
     */
    async render(sidebarId = 'sidebar') {
        await this.loadModuleFlags();

        const sidebar = document.getElementById(sidebarId);
        if (!sidebar) {
            console.error('Sidebar element not found:', sidebarId);
            return;
        }

        const sidebarMenu = sidebar.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            sidebarMenu.innerHTML = this.generateNavigation();
        }
    }

    /**
     * Route-Guard: Redirected wenn Modul nicht aktiviert
     */
    async checkAccess(moduleId) {
        await this.loadModuleFlags();

        if (!this.isModuleEnabled(moduleId)) {
            console.warn(`Access denied to module: ${moduleId}`);
            window.location.href = '../dashboard.html';
            return false;
        }
        return true;
    }
}

/**
 * Helper: Initialisiert Sidebar für alle Seiten
 */
export async function initCustomerSidebar(customerId, currentPage = 'dashboard') {
    const sidebar = new CustomerSidebar(customerId, currentPage);
    await sidebar.render();
    return sidebar;
}

/**
 * Helper: Route-Guard
 */
export async function checkModuleAccess(customerId, moduleId) {
    const sidebar = new CustomerSidebar(customerId);
    return await sidebar.checkAccess(moduleId);
}
