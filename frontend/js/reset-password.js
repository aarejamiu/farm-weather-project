const form = document.getElementById('resetPasswordForm');
const message = document.getElementById('message');
const token = new URLSearchParams(window.location.search).get('token');

if (!token) {
    message.textContent = 'This reset link is invalid or incomplete.';
    message.style.color = '#ef4444';
    form.querySelector('button').disabled = true;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    if (password !== confirmPassword) {
        message.textContent = 'Passwords do not match.';
        message.style.color = '#ef4444';
        return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Resetting...';
    message.textContent = '';

    try {
        const response = await fetch(`${window.APP_CONFIG.apiBase}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to reset the password.');

        message.textContent = data.message;
        message.style.color = '#2e7d32';
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (error) {
        message.textContent = error.message;
        message.style.color = '#ef4444';
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.innerHTML = 'Reset password <span aria-hidden="true">→</span>';
    }
});
