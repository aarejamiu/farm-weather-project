const form = document.getElementById('forgotPasswordForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = form.querySelector('button');
    const email = form.email.value.trim();
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending...';
    message.textContent = '';

    try {
        const response = await fetch(`${window.APP_CONFIG.apiBase}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to send the reset link.');

        message.textContent = data.message;
        if (data.resetUrl) {
            const link = document.createElement('a');
            link.href = data.resetUrl;
            link.textContent = ' Open the reset page';
            link.target = '_blank';
            link.rel = 'noopener';
            message.appendChild(link);
        }
        message.style.color = '#2e7d32';
        form.reset();
    } catch (error) {
        message.textContent = error.message;
        message.style.color = '#ef4444';
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.innerHTML = 'Send reset link <span aria-hidden="true">→</span>';
    }
});
