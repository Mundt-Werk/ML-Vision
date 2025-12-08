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
