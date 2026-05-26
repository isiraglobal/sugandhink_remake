import { splitText, animateSplitText } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const counterText = document.getElementById('counter-text');
    const loaderBg = document.querySelector('.loader-bg');
    
    // Animate loader elements in
    gsap.to('.loader-title', { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.to('.loader-tagline', { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power3.out" });
    gsap.to('.loader-ornament', { opacity: 1, scale: 1, rotation: 0, duration: 1.5, delay: 0.5, ease: "elastic.out(1, 0.5)" });
    gsap.to(loaderBg, { scale: 1, duration: 2, ease: "power2.out" });

    // Counter animation
    let progress = { val: 0 };
    gsap.to(progress, {
        val: 100,
        duration: 1.8, // Snappy, creative loading
        ease: "power2.inOut",
        onUpdate: function() {
            counterText.innerText = Math.floor(progress.val);
        },
        onComplete: completeLoading
    });

    function completeLoading() {
        const tl = gsap.timeline({
            onComplete: () => {
                loader.style.display = 'none';
                document.body.classList.remove('is-loading');
                startHeroAnimation();
            }
        });

        // Creative exit animation: shrink, fade and iris wipe
        tl.to('.loader-content > *', {
            y: -30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power3.in"
        }, 0)
        .to(loaderBg, {
            scale: 2,
            opacity: 0,
            duration: 0.8,
            ease: "power3.in"
        }, 0.1)
        .to(loader, {
            clipPath: "circle(0% at 50% 50%)",
            duration: 1.2,
            ease: "power4.inOut"
        }, 0.2);
    }
    
    // Prepare split text
    const heroTitle = document.querySelector('.hero-scene h1');
    if (heroTitle && !document.body.classList.contains('coming-soon-mode')) {
        splitText(heroTitle);
    }

    function startComingSoonAnimation() {
        const tl = gsap.timeline({ delay: 0.2 });
        
        // Split text for coming soon heading if it exists
        const csHeading = document.querySelector('.coming-soon-hero h1');
        if (csHeading) {
            splitText(csHeading);
            animateSplitText(".coming-soon-hero h1", 0.3);
        }

        tl.from(".coming-soon-badge", {
            y: -20,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
        .from(".coming-soon-hero p", {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8")
        .from(".coming-soon-card", {
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out"
        }, "-=0.6")
        .from(".coming-soon-newsletter", {
            y: 30,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        }, "-=0.8");
    }

    function startHeroAnimation() {
        if (document.body.classList.contains('coming-soon-mode')) {
            startComingSoonAnimation();
            return;
        }

        animateSplitText(".hero-scene h1", 0.3);
        
        gsap.to(".hero-sub .line", {
            scaleX: 1,
            duration: 1.5,
            ease: "power4.out",
            delay: 0.4
        });
        
        gsap.to(".hero-sub p", {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power4.out",
            delay: 0.6
        });

        gsap.to(".hero-desc", {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power4.out",
            delay: 0.8
        });
    }
});
