/**
 * Modal Component
 * Handles alert and confirm modals
 */

export class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.init();
  }

  init() {
    // Close modal when clicking outside
    document.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });
  }

  show() {
    this.modal.classList.add('active');
  }

  close() {
    this.modal.classList.remove('active');
  }

  isOpen() {
    return this.modal.classList.contains('active');
  }
}

// Alert Modal
let alertModal = null;

export function showAlert(message, title = 'Hinweis') {
  if (!alertModal) {
    alertModal = new Modal('alertModal');
  }

  document.getElementById('alertTitle').textContent = title;
  document.getElementById('alertMessage').textContent = message;
  alertModal.show();
}

export function closeAlertModal() {
  if (alertModal) {
    alertModal.close();
  }
}

// Confirm Modal
let confirmModal = null;
let confirmCallback = null;

export function showConfirm(message, title = 'Bestätigung') {
  return new Promise((resolve) => {
    if (!confirmModal) {
      confirmModal = new Modal('confirmModal');
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmModal.show();
    confirmCallback = resolve;
  });
}

export function closeConfirmModal(confirmed) {
  if (confirmModal) {
    confirmModal.close();
  }
  if (confirmCallback) {
    confirmCallback(confirmed);
    confirmCallback = null;
  }
}

// Global functions for inline onclick handlers
window.showAlert = showAlert;
window.closeAlertModal = closeAlertModal;
window.showConfirm = showConfirm;
window.closeConfirmModal = closeConfirmModal;
