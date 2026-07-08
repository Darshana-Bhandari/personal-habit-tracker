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