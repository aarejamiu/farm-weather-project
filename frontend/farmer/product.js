const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (user.role === 'customer') window.location.href = '../customer/home.html';

const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const authHeaders = { 'Authorization': `Bearer ${token}` };

let inventory  = JSON.parse(localStorage.getItem('farmInventory') || '[]');
let images     = JSON.parse(localStorage.getItem('productImages') || '{}');
let currentId  = null;

const saveImages = () => localStorage.setItem('productImages', JSON.stringify(images));

const getStatus = (current, minimum, active) => {
    if (active === false) return 'inactive';
    if (current <= 0) return 'out';
    if (current < minimum * 0.5) return 'critical';
    if (current < minimum) return 'low';
    return 'active';
};

const statusLabel = { active: 'Active', low: 'Low Stock', critical: 'Critical', out: 'Out of Stock', inactive: 'Inactive' };

const formatPrice = (n) => '₦' + Number(n).toLocaleString('en-NG');

const renderProducts = (items) => {
    const grid = document.getElementById('productsGrid');

    if (!items.length) {
        grid.innerHTML = `
        <div class="products-empty">
            No products yet. Go to <a href="inventory.html">Inventory</a> and add items to see them here.
        </div>`;
        return;
    }

    grid.innerHTML = items.map(item => {
        const status   = getStatus(item.current, item.minimum);
        const imgSrc   = images[item.id] || '';
        const imgHTML  = imgSrc
            ? `<img class="product-img" src="${imgSrc}" alt="${item.name}">`
            : `<div class="product-img-placeholder" onclick="openImageModal('${item.id}', '${item.name}')">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Click to add image</span>
               </div>`;

        const stockClass = status !== 'active' ? `product-stock--${status}` : '';
        const stockText  = item.current > 0 ? `${item.current} ${item.unit} in stock` : 'Out of stock';

        return `
        <div class="product-card">
            <div class="product-img-wrap" onclick="${imgSrc ? `openImageModal('${item.id}', '${item.name}')` : ''}">
                ${imgHTML}
                <span class="product-category-badge">${item.category}</span>
                <span class="product-status-badge status-badge--${status}">${statusLabel[status]}</span>
            </div>
            <div class="product-body">
                <div class="product-name">${item.name}</div>
                <div class="product-price-row">
                    <div class="product-price">${formatPrice(item.price)} <span>/ ${item.unit}</span></div>
                </div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <div class="product-actions">
                    <a href="inventory.html" class="product-edit-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </a>
                    <button class="product-toggle-btn product-toggle-btn--${item.active === false ? 'off' : 'on'}" onclick="toggleProduct('${item.id}')">
                        ${item.active === false ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
    window.toggleProduct = (id) => {
        const idx = inventory.findIndex(i => i.id === id);
        if (idx === -1) return;
        inventory[idx].active = !inventory[idx].active;
        localStorage.setItem('farmInventory', JSON.stringify(inventory));
        filterProducts();
        syncProduct(inventory[idx]);
    }
};

const filterProducts = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = q
        ? inventory.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
        : inventory;
    renderProducts(filtered);
};

window.deleteProduct = (id) => {
    if (!confirm('Remove this product from the shop? It will also be deleted from inventory.')) return;
    inventory = inventory.filter(i => i.id !== id);
    delete images[id];
    localStorage.setItem('farmInventory', JSON.stringify(inventory));
    saveImages();
    filterProducts();
};

const syncProduct = async (item) => {
    const isExistingApiProduct = /^[a-f\d]{24}$/i.test(item.id);
    const endpoint = isExistingApiProduct ? `${BASE}/products/${item.id}` : `${BASE}/products`;

    try {
        const res = await fetch(endpoint, {
            method: isExistingApiProduct ? 'PUT' : 'POST',
            headers: { ...authHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: item.name,
                category: item.category,
                unit: item.unit,
                price: item.price,
                quantity: item.current,
                image: images[item.id] || '',
                available: item.active !== false,
                lowStockThreshold: item.minimum
            })
        });
        if (!res.ok) throw new Error(`Product sync failed: ${res.status}`);

        const data = await res.json();
        if (!isExistingApiProduct && data.product?._id) {
            item.id = data.product._id;
            localStorage.setItem('farmInventory', JSON.stringify(inventory));
        }
    } catch (error) {
        console.error('Unable to sync product with the server:', error);
    }
};

const syncInventory = async () => {
    for (const item of inventory) {
        await syncProduct(item);
    }
};

window.openImageModal = (id, name) => {
    currentId = id;
    document.getElementById('imageModalTitle').textContent = `Image — ${name}`;
    document.getElementById('imageUrl').value  = images[id] || '';
    document.getElementById('imageFile').value = '';

    const preview = document.getElementById('imgPreviewWrap');
    if (images[id]) {
        document.getElementById('imgPreview').src = images[id];
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('imageModalBackdrop').classList.add('open');
};

const closeImageModal = () => {
    document.getElementById('imageModalBackdrop').classList.remove('open');
    currentId = null;
};

document.getElementById('imageUrl').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
        document.getElementById('imgPreview').src = url;
        document.getElementById('imgPreviewWrap').style.display = 'block';
    }
});

document.getElementById('imageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('imgPreview').src = ev.target.result;
        document.getElementById('imgPreviewWrap').style.display = 'block';
        document.getElementById('imageUrl').value = '';
    };
    reader.readAsDataURL(file);
});

document.getElementById('saveImageBtn').addEventListener('click', () => {
    if (!currentId) return;
    const url      = document.getElementById('imageUrl').value.trim();
    const preview  = document.getElementById('imgPreview').src;
    const finalSrc = url || (preview !== window.location.href ? preview : '');

    if (finalSrc) {
        images[currentId] = finalSrc;
        saveImages();
    }

    closeImageModal();
    filterProducts();
});

document.getElementById('closeImageModal').addEventListener('click', closeImageModal);
document.getElementById('cancelImageModal').addEventListener('click', closeImageModal);
document.getElementById('imageModalBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeImageModal();
});
document.getElementById('searchInput').addEventListener('input', filterProducts);

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('topAvatar').textContent     = initials;
        document.getElementById('sidebarAvatar').textContent = initials;
        document.getElementById('sidebarName').textContent   = user.username;
    } catch (e) { console.error(e); }
};

loadProfile();
filterProducts();
syncInventory();