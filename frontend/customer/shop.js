const token    = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (userData.role === 'farmer') window.location.href = '../farmer/dashboard.html';

const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatPrice = (n) => '₦' + Number(n).toLocaleString('en-NG');

const getCart  = () => JSON.parse(localStorage.getItem('customerCart') || '[]');
const saveCart = (cart) => {
    localStorage.setItem('customerCart', JSON.stringify(cart));
    updateCartBadge();
};

const updateCartBadge = () => {
    const total = getCart().reduce((s, i) => s + i.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    if (total > 0) { badge.textContent = total; badge.style.display = 'flex'; }
    else badge.style.display = 'none';
};

const addToCart = async (id, name, price, unit, btn) => {
    const cart     = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({ id, name, price, unit, quantity: 1 });
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

    if (btn) {
        btn.textContent = 'Added!';
        btn.disabled    = true;
        setTimeout(() => { btn.innerHTML = cartBtnHTML(); btn.disabled = false; }, 1200);
    }
};

const cartBtnHTML = () => `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    Add`;

let allProducts = [];
let activeCategory = 'All';

const buildCategories = (products) => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    const tabs = document.getElementById('filterTabs');
    tabs.innerHTML = cats.map(c => `
        <button class="filter-tab ${c === activeCategory ? 'filter-tab--active' : ''}" data-cat="${c}">${c}</button>
    `).join('');

    tabs.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeCategory = tab.dataset.cat;
            tabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('filter-tab--active'));
            tab.classList.add('filter-tab--active');
            renderProducts();
        });
    });
};

const renderProducts = () => {
    const q       = document.getElementById('searchInput').value.toLowerCase();
    const images  = JSON.parse(localStorage.getItem('productImages') || '{}');
    const grid    = document.getElementById('shopGrid');

    let filtered = allProducts;
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
    if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

    if (!filtered.length) {
        grid.innerHTML = `<div class="shop-empty">No products found.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const imgSrc  = item.image || images[item.id] || '';
        const imgHTML = imgSrc
            ? `<img src="${imgSrc}" alt="${item.name}">`
            : `<div class="shop-card-img-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
               </div>`;

        return `
        <div class="shop-card">
            <div class="shop-card-img">
                ${imgHTML}
                <span class="shop-cat-badge">${item.category}</span>
            </div>
            <div class="shop-card-body">
                <div class="shop-card-name">${item.name}</div>
                <div class="shop-card-meta">
                    <span class="shop-card-stock">${item.current} ${item.unit || 'kg'} in stock</span>
                </div>
                <div class="shop-card-price-row">
                    <div class="shop-card-price">${formatPrice(item.price)} <span>/${item.unit}</span></div>
                    <button class="shop-add-btn" onclick="addToCart('${item.id}','${item.name}',${item.price},'${item.unit}',this)">
                        ${cartBtnHTML()}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('navAvatar').textContent = initials;
    } catch (e) { console.error(e); }
};

const loadProducts = async () => {
    const grid = document.getElementById('shopGrid');

    try {
        const res = await fetch(`${BASE}/products/public`);
        if (!res.ok) throw new Error('Failed to load products');

        const products = await res.json();

        const images = JSON.parse(localStorage.getItem('productImages') || '{}');

        allProducts = products.map(p => ({
            id:       p._id,
            name:     p.name,
            category: p.category,
            price:    p.price,
            current:  p.quantity,
            unit:     p.unit || 'kg',
            image:    p.image || images[p._id] || ''
        }));

        buildCategories(allProducts);
        renderProducts();

    } catch (error) {
        console.error('Shop load error:', error);
        grid.innerHTML = `<div class="shop-empty">Unable to load products. Please try again.</div>`;
    }
};

document.getElementById('searchInput').addEventListener('input', renderProducts);

updateCartBadge();
loadProfile();
loadProducts();