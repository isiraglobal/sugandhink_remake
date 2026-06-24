import { getApiUrl } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
        document.getElementById('tr-order-input').value = idParam;
        lookupOrder(idParam);
    }

    document.getElementById('tr-track-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const input = document.getElementById('tr-order-input');
        const id = input.value.trim();
        if (!id) {
            input.style.borderColor = '#c0392b';
            return;
        }
        input.style.borderColor = '';
        lookupOrder(id);
    });

    document.getElementById('tr-order-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('tr-track-btn').click();
        }
    });
});

async function lookupOrder(id) {
    const errorEl = document.getElementById('tr-error');
    const resultEl = document.getElementById('tr-result');
    const formWrap = document.getElementById('tr-form-wrap');

    let order = null;

    try {
        const resp = await fetch(getApiUrl(`/api/orders?id=${encodeURIComponent(id)}`));
        if (resp.ok) {
            order = await resp.json();
        }
    } catch (e) { /* fallback to local */ }

    if (!order) {
        try {
            const orders = JSON.parse(localStorage.getItem('si_orders')) || [];
            order = orders.find(o => o.id === id) || null;
        } catch { /* ignore */ }
    }

    if (!order) {
        errorEl.style.display = 'block';
        resultEl.style.display = 'none';
        return;
    }

    errorEl.style.display = 'none';
    resultEl.style.display = 'block';

    const statusClass = order.status === 'fulfilled' ? 'tr-status-fulfilled' : (order.status === 'cancelled' ? 'tr-status-cancelled' : 'tr-status-pending');

    let timelineHtml = '';
    const stages = [
        { label: 'Order Placed', time: order.date || 'N/A', done: true },
        { label: 'Confirmed', time: order.status === 'pending' ? 'Awaiting confirmation' : order.date, done: order.status !== 'pending' },
        { label: 'Dispatched', time: order.status === 'fulfilled' ? order.date : 'Pending', done: order.status === 'fulfilled' },
        { label: 'Delivered', time: order.status === 'fulfilled' ? getDeliveryDate(order.date) : 'Pending', done: order.status === 'fulfilled' }
    ];

    let currentFound = false;
    stages.forEach((s, i) => {
        let dotClass = 'tr-timeline-dot';
        if (s.done) {
            dotClass += ' done';
            if (!currentFound) {
                if (i === stages.length - 1 || !stages[i + 1].done) {
                    dotClass += ' current';
                    currentFound = true;
                }
            }
        }
        timelineHtml += `
            <div class="tr-timeline-item">
                <div class="${dotClass}"></div>
                <div class="tr-timeline-info">
                    <strong>${s.label}</strong>
                    <span>${s.time}</span>
                </div>
            </div>
        `;
    });

    resultEl.innerHTML = `
        <div class="tr-card">
            <div class="tr-card-head">
                <h2>${order.id}</h2>
                <span class="tr-status ${statusClass}">${order.status || 'Pending'}</span>
            </div>
            <div class="tr-card-body">
                <div class="tr-row"><span>Date</span><span>${order.date || 'N/A'}</span></div>
                <div class="tr-row"><span>Items</span><span>${order.items || order.total || 'N/A'}</span></div>
                <div class="tr-row"><span>Total</span><span>${order.total || order.value || 'N/A'}</span></div>
                ${order.discount ? `<div class="tr-row"><span>Discount</span><span>${order.discount}</span></div>` : ''}
                ${order.collector ? `<div class="tr-row"><span>Collector</span><span>${order.collector}</span></div>` : ''}
                ${order.wa ? `<div class="tr-row"><span>WhatsApp</span><span>${order.wa}</span></div>` : ''}
                <div class="tr-timeline">
                    <h3>Order Timeline</h3>
                    ${timelineHtml}
                </div>
            </div>
        </div>
        <div class="tr-actions">
            <a href="account.html?tab=orders" class="btn btn-outline">My Orders</a>
            <a href="../collection.html" class="btn btn-dark">Continue Shopping</a>
        </div>
    `;

    formWrap.style.display = 'none';
}

function getDeliveryDate(orderDate) {
    if (!orderDate) return 'N/A';
    try {
        const parts = orderDate.split('/');
        const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]) + 3);
        return d.toLocaleDateString('en-IN');
    } catch {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString('en-IN');
    }
}
