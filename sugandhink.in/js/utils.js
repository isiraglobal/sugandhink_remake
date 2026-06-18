/** Resolve API URLs against the current origin (works on any dev port). */
export function getApiUrl(endpoint) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${window.location.origin}${path}`;
}

/** Reveal [data-reveal] elements — required on every page that loads ui.js. */
export function initReveals() {
    document.body.classList.remove('is-loading');

    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
        loader.remove();
    }

    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => {
            el.classList.add('in', 'revealed');
        }, delay + (i * 30));
    });
}

export function splitText(element) {
    const text = element.innerText;
    element.innerHTML = "";
    
    text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.classList.add("char");
        span.innerText = char === " " ? "\u00A0" : char;
        element.appendChild(span);
    });
}

export function animateSplitText(selector, delay = 0) {
    const chars = document.querySelectorAll(`${selector} .char`);
    gsap.to(chars, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 1,
        ease: "power4.out",
        delay: delay
    });
}
