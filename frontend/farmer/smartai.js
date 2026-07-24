const token = localStorage.getItem('token');
if (!token) window.location.href = '../login.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

let weatherData   = null;
let forecastData  = null;
let generatedInsights = [];

const loadProfile = async () => {
    const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
    if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return null; }
    const user = await res.json();
    const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('topAvatar').textContent     = initials;
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('sidebarName').textContent   = user.username;
    return user;
};

const fetchWeatherData = async (location) => {
    const [wRes, fRes] = await Promise.all([
        fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`),
        fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`)
    ]);
    const [w, f] = await Promise.all([wRes.json(), fRes.json()]);
    weatherData  = w.weather;
    forecastData = f.forecast;
};

/* ─────────────────────────────────────────
   RULE ENGINE
   Each rule receives { weather, forecast }
   and returns an insight object or null
───────────────────────────────────────── */
const rules = [

    ({ weather, forecast }) => {
        if (!weather) return null;
        const rainToday = forecast?.[0]?.rainProbability ?? 0;
        if (rainToday >= 60) {
            return {
                category: 'Irrigation',
                priority: 'info',
                icon: 'droplet',
                iconColor: 'blue',
                title: 'No irrigation needed today',
                desc: `Rain probability is ${rainToday}% today. Skip irrigation to conserve water and avoid waterlogging. Monitor soil after rainfall and irrigate only if the rain is below 10mm.`,
                actionLabel: 'View Forecast →',
                actionColor: 'blue',
                actionHref: 'weather.html'
            };
        }
        if (weather.humidity < 40) {
            return {
                category: 'Irrigation',
                priority: 'urgent',
                icon: 'droplet',
                iconColor: 'red',
                title: 'Low humidity — irrigation recommended',
                desc: `Humidity is at ${weather.humidity}%, which is below the optimal range. Soil moisture is likely dropping. Recommend 20–25 litres per square metre before 08:00 tomorrow.`,
                actionLabel: 'Schedule Irrigation →',
                actionColor: 'blue',
                actionHref: 'farm-planner.html'
            };
        }
        return null;
    },

    ({ weather, forecast }) => {
        if (!forecast?.length) return null;
        const tomorrow = forecast[1];
        if (!tomorrow) return null;
        const rainTomorrow = tomorrow.rainProbability ?? 0;
        if (rainTomorrow >= 50) {
            return {
                category: 'Fertilizer',
                priority: 'medium',
                icon: 'leaf',
                iconColor: 'yellow',
                title: 'Delay fertilizer application',
                desc: `Rain probability tomorrow is ${rainTomorrow}%. Applying fertilizer before rain causes nutrient runoff and waste. Reschedule application to after the rain window clears — check the 3-day forecast before proceeding.`,
                actionLabel: 'Check Forecast →',
                actionColor: 'yellow',
                actionHref: 'weather.html'
            };
        }
        if (rainTomorrow < 20) {
            return {
                category: 'Fertilizer',
                priority: 'good',
                icon: 'leaf',
                iconColor: 'green',
                title: 'Good window for fertilizer application',
                desc: `Rain probability tomorrow is only ${rainTomorrow}%. Dry conditions in the next 24–48 hours make this a suitable window to apply fertilizer. Morning application before 09:00 is recommended.`,
                actionLabel: 'Add to Planner →',
                actionColor: 'green',
                actionHref: 'farm-planner.html'
            };
        }
        return null;
    },

    ({ weather }) => {
        if (!weather) return null;
        const humid  = weather.humidity;
        const temp   = weather.temp;
        if (humid > 75 && temp > 26) {
            return {
                category: 'Pest Alert',
                priority: 'urgent',
                icon: 'bug',
                iconColor: 'red',
                title: 'High fungal and pest risk conditions',
                desc: `Temperature is ${Math.round(temp)}°C with ${humid}% humidity — ideal conditions for fungal diseases, aphids, and mites. Inspect crops closely. Consider preventive neem oil spray on vulnerable plants. Ensure good air circulation.`,
                actionLabel: 'Add Inspection Task →',
                actionColor: 'red',
                actionHref: 'farm-planner.html'
            };
        }
        if (humid > 60 && temp > 24) {
            return {
                category: 'Pest Alert',
                priority: 'medium',
                icon: 'bug',
                iconColor: 'yellow',
                title: 'Moderate pest risk — monitor closely',
                desc: `Current conditions (${Math.round(temp)}°C, ${humid}% humidity) are moderately favourable for pests. Weekly inspection is advised. Focus on undersides of leaves and stem joints for early signs of infestation.`,
                actionLabel: 'Schedule Inspection →',
                actionColor: 'yellow',
                actionHref: 'farm-planner.html'
            };
        }
        return null;
    },

    ({ weather, forecast }) => {
        if (!weather) return null;
        const temp = weather.temp;
        if (temp > 34) {
            return {
                category: 'Weather Alert',
                priority: 'urgent',
                icon: 'thermometer',
                iconColor: 'red',
                title: `Extreme heat — ${Math.round(temp)}°C today`,
                desc: `Temperatures above 34°C can cause heat stress in most crops, especially tomatoes and peppers. Avoid transplanting seedlings today. Increase irrigation frequency. Use mulch to retain soil moisture and reduce heat.`,
                actionLabel: 'View Weather →',
                actionColor: 'red',
                actionHref: 'weather.html'
            };
        }
        if (temp >= 28 && temp <= 33) {
            return {
                category: 'Weather',
                priority: 'info',
                icon: 'thermometer',
                iconColor: 'blue',
                title: `Warm conditions — ${Math.round(temp)}°C`,
                desc: `Temperatures are warm but within acceptable range for most tropical crops. Ensure adequate watering. Avoid field activities between 12:00 and 15:00 to protect both crops and workers.`,
                actionLabel: null
            };
        }
        return null;
    },

    ({ weather, forecast }) => {
        if (!forecast?.length) return null;
        const rainDays = forecast.filter(d => (d.rainProbability ?? 0) >= 50).length;
        if (rainDays >= 3) {
            return {
                category: 'Harvest',
                priority: 'urgent',
                icon: 'harvest',
                iconColor: 'yellow',
                title: 'Harvest ripe crops before extended rain',
                desc: `${rainDays} out of the next 7 days show significant rainfall. Ripe or near-ripe crops are at risk of splitting, rotting, or fungal damage if left in the field. Prioritise harvesting tomatoes, peppers, and other mature produce now.`,
                actionLabel: 'Schedule Harvest →',
                actionColor: 'yellow',
                actionHref: 'farm-planner.html'
            };
        }
        return null;
    },

    ({ weather }) => {
        if (!weather) return null;
        const wind = weather.wind * 3.6;
        if (wind > 30) {
            return {
                category: 'Weather Alert',
                priority: 'urgent',
                icon: 'wind',
                iconColor: 'red',
                title: `Strong winds — ${Math.round(wind)} km/h`,
                desc: `Wind speed is high. Avoid pesticide and herbicide spraying as spray drift will reduce effectiveness and may damage nearby plants. Stake tall crops like maize and tomatoes to prevent lodging. Delay any transplanting.`,
                actionLabel: null
            };
        }
        if (wind > 20) {
            return {
                category: 'Wind Advisory',
                priority: 'medium',
                icon: 'wind',
                iconColor: 'yellow',
                title: `Moderate winds — ${Math.round(wind)} km/h`,
                desc: `Wind speed is moderate. Spray applications may have reduced efficiency. Early morning (before 08:00) is the best window for any spraying activities when winds are typically calmer.`,
                actionLabel: null
            };
        }
        return null;
    },

    ({ weather, forecast }) => {
        if (!weather || !forecast?.length) return null;
        const rainToday = forecast[0]?.rainProbability ?? 0;
        const temp      = weather.temp;
        const wind      = weather.wind * 3.6;
        const humid     = weather.humidity;

        const goodDay = rainToday < 30 && temp >= 22 && temp <= 32 && wind < 20 && humid < 70;
        if (goodDay) {
            return {
                category: 'Farm Conditions',
                priority: 'good',
                icon: 'check',
                iconColor: 'green',
                title: 'Excellent farming conditions today',
                desc: `Weather conditions are ideal — ${Math.round(temp)}°C, ${humid}% humidity, ${Math.round(wind)} km/h wind, and only ${rainToday}% chance of rain. Good day for planting, transplanting, spraying, or any field activity.`,
                actionLabel: 'Open Planner →',
                actionColor: 'green',
                actionHref: 'farm-planner.html'
            };
        }
        return null;
    }

];

/* ─────────────────────────────────────────
   SVG ICONS FOR INSIGHT CARDS
───────────────────────────────────────── */
const icons = {
    droplet:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    leaf:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    bug:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2l1.88 1.88M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 4-4"/><path d="M17.47 9C19.4 8.8 21 7.1 21 5"/><path d="M21 13h-4"/><path d="M21 21c0-2.1-1.7-3.9-4-4"/></svg>`,
    thermometer: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
    harvest:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    wind:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
    check:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
};

const priorityBadge = { urgent: 'Urgent', medium: 'Medium', info: 'Info', good: 'Good' };

const renderInsight = (insight) => {
    const actionHTML = insight.actionLabel
        ? `<a href="${insight.actionHref}" class="insight-action insight-action--${insight.actionColor}">${insight.actionLabel}</a>`
        : '';
    return `
    <div class="insight-card insight-card--${insight.priority}">
        <div class="insight-icon insight-icon--${insight.iconColor}">
            ${icons[insight.icon] || ''}
        </div>
        <div class="insight-body">
            <div class="insight-top">
                <span class="insight-category">${insight.category}</span>
                <span class="insight-badge badge--${insight.priority}">${priorityBadge[insight.priority]}</span>
            </div>
            <div class="insight-title">${insight.title}</div>
            <div class="insight-desc">${insight.desc}</div>
            ${actionHTML}
        </div>
    </div>`;
};

const runEngine = () => {
    const context = { weather: weatherData, forecast: forecastData };
    generatedInsights = rules.map(rule => {
        try { return rule(context); } catch { return null; }
    }).filter(Boolean);

    const list    = document.getElementById('insightsList');
    const urgent  = generatedInsights.filter(i => i.priority === 'urgent').length;
    const total   = generatedInsights.length;

    document.getElementById('insightsMeta').textContent =
        total > 0 ? `${total} item${total !== 1 ? 's' : ''} · ${urgent} require action` : 'No active insights';

    document.getElementById('statAlerts').textContent   = urgent;
    document.getElementById('statFollowed').textContent = total > 0 ? Math.round((1 - urgent / total) * 100) + '%' : '--';

    if (total === 0) {
        list.innerHTML = `<div class="insights-empty">No active insights at the moment. Farm conditions look stable.</div>`;
        return;
    }

    const order = { urgent: 0, medium: 1, info: 2, good: 3 };
    const sorted = [...generatedInsights].sort((a, b) => order[a.priority] - order[b.priority]);
    list.innerHTML = sorted.map(renderInsight).join('');
};

/* ─────────────────────────────────────────
   CHAT
───────────────────────────────────────── */
const appendMsg = (text, role) => {
    const box = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
};

const buildContext = () => {
    if (!weatherData) return 'Weather data not available.';
    const w = weatherData;
    const f = forecastData?.[0];
    return `Weather: ${Math.round(w.temp)}°C, ${w.humidity}% humidity, wind ${(w.wind * 3.6).toFixed(0)} km/h, condition: ${w.condition}. Rain probability today: ${f?.rainProbability ?? 0}%. Active insights: ${generatedInsights.map(i => i.title).join('; ')}.`;
};

const askAI = async (question) => {
    const typing = appendMsg('Thinking...', 'typing');

    try {
        const res  = await fetch(`${BASE}/ai/ask`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                question,
                context: buildContext()
            })
        });
        const data = await res.json();
        typing.remove();
        const reply = data.reply || 'I could not generate a response. Please try again.';
        appendMsg(reply, 'ai');
    } catch (e) {
        typing.remove();
        appendMsg('Unable to connect to AI. Please check your connection.', 'ai');
    }
};

const sendMessage = () => {
    const input = document.getElementById('chatInput');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMsg(text, 'user');
    askAI(text);
};

document.getElementById('chatSend').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
const init = async () => {
    try {
        const user = await loadProfile();
        if (!user) return;

        const location = (user.farmLocation || '').trim() || 'Lagos';

        try {
            await fetchWeatherData(location);
        } catch (e) {
            console.warn('Weather fetch failed:', e);
        }

        runEngine();
    } catch (e) {
        console.error('Smart AI init error:', e);
        document.getElementById('insightsList').innerHTML =
            '<div class="insights-empty">Could not load farm data. Ensure your farm location is set in Settings.</div>';
        document.getElementById('insightsMeta').textContent = 'Error loading data';
    }
};

init();

// Reinitialise after DOM is ready to ensure sidebar and layout are in place
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SidebarComponent.init('smart-ai'));
} else {
    SidebarComponent.init('smart-ai');
}