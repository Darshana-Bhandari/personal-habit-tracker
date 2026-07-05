document.addEventListener('DOMContentLoaded', () => {
    // DOM Cache Elements
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.querySelector('.toggle-password');
    const emailError = document.getElementById('email-error');
    const capsWarning = document.getElementById('caps-warning');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthMeterContainer = document.querySelector('.password-strength');
    const strengthText = document.getElementById('strength-text');
    const rememberCheckbox = document.getElementById('remember');
    const themeBtn = document.getElementById('themeBtn');
    const greetingEl = document.getElementById('greeting');
    const loginCard = document.querySelector('.login-container');
    const loginBtn = document.querySelector('.btn-login');

    // ----------------------------------------------------
    // Feature 8: Welcome Message Based on Time
    // ----------------------------------------------------
    const hour = new Date().getHours();
    if (hour < 12) {
        greetingEl.textContent = "Good Morning ☀️";
    } else if (hour < 18) {
        greetingEl.textContent = "Good Afternoon 🌤️";
    } else {
        greetingEl.textContent = "Good Evening 🌙";
    }

    // ----------------------------------------------------
    // Feature 3: Load Saved Email (Remember Me)
    // ----------------------------------------------------
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // ----------------------------------------------------
    // Feature 6: Light / Dark Theme Toggle
    // ----------------------------------------------------
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeBtn.checked = true;
    }

    themeBtn.addEventListener("change", () => {
        if (themeBtn.checked) {
            document.body.classList.add("light");
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.remove("light");
            localStorage.setItem("theme", "dark");
        }
    });

    // ----------------------------------------------------
    // Basic UI element: Password Eye Toggle
    // ----------------------------------------------------
    togglePasswordIcon.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        togglePasswordIcon.classList.toggle('fa-eye');
        togglePasswordIcon.classList.toggle('fa-eye-slash');
    });

    // ----------------------------------------------------
    // Feature 4: Real-Time Email Validation
    // ----------------------------------------------------
    emailInput.addEventListener("input", () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailInput.value.trim() === "") {
            emailError.textContent = "";
        } else if (emailPattern.test(emailInput.value)) {
            emailError.textContent = "Valid Email";
            emailError.style.color = "#2eb65e";
        } else {
            emailError.textContent = "Invalid Email";
            emailError.style.color = "#e53e3e";
        }
    });

    // ----------------------------------------------------
    // Feature 1 & 7: Strength Meter & Caps Lock Detection
    // ----------------------------------------------------
    passwordInput.addEventListener("input", () => {
        let value = passwordInput.value;

        if (value.length === 0) {
            strengthMeterContainer.style.display = "none";
            strengthText.textContent = "";
            return;
        }

        strengthMeterContainer.style.display = "block";

        if (value.length < 6) {
            strengthBar.style.width = "30%";
            strengthBar.style.background = "#e53e3e";
            strengthText.textContent = "Weak";
            strengthText.style.color = "#e53e3e";
        } else if (value.length < 10) {
            strengthBar.style.width = "70%";
            strengthBar.style.background = "#dd6b20";
            strengthText.textContent = "Medium";
            strengthText.style.color = "#dd6b20";
        } else {
            strengthBar.style.width = "100%";
            strengthBar.style.background = "#2eb65e";
            strengthText.textContent = "Strong";
            strengthText.style.color = "#2eb65e";
        }
    });

    // Check CapsLock state cleanly during typing interaction
    passwordInput.addEventListener("keyup", (e) => {
        if (e.getModifierState("CapsLock")) {
            capsWarning.textContent = "Caps Lock is ON";
        } else {
            capsWarning.textContent = "";
        }
    });

    // ----------------------------------------------------
    // Feature 2, 3 & 5: Form Handling (Submit, Loading, Shake)
    // ----------------------------------------------------
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Custom validation check example to showcase the shake animation
        if (password.length < 6) {
            // Feature 5: Shake Animation for mock failure
            loginCard.classList.add("shake");
            setTimeout(() => {
                loginCard.classList.remove("shake");
            }, 400);
            return;
        }

        // Feature 3: Save email check status 
        if (rememberCheckbox.checked) {
            localStorage.setItem("savedEmail", email);
        } else {
            localStorage.removeItem("savedEmail");
        }

        // Feature 2: Loading Button Animation state
        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        setTimeout(() => {
            loginBtn.textContent = "Login";
            loginBtn.disabled = false;
            alert("Login Successful! Processing Dashboard routing.");
        }, 2000);
    });
});