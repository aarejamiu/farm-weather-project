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
//     const res = await fetch("https://leaders-union-farm-weather-site.onrender.com/api/auth/register",{
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

    message.textContent = 'Registering...';
    message.style.color = '#6b7280';

    const btn = form.querySelector('button');
    btn.disabled = true;

    try {
        const res  = await fetch('https://leaders-union-farm-weather-site.onrender.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

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
        }

    } catch (error) {
        message.textContent = 'An error occurred. Please try again.';
        message.style.color = '#ef4444';
        btn.disabled = false;
    }
});