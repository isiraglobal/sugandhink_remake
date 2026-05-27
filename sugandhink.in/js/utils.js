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
