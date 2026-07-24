const token = localStorage.getItem('token');
if (!token) window.location.href = '../login.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';

const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const formatCurrency = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

const weatherIcon = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return '☀️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('shower')) return '🌦️';
    if (c.includes('cloud') || c.includes('overcast')) return '☁️';
    if (c.includes('thunder')) return '⛈️';
    return '⛅';
};

const loadProfile = async () => {
    try {
        const res = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();

        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('sidebarAvatar').textContent = initials;
        document.getElementById('topAvatar').textContent     = initials;
        document.getElementById('sidebarName').textContent   = user.username;

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('pageSubtitle').textContent = `${dateStr} · ${greet()}, ${user.username.split(' ')[0]}`;

        if (user.farmLocation) {
            loadWeather(user.farmLocation);
            loadForecast(user.farmLocation);
            document.getElementById('forecastLocation').textContent = user.farmLocation;
        }
    } catch (e) {
        console.error('Profile error:', e);
    }
};

const loadWeather = async (location) => {
    try {
        const res  = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
        const data = await res.json();
        const w    = data.weather;

        document.getElementById('statTemp').textContent  = `${w.temp}°C`;
        document.getElementById('statRain').textContent  = `${w.humidity}%`;
        document.getElementById('tempDelta').textContent = `↑ +2°`;
        document.getElementById('rainDelta').textContent = `↑ ${w.humidity > 60 ? '+High' : '+Low'}`;
    } catch (e) {
        console.error('Weather error:', e);
    }
};

const loadForecast = async (location) => {
    try {
        const res  = await fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`);
        const data = await res.json();
        const strip = document.getElementById('forecastStrip');

        if (!data.forecast?.length) { strip.innerHTML = '<p style="color:#999">No forecast available</p>'; return; }

        strip.innerHTML = data.forecast.slice(0, 5).map((day, i) => {
            const isToday = i === 0;
            const d = new Date(day.date);
            const dayLabel = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
            return `
            <div class="fc-day ${isToday ? 'fc-day--today' : ''}">
                <div class="fc-day-name">${dayLabel}</div>
                <div class="fc-icon">${weatherIcon(day.condition)}</div>
                <div class="fc-high">${Math.round(day.temp)}°</div>
                <div class="fc-low">${Math.round(day.temp - 8)}°</div>
                <div class="fc-rain">💧 ${day.humidity}%</div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Forecast error:', e);
    }
};

const loadStats = async () => {
    try {
        const res  = await fetch(`${BASE}/analytics/stats`, { headers: authHeaders });
        const data = await res.json();

        document.getElementById('statOrders').textContent  = data.ordersToday;
        document.getElementById('statRevenue').textContent = formatCurrency(data.monthlyRevenue);
        document.getElementById('ordersDelta').textContent = `↑ +${data.ordersToday}`;
        document.getElementById('revDelta').textContent    = '+18%';

        const badge = document.getElementById('ordersBadge');
        if (data.ordersToday > 0) badge.textContent = data.ordersToday;

        renderPendingOrders(data.recentOrders);
    } catch (e) {
        console.error('Stats error:', e);
    }
};

const renderPendingOrders = (orders) => {
    const container = document.getElementById('pendingOrders');
    if (!orders?.length) {
        container.innerHTML = '<p class="order-loading">No recent orders</p>';
        return;
    }

    container.innerHTML = orders.map(o => {
        const itemText = o.items?.map(i => `${i.name} ${i.quantity}kg`).join(' · ') || '';
        const statusLabel = o.status.replace('_', ' ');
        return `
        <div class="order-row">
            <div class="order-row-top">
                <span class="order-id">#${o.receiptId || o._id.slice(-4).toUpperCase()}</span>
                <span class="order-status status--${o.status}">${statusLabel}</span>
                <span class="order-amount">${formatCurrency(o.total)}</span>
            </div>
            <div class="order-customer">${o.customer?.username || 'Customer'}</div>
            <div class="order-items-text">${itemText}</div>
        </div>`;
    }).join('');
};

const loadRevenueChart = async (period = 'week') => {
    try {
        const res  = await fetch(`${BASE}/analytics/monthly`, { headers: authHeaders });
        const data = await res.json();

        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const labels   = data.map(d => monthNames[d.month - 1]);
        const revenues = data.map(d => d.revenue);

        const total = revenues.reduce((s, v) => s + v, 0);
        document.getElementById('weekTotal').textContent = formatCurrency(total);

        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (window._revenueChart) window._revenueChart.destroy();

        window._revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: revenues,
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46,125,50,0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#2e7d32'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: {
                    callbacks: { label: ctx => formatCurrency(ctx.parsed.y) }
                }},
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' }},
                    y: { grid: { color: '#f0f0f0' }, ticks: {
                        font: { size: 11 }, color: '#9ca3af',
                        callback: v => '₦' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
                    }, border: { display: false }}
                }
            }
        });
    } catch (e) {
        console.error('Chart error:', e);
    }
};

const loadNotifications = async () => {
    try {
        const res  = await fetch(`${BASE}/notifications`, { headers: authHeaders });
        const data = await res.json();
        const msgBadge = document.getElementById('messagesBadge');
        if (data.unreadCount > 0) msgBadge.textContent = data.unreadCount;
    } catch (e) {
        console.error('Notifications error:', e);
    }
};

document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadRevenueChart(tab.dataset.period);
    });
});

document.querySelectorAll('.task-item input[type="checkbox"]').forEach((cb, i, all) => {
    cb.addEventListener('change', () => {
        const done  = [...all].filter(c => c.checked).length;
        const total = all.length;
        document.getElementById('taskProgress').textContent = `${done} / ${total} done`;
        document.getElementById('taskFill').style.width = `${(done / total) * 100}%`;
        const label = cb.closest('.task-item').querySelector('span:not(.dot)');
        if (cb.checked) label.classList.add('task-done');
        else label.classList.remove('task-done');
    });
});

const initTaskProgress = () => {
    const all  = document.querySelectorAll('.task-item input[type="checkbox"]');
    const done = [...all].filter(c => c.checked).length;
    document.getElementById('taskProgress').textContent = `${done} / ${all.length} done`;
    document.getElementById('taskFill').style.width = `${(done / all.length) * 100}%`;
};

loadProfile();
loadStats();
loadRevenueChart();
loadNotifications();
initTaskProgress();
