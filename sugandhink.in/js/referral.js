/**
 * referral.js - Referral Program
 * Share unique referral links, earn 200 points when referred friends place their first order.
 */

import { addPoints } from './loyalty.js';

const STORAGE_CODE = 'si_referral_code';
const STORAGE_REFERRALS = 'si_referrals';
const STORAGE_REFERRED_BY = 'si_referred_by';

function hashEmail(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = ((hash << 5) - hash) + email.charCodeAt(i);
        hash |= 0;
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const n = Math.abs(hash);
    let code = '';
    let remaining = n;
    for (let i = 0; i < 6; i++) {
        code += chars[remaining % chars.length];
        remaining = Math.floor(remaining / chars.length);
    }
    return 'SI-' + code;
}

function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return 'SI-' + code;
}

export function getReferralCode() {
    let code = localStorage.getItem(STORAGE_CODE);
    if (code) return code;
    try {
        const user = JSON.parse(localStorage.getItem('si_user'));
        if (user && user.email) {
            code = hashEmail(user.email);
        } else {
            code = generateRandomCode();
        }
    } catch {
        code = generateRandomCode();
    }
    localStorage.setItem(STORAGE_CODE, code);
    return code;
}

export function getReferralLink() {
    const code = getReferralCode();
    return window.location.origin + '/pages/referral.html?ref=' + code;
}

export function copyReferralLink() {
    const link = getReferralLink();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link);
    } else {
        const ta = document.createElement('textarea');
        ta.value = link;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }
}

export function shareViaWhatsApp() {
    const link = getReferralLink();
    const msg = 'Discover Sugandh Ink \u2014 artisanal fragrances crafted with unyielding precision. Use my referral link to get \u20B9200 off your first order: ' + link;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

export function getReferrals() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_REFERRALS)) || [];
    } catch { return []; }
}

function saveReferrals(refs) {
    localStorage.setItem(STORAGE_REFERRALS, JSON.stringify(refs));
}

export function addReferralRecord(friendIdentifier) {
    const refs = getReferrals();
    refs.push({
        friend: friendIdentifier || 'Friend',
        date: new Date().toLocaleDateString('en-IN'),
        points: 0,
        claimed: false
    });
    saveReferrals(refs);
    return refs;
}

export function getReferralEarnings() {
    const refs = getReferrals();
    return refs.reduce((sum, r) => sum + (r.claimed ? r.points : 0), 0);
}

export function claimReferralBonus(referrerCode) {
    if (!referrerCode) return false;
    const claimKey = 'si_referral_claimed_' + referrerCode;
    if (localStorage.getItem(claimKey)) return false;

    const orders = (() => { try { return JSON.parse(localStorage.getItem('si_orders')) || []; } catch { return []; } })();
    if (orders.length > 1) return false;

    addPoints(200, 'Referral bonus');
    localStorage.setItem(claimKey, 'true');

    const refs = getReferrals();
    refs.push({
        type: 'referred_by',
        code: referrerCode,
        date: new Date().toLocaleDateString('en-IN'),
        points: 200,
        claimed: true
    });
    saveReferrals(refs);

    const referrerEarnings = JSON.parse(localStorage.getItem('si_referrer_earnings_' + referrerCode) || '[]');
    referrerEarnings.push({
        date: new Date().toLocaleDateString('en-IN'),
        points: 200
    });
    localStorage.setItem('si_referrer_earnings_' + referrerCode, JSON.stringify(referrerEarnings));

    return true;
}

export function checkForReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !localStorage.getItem(STORAGE_REFERRED_BY)) {
        localStorage.setItem(STORAGE_REFERRED_BY, ref);
        return ref;
    }
    return null;
}

export function getReferredBy() {
    return localStorage.getItem(STORAGE_REFERRED_BY);
}

export function getReferrerEarnings() {
    const code = getReferralCode();
    try {
        return JSON.parse(localStorage.getItem('si_referrer_earnings_' + code)) || [];
    } catch { return []; }
}
