/**
 * ui.js — Shared UI enhancements and cart badge synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor (desktop only)
    setupCursor();
    
    // Shared UI features
    setupBanner();
    setupHeader();
    setupMobileMenu();
    
    // Initial badge update
    updateCartBadge();
    window.addEventListener('cart:updated', updateCartBadge);
});

function setupCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!cursor || window.matchMedia('(hover: none)').matches) return;

    cursor.style.display = 'block';

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        }
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        if (cursorRing) {
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover scale effects on interactive elements
    const interactives = document.querySelectorAll('a, button, .pcard, .citem, .family-card, .review-card, input, textarea, select');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorRing) {
                cursorRing.style.width = '64px';
                cursorRing.style.height = '64px';
                cursorRing.style.borderColor = 'var(--gold)';
            }
        });
        el.addEventListener('mouseleave', () => {
            if (cursorRing) {
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.borderColor = 'rgba(24,25,26,0.3)';
            }
        });
    });
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    try {
        const cart = JSON.parse(localStorage.getItem('si_cart')) || [];
        let totalQty = 0;
        cart.forEach(i => totalQty += i.qty);

        if (totalQty > 0) {
            badge.textContent = totalQty;
            badge.style.display = 'grid';
        } else {
            badge.style.display = 'none';
        }
    } catch {
        badge.style.display = 'none';
    }
}

function setupBanner() {
    const btn    = document.getElementById('banner-close');
    const banner = document.getElementById('announcement-banner');
    if (!btn || !banner) return;
    btn.addEventListener('click', () => {
        banner.style.transition = 'max-height .4s ease, opacity .3s ease, padding .4s ease';
        banner.style.maxHeight  = banner.offsetHeight + 'px';
        requestAnimationFrame(() => {
            banner.style.maxHeight = '0';
            banner.style.opacity   = '0';
            banner.style.padding   = '0';
            banner.style.overflow  = 'hidden';
        });
    });
}

function setupMobileMenu() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        btn.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        btn.setAttribute('aria-expanded', open);
    });

    menu.querySelectorAll('[data-close]').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            btn.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

function setupHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('lifted', window.scrollY > 10);
    }, { passive: true });
}
