/**
 * Sidebar Component
 * Handles sidebar toggle, mobile navigation, and collapse/expand
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

    // Inject collapse button
    this._initCollapseBtn();

    // Restore saved state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
      this._updateCollapseBtn(true);
    }
  }

  _initCollapseBtn() {
    const btn = document.createElement('button');
    btn.className = 'sidebar-collapse-btn';
    btn.title = 'Sidebar einklappen';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>`;
    btn.addEventListener('click', () => this.toggleCollapse());
    this.sidebar.insertBefore(btn, this.sidebar.querySelector('.sidebar-footer'));
  }

  _updateCollapseBtn(collapsed) {
    const btn = this.sidebar.querySelector('.sidebar-collapse-btn');
    if (!btn) return;
    if (collapsed) {
      btn.title = 'Sidebar ausklappen';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>`;
    } else {
      btn.title = 'Sidebar einklappen';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>`;
    }
  }

  toggleCollapse() {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed);
    this._updateCollapseBtn(collapsed);
  }

  open() {
    this.sidebar.classList.add('active');
  }

  close() {
    this.sidebar.classList.remove('active');
  }
}

// Global function for inline onclick handlers (mobile hamburger)
window.toggleSidebar = function() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
};
