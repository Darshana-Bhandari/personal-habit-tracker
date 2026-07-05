
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
    const passwordRules = document.getElementById('password-rules');
    const rememberCheckbox = document.getElementById('remember');
    const themeBtn = document.getElementById('themeBtn');
    const greetingEl = document.getElementById('greeting');
    const greetingSubEl = document.getElementById('greeting-sub');
    const loginCard = document.querySelector('.login-container');
    const loginBtn = document.querySelector('.btn-login');
    const guestBtn = document.querySelector('.btn-guest');

    // ----------------------------------------------------
    // Feature: Welcome Message Based on Time (+ saved name)
    // ----------------------------------------------------
    const hour = new Date().getHours();
    let timeGreeting = "Good Evening";
    let emoji = "🌙";
    if (hour < 12) {
        timeGreeting = "Good Morning";
        emoji = "☀️";
    } else if (hour < 18) {
        timeGreeting = "Good Afternoon";
        emoji = "🌤️";
    }

    const savedName = localStorage.getItem("userName");
    if (savedName) {
        greetingEl.textContent = `${timeGreeting}, ${savedName} ${emoji}`;
        greetingSubEl.textContent = "Ready to continue your streak?";
    } else {
        greetingEl.textContent = `${timeGreeting} ${emoji}`;
    }

    // ----------------------------------------------------
    // Feature: Load Saved Email (Remember Me / Keep signed in)
    // ----------------------------------------------------
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // ----------------------------------------------------
    // Feature: Light / Dark Theme Toggle
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
    // Feature: Real-Time Email Validation
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
    // Feature: Strength Meter, Password Rules & Caps Lock Detection
    // ----------------------------------------------------
    const ruleChecks = {
        length: { el: document.getElementById('rule-length'), test: (v) => v.length >= 8 },
        upper: { el: document.getElementById('rule-upper'), test: (v) => /[A-Z]/.test(v) },
        number: { el: document.getElementById('rule-number'), test: (v) => /[0-9]/.test(v) },
        special: { el: document.getElementById('rule-special'), test: (v) => /[^A-Za-z0-9]/.test(v) }
    };

    passwordInput.addEventListener("input", () => {
        let value = passwordInput.value;

        if (value.length === 0) {
            strengthMeterContainer.style.display = "none";
            strengthText.textContent = "";
            passwordRules.classList.remove("visible");
            return;
        }

        strengthMeterContainer.style.display = "block";
        passwordRules.classList.add("visible");

        // Update rule checklist
        let metCount = 0;
        Object.values(ruleChecks).forEach(({ el, test }) => {
            if (test(value)) {
                el.classList.add("met");
                el.querySelector('i').className = "fa-solid fa-circle-check";
                metCount++;
            } else {
                el.classList.remove("met");
                el.querySelector('i').className = "fa-solid fa-circle";
            }
        });

        // Strength based on rules met + length
        if (value.length < 6 || metCount <= 1) {
            strengthBar.style.width = "30%";
            strengthBar.style.background = "#e53e3e";
            strengthText.textContent = "Weak";
            strengthText.style.color = "#e53e3e";
        } else if (metCount <= 3) {
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
    // Feature: Form Handling (Submit, Spinner, Success, Redirect, Shake)
    // ----------------------------------------------------
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Custom validation check example to showcase the shake animation
        if (password.length < 6) {
            loginCard.classList.add("shake");
            setTimeout(() => {
                loginCard.classList.remove("shake");
            }, 400);
            return;
        }

        // Save email / name if "Keep me signed in" is checked
        if (rememberCheckbox.checked) {
            localStorage.setItem("savedEmail", email);
            const namePart = email.split('@')[0];
            if (namePart) {
                localStorage.setItem("userName", namePart);
            }
        } else {
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("userName");
        }

        // Loading spinner state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Signing In...';

        setTimeout(() => {
            // Success animation
            loginBtn.classList.add("success");
            loginBtn.innerHTML = '<i class="fa-solid fa-check"></i> Success';

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 900);
        }, 1600);
    });

    // ----------------------------------------------------
    // Feature: Continue as Guest
    // ----------------------------------------------------
    guestBtn.addEventListener("click", () => {
        guestBtn.disabled = true;
        guestBtn.textContent = "Entering as Guest...";
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 900);
    });
});