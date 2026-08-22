// const loginForm = document.getElementById('loginForm');
// const loginMessage = document.getElementById('message');

// if (loginForm) {

//     loginForm.addEventListener('submit', async (e) => {

//         e.preventDefault();

//         const email = loginForm.email.value.trim();
//         const password = loginForm.password.value;

//         const loginBtn = loginForm.querySelector('button');

//         // Loading state
//         loginBtn.disabled = true;
//         loginBtn.textContent = 'Logging in...';

//         loginMessage.textContent = 'Logging in...';
//         loginMessage.style.color = '#4A90E2';

//         try {

//             const res = await fetch(
//                 "https://leaders-union-farm-weather-site.onrender.com/api/auth/login",
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({ email, password })
//                 }
//             );

//             const data = await res.json();

//             if (res.ok) {

//                 loginMessage.textContent = 'Login successful!';
//                 loginMessage.style.color = '#2e7d32';

//                 localStorage.setItem('token', data.token);

//                 loginBtn.textContent = 'Success ✓';

//                 setTimeout(() => {
//                     if (data.user.role === 'farmer') {
//                         window.location.href = 'farmer/dashboard.html';
//                     } else {
//                         window.location.href = 'customer/home.html';
//                     }
//                 }, 1000);

//             } else {

//                 loginMessage.textContent =
//                     data.message || 'Incorrect email or password.';

//                 loginMessage.style.color = '#ff9800';

//                 loginBtn.disabled = false;
//                 loginBtn.textContent = 'Login';
//             }

//         } catch (error) {

//             console.error('Error:', error);

//             loginMessage.textContent =
//                 'Unable to connect to server.';

//             loginMessage.style.color = '#ff9800';

//             loginBtn.disabled = false;
//             loginBtn.textContent = 'Login';
//         }
//     });
// }

const loginForm    = document.getElementById('loginForm');
const loginMessage = document.getElementById('message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = loginForm.email.value.trim();
        const password = loginForm.password.value;
        const loginBtn = loginForm.querySelector('button');

        loginBtn.disabled    = true;
        loginBtn.textContent = 'Logging in...';
        loginMessage.textContent  = 'Logging in...';
        loginMessage.style.color  = '#6b7280';

        try {
            const res  = await fetch('https://leaders-union-farm-weather-site.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));

                loginMessage.textContent = 'Login successful!';
                loginMessage.style.color = '#2e7d32';
                loginBtn.textContent     = 'Success ✓';

                setTimeout(() => {
                    if (data.user.role === 'farmer') {
                        window.location.href = 'farmer/dashboard.html';
                    } else {
                        window.location.href = 'customer/home.html';
                    }
                }, 800);

            } else {
                loginMessage.textContent = data.message || 'Incorrect email or password.';
                loginMessage.style.color = '#ef4444';
                loginBtn.disabled        = false;
                loginBtn.textContent     = 'Login';
            }

        } catch (error) {
            loginMessage.textContent = 'Unable to connect to server.';
            loginMessage.style.color = '#ef4444';
            loginBtn.disabled        = false;
            loginBtn.textContent     = 'Login';
        }
    });
}