/**
 * loader.js — Snappy Preloader for Sugandh Ink
 * Immediately removes the is-loading class, runs reveals, and avoids any crashing.
 */

document.addEventListener('DOMContentLoaded', () => {
    // If #loader exists, clean it up immediately
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
        loader.remove();
    }
    
    // Clean up loading state lock
    document.body.classList.remove('is-loading');

    // Snappily run reveal animations
    const reveals = document.querySelectorAll('[data-reveal]');
    reveals.forEach((el, i) => {
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => el.classList.add('in'), delay + (i * 30));
    });
});
