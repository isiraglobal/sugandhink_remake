/**
 * admin.js — Admin panel logic, credentials checks, product management, and consultation lists
 */

import { products } from './products.js';

// ── State and Constants ──────────────────────────────────────────────────────
const PASSCODE_KEY = 'si_admin_passcode';
const LOGGED_IN_KEY = 'si_admin_logged_in';
const PRODUCTS_KEY = 'si_products';
const ORDERS_KEY = 'si_orders';
const WA_SETTING_KEY = 'si_wa_number';

let adminProducts = [];
let adminOrders = [];

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

    // 3. Products
    adminProducts = [...products];

    // 4. Mock Orders
    const mockOrders = [
        { id: 'ORD-9824', collector: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', wa: '+91 98200 12345', items: 'Wild Blue (50ml) × 2', value: '₹1,598', date: '25/05/2026', status: 'pending' },
        { id: 'ORD-9823', collector: 'Ishita Sharma', email: 'ishita.s@yahoo.com', wa: '+91 97690 98765', items: 'Bleu Noir (50ml) × 1', value: '₹799', date: '22/05/2026', status: 'fulfilled' },
        { id: 'ORD-9822', collector: 'Rohan Singhal', email: 'rohan.singhal@outlook.com', wa: '+91 98110 54321', items: 'Eternity Men (50ml) × 1', value: '₹799', date: '20/05/2026', status: 'pending' }
    ];

    try {
        const savedOrders = localStorage.getItem(ORDERS_KEY);
        if (!savedOrders || savedOrders.includes('Vanilla Luxe')) {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
            adminOrders = mockOrders;
        } else {
            adminOrders = JSON.parse(savedOrders);
        }
    } catch {
        adminOrders = mockOrders;
    }
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
    t.className = 'toast success show'; // Always add show directly for admin since transitions are light
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

// ── Rendering Dashboard ──────────────────────────────────────────────────────
function renderAllDashboard() {
    renderOverview();
    renderCatalog();
    renderOrders();
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
            <h4 class="adm-card-name">${p.originalName}</h4>
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
            <td>
                <button class="btn btn-outline toggle-status-btn" data-idx="${index}" style="padding:6px 12px; font-size:0.65rem;">Toggle Status</button>
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
}

// ── Product Add / Edit / Delete ──────────────────────────────────────────────
function openProductModal(editCode = '') {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    const editInput = document.getElementById('form-edit-code');

    if (!modal || !form) return;

    form.reset();

    if (editCode) {
        title.textContent = 'Edit Composition details';
        editInput.value = editCode;
        document.getElementById('form-code').disabled = true;

        const prod = adminProducts.find(p => p.code === editCode);
        if (prod) {
            document.getElementById('form-code').value = prod.code;
            document.getElementById('form-original-name').value = prod.originalName;
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
        originalName: document.getElementById('form-original-name').value.trim(),
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
        // Edit Mode
        const idx = adminProducts.findIndex(p => p.code === editCode);
        if (idx > -1) {
            adminProducts[idx] = { ...adminProducts[idx], ...dataObj, code: editCode }; // retain original code
            saveProducts();
            showToast(`Composition ${editCode} updated.`);
        }
    } else {
        // Add Mode
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
}

function deleteProduct(code) {
    const idx = adminProducts.findIndex(p => p.code === code);
    if (idx > -1) {
        adminProducts.splice(idx, 1);
        saveProducts();
        renderCatalog();
        renderOverview();
        showToast(`Composition ${code} removed.`);
    }
}

function saveProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(adminProducts));
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
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
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
}

init();
