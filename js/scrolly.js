/**
 * scrolly.js — Lightweight scroll reveals, zero scroll manipulation
 * GSAP ScrollTrigger for enter animations only. NO Lenis. NO pinning. NO scrub.
 */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // ── Simple reveal on scroll ────────────────────────────────────────────────
    // Use IntersectionObserver — far less overhead than ScrollTrigger for simple reveals
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.revealDelay || '0', 10);
                    setTimeout(() => el.classList.add('in'), delay);
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => io.observe(el));
    }

    // ── Staggered product card reveals ────────────────────────────────────────
    const rails = document.querySelectorAll('.product-rail');
    rails.forEach(rail => {
        const cards = rail.querySelectorAll('.pcard');
        if (!cards.length) return;
        const io2 = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach((card, i) => {
                        setTimeout(() => card.classList.add('in'), i * 60);
                    });
                    io2.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });
        io2.observe(rail);
    });

    // ── Stat counter animation ────────────────────────────────────────────────
    const statNums = document.querySelectorAll('.stat-num[data-count]');
    if (statNums.length) {
        const countIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                countIO.unobserve(el);
                animateCount(el, target);
            });
        }, { threshold: 0.5 });
        statNums.forEach(el => countIO.observe(el));
    }

    function animateCount(el, target) {
        const dur = 1600;
        const start = performance.now();
        const raf = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toLocaleString('en-IN');
            if (p < 1) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // ── Marquee auto-scroll via CSS — no JS needed (handled in CSS) ───────────
    // Just pause on hover
    const marque = document.querySelector('.marque-strip');
    if (marque) {
        marque.addEventListener('mouseenter', () => {
            document.querySelector('.marque-track')?.style.setProperty('animation-play-state', 'paused');
        });
        marque.addEventListener('mouseleave', () => {
            document.querySelector('.marque-track')?.style.setProperty('animation-play-state', 'running');
        });
    }

});
