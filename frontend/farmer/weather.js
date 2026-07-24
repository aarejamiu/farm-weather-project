const token = localStorage.getItem('token');
if (!token) window.location.href = '../login.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';

const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

const conditionLabel = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return 'Sunny & Clear';
    if (c.includes('thunder')) return 'Stormy';
    if (c.includes('heavy rain')) return 'Heavy Rain';
    if (c.includes('rain')) return 'Rainy';
    if (c.includes('shower')) return 'Showers';
    if (c.includes('overcast')) return 'Overcast';
    if (c.includes('cloud')) return 'Partly Cloudy';
    return cond.charAt(0).toUpperCase() + cond.slice(1);
};

const weatherSVGs = {
    sunny: `<svg class="weather-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="22" fill="#f59e0b" opacity="0.9"/>
        <line x1="50" y1="10" x2="50" y2="20" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="80" x2="50" y2="90" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="10" y1="50" x2="20" y2="50" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="50" x2="90" y2="50" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="21" y1="21" x2="28" y2="28" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="72" y1="72" x2="79" y2="79" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="79" y1="21" x2="72" y2="28" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="28" y1="72" x2="21" y2="79" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    cloudy: `<svg class="weather-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="55" cy="52" rx="28" ry="18" fill="rgba(255,255,255,0.25)"/>
        <ellipse cx="38" cy="58" rx="20" ry="14" fill="rgba(255,255,255,0.2)"/>
        <ellipse cx="50" cy="44" rx="16" ry="12" fill="rgba(255,255,255,0.2)"/>
    </svg>`,
    rain: `<svg class="weather-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="40" rx="28" ry="16" fill="rgba(255,255,255,0.2)"/>
        <line x1="35" y1="62" x2="30" y2="76" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="62" x2="45" y2="76" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
        <line x1="65" y1="62" x2="60" y2="76" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    storm: `<svg class="weather-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="36" rx="28" ry="16" fill="rgba(255,255,255,0.15)"/>
        <polyline points="55,54 44,70 52,70 41,86" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

const getWeatherSVG = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return weatherSVGs.sunny;
    if (c.includes('thunder') || c.includes('storm')) return weatherSVGs.storm;
    if (c.includes('rain') || c.includes('shower')) return weatherSVGs.rain;
    return weatherSVGs.cloudy;
};

const forecastIconSVG = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) {
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="#f59e0b"/>
            <line x1="12" y1="2" x2="12" y2="5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            <line x1="2" y1="12" x2="5" y2="12" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            <line x1="19" y1="12" x2="22" y2="12" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
    if (c.includes('thunder') || c.includes('storm')) {
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <polyline points="13,11 11,15 14,15 12,19" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    if (c.includes('rain') || c.includes('shower')) {
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="8" y1="19" x2="8" y2="21" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="19" x2="12" y2="21" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            <line x1="16" y1="19" x2="16" y2="21" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
    return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9Z" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
};



const buildTempHumidityChart = (currentTemp, currentHumidity) => {
    const hours = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00'];
    const temps = hours.map((_, i) => {
        const delta = [0, 1, 2.5, 3.5, 3, 2, 1, 0.5][i];
        return +(currentTemp - 4 + delta).toFixed(1);
    });
    const humids = hours.map((_, i) => {
        const delta = [0, -4, -8, -12, -10, -7, -3, 0][i];
        return Math.min(100, Math.max(0, currentHumidity + delta));
    });

    const ctx = document.getElementById('tempHumidityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Temperature °C',
                    data: temps,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.05)',
                    borderWidth: 2,
                    tension: 0.45,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Humidity %',
                    data: humids,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.05)',
                    borderWidth: 2,
                    tension: 0.45,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' }},
                y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#9ca3af' }, border: { display: false }, min: 0 }
            }
        }
    });
};

const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];



const loadWeatherPage = async () => {
    try {
        const profileRes = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (profileRes.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await profileRes.json();

        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('sidebarAvatar').textContent = initials;
        document.getElementById('topAvatar').textContent     = initials;
        document.getElementById('sidebarName').textContent   = user.username;

        const location = user.farmLocation || '';
        if (location) {
            document.getElementById('heroLocation').textContent = location.toUpperCase();

            const [weatherRes, forecastRes] = await Promise.all([
                fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`),
                fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`)
            ]);

            const [weatherData, forecastData] = await Promise.all([
                weatherRes.json(),
                forecastRes.json()
            ]);

            if (weatherData.weather) {
                const w = weatherData.weather;
                document.getElementById('heroTemp').textContent      = Math.round(w.temp);
                document.getElementById('heroCondition').textContent = conditionLabel(w.condition);
                document.getElementById('heroFeels').textContent     = `Feels like ${Math.round(w.temp + 2)}°C · High ${Math.round(w.temp)}° · Low ${Math.round(w.temp - 8)}°`;
                document.getElementById('heroHumidity').textContent  = `${w.humidity}%`;
                document.getElementById('heroWind').textContent      = `${(w.wind * 3.6).toFixed(0)} km/h`;
                document.getElementById('heroVisibility').textContent = '18 km';
                document.getElementById('heroPressure').textContent  = '1013 hPa';
                document.getElementById('lastUpdated').textContent   = 'Updated just now';
                document.getElementById('weatherIconWrap').innerHTML = getWeatherSVG(w.condition);
                buildTempHumidityChart(w.temp, w.humidity);
            }

            if (forecastData.forecast?.length) {
                const table = document.getElementById('forecastTable');
                table.innerHTML = forecastData.forecast.slice(0, 7).map(day => {
                    const d       = new Date(day.date);
                    const dayName = dayNames[d.getDay()];
                    const label   = conditionLabel(day.condition);
                    const windKph = (day.wind * 3.6).toFixed(0);
                    const low     = Math.round(day.tempMin ?? day.temp - 8);
                    return `
                    <div class="forecast-row">
                        <div class="fc-day-name">${dayName}</div>
                        <div class="fc-icon-wrap">${forecastIconSVG(day.condition)}</div>
                        <div class="fc-condition">${label}</div>
                        <div class="fc-rain-chance">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                            ${day.humidity}%
                        </div>
                        <div class="fc-wind-speed">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/></svg>
                            <span>${windKph}</span> km/h
                        </div>
                        <div class="fc-temps">
                            <span>${Math.round(day.temp)}&deg;</span>
                            <span class="fc-temp-low">${low}&deg;</span>
                        </div>
                    </div>`;
                }).join('');
            }
        }
    } catch (e) {
        console.error('Weather page error:', e);
    }
};

loadWeatherPage();