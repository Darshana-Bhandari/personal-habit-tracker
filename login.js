document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.querySelector('.toggle-password');
    const loginForm = document.querySelector('.login-form');
    const googleBtn = document.querySelector('.btn-google');

    // 1. Password Visibility Toggle
    if (togglePasswordIcon && passwordInput) {
        togglePasswordIcon.addEventListener('click', () => {
            // Toggle the type attribute
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the eye / eye-slash icon classes
            togglePasswordIcon.classList.toggle('fa-eye');
            togglePasswordIcon.classList.toggle('fa-eye-slash');
        });
    }

    // 2. Form Submission Handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload
            
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const rememberMe = document.getElementById('remember').checked;

            console.log('Logging in with:', { email, password, rememberMe });
            
            // Add your authentication logic / API call here
            alert(`Attempting login for: ${email}`);
        });
    }

    // 3. Google Login Handler
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            console.log('Initiating Google OAuth login...');
            // Redirect to Google OAuth URL here
        });
    }
});