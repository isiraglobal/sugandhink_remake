import { initParticles, initGoldParticles } from './components/Particles.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    if (document.body.classList.contains('coming-soon-mode')) {
        // Initialize ambient gold particles for the coming soon screen
        initGoldParticles('#coming-soon-particles', 30);
        return;
    }
    
    // Writing Animations for Cursive elements
    const cursiveElements = document.querySelectorAll('.cursive');
    cursiveElements.forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 20,
            duration: 1.5,
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });
    
    // Initialize Particles
    initParticles('.hero-scene', 15);
    initParticles('.sourcing-scene', 25);
    
    // Horizontal Scroll Notes Explorer - Desktop Only
    const horizontalWrapper = document.querySelector('.horizontal-wrapper');
    const horizontalSection = document.querySelector('.horizontal-section');
    
    if (horizontalWrapper && horizontalSection) {
        ScrollTrigger.matchMedia({
            "(min-width: 769px)": function() {
                gsap.to(horizontalWrapper, {
                    x: () => -(horizontalWrapper.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: horizontalSection,
                        start: "top top",
                        end: () => "+=" + horizontalWrapper.scrollWidth,
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true
                    }
                });
            }
        });
    }
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false, // Better to let native touch handle it on mobile
        touchMultiplier: 2,
        infinite: false,
    });

    // Link Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Ensure ScrollTrigger refreshes when images load or window resizes
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });

    // Scene Animations
    const scenes = document.querySelectorAll('.scene, .scene-split');
    
    scenes.forEach((scene, i) => {
        const bg = scene.querySelector('.scene-bg');
        const content = scene.querySelector('.scene-content') || scene.querySelector('.split-text');
        const splitImg = scene.querySelector('.split-image img');
        
        // Perspective Shift & Zoom for bg if exists
        if (bg) {
            gsap.to(bg, {
                scale: 1.3,
                rotateZ: 0.01, // Force hardware acceleration
                scrollTrigger: {
                    trigger: scene,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            // Scene Mask Transition (Moooi Style)
            ScrollTrigger.create({
                trigger: scene,
                start: "top 20%",
                end: "bottom 80%",
                onEnter: () => gsap.to(bg, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power4.inOut" }),
                onLeave: () => gsap.to(bg, { clipPath: "inset(10% 10% 10% 10% round 100px)", duration: 1.2, ease: "power4.inOut" }),
                onEnterBack: () => gsap.to(bg, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power4.inOut" }),
                onLeaveBack: () => gsap.to(bg, { clipPath: "inset(10% 10% 10% 10% round 100px)", duration: 1.2, ease: "power4.inOut" })
            });
        }
        
        // Parallax for split images
        if (splitImg) {
            gsap.fromTo(splitImg, 
                { y: -50, scale: 1.1 },
                {
                    y: 50,
                    scale: 1,
                    scrollTrigger: {
                        trigger: scene,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }
                }
            );
        }

        // Content reveal
        if (content) {
            gsap.from(content.children, {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: scene,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        }
    });

    // Special Product Scene Animation
    gsap.from(".product-visual img", {
        x: -100,
        rotate: -10,
        opacity: 0,
        scrollTrigger: {
            trigger: ".product-scene",
            start: "top 60%",
            scrub: 1
        }
    });

    // Hotspot animations
    document.querySelectorAll('.hotspot').forEach((spot, i) => {
        gsap.from(spot, {
            scale: 0,
            duration: 0.5,
            delay: i * 0.2,
            scrollTrigger: {
                trigger: spot,
                start: "top 90%"
            }
        });
    });

});
