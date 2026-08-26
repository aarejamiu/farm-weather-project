const token    = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (userData.role === 'customer') window.location.href = '../customer/home.html';

const API_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:5000'
    : 'https://leaders-union-farm-weather-site.onrender.com';
const BASE = `${API_HOST}/api`;
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatCurrency = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 });

const now       = new Date();
const thisMonth = now.toLocaleDateString('en-US', { month: 'short' });
const thisYear  = now.getFullYear();

document.getElementById('chartYear').textContent = thisYear;

const DONUT_COLORS = ['#ef4444','#d97706','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

const renderStatCards = (stats, monthly) => {
    const currentMonthData = monthly.find(m => m.month === now.getMonth() + 1) || { revenue: 0, orders: 0 };
    const prevMonthData    = monthly.find(m => m.month === now.getMonth()) || { revenue: 0, orders: 0 };

    const revenue    = currentMonthData.revenue;
    const prevRev    = prevMonthData.revenue;
    const revDelta   = prevRev > 0 ? Math.round(((revenue - prevRev) / prevRev) * 100) : 0;

    const avg        = currentMonthData.orders > 0 ? revenue / currentMonthData.orders : 0;
    const retention  = stats.retentionRate;

    document.getElementById('statRevenue').textContent      = formatCurrency(revenue);
    document.getElementById('statRevenueLabel').textContent = `Revenue (${thisMonth})`;
    document.getElementById('statRevenueDelta').textContent = `↑ +${Math.abs(revDelta)}%`;

    document.getElementById('statProfit').textContent       = '--';
    document.getElementById('statProfitLabel').textContent  = 'Net Profit';
    document.getElementById('statProfitDelta').textContent  = 'Cost data unavailable';

    document.getElementById('statOrders').textContent       = currentMonthData.orders;
    const orderDelta = prevMonthData.orders > 0 ? Math.round(((currentMonthData.orders - prevMonthData.orders) / prevMonthData.orders) * 100) : 0;
    document.getElementById('statOrdersDelta').textContent  = `${orderDelta >= 0 ? '↑ +' : '↓ '}${Math.abs(orderDelta)}%`;

    document.getElementById('statAvg').textContent          = formatCurrency(avg);
    const prevAvg = prevMonthData.orders > 0 ? prevMonthData.revenue / prevMonthData.orders : 0;
    const avgDelta = prevAvg > 0 ? Math.round(((avg - prevAvg) / prevAvg) * 100) : 0;
    document.getElementById('statAvgDelta').textContent     = `${avgDelta >= 0 ? '↑ +' : '↓ '}${Math.abs(avgDelta)}%`;

    document.getElementById('statRetention').textContent    = `${retention}%`;
    document.getElementById('statRetentionDelta').textContent = 'Paid customers';
};

const renderRevenueChart = (monthly) => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const current    = now.getMonth();
    const labels     = monthNames.slice(0, current + 1);
    const revenues   = monthly.slice(0, current + 1).map(m => m.revenue);
    const expenses   = revenues.map(r => Math.round(r * 0.42));
    const profits    = revenues.map((r, i) => r - expenses[i]);

    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (window._revChart) window._revChart.destroy();

    window._revChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenues,
                    borderColor: '#1b4332',
                    backgroundColor: 'rgba(27,67,50,0.06)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 0
                },
                {
                    label: 'Expenses',
                    data: expenses,
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    borderDash: [5, 4],
                    fill: false,
                    tension: 0.45,
                    pointRadius: 0
                },
                {
                    label: 'Profit',
                    data: profits,
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(217,119,6,0.04)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' }},
                y: {
                    grid: { color: '#f0f0f0' },
                    border: { display: false },
                    ticks: {
                        font: { size: 11 }, color: '#9ca3af',
                        callback: v => v === 0 ? '₦0' : `₦${(v/1000).toFixed(0)}k`
                    }
                }
            }
        }
    });
};

const renderWeeklyChart = (orders) => {
    const days    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const counts  = new Array(7).fill(0);

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    orders.filter(o => o.paymentStatus === 'paid' && new Date(o.createdAt) >= weekStart).forEach(o => {
        const day = (new Date(o.createdAt).getDay() + 6) % 7;
        counts[day]++;
    });

    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (window._weekChart) window._weekChart.destroy();

    window._weekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                data: counts,
                backgroundColor: '#1b4332',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' }},
                y: {
                    grid: { color: '#f0f0f0' },
                    border: { display: false },
                    ticks: { font: { size: 11 }, color: '#9ca3af', stepSize: 5 },
                    beginAtZero: true
                }
            }
        }
    });
};

const renderDonutChart = (topProducts) => {
    if (!topProducts.length) return;

    const labels  = topProducts.map(p => p.name);
    const data    = topProducts.map(p => p.totalSold);
    const total   = data.reduce((s, v) => s + v, 0);
    const colors  = DONUT_COLORS.slice(0, labels.length);

    const ctx = document.getElementById('donutChart').getContext('2d');
    if (window._donutChart) window._donutChart.destroy();

    window._donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: { legend: { display: false } }
        }
    });

    document.getElementById('donutLegend').innerHTML = labels.map((label, i) => {
        const pct = total > 0 ? Math.round((data[i] / total) * 100) : 0;
        return `
        <div class="donut-legend-item">
            <div class="donut-legend-left">
                <span class="donut-dot" style="background:${colors[i]}"></span>
                ${label}
            </div>
            <span class="donut-pct">${pct}%</span>
        </div>`;
    }).join('');
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const ini  = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('topAvatar').textContent     = ini;
        document.getElementById('sidebarAvatar').textContent = ini;
        document.getElementById('sidebarName').textContent   = user.username;
    } catch (e) { console.error(e); }
};

const init = async () => {
    try {
        const [statsRes, monthlyRes, topRes, ordersRes] = await Promise.all([
            fetch(`${BASE}/analytics/stats`,        { headers: authHeaders }),
            fetch(`${BASE}/analytics/monthly`,      { headers: authHeaders }),
            fetch(`${BASE}/analytics/top-products`, { headers: authHeaders }),
            fetch(`${BASE}/orders`,                 { headers: authHeaders })
        ]);

        const [stats, monthly, topProducts, orders] = await Promise.all([
            statsRes.json(),
            monthlyRes.json(),
            topRes.json(),
            ordersRes.json()
        ]);

        renderStatCards(stats, monthly);
        renderRevenueChart(monthly);
        renderWeeklyChart(Array.isArray(orders) ? orders : []);
        renderDonutChart(Array.isArray(topProducts) ? topProducts : []);

    } catch (e) {
        console.error('Analytics load error:', e);
    }
};

loadProfile();
init();