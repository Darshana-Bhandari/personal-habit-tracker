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