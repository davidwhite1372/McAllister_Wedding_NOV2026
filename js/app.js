// ===== Countdown =====
function updateCountdown() {
  const wedding = new Date('2026-11-07T16:00:00-05:00'); // 4 PM EST
  const now = new Date();
  const diff = wedding - now;
  const el = document.getElementById('countdown');

  if (diff <= 0) {
    el.textContent = 'Today!';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  el.textContent = days === 1 ? '1 day' : `${days} days`;
}
updateCountdown();
setInterval(updateCountdown, 60000);

// ===== Navigation =====
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`page-${pageId}`);
  const nav = document.querySelector(`[data-page="${pageId}"]`);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');

  // Scroll content to top
  document.querySelector('.content').scrollTop = 0;

  // Save last page
  localStorage.setItem('wedding-last-page', pageId);
}

navItems.forEach(item => {
  item.addEventListener('click', () => showPage(item.dataset.page));
});

// Restore last page
const lastPage = localStorage.getItem('wedding-last-page') || 'timeline';
showPage(lastPage);

// ===== Packing Checklist =====
const packingList = document.getElementById('packing-list');
const STORAGE_KEY = 'wedding-packing';

function loadChecklist() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  packingList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (saved[cb.id]) cb.checked = true;
  });
}

function saveChecklist() {
  const state = {};
  packingList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    state[cb.id] = cb.checked;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

packingList.addEventListener('change', saveChecklist);
loadChecklist();

document.getElementById('clear-checklist').addEventListener('click', () => {
  packingList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  localStorage.removeItem(STORAGE_KEY);
  showToast('Checklist cleared');
});

// ===== Toast =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== PWA Install =====
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const installClose = document.getElementById('install-close');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Only show if not previously dismissed this session
  if (!sessionStorage.getItem('install-dismissed')) {
    installBanner.classList.add('show');
  }
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showToast('App installing…');
  }
  deferredPrompt = null;
  installBanner.classList.remove('show');
});

installClose.addEventListener('click', () => {
  installBanner.classList.remove('show');
  sessionStorage.setItem('install-dismissed', '1');
});

window.addEventListener('appinstalled', () => {
  installBanner.classList.remove('show');
  showToast('App installed! 🎉');
});

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered', reg.scope))
      .catch(err => console.log('SW failed', err));
  });
}

// ===== Prevent pull-to-refresh on overscroll (nice for app feel) =====
document.body.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });