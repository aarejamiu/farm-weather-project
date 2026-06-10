const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
 
const handleUnauthorized = async (res) => {
    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return true;
    }
    return false;
};
 
const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
 
/* ─── Helpers ─── */
const conditionIcon = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('sunny') || c.includes('clear'))   return '☀️';
    if (c.includes('rain'))                            return '🌧️';
    if (c.includes('shower'))                          return '🌦️';
    if (c.includes('overcast') || c.includes('cloud')) return '☁️';
    return '⛅';
};
 
const conditionClass = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('sunny') || c.includes('clear'))    return 'fc-sunny-col';
    if (c.includes('rain') && !c.includes('shower'))   return 'fc-rain-col';
    if (c.includes('shower'))                          return 'fc-shower-col';
    return 'fc-today-col';
};
 
const condTextClass = (cond = '') => {
    const c = cond.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return 'sunny';
    if (c.includes('rain') && !c.includes('shower')) return 'rain';
    if (c.includes('shower')) return 'shower';
    return '';
};
 
const parseDate = (val) => {
    if (!val) return null;
    // Already a Date object
    if (val instanceof Date) return isNaN(val) ? null : val;
    // Numeric timestamp
    if (typeof val === 'number') return new Date(val);
    // String: try direct parse first
    let d = new Date(val);
    if (!isNaN(d)) return d;
    // Try replacing space with T for "2026-06-02 14:23:00" format
    d = new Date(val.replace(' ', 'T'));
    if (!isNaN(d)) return d;
    return null;
};
 
const formatDate = (val) => {
    const d = parseDate(val);
    if (!d) return 'Unknown date';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
 
const dayName = (val) => {
    const d = parseDate(val);
    if (!d) return '---';
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
};
 
/* ─── Calendar ─── */
let calendar;
 
const initCalendar = () => {
    const el = document.getElementById('calendar');
    if (!el) return;
 
    calendar = new FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        height: 'auto',
        fixedWeekCount: false,
        showNonCurrentDates: false,
        headerToolbar: false,
        dayMaxEvents: 1,
 
        datesSet: (info) => {
            const title = document.getElementById('calMonthTitle');
            if (title) {
                title.textContent = info.view.title;
            }
        },
 
        eventClick: (info) => {
            const w = info.event.extendedProps;
            const placeholder = document.getElementById('dateDetailPlaceholder');
            const content     = document.getElementById('dateDetailContent');
            if (placeholder) placeholder.classList.add('hidden');
            if (content) {
                content.classList.remove('hidden');
                document.getElementById('detailLocation').textContent  = `📍 ${w.location}`;
                document.getElementById('detailTemp').textContent      = `🌡️ ${w.temp}°C`;
                document.getElementById('detailHumidity').textContent  = `💧 ${w.humidity}%`;
                document.getElementById('detailWind').textContent      = `💨 ${w.wind} km/h`;
                document.getElementById('detailCondition').textContent = `${conditionIcon(w.condition)} ${w.condition}`;
                document.getElementById('detailNote').textContent      = w.note ? `📝 ${w.note}` : '';
            }
        },
 
        dateClick: async (info) => {
            const clickedDate = info.dateStr;
            const locationFull = document.getElementById('profileLocation').textContent;
            const location = locationFull.split(',')[0].trim();
            if (!location || location === 'Not set') return;
 
            // Store clicked date so Save uses it
            window._selectedDate = clickedDate;
 
            const today   = new Date().toISOString().split('T')[0];
            const isPast  = clickedDate < today;
            const saveCard = document.querySelector('.save-weather-card');
            const heading  = saveCard?.querySelector('h3');
            const sub      = saveCard?.querySelector('.save-sub');
            const noteEl   = document.getElementById('note');
 
            // Show loading state on save card
            if (heading) heading.textContent = `Save Weather — ${clickedDate}`;
            if (sub)     sub.innerHTML       = `⏳ Loading weather for ${clickedDate}...`;
            if (noteEl)  noteEl.value        = '';
 
            try {
                let weather;
 
                if (isPast) {
                    // Use historical endpoint for past dates
                    const res  = await fetch(`${BASE}/weather/historical?location=${encodeURIComponent(location)}&date=${clickedDate}`);
                    if (!res.ok) throw new Error('Historical weather not available');
                    const data = await res.json();
                    weather    = data.historical;
                } else {
                    // Use current weather for today or future
                    const res  = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
                    if (!res.ok) throw new Error('Could not fetch weather');
                    const data = await res.json();
                    weather    = data.weather;
                }
 
                // Store as current weather so Save button works
                window._currentWeather = weather;
 
                // Update save card metric tiles
                document.getElementById('saveTempVal').textContent  = weather.temp      ?? '--';
                document.getElementById('saveHumVal').textContent   = weather.humidity  ?? '--';
                document.getElementById('saveWindVal').textContent  = weather.wind      ?? '--';
 
                // Update stats bar
                document.getElementById('statTemp').textContent     = weather.temp      ?? '--';
                document.getElementById('statHumidity').textContent = weather.humidity  ?? '--';
                document.getElementById('statWind').textContent     = weather.wind      ?? '--';
 
                // Update subtitle with condition
                if (sub) {
                    sub.innerHTML = `${conditionIcon(weather.condition)} <strong>${weather.condition}</strong> &nbsp;&middot;&nbsp; ${weather.city || location}`;
                }
                if (noteEl) noteEl.placeholder = `Add note for ${clickedDate} (e.g. Good day for planting...)`;
 
                // Also load forecast
                await loadForecast(weather.city || location);
 
            } catch (e) {
                console.error('dateClick error:', e.message);
                if (sub) sub.innerHTML = `⚠️ ${e.message || 'Could not load weather for this date.'}`;
            }
 
            // Scroll to and highlight save card
            if (saveCard) {
                saveCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                saveCard.style.transition  = 'box-shadow 0.3s, border-color 0.3s';
                saveCard.style.boxShadow   = '0 0 0 3px rgba(46,125,50,0.45)';
                saveCard.style.borderColor = '#2e7d32';
                setTimeout(() => {
                    saveCard.style.boxShadow   = '';
                    saveCard.style.borderColor = '';
                }, 2500);
            }
        }
    });
 
    calendar.render();
 
    document.getElementById('calPrev')?.addEventListener('click', () => calendar.prev());
    document.getElementById('calNext')?.addEventListener('click', () => calendar.next());
};
 
/* ─── Logout ─── */
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});
 
/* ─── Weather Checker ─── */
document.getElementById('getWeatherBtn')?.addEventListener('click', async () => {
    const location = document.getElementById('search').value.trim();
    if (!location) { alert('Please enter a location'); return; }
    try {
        const res = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
        if (!res.ok) throw new Error((await res.json()).message || 'Unable to fetch weather');
        const { weather } = await res.json();
        renderWeatherResult(weather);
        loadForecast(weather.city);
    } catch (e) {
        alert(e.message || 'Failed to fetch weather');
    }
});
 
const renderWeatherResult = (weather) => {
    const el = document.getElementById('weatherResult');
    el.className = 'weather-result-filled';
    el.innerHTML = `
        <h2>${conditionIcon(weather.condition)} ${weather.city}</h2>
        <p>📍 ${weather.city}</p>
        <p>🌡️ Temp: <strong>${weather.temp}°C</strong></p>
        <p>💧 Humidity: <strong>${weather.humidity}%</strong></p>
        <p>💨 Wind: <strong>${weather.wind} km/h</strong></p>
        <p>${conditionIcon(weather.condition)} ${weather.condition}</p>
    `;
    /* Update save-card metrics */
    document.getElementById('saveTempVal').textContent  = weather.temp;
    document.getElementById('saveHumVal').textContent   = weather.humidity;
    document.getElementById('saveWindVal').textContent  = weather.wind;
    /* Update stats bar */
    document.getElementById('statTemp').textContent     = weather.temp;
    document.getElementById('statHumidity').textContent = weather.humidity;
    document.getElementById('statWind').textContent     = weather.wind;
    /* Navbar badge */
    document.getElementById('weatherBadge').innerHTML =
        `⛅ ${weather.city} · ${weather.temp}°C · ${weather.condition}`;
    /* Store for save */
    window._currentWeather = weather;
};
 
/* ─── Save Weather ─── */
document.getElementById('saveBtn')?.addEventListener('click', async () => {
    const w = window._currentWeather;
    if (!w) { alert('Please check weather for a location first before saving.'); return; }
    const note     = document.getElementById('note').value;
    const location = w.city || w.location || document.getElementById('profileLocation').textContent;
    const date     = window._selectedDate || new Date().toISOString().split('T')[0];
    try {
        const res = await fetch(`${BASE}/dates/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ note, location, temp: w.temp, humidity: w.humidity, wind: w.wind, condition: w.condition, date })
        });
        if (await handleUnauthorized(res)) return;
        const data = await res.json();
        alert(data.message);
 
        // Reset save card heading and selected date after saving
        const saveCard = document.querySelector('.save-weather-card');
        if (saveCard) {
            const heading = saveCard.querySelector('h3');
            const sub     = saveCard.querySelector('.save-sub');
            const noteEl  = document.getElementById('note');
            if (heading) heading.textContent = "Save Today's Weather";
            if (sub)     sub.textContent     = 'Add a note and save current conditions';
            if (noteEl)  noteEl.placeholder  = 'Add farming note (e.g. Good day for planting, soil moisture optimal...)';
            noteEl.value = '';
        }
        window._selectedDate = null;
 
        loadSavedDates();
    } catch (e) { console.error(e); }
});
 
/* ─── Saved Dates ─── */
const loadSavedDates = async () => {
    try {
        const res = await fetch(`${BASE}/dates`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (await handleUnauthorized(res)) return;
        if (!res.ok) throw new Error('Failed to load dates');
        const data = await res.json();
 
        /* Update count badges */
        const count = data.length;
        document.getElementById('savedCount').textContent  = count;
        document.getElementById('savedBadge').textContent  = count;
 
        /* Render list */
        const container = document.getElementById('savedDates');
        container.innerHTML = '';
        data.forEach(item => {
            const isSunny = (item.condition || '').toLowerCase().includes('sunny');
            const div = document.createElement('div');
            div.className = `saved-record${isSunny ? ' sunny-rec' : ''}`;
            div.innerHTML = `
                <div class="sr-top">
                    <div class="sr-icon">${conditionIcon(item.condition)}</div>
                    <div class="sr-info">
                        <div class="sr-date-row">
                            <span class="sr-date">${formatDate(item.date)}</span>
                            <span class="sr-cond${isSunny ? ' sunny-badge' : ''}">${item.condition}</span>
                        </div>
                        <div class="sr-loc">📍 ${item.location}</div>
                    </div>
                    <div class="sr-actions">
                        <button class="btn-del"  title="Delete" data-id="${item._id}">Delete</button>
                    </div>
                </div>
                <div class="sr-stats">
                    <span>🌡️ ${item.temp}°C</span>
                    <span>💧 ${item.humidity}%</span>
                    <span>💨 ${item.wind} km/h</span>
                </div>
                ${item.note ? `<div class="sr-note">"${item.note}"</div>` : ''}
            `;
            div.querySelector('.btn-del').addEventListener('click', () => deleteDate(item._id));
            container.appendChild(div);
        });
 
        /* Push events to calendar */
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(data.map(item => ({
                title: item.note || 'Favorable Weather',
                start: item.date,
                backgroundColor: '#2e7d32',
                borderColor: '#2e7d32',
                textColor: '#fff',
                extendedProps: {
                    location: item.location, temp: item.temp,
                    humidity: item.humidity, wind: item.wind,
                    condition: item.condition, note: item.note
                }
            })));
        }
    } catch (e) { console.error(e); }
};
 
const deleteDate = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
        const res = await fetch(`${BASE}/dates/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (await handleUnauthorized(res)) return;
        loadSavedDates();
    } catch (e) { console.error(e); }
};
 
/* ─── Profile ─── */
const loadProfile = async () => {
    try {
        const res = await fetch(`${BASE}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (await handleUnauthorized(res)) return;
        const data = await res.json();
 
        document.getElementById('profileName').textContent     = data.username;
        document.getElementById('profileEmail').textContent    = data.email;
        document.getElementById('profileLocation').textContent = data.farmLocation || 'Not set';
 
        /* Avatars: initials from username */
        const initials = (data.username || 'JF').slice(0,2).toUpperCase();
        document.querySelectorAll('.profile-avatar, #navAvatar, #navAvatar2').forEach(el => el.textContent = initials);
 
        if (data.farmLocation) {
            document.getElementById('newLocation').value = data.farmLocation;
            await loadWeather(data.farmLocation);
            await loadForecast(data.farmLocation);
        }
    } catch (e) { console.error(e); }
};
 
/* ─── Current Weather (from profile location) ─── */
const loadWeather = async (location) => {
    try {
        const res  = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
        const data = await res.json();
        renderWeatherResult(data.weather);
    } catch (e) { console.error(e); }
};
 
/* ─── Forecast ─── */
let tempChart;
 
const loadForecast = async (location) => {
    try {
        const res = await fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.forecast || !Array.isArray(data.forecast)) return;
 
        document.getElementById('forecastMeta').textContent =
            `${location} · Updated just now`;
 
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';
 
        const labels = [], highs = [], lows = [], hums = [];
 
        data.forecast.forEach((day, i) => {
            labels.push(i === 0 ? 'Today' : dayName(day.date));
            highs.push(day.temp);
            lows.push(day.tempMin ?? day.temp - 5);
            hums.push(day.humidity);
 
            const div = document.createElement('div');
            div.className = `forecast-day ${i === 0 ? 'fc-today-col' : conditionClass(day.condition)}`;
            div.innerHTML = `
                <div class="fd-name">${i === 0 ? 'Today' : dayName(day.date)}</div>
                <div class="fd-icon">${conditionIcon(day.condition)}</div>
                <div class="fd-temp">${day.temp}°C</div>
                <div class="fd-cond ${condTextClass(day.condition)}">${day.condition}</div>
                <div class="fd-stats">
                    <span>💧 ${day.humidity}%</span>
                    <span>💨 ${day.wind} km/h</span>
                    <span>${lows[i]}/${day.temp}°</span>
                </div>
            `;
            container.appendChild(div);
        });
 
        renderChart(labels, highs, lows, hums);
    } catch (e) { console.error(e); }
};
 
const renderChart = (labels, highs, lows, hums) => {
    const ctx = document.getElementById('tempChart');
    if (!ctx) return;
    if (tempChart) tempChart.destroy();
 
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'High °C', data: highs,
                    borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,.1)',
                    pointBackgroundColor: '#4caf50', tension: 0.4,
                    borderWidth: 2, pointRadius: 4
                },
                {
                    label: 'Low °C', data: lows,
                    borderColor: '#42a5f5', backgroundColor: 'rgba(66,165,245,.08)',
                    pointBackgroundColor: '#42a5f5', tension: 0.4,
                    borderWidth: 2, pointRadius: 4
                },
                {
                    label: 'Humidity %', data: hums,
                    borderColor: '#ffa726', backgroundColor: 'rgba(255,167,38,.08)',
                    pointBackgroundColor: '#ffa726', tension: 0.4,
                    borderWidth: 2, pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(0,0,0,.05)' },
                    ticks: { font: { size: 10 }, color: '#8a9e8c' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#8a9e8c' }
                }
            }
        }
    });
};
 
/* ─── Update Location ─── */
document.getElementById('updateLocationBtn')?.addEventListener('click', async () => {
    const loc = document.getElementById('newLocation').value.trim();
    if (!loc) return;
    try {
        const res = await fetch(`${BASE}/profile/location`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ farmLocation: loc })
        });
        if (await handleUnauthorized(res)) return;
        if (!res.ok) throw new Error((await res.text()) || 'Failed to update');
        alert((await res.json()).message);
        loadProfile();
    } catch (e) { console.error(e); }
});
 
/* ─── Init ─── */
initCalendar();
loadSavedDates();
loadProfile();

// const { text } = require("express");

// const token = localStorage.getItem('token');

// if (!token) {
//     window.location.href = 'login.html';
// }

// const handleUnauthorized = async (res) => {
//     if (res.status === 401) {
//         localStorage.removeItem('token');
//         window.location.href = 'login.html';
//         return true;
//     }
//     return false;
// };

// let calendar;

// const initializeCalendar = () => {

//     const calendarEl = document.getElementById('calendar');

//     if (!calendarEl) return;

//     calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: 'dayGridMonth',
//     height: 400,

//     eventClick: function(info){
//         const weather = info.event.extendedProps

//         document.getElementById('detailLocation').textContent= `Location: ${weather.location}`;
//         document.getElementById('detailTemp').textContent= `Temperature: ${weather.temp}⁰C`;
//         document.getElementById('detailHumidity').textContent= `Humidity: ${weather.humidity}%`;
//         document.getElementById('detailWind').textContent= `Wind: ${weather.wind} km/h`;
//         document.getElementById('detailCondition').textContent= `Condition: ${weather.condition}`;
//         document.getElementById('detailNote').textContent= `Note: ${weather.note}`;
//     }
// })

//     calendar.render();
// };

// const logoutBtn = document.getElementById('logoutBtn');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', () => {
//         localStorage.removeItem('token');
//         window.location.href = 'login.html';
//     });
// }
// const getWeatherBtn = document.getElementById('getWeatherBtn');
// if (getWeatherBtn) {
//     getWeatherBtn.addEventListener('click', async () => {
//         const location = document.getElementById('search').value.trim();
//         if (!location) {
//             alert('Please enter a location');
//             return;
//         }

//         try {
//             const res = await fetch(`https://leaders-union-farm-weather-site.onrender.com/api/weather/weather?location=${encodeURIComponent(location)}`);
//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.message || 'Unable to fetch weather');
//             }

//             const data = await res.json();
//             const weather = data.weather;

//             document.getElementById('temp').textContent = `Temp: ${weather.temp} °C`;
//             document.getElementById('humidity').textContent = `Humidity: ${weather.humidity}%`;
//             document.getElementById('wind').textContent = `Wind: ${weather.wind} km/h`;
//             document.getElementById('condition').textContent = `Condition: ${weather.condition}`;
//             document.getElementById('locationDisplay').textContent = `Location: ${weather.city}`;
//             loadForecast(weather.city);
//         } catch (error) {
//             console.error('Error fetching weather:', error);
//             alert(error.message || 'Failed to fetch weather');
//         }
//     });
// }

// const saveBtn = document.getElementById('saveBtn');
// if (saveBtn) {
//     saveBtn.addEventListener('click', async () => {
//         const note = document.getElementById('note').value;
//         const location = document.getElementById('locationDisplay').textContent.split(': ')[1] || document.getElementById('search').value;
//         const temp = parseFloat(document.getElementById('temp').textContent.split(': ')[1]);
//         const humidity = parseFloat(document.getElementById('humidity').textContent.split(': ')[1]);
//         const wind = parseFloat(document.getElementById('wind').textContent.split(': ')[1]);
//         const condition = document.getElementById('condition').textContent.split(': ')[1];

//     try {
//         const res = await fetch("https://leaders-union-farm-weather-site.onrender.com/api/dates/save", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({ note, location, temp, humidity, wind, condition })
//         });

//         if (await handleUnauthorized(res)) return;

//         const data = await res.json();
//         alert(data.message);

//         loadSavedDates();
//     } catch (error) {
//         console.error("Error saving date:", error);
//     }
//     });
// }

// const loadSavedDates = async () => {
//     try {
//         const res = await fetch("https://leaders-union-farm-weather-site.onrender.com/api/dates", {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });

//         if (await handleUnauthorized(res)) return;

//         if (!res.ok) {
//             throw new Error('Failed to load dates');
//         }

//         const data = await res.json();

//         const container = document.getElementById('savedDates');
//         container.innerHTML = '';

//         data.forEach(item => {
//             const div = document.createElement('div');
//             div.classList.add('saved-date');
//             div.innerHTML = `
//                 <p><strong>Location:</strong> ${item.location}</p>
//                 <p><strong>Temp:</strong> ${item.temp}°C</p>
//                 <p><strong>Humidity:</strong> ${item.humidity}%</p>
//                 <p><strong>Wind:</strong> ${item.wind} km/h</p>
//                 <p><strong>Condition:</strong> ${item.condition}</p>
//                 <p><strong>Note:</strong> ${item.note}</p>
//                 <button class="deleteBtn" data-id="${item._id}">Delete</button>
//             `;
//             const deleteBtn = div.querySelector('.deleteBtn');

//             deleteBtn.addEventListener('click', () => {
//             deleteDate(item._id);
//             });
//             container.appendChild(div);
//         });
//     } catch (error) {
//         console.error("Error loading saved dates:", error);
//     }
//     const data= await res.json()
//     if (calendar) {

//     calendar.removeAllEvents();

//     const events = data.map(item => ({
//         title: item.note || "Favorable Weather",
//         start: item.createdAt,

//         backgroundColor: "#2e7d32",
//         borderColor: "#2e7d32",
//         textColor: "#fff",

//         extendedProps: {
//             location: item.location,
//             temp: item.temp,
//             humidity: item.humidity,
//             wind: item.wind,
//             condition: item.condition,
//             note: item.note
//         }
//     }));

//     calendar.addEventSource(events);
// }
// };

// const deleteDate = async (id) => {
//     try {
//         const res = await fetch(`https://leaders-union-farm-weather-site.onrender.com/api/dates/${id}`, {
//             method: "DELETE",
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });

//         if (await handleUnauthorized(res)) return;

//         loadSavedDates();
//     } catch (error) {
//         console.error("Error deleting date:", error);
//     }
// };

// const loadProfile = async () => {
//     try{
//         const res = await fetch("https://leaders-union-farm-weather-site.onrender.com/api/profile", {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });

//         if (await handleUnauthorized(res)) return;

//         const data = await res.json();
//         document.getElementById('profileName').textContent = data.username;
//         document.getElementById('profileEmail').textContent = data.email;
//         document.getElementById('profileLocation').textContent = data.farmLocation || "Not set";

//         if (data.farmLocation){
//             document.getElementById('newLocation').value = data.farmLocation;
        
//         loadWeather(data.farmLocation);
//         loadForecast(data.farmLocation);
//         }
//     } catch (error) {
//         console.error("Error loading profile:", error);
//     }
// };

// const loadWeather = async (location) => {
//     try {
//         const res = await fetch(`https://leaders-union-farm-weather-site.onrender.com/api/weather/weather?location=${encodeURIComponent(location)}`);

//         const data = await res.json();
//         const weather = data.weather;

//         document.getElementById('temp').textContent = `Temp: ${weather.temp} °C`;
//         document.getElementById('humidity').textContent = `Humidity: ${weather.humidity}%`;
//         document.getElementById('wind').textContent = `Wind: ${weather.wind} km/h`;
//         document.getElementById('condition').textContent = `Condition: ${weather.condition}`;
//         document.getElementById('locationDisplay').textContent = `Location: ${weather.city}`;
//     } catch (error) {
//         console.error("Error loading weather:", error);
//     }
// }

// const loadForecast = async (location) => {
//     try {
//         const res = await fetch(`https://leaders-union-farm-weather-site.onrender.com/api/weather/forecast?location=${encodeURIComponent(location)}`);

//         if (!res.ok) {
//             console.error('Forecast API error:', res.status);
//             return;
//         }

//         const data = await res.json();

//         if (!data.forecast || !Array.isArray(data.forecast)) {
//             console.error('Invalid forecast data:', data);
//             return;
//         }

//         const container = document.getElementById('forecastContainer');
//         container.innerHTML = '';

//         data.forecast.forEach(day => {
//             const div = document.createElement('div');
//             div.classList.add('forecast-day');
//             div.innerHTML = `
//                 <p><strong>Date:</strong> ${day.date}</p>
//                 <p><strong>Temp:</strong> ${day.temp}°C</p>
//                 <p><strong>Humidity:</strong> ${day.humidity}%</p>
//                 <p><strong>Wind:</strong> ${day.wind} km/h</p>
//                 <p><strong>Condition:</strong> ${day.condition}</p>
//             `;
//             container.appendChild(div);
//         })
//     }catch (error) {
//         console.error("Error loading forecast:", error);
//     }
// }

// const updateBtn = document.getElementById('updateLocationBtn');

// if (updateBtn) {

// updateBtn.addEventListener('click', async () => {
//     const newLocation = document.getElementById('newLocation').value;

//     try {
//         const res = await fetch("https://leaders-union-farm-weather-site.onrender.com/api/profile/location", {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({ farmLocation: newLocation })
//         });

//         if (await handleUnauthorized(res)) return;

//         if (!res.ok) {
//             const text = await res.text();
//             throw new Error(text || 'Failed to update location');
//         }
//         const data = await res.json();
//         alert(data.message);
//         loadProfile();
//     } catch (error) {
//         console.error("Error updating location:", error);
//     }
// });
// }
// initializeCalendar();
// loadSavedDates();
// loadProfile()