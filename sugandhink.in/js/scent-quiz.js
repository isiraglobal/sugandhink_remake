import { products } from './products.js';

const quizSteps = [
    {
        question: 'Who is this for?',
        options: ['Male', 'Female', 'Unisex', 'No Preference'],
        key: 'gender'
    },
    {
        question: 'When will you wear it?',
        options: ['Daily', 'Evening', 'Formal', 'Casual', 'Any'],
        key: 'occasion'
    },
    {
        question: 'Which notes draw you?',
        options: ['Fresh/Citrus', 'Floral', 'Oud/Resin', 'Woody', 'Vanilla/Gourmand', 'Spicy'],
        key: 'family'
    },
    {
        question: 'Your preferred season?',
        options: ['Spring', 'Summer', 'Fall', 'Winter', 'All'],
        key: 'season'
    },
    {
        question: 'How bold?',
        options: ['Subtle & Close', 'Moderate', 'Strong & Projecting'],
        key: 'intensity'
    },
    {
        question: 'Your vibe?',
        options: ['Bold & Confident', 'Calm & Serene', 'Romantic & Warm', 'Fresh & Energetic', 'Mysterious & Dark'],
        key: 'mood'
    }
];

const familyKeywordMap = {
    'Fresh/Citrus': { prefixes: ['FRSH', 'CIT', 'AQUA'], keywords: ['citrus', 'fresh', 'bergamot', 'lemon', 'aquatic', 'marine', 'mint', 'green'] },
    'Floral': { prefixes: ['FLR'], keywords: ['floral', 'rose', 'jasmine', 'tuberose', 'peony', 'gardenia', 'violet', 'bloom'] },
    'Oud/Resin': { prefixes: ['OUD', 'OUDI', 'AMB', 'SMK'], keywords: ['oud', 'resin', 'incense', 'amber', 'labdanum', 'saffron'] },
    'Woody': { prefixes: ['WDS'], keywords: ['wood', 'cedar', 'sandalwood', 'oakmoss', 'vetiver', 'woody'] },
    'Vanilla/Gourmand': { prefixes: ['VAN', 'FRU'], keywords: ['vanilla', 'gourmand', 'caramel', 'tonka', 'sweet', 'honey', 'brown sugar'] },
    'Spicy': { prefixes: ['SPC', 'JZC'], keywords: ['spice', 'pepper', 'cinnamon', 'cardamom', 'nutmeg', 'tobacco', 'rum'] }
};

const occasionKeywordMap = {
    'Daily': ['daily wear', 'daily', 'casual', 'work'],
    'Evening': ['evening', 'night', 'date night', 'dark'],
    'Formal': ['formal', 'work', 'signature', 'luxury'],
    'Casual': ['casual', 'daily wear', 'weekend'],
    'Any': []
};

const seasonKeywordMap = {
    'Spring': ['spring', 'spring/summer'],
    'Summer': ['summer', 'spring/summer'],
    'Fall': ['fall', 'fall/winter'],
    'Winter': ['winter', 'fall/winter'],
    'All': []
};

const moodKeywordMap = {
    'Bold & Confident': { keywords: ['bold', 'confident', 'strong', 'power', 'dark', 'leather', 'tobacco', 'oud', 'masculine', 'statement'] },
    'Calm & Serene': { keywords: ['calm', 'serene', 'soft', 'gentle', 'clean', 'subtle', 'quiet', 'understated', 'light'] },
    'Romantic & Warm': { keywords: ['romantic', 'warm', 'date night', 'rose', 'vanilla', 'amber', 'intimate', 'sensuous', 'seductive'] },
    'Fresh & Energetic': { keywords: ['fresh', 'energy', 'vibrant', 'bright', 'crisp', 'clean', 'morning', 'summer', 'aquatic', 'citrus'] },
    'Mysterious & Dark': { keywords: ['mysterious', 'dark', 'smoke', 'smoky', 'incense', 'oud', 'leather', 'night', 'deep', 'noir', 'resin'] }
};

const intensityKeywordMap = {
    'Subtle & Close': { keywords: ['subtle', 'soft', 'close', 'gentle', 'mild', 'light', 'quiet'] },
    'Moderate': { keywords: ['moderate', 'balanced', 'versatile', 'easy', 'smooth'] },
    'Strong & Projecting': { keywords: ['strong', 'bold', 'powerful', 'intense', 'projecting', 'long-lasting', 'beast', 'rich', 'deep', 'unapologetically'] }
};

function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ''), 10);
}

function scoreProduct(product, answers) {
    let score = 0;
    const searchStr = `${product.notes} ${product.shortNotes} ${product.description} ${product.occasion}`.toLowerCase();
    const occasionStr = product.occasion.toLowerCase();

    const family = answers.family;
    const occ = answers.occasion;
    const season = answers.season;
    const mood = answers.mood;
    const intensity = answers.intensity;

    if (family && familyKeywordMap[family]) {
        const fm = familyKeywordMap[family];
        const codePrefix = product.code.split('/')[0];
        if (fm.prefixes.some(p => codePrefix === p)) {
            score += 30;
        }
        const kwMatch = fm.keywords.some(kw => searchStr.includes(kw));
        if (kwMatch) {
            score += 20;
        }
    }

    if (occ && occ !== 'Any') {
        const occKeywords = occasionKeywordMap[occ] || [];
        const occMatch = occKeywords.some(kw => occasionStr.includes(kw));
        if (occMatch) {
            score += 20;
        }
        if (occ === 'Daily' && (occasionStr.includes('daily') || occasionStr.includes('casual') || occasionStr.includes('work'))) {
            score += 5;
        }
        if (occ === 'Evening' && (occasionStr.includes('evening') || occasionStr.includes('night'))) {
            score += 5;
        }
    }

    if (season && season !== 'All') {
        const seasonKeywords = seasonKeywordMap[season] || [];
        const seasonMatch = seasonKeywords.some(kw => occasionStr.includes(kw));
        if (seasonMatch) {
            score += 15;
        }
    }

    if (mood && moodKeywordMap[mood]) {
        const moodKw = moodKeywordMap[mood].keywords;
        const moodMatch = moodKw.some(kw => searchStr.includes(kw));
        if (moodMatch) {
            score += 15;
        }
    }

    if (intensity && intensityKeywordMap[intensity]) {
        const intKw = intensityKeywordMap[intensity].keywords;
        const intMatch = intKw.some(kw => searchStr.includes(kw));
        if (intMatch) {
            score += 10;
        }
    }

    return score;
}

function getMatches(answers) {
    const scored = products.map(p => ({
        product: p,
        score: scoreProduct(p, answers)
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.filter(s => s.score > 0).slice(0, 4);
    if (top.length < 3) {
        const remainder = scored.filter(s => s.score === 0).slice(0, Math.max(0, 4 - top.length));
        top.push(...remainder);
    }
    return top;
}

function renderProgress(activeStep) {
    const container = document.getElementById('quiz-progress');
    let html = '';
    for (let i = 0; i < quizSteps.length; i++) {
        html += `<div class="qstep-dot ${i < activeStep ? 'done' : i === activeStep ? 'active' : ''}">${i < activeStep ? '&#10003;' : i + 1}</div>`;
        if (i < quizSteps.length - 1) {
            html += `<div class="qstep-bar ${i < activeStep ? 'filled' : ''}"></div>`;
        }
    }
    container.innerHTML = html;
}

function renderStep(stepIndex, answers) {
    const container = document.getElementById('quiz-steps');
    const step = quizSteps[stepIndex];
    const answer = answers[step.key];

    let optionsHtml = '';
    step.options.forEach(opt => {
        const selected = answer === opt ? 'selected' : '';
        optionsHtml += `<button class="q-option ${selected}" data-value="${opt}">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="quiz-step active">
            <div class="qstep-label">Step ${stepIndex + 1} of ${quizSteps.length}</div>
            <div class="qstep-question">${step.question}</div>
            <div class="q-options">${optionsHtml}</div>
            <div class="quiz-nav">
                <div class="qstep-counter">${stepIndex + 1} / ${quizSteps.length}</div>
                <div>
                    ${stepIndex > 0 ? `<button class="btn btn-ghost" id="q-prev">Back</button>` : ''}
                    <button class="btn btn-primary" id="q-next" ${!answer ? 'disabled style="opacity:0.4"' : ''}>${stepIndex < quizSteps.length - 1 ? 'Next' : 'See Results'}</button>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.q-option').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.q-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            answers[step.key] = btn.dataset.value;
            const nextBtn = document.getElementById('q-next');
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        });
    });

    const nextBtn = document.getElementById('q-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!answers[step.key]) return;
            if (stepIndex < quizSteps.length - 1) {
                renderProgress(stepIndex + 1);
                renderStep(stepIndex + 1, answers);
            } else {
                showResults(answers);
            }
        });
    }

    const prevBtn = document.getElementById('q-prev');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            renderProgress(stepIndex - 1);
            renderStep(stepIndex - 1, answers);
        });
    }
}

function showResults(answers) {
    renderProgress(quizSteps.length);

    const stepContainer = document.getElementById('quiz-steps');
    stepContainer.style.display = 'none';

    const resultsContainer = document.getElementById('q-results');
    resultsContainer.classList.add('active');

    const matches = getMatches(answers);

    const topScore = matches.length > 0 ? matches[0].score : 0;
    const grade = topScore > 60 ? 'exceptional' : topScore > 30 ? 'strong' : 'suggested';

    localStorage.setItem('si_quiz_answers', JSON.stringify(answers));
    localStorage.setItem('si_quiz_results', JSON.stringify(matches.map(m => ({
        code: m.product.code,
        score: m.score
    }))));

    let cardsHtml = '';
    matches.forEach((match, idx) => {
        const p = match.product;
        cardsHtml += `
            <div class="q-result-card" data-code="${p.code}">
                <div class="qrc-img">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="qrc-code">${p.code}</div>
                <div class="qrc-name">${p.name}</div>
                <div class="qrc-notes">${p.shortNotes}</div>
                <div class="qrc-footer">
                    <span class="qrc-price">${p.price}</span>
                    <span class="qrc-score">${idx === 0 ? 'Best Match' : Math.round(match.score / topScore * 100) + '% Match'}</span>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = `
        <div class="q-results-header">
            <h2>Your <em>Compositions</em></h2>
            <p>Based on your responses, we recommend these fragrances.</p>
        </div>
        <div class="q-results-grid">${cardsHtml}</div>
        <div class="q-restart">
            <button class="btn btn-ghost" id="q-restart">Retake the Quiz</button>
        </div>
    `;

    resultsContainer.querySelectorAll('.q-result-card').forEach(card => {
        card.addEventListener('click', () => {
            const code = card.dataset.code;
            const isInPages = window.location.pathname.includes('/pages/');
            const targetUrl = isInPages ? `../product.html?id=${code}` : `product.html?id=${code}`;
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

    const restartBtn = document.getElementById('q-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => initQuiz());
    }

    requestAnimationFrame(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function initQuiz() {
    const stepContainer = document.getElementById('quiz-steps');
    stepContainer.style.display = 'block';

    const resultsContainer = document.getElementById('q-results');
    resultsContainer.classList.remove('active');
    resultsContainer.innerHTML = '';

    const answers = {};
    renderProgress(0);
    renderStep(0, answers);
}

document.addEventListener('DOMContentLoaded', () => {
    const hasResults = localStorage.getItem('si_quiz_results');
    if (hasResults) {
        try {
            const savedAnswers = JSON.parse(localStorage.getItem('si_quiz_answers'));
            if (savedAnswers && Object.keys(savedAnswers).length === quizSteps.length) {
                const resultsContainer = document.getElementById('q-results');
                resultsContainer.classList.add('active');
                document.getElementById('quiz-steps').style.display = 'none';
                renderProgress(quizSteps.length);
                showResults(savedAnswers);
                return;
            }
        } catch (e) {}
    }
    initQuiz();
});
