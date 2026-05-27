/**
 * transitions.js — Curtain page transition system for Sugandh Ink
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject the curtain element if not present
    let curtain = document.getElementById('curtain');
    if (!curtain) {
        curtain = document.createElement('div');
        curtain.id = 'curtain';
        // Add a slide-in state by default so it covers screen if we are navigating
        curtain.className = 'slide-in';
        document.body.appendChild(curtain);
    }

    // Trigger page reveal (curtain slides up)
    requestAnimationFrame(() => {
        setTimeout(() => {
            curtain.classList.remove('slide-in');
            curtain.classList.add('slide-out');
        }, 100);
    });

    // Intercept internal links
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

            // Slide curtain down
            curtain.classList.remove('slide-out');
            curtain.classList.add('slide-in');

            // Wait for animation duration and redirect
            setTimeout(() => {
                window.location.href = href;
            }, 600); // matches --curtain-dur (600ms) in base.css / loader.css
        }
    });
});
