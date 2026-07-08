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