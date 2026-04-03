/**
 * ElevenLabs Voice Agent Widget - Secure Integration
 *
 * Dieses Script lädt signierte URLs vom Backend und initialisiert
 * das ElevenLabs Widget sicher ohne API Key im Frontend.
 */

(function() {
    'use strict';

    // Konfiguration
    const CONFIG = {
        tokenEndpoint: '/elevenlabs-token.php',
        retryAttempts: 3,
        retryDelay: 1000
    };

    /**
     * Hole signierte URL vom Backend
     */
    async function getSignedUrl(attempt = 1) {
        try {
            const response = await fetch(CONFIG.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success || !data.signed_url) {
                throw new Error('Ungültige Token-Response');
            }

            return data.signed_url;

        } catch (error) {
            console.error(`ElevenLabs Token Error (Versuch ${attempt}):`, error);

            // Retry Logic
            if (attempt < CONFIG.retryAttempts) {
                console.log(`Erneuter Versuch in ${CONFIG.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
                return getSignedUrl(attempt + 1);
            }

            throw error;
        }
    }

    /**
     * Verstecke ElevenLabs Branding
     */
    function hideBranding(widgetElement) {
        if (!widgetElement) return;

        try {
            // Versuche Shadow Root zu erreichen
            const shadowRoot = widgetElement.shadowRoot;
            if (shadowRoot) {
                // Suche nach allen möglichen Branding-Elementen
                const brandingSelectors = [
                    '[data-testid*="branding"]',
                    '[data-testid*="powered"]',
                    '[class*="branding"]',
                    '[class*="powered"]',
                    '[class*="elevenlabs"]',
                    'a[href*="elevenlabs"]',
                    '*[aria-label*="Powered by"]',
                    '*[aria-label*="ElevenLabs"]',
                    '.whitespace-nowrap',
                    'a.underline',
                    '[class*="opacity-30"]'
                ];

                brandingSelectors.forEach(selector => {
                    const elements = shadowRoot.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important;';
                        el.remove();
                    });
                });

                // Suche auch nach Text-Inhalten mit "Powered by" oder "ElevenLabs"
                const allElements = shadowRoot.querySelectorAll('*');
                allElements.forEach(el => {
                    // Prüfe auf verschachtelte Shadow Roots
                    if (el.shadowRoot) {
                        hideBrandingInShadowRoot(el.shadowRoot);
                    }
                    // Prüfe Text-Inhalt
                    if (el.textContent && (el.textContent.includes('Powered by') || el.textContent.includes('ElevenLabs') || el.textContent.includes('Agents'))) {
                        if (el.tagName === 'A' || el.closest('a')) {
                            const linkEl = el.tagName === 'A' ? el : el.closest('a');
                            if (linkEl && linkEl.href && linkEl.href.includes('elevenlabs')) {
                                linkEl.style.cssText = 'display: none !important; visibility: hidden !important;';
                                linkEl.remove();
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.debug('Branding konnte nicht versteckt werden:', error);
        }
    }

    /**
     * Rekursiv in Shadow Roots nach Branding suchen
     */
    function hideBrandingInShadowRoot(shadowRoot) {
        try {
            const brandingSelectors = [
                '[data-testid*="branding"]',
                '[data-testid*="powered"]',
                '[class*="branding"]',
                '[class*="powered"]',
                'a[href*="elevenlabs"]',
                '.whitespace-nowrap',
                'a.underline',
                '[class*="opacity-30"]'
            ];

            brandingSelectors.forEach(selector => {
                const elements = shadowRoot.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important;';
                    el.remove();
                });
            });

            // Weiter in verschachtelten Shadow Roots suchen und Text-Inhalte prüfen
            const allElements = shadowRoot.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.shadowRoot) {
                    hideBrandingInShadowRoot(el.shadowRoot);
                }
                // Entferne Links zu ElevenLabs basierend auf Inhalt
                if (el.tagName === 'A' && el.href && el.href.includes('elevenlabs')) {
                    el.remove();
                }
            });
        } catch (error) {
            console.debug('Nested shadow root branding verstecken fehlgeschlagen:', error);
        }
    }

    /**
     * Überwache Shadow DOM kontinuierlich mit MutationObserver
     */
    function watchForBranding(widgetElement) {
        if (!widgetElement) return;

        // Kontinuierlich prüfen mit Interval
        const brandingWatcher = setInterval(() => {
            hideBranding(widgetElement);
        }, 500);

        // MutationObserver für Shadow DOM
        try {
            const shadowRoot = widgetElement.shadowRoot;
            if (shadowRoot) {
                const observer = new MutationObserver(() => {
                    hideBranding(widgetElement);
                });

                observer.observe(shadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });

                console.log('MutationObserver für Branding aktiv');
            }
        } catch (error) {
            console.debug('MutationObserver konnte nicht gestartet werden:', error);
        }

        // Nach 30 Sekunden Interval stoppen (sollte dann versteckt sein)
        setTimeout(() => {
            clearInterval(brandingWatcher);
            console.log('Branding-Watcher gestoppt');
        }, 30000);
    }

    /**
     * Initialisiere ElevenLabs Widget mit signierter URL
     */
    async function initializeWidget() {
        try {
            // Warte bis DOM geladen ist
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Hole Widget Element
            const widgetElement = document.querySelector('elevenlabs-convai');

            if (!widgetElement) {
                console.warn('ElevenLabs Widget Element nicht gefunden');
                return;
            }

            // Hole signierte URL vom Backend
            console.log('Lade ElevenLabs Token...');
            const signedUrl = await getSignedUrl();
            console.log('ElevenLabs Token erfolgreich geladen');

            // Setze signierte URL als Attribut
            widgetElement.setAttribute('signed-url', signedUrl);

            // Entferne agent-id Attribut (wird nicht mehr benötigt bei signed mode)
            widgetElement.removeAttribute('agent-id');

            console.log('ElevenLabs Widget erfolgreich initialisiert');

            // Starte kontinuierliche Branding-Überwachung
            watchForBranding(widgetElement);

        } catch (error) {
            console.error('ElevenLabs Widget Initialisierung fehlgeschlagen:', error);

            // Optional: Widget verstecken bei Fehler
            const widgetElement = document.querySelector('elevenlabs-convai');
            if (widgetElement) {
                widgetElement.style.display = 'none';
            }

            // Optional: Error-Meldung anzeigen (nur für Debugging)
            // alert('Voice Agent konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
        }
    }

    // Auto-Initialize
    initializeWidget();

})();
