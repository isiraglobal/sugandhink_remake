/**
 * loyalty.js - The Atelier Club Loyalty Rewards Program
 * Points system with 4 tiers: Stone, Zinc, Silver, Gold
 */

const TIERS = [
    { name: 'Stone',     min: 0,    color: '#8a8a8a', benefit: 'Welcome rate, early access to new releases' },
    { name: 'Zinc',      min: 250,  color: '#a8a09b', benefit: 'All Stone + 5% bonus points, birthday reward' },
    { name: 'Silver',    min: 750,  color: '#b0b4b8', benefit: 'All Zinc + 10% bonus points, free sample with every order' },
    { name: 'Gold',      min: 2000, color: '#9b7a42', benefit: 'All Silver + 15% bonus points, complimentary gift wrapping, priority concierge' }
];

function getPoints() {
    try {
        return parseInt(localStorage.getItem('si_loyalty_points')) || 0;
    } catch { return 0; }
}

function getTier() {
    const pts = getPoints();
    let tier = TIERS[0];
    for (const t of TIERS) {
        if (pts >= t.min) tier = t;
    }
    return tier;
}

function getNextTier() {
    const pts = getPoints();
    let next = TIERS[TIERS.length - 1];
    for (const t of TIERS) {
        if (pts < t.min) { next = t; break; }
    }
    return next;
}

function getPointsToNextTier() {
    const next = getNextTier();
    return Math.max(0, next.min - getPoints());
}

function addPoints(amount, reason) {
    const current = getPoints();
    const bonusTier = getTier();
    let bonusMultiplier = 1;
    if (bonusTier.name === 'Gold') bonusMultiplier = 1.15;
    else if (bonusTier.name === 'Silver') bonusMultiplier = 1.10;
    else if (bonusTier.name === 'Zinc') bonusMultiplier = 1.05;

    const finalPoints = Math.round(amount * bonusMultiplier);
    const newTotal = current + finalPoints;
    localStorage.setItem('si_loyalty_points', String(newTotal));

    const history = getHistory();
    history.push({
        date: new Date().toLocaleDateString('en-IN'),
        points: finalPoints,
        reason: reason,
        runningTotal: newTotal
    });
    setHistory(history);

    window.dispatchEvent(new CustomEvent('loyalty:updated'));
    return newTotal;
}

function redeemPoints(amount) {
    const current = getPoints();
    if (amount > current) return false;
    const newTotal = current - amount;
    localStorage.setItem('si_loyalty_points', String(newTotal));

    const history = getHistory();
    history.push({
        date: new Date().toLocaleDateString('en-IN'),
        points: -amount,
        reason: 'Redeemed',
        runningTotal: newTotal
    });
    setHistory(history);

    window.dispatchEvent(new CustomEvent('loyalty:updated'));
    return true;
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('si_loyalty_history')) || [];
    } catch { return []; }
}

function setHistory(history) {
    localStorage.setItem('si_loyalty_history', JSON.stringify(history));
}

function checkBirthdayBonus() {
    try {
        const user = JSON.parse(localStorage.getItem('si_user'));
        if (!user || !user.email) return;
        const key = 'si_loyalty_birthday_' + user.email;
        if (localStorage.getItem(key)) return;
        const today = new Date();
        const month = today.getMonth() + 1;
        if (month === 6 || month === 7 || month === 8) {
            addPoints(200, 'Birthday bonus');
            localStorage.setItem(key, String(today.getFullYear()));
        }
    } catch (e) { /* silent */ }
}

function initializeForNewUser() {
    const user = JSON.parse(localStorage.getItem('si_user'));
    if (!user || !user.email) return;
    const key = 'si_loyalty_onboarded_' + user.email;
    if (localStorage.getItem(key)) return;
    const existing = getPoints();
    if (existing === 0) {
        addPoints(100, 'Signup bonus');
    }
    localStorage.setItem(key, 'true');
}

function renderPointsBadge() {
    const pts = getPoints();
    const initials = document.getElementById('user-initials');
    if (!initials) return;
    let badge = document.getElementById('loyalty-points-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'loyalty-points-badge';
        badge.style.cssText = 'position:absolute;bottom:-6px;right:-6px;background:var(--gold);color:var(--cream);font-size:0.5rem;font-weight:600;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;line-height:1;font-family:var(--sans);';
        initials.parentNode.style.position = 'relative';
        initials.parentNode.appendChild(badge);
    }
    if (pts > 0) {
        badge.textContent = pts >= 1000 ? Math.round(pts / 100) + 'K' : pts;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

export {
    TIERS,
    getPoints,
    getTier,
    getNextTier,
    getPointsToNextTier,
    addPoints,
    redeemPoints,
    getHistory,
    checkBirthdayBonus,
    initializeForNewUser,
    renderPointsBadge
};
