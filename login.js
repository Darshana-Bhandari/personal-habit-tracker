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

    // Demo user store — replace with a real auth check on a live backend
    const users = [
        { email: "demo@habit.com", password: "Demo123!" }
    ];

    const MAX_ATTEMPTS = 5;
    const SESSION_LIMIT_MS = 3600000; // 1 hour
    let isSubmitting = false;
    let attempts = Number(localStorage.getItem("attempts")) || 0;

    // ----------------------------------------------------
    // Feature: Toast Notifications (replaces alert())
    // ----------------------------------------------------
    function showToast(message, type = "default") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-out");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ----------------------------------------------------
    // Feature: Redirect If Already Logged In
    // ----------------------------------------------------
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "dashboard.html";
        return;
    }

    // ----------------------------------------------------
    // Feature: Welcome Message Based on Time (+ saved name + typing effect)
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
    const greetingText = savedName
        ? `${timeGreeting}, ${savedName} ${emoji}`
        : `${timeGreeting} ${emoji}`;

    // Feature: Show Last Login Time (used as the sub-greeting)
    const lastLogin = localStorage.getItem("lastLogin");
    if (savedName) {
        greetingSubEl.textContent = lastLogin
            ? `Last login: ${new Date(lastLogin).toLocaleString()}`
            : "Ready to continue your streak?";
    }

    function typeText(element, text) {
        let i = 0;
        element.textContent = "";
        (function typing() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typing, 40);
            }
        })();
    }
    typeText(greetingEl, greetingText);

    // ----------------------------------------------------
    // Feature: Load Saved Email (Remember Me / Keep signed in)
    // ----------------------------------------------------
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // ----------------------------------------------------
    // Feature: Light / Dark Theme Toggle (+ system preference on first visit)
    // ----------------------------------------------------
    if (!localStorage.getItem("theme")) {
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        if (prefersLight) {
            document.body.classList.add("light");
            themeBtn.checked = true;
        }
    } else if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeBtn.checked = true;
    }

    themeBtn.addEventListener("change", () => {
        if (themeBtn.checked) {
            document.body.classList.add("light");
            localStorage.setItem("theme", "light");
            showToast("Switched to Light Mode");
        } else {
            document.body.classList.remove("light");
            localStorage.setItem("theme", "dark");
            showToast("Switched to Dark Mode");
        }
    });

    // ----------------------------------------------------
    // Feature: Password Visibility — Hold To Reveal
    // ----------------------------------------------------
    function showPassword() {
        passwordInput.setAttribute('type', 'text');
        togglePasswordIcon.classList.remove('fa-eye');
        togglePasswordIcon.classList.add('fa-eye-slash');
    }
    function hidePassword() {
        passwordInput.setAttribute('type', 'password');
        togglePasswordIcon.classList.remove('fa-eye-slash');
        togglePasswordIcon.classList.add('fa-eye');
    }

    togglePasswordIcon.addEventListener('mousedown', showPassword);
    togglePasswordIcon.addEventListener('mouseup', hidePassword);
    togglePasswordIcon.addEventListener('mouseleave', hidePassword);
    togglePasswordIcon.addEventListener('touchstart', (e) => { e.preventDefault(); showPassword(); });
    togglePasswordIcon.addEventListener('touchend', hidePassword);

    // ----------------------------------------------------
    // Feature: Real-Time Email Validation
    // ----------------------------------------------------
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailInput.addEventListener("input", () => {
        if (emailInput.value.trim() === "") {
            emailError.textContent = "";
        } else if (emailPattern.test(emailInput.value)) {
            emailError.textContent = "Valid Email";
            emailError.style.color = "#2eb65e";
        } else {
            emailError.textContent = "Invalid Email";
            emailError.style.color = "#e53e3e";
        }
        validateForm();
    });

    // ----------------------------------------------------
    // Feature: Strength Meter, Password Rules, Character Counter & Caps Lock
    // ----------------------------------------------------
    const ruleChecks = {
        length: { el: document.getElementById('rule-length'), test: (v) => v.length >= 8 },
        upper: { el: document.getElementById('rule-upper'), test: (v) => /[A-Z]/.test(v) },
        number: { el: document.getElementById('rule-number'), test: (v) => /[0-9]/.test(v) },
        special: { el: document.getElementById('rule-special'), test: (v) => /[^A-Za-z0-9]/.test(v) }
    };

    const passwordCounter = document.createElement("small");
    passwordCounter.className = "password-counter";
    passwordRules.insertAdjacentElement("afterend", passwordCounter);

    passwordInput.addEventListener("input", () => {
        let value = passwordInput.value;

        if (value.length === 0) {
            strengthMeterContainer.style.display = "none";
            strengthText.textContent = "";
            passwordRules.classList.remove("visible");
            passwordCounter.textContent = "";
            validateForm();
            return;
        }

        strengthMeterContainer.style.display = "block";
        passwordRules.classList.add("visible");
        passwordCounter.textContent = `${value.length} characters`;

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

        validateForm();
    });

    // Check CapsLock state cleanly during typing interaction
    passwordInput.addEventListener("keyup", (e) => {
        if (e.getModifierState("CapsLock")) {
            capsWarning.textContent = "Caps Lock is ON";
        } else {
            capsWarning.textContent = "";
        }
    });

    // Feature: Auto Hide Caps Lock Warning on blur
    passwordInput.addEventListener("blur", () => {
        capsWarning.textContent = "";
    });

    // ----------------------------------------------------
    // Feature: Login Button Disabled Until Valid Input (+ attempt limit)
    // ----------------------------------------------------
    function validateForm() {
        if (attempts >= MAX_ATTEMPTS) {
            loginBtn.disabled = true;
            return;
        }
        const emailValid = emailPattern.test(emailInput.value);
        const passwordValid = passwordInput.value.length >= 8;
        loginBtn.disabled = !(emailValid && passwordValid);
    }

    function increaseAttempts() {
        attempts++;
        localStorage.setItem("attempts", attempts);
        if (attempts >= MAX_ATTEMPTS) {
            loginBtn.disabled = true;
            loginBtn.textContent = "Too Many Attempts";
        }
    }

    if (attempts >= MAX_ATTEMPTS) {
        loginBtn.disabled = true;
        loginBtn.textContent = "Too Many Attempts";
    }
    validateForm();

    // ----------------------------------------------------
    // Feature: Form Handling (Submit, Spinner, Success, Redirect, Shake)
    // ----------------------------------------------------
    function attemptLogin() {
        if (isSubmitting || attempts >= MAX_ATTEMPTS) return;

        const email = emailInput.value;
        const password = passwordInput.value;

        // Custom validation check example to showcase the shake animation
        if (!emailPattern.test(email) || password.length < 6) {
            loginCard.classList.add("shake");
            setTimeout(() => loginCard.classList.remove("shake"), 400);
            return;
        }

        // Feature: Real Login Simulation Using Users Array
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            increaseAttempts();
            showToast("Invalid credentials", "error");
            loginCard.classList.add("shake");
            setTimeout(() => loginCard.classList.remove("shake"), 400);
            return;
        }

        isSubmitting = true;

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
            showToast("Login Successful", "success");

            // Persist session info
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("lastLogin", new Date().toISOString());
            localStorage.setItem("loginTime", Date.now());
            localStorage.removeItem("attempts");

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 900);
        }, 1600);
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        attemptLogin();
    });

    // Feature: Press Enter Anywhere To Login
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !isSubmitting) {
            loginForm.requestSubmit();
        }
    });

    // ----------------------------------------------------
    // Feature: Continue as Guest
    // ----------------------------------------------------
    guestBtn.addEventListener("click", () => {
        if (isSubmitting) return;
        isSubmitting = true;
        guestBtn.disabled = true;
        guestBtn.textContent = "Entering as Guest...";
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("lastLogin", new Date().toISOString());
        localStorage.setItem("loginTime", Date.now());
        showToast("Continuing as Guest");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 900);
    });

    // ----------------------------------------------------
    // Feature: Network Status Detection
    // ----------------------------------------------------
    window.addEventListener("offline", () => showToast("You are offline", "error"));
    window.addEventListener("online", () => showToast("Back online"));

    // ----------------------------------------------------
    // Feature: Session Timeout Simulation
    // ----------------------------------------------------
    setInterval(() => {
        const loginTime = Number(localStorage.getItem("loginTime"));
        if (loginTime && Date.now() - loginTime > SESSION_LIMIT_MS) {
            showToast("Session expired", "error");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loginTime");
            setTimeout(() => window.location.reload(), 1200);
        }
    }, 60000);
});