document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const heroBg = document.querySelector('.parallax-bg');
    const enterBtn = document.getElementById('enter-journey');

    // Hide loader
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    }, 2000);

    // Simple Parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        heroBg.style.transform = `translate(-5%, calc(-5% + ${scrolled * 0.5}px)) scale(${1 + scrolled * 0.0005})`;
    });

    // Enter Journey Interaction
    enterBtn.addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
        
        // Moooi style effect: Zoom into the bottle
        heroBg.style.transition = 'transform 2s ease-in-out';
        heroBg.style.transform = 'translate(-5%, -5%) scale(1.5)';
    });

    // Floating Hotspots
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach((h, i) => {
        const offset = i * 0.5;
        h.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(-15px)' },
            { transform: 'translateY(0)' }
        ], {
            duration: 3000 + (i * 500),
            iterations: Infinity,
            easing: 'linear'
        });
    });

    // Reveal elements on scroll
    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Also reveal children
                const hotspotsInLayer = entry.target.parentElement.querySelectorAll('.hotspot');
                hotspotsInLayer.forEach((h, idx) => {
                    setTimeout(() => h.style.opacity = '1', idx * 200);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.layer-content').forEach(el => observer.observe(el));

    // Shop Drawer Toggle
    const shopDrawer = document.getElementById('shop-drawer');
    const toggleShopBtn = document.getElementById('toggle-shop');
    const closeDrawerBtn = document.getElementById('close-drawer');

    toggleShopBtn.addEventListener('click', () => {
        shopDrawer.classList.add('open');
    });

    closeDrawerBtn.addEventListener('click', () => {
        shopDrawer.classList.remove('open');
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            shopDrawer.classList.remove('open');
        }
    });
});
