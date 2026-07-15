/* =========================================================
   Habit Tracker Dashboard — full app logic
   Data persists in localStorage under STORAGE_KEY.
   ========================================================= */

const STORAGE_KEY = 'habitTrackerState_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- date helpers ---------- */
function dateKey(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function todayKey() { return dateKey(new Date()); }
function uid() { return Math.random().toString(36).slice(2, 9); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

/* ---------- default data ---------- */
function seedState() {
    const habitsSeed = [
        { name: 'Exercise', category: 'Fitness', icon: 'fa-solid fa-person-running', color: 'green', dailyGoal: 1 },
        { name: 'Read 20 Pages', category: 'Learning', icon: 'fa-solid fa-book-open', color: 'purple', dailyGoal: 1 },
        { name: 'Drink 3L Water', category: 'Health', icon: 'fa-solid fa-droplet', color: 'blue', dailyGoal: 1 },
        { name: 'Study JavaScript', category: 'Learning', icon: 'fa-solid fa-code', color: 'orange', dailyGoal: 1 },
        { name: 'Wake Up Before 7 AM', category: 'Lifestyle', icon: 'fa-regular fa-sun', color: 'red', dailyGoal: 1 },
    ];
    const now = new Date();
    const habits = habitsSeed.map((h, idx) => {
        const completions = {};
        for (let i = 45; i >= 1; i--) {
            const d = new Date(now.getTime() - i * DAY_MS);
            const chance = 0.55 + idx * 0.06;
            if (Math.random() < chance) completions[dateKey(d)] = true;
        }
        completions[todayKey()] = idx !== 2 && idx !== 4;
        return {
            id: uid(), name: h.name, category: h.category, icon: h.icon, color: h.color,
            dailyGoal: h.dailyGoal, favorite: idx === 0, order: idx,
            createdAt: now.getTime() - 46 * DAY_MS, completions
        };
    });

    return {
        profile: {
            name: 'Darshana', email: 'darshana@example.com',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            joined: now.getTime() - 60 * DAY_MS
        },
        theme: 'dark',
        xp: 340,
        habits,
        goals: [
            { id: uid(), title: 'Read 20 Books', icon: 'fa-solid fa-book', color: 'green', current: 8, target: 20, deadline: '', priority: 'Medium' },
            { id: uid(), title: 'Exercise 50 Days', icon: 'fa-solid fa-dumbbell', color: 'purple', current: 32, target: 50, deadline: '', priority: 'High' },
        ],
        achievementsUnlocked: [],
        settings: { notificationsEnabled: false, reminderTime: '19:00' },
        activity: [
            { type: 'ok', text: 'Completed Exercise', time: Date.now() - 2 * 3600000 },
            { type: 'ok', text: 'Added Reading Habit', time: Date.now() - 5 * 3600000 },
            { type: 'miss', text: 'Missed Wake Up', time: Date.now() - 26 * 3600000 },
        ],
        calendarView: { year: now.getFullYear(), month: now.getMonth() },
        lastReminderDate: null,
    };
}

let state = loadState();

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { const s = seedState(); localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); return s; }
        return JSON.parse(raw);
    } catch (e) { const s = seedState(); localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); return s; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------- achievement definitions ---------- */
const ACHIEVEMENTS = [
    { id: 'first_habit', icon: '🏅', name: 'First Habit', desc: 'Create your first habit', check: s => s.habits.length >= 1 },
    { id: 'streak_7', icon: '🔥', name: '7 Day Streak', desc: 'Keep a habit going 7 days straight', check: s => s.habits.some(h => computeStreak(h) >= 7) },
    { id: 'streak_30', icon: '🔥', name: '30 Day Streak', desc: 'Keep a habit going 30 days straight', check: s => s.habits.some(h => computeStreak(h) >= 30) },
    { id: 'productivity_king', icon: '👑', name: 'Productivity King', desc: 'Hit 90%+ completion this week', check: s => computeWeeklyReport(s).percent >= 90 },
    { id: 'reading_master', icon: '📚', name: 'Reading Master', desc: '14 day streak on a Learning habit', check: s => s.habits.some(h => h.category === 'Learning' && computeStreak(h) >= 14) },
    { id: 'fitness_hero', icon: '💪', name: 'Fitness Hero', desc: '14 day streak on a Fitness habit', check: s => s.habits.some(h => h.category === 'Fitness' && computeStreak(h) >= 14) },
    { id: 'century', icon: '⭐', name: '100 Habits Completed', desc: 'Complete habits 100 times total', check: s => totalCompletions(s) >= 100 },
];

function totalCompletions(s) {
    return s.habits.reduce((sum, h) => sum + Object.values(h.completions).filter(Boolean).length, 0);
}

function computeStreak(habit) {
    let streak = 0;
    let d = new Date();
    if (!habit.completions[dateKey(d)]) d = new Date(d.getTime() - DAY_MS);
    while (habit.completions[dateKey(d)]) { streak++; d = new Date(d.getTime() - DAY_MS); }
    return streak;
}
function computeBestStreak(habit) {
    const days = Object.keys(habit.completions).filter(k => habit.completions[k]).sort();
    let best = 0, cur = 0, prev = null;
    for (const k of days) {
        const t = new Date(k).getTime();
        if (prev !== null && t - prev === DAY_MS) cur++; else cur = 1;
        best = Math.max(best, cur);
        prev = t;
    }
    return best;
}

function computeWeeklyReport(s) {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // Monday=0
    const monday = new Date(now.getTime() - dow * DAY_MS);
    let completed = 0, total = 0;
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCompleted = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getTime() + i * DAY_MS);
        if (d > now) continue;
        const key = dateKey(d);
        s.habits.forEach(h => {
            if (h.createdAt > d.getTime() + DAY_MS) return;
            total++; dayTotals[i]++;
            if (h.completions[key]) { completed++; dayCompleted[i]++; }
        });
    }
    const percent = total ? Math.round((completed / total) * 100) : 0;
    let bestIdx = 0;
    for (let i = 1; i < 7; i++) {
        const rate = dayTotals[i] ? dayCompleted[i] / dayTotals[i] : -1;
        const bestRate = dayTotals[bestIdx] ? dayCompleted[bestIdx] / dayTotals[bestIdx] : -1;
        if (rate > bestRate) bestIdx = i;
    }
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return { completed, total, missed: total - completed, percent, bestDay: total ? names[bestIdx] : '—' };
}

/* ---------- XP / Level ---------- */
const XP_PER_LEVEL = 500;
function levelInfo(xp) {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    return { level, into, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

/* ---------- toasts ---------- */
function toast(msg, type = '') {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!state.achievementsUnlocked.includes(a.id) && a.check(state)) {
            state.achievementsUnlocked.push(a.id);
            state.xp += 50;
            toast(`🏆 Achievement unlocked: ${a.name} (+50 XP)`, 'achievement');
            pushActivity('ok', `Unlocked achievement: ${a.name}`);
        }
    });
}

function pushActivity(type, text) {
    state.activity.unshift({ type, text, time: Date.now() });
    state.activity = state.activity.slice(0, 20);
}

/* =========================================================
   AUTH
   ========================================================= */
function handleAuth() {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const guest = localStorage.getItem('isGuest');
    if (!loggedIn && !guest) {
        localStorage.setItem('isGuest', 'true');
    }
    const prevLogin = localStorage.getItem('loginTime');
    const lastLoginEl = document.getElementById('lastLoginText');
    if (prevLogin) {
        const d = new Date(parseInt(prevLogin, 10));
        lastLoginEl.textContent = `Last login: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        lastLoginEl.textContent = 'Welcome — this is your first login.';
    }
    localStorage.setItem('loginTime', String(Date.now()));
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('loginTime');
    window.location.href = 'login.html';
});

/* =========================================================
   CLOCK / GREETING / DATE / QUOTE
   ========================================================= */
function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').textContent = '🕒 ' + now.toLocaleTimeString('en-US', { hour12: true });
}

function updateDate() {
    const now = new Date();
    document.getElementById('dateDay').textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('dateFull').textContent = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function updateGreeting() {
    const hour = new Date().getHours();
    let msg = hour < 12 ? '🌞 Good Morning' : hour < 17 ? '🌤 Good Afternoon' : hour < 21 ? '🌇 Good Evening' : '🌙 Good Night';
    const total = state.habits.length;
    const done = state.habits.filter(h => h.completions[todayKey()]).length;
    document.getElementById('greeting').innerHTML = `${msg}, ${state.profile.name}! 👋`;
    const sub = total ? `You completed ${done} of ${total} habits today.` : 'Add your first habit to get started.';
    document.getElementById('quote').textContent = performanceQuote(done, total) + ' ' + sub;
}

function performanceQuote(done, total) {
    if (total === 0) return 'Stay consistent, stay productive.';
    const rate = done / total;
    if (rate === 1) return 'Excellent! You crushed every habit today. 🎉';
    if (rate >= 0.5) return "Solid progress — keep the momentum going.";
    if (rate > 0) return "A start is a start. Finish strong today.";
    return "Don't give up. Tomorrow is another chance.";
}

/* =========================================================
   WEATHER (Open-Meteo, no API key)
   ========================================================= */
const WEATHER_ICONS = {
    0: ['☀️', 'Clear sky'], 1: ['🌤️', 'Mainly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'], 51: ['🌦️', 'Drizzle'], 61: ['🌧️', 'Rain'], 63: ['🌧️', 'Rain'],
    65: ['🌧️', 'Heavy rain'], 71: ['🌨️', 'Snow'], 80: ['🌧️', 'Showers'], 95: ['⛈️', 'Thunderstorm']
};
function weatherLabel(code) { return WEATHER_ICONS[code] || ['🌡️', 'Weather']; }

async function loadWeather(lat, lon, cityName) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data.current;
        const [icon] = weatherLabel(c.weather_code);
        const widget = document.getElementById('weatherWidget');
        widget.innerHTML = `
            <span>${icon}</span>
            <span class="weather-city">${cityName}</span>
            <span class="weather-temp">${Math.round(c.temperature_2m)}°C</span>`;
        widget.title = `Feels like ${Math.round(c.apparent_temperature)}°C · Humidity ${c.relative_humidity_2m}% · Wind ${Math.round(c.wind_speed_10m)} km/h`;
    } catch (e) {
        document.getElementById('weatherWidget').innerHTML = `<i class="fa-solid fa-cloud-sun"></i><span class="weather-city">${cityName}</span><span class="weather-temp">--°C</span>`;
    }
}
function initWeather() {
    const fallback = () => loadWeather(27.7172, 85.3240, 'Kathmandu');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => loadWeather(pos.coords.latitude.toFixed(2), pos.coords.longitude.toFixed(2), 'Your area'),
            fallback, { timeout: 4000 }
        );
    } else fallback();
}

/* =========================================================
   THEME
   ========================================================= */
function applyTheme() {
    document.body.setAttribute('data-theme', state.theme);
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === state.theme));
}
document.getElementById('themeToggle').addEventListener('click', e => {
    const btn = e.target.closest('.theme-btn');
    if (!btn) return;
    state.theme = btn.dataset.theme;
    saveState(); applyTheme();
});

/* =========================================================
   HABITS
   ========================================================= */
let currentFilter = 'all';
let searchTerm = '';

function filteredHabits() {
    let list = [...state.habits].sort((a, b) => (b.favorite - a.favorite) || (a.order - b.order));
    if (searchTerm) list = list.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.category.toLowerCase().includes(searchTerm.toLowerCase()));
    if (currentFilter === 'completed') list = list.filter(h => h.completions[todayKey()]);
    else if (currentFilter === 'incomplete') list = list.filter(h => !h.completions[todayKey()]);
    else if (currentFilter === 'favorite') list = list.filter(h => h.favorite);
    return list;
}

function renderHabits() {
    const list = filteredHabits();
    const container = document.getElementById('habitList');
    const empty = document.getElementById('habitEmptyState');
    container.innerHTML = '';
    empty.style.display = list.length ? 'none' : 'block';
    list.forEach(h => {
        const streak = computeStreak(h);
        const checked = !!h.completions[todayKey()];
        const el = document.createElement('div');
        el.className = 'habit-item';
        el.innerHTML = `
            <div class="habit-details">
                <div class="habit-icon ${h.color}-bg"><i class="${h.icon}"></i></div>
                <div class="habit-meta"><h4>${escapeHtml(h.name)}</h4><p>${escapeHtml(h.category)}</p></div>
            </div>
            <div class="habit-streak-status">
                <i class="fa-solid fa-star fav-star ${h.favorite ? 'active' : ''}" data-fav="${h.id}"></i>
                <span class="streak-count">${streak} <i class="fa-solid fa-fire"></i> day streak</span>
                <label class="checkbox-wrapper">
                    <input type="checkbox" data-toggle="${h.id}" ${checked ? 'checked' : ''}>
                    <span class="custom-checkbox"></span>
                </label>
                <div class="habit-actions">
                    <i class="fa-solid fa-pen" data-edit="${h.id}"></i>
                    <i class="fa-solid fa-trash" data-del="${h.id}"></i>
                </div>
            </div>`;
        container.appendChild(el);
    });
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

document.getElementById('habitList').addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (fav) { toggleFavorite(fav.dataset.fav); return; }
    if (edit) { openHabitModal(edit.dataset.edit); return; }
    if (del) { deleteHabit(del.dataset.del); return; }
});
document.getElementById('habitList').addEventListener('change', e => {
    const t = e.target.closest('[data-toggle]');
    if (t) toggleComplete(t.dataset.toggle);
});

function toggleFavorite(id) {
    const h = state.habits.find(x => x.id === id);
    if (!h) return;
    h.favorite = !h.favorite;
    saveState(); renderHabits();
}

function toggleComplete(id) {
    const h = state.habits.find(x => x.id === id);
    if (!h) return;
    const key = todayKey();
    const nowDone = !h.completions[key];
    if (nowDone) { h.completions[key] = true; state.xp += 15; pushActivity('ok', `Completed ${h.name}`); }
    else { delete h.completions[key]; state.xp = Math.max(0, state.xp - 15); pushActivity('miss', `Unmarked ${h.name}`); }
    checkAchievements();
    saveState();
    renderAll();
}

function deleteHabit(id) {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    state.habits = state.habits.filter(h => h.id !== id);
    saveState(); renderAll();
    toast('Habit deleted.');
}

document.getElementById('filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.toggle('active', c === chip));
    renderHabits();
});
document.getElementById('habitSearch').addEventListener('input', e => { searchTerm = e.target.value; renderHabits(); });

/* ---- Habit modal ---- */
const habitModal = document.getElementById('habitModal');
let editingHabitId = null;
function openHabitModal(id) {
    editingHabitId = id || null;
    document.getElementById('habitModalTitle').textContent = id ? 'Edit Habit' : 'Add Habit';
    if (id) {
        const h = state.habits.find(x => x.id === id);
        document.getElementById('habitNameInput').value = h.name;
        document.getElementById('habitCategoryInput').value = h.category;
        document.getElementById('habitIconInput').value = h.icon;
        document.getElementById('habitGoalInput').value = h.dailyGoal;
        selectColor(h.color);
    } else {
        document.getElementById('habitNameInput').value = '';
        document.getElementById('habitCategoryInput').value = 'Health';
        document.getElementById('habitIconInput').value = 'fa-solid fa-person-running';
        document.getElementById('habitGoalInput').value = 1;
        selectColor('green');
    }
    showModal('habitModal');
}
function selectColor(color) {
    document.querySelectorAll('#habitColorInput .color-dot').forEach(d => d.classList.toggle('selected', d.dataset.color === color));
}
document.getElementById('habitColorInput').addEventListener('click', e => {
    const dot = e.target.closest('.color-dot');
    if (dot) selectColor(dot.dataset.color);
});
document.getElementById('addHabitBtn').addEventListener('click', () => openHabitModal(null));
document.getElementById('fabAddHabit').addEventListener('click', () => openHabitModal(null));
document.getElementById('bottomNavAdd').addEventListener('click', e => { e.preventDefault(); openHabitModal(null); });

document.getElementById('saveHabitBtn').addEventListener('click', () => {
    const name = document.getElementById('habitNameInput').value.trim();
    if (!name) { toast('Please enter a habit name.'); return; }
    const category = document.getElementById('habitCategoryInput').value;
    const icon = document.getElementById('habitIconInput').value;
    const color = document.querySelector('#habitColorInput .color-dot.selected')?.dataset.color || 'green';
    const dailyGoal = parseInt(document.getElementById('habitGoalInput').value, 10) || 1;

    if (editingHabitId) {
        const h = state.habits.find(x => x.id === editingHabitId);
        Object.assign(h, { name, category, icon, color, dailyGoal });
        pushActivity('ok', `Edited ${name}`);
    } else {
        state.habits.push({
            id: uid(), name, category, icon, color, dailyGoal, favorite: false,
            order: state.habits.length, createdAt: Date.now(), completions: {}
        });
        pushActivity('ok', `Added ${name} habit`);
    }
    checkAchievements();
    saveState(); closeModal('habitModal'); renderAll();
    toast('Habit saved.');
});

/* =========================================================
   CALENDAR
   ========================================================= */
function renderCalendar() {
    const { year, month } = state.calendarView;
    const grid = document.getElementById('calendarGrid');
    document.querySelectorAll('#calendarGrid .day-number').forEach(n => n.remove());
    const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('calendarMonthLabel').textContent = label;

    const firstDay = new Date(year, month, 1);
    let startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const todayStr = todayKey();

    const cells = [];
    for (let i = startOffset; i > 0; i--) cells.push({ day: prevDays - i + 1, faded: true, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, faded: false, date: new Date(year, month, d) });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length, faded: true, date: null });

    cells.forEach(c => {
        const div = document.createElement('div');
        div.className = 'day-number';
        div.textContent = c.day;
        if (c.faded || !c.date) { div.classList.add('day-faded'); grid.appendChild(div); return; }
        const key = dateKey(c.date);
        if (key === todayStr) div.classList.add('today');
        const applicable = state.habits.filter(h => h.createdAt <= c.date.getTime() + DAY_MS);
        if (c.date.getTime() <= Date.now() && applicable.length) {
            const completed = applicable.filter(h => h.completions[key]).length;
            const ratio = completed / applicable.length;
            if (ratio === 1) div.classList.add('dot-completed');
            else if (ratio === 0) div.classList.add('dot-missed');
            else div.classList.add('dot-partial');
            div.addEventListener('click', () => showDayDetail(c.date, applicable));
        } else if (c.date.getTime() > Date.now()) {
            div.classList.add('day-faded');
        }
        grid.appendChild(div);
    });
}

function showDayDetail(date, applicable) {
    const key = dateKey(date);
    const done = applicable.filter(h => h.completions[key]);
    const missed = applicable.filter(h => !h.completions[key]);
    const panel = document.getElementById('dayDetail');
    panel.classList.add('show');
    panel.innerHTML = `<strong>${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong><br>` +
        (done.length ? `<span class="dd-ok">✓ Completed:</span> ${done.map(h => h.name).join(', ')}<br>` : '') +
        (missed.length ? `<span class="dd-miss">✗ Missed:</span> ${missed.map(h => h.name).join(', ')}` : (done.length ? '' : 'No habits existed yet on this day.'));
}

document.getElementById('calPrev').addEventListener('click', () => { shiftMonth(-1); });
document.getElementById('calNext').addEventListener('click', () => { shiftMonth(1); });
function shiftMonth(delta) {
    let { year, month } = state.calendarView;
    month += delta;
    if (month < 0) { month = 11; year--; } else if (month > 11) { month = 0; year++; }
    state.calendarView = { year, month };
    saveState(); renderCalendar();
}

function renderHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    grid.innerHTML = '';
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS);
        const key = dateKey(d);
        const applicable = state.habits.filter(h => h.createdAt <= d.getTime() + DAY_MS);
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        cell.title = key;
        if (applicable.length) {
            const ratio = applicable.filter(h => h.completions[key]).length / applicable.length;
            cell.style.backgroundColor = ratio === 0 ? 'var(--bg-sidebar)' : `rgba(46, 204, 113, ${clamp(0.15 + ratio * 0.75, 0.15, 0.9)})`;
        }
        grid.appendChild(cell);
    }
}

/* =========================================================
   STATS + CHART
   ========================================================= */
let trendChart = null;

function overallCompletionRate() {
    let total = 0, done = 0;
    const now = Date.now();
    state.habits.forEach(h => {
        const days = Math.max(1, Math.floor((now - h.createdAt) / DAY_MS));
        total += days;
        done += Object.values(h.completions).filter(Boolean).length;
    });
    return total ? Math.round((done / total) * 100) : 0;
}

function renderTopStats() {
    document.getElementById('statTotalHabits').textContent = state.habits.length;
    const thisMonth = new Date().getMonth();
    const addedThisMonth = state.habits.filter(h => new Date(h.createdAt).getMonth() === thisMonth).length;
    document.getElementById('statTotalHabitsSub').textContent = `+${addedThisMonth} this month`;

    const bestCurrent = Math.max(0, ...state.habits.map(computeStreak));
    document.getElementById('statCurrentStreak').innerHTML = `${bestCurrent} <span class="unit-label">days</span>`;

    const bestAllTime = Math.max(0, ...state.habits.map(computeBestStreak), bestCurrent);
    document.getElementById('statBestStreak').innerHTML = `${bestAllTime} <span class="unit-label">days</span>`;

    const rate = overallCompletionRate();
    const ring = document.getElementById('completionRing');
    const radius = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = circumference - (rate / 100) * circumference;
    document.getElementById('ringLabel').textContent = rate + '%';
    document.getElementById('ringWrapper').dataset.percent = rate;
}

function renderInnerStats() {
    const grid = document.getElementById('innerStatsGrid');
    const now = new Date();
    const activeDays = new Set();
    state.habits.forEach(h => Object.keys(h.completions).forEach(k => { if (h.completions[k]) activeDays.add(k); }));
    const totalDone = totalCompletions(state);
    const rate = overallCompletionRate();
    const longest = Math.max(0, ...state.habits.map(computeBestStreak));
    const dayTally = [0, 0, 0, 0, 0, 0, 0];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    state.habits.forEach(h => Object.keys(h.completions).forEach(k => {
        if (!h.completions[k]) return;
        const dow = (new Date(k).getDay() + 6) % 7;
        dayTally[dow]++;
    }));
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let mostIdx = 0, leastIdx = 0;
    dayTally.forEach((v, i) => { if (v > dayTally[mostIdx]) mostIdx = i; if (v < dayTally[leastIdx]) leastIdx = i; });
    let totalMissed = 0, totalScheduled = 0;
    state.habits.forEach(h => {
        const days = Math.max(1, Math.floor((Date.now() - h.createdAt) / DAY_MS));
        totalScheduled += days;
        totalMissed += days - Object.values(h.completions).filter(Boolean).length;
    });

    const items = [
        { icon: 'fa-regular fa-calendar-days', cls: 'bg-purple-soft', label: 'Days Active', val: `${activeDays.size} days` },
        { icon: 'fa-regular fa-circle-check', cls: 'bg-green-soft', label: 'Habits Completed', val: `${totalDone} times` },
        { icon: 'fa-solid fa-chart-pie', cls: 'bg-blue-soft', label: 'Completion Rate', val: `${rate}%` },
        { icon: 'fa-regular fa-clock', cls: 'bg-red-soft', label: 'Time Saved (approx)', val: `${Math.floor(totalDone * 15 / 60)}h ${(totalDone * 15) % 60}m` },
        { icon: 'fa-solid fa-fire', cls: 'bg-green-soft', label: 'Longest Streak', val: `${longest} days` },
        { icon: 'fa-solid fa-thumbs-up', cls: 'bg-purple-soft', label: 'Most Productive Day', val: names[mostIdx] },
        { icon: 'fa-solid fa-thumbs-down', cls: 'bg-red-soft', label: 'Least Productive Day', val: names[leastIdx] },
        { icon: 'fa-solid fa-xmark', cls: 'bg-blue-soft', label: 'Total Missed', val: `${Math.max(0, totalMissed)}` },
    ];
    grid.innerHTML = items.map(it => `
        <div class="inner-stat-box">
            <div class="inner-stat-icon ${it.cls}"><i class="${it.icon}"></i></div>
            <div class="inner-stat-info"><p>${it.label}</p><h4>${it.val}</h4></div>
        </div>`).join('');
}

function buildTimeSeries(period) {
    const now = new Date();
    let labels = [], values = [];
    if (period === 'daily') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * DAY_MS);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            values.push(dayCompletionRate(d));
        }
    } else if (period === 'week') {
        for (let w = 3; w >= 0; w--) {
            let sum = 0, cnt = 0;
            for (let i = 0; i < 7; i++) {
                const d = new Date(now.getTime() - (w * 7 + i) * DAY_MS);
                sum += dayCompletionRate(d); cnt++;
            }
            labels.push(`Week ${4 - w}`);
            values.push(Math.round(sum / cnt));
        }
    } else if (period === 'month') {
        for (let m = 5; m >= 0; m--) {
            const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const daysInM = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            let sum = 0, cnt = 0;
            for (let day = 1; day <= daysInM; day++) {
                const dd = new Date(d.getFullYear(), d.getMonth(), day);
                if (dd > now) break;
                sum += dayCompletionRate(dd); cnt++;
            }
            labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
            values.push(cnt ? Math.round(sum / cnt) : 0);
        }
    } else if (period === 'year') {
        for (let m = 0; m < 12; m++) {
            const d = new Date(now.getFullYear(), m, 1);
            if (d > now) { labels.push(d.toLocaleDateString('en-US', { month: 'short' })); values.push(0); continue; }
            const daysInM = Math.min(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), now.getMonth() === m ? now.getDate() : 31);
            let sum = 0, cnt = 0;
            for (let day = 1; day <= daysInM; day++) {
                sum += dayCompletionRate(new Date(d.getFullYear(), d.getMonth(), day)); cnt++;
            }
            labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
            values.push(cnt ? Math.round(sum / cnt) : 0);
        }
    }
    return { labels, values };
}
function dayCompletionRate(date) {
    const key = dateKey(date);
    const applicable = state.habits.filter(h => h.createdAt <= date.getTime() + DAY_MS);
    if (!applicable.length) return 0;
    return Math.round((applicable.filter(h => h.completions[key]).length / applicable.length) * 100);
}

function categoryBreakdown() {
    const map = {};
    state.habits.forEach(h => {
        const c = Object.values(h.completions).filter(Boolean).length;
        map[h.category] = (map[h.category] || 0) + c;
    });
    return { labels: Object.keys(map), values: Object.values(map) };
}

function updateTrendChart() {
    const type = document.getElementById('chartTypeSelect').value;
    const period = document.getElementById('periodSelect').value;
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    let cfg;
    if (type === 'pie' || type === 'doughnut') {
        const { labels, values } = categoryBreakdown();
        cfg = {
            type, data: { labels, datasets: [{ data: values, backgroundColor: ['#2ecc71', '#a55eea', '#3498db', '#e67e22', '#e74c3c'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#7e8b9b' } } } }
        };
    } else if (type === 'radar') {
        const labels = state.habits.map(h => h.name);
        const values = state.habits.map(h => {
            const days = Math.max(1, Math.floor((Date.now() - h.createdAt) / DAY_MS));
            return Math.round((Object.values(h.completions).filter(Boolean).length / Math.min(days, 30)) * 100);
        });
        cfg = {
            type: 'radar',
            data: { labels, datasets: [{ label: 'Completion %', data: values, backgroundColor: 'rgba(46,204,113,.25)', borderColor: '#2ecc71', pointBackgroundColor: '#2ecc71' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { angleLines: { color: 'rgba(255,255,255,.1)' }, grid: { color: 'rgba(255,255,255,.1)' }, pointLabels: { color: '#7e8b9b', font: { size: 10 } }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } } }
        };
    } else {
        const { labels, values } = buildTimeSeries(period);
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(46, 204, 113, 0.35)');
        gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
        cfg = {
            type,
            data: { labels, datasets: [{ label: 'Completion %', data: values, borderColor: '#2ecc71', backgroundColor: type === 'bar' ? '#2ecc71' : gradient, fill: type === 'line', tension: 0.4, pointBackgroundColor: '#2ecc71', pointBorderColor: '#0b0e14', pointRadius: 4, borderWidth: 3, borderRadius: type === 'bar' ? 6 : 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#7e8b9b' } }, x: { grid: { display: false }, ticks: { color: '#7e8b9b' } } }
            }
        };
    }
    trendChart = new Chart(ctx, cfg);
}
document.getElementById('chartTypeSelect').addEventListener('change', updateTrendChart);
document.getElementById('periodSelect').addEventListener('change', updateTrendChart);

/* =========================================================
   GOALS
   ========================================================= */
function renderGoals() {
    [document.getElementById('goalsList'), document.getElementById('goalsListFull')].forEach(container => {
        container.innerHTML = state.goals.map(g => {
            const pct = clamp(Math.round((g.current / g.target) * 100), 0, 100);
            const colorCls = g.color === 'purple' ? 'purple' : 'green';
            return `
            <div class="goal-item">
                <div class="goal-actions"><i class="fa-solid fa-pen" data-editgoal="${g.id}"></i><i class="fa-solid fa-trash" data-delgoal="${g.id}"></i></div>
                <div class="goal-meta">
                    <span class="goal-title"><i class="${g.icon} icon-${colorCls === 'purple' ? 'purple' : 'green'}"></i> ${escapeHtml(g.title)} <span class="goal-priority ${g.priority.toLowerCase()}">${g.priority}</span></span>
                    <span>${g.current} / ${g.target}</span>
                </div>
                <div class="progress-bar-container"><div class="progress-bar-fill ${colorCls}" data-value="${pct}"></div></div>
                <span class="goal-percent-label">${pct}% completed ${g.deadline ? '· due ' + new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>`;
        }).join('') || '<p class="empty-state">No goals yet — add one to start tracking.</p>';
    });
    document.querySelectorAll('.progress-bar-fill[data-value]').forEach(bar => {
        const v = bar.dataset.value;
        requestAnimationFrame(() => { bar.style.width = `${v}%`; });
    });
}
document.querySelectorAll('#goalsList, #goalsListFull').forEach(c => {
    c.addEventListener('click', e => {
        const edit = e.target.closest('[data-editgoal]');
        const del = e.target.closest('[data-delgoal]');
        if (edit) openGoalModal(edit.dataset.editgoal);
        if (del) deleteGoal(del.dataset.delgoal);
    });
});
function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    state.goals = state.goals.filter(g => g.id !== id);
    saveState(); renderGoals();
}
let editingGoalId = null;
function openGoalModal(id) {
    editingGoalId = id || null;
    document.getElementById('goalModalTitle').textContent = id ? 'Edit Goal' : 'Add Goal';
    if (id) {
        const g = state.goals.find(x => x.id === id);
        document.getElementById('goalTitleInput').value = g.title;
        document.getElementById('goalCurrentInput').value = g.current;
        document.getElementById('goalTargetInput').value = g.target;
        document.getElementById('goalDeadlineInput').value = g.deadline || '';
        document.getElementById('goalPriorityInput').value = g.priority;
    } else {
        document.getElementById('goalTitleInput').value = '';
        document.getElementById('goalCurrentInput').value = 0;
        document.getElementById('goalTargetInput').value = 10;
        document.getElementById('goalDeadlineInput').value = '';
        document.getElementById('goalPriorityInput').value = 'Medium';
    }
    showModal('goalModal');
}
document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal(null));
document.getElementById('addGoalBtnSmall').addEventListener('click', () => openGoalModal(null));
document.getElementById('viewAllGoals').addEventListener('click', e => { e.preventDefault(); scrollToSection('goalsSection', true); });
document.getElementById('saveGoalBtn').addEventListener('click', () => {
    const title = document.getElementById('goalTitleInput').value.trim();
    if (!title) { toast('Please enter a goal title.'); return; }
    const current = parseInt(document.getElementById('goalCurrentInput').value, 10) || 0;
    const target = parseInt(document.getElementById('goalTargetInput').value, 10) || 1;
    const deadline = document.getElementById('goalDeadlineInput').value;
    const priority = document.getElementById('goalPriorityInput').value;
    if (editingGoalId) {
        const g = state.goals.find(x => x.id === editingGoalId);
        Object.assign(g, { title, current, target, deadline, priority });
    } else {
        state.goals.push({ id: uid(), title, current, target, deadline, priority, icon: 'fa-solid fa-bullseye', color: 'green' });
    }
    saveState(); closeModal('goalModal'); renderGoals();
    toast('Goal saved.');
});

/* =========================================================
   ACHIEVEMENTS
   ========================================================= */
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = state.achievementsUnlocked.includes(a.id);
        return `<div class="achievement-card ${unlocked ? 'unlocked' : ''}">
            <div class="ach-icon">${a.icon}</div><h5>${a.name}</h5><p>${a.desc}</p>
        </div>`;
    }).join('');
}

/* =========================================================
   WEEKLY REPORT / PRODUCTIVITY SCORE / ACTIVITY FEED / NOTIFICATIONS
   ========================================================= */
function renderWeeklyReport() {
    const r = computeWeeklyReport(state);
    document.getElementById('weeklyGoalPercent').textContent = r.percent + '%';
    document.getElementById('weeklyGoalSub').textContent = `${r.completed} / ${r.total} habits completed this week`;
    const bar = document.getElementById('weeklyGoalBar');
    bar.dataset.value = r.percent;
    requestAnimationFrame(() => { bar.style.width = r.percent + '%'; });
    document.getElementById('weeklyReportMini').innerHTML = `
        <span>Completed<b>${r.completed}</b></span>
        <span>Missed<b>${r.missed}</b></span>
        <span>Best Day<b>${r.bestDay}</b></span>`;
    const score = clamp(Math.round(r.percent * 0.6 + Math.min(Math.max(0, ...state.habits.map(computeStreak)), 30) / 30 * 100 * 0.4), 0, 100);
    document.getElementById('productivityScore').innerHTML = `Productivity Score: <b>${score} / 100</b>`;
}

function renderActivity() {
    const list = document.getElementById('activityList');
    list.innerHTML = state.activity.slice(0, 8).map(a => `
        <div class="activity-item ${a.type === 'miss' ? 'missed' : ''}">
            <i class="fa-solid ${a.type === 'miss' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
            <span>${escapeHtml(a.text)}</span>
            <span class="activity-time">${timeAgo(a.time)}</span>
        </div>`).join('') || '<p class="empty-state">No activity yet.</p>';
}

function renderNotifications() {
    const list = document.getElementById('notifList');
    const recent = state.activity.slice(0, 6);
    list.innerHTML = recent.map(a => `<li><i class="fa-solid ${a.type === 'miss' ? 'fa-circle-xmark' : 'fa-check'}"></i> ${escapeHtml(a.text)}</li>`).join('') || '<li class="empty">No notifications</li>';
    document.getElementById('notifBadge').textContent = recent.length;
}

/* =========================================================
   BROWSER NOTIFICATIONS / REMINDER
   ========================================================= */
function maybeFireReminder() {
    if (!state.settings.notificationsEnabled) return;
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (hhmm === state.settings.reminderTime && state.lastReminderDate !== todayKey()) {
        new Notification('Habit Tracker Reminder', { body: "Don't forget to complete your habits today!" });
        state.lastReminderDate = todayKey();
        saveState();
    }
}
setInterval(maybeFireReminder, 20000);

/* =========================================================
   MODALS (generic)
   ========================================================= */
function showModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-close, [data-close]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
});

/* =========================================================
   SETTINGS
   ========================================================= */
document.getElementById('openSettingsBtn').addEventListener('click', e => { e.preventDefault(); openSettings(); });
function openSettings() {
    document.getElementById('settingsName').value = state.profile.name;
    document.getElementById('settingsEmail').value = state.profile.email;
    document.getElementById('settingsNotifToggle').checked = state.settings.notificationsEnabled;
    document.getElementById('settingsReminderTime').value = state.settings.reminderTime;
    showModal('settingsModal');
}
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    state.profile.name = document.getElementById('settingsName').value.trim() || state.profile.name;
    state.profile.email = document.getElementById('settingsEmail').value.trim();
    const wantNotif = document.getElementById('settingsNotifToggle').checked;
    if (wantNotif && Notification.permission !== 'granted' && 'Notification' in window) {
        Notification.requestPermission().then(perm => {
            state.settings.notificationsEnabled = perm === 'granted';
            saveState();
            if (perm !== 'granted') toast('Notifications permission was not granted.');
        });
    } else {
        state.settings.notificationsEnabled = wantNotif;
    }
    state.settings.reminderTime = document.getElementById('settingsReminderTime').value || '19:00';
    saveState(); closeModal('settingsModal'); renderProfileHeader();
    toast('Settings saved.');
});
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (!confirm('This will permanently delete all local data. Continue?')) return;
    localStorage.clear();
    window.location.href = 'login.html';
});

/* ---- Export ---- */
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    let rows = ['Habit,Category,Date,Completed'];
    state.habits.forEach(h => {
        Object.keys(h.completions).sort().forEach(k => {
            rows.push(`${h.name},${h.category},${k},${h.completions[k] ? 'Yes' : 'No'}`);
        });
    });
    downloadFile('habit-tracker-export.csv', rows.join('\n'), 'text/csv');
});
document.getElementById('exportJsonBtn').addEventListener('click', () => {
    downloadFile('habit-tracker-data.json', JSON.stringify(state, null, 2), 'application/json');
});
function downloadFile(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
}

/* =========================================================
   PROFILE HEADER
   ========================================================= */
function renderProfileHeader() {
    document.getElementById('profileName').textContent = state.profile.name;
    document.getElementById('profileImg').src = state.profile.photo;
    const { level, into, pct } = levelInfo(state.xp);
    document.getElementById('sidebarLevel').textContent = level;
    document.getElementById('sidebarXpText').textContent = `${into} / ${XP_PER_LEVEL} XP`;
    document.getElementById('sidebarXpBar').dataset.value = pct;
    const bar = document.getElementById('sidebarXpBar');
    requestAnimationFrame(() => { bar.style.width = pct + '%'; });
}

/* =========================================================
   NAV / MOBILE
   ========================================================= */
function scrollToSection(id, forceShow) {
    const el = document.getElementById(id);
    if (!el) return;
    if (forceShow) el.style.display = '';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.nav-item[data-target], .bottom-nav a[data-target]').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.closest('.nav-item')?.classList.add('active');
        scrollToSection(el.dataset.target);
        document.getElementById('sidebar').classList.remove('open');
    });
});
document.querySelectorAll('.nav-item[data-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); showModal(el.dataset.open); });
});
document.getElementById('bottomNavProfile').addEventListener('click', e => { e.preventDefault(); openSettings(); });

document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

/* ---- notification dropdown ---- */
const notifBox = document.getElementById('notifBox');
const notifDropdown = document.getElementById('notifDropdown');
notifBox.addEventListener('click', e => { e.stopPropagation(); notifDropdown.classList.toggle('show'); });
document.addEventListener('click', e => { if (!notifBox.contains(e.target)) notifDropdown.classList.remove('show'); });

/* =========================================================
   MASTER RENDER
   ========================================================= */
function renderAll() {
    renderProfileHeader();
    updateGreeting();
    renderHabits();
    renderCalendar();
    renderHeatmap();
    renderTopStats();
    renderInnerStats();
    updateTrendChart();
    renderGoals();
    renderAchievements();
    renderWeeklyReport();
    renderActivity();
    renderNotifications();
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    handleAuth();
    applyTheme();
    updateClock(); setInterval(updateClock, 1000);
    updateDate(); setInterval(updateDate, 60000);
    initWeather();
    renderAll();
    checkAchievements(); saveState();

    setTimeout(() => document.getElementById('skeletonOverlay').classList.add('hide'), 500);
});