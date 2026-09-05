(() => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const apiHost = isLocal
        ? 'http://127.0.0.1:5000'
        : 'https://leaders-union-farm-weather-site.onrender.com';

    window.APP_CONFIG = Object.freeze({
        apiHost,
        apiBase: `${apiHost}/api`
    });

    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const requestUrl = typeof input === 'string' ? input : input.url;
        if (requestUrl.startsWith(apiHost)) {
            return nativeFetch(input, { ...init, credentials: 'include' });
        }
        return nativeFetch(input, init);
    };
})();
