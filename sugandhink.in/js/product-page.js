/**
 * product-page.js - Handles individual product details, pricing, sizing, cart, reviews and related items
 */

import { products } from './products.js';
import { getApiUrl } from './utils.js';
import { toggleWishlist, isInWishlist } from './wishlist.js';
import { addToCompare, getCompareState, syncBadge, loadFromLocalStorage } from './compare.js';
import { requestBackInStock, isAlreadyRequested, addWaitlistRequest, getProductAvailability } from './waitlist.js';

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

    loadFromLocalStorage();
    syncBadge();

    trackRecentlyViewed();
    renderProductDetails();
    setupSizeSelector();
    setupQuantityStepper();
    setupTabs();
    setupReviews();
    renderRelatedProducts();
    renderRecentlyViewed();
    updatePurchaseDetails();

    window.addEventListener('auth:updated', updatePurchaseDetails);
    window.addEventListener('compare:updated', syncBadge);
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

    // Wishlist heart button next to title
    const titleEl = document.getElementById('product-title');
    const existingWishlistBtn = document.querySelector('.product-title-wishlist');
    if (titleEl && !existingWishlistBtn) {
        const wishBtn = document.createElement('button');
        wishBtn.className = `product-title-wishlist wishlist-btn ${isInWishlist(product.code) ? 'in-wishlist' : ''}`;
        wishBtn.setAttribute('aria-label', 'Toggle wishlist');
        wishBtn.setAttribute('data-code', product.code);
        wishBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
        `;
        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(product.code);
            wishBtn.classList.toggle('in-wishlist');
        });
        titleEl.parentNode.insertBefore(wishBtn, titleEl.nextSibling);
    } else if (existingWishlistBtn) {
        existingWishlistBtn.classList.toggle('in-wishlist', isInWishlist(product.code));
        existingWishlistBtn.dataset.code = product.code;
    }
    
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
    document.getElementById('top-notes-list').textContent = (product.topNotes || '').split(',').map(n => capitalize(n.trim())).join(' · ') || 'Citrus · Bergamot';
    document.getElementById('heart-notes-list').textContent = (product.heartNotes || '').split(',').map(n => capitalize(n.trim())).join(' · ') || 'Saffron · Cardamom';
    document.getElementById('base-notes-list').textContent = (product.baseNotes || '').split(',').map(n => capitalize(n.trim())).join(' · ') || 'Sandalwood · Musk';


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
        const outOfStock = product.stock !== undefined && product.stock <= 0;
        const oosAttr = outOfStock ? 'disabled' : '';
        const oosClass = outOfStock ? 'oos' : '';
        const oosLabel = outOfStock ? ' <span class="oos-label">Out of Stock</span>' : '';
        sizesWrap.innerHTML = `
            <button class="size-pill ${oosClass}" data-size="10ml" ${oosAttr}>10ml (Travel) - ₹${p10.toLocaleString('en-IN')}${oosLabel}</button>
            <button class="size-pill ${oosClass} active" data-size="50ml" ${oosAttr}>50ml (Standard) - ₹${p50.toLocaleString('en-IN')}${oosLabel}</button>
            <button class="size-pill ${oosClass}" data-size="30ml" ${oosAttr}>30ml (Sample) - ₹${p30.toLocaleString('en-IN')}${oosLabel}</button>
            <button class="size-pill ${oosClass}" data-size="100ml" ${oosAttr}>100ml (Prestige) - ₹${p100.toLocaleString('en-IN')}${oosLabel}</button>
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

    renderWaitlistSection();
    renderJSONLD();
    setupImageZoom();
    setupSocialShare();
}

function renderWaitlistSection() {
    if (!product) return;
    const outOfStock = product.stock !== undefined && product.stock <= 0;

    let container = document.getElementById('waitlist-section');
    const purchaseWrap = document.querySelector('.purchase-wrap');

    if (!outOfStock) {
        if (container) container.remove();
        return;
    }

    if (!container) {
        container = document.createElement('div');
        container.id = 'waitlist-section';
        container.className = 'waitlist-section';
        if (purchaseWrap) {
            purchaseWrap.parentNode.insertBefore(container, purchaseWrap.nextSibling);
        }
    }

    const user = JSON.parse(localStorage.getItem('si_user'));
    const alreadyRequested = isAlreadyRequested(product.code, selectedSize);

    if (alreadyRequested) {
        container.innerHTML = '<div class="waitlist-confirmed"><span class="waitlist-confirmed-text">You are on the waitlist for this composition.</span></div>';
        return;
    }

    if (user && user.email) {
        container.innerHTML = '<button class="btn btn-outline notify-btn" id="notify-me-btn">Notify Me When Available</button>';
        const btn = container.querySelector('#notify-me-btn');
        btn.addEventListener('click', async () => {
            try {
                await requestBackInStock(product.code, selectedSize, user.email);
                addWaitlistRequest(product.code, selectedSize, user.email);
                showToast('We will email you when this size is back in stock.');
                renderWaitlistSection();
            } catch (err) {
                showToast('Failed to register. Please try again.');
            }
        });
    } else {
        container.innerHTML = '<div class="waitlist-form-wrap"><p class="waitlist-prompt">Notify me when back in stock</p><div class="waitlist-inline-form"><input type="email" class="waitlist-email-input" id="waitlist-email" placeholder="Enter your email" required><button class="btn btn-outline notify-btn" id="notify-me-submit">Notify Me</button></div></div>';
        const submitBtn = container.querySelector('#notify-me-submit');
        const emailInput = container.querySelector('#waitlist-email');
        submitBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email || !email.includes('@')) {
                showToast('Please enter a valid email address.');
                return;
            }
            try {
                const name = user && user.name ? user.name : '';
                await requestBackInStock(product.code, selectedSize, email);
                addWaitlistRequest(product.code, selectedSize, email);
                showToast('We will email you when this size is back in stock.');
                renderWaitlistSection();
            } catch (err) {
                showToast('Failed to register. Please try again.');
            }
        });
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
        if (pill.disabled || pill.classList.contains('oos')) return;

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

    // Add to Compare integration
    const compareContainer = document.getElementById('compare-btn-container');
    if (compareContainer) {
        const state = getCompareState();
        const isAdded = state.includes(product.code);
        compareContainer.innerHTML = `<button class="compare-detail-btn ${isAdded ? 'added' : ''}" id="product-compare-btn">${isAdded ? 'Added to Compare' : 'Add to Compare'}</button>`;
        const compareBtn = document.getElementById('product-compare-btn');
        compareBtn.addEventListener('click', () => {
            if (getCompareState().includes(product.code)) return;
            addToCompare(product.code);
            compareBtn.classList.add('added');
            compareBtn.textContent = 'Added to Compare';
            showToast(`${product.name} added to compare.`);
        });
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
                <button class="card-wishlist-btn wishlist-btn ${isInWishlist(p.code) ? 'in-wishlist' : ''}" data-code="${p.code}" aria-label="Toggle wishlist">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="pcard-code">${p.code}</div>
            <div class="pcard-name">${p.name}</div>
            <div class="pcard-notes">${p.shortNotes}</div>
            <div class="pcard-footer">
                <span class="pcard-price">${p.price}</span>
                <span class="pcard-wa" style="font-size:0.65rem;">Explore</span>
            </div>
        `;

        const wishBtn = card.querySelector('.card-wishlist-btn');
        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(p.code);
            wishBtn.classList.toggle('in-wishlist');
        });

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

// ── JSON-LD Structured Data ───────────────────────────────────────────────
function renderJSONLD() {
    if (!product) return;
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();

    const basePrice = parsePrice(product.price);
    const availability = (product.stock !== undefined && product.stock <= 0)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock';

    const script = document.createElement('script');
    script.id = 'product-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        productID: product.code,
        url: `https://sugandhink.in/product.html?id=${encodeURIComponent(product.code)}`,
        image: `https://sugandhink.in/${product.image}`,
        brand: {
            '@type': 'Brand',
            name: 'Sugandh Ink'
        },
        offers: {
            '@type': 'Offer',
            url: `https://sugandhink.in/product.html?id=${encodeURIComponent(product.code)}`,
            priceCurrency: 'INR',
            price: basePrice,
            availability: availability
        }
    });
    document.head.appendChild(script);
}

// ── Image Zoom (div-based magnifier at 2x) ────────────────────────────────
function setupImageZoom() {
    const wrap = document.querySelector('.main-image-wrap');
    const img = document.getElementById('product-main-img');
    if (!wrap || !img) return;

    wrap.style.position = 'relative';

    const lens = document.createElement('div');
    lens.className = 'img-zoom-lens';

    const result = document.createElement('div');
    result.className = 'img-zoom-result';

    wrap.appendChild(lens);
    wrap.appendChild(result);

    const updateZoom = (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ls = 120;
        const half = ls / 2;

        let lx = x - half;
        let ly = y - half;
        lx = Math.max(0, Math.min(lx, rect.width - ls));
        ly = Math.max(0, Math.min(ly, rect.height - ls));

        lens.style.left = lx + 'px';
        lens.style.top = ly + 'px';

        const cx = (lx + half) / rect.width;
        const cy = (ly + half) / rect.height;

        result.style.backgroundImage = `url(${img.src})`;
        result.style.backgroundSize = `${rect.width * 2}px ${rect.height * 2}px`;
        result.style.backgroundPosition = `-${cx * rect.width * 2 - ls}px -${cy * rect.height * 2 - ls}px`;
    };

    wrap.addEventListener('mouseenter', () => {
        lens.style.display = 'block';
        result.style.display = 'block';
        wrap.addEventListener('mousemove', updateZoom);
    });

    wrap.addEventListener('mouseleave', () => {
        lens.style.display = 'none';
        result.style.display = 'none';
        wrap.removeEventListener('mousemove', updateZoom);
    });
}

// ── Social Share Buttons ──────────────────────────────────────────────────
function setupSocialShare() {
    if (!product) return;
    const specs = document.querySelector('.specs-size-wrap');
    if (!specs) return;

    const existing = document.querySelector('.social-share-section');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.className = 'social-share-section';

    const link = window.location.href;
    const name = product.name;
    const desc = product.description;

    section.innerHTML = `
        <span class="share-label">Share this composition</span>
        <div class="share-buttons">
            <button class="share-btn share-wa" data-share="whatsapp" aria-label="Share on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button class="share-btn share-twitter" data-share="twitter" aria-label="Share on Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button class="share-btn share-email" data-share="email" aria-label="Share via Email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </button>
            <button class="share-btn share-copy" data-share="copy" aria-label="Copy link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </button>
        </div>
    `;

    specs.after(section);

    section.addEventListener('click', (e) => {
        const btn = e.target.closest('.share-btn');
        if (!btn) return;
        const type = btn.dataset.share;
        const pageUrl = window.location.href;

        switch (type) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(`${name} - ${desc}. Sugandh Ink ${pageUrl}`)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${name} - ${desc} - Sugandh Ink`)}&url=${encodeURIComponent(pageUrl)}`, '_blank');
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(`${name} - Sugandh Ink`)}&body=${encodeURIComponent(`Discover ${name}: ${desc}\n\n${pageUrl}`)}`;
                break;
            case 'copy':
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(pageUrl).then(() => {
                        showToast('Link copied to clipboard.');
                    });
                }
                break;
        }
    });
}

// ── Recently Viewed ───────────────────────────────────────────────────────
function trackRecentlyViewed() {
    if (!product) return;
    let viewed = [];
    try {
        viewed = JSON.parse(localStorage.getItem('si_recently_viewed')) || [];
    } catch {
        viewed = [];
    }
    viewed = viewed.filter(code => code !== product.code);
    viewed.unshift(product.code);
    if (viewed.length > 6) viewed = viewed.slice(0, 6);
    localStorage.setItem('si_recently_viewed', JSON.stringify(viewed));
}

function renderRecentlyViewed() {
    let viewed = [];
    try {
        viewed = JSON.parse(localStorage.getItem('si_recently_viewed')) || [];
    } catch {
        viewed = [];
    }
    const section = document.getElementById('recently-viewed-section');
    const rail = document.getElementById('recently-viewed-rail');
    if (!section || !rail) return;

    const filtered = viewed.filter(code => code !== (product ? product.code : null));
    if (filtered.length === 0) {
        section.style.display = 'none';
        return;
    }

    const items = filtered.map(code => products.find(p => p.code === code)).filter(Boolean);
    if (items.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';

    rail.innerHTML = '';
    items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pcard';
        card.innerHTML = `
            <div class="pcard-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <button class="card-wishlist-btn wishlist-btn ${typeof isInWishlist !== 'undefined' && isInWishlist(p.code) ? 'in-wishlist' : ''}" data-code="${p.code}" aria-label="Toggle wishlist">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="pcard-code">${p.code}</div>
            <div class="pcard-name">${p.name}</div>
            <div class="pcard-notes">${p.shortNotes}</div>
            <div class="pcard-footer">
                <span class="pcard-price">${p.price}</span>
                <span class="pcard-wa" style="font-size:0.65rem;">Explore</span>
            </div>
        `;
        const wishBtn = card.querySelector('.card-wishlist-btn');
        if (wishBtn && typeof toggleWishlist !== 'undefined') {
            wishBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleWishlist(p.code);
                wishBtn.classList.toggle('in-wishlist');
            });
        }
        card.addEventListener('click', () => {
            const targetUrl = `product.html?id=${p.code}`;
            const curtain = document.getElementById('curtain');
            if (curtain) {
                curtain.classList.remove('slide-out');
                curtain.classList.add('slide-in');
                setTimeout(() => { window.location.href = targetUrl; }, 600);
            } else {
                window.location.href = targetUrl;
            }
        });
        rail.appendChild(card);
    });
}
