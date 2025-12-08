/**
 * Sidebar Component
 * Handles sidebar toggle and mobile navigation
 */

export class Sidebar {
  constructor(sidebarId = 'sidebar') {
    this.sidebar = document.getElementById(sidebarId);
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.init();
  }

  init() {
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (event) => {
      if (window.innerWidth <= 768) {
        if (!this.sidebar.contains(event.target) && !this.toggle.contains(event.target)) {
          this.close();
        }
      }
    });
  }

  toggle() {
    this.sidebar.classList.toggle('active');
  }

  open() {
    this.sidebar.classList.add('active');
  }

  close() {
    this.sidebar.classList.remove('active');
  }
}

// Global function for inline onclick handlers
window.toggleSidebar = function() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
};
