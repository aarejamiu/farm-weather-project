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
        const res = await fetch(`${window.APP_CONFIG.apiBase}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
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