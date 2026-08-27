const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (user.role === 'farmer') window.location.href = '../farmer/dashboard.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatPrice = (n) => '₦' + Number(n).toLocaleString('en-NG');

const labels = ['Bestseller', 'Fresh', 'Popular', 'New'];
const labelClass = { Bestseller: 'label--bestseller', Fresh: 'label--fresh', Popular: 'label--popular', New: 'label--new' };

const getCart = () => JSON.parse(localStorage.getItem('customerCart') || '[]');
const saveCart = (cart) => {
    localStorage.setItem('customerCart', JSON.stringify(cart));
    updateCartBadge();
};

const updateCartBadge = () => {
    const cart   = getCart();
    const total  = cart.reduce((s, i) => s + i.quantity, 0);
    const badges = document.querySelectorAll('#cartBadge');
    badges.forEach(b => {
        if (total > 0) { b.textContent = total; b.style.display = 'flex'; }
        else b.style.display = 'none';
    });
};

const addToCart = async (id, name, price, unit) => {
    const cart    = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, name, price, unit, quantity: 1 });
    }
    saveCart(cart);

    try {
        const response = await fetch(`${BASE}/cart/add`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ productId: id, quantity: 1 })
        });
        if (!response.ok) throw new Error('Unable to sync cart');
    } catch (error) {
        console.error('Cart sync error:', error);
    }

    const btn = document.querySelector(`[data-id="${id}"]`);
    if (btn) {
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 1200);
    }
};

const productCardHTML = (item, index) => {
    const images  = JSON.parse(localStorage.getItem('productImages') || '{}');
    const imgSrc  = images[item.id] || '';
    const label   = labels[index % labels.length];
    const imgHTML = imgSrc
        ? `<img class="cust-product-img" src="${imgSrc}" alt="${item.name}">`
        : `<div class="cust-product-img-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
           </div>`;

    return `
    <div class="cust-product-card">
        <div class="cust-product-img-wrap">
            ${imgHTML}
            <span class="cust-product-label ${labelClass[label]}">${label}</span>
        </div>
        <div class="cust-product-body">
            <div class="cust-product-name">${item.name}</div>
            <div class="cust-product-price-row">
                <div class="cust-product-price">${formatPrice(item.price)} <span>/ ${item.unit}</span></div>
            </div>
            <button class="cust-add-btn" data-id="${item.id}" onclick="addToCart('${item.id}','${item.name}',${item.price},'${item.unit}')">
                Add to Cart
            </button>
        </div>
    </div>`;
};

const loadFeatured = () => {
    const inventory = JSON.parse(localStorage.getItem('farmInventory') || '[]');
    const active    = inventory.filter(i => i.active !== false && i.current > 0);
    const grid      = document.getElementById('featuredGrid');
    if (!grid) return;

    if (!active.length) {
        grid.innerHTML = `<div class="featured-loading">No products available yet.</div>`;
        return;
    }

    grid.innerHTML = active.slice(0, 3).map((item, i) => productCardHTML(item, i)).join('');
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const avatar   = document.getElementById('navAvatar');
        if (avatar) avatar.textContent = initials;
    } catch (e) { console.error(e); }
};

updateCartBadge();
loadProfile();
loadFeatured();

const initHamburger = () => {
    const hamburger  = document.getElementById('custHamburger');
    const mobileMenu = document.getElementById('custMobileMenu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });
};

document.addEventListener('DOMContentLoaded', initHamburger);