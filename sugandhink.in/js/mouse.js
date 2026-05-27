document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const circle = document.querySelector('.cursor-circle');
    const text = document.querySelector('.cursor-text');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    cursor.style.display = 'block';

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Mouse follow parallax on backgrounds
        const xOffset = (e.clientX / window.innerWidth - 0.5) * 40;
        const yOffset = (e.clientY / window.innerHeight - 0.5) * 40;
        
        gsap.to('.scene-bg', {
            x: xOffset,
            y: yOffset,
            duration: 1,
            ease: "power2.out"
        });
    });

    function animateCursor() {
        // Smooth cursor follow
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover interactions
    document.querySelectorAll('a, button, .hotspot').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(circle, { width: 80, height: 80, duration: 0.3 });
            gsap.to(text, { opacity: 1, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(circle, { width: 40, height: 40, duration: 0.3 });
            gsap.to(text, { opacity: 0, duration: 0.3 });
        });
    });
});
