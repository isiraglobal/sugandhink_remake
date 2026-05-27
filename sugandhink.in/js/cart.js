/**
 * cart.js — Handles the shopping cart state, stepper increments, promo codes, summaries and WhatsApp order generation
 */

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

// ── Promo Code System ────────────────────────────────────────────────────────
function setupPromoCode() {
    const applyBtn = document.getElementById('promo-apply-btn');
    const promoInput = document.getElementById('promo-input');
    const feedback = document.getElementById('promo-feedback');

    if (!applyBtn || !promoInput) return;

    applyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'SUGANDH10') {
            appliedDiscountPercent = 10;
            promoApplied = true;
            if (feedback) {
                feedback.textContent = 'Promo code SUGANDH10 applied successfully! (10% Discount)';
                feedback.className = 'promo-feedback success';
            }
            calculateSummary();
        } else if (code === '') {
            appliedDiscountPercent = 0;
            promoApplied = false;
            if (feedback) feedback.textContent = '';
            calculateSummary();
        } else {
            appliedDiscountPercent = 0;
            promoApplied = false;
            if (feedback) {
                feedback.textContent = 'Invalid promo code. Try SUGANDH10';
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

    let itemsListStr = '';
    cartItems.forEach((item, idx) => {
        itemsListStr += `${idx + 1}. *${item.name}* (${item.code}) - ${item.size} - Qty: ${item.qty} - Price: ₹${item.price.toLocaleString('en-IN')} each\n`;
    });

    let summaryStr = `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (appliedDiscountPercent > 0) {
        summaryStr += `*Promo Applied:* SUGANDH10 (-${appliedDiscountPercent}%)\n*Discount:* -₹${discount.toLocaleString('en-IN')}\n`;
    }
    summaryStr += `*Delivery:* Complimentary\n*Total Order Value:* ₹${total.toLocaleString('en-IN')}`;

    const textMsg = `Hello Sugandh Ink 🌿\n\nI would like to place an order for the following compositions:\n\n${itemsListStr}\n${summaryStr}\n\nPlease verify availability and provide payment details. Thank you.`;
    
    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(textMsg)}`;
    waBtn.onclick = () => {
        saveOrderToLocalStorage(subtotal, discount, total);
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
    updateNavBadge();
});
