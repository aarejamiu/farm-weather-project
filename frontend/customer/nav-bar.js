const CustomerRouter = {
    pageScripts: new Map(),
    pageCache: new Map(),

    init() {
        this.initHamburger();
        this.initAccountMenu();
        this.initRouter();
        this.cachePage(window.location.href, document);
    },

    initHamburger() {
    const hamburger  = document.getElementById('custHamburger');
    const mobileMenu = document.getElementById('custMobileMenu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });
    },

    initAccountMenu() {
        const avatar = document.getElementById('navAvatar');
        if (!avatar || avatar.dataset.accountReady) return;
        avatar.dataset.accountReady = 'true';
        avatar.setAttribute('role', 'button');
        avatar.setAttribute('tabindex', '0');
        avatar.setAttribute('aria-label', 'Open account menu');
        avatar.setAttribute('aria-expanded', 'false');

        const logoutMenu = document.createElement('div');
        logoutMenu.className = 'cust-logout-menu';
        logoutMenu.hidden = true;
        logoutMenu.innerHTML = '<button type="button" class="cust-logout-btn">Log out</button>';
        avatar.parentElement.appendChild(logoutMenu);

        const toggle = () => {
            const isOpen = logoutMenu.hidden;
            logoutMenu.hidden = !isOpen;
            avatar.setAttribute('aria-expanded', String(isOpen));
        };
        avatar.addEventListener('click', toggle);
        avatar.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
        logoutMenu.querySelector('button').addEventListener('click', async () => {
            await fetch(`${window.APP_CONFIG.apiBase}/auth/logout`, { method: 'POST' });
            window.location.href = '../login.html';
        });
        document.addEventListener('click', event => {
            if (!logoutMenu.hidden && !logoutMenu.contains(event.target) && event.target !== avatar) {
                logoutMenu.hidden = true;
                avatar.setAttribute('aria-expanded', 'false');
            }
        });
    },

    initRouter() {
        document.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin || !url.pathname.includes('/customer/') || !url.pathname.endsWith('.html')) return;
            event.preventDefault();
            this.navigate(url.href);
        });
        window.addEventListener('popstate', () => this.navigate(window.location.href, false));
    },

    async navigate(href, pushState = true) {
        const url = new URL(href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        const cached = this.pageCache.get(url.href);
        if (cached) {
            this.restorePage(cached);
            document.title = cached.title;
            this.setActive(url);
            if (pushState) window.history.pushState({}, '', url.href);
            await this.loadScripts(cached.scripts);
            this.initAccountMenu();
            window.scrollTo(0, 0);
            return;
        }

        const response = await fetch(url.href, { headers: { 'X-Requested-With': 'customer-router' } });
        if (!response.ok) { window.location.href = url.href; return; }
        const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
        this.replacePage(nextDocument, url);
        this.setActive(url);
        if (pushState) window.history.pushState({}, '', url.href);
        const scripts = this.getScripts(nextDocument, url.href);
        await this.loadScripts(scripts);
        this.cachePage(url.href, document, scripts);
        window.scrollTo(0, 0);
    },

    replacePage(nextDocument, url) {
        document.title = nextDocument.title;
        document.querySelectorAll('link[data-customer-route-style]').forEach(link => link.remove());
        nextDocument.querySelectorAll('link[rel="stylesheet"]').forEach(source => {
            const href = new URL(source.getAttribute('href'), url.href);
            if (href.pathname.endsWith('/home.css')) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href.href;
            link.dataset.customerRouteStyle = 'true';
            document.head.appendChild(link);
        });
        document.body.querySelectorAll(':scope > *').forEach(element => {
            if (!element.classList.contains('cust-nav') && !element.classList.contains('cust-mobile-menu') && element.tagName !== 'SCRIPT') element.remove();
        });
        nextDocument.body.querySelectorAll(':scope > *').forEach(element => {
            if (!element.classList.contains('cust-nav') && !element.classList.contains('cust-mobile-menu') && element.tagName !== 'SCRIPT') document.body.appendChild(document.importNode(element, true));
        });
    },

    setActive(url) {
        const page = url.pathname.split('/').pop();
        document.querySelectorAll('.cust-nav-link').forEach(link => {
            link.classList.toggle('cust-nav-link--active', link.getAttribute('href') === page);
        });
    },

    restorePage(page) {
        document.querySelectorAll('link[data-customer-route-style]').forEach(link => link.remove());
        document.body.querySelectorAll(':scope > *').forEach(element => {
            if (!element.classList.contains('cust-nav') && !element.classList.contains('cust-mobile-menu') && element.tagName !== 'SCRIPT') element.remove();
        });
        page.content.forEach(element => document.body.appendChild(element.cloneNode(true)));
        page.styles.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.customerRouteStyle = 'true';
            document.head.appendChild(link);
        });
    },

    cachePage(href, sourceDocument, scripts = this.getScripts(sourceDocument)) {
        this.pageCache.set(href, {
            title: sourceDocument.title,
            content: [...sourceDocument.body.querySelectorAll(':scope > *')].filter(element => !element.classList.contains('cust-nav') && !element.classList.contains('cust-mobile-menu') && element.tagName !== 'SCRIPT').map(element => element.cloneNode(true)),
            styles: [...sourceDocument.querySelectorAll('link[rel="stylesheet"]')].map(link => link.href).filter(href => !href.endsWith('/home.css')),
            scripts
        });
    },

    getScripts(sourceDocument, baseUrl = window.location.href) {
        return [...sourceDocument.querySelectorAll('script[src]')].map(script => new URL(script.getAttribute('src'), baseUrl).href).filter(href => !href.endsWith('/nav-bar.js'));
    },

    async loadScripts(scriptHrefs) {
        for (const href of scriptHrefs) {
            const url = new URL(href, window.location.href);
            if (this.pageScripts.has(url.href)) {
                new Function(this.pageScripts.get(url.href)).call(window);
                continue;
            }
            const source = await fetch(url.href).then(response => response.text());
            this.pageScripts.set(url.href, source);
            new Function(source).call(window);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => CustomerRouter.init());