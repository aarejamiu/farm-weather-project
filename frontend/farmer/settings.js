const token = localStorage.getItem('token');
const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const initials = name => (name || 'Farmer').split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
const message = document.getElementById('settingsMessage');
const profileMessage = document.getElementById('profileMessage');
const splitName = name => { const parts = (name || '').trim().split(/\s+/); return { first: parts.shift() || '', last: parts.join(' ') }; };

const loadSettings = async () => {
    try {
        const response = await fetch(`${BASE}/profile`, { headers });
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
            return;
        }
        if (!response.ok) throw new Error('Unable to load settings');
        const user = await response.json();
        const name = splitName(user.username);
        document.getElementById('firstName').value = name.first;
        document.getElementById('lastName').value = name.last;
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('farmLocation').value = user.farmLocation || '';
        document.getElementById('topAvatar').textContent = initials(user.username);
        document.getElementById('sidebarAvatar').textContent = initials(user.username);
        document.getElementById('sidebarName').textContent = user.username || 'Farmer';
    } catch (error) {
        message.textContent = error.message;
    }
};

document.getElementById('profileForm').addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('saveProfile');
    const profile = {
        username: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    const address = document.getElementById('address').value.trim();
    button.disabled = true;
    profileMessage.textContent = 'Saving...';
    try {
        const [profileResponse, addressResponse] = await Promise.all([
            fetch(`${BASE}/profile`, { method: 'PUT', headers, body: JSON.stringify(profile) }),
            fetch(`${BASE}/profile/address`, { method: 'PUT', headers, body: JSON.stringify({ address }) })
        ]);
        const profileData = await profileResponse.json();
        const addressData = await addressResponse.json();
        if (!profileResponse.ok) throw new Error(profileData.message || 'Unable to save profile');
        if (!addressResponse.ok) throw new Error(addressData.message || 'Unable to save address');
        profileMessage.textContent = 'Profile saved';
        document.getElementById('topAvatar').textContent = initials(profile.username);
        document.getElementById('sidebarAvatar').textContent = initials(profile.username);
        document.getElementById('sidebarName').textContent = profile.username;
    } catch (error) {
        profileMessage.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

document.getElementById('locationForm').addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('saveLocation');
    const farmLocation = document.getElementById('farmLocation').value.trim();
    if (!farmLocation) return;

    button.disabled = true;
    message.textContent = 'Saving...';
    try {
        const response = await fetch(`${BASE}/profile/location`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ farmLocation })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to save location');
        message.textContent = 'Farm location saved';
    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

loadSettings();
