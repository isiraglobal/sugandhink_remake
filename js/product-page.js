/**
 * product-page.js — Handles individual product details, pricing, sizing, cart, reviews and related items
 */

import { products } from './products.js';

const WA_NUMBER = '919769445567';

// ── Parse Query Param ────────────────────────────────────────────────────────
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'VAN/01'; // Fallback to Vanilla Luxe
}

// ── State ────────────────────────────────────────────────────────────────────
let product = null;
let selectedSize = '30ml';
let selectedQty = 1;
let currentPriceNum = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10);
}

function getPriceForSize(basePriceNum, size) {
    let factor = 1.0;
    if (size === '10ml') factor = 0.25;
    else if (size === '30ml') factor = 0.60;
    else if (size === '100ml') factor = 1.00;
    return Math.round(basePriceNum * factor);
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
    document.title = `${product.originalName} — Sugandh Ink`;

    // Breadcrumb & specs
    document.getElementById('breadcrumb-product-name').textContent = product.originalName;
    document.getElementById('product-code').textContent = product.code;
    document.getElementById('product-title').textContent = product.originalName;
    document.getElementById('product-desc').textContent = product.description;
    
    // Main image
    const mainImg = document.getElementById('product-main-img');
    if (mainImg) {
        mainImg.src = product.image;
        mainImg.alt = product.originalName;
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
        // In a luxury site, we show the same bottle in different frames or just same thumb repeated
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
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Size & Qty Controllers ───────────────────────────────────────────────────
function setupSizeSelector() {
    const pills = document.querySelectorAll('.size-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedSize = pill.dataset.size;
            updatePurchaseDetails();
        });
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
        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.originalName}* (${product.code})\nSize: *${selectedSize}*\nQuantity: *${selectedQty}*\nPrice: ${formattedPrice} each\nTotal: ${formattedTotal}\n\nPlease share availability and payment details. Thank you.`
    );
    const waBtn = document.getElementById('whatsapp-checkout-btn');
    if (waBtn) waBtn.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;

    // Add to Cart integration
    const cartBtn = document.getElementById('add-to-cart-btn');
    if (cartBtn) {
        // Unbind any previous listener
        const newCartBtn = cartBtn.cloneNode(true);
        cartBtn.parentNode.replaceChild(newCartBtn, cartBtn);
        newCartBtn.addEventListener('click', () => {
            addToCart({
                code: product.code,
                name: product.originalName,
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
    const loginBox = document.getElementById('product-review-login');
    const writeBox = document.getElementById('product-write-box');

    if (!list) return;

    function renderReviewsList() {
        const reviews = getProductReviews();
        const user = getUser();

        // Clear dynamic entries
        list.querySelectorAll('.review-card').forEach(c => c.remove());

        // Update counts
        const reviewCountText = document.getElementById('product-rating-count');
        if (reviewCountText) {
            reviewCountText.textContent = `(${reviews.length} client review${reviews.length !== 1 ? 's' : ''})`;
        }

        if (reviews.length === 0) {
            if (empty) empty.style.display = 'block';
        } else {
            if (empty) empty.style.display = 'none';
            reviews.slice().reverse().forEach(rv => {
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `
                    <div class="stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5 - rv.rating)}</div>
                    <p style="font-size:0.86rem; color:var(--ink-mid); margin:12px 0; line-height:1.6;">"${escHtml(rv.text)}"</p>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; border-top:1px solid var(--border); padding-top:10px; margin-top:auto;">
                        <strong>${escHtml(rv.name)}</strong>
                        <span style="color:var(--ink-dim);">${rv.date}</span>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        // Show write or login prompts
        if (writeBox) writeBox.style.display = user ? 'block' : 'none';
        if (loginBox) loginBox.style.display = user ? 'none' : 'block';
    }

    // Register form (username + email)
    const regForm = document.getElementById('product-register-form');
    if (regForm) {
        regForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = regForm.querySelector('[name=rname]')?.value.trim();
            const email = regForm.querySelector('[name=remail]')?.value.trim();
            if (!name || !email) return;
            localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
            renderReviewsList();
        });
    }

    // Write review form
    const writeForm = document.getElementById('product-write-form');
    if (writeForm) {
        // Star buttons selection
        writeForm.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                writeForm.querySelectorAll('.star-btn').forEach((b, i) => {
                    b.textContent = i < val ? '★' : '☆';
                    b.classList.toggle('filled', i < val);
                });
                writeForm.querySelector('[name=wrating]').value = val;
            });
        });

        writeForm.addEventListener('submit', e => {
            e.preventDefault();
            const user = getUser();
            if (!user) return;
            const text = writeForm.querySelector('[name=wtext]')?.value.trim();
            const rating = parseInt(writeForm.querySelector('[name=wrating]')?.value || '5', 10);
            if (!text) return;

            const reviews = getProductReviews();
            reviews.push({
                name: user.name,
                text,
                rating,
                date: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            });
            saveProductReviews(reviews);
            writeForm.reset();
            writeForm.querySelectorAll('.star-btn').forEach(b => b.textContent = '☆');
            writeForm.querySelector('[name=wrating]').value = '5';
            renderReviewsList();
        });
    }

    renderReviewsList();
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
                <img src="${p.image}" alt="${p.originalName}" loading="lazy">
            </div>
            <div class="pcard-code">${p.code}</div>
            <div class="pcard-name">${p.originalName}</div>
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
