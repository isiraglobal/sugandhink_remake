import { getApiUrl } from './utils.js';
import { products } from './products.js';

export async function requestBackInStock(productCode, size, email) {
    const response = await fetch(getApiUrl('/api/back-in-stock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_code: productCode, email })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to submit waitlist request');
    }
    return await response.json();
}

export function getWaitlistRequests() {
    try {
        return JSON.parse(localStorage.getItem('si_waitlist_requests')) || [];
    } catch {
        return [];
    }
}

export function isAlreadyRequested(productCode, size) {
    const requests = getWaitlistRequests();
    return requests.some(r => r.productCode === productCode && r.size === (size || null));
}

export function addWaitlistRequest(productCode, size, email) {
    const requests = getWaitlistRequests();
    requests.push({ productCode, size: size || null, email, date: new Date().toISOString() });
    localStorage.setItem('si_waitlist_requests', JSON.stringify(requests));
}

export function getProductAvailability(productCode) {
    const product = products.find(p => p.code === productCode);
    if (!product) return { inStock: true, stock: 0 };
    const stock = product.stock !== undefined ? product.stock : 50;
    return { inStock: stock > 0, stock };
}

export function showToast(msg) {
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
