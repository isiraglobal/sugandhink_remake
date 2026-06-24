/**
 * compare.js - Product Comparison Tool
 * Compare up to 4 fragrances side-by-side with shareable URLs
 */

import { products } from './products.js';

const STORAGE_KEY = 'si_compare';
const MAX_ITEMS = 4;

let compareState = [];

function getFamilyFromCode(code) {
    const prefix = code.split('/')[0];
    const map = {
        'FRSH': 'Fresh & Aromatic',
        'SPC': 'Spicy',
        'FLR': 'Floral',
        'FRU': 'Fruity',
        'AQUA': 'Aquatic',
        'OUD': 'Oud & Incense',
        'WDS': 'Woody',
        'SMK': 'Smoky',
        'CIT': 'Citrus',
        'JZC': 'Warm Spicy',
        'VAN': 'Vanilla',
        'AMB': 'Amber',
        'OUDI': 'Oud Intense'
    };
    return map[prefix] || 'Fragrance';
}

function getLongevity() {
    return '6\u201310 hours';
}

export function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareState));
}

export function loadFromLocalStorage() {
    try {
        compareState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        compareState = [];
    }
    return compareState;
}

export function getCompareState() {
    return [...compareState];
}

export function addToCompare(code) {
    if (compareState.includes(code)) return;
    if (compareState.length >= MAX_ITEMS) return;
    compareState.push(code);
    saveToLocalStorage();
    syncBadge();
    window.dispatchEvent(new CustomEvent('compare:updated'));
}

export function removeFromCompare(code) {
    compareState = compareState.filter(c => c !== code);
    saveToLocalStorage();
    syncBadge();
    window.dispatchEvent(new CustomEvent('compare:updated'));
}

export function clearCompare() {
    compareState = [];
    saveToLocalStorage();
    syncBadge();
    window.dispatchEvent(new CustomEvent('compare:updated'));
}

export function getCompareProducts() {
    return compareState.map(code => products.find(p => p.code === code)).filter(Boolean);
}

export function syncBadge() {
    const badge = document.getElementById('compare-badge');
    if (!badge) return;
    const count = compareState.length;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'grid';
    } else {
        badge.style.display = 'none';
    }
}

export function renderProductSelect(container) {
    container.innerHTML = `
        <div class="compare-select-wrap">
            <div class="compare-search-field">
                <input type="text" class="compare-search-input" placeholder="Search by name or code..." autocomplete="off">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <div class="compare-search-results"></div>
        </div>
    `;

    const input = container.querySelector('.compare-search-input');
    const resultsEl = container.querySelector('.compare-search-results');

    const doSearch = (query) => {
        const q = query.trim().toLowerCase();
        if (!q) {
            resultsEl.innerHTML = '';
            return;
        }

        const matches = products.filter(p => {
            const haystack = `${p.name} ${p.code} ${p.shortNotes} ${p.description}`.toLowerCase();
            return haystack.includes(q) && !compareState.includes(p.code);
        }).slice(0, 8);

        if (matches.length === 0) {
            resultsEl.innerHTML = '<div class="compare-search-empty">No results found</div>';
            return;
        }

        resultsEl.innerHTML = matches.map(p => `
            <div class="compare-search-result" data-code="${p.code}">
                <div class="csr-thumb">
                    <img src="../${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="csr-info">
                    <span class="csr-name">${escHtml(p.name)}</span>
                    <span class="csr-code">${p.code}</span>
                </div>
            </div>
        `).join('');

        resultsEl.querySelectorAll('.compare-search-result').forEach(el => {
            el.addEventListener('click', () => {
                const code = el.dataset.code;
                addToCompare(code);
                input.value = '';
                resultsEl.innerHTML = '';
                if (typeof renderComparison === 'function') {
                    renderComparison();
                }
            });
        });
    };

    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(input.value), 250);
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            resultsEl.innerHTML = '';
        }
    });
}

export function renderComparison() {
    const container = document.getElementById('compare-table-container');
    if (!container) return;

    const compareProducts = getCompareProducts();
    const hasItems = compareProducts.length > 0;

    const emptyState = document.getElementById('compare-empty-state');
    const selectorArea = document.getElementById('compare-selector-area');
    const tableArea = document.getElementById('compare-table-area');

    if (selectorArea) {
        selectorArea.style.display = compareState.length >= MAX_ITEMS ? 'none' : 'block';
    }

    if (!hasItems) {
        if (emptyState) emptyState.style.display = 'block';
        if (tableArea) tableArea.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const rows = [
        { label: 'Composition', key: 'image' },
        { label: 'Name & Price', key: 'namePrice' },
        { label: 'Code', key: 'code' },
        { label: 'Scent Family', key: 'family' },
        { label: 'Top Notes', key: 'topNotes' },
        { label: 'Heart Notes', key: 'heartNotes' },
        { label: 'Base Notes', key: 'baseNotes' },
        { label: 'Longevity', key: 'longevity' },
        { label: 'Occasion', key: 'occasion' },
        { label: 'Description', key: 'description' }
    ];

    let html = `<div class="compare-table-wrap"><table class="compare-table">`;

    rows.forEach(row => {
        html += `<tr><td class="compare-label">${row.label}</td>`;
        compareProducts.forEach((p, idx) => {
            switch (row.key) {
                case 'image':
                    html += `<td class="compare-cell compare-img-cell">
                        <div class="compare-product-img" style="background:linear-gradient(135deg, var(--cream-dark), var(--cream-deep));">
                            <img src="../${p.image}" alt="${escHtml(p.name)}" loading="lazy">
                        </div>
                        <button class="compare-remove-btn" data-code="${p.code}" aria-label="Remove ${escHtml(p.name)}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            Remove
                        </button>
                    </td>`;
                    break;
                case 'namePrice':
                    html += `<td class="compare-cell">
                        <div class="compare-product-name">${escHtml(p.name)}</div>
                        <div class="compare-product-price">${p.price}</div>
                    </td>`;
                    break;
                case 'code':
                    html += `<td class="compare-cell"><span class="compare-code">${p.code}</span></td>`;
                    break;
                case 'family':
                    html += `<td class="compare-cell">${getFamilyFromCode(p.code)}</td>`;
                    break;
                case 'topNotes':
                    html += `<td class="compare-cell">${p.topNotes || '\u2014'}</td>`;
                    break;
                case 'heartNotes':
                    html += `<td class="compare-cell">${p.heartNotes || '\u2014'}</td>`;
                    break;
                case 'baseNotes':
                    html += `<td class="compare-cell">${p.baseNotes || '\u2014'}</td>`;
                    break;
                case 'longevity':
                    html += `<td class="compare-cell">${getLongevity()}</td>`;
                    break;
                case 'occasion':
                    html += `<td class="compare-cell">${p.occasion || '\u2014'}</td>`;
                    break;
                case 'description':
                    html += `<td class="compare-cell compare-desc-cell">${p.description || '\u2014'}</td>`;
                    break;
            }
        });
        html += `</tr>`;
    });

    html += `</table></div>`;

    if (tableArea) tableArea.innerHTML = html;

    container.querySelectorAll('.compare-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCompare(btn.dataset.code);
            renderComparison();
            renderProductSelect(document.getElementById('compare-selector-area'));
        });
    });

    syncBadge();
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}

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

export function onComparePageLoad() {
    loadFromLocalStorage();

    const params = new URLSearchParams(window.location.search);
    const compareParam = params.get('compare');
    if (compareParam) {
        const codes = compareParam.split(',').slice(0, MAX_ITEMS);
        codes.forEach(code => {
            if (!compareState.includes(code)) {
                compareState.push(code);
            }
        });
        saveToLocalStorage();
    }

    const clearBtn = document.getElementById('compare-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearCompare();
            renderComparison();
            renderProductSelect(document.getElementById('compare-selector-area'));
        });
    }

    const shareBtn = document.getElementById('compare-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const codes = compareState.join(',');
            if (!codes) {
                showCompareToast('Add fragrances to compare before sharing.');
                return;
            }
            const url = `${window.location.pathname}?compare=${codes}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.origin + url).then(() => {
                    showCompareToast('Comparison link copied to clipboard.');
                });
            }
        });
    }

    renderComparison();
    renderProductSelect(document.getElementById('compare-selector-area'));

    window.addEventListener('compare:updated', () => {
        renderComparison();
        renderProductSelect(document.getElementById('compare-selector-area'));
    });
}
