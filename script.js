/* =============================================
   ShopBD – script.js
   Developed by Rahul Singh Team
============================================= */

'use strict';

/* =====================
   STATE
===================== */
const state = {
  cart: [],
  wishlist: [],
  currentSlide: 0,
  totalSlides: 3,
  sliderInterval: null,
  countdownTarget: null,
};

/* =====================
   INIT
===================== */
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initCountdown();
  initScrollTop();
  initStickyHeader();
  initSearchSuggestions();
  animateBrands();
  animateStats();
  updateBadges();
});

/* =====================
   HERO SLIDER
===================== */
function initSlider() {
  state.sliderInterval = setInterval(() => changeSlide(1), 5000);
}

function changeSlide(dir) {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  slides[state.currentSlide].classList.remove('active');
  dots[state.currentSlide].classList.remove('active');
  state.currentSlide = (state.currentSlide + dir + state.totalSlides) % state.totalSlides;
  slides[state.currentSlide].classList.add('active');
  dots[state.currentSlide].classList.add('active');
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  slides[state.currentSlide].classList.remove('active');
  dots[state.currentSlide].classList.remove('active');
  state.currentSlide = index;
  slides[state.currentSlide].classList.add('active');
  dots[state.currentSlide].classList.add('active');
  resetSliderInterval();
}

function resetSliderInterval() {
  clearInterval(state.sliderInterval);
  state.sliderInterval = setInterval(() => changeSlide(1), 5000);
}

/* pause on hover */
const heroSlider = document.getElementById('heroSlider');
if (heroSlider) {
  heroSlider.addEventListener('mouseenter', () => clearInterval(state.sliderInterval));
  heroSlider.addEventListener('mouseleave', () => {
    state.sliderInterval = setInterval(() => changeSlide(1), 5000);
  });
}

/* =====================
   COUNTDOWN TIMER
===================== */
function initCountdown() {
  /* target = 6 hours from now */
  state.countdownTarget = new Date(Date.now() + 6 * 60 * 60 * 1000);
  tickCountdown();
  setInterval(tickCountdown, 1000);
}

function tickCountdown() {
  const now  = Date.now();
  const diff = state.countdownTarget - now;
  if (diff <= 0) {
    state.countdownTarget = new Date(Date.now() + 6 * 60 * 60 * 1000);
    return;
  }
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');
  if (hEl) hEl.textContent = String(h).padStart(2, '0');
  if (mEl) mEl.textContent = String(m).padStart(2, '0');
  if (sEl) sEl.textContent = String(s).padStart(2, '0');
}

/* =====================
   MEGA MENU
===================== */
function toggleMegaMenu() {
  const menu = document.getElementById('megaMenu');
  const btn  = document.getElementById('navCatBtn');
  menu.classList.toggle('open');
  btn.classList.toggle('active');
  if (menu.classList.contains('open')) {
    document.addEventListener('click', closeMegaOnOutside);
  }
}

function closeMegaOnOutside(e) {
  const menu = document.getElementById('megaMenu');
  const btn  = document.getElementById('navCatBtn');
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.classList.remove('active');
    document.removeEventListener('click', closeMegaOnOutside);
  }
}

/* =====================
   CART
===================== */
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function addToCart(btnEl, productName) {
  const card  = btnEl.closest('.product-card');
  const img   = card?.querySelector('.product-img-wrap img')?.src || '';
  const price = card?.querySelector('.price-current')?.textContent || '৳0';

  const existing = state.cart.find(i => i.name === productName);
  if (existing) {
    existing.qty++;
    showToast(`<i class="fas fa-check-circle green"></i> ${productName} quantity updated!`, 'success');
  } else {
    state.cart.push({ name: productName, price, img, qty: 1 });
    showToast(`<i class="fas fa-check-circle green"></i> ${productName} added to cart!`, 'success');
  }

  updateBadges();
  renderCart();

  /* animate button */
  if (btnEl.classList.contains('add-to-cart-btn')) {
    btnEl.textContent = '✓ Added!';
    btnEl.style.background = 'var(--accent-green)';
    setTimeout(() => {
      btnEl.textContent = 'Add to Cart';
      btnEl.style.background = '';
    }, 1400);
  }
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  renderCart();
  updateBadges();
  showToast('<i class="fas fa-trash blue"></i> Item removed from cart.', 'info');
}

function changeQty(index, delta) {
  state.cart[index].qty += delta;
  if (state.cart[index].qty <= 0) removeFromCart(index);
  else { renderCart(); updateBadges(); }
}

function renderCart() {
  const container  = document.getElementById('cartItems');
  const footer     = document.getElementById('cartFooter');
  const countEl    = document.getElementById('cartCount');
  const totalEl    = document.getElementById('cartTotal');

  const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);
  if (countEl) countEl.textContent = totalQty;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <button onclick="toggleCart()" class="btn-primary" style="margin-top:12px">Start Shopping</button>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'flex';

  container.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/58'"/>
      </div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-meta">
          <span class="cart-item-price">${item.price}</span>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${idx})">
        <i class="fas fa-times"></i>
      </button>
    </div>`).join('');

  /* calculate total */
  const total = state.cart.reduce((sum, item) => {
    const num = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
    return sum + num * item.qty;
  }, 0);
  if (totalEl) totalEl.textContent = `৳${total.toLocaleString('en-IN')}`;
}

/* =====================
   WISHLIST
===================== */
function toggleWishlist() {
  showToast('<i class="fas fa-heart" style="color:#e8303a"></i> Wishlist — coming soon!', 'info');
}

function addToWishlist(btnEl) {
  const card = btnEl.closest('.product-card');
  const name = card?.querySelector('h3')?.textContent || 'Product';
  const icon = btnEl.querySelector('i');

  if (btnEl.classList.contains('wishlisted')) {
    btnEl.classList.remove('wishlisted');
    icon.className = 'far fa-heart';
    const idx = state.wishlist.indexOf(name);
    if (idx > -1) state.wishlist.splice(idx, 1);
    showToast('<i class="fas fa-heart blue"></i> Removed from wishlist.', 'info');
  } else {
    btnEl.classList.add('wishlisted');
    icon.className = 'fas fa-heart';
    state.wishlist.push(name);
    showToast(`<i class="fas fa-heart" style="color:#e8303a"></i> ${name} wishlisted!`, 'success');
  }
  updateBadges();
}

function toggleAccount() {
  showToast('<i class="fas fa-user blue"></i> Account — please sign in.', 'info');
}

/* =====================
   BADGES
===================== */
function updateBadges() {
  const cartTotal = state.cart.reduce((s, i) => s + i.qty, 0);
  const cartBadge = document.getElementById('cartBadge');
  const wishBadge = document.getElementById('wishlistBadge');
  if (cartBadge) cartBadge.textContent = cartTotal;
  if (wishBadge) wishBadge.textContent = state.wishlist.length;
}

/* =====================
   OVERLAY / CLOSE ALL
===================== */
function closeAll() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
  document.getElementById('megaMenu')?.classList.remove('open');
  document.getElementById('navCatBtn')?.classList.remove('active');
}

/* =====================
   PRODUCT HORIZONTAL SCROLL
===================== */
function scrollProducts(rowId, dir) {
  const row = document.getElementById(rowId);
  if (!row) return;
  row.scrollBy({ left: dir * 660, behavior: 'smooth' });
}

/* =====================
   FILTER TABS (Featured Products)
===================== */
function filterProducts(cat, tabEl) {
  /* update tab styles */
  document.querySelectorAll('#filterTabs .tab-btn').forEach(b => b.classList.remove('active'));
  tabEl.classList.add('active');

  const cards = document.querySelectorAll('#featuredGrid .product-card');
  let delay = 0;
  cards.forEach(card => {
    const cardCat = card.dataset.cat || 'all';
    if (cat === 'all' || cardCat === cat) {
      card.classList.remove('hide');
      card.style.animationDelay = `${delay}ms`;
      delay += 40;
    } else {
      card.classList.add('hide');
    }
  });
}

/* =====================
   LOAD MORE
===================== */
function loadMore() {
  const btn = document.querySelector('.btn-load-more');
  const icon = btn.querySelector('i');
  icon.classList.add('spinning');
  btn.disabled = true;
  btn.textContent = '  Loading…';
  btn.prepend(icon);

  setTimeout(() => {
    icon.classList.remove('spinning');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> All Products Loaded';
    btn.style.borderColor = 'var(--accent-green)';
    btn.style.color = 'var(--accent-green)';
    showToast('<i class="fas fa-check-circle green"></i> All products loaded!', 'success');
  }, 1800);
}

/* =====================
   SEARCH
===================== */
const suggestions = [
  'Samsung Galaxy S25',
  'Apple iPhone 16',
  'Sony Headphones',
  'Nike Running Shoes',
  'Atomic Habits Book',
  'Coffee Maker',
  'Leather Handbag',
  'Smart Watch',
  'Laptop i7',
  'Organic Vegetables',
];

function initSearchSuggestions() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let dropdown = document.createElement('div');
  dropdown.className = 'search-suggestions';
  input.parentElement.appendChild(dropdown);

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val) { dropdown.classList.remove('open'); return; }
    const matches = suggestions.filter(s => s.toLowerCase().includes(val));
    if (!matches.length) { dropdown.classList.remove('open'); return; }
    dropdown.innerHTML = matches.map(s =>
      `<div class="search-suggestion-item" onclick="selectSuggestion('${s}')">
         <i class="fas fa-search"></i> ${s}
       </div>`
    ).join('');
    dropdown.classList.add('open');
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target)) dropdown.classList.remove('open');
  });
}

function selectSuggestion(text) {
  const input = document.getElementById('searchInput');
  if (input) input.value = text;
  document.querySelector('.search-suggestions')?.classList.remove('open');
  doSearch();
}

function doSearch() {
  const val = document.getElementById('searchInput')?.value?.trim();
  if (!val) { showToast('<i class="fas fa-exclamation-circle yellow"></i> Please enter a search term.', 'warn'); return; }
  showToast(`<i class="fas fa-search blue"></i> Searching for "${val}"…`, 'info');
  document.querySelector('.search-suggestions')?.classList.remove('open');
}

/* =====================
   NEWSLETTER
===================== */
function subscribeNewsletter() {
  const input = document.getElementById('emailInput');
  const val   = input?.value?.trim();
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showToast('<i class="fas fa-exclamation-circle yellow"></i> Please enter a valid email.', 'warn');
    input?.focus();
    return;
  }
  showToast('<i class="fas fa-check-circle green"></i> Subscribed successfully! Welcome aboard.', 'success');
  if (input) input.value = '';
}

/* =====================
   SCROLL TO PRODUCTS (CTA)
===================== */
function scrollToProducts() {
  document.getElementById('featuredProducts')?.scrollIntoView({ behavior: 'smooth' });
}

/* =====================
   SCROLL TOP BUTTON
===================== */
function initScrollTop() {
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTop');
    if (!btn) return;
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =====================
   STICKY HEADER COMPACT
===================== */
function initStickyHeader() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
      header.classList.add('compact');
    } else {
      header.classList.remove('scrolled');
      header.classList.remove('compact');
    }
  });
}

/* =====================
   TOAST NOTIFICATION
===================== */
let toastTimer = null;
function showToast(html, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = html;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* =====================
   BRANDS HOVER ANIMATION
===================== */
function animateBrands() {
  document.querySelectorAll('.brand-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.brand-item').forEach(b => b.classList.remove('active'));
      item.classList.add('active');
      showToast(`<i class="fas fa-store blue"></i> Browsing ${item.textContent} products…`, 'info');
    });
  });
}

/* =====================
   COUNTER ANIMATION (stats)
===================== */
function animateStats() {
  const statBoxes = document.querySelectorAll('.stat-box h3');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        const suffix = raw.replace(/[\d.]/g, '');
        let start = 0;
        const step = num / 40;
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { start = num; clearInterval(timer); }
          el.textContent = (Number.isInteger(num) ? Math.floor(start) : start.toFixed(1)) + suffix;
        }, 35);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statBoxes.forEach(el => observer.observe(el));
}

/* =====================
   PROMO BANNER CLICK
===================== */
document.querySelectorAll('.promo-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const tag = btn.closest('.promo-content')?.querySelector('.promo-tag')?.textContent || 'Offer';
    showToast(`<i class="fas fa-tag yellow"></i> Opening ${tag} section…`, 'info');
  });
});

/* =====================
   SMOOTH SECTION REVEAL
===================== */
(function initReveal() {
  const elements = document.querySelectorAll(
    '.categories-section, .flash-sale-section, .promo-banners, .featured-section, .why-us-section, .new-arrivals-section, .testimonials-section, .app-section'
  );
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    revObs.observe(el);
  });
})();

/* =====================
   KEYBOARD SEARCH (Enter)
===================== */
document.getElementById('searchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

/* =====================
   NEWSLETTER (Enter)
===================== */
document.getElementById('emailInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') subscribeNewsletter();
});