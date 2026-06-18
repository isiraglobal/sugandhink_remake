/**
 * main.js - Sugandh Ink homepage
 * - Product carousels with WhatsApp order buttons
 * - No fake data, no fake ratings
 * - Review system: localStorage-based, only after "registration" (name + email)
 * - Drawer shows full library with WhatsApp CTA per product
 */

import { products } from './products.js';

const WA_NUMBER = '919769445567'; // WhatsApp number without +

// ─── WhatsApp order link ──────────────────────────────────────────────────────
function waLink(product) {
    const msg = encodeURIComponent(
        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.name}* (${product.code})\nNotes: ${product.shortNotes}\nPrice: ${product.price}\n\nPlease share availability and payment details. Thank you.`
    );
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

// ─── Product data split ───────────────────────────────────────────────────────
const newArrivals = products.slice(0, 8);
const topSelling  = products.slice(8, 16);

// ─── Product card builder ─────────────────────────────────────────────────────
function buildProductCard(product) {
    const card = document.createElement('div');
    card.className = 'pcard';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="pcard-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="pcard-code">${product.code}</div>
        <div class="pcard-name">${product.name}</div>
        <div class="pcard-notes">${product.shortNotes}</div>
        <div class="pcard-footer">
            <span class="pcard-price">${product.price}</span>
            <a href="#" class="pcard-wa" aria-label="Order via WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order
            </a>
        </div>
    `;
    
    const waBtn = card.querySelector('.pcard-wa');
    waBtn.addEventListener('click', (e) => {
        window.handleDirectWA(e, product);
    });

    card.addEventListener('click', () => {
        const targetUrl = `product.html?id=${product.code}`;
        const curtain = document.getElementById('curtain');
        if (curtain) {
            curtain.classList.remove('slide-out');
            curtain.classList.add('slide-in');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        } else {
            window.location.href = targetUrl;
        }
    });
    return card;
}

// ─── Render rails ─────────────────────────────────────────────────────────────
function renderProducts() {
    const naRail = document.getElementById('new-arrivals-rail');
    const tsRail = document.getElementById('top-selling-rail');
    const cgGrid = document.getElementById('collection-grid');

    if (naRail) {
        newArrivals.forEach(p => naRail.appendChild(buildProductCard(p)));
        makeDraggable(naRail);
    }
    if (tsRail) {
        topSelling.forEach(p => tsRail.appendChild(buildProductCard(p)));
        makeDraggable(tsRail);
    }
    if (cgGrid) {
        products.forEach(p => cgGrid.appendChild(buildCollectionItem(p)));
    }
}

function buildCollectionItem(product) {
    const el = document.createElement('div');
    el.className = 'citem';
    el.style.cursor = 'pointer';
    el.innerHTML = `
        <div class="citem-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="citem-code">${product.code}</div>
        <div class="citem-name">${product.name}</div>
        <div class="citem-notes">${product.shortNotes}</div>
        <div class="citem-footer">
            <span class="citem-price">${product.price}</span>
            <a href="#" class="citem-wa">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order via WhatsApp
            </a>
        </div>
    `;
    
    const waBtn = el.querySelector('.citem-wa');
    waBtn.addEventListener('click', (e) => {
        window.handleDirectWA(e, product);
    });

    el.addEventListener('click', () => {
        const targetUrl = `product.html?id=${product.code}`;
        const curtain = document.getElementById('curtain');
        if (curtain) {
            curtain.classList.remove('slide-out');
            curtain.classList.add('slide-in');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        } else {
            window.location.href = targetUrl;
        }
    });
    return el;
}

// ─── Draggable rail ───────────────────────────────────────────────────────────
function makeDraggable(el) {
    let down = false, startX, scrollL;
    el.addEventListener('mousedown',  e => { down = true; startX = e.pageX - el.offsetLeft; scrollL = el.scrollLeft; el.style.cursor='grabbing'; });
    el.addEventListener('mouseleave', ()  => { down = false; el.style.cursor='grab'; });
    el.addEventListener('mouseup',    ()  => { down = false; el.style.cursor='grab'; });
    el.addEventListener('mousemove',  e => {
        if (!down) return;
        e.preventDefault();
        el.scrollLeft = scrollL - (e.pageX - el.offsetLeft - startX) * 1.4;
    });
}

// ─── Review system (localStorage, managed strictly via Admin Panel) ──────────
const REVIEWS_KEY  = 'si_reviews';

function getReviews() { try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []; } catch { return []; } }

function renderReviews() {
    const track    = document.getElementById('reviews-track');
    const empty    = document.getElementById('reviews-empty');

    if (!track) return;

    const reviews = getReviews();

    // Clear dynamic cards (keep static empty state node)
    track.querySelectorAll('.review-card').forEach(c => c.remove());

    if (reviews.length === 0) {
        if (empty) empty.style.display = 'flex';
    } else {
        if (empty) empty.style.display = 'none';
        reviews.slice().reverse().forEach(rv => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="rc-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5 - rv.rating)}</div>
                <p class="rc-text">"${rv.text}"</p>
                <div class="rc-footer">
                    <strong>${escHtml(rv.name)}</strong>
                    <span>${rv.date}</span>
                </div>
            `;
            track.appendChild(card);
        });

        // Dynamic high-end GSAP entrance reveal animation on review cards
        if (window.gsap) {
            gsap.fromTo(track.querySelectorAll('.review-card'),
                { opacity: 0, x: 40 },
                { opacity: 1, x: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
            );
        }
    }
}

function setupReviewSystem() {
    const track = document.getElementById('reviews-track');
    if (!track) return;

    // Scroll prev/next
    const prevBtn = document.getElementById('rev-prev');
    const nextBtn = document.getElementById('rev-next');
    if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -360, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left:  360, behavior: 'smooth' }));
    makeDraggable(track);

    renderReviews();
}


// Definitions moved to ui.js

// ─── Hero bottle entrance ─────────────────────────────────────────────────────
function setupHero() {
    const bottle = document.getElementById('hero-bottle');
    const label  = document.querySelector('.hero-img-label');
    const prompt = document.getElementById('scroll-prompt');
    if (bottle) setTimeout(() => { bottle.classList.add('in'); if (label) label.classList.add('in'); }, 400);
    if (prompt) setTimeout(() => prompt.classList.add('in'), 1800);
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3500);
}

function escHtml(str) {
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
    setupHero();
    renderProducts();
    setupReviewSystem();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
