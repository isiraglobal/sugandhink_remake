/**
 * product-page.js - Handles individual product details, pricing, sizing, cart, reviews and related items
 */

import { products } from './products.js';
import { getApiUrl } from './utils.js';

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
    if (size === '10ml') {
        if (product && product.samplePrice) {
            return Math.round(parsePrice(product.samplePrice) * 0.4);
        }
        return Math.round(basePriceNum * 0.35);
    }
    if (size === '30ml') {
        if (product && product.samplePrice) {
            return parsePrice(product.samplePrice);
        }
        return Math.round(basePriceNum * 0.6);
    }
    if (size === '100ml') {
        return Math.round(basePriceNum * 1.6);
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

    window.addEventListener('auth:updated', updatePurchaseDetails);
});

// ── Render Details ───────────────────────────────────────────────────────────
function renderProductDetails() {
    if (!product) return;

    // Head metadata title
    document.title = `${product.name} - Sugandh Ink`;

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

    const sizesWrap = document.querySelector('.sizes-wrap');
    if (sizesWrap) {
        const basePrice = parsePrice(product.price);
        const sample = product.samplePrice ? parsePrice(product.samplePrice) : null;
        const p10 = sample ? Math.round(sample * 0.4) : Math.round(basePrice * 0.35);
        const p30 = sample || Math.round(basePrice * 0.6);
        const p50 = basePrice;
        const p100 = Math.round(basePrice * 1.6);
        sizesWrap.innerHTML = `
            <button class="size-pill" data-size="10ml">10ml (Travel) - ₹${p10.toLocaleString('en-IN')}</button>
            <button class="size-pill active" data-size="50ml">50ml (Standard) - ₹${p50.toLocaleString('en-IN')}</button>
            <button class="size-pill" data-size="30ml">30ml (Sample) - ₹${p30.toLocaleString('en-IN')}</button>
            <button class="size-pill" data-size="100ml">100ml (Prestige) - ₹${p100.toLocaleString('en-IN')}</button>
        `;
        selectedSize = '50ml';
    }
    // Render stock status
    const stockStatus = document.getElementById('product-stock-status');
    const cartBtn = document.getElementById('add-to-cart-btn');
    if (stockStatus) {
        const stockQty = product.stock !== undefined ? product.stock : 50;
        if (stockQty <= 0) {
            stockStatus.innerHTML = `<span style="color: var(--error);">Out of Stock - Maturing at Atelier</span>`;
            if (cartBtn) {
                cartBtn.disabled = true;
                cartBtn.textContent = 'Out of Stock';
                cartBtn.style.opacity = '0.5';
                cartBtn.style.pointerEvents = 'none';
            }
        } else if (stockQty <= 5) {
            stockStatus.innerHTML = `<span style="color: var(--gold);">Extremely Low Stock - Only ${stockQty} bottles left</span>`;
            if (cartBtn) {
                cartBtn.disabled = false;
                cartBtn.textContent = 'Add to Private Collection';
                cartBtn.style.opacity = '1';
                cartBtn.style.pointerEvents = 'all';
            }
        } else {
            stockStatus.innerHTML = `<span style="color: #27ae60;">In Stock (${stockQty} units available)</span>`;
            if (cartBtn) {
                cartBtn.disabled = false;
                cartBtn.textContent = 'Add to Private Collection';
                cartBtn.style.opacity = '1';
                cartBtn.style.pointerEvents = 'all';
            }
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
    
    const waBtn = document.getElementById('whatsapp-checkout-btn');
    if (waBtn) {
        const user = JSON.parse(localStorage.getItem('si_user'));
        const warningId = 'product-page-auth-warning';
        let warningEl = document.getElementById(warningId);

        if (!user || !user.name || !user.email || (user.id && user.id.startsWith('guest-'))) {
            if (!warningEl) {
                warningEl = document.createElement('div');
                warningEl.id = warningId;
                warningEl.style.cssText = 'background: rgba(192, 57, 43, 0.05); border: 1px solid rgba(192, 57, 43, 0.15); border-radius: 4px; padding: 12px; font-size: 0.76rem; color: #c0392b; margin: 16px 0; text-align: center; line-height: 1.4; font-family: \'Jost\', sans-serif;';
                warningEl.innerHTML = `<strong>Details Required:</strong> Please click the profile icon <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin: 0 2px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> on the top right to sign in or register before completing your order.`;
                waBtn.parentNode.insertBefore(warningEl, waBtn);
            }
            waBtn.style.pointerEvents = 'none';
            waBtn.style.opacity = '0.5';
            waBtn.onclick = (e) => {
                e.preventDefault();
            };
        } else {
            if (warningEl) {
                warningEl.remove();
            }
            waBtn.style.pointerEvents = 'auto';
            waBtn.style.opacity = '1';
            
            waBtn.onclick = async (e) => {
                e.preventDefault();

                // Save order to central database
                const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
                const orderData = {
                    id: orderId,
                    customerId: user.id && !user.id.startsWith('guest-') ? user.id : null,
                    collector: user.name,
                    email: user.email,
                    wa: user.phone || '',
                    items: `${product.name} (${selectedSize}) × ${selectedQty}`,
                    total: formattedTotal,
                    date: new Date().toLocaleDateString('en-IN'),
                    status: 'pending'
                };

                try {
                    await fetch(getApiUrl('/api/orders'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });
                } catch (err) {
                    console.error('Failed to save order in database:', err);
                }

                // Open WhatsApp link (including customer details!)
                if (window.getWhatsAppLink) {
                    const singleItem = { name: product.name, code: product.code, size: selectedSize, qty: selectedQty, price: finalPrice };
                    const waLink = window.getWhatsAppLink([singleItem], total, 0, total, user);
                    window.open(waLink, '_blank');
                } else {
                    const msg = encodeURIComponent(
                        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.name}* (${product.code})\nSize: *${selectedSize}*\nQuantity: *${selectedQty}*\nPrice: ${formattedPrice} each\nTotal: ${formattedTotal}\n\nPlease share availability and payment details. Thank you.`
                    );
                    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
                }
            }; // end waBtn.onclick
        } // end else (user logged in)
    } // end if (waBtn)

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
