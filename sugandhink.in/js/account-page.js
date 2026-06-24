/**
 * account-page.js - Account dashboard with tabs for Profile, Orders, Wishlist, Addresses, Loyalty
 */

import { getApiUrl } from './utils.js';
import { getPoints, getTier, getHistory, TIERS, renderPointsBadge } from './loyalty.js';
import { getReferralCode, getReferralLink, getReferrals, getReferralEarnings, getReferrerEarnings, copyReferralLink, shareViaWhatsApp } from './referral.js';

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

    const tabs = document.querySelectorAll('.ac-tab');
    const panes = document.querySelectorAll('.ac-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const targetTab = document.querySelector(`.ac-tab[data-tab="pane-${tabParam}"]`);
        if (targetTab) {
            tabs.forEach(t => t.classList.remove('active'));
            targetTab.classList.add('active');
            panes.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`pane-${tabParam}`);
            if (target) target.classList.add('active');
        }
    }

    renderProfile(user);
    renderOrders();
    const products = await productsPromise;
    renderWishlist(products);
    renderAddresses(user);
    renderSubscription();
    renderLoyalty();
    renderReferral();
    renderPointsBadge();
}

window.addEventListener('loyalty:updated', () => {
    renderLoyalty();
    renderSubscription();
    renderPointsBadge();
});

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
                    <div style="display:flex;gap:8px;margin-top:12px;">
                        <button class="btn btn-outline ac-reorder-btn" data-order='${escHtml(JSON.stringify(o))}' style="font-size:0.65rem;padding:8px 16px;">Reorder</button>
                        <a href="track-order.html?id=${escHtml(o.id)}" class="btn btn-outline" style="font-size:0.65rem;padding:8px 16px;">Track Order</a>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    pane.innerHTML = html;

    pane.querySelectorAll('.ac-reorder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                const order = JSON.parse(btn.dataset.order);
                if (order.items) {
                    const itemNames = order.items.split(',').map(s => s.trim().split('(')[0].trim());
                    import('./products.js').then(m => {
                        const prods = m.products;
                        const cart = [];
                        itemNames.forEach(name => {
                            const match = prods.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
                            if (match) {
                                cart.push({
                                    name: match.name,
                                    code: match.code,
                                    price: parseInt(match.price.replace(/[^0-9]/g, '')),
                                    qty: 1,
                                    size: '50ml',
                                    image: match.image
                                });
                            }
                        });
                        if (cart.length > 0) {
                            localStorage.setItem('si_cart', JSON.stringify(cart));
                            window.dispatchEvent(new CustomEvent('cart:updated'));
                            window.location.href = '../cart.html';
                        }
                    });
                }
            } catch (e) { /* ignore */ }
        });
    });
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

function getSubscriptions() {
    try {
        return JSON.parse(localStorage.getItem('si_subscriptions')) || [];
    } catch { return []; }
}

function renderSubscription() {
    const pane = document.getElementById('pane-subscription');
    if (!pane) return;

    const subs = getSubscriptions();

    if (subs.length === 0) {
        pane.innerHTML = `<div class="ac-empty"><p>No active subscription.</p><a href="subscription.html" class="btn btn-outline" style="margin-top:16px;">Explore Scent of the Month</a></div>`;
        return;
    }

    let html = `<div style="display:flex;flex-direction:column;gap:16px;">`;
    subs.slice().reverse().forEach(s => {
        const statusClass = s.status === 'active' ? 'sub-status-active' : (s.status === 'paused' ? 'sub-status-paused' : 'sub-status-cancelled');
        html += `
            <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:var(--cream-deep);">
                    <span style="font-family:var(--font-display);font-size:0.95rem;color:var(--ink);font-weight:500;">${escHtml(s.planName)}</span>
                    <span class="sub-active-status ${statusClass}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                </div>
                <div style="padding:14px 20px;">
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-family:var(--font-body);font-size:0.82rem;color:var(--ink-mid);"><span style="color:var(--ink-dim);">ID</span><span>${escHtml(s.id)}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-family:var(--font-body);font-size:0.82rem;color:var(--ink-mid);"><span style="color:var(--ink-dim);">Price</span><span>₹${s.price.toLocaleString('en-IN')}${s.period}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-family:var(--font-body);font-size:0.82rem;color:var(--ink-mid);"><span style="color:var(--ink-dim);">Started</span><span>${escHtml(s.startDate)}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;font-family:var(--font-body);font-size:0.82rem;color:var(--ink-mid);"><span style="color:var(--ink-dim);">Next Delivery</span><span>${escHtml(s.nextDelivery)}</span></div>
                    <div style="display:flex;gap:8px;margin-top:12px;">
                        ${s.status === 'active' ? `<button class="btn btn-outline ac-reorder-btn" data-sub-action="pause" data-sub-id="${escHtml(s.id)}" style="font-size:0.65rem;padding:8px 16px;">Pause</button>` : ''}
                        ${s.status === 'paused' ? `<button class="btn btn-outline ac-reorder-btn" data-sub-action="resume" data-sub-id="${escHtml(s.id)}" style="font-size:0.65rem;padding:8px 16px;">Resume</button>` : ''}
                        ${s.status !== 'cancelled' ? `<button class="btn btn-outline ac-reorder-btn" data-sub-action="cancel" data-sub-id="${escHtml(s.id)}" style="font-size:0.65rem;padding:8px 16px;color:#c0392b;border-color:rgba(192,57,43,0.2);">Cancel</button>` : ''}
                        <a href="subscription.html" class="btn btn-outline" style="font-size:0.65rem;padding:8px 16px;">Manage</a>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    pane.innerHTML = html;

    pane.querySelectorAll('[data-sub-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.subAction;
            const id = btn.dataset.subId;
            const subs = getSubscriptions();
            const idx = subs.findIndex(s => s.id === id);
            if (idx === -1) return;
            if (action === 'pause') {
                subs[idx].status = 'paused';
            } else if (action === 'resume') {
                subs[idx].status = 'active';
            } else if (action === 'cancel') {
                subs[idx].status = 'cancelled';
            }
            localStorage.setItem('si_subscriptions', JSON.stringify(subs));
            renderSubscription();
        });
    });
}

function renderLoyalty() {
    const pane = document.getElementById('pane-loyalty');
    if (!pane) return;

    const pts = getPoints();
    const tier = getTier();
    const history = getHistory().slice().reverse();

    let html = `<div style="padding:16px 0;">`;

    html += `
        <div style="display:flex;align-items:center;gap:20px;padding:24px;background:var(--cream-deep);border:1px solid var(--border);border-radius:8px;margin-bottom:24px;">
            <div style="text-align:center;flex-shrink:0;">
                <div style="font-family:var(--font-display);font-size:2.4rem;font-weight:300;color:var(--gold);line-height:1;">${pts}</div>
                <div style="font-family:var(--font-body);font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-dim);">Points</div>
            </div>
            <div>
                <div style="font-family:var(--font-body);font-size:0.85rem;color:var(--ink);">Current Tier: <strong>${tier.name}</strong></div>
                <div style="font-family:var(--font-body);font-size:0.75rem;color:var(--ink-dim);margin-top:4px;">${tier.benefit}</div>
                <a href="loyalty.html" style="font-family:var(--font-body);font-size:0.72rem;color:var(--gold);display:inline-block;margin-top:8px;text-decoration:underline;">View full program details</a>
            </div>
        </div>
    `;

    html += `<h4 style="font-family:var(--font-display);font-size:1.1rem;font-weight:500;color:var(--ink);margin-bottom:16px;">How to Earn More</h4>`;
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px;">`;
    const earnWays = [
        { label: 'Every Purchase', desc: 'Re. 1 = 1 point', pts: '1/Re.1' },
        { label: 'Sign Up Bonus', desc: 'Welcome to the Atelier', pts: '+100' },
        { label: 'Write a Review', desc: 'Share your experience', pts: '+50' },
        { label: 'Refer a Friend', desc: 'Invite fellow collectors', pts: '+200' }
    ];
    earnWays.forEach(e => {
        html += `
            <div style="padding:16px;border:1px solid var(--border);border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-family:var(--font-body);font-size:0.82rem;color:var(--ink);font-weight:500;">${e.label}</div>
                    <div style="font-family:var(--font-body);font-size:0.7rem;color:var(--ink-dim);">${e.desc}</div>
                </div>
                <div style="font-family:var(--font-display);font-size:1rem;color:var(--gold);font-weight:500;flex-shrink:0;">${e.pts}</div>
            </div>
        `;
    });
    html += `</div>`;

    if (history.length > 0) {
        html += `<h4 style="font-family:var(--font-display);font-size:1.1rem;font-weight:500;color:var(--ink);margin-bottom:12px;">Recent Activity</h4>`;
        html += `<table class="ly-history-table" style="margin-bottom:24px;">`;
        html += `<thead><tr><th>Date</th><th>Reason</th><th>Points</th><th>Balance</th></tr></thead><tbody>`;
        history.slice(0, 10).forEach(h => {
            const cls = h.points >= 0 ? 'ly-pts-positive' : 'ly-pts-negative';
            const sign = h.points >= 0 ? '+' : '';
            html += `<tr><td>${h.date}</td><td>${h.reason}</td><td class="${cls}">${sign}${h.points}</td><td>${h.runningTotal}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    html += `</div>`;
    pane.innerHTML = html;
}

function renderReferral() {
    const pane = document.getElementById('pane-referral');
    if (!pane) return;

    const code = getReferralCode();
    const link = getReferralLink();
    const referrals = getReferrals();
    const referrerEarnings = getReferrerEarnings();
    const totalEarned = getReferralEarnings() + referrerEarnings.reduce((s, r) => s + r.points, 0);
    const successfulRefs = referrals.filter(r => r.claimed).length + referrerEarnings.length;
    const pts = getPoints();

    let html = `<div style="padding:16px 0;">`;

    html += `
        <div style="display:flex;align-items:center;gap:20px;padding:24px;background:var(--cream-deep);border:1px solid var(--border);border-radius:8px;margin-bottom:24px;flex-wrap:wrap;">
            <div style="text-align:center;flex-shrink:0;">
                <div style="font-family:var(--serif);font-size:1.2rem;font-weight:500;color:var(--gold);line-height:1;">${code}</div>
                <div style="font-family:var(--sans);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-dim);">Your Code</div>
            </div>
            <div style="flex:1;min-width:200px;">
                <div style="font-family:var(--sans);font-size:0.85rem;color:var(--ink);">Points Earned: <strong style="color:var(--gold);">${totalEarned}</strong></div>
                <div style="font-family:var(--sans);font-size:0.72rem;color:var(--ink-dim);margin-top:4px;">${successfulRefs} successful referral${successfulRefs !== 1 ? 's' : ''}</div>
            </div>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-outline" id="ac-rf-copy" style="font-size:0.65rem;padding:10px 20px;">Copy Link</button>
                <button class="btn btn-outline" id="ac-rf-wa" style="font-size:0.65rem;padding:10px 20px;">WhatsApp</button>
            </div>
        </div>
    `;

    if (referrals.filter(r => r.claimed).length > 0 || referrerEarnings.length > 0) {
        html += `<h4 style="font-family:var(--serif);font-size:1.1rem;font-weight:500;color:var(--ink);margin-bottom:12px;">Referral History</h4>`;
        html += `<table class="rf-history-table" style="margin-bottom:24px;">`;
        html += `<thead><tr><th>Date</th><th>Activity</th><th>Points</th><th>Status</th></tr></thead><tbody>`;
        const all = [
            ...referrals.filter(r => r.claimed).map(r => ({ date: r.date, desc: 'Referred a friend', points: r.points, status: 'Claimed' })),
            ...referrerEarnings.map(r => ({ date: r.date, desc: 'Referral bonus earned', status: 'Claimed', points: r.points }))
        ].sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
        all.slice(0, 10).forEach(h => {
            html += `<tr><td>${h.date}</td><td>${h.desc}</td><td class="rf-pts-positive">+${h.points}</td><td class="rf-status-claimed">${h.status}</td></tr>`;
        });
        html += `</tbody></table>`;
    } else {
        html += `<div class="rf-history-empty" style="padding:24px;text-align:center;color:var(--ink-dim);font-size:0.85rem;">No referral activity yet. Share your code to earn points.</div>`;
    }

    html += `<div style="margin-top:16px;"><a href="referral.html" style="font-family:var(--sans);font-size:0.72rem;color:var(--gold);text-decoration:underline;">View full referral program details</a></div>`;
    html += `</div>`;
    pane.innerHTML = html;

    document.getElementById('ac-rf-copy')?.addEventListener('click', () => {
        copyReferralLink();
        const fb = document.createElement('span');
        fb.textContent = 'Link copied';
        fb.style.cssText = 'font-size:0.72rem;color:var(--gold);margin-left:12px;';
        const btn = document.getElementById('ac-rf-copy');
        btn.parentNode.appendChild(fb);
        setTimeout(() => fb.remove(), 2000);
    });

    document.getElementById('ac-rf-wa')?.addEventListener('click', shareViaWhatsApp);
}
