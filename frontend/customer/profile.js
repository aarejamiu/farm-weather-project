const BASE = window.APP_CONFIG.apiBase;

const headers = { 'Content-Type': 'application/json' };
let profile;

const initials = name => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
const money = value => '₦' + Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
const splitName = name => { const parts = name.trim().split(/\s+/); return { first: parts.shift() || '', last: parts.join(' ') }; };

const showProfile = (user, orders) => {
    profile = user;
    const name = `${user.username || ''}`.trim();
    const nameParts = splitName(name);
    const total = orders.filter(order => order.paymentStatus === 'paid').reduce((sum, order) => sum + Number(order.total || 0), 0);
    const avatarText = initials(name || 'Customer');
    document.getElementById('profileAvatar').textContent = avatarText;
    document.getElementById('navAvatar').textContent = avatarText;
    document.getElementById('profileName').textContent = name || 'Customer';
    document.getElementById('profileEmail').textContent = user.email || '';
    document.getElementById('ordersPill').textContent = `${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'}`;
    document.getElementById('spentPill').textContent = `${money(total)} Spent`;
    document.getElementById('firstName').value = nameParts.first;
    document.getElementById('lastName').value = nameParts.last;
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
};

const load = async () => {
    try {
        const user = await window.Auth.verify({ requiredRole: 'customer' });
        if (!user) return;
        const ordersResponse = await fetch(`${BASE}/orders/my`, { headers, credentials: 'include' });
        if (!ordersResponse.ok) throw new Error('Unable to load profile');
        showProfile(user, await ordersResponse.json());
    } catch (error) {
        document.getElementById('profileName').textContent = 'Unable to load profile';
        console.error('Profile error:', error);
    }
};

document.getElementById('profileForm').addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.getElementById('profileMessage');
    const first = document.getElementById('firstName').value.trim();
    const last = document.getElementById('lastName').value.trim();
    try {
        const response = await fetch(`${BASE}/profile`, { method: 'PUT', headers, credentials: 'include', body: JSON.stringify({ username: `${first} ${last}`.trim(), email: document.getElementById('email').value.trim(), phone: document.getElementById('phone').value.trim() }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save changes');
        showProfile(data.user, await (await fetch(`${BASE}/orders/my`, { headers, credentials: 'include' })).json());
        message.textContent = 'Saved';
    } catch (error) { message.textContent = error.message; }
});

load();
