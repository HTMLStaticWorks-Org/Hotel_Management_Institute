/**
 * HMI 2026 - Student Dashboard Engine
 * Handles session protection, dynamic profile injection, sidebar collapse,
 * tab transitions, assignment submission, fee synchronization.
 */

(function () {
  'use strict';

  let currentStudent = null;

  function initDashboard() {
    // Check authentication
    if (!window.HMIAuth) return;
    currentStudent = window.HMIAuth.requireAuth();
    if (!currentStudent) return;

    // Render Student Details across Dashboard
    renderStudentHeader();
    setupSidebarToggle();
    setupTabNavigation();
    setupAssignmentSubmission();
    loadStudentPayments();
    
    // Lucide icons
    if (window.lucide) window.lucide.createIcons();
  }

  function renderStudentHeader() {
    // Topbar & sidebar user elements
    document.querySelectorAll('.student-display-name').forEach(el => el.textContent = currentStudent.name);
    document.querySelectorAll('.student-display-id').forEach(el => el.textContent = currentStudent.id);
    document.querySelectorAll('.student-display-course').forEach(el => el.textContent = currentStudent.course);
    document.querySelectorAll('.student-display-avatar').forEach(el => el.textContent = currentStudent.avatar || 'ST');
    document.querySelectorAll('.student-display-gpa').forEach(el => el.textContent = currentStudent.gpa || '3.92');
    document.querySelectorAll('.student-display-attendance').forEach(el => el.textContent = currentStudent.attendance || '96%');
    
    if (currentStudent.fees) {
      document.querySelectorAll('.student-display-fee-balance').forEach(el => el.textContent = `$${currentStudent.fees.balance.toLocaleString()}`);
      document.querySelectorAll('.student-display-fee-paid').forEach(el => el.textContent = `$${currentStudent.fees.paid.toLocaleString()}`);
      document.querySelectorAll('.student-display-fee-total').forEach(el => el.textContent = `$${currentStudent.fees.total.toLocaleString()}`);
    }
  }

  // Sidebar Collapse Toggle
  function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const layout = document.querySelector('.dashboard-layout');
    const sidebar = document.querySelector('.dashboard-sidebar');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          sidebar.classList.toggle('mobile-open');
        } else {
          sidebar.classList.toggle('collapsed');
          layout.classList.toggle('sidebar-collapsed');
        }
      });
    }

    // Close mobile sidebar on backdrop click or link click on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  }

  // Tab switching
  function setupTabNavigation() {
    const navItems = document.querySelectorAll('.dashboard-sidebar .sidebar-nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane-custom');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-tab');

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        tabPanes.forEach(pane => {
          if (pane.id === targetTab) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });

        // Close mobile drawer if on mobile
        if (window.innerWidth <= 992) {
          const sidebar = document.querySelector('.dashboard-sidebar');
          if (sidebar) sidebar.classList.remove('mobile-open');
        }

        // Re-run icons
        if (window.lucide) window.lucide.createIcons();
      });
    });
  }

  // Mock assignment submission
  function setupAssignmentSubmission() {
    const submitBtn = document.getElementById('btnSubmitAssignmentDemo');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('assignmentFileInput');
        const feedbackEl = document.getElementById('assignmentSuccessAlert');

        if (!fileInput || !fileInput.files.length) {
          alert('Please select an assignment document (PDF/DOCX) to upload.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading & Verifying...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="check-circle" class="me-2"></i>Uploaded Successfully';
          if (feedbackEl) feedbackEl.classList.remove('d-none');
          if (window.HMI) window.HMI.showToast('Assignment submitted to Academic Portal!');

          if (typeof confetti === 'function') {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          }
          if (window.lucide) window.lucide.createIcons();
        }, 1200);
      });
    }
  }

  // Load student payments in dashboard fee tab
  function loadStudentPayments() {
    const tbody = document.getElementById('dashPaymentHistoryBody');
    if (!tbody) return;

    const history = JSON.parse(localStorage.getItem('hmi_fee_payments_history') || '[]');
    const studentPayments = history.filter(p => p.studentId.toLowerCase() === currentStudent.id.toLowerCase());

    if (studentPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">No online payments logged yet. Use "Pay Fees" tab to make a payment.</td></tr>`;
      return;
    }

    tbody.innerHTML = studentPayments.map(p => `
      <tr>
        <td class="font-monospace fw-semibold">${p.txId}</td>
        <td>${p.date}</td>
        <td>${p.category}</td>
        <td class="fw-bold text-success">$${p.amount.toLocaleString()}</td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle">Success</span></td>
      </tr>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', initDashboard);
})();
