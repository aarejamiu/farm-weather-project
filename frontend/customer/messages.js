const token = localStorage.getItem('token');
const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://127.0.0.1:5000' : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const user = JSON.parse(localStorage.getItem('userData') || '{}');
let farmerId = null;
let pollTimer;

const initials = name => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
const time = value => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const loadProfile = async () => {
    const avatar = document.getElementById('navAvatar');
    if (user.username) avatar.textContent = initials(user.username);

    try {
        const response = await fetch(`${BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
            return;
        }
        if (!response.ok) return;
        const profile = await response.json();
        avatar.textContent = initials(profile.username || user.username || 'Customer');
    } catch (error) { console.error('Profile error:', error); }
};
const show = (messages = []) => {
    const box = document.getElementById('chatMessages');
    box.innerHTML = messages.length ? messages.map(message => {
        const mine = message.sender?._id === user.id || message.sender?.id === user.id || message.sender === user.id;
        return `<div class="message-wrap message-wrap--${mine ? 'mine' : 'theirs'}"><div class="message-bubble">${message.content}</div><span class="message-time">${time(message.createdAt)}</span></div>`;
    }).join('') : '<p class="chat-empty">No messages yet. Ask the farm team anything.</p>';
    box.scrollTop = box.scrollHeight;
};

const loadThread = async () => {
    if (!farmerId) return;
    try {
        const response = await fetch(`${BASE}/messages/${farmerId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) show(await response.json());
    } catch (error) { console.error('Conversation error:', error); }
};

const load = async () => {
    try {
        const response = await fetch(`${BASE}/messages/farmer`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Farm contact unavailable');
        const farmer = await response.json();
        farmerId = farmer._id;
        document.getElementById('chatName').textContent = `${farmer.username} — Leaders-Union Farm`;
        document.getElementById('chatAvatar').textContent = initials(farmer.username);
        await loadThread();
        pollTimer = setInterval(loadThread, 5000);
    } catch (error) {
        document.getElementById('chatMessages').innerHTML = `<p class="chat-empty">${error.message}</p>`;
    }
};

document.getElementById('messageForm').addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content || !farmerId) return;
    input.value = '';
    try {
        const response = await fetch(`${BASE}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId: farmerId, content }) });
        if (!response.ok) throw new Error('Message could not be sent');
        await loadThread();
    } catch (error) { input.value = content; console.error('Send error:', error); }
});

loadProfile();
load();
