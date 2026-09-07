(() => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const apiHost = isLocal
        ? 'http://127.0.0.1:5000'
        : 'https://leaders-union-farm-weather-site.onrender.com';

    window.APP_CONFIG = Object.freeze({
        apiHost,
        apiBase: `${apiHost}/api`
    });

    const TOKEN_KEY = 'accessToken';
    const USER_KEY = 'userData';

    const loginPath = () => {
        const path = window.location.pathname || '';
        if (path.includes('/farmer/') || path.includes('/customer/')) {
            return '../login.html';
        }
        return 'login.html';
    };

    const farmerHome = () => {
        const path = window.location.pathname || '';
        if (path.includes('/customer/')) return '../farmer/dashboard.html';
        if (path.includes('/farmer/')) return 'dashboard.html';
        return 'farmer/dashboard.html';
    };

    const customerHome = () => {
        const path = window.location.pathname || '';
        if (path.includes('/farmer/')) return '../customer/home.html';
        if (path.includes('/customer/')) return 'home.html';
        return 'customer/home.html';
    };

    const normalizeUser = (user = {}) => {
        const id = user.id || user._id;
        return {
            ...user,
            id: id ? String(id) : undefined,
            username: user.username,
            email: user.email,
            role: user.role
        };
    };

    window.Auth = {
        getToken() {
            return localStorage.getItem(TOKEN_KEY) || '';
        },

        getUser() {
            try {
                return normalizeUser(JSON.parse(localStorage.getItem(USER_KEY) || '{}'));
            } catch {
                return {};
            }
        },

        setSession(user, token) {
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
            }
            // Only overwrite the token when a new one is provided (login/register).
            // Profile refreshes must keep the existing accessToken.
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
            }
        },

        clearSession() {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
        },

        /**
         * Verify the session against /profile.
         * Only redirects to login on a confirmed 401 (or when there is no
         * cached user and the request fails entirely).
         * Returns the user object, or null if navigation away was triggered.
         */
        async verify({ requiredRole } = {}) {
            const cached = this.getUser();

            try {
                const res = await fetch(`${window.APP_CONFIG.apiBase}/profile`, {
                    credentials: 'include'
                });

                if (res.status === 401) {
                    this.clearSession();
                    window.location.href = loginPath();
                    return null;
                }

                if (!res.ok) {
                    if (!cached.id) {
                        window.location.href = loginPath();
                        return null;
                    }
                    return this._enforceRole(cached, requiredRole);
                }

                const user = normalizeUser(await res.json());
                this.setSession(user);
                return this._enforceRole(user, requiredRole);
            } catch (error) {
                // Network / CORS failure — keep the user if we already have a session.
                if (!cached.id) {
                    window.location.href = loginPath();
                    return null;
                }
                return this._enforceRole(cached, requiredRole);
            }
        },

        _enforceRole(user, requiredRole) {
            if (!requiredRole || !user?.role || user.role === requiredRole) {
                return user;
            }
            window.location.href = user.role === 'farmer' ? farmerHome() : customerHome();
            return null;
        }
    };

    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const requestUrl = typeof input === 'string' ? input : input?.url;
        if (typeof requestUrl === 'string' && requestUrl.startsWith(apiHost)) {
            const headers = new Headers(
                init.headers ||
                (typeof input !== 'string' && input?.headers) ||
                undefined
            );
            const token = window.Auth.getToken();
            if (token && !headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return nativeFetch(input, { ...init, headers, credentials: 'include' });
        }
        return nativeFetch(input, init);
    };
})();
