const token = '';

const BASE = window.APP_CONFIG.apiBase;
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatPrice = (n) => '₦' + Number(n).toLocaleString('en-NG');

const labels = ['Bestseller', 'Fresh', 'Popular', 'New'];
const labelClass = { Bestseller: 'label--bestseller', Fresh: 'label--fresh', Popular: 'label--popular', New: 'label--new' };

let cart = [];
const getCart = () => cart;
const saveCart = (nextCart) => {
    cart = nextCart;
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
    const imgSrc  = item.image || '';
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
    const grid      = document.getElementById('featuredGrid');
    if (!grid) return;

    fetch(`${BASE}/products/public`)
        .then(response => response.json())
        .then(products => {
            const active = products.filter(item => item.available !== false && item.quantity > 0).slice(0, 3);
            grid.innerHTML = active.length
                ? active.map((item, i) => productCardHTML({ ...item, id: item._id, current: item.quantity, unit: item.unit || 'unit' }, i)).join('')
                : '<div class="featured-loading">No products available yet.</div>';
        })
        .catch(error => { console.error('Featured products error:', error); grid.innerHTML = '<div class="featured-loading">Unable to load products.</div>'; });
    return;

};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { window.location.href = '../login.html'; return; }
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const avatar   = document.getElementById('navAvatar');
        if (avatar) avatar.textContent = initials;
    } catch (e) { console.error(e); }
};

updateCartBadge();
loadProfile();
loadFeatured();

