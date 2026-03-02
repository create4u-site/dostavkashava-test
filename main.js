'use strict';

/* ============================================================
   SECURITY: Disable right-click context menu
   ============================================================ */
document.addEventListener('contextmenu', (e) => e.preventDefault());

/* ============================================================
   SECURITY: Disable F12, Ctrl+Shift+I/J/U, Ctrl+U (DevTools)
   ============================================================ */
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault();
    return false;
  }
});

/* ============================================================
   SECURITY: Disable text selection on sensitive areas
   ============================================================ */
document.querySelectorAll('.price, .promo-info, .hero-content h1').forEach(el => {
  el.style.userSelect = 'none';
  el.style.webkitUserSelect = 'none';
});

/* ============================================================
   SECURITY: Detect DevTools open (basic heuristic)
   ============================================================ */
(function detectDevTools() {
  const threshold = 160;
  setInterval(() => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:1.5rem;color:#E8272A;">⛔ Доступ ограничен</div>';
    }
  }, 1000);
})();

/* ============================================================
   SECURITY: Prevent drag of images
   ============================================================ */
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', (e) => e.preventDefault());
});

/* ============================================================
   SECURITY: Anti-iframe clickjacking (client-side fallback)
   ============================================================ */
if (window.self !== window.top) {
  window.top.location = window.self.location;
}

/* ============================================================
   SECURITY: Sanitize any dynamic text insertion (helper)
   ============================================================ */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ============================================================
   SECURITY: Rate-limit cart button clicks (anti-spam)
   ============================================================ */
const clickTimestamps = {};
function isRateLimited(key, limitMs = 500) {
  const now = Date.now();
  if (clickTimestamps[key] && now - clickTimestamps[key] < limitMs) return true;
  clickTimestamps[key] = now;
  return false;
}

/* ============================================================
   CART
   ============================================================ */
let cartItems = [];
let cartTotal = 0;

function addToCart(btn, name, price) {
  if (isRateLimited('cart')) return;

  const safeName = sanitizeHTML(name);
  const safePrice = parseFloat(price);
  if (isNaN(safePrice) || safePrice <= 0) return;

  cartItems.push({ name: safeName, price: safePrice });
  cartTotal += safePrice;

  const count = document.getElementById('cartCount');
  if (count) count.textContent = cartItems.length;

  btn.textContent = '✓';
  btn.style.background = '#4CAF50';
  setTimeout(() => {
    btn.textContent = '+';
    btn.style.background = '';
  }, 1500);
}

function showCart() {
  if (cartItems.length === 0) {
    alert('Корзина пуста. Добавьте шаурму из меню!');
    return;
  }
  const list = cartItems.map(i => `• ${i.name} — ${i.price.toFixed(2)} руб`).join('\n');
  alert(`🛒 Ваш заказ:\n\n${list}\n\nИтого: ${cartTotal.toFixed(2)} руб`);
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });

  // Open clicked if it was closed
  if (!isOpen) {
    item.classList.add('open');
    el.setAttribute('aria-expanded', 'true');
  }
}

// Keyboard support for FAQ
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(q);
    }
  });
});

/* ============================================================
   MENU FILTER
   ============================================================ */
function filterMenu(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.menu-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'block' : 'none';
  });
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ============================================================
   NAV SCROLL SHADOW
   ============================================================ */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) nav.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(0,0,0,.3)' : 'none';
}, { passive: true });

/* ============================================================
   LAZY IMAGE FALLBACK (if image fails to load)
   ============================================================ */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.src = 'https://placehold.co/600x400/1a1a1a/E8272A?text=ШаурМания';
  });
});