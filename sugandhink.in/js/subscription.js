/**
 * subscription.js - Scent of the Month Subscription
 * Plan selection, form modal, WhatsApp checkout, localStorage management
 */

import { addPoints } from './loyalty.js';

const WA_NUMBER = '919769445567';

const PLAN_DATA = {
    monthly: { name: 'Monthly Discovery', price: 1999, period: '/mo', loyaltyPoints: 500, label: 'Monthly' },
    quarterly: { name: 'Quarterly Collection', price: 5499, period: '/quarter', loyaltyPoints: 1000, label: 'Quarterly' },
    atelier: { name: 'The Atelier', price: 9999, period: '/quarter', loyaltyPoints: 2000, label: 'Quarterly' }
};

let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
    renderCurrentSubscription();
    setupPlanSelection();
    setupFormModal();
    setupFAQ();
    setupPrefSelection();
});

function getSubscriptions() {
    try {
        return JSON.parse(localStorage.getItem('si_subscriptions')) || [];
    } catch { return []; }
}

function saveSubscriptions(subs) {
    localStorage.setItem('si_subscriptions', JSON.stringify(subs));
}

function generateSubId() {
    return 'SUB-' + Math.floor(1000 + Math.random() * 9000);
}

function renderCurrentSubscription() {
    const container = document.getElementById('sub-active-card');
    if (!container) return;

    const subs = getSubscriptions();
    const active = subs.find(s => s.status === 'active' || s.status === 'paused');

    if (!active) {
        container.style.display = 'none';
        return;
    }

    const planInfo = PLAN_DATA[active.plan] || PLAN_DATA.monthly;
    const statusClass = active.status === 'active' ? 'sub-status-active' : 'sub-status-paused';
    const nextDelivery = active.nextDelivery || 'TBD';

    let actionsHtml = '';
    if (active.status === 'active') {
        actionsHtml = `
            <button class="sub-btn-pause" data-action="pause" data-id="${active.id}">Pause</button>
            <button class="sub-btn-cancel" data-action="cancel" data-id="${active.id}">Cancel</button>
        `;
    } else if (active.status === 'paused') {
        actionsHtml = `
            <button class="sub-btn-resume" data-action="resume" data-id="${active.id}">Resume</button>
            <button class="sub-btn-cancel" data-action="cancel" data-id="${active.id}">Cancel</button>
        `;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div class="sub-active-inner">
            <div class="sub-active-info">
                <h3>${escHtml(planInfo.name)}</h3>
                <div class="sub-active-plan">ID: ${escHtml(active.id)}</div>
                <div class="sub-active-status ${statusClass}">${active.status.charAt(0).toUpperCase() + active.status.slice(1)}</div>
                <div class="sub-active-date">Next delivery: ${nextDelivery} ${planInfo.period}</div>
            </div>
            <div class="sub-active-actions">
                ${actionsHtml}
            </div>
        </div>
    `;

    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            manageSubscription(id, action);
        });
    });
}

function manageSubscription(id, action) {
    const subs = getSubscriptions();
    const idx = subs.findIndex(s => s.id === id);
    if (idx === -1) return;

    if (action === 'pause') {
        subs[idx].status = 'paused';
    } else if (action === 'resume') {
        subs[idx].status = 'active';
        const next = new Date();
        if (subs[idx].plan === 'monthly') {
            next.setMonth(next.getMonth() + 1);
        } else {
            next.setMonth(next.getMonth() + 3);
        }
        subs[idx].nextDelivery = next.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } else if (action === 'cancel') {
        subs[idx].status = 'cancelled';
    }

    saveSubscriptions(subs);
    renderCurrentSubscription();
}

function setupPlanSelection() {
    const cards = document.querySelectorAll('.sub-plan-card');
    const buttons = document.querySelectorAll('.sub-plan-btn');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.sub-plan-btn')) return;
            const plan = card.dataset.plan;
            selectPlan(plan);
        });
    });

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const plan = btn.dataset.plan;
            selectPlan(plan);
            openFormModal();
        });
    });
}

function selectPlan(plan) {
    selectedPlan = plan;
    document.querySelectorAll('.sub-plan-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.sub-plan-card[data-plan="${plan}"]`)?.classList.add('selected');
}

function setupFormModal() {
    const overlay = document.getElementById('sub-form-overlay');
    const closeBtn = document.getElementById('sub-form-close');
    const form = document.getElementById('sub-form');

    closeBtn?.addEventListener('click', () => closeFormModal());

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) closeFormModal();
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });
}

function openFormModal() {
    if (!selectedPlan) return;
    const planInfo = PLAN_DATA[selectedPlan];
    if (!planInfo) return;

    const overlay = document.getElementById('sub-form-overlay');
    const planDisplay = document.getElementById('sub-form-plan-display');
    const planHidden = document.getElementById('sub-form-plan');
    const formContent = document.getElementById('sub-form-content');
    const success = document.getElementById('sub-success');

    if (planDisplay) planDisplay.value = planInfo.name;
    if (planHidden) planHidden.value = selectedPlan;

    formContent.style.display = 'block';
    success.classList.remove('show');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeFormModal() {
    const overlay = document.getElementById('sub-form-overlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function handleFormSubmit() {
    const name = document.getElementById('sub-form-name')?.value.trim();
    const email = document.getElementById('sub-form-email')?.value.trim();
    const phone = document.getElementById('sub-form-phone')?.value.trim();
    const address = document.getElementById('sub-form-address')?.value.trim();
    const city = document.getElementById('sub-form-city')?.value.trim();
    const state = document.getElementById('sub-form-state')?.value.trim();
    const country = document.getElementById('sub-form-country')?.value.trim();
    const zip = document.getElementById('sub-form-zip')?.value.trim();
    const mood = document.querySelector('#sub-pref-mood .sub-form-pref-item.selected')?.dataset.value || '';
    const family = document.querySelector('#sub-pref-family .sub-form-pref-item.selected')?.dataset.value || '';
    const loveNotes = document.getElementById('sub-form-love-notes')?.value.trim();
    const avoidNotes = document.getElementById('sub-form-avoid-notes')?.value.trim();
    const frequency = document.getElementById('sub-form-frequency')?.value;
    const plan = document.getElementById('sub-form-plan')?.value;

    if (!name || !email || !phone || !address || !city || !state || !zip) {
        alert('Please fill in all required fields.');
        return;
    }

    const planInfo = PLAN_DATA[plan];
    if (!planInfo) return;

    const subId = generateSubId();
    const nextDelivery = new Date();
    if (plan === 'monthly') {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    } else {
        nextDelivery.setMonth(nextDelivery.getMonth() + 3);
    }

    const subscription = {
        id: subId,
        plan: plan,
        planName: planInfo.name,
        price: planInfo.price,
        period: planInfo.period,
        status: 'active',
        customer: {
            name,
            email,
            phone,
            address,
            city,
            state,
            country,
            zip
        },
        preferences: {
            mood,
            family,
            loveNotes,
            avoidNotes,
            frequency
        },
        nextDelivery: nextDelivery.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        startDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString()
    };

    const subs = getSubscriptions();
    subs.push(subscription);
    saveSubscriptions(subs);

    const order = {
        id: subId,
        type: 'subscription',
        plan: planInfo.name,
        collector: name,
        email: email,
        wa: phone,
        items: `${planInfo.name} subscription - ${planInfo.price}`,
        total: '₹' + planInfo.price.toLocaleString('en-IN'),
        date: new Date().toLocaleDateString('en-IN'),
        status: 'pending',
        address: address,
        city: city,
        state: state,
        country: country,
        zipCode: zip
    };

    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('si_orders')) || [];
    } catch { orders = []; }
    orders.push(order);
    localStorage.setItem('si_orders', JSON.stringify(orders));

    addPoints(planInfo.loyaltyPoints, 'Subscription: ' + planInfo.name);

    const waMsg = encodeURIComponent(
        `Hello Sugandh Ink\n\nI would like to start a new subscription:\n\n` +
        `*Plan:* ${planInfo.name}\n` +
        `*Price:* ₹${planInfo.price.toLocaleString('en-IN')}${planInfo.period}\n` +
        `*Subscription ID:* ${subId}\n` +
        `*Frequency:* ${frequency}\n\n` +
        `*Customer Details:*\n` +
        `- Name: ${name}\n` +
        `- Email: ${email}\n` +
        `- Phone: ${phone}\n` +
        `- Address: ${address}, ${city}, ${state}, ${country} - ${zip}\n\n` +
        `*Scent Preferences:*\n` +
        `- Mood: ${mood || 'Not specified'}\n` +
        `- Family: ${family || 'Not specified'}\n` +
        `- Notes I Love: ${loveNotes || 'Not specified'}\n` +
        `- Notes to Avoid: ${avoidNotes || 'Not specified'}\n\n` +
        `Please confirm my subscription and share payment details. Thank you.`
    );

    window.open(`https://wa.me/${WA_NUMBER}?text=${waMsg}`, '_blank');

    const formContent = document.getElementById('sub-form-content');
    const success = document.getElementById('sub-success');
    const successId = document.getElementById('sub-success-id');

    formContent.style.display = 'none';
    success.classList.add('show');
    if (successId) successId.textContent = 'Subscription ID: ' + subId;

    renderCurrentSubscription();
}

function setupPrefSelection() {
    document.querySelectorAll('.sub-form-pref-item').forEach(item => {
        item.addEventListener('click', () => {
            const parent = item.parentElement;
            parent.querySelectorAll('.sub-form-pref-item').forEach(s => s.classList.remove('selected'));
            item.classList.add('selected');
        });
    });
}

function setupFAQ() {
    document.querySelectorAll('.sub-faq-q').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('open');
        });
    });
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
    );
}
