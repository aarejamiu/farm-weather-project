// const token = localStorage.getItem('token');
// if (!token) window.location.href = 'login.html';
 
// const handleUnauthorized = async (res) => {
//     if (res.status === 401) {
//         localStorage.removeItem('token');
//         window.location.href = 'login.html';
//         return true;
//     }
//     return false;
// };
 
// const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
 
// /* ─── Helpers ─── */
// const conditionIcon = (cond = '') => {
//     const c = cond.toLowerCase();
//     if (c.includes('sunny') || c.includes('clear'))   return '☀️';
//     if (c.includes('rain'))                            return '🌧️';
//     if (c.includes('shower'))                          return '🌦️';
//     if (c.includes('overcast') || c.includes('cloud')) return '☁️';
//     return '⛅';
// };
 
// const conditionClass = (cond = '') => {
//     const c = cond.toLowerCase();
//     if (c.includes('sunny') || c.includes('clear'))    return 'fc-sunny-col';
//     if (c.includes('rain') && !c.includes('shower'))   return 'fc-rain-col';
//     if (c.includes('shower'))                          return 'fc-shower-col';
//     return 'fc-today-col';
// };
 
// const condTextClass = (cond = '') => {
//     const c = cond.toLowerCase();
//     if (c.includes('sunny') || c.includes('clear')) return 'sunny';
//     if (c.includes('rain') && !c.includes('shower')) return 'rain';
//     if (c.includes('shower')) return 'shower';
//     return '';
// };
 
// const parseDate = (val) => {
//     if (!val) return null;
//     // Already a Date object
//     if (val instanceof Date) return isNaN(val) ? null : val;
//     // Numeric timestamp
//     if (typeof val === 'number') return new Date(val);
//     // String: try direct parse first
//     let d = new Date(val);
//     if (!isNaN(d)) return d;
//     // Try replacing space with T for "2026-06-02 14:23:00" format
//     d = new Date(val.replace(' ', 'T'));
//     if (!isNaN(d)) return d;
//     return null;
// };
 
// const formatDate = (val) => {
//     const d = parseDate(val);
//     if (!d) return 'Unknown date';
//     return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
// };
 
// const dayName = (val) => {
//     const d = parseDate(val);
//     if (!d) return '---';
//     return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
// };
 
// /* ─── Calendar ─── */
// let calendar;
 
// const initCalendar = () => {
//     const el = document.getElementById('calendar');
//     if (!el) return;
 
//     calendar = new FullCalendar.Calendar(el, {
//         initialView: 'dayGridMonth',
//         height: 'auto',
//         fixedWeekCount: false,
//         showNonCurrentDates: false,
//         headerToolbar: false,
//         dayMaxEvents: 1,
 
//         datesSet: (info) => {
//             const title = document.getElementById('calMonthTitle');
//             if (title) {
//                 title.textContent = info.view.title;
//             }
//         },
 
//         eventClick: (info) => {
//             const w = info.event.extendedProps;
//             const placeholder = document.getElementById('dateDetailPlaceholder');
//             const content     = document.getElementById('dateDetailContent');
//             if (placeholder) placeholder.classList.add('hidden');
//             if (content) {
//                 content.classList.remove('hidden');
//                 document.getElementById('detailLocation').textContent  = `📍 ${w.location}`;
//                 document.getElementById('detailTemp').textContent      = `🌡️ ${w.temp}°C`;
//                 document.getElementById('detailHumidity').textContent  = `💧 ${w.humidity}%`;
//                 document.getElementById('detailWind').textContent      = `💨 ${w.wind} km/h`;
//                 document.getElementById('detailCondition').textContent = `${conditionIcon(w.condition)} ${w.condition}`;
//                 document.getElementById('detailNote').textContent      = w.note ? `📝 ${w.note}` : '';
//             }
//         },
 
//         dateClick: async (info) => {
//             const clickedDate = info.dateStr;
//             const locationFull = document.getElementById('profileLocation').textContent;
//             const location = locationFull.split(',')[0].trim();
//             if (!location || location === 'Not set') return;
 
//             // Store clicked date so Save uses it
//             window._selectedDate = clickedDate;
 
//             const today   = new Date().toISOString().split('T')[0];
//             const isPast  = clickedDate < today;
//             const saveCard = document.querySelector('.save-weather-card');
//             const heading  = saveCard?.querySelector('h3');
//             const sub      = saveCard?.querySelector('.save-sub');
//             const noteEl   = document.getElementById('note');
 
//             // Show loading state on save card
//             if (heading) heading.textContent = `Save Weather — ${clickedDate}`;
//             if (sub)     sub.innerHTML       = `⏳ Loading weather for ${clickedDate}...`;
//             if (noteEl)  noteEl.value        = '';
 
//             try {
//                 let weather;
 
//                 if (isPast) {
//                     // Use historical endpoint for past dates
//                     const res  = await fetch(`${BASE}/weather/historical?location=${encodeURIComponent(location)}&date=${clickedDate}`);
//                     if (!res.ok) throw new Error('Historical weather not available');
//                     const data = await res.json();
//                     weather    = data.historical;
//                 } else {
//                     // Use current weather for today or future
//                     const res  = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
//                     if (!res.ok) throw new Error('Could not fetch weather');
//                     const data = await res.json();
//                     weather    = data.weather;
//                 }
 
//                 // Store as current weather so Save button works
//                 window._currentWeather = weather;
 
//                 // Update save card metric tiles
//                 document.getElementById('saveTempVal').textContent  = weather.temp      ?? '--';
//                 document.getElementById('saveHumVal').textContent   = weather.humidity  ?? '--';
//                 document.getElementById('saveWindVal').textContent  = weather.wind      ?? '--';
 
//                 // Update stats bar
//                 document.getElementById('statTemp').textContent     = weather.temp      ?? '--';
//                 document.getElementById('statHumidity').textContent = weather.humidity  ?? '--';
//                 document.getElementById('statWind').textContent     = weather.wind      ?? '--';
 
//                 // Update subtitle with condition
//                 if (sub) {
//                     sub.innerHTML = `${conditionIcon(weather.condition)} <strong>${weather.condition}</strong> &nbsp;&middot;&nbsp; ${weather.city || location}`;
//                 }
//                 if (noteEl) noteEl.placeholder = `Add note for ${clickedDate} (e.g. Good day for planting...)`;
 
//                 // Also load forecast
//                 await loadForecast(weather.city || location);
 
//             } catch (e) {
//                 console.error('dateClick error:', e.message);
//                 if (sub) sub.innerHTML = `⚠️ ${e.message || 'Could not load weather for this date.'}`;
//             }
 
//             // Scroll to and highlight save card
//             if (saveCard) {
//                 saveCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                 saveCard.style.transition  = 'box-shadow 0.3s, border-color 0.3s';
//                 saveCard.style.boxShadow   = '0 0 0 3px rgba(46,125,50,0.45)';
//                 saveCard.style.borderColor = '#2e7d32';
//                 setTimeout(() => {
//                     saveCard.style.boxShadow   = '';
//                     saveCard.style.borderColor = '';
//                 }, 2500);
//             }
//         }
//     });
 
//     calendar.render();
 
//     document.getElementById('calPrev')?.addEventListener('click', () => calendar.prev());
//     document.getElementById('calNext')?.addEventListener('click', () => calendar.next());
// };
 
// /* ─── Logout ─── */
// document.getElementById('logoutBtn')?.addEventListener('click', () => {
//     localStorage.removeItem('token');
//     window.location.href = 'login.html';
// });
 
// /* ─── Weather Checker ─── */
// document.getElementById('getWeatherBtn')?.addEventListener('click', async () => {
//     const location = document.getElementById('search').value.trim();
//     if (!location) { alert('Please enter a location'); return; }
//     try {
//         const res = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
//         if (!res.ok) throw new Error((await res.json()).message || 'Unable to fetch weather');
//         const { weather } = await res.json();
//         renderWeatherResult(weather);
//         loadForecast(weather.city);
//     } catch (e) {
//         alert(e.message || 'Failed to fetch weather');
//     }
// });
 
// const renderWeatherResult = (weather) => {
//     const el = document.getElementById('weatherResult');
//     el.className = 'weather-result-filled';
//     el.innerHTML = `
//         <h2>${conditionIcon(weather.condition)} ${weather.city}</h2>
//         <p>📍 ${weather.city}</p>
//         <p>🌡️ Temp: <strong>${weather.temp}°C</strong></p>
//         <p>💧 Humidity: <strong>${weather.humidity}%</strong></p>
//         <p>💨 Wind: <strong>${weather.wind} km/h</strong></p>
//         <p>${conditionIcon(weather.condition)} ${weather.condition}</p>
//     `;
//     /* Update save-card metrics */
//     document.getElementById('saveTempVal').textContent  = weather.temp;
//     document.getElementById('saveHumVal').textContent   = weather.humidity;
//     document.getElementById('saveWindVal').textContent  = weather.wind;
//     /* Update stats bar */
//     document.getElementById('statTemp').textContent     = weather.temp;
//     document.getElementById('statHumidity').textContent = weather.humidity;
//     document.getElementById('statWind').textContent     = weather.wind;
//     /* Navbar badge */
//     document.getElementById('weatherBadge').innerHTML =
//         `⛅ ${weather.city} · ${weather.temp}°C · ${weather.condition}`;
//     /* Store for save */
//     window._currentWeather = weather;
// };
 
// /* ─── Save Weather ─── */
// document.getElementById('saveBtn')?.addEventListener('click', async () => {
//     const w = window._currentWeather;
//     if (!w) { alert('Please check weather for a location first before saving.'); return; }
//     const note     = document.getElementById('note').value;
//     const location = w.city || w.location || document.getElementById('profileLocation').textContent;
//     const date     = window._selectedDate || new Date().toISOString().split('T')[0];
//     try {
//         const res = await fetch(`${BASE}/dates/save`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//             body: JSON.stringify({ note, location, temp: w.temp, humidity: w.humidity, wind: w.wind, condition: w.condition, date })
//         });
//         if (await handleUnauthorized(res)) return;
//         const data = await res.json();
//         alert(data.message);
 
//         // Reset save card heading and selected date after saving
//         const saveCard = document.querySelector('.save-weather-card');
//         if (saveCard) {
//             const heading = saveCard.querySelector('h3');
//             const sub     = saveCard.querySelector('.save-sub');
//             const noteEl  = document.getElementById('note');
//             if (heading) heading.textContent = "Save Today's Weather";
//             if (sub)     sub.textContent     = 'Add a note and save current conditions';
//             if (noteEl)  noteEl.placeholder  = 'Add farming note (e.g. Good day for planting, soil moisture optimal...)';
//             noteEl.value = '';
//         }
//         window._selectedDate = null;
 
//         loadSavedDates();
//     } catch (e) { console.error(e); }
// });
 
// /* ─── Saved Dates ─── */
// const loadSavedDates = async () => {
//     try {
//         const res = await fetch(`${BASE}/dates`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (await handleUnauthorized(res)) return;
//         if (!res.ok) throw new Error('Failed to load dates');
//         const data = await res.json();
 
//         /* Update count badges */
//         const count = data.length;
//         document.getElementById('savedCount').textContent  = count;
//         document.getElementById('savedBadge').textContent  = count;
 
//         /* Render list */
//         const container = document.getElementById('savedDates');
//         container.innerHTML = '';
//         data.forEach(item => {
//             const isSunny = (item.condition || '').toLowerCase().includes('sunny');
//             const div = document.createElement('div');
//             div.className = `saved-record${isSunny ? ' sunny-rec' : ''}`;
//             div.innerHTML = `
//                 <div class="sr-top">
//                     <div class="sr-icon">${conditionIcon(item.condition)}</div>
//                     <div class="sr-info">
//                         <div class="sr-date-row">
//                             <span class="sr-date">${formatDate(item.date)}</span>
//                             <span class="sr-cond${isSunny ? ' sunny-badge' : ''}">${item.condition}</span>
//                         </div>
//                         <div class="sr-loc">📍 ${item.location}</div>
//                     </div>
//                     <div class="sr-actions">
//                         <button class="btn-del"  title="Delete" data-id="${item._id}">Delete</button>
//                     </div>
//                 </div>
//                 <div class="sr-stats">
//                     <span>🌡️ ${item.temp}°C</span>
//                     <span>💧 ${item.humidity}%</span>
//                     <span>💨 ${item.wind} km/h</span>
//                 </div>
//                 ${item.note ? `<div class="sr-note">"${item.note}"</div>` : ''}
//             `;
//             div.querySelector('.btn-del').addEventListener('click', () => deleteDate(item._id));
//             container.appendChild(div);
//         });
 
//         /* Push events to calendar */
//         if (calendar) {
//             calendar.removeAllEvents();
//             calendar.addEventSource(data.map(item => ({
//                 title: item.note || 'Favorable Weather',
//                 start: item.date,
//                 backgroundColor: '#2e7d32',
//                 borderColor: '#2e7d32',
//                 textColor: '#fff',
//                 extendedProps: {
//                     location: item.location, temp: item.temp,
//                     humidity: item.humidity, wind: item.wind,
//                     condition: item.condition, note: item.note
//                 }
//             })));
//         }
//     } catch (e) { console.error(e); }
// };
 
// const deleteDate = async (id) => {
//     if (!confirm('Delete this record?')) return;
//     try {
//         const res = await fetch(`${BASE}/dates/${id}`, {
//             method: 'DELETE',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (await handleUnauthorized(res)) return;
//         loadSavedDates();
//     } catch (e) { console.error(e); }
// };
 
// /* ─── Profile ─── */
// const loadProfile = async () => {
//     try {
//         const res = await fetch(`${BASE}/profile`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (await handleUnauthorized(res)) return;
//         const data = await res.json();
 
//         document.getElementById('profileName').textContent     = data.username;
//         document.getElementById('profileEmail').textContent    = data.email;
//         document.getElementById('profileLocation').textContent = data.farmLocation || 'Not set';
 
//         /* Avatars: initials from username */
//         const initials = (data.username || 'JF').slice(0,2).toUpperCase();
//         document.querySelectorAll('.profile-avatar, #navAvatar, #navAvatar2').forEach(el => el.textContent = initials);
 
//         if (data.farmLocation) {
//             document.getElementById('newLocation').value = data.farmLocation;
//             await loadWeather(data.farmLocation);
//             await loadForecast(data.farmLocation);
//         }
//     } catch (e) { console.error(e); }
// };
 
// /* ─── Current Weather (from profile location) ─── */
// const loadWeather = async (location) => {
//     try {
//         const res  = await fetch(`${BASE}/weather/weather?location=${encodeURIComponent(location)}`);
//         const data = await res.json();
//         renderWeatherResult(data.weather);
//     } catch (e) { console.error(e); }
// };
 
// /* ─── Forecast ─── */
// let tempChart;
 
// const loadForecast = async (location) => {
//     try {
//         const res = await fetch(`${BASE}/weather/forecast?location=${encodeURIComponent(location)}`);
//         if (!res.ok) return;
//         const data = await res.json();
//         if (!data.forecast || !Array.isArray(data.forecast)) return;
 
//         document.getElementById('forecastMeta').textContent =
//             `${location} · Updated just now`;
 
//         const container = document.getElementById('forecastContainer');
//         container.innerHTML = '';
 
//         const labels = [], highs = [], lows = [], hums = [];
 
//         data.forecast.forEach((day, i) => {
//             labels.push(i === 0 ? 'Today' : dayName(day.date));
//             highs.push(day.temp);
//             lows.push(day.tempMin ?? day.temp - 5);
//             hums.push(day.humidity);
 
//             const div = document.createElement('div');
//             div.className = `forecast-day ${i === 0 ? 'fc-today-col' : conditionClass(day.condition)}`;
//             div.innerHTML = `
//                 <div class="fd-name">${i === 0 ? 'Today' : dayName(day.date)}</div>
//                 <div class="fd-icon">${conditionIcon(day.condition)}</div>
//                 <div class="fd-temp">${day.temp}°C</div>
//                 <div class="fd-cond ${condTextClass(day.condition)}">${day.condition}</div>
//                 <div class="fd-stats">
//                     <span>💧 ${day.humidity}%</span>
//                     <span>💨 ${day.wind} km/h</span>
//                     <span>${lows[i]}/${day.temp}°</span>
//                 </div>
//             `;
//             container.appendChild(div);
//         });
 
//         renderChart(labels, highs, lows, hums);
//     } catch (e) { console.error(e); }
// };
 
// const renderChart = (labels, highs, lows, hums) => {
//     const ctx = document.getElementById('tempChart');
//     if (!ctx) return;
//     if (tempChart) tempChart.destroy();
 
//     tempChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels,
//             datasets: [
//                 {
//                     label: 'High °C', data: highs,
//                     borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,.1)',
//                     pointBackgroundColor: '#4caf50', tension: 0.4,
//                     borderWidth: 2, pointRadius: 4
//                 },
//                 {
//                     label: 'Low °C', data: lows,
//                     borderColor: '#42a5f5', backgroundColor: 'rgba(66,165,245,.08)',
//                     pointBackgroundColor: '#42a5f5', tension: 0.4,
//                     borderWidth: 2, pointRadius: 4
//                 },
//                 {
//                     label: 'Humidity %', data: hums,
//                     borderColor: '#ffa726', backgroundColor: 'rgba(255,167,38,.08)',
//                     pointBackgroundColor: '#ffa726', tension: 0.4,
//                     borderWidth: 2, pointRadius: 4
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             plugins: { legend: { display: false } },
//             scales: {
//                 y: {
//                     min: 0, max: 100,
//                     grid: { color: 'rgba(0,0,0,.05)' },
//                     ticks: { font: { size: 10 }, color: '#8a9e8c' }
//                 },
//                 x: {
//                     grid: { display: false },
//                     ticks: { font: { size: 10 }, color: '#8a9e8c' }
//                 }
//             }
//         }
//     });
// };
 
// /* ─── Update Location ─── */
// document.getElementById('updateLocationBtn')?.addEventListener('click', async () => {
//     const loc = document.getElementById('newLocation').value.trim();
//     if (!loc) return;
//     try {
//         const res = await fetch(`${BASE}/profile/location`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//             body: JSON.stringify({ farmLocation: loc })
//         });
//         if (await handleUnauthorized(res)) return;
//         if (!res.ok) throw new Error((await res.text()) || 'Failed to update');
//         alert((await res.json()).message);
//         loadProfile();
//     } catch (e) { console.error(e); }
// });
 
// /* ─── Init ─── */
// initCalendar();
// loadSavedDates();
// loadProfile();

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

const initTaskProgress = () => {
    const all  = document.querySelectorAll('.task-item input[type="checkbox"]');
    const done = [...all].filter(c => c.checked).length;
    document.getElementById('taskProgress').textContent = `${done} / ${all.length} done`;
    document.getElementById('taskFill').style.width = `${(done / all.length) * 100}%`;

    all.forEach(cb => {
        cb.addEventListener('change', () => {
            const d = [...all].filter(c => c.checked).length;
            document.getElementById('taskProgress').textContent = `${d} / ${all.length} done`;
            document.getElementById('taskFill').style.width = `${(d / all.length) * 100}%`;
            const label = cb.closest('.task-item').querySelector('span:not(.dot)');
            cb.checked ? label.classList.add('task-done') : label.classList.remove('task-done');
        });
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

        if (weatherRes) {
            const weatherData = await weatherRes.json();
            if (weatherData.weather) renderWeather(weatherData.weather);
        }

        if (forecastRes) {
            const forecastData = await forecastRes.json();
            renderForecast(forecastData.forecast, location);
        }

        const statsData = await statsRes.json();
        renderStats(statsData);

        const chartData = await chartRes.json();
        renderRevenueChart(chartData);

        const notifData = await notifRes.json();
        const msgBadge  = document.getElementById('messagesBadge');
        if (notifData.unreadCount > 0) msgBadge.textContent = notifData.unreadCount;

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