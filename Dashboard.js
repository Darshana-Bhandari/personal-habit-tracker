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