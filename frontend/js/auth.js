// const form = document.getElementById('registerForm');
// const message = document.getElementById('message');

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     let username = form.username.value;
//     let email = form.email.value;
//     let password = form.password.value;
//     let confirmPassword = form.confirmPassword.value;

//     if (password === confirmPassword){
//         message.textContent = "Registering...";
//     }else {
//         message.textContent = "Password does not match.";
//     }
//     try{
//     const res = await fetch(`${window.APP_CONFIG.apiBase}/auth/register`,{
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, email, password })
//     });

//     // const data = await res.json();

//     if (res.ok) {
//         message.textContent = " Registration successful!";
//         window.location.href = 'login.html';
//         form.reset();
//     } else {
//         message.textContent = data.message || 'Registration failed.';
//     }
// } catch (error) {
//     console.error('Error:', error);
//     message.textContent = 'An error occurred during registration.';
// }
// })

const form    = document.getElementById('registerForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username        = form.username.value.trim();
    const email           = form.email.value.trim();
    const password        = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
        message.textContent = 'Passwords do not match.';
        message.style.color = '#ef4444';
        return;
    }

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = '<span class="button-loading"><span class="auth-spinner" aria-hidden="true"></span>Creating account...</span>';
    message.textContent = '';

    try {
        const res  = await fetch(`${window.APP_CONFIG.apiBase}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            message.textContent = 'Registration successful! Redirecting...';
            message.style.color = '#2e7d32';

            setTimeout(() => {
                if (data.user.role === 'farmer') {
                    window.location.href = 'farmer/dashboard.html';
                } else {
                    window.location.href = 'customer/home.html';
                }
            }, 800);
        } else {
            message.textContent = data.message || 'Registration failed.';
            message.style.color = '#ef4444';
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            btn.innerHTML = 'Create account <span aria-hidden="true">→</span>';
        }

    } catch (error) {
        message.textContent = 'An error occurred. Please try again.';
        message.style.color = '#ef4444';
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.innerHTML = 'Create account <span aria-hidden="true">→</span>';
    }
});