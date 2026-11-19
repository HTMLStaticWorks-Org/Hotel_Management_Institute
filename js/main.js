/**
 * HMI 2026 - Main Interaction Script
 * Handles Theme switching (Light/Dark), RTL switching, Sticky header,
 * Mobile drawer navigation, and UI interactions.
 */

(function () {
  'use strict';

  // --- THEME & RTL STATE MANAGEMENT ---
  const THEME_KEY = 'hmi_theme';
  const DIR_KEY = 'hmi_dir';

  function applySavedPreferences() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    const savedDir = localStorage.getItem(DIR_KEY) || 'ltr';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    document.documentElement.setAttribute('dir', savedDir);
    updateThemeIcons(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcons(newTheme);
    showToast(newTheme === 'dark' ? 'Dark Mode Activated' : 'Light Mode Activated');
  }

  function toggleRTL() {
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', newDir);
    localStorage.setItem(DIR_KEY, newDir);
    showToast(newDir === 'rtl' ? 'RTL Layout Activated (العربية / Hebrew)' : 'LTR Layout Activated');
  }

  function updateThemeIcons(theme) {
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' 
        ? '<i data-lucide="sun"></i>' 
        : '<i data-lucide="moon"></i>';
    });
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('hmi-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'hmi-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'luxury-toast';
    toast.style.cssText = `
      background: var(--bg-surface, #17191C);
      color: var(--text-main, #fff);
      border: 1px solid var(--color-champagne, #A77B50);
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      font-size: 0.88rem;
      font-weight: 500;
      opacity: 0;
      transform: translateY(12px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    toast.innerHTML = `<span style="color:var(--color-champagne)">✦</span> ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Window export for global usage
  window.HMI = {
    toggleTheme,
    toggleRTL,
    showToast
  };

  // --- INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    applySavedPreferences();

    // Attach Theme & RTL Toggles
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleRTL();
      });
    });

    // Sticky Header Scroll Listener
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
      });
    }

    // Mobile Navigation Drawer Toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerBackdrop = document.querySelector('.drawer-backdrop');
    const drawerClose = document.querySelector('.drawer-close');

    function openMobileDrawer() {
      if (mobileDrawer) mobileDrawer.classList.add('active');
      if (drawerBackdrop) drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (drawerBackdrop) drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeMobileDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

    // Mobile Drawer Dropdowns
    document.querySelectorAll('.drawer-dropdown-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = btn.closest('.drawer-dropdown');
        if (parent) {
          parent.classList.toggle('open');
          const icon = btn.querySelector('[data-lucide="chevron-down"]');
          if (icon) {
            icon.style.transform = parent.classList.contains('open') ? 'rotate(180deg)' : '';
          }
        }
      });
    });

    // Auto-close drawer on link click
    document.querySelectorAll('.drawer-dropdown-link, .drawer-nav-link:not(.drawer-dropdown-btn)').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    // Animate Numeric Counters
    const counterElements = document.querySelectorAll('[data-counter]');
    if ('IntersectionObserver' in window && counterElements.length > 0) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const targetVal = parseFloat(target.getAttribute('data-counter'));
            const suffix = target.getAttribute('data-suffix') || '';
            let current = 0;
            const duration = 1800;
            const steps = 60;
            const increment = targetVal / steps;
            const stepTime = duration / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= targetVal) {
                target.innerText = (Number.isInteger(targetVal) ? targetVal : targetVal.toFixed(1)) + suffix;
                clearInterval(timer);
              } else {
                target.innerText = (Number.isInteger(targetVal) ? Math.floor(current) : current.toFixed(1)) + suffix;
              }
            }, stepTime);

            observer.unobserve(target);
          }
        });
      }, { threshold: 0.3 });

      counterElements.forEach(el => counterObserver.observe(el));
    }

    // Back to Top Button Controller
    setupBackToTop();

    // Lucide Icons init
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // --- BACK TO TOP COMPONENT ---
  function setupBackToTop() {
    let btn = document.getElementById('backToTopBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'backToTopBtn';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to Top');
      btn.setAttribute('title', 'Back to Top');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 280) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
