const loginForm    = document.getElementById('loginForm');
const loginMessage = document.getElementById('message');

const resetLoginButton = (loginBtn) => {
    loginBtn.disabled = false;
    loginBtn.removeAttribute('aria-busy');
    loginBtn.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
};

const showLoginError = (text) => {
    loginMessage.textContent = text;
    loginMessage.style.color = '#ef4444';
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Wake a sleeping Render free-tier instance before login (helps slow mobile networks). */
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
        // Ignore — login attempt will surface a clearer error.
    } finally {
        clearTimeout(timer);
    }
};

const loginRequest = async (email, password) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
        const res = await fetch(`${window.APP_CONFIG.apiBase}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify({ email, password })
        });
        let data = {};
        try {
            data = await res.json();
        } catch {
            data = {};
        }
        return { res, data };
    } finally {
        clearTimeout(timer);
    }
};

if (loginForm) {
    // Pre-warm API while user is typing (best-effort).
    wakeApi();

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
            let result;
            let lastError;

            // One retry: first attempt often fails while Render cold-starts.
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    if (attempt === 1) {
                        loginMessage.textContent = 'Connecting to server...';
                        loginMessage.style.color = '#6b7280';
                        await wakeApi();
                    } else {
                        loginMessage.textContent = 'Server is waking up, retrying...';
                        loginMessage.style.color = '#6b7280';
                        await wait(2000);
                    }
                    result = await loginRequest(email, password);
                    lastError = null;
                    break;
                } catch (error) {
                    lastError = error;
                }
            }

            if (lastError || !result) {
                const aborted = lastError?.name === 'AbortError';
                showLoginError(
                    aborted
                        ? 'Server took too long to respond. The API may be waking up — wait 30 seconds and try again on mobile data/Wi‑Fi.'
                        : 'Unable to reach the API. Check your internet, try another network, and confirm the site URL is the public one (not a private/local link).'
                );
                resetLoginButton(loginBtn);
                return;
            }

            const { res, data } = result;

            if (res.ok) {
                if (!data.token) {
                    showLoginError('Login API is outdated (no token). Merge the auth fix to main and redeploy the backend on Render, then try again.');
                    resetLoginButton(loginBtn);
                    return;
                }

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
                showLoginError(data.message || 'Incorrect email or password.');
                resetLoginButton(loginBtn);
            }

        } catch (error) {
            showLoginError('Unable to connect to server. Please check your connection and try again.');
            resetLoginButton(loginBtn);
        }
    });
}
