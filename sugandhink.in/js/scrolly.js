/**
 * scrolly.js — High-end scroll reveals, parallax and animations
 * Powered by GSAP ScrollTrigger for premium performance and micro-animations.
 */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Parallax Scroll on Hero Bottle ─────────────────────────────────────
    const heroBottle = document.getElementById('hero-bottle');
    if (heroBottle) {
        gsap.to(heroBottle, {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // ── 2. Parallax Scroll on Spotlight Section Visual ───────────────────────
    const spotlightVisual = document.querySelector('.spotlight-image-wrap img');
    if (spotlightVisual) {
        gsap.to(spotlightVisual, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: '#spotlight',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // ── 3. Parallax Scroll on Heritage Banner Content ────────────────────────
    const heritageBannerContent = document.querySelector('.heritage-banner-content');
    if (heritageBannerContent) {
        gsap.fromTo(heritageBannerContent, 
            { yPercent: -8 },
            { 
                yPercent: 8, 
                ease: 'none',
                scrollTrigger: {
                    trigger: '.heritage-banner-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }

    // ── 4. Premium Auto-Hide Header on Scroll ─────────────────────────────────
    const header = document.getElementById('site-header');
    if (header) {
        let lastScrollY = window.scrollY;
        
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > 120) {
                    if (currentScrollY > lastScrollY) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                } else {
                    header.style.transform = 'translateY(0)';
                }
                lastScrollY = currentScrollY;
            }
        });
    }

    // ── 5. Simple reveal on scroll ────────────────────────────────────────────
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length) {
        revealEls.forEach(el => {
            gsap.fromTo(el, 
                { opacity: 0, y: 36 },
                { 
                    opacity: 1, 
                    y: 0,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }

    // ── 6. Staggered Product Card Reveals ─────────────────────────────────────
    const rails = document.querySelectorAll('.product-rail');
    rails.forEach(rail => {
        const cards = rail.querySelectorAll('.pcard');
        if (!cards.length) return;
        
        gsap.fromTo(cards, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: rail,
                    start: 'top 90%'
                }
            }
        );
    });

    // ── 7. Scent Family Staggered Slide Reveals ──────────────────────────────
    const familyGrid = document.querySelector('.family-grid');
    if (familyGrid) {
        const cards = familyGrid.querySelectorAll('.family-card');
        if (cards.length) {
            gsap.fromTo(cards, 
                { opacity: 0, y: 40, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.0,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: familyGrid,
                        start: 'top 85%'
                    }
                }
            );
        }
    }

    // ── 8. Stat Counter Animation ────────────────────────────────────────────
    const statNums = document.querySelectorAll('.stat-num[data-count]');
    statNums.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        
        ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            onEnter: () => {
                animateCount(el, target);
            }
        });
    });

    function animateCount(el, target) {
        const dur = 1.6;
        let countObj = { val: 0 };
        gsap.to(countObj, {
            val: target,
            duration: dur,
            ease: 'power2.out',
            onUpdate: () => {
                el.textContent = Math.round(countObj.val).toLocaleString('en-IN');
            }
        });
    }

    // ── 9. Marquee Pause on Hover ─────────────────────────────────────────────
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
