const token = localStorage.getItem('token');
const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const initials = name => (name || 'Farmer').split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
const message = document.getElementById('settingsMessage');

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
        document.getElementById('farmLocation').value = user.farmLocation || '';
        document.getElementById('topAvatar').textContent = initials(user.username);
        document.getElementById('sidebarAvatar').textContent = initials(user.username);
        document.getElementById('sidebarName').textContent = user.username || 'Farmer';
    } catch (error) {
        message.textContent = error.message;
    }
};

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
