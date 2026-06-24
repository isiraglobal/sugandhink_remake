/**
 * checkout.js - Multi-step checkout: Details → Review → Confirm
 * Supports registered user and guest checkout paths.
 */

import { getApiUrl } from './utils.js';
import { addPoints, initializeForNewUser, checkBirthdayBonus } from './loyalty.js';

const WA_NUMBER = '919769445567';

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (user && user.email) {
        isGuestMode = false;
        initCheckout(user);
    } else {
        isGuestMode = true;
        initGuestCheckout();
    }
});

function getUser() {
    try { return JSON.parse(localStorage.getItem('si_user')) || null; } catch { return null; }
}

function getGuestInfo() {
    try { return JSON.parse(localStorage.getItem('si_guest_info')) || null; } catch { return null; }
}

let currentStep = 1;
const totalSteps = 3;
let cartItems = [];
let subtotal = 0;
let discount = 0;
let total = 0;
let selectedSamples = [];
let isGift = false;
let giftMessage = '';
let premiumWrap = false;
let isGuestMode = false;

function initCheckout(user) {
    loadCart();
    if (cartItems.length === 0) {
        document.getElementById('checkout-content').innerHTML = `
            <div class="co-empty" style="text-align:center;padding:80px 24px;">
                <h2 style="font-family:var(--font-display);font-weight:300;font-size:1.6rem;color:var(--ink);margin-bottom:12px;">Your cart is empty</h2>
                <p style="font-family:var(--font-body);font-size:0.88rem;color:var(--ink-mid);margin-bottom:24px;">Add some compositions to your collection before checking out.</p>
                <a href="../collection.html" class="btn btn-dark">Browse the Library</a>
            </div>
        `;
        return;
    }

    prefillForm(user);
    hideAuthToggle();
    showStep(1);
    setupStepNav();
    setupPromo();
    setupGiftOptions();
    setupSamples();
}

function initGuestCheckout() {
    loadCart();
    if (cartItems.length === 0) {
        document.getElementById('checkout-content').innerHTML = `
            <div class="co-empty" style="text-align:center;padding:80px 24px;">
                <h2 style="font-family:var(--font-display);font-weight:300;font-size:1.6rem;color:var(--ink);margin-bottom:12px;">Your cart is empty</h2>
                <p style="font-family:var(--font-body);font-size:0.88rem;color:var(--ink-mid);margin-bottom:24px;">Add some compositions to your collection before checking out.</p>
                <a href="../collection.html" class="btn btn-dark">Browse the Library</a>
            </div>
        `;
        return;
    }

    showGuestToggle();
    prefillFromGuestInfo();
    showStep(1);
    setupStepNav();
    setupPromo();
    setupGiftOptions();
    setupSamples();
}

function hideAuthToggle() {
    const el = document.getElementById('co-auth-toggle');
    if (el) el.style.display = 'none';
}

function showGuestToggle() {
    const el = document.getElementById('co-auth-toggle');
    if (el) el.style.display = 'block';
}

function prefillFromGuestInfo() {
    const guest = getGuestInfo();
    if (!guest) return;
    if (guest.name) document.getElementById('co-name').value = guest.name;
    if (guest.email) document.getElementById('co-email').value = guest.email;
    if (guest.phone) document.getElementById('co-phone').value = guest.phone;
    if (guest.address) document.getElementById('co-address').value = guest.address;
    if (guest.city) document.getElementById('co-city').value = guest.city;
    if (guest.state) document.getElementById('co-state').value = guest.state;
    if (guest.zipCode || guest.zip_code) document.getElementById('co-zip').value = guest.zipCode || guest.zip_code;
    if (guest.country) document.getElementById('co-country').value = guest.country;
}

function loadCart() {
    try { cartItems = JSON.parse(localStorage.getItem('si_cart')) || []; } catch { cartItems = []; }
    subtotal = 0;
    cartItems.forEach(i => subtotal += i.price * i.qty);
    const promoCode = localStorage.getItem('si_promo_applied');
    if (promoCode === 'SUGANDH10') discount = Math.round(subtotal * 0.1);
    else if (promoCode === 'WELCOME5') discount = Math.round(subtotal * 0.05);
    else if (promoCode === 'ROYAL20') discount = Math.round(subtotal * 0.2);
    else discount = 0;
    total = subtotal - discount;
}

function prefillForm(user) {
    if (user.name) document.getElementById('co-name').value = user.name;
    if (user.email) document.getElementById('co-email').value = user.email;
    if (user.phone) document.getElementById('co-phone').value = user.phone;
    if (user.address) document.getElementById('co-address').value = user.address;
    if (user.city) document.getElementById('co-city').value = user.city;
    if (user.state) document.getElementById('co-state').value = user.state;
    if (user.zipCode || user.zip_code) document.getElementById('co-zip').value = user.zipCode || user.zip_code;
    document.getElementById('co-country').value = user.country || 'India';
}

function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.co-step').forEach(el => el.style.display = 'none');
    const target = document.getElementById(`co-step-${step}`);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.co-progress-step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 === step);
        el.classList.toggle('done', i + 1 < step);
    });

    if (step === 2) renderReview();
    if (step === 3) renderConfirm();
}

function setupStepNav() {
    document.getElementById('co-to-step-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validateStep1()) return;
        if (isGuestMode) {
            saveFormAsGuest();
        } else {
            saveFormToUser();
        }
        showStep(2);
    });

    document.getElementById('co-back-step-1')?.addEventListener('click', (e) => {
        e.preventDefault();
        showStep(1);
    });

    document.getElementById('co-to-step-3')?.addEventListener('click', (e) => {
        e.preventDefault();
        showStep(3);
    });

    document.getElementById('co-back-step-2')?.addEventListener('click', (e) => {
        e.preventDefault();
        showStep(2);
    });

    document.getElementById('co-place-order')?.addEventListener('click', (e) => {
        e.preventDefault();
        placeOrder();
    });

    // Guest/Sign-in toggle
    document.querySelectorAll('.co-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.co-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.coMode;
            document.getElementById('co-guest-panel').style.display = mode === 'guest' ? 'block' : 'none';
            document.getElementById('co-signin-panel').style.display = mode === 'signin' ? 'block' : 'none';
        });
    });

    // Sign-in form submit
    document.getElementById('co-si-submit')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('co-si-email')?.value.trim();
        const password = document.getElementById('co-si-pass')?.value;
        const fb = document.getElementById('co-si-feedback');
        if (!email || !password) {
            if (fb) { fb.textContent = 'Email and password required.'; fb.style.color = '#c0392b'; fb.style.display = 'block'; }
            return;
        }
        // Simple local check against si_user
        const saved = getUser();
        if (saved && saved.email === email) {
            // Authenticated locally (no Supabase for guest sign-in flow)
            if (fb) { fb.textContent = 'Signed in successfully.'; fb.style.color = '#27ae60'; fb.style.display = 'block'; }
            isGuestMode = false;
            prefillForm(saved);
            hideAuthToggle();
            setTimeout(() => { if (fb) fb.style.display = 'none'; }, 2000);
        } else {
            if (fb) { fb.textContent = 'No account found with that email. Please continue as guest.'; fb.style.color = '#c0392b'; fb.style.display = 'block'; }
        }
    });
}

function validateStep1() {
    const fields = ['co-name', 'co-email', 'co-phone', 'co-address', 'co-city', 'co-state', 'co-zip'];
    let valid = true;
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            valid = false;
            if (el) { el.style.borderColor = '#c0392b'; }
        } else {
            if (el) el.style.borderColor = '';
        }
    });
    if (!valid) {
        const fb = document.getElementById('co-step1-feedback');
        if (fb) { fb.textContent = 'Please fill in all required fields.'; fb.style.display = 'block'; }
    }
    return valid;
}

function saveFormToUser() {
    let user = getUser() || {};
    user.name = document.getElementById('co-name')?.value.trim() || user.name;
    user.email = document.getElementById('co-email')?.value.trim() || user.email;
    user.phone = document.getElementById('co-phone')?.value.trim() || user.phone;
    user.address = document.getElementById('co-address')?.value.trim() || user.address;
    user.city = document.getElementById('co-city')?.value.trim() || user.city;
    user.state = document.getElementById('co-state')?.value.trim() || user.state;
    user.zipCode = document.getElementById('co-zip')?.value.trim() || user.zipCode;
    user.country = document.getElementById('co-country')?.value.trim() || user.country || 'India';
    localStorage.setItem('si_user', JSON.stringify(user));
}

function saveFormAsGuest() {
    const guest = {
        name: document.getElementById('co-name')?.value.trim() || '',
        email: document.getElementById('co-email')?.value.trim() || '',
        phone: document.getElementById('co-phone')?.value.trim() || '',
        address: document.getElementById('co-address')?.value.trim() || '',
        city: document.getElementById('co-city')?.value.trim() || '',
        state: document.getElementById('co-state')?.value.trim() || '',
        zipCode: document.getElementById('co-zip')?.value.trim() || '',
        country: document.getElementById('co-country')?.value.trim() || 'India'
    };
    localStorage.setItem('si_guest_info', JSON.stringify(guest));
}

function getActiveUser() {
    if (!isGuestMode) return getUser();
    return getGuestInfo();
}

function renderReview() {
    const list = document.getElementById('co-review-items');
    if (!list) return;
    let html = '';
    cartItems.forEach((item, idx) => {
        html += `
            <div class="co-ri">
                <div class="co-ri-img"><img src="${item.image}" alt="${escHtml(item.name)}"></div>
                <div class="co-ri-info">
                    <span class="co-ri-name">${escHtml(item.name)}</span>
                    <span class="co-ri-meta">${item.code} · ${item.size} · Qty: ${item.qty}</span>
                </div>
                <span class="co-ri-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
        `;
    });
    list.innerHTML = html;

    document.getElementById('co-review-subtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
    const promoCode = localStorage.getItem('si_promo_applied');
    const discountRow = document.getElementById('co-review-discount-row');
    if (discount > 0 && promoCode) {
        discountRow.style.display = 'flex';
        document.getElementById('co-review-discount').textContent = '-₹' + discount.toLocaleString('en-IN');
        document.getElementById('co-review-promo-label').textContent = `Discount (${promoCode})`;
    } else {
        discountRow.style.display = 'none';
    }
    document.getElementById('co-review-total').textContent = '₹' + total.toLocaleString('en-IN');

    const u = getActiveUser();
    document.getElementById('co-review-name').textContent = u?.name || '';
    document.getElementById('co-review-email').textContent = u?.email || '';
    document.getElementById('co-review-phone').textContent = u?.phone || '';
    const addr = [u?.address, u?.city, u?.state, u?.zipCode].filter(Boolean).join(', ');
    document.getElementById('co-review-address').textContent = addr || 'N/A';
}

function renderConfirm() {
    document.getElementById('co-confirm-total').textContent = '₹' + total.toLocaleString('en-IN');
}

function setupPromo() {
    document.getElementById('co-apply-promo')?.addEventListener('click', () => {
        const input = document.getElementById('co-promo-input');
        const code = input?.value.trim().toUpperCase();
        const fb = document.getElementById('co-promo-feedback');
        if (code === 'SUGANDH10' || code === 'WELCOME5' || code === 'ROYAL20') {
            localStorage.setItem('si_promo_applied', code);
            loadCart();
            renderReview();
            if (fb) { fb.textContent = `${code} applied!`; fb.style.color = 'var(--gold)'; }
        } else if (!code) {
            localStorage.removeItem('si_promo_applied');
            loadCart();
            renderReview();
            if (fb) fb.textContent = '';
        } else {
            localStorage.removeItem('si_promo_applied');
            loadCart();
            renderReview();
            if (fb) { fb.textContent = 'Invalid code.'; fb.style.color = '#c0392b'; }
        }
    });
}

function setupGiftOptions() {
    const giftCheckbox = document.getElementById('co-is-gift');
    const giftDetails = document.getElementById('co-gift-details');
    const giftMessage = document.getElementById('co-gift-message');
    const giftChars = document.getElementById('co-gift-chars');
    const premiumWrap = document.getElementById('co-premium-wrap');

    giftCheckbox?.addEventListener('change', () => {
        if (giftDetails) {
            giftDetails.style.display = giftCheckbox.checked ? 'block' : 'none';
        }
    });

    giftMessage?.addEventListener('input', () => {
        const len = giftMessage.value.length;
        if (giftChars) giftChars.textContent = `${len}/200`;
    });
}

function setupSamples() {
    const cbs = document.querySelectorAll('.co-sample-cb');
    const feedback = document.getElementById('co-sample-feedback');
    cbs.forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('.co-sample-cb:checked');
            if (checked.length > 2) {
                cb.checked = false;
                if (feedback) feedback.textContent = 'Maximum 2 samples allowed.';
                return;
            }
            if (feedback) feedback.textContent = checked.length > 0 ? `${checked.length} of 2 samples selected` : '';
            checked.forEach(c => {
                c.closest('.co-sample-item')?.classList.toggle('co-sample-selected', c.checked);
            });
            document.querySelectorAll('.co-sample-item').forEach(el => {
                const inp = el.querySelector('.co-sample-cb');
                if (inp) el.classList.toggle('co-sample-selected', inp.checked);
            });
        });
    });
}

async function placeOrder() {
    const btn = document.getElementById('co-place-order');
    btn.disabled = true;
    btn.textContent = 'Placing Order...';

    const user = getActiveUser();
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const promoCode = localStorage.getItem('si_promo_applied') || '';

    const giftCb = document.getElementById('co-is-gift');
    isGift = giftCb?.checked || false;
    giftMessage = document.getElementById('co-gift-message')?.value.trim() || '';
    premiumWrap = document.getElementById('co-premium-wrap')?.checked || false;

    const sampleCbs = document.querySelectorAll('.co-sample-cb:checked');
    selectedSamples = Array.from(sampleCbs).map(cb => cb.value);

    let extrasStr = '';
    if (selectedSamples.length > 0) {
        extrasStr += `Samples: ${selectedSamples.join(', ')}`;
    }
    if (isGift) {
        if (extrasStr) extrasStr += ' | ';
        extrasStr += 'Gift order';
        if (premiumWrap) extrasStr += ' + Premium wrapping';
        if (giftMessage) extrasStr += `: "${giftMessage}"`;
    }

    const orderData = {
        id: orderId,
        customerId: user?.id && !(user.id && user.id.startsWith('guest-')) ? user.id : null,
        collector: user?.name || '',
        email: user?.email || '',
        wa: user?.phone || '',
        items: cartItems.map(i => `${i.name} (${i.code}, ${i.size}) × ${i.qty}`).join(', '),
        total: '₹' + total.toLocaleString('en-IN'),
        date: new Date().toLocaleDateString('en-IN'),
        status: 'pending',
        promoCode,
        discount: discount > 0 ? '₹' + discount.toLocaleString('en-IN') : '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        country: user?.country || '',
        zipCode: user?.zipCode || user?.zip_code || '',
        samples: selectedSamples,
        isGift,
        giftMessage,
        premiumWrap
    };

    try {
        const uid = user?.id;
        if (!uid || uid.startsWith('guest-')) {
            await fetch(getApiUrl('/api/customers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: uid || ('guest-' + Date.now()),
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    city: user?.city || '',
                    state: user?.state || '',
                    country: user?.country || 'India',
                    zipCode: user?.zipCode || user?.zip_code || ''
                })
            });
        }
        await fetch(getApiUrl('/api/orders'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
    } catch (err) {
        console.error('Failed to save order to database:', err);
    }

    sessionStorage.setItem('si_checkout_samples', JSON.stringify(selectedSamples));
    sessionStorage.setItem('si_checkout_gift', JSON.stringify({ isGift, giftMessage, premiumWrap }));

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWAMessage(user))}`, '_blank');

    initializeForNewUser();
    checkBirthdayBonus();
    addPoints(subtotal, 'Purchase');

    localStorage.setItem('si_last_order', JSON.stringify(orderData));
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('si_orders')) || []; } catch { orders = []; }
    orders.push(orderData);
    localStorage.setItem('si_orders', JSON.stringify(orders));

    // Guest account creation after purchase
    if (isGuestMode) {
        const createAccount = document.getElementById('co-create-account')?.checked;
        if (createAccount && user?.email) {
            const siUser = {
                id: 'guest-' + Date.now(),
                name: user.name || '',
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || '',
                country: user.country || 'India'
            };
            localStorage.setItem('si_user', JSON.stringify(siUser));
        }
        localStorage.removeItem('si_guest_info');
    }

    localStorage.removeItem('si_cart');
    localStorage.removeItem('si_promo_applied');
    window.dispatchEvent(new CustomEvent('cart:updated'));

    window.location.href = `order-confirmation.html?id=${orderId}`;
}

function buildWAMessage(user) {
    let msg = `Hello Sugandh Ink\n\nI would like to place an order for:\n\n`;
    cartItems.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} (${item.code}) - ${item.size} - Qty: ${item.qty} - ₹${item.price.toLocaleString('en-IN')} each\n`;
    });
    msg += `\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}`;
    if (discount > 0) msg += `\nDiscount: -₹${discount.toLocaleString('en-IN')}`;
    msg += `\nTotal: ₹${total.toLocaleString('en-IN')}`;
    msg += `\nDelivery: Complimentary`;

    if (selectedSamples.length > 0) {
        msg += `\nComplimentary Samples: ${selectedSamples.join(', ')}`;
    }
    if (isGift) {
        msg += `\nGift Order: Yes`;
        if (premiumWrap) msg += `\nPremium Gift Wrapping: Yes`;
        if (giftMessage) msg += `\nGift Message: "${giftMessage}"`;
    }

    if (isGuestMode) {
        msg += `\n\nGuest Customer Details:\nName: ${user?.name || ''}\nEmail: ${user?.email || ''}\nPhone: ${user?.phone || ''}\nAddress: ${[user?.address, user?.city, user?.state, user?.country, user?.zipCode].filter(Boolean).join(', ')}`;
    } else {
        msg += `\n\nCustomer Details:\nName: ${user?.name || ''}\nEmail: ${user?.email || ''}\nPhone: ${user?.phone || ''}\nAddress: ${[user?.address, user?.city, user?.state, user?.country, user?.zipCode].filter(Boolean).join(', ')}`;
    }
    msg += `\n\nPlease verify availability and share payment details. Thank you.`;
    return msg;
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
