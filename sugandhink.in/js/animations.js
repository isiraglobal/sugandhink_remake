/**
 * animations.js — Premium animation engine for Sugandh Ink
 * Implements coordinated entrance timelines, particle canvas, magnetic hovers, and 3D tilts.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Scroll Progress Bar ───────────────────────────────────────────────
    const progressContainer = document.createElement('div');
    progressContainer.style.position = 'fixed';
    progressContainer.style.top = '0';
    progressContainer.style.left = '0';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '3px';
    progressContainer.style.zIndex = '99999';
    progressContainer.style.pointerEvents = 'none';
    
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.background = 'var(--gold, #9b7a42)';
    progressBar.style.transition = 'width 0.1s linear';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressBar.style.width = scrolled + '%';
    });

    // ─── 2. Scent Particle System (Lightweight Canvas) ──────────────────────
    const hero = document.getElementById('hero');
    if (hero) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.35';
        hero.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        function resize() {
            canvas.width = hero.clientWidth;
            canvas.height = hero.clientHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height; // spread across height on start
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.size = Math.random() * 2 + 0.6;
                this.speedY = -(Math.random() * 0.4 + 0.2);
                this.speedX = Math.sin(Math.random() * Math.PI) * 0.2;
                this.alpha = Math.random() * 0.5 + 0.3;
                this.decay = Math.random() * 0.002 + 0.001;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.y / 30) * 0.15; // gentle wafting
                this.alpha -= this.decay;
                if (this.y < 0 || this.alpha <= 0) {
                    this.reset();
                }
            }
            draw() {
                ctx.fillStyle = `rgba(155, 122, 66, ${this.alpha})`; // gold accent
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Populate
        const maxParticles = 40;
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ─── 3. Coordinated Page Entrance Timeline (GSAP) ──────────────────────
    const entranceTimeline = gsap.timeline();
    
    // Animate Header
    const siteHeader = document.getElementById('site-header');
    if (siteHeader) {
        entranceTimeline.fromTo(siteHeader,
            { y: -24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }
    
    // Animate Hero Elements (eyebrow, headline, description, CTAs)
    const heroContent = document.querySelector('.hero-text');
    if (heroContent) {
        const children = heroContent.children;
        entranceTimeline.fromTo(Array.from(children),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
            '-=0.5'
        );
    }
    
    // Animate Hero Bottle Image (fade and subtle floating rise)
    const heroBottleImg = document.getElementById('hero-bottle');
    if (heroBottleImg) {
        entranceTimeline.fromTo(heroBottleImg,
            { y: 40, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power4.out' },
            '-=0.7'
        );
        
        // Gentle infinite float animation
        gsap.to(heroBottleImg, {
            y: -8,
            duration: 3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    // Animate Hero Stats Row
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        entranceTimeline.fromTo(heroStats,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.4'
        );
    }

    // ─── 4. Magnetic Buttons Hover Effect ──────────────────────────────────
    const magneticBtns = document.querySelectorAll('.btn, .fsocial, .reviews-nav button');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.4,
                ease: 'elastic.out(1.1, 0.4)'
            });
        });
    });

    // ─── 5. 3D Card Tilt Hover Effect ────────────────────────────────────────
    const cards = document.querySelectorAll('.pcard, .family-card, .citem');
    cards.forEach(card => {
        card.style.perspective = '1000px';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate tilt angle (-6deg to 6deg)
            const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 6;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                scale: 1.01,
                boxShadow: '0 20px 40px rgba(24, 25, 26, 0.08)',
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                boxShadow: 'none',
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });

});
