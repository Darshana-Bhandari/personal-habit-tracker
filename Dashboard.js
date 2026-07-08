// ===== 1. Logout =====
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isGuest");
    localStorage.removeItem("loginTime");
    window.location.href = "login.html";
});
 
// ===== 2. Greeting based on time =====
const greeting = document.getElementById("greeting");
let hour = new Date().getHours();
let message = "";
 
if (hour < 12) {
    message = "Good Morning";
} else if (hour < 17) {
    message = "Good Afternoon";
} else if (hour < 21) {
    message = "Good Evening";
} else {
    message = "Good Night";
}
 
greeting.innerHTML = `${message}, Darshana 👋`;

// ===== 8. Today's date, auto update =====
function updateDate() {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const fullDate = now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    document.getElementById("dateDay").textContent = dayName;
    document.getElementById("dateFull").textContent = fullDate;
}
updateDate();
setInterval(updateDate, 60 * 1000);
 
// ===== 9. Motivational quote =====
const quotes = [
    "Success is built from daily habits.",
    "One percent better every day.",
    "Discipline is choosing what you want most over what you want now.",
    "Small steps every day lead to big results.",
    "Consistency turns effort into progress.",
    "Your habits shape your future self."
];
document.getElementById("quote").textContent = quotes[Math.floor(Math.random() * quotes.length)];

// ===== 6. Progress ring (Completion Rate) =====
const ring = document.getElementById("completionRing");
if (ring) {
    const radius = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const percent = parseFloat(ring.closest(".progress-ring").dataset.percent) || 0;
 
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = circumference;
 
    requestAnimationFrame(() => {
        ring.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    });
}
 
// ===== Progress bars (Goals + Weekly Goal) driven by data-value =====
document.querySelectorAll(".progress-bar-fill[data-value]").forEach((bar) => {
    const value = bar.dataset.value;
    requestAnimationFrame(() => {
        bar.style.width = `${value}%`;
    });
});
 
// ===== 11. Notification dropdown =====
const notifBox = document.getElementById("notifBox");
const notifDropdown = document.getElementById("notifDropdown");
 
notifBox.addEventListener("click", (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle("show");
});
 
document.addEventListener("click", (e) => {
    if (!notifBox.contains(e.target)) {
        notifDropdown.classList.remove("show");
    }
});
 
// ===== 16. Mobile sidebar toggle =====
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
 
menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});
 