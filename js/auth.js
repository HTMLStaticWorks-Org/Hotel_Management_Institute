/**
 * HMI 2026 - Authentication & Session Engine
 * Handles demo login, student registration, password toggle,
 * session storage, and route protection for Student Dashboard.
 */

(function () {
  'use strict';

  const AUTH_KEY = 'hmi_student_session';
  const STUDENTS_KEY = 'hmi_students_db';

  // Seed default demo student if not present
  function initDefaultStudent() {
    if (!localStorage.getItem(STUDENTS_KEY)) {
      const defaultStudents = [
        {
          id: 'HMI2026',
          name: 'Alexander Sterling',
          email: 'alexander.s@student.hmi.edu',
          phone: '+1 (555) 234-8901',
          password: 'password123',
          course: 'B.Sc. International Hotel Management',
          semester: 'Semester IV (Year 2)',
          enrolledYear: '2024',
          gpa: '3.92',
          attendance: '96%',
          fees: {
            total: 18500,
            paid: 12500,
            balance: 6000
          },
          avatar: 'AS'
        }
      ];
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(defaultStudents));
    }
  }

  // Get current active session
  function getSession() {
    try {
      const session = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  // Set session
  function setSession(student, rememberMe = false) {
    const data = JSON.stringify(student);
    if (rememberMe) {
      localStorage.setItem(AUTH_KEY, data);
    } else {
      sessionStorage.setItem(AUTH_KEY, data);
    }
  }

  // End session
  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  }

  // Protect Dashboard Route
  function requireAuth() {
    const session = getSession();
    if (!session) {
      window.location.href = 'login.html?redirect=dashboard.html';
    }
    return session;
  }

  // If already logged in, redirect away from auth pages
  function redirectIfAuthenticated() {
    const session = getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  }

  // Handle Login form
  function handleLogin(e) {
    e.preventDefault();
    initDefaultStudent();

    const idInput = document.getElementById('loginId').value.trim();
    const passInput = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    const errorEl = document.getElementById('loginError');

    const students = JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
    const matched = students.find(s => 
      (s.id.toLowerCase() === idInput.toLowerCase() || s.email.toLowerCase() === idInput.toLowerCase()) && 
      s.password === passInput
    );

    if (matched) {
      setSession(matched, rememberMe);
      if (window.HMI) window.HMI.showToast(`Welcome back, ${matched.name}!`);
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'dashboard.html';
      setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } else {
      if (errorEl) {
        errorEl.classList.remove('d-none');
        errorEl.textContent = 'Invalid Student ID/Email or Password. (Demo: HMI2026 / password123)';
      }
    }
  }

  // Handle Registration
  function handleRegister(e) {
    e.preventDefault();
    initDefaultStudent();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const studentId = document.getElementById('regStudentId').value.trim();
    const course = document.getElementById('regCourse').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorEl = document.getElementById('regError');
    const successEl = document.getElementById('regSuccess');

    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.classList.remove('d-none');
        errorEl.textContent = 'Passwords do not match.';
      }
      return;
    }

    const students = JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]');
    if (students.some(s => s.id.toLowerCase() === studentId.toLowerCase() || s.email.toLowerCase() === email.toLowerCase())) {
      if (errorEl) {
        errorEl.classList.remove('d-none');
        errorEl.textContent = 'A student with this ID or Email is already registered.';
      }
      return;
    }

    const newStudent = {
      id: studentId,
      name: name,
      email: email,
      phone: phone,
      password: password,
      course: course || 'B.Sc. International Hotel Management',
      semester: 'Semester I (Year 1)',
      enrolledYear: '2026',
      gpa: '4.00',
      attendance: '100%',
      fees: {
        total: 18500,
        paid: 5000,
        balance: 13500
      },
      avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };

    students.push(newStudent);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    if (errorEl) errorEl.classList.add('d-none');
    if (successEl) {
      successEl.classList.remove('d-none');
      successEl.textContent = 'Registration successful! Auto-logging into your portal...';
    }

    setSession(newStudent, true);
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }

  // Password visibility toggle
  function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inputId = btn.getAttribute('data-target');
        const input = document.getElementById(inputId);
        if (input) {
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          btn.innerHTML = isPass ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });
  }

  // Export functions to global scope
  window.HMIAuth = {
    getSession,
    setSession,
    logout,
    requireAuth,
    redirectIfAuthenticated,
    initDefaultStudent
  };

  document.addEventListener('DOMContentLoaded', () => {
    initDefaultStudent();
    setupPasswordToggles();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const regForm = document.getElementById('regForm');
    if (regForm) regForm.addEventListener('submit', handleRegister);

    // Logout button bindings
    document.querySelectorAll('.logout-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  });
})();
