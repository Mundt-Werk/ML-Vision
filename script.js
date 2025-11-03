const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const contactForm = document.querySelector('.contact-form');
const feedback = document.querySelector('.form-feedback');
const currentYearEl = document.getElementById('current-year');

if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

if (contactForm && feedback) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const requiredFields = ['first-name', 'last-name', 'email', 'message', 'gdpr'];
    const missingFields = requiredFields.filter((fieldName) => {
      if (fieldName === 'gdpr') {
        return !contactForm.elements.namedItem(fieldName)?.checked;
      }
      const field = contactForm.elements.namedItem(fieldName);
      return !field || !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) || field.value.trim() === '';
    });

    const emailValue = formData.get('email');
    const emailIsValid = typeof emailValue === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

    if (missingFields.length > 0) {
      feedback.textContent = 'Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Zustimmung.';
      feedback.style.color = '#f97316';
      return;
    }

    if (!emailIsValid) {
      feedback.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      feedback.style.color = '#f97316';
      return;
    }

    feedback.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich übermittelt.';
    feedback.style.color = '#22c55e';
    contactForm.reset();
  });
}
