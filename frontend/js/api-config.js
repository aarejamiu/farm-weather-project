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
        if (path.includRes('/customer/')) return 'home.html';
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
            try {
                return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
            } catch {
                return '';
            }
        },

        getUser() {
            try {
                const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '{}';
                return normalizeUser(JSON.parse(raw));
            } catch {
                return {};
            }
        },

        setSession(user, token) {
            const normalized = user ? normalizeUser(user) : null;
            try {
                if (normalized) {
                    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
                    sessionStorage.setItem(USER_KEY, JSON.stringify(normalized));
                }
                // Only overwrite the token when a new one is provided (login/register).
                // Profile refreshes must keep the existing accessToken.
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                    sessionStorage.setItem(TOKEN_KEY, token);
                }
            } catch (error) {
                console.error('Unable to persist session', error);
            }
        },

        clearSession() {
            try {
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(USER_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
            } catch {
                // ignore storage access errors
            }
        },

        /**
         * Safari blocks most cross-site cookies (ITP). Auth must rely on
         * Authorization: Bearer from localStorage, not the httpOnly cookie alone.
         * Only redirect to login on a confirmed 401.
         */
        async verify({ requiredRole } = {}) {
            const cached = this.getUser();
            const token = this.getToken();

            // No token and no cached user → send to login without hitting the API.
            if (!token && !cached.id) {
                window.location.href = loginPath();
                return null;
            }

            try {
                const headers = { Accept: 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetch(`${window.APP_CONFIG.apiBase}/profile`, {
                    method: 'GET',
                    headers,
                    credentials: 'include',
                    cache: 'no-store'
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
            // Safari: always send credentials; Bearer header is the real auth.
            return nativeFetch(input, {
                ...init,
                headers,
                credentials: init.credentials || 'include',
                cache: init.cache || 'no-store'
            });
        }
        return nativeFetch(input, init);
    };
})();
