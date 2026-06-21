const STORAGE_KEY = 'si_wishlist';

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function setWishlist(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function toggleWishlist(code) {
    const list = getWishlist();
    const idx = list.indexOf(code);
    if (idx > -1) {
        list.splice(idx, 1);
    } else {
        list.push(code);
    }
    setWishlist(list);
    updateWishlistBadge();
    return list;
}

function isInWishlist(code) {
    return getWishlist().includes(code);
}

function updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (!badge) return;
    const list = getWishlist();
    if (list.length > 0) {
        badge.textContent = list.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function initWishlist() {
    updateWishlistBadge();
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) updateWishlistBadge();
    });
}

export { initWishlist, toggleWishlist, isInWishlist, getWishlist, updateWishlistBadge };
