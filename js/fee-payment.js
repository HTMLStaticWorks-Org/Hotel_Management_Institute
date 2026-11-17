/**
 * HMI 2026 - Fee Payment Processing Engine
 * Dynamic Student lookup, Fee breakdown calculation, simulated transaction,
 * Receipt rendering & print/download feature.
 */

(function () {
  'use strict';

  const PAYMENTS_KEY = 'hmi_fee_payments_history';

  const sampleFeeDirectory = {
    'HMI2026': {
      id: 'HMI2026',
      name: 'Alexander Sterling',
      course: 'B.Sc. International Hotel Management',
      semester: 'Semester IV',
      totalFee: 18500,
      paidAmount: 12500,
      balance: 6000
    },
    'HMI-CUL-104': {
      id: 'HMI-CUL-104',
      name: 'Elena Rostova',
      course: 'Diploma in French Culinary Arts & Patisserie',
      semester: 'Semester II',
      totalFee: 14200,
      paidAmount: 9200,
      balance: 5000
    },
    'HMI-FOB-209': {
      id: 'HMI-FOB-209',
      name: 'Marcus Vance',
      course: 'Executive Master in Luxury Hospitality & Wine',
      semester: 'Semester III',
      totalFee: 22000,
      paidAmount: 22000,
      balance: 0
    }
  };

  // Initialize or fetch student DB
  function getStudentFeeInfo(studentId) {
    const localStudents = JSON.parse(localStorage.getItem('hmi_students_db') || '[]');
    const found = localStudents.find(s => s.id.toLowerCase() === studentId.toLowerCase());
    if (found) {
      return {
        id: found.id,
        name: found.name,
        course: found.course,
        semester: found.semester || 'Semester IV',
        totalFee: found.fees ? found.fees.total : 18500,
        paidAmount: found.fees ? found.fees.paid : 12500,
        balance: found.fees ? found.fees.balance : 6000
      };
    }
    return sampleFeeDirectory[studentId.toUpperCase()] || null;
  }

  // Populate UI on Student Lookup
  function lookupStudent() {
    const input = document.getElementById('searchStudentId');
    const idVal = input ? input.value.trim() : '';
    const detailsContainer = document.getElementById('feeDetailsContainer');
    const notFoundEl = document.getElementById('studentNotFound');

    if (!idVal) {
      if (notFoundEl) {
        notFoundEl.textContent = 'Please enter a valid Student ID.';
        notFoundEl.classList.remove('d-none');
      }
      return;
    }

    const info = getStudentFeeInfo(idVal);
    if (!info) {
      if (notFoundEl) {
        notFoundEl.textContent = `No student record found for ID: ${idVal}. Try "HMI2026" or "HMI-CUL-104".`;
        notFoundEl.classList.remove('d-none');
      }
      if (detailsContainer) detailsContainer.classList.add('d-none');
      return;
    }

    if (notFoundEl) notFoundEl.classList.add('d-none');
    if (detailsContainer) detailsContainer.classList.remove('d-none');

    // Fill elements
    document.getElementById('feeStudentName').textContent = info.name;
    document.getElementById('feeStudentID').textContent = info.id;
    document.getElementById('feeStudentCourse').textContent = info.course;
    document.getElementById('feeStudentSemester').textContent = info.semester;
    
    document.getElementById('valTotalFee').textContent = `$${info.totalFee.toLocaleString()}`;
    document.getElementById('valPaidFee').textContent = `$${info.paidAmount.toLocaleString()}`;
    document.getElementById('valBalanceFee').textContent = `$${info.balance.toLocaleString()}`;

    // Default amount input
    const payAmountInput = document.getElementById('customPayAmount');
    if (payAmountInput) {
      payAmountInput.value = info.balance > 0 ? info.balance : 0;
      payAmountInput.max = info.balance;
    }

    // Update active current selected student
    window.currentPayingStudent = info;
  }

  // Handle simulated Payment submission
  function processPayment(e) {
    e.preventDefault();
    const student = window.currentPayingStudent;
    if (!student) {
      alert('Please lookup a valid Student ID first.');
      return;
    }

    const payAmountInput = document.getElementById('customPayAmount');
    const amountToPay = parseFloat(payAmountInput.value);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const categorySelect = document.getElementById('feeCategorySelect');
    const category = categorySelect ? categorySelect.value : 'Tuition & Academic Fees';
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Credit / Debit Card';

    const btn = document.getElementById('btnSubmitPayment');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Securing Transaction...';
    }

    setTimeout(() => {
      // Generate transaction
      const txId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Update student balance
      student.paidAmount += amountToPay;
      student.balance = Math.max(0, student.totalFee - student.paidAmount);

      // Save to localStorage student DB
      const localStudents = JSON.parse(localStorage.getItem('hmi_students_db') || '[]');
      const idx = localStudents.findIndex(s => s.id.toLowerCase() === student.id.toLowerCase());
      if (idx !== -1) {
        localStudents[idx].fees = {
          total: student.totalFee,
          paid: student.paidAmount,
          balance: student.balance
        };
        localStorage.setItem('hmi_students_db', JSON.stringify(localStudents));
      }

      // Record transaction
      const history = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
      const paymentRecord = {
        txId,
        studentId: student.id,
        studentName: student.name,
        course: student.course,
        category,
        amount: amountToPay,
        method,
        date,
        status: 'Success'
      };
      history.unshift(paymentRecord);
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(history));

      // Reset button
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="lock" class="me-2"></i>Authorize Payment Now';
        if (window.lucide) window.lucide.createIcons();
      }

      // Show receipt modal
      populateReceipt(paymentRecord, student);
      const receiptModalEl = document.getElementById('receiptModal');
      if (receiptModalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(receiptModalEl);
        modal.show();
      }

      // Confetti celebration
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Update UI numbers
      lookupStudent();
      renderPaymentHistoryTable();
      if (window.HMI) window.HMI.showToast(`Payment of $${amountToPay.toLocaleString()} processed successfully!`);
    }, 1200);
  }

  // Populate Receipt
  function populateReceipt(record, student) {
    document.getElementById('receiptTxId').textContent = record.txId;
    document.getElementById('receiptDate').textContent = record.date;
    document.getElementById('receiptStudentName').textContent = record.studentName;
    document.getElementById('receiptStudentId').textContent = record.studentId;
    document.getElementById('receiptCourse').textContent = record.course;
    document.getElementById('receiptCategory').textContent = record.category;
    document.getElementById('receiptMethod').textContent = record.method;
    document.getElementById('receiptAmount').textContent = `$${record.amount.toLocaleString()}`;
    document.getElementById('receiptRemainingBalance').textContent = `$${student.balance.toLocaleString()}`;
  }

  // Render recent payment history
  function renderPaymentHistoryTable() {
    const tableBody = document.getElementById('paymentHistoryTableBody');
    if (!tableBody) return;

    const history = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No recent payment records found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = history.slice(0, 5).map(item => `
      <tr>
        <td class="fw-semibold font-monospace">${item.txId}</td>
        <td>${item.date}</td>
        <td>${item.category}</td>
        <td><span class="badge bg-light text-dark border">${item.method}</span></td>
        <td class="fw-bold text-success">+$${item.amount.toLocaleString()}</td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle">${item.status}</span></td>
      </tr>
    `).join('');
  }

  window.HMIFee = {
    lookupStudent,
    processPayment,
    printReceipt: () => window.print()
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btnLookup = document.getElementById('btnLookupStudent');
    if (btnLookup) {
      btnLookup.addEventListener('click', lookupStudent);
    }

    const payForm = document.getElementById('feePaymentForm');
    if (payForm) {
      payForm.addEventListener('submit', processPayment);
    }

    const searchInput = document.getElementById('searchStudentId');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          lookupStudent();
        }
      });

      // If active session exists, prefill user's own ID
      const session = window.HMIAuth ? window.HMIAuth.getSession() : null;
      if (session && session.id) {
        searchInput.value = session.id;
        lookupStudent();
      }
    }

    renderPaymentHistoryTable();
  });
})();
