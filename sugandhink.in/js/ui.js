/**
 * ui.js - Shared UI enhancements, Cart Drawer (User Profile + Selected items) and WhatsApp Checkout
 */

import { getApiUrl, initReveals } from './utils.js';
import { initSearch } from './search.js';
import { initWishlist, updateWishlistBadge } from './wishlist.js';
import { initializeForNewUser, checkBirthdayBonus, addPoints } from './loyalty.js';
import { claimReferralBonus, getReferredBy } from './referral.js';

let supabaseClient = null;
let currentSession = null;

document.addEventListener('DOMContentLoaded', async () => {
    initReveals();

    // Shared UI features
    setupCursor();
    setupBanner();
    setupHeader();
    setupMobileMenu();
    
    // Initial badge update
    updateCartBadge();
    window.addEventListener('cart:updated', updateCartBadge);
    
    // Load Supabase and initialize auth
    await loadSupabaseScript();
    await initSupabase();
    
    // Initialize Cart/Library Drawer
    setupUnifiedDrawer();
    initSearch();
    initWishlist();

    // WhatsApp Chat Widget
    setupWAChat();

    // Check for referral code in URL
    import('./referral.js').then(m => m.checkForReferral());
});

// ── Supabase Dynamic Script Loader ───────────────────────────────────────────
function loadSupabaseScript() {
    return new Promise((resolve) => {
        if (window.supabase) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
    });
}

// ── Supabase Initialization & Sync ──────────────────────────────────────────
async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    try {
        const res = await fetch(getApiUrl('/api/config'));
        if (!res.ok) throw new Error('API config failed');
        const config = await res.json();
        
        if (config.supabaseUrl && config.supabaseAnonKey && window.supabase) {
            supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            
            // Listen to auth changes
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                currentSession = session;
                if (session) {
                    const user = session.user;
                    
                    // Fetch existing customer details from DB to sync phone and address
                    try {
                        const { data: existing } = await supabaseClient
                            .from('customers')
                            .select('*')
                            .eq('id', user.id)
                            .single();
                            
                        const customerData = {
                            id: user.id,
                            name: existing ? (existing.name || user.user_metadata.full_name || user.email.split('@')[0]) : (user.user_metadata.full_name || user.email.split('@')[0]),
                            email: user.email,
                            phone: existing ? (existing.phone || '') : '',
                            address: existing ? (existing.address || '') : '',
                            city: existing ? (existing.city || '') : '',
                            state: existing ? (existing.state || '') : '',
                            country: existing ? (existing.country || '') : '',
                            zipCode: existing ? (existing.zip_code || '') : ''
                        };
                        
                        if (!existing) {
                            // First time sign up (OAuth): insert customer record
                            await supabaseClient.from('customers').insert([{
                                id: user.id,
                                name: customerData.name,
                                email: customerData.email,
                                phone: '',
                                address: '',
                                city: '',
                                state: '',
                                country: 'India',
                                zip_code: ''
                            }]);
                        }
                        
                        localStorage.setItem('si_user', JSON.stringify(customerData));
                    } catch (err) {
                        console.error('Error syncing customer record:', err);
                    }
                } else {
                    // Sign out: clear authenticated user info
                    localStorage.removeItem('si_user');
                }
                renderUnifiedDrawer();
                updateCartBadge();
                window.dispatchEvent(new CustomEvent('auth:updated'));
            });
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            currentSession = session;
        }
    } catch (err) {
        console.error('Supabase initialization bypassed or failed:', err.message);
    }
    return supabaseClient;
}

// ── WhatsApp Message Builder ──────────────────────────────────────────────────
window.getWhatsAppLink = function(items, subtotal, discount, total, customer) {
    const WA_NUMBER = '919769445567';
    let itemsStr = '';
    items.forEach((item, idx) => {
        itemsStr += `${idx + 1}. *${item.name}* (${item.code}) - ${item.size} - Qty: ${item.qty} - Price: ₹${item.price.toLocaleString('en-IN')} each\n`;
    });
    
    const promoCode = localStorage.getItem('si_promo_applied') || 'None';
    let summaryStr = `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
    if (discount > 0) {
        summaryStr += `*Promo Applied:* ${promoCode}\n*Discount:* -₹${discount.toLocaleString('en-IN')}\n`;
    }
    summaryStr += `*Delivery:* Complimentary\n*Total Order Value:* ₹${total.toLocaleString('en-IN')}\n\n`;
    summaryStr += `*Payment Accord:* Prepaid Only (No COD)\n\n`;

    const checkoutSamples = JSON.parse(sessionStorage.getItem('si_checkout_samples') || '[]');
    if (checkoutSamples.length > 0) {
        summaryStr += `*Complimentary Samples:* ${checkoutSamples.join(', ')}\n\n`;
    }

    const checkoutGift = JSON.parse(sessionStorage.getItem('si_checkout_gift') || '{"isGift":false}');
    if (checkoutGift.isGift) {
        summaryStr += `*Gift Order:* Yes\n`;
        if (checkoutGift.premiumWrap) summaryStr += `*Premium Gift Wrapping:* Yes\n`;
        if (checkoutGift.giftMessage) summaryStr += `*Gift Message:* "${checkoutGift.giftMessage}"\n`;
        summaryStr += `\n`;
    }
    
    let custStr = `*Customer Details:*\n`;
    if (customer && customer.name) {
        custStr += `- *Name:* ${customer.name}\n`;
        custStr += `- *Email:* ${customer.email || 'N/A'}\n`;
        custStr += `- *Phone:* ${customer.phone || 'N/A'}\n`;
        
        let fullAddr = customer.address || 'N/A';
        if (customer.city) fullAddr += `, ${customer.city}`;
        if (customer.state) fullAddr += `, ${customer.state}`;
        if (customer.country) fullAddr += `, ${customer.country}`;
        if (customer.zipCode || customer.zip_code) fullAddr += ` - ${customer.zipCode || customer.zip_code}`;
        custStr += `- *Shipping Address:* ${fullAddr}\n`;
    } else {
        custStr += `No details provided.\n`;
    }
    
    const textMsg = `Hello Sugandh Ink 🌿\n\nI would like to place an order for the following compositions:\n\n${itemsStr}\n${summaryStr}${custStr}Please verify availability and provide payment details. Thank you.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(textMsg)}`;
};

// ── Direct Product WhatsApp Handler (used by product cards in main.js) ─────────
window.handleDirectWA = function(e, product) {
    e.preventDefault();
    e.stopPropagation();
    const WA_NUMBER = '919769445567';
    const msg = encodeURIComponent(
        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.name}* (${product.code})\nNotes: ${product.shortNotes}\nPrice: ${product.price}\n\nPlease share availability and payment details. Thank you.`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
};

// ── Unified Drawer Operations ─────────────────────────────────────────────────
function setupUnifiedDrawer() {
    const openBtn = document.getElementById('toggle-shop');
    const userAuthBtn = document.getElementById('btn-user-auth');
    
    // Inject Scent Finder link into nav-left if not present
    const navLeft = document.querySelector('.nav-left');
    if (navLeft && !document.querySelector('.nav-left .nav-link[href*="scent-quiz"]')) {
        const sfLink = document.createElement('a');
        sfLink.href = window.location.pathname.includes('/pages/') ? 'scent-quiz.html' : 'pages/scent-quiz.html';
        sfLink.className = 'nav-link';
        sfLink.textContent = 'Scent Finder';
        const aboutLink = navLeft.querySelector('a[href*="about"], a[href*="heritage"]');
        if (aboutLink) {
            aboutLink.parentNode.insertBefore(sfLink, aboutLink.nextSibling);
        } else {
            navLeft.appendChild(sfLink);
        }
    }

    // Inject Scent Finder link into mobile menu if not present
    const mobileMenuNav = document.querySelector('.mobile-menu-nav');
    if (mobileMenuNav && !mobileMenuNav.querySelector('a[href*="scent-quiz"]')) {
        const mmSf = document.createElement('a');
        mmSf.href = window.location.pathname.includes('/pages/') ? 'scent-quiz.html' : 'pages/scent-quiz.html';
        mmSf.className = 'mm-link';
        mmSf.setAttribute('data-close', '');
        mmSf.textContent = 'Scent Finder';
        const contactLink = mobileMenuNav.querySelector('a[href*="contact"]');
        if (contactLink) {
            contactLink.parentNode.insertBefore(mmSf, contactLink);
        } else {
            mobileMenuNav.appendChild(mmSf);
        }
    }

    // Inject search button into nav-right if not present
    const navRight = document.querySelector('.nav-right');
    if (navRight && !document.getElementById('btn-search')) {
        const searchBtn = document.createElement('button');
        searchBtn.className = 'nav-icon-btn';
        searchBtn.id = 'btn-search';
        searchBtn.setAttribute('aria-label', 'Search');
        searchBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
        `;
        const authBtn = navRight.querySelector('#btn-user-auth');
        if (authBtn) {
            navRight.insertBefore(searchBtn, authBtn);
        } else {
            navRight.prepend(searchBtn);
        }
    }

    // Inject wishlist button into nav-right if not present
    if (navRight && !document.getElementById('btn-wishlist')) {
        const wishlistBtn = document.createElement('a');
        wishlistBtn.className = 'nav-icon-btn';
        wishlistBtn.id = 'btn-wishlist';
        wishlistBtn.setAttribute('aria-label', 'Wishlist');
        wishlistBtn.href = 'account.html?tab=wishlist';
        wishlistBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="cart-count" id="wishlist-badge"></span>
        `;
        const searchBtn = document.getElementById('btn-search');
        if (searchBtn) {
            navRight.insertBefore(wishlistBtn, searchBtn);
        } else {
            const authBtn = navRight.querySelector('#btn-user-auth');
            if (authBtn) {
                navRight.insertBefore(wishlistBtn, authBtn);
            } else {
                navRight.prepend(wishlistBtn);
            }
        }
    }
    
    // Inject Cart Drawer HTML if it does not exist (useful for subpages)
    if (!document.getElementById('library-drawer')) {
        const drawerHtml = `
            <div class="drawer-overlay" id="drawer-overlay"></div>
            <aside class="library-drawer" id="library-drawer" role="complementary" aria-label="Fragrance Library">
                <div class="ld-header">
                    <div>
                        <p class="ld-eyebrow">Sugandh Ink</p>
                        <h3 class="ld-title">Selected Compositions</h3>
                    </div>
                    <button class="ld-close" id="close-drawer" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="ld-list" id="drawer-product-list" style="display:none"></div>
                <div id="drawer-unified-content" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 0 32px 32px;"></div>
            </aside>
        `;
        const div = document.createElement('div');
        div.innerHTML = drawerHtml;
        while (div.children.length > 0) {
            document.body.appendChild(div.children[0]);
        }
    } else {
        const drawer = document.getElementById('library-drawer');
        if (!document.getElementById('drawer-unified-content')) {
            const list = document.getElementById('drawer-product-list');
            if (list) list.style.display = 'none';
            const contentDiv = document.createElement('div');
            contentDiv.id = 'drawer-unified-content';
            contentDiv.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 0 32px 32px;';
            drawer.appendChild(contentDiv);
        }
    }

    // Inject Auth/Profile Drawer HTML if it does not exist
    if (!document.getElementById('auth-drawer')) {
        const authDrawerHtml = `
            <div class="drawer-overlay" id="auth-drawer-overlay"></div>
            <aside class="library-drawer" id="auth-drawer" role="complementary" aria-label="Atelier Credentials">
                <div class="ld-header">
                    <div>
                        <p class="ld-eyebrow">Sugandh Ink</p>
                        <h3 class="ld-title">Atelier Member</h3>
                    </div>
                    <button class="ld-close" id="close-auth-drawer" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div id="auth-drawer-content" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 0 32px 32px;"></div>
            </aside>
        `;
        const div = document.createElement('div');
        div.innerHTML = authDrawerHtml;
        while (div.children.length > 0) {
            document.body.appendChild(div.children[0]);
        }
    }

    const drawer = document.getElementById('library-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const authDrawer = document.getElementById('auth-drawer');
    const authOverlay = document.getElementById('auth-drawer-overlay');
    
    const openCart = () => {
        renderUnifiedDrawer();
        drawer?.classList.add('open');
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    
    const closeCart = () => {
        drawer?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
    };

    const openAuth = () => {
        renderAuthDrawer();
        authDrawer?.classList.add('open');
        authOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeAuth = () => {
        authDrawer?.classList.remove('open');
        authOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    };

    openBtn?.addEventListener('click', openCart);
    userAuthBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openAuth();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#close-drawer') || e.target === overlay) {
            closeCart();
        }
        if (e.target.closest('#close-auth-drawer') || e.target === authOverlay) {
            closeAuth();
        }
        if (e.target.id === 'btn-open-auth-from-cart') {
            closeCart();
            setTimeout(openAuth, 300);
        }
    });

    renderUnifiedDrawer();
    renderAuthDrawer();
}

function updateHeaderAuthBtn() {
    const userAuthBtn = document.getElementById('btn-user-auth');
    const authIconSvg = document.getElementById('auth-icon-svg');
    const userInitialsSpan = document.getElementById('user-initials');
    if (!userAuthBtn) return;
    
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('si_user')) || null;
    } catch {
        user = null;
    }

    if (currentSession && user) {
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : (user.email ? user.email[0] : 'U');
        if (authIconSvg) authIconSvg.style.display = 'none';
        if (userInitialsSpan) {
            userInitialsSpan.textContent = initials;
            userInitialsSpan.style.display = 'inline-flex';
        }
    } else {
        if (authIconSvg) authIconSvg.style.display = 'block';
        if (userInitialsSpan) userInitialsSpan.style.display = 'none';
    }
}

function showAuthAlert(msg, type = 'error') {
    const alertBox = document.getElementById('auth-alert-message');
    if (!alertBox) return;
    
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
    
    if (type === 'error') {
        alertBox.style.background = 'rgba(192, 57, 43, 0.08)';
        alertBox.style.border = '1px solid #c0392b';
        alertBox.style.color = '#c0392b';
    } else if (type === 'success') {
        alertBox.style.background = 'rgba(39, 174, 96, 0.08)';
        alertBox.style.border = '1px solid #27ae60';
        alertBox.style.color = '#27ae60';
    } else { // info
        alertBox.style.background = 'rgba(155, 122, 66, 0.08)';
        alertBox.style.border = '1px solid #9b7a42';
        alertBox.style.color = '#9b7a42';
    }
    
    // Scroll auth drawer content to top
    const content = document.getElementById('auth-drawer-content');
    if (content) content.scrollTop = 0;
}

function renderUnifiedDrawer() {
    const container = document.getElementById('drawer-unified-content');
    if (!container) return;

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('si_cart')) || [];
    } catch {
        cart = [];
    }

    let subtotal = 0;
    cart.forEach(i => subtotal += i.price * i.qty);
    const promoCode = localStorage.getItem('si_promo_applied');
    let discount = 0;
    if (promoCode === 'SUGANDH10') {
        discount = Math.round(subtotal * 0.1);
    } else if (promoCode === 'WELCOME5') {
        discount = Math.round(subtotal * 0.05);
    } else if (promoCode === 'ROYAL20') {
        discount = Math.round(subtotal * 0.2);
    }
    const total = subtotal - discount;

    updateHeaderAuthBtn();

    let cartHtml = '';
    if (cart.length === 0) {
        cartHtml = `
            <div class="drawer-cart-empty">
                <p>Your collection is empty.</p>
                <button class="btn btn-dark" style="width:100%;" onclick="document.getElementById('close-drawer')?.click();">Browse the Library</button>
            </div>
        `;
    } else {
        let itemsHtml = '';
        cart.forEach((item, idx) => {
            const formattedPrice = '₹' + item.price.toLocaleString('en-IN');
            itemsHtml += `
                <div class="ditem">
                    <div class="ditem-thumb">
                        <img src="${item.image}" alt="${escHtml(item.name)}">
                    </div>
                    <div class="ditem-details">
                        <span class="ditem-name">${escHtml(item.name)}</span>
                        <span class="ditem-size">Size: ${item.size}</span>
                        <div class="ditem-meta">
                            <span class="ditem-price">${formattedPrice}</span>
                            <div class="ditem-actions">
                                <div class="ditem-stepper">
                                    <button class="drawer-minus" data-idx="${idx}">−</button>
                                    <span>${item.qty}</span>
                                    <button class="drawer-plus" data-idx="${idx}">+</button>
                                </div>
                                <button class="ditem-remove" data-idx="${idx}">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('si_user')) || null;
        } catch {
            user = null;
        }

        let checkoutAccessHtml = '';
        if (!user || !user.name || !user.email || (user.id && user.id.startsWith('guest-'))) {
            checkoutAccessHtml = `
                <div class="cart-auth-alert" style="background: rgba(244, 241, 235, 0.9); border: 1px solid var(--border); padding: 16px; border-radius: 4px; margin-bottom: 16px; text-align: center; font-family: 'Jost', sans-serif;">
                    <p style="font-size: 0.78rem; color: var(--ink-dark); margin-bottom: 12px; line-height: 1.4;">Collector details are required to complete your checkout accord.</p>
                    <button class="btn btn-outline" id="btn-open-auth-from-cart" style="width: 100%; height: 36px; font-size: 0.7rem;">Enter Details / Sign In</button>
                </div>
                <button class="btn btn-dark btn-checkout" id="drawer-checkout-wa-btn" style="width: 100%; opacity: 0.4; pointer-events: none;">
                    Complete Order via WhatsApp
                </button>
            `;
        } else {
            checkoutAccessHtml = `
                <button class="btn btn-dark btn-checkout" id="drawer-checkout-wa-btn" style="width: 100%;">
                    Complete Order via WhatsApp
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-left:8px; vertical-align:middle;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
            `;
        }

        cartHtml = `
            <div class="drawer-cart-items">
                <span class="drawer-section-title">Selected Compositions</span>
                <div class="drawer-items-list">
                    ${itemsHtml}
                </div>
                
                <!-- Promo Code Box -->
                <div class="drawer-promo-section" style="margin: 16px 0; border-top: 1px solid rgba(24,25,26,0.06); padding-top: 16px;">
                    <span class="drawer-section-title">Atelier Promo Accord</span>
                    <div class="promo-input-group" style="display:flex; gap:8px; margin-top:8px;">
                        <input type="text" id="drawer-promo-input" class="form-input" style="flex:1; padding:8px; font-size:0.75rem; border:1px solid rgba(24,25,26,0.15);" placeholder="Enter Code (e.g. SUGANDH10)" value="${promoCode || ''}">
                        <button class="btn btn-outline" id="btn-apply-drawer-promo" style="padding: 8px 16px; font-size: 0.7rem;">Apply</button>
                    </div>
                    <div id="drawer-promo-feedback" class="promo-feedback" style="font-size:0.72rem; margin-top:4px;"></div>
                </div>

                <div class="drawer-summary">
                    <div class="drawer-summary-row">
                        <span>Subtotal</span>
                        <span>₹${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    ${discount > 0 ? `
                    <div class="drawer-summary-row" style="color:var(--gold)">
                        <span>Discount (${promoCode === 'ROYAL20' ? '20' : (promoCode === 'WELCOME5' ? '5' : '10')}%)</span>
                        <span>-₹${discount.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    <div class="drawer-summary-row total">
                        <span>Total</span>
                        <span>₹${total.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div class="cod-warning-banner" style="background: rgba(192, 57, 43, 0.05); border-left: 3px solid #c0392b; padding: 10px 14px; font-size: 0.72rem; margin: 12px 0; color: #c0392b; font-family:'Jost', sans-serif; line-height: 1.4;">
                    <strong>Prepaid Payments Only:</strong> Cash on Delivery (COD) is not supported by our atelier. Orders are secured pre-dispatch.
                </div>

                ${checkoutAccessHtml}
            </div>
        `;
    }

    container.innerHTML = cartHtml;

    // Attach Cart Stepper and Promo listeners
    setupCartStepperListeners(cart, subtotal, discount, total);

    // Attach "Open Auth" button listener if present (user not signed in)
    // Must run after setupCartStepperListeners because that clones the container
    setTimeout(() => {
        const openAuthFromCart = document.getElementById('btn-open-auth-from-cart');
        if (openAuthFromCart) {
            openAuthFromCart.addEventListener('click', (e) => {
                e.preventDefault();
                const authDrawer = document.getElementById('auth-drawer');
                const authOverlay = document.getElementById('auth-drawer-overlay');
                if (authDrawer && authOverlay) {
                    renderAuthDrawer();
                    authDrawer.classList.add('open');
                    authOverlay.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }, 0);
}

function renderAuthDrawer() {
    const container = document.getElementById('auth-drawer-content');
    if (!container) return;

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('si_user')) || null;
    } catch {
        user = null;
    }

    let profileHtml = '';
    if (currentSession && user) {
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : (user.email ? user.email[0] : 'U');
        profileHtml = `
            <div class="drawer-profile-section">
                <!-- Inline Alert Container -->
                <div id="auth-alert-message" style="display:none; padding:12px; font-size:0.76rem; border-radius:4px; margin-bottom:16px; font-family:'Jost',sans-serif; line-height:1.4;"></div>

                <div class="user-profile-card">
                    <div class="up-avatar">${initials}</div>
                    <div class="up-details">
                        <span class="up-name">${escHtml(user.name || 'Atelier Member')}</span>
                        <span class="up-email">${escHtml(user.email)}</span>
                    </div>
                    <button class="up-logout-btn" id="drawer-logout-btn">Sign Out</button>
                </div>
                <div class="drawer-shipping-fields" style="margin-top: 24px;">
                    <span class="drawer-section-title">Shipping Accords</span>
                    <input type="text" id="drawer-phone" placeholder="WhatsApp Number" value="${escHtml(user.phone || '')}">
                    <textarea id="drawer-address" placeholder="Delivery Address" style="min-height: 50px;">${escHtml(user.address || '')}</textarea>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="drawer-city" placeholder="City" value="${escHtml(user.city || '')}" style="flex:1">
                        <input type="text" id="drawer-state" placeholder="State" value="${escHtml(user.state || '')}" style="flex:1">
                    </div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="drawer-country" placeholder="Country" value="${escHtml(user.country || 'India')}" style="flex:1">
                        <input type="text" id="drawer-zip" placeholder="ZIP / Pin Code" value="${escHtml(user.zipCode || user.zip_code || '')}" style="flex:1">
                    </div>
                    <button class="btn-save-shipping" id="drawer-save-shipping-btn" style="width:100%;">Save Shipping Accord</button>
                </div>
            </div>
        `;
    } else {
        profileHtml = `
            <div class="drawer-profile-section">
                <div id="auth-alert-message" style="display:none; padding:12px; font-size:0.76rem; border-radius:4px; margin-bottom:16px; font-family:'Jost',sans-serif; line-height:1.4;"></div>

                <div class="auth-credential-card" style="display:flex; flex-direction:column; gap:12px; padding:16px; border:1px solid rgba(24,25,26,0.08); border-radius:12px;">
                    <span class="drawer-section-title">Atelier Sign In</span>
                    <input type="email" id="drawer-signin-email" placeholder="Email Address" required>
                    <input type="password" id="drawer-signin-pass" placeholder="Password" required>
                    <button class="btn btn-dark" id="btn-submit-signin" style="width:100%; height:40px;">Sign In</button>
                </div>

                <div class="drawer-divider" style="margin: 20px 0; text-align:center; font-size:0.78rem; color:var(--ink-dim);">or connect via</div>
                
                <button class="btn-google-login" id="drawer-google-login-btn" style="width:100%; display:flex; justify-content:center; align-items:center; padding:12px; border-radius:10px; border:1px solid rgba(24,25,26,0.12); background:#fff; color:var(--ink-dark);">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right:8px;"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Sign In with Google
                </button>

                <div style="margin-top: 20px; font-size:0.78rem; line-height:1.5; color: var(--ink-dim);">
                    <p>Sign in with email or Google first. After authentication, complete your Atelier Registry details for shipping and collector profile.</p>
                </div>
            </div>
        `;
    }

    container.innerHTML = profileHtml;

    // Attach Listeners
    setupAuthDrawerListeners();
}

function setupAuthDrawerListeners() {
    const submitSigninBtn = document.getElementById('btn-submit-signin');
    const googleLoginBtn = document.getElementById('drawer-google-login-btn');
    const logoutBtn = document.getElementById('drawer-logout-btn');
    const saveShippingBtn = document.getElementById('drawer-save-shipping-btn');

    submitSigninBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = document.getElementById('drawer-signin-email')?.value.trim();
        const password = document.getElementById('drawer-signin-pass')?.value;
        if (!email || !password) return showAuthAlert('Email and password required.', 'error');
        if (!supabaseClient) return showAuthAlert('Supabase connection currently unavailable.', 'error');

        showAuthAlert('Authenticating...', 'info');
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showAuthAlert('Sign In Failed: ' + error.message, 'error');
        } else {
            showAuthAlert('Welcome back to Sugandh Ink Atelier!', 'success');
            setTimeout(() => {
                renderAuthDrawer();
                renderUnifiedDrawer();
            }, 500);
        }
    });

    googleLoginBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        if (!supabaseClient) return showAuthAlert('Supabase connection currently unavailable.', 'error');
        showAuthAlert('Connecting with Google...', 'info');
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href
            }
        });
        if (error) {
            showAuthAlert('Google Sign In Failed: ' + error.message, 'error');
        }
    });

    logoutBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        if (!supabaseClient) {
            localStorage.removeItem('si_user');
            renderAuthDrawer();
            renderUnifiedDrawer();
            return;
        }
        await supabaseClient.auth.signOut();
    });

    saveShippingBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        const phone = document.getElementById('drawer-phone')?.value.trim();
        const address = document.getElementById('drawer-address')?.value.trim();
        const city = document.getElementById('drawer-city')?.value.trim();
        const state = document.getElementById('drawer-state')?.value.trim();
        const country = document.getElementById('drawer-country')?.value.trim();
        const zip = document.getElementById('drawer-zip')?.value.trim();

        let user = JSON.parse(localStorage.getItem('si_user')) || {};
        user.phone = phone;
        user.address = address;
        user.city = city;
        user.state = state;
        user.country = country;
        user.zipCode = zip;
        localStorage.setItem('si_user', JSON.stringify(user));

        if (supabaseClient && currentSession) {
            const { error } = await supabaseClient
                .from('customers')
                .update({ phone, address, city, state, country, zip_code: zip })
                .eq('id', currentSession.user.id);

            if (!error) {
                showAuthAlert('Delivery details saved successfully.', 'success');
                setTimeout(renderAuthDrawer, 1000);
            } else {
                showAuthAlert('Failed to save details to database. Try again.', 'error');
                console.error(error);
            }
        } else {
            showAuthAlert('Delivery details saved locally.', 'success');
        }
    });
}

function setupCartStepperListeners(cart, subtotal, discount, total) {
    const container = document.getElementById('drawer-unified-content');
    if (!container) return;
    // Remove guard: we use event delegation on the container, which persists.
    // The listener is replaced each render cycle so we get fresh data.
    // Clone the container to detach old listeners cleanly.
    const newContainer = container.cloneNode(false);
    newContainer.innerHTML = container.innerHTML;
    container.parentNode.replaceChild(newContainer, container);
    const activeContainer = newContainer;

    activeContainer.addEventListener('click', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.classList.contains('drawer-minus')) {
            event.preventDefault();
            const idx = parseInt(target.dataset.idx, 10);
            if (!Number.isNaN(idx) && cart[idx]) {
                if (cart[idx].qty > 1) {
                    cart[idx].qty--;
                } else {
                    cart.splice(idx, 1);
                }
                localStorage.setItem('si_cart', JSON.stringify(cart));
                window.dispatchEvent(new CustomEvent('cart:updated'));
                renderUnifiedDrawer();
            }
            return;
        }

        if (target.classList.contains('drawer-plus')) {
            event.preventDefault();
            const idx = parseInt(target.dataset.idx, 10);
            if (!Number.isNaN(idx) && cart[idx]) {
                cart[idx].qty++;
                localStorage.setItem('si_cart', JSON.stringify(cart));
                window.dispatchEvent(new CustomEvent('cart:updated'));
                renderUnifiedDrawer();
            }
            return;
        }

        if (target.classList.contains('ditem-remove')) {
            event.preventDefault();
            const idx = parseInt(target.dataset.idx, 10);
            if (!Number.isNaN(idx) && cart[idx]) {
                cart.splice(idx, 1);
                localStorage.setItem('si_cart', JSON.stringify(cart));
                window.dispatchEvent(new CustomEvent('cart:updated'));
                renderUnifiedDrawer();
            }
            return;
        }

        if (target.id === 'btn-apply-drawer-promo') {
            event.preventDefault();
            const drawerPromoInput = document.getElementById('drawer-promo-input');
            const drawerPromoFeedback = document.getElementById('drawer-promo-feedback');
            const code = drawerPromoInput?.value.trim().toUpperCase();
            if (!code) {
                localStorage.removeItem('si_promo_applied');
                if (drawerPromoFeedback) {
                    drawerPromoFeedback.textContent = 'Promo code cleared.';
                    drawerPromoFeedback.style.color = 'var(--ink-dim)';
                }
                renderUnifiedDrawer();
                return;
            }

            const validCodes = ['SUGANDH10', 'WELCOME5', 'ROYAL20'];
            if (validCodes.includes(code)) {
                localStorage.setItem('si_promo_applied', code);
                if (drawerPromoFeedback) {
                    let pct = code === 'ROYAL20' ? '20%' : (code === 'WELCOME5' ? '5%' : '10%');
                    drawerPromoFeedback.textContent = `Code ${code} applied (${pct} off)`;
                    drawerPromoFeedback.style.color = 'var(--gold)';
                }
                renderUnifiedDrawer();
            } else {
                localStorage.removeItem('si_promo_applied');
                if (drawerPromoFeedback) {
                    drawerPromoFeedback.textContent = 'Invalid promo code.';
                    drawerPromoFeedback.style.color = 'var(--error)';
                }
                renderUnifiedDrawer();
            }
            return;
        }

        if (target.id === 'drawer-checkout-wa-btn') {
            event.preventDefault();
            const user = JSON.parse(localStorage.getItem('si_user'));
            if (!user || !user.name || !user.email) return;

            const promoCodeApplied = localStorage.getItem('si_promo_applied') || '';
            const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
            const orderData = {
                id: orderId,
                customerId: user.id && !user.id.startsWith('guest-') ? user.id : null,
                collector: user.name,
                email: user.email,
                wa: user.phone || '',
                items: cart.map(i => `${i.name} (${i.size}) × ${i.qty}`).join(', '),
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
                console.error('Failed to register order in database:', err);
            }

            const waLink = window.getWhatsAppLink(cart, subtotal, discount, total, user);
            window.open(waLink, '_blank');

            initializeForNewUser();
            checkBirthdayBonus();
            addPoints(subtotal, 'Purchase');

            const drawerReferredBy = getReferredBy();
            if (drawerReferredBy) {
                claimReferralBonus(drawerReferredBy);
                localStorage.removeItem('si_referred_by');
            }

            localStorage.removeItem('si_cart');
            localStorage.removeItem('si_promo_applied');
            window.dispatchEvent(new CustomEvent('cart:updated'));
            const drawer = document.getElementById('library-drawer');
            const overlay = document.getElementById('drawer-overlay');
            drawer?.classList.remove('open');
            overlay?.classList.remove('open');
            document.body.style.overflow = '';
            return;
        }
    });
}

// ── Shared UI cursor and menus ────────────────────────────────────────────────
function setupCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!cursor || window.matchMedia('(hover: none)').matches) return;

    cursor.style.display = 'block';

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        }
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        if (cursorRing) {
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactives = document.querySelectorAll('a, button, .pcard, .citem, .family-card, .review-card, input, textarea, select');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorRing) {
                cursorRing.style.width = '64px';
                cursorRing.style.height = '64px';
                cursorRing.style.borderColor = 'var(--gold)';
            }
        });
        el.addEventListener('mouseleave', () => {
            if (cursorRing) {
                cursorRing.style.width = '40px';
                cursorRing.style.height = '40px';
                cursorRing.style.borderColor = 'rgba(24,25,26,0.3)';
            }
        });
    });
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    try {
        const cart = JSON.parse(localStorage.getItem('si_cart')) || [];
        let totalQty = 0;
        cart.forEach(i => totalQty += i.qty);

        if (totalQty > 0) {
            badge.textContent = totalQty;
            badge.style.display = 'grid';
        } else {
            badge.style.display = 'none';
        }
    } catch {
        badge.style.display = 'none';
    }
    
    // Also update dynamic drawer if open
    const drawer = document.getElementById('library-drawer');
    if (drawer && drawer.classList.contains('open')) {
        renderUnifiedDrawer();
    }
}

function setupBanner() {
    const btn    = document.getElementById('banner-close');
    const banner = document.getElementById('announcement-banner');
    if (!btn || !banner) return;
    btn.addEventListener('click', () => {
        banner.style.transition = 'max-height .4s ease, opacity .3s ease, padding .4s ease';
        banner.style.maxHeight  = banner.offsetHeight + 'px';
        requestAnimationFrame(() => {
            banner.style.maxHeight = '0';
            banner.style.opacity   = '0';
            banner.style.padding   = '0';
            banner.style.overflow  = 'hidden';
        });
    });
}

function setupMobileMenu() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    const menuLinks = menu.querySelectorAll('.mm-link');
    const menuFooter = menu.querySelector('.mm-footer');

    // Reset initial states for GSAP
    gsap.set(menu, { yPercent: -100, autoAlpha: 0 });
    gsap.set(menuLinks, { y: 40, opacity: 0 });
    if (menuFooter) gsap.set(menuFooter, { y: 20, opacity: 0 });

    const menuTl = gsap.timeline({ paused: true })
        .to(menu, { duration: 0.6, yPercent: 0, autoAlpha: 1, ease: 'power4.out' })
        .to(menuLinks, { duration: 0.5, y: 0, opacity: 1, stagger: 0.08, ease: 'power3.out' }, '-=0.25');

    if (menuFooter) {
        menuTl.to(menuFooter, { duration: 0.4, y: 0, opacity: 1, ease: 'power3.out' }, '-=0.3');
    }

    let isOpen = false;

    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        btn.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';

        if (isOpen) {
            document.getElementById('site-header').style.zIndex = '2500';
            menu.classList.add('open');
            menuTl.play();
        } else {
            menuTl.reverse().then(() => {
                menu.classList.remove('open');
                document.getElementById('site-header').style.zIndex = '';
            });
        }
    });

    menu.querySelectorAll('[data-close]').forEach(a => {
        a.addEventListener('click', () => {
            isOpen = false;
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            menuTl.reverse().then(() => {
                menu.classList.remove('open');
                document.getElementById('site-header').style.zIndex = '';
            });
        });
    });

    const authMobileBtn = document.getElementById('mm-auth-btn');
    authMobileBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        isOpen = false;
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuTl.reverse().then(() => {
            menu.classList.remove('open');
            document.getElementById('btn-user-auth')?.click();
        });
    });
}


function setupHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('lifted', window.scrollY > 10);
    }, { passive: true });
}

// ── WhatsApp Chat Widget ────────────────────────────────────────────────────
function setupWAChat() {
    if (document.getElementById('wa-chat-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'wa-chat-widget';
    widget.id = 'wa-chat-widget';

    const tooltip = document.createElement('span');
    tooltip.className = 'wa-chat-tooltip';
    tooltip.textContent = 'Chat with us';

    const btn = document.createElement('button');
    btn.className = 'wa-chat-btn';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

    btn.addEventListener('click', () => {
        const msg = encodeURIComponent('Hello Sugandh Ink! I would like to know more about your fragrances.');
        window.open(`https://wa.me/919769445567?text=${msg}`, '_blank');
    });

    widget.appendChild(tooltip);
    widget.appendChild(btn);
    document.body.appendChild(widget);
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}
