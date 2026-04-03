// no-js Guard entfernen – verhindert FOUC (scroll-reveal opacity:0 vor JS-Start)
document.body.classList.remove('no-js');

// HINWEIS: Turnstile Callback (window.onTurnstileSuccess) und window.turnstileToken
// werden inline im HTML definiert, damit sie VOR dem Turnstile Script verfügbar sind.

// Message Modal System
function showMessage(type, message) {
    const modal = document.getElementById('messageModal');
    const title = modal.querySelector('.modal-title');
    const messageText = modal.querySelector('.modal-message');

    // Remove previous type classes
    modal.classList.remove('success', 'error');

    // Set type and content
    modal.classList.add(type);

    if (type === 'success') {
        title.textContent = 'Erfolg';
    } else if (type === 'error') {
        title.textContent = 'Fehler';
    }

    messageText.textContent = message;

    // Show modal
    modal.classList.add('is-visible');

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    const modal = document.getElementById('messageModal');
    modal.classList.remove('is-visible');
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('messageModal');
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close-btn');

    // Close on button click
    closeBtn.addEventListener('click', hideMessage);

    // Close on overlay click
    overlay.addEventListener('click', hideMessage);

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
            hideMessage();
        }
    });
});

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe all elements with scroll-reveal class when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => scrollObserver.observe(el));
});

// Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');

// Show/hide button based on scroll position
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Scroll to top when button is clicked
scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Close menu when clicking on navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
});

// All functionality after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close button handler
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Alternative: auch auf nav-close click reagieren
    const navClose = document.querySelector('.nav-close');
    if (navClose) {
        navClose.addEventListener('click', function(e) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Slider Functionality
    const cards = document.querySelectorAll('.step-card');
    const controlBtns = document.querySelectorAll('.control-btn');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    let currentStep = 1;
    let touchStartX = 0;
    let touchEndX = 0;

    // Function to show specific step
    function showStep(stepNumber) {
        cards.forEach(card => card.classList.remove('active'));
        controlBtns.forEach(btn => btn.classList.remove('active'));

        const activeCard = document.querySelector(`.step-card[data-step="${stepNumber}"]`);
        const activeBtn = document.querySelector(`.control-btn[data-step="${stepNumber}"]`);

        if (activeCard) activeCard.classList.add('active');
        if (activeBtn) activeBtn.classList.add('active');

        currentStep = stepNumber;
    }

    // Initialize with first step
    showStep(1);

    // Click handlers for control buttons
    controlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const step = parseInt(this.getAttribute('data-step'));
            showStep(step);
        });
    });

    // Touch/Swipe handlers for mobile
    if (sliderWrapper) {
        sliderWrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderWrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next step
                if (currentStep < 4) {
                    showStep(currentStep + 1);
                }
            } else {
                // Swipe right - previous step
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            }
        }
    }

    // Load CSRF Token
    fetch('/csrf-token.php')
        .then(response => response.json())
        .then(data => {
            const csrfInput = document.getElementById('csrf_token');
            if (csrfInput) {
                csrfInput.value = data.csrf_token;
            }
        })
        .catch(error => console.error('CSRF Token konnte nicht geladen werden:', error));

    // Contact Form Handling with AJAX
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form fields
            const vorname = document.getElementById('vorname');
            const email = document.getElementById('email');
            const nachricht = document.getElementById('nachricht');
            const herkunft = document.getElementById('herkunft');
            const datenschutz = document.getElementById('datenschutz');
            const submitButton = contactForm.querySelector('.btn-submit');

            let isValid = true;
            let errorMessage = '';

            // Validate Vorname (required)
            if (!vorname.value.trim()) {
                isValid = false;
                errorMessage += 'Bitte geben Sie Ihren Vornamen ein.\n';
                vorname.style.border = '2px solid #ff4444';
            } else {
                vorname.style.border = 'none';
            }

            // Validate Email (required and format)
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                isValid = false;
                errorMessage += 'Bitte geben Sie Ihre E-Mail-Adresse ein.\n';
                email.style.border = '2px solid #ff4444';
            } else if (!emailPattern.test(email.value.trim())) {
                isValid = false;
                errorMessage += 'Bitte geben Sie eine gültige E-Mail-Adresse ein.\n';
                email.style.border = '2px solid #ff4444';
            } else {
                email.style.border = 'none';
            }

            // Validate Nachricht (required)
            if (!nachricht.value.trim()) {
                isValid = false;
                errorMessage += 'Bitte geben Sie eine Nachricht ein.\n';
                nachricht.style.border = '2px solid #ff4444';
            } else {
                nachricht.style.border = 'none';
            }

            // Validate Datenschutz checkbox (required)
            if (!datenschutz.checked) {
                isValid = false;
                errorMessage += 'Bitte akzeptieren Sie die Datenschutzerklärung.\n';
            }

            // Validate Turnstile (required)
            if (!window.turnstileToken) {
                isValid = false;
                errorMessage += 'Bitte warten Sie, bis die Sicherheitsprüfung abgeschlossen ist, und versuchen Sie es erneut.\n';
                console.error('Turnstile Token fehlt. Widget geladen?', window.turnstile);
            }

            // Show error or submit
            if (!isValid) {
                showMessage('error', errorMessage.trim());
                return;
            }

            // Deaktiviere Submit-Button während des Sendens
            submitButton.disabled = true;
            submitButton.textContent = 'Wird gesendet...';

            // Sammle Formulardaten
            const formData = new FormData(contactForm);

            // Füge Turnstile Token hinzu
            formData.append('cf-turnstile-response', window.turnstileToken);

            // Sende Daten via AJAX
            fetch('send-mail.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('success', data.message);
                    contactForm.reset();
                    window.turnstileToken = null; // Reset Token für nächste Verwendung

                    // Turnstile Widget zurücksetzen, falls verfügbar
                    if (window.turnstile) {
                        turnstile.reset();
                    }
                } else {
                    showMessage('error', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('error', 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per E-Mail.');
            })
            .finally(() => {
                // Aktiviere Submit-Button wieder
                submitButton.disabled = false;
                submitButton.textContent = 'Senden';
            });
        });

        // Remove error styling on input
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.style.border = 'none';
            });
        });
    }
});

// ============================================
// COOKIE CONSENT BANNER - DSGVO Compliance
// ============================================
(function() {
    const COOKIE_KEY = 'ml_vision_cookie_consent';
    const COOKIE_VERSION = '1.0';

    // Cookie-Einstellungen Objekt
    const defaultSettings = {
        version: COOKIE_VERSION,
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: null
    };

    // DOM Elements
    let cookieBanner, settingsModal, analyticsCheckbox, marketingCheckbox;

    // Gespeicherte Einstellungen laden
    function loadCookieSettings() {
        try {
            const stored = localStorage.getItem(COOKIE_KEY);
            if (stored) {
                const settings = JSON.parse(stored);
                // Prüfe Version - falls geändert, erneut fragen
                if (settings.version === COOKIE_VERSION) {
                    return settings;
                }
            }
        } catch (e) {
            console.error('Fehler beim Laden der Cookie-Einstellungen:', e);
        }
        return null;
    }

    // Einstellungen speichern
    function saveCookieSettings(settings) {
        try {
            settings.timestamp = new Date().toISOString();
            settings.version = COOKIE_VERSION;
            localStorage.setItem(COOKIE_KEY, JSON.stringify(settings));
            console.log('Cookie-Einstellungen gespeichert:', settings);
        } catch (e) {
            console.error('Fehler beim Speichern der Cookie-Einstellungen:', e);
        }
    }

    // Banner anzeigen
    function showBanner() {
        if (cookieBanner) {
            cookieBanner.classList.add('is-visible');
            cookieBanner.classList.remove('is-hidden');
        }
    }

    // Banner verstecken
    function hideBanner() {
        if (cookieBanner) {
            cookieBanner.classList.remove('is-visible');
            cookieBanner.classList.add('is-hidden');
        }
    }

    // Settings Modal anzeigen
    function showSettingsModal() {
        if (settingsModal) {
            settingsModal.classList.add('is-visible');
        }
    }

    // Settings Modal verstecken
    function hideSettingsModal() {
        if (settingsModal) {
            settingsModal.classList.remove('is-visible');
        }
    }

    // Cookies basierend auf Einstellungen aktivieren/deaktivieren
    function applySettings(settings) {
        if (settings.analytics) {
            console.log('Analytics-Cookies aktiviert');
            // Contentsquare laden (nur einmal)
            if (!document.querySelector('script[src*="contentsquare.net/uxa"]')) {
                const csScript = document.createElement('script');
                csScript.src = 'https://t.contentsquare.net/uxa/dbd887ec42dfe.js';
                csScript.async = true;
                document.head.appendChild(csScript);
            }
        }

        if (settings.marketing) {
            console.log('Marketing-Cookies aktiviert');
        }
    }

    // Alle akzeptieren
    function acceptAll() {
        const settings = {
            ...defaultSettings,
            analytics: true,
            marketing: true
        };
        saveCookieSettings(settings);
        applySettings(settings);
        hideBanner();
    }

    // Nur notwendige akzeptieren
    function acceptNecessary() {
        const settings = {
            ...defaultSettings,
            analytics: false,
            marketing: false
        };
        saveCookieSettings(settings);
        applySettings(settings);
        hideBanner();
    }

    // Auswahl speichern
    function saveSelection() {
        const settings = {
            ...defaultSettings,
            analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
            marketing: marketingCheckbox ? marketingCheckbox.checked : false
        };
        saveCookieSettings(settings);
        applySettings(settings);
        hideSettingsModal();
        hideBanner();
    }

    // Initialisierung
    function init() {
        // DOM Elemente holen
        cookieBanner = document.getElementById('cookieBanner');
        settingsModal = document.getElementById('cookieSettingsModal');
        analyticsCheckbox = document.getElementById('cookieAnalytics');
        marketingCheckbox = document.getElementById('cookieMarketing');

        if (!cookieBanner) {
            console.warn('Cookie-Banner Element nicht gefunden');
            return;
        }

        // Prüfe ob bereits Einstellungen gespeichert sind
        const existingSettings = loadCookieSettings();

        if (existingSettings) {
            // Einstellungen bereits vorhanden - anwenden
            applySettings(existingSettings);
            // Banner nicht anzeigen
        } else {
            // Keine Einstellungen - Banner anzeigen
            // Kleine Verzögerung für bessere UX
            setTimeout(showBanner, 500);
        }

        // Event Listeners
        const acceptAllBtn = document.getElementById('acceptAll');
        const acceptNecessaryBtn = document.getElementById('acceptNecessary');
        const cookieSettingsBtn = document.getElementById('cookieSettings');
        const saveSettingsBtn = document.getElementById('saveSettings');
        const closeSettingsBtn = document.getElementById('closeSettings');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', acceptAll);
        }

        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', acceptNecessary);
        }

        if (cookieSettingsBtn) {
            cookieSettingsBtn.addEventListener('click', showSettingsModal);
        }

        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSelection);
        }

        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', hideSettingsModal);
        }

        // Modal schließen bei Klick außerhalb
        if (settingsModal) {
            settingsModal.addEventListener('click', function(e) {
                if (e.target === settingsModal) {
                    hideSettingsModal();
                }
            });
        }

        // ESC-Taste schließt Modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('is-visible')) {
                hideSettingsModal();
            }
        });
    }

    // Bei DOM Ready initialisieren
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Öffentliche API für manuelle Steuerung (z.B. für Footer-Link "Cookie-Einstellungen")
    window.CookieConsent = {
        show: showBanner,
        showSettings: showSettingsModal,
        reset: function() {
            localStorage.removeItem(COOKIE_KEY);
            showBanner();
        }
    };
})();

// ============================================
// TRUST BAR COUNTER ANIMATION
// ============================================
(function() {
    let hasAnimated = false;

    function animateCounter(element) {
        const target = parseFloat(element.dataset.count);
        const duration = 2000;
        const start = performance.now();
        const isDecimal = target % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smoother animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            const currentValue = easeOutQuart * target;

            if (isDecimal) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString('de-DE');
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Finale Werte setzen
                if (isDecimal) {
                    element.textContent = target.toFixed(1);
                } else {
                    element.textContent = target.toLocaleString('de-DE');
                }
            }
        }

        requestAnimationFrame(update);
    }

    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;

                const counters = document.querySelectorAll('.trust-number[data-count]');
                counters.forEach((counter, index) => {
                    // Kleine Verzögerung zwischen den Countern für besseren Effekt
                    setTimeout(() => {
                        animateCounter(counter);
                    }, index * 150);
                });

                // Observer entfernen nach Animation
                observer.unobserve(entry.target);
            }
        });
    }

    function init() {
        const trustBar = document.querySelector('.trust-bar');

        if (!trustBar) {
            return;
        }

        const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.3,
            rootMargin: '0px'
        });

        observer.observe(trustBar);
    }

    // Bei DOM Ready initialisieren
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// ============================================
// STICKY MOBILE CTA
// ============================================
(function() {
    const stickyCtA = document.getElementById('mobileStickyCtA');
    if (!stickyCtA) return;

    const heroSection = document.querySelector('.hero') || document.querySelector('header');
    const contactSection = document.getElementById('kontakt');

    function updateStickyVisibility() {
        if (!heroSection) return;

        const cookieBanner = document.getElementById('cookieBanner');
        const cookieBannerVisible = cookieBanner && cookieBanner.classList.contains('is-visible');

        // Verstecken: noch im Hero-Bereich, Cookie-Banner sichtbar, oder im Kontakt-Bereich
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const contactTop = contactSection ? contactSection.getBoundingClientRect().top : Infinity;
        const nearContact = contactTop < window.innerHeight * 1.5;

        if (heroBottom > 0 || cookieBannerVisible || nearContact) {
            stickyCtA.style.transform = 'translateY(100%)';
        } else {
            stickyCtA.style.transform = 'translateY(0)';
        }
    }

    // Initial versteckt (slidet rein nach Scroll)
    stickyCtA.style.transform = 'translateY(100%)';
    stickyCtA.style.transition = 'transform 0.3s ease';

    window.addEventListener('scroll', updateStickyVisibility, { passive: true });

    // Auch aktualisieren wenn Cookie-Banner Status sich ändert
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        const observer = new MutationObserver(updateStickyVisibility);
        observer.observe(cookieBanner, { attributes: true, attributeFilter: ['class'] });
    }
})();

/* ============================================================
   ML VISION – 3D REDESIGN ANIMATIONS
   ============================================================ */

/* ── 3D CARD TILT ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    function attachTilt(selector, intensity) {
        document.querySelectorAll(selector).forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const rx = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * -intensity;
                const ry = ((e.clientX - rect.left - rect.width  / 2) / rect.width)  *  intensity;
                card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
                card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease';
                card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    attachTilt('.bento-card',    7);
    attachTilt('.testi-card',    5);
    attachTilt('.team-card',     4);
    attachTilt('.feature-card',  4);

    /* ── STAGGERED REVEAL ────────────────────────────────── */
    const staggerGroups = [
        { parent: '.bento-grid',          child: '.bento-card'    },
        { parent: '.testimonials-grid',   child: '.testi-card'    },
        { parent: '.team-grid',           child: '.team-card'     },
        { parent: '.features-grid',       child: '.feature-card'  },
        { parent: '.steps-grid',          child: '.step'          },
        { parent: '.faq-list',            child: '.faq-item'      },
    ];

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const kids = entry.target._staggerKids;
            if (!kids) return;
            kids.forEach((el, i) => {
                setTimeout(() => el.classList.add('revealed'), i * 100);
            });
            io.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    staggerGroups.forEach(({ parent, child }) => {
        const parentEl = document.querySelector(parent);
        if (!parentEl) return;
        const kids = Array.from(parentEl.querySelectorAll(child));
        kids.forEach(el => el.classList.add('scroll-reveal'));
        parentEl._staggerKids = kids;
        io.observe(parentEl);
    });

    /* ── NAV SCROLL EFFECT ───────────────────────────────── */
    const nav = document.getElementById('mainNav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.style.background = window.scrollY > 60
                ? 'rgba(5,10,20,0.95)'
                : 'rgba(5,10,20,0.8)';
        }, { passive: true });
    }
});

/* ── PROCESS STICKY SCROLL ───────────────────────────────── */
(function() {
    const container = document.getElementById('processScrollContainer');
    if (!container) return;

    const psNumEl    = document.getElementById('psNum');
    const psCards    = document.querySelectorAll('.ps-card');
    const psNavItems = document.querySelectorAll('.psnav-item');
    const psFill     = document.getElementById('psProgressFill');
    const psHint     = document.getElementById('psScrollHint');
    const stepNums   = ['01', '02', '03', '04'];
    let lastStep = -1;

    function update() {
        if (window.innerWidth <= 1100) return;

        const rect       = container.getBoundingClientRect();
        const totalH     = container.offsetHeight;
        const vh         = window.innerHeight;
        const raw        = -rect.top / (totalH - vh);
        const progress   = Math.max(0, Math.min(1, raw));
        const activeStep = Math.min(3, Math.floor(progress * 4));

        // Progress bar
        psFill.style.width = (progress * 100) + '%';

        // Scroll hint fades out after first step
        if (psHint) psHint.style.opacity = progress > 0.08 ? '0' : '1';

        if (activeStep === lastStep) return;
        lastStep = activeStep;

        // Number flip animation
        psNumEl.classList.add('changing');
        setTimeout(function() {
            psNumEl.textContent = stepNums[activeStep];
            psNumEl.classList.remove('changing');
        }, 220);

        // Cards
        psCards.forEach(function(card, i) {
            card.classList.toggle('active', i === activeStep);
            card.classList.toggle('past',   i < activeStep);
        });

        // Nav items
        psNavItems.forEach(function(item, i) {
            item.classList.toggle('active', i === activeStep);
            item.classList.toggle('done',   i < activeStep);
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function() { lastStep = -1; update(); });
    update();
})();

// ── FAQ CONTAINER TOGGLE ─────────────────────────────────────────
(function() {
    var toggle = document.getElementById('faqToggle');
    var content = document.getElementById('faqContent');
    if (!toggle || !content) return;

    toggle.addEventListener('click', function() {
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        content.classList.toggle('is-open', !isOpen);
    });
})();

// ── STARFIELD ANIMATION ───────────────────────────────────────────
(function() {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [], shootingStars = [], animId = null;
    var w = 0, h = 0;

    function resize() {
        var section = canvas.parentElement;
        w = canvas.width = section.offsetWidth || 800;
        h = canvas.height = section.offsetHeight || 600;
        stars = [];
        var count = Math.min(Math.floor(w * h / 4500), 280);
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.5 + 0.2,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.022 + 0.005,
                brightness: Math.random() * 0.55 + 0.25
            });
        }
    }

    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * w * 0.75,
            y: Math.random() * h * 0.55,
            vx: Math.random() * 7 + 5,
            vy: Math.random() * 4 + 2,
            len: Math.random() * 110 + 55,
            life: 1.0,
            decay: Math.random() * 0.022 + 0.016
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Twinkling stars
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.phase += s.speed;
            var alpha = s.brightness * (0.4 + 0.6 * Math.sin(s.phase));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.fill();
        }

        // Spawn shooting stars randomly
        if (Math.random() < 0.004) spawnShootingStar();

        // Draw & update shooting stars
        for (var j = shootingStars.length - 1; j >= 0; j--) {
            var ss = shootingStars[j];
            var tailX = ss.x - ss.vx * (ss.len / (ss.vx + ss.vy));
            var tailY = ss.y - ss.vy * (ss.len / (ss.vx + ss.vy));
            var grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0, 'rgba(255,255,255,' + ss.life.toFixed(3) + ')');
            grad.addColorStop(0.35, 'rgba(4,169,212,' + (ss.life * 0.55).toFixed(3) + ')');
            grad.addColorStop(1, 'rgba(4,169,212,0)');
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.decay;
            if (ss.life <= 0 || ss.x > w + 60 || ss.y > h + 60) {
                shootingStars.splice(j, 1);
            }
        }

        animId = requestAnimationFrame(draw);
    }

    // Pause animation when section is not visible (performance)
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) {
                if (!animId) { resize(); draw(); }
            } else {
                if (animId) { cancelAnimationFrame(animId); animId = null; }
            }
        });
    }, { threshold: 0.05 });
    observer.observe(canvas.parentElement);

    window.addEventListener('resize', function() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        resize();
        draw();
    });
})();

/* ── APPLE CARD GLOW ────────────────────────────────────────────── */
(function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.apple-glow').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
            const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
            card.style.setProperty('--mx', x);
            card.style.setProperty('--my', y);
        });
    });
})();

/* ── GAMMA ANALYSE FORM ─────────────────────────────────────────── */
(function () {
    const WEBHOOK_URL = 'https://n8n.vision-ml.de/webhook/gamma-lead';

    document.addEventListener('DOMContentLoaded', function () {
        const ctaBtn      = document.getElementById('ctaAnalyseBtn');
        const formWrapper = document.getElementById('gammaFormWrapper');
        const gammaForm   = document.getElementById('gammaForm');
        const submitBtn   = document.getElementById('gammaSubmitBtn');
        const successEl   = document.getElementById('gammaSuccess');
        const errorEl     = document.getElementById('gammaError');
        const errorMsgEl  = document.getElementById('gammaErrorMsg');

        if (!ctaBtn || !formWrapper) return;

        // Toggle form open/close
        ctaBtn.addEventListener('click', function () {
            const isOpen = ctaBtn.classList.contains('open');
            ctaBtn.classList.toggle('open');
            formWrapper.classList.toggle('open');
            formWrapper.setAttribute('aria-hidden', String(isOpen));

            if (!isOpen) {
                // Öffnen → Banner-Section sauber von oben sichtbar machen
                setTimeout(function () {
                    document.querySelector('.cta-banner').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            }
        });

        // Form submit
        gammaForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Zeitfresser-Validierung
            const zeitfresser = Array.from(
                gammaForm.querySelectorAll('input[name="zeitfresser"]:checked')
            ).map(function (el) { return el.value; });

            if (zeitfresser.length === 0) {
                errorMsgEl.textContent = 'Bitte wählen Sie mindestens einen Zeitfresser aus.';
                errorEl.removeAttribute('hidden');
                errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                return;
            }

            // Fehler ausblenden, Loading-State
            errorEl.setAttribute('hidden', '');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            successEl.setAttribute('hidden', '');
            errorEl.setAttribute('hidden', '');

            const payload = {
                vorname:    document.getElementById('gf-vorname').value.trim(),
                email:      document.getElementById('gf-email').value.trim(),
                branche:    document.getElementById('gf-branche').value,
                groesse:    document.getElementById('gf-groesse').value,
                zeitfresser: zeitfresser
            };

            try {
                const res = await fetch(WEBHOOK_URL, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload)
                });

                if (!res.ok) throw new Error('HTTP ' + res.status);

                // Erfolg — Form schließen, Banner-Inhalt ausblenden, Success zentriert zeigen
                gammaFormWrapper.classList.remove('open');
                document.querySelector('.cta-banner h2').style.display = 'none';
                document.querySelector('.cta-banner .cta-content > p').style.display = 'none';
                document.getElementById('ctaAnalyseBtn').style.display = 'none';
                successEl.removeAttribute('hidden');
                if (typeof lucide !== 'undefined') lucide.createIcons();

            } catch (err) {
                errorMsgEl.textContent = 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt: kontakt@vision-ml.de';
                errorEl.removeAttribute('hidden');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    });
})();
