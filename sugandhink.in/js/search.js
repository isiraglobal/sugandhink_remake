import { products } from './products.js';

export function initSearch() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
        <div class="search-modal">
            <div class="search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" class="search-input" placeholder="Search compositions..." autocomplete="off">
                <button class="search-close-btn" aria-label="Close search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="search-results"></div>
            <div class="search-empty">Type to search compositions by name, code, notes, or description.</div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.search-input');
    const resultsEl = overlay.querySelector('.search-results');
    const emptyEl = overlay.querySelector('.search-empty');
    const closeBtn = overlay.querySelector('.search-close-btn');

    let debounceTimer;

    function doSearch(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            resultsEl.innerHTML = '';
            emptyEl.style.display = 'block';
            emptyEl.textContent = 'Type to search compositions by name, code, notes, or description.';
            return;
        }

        const matches = products.filter(p => {
            const haystack = `${p.name} ${p.code} ${p.notes} ${p.shortNotes} ${p.description} ${p.memory || ''}`.toLowerCase();
            return haystack.includes(q);
        }).slice(0, 12);

        if (matches.length === 0) {
            resultsEl.innerHTML = '';
            emptyEl.style.display = 'block';
            emptyEl.textContent = 'No compositions found matching your search.';
            return;
        }

        emptyEl.style.display = 'none';
        resultsEl.innerHTML = matches.map(p => {
            const nameParts = p.name.split('/');
            const displayName = nameParts[0].trim();
            const displayNum = nameParts[1] ? '/' + nameParts[1].trim() : '';
            return `
                <div class="search-result-item" data-code="${p.code}">
                    <div class="sri-thumb">
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
                    </div>
                    <div class="sri-info">
                        <div class="sri-name">${displayName}<span class="sri-num">${displayNum}</span></div>
                        <div class="sri-code">${p.code}</div>
                        <div class="sri-price">${p.price}</div>
                    </div>
                </div>
            `;
        }).join('');

        resultsEl.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const code = el.dataset.code;
                const targetUrl = `product.html?id=${code}`;
                closeSearch();
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
        });
    }

    function onInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(input.value), 300);
    }

    function openSearch() {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 100);
    }

    function closeSearch() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        input.value = '';
        resultsEl.innerHTML = '';
        emptyEl.style.display = 'block';
        emptyEl.textContent = 'Type to search compositions by name, code, notes, or description.';
    }

    input.addEventListener('input', onInput);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSearch();
    });

    closeBtn.addEventListener('click', closeSearch);

    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    }
}
