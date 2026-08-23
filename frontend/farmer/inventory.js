const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (user.role === 'customer') window.location.href = '../customer/home.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
const authHeaders = { 'Authorization': `Bearer ${token}` };

let inventory = JSON.parse(localStorage.getItem('farmInventory') || '[]');
let editingId = null;

const saveInventory = () => localStorage.setItem('farmInventory', JSON.stringify(inventory));

const getStatus = (current, minimum, maximum) => {
    const pct = maximum > 0 ? (current / maximum) * 100 : (current > 0 ? 100 : 0);
    if (current <= 0 || current < minimum * 0.5) return { status: 'critical', pct: Math.round(pct) };
    if (current < minimum) return { status: 'low', pct: Math.round(pct) };
    return { status: 'good', pct: Math.round(pct) };
};

const formatCurrency = (n) => '₦' + Number(n).toLocaleString('en-NG');

const renderStats = () => {
    const total    = inventory.length;
    const totalVal = inventory.reduce((s, i) => s + (i.current * i.price), 0);
    const critical = inventory.filter(i => getStatus(i.current, i.minimum, i.maximum).status === 'critical').length;
    const low      = inventory.filter(i => getStatus(i.current, i.minimum, i.maximum).status === 'low').length;

    document.getElementById('totalItems').textContent    = total;
    document.getElementById('totalValue').textContent    = formatCurrency(totalVal);
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('lowCount').textContent      = low;
};

const renderTable = () => {
    const tbody = document.getElementById('inventoryBody');

    if (!inventory.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="inv-loading">No inventory items yet. Click Add Item to get started.</td></tr>`;
        renderStats();
        return;
    }

    tbody.innerHTML = inventory.map(item => {
        const { status, pct } = getStatus(item.current, item.minimum, item.maximum);
        const value = formatCurrency(item.current * item.price);

        return `
        <tr>
            <td><div class="inv-item-name">${item.name}</div></td>
            <td><div class="inv-category">${item.category}</div></td>
            <td><div class="inv-current">${item.current} <span>${item.unit}</span></div></td>
            <td>
                <div class="level-bar-wrap">
                    <div class="level-bar-bg">
                        <div class="level-bar-fill level-bar-fill--${status}" style="width:${Math.min(pct,100)}%"></div>
                    </div>
                    <div class="level-pct">${pct}%</div>
                </div>
            </td>
            <td><div class="inv-minimum">${item.minimum} <span>${item.unit}</span></div></td>
            <td>${value}</td>
            <td><span class="inv-status inv-status--${status}">${status.charAt(0).toUpperCase()+status.slice(1)}</span></td>
            <td>
                <div class="inv-actions">
                    <button class="inv-action-btn" onclick="editItem('${item.id}')" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="inv-action-btn inv-action-btn--delete" onclick="deleteItem('${item.id}')" title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    renderStats();
};

const openModal = (title = 'Add Item') => {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBackdrop').classList.add('open');
};

const closeModal = () => {
    document.getElementById('modalBackdrop').classList.remove('open');
    document.getElementById('itemName').value     = '';
    document.getElementById('itemCategory').value = 'Crop';
    document.getElementById('itemUnit').value     = 'kg';
    document.getElementById('itemCurrent').value  = '';
    document.getElementById('itemMinimum').value  = '';
    document.getElementById('itemMaximum').value  = '';
    document.getElementById('itemPrice').value    = '';
    editingId = null;
};

const saveItem = async () => {
    const name     = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const unit     = document.getElementById('itemUnit').value;
    const current  = parseFloat(document.getElementById('itemCurrent').value) || 0;
    const minimum  = parseFloat(document.getElementById('itemMinimum').value) || 0;
    const maximum  = parseFloat(document.getElementById('itemMaximum').value) || 0;
    const price    = parseFloat(document.getElementById('itemPrice').value) || 0;
    const itemId   = editingId;

    if (!name) { document.getElementById('itemName').focus(); return; }

    const itemData = { name, category, unit, current, minimum, maximum, price };

    if (editingId) {
        const idx = inventory.findIndex(i => i.id === editingId);
        if (idx > -1) inventory[idx] = { ...inventory[idx], ...itemData };
    } else {
        inventory.push({ id: Date.now().toString(), ...itemData });
    }

    saveInventory();
    closeModal();
    renderTable();

    const savedItem = inventory.find(item => item.id === itemId) || inventory[inventory.length - 1];
    const isExistingApiProduct = itemId && /^[a-f\d]{24}$/i.test(itemId);
    const endpoint = isExistingApiProduct ? `${BASE}/products/${itemId}` : `${BASE}/products`;

    try {
        const res = await fetch(endpoint, {
            method: isExistingApiProduct ? 'PUT' : 'POST',
            headers: { ...authHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, category, unit, price,
                quantity: current,
                available: savedItem.active !== false,
                lowStockThreshold: minimum
            })
        });
        if (!res.ok) throw new Error(`Product sync failed: ${res.status}`);

        const data = await res.json();
        if (!isExistingApiProduct && data.product?._id) {
            savedItem.id = data.product._id;
            saveInventory();
        }
    } catch (error) {
        console.error('Unable to sync product with the server:', error);
    }
};

window.editItem = (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('itemName').value     = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemUnit').value     = item.unit;
    document.getElementById('itemCurrent').value  = item.current;
    document.getElementById('itemMinimum').value  = item.minimum;
    document.getElementById('itemMaximum').value  = item.maximum;
    document.getElementById('itemPrice').value    = item.price;
    openModal('Edit Item');
};

window.deleteItem = (id) => {
    if (!confirm('Delete this inventory item?')) return;
    inventory = inventory.filter(i => i.id !== id);
    saveInventory();
    renderTable();
};

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

const syncExistingInventory = async () => {
    const unsyncedItems = inventory.filter(item => !/^[a-f\d]{24}$/i.test(item.id));

    for (const item of unsyncedItems) {
        try {
            const res = await fetch(`${BASE}/products`, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    price: item.price,
                    quantity: item.current,
                    available: item.active !== false,
                    lowStockThreshold: item.minimum
                })
            });
            if (!res.ok) throw new Error(`Product sync failed: ${res.status}`);

            const data = await res.json();
            if (data.product?._id) item.id = data.product._id;
        } catch (error) {
            console.error('Unable to sync existing inventory:', error);
            break;
        }
    }

    saveInventory();
};

document.getElementById('openModalBtn').addEventListener('click', () => openModal('Add Item'));
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
document.getElementById('saveItemBtn').addEventListener('click', saveItem);
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

loadProfile();
renderTable();
syncExistingInventory();