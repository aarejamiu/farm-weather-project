// const loginForm    = document.getElementById('loginForm');
// const loginMessage = document.getElementById('message');

// if (loginForm) {
//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const email    = loginForm.email.value.trim();
//         const password = loginForm.password.value;
//         const loginBtn = loginForm.querySelector('button');

//         loginBtn.disabled = true;
//         loginBtn.setAttribute('aria-busy', 'true');
//         loginBtn.innerHTML = '<span class="button-loading"><span class="auth-spinner" aria-hidden="true"></span>Signing in...</span>';
//         loginMessage.textContent = '';

//         try {
//             const res  = await fetch(`${window.APP_CONFIG.apiBase}/auth/login`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password })
//             });

//             const data = await res.json();

//             if (res.ok) {
//                 loginMessage.textContent = 'Login successful. Redirecting...';
//                 loginMessage.style.color = '#2e7d32';

//                 setTimeout(() => {
//                     if (data.user.role === 'farmer') {
//                         window.location.href = 'farmer/dashboard.html';
//                     } else {
//                         window.location.href = 'customer/home.html';
//                     }
//                 }, 800);

//             } else {
//                 loginMessage.textContent = data.message || 'Incorrect email or password.';
//                 loginMessage.style.color = '#ef4444';
//                 loginBtn.disabled        = false;
//                 loginBtn.removeAttribute('aria-busy');
//                 loginBtn.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
//             }

//         } catch (error) {
//             loginMessage.textContent = 'Unable to connect to server.';
//             loginMessage.style.color = '#ef4444';
//             loginBtn.disabled        = false;
//             loginBtn.removeAttribute('aria-busy');
//             loginBtn.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
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

        loginBtn.disabled = true;
        loginBtn.setAttribute('aria-busy', 'true');
        loginBtn.innerHTML = '<span class="button-loading"><span class="auth-spinner" aria-hidden="true"></span>Signing in...</span>';
        loginMessage.textContent = '';

        try {
            const res = await fetch(`${window.APP_CONFIG.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                window.Auth.setSession(data.user, data.token);

                loginMessage.textContent = 'Login successful. Redirecting...';
                loginMessage.style.color = '#2e7d32';

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
                loginBtn.removeAttribute('aria-busy');
                loginBtn.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
            }

        } catch (error) {
            loginMessage.textContent = 'Unable to connect to server.';
            loginMessage.style.color = '#ef4444';
            loginBtn.disabled        = false;
            loginBtn.removeAttribute('aria-busy');
            loginBtn.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
        }
    });
}