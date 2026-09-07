const form    = document.getElementById('registerForm');
const message = document.getElementById('message');

const resetRegisterButton = (btn) => {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.innerHTML = 'Create account <span aria-hidden="true">→</span>';
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const wakeApi = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
        await fetch(`${window.APP_CONFIG.apiBase}/health`, {
            method: 'GET',
            credentials: 'omit',
            signal: controller.signal,
            cache: 'no-store'
        });
    } catch {
        // ignore
    } finally {
        clearTimeout(timer);
    }
};

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
        let res;
        let data = {};
        let lastError;

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                if (attempt === 1) {
                    message.textContent = 'Connecting to server...';
                    message.style.color = '#6b7280';
                    await wakeApi();
                } else {
                    message.textContent = 'Server is waking up, retrying...';
                    message.style.color = '#6b7280';
                    await wait(2000);
                }

                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 45000);
                try {
                    res = await fetch(`${window.APP_CONFIG.apiBase}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        signal: controller.signal,
                        body: JSON.stringify({ username, email, password })
                    });
                    try {
                        data = await res.json();
                    } catch {
                        data = {};
                    }
                } finally {
                    clearTimeout(timer);
                }
                lastError = null;
                break;
            } catch (error) {
                lastError = error;
            }
        }

        if (lastError || !res) {
            const aborted = lastError?.name === 'AbortError';
            message.textContent = aborted
                ? 'Server took too long to respond. Wait 30 seconds and try again.'
                : 'Unable to reach the API. Check your internet and try another network.';
            message.style.color = '#ef4444';
            resetRegisterButton(btn);
            return;
        }

        if (res.ok) {
            if (!data.token) {
                message.textContent = 'Register API is outdated (no token). Merge the auth fix to main and redeploy the backend on Render, then try again.';
                message.style.color = '#ef4444';
                resetRegisterButton(btn);
                return;
            }

            window.Auth.setSession(data.user, data.token);

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
            resetRegisterButton(btn);
        }

    } catch (error) {
        message.textContent = 'An error occurred. Please try again.';
        message.style.color = '#ef4444';
        resetRegisterButton(btn);
    }
});
