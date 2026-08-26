const token    = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (userData.role === 'customer') window.location.href = '../customer/home.html';

const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

let currentUserId  = null;
let currentThread  = [];
let pollingInterval = null;

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const formatInboxTime = (d) => {
    const date  = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return formatTime(d);
    const diff  = Math.floor((today - date) / 86400000);
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const renderInbox = (threads) => {
    const list = document.getElementById('inboxList');
    const q    = document.getElementById('inboxSearch').value.toLowerCase();

    const filtered = q ? threads.filter(t => t.sender?.username?.toLowerCase().includes(q)) : threads;

    if (!filtered.length) {
        list.innerHTML = `<div class="inbox-loading">No conversations yet.</div>`;
        return;
    }

    list.innerHTML = filtered.map(t => {
        const name    = t.sender?.username || 'Customer';
        const avatar  = initials(name);
        const unread  = t.read === false ? 1 : 0;
        const isActive = t.sender?._id === currentUserId || t.sender?.id === currentUserId;

        return `
        <div class="inbox-item ${isActive ? 'inbox-item--active' : ''}"
             onclick="openThread('${t.sender?._id || t.sender?.id}', '${name}')">
            <div class="inbox-avatar">${avatar}</div>
            <div class="inbox-info">
                <div class="inbox-top">
                    <span class="inbox-name">${name}</span>
                    <span class="inbox-time">${formatInboxTime(t.createdAt)}</span>
                </div>
                <div class="inbox-preview">${t.content || ''}</div>
            </div>
            ${unread ? `<span class="inbox-unread">${unread}</span>` : ''}
        </div>`;
    }).join('');
};

const renderMessages = (messages) => {
    const box = document.getElementById('chatMessages');
    const myId = userData.id;

    box.innerHTML = messages.map(m => {
        const isMine = m.sender?._id === myId || m.sender?.id === myId || m.sender === myId;
        return `
        <div class="msg-wrap ${isMine ? 'msg-wrap--mine' : 'msg-wrap--theirs'}">
            <div class="msg-bubble">${m.content}</div>
            <div class="msg-time">${formatTime(m.createdAt)}</div>
        </div>`;
    }).join('');

    box.scrollTop = box.scrollHeight;
};

window.openThread = async (userId, name) => {
    currentUserId = userId;

    document.getElementById('chatEmpty').style.display  = 'none';
    document.getElementById('chatActive').style.display = 'flex';
    document.getElementById('chatName').textContent     = name;
    document.getElementById('chatAvatar').textContent   = initials(name);

    document.querySelectorAll('.inbox-item').forEach(el => el.classList.remove('inbox-item--active'));
    document.querySelectorAll('.inbox-item').forEach(el => {
        if (el.getAttribute('onclick')?.includes(userId)) el.classList.add('inbox-item--active');
    });

    await loadThread(userId);

    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => loadThread(userId), 5000);
};

const loadThread = async (userId) => {
    try {
        const res      = await fetch(`${BASE}/messages/${userId}`, { headers: authHeaders });
        const messages = await res.json();
        currentThread  = messages;
        renderMessages(messages);
    } catch (e) { console.error('Thread load error:', e); }
};

const sendMessage = async () => {
    if (!currentUserId) return;
    const input   = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    try {
        const res = await fetch(`${BASE}/messages`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ receiverId: currentUserId, content })
        });
        if (!res.ok) throw new Error('Send failed');
        await loadThread(currentUserId);
        await loadInbox();
    } catch (e) { console.error('Send error:', e); }
};

const loadInbox = async () => {
    try {
        const res     = await fetch(`${BASE}/messages/inbox`, { headers: authHeaders });
        const threads = await res.json();
        renderInbox(threads);
    } catch (e) { console.error('Inbox load error:', e); }
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const ini  = initials(user.username);
        document.getElementById('topAvatar').textContent     = ini;
        document.getElementById('sidebarAvatar').textContent = ini;
        document.getElementById('sidebarName').textContent   = user.username;
    } catch (e) { console.error(e); }
};

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});
document.getElementById('inboxSearch').addEventListener('input', () => loadInbox());

loadProfile();
loadInbox();