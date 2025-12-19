// Cloudflare Turnstile Token
let turnstileToken = null;

// Callback function for successful Turnstile validation
// WICHTIG: Muss als globale Funktion definiert sein für Turnstile API
window.onTurnstileSuccess = function(token) {
    turnstileToken = token;
    console.log('Turnstile erfolgreich validiert');
}

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
        // Remove active class from all cards and buttons
        cards.forEach(card => card.classList.remove('active'));
        controlBtns.forEach(btn => btn.classList.remove('active'));

        // Add active class to current step
        const activeCard = document.querySelector(`.step-card[data-step="${stepNumber}"]`);
        const activeBtn = document.querySelector(`.control-btn[data-step="${stepNumber}"]`);

        if (activeCard) activeCard.classList.add('active');
        if (activeBtn) activeBtn.classList.add('active');

        // Remove existing spacers
        document.querySelectorAll('.card-spacer').forEach(spacer => spacer.remove());

        // Always show 3 cards: previous, current, next
        const cardArray = Array.from(cards);

        // Hide all cards first and reset order
        cardArray.forEach(card => {
            card.style.display = 'none';
        });

        // Calculate which cards to show
        if (stepNumber === 1) {
            // For step 1: spacer, card 1 (active), card 2
            const spacer = document.createElement('div');
            spacer.className = 'card-spacer';
            sliderWrapper.prepend(spacer);

            cardArray[0].style.display = 'flex';
            cardArray[1].style.display = 'flex';
        } else if (stepNumber === 2) {
            // For step 2: card 1, card 2 (active), card 3
            cardArray[0].style.display = 'flex';
            cardArray[1].style.display = 'flex';
            cardArray[2].style.display = 'flex';
        } else if (stepNumber === 3) {
            // For step 3: card 2, card 3 (active), card 4
            cardArray[1].style.display = 'flex';
            cardArray[2].style.display = 'flex';
            cardArray[3].style.display = 'flex';
        } else if (stepNumber === 4) {
            // For step 4: card 3, card 4 (active), spacer
            cardArray[2].style.display = 'flex';
            cardArray[3].style.display = 'flex';

            const spacer = document.createElement('div');
            spacer.className = 'card-spacer';
            sliderWrapper.append(spacer);
        }

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
            const submitButton = contactForm.querySelector('.submit-button');

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
            if (!turnstileToken) {
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
            formData.append('cf-turnstile-response', turnstileToken);

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
                    turnstileToken = null; // Reset Token für nächste Verwendung

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
