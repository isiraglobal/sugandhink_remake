/**
 * collection-page.js — Collection filtering, sorting, pagination, and interactions
 */

import { products } from './products.js';

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

// ── Main Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Check family query param first to pre-fill filters
    const params = new URLSearchParams(window.location.search);
    const familyParam = params.get('family');
    if (familyParam) {
        const checkbox = document.querySelector(`input[name="family"][value="${familyParam}"]`);
        if (checkbox) checkbox.checked = true;
    }
    
    setupFilters();
    setupSorting();
    setupMobileFilters();
    applyFiltersAndSort(); // First render
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

    // 4. Sorting
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
        const el = document.createElement('div');
        el.className = 'citem';
        // Add data attribute for internal transition
        el.setAttribute('data-id', product.code);
        el.innerHTML = `
            <div class="citem-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="citem-code">${product.code}</div>
            <div class="citem-name">${product.name}</div>
            <div class="citem-notes">${product.shortNotes}</div>
            <div class="citem-footer">
                <span class="citem-price">${product.price}</span>
                <a href="${waLink(product)}" target="_blank" rel="noopener" class="citem-wa" onclick="event.stopPropagation();">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Order
                </a>
            </div>
        `;

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
    const inputs = document.querySelectorAll('input[name="family"], input[name="price"], input[name="occasion"]');
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
