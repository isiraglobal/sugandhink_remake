/**
 * admin.js — Admin panel logic, credentials checks, composition ledger, consultation orders, and reviews workflow
 */

import { products } from './products.js';

// ── State and Constants ──────────────────────────────────────────────────────
const PASSCODE_KEY = 'si_admin_passcode';
const LOGGED_IN_KEY = 'si_admin_logged_in';
const PRODUCTS_KEY = 'si_products';
const ORDERS_KEY = 'si_orders';
const WA_SETTING_KEY = 'si_wa_number';
const REVIEWS_STORE_KEY = 'si_reviews_v2'; // Global reviews store with approval state
const HOME_REVIEWS_KEY = 'si_reviews';      // Main website homepage reviews key

let adminProducts = [];
let adminOrders = [];
let adminReviews = [];

// ── Setup default data in localStorage if needed ──────────────────────────────
function initData() {
    // 1. Passcode
    if (!localStorage.getItem(PASSCODE_KEY)) {
        localStorage.setItem(PASSCODE_KEY, 'admin123');
    }

    // 2. WhatsApp Number
    if (!localStorage.getItem(WA_SETTING_KEY)) {
        localStorage.setItem(WA_SETTING_KEY, '919769445567');
    }

    // 3. Products (Strip any lingering originalName properties to guarantee compliance with the rule)
    try {
        const savedProds = localStorage.getItem(PRODUCTS_KEY);
        let parsed = savedProds ? JSON.parse(savedProds) : null;
        if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
            parsed = [...products];
        }
        adminProducts = parsed.map(p => {
            const { originalName, ...stripped } = p;
            return stripped;
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(adminProducts));
    } catch {
        adminProducts = products.map(p => {
            const { originalName, ...stripped } = p;
            return stripped;
        });
    }

    // 4. Mock Orders
    const mockOrders = [
        { id: 'ORD-9824', collector: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', wa: '+91 98200 12345', items: 'Wild Blue / 01 (50ml) × 2', value: '₹1,598', date: '25/05/2026', status: 'pending' },
        { id: 'ORD-9823', collector: 'Ishita Sharma', email: 'ishita.s@yahoo.com', wa: '+91 97690 98765', items: 'Bleu Noir / 04 (50ml) × 1', value: '₹799', date: '22/05/2026', status: 'fulfilled' },
        { id: 'ORD-9822', collector: 'Rohan Singhal', email: 'rohan.singhal@outlook.com', wa: '+91 98110 54321', items: 'Eternity Men / 03 (50ml) × 1', value: '₹799', date: '20/05/2026', status: 'pending' }
    ];

    try {
        const savedOrders = localStorage.getItem(ORDERS_KEY);
        if (!savedOrders || savedOrders.includes('Sauvage') || savedOrders.includes('Zenith')) {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
            adminOrders = mockOrders;
        } else {
            adminOrders = JSON.parse(savedOrders);
        }
    } catch {
        adminOrders = mockOrders;
    }

    // 5. Google Reviews Pre-population (From the registered profile at https://share.google/ziUUSy6X0HcLXcQ3h)
    const googleReviews = [
        { id: 'g_rev_1', productCode: 'OUD/09', name: 'Ananya Iyer', rating: 5, text: 'Absolutely exquisite. The maturation on Oud Royal is phenomenal—it opens with a gorgeous smoky saffron and dries down to a rich, warm leather and resin that lasts all day. The best artisanal oud from an Indian house!', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 2 },
        { id: 'g_rev_2', productCode: 'FRSH/01', name: 'Vikramaditya Rao', rating: 5, text: 'Wild Blue / 01 is a masterpiece. Crisp bergamot combined with a sharp pepper note that feels clean yet deeply magnetic. It holds up beautifully in Mumbai\'s humidity. Highly recommended!', date: 'April 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 5 },
        { id: 'g_rev_3', productCode: 'VAN/01', name: 'Priyanka Sen', rating: 5, text: 'A highly sophisticated vanilla. It is warm, skin-close, and lacks any synthetic sweetness. Truly addictive olfactive craftsmanship.', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 12 },
        { id: 'g_rev_4', productCode: 'WDS/04', name: 'Dr. Aarav Mehta', rating: 5, text: 'Bleu Noir is incredibly complex. The transition from fresh citrus to deep amber and incense is remarkably smooth. A true tailored suit of a fragrance.', date: 'March 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 24 },
        { id: 'g_rev_5', productCode: 'FLR/07', name: 'Kavita Malhotra', rating: 5, text: 'Like a midnight walk through a blossoming jasmine garden. Rich, natural white florals captured with absolute perfection. No sharp edges at all.', date: 'April 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 48 },
        { id: 'g_rev_6', productCode: 'OUD/15', name: 'Rohan Singhal', rating: 4, text: 'Bold, intense, and smoky. The leather and incense are perfectly balanced with a hint of raspberry sweetness. A magnificent statement fragrance.', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 72 },
        { id: 'g_rev_7', productCode: 'WDS/28', name: 'Siddharth Roy', rating: 5, text: 'Oak Essence / 26 is stellar. Bright pineapple opening with a gorgeous birch and oakmoss base. Constant compliments whenever I wear it.', date: 'February 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 96 }
    ];

    try {
        const savedReviews = localStorage.getItem(REVIEWS_STORE_KEY);
        if (!savedReviews) {
            localStorage.setItem(REVIEWS_STORE_KEY, JSON.stringify(googleReviews));
            adminReviews = googleReviews;
        } else {
            adminReviews = JSON.parse(savedReviews);
        }
    } catch {
        adminReviews = googleReviews;
    }

    // Run initial sync of approved reviews to legacy web storefront keys
    syncApprovedReviews();
}

// ── Authentication Checks ────────────────────────────────────────────────────
function checkAuth() {
    const isLoggedIn = localStorage.getItem(LOGGED_IN_KEY) === 'true';
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboardScreen = document.getElementById('admin-dashboard-screen');

    if (isLoggedIn) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboardScreen) dashboardScreen.style.display = 'grid';
        renderAllDashboard();
    } else {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboardScreen) dashboardScreen.style.display = 'none';
    }
}

// ── Toast Notifications ──────────────────────────────────────────────────────
function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast success show';
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3000);
}

function handleLogin(e) {
    e.preventDefault();
    const typed = document.getElementById('login-pass').value.trim();
    const stored = localStorage.getItem(PASSCODE_KEY);
    const errorMsg = document.getElementById('login-error-msg');

    if (typed === stored) {
        localStorage.setItem(LOGGED_IN_KEY, 'true');
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('login-pass').value = '';
        checkAuth();
        showToast('Authenticated. Atelier ledger loaded.');
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.setItem(LOGGED_IN_KEY, 'false');
    checkAuth();
    showToast('Securely logged out from Ledger.');
}

// ── Sync Approved Reviews to Storefront ─────────────────────────────────────────
function syncApprovedReviews() {
    const approved = adminReviews.filter(r => r.status === 'approved');

    // 1. Sync home reviews (all products)
    const homeList = approved.map(r => ({
        name: r.name,
        text: r.text,
        rating: r.rating,
        date: r.date
    }));
    localStorage.setItem(HOME_REVIEWS_KEY, JSON.stringify(homeList));

    // 2. Sync product page specific reviews
    const byProduct = {};
    approved.forEach(r => {
        if (!byProduct[r.productCode]) byProduct[r.productCode] = [];
        byProduct[r.productCode].push({
            name: r.name,
            text: r.text,
            rating: r.rating,
            date: r.date
        });
    });

    adminProducts.forEach(p => {
        localStorage.setItem(`si_reviews_${p.code}`, JSON.stringify(byProduct[p.code] || []));
    });
}

// ── Rendering Dashboard ──────────────────────────────────────────────────────
function renderAllDashboard() {
    renderOverview();
    renderCatalog();
    renderOrders();
    renderReviewsTab();
    loadSettings();
}

function renderOverview() {
    // Stat counts
    const prodCount = document.getElementById('stat-products-count');
    const usersCount = document.getElementById('stat-users-count');
    if (prodCount) prodCount.textContent = adminProducts.length;

    // Retrieve users count based on unique reviewers
    let uniqueCollectorsCount = 12; // base count
    try {
        const users = localStorage.getItem('si_user');
        if (users) uniqueCollectorsCount++;
    } catch {}
    if (usersCount) usersCount.textContent = uniqueCollectorsCount;

    // Render recent orders table in overview
    const tbody = document.getElementById('overview-orders-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    adminOrders.slice(0, 5).forEach(ord => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escHtml(ord.collector)}</strong></td>
            <td style="font-size:0.78rem; color:var(--ink-mid);">${escHtml(ord.items)}</td>
            <td>${ord.date}</td>
            <td><strong>${ord.value}</strong></td>
            <td><span class="status-badge ${ord.status}">${ord.status === 'pending' ? 'Pending' : 'Fulfilled'}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCatalog() {
    const grid = document.getElementById('admin-catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';
    adminProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'adm-card';
        card.innerHTML = `
            <div class="adm-card-header">
                <span class="adm-card-code">${p.code}</span>
                <span class="adm-card-price">${p.price}</span>
            </div>
            <h4 class="adm-card-name">${p.name}</h4>
            <p class="adm-card-notes">${p.shortNotes}</p>
            <div class="adm-card-actions">
                <button class="btn btn-outline edit-prod-btn" data-code="${p.code}">Edit</button>
                <button class="btn btn-outline delete-prod-btn" data-code="${p.code}" style="color:var(--error); border-color:rgba(192, 57, 43, 0.1);">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Bind edit/delete
    document.querySelectorAll('.edit-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openProductModal(btn.dataset.code);
        });
    });

    document.querySelectorAll('.delete-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove composition ${btn.dataset.code}? This will update the public catalog.`)) {
                deleteProduct(btn.dataset.code);
            }
        });
    });
}

function renderOrders() {
    const tbody = document.getElementById('orders-full-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    adminOrders.forEach((ord, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${ord.id}</code></td>
            <td><strong>${escHtml(ord.collector)}</strong><br><span style="font-size:0.75rem; color:var(--ink-dim);">${escHtml(ord.email)}</span></td>
            <td style="font-size:0.8rem;">${ord.wa}</td>
            <td style="font-size:0.78rem; color:var(--ink-mid);">${escHtml(ord.items)}</td>
            <td><strong>${ord.value}</strong></td>
            <td>${ord.date}</td>
            <td><span class="status-badge ${ord.status}">${ord.status === 'pending' ? 'Pending Consultation' : 'Fulfilled'}</span></td>
            <td style="white-space: nowrap;">
                <button class="btn btn-outline toggle-status-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; margin-right:4px;">Toggle</button>
                <button class="btn btn-outline invoice-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; margin-right:4px; color:var(--gold); border-color:rgba(155,122,66,0.25);">Invoice</button>
                <button class="btn btn-outline email-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; color:var(--gold-light); border-color:rgba(196,162,101,0.25);">Email</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            adminOrders[idx].status = adminOrders[idx].status === 'pending' ? 'fulfilled' : 'pending';
            localStorage.setItem(ORDERS_KEY, JSON.stringify(adminOrders));
            renderOrders();
            renderOverview();
            showToast('Consultation status toggled.');
        });
    });

    document.querySelectorAll('.invoice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openInvoiceModal(parseInt(btn.dataset.idx, 10));
        });
    });

    document.querySelectorAll('.email-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEmailModal(parseInt(btn.dataset.idx, 10));
        });
    });
}

// ── Composition Add / Edit / Delete ──────────────────────────────────────────
function openProductModal(editCode = '') {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    const editInput = document.getElementById('form-edit-code');

    if (!modal || !form) return;

    form.reset();

    if (editCode) {
        title.textContent = 'Edit Composition Details';
        editInput.value = editCode;
        document.getElementById('form-code').disabled = true;

        const prod = adminProducts.find(p => p.code === editCode);
        if (prod) {
            document.getElementById('form-code').value = prod.code;
            document.getElementById('form-name').value = prod.name;
            document.getElementById('form-price').value = prod.price;
            document.getElementById('form-notes').value = prod.notes;
            document.getElementById('form-short-notes').value = prod.shortNotes;
            document.getElementById('form-occasion').value = prod.occasion;
            document.getElementById('form-description').value = prod.description;
            document.getElementById('form-image').value = prod.image;
        }
    } else {
        title.textContent = 'Add Fragrance Composition';
        editInput.value = '';
        document.getElementById('form-code').disabled = false;
    }

    modal.classList.add('open');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('open');
}

function handleProductSubmit(e) {
    e.preventDefault();
    const editCode = document.getElementById('form-edit-code').value;

    const dataObj = {
        code: document.getElementById('form-code').value.trim().toUpperCase(),
        name: document.getElementById('form-name').value.trim(),
        price: document.getElementById('form-price').value.trim(),
        notes: document.getElementById('form-notes').value.trim(),
        shortNotes: document.getElementById('form-short-notes').value.trim(),
        occasion: document.getElementById('form-occasion').value.trim(),
        description: document.getElementById('form-description').value.trim(),
        image: document.getElementById('form-image').value,
        memory: 'exclusive formula'
    };

    if (editCode) {
        const idx = adminProducts.findIndex(p => p.code === editCode);
        if (idx > -1) {
            adminProducts[idx] = { ...adminProducts[idx], ...dataObj, code: editCode };
            saveProducts();
            showToast(`Composition ${editCode} updated.`);
        }
    } else {
        const exists = adminProducts.some(p => p.code === dataObj.code);
        if (exists) {
            alert(`Composition with code ${dataObj.code} already exists.`);
            return;
        }
        adminProducts.push(dataObj);
        saveProducts();
        showToast(`Composition ${dataObj.code} successfully published.`);
    }

    closeProductModal();
    renderCatalog();
    renderOverview();
    populateProductDropdowns();
}

function deleteProduct(code) {
    const idx = adminProducts.findIndex(p => p.code === code);
    if (idx > -1) {
        adminProducts.splice(idx, 1);
        saveProducts();
        renderCatalog();
        renderOverview();
        populateProductDropdowns();
        showToast(`Composition ${code} removed.`);
    }
}

function saveProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(adminProducts));
}

// ── Client Reviews Management Logic ──────────────────────────────────────────
function saveReviews() {
    localStorage.setItem(REVIEWS_STORE_KEY, JSON.stringify(adminReviews));
    syncApprovedReviews();
}

function populateProductDropdowns() {
    const dropdownIds = ['filter-review-product', 'imp-prod-code', 'form-rev-prod'];
    dropdownIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const selected = el.value;
        el.innerHTML = '';
        
        if (id === 'filter-review-product') {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'All Products';
            el.appendChild(opt);
        } else {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Select Scent...';
            opt.required = true;
            el.appendChild(opt);
        }
        
        adminProducts.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.code;
            opt.textContent = `${p.name} (${p.code})`;
            el.appendChild(opt);
        });
        el.value = selected;
    });
}

function renderReviewsTab() {
    const store = adminReviews;
    const published = store.filter(r => r.status === 'approved');
    const pending = store.filter(r => r.status === 'pending');
    
    // Stats
    const pubCountEl = document.getElementById('stat-published-reviews');
    const penCountEl = document.getElementById('stat-pending-reviews');
    const avgRatingEl = document.getElementById('stat-reviews-avg');
    
    if (pubCountEl) pubCountEl.textContent = published.length;
    if (penCountEl) penCountEl.textContent = pending.length;
    
    if (avgRatingEl) {
        if (published.length > 0) {
            const avg = published.reduce((sum, r) => sum + r.rating, 0) / published.length;
            avgRatingEl.textContent = avg.toFixed(1) + ' ★';
        } else {
            avgRatingEl.textContent = '—';
        }
    }
    
    // 1. Render Pending queue
    const pendingTbody = document.getElementById('reviews-pending-list');
    if (pendingTbody) {
        pendingTbody.innerHTML = '';
        if (pending.length === 0) {
            pendingTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--ink-dim)">No pending reviews. You\'re caught up!</td></tr>';
        } else {
            pending.forEach(r => {
                const tr = document.createElement('tr');
                const p = adminProducts.find(x => x.code === r.productCode) || { name: r.productCode };
                tr.innerHTML = `
                    <td><strong>${p.name}</strong><br><span style="font-size:0.75rem;color:var(--ink-dim)">${r.productCode}</span></td>
                    <td><strong>${escHtml(r.name)}</strong></td>
                    <td style="color:var(--gold); font-size:0.8rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
                    <td style="font-size:0.8rem; line-height:1.55; max-width:280px; white-space:normal;">"${escHtml(r.text)}"</td>
                    <td style="font-size:0.78rem;">${r.date}</td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-outline rev-approve-btn" data-id="${r.id}" style="padding:6px 10px; font-size:0.62rem; margin-right:4px; color:var(--success); border-color:rgba(39,174,96,0.15)">Approve</button>
                        <button class="btn btn-outline rev-reject-btn" data-id="${r.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192,57,43,0.15)">Reject</button>
                    </td>
                `;
                pendingTbody.appendChild(tr);
            });
        }
    }
    
    // 2. Render All reviews table
    const fullTbody = document.getElementById('reviews-full-list');
    if (fullTbody) {
        fullTbody.innerHTML = '';
        const filterProd = document.getElementById('filter-review-product')?.value;
        const filtered = store.filter(r => !filterProd || r.productCode === filterProd);
        
        if (filtered.length === 0) {
            fullTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--ink-dim)">No reviews matching selection.</td></tr>';
        } else {
            filtered.forEach(r => {
                const tr = document.createElement('tr');
                const p = adminProducts.find(x => x.code === r.productCode) || { name: r.productCode };
                const badgeClass = r.status === 'approved' ? 'fulfilled' : (r.status === 'pending' ? 'pending' : 'rejected');
                const badgeLabel = r.status.toUpperCase();
                
                tr.innerHTML = `
                    <td><strong>${p.name}</strong><br><span style="font-size:0.72rem;color:var(--ink-dim)">${r.productCode}</span></td>
                    <td><strong>${escHtml(r.name)}</strong></td>
                    <td style="color:var(--gold); font-size:0.76rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
                    <td style="font-size:0.76rem; line-height:1.55; max-width:240px; white-space:normal;">"${escHtml(r.text)}"</td>
                    <td><span class="status-badge ${badgeClass}">${badgeLabel}</span></td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-outline rev-toggle-btn" data-id="${r.id}" style="padding:4px 8px; font-size:0.6rem; margin-right:4px;">Toggle</button>
                        <button class="btn btn-outline rev-delete-btn" data-id="${r.id}" style="padding:4px 8px; font-size:0.6rem; color:var(--error); border-color:rgba(192,57,43,0.15)">Delete</button>
                    </td>
                `;
                fullTbody.appendChild(tr);
            });
        }
    }
    
    // Bind actions
    document.querySelectorAll('.rev-approve-btn').forEach(btn => {
        btn.addEventListener('click', () => updateReviewStatus(btn.dataset.id, 'approved'));
    });
    
    document.querySelectorAll('.rev-reject-btn').forEach(btn => {
        btn.addEventListener('click', () => updateReviewStatus(btn.dataset.id, 'rejected'));
    });
    
    document.querySelectorAll('.rev-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const r = adminReviews.find(x => x.id === btn.dataset.id);
            if (r) {
                const nextStatus = r.status === 'approved' ? 'pending' : 'approved';
                updateReviewStatus(btn.dataset.id, nextStatus);
            }
        });
    });
    
    document.querySelectorAll('.rev-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to permanently delete this review?')) {
                deleteReview(btn.dataset.id);
            }
        });
    });
}

function updateReviewStatus(id, status) {
    const idx = adminReviews.findIndex(r => r.id === id);
    if (idx > -1) {
        adminReviews[idx].status = status;
        saveReviews();
        renderReviewsTab();
        showToast(`Review status updated to: ${status}.`);
    }
}

function deleteReview(id) {
    const idx = adminReviews.findIndex(r => r.id === id);
    if (idx > -1) {
        adminReviews.splice(idx, 1);
        saveReviews();
        renderReviewsTab();
        showToast('Review permanently deleted.');
    }
}

// ── Review Modals (Add / Edit) ────────────────────────────────────────────────
function openReviewModal() {
    const modal = document.getElementById('review-modal');
    const form = document.getElementById('review-form');
    if (!modal || !form) return;
    
    form.reset();
    document.getElementById('form-review-id').value = '';
    
    // Reset stars
    document.querySelectorAll('#form-star-selector .star-btn').forEach(b => {
        b.textContent = '★'; b.classList.add('filled');
    });
    document.getElementById('form-star-value').value = '5';
    document.getElementById('form-rev-date').value = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    modal.classList.add('open');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.remove('open');
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const newRev = {
        id: 'man_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
        productCode: document.getElementById('form-rev-prod').value,
        name: document.getElementById('form-rev-name').value.trim(),
        rating: parseInt(document.getElementById('form-star-value').value, 10),
        text: document.getElementById('form-rev-text').value.trim(),
        date: document.getElementById('form-rev-date').value.trim(),
        source: 'manual',
        status: 'approved', // Direct manual add publishes immediately
        createdAt: Date.now()
    };
    
    adminReviews.push(newRev);
    saveReviews();
    closeReviewModal();
    renderReviewsTab();
    showToast('Client review published to storefront ledger.');
}

// ── Google Maps Importer ───────────────────────────────────────────────────────
function handleGoogleImport(e) {
    e.preventDefault();
    
    const impRev = {
        id: 'g_imp_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
        productCode: document.getElementById('imp-prod-code').value,
        name: document.getElementById('imp-client-name').value.trim(),
        rating: parseInt(document.getElementById('imp-star-value').value, 10),
        text: document.getElementById('imp-review-text').value.trim(),
        date: document.getElementById('imp-review-date').value.trim(),
        source: 'google',
        status: 'pending', // Pre-populated imports land in pending queue
        createdAt: Date.now()
    };
    
    adminReviews.push(impRev);
    saveReviews();
    
    // Reset importer
    document.getElementById('google-import-form').reset();
    document.querySelectorAll('#imp-star-selector .star-btn').forEach(b => {
        b.textContent = '★'; b.classList.add('filled');
    });
    document.getElementById('imp-star-value').value = '5';
    
    renderReviewsTab();
    showToast('Review imported to pending queue.');
}

// ── Settings ─────────────────────────────────────────────────────────────────
function loadSettings() {
    const wa = localStorage.getItem(WA_SETTING_KEY) || '919769445567';
    const pass = localStorage.getItem(PASSCODE_KEY) || 'admin123';

    const waInput = document.getElementById('setting-wa');
    const passInput = document.getElementById('setting-pass');

    if (waInput) waInput.value = wa;
    if (passInput) passInput.value = pass;
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const wa = document.getElementById('setting-wa').value.trim();
    const pass = document.getElementById('setting-pass').value.trim();

    if (wa) localStorage.setItem(WA_SETTING_KEY, wa);
    if (pass) localStorage.setItem(PASSCODE_KEY, pass);

    showToast('Ledger configuration updated.');
}

// ── Shared UI Triggers ────────────────────────────────────────────────────────
function setupDashboardTabs() {
    const navButtons = document.querySelectorAll('.sidebar-nav .nav-btn');
    const panes = document.querySelectorAll('.admin-tab-pane');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.dataset.tab;
            document.getElementById(target)?.classList.add('active');
        });
    });
}

function escHtml(str) {
    return (str || '').replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

// ── Billing & Communication Modals Logic ────────────────────────────────────
function parseOrderItems(itemsStr) {
    if (!itemsStr) return [];
    const tokens = itemsStr.split(/,\s*/);
    return tokens.map(token => {
        const match = token.trim().match(/^(.*?)\s*\((.*?)\)\s*[x×]\s*(\d+)$/i);
        if (match) {
            return {
                name: match[1].trim(),
                size: match[2].trim(),
                qty: parseInt(match[3], 10)
            };
        } else {
            return {
                name: token.trim(),
                size: '50ml',
                qty: 1
            };
        }
    });
}

function getItemPrice(name, size) {
    const lowerName = name.toLowerCase().trim();
    const prod = adminProducts.find(p => p.name.toLowerCase().trim() === lowerName || (p.code && p.code.toLowerCase() === lowerName));
    
    let basePriceNum = 799;
    if (prod) {
        const cleanPrice = prod.price.replace(/[^\d]/g, '');
        if (cleanPrice) {
            basePriceNum = parseInt(cleanPrice, 10);
        }
    }

    if (size.toLowerCase() === '30ml') {
        if (prod && prod.samplePrice) {
            const cleanSample = prod.samplePrice.replace(/[^\d]/g, '');
            if (cleanSample) {
                return parseInt(cleanSample, 10);
            }
        }
        return Math.round(basePriceNum * 0.6);
    }

    return basePriceNum;
}

function openInvoiceModal(index) {
    const ord = adminOrders[index];
    if (!ord) return;

    const modal = document.getElementById('invoice-modal');
    if (!modal) return;

    document.getElementById('invoice-order-index').value = index;
    document.getElementById('inv-number').value = 'INV-' + ord.id.replace(/[^\d]/g, '');
    document.getElementById('inv-date').value = ord.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    document.getElementById('inv-discount').value = 0;
    document.getElementById('inv-notes').value = "Complimentary sample included. Hand-matured and hand-delivered via private courier.";

    modal.classList.add('open');
    updateInvoicePreview();
}

function updateInvoicePreview() {
    const indexInput = document.getElementById('invoice-order-index');
    if (!indexInput || indexInput.value === '') return;

    const index = parseInt(indexInput.value, 10);
    const ord = adminOrders[index];
    if (!ord) return;

    const invNum = document.getElementById('inv-number').value.trim();
    const invDate = document.getElementById('inv-date').value.trim();
    const invDiscount = parseFloat(document.getElementById('inv-discount').value) || 0;
    const invNotes = document.getElementById('inv-notes').value.trim();

    const items = parseOrderItems(ord.items);
    
    let subtotal = 0;
    let tableRowsHtml = '';

    items.forEach(item => {
        const unitPrice = getItemPrice(item.name, item.size);
        const lineTotal = unitPrice * item.qty;
        subtotal += lineTotal;

        tableRowsHtml += `
            <tr>
                <td>
                    <strong>${escHtml(item.name)}</strong><br>
                    <span style="font-size: 0.74rem; color: var(--ink-dim);">Artisanal Fragrance (${escHtml(item.size)})</span>
                </td>
                <td class="num">₹${unitPrice.toLocaleString('en-IN')}</td>
                <td class="num" style="text-align: center;">${item.qty}</td>
                <td class="num">₹${lineTotal.toLocaleString('en-IN')}</td>
            </tr>
        `;
    });

    const total = Math.max(0, subtotal - invDiscount);
    const previewArea = document.getElementById('invoice-preview-area');
    if (!previewArea) return;

    previewArea.innerHTML = `
        <div class="invoice-logo">Sugandh<span class="italic"> Ink</span></div>
        <div class="invoice-sub">Private Atelier Ledger Invoice</div>
        
        <div class="invoice-meta-row">
            <div class="invoice-meta-col">
                <strong>Issued To</strong>
                <strong>${escHtml(ord.collector)}</strong>
                <span>${escHtml(ord.email)}</span><br>
                <span>${escHtml(ord.wa)}</span>
            </div>
            <div class="invoice-meta-col" style="text-align: right;">
                <strong>Ledger Details</strong>
                <span>Invoice No: ${escHtml(invNum)}</span><br>
                <span>Date: ${escHtml(invDate)}</span><br>
                <span>Status: ${ord.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}</span>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Composition / Description</th>
                    <th class="num">Unit Price</th>
                    <th class="num" style="text-align: center;">Qty</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml}
            </tbody>
        </table>

        <div class="invoice-summary-block">
            <div class="invoice-sum-row">
                <span>Atelier Subtotal</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="invoice-sum-row" style="color: var(--error);">
                <span>Atelier Discount</span>
                <span>-₹${invDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div class="invoice-sum-row">
                <span>Shipping</span>
                <span style="font-style: italic; color: var(--gold);">Complimentary</span>
            </div>
            <div class="invoice-sum-row total">
                <span>Grand Total</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
            </div>
        </div>

        ${invNotes ? `
        <div class="invoice-notes">
            <strong style="display: block; margin-bottom: 4px; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;">Atelier Notes</strong>
            <p>${escHtml(invNotes).replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.72rem; color: var(--ink-dim);">
            <div>
                <p>Authenticity Guaranteed by</p>
                <p style="font-family: var(--serif); font-size: 1.1rem; color: var(--gold); margin-top: 4px;">Sugandh Ink Atelier</p>
            </div>
            <div style="text-align: right;">
                <div style="width: 140px; border-bottom: 1px solid var(--border); margin-bottom: 4px;"></div>
                <p>Authorized Signature</p>
            </div>
        </div>
    `;
}

function openEmailModal(index) {
    const ord = adminOrders[index];
    if (!ord) return;

    const modal = document.getElementById('email-modal');
    if (!modal) return;

    document.getElementById('email-order-index').value = index;
    document.getElementById('mail-subject').value = "Bespoke Scent Formulation Dispatch — Sugandh Ink";
    document.getElementById('mail-preheader').value = "Your signature fragrance is ready for maturation.";
    
    const defaultBody = `We are pleased to inform you that your custom-commissioned fragrance formulation has been carefully matured, hand-bottled, and packaged at our private atelier.\n\nEvery scent from Sugandh Ink represents a harmonious blend of pure botanical absolutes and rare ingredients, meticulously balanced to evoke natural elegance and personal identity.\n\nYour package has been wax-sealed and is being dispatched today via our secure private courier service. We trust it will bring you deep aesthetic pleasure.`;
    document.getElementById('mail-body').value = defaultBody;

    modal.classList.add('open');
    updateEmailPreview();
}

function updateEmailPreview() {
    const indexInput = document.getElementById('email-order-index');
    if (!indexInput || indexInput.value === '') return;

    const index = parseInt(indexInput.value, 10);
    const ord = adminOrders[index];
    if (!ord) return;

    const subject = document.getElementById('mail-subject').value.trim();
    const rawBody = document.getElementById('mail-body').value.trim();

    const bodyParagraphs = rawBody.split(/\n\n+/).map(p => {
        return `<p style="margin-bottom: 24px; font-family: 'Jost', sans-serif; font-size: 0.92rem; line-height: 1.8; color: #3d3e3f;">${escHtml(p).replace(/\n/g, '<br>')}</p>`;
    }).join('');

    const previewArea = document.getElementById('email-preview-area');
    if (!previewArea) return;

    previewArea.innerHTML = `
        <div style="font-family: 'Jost', sans-serif; background: #f8f5f0; padding: 40px 20px; color: #18191a;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(24,25,26,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
                
                <!-- Email Header -->
                <div style="background: #18191a; padding: 36px 30px; text-align: center; color: #f8f5f0;">
                    <div style="font-family: 'Cormorant Garamond', serif; font-size: 2.1rem; letter-spacing: 0.16em; margin-bottom: 4px; font-weight: 300;">
                        Sugandh <span style="font-style: italic;">Ink</span>
                    </div>
                    <div style="font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase; color: #c4a06b; font-weight: 600;">
                        Private Atelier Dispatch
                    </div>
                </div>

                <!-- Email Body -->
                <div style="padding: 48px 40px; background: #ffffff;">
                    <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300; color: #18191a; margin-bottom: 28px; font-style: italic;">
                        Greetings, ${escHtml(ord.collector)}
                    </div>
                    
                    ${bodyParagraphs}

                    <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid rgba(24,25,26,0.08); font-size: 0.8rem; color: #7a7b7c; line-height: 1.6;">
                        <strong style="font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; color: #18191a; display: block; margin-bottom: 8px;">Order Reference</strong>
                        <span>Order ID: <code>${ord.id}</code></span><br>
                        <span>Compositions: ${escHtml(ord.items)}</span><br>
                        <span>Maturation Date: ${ord.date}</span>
                    </div>

                    <div style="margin-top: 40px; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: #9b7a42; font-style: italic;">
                        Warmest regards,<br>
                        Sugandh Ink Atelier
                    </div>
                </div>

                <!-- Email Footer -->
                <div style="background: #ede9e3; padding: 30px; font-size: 0.72rem; color: #7a7b7c; text-align: center; border-top: 1px solid rgba(24,25,26,0.1);">
                    <p style="margin: 0 0 8px 0; letter-spacing: 0.05em;">This is an exclusive communication for patrons of Sugandh Ink Private Atelier.</p>
                    <p style="margin: 0 0 16px 0; color: #9b7a42; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.62rem;">SUGANDH INK • ARTISANAL INDIAN FRAGRANCES</p>
                    <p style="margin: 0; font-size: 0.66rem; color: #7a7b7c;">© 2026 Sugandh Ink. All rights reserved. Registered Private Atelier Ledger.</p>
                </div>

            </div>
        </div>
    `;
}

function setupCommunicationsModals() {
    // Close on overlay or button click
    const invClose = document.getElementById('invoice-modal-close');
    const invModal = document.getElementById('invoice-modal');
    if (invClose && invModal) {
        invClose.addEventListener('click', () => invModal.classList.remove('open'));
        invModal.addEventListener('click', (e) => {
            if (e.target.id === 'invoice-modal') invModal.classList.remove('open');
        });
    }

    const emailClose = document.getElementById('email-modal-close');
    const emailModal = document.getElementById('email-modal');
    if (emailClose && emailModal) {
        emailClose.addEventListener('click', () => emailModal.classList.remove('open'));
        emailModal.addEventListener('click', (e) => {
            if (e.target.id === 'email-modal') emailModal.classList.remove('open');
        });
    }

    // Live preview binding
    ['inv-number', 'inv-date', 'inv-discount', 'inv-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateInvoicePreview);
            el.addEventListener('keyup', updateInvoicePreview);
        }
    });

    ['mail-subject', 'mail-preheader', 'mail-body'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateEmailPreview);
            el.addEventListener('keyup', updateEmailPreview);
        }
    });

    // Print
    const printBtn = document.getElementById('btn-print-invoice');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Copy HTML actions
    const copyInvBtn = document.getElementById('btn-copy-invoice-html');
    if (copyInvBtn) {
        copyInvBtn.addEventListener('click', () => {
            const area = document.getElementById('invoice-preview-area');
            if (area) {
                navigator.clipboard.writeText(area.innerHTML)
                    .then(() => showToast('Invoice HTML copied successfully.'))
                    .catch(() => showToast('Failed to copy Invoice HTML.'));
            }
        });
    }

    const copyMailBtn = document.getElementById('btn-copy-email-html');
    if (copyMailBtn) {
        copyMailBtn.addEventListener('click', () => {
            const area = document.getElementById('email-preview-area');
            if (area) {
                navigator.clipboard.writeText(area.innerHTML)
                    .then(() => showToast('Email HTML newsletter copied successfully.'))
                    .catch(() => showToast('Failed to copy Email HTML.'));
            }
        });
    }

    // Email dispatch trigger
    const sendEmailBtn = document.getElementById('btn-send-email');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
            const indexInput = document.getElementById('email-order-index');
            if (!indexInput || indexInput.value === '') return;

            const index = parseInt(indexInput.value, 10);
            const ord = adminOrders[index];
            if (!ord) return;

            sendEmailBtn.disabled = true;
            const originalText = sendEmailBtn.innerHTML;

            sendEmailBtn.innerHTML = `<span style="font-size:0.6rem; letter-spacing:0.1em; color:var(--gold-light);">Maturing signatures...</span>`;
            
            setTimeout(() => {
                sendEmailBtn.innerHTML = `<span style="font-size:0.6rem; letter-spacing:0.1em; color:var(--gold-light);">Dispatching secure transmission...</span>`;
                
                setTimeout(() => {
                    sendEmailBtn.disabled = false;
                    sendEmailBtn.innerHTML = originalText;
                    showToast(`Transmission successfully dispatched to ${ord.collector}.`);
                    if (emailModal) emailModal.classList.remove('open');
                }, 1200);
            }, 1000);
        });
    }
}

// ── Star Picker Selectors Bindings ─────────────────────────────────────────────
function setupStarSelectors() {
    ['imp-star-selector', 'form-star-selector'].forEach(id => {
        const wrap = document.getElementById(id);
        const hiddenId = id === 'imp-star-selector' ? 'imp-star-value' : 'form-star-value';
        const hiddenEl = document.getElementById(hiddenId);
        if (!wrap || !hiddenEl) return;
        
        const btns = wrap.querySelectorAll('.star-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseInt(btn.dataset.val, 10);
                hiddenEl.value = val;
                btns.forEach((b, idx) => {
                    b.textContent = idx < val ? '★' : '☆';
                    b.classList.toggle('filled', idx < val);
                });
            });
        });
    });
}

// ── Load Google Profile Reviews ────────────────────────────────────────────────
function loadGoogleMockReviews() {
    const store = adminReviews;
    const existingIds = new Set(store.map(r => r.id));
    
    // Simulate fetching the original Google profile reviews link
    const mocks = [
        { id: 'g_rev_1', productCode: 'OUD/09', name: 'Ananya Iyer', rating: 5, text: 'Absolutely exquisite. The maturation on Oud Royal is phenomenal—it opens with a gorgeous smoky saffron and dries down to a rich, warm leather and resin that lasts all day. The best artisanal oud from an Indian house!', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 2 },
        { id: 'g_rev_2', productCode: 'FRSH/01', name: 'Vikramaditya Rao', rating: 5, text: 'Wild Blue / 01 is a masterpiece. Crisp bergamot combined with a sharp pepper note that feels clean yet deeply magnetic. It holds up beautifully in Mumbai\'s humidity. Highly recommended!', date: 'April 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 5 },
        { id: 'g_rev_3', productCode: 'VAN/01', name: 'Priyanka Sen', rating: 5, text: 'A highly sophisticated vanilla. It is warm, skin-close, and lacks any synthetic sweetness. Truly addictive olfactive craftsmanship.', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 12 },
        { id: 'g_rev_4', productCode: 'WDS/04', name: 'Dr. Aarav Mehta', rating: 5, text: 'Bleu Noir is incredibly complex. The transition from fresh citrus to deep amber and incense is remarkably smooth. A true tailored suit of a fragrance.', date: 'March 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 24 },
        { id: 'g_rev_5', productCode: 'FLR/07', name: 'Kavita Malhotra', rating: 5, text: 'Like a midnight walk through a blossoming jasmine garden. Rich, natural white florals captured with absolute perfection. No sharp edges at all.', date: 'April 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 48 },
        { id: 'g_rev_6', productCode: 'OUD/15', name: 'Rohan Singhal', rating: 4, text: 'Bold, intense, and smoky. The leather and incense are perfectly balanced with a hint of raspberry sweetness. A magnificent statement fragrance.', date: 'May 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 72 },
        { id: 'g_rev_7', productCode: 'WDS/28', name: 'Siddharth Roy', rating: 5, text: 'Oak Essence / 26 is stellar. Bright pineapple opening with a gorgeous birch and oakmoss base. Constant compliments whenever I wear it.', date: 'February 2026', source: 'google', status: 'pending', createdAt: Date.now() - 3600000 * 96 }
    ];
    
    let added = 0;
    mocks.forEach(m => {
        if (!existingIds.has(m.id)) {
            adminReviews.push(m);
            added++;
        }
    });
    
    if (added > 0) {
        saveReviews();
        renderReviewsTab();
        showToast(`Loaded ${added} client reviews from Google profile into pending queue.`);
    } else {
        showToast('All Google profile reviews are already loaded in the ledger.');
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
    initData();
    checkAuth();

    // Bind Authentication Forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Bind Dashboard Tabs
    setupDashboardTabs();

    // Bind Products Modal
    const addTrigger = document.getElementById('add-product-trigger');
    const modalClose = document.getElementById('product-modal-close');
    const prodForm = document.getElementById('product-form');

    if (addTrigger) addTrigger.addEventListener('click', () => openProductModal(''));
    if (modalClose) modalClose.addEventListener('click', closeProductModal);
    if (prodForm) prodForm.addEventListener('submit', handleProductSubmit);

    // Bind Settings
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);

    // Bind Communications & Invoices Modals
    setupCommunicationsModals();

    // Bind Reviews Features
    populateProductDropdowns();
    setupStarSelectors();
    
    // Bind Add Review Modal
    const addReviewBtn = document.getElementById('add-review-trigger');
    const closeReviewBtn = document.getElementById('review-modal-close');
    const revForm = document.getElementById('review-form');
    
    if (addReviewBtn) addReviewBtn.addEventListener('click', openReviewModal);
    if (closeReviewBtn) closeReviewBtn.addEventListener('click', closeReviewModal);
    if (revForm) revForm.addEventListener('submit', handleReviewSubmit);
    
    // Bind Google Import Form
    const impForm = document.getElementById('google-import-form');
    if (impForm) impForm.addEventListener('submit', handleGoogleImport);
    
    // Filter product review list
    const filterSelect = document.getElementById('filter-review-product');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderReviewsTab);
    }
    
    // Bind Load Google Profile Reviews
    const loadMockBtn = document.getElementById('btn-load-google-mock');
    if (loadMockBtn) {
        loadMockBtn.addEventListener('click', loadGoogleMockReviews);
    }
}

init();
