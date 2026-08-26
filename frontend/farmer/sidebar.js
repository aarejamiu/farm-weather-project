const SidebarComponent = {
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
                    <div class="user-avatar" id="sidebarAvatar">--</div>
                    <div class="user-info">
                        <span class="user-name" id="sidebarName">Loading...</span>
                        <span class="user-role">Farm Admin</span>
                    </div>
                </div>
                <button class="collapse-btn" id="collapseBtn">&#8249; Collapse</button>
            </div>

        </aside>`;
    },

    init(activePage = '') {
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
    }
};