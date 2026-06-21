/**
 * order-confirmation.js - Displays order confirmation after successful checkout
 */

import { getApiUrl } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (orderId) {
        document.getElementById('oc-order-id').textContent = orderId;
        fetchOrder(orderId);
    } else {
        // Fallback to localStorage
        try {
            const last = JSON.parse(localStorage.getItem('si_last_order'));
            if (last && last.id) {
                document.getElementById('oc-order-id').textContent = last.id;
                renderOrderDetails(last);
            }
        } catch {}
    }
});

async function fetchOrder(orderId) {
    try {
        const res = await fetch(getApiUrl(`/api/orders?id=${orderId}`));
        if (res.ok) {
            const data = await res.json();
            renderOrderDetails(data);
            return;
        }
    } catch {}
    // Fallback to localStorage
    try {
        const orders = JSON.parse(localStorage.getItem('si_orders')) || [];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            renderOrderDetails(order);
            return;
        }
    } catch {}
    try {
        const last = JSON.parse(localStorage.getItem('si_last_order'));
        if (last && last.id) {
            renderOrderDetails(last);
        }
    } catch {}
}

function renderOrderDetails(order) {
    const details = document.getElementById('oc-details');
    if (!details) return;

    details.innerHTML = `
        <div class="oc-detail-row">
            <span>Order ID</span>
            <span>${escHtml(order.id)}</span>
        </div>
        <div class="oc-detail-row">
            <span>Date</span>
            <span>${escHtml(order.date || new Date().toLocaleDateString('en-IN'))}</span>
        </div>
        <div class="oc-detail-row">
            <span>Items</span>
            <span>${escHtml(order.items)}</span>
        </div>
        <div class="oc-detail-row">
            <span>Total</span>
            <span>${escHtml(order.total || order.value)}</span>
        </div>
        <div class="oc-detail-row">
            <span>Status</span>
            <span style="color:var(--gold);text-transform:uppercase;letter-spacing:0.1em;">${escHtml(order.status || 'pending')}</span>
        </div>
    `;
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
