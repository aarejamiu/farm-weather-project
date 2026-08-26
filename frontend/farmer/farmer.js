const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (user.role === 'customer') window.location.href = '../customer/home.html';

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

const weatherLabel = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return '<span class="fc-cond-label fc-cond--sunny">Clear</span>';
    if (c.includes('thunder')) return '<span class="fc-cond-label fc-cond--storm">Storm</span>';
    if (c.includes('rain')) return '<span class="fc-cond-label fc-cond--rain">Rain</span>';
    if (c.includes('shower')) return '<span class="fc-cond-label fc-cond--shower">Shower</span>';
    if (c.includes('cloud') || c.includes('overcast')) return '<span class="fc-cond-label fc-cond--cloud">Cloudy</span>';
    return '<span class="fc-cond-label">Fair</span>';
};

const renderProfile = (user) => {
    const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('topAvatar').textContent     = initials;
    document.getElementById('sidebarName').textContent   = user.username;

    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('pageSubtitle').textContent  = `${dateStr} · ${greet()}, ${user.username.split(' ')[0]}`;
};

const renderWeather = (w) => {
    document.getElementById('statTemp').textContent  = `${Math.round(w.temp)}°C`;
    document.getElementById('statRain').textContent  = `${w.humidity}%`;
    document.getElementById('tempDelta').textContent = `↑ +2°`;
    document.getElementById('rainDelta').textContent = `↑ ${w.humidity > 60 ? 'High' : 'Low'}`;
};

const renderForecast = (forecast, location) => {
    const strip = document.getElementById('forecastStrip');
    document.getElementById('forecastLocation').textContent = location;

    if (!forecast?.length) {
        strip.innerHTML = '<p style="color:#999">No forecast available</p>';
        return;
    }

    strip.innerHTML = forecast.slice(0, 5).map((day, i) => {
        const isToday  = i === 0;
        const d        = new Date(day.date);
        const dayLabel = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
        return `
        <div class="fc-day ${isToday ? 'fc-day--today' : ''}">
            <div class="fc-day-name">${dayLabel}</div>
            <div class="fc-icon">${weatherLabel(day.condition)}</div>
            <div class="fc-high">${Math.round(day.temp)}°</div>
            <div class="fc-low">${Math.round(day.tempMin ?? day.temp - 8)}°</div>
            <div class="fc-rain">${day.humidity}%</div>
        </div>`;
    }).join('');
};

const renderStats = (data) => {
    document.getElementById('statOrders').textContent  = data.ordersToday;
    document.getElementById('statRevenue').textContent = formatCurrency(data.monthlyRevenue);
    document.getElementById('ordersDelta').textContent = `↑ +${data.ordersToday}`;
    document.getElementById('revDelta').textContent    = '+18%';

    const badge = document.getElementById('ordersBadge');
    if (data.ordersToday > 0) badge.textContent = data.ordersToday;

    const container = document.getElementById('pendingOrders');
    if (!data.recentOrders?.length) {
        container.innerHTML = '<p class="order-loading">No recent orders</p>';
        return;
    }
    container.innerHTML = data.recentOrders.map(o => {
        const itemText    = o.items?.map(i => `${i.name} ${i.quantity}kg`).join(' · ') || '';
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

const renderAIRecommendations = (reply) => {
    const list = document.getElementById('aiRecommendations');
    if (!list) return;

    const recommendations = reply
        .split(/\n+/)
        .map(item => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 3);

    list.innerHTML = '';
    recommendations.forEach((recommendation, index) => {
        const item = document.createElement('div');
        item.className = `ai-item${index === 2 ? ' ai-item--warn' : ''}`;

        const dot = document.createElement('div');
        dot.className = `ai-item-dot ai-item-dot--${index === 0 ? 'blue' : index === 1 ? 'green' : 'orange'}`;

        const text = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'ai-item-title';
        title.textContent = recommendation;
        text.appendChild(title);
        item.append(dot, text);
        list.appendChild(item);
    });

    if (!recommendations.length) {
        list.innerHTML = '<div class="ai-item"><div class="ai-item-sub">No recommendation was returned.</div></div>';
    }
};

const loadAIRecommendations = async (context) => {
    const list = document.getElementById('aiRecommendations');
    try {
        const response = await fetch(`${BASE}/ai/ask`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                question: 'Give exactly three concise, practical recommendations for today. Put each recommendation on its own line and include the reason in the same line. Use only the supplied farm context; do not invent crop observations.',
                context
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'AI recommendations unavailable');
        renderAIRecommendations(data.reply || '');
    } catch (error) {
        console.error('AI recommendations error:', error);
        if (list) list.innerHTML = '<div class="ai-item"><div class="ai-item-sub">AI recommendations are unavailable right now.</div></div>';
    }
};

const renderRevenueChart = (data) => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const labels     = data.map(d => monthNames[d.month - 1]);
    const revenues   = data.map(d => d.revenue);
    const total      = revenues.reduce((s, v) => s + v, 0);

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
};

const getDashboardTasks = () => {
    try {
        return JSON.parse(localStorage.getItem('farmTasks') || '[]');
    } catch (error) {
        console.error('Failed to parse dashboard tasks:', error);
        return [];
    }
};

const renderDashboardTasks = () => {
    const list = document.querySelector('.task-list');
    if (!list) return;

    const tasks = getDashboardTasks();

    if (!tasks.length) {
        list.innerHTML = '<div class="task-empty">No tasks added yet. Create tasks in the Farm Planner to see them here.</div>';
        document.getElementById('taskProgress').textContent = '0 / 0 done';
        document.getElementById('taskFill').style.width = '0%';
        return;
    }

    const colorMap = {
        irrigation: 'red',
        harvest: 'yellow',
        logistics: 'green',
        pest: 'red'
    };

    list.innerHTML = tasks.map(task => {
        const dotClass = colorMap[task.category] || 'green';
        const checked = task.done ? 'checked' : '';
        const doneClass = task.done ? 'task-done' : '';
        return `
            <div class="task-item">
                <input type="checkbox" data-task-id="${task.id}" ${checked}>
                <span class="${doneClass}">${task.name}${task.date ? ` — ${task.date}` : ''}</span>
                <span class="dot dot--${dotClass}"></span>
            </div>
        `;
    }).join('');

    const inputs = list.querySelectorAll('input[type="checkbox"]');
    const doneCount = tasks.filter(task => task.done).length;

    document.getElementById('taskProgress').textContent = `${doneCount} / ${tasks.length} done`;
    document.getElementById('taskFill').style.width = `${(doneCount / tasks.length) * 100}%`;

    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const allTasks = getDashboardTasks();
            const matchingTask = allTasks.find(task => task.id === input.dataset.taskId);
            if (!matchingTask) return;

            matchingTask.done = input.checked;
            localStorage.setItem('farmTasks', JSON.stringify(allTasks));
            renderDashboardTasks();
        });
    });
};

const initTaskProgress = () => {
    renderDashboardTasks();
    window.addEventListener('storage', (e) => {
        if (e.key === 'farmTasks') {
            renderDashboardTasks();
        }
    });
};

const loadDashboard = async () => {
    try {
        const profileRes = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (profileRes.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await profileRes.json();
        renderProfile(user);

        const location = user.farmLocation || '';

        const [weatherRes, forecastRes, statsRes, chartRes, notifRes] = await Promise.all([
            location ? fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`) : null,
            location ? fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`) : null,
            fetch(`${BASE}/analytics/stats`,   { headers: authHeaders }),
            fetch(`${BASE}/analytics/monthly`, { headers: authHeaders }),
            fetch(`${BASE}/notifications`,     { headers: authHeaders })
        ]);

        let weatherContext = null;
        let forecastContext = [];

        if (weatherRes) {
            const weatherData = await weatherRes.json();
            weatherContext = weatherData.weather || null;
            if (weatherData.weather) renderWeather(weatherData.weather);
        }

        if (forecastRes) {
            const forecastData = await forecastRes.json();
            forecastContext = forecastData.forecast || [];
            renderForecast(forecastData.forecast, location);
        }

        const statsData = await statsRes.json();
        renderStats(statsData);

        const chartData = await chartRes.json();
        renderRevenueChart(chartData);

        const notifData = await notifRes.json();
        const msgBadge  = document.getElementById('messagesBadge');
        if (notifData.unreadCount > 0) msgBadge.textContent = notifData.unreadCount;

        const inventory = JSON.parse(localStorage.getItem('farmInventory') || '[]');
        loadAIRecommendations(JSON.stringify({
            farmLocation: location || 'Not provided',
            weather: weatherContext,
            forecast: forecastContext,
            inventory: inventory.map(item => ({ name: item.name, category: item.category, quantity: item.current, unit: item.unit })),
            tasks: getDashboardTasks().filter(task => !task.done)
        }));

    } catch (e) {
        console.error('Dashboard load error:', e);
    }
};

document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

initTaskProgress();
loadDashboard();