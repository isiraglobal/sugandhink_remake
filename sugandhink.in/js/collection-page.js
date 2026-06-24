/**
 * collection-page.js - Collection filtering, sorting, pagination, and interactions
 */

import { products } from './products.js';
import { toggleWishlist, isInWishlist } from './wishlist.js';
import { addToCompare, getCompareState, loadFromLocalStorage, syncBadge } from './compare.js';
import { getProductAvailability } from './waitlist.js';

const WA_NUMBER = '919769445567';

// ── Helpers ──────────────────────────────────────────────────────────────────
function waLink(product) {
    const msg = encodeURIComponent(
        `Hello Sugandh Ink 🌿\n\nI would like to place an order for:\n\n*${product.name}* (${product.code})\nNotes: ${product.shortNotes}\nPrice: ${product.price}\n\nPlease share availability and payment details. Thank you.`
    );
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10);
}

// ── State ────────────────────────────────────────────────────────────────────
let activeProducts = [...products];
let currentPage = 1;
const itemsPerPage = 9;

// ── Mood Mapping ──────────────────────────────────────────────────────────────
const moodMappings = {
    'fresh': {
        keywords: ['fresh', 'citrus', 'clean', 'aquatic', 'marine', 'bergamot', 'lemon', 'mint', 'green', 'bright'],
        occasions: ['daily wear', 'casual', 'spring/summer']
    },
    'warm-spicy': {
        keywords: ['warm', 'spice', 'cinnamon', 'cardamom', 'nutmeg', 'pepper', 'tobacco', 'rum', 'amber'],
        occasions: ['evening', 'date night', 'fall/winter']
    },
    'dark': {
        keywords: ['dark', 'oud', 'incense', 'leather', 'smoke', 'noir', 'resin', 'deep', 'mysterious'],
        occasions: ['evening', 'night', 'fall/winter']
    },
    'bold': {
        keywords: ['bold', 'confident', 'strong', 'power', 'statement', 'beast', 'rich', 'intense', 'unforgettable', 'dominance'],
        occasions: ['evening', 'formal', 'signature']
    },
    'romantic': {
        keywords: ['soft', 'romantic', 'rose', 'vanilla', 'floral', 'jasmine', 'tuberose', 'gardenia', 'sweet', 'musk', 'intimate', 'warm'],
        occasions: ['date night', 'evening', 'casual']
    },
    'earthy': {
        keywords: ['earthy', 'wood', 'cedar', 'sandalwood', 'vetiver', 'oakmoss', 'green', 'forest', 'natural', 'moss', 'grounded'],
        occasions: ['daily wear', 'work', 'casual']
    }
};

function applyMoodFilter(mood) {
    const map = moodMappings[mood];
    if (!map) return;

    document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
    const activePill = document.querySelector(`.mood-pill[data-mood="${mood}"]`);
    if (activePill) activePill.classList.add('active');

    let filtered = [...products];
    filtered = filtered.filter(p => {
        const searchStr = `${p.notes} ${p.shortNotes} ${p.description} ${p.occasion}`.toLowerCase();
        const kwMatch = map.keywords.some(kw => searchStr.includes(kw));
        const occMatch = map.occasions.some(occ => p.occasion.toLowerCase().includes(occ));
        return kwMatch || occMatch;
    });

    activeProducts = filtered;
    currentPage = 1;

    if (filtered.length === 0) {
        activeProducts = [...products];
    }

    renderCatalog();

    const grid = document.getElementById('catalog-grid');
    if (grid) {
        setTimeout(() => {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function clearMoodFilter() {
    document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
    activeProducts = [...products];
    currentPage = 1;
    renderCatalog();
}

function setupMoodPills() {
    document.querySelectorAll('.mood-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const mood = pill.dataset.mood;
            if (pill.classList.contains('active')) {
                clearMoodFilter();
            } else {
                applyMoodFilter(mood);
            }
        });
    });

    const clearBtn = document.getElementById('clear-mood');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearMoodFilter);
    }
}

// ── Main Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const familyParam = params.get('family');
    if (familyParam) {
        const checkbox = document.querySelector(`input[name="family"][value="${familyParam}"]`);
        if (checkbox) checkbox.checked = true;
    }
    const sortParam = params.get('sort');
    if (sortParam === 'new' || sortParam === 'best') {
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.value = sortParam === 'new' ? 'name' : 'featured';
        }
    }
    
    setupMoodPills();
    setupFilters();
    setupSorting();
    setupMobileFilters();
    applyFiltersAndSort();

    setupCompareFloatBtn();

    window.addEventListener('products:updated', () => applyFiltersAndSort());
});

// ── Filter & Sort Logic ─────────────────────────────────────────────────────
function applyFiltersAndSort() {
    let filtered = [...products];

    // 1. Scent Family Filters
    const checkedFamilies = Array.from(document.querySelectorAll('input[name="family"]:checked')).map(el => el.value);
    if (checkedFamilies.length > 0) {
        filtered = filtered.filter(p => {
            const searchStr = `${p.notes} ${p.shortNotes} ${p.description}`.toLowerCase();
            return checkedFamilies.some(family => {
                if (family === 'vanilla') return searchStr.includes('vanilla') || searchStr.includes('gourmand') || searchStr.includes('caramel') || searchStr.includes('tonka');
                if (family === 'oud') return searchStr.includes('oud') || searchStr.includes('resin') || searchStr.includes('incense');
                if (family === 'floral') return searchStr.includes('floral') || searchStr.includes('tuberose') || searchStr.includes('rose') || searchStr.includes('jasmine') || searchStr.includes('peony') || searchStr.includes('bloom') || searchStr.includes('petals');
                if (family === 'wood') return searchStr.includes('wood') || searchStr.includes('cedar') || searchStr.includes('sandalwood') || searchStr.includes('oakmoss') || searchStr.includes('moss') || searchStr.includes('vetiver');
                if (family === 'musk') return searchStr.includes('musk');
                if (family === 'citrus') return searchStr.includes('citrus') || searchStr.includes('lemon') || searchStr.includes('orange') || searchStr.includes('bergamot') || searchStr.includes('marine') || searchStr.includes('fresh') || searchStr.includes('aqua');
                return false;
            });
        });
    }

    // 2. Price Filter
    const selectedPriceRadio = document.querySelector('input[name="price"]:checked');
    if (selectedPriceRadio && selectedPriceRadio.value !== 'all') {
        const val = selectedPriceRadio.value;
        filtered = filtered.filter(p => {
            const price = parsePrice(p.price);
            if (val === 'under-800') return price < 800;
            if (val === '800-1200') return price >= 800 && price <= 1200;
            if (val === 'above-1200') return price > 1200;
            return true;
        });
    }

    // 3. Occasion Filter
    const checkedOccasions = Array.from(document.querySelectorAll('input[name="occasion"]:checked')).map(el => el.value);
    if (checkedOccasions.length > 0) {
        filtered = filtered.filter(p => {
            const searchStr = `${p.occasion} ${p.description}`.toLowerCase();
            return checkedOccasions.some(occ => {
                if (occ === 'daily') return searchStr.includes('daily') || searchStr.includes('day') || searchStr.includes('casual') || searchStr.includes('office') || searchStr.includes('gym');
                if (occ === 'evening') return searchStr.includes('evening') || searchStr.includes('night') || searchStr.includes('winter') || searchStr.includes('dark');
                if (occ === 'formal') return searchStr.includes('formal') || searchStr.includes('special') || searchStr.includes('luxury') || searchStr.includes('signature');
                return false;
            });
        });
    }

    // 4. Availability Filter
    const showOOS = document.getElementById('show-out-of-stock')?.checked;
    if (!showOOS) {
        filtered = filtered.filter(p => {
            const stock = p.stock !== undefined ? p.stock : 50;
            return stock > 0;
        });
    }

    // 5. Sorting
    const sortBy = document.getElementById('sort-by')?.value || 'featured';
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    activeProducts = filtered;
    currentPage = 1;
    renderCatalog();
}

// ── Render Catalog ───────────────────────────────────────────────────────────
function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const countText = document.getElementById('product-count');
    const viewMoreBtn = document.getElementById('view-more-btn');

    if (!grid) return;

    grid.innerHTML = '';
    const totalCount = activeProducts.length;

    if (countText) {
        countText.textContent = `Showing ${totalCount} Premium Composition${totalCount !== 1 ? 's' : ''}`;
    }

    if (totalCount === 0) {
        grid.innerHTML = `
            <div class="reviews-empty" style="grid-column: 1/-1; padding: 60px 0;">
                <p>No compositions match your selected filters. Explore other categories or clear filters.</p>
            </div>
        `;
        if (viewMoreBtn) viewMoreBtn.style.display = 'none';
        return;
    }

    const itemsToShowCount = currentPage * itemsPerPage;
    const itemsToShow = activeProducts.slice(0, itemsToShowCount);

    itemsToShow.forEach(product => {
        const avail = getProductAvailability(product.code);
        const isOOS = !avail.inStock;
        const el = document.createElement('div');
        el.className = 'citem';
        // Add data attribute for internal transition
        el.setAttribute('data-id', product.code);
        el.innerHTML = `
            <div class="citem-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${isOOS ? '<span class="oos-badge">Back in stock soon</span>' : ''}
                <button class="card-wishlist-btn wishlist-btn ${isInWishlist(product.code) ? 'in-wishlist' : ''}" data-code="${product.code}" aria-label="Toggle wishlist">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
            <div class="citem-code">${product.code}</div>
            <div class="citem-name">${product.name}</div>
            <div class="citem-notes">${product.shortNotes}</div>
            <div class="citem-footer">
                <span class="citem-price">${product.price}</span>
                <div class="citem-actions">
                    <button class="compare-card-btn" data-code="${product.code}">Compare</button>
                    <a href="#" class="citem-wa">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c 0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Order
                    </a>
                </div>
            </div>
        `;

        const wishBtn = el.querySelector('.card-wishlist-btn');
        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(product.code);
            wishBtn.classList.toggle('in-wishlist');
        });

        const waBtn = el.querySelector('.citem-wa');
        waBtn.addEventListener('click', (e) => {
            window.handleDirectWA(e, product);
        });

        const compareCardBtn = el.querySelector('.compare-card-btn');
        if (compareCardBtn) {
            compareCardBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCompare(product.code);
                compareCardBtn.classList.add('added');
                compareCardBtn.textContent = 'Added';
                setTimeout(() => {
                    compareCardBtn.classList.remove('added');
                    compareCardBtn.textContent = 'Compare';
                }, 2000);
                showCompareToast(`Added ${product.name} to compare.`);
                updateCompareFloatBtn();
            });
        }

        // Card navigation with curtain transition
        el.addEventListener('click', () => {
            const targetUrl = `product.html?id=${product.code}`;
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

        grid.appendChild(el);
    });

    // Toggle View More Button
    if (viewMoreBtn) {
        if (itemsToShowCount >= totalCount) {
            viewMoreBtn.style.display = 'none';
        } else {
            viewMoreBtn.style.display = 'inline-flex';
        }
    }
}

// ── Setup Filters ────────────────────────────────────────────────────────────
function setupFilters() {
    const inputs = document.querySelectorAll('input[name="family"], input[name="price"], input[name="occasion"], input[name="availability"]');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    });

    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('input[name="family"]:checked, input[name="occasion"]:checked').forEach(el => el.checked = false);
            const defaultPriceRadio = document.querySelector('input[name="price"][value="all"]');
            if (defaultPriceRadio) defaultPriceRadio.checked = true;

            applyFiltersAndSort();
        });
    }

    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderCatalog();
        });
    }
}

// ── Setup Sorting ────────────────────────────────────────────────────────────
function setupSorting() {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    }
}

// ── Mobile Filters Drawer ────────────────────────────────────────────────────
function setupMobileFilters() {
    const trigger = document.getElementById('mobile-filter-trigger');
    const sidebar = document.getElementById('sidebar-filters');
    const closeBtn = document.getElementById('close-filters');

    if (!trigger || !sidebar) return;

    const open = () => {
        sidebar.classList.add('mobile-open');
        trigger.classList.add('active');
    };
    const close = () => {
        sidebar.classList.remove('mobile-open');
        trigger.classList.remove('active');
    };

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('mobile-open')) {
            close();
        } else {
            open();
        }
    });

    closeBtn?.addEventListener('click', close);

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== trigger) {
            close();
        }
    });
}

// ── Compare Integration ──────────────────────────────────────────────────────
function showCompareToast(msg) {
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

function updateCompareFloatBtn() {
    const btn = document.getElementById('compare-float-btn');
    const badge = document.getElementById('compare-float-badge');
    if (!btn) return;
    const state = getCompareState();
    if (state.length > 0) {
        btn.classList.add('visible');
        if (badge) badge.textContent = state.length;
    } else {
        btn.classList.remove('visible');
    }
}

function setupCompareFloatBtn() {
    const existing = document.getElementById('compare-float-btn');
    if (existing) return;

    const btn = document.createElement('a');
    btn.id = 'compare-float-btn';
    btn.className = 'compare-float-btn';
    const isPages = window.location.pathname.includes('/pages/');
    btn.href = isPages ? 'compare.html' : 'pages/compare.html';
    btn.innerHTML = `Compare <span class="compare-float-badge" id="compare-float-badge">0</span>`;
    document.body.appendChild(btn);

    loadFromLocalStorage();
    syncBadge();
    updateCompareFloatBtn();

    window.addEventListener('compare:updated', updateCompareFloatBtn);
}


