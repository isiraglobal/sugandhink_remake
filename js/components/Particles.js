export function initParticles(containerSelector, count = 20) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const petal = document.createElement("div");
        petal.classList.add("particle-petal");
        
        // Randomize starting position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;

        petal.style.left = `${x}%`;
        petal.style.top = `${y}%`;
        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.5}px`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `-${delay}s`;

        container.appendChild(petal);
    }
}

export function initGoldParticles(containerSelector, count = 20) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle-gold");
        
        // Randomize starting position
        const x = Math.random() * 100;
        const size = Math.random() * 12 + 6; // slightly larger for ambient blur
        const duration = Math.random() * 15 + 15; // slow and majestic
        const delay = Math.random() * 15;

        particle.style.left = `${x}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `-${delay}s`;

        container.appendChild(particle);
    }
}

