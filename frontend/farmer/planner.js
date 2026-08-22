const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('userData') || '{}');

if (!token) window.location.href = '../login.html';
if (user.role === 'customer') window.location.href = '../customer/home.html';

const BASE = 'https://leaders-union-farm-weather-site.onrender.com/api';
const authHeaders = { 'Authorization': `Bearer ${token}` };

let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let tasks        = JSON.parse(localStorage.getItem('farmTasks') || '[]');
let selectedTask = null;

function saveTasks() {
    localStorage.setItem('farmTasks', JSON.stringify(tasks));
    window.dispatchEvent(new StorageEvent('storage', { key: 'farmTasks', newValue: JSON.stringify(tasks) }));
}

const categoryIcons = {
    irrigation: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    harvest:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z"/></svg>`,
    logistics:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    pest:       `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const renderCalendar = () => {
    document.getElementById('calMonthLabel').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const grid     = document.getElementById('calGrid');
    const today    = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth    = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    let cells = '';

    for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        cells += `<div class="cal-cell cal-cell--other-month"><div class="cal-date">${d}</div></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr  = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday  = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
        const isSat    = dayOfWeek === 6;
        const isSun    = dayOfWeek === 0;

        const dayTasks = tasks.filter(t => t.date === dateStr);

        const taskHTML = dayTasks.map(t => `
            <div class="cal-task cal-task--${t.category}" data-id="${t.id}">
                ${categoryIcons[t.category] || ''}
                ${t.name}
            </div>`).join('');

        cells += `
        <div class="cal-cell ${isToday ? 'cal-cell--today' : ''} ${isSat ? 'cal-cell--sat' : ''} ${isSun ? 'cal-cell--sun' : ''}">
            <div class="cal-date">${d}</div>
            ${taskHTML}
        </div>`;
    }

    const totalCells = firstDay + daysInMonth;
    const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
        cells += `<div class="cal-cell cal-cell--other-month"><div class="cal-date">${d}</div></div>`;
    }

    grid.innerHTML = cells;

    grid.querySelectorAll('.cal-task').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id   = el.dataset.id;
            selectedTask = tasks.find(t => t.id === id);
            if (selectedTask) openDetailModal(selectedTask);
        });
    });
};

const openModal  = () => {
    document.getElementById('taskDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalBackdrop').classList.add('open');
};
const closeModal = () => {
    document.getElementById('modalBackdrop').classList.remove('open');
    document.getElementById('taskName').value     = '';
    document.getElementById('taskNote').value     = '';
    document.getElementById('taskCategory').value = 'irrigation';
};

const openDetailModal = (task) => {
    const catLabels = { irrigation: 'Irrigation', harvest: 'Crop Care / Harvest', logistics: 'Logistics', pest: 'Pest Treatment' };
    document.getElementById('detailTitle').textContent = task.name;
    document.getElementById('detailDate').textContent  = `${catLabels[task.category]} · ${task.date}`;
    document.getElementById('detailNote').textContent  = task.note || 'No additional notes.';
    document.getElementById('detailBackdrop').classList.add('open');
};
const closeDetailModal = () => document.getElementById('detailBackdrop').classList.remove('open');

const saveTask = () => {
    const name     = document.getElementById('taskName').value.trim();
    const category = document.getElementById('taskCategory').value;
    const date     = document.getElementById('taskDate').value;
    const note     = document.getElementById('taskNote').value.trim();

    if (!name || !date) {
        document.getElementById('taskName').focus();
        return;
    }

    tasks.push({ id: Date.now().toString(), name, category, date, note, done: false });
    saveTasks();
    closeModal();
    renderCalendar();
};

const deleteTask = () => {
    if (!selectedTask) return;
    tasks = tasks.filter(t => t.id !== selectedTask.id);
    saveTasks();
    closeDetailModal();
    renderCalendar();
};

const loadProfile = async () => {
    try {
        const res  = await fetch(`${BASE}/profile`, { headers: authHeaders });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '../login.html'; return; }
        const user = await res.json();
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('topAvatar').textContent     = initials;
        document.getElementById('sidebarAvatar').textContent = initials;
        document.getElementById('sidebarName').textContent   = user.username;
    } catch (e) {
        console.error(e);
    }
};

document.getElementById('openModalBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
document.getElementById('closeDetailBtn').addEventListener('click', closeDetailModal);
document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);

document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
document.getElementById('detailBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetailModal();
});

document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeDetailModal(); }
});

loadProfile();
renderCalendar();