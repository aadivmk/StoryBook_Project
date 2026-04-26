// ============================================================
// frontend/js/auth.js
// Client-side auth helpers.
// User object is stored in localStorage after login/register.
// No JWT tokens — backend just returns the user object.
// ============================================================

// ── Session helpers ───────────────────────────────────────

/** Returns the logged-in user object, or null if not logged in */
function getUser() {
  try { return JSON.parse(localStorage.getItem('storyland_user')); }
  catch { return null; }
}

/** Returns true if a user is currently logged in */
function isLoggedIn() {
  return !!getUser();
}

/** Save user to localStorage after successful login / register */
function setUser(user) {
  localStorage.setItem('storyland_user', JSON.stringify(user));
}

/** Remove user from localStorage (logout) */
function clearUser() {
  localStorage.removeItem('storyland_user');
}

// ── UI helpers ────────────────────────────────────────────

/**
 * Call on every page load to show/hide the correct nav items
 * based on login state.
 */
function checkAuth() {
  const user        = getUser();
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userMenu    = document.getElementById('userMenu');
  const userName    = document.getElementById('userName');
  const userAvatar  = document.getElementById('userAvatar');

  if (user) {
    // Logged in → hide login/register, show user menu
    if (loginBtn)    loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (userMenu)    userMenu.classList.remove('hidden');
    if (userName)    userName.textContent  = user.name.split(' ')[0];
    if (userAvatar)  userAvatar.textContent = user.child?.avatar || '👤';
  } else {
    // Not logged in → show login/register, hide user menu
    if (loginBtn)    loginBtn.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (userMenu)    userMenu?.classList.add('hidden');
  }
}

/**
 * Redirect to login page if the user is not logged in.
 * Preserves the current URL so we can redirect back after login.
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}

/** Log out and redirect to home */
function logout() {
  clearUser();
  showToast('Logged out! See you soon 👋', 'info');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// ── Toast notifications ───────────────────────────────────

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id        = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Auto-dismiss after 3.5 s
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Sparkle click effect ──────────────────────────────────

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-primary') ||
      e.target.classList.contains('btn-hero-primary')) {
    createSparkle(e.clientX, e.clientY);
  }
});

function createSparkle(x, y) {
  const emojis = ['✨', '⭐', '💫', '🌟'];
  for (let i = 0; i < 4; i++) {
    const s = document.createElement('div');
    s.className   = 'sparkle';
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left  = (x + (Math.random() - 0.5) * 80) + 'px';
    s.style.top   = (y + (Math.random() - 0.5) * 80) + 'px';
    s.style.animationDelay = (i * 0.1) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}

// ── Scroll-reveal observer ────────────────────────────────

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
