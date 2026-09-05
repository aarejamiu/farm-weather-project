const initHamburger = () => {
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

    const avatar = document.getElementById('navAvatar');
    if (avatar) {
        avatar.setAttribute('role', 'button');
        avatar.setAttribute('tabindex', '0');
        avatar.setAttribute('aria-label', 'Open account menu');
        avatar.setAttribute('aria-expanded', 'false');

        const logoutMenu = document.createElement('div');
        logoutMenu.className = 'cust-logout-menu';
        logoutMenu.hidden = true;
        logoutMenu.innerHTML = '<button type="button" class="cust-logout-btn">Log out</button>';
        avatar.parentElement.appendChild(logoutMenu);

        const toggleAccountMenu = () => {
            const isOpen = logoutMenu.hidden;
            logoutMenu.hidden = !isOpen;
            avatar.setAttribute('aria-expanded', String(isOpen));
        };

        avatar.addEventListener('click', toggleAccountMenu);
        avatar.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleAccountMenu();
            }
        });
        logoutMenu.querySelector('.cust-logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
        });

        document.addEventListener('click', event => {
            if (!logoutMenu.hidden && !logoutMenu.contains(event.target) && event.target !== avatar) {
                logoutMenu.hidden = true;
                avatar.setAttribute('aria-expanded', 'false');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });
};

document.addEventListener('DOMContentLoaded', initHamburger);