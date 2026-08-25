const token    = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (userData.role === 'customer') window.location.href = '../customer/home.html';

const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatCurrency = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statusLabels = {
    pending:          'pending',
    paid:             'processing',
    ready_for_pickup: 'ready',
    completed:        'delivered',
    cancelled:        'cancelled'
};

let allOrders    = [];
let activeFilter = 'all';
let currentOrder = null;

const renderStats = () => {
    const today     = new Date(); today.setHours(0,0,0,0);
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const revenue     = todayOrders.reduce((s, o) => s + o.total, 0);
    const ready       = allOrders.filter(o => o.status === 'ready_for_pickup').length;
    const processing  = allOrders.filter(o => o.status === 'paid').length;
    const avg         = allOrders.length ? allOrders.reduce((s,o) => s + o.total, 0) / allOrders.length : 0;

    document.getElementById('statTotal').textContent      = todayOrders.length;
    document.getElementById('statRevenue').textContent    = formatCurrency(revenue) + ' revenue';
    document.getElementById('statReady').textContent      = ready;
    document.getElementById('statProcessing').textContent = processing;
    document.getElementById('statAvg').textContent        = formatCurrency(avg);
};

const renderOrders = () => {
    const q       = document.getElementById('searchInput').value.toLowerCase();
    const tbody   = document.getElementById('ordersBody');

    let filtered = allOrders;

    if (activeFilter !== 'all') {
        filtered = filtered.filter(o => o.status === activeFilter);
    }

    if (q) {
        filtered = filtered.filter(o =>
            o.receiptId?.toLowerCase().includes(q) ||
            o.customer?.username?.toLowerCase().includes(q) ||
            o.customer?.email?.toLowerCase().includes(q)
        );
    }

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="orders-loading">No orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        const statusKey   = o.status;
        const statusLabel = statusLabels[statusKey] || statusKey;
        const payLabel    = o.paymentStatus === 'paid' ? 'paid' : 'unpaid';

        return `
        <tr>
            <td><span class="order-id-cell">#${o.receiptId || o._id.slice(-6).toUpperCase()}</span></td>
            <td><span class="order-customer">${o.customer?.username || 'Customer'}</span></td>
            <td><span class="order-date">${formatDate(o.createdAt)}</span></td>
            <td>${o.items?.length || 0}</td>
            <td><span class="order-total">${formatCurrency(o.total)}</span></td>
            <td><span class="payment-badge payment--${o.paymentStatus}">${payLabel}</span></td>
            <td><span class="status-badge status--${statusKey}">${statusLabel}</span></td>
            <td>
                <button class="view-btn-sm" onclick="openDetail('${o._id}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                </button>
            </td>
        </tr>`;
    }).join('');
};

window.openDetail = (id) => {
    currentOrder = allOrders.find(o => o._id === id);
    if (!currentOrder) return;

    const o = currentOrder;
    document.getElementById('detailOrderId').textContent  = `#${o.receiptId || o._id.slice(-6).toUpperCase()}`;
    document.getElementById('detailDate').textContent     = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('detailCustomer').textContent = o.customer?.username || 'Customer';
    document.getElementById('detailEmail').textContent    = o.customer?.email || '';
    document.getElementById('detailPhone').textContent    = o.customer?.phone || '';
    document.getElementById('detailAddress').textContent  = o.deliveryAddress || 'Not provided';
    document.getElementById('detailNote').textContent     = o.note || 'No note';
    document.getElementById('detailTotal').textContent    = formatCurrency(o.total);

    document.getElementById('detailItems').innerHTML = (o.items || []).map(item => `
        <div class="detail-item-row">
            <div>
                <div class="detail-item-name">${item.name}</div>
                <div class="detail-item-qty">x${item.quantity} ${item.unit || ''}</div>
            </div>
            <div class="detail-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>`).join('');

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.toggle('status-btn--active', btn.dataset.status === o.status);
    });

    document.getElementById('detailBackdrop').classList.add('open');
};

const closeDetail = () => {
    document.getElementById('detailBackdrop').classList.remove('open');
    currentOrder = null;
};

const updateStatus = async (status) => {
    if (!currentOrder) return;
    try {
        const res = await fetch(`${BASE}/orders/${currentOrder._id}/status`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Update failed');

        currentOrder.status = status;
        const idx = allOrders.findIndex(o => o._id === currentOrder._id);
        if (idx > -1) allOrders[idx].status = status;

        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('status-btn--active', btn.dataset.status === status);
        });

        renderStats();
        renderOrders();
    } catch (e) {
        console.error('Status update error:', e);
    }
};

const loadOrders = async () => {
    try {
        const res  = await fetch(`${BASE}/orders`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        allOrders  = await res.json();
        renderStats();
        renderOrders();
    } catch (e) {
        console.error('Orders load error:', e);
        document.getElementById('ordersBody').innerHTML =
            `<tr><td colspan="8" class="orders-loading">Failed to load orders.</td></tr>`;
    }
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('topAvatar').textContent     = initials;
        document.getElementById('sidebarAvatar').textContent = initials;
        document.getElementById('sidebarName').textContent   = user.username;
    } catch (e) { console.error(e); }
};

document.getElementById('filterTabs').querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        activeFilter = tab.dataset.status;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('filter-tab--active'));
        tab.classList.add('filter-tab--active');
        renderOrders();
    });
});

document.getElementById('searchInput').addEventListener('input', renderOrders);
document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);
document.getElementById('detailBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetail();
});

document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.status));
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

loadProfile();
loadOrders();