const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (userData.role === 'farmer') window.location.href = '../farmer/dashboard.html';

const formatPrice = value => '₦' + Number(value || 0).toLocaleString('en-NG');
const formatDate = value => new Date(value).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
});
const statusLabel = {
    pending: 'Pending',
    paid: 'Paid',
    ready_for_pickup: 'Ready for Pickup',
    completed: 'Delivered',
    cancelled: 'Cancelled'
};

const renderOrders = orders => {
    const content = document.getElementById('ordersContent');

    if (!orders.length) {
        content.innerHTML = `<section class="orders-empty"><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><a href="shop.html">Browse Products</a></section>`;
        return;
    }

    content.innerHTML = orders.map(order => {
        const status = statusLabel[order.status] || order.status.replaceAll('_', ' ');
        const ready = order.status === 'ready_for_pickup';
        const items = order.items || [];
        const itemRows = items.map(item => `
            <div class="order-item">
                <span>${item.name} <b>× ${item.quantity} ${item.unit || 'kg'}</b></span>
                <strong>${formatPrice(Number(item.price) * Number(item.quantity))}</strong>
            </div>`).join('');

        return `<article class="order-card">
            <header class="order-card-header">
                <div class="order-status-icon order-status-icon--${order.status}">${ready ? '✓' : '▣'}</div>
                <div class="order-meta">
                    <div class="order-title-row">
                        <strong>#${order.receiptId || order._id.slice(-8).toUpperCase()}</strong>
                        <span class="status-badge status-badge--${order.status}">${status}</span>
                    </div>
                    <span class="order-date">Placed ${formatDate(order.createdAt)}</span>
                </div>
                <strong class="order-total">${formatPrice(order.total)}</strong>
            </header>
            <div class="order-items">${itemRows}</div>
            ${ready ? `<footer class="pickup-footer"><span>⌖ &nbsp;Ready! Come collect at the farm gate.</span><a href="https://www.google.com/maps/search/?api=1&query=Leaders-Union+Farm" target="_blank" rel="noopener">Get Directions</a></footer>` : ''}
        </article>`;
    }).join('');
};

const loadProfile = async () => {
    try {
        const response = await fetch(`${BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const user = await response.json();
        document.getElementById('navAvatar').textContent = user.username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    } catch (error) {
        console.error('Profile error:', error);
    }
};

const loadOrders = async () => {
    const content = document.getElementById('ordersContent');
    try {
        const response = await fetch(`${BASE}/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
            return;
        }
        if (!response.ok) throw new Error(`Orders request failed: ${response.status}`);
        renderOrders(await response.json());
    } catch (error) {
        console.error('Orders load error:', error);
        content.innerHTML = '<div class="orders-error">Unable to load orders. Please try again.</div>';
    }
};

loadProfile();
loadOrders();
