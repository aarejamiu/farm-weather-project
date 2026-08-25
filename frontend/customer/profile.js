const token = localStorage.getItem('token');
const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://127.0.0.1:5000' : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
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
    document.getElementById('address').value = user.address || '';
};

const load = async () => {
    try {
        const [profileResponse, ordersResponse] = await Promise.all([
            fetch(`${BASE}/profile`, { headers }),
            fetch(`${BASE}/orders/my`, { headers })
        ]);
        if (profileResponse.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        if (!profileResponse.ok || !ordersResponse.ok) throw new Error('Unable to load profile');
        showProfile(await profileResponse.json(), await ordersResponse.json());
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
        const response = await fetch(`${BASE}/profile`, { method: 'PUT', headers, body: JSON.stringify({ username: `${first} ${last}`.trim(), email: document.getElementById('email').value.trim(), phone: document.getElementById('phone').value.trim() }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save changes');
        showProfile(data.user, await (await fetch(`${BASE}/orders/my`, { headers })).json());
        message.textContent = 'Saved';
    } catch (error) { message.textContent = error.message; }
});

document.querySelectorAll('.profile-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.profile-tab').forEach(item => item.classList.remove('profile-tab--active'));
    tab.classList.add('profile-tab--active');
    document.querySelectorAll('.profile-panel').forEach(panel => { panel.hidden = panel.id !== `${tab.dataset.tab}Panel`; });
}));

document.getElementById('saveAddress').addEventListener('click', async () => {
    const response = await fetch(`${BASE}/profile/address`, { method: 'PUT', headers, body: JSON.stringify({ address: document.getElementById('address').value.trim() }) });
    if (response.ok) document.getElementById('saveAddress').textContent = 'Saved';
});

load();
