/**
 * product-page.js — Handles individual product details, pricing, sizing, cart, reviews and related items
 */

import { products } from './products.js';

const WA_NUMBER = '919769445567';

// ── Parse Query Param ────────────────────────────────────────────────────────
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'FRSH/01'; // Fallback to Wild Blue
}

// ── State ────────────────────────────────────────────────────────────────────
let product = null;
let selectedSize = '50ml';
let selectedQty = 1;
let currentPriceNum = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10);
}

function getPriceForSize(basePriceNum, size) {
    if (size === '30ml') {
        if (product && product.samplePrice) {
            return parsePrice(product.samplePrice);
        }
        return Math.round(basePriceNum * 0.6);
    }
    return basePriceNum; // 50ml standard
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const code = getProductId();
    product = products.find(p => p.code === code) || products[0];

    renderProductDetails();
    setupSizeSelector();
    setupQuantityStepper();
    setupTabs();
    setupReviews();
    renderRelatedProducts();
    updatePurchaseDetails();
});

// ── Render Details ───────────────────────────────────────────────────────────
function renderProductDetails() {
    if (!product) return;

    // Head metadata title
    document.title = `${product.name} — Sugandh Ink`;

    // Breadcrumb & specs
    document.getElementById('breadcrumb-product-name').textContent = product.name;
    document.getElementById('product-code').textContent = product.code;
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-desc').textContent = product.description;
    
    // Main image
    const mainImg = document.getElementById('product-main-img');
    if (mainImg) {
        mainImg.src = product.image;
        mainImg.alt = product.name;
    }

    // Story narrative
    document.getElementById('profile-narrative').textContent = 
        `A signature formulation from the Sugandh Ink atelier. Opens with distinct notes of ${product.notes.split(',').slice(0,2).join(' and ')}, maturing beautifully into a heart of ${product.notes.split(',').slice(2,4).join(' and ')}, resting on a lingering foundation of ${product.notes.split(',').slice(4).join(' and ')}. Crafted for ${product.occasion}.`;

    // Notes Pyramid
    const notes = product.notes.split(',').map(n => n.trim());
    document.getElementById('top-notes-list').textContent = notes.slice(0, 2).map(n => capitalize(n)).join(' · ');
    document.getElementById('heart-notes-list').textContent = notes.slice(2, 5).map(n => capitalize(n)).join(' · ');
    document.getElementById('base-notes-list').textContent = notes.slice(5).map(n => capitalize(n)).join(' · ');

    // Thumbnails
    const thumbsContainer = document.getElementById('product-thumbs');
    if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        const frames = [product.image, product.image, product.image];
        frames.forEach((src, idx) => {
            const thumb = document.createElement('button');
            thumb.className = `thumb ${idx === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${src}" alt="View frame ${idx + 1}">`;
            thumb.addEventListener('click', () => {
                thumbsContainer.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                if (mainImg) mainImg.src = src;
            });
            thumbsContainer.appendChild(thumb);
        });
    }

    // Render sizing pills dynamically
    const sizesWrap = document.querySelector('.sizes-wrap');
    if (sizesWrap) {
        sizesWrap.innerHTML = '';
        if (product.samplePrice) {
            sizesWrap.innerHTML = `
                <button class="size-pill" data-size="30ml">30ml (Sample) — ₹${parsePrice(product.samplePrice).toLocaleString('en-IN')}</button>
                <button class="size-pill active" data-size="50ml">50ml (Standard) — ${product.price}</button>
            `;
            selectedSize = '50ml';
        } else {
            sizesWrap.innerHTML = `
                <button class="size-pill active" data-size="50ml">50ml (Standard) — ${product.price}</button>
            `;
            selectedSize = '50ml';
        }
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Size & Qty Controllers ───────────────────────────────────────────────────
function setupSizeSelector() {
    const sizesWrap = document.querySelector('.sizes-wrap');
    if (!sizesWrap) return;

    sizesWrap.addEventListener('click', (e) => {
        const pill = e.target.closest('.size-pill');
        if (!pill) return;

        sizesWrap.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedSize = pill.dataset.size;
        updatePurchaseDetails();
    });
}

function setupQuantityStepper() {
    const qtyVal = document.getElementById('qty-value');
    const minus = document.getElementById('step-minus');
    const plus = document.getElementById('step-plus');

    if (!qtyVal || !minus || !plus) return;

    minus.addEventListener('click', () => {
        if (selectedQty > 1) {
            selectedQty--;
            qtyVal.textContent = selectedQty;
            updatePurchaseDetails();
        }
    });

    plus.addEventListener('click', () => {
        if (selectedQty < 10) {
            selectedQty++;
            qtyVal.textContent = selectedQty;
            updatePurchaseDetails();
        }
    });
}

function updatePurchaseDetails() {
    if (!product) return;

    const basePrice = parsePrice(product.price);
    const finalPrice = getPriceForSize(basePrice, selectedSize);
    currentPriceNum = finalPrice;

    // Display formatted price
    const formattedPrice = '₹' + finalPrice.toLocaleString('en-IN');
    document.getElementById('product-price').textContent = formattedPrice;

    // WhatsApp Direct order link
    const total = finalPrice * selectedQty;
    const formattedTotal = '₹' + total.toLocaleString('en-IN');
    const msg = encodeURIComponent(
        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.name}* (${product.code})\nSize: *${selectedSize}*\nQuantity: *${selectedQty}*\nPrice: ${formattedPrice} each\nTotal: ${formattedTotal}\n\nPlease share availability and payment details. Thank you.`
    );
    const waBtn = document.getElementById('whatsapp-checkout-btn');
    if (waBtn) {
        waBtn.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
        waBtn.onclick = () => {
            const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
            const user = JSON.parse(localStorage.getItem('si_user')) || { name: 'Guest Collector', email: 'guest@sugandhink.in' };
            const waNum = '+91 97694 45567';

            const newOrder = {
                id: orderId,
                collector: user.name,
                email: user.email,
                wa: waNum,
                items: `${product.name} (${selectedSize}) × ${selectedQty}`,
                value: formattedTotal,
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                status: 'pending'
            };

            let orders = [];
            try {
                orders = JSON.parse(localStorage.getItem('si_orders')) || [];
            } catch {
                orders = [];
            }
            
            if (orders.length === 0) {
                orders = [
                    { id: 'ORD-9824', collector: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', wa: '+91 98200 12345', items: 'Wild Blue (50ml) × 2', value: '₹1,598', date: '25/05/2026', status: 'pending' },
                    { id: 'ORD-9823', collector: 'Ishita Sharma', email: 'ishita.s@yahoo.com', wa: '+91 97690 98765', items: 'Bleu Noir (50ml) × 1', value: '₹799', date: '22/05/2026', status: 'fulfilled' },
                    { id: 'ORD-9822', collector: 'Rohan Singhal', email: 'rohan.singhal@outlook.com', wa: '+91 98110 54321', items: 'Eternity Men (50ml) × 1', value: '₹799', date: '20/05/2026', status: 'pending' }
                ];
            }
            
            orders.push(newOrder);
            localStorage.setItem('si_orders', JSON.stringify(orders));
        };
    }

    // Add to Cart integration
    const cartBtn = document.getElementById('add-to-cart-btn');
    if (cartBtn) {
        // Unbind any previous listener
        const newCartBtn = cartBtn.cloneNode(true);
        cartBtn.parentNode.replaceChild(newCartBtn, cartBtn);
        newCartBtn.addEventListener('click', () => {
            addToCart({
                code: product.code,
                name: product.name,
                size: selectedSize,
                qty: selectedQty,
                price: finalPrice,
                image: product.image
            });
        });
    }
}

// ── Cart Storage ─────────────────────────────────────────────────────────────
function addToCart(item) {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('si_cart')) || [];
    } catch {
        cart = [];
    }

    // Check if item with same code & size exists
    const existingIdx = cart.findIndex(i => i.code === item.code && i.size === item.size);
    if (existingIdx > -1) {
        cart[existingIdx].qty += item.qty;
    } else {
        cart.push(item);
    }

    localStorage.setItem('si_cart', JSON.stringify(cart));

    // Broadcast cart change so drawer/nav badges update
    window.dispatchEvent(new CustomEvent('cart:updated'));
    
    // Show toast
    showToast(`Added ${item.qty} × ${item.name} (${item.size}) to your collection.`);
}

function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast success';
    t.textContent = msg;
    container.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3500);
}

// ── Tabs Navigation ──────────────────────────────────────────────────────────
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-link');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById(target)?.classList.add('active');
        });
    });
}

// ── Dynamic Review System per Product ─────────────────────────────────────────
const USER_KEY = 'si_user';

function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
}

function getProductReviews() {
    const key = `si_reviews_${product.code}`;
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function saveProductReviews(reviews) {
    const key = `si_reviews_${product.code}`;
    localStorage.setItem(key, JSON.stringify(reviews));
}

function setupReviews() {
    const list = document.getElementById('product-reviews-list');
    const empty = document.getElementById('product-reviews-empty');
    if (!list) return;

    const reviews = getProductReviews();

    // Update count badge
    const reviewCountText = document.getElementById('product-rating-count');
    if (reviewCountText) {
        reviewCountText.textContent = `(${reviews.length} client review${reviews.length !== 1 ? 's' : ''})`;
    }

    if (reviews.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    reviews.slice().reverse().forEach(rv => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="stars">${'\u2605'.repeat(rv.rating)}${'\u2606'.repeat(5 - rv.rating)}</div>
            <p style="font-size:0.86rem; color:var(--ink-mid); margin:12px 0; line-height:1.6;">"${escHtml(rv.text)}"</p>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; border-top:1px solid var(--border); padding-top:10px; margin-top:auto;">
                <strong>${escHtml(rv.name)}</strong>
                <span style="color:var(--ink-dim);">${rv.date}</span>
            </div>
        `;
        list.appendChild(card);
    });
}

function escHtml(str) {
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

// ── Render Related Products ─────────────────────────────────────────────────
function renderRelatedProducts() {
    const rail = document.getElementById('related-rail');
    if (!rail) return;

    rail.innerHTML = '';
    // Show 4 other products
    const related = products.filter(p => p.code !== product.code).slice(0, 4);

    related.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pcard';
        card.innerHTML = `
            <div class="pcard-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="pcard-code">${p.code}</div>
            <div class="pcard-name">${p.name}</div>
            <div class="pcard-notes">${p.shortNotes}</div>
            <div class="pcard-footer">
                <span class="pcard-price">${p.price}</span>
                <span class="pcard-wa" style="font-size:0.65rem;">Explore</span>
            </div>
        `;

        card.addEventListener('click', () => {
            const targetUrl = `product.html?id=${p.code}`;
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

        rail.appendChild(card);
    });
}
