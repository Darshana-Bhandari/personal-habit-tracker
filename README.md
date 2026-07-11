# Habit Tracker

A modern and responsive Habit Tracker web application designed to help users build positive habits, maintain daily streaks, track progress, and improve productivity through an intuitive and interactive dashboard.

> **Project Status:** 🚧 Currently Under Development

The authentication system is complete, and the dashboard now has full habit management, goal tracking, statistics, achievements, and interactive UI components working end-to-end.

---

# Features

## Authentication

- Email and Password Login
- Guest Login
- Remember Me
- Show/Hide Password
- Real-time Email Validation
- Password Strength Indicator
- Password Requirements Checklist
- Caps Lock Detection
- Login Attempt Limiter (Maximum 5 Attempts)
- Temporary Account Lock Protection
- Session Management using Local Storage
- Login State Persistence
- Automatic Redirect for Logged-in Users
- Logout Functionality
- Enter Key Login Support
- Loading Animation
- Success Animation
- Toast Notifications

---

## Dashboard

### User Experience

- Modern Glassmorphism UI Design
- Responsive Layout (desktop, tablet, mobile)
- Animated Components
- Smooth Hover Effects
- Personalized Greeting Based on Time + Today's Completion
- Dynamic Motivational Message (performance-based)
- Dynamic Date Display
- Mobile-Friendly Sidebar + Bottom Nav

### Header

- Personalized User Greeting
- Last Login Timestamp
- Live Clock
- Live Weather Widget (Open-Meteo, geolocation-based)
- Current Date Widget
- Habit Search
- Notification Dropdown (live activity feed)
- Theme Toggle (Light / Dark / Green / Blue / Purple)
- User Profile Section
- Logout Button

### Statistics Overview

- Total Habits (+ added this month)
- Current Streak
- Best Streak
- Completion Rate with Animated Progress Ring

### Habit Management

- Today's Habit List
- Add / Edit / Delete Habit
- Habit Categories, Icons, and Colors
- Daily Goal per Habit
- Habit Completion Checkboxes
- Favorites (star pinning)
- Search + Filter Chips (All / Completed / Incomplete / Favorites)
- Interactive Hover Effects

### Calendar

- Monthly Habit Calendar with Navigation
- Completed / Missed / Partial Day Indicators
- Click a Day for Full Detail Breakdown
- 90-Day Heatmap
- Calendar Legend

### Goals

- Add / Edit / Delete Goals
- Goal Progress Bars
- Priority Tags (Low / Medium / High)
- Deadlines
- Weekly Goal Progress

### Statistics & Analytics

- Habit Completion Trend Chart (Chart.js) — Line / Bar / Pie / Doughnut / Radar
- Selectable Time Ranges (7 Days / 4 Weeks / 6 Months / Year)
- Category Breakdown
- Active Days, Habits Completed, Time Saved
- Most / Least Productive Day
- Total Missed

### Achievements

- 7 Unlockable Achievements (streaks, completion rate, category-specific, totals)
- Automatic Detection + Toast Celebration
- XP Reward per Achievement

### XP & Leveling

- XP earned per habit completion and achievement
- Level calculation and sidebar progress bar

### Recent Activity

- Activity Timeline
- Completed / Missed Habits
- Relative Timestamps ("2h ago")

### Settings

- Editable Display Name & Email
- Notification Toggle (with browser permission request)
- Daily Reminder Time
- CSV Export
- JSON Data Export
- Delete Account

---

# Technologies Used

- HTML5
- CSS3 (CSS Variables, Glassmorphism, Animations)
- JavaScript (Vanilla JS)
- Chart.js
- Font Awesome
- Open-Meteo API (weather)
- Local Storage API

---

# Project Structure

```text
Habit-Tracker/
│
├── login.html
├── login.css
├── login.js
│
├── Dashboard.html
├── Dashboard.css
├── Dashboard.js
│
├── assets/
│
└── README.md
```

---

# Demo Accounts

### Demo User

**Email**

```
demo@habit.com
```

**Password**

```
Demo123!
```

---

### User

**Email**

```
darsu@gmail.com
```

**Password**

```
Darsu123!
```

---

### Admin

**Email**

```
admin@gmail.com
```

**Password**

```
Admin123!
```

---

### Test User

**Email**

```
test@gmail.com
```

**Password**

```
Test123!
```

---

# Current Pages

## Login Page

- Secure Login
- Guest Login
- Remember Me
- Password Validation
- Password Strength Meter
- Theme Toggle
- Session Management

## Dashboard

- Welcome Section
- Dashboard Statistics
- Habit Overview (Add / Edit / Delete / Search / Filter)
- Calendar Widget (Interactive)
- Goal Tracking (Add / Edit / Delete)
- Progress Analytics (Charts)
- Weekly Goal
- Recent Activity
- Notifications
- Achievements
- Settings (Export, Reminders, Account)
- Logout

---

# 📅 Progress Log

the dashboard moved from "UI only" to a fully functional app backed by `localStorage`. Highlights:

- ✅ **Habit CRUD** — Add, Edit, and Delete habits now fully work (modal form with name, category, icon, color, daily goal)
- ✅ **Daily Tracking** — Checkbox toggling marks habits complete/incomplete for today and updates streaks, XP, and activity feed live
- ✅ **Search & Filters** — Habit search box and filter chips (All / Completed / Incomplete / Favorites) are functional
- ✅ **Favorites** — Star toggle to pin favorite habits to the top of the list
- ✅ **Calendar Interaction** — Month navigation, day click-to-view completion detail, and a 90-day heatmap
- ✅ **Goals** — Add/Edit/Delete goals with progress bars, priority tags, and deadlines
- ✅ **Statistics & Charts** — Chart.js trend chart with 5 chart types (line/bar/pie/doughnut/radar) and 4 time periods, plus an inner stats grid (active days, time saved, most/least productive day, etc.)
- ✅ **Achievements System** — 7 unlockable achievements with automatic detection and toast celebration + XP reward
- ✅ **XP & Leveling** — XP bar and level indicator in the sidebar, XP earned per completion/achievement
- ✅ **Weekly Report** — Weekly goal progress bar, completed/missed breakdown, best day, and a productivity score
- ✅ **Settings Page** — Editable name/email, notification toggle with permission request, reminder time, CSV export, JSON export, delete account
- ✅ **Live Weather Widget** — Real-time weather via Open-Meteo (geolocation with Kathmandu fallback)
- ✅ **Live Clock & Dynamic Greeting** — Updates every second, greeting changes by time of day + today's completion rate
- ✅ **Light Mode + 3 Extra Themes** — Light, Dark, Green, Blue, Purple theme toggle, fully wired to CSS variables
- ✅ **Notifications Dropdown** — Recent activity shown as notifications with a live badge count
- ✅ **Mobile Responsive Nav** — Hamburger sidebar + bottom nav bar + floating action button for mobile
- ✅ **Toast Notification System** — Success/achievement toasts across the app
- ✅ **Skeleton Loading Screen** — Shimmer overlay on initial load

**Next up:** backend integration is still the big remaining piece — everything currently lives in `localStorage`.

---

# Current Progress

### Completed

- Authentication System
- Login Validation
- Session Management
- Responsive Login Page
- Dashboard UI
- Sidebar + Mobile Bottom Nav
- Statistics Cards
- Add / Edit / Delete Habit
- Habit Categories
- Habit Search
- Habit Filters
- Daily Habit Tracking
- Calendar Widget + Interaction
- Goal Section (Add / Edit / Delete)
- Statistics Section
- Weekly Goal Section
- Recent Activity
- Progress Ring Animation
- Progress Bar Animation
- Greeting Based on Time
- Dynamic Date
- Notification Dropdown
- Mobile Sidebar
- Logout Functionality
- Chart.js Integration (5 chart types)
- User Profile
- Settings Page
- Achievement Badges
- Habit Reminders (browser notifications)
- Weekly Reports
- Data Export (CSV + JSON)
- Light Mode + Extra Themes
- Live Weather Widget
- XP / Leveling System

---

# Upcoming Features

- Habit Notes
- Monthly Reports
- Backend Integration
- Database Storage

---
---

# Installation

Clone the repository

```bash
git clone https://github.com/Darshana-Bhandari/Habit-Tracker.git
```

Open the project folder.

Run **login.html** in your browser.

No additional dependencies are required.

---

# Learning Objectives

This project is being built to strengthen practical frontend development skills by implementing:

- Responsive Web Design
- Modern UI/UX Design
- JavaScript DOM Manipulation
- Authentication Flow
- Local Storage
- Dashboard Design
- Data Visualization
- Interactive Components
- CSS Animations
- Mobile Responsive Design

---

# Author

**Darshana Bhandari**

This project is part of my frontend development learning journey and focuses on building a modern productivity application while improving my HTML, CSS, JavaScript, UI/UX, and dashboard development skills.

---

## ⭐ Support

If you like this project, consider giving it a **Star** on GitHub.
