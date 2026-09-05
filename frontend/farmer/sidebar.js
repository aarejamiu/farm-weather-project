const SidebarComponent = {
    pageScripts: new Map(),
    pageCache: new Map(),

    render(activePage = '') {
        return `
        <aside class="sidebar" id="sidebar">

            <div class="sidebar-brand">
                <div class="brand-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2C6.48 2 2 6.48 2 12"/><path d="M12 22V12"/><path d="M2 12h10"/><path d="M12 12l7-7"/></svg>
                </div>
                <div class="brand-text">
                    <span class="brand-name">Leaders-Union</span>
                    <span class="brand-sub">SMART FARM</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    Dashboard
                </a>
                <a href="weather.html" class="nav-item ${activePage === 'weather' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9Z"/></svg>
                    Weather
                </a>
                <a href="smart-ai.html" class="nav-item ${activePage === 'smart-ai' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
                    Smart AI
                </a>
                <a href="farm-planner.html" class="nav-item ${activePage === 'farm-planner' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Farm Planner
                </a>
                <a href="products.html" class="nav-item ${activePage === 'products' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Products
                </a>
                <a href="inventory.html" class="nav-item ${activePage === 'inventory' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    Inventory
                </a>
                <a href="orders.html" class="nav-item ${activePage === 'orders' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Orders
                    <span class="nav-badge" id="ordersBadge"></span>
                </a>
                <a href="messages.html" class="nav-item ${activePage === 'messages' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Messages
                    <span class="nav-badge nav-badge--orange" id="messagesBadge"></span>
                </a>
                <a href="analytics.html" class="nav-item ${activePage === 'analytics' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Analytics
                </a>
                <a href="settings.html" class="nav-item ${activePage === 'settings' ? 'active' : ''}">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <button class="user-avatar" id="sidebarAvatar" type="button" aria-label="Open account menu" aria-expanded="false">--</button>
                    <div class="user-info">
                        <span class="user-name" id="sidebarName">Loading...</span>
                        <span class="user-role">Farm Admin</span>
                    </div>
                </div>
                <div class="logout-menu" id="logoutMenu" hidden>
                    <button class="logout-btn" id="logoutBtn" type="button">Log out</button>
                </div>
                <button class="collapse-btn" id="collapseBtn">&#8249; Collapse</button>
            </div>

        </aside>`;
    },

    init(activePage = '') {
        if (document.getElementById('sidebar')) {
            this.setActive(activePage);
            return;
        }

        const target = document.getElementById('sidebar-placeholder');
        if (target) target.outerHTML = this.render(activePage);

        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-btn';
        menuButton.type = 'button';
        menuButton.setAttribute('aria-label', 'Open navigation');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.innerHTML = '<span></span><span></span><span></span>';
        document.body.appendChild(menuButton);

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        const sidebar = document.getElementById('sidebar');
        const closeMenu = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        };

        menuButton.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('open');
            overlay.classList.toggle('open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
        overlay.addEventListener('click', closeMenu);
        sidebar.querySelectorAll('.nav-item').forEach(link => link.addEventListener('click', closeMenu));

        document.getElementById('collapseBtn')?.addEventListener('click', () => {
            const collapsed = document.querySelector('.sidebar').classList.toggle('collapsed');
            document.getElementById('collapseBtn').setAttribute('aria-expanded', String(!collapsed));
        });

        const avatar = document.getElementById('sidebarAvatar');
        const logoutMenu = document.getElementById('logoutMenu');
        const logoutButton = document.getElementById('logoutBtn');
        avatar?.addEventListener('click', () => {
            const isOpen = logoutMenu.hidden;
            logoutMenu.hidden = !isOpen;
            avatar.setAttribute('aria-expanded', String(isOpen));
        });
        logoutButton?.addEventListener('click', () => {
            this.logout();
        });
        this.initTopAccountMenu();
        document.addEventListener('click', event => {
            const topMenu = document.querySelector('.top-logout-menu');
            const topAvatar = document.getElementById('topAvatar');
            if (!logoutMenu.hidden && !logoutMenu.contains(event.target) && event.target !== avatar && event.target !== topAvatar) {
                logoutMenu.hidden = true;
                avatar.setAttribute('aria-expanded', 'false');
            }
            if (topMenu && !topMenu.hidden && !topMenu.contains(event.target) && event.target !== avatar && event.target !== topAvatar) {
                topMenu.hidden = true;
                topAvatar.setAttribute('aria-expanded', 'false');
            }
        });

        this.markOutsideContent();
        this.initRouter();
        this.cachePage(window.location.href, document);
    },

    setActive(activePage) {
        document.querySelectorAll('.sidebar .nav-item').forEach(link => {
            const page = link.getAttribute('href')?.replace(/\.html$/, '');
            link.classList.toggle('active', page === activePage);
        });
    },

    initTopAccountMenu() {
        const avatar = document.getElementById('topAvatar');
        const container = avatar?.parentElement;
        if (!avatar || !container) return;

        avatar.setAttribute('role', 'button');
        avatar.setAttribute('tabindex', '0');
        avatar.setAttribute('aria-label', 'Open account menu');
        avatar.setAttribute('aria-expanded', 'false');

        let menu = container.querySelector('.top-logout-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'top-logout-menu';
            menu.hidden = true;
            menu.innerHTML = '<button type="button" class="top-logout-btn">Log out</button>';
            container.appendChild(menu);
        }

        menu.querySelector('.top-logout-btn').onclick = () => this.logout();
        avatar.onclick = () => {
            const isOpen = menu.hidden;
            menu.hidden = !isOpen;
            avatar.setAttribute('aria-expanded', String(isOpen));
        };
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    },

    initRouter() {
        document.querySelector('.sidebar-nav')?.addEventListener('click', event => {
            const link = event.target.closest('a.nav-item');
            if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            event.preventDefault();
            this.navigate(link.href);
        });

        document.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (!link || link.closest('.sidebar-nav') || link.target === '_blank') return;

            const url = new URL(link.href, window.location.href);
            if (url.origin === window.location.origin && url.pathname.endsWith('.html') && url.pathname.includes('/farmer/')) {
                event.preventDefault();
                this.navigate(url.href);
            }
        });

        window.addEventListener('popstate', () => this.navigate(window.location.href, false));
    },

    async navigate(href, pushState = true) {
        const url = new URL(href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;

        const cachedPage = this.pageCache.get(url.href);
        if (cachedPage) {
            this.restoreCachedPage(cachedPage);
            document.title = cachedPage.title;
            this.setActive(url.pathname.split('/').pop().replace(/\.html$/, ''));
            this.initTopAccountMenu();
            if (pushState) window.history.pushState({}, '', url.href);
            await this.loadScripts(cachedPage.scripts);
            this.cachePage(url.href, document, cachedPage.scripts);
            window.scrollTo(0, 0);
            return;
        }

        const response = await fetch(url.href, { headers: { 'X-Requested-With': 'sidebar-router' } });
        if (!response.ok) {
            window.location.href = url.href;
            return;
        }

        const html = await response.text();
        const nextDocument = new DOMParser().parseFromString(html, 'text/html');
        const nextWrapper = nextDocument.querySelector('.main-wrapper');
        const currentWrapper = document.querySelector('.main-wrapper');
        if (!nextWrapper || !currentWrapper) {
            window.location.href = url.href;
            return;
        }

        document.title = nextDocument.title;
        this.loadStyles(nextDocument, url);
        currentWrapper.replaceWith(document.importNode(nextWrapper, true));
        this.replaceOutsideContent(nextDocument);
        this.setActive(url.pathname.split('/').pop().replace(/\.html$/, ''));
        this.initTopAccountMenu();

        if (pushState) window.history.pushState({}, '', url.href);
        await this.loadPageScripts(nextDocument, url);
        this.cachePage(url.href, document, this.getPageScripts(nextDocument, url.href));
        window.scrollTo(0, 0);
    },

    loadStyles(nextDocument, url) {
        document.querySelectorAll('link[data-router-style]').forEach(link => link.remove());
        nextDocument.querySelectorAll('link[rel="stylesheet"]').forEach(source => {
            const href = new URL(source.getAttribute('href'), url.href);
            if (href.pathname.endsWith('/farmer.css')) return;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href.href;
            link.dataset.routerStyle = 'true';
            document.head.appendChild(link);
        });
    },

    markOutsideContent() {
        document.body.querySelectorAll(':scope > *').forEach(element => {
            if (element.classList.contains('app-layout') || element.tagName === 'SCRIPT') return;
            element.dataset.routerContent = 'true';
        });
    },

    replaceOutsideContent(nextDocument) {
        document.querySelectorAll('[data-router-content]').forEach(element => element.remove());

        nextDocument.body.querySelectorAll(':scope > *').forEach(element => {
            if (element.classList.contains('app-layout') || element.tagName === 'SCRIPT') return;

            const content = document.importNode(element, true);
            content.dataset.routerContent = 'true';
            document.body.appendChild(content);
        });
    },

    restoreCachedPage(cachedPage) {
        document.querySelector('.main-wrapper')?.replaceWith(cachedPage.wrapper.cloneNode(true));
        document.querySelectorAll('[data-router-content]').forEach(element => element.remove());
        cachedPage.outside.forEach(element => document.body.appendChild(element.cloneNode(true)));
        this.loadStylesFromHrefs(cachedPage.styles);
    },

    cachePage(href, sourceDocument, scripts = this.getPageScripts(sourceDocument)) {
        const wrapper = sourceDocument.querySelector('.main-wrapper');
        if (!wrapper) return;

        this.pageCache.set(href, {
            title: sourceDocument.title,
            wrapper: wrapper.cloneNode(true),
            outside: [...sourceDocument.querySelectorAll('[data-router-content]')].map(element => element.cloneNode(true)),
            styles: [...sourceDocument.querySelectorAll('link[data-router-style]')].map(link => link.href),
            scripts
        });
    },

    getPageScripts(sourceDocument, baseUrl = window.location.href) {
        return [...sourceDocument.querySelectorAll('script[src]')]
            .map(script => new URL(script.getAttribute('src'), baseUrl))
            .filter(scriptUrl => !scriptUrl.pathname.endsWith('/sidebar.js'))
            .map(scriptUrl => scriptUrl.href);
    },

    loadStylesFromHrefs(hrefs) {
        document.querySelectorAll('link[data-router-style]').forEach(link => link.remove());
        hrefs.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.routerStyle = 'true';
            document.head.appendChild(link);
        });
    },

    async loadPageScripts(nextDocument, url) {
        await this.loadScripts(this.getPageScripts(nextDocument, url.href));
    },

    async loadScripts(scriptHrefs) {
        const scripts = scriptHrefs.map(scriptHref => new URL(scriptHref, window.location.href));

        for (const scriptUrl of scripts) {
            if (scriptUrl.origin !== window.location.origin) {
                if (this.pageScripts.has(scriptUrl.href)) continue;

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = scriptUrl.href;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            } else {
                let source = this.pageScripts.get(scriptUrl.href);
                if (!source) {
                    source = await fetch(scriptUrl.href).then(response => response.text());
                    this.pageScripts.set(scriptUrl.href, source);
                }
                new Function(source).call(window);
            }
            if (scriptUrl.origin !== window.location.origin) this.pageScripts.set(scriptUrl.href, true);
        }
    }
};