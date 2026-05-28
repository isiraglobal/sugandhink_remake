/**
 * transitions.js — Lightweight GSAP page transitions for a luxury editorial feel
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smoothly fade in the page on load
    gsap.fromTo(document.body,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'opacity' }
    );
    
    // Clean up loading state
    document.body.classList.remove('is-loading');

    // 2. Intercept internal links and fade out smoothly before navigating
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Check if internal navigation
        if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.startsWith('javascript:') &&
            !href.startsWith('https://wa.me') &&
            target !== '_blank'
        ) {
            // Check if link is to an actual page in our site
            const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
            if (isExternal) return;

            e.preventDefault();

            // Animate fade-out before redirecting
            gsap.to(document.body, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: () => {
                    window.location.href = href;
                }
            });
        }
    });
});
