/**
 * account-page.js - Account dashboard with tabs for Profile, Orders, Wishlist, Addresses
 */

import { getApiUrl } from './utils.js';

const productsPromise = import('./products.js').then(m => m.products);

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || !user.email) {
        renderSignInPrompt();
        return;
    }
    initAccountPage(user);
});

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('si_user')) || null;
    } catch { return null; }
}

function renderSignInPrompt() {
    const container = document.getElementById('account-content');
    if (!container) return;
    container.innerHTML = `
        <div class="account-signin-prompt" style="text-align:center;padding:80px 24px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3;margin-bottom:20px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <h2 style="font-family:var(--font-display);font-weight:300;font-size:1.6rem;color:var(--ink);margin-bottom:12px;">Sign In to Your Atelier</h2>
            <p style="font-family:var(--font-body);font-size:0.88rem;color:var(--ink-mid);margin-bottom:24px;">Please sign in or register to view your account dashboard.</p>
            <button class="btn btn-dark" id="account-go-auth">Sign In / Register</button>
        </div>
    `;
    document.getElementById('account-go-auth')?.addEventListener('click', () => {
        document.getElementById('btn-user-auth')?.click();
    });
}

async function initAccountPage(user) {
    const greeting = document.getElementById('account-greeting');
    if (greeting) greeting.textContent = `Welcome, ${user.name || 'Atelier Member'}`;

    const tabs = document.querySelectorAll('.account-tab');
    const panes = document.querySelectorAll('.account-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    renderProfile(user);
    renderOrders();
    const products = await productsPromise;
    renderWishlist(products);
    renderAddresses(user);
}

function renderProfile(user) {
    const pane = document.getElementById('pane-profile');
    if (!pane) return;

    pane.innerHTML = `
        <div class="ac-profile-form">
            <div class="af-group">
                <label>Full Name</label>
                <input type="text" id="ap-name" value="${escHtml(user.name || '')}" class="af-input">
            </div>
            <div class="af-group">
                <label>Email</label>
                <input type="email" id="ap-email" value="${escHtml(user.email || '')}" class="af-input" readonly style="opacity:0.6;">
            </div>
            <div class="af-group">
                <label>Phone / WhatsApp</label>
                <input type="tel" id="ap-phone" value="${escHtml(user.phone || '')}" class="af-input">
            </div>
            <button class="btn btn-dark" id="ap-save" style="margin-top:8px;">Save Changes</button>
            <p id="ap-feedback" style="font-size:0.78rem;margin-top:12px;font-family:var(--font-body);"></p>
        </div>
    `;

    document.getElementById('ap-save')?.addEventListener('click', async () => {
        const name = document.getElementById('ap-name')?.value.trim();
        const phone = document.getElementById('ap-phone')?.value.trim();
        const feedback = document.getElementById('ap-feedback');
        if (!name) {
            if (feedback) { feedback.textContent = 'Name is required.'; feedback.style.color = '#c0392b'; }
            return;
        }
        const updated = { ...user, name, phone };
        localStorage.setItem('si_user', JSON.stringify(updated));

        try {
            await fetch(getApiUrl('/api/customers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, name, email: user.email, phone })
            });
        } catch (e) { /* ignore */ }

        if (feedback) { feedback.textContent = 'Profile updated successfully.'; feedback.style.color = 'var(--gold)'; }
        const greeting = document.getElementById('account-greeting');
        if (greeting) greeting.textContent = `Welcome, ${name}`;
        window.dispatchEvent(new CustomEvent('auth:updated'));
    });
}

function renderOrders() {
    const pane = document.getElementById('pane-orders');
    if (!pane) return;

    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('si_orders')) || []; } catch { orders = []; }

    if (orders.length === 0) {
        pane.innerHTML = `<div class="ac-empty"><p>You haven't placed any orders yet.</p><a href="../collection.html" class="btn btn-outline" style="margin-top:16px;">Browse the Library</a></div>`;
        return;
    }

    let html = `<div class="ac-orders-list">`;
    orders.slice().reverse().forEach(o => {
        const statusClass = o.status === 'fulfilled' ? 'ac-status-fulfilled' : (o.status === 'cancelled' ? 'ac-status-cancelled' : 'ac-status-pending');
        html += `
            <div class="ac-order-card">
                <div class="ac-order-head">
                    <span class="ac-order-id">${escHtml(o.id)}</span>
                    <span class="ac-status ${statusClass}">${escHtml(o.status)}</span>
                </div>
                <div class="ac-order-body">
                    <div class="ac-order-row"><span>Date</span><span>${escHtml(o.date)}</span></div>
                    <div class="ac-order-row"><span>Items</span><span>${escHtml(o.items)}</span></div>
                    <div class="ac-order-row"><span>Total</span><span>${escHtml(o.value || o.total)}</span></div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    pane.innerHTML = html;
}

async function renderWishlist(products) {
    const pane = document.getElementById('pane-wishlist');
    if (!pane) return;

    let wishlist = [];
    try { wishlist = JSON.parse(localStorage.getItem('si_wishlist')) || []; } catch { wishlist = []; }

    if (!wishlist.length) {
        pane.innerHTML = `<div class="ac-empty"><p>Your wishlist is empty.</p><a href="../collection.html" class="btn btn-outline" style="margin-top:16px;">Discover Compositions</a></div>`;
        return;
    }

    const matched = products.filter(p => wishlist.includes(p.code));
    if (!matched.length) {
        pane.innerHTML = `<div class="ac-empty"><p>Wishlist items no longer available.</p><a href="../collection.html" class="btn btn-outline" style="margin-top:16px;">Browse the Library</a></div>`;
        return;
    }

    let html = `<div class="ac-wishlist-grid">`;
    matched.forEach(p => {
        html += `
            <div class="ac-wl-item">
                <div class="ac-wl-img"><img src="${p.image}" alt="${escHtml(p.name)}"></div>
                <div class="ac-wl-info">
                    <span class="ac-wl-code">${escHtml(p.code)}</span>
                    <span class="ac-wl-name">${escHtml(p.name)}</span>
                    <span class="ac-wl-price">${p.price}</span>
                </div>
                <button class="ac-wl-remove" data-code="${escHtml(p.code)}">Remove</button>
            </div>
        `;
    });
    html += `</div>`;
    pane.innerHTML = html;

    pane.querySelectorAll('.ac-wl-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            let wl = [];
            try { wl = JSON.parse(localStorage.getItem('si_wishlist')) || []; } catch { wl = []; }
            wl = wl.filter(c => c !== code);
            localStorage.setItem('si_wishlist', JSON.stringify(wl));
            renderWishlist(products);
        });
    });
}

function renderAddresses(user) {
    const pane = document.getElementById('pane-addresses');
    if (!pane) return;

    pane.innerHTML = `
        <div class="ac-address-form">
            <div class="af-group">
                <label>Street Address</label>
                <textarea id="aa-address" class="af-input" style="min-height:60px;">${escHtml(user.address || '')}</textarea>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <div class="af-group" style="flex:1;">
                    <label>City</label>
                    <input type="text" id="aa-city" value="${escHtml(user.city || '')}" class="af-input">
                </div>
                <div class="af-group" style="flex:1;">
                    <label>State</label>
                    <input type="text" id="aa-state" value="${escHtml(user.state || '')}" class="af-input">
                </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <div class="af-group" style="flex:1;">
                    <label>Country</label>
                    <input type="text" id="aa-country" value="${escHtml(user.country || 'India')}" class="af-input">
                </div>
                <div class="af-group" style="flex:1;">
                    <label>ZIP / Pin Code</label>
                    <input type="text" id="aa-zip" value="${escHtml(user.zipCode || user.zip_code || '')}" class="af-input">
                </div>
            </div>
            <button class="btn btn-dark" id="aa-save" style="margin-top:8px;">Save Address</button>
            <p id="aa-feedback" style="font-size:0.78rem;margin-top:12px;font-family:var(--font-body);"></p>
        </div>
    `;

    document.getElementById('aa-save')?.addEventListener('click', async () => {
        const address = document.getElementById('aa-address')?.value.trim();
        const city = document.getElementById('aa-city')?.value.trim();
        const state = document.getElementById('aa-state')?.value.trim();
        const country = document.getElementById('aa-country')?.value.trim();
        const zip = document.getElementById('aa-zip')?.value.trim();
        const feedback = document.getElementById('aa-feedback');

        const updated = { ...user, address, city, state, country, zipCode: zip };
        localStorage.setItem('si_user', JSON.stringify(updated));

        try {
            await fetch(getApiUrl('/api/customers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, name: user.name, email: user.email, phone: user.phone, address, city, state, country, zipCode: zip })
            });
        } catch (e) { /* ignore */ }

        if (feedback) { feedback.textContent = 'Address saved successfully.'; feedback.style.color = 'var(--gold)'; }
    });
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
