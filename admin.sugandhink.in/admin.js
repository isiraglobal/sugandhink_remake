/**
 * admin.js - Live Admin panel with Email templates, Invoices generation, Customer Management, Announcements
 * Integrates with Node.js backend API and Supabase Auth
 */

// ── API Configuration ────────────────────────────────────────────────────────
const API_BASE_URL = (window.location && window.location.origin && window.location.origin !== 'null')
    ? `${window.location.origin}/api`
    : 'http://localhost:3001/api';

// ── State and Constants ──────────────────────────────────────────────────────
const PASSCODE_KEY = 'si_admin_passcode';
const LOGGED_IN_KEY = 'si_admin_logged_in';
const PRODUCTS_KEY = 'si_products';
const ORDERS_KEY = 'si_orders';
const CUSTOMERS_KEY = 'si_customers';
const INVOICES_KEY = 'si_invoices';
const ANNOUNCEMENTS_KEY = 'si_announcements';
const WA_SETTING_KEY = 'si_wa_number';
const REVIEWS_STORE_KEY = 'si_reviews_v2';
const HOME_REVIEWS_KEY = 'si_reviews';

let adminProducts = [];
let adminOrders = [];
let adminReviews = [];
let adminCustomers = [];
let adminInvoices = [];
let adminAnnouncements = [];
let adminSubscribers = [];
let adminBackInStock = [];
let adminCoupons = [];

let supabaseClient = null;
let currentSession = null;
let adminEmail = 'lakshit@sugandhink.in'; // Default fallback
let adminPasscode = 'admin123';

// Initialize Supabase Client
async function initSupabase() {
    try {
        const configUrl = `${API_BASE_URL}/config`;
        const res = await fetch(configUrl);
        if (!res.ok) throw new Error('API config failed');
        const config = await res.json();

        adminEmail = config.adminEmail || adminEmail;
        if (config.adminPasscode) {
            adminPasscode = config.adminPasscode;
        } else if (localStorage.getItem(PASSCODE_KEY)) {
            adminPasscode = localStorage.getItem(PASSCODE_KEY);
        } else {
            adminPasscode = 'admin123';
        }
        localStorage.setItem(PASSCODE_KEY, adminPasscode);

        if (config.supabaseUrl && config.supabaseAnonKey && window.supabase) {
            supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
                auth: {
                    storage: window.sessionStorage,
                    autoRefreshToken: true,
                    persistSession: true
                }
            });
        }
    } catch (err) {
        console.error('Supabase init error:', err);
    }
}

// ── Backend Fetchers ─────────────────────────────────────────────────────────
async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();
        if (data.success) {
            adminProducts = data.products;
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(adminProducts));
        }
    } catch (err) {
        console.error('Fetch products error:', err);
        // Fallback to local storage
        const saved = localStorage.getItem(PRODUCTS_KEY);
        if (saved) adminProducts = JSON.parse(saved);
    }
}

async function fetchOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        const data = await res.json();
        if (data.success) {
            adminOrders = data.orders;
            localStorage.setItem(ORDERS_KEY, JSON.stringify(adminOrders));
        }
    } catch (err) {
        console.error('Fetch orders error:', err);
        const saved = localStorage.getItem(ORDERS_KEY);
        if (saved) adminOrders = JSON.parse(saved);
    }
}

async function fetchReviews() {
    try {
        const res = await fetch(`${API_BASE_URL}/reviews`);
        const data = await res.json();
        if (data.success) {
            adminReviews = data.reviews;
            localStorage.setItem(REVIEWS_STORE_KEY, JSON.stringify(adminReviews));
        }
    } catch (err) {
        console.error('Fetch reviews error:', err);
        const saved = localStorage.getItem(REVIEWS_STORE_KEY);
        if (saved) adminReviews = JSON.parse(saved);
    }
}

async function fetchCustomers() {
    try {
        const res = await fetch(`${API_BASE_URL}/customers`);
        const data = await res.json();
        if (data.success) {
            adminCustomers = data.customers;
            localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(adminCustomers));
        }
    } catch (err) {
        console.error('Fetch customers error:', err);
        const saved = localStorage.getItem(CUSTOMERS_KEY);
        if (saved) adminCustomers = JSON.parse(saved);
    }
}

async function fetchInvoices() {
    try {
        const res = await fetch(`${API_BASE_URL}/invoices`);
        const data = await res.json();
        if (data.success) {
            adminInvoices = data.invoices;
            localStorage.setItem(INVOICES_KEY, JSON.stringify(adminInvoices));
        }
    } catch (err) {
        console.error('Fetch invoices error:', err);
        const saved = localStorage.getItem(INVOICES_KEY);
        if (saved) adminInvoices = JSON.parse(saved);
    }
}

async function fetchAnnouncements() {
    try {
        const res = await fetch(`${API_BASE_URL}/announcements`);
        const data = await res.json();
        if (data.success) {
            adminAnnouncements = data.announcements;
            localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(adminAnnouncements));
        }
    } catch (err) {
        console.error('Fetch announcements error:', err);
        const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
        if (saved) adminAnnouncements = JSON.parse(saved);
    }
}

// ── NEW DATA FETCHERS ────────────────────────────────────────────────────────

async function fetchSubscribers() {
    try {
        const res = await fetch(`${API_BASE_URL}/newsletter/subscribers`);
        const data = await res.json();
        if (data.success) adminSubscribers = data.subscribers;
    } catch (err) {
        console.error('Fetch subscribers error:', err);
    }
}

async function fetchBackInStock() {
    try {
        const res = await fetch(`${API_BASE_URL}/back-in-stock`);
        const data = await res.json();
        if (data.success) adminBackInStock = data.requests;
    } catch (err) {
        console.error('Fetch back-in-stock error:', err);
    }
}

async function fetchCoupons() {
    try {
        const res = await fetch(`${API_BASE_URL}/coupons`);
        const data = await res.json();
        if (data.success) adminCoupons = data.coupons;
    } catch (err) {
        console.error('Fetch coupons error:', err);
    }
}

// ── Initializations ──────────────────────────────────────────────────────────
async function initData() {
    if (!localStorage.getItem(WA_SETTING_KEY)) {
        localStorage.setItem(WA_SETTING_KEY, '919769445567');
    }

    await initSupabase();
    await fetchProducts();
    await fetchOrders();
    await fetchReviews();
    await fetchCustomers();
    await fetchInvoices();
    await fetchAnnouncements();
    await fetchSubscribers();
    await fetchBackInStock();
    await fetchCoupons();
    
    checkAuth();
}

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem(LOGGED_IN_KEY) === 'true';
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
    const stored = adminPasscode || localStorage.getItem(PASSCODE_KEY) || 'admin123';
    const errorMsg = document.getElementById('login-error-msg');

    if (typed === stored) {
        sessionStorage.setItem(LOGGED_IN_KEY, 'true');
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('login-pass').value = '';
        checkAuth();
        showToast('Authenticated. Atelier ledger loaded.');
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function handleLogout() {
    if (supabaseClient) {
        supabaseClient.auth.signOut();
    }
    sessionStorage.setItem(LOGGED_IN_KEY, 'false');
    checkAuth();
    showToast('Securely logged out from Ledger.');
}

function renderAllDashboard() {
    renderOverview();
    renderCatalog();
    renderOrders();
    renderCustomers();
    renderInvoices();
    renderAnnouncements();
    renderReviewsTab();
    renderSubscribers();
    renderBackInStock();
    renderCoupons();
    renderFulfillment();
    loadSettings();
}

function renderOverview() {
    const prodCount = document.getElementById('stat-products-count');
    const usersCount = document.getElementById('stat-users-count');
    if (prodCount) prodCount.textContent = adminProducts.length;
    if (usersCount) usersCount.textContent = adminCustomers.length;

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
        const stockQty = p.stock !== undefined ? p.stock : 50;
        card.innerHTML = `
            <div class="adm-card-header">
                <span class="adm-card-code">${p.code}</span>
                <span class="adm-card-price">${p.price}</span>
            </div>
            <h4 class="adm-card-name">${p.name}</h4>
            <p class="adm-card-notes">${p.shortNotes || p.short_notes}</p>
            <div class="adm-card-stock" style="font-size:0.75rem; margin-bottom:12px; color:var(--ink-mid);">
                Stock: <strong style="color: ${stockQty === 0 ? 'var(--error)' : 'var(--success)'};">${stockQty} units</strong>
            </div>
            <div class="adm-card-actions">
                <button class="btn btn-outline edit-prod-btn" data-code="${p.code}">Edit</button>
                <button class="btn btn-outline delete-prod-btn" data-code="${p.code}" style="color:var(--error); border-color:rgba(192, 57, 43, 0.1);">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.edit-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => openProductModal(btn.dataset.code));
    });

    document.querySelectorAll('.delete-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm(`Remove composition ${btn.dataset.code}?`)) {
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
        const promoLabel = ord.promoCode ? `<br><span style="font-size:0.68rem; color:var(--gold)">Promo: ${ord.promoCode} (${ord.discount})</span>` : '';
        const addressLabel = ord.address ? `<br><span style="font-size:0.68rem; color:var(--ink-dim);">${escHtml(ord.address)}, ${escHtml(ord.city)}, ${escHtml(ord.zipCode || ord.zip_code)}</span>` : '';
        
        tr.innerHTML = `
            <td><code>${ord.id}</code></td>
            <td><strong>${escHtml(ord.collector)}</strong><br><span style="font-size:0.75rem; color:var(--ink-dim);">${escHtml(ord.email)}</span>${addressLabel}</td>
            <td style="font-size:0.8rem;">${ord.wa}</td>
            <td style="font-size:0.78rem; color:var(--ink-mid);">${escHtml(ord.items)}</td>
            <td><strong>${ord.value}</strong>${promoLabel}</td>
            <td>${ord.date}</td>
            <td><span class="status-badge ${ord.status}">${ord.status === 'pending' ? 'Pending' : 'Fulfilled'}</span></td>
            <td style="white-space: nowrap;">
                <button class="btn btn-outline toggle-status-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; margin-right:4px;">Toggle</button>
                <button class="btn btn-outline invoice-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; margin-right:4px; color:var(--gold); border-color:rgba(155,122,66,0.25);">Invoice</button>
                <button class="btn btn-outline email-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; color:#4a90e2; border-color:rgba(74,144,226,0.25);">Email</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const ord = adminOrders[idx];
            const newStatus = ord.status === 'pending' ? 'fulfilled' : 'pending';
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${ord.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Consultation status toggled.');
                    await fetchOrders();
                    renderOrders();
                    renderOverview();
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    document.querySelectorAll('.invoice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openInvoiceCreationModal(parseInt(btn.dataset.idx, 10));
        });
    });

    document.querySelectorAll('.email-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEmailModal(parseInt(btn.dataset.idx, 10));
        });
    });
}

function renderCustomers() {
    const tbody = document.getElementById('customers-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (adminCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ink-dim)">No customers in ledger yet.</td></tr>';
        return;
    }

    adminCustomers.forEach((customer, index) => {
        const tr = document.createElement('tr');
        const createdDate = new Date(customer.createdAt).toLocaleDateString('en-IN');
        const fullAddress = customer.address ? `${customer.address}, ${customer.city}, ${customer.state}, ${customer.country} - ${customer.zipCode || customer.zip_code}` : 'None';
        tr.innerHTML = `
            <td><strong>${escHtml(customer.name)}</strong></td>
            <td>${escHtml(customer.email)}</td>
            <td>${escHtml(customer.phone)}</td>
            <td style="font-size:0.7rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escHtml(fullAddress)}</td>
            <td>${customer.totalOrders || 0}</td>
            <td>₹${(customer.totalSpent || 0).toLocaleString('en-IN')}</td>
            <td>${createdDate}</td>
            <td><button class="btn btn-outline delete-customer-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192, 57, 43, 0.1);">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const cust = adminCustomers[idx];
            if (confirm(`Delete customer ${cust.name}?`)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/customers/${cust.id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        showToast('Customer deleted.');
                        await fetchCustomers();
                        renderCustomers();
                        renderOverview();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    });
}

function openCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    modal.classList.add('open');
}

function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.classList.remove('open');
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    const customer = {
        name: document.getElementById('cust-name').value.trim(),
        email: document.getElementById('cust-email').value.trim(),
        phone: document.getElementById('cust-phone').value.trim(),
        address: document.getElementById('cust-address').value.trim(),
        city: '',
        state: '',
        country: 'India',
        zipCode: ''
    };

    try {
        const res = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Customer added to records.');
            await fetchCustomers();
            renderCustomers();
            renderOverview();
            closeCustomerModal();
        } else {
            alert('Error adding customer: ' + result.error);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderInvoices() {
    const tbody = document.getElementById('invoices-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (adminInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink-dim)">No invoices generated yet.</td></tr>';
        return;
    }

    adminInvoices.forEach((invoice) => {
        const tr = document.createElement('tr');
        const invDate = new Date(invoice.generatedAt).toLocaleDateString('en-IN');
        tr.innerHTML = `
            <td><code>${invoice.invoiceNumber}</code></td>
            <td>${escHtml(invoice.customerName)}</td>
            <td><strong>${invoice.total}</strong></td>
            <td>${invDate}</td>
            <td><span class="status-badge pending">Recorded</span></td>
            <td><button class="btn btn-outline download-inv-btn" data-id="${invoice.invoiceNumber}" style="padding:6px 10px; font-size:0.62rem; color:var(--gold); border-color:rgba(155,122,66,0.25);">Download</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.download-inv-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const num = btn.dataset.id;
            const invoice = adminInvoices.find(inv => inv.invoiceNumber === num);
            if (invoice) {
                downloadInvoicePDF(invoice);
            }
        });
    });
}

async function downloadInvoicePDF(invoiceData) {
    try {
        const res = await fetch(`${API_BASE_URL}/invoices/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceData.invoiceNumber || invoiceData.invoice_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert('Failed to generate PDF');
        }
    } catch (err) {
        console.error(err);
    }
}

function openInvoiceCreationModal(orderIdx) {
    const modal = document.getElementById('invoice-creation-modal');
    if (!modal) return;
    const form = document.getElementById('invoice-creation-form');
    if (form) form.reset();

    const itemsContainer = document.getElementById('inv-items-container');
    itemsContainer.innerHTML = '';

    if (orderIdx !== undefined && orderIdx > -1) {
        const ord = adminOrders[orderIdx];
        document.getElementById('inv-customer-id').value = ord.customerId || '';
        document.getElementById('inv-cust-name').value = ord.collector;
        document.getElementById('inv-cust-email').value = ord.email;
        document.getElementById('inv-cust-phone').value = ord.wa;
        document.getElementById('inv-cust-address').value = ord.address || '';
        
        // Parse items from order "Wild Blue / 01 (50ml) x 2"
        const items = ord.items.split(', ').map(itemStr => {
            const match = itemStr.match(/(.+?)\s*\((\d+ml)\)\s*[x×]\s*(\d+)/i) || itemStr.match(/(.+?)\s*[x×]\s*(\d+)/i);
            if (match) {
                const name = match[1].trim();
                const size = match[2] ? match[2].trim() : '50ml';
                const qty = parseInt(match[3], 10);
                return { name, size, qty };
            }
            return { name: itemStr, size: '50ml', qty: 1 };
        });

        items.forEach(item => {
            addInvoiceItemRow(item.name, item.qty, 799); // default 799
        });

        // Set promo and discount
        document.getElementById('inv-discount-amt').value = ord.discount ? parseFloat(ord.discount.replace(/[^\d.]/g, '')) : 0;
        
        // Add hidden or standard note for promo code
        const notesArea = document.getElementById('inv-notes');
        if (notesArea && ord.promoCode) {
            notesArea.value = `Applied promo code: ${ord.promoCode}. prepaid payments only.`;
        }

        recalculateInvoiceTotals();
    } else {
        addInvoiceItemRow('', 1, 799);
        recalculateInvoiceTotals();
    }

    modal.classList.add('open');
}

function addInvoiceItemRow(name = '', qty = 1, price = 799) {
    const container = document.getElementById('inv-items-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'inv-item-row';
    row.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
    row.innerHTML = `
        <input type="text" class="form-input item-name" style="flex:2;" placeholder="Item Name" value="${name}" required>
        <input type="number" class="form-input item-qty" style="flex:0.5; text-align:center;" value="${qty}" min="1" required>
        <input type="number" class="form-input item-price" style="flex:1;" placeholder="Price (₹)" value="${price}" required>
        <button type="button" class="btn-delete-row" style="background:none; border:none; color:var(--error); cursor:pointer; font-size:1.1rem;">✕</button>
    `;

    row.querySelector('.btn-delete-row').addEventListener('click', () => {
        row.remove();
        recalculateInvoiceTotals();
    });

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', recalculateInvoiceTotals);
    });

    container.appendChild(row);
    recalculateInvoiceTotals();
}

function recalculateInvoiceTotals() {
    const container = document.getElementById('inv-items-container');
    if (!container) return;

    let subtotal = 0;
    container.querySelectorAll('.inv-item-row').forEach(row => {
        const qty = parseInt(row.querySelector('.item-qty').value, 10) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });

    const taxPercent = parseFloat(document.getElementById('inv-tax').value) || 0;
    const discountAmt = parseFloat(document.getElementById('inv-discount-amt').value) || 0;

    const subtotalText = '₹' + subtotal.toLocaleString('en-IN');
    document.getElementById('inv-subtotal').value = subtotalText;

    const taxAmt = Math.round(subtotal * (taxPercent / 100));
    const total = subtotal + taxAmt - discountAmt;

    document.getElementById('inv-total').value = '₹' + total.toLocaleString('en-IN');
    renderInvoiceLivePreview(subtotal, taxPercent, taxAmt, discountAmt, total);
}

function renderInvoiceLivePreview(subtotal, taxPercent, taxAmt, discountAmt, total) {
    const preview = document.getElementById('invoice-preview');
    if (!preview) return;

    const name = document.getElementById('inv-cust-name').value || 'Customer Name';
    const email = document.getElementById('inv-cust-email').value || 'email@example.com';
    const phone = document.getElementById('inv-cust-phone').value || '';
    const address = document.getElementById('inv-cust-address').value || '';
    const notes = document.getElementById('inv-notes').value || 'Thank you for your patonage.';

    let itemsHtml = '';
    const container = document.getElementById('inv-items-container');
    if (container) {
        container.querySelectorAll('.inv-item-row').forEach(row => {
            const itemName = row.querySelector('.item-name').value || 'Unlabeled Scent';
            const qty = row.querySelector('.item-qty').value || '1';
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:8px; border-bottom:1px solid rgba(24,25,26,0.05); padding-bottom:6px;">
                    <span>${escHtml(itemName)} × ${qty}</span>
                    <span>₹${(qty * price).toLocaleString('en-IN')}</span>
                </div>
            `;
        });
    }

    preview.innerHTML = `
        <div style="font-family:'Cormorant Garamond', serif; font-size:1.6rem; text-align:center; margin-bottom:20px; font-weight:600; color:var(--gold);">Sugandh Ink</div>
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--ink-dim); text-align:center; margin-bottom:20px; letter-spacing:1px;">Private Atelier Billing Ledger</div>
        
        <div style="margin-bottom:16px; font-size:0.8rem; line-height:1.4;">
            <strong>BILL TO:</strong><br>
            ${escHtml(name)}<br>
            ${escHtml(email)}<br>
            ${escHtml(phone)}<br>
            ${escHtml(address)}
        </div>

        <div style="margin-top:20px; border-top:1px solid #141516; padding-top:12px;">
            ${itemsHtml}
        </div>

        <div style="margin-top:20px; text-align:right; font-size:0.82rem; line-height:1.6; border-top:1px dashed rgba(24,25,26,0.1); padding-top:10px;">
            <div>Subtotal: <strong>₹${subtotal.toLocaleString('en-IN')}</strong></div>
            ${taxPercent > 0 ? `<div>Tax (${taxPercent}%): <strong>₹${taxAmt.toLocaleString('en-IN')}</strong></div>` : ''}
            ${discountAmt > 0 ? `<div style="color:var(--gold)">Discount: <strong>-₹${discountAmt.toLocaleString('en-IN')}</strong></div>` : ''}
            <div style="font-size:1rem; font-weight:600; margin-top:6px; color:var(--ink-dark); border-top:1px solid rgba(24,25,26,0.15); padding-top:6px;">TOTAL: ₹${total.toLocaleString('en-IN')}</div>
        </div>

        <div style="margin-top:30px; font-size:0.7rem; color:var(--ink-dim); border-top:1px solid rgba(24,25,26,0.08); padding-top:10px; line-height:1.4;">
            <strong>NOTES:</strong><br>
            ${escHtml(notes)}
        </div>
    `;
}

function closeInvoiceCreationModal() {
    const modal = document.getElementById('invoice-creation-modal');
    if (modal) modal.classList.remove('open');
}

async function handleInvoiceGenerateSubmit() {
    const name = document.getElementById('inv-cust-name').value.trim();
    const email = document.getElementById('inv-cust-email').value.trim();
    const phone = document.getElementById('inv-cust-phone').value.trim();
    const address = document.getElementById('inv-cust-address').value.trim();
    const subtotalText = document.getElementById('inv-subtotal').value;
    const taxPercent = parseInt(document.getElementById('inv-tax').value, 10) || 0;
    const discountAmt = parseFloat(document.getElementById('inv-discount-amt').value) || 0;
    const totalText = document.getElementById('inv-total').value;
    const notes = document.getElementById('inv-notes').value.trim();

    const items = [];
    const container = document.getElementById('inv-items-container');
    container.querySelectorAll('.inv-item-row').forEach(row => {
        const itemName = row.querySelector('.item-name').value.trim();
        const qty = parseInt(row.querySelector('.item-qty').value, 10) || 1;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        items.push({
            name: itemName,
            quantity: qty,
            unitPrice: '₹' + price.toLocaleString('en-IN'),
            total: '₹' + (qty * price).toLocaleString('en-IN')
        });
    });

    if (items.length === 0) return alert('Add at least one item.');

    const subtotalVal = parseFloat(subtotalText.replace(/[^\d.]/g, ''));
    const taxVal = Math.round(subtotalVal * (taxPercent / 100));

    const invoiceData = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        items: items,
        subtotal: subtotalText,
        tax: taxVal > 0 ? '₹' + taxVal.toLocaleString('en-IN') : '₹0',
        taxPercent: taxPercent,
        discount: discountAmt > 0 ? '₹' + discountAmt.toLocaleString('en-IN') : '₹0',
        total: totalText,
        notes: notes
    };

    await downloadInvoicePDF(invoiceData);
    await fetchInvoices();
    renderInvoices();
    closeInvoiceCreationModal();
}

async function sendInvoiceEmail() {
    const name = document.getElementById('inv-cust-name').value.trim();
    const email = document.getElementById('inv-cust-email').value.trim();
    const phone = document.getElementById('inv-cust-phone').value.trim();
    const address = document.getElementById('inv-cust-address').value.trim();
    const subtotalText = document.getElementById('inv-subtotal').value;
    const taxPercent = parseInt(document.getElementById('inv-tax').value, 10) || 0;
    const discountAmt = parseFloat(document.getElementById('inv-discount-amt').value) || 0;
    const totalText = document.getElementById('inv-total').value;
    const notes = document.getElementById('inv-notes').value.trim();

    const items = [];
    const container = document.getElementById('inv-items-container');
    container.querySelectorAll('.inv-item-row').forEach(row => {
        const itemName = row.querySelector('.item-name').value.trim();
        const qty = parseInt(row.querySelector('.item-qty').value, 10) || 1;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        items.push({
            name: itemName,
            quantity: qty,
            unitPrice: '₹' + price.toLocaleString('en-IN'),
            total: '₹' + (qty * price).toLocaleString('en-IN')
        });
    });

    const subtotalVal = parseFloat(subtotalText.replace(/[^\d.]/g, ''));
    const taxVal = Math.round(subtotalVal * (taxPercent / 100));

    const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        items: items,
        subtotal: subtotalText,
        tax: taxVal > 0 ? '₹' + taxVal.toLocaleString('en-IN') : '₹0',
        taxPercent: taxPercent,
        discount: discountAmt > 0 ? '₹' + discountAmt.toLocaleString('en-IN') : '₹0',
        total: totalText,
        notes: notes
    };

    try {
        const res = await fetch(`${API_BASE_URL}/email/send-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerEmail: email,
                customerName: name,
                invoiceData: invoiceData
            })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Invoice dispatched securely via email.');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        showToast('SMTP Mail delivery failed.');
    }
}

// ── Email Customizer with Placeholders & Templates ──────────────────────────
let selectedOrderForEmail = null;

function openEmailModal(orderIdx) {
    const modal = document.getElementById('email-modal');
    if (!modal) return;

    selectedOrderForEmail = adminOrders[orderIdx];
    document.getElementById('email-order-index').value = orderIdx;

    // Trigger initial load of default template
    const templateSelect = document.getElementById('email-template-select');
    if (templateSelect) {
        templateSelect.value = 'dispatch';
        applyEmailTemplate('dispatch');
    }

    modal.classList.add('open');
}

function applyEmailTemplate(templateName) {
    if (!selectedOrderForEmail) return;

    const resolved = resolveEmailTemplate(templateName, selectedOrderForEmail);
    document.getElementById('mail-subject').value = resolved.subject;
    document.getElementById('mail-preheader').value = resolved.preheader;
    document.getElementById('mail-body').value = resolved.body;

    updateEmailLivePreview();
}

function resolveEmailTemplate(templateName, order) {
    const templates = {
        dispatch: {
            subject: "Bespoke Scent Formulation Dispatch - Sugandh Ink",
            preheader: "Your signature fragrance is ready for maturation.",
            body: "Dear {{customerName}},\n\nYour bespoke fragrance formulation (Order {{orderId}}) has successfully completed its silent maturation cycle and is prepared for dispatch.\n\nSummary of your Order:\n{{orderItems}}\nTotal Value: {{orderTotal}}\nPromo Applied: {{promoCode}}\n\nYour ledger invoice is attached as a PDF. Payment must be completed via prepaid channels prior to courier release (No COD). Your parcel has been released to our private courier.\n\nWith warm regards,\nSugandh Ink Atelier"
        },
        consultation: {
            subject: "Atelier Scent Consultation Accords - Sugandh Ink",
            preheader: "Thank you for joining our private fragrance consultation.",
            body: "Dear {{customerName}},\n\nIt was a pleasure conducting your olfactive consultation today.\n\nOur noses are crafting your bespoke accords based on your selected olfactory notes: {{orderItems}}.\n\nWe will update you as soon as maturation begins.\n\nBest regards,\nSugandh Ink Team"
        },
        welcome: {
            subject: "Welcome to Sugandh Ink Private Atelier",
            preheader: "Access your collector profile and formulation ledger.",
            body: "Dear {{customerName}},\n\nWelcome to the Sugandh Ink Private Atelier.\n\nYour collector profile has been registered in our ledger database. You can now track your formulations, check order status, and apply exclusive promo codes (e.g. {{promoCode}}).\n\nWe look forward to curating your signature scents.\n\nBest regards,\nSugandh Ink Team"
        },
        custom: {
            subject: "Private Atelier Notice - Sugandh Ink",
            preheader: "An update from the atelier.",
            body: "Dear {{customerName}},\n\n"
        }
    };

    const tpl = templates[templateName] || templates.custom;
    
    // Replace variables
    const replaceAll = (text) => {
        if (!text) return '';
        return text
            .replace(/{{customerName}}/g, order.collector)
            .replace(/{{orderId}}/g, order.id)
            .replace(/{{orderTotal}}/g, order.value)
            .replace(/{{orderItems}}/g, order.items)
            .replace(/{{promoCode}}/g, order.promoCode || 'None')
            .replace(/{{discount}}/g, order.discount || '₹0');
    };

    return {
        subject: replaceAll(tpl.subject),
        preheader: replaceAll(tpl.preheader),
        body: replaceAll(tpl.body)
    };
}

function updateEmailLivePreview() {
    const preview = document.getElementById('email-preview-area');
    if (!preview) return;

    const subject = document.getElementById('mail-subject').value;
    const bodyText = document.getElementById('mail-body').value;

    preview.innerHTML = `
        <div style="background-color:#141516; color:#fcfbfa; font-family:'Jost', sans-serif; padding:40px 30px; text-align:center; max-width:600px; margin:0 auto; border:1px solid #9b7a42; border-radius:4px;">
            <div style="font-family:'Cormorant Garamond', serif; font-size:24px; font-weight:600; margin-bottom:10px; letter-spacing:2px; color:#9b7a42;">Sugandh <span style="font-style:italic;">Ink</span></div>
            <div style="font-size:10px; letter-spacing:1px; margin-bottom:30px; color:#888; text-transform:uppercase;">Private Atelier Ledger Notice</div>
            
            <div style="text-align:left; font-size:0.85rem; color:#bbb; margin-bottom:20px; border-bottom:1px solid rgba(155,122,66,0.15); padding-bottom:12px;">
                <strong>Subject:</strong> ${escHtml(subject)}
            </div>

            <div style="text-align:left; line-height:1.7; font-size:14px; color:#e0dbd5; white-space:pre-wrap;">${escHtml(bodyText)}</div>
            
            <div style="margin-top:40px; padding-top:20px; border-top:1px solid rgba(155,122,66,0.15); font-size:11px; color:#666;">
                This is a secure private transmission from Sugandh Ink Private Atelier. Only authorized recipients are permitted access.
            </div>
        </div>
    `;
}

async function dispatchEmail() {
    if (!selectedOrderForEmail) return;

    const subject = document.getElementById('mail-subject').value.trim();
    const preheader = document.getElementById('mail-preheader').value.trim();
    const bodyText = document.getElementById('mail-body').value;

    // Wrap bodyText in private atelier design wrapper
    const wrappedHtml = `
        <div style="background-color:#141516; color:#fcfbfa; font-family:'Jost', sans-serif; padding:40px 30px; text-align:center; max-width:600px; margin:0 auto; border:1px solid #9b7a42; border-radius:4px;">
            <div style="font-family:'Cormorant Garamond', serif; font-size:24px; font-weight:600; margin-bottom:10px; letter-spacing:2px; color:#9b7a42;">Sugandh <span style="font-style:italic;">Ink</span></div>
            <div style="font-size:10px; letter-spacing:1px; margin-bottom:30px; color:#888; text-transform:uppercase;">Private Atelier Ledger Notice</div>
            <p style="font-size:0.75rem; color:#666; margin-bottom:20px; font-style:italic;">${escHtml(preheader)}</p>
            <div style="text-align:left; line-height:1.7; font-size:14px; color:#e0dbd5; white-space:pre-wrap;">${bodyText.replace(/\n/g, '<br>')}</div>
            <div style="margin-top:40px; padding-top:20px; border-top:1px solid rgba(155,122,66,0.15); font-size:11px; color:#666;">
                This is a secure private transmission from Sugandh Ink Private Atelier. Only authorized recipients are permitted access.
            </div>
        </div>
    `;

    try {
        const res = await fetch(`${API_BASE_URL}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: selectedOrderForEmail.email,
                subject: subject,
                htmlContent: wrappedHtml
            })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Bespoke email dispatched successfully.');
            closeEmailModal();
        } else {
            alert('SMTP error: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        showToast('SMTP Mail delivery failed.');
    }
}

function closeEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) modal.classList.remove('open');
}

// ── Announcements & Reviews ──────────────────────────────────────────────────
function renderAnnouncements() {
    const tbody = document.getElementById('announcements-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (adminAnnouncements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink-dim)">No announcements yet.</td></tr>';
        return;
    }

    adminAnnouncements.forEach((announcement, index) => {
        const tr = document.createElement('tr');
        const sentCount = announcement.sentTo ? announcement.sentTo.length : 0;
        const annDate = new Date(announcement.createdAt || announcement.created_at).toLocaleDateString('en-IN');
        tr.innerHTML = `
            <td><strong>${escHtml(announcement.title)}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.78rem; color: var(--ink-mid);">${escHtml(announcement.message)}</td>
            <td><span class="status-badge ${announcement.type}">${announcement.type}</span></td>
            <td>${sentCount}</td>
            <td>${annDate}</td>
            <td>
                <button class="btn btn-outline send-ann-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; color:var(--gold); border-color:rgba(155,122,66,0.25);">Send</button>
                <button class="btn btn-outline delete-ann-btn" data-idx="${index}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192,57,43,0.1); margin-left:4px;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.send-ann-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            await sendAnnouncement(idx);
        });
    });

    document.querySelectorAll('.delete-ann-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const ann = adminAnnouncements[idx];
            if (confirm(`Delete announcement "${ann.title}"?`)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/announcements/${ann.id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        showToast('Announcement deleted.');
                        await fetchAnnouncements();
                        renderAnnouncements();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    });
}

function openAnnouncementModal() {
    const modal = document.getElementById('announcement-modal');
    if (!modal) return;
    const form = document.getElementById('announcement-form');
    if (form) form.reset();
    modal.classList.add('open');
}

function closeAnnouncementModal() {
    const modal = document.getElementById('announcement-modal');
    if (modal) modal.classList.remove('open');
}

async function sendAnnouncement(index) {
    const announcement = adminAnnouncements[index];
    if (!announcement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/announcements/${announcement.id}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds: adminCustomers.map(c => c.id) })
        });

        const result = await response.json();
        if (result.success) {
            showToast(`Announcement sent to ${result.sentCount} customers.`);
            await fetchAnnouncements();
            renderAnnouncements();
        } else {
            showToast('Error: ' + (result.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        showToast('Error: SMTP service may not be configured.');
    }
}

function renderReviewsTab() {
    const pending = adminReviews.filter(r => r.status === 'pending');
    const approved = adminReviews.filter(r => r.status === 'approved');

    document.getElementById('stat-published-reviews').textContent = approved.length;
    document.getElementById('stat-pending-reviews').textContent = pending.length;

    const avgRating = adminReviews.length > 0
        ? (adminReviews.reduce((sum, r) => sum + r.rating, 0) / adminReviews.length).toFixed(1)
        : '-';
    document.getElementById('stat-reviews-avg').textContent = avgRating;

    renderReviewsPending();
    renderReviewsFull();
    populateProductDropdowns();
}

function renderReviewsPending() {
    const tbody = document.getElementById('reviews-pending-list');
    if (!tbody) return;

    const pending = adminReviews.filter(r => r.status === 'pending');
    tbody.innerHTML = '';

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink-dim)">No pending reviews.</td></tr>';
        return;
    }

    pending.forEach((rev) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${rev.productCode}</strong></td>
            <td>${escHtml(rev.name)}</td>
            <td>${'★'.repeat(rev.rating)}</td>
            <td style="font-size:0.75rem; color:var(--ink-mid);">${escHtml(rev.text.substring(0, 60))}...</td>
            <td>${rev.date}</td>
            <td style="white-space: nowrap;">
                <button class="btn btn-outline review-approve-btn" data-id="${rev.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--success); border-color:rgba(39, 174, 96, 0.1);">Approve</button>
                <button class="btn btn-outline review-reject-btn" data-id="${rev.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192, 57, 43, 0.1);">Reject</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.review-approve-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            try {
                const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'approved' })
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Review approved and published.');
                    await fetchReviews();
                    renderReviewsTab();
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    document.querySelectorAll('.review-reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            try {
                const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
                    method: 'DELETE'
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Review rejected and removed.');
                    await fetchReviews();
                    renderReviewsTab();
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
}

function renderReviewsFull() {
    const tbody = document.getElementById('reviews-full-list');
    if (!tbody) return;

    let reviews = adminReviews;
    const filterProduct = document.getElementById('filter-review-product')?.value;
    if (filterProduct) {
        reviews = reviews.filter(r => r.productCode === filterProduct);
    }

    tbody.innerHTML = '';
    if (reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink-dim)">No reviews for this filter.</td></tr>';
        return;
    }

    reviews.forEach((rev) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${rev.productCode}</strong></td>
            <td>${escHtml(rev.name)}</td>
            <td>${'★'.repeat(rev.rating)}</td>
            <td style="font-size:0.75rem; color:var(--ink-mid);">${escHtml(rev.text.substring(0, 50))}...</td>
            <td><span class="status-badge ${rev.status}">${rev.status}</span></td>
            <td><button class="btn btn-outline delete-full-rev-btn" data-id="${rev.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192,57,43,0.1);">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.delete-full-rev-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('Delete this review permanently?')) {
                try {
                    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        showToast('Review deleted permanently.');
                        await fetchReviews();
                        renderReviewsTab();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    });
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
            el.appendChild(opt);
        }

        adminProducts.forEach(p => {
            const option = document.createElement('option');
            option.value = p.code;
            option.textContent = p.name + ' (' + p.code + ')';
            if (p.code === selected) option.selected = true;
            el.appendChild(option);
        });
    });
}

// ── Catalog Form Modals ──────────────────────────────────────────────────────
function openProductModal(editCode = '') {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    const editInput = document.getElementById('form-edit-code');

    if (!modal || !form) return;

    form.reset();

    // Disable all fields except stock and description/details
    document.getElementById('form-code').disabled = true;
    document.getElementById('form-name').disabled = true;
    document.getElementById('form-price').disabled = true;
    document.getElementById('form-notes').disabled = true;
    document.getElementById('form-short-notes').disabled = true;
    document.getElementById('form-occasion').disabled = true;
    document.getElementById('form-image').disabled = true;
    
    document.getElementById('form-stock').disabled = false;
    document.getElementById('form-description').disabled = false;

    if (editCode) {
        title.textContent = 'Edit Composition Details';
        editInput.value = editCode;

        const prod = adminProducts.find(p => p.code === editCode);
        if (prod) {
            document.getElementById('form-code').value = prod.code;
            document.getElementById('form-name').value = prod.name;
            document.getElementById('form-price').value = prod.price;
            document.getElementById('form-stock').value = prod.stock !== undefined ? prod.stock : 50;
            document.getElementById('form-notes').value = prod.notes;
            document.getElementById('form-short-notes').value = prod.shortNotes || prod.short_notes || '';
            document.getElementById('form-occasion').value = prod.occasion;
            document.getElementById('form-description').value = prod.description;
            document.getElementById('form-image').value = prod.image;
        }
    } else {
        title.textContent = 'Add Fragrance Composition';
        editInput.value = '';

        // Auto-populate luxury defaults for the read-only fields
        const tempId = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('form-code').value = `OUD/TEMP-${tempId}`;
        document.getElementById('form-name').value = 'Bespoke Composition';
        document.getElementById('form-price').value = '₹22,000';
        document.getElementById('form-notes').value = 'saffron, amber, musk';
        document.getElementById('form-short-notes').value = 'saffron · amber';
        document.getElementById('form-occasion').value = 'evening, luxury';
        document.getElementById('form-image').value = 'Products/AMB-12.png';
        document.getElementById('form-stock').value = 50;
        document.getElementById('form-description').value = '';
    }

    modal.classList.add('open');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('open');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const editCode = document.getElementById('form-edit-code').value;

    const dataObj = {
        code: document.getElementById('form-code').value.trim().toUpperCase(),
        name: document.getElementById('form-name').value.trim(),
        price: document.getElementById('form-price').value.trim(),
        stock: parseInt(document.getElementById('form-stock').value, 10) || 0,
        notes: document.getElementById('form-notes').value.trim(),
        shortNotes: document.getElementById('form-short-notes').value.trim(),
        occasion: document.getElementById('form-occasion').value.trim(),
        description: document.getElementById('form-description').value.trim(),
        image: document.getElementById('form-image').value || 'Products/FRSH-01.png'
    };

    try {
        let url = `${API_BASE_URL}/products`;
        let method = 'POST';
        if (editCode) {
            url = `${API_BASE_URL}/products/${editCode}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });
        const result = await res.json();
        if (result.success) {
            showToast(`Composition committed successfully.`);
            await fetchProducts();
            renderCatalog();
            renderOverview();
            populateProductDropdowns();
            closeProductModal();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        showToast('Error committing composition details.');
    }
}

async function deleteProduct(code) {
    try {
        const res = await fetch(`${API_BASE_URL}/products/${code}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            showToast(`Composition ${code} removed.`);
            await fetchProducts();
            renderCatalog();
            renderOverview();
            populateProductDropdowns();
        } else {
            alert('Error deleting product: ' + result.error);
        }
    } catch (err) {
        console.error(err);
    }
}

// ── NEW TAB RENDERERS ────────────────────────────────────────────────────────

function renderSubscribers() {
    const tbody = document.getElementById('subscribers-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (adminSubscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--ink-dim)">No subscribers yet.</td></tr>';
        return;
    }
    adminSubscribers.forEach(sub => {
        const tr = document.createElement('tr');
        const date = new Date(sub.subscribed_at).toLocaleDateString('en-IN');
        tr.innerHTML = `
            <td>${escHtml(sub.email)}</td>
            <td>${escHtml(sub.name || '-')}</td>
            <td>${date}</td>
            <td><span class="status-badge ${sub.is_active ? 'fulfilled' : 'pending'}">${sub.is_active ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn btn-outline delete-sub-btn" data-id="${sub.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192,57,43,0.1);">Unsubscribe</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.delete-sub-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Unsubscribe this email?')) {
                try {
                    const res = await fetch(`${API_BASE_URL}/newsletter/subscribers/${btn.dataset.id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        showToast('Subscriber removed.');
                        await fetchSubscribers();
                        renderSubscribers();
                    }
                } catch (err) { console.error(err); }
            }
        });
    });
}

function renderBackInStock() {
    const tbody = document.getElementById('backinstock-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (adminBackInStock.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink-dim)">No back in stock requests yet.</td></tr>';
        return;
    }
    adminBackInStock.forEach(req => {
        const tr = document.createElement('tr');
        const date = new Date(req.created_at).toLocaleDateString('en-IN');
        const notifiedLabel = req.notified ? 'Notified' : 'Pending';
        const notifiedClass = req.notified ? 'fulfilled' : 'pending';
        tr.innerHTML = `
            <td><code>${escHtml(req.product_code)}</code></td>
            <td>${escHtml(req.email)}</td>
            <td>${escHtml(req.name || '-')}</td>
            <td>${date}</td>
            <td><span class="status-badge ${notifiedClass}">${notifiedLabel}</span></td>
            <td>${req.notified ? '' : `<button class="btn btn-outline notify-bis-btn" data-id="${req.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--success); border-color:rgba(16,185,129,0.2);">Mark Notified</button>`}</td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.notify-bis-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/back-in-stock/${btn.dataset.id}`, { method: 'PUT' });
                const result = await res.json();
                if (result.success) {
                    showToast('Marked as notified.');
                    await fetchBackInStock();
                    renderBackInStock();
                }
            } catch (err) { console.error(err); }
        });
    });
}

function renderCoupons() {
    const tbody = document.getElementById('coupons-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (adminCoupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ink-dim)">No coupons yet.</td></tr>';
        return;
    }
    adminCoupons.forEach(coupon => {
        const tr = document.createElement('tr');
        const expires = coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN') : '-';
        tr.innerHTML = `
            <td><code>${escHtml(coupon.code)}</code></td>
            <td><strong>${coupon.discount_percent}%</strong></td>
            <td style="font-size:0.78rem;color:var(--ink-mid)">${escHtml(coupon.description || '-')}</td>
            <td>${coupon.current_uses || 0}/${coupon.max_uses || 100}</td>
            <td><span class="status-badge ${coupon.is_active ? 'fulfilled' : 'pending'}">${coupon.is_active ? 'Active' : 'Inactive'}</span></td>
            <td style="font-size:0.78rem;">${expires}</td>
            <td>
                <button class="btn btn-outline edit-coupon-btn" data-code="${coupon.code}" style="padding:6px 10px; font-size:0.62rem;">Edit</button>
                <button class="btn btn-outline delete-coupon-btn" data-code="${coupon.code}" style="padding:6px 10px; font-size:0.62rem; color:var(--error); border-color:rgba(192,57,43,0.1);">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.edit-coupon-btn').forEach(btn => {
        btn.addEventListener('click', () => openCouponModal(btn.dataset.code));
    });
    document.querySelectorAll('.delete-coupon-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm(`Delete coupon ${btn.dataset.code}?`)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/coupons/${btn.dataset.code}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        showToast('Coupon deleted.');
                        await fetchCoupons();
                        renderCoupons();
                    }
                } catch (err) { console.error(err); }
            }
        });
    });
}

function renderFulfillment() {
    const tbody = document.getElementById('fulfillment-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (adminOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ink-dim)">No orders yet.</td></tr>';
        return;
    }
    adminOrders.forEach(ord => {
        const tr = document.createElement('tr');
        const statusLabel = ord.status.charAt(0).toUpperCase() + ord.status.slice(1);
        tr.innerHTML = `
            <td><code>${ord.id}</code></td>
            <td><strong>${escHtml(ord.collector)}</strong></td>
            <td style="font-size:0.78rem;color:var(--ink-mid)">${escHtml(ord.items)}</td>
            <td><strong>${ord.value}</strong></td>
            <td>${ord.date}</td>
            <td><span class="status-badge ${ord.status}">${statusLabel}</span></td>
            <td style="white-space:nowrap;">
                ${ord.status === 'pending' ? `<button class="btn btn-outline fulfill-btn" data-id="${ord.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--success); border-color:rgba(16,185,129,0.2);">Fulfill</button>` : ''}
                ${ord.status === 'fulfilled' ? `<button class="btn btn-outline ship-btn" data-id="${ord.id}" style="padding:6px 10px; font-size:0.62rem; color:var(--gold); border-color:rgba(155,122,66,0.25);">Ship</button>` : ''}
                ${ord.status === 'shipped' ? '<span style="font-size:0.62rem;color:var(--ink-dim)">Shipped</span>' : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.fulfill-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${btn.dataset.id}/fulfill`, { method: 'PUT' });
                const result = await res.json();
                if (result.success) {
                    showToast('Order fulfilled.');
                    await fetchOrders();
                    renderOrders();
                    renderFulfillment();
                    renderOverview();
                }
            } catch (err) { console.error(err); }
        });
    });
    document.querySelectorAll('.ship-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const tracking = prompt('Enter tracking number (optional):');
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${btn.dataset.id}/ship`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tracking_number: tracking || '' })
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Order shipped.');
                    await fetchOrders();
                    renderOrders();
                    renderFulfillment();
                    renderOverview();
                }
            } catch (err) { console.error(err); }
        });
    });
}

// ── COUPON MODAL FUNCTIONS ────────────────────────────────────────────────────

function openCouponModal(editCode = '') {
    const modal = document.getElementById('coupon-modal');
    const form = document.getElementById('coupon-form');
    const title = document.getElementById('coupon-modal-title');
    const editInput = document.getElementById('form-coupon-edit-code');
    if (!modal || !form) return;
    form.reset();
    document.getElementById('form-coupon-code').disabled = false;
    if (editCode) {
        title.textContent = 'Edit Coupon';
        editInput.value = editCode;
        const coupon = adminCoupons.find(c => c.code === editCode);
        if (coupon) {
            document.getElementById('form-coupon-code').value = coupon.code;
            document.getElementById('form-coupon-code').disabled = true;
            document.getElementById('form-coupon-discount').value = coupon.discount_percent;
            document.getElementById('form-coupon-desc').value = coupon.description || '';
            document.getElementById('form-coupon-max').value = coupon.max_uses || 100;
            if (coupon.expires_at) {
                document.getElementById('form-coupon-expires').value = coupon.expires_at.split('T')[0];
            }
        }
    } else {
        title.textContent = 'Add Coupon';
        editInput.value = '';
    }
    modal.classList.add('open');
}

function closeCouponModal() {
    const modal = document.getElementById('coupon-modal');
    if (modal) modal.classList.remove('open');
}

async function handleCouponSubmit(e) {
    e.preventDefault();
    const editCode = document.getElementById('form-coupon-edit-code').value;
    const data = {
        code: document.getElementById('form-coupon-code').value.trim().toUpperCase(),
        discount_percent: parseInt(document.getElementById('form-coupon-discount').value, 10),
        description: document.getElementById('form-coupon-desc').value.trim(),
        max_uses: parseInt(document.getElementById('form-coupon-max').value, 10) || 100,
        expires_at: document.getElementById('form-coupon-expires').value || null
    };
    try {
        let url = `${API_BASE_URL}/coupons`;
        let method = 'POST';
        if (editCode) {
            url = `${API_BASE_URL}/coupons/${editCode}`;
            method = 'PUT';
        }
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast(editCode ? 'Coupon updated.' : 'Coupon created.');
            await fetchCoupons();
            renderCoupons();
            closeCouponModal();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        showToast('Error saving coupon.');
    }
}

function escHtml(str) {
    return (str || '').replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

function loadSettings() {
    const wa = localStorage.getItem(WA_SETTING_KEY) || '919769445567';
    const pass = adminPasscode || localStorage.getItem(PASSCODE_KEY) || 'admin123';

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
    if (pass) {
        localStorage.setItem(PASSCODE_KEY, pass);
        adminPasscode = pass;
    }

    showToast('Ledger configuration updated.');
}

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

function setupModalHandlers() {
    // Customer Modal
    const custModal = document.getElementById('customer-modal');
    const custClose = document.getElementById('customer-modal-close');
    const custForm = document.getElementById('customer-form');
    const addCustBtn = document.getElementById('add-customer-trigger');

    if (custClose && custModal) {
        custClose.addEventListener('click', closeCustomerModal);
        custModal.addEventListener('click', (e) => {
            if (e.target.id === 'customer-modal') closeCustomerModal();
        });
    }
    if (addCustBtn) addCustBtn.addEventListener('click', openCustomerModal);
    if (custForm) custForm.addEventListener('submit', handleCustomerSubmit);

    // Announcement Modal
    const annModal = document.getElementById('announcement-modal');
    const annClose = document.getElementById('announcement-modal-close');
    const annForm = document.getElementById('announcement-form');
    const addAnnBtn = document.getElementById('create-announcement-trigger');

    if (annClose && annModal) {
        annClose.addEventListener('click', closeAnnouncementModal);
        annModal.addEventListener('click', (e) => {
            if (e.target.id === 'announcement-modal') closeAnnouncementModal();
        });
    }
    if (addAnnBtn) addAnnBtn.addEventListener('click', openAnnouncementModal);
    if (annForm) annForm.addEventListener('submit', handleAnnouncementSubmit);

    // Invoice Creation Modal
    const invCreationModal = document.getElementById('invoice-creation-modal');
    const invCreationClose = document.getElementById('invoice-creation-close');
    const createInvBtn = document.getElementById('create-invoice-trigger');
    const addInvItemBtn = document.getElementById('btn-add-inv-item');
    const btnGeneratePdf = document.getElementById('btn-generate-pdf');
    const btnSendInvoiceEmail = document.getElementById('btn-send-invoice-email');

    if (invCreationClose && invCreationModal) {
        invCreationClose.addEventListener('click', closeInvoiceCreationModal);
        invCreationModal.addEventListener('click', (e) => {
            if (e.target.id === 'invoice-creation-modal') closeInvoiceCreationModal();
        });
    }
    if (createInvBtn) createInvBtn.addEventListener('click', () => openInvoiceCreationModal());
    if (addInvItemBtn) addInvItemBtn.addEventListener('click', () => addInvoiceItemRow('', 1, 799));
    if (btnGeneratePdf) btnGeneratePdf.addEventListener('click', handleInvoiceGenerateSubmit);
    if (btnSendInvoiceEmail) btnSendInvoiceEmail.addEventListener('click', sendInvoiceEmail);

    document.getElementById('inv-tax')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-discount-amt')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-cust-name')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-cust-email')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-cust-phone')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-cust-address')?.addEventListener('input', recalculateInvoiceTotals);
    document.getElementById('inv-notes')?.addEventListener('input', recalculateInvoiceTotals);

    // Email Modal
    const emailModal = document.getElementById('email-modal');
    const emailClose = document.getElementById('email-modal-close');
    const templateSelect = document.getElementById('email-template-select');
    const mailSubject = document.getElementById('mail-subject');
    const mailPreheader = document.getElementById('mail-preheader');
    const mailBody = document.getElementById('mail-body');
    const btnSendEmail = document.getElementById('btn-send-email');
    const btnCopyEmailHtml = document.getElementById('btn-copy-email-html');

    if (emailClose && emailModal) {
        emailClose.addEventListener('click', closeEmailModal);
        emailModal.addEventListener('click', (e) => {
            if (e.target.id === 'email-modal') closeEmailModal();
        });
    }

    templateSelect?.addEventListener('change', (e) => {
        applyEmailTemplate(e.target.value);
    });

    [mailSubject, mailPreheader, mailBody].forEach(input => {
        input?.addEventListener('input', updateEmailLivePreview);
    });

    if (btnSendEmail) {
        btnSendEmail.textContent = "Dispatch Email via SMTP";
        btnSendEmail.addEventListener('click', dispatchEmail);
    }
    btnCopyEmailHtml?.addEventListener('click', () => {
        const previewArea = document.getElementById('email-preview-area');
        if (previewArea) {
            navigator.clipboard.writeText(previewArea.innerHTML);
            showToast('HTML content copied to clipboard.');
        }
    });

    // Product Modal
    const prodModal = document.getElementById('product-modal');
    const prodClose = document.getElementById('product-modal-close');
    const prodForm = document.getElementById('product-form');
    const addProdBtn = document.getElementById('add-product-trigger');

    if (prodClose && prodModal) {
        prodClose.addEventListener('click', closeProductModal);
        prodModal.addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') closeProductModal();
        });
    }
    if (addProdBtn) addProdBtn.addEventListener('click', () => openProductModal());
    if (prodForm) prodForm.addEventListener('submit', handleProductSubmit);

    // Coupon Modal
    const couponModal = document.getElementById('coupon-modal');
    const couponClose = document.getElementById('coupon-modal-close');
    const couponForm = document.getElementById('coupon-form');
    const addCouponBtn = document.getElementById('add-coupon-trigger');

    if (couponClose && couponModal) {
        couponClose.addEventListener('click', closeCouponModal);
        couponModal.addEventListener('click', (e) => {
            if (e.target.id === 'coupon-modal') closeCouponModal();
        });
    }
    if (addCouponBtn) addCouponBtn.addEventListener('click', () => openCouponModal());
    if (couponForm) couponForm.addEventListener('submit', handleCouponSubmit);

    // Settings Form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);



    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

document.addEventListener('DOMContentLoaded', () => {
    initData();
    setupDashboardTabs();
    setupModalHandlers();
});

export { adminProducts, adminOrders, adminCustomers, adminInvoices, adminAnnouncements };
