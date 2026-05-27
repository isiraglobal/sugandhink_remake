/**
 * loader.js — Preloader animation for Sugandh Ink
 * Animates a elegant progress bar and luxury wordmark reveals, no percentage text
 */

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const bar = document.getElementById('loader-bar');
    const lwWords = document.querySelectorAll('.lw');
    const lwRule = document.querySelector('.lw-rule');
    const tagline = document.querySelector('.loader-tagline');

    if (!loader) return;

    // 1. Reveal wordmark elements
    setTimeout(() => {
        lwWords.forEach(word => word.classList.add('in'));
        if (lwRule) lwRule.classList.add('in');
    }, 150);

    // 2. Animate progress bar fill
    let progress = 0;
    const duration = 1800; // 1.8 seconds loading
    const intervalTime = 16; // ~60fps
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
        progress += step;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
            completeLoading();
        }
        if (bar) {
            bar.style.width = `${progress}%`;
        }
    }, intervalTime);

    // Fade in tagline shortly after start
    setTimeout(() => {
        if (tagline) tagline.classList.add('in');
    }, 600);

    function completeLoading() {
        // Add hidden class to slide loader curtain up
        loader.classList.add('hidden');
        document.body.classList.remove('is-loading');

        // Let the reveal animations on home run
        setTimeout(() => {
            const reveals = document.querySelectorAll('[data-reveal]');
            reveals.forEach((el, i) => {
                const delay = parseInt(el.dataset.revealDelay || '0', 10);
                setTimeout(() => el.classList.add('in'), delay + (i * 50));
            });
        }, 400);
    }
});
