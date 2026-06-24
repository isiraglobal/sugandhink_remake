/**
 * cart.js - Handles the shopping cart state, stepper increments, promo codes, summaries and WhatsApp order generation
 */

import { getApiUrl } from './utils.js';
import { initializeForNewUser, checkBirthdayBonus, addPoints } from './loyalty.js';

const WA_NUMBER = '919769445567';

// ── State ────────────────────────────────────────────────────────────────────
let cartItems = [];
let appliedDiscountPercent = 0; // percentage e.g. 10 for 10%
let promoApplied = false;

// ── Load state ───────────────────────────────────────────────────────────────
function loadCart() {
    try {
        cartItems = JSON.parse(localStorage.getItem('si_cart')) || [];
    } catch {
        cartItems = [];
    }
}

function saveCart() {
    localStorage.setItem('si_cart', JSON.stringify(cartItems));
    // Dispatch cart change to update other pages or nav badge
    window.dispatchEvent(new CustomEvent('cart:updated'));
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderCart() {
    loadCart();

    const layout = document.getElementById('cart-layout');
    const emptyView = document.getElementById('empty-cart-view');
    const listContainer = document.getElementById('cart-items-list');

    if (!listContainer) return;

    if (cartItems.length === 0) {
        if (layout) layout.style.display = 'none';
        if (emptyView) emptyView.style.display = 'flex';
        updateNavBadge();
        return;
    }

    if (layout) layout.style.display = 'grid';
    if (emptyView) emptyView.style.display = 'none';

    // Load active promo code state
    loadPromoCode();

    listContainer.innerHTML = '';

    cartItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <span class="cart-item-code">${item.code}</span>
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-size">Size: ${item.size}</span>
                <div class="cart-item-footer">
                    <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
                    <div class="stepper">
                        <button class="cart-minus" data-idx="${index}">−</button>
                        <span>${item.qty}</span>
                        <button class="cart-plus" data-idx="${index}">+</button>
                    </div>
                </div>
            </div>
            <button class="cart-item-remove" data-idx="${index}">Remove</button>
        `;
        listContainer.appendChild(row);
    });

    setupItemActions();
    calculateSummary();
}

// ── Steppers and Removals ────────────────────────────────────────────────────
function setupItemActions() {
    document.querySelectorAll('.cart-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (cartItems[idx].qty > 1) {
                cartItems[idx].qty--;
                saveCart();
                renderCart();
            }
        });
    });

    document.querySelectorAll('.cart-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (cartItems[idx].qty < 10) {
                cartItems[idx].qty++;
                saveCart();
                renderCart();
            }
        });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            cartItems.splice(idx, 1);
            saveCart();
            renderCart();
        });
    });
}

// ── Summary Calculation ──────────────────────────────────────────────────────
function calculateSummary() {
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.qty;
    });

    const discountAmount = Math.round(subtotal * (appliedDiscountPercent / 100));
    const total = subtotal - discountAmount;

    // Render summaries
    document.getElementById('summary-subtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
    
    const promoRow = document.getElementById('summary-promo-row');
    if (promoRow) {
        if (appliedDiscountPercent > 0) {
            promoRow.style.display = 'flex';
            document.getElementById('promo-percentage').textContent = appliedDiscountPercent;
            document.getElementById('summary-discount').textContent = '-₹' + discountAmount.toLocaleString('en-IN');
        } else {
            promoRow.style.display = 'none';
        }
    }

    document.getElementById('summary-total').textContent = '₹' + total.toLocaleString('en-IN');

    // Update WhatsApp checkout href
    updateWhatsAppCheckout(subtotal, discountAmount, total);
}

function loadPromoCode() {
    const activePromo = localStorage.getItem('si_promo_applied');
    const promoInput = document.getElementById('promo-input');
    const feedback = document.getElementById('promo-feedback');
    
    if (activePromo) {
        promoApplied = true;
        if (activePromo === 'SUGANDH10') {
            appliedDiscountPercent = 10;
        } else if (activePromo === 'WELCOME5') {
            appliedDiscountPercent = 5;
        } else if (activePromo === 'ROYAL20') {
            appliedDiscountPercent = 20;
        }
        if (promoInput) promoInput.value = activePromo;
        if (feedback) {
            feedback.textContent = `Promo code ${activePromo} applied successfully! (${appliedDiscountPercent}% Discount)`;
            feedback.className = 'promo-feedback success';
        }
    } else {
        appliedDiscountPercent = 0;
        promoApplied = false;
        if (promoInput) promoInput.value = '';
        if (feedback) feedback.textContent = '';
    }
}

// ── Promo Code System ────────────────────────────────────────────────────────
function setupPromoCode() {
    const applyBtn = document.getElementById('promo-apply-btn');
    const promoInput = document.getElementById('promo-input');
    const feedback = document.getElementById('promo-feedback');

    if (!applyBtn || !promoInput) return;

    applyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'SUGANDH10' || code === 'WELCOME5' || code === 'ROYAL20') {
            localStorage.setItem('si_promo_applied', code);
            loadPromoCode();
            calculateSummary();
        } else if (code === '') {
            localStorage.removeItem('si_promo_applied');
            loadPromoCode();
            calculateSummary();
        } else {
            localStorage.removeItem('si_promo_applied');
            loadPromoCode();
            if (feedback) {
                feedback.textContent = 'Invalid promo code. Try SUGANDH10, WELCOME5, or ROYAL20';
                feedback.className = 'promo-feedback error';
            }
            calculateSummary();
        }
    });
}

// ── WhatsApp Order Message Builder ───────────────────────────────────────────
function saveOrderToLocalStorage(subtotal, discount, total) {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const user = JSON.parse(localStorage.getItem('si_user')) || { name: 'Guest Collector', email: 'guest@sugandhink.in' };
    const waNum = '+91 97694 45567';

    let itemsListStr = cartItems.map(item => `${item.name} (${item.size}) × ${item.qty}`).join(', ');

    const newOrder = {
        id: orderId,
        collector: user.name,
        email: user.email,
        wa: waNum,
        items: itemsListStr,
        value: '₹' + total.toLocaleString('en-IN'),
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
}

function updateWhatsAppCheckout(subtotal, discount, total) {
    const waBtn = document.getElementById('checkout-wa-btn');
    if (!waBtn) return;

    const user = JSON.parse(localStorage.getItem('si_user'));
    const warningId = 'cart-page-auth-warning';
    let warningEl = document.getElementById(warningId);

    if (!user || !user.name || !user.email || (user.id && user.id.startsWith('guest-'))) {
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = warningId;
            warningEl.style.cssText = 'background: rgba(192, 57, 43, 0.05); border: 1px solid rgba(192, 57, 43, 0.15); border-radius: 4px; padding: 12px; font-size: 0.76rem; color: #c0392b; margin: 16px 0; text-align: center; line-height: 1.4; font-family: \'Jost\', sans-serif;';
            warningEl.innerHTML = `<strong>Details Required:</strong> Please click the profile icon <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin: 0 2px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> on the top right to sign in, register, or provide guest checkout details before completing your order.`;
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
            const promoCodeApplied = localStorage.getItem('si_promo_applied') || '';
            const orderData = {
                id: orderId,
                customerId: user.id && !user.id.startsWith('guest-') ? user.id : null,
                collector: user.name,
                email: user.email,
                wa: user.phone || '',
                items: cartItems.map(i => `${i.name} (${i.size}) × ${i.qty}`).join(', '),
                total: '₹' + total.toLocaleString('en-IN'),
                date: new Date().toLocaleDateString('en-IN'),
                status: 'pending',
                promoCode: promoCodeApplied,
                discount: discount > 0 ? '₹' + discount.toLocaleString('en-IN') : '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                zipCode: user.zipCode || user.zip_code || ''
            };

            try {
                if (!user.id || user.id.startsWith('guest-')) {
                    await fetch(getApiUrl('/api/customers'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone || '',
                            address: user.address || '',
                            city: user.city || '',
                            state: user.state || '',
                            country: user.country || 'India',
                            zipCode: user.zipCode || user.zip_code || ''
                        })
                    });
                }

                await fetch(getApiUrl('/api/orders'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
            } catch (err) {
                console.error('Failed to save order in database:', err);
            }

            if (window.getWhatsAppLink) {
                const waLink = window.getWhatsAppLink(cartItems, subtotal, discount, total, user);
                window.open(waLink, '_blank');
            } else {
                const textMsg = `Hello Sugandh Ink 🌿\n\nI would like to place an order for the following compositions:\n\n${cartItems.map(i => `${i.name} × ${i.qty}`).join('\n')}\n\nTotal: ₹${total.toLocaleString('en-IN')}`;
                window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(textMsg)}`, '_blank');
            }

            initializeForNewUser();
            checkBirthdayBonus();
            addPoints(subtotal, 'Purchase');

            localStorage.removeItem('si_cart');
            window.dispatchEvent(new CustomEvent('cart:updated'));
            window.location.href = 'index.html';
        };
    }

// ── Nav Badges ────────────────────────────────────────────────────────────────
function updateNavBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    loadCart();
    let totalQty = 0;
    cartItems.forEach(i => totalQty += i.qty);

    if (totalQty > 0) {
        badge.textContent = totalQty;
        badge.style.display = 'grid';
    } else {
        badge.style.display = 'none';
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    setupPromoCode();
    window.addEventListener('cart:updated', updateNavBadge);
    window.addEventListener('auth:updated', () => {
        renderCart();
        updateNavBadge();
    });
    updateNavBadge();
});
