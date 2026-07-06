document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isGuest');
            localStorage.removeItem('loginTime');
            window.location.href = 'login.html';
        });