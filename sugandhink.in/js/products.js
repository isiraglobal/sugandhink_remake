const baseProducts = [
    {
        "name": "Wild Blue / 01",
        "code": "FRSH/01",
        "topNotes": "calabrian bergamot, pepper",
        "heartNotes": "sichuan pepper, lavender, geranium",
        "baseNotes": "ambroxan, cedar, labdanum",
        "notes": "calabrian bergamot, pepper, sichuan pepper, lavender, geranium, ambroxan, cedar, labdanum",
        "shortNotes": "bergamot \u00b7 pepper \u00b7 cedar",
        "memory": "open desert",
        "description": "A sharp fresh-spicy fragrance defined by bergamot and pepper, grounded in the warmth of ambroxan. Bold, modern, and magnetic.",
        "occasion": "daily wear, date night, all-season",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRSH-01.png"
    },
    {
        "name": "Declaration / 02",
        "code": "SPC/02",
        "topNotes": "bergamot, neroli, bitter orange",
        "heartNotes": "cardamom, iris, ginger, cinnamon",
        "baseNotes": "vetiver, tea, cedar, leather, amber",
        "notes": "bergamot, neroli, bitter orange, cardamom, iris, ginger, cinnamon, vetiver, tea, cedar, leather, amber",
        "shortNotes": "vetiver \u00b7 iris \u00b7 spice",
        "memory": "ink and wood",
        "description": "A sophisticated spicy-woody with a distinctive iris and vetiver drydown. Complex, refined and unmistakably classic.",
        "occasion": "work, formal, evening",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/SPC-02.png"
    },
    {
        "name": "Eternity Men / 03",
        "code": "FRSH/03",
        "topNotes": "lavender, lemon, bergamot",
        "heartNotes": "geranium, sage, basil",
        "baseNotes": "sandalwood, amber, musk",
        "notes": "lavender, lemon, bergamot, geranium, sage, basil, sandalwood, amber, musk",
        "shortNotes": "lavender \u00b7 herbs \u00b7 musk",
        "memory": "clean morning",
        "description": "A timeless aromatic fougere with a clean herbal heart and warm woody base. Universally pleasing and easy to wear.",
        "occasion": "daily wear, work, all-season",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRSH-03.png"
    },
    {
        "name": "Bleu Noir / 04",
        "code": "WDS/04",
        "topNotes": "grapefruit, lemon, mint, bergamot, pink pepper",
        "heartNotes": "ginger, nutmeg, jasmine",
        "baseNotes": "incense, amber, cedar, sandalwood, patchouli, labdanum",
        "notes": "grapefruit, lemon, mint, bergamot, pink pepper, ginger, nutmeg, jasmine, incense, amber, cedar, sandalwood, patchouli, labdanum",
        "shortNotes": "citrus \u00b7 ginger \u00b7 incense",
        "memory": "tailored suit",
        "description": "A refined woody-aromatic that balances crisp citrus with deep incense and amber woods. Sophisticated, versatile and eternally elegant.",
        "occasion": "work, formal, date night, all-season",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/WDS-04.png"
    },
    {
        "name": "Bloom Rouge / 05",
        "code": "FLR/05",
        "topNotes": "rangoon creeper",
        "heartNotes": "tuberose, jasmine sambac, nandia flower",
        "baseNotes": "musk, sandalwood",
        "notes": "rangoon creeper, tuberose, jasmine sambac, nandia flower, musk, sandalwood",
        "shortNotes": "tuberose \u00b7 jasmine \u00b7 musk",
        "memory": "garden at dusk",
        "description": "A bold lush white floral built on tuberose and jasmine sambac. Rich, feminine and unapologetically full.",
        "occasion": "date night, evening, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FLR-05.png"
    },
    {
        "name": "Voyage / 06",
        "code": "AQUA/06",
        "topNotes": "green leaves, apple",
        "heartNotes": "lotus, mimosa",
        "baseNotes": "musk, cedar, oakmoss, amber",
        "notes": "green leaves, apple, lotus, mimosa, musk, cedar, oakmoss, amber",
        "shortNotes": "apple \u00b7 lotus \u00b7 cedar",
        "memory": "open water",
        "description": "A clean aquatic with a crisp apple-green opening and warm cedar-musk drydown. Fresh, affordable and crowd-pleasing.",
        "occasion": "daily wear, casual, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/AQUA-06.png"
    },
    {
        "name": "Circe / 07",
        "code": "FRU/07",
        "topNotes": "passionfruit, peach, pear, raspberry, cassis",
        "heartNotes": "lily-of-the-valley",
        "baseNotes": "musk, sandalwood, vanilla, heliotrope",
        "notes": "passionfruit, peach, pear, raspberry, cassis, lily-of-the-valley, musk, sandalwood, vanilla, heliotrope",
        "shortNotes": "fruit \u00b7 musk \u00b7 vanilla",
        "memory": "beach bar cocktail",
        "description": "A vibrant fruity-musk extrait bursting with tropical fruit and anchored in soft vanilla-sandalwood. A statement unisex with serious longevity.",
        "occasion": "date night, evening, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRU-07.png"
    },
    {
        "name": "Viva Juicy / 08",
        "code": "FRU/08",
        "topNotes": "wild berries, mandarin",
        "heartNotes": "honeysuckle, gardenia, jasmine",
        "baseNotes": "vanilla, caramel, sandalwood, musk",
        "notes": "wild berries, mandarin, honeysuckle, gardenia, jasmine, vanilla, caramel, sandalwood, musk",
        "shortNotes": "berry \u00b7 musk \u00b7 caramel",
        "memory": "candy blooms",
        "description": "Sweet gourmand-floral with juicy berry top and vanilla-caramel drydown. Fun, youthful and highly wearable.",
        "occasion": "casual, daily wear, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRU-08.png"
    },
    {
        "name": "Her Bloom / 09",
        "code": "FRU/09",
        "topNotes": "strawberry, blueberry, raspberry",
        "heartNotes": "jasmine, violet",
        "baseNotes": "amber, musk",
        "notes": "strawberry, blueberry, raspberry, jasmine, violet, amber, musk",
        "shortNotes": "berry \u00b7 violet \u00b7 amber",
        "memory": "city autumn",
        "description": "A vibrant berry-floral with a warm musky amber finish. Youthful, addictive and a constant compliment-getter.",
        "occasion": "daily wear, casual, date night",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRU-09.png"
    },
    {
        "name": "Royal Hayati / 10",
        "code": "SPC/10",
        "topNotes": "pink pepper, bergamot, ginger, nutmeg",
        "heartNotes": "cedar, incense, labdanum",
        "baseNotes": "musk, ambergris, amber",
        "notes": "pink pepper, bergamot, ginger, nutmeg, cedar, incense, labdanum, musk, ambergris, amber",
        "shortNotes": "cedar \u00b7 incense \u00b7 amber",
        "memory": "royal smoke",
        "description": "A bold oriental-spicy with pepper and bergamot over deep incense and warm amber. Rich, unisex and exceptional value.",
        "occasion": "evening, casual, date night",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/SPC-10.png"
    },
    {
        "name": "CR Seven / 11",
        "code": "FRSH/11",
        "topNotes": "lavender, cardamom, bergamot",
        "heartNotes": "tobacco, cinnamon, cedar, iris",
        "baseNotes": "vanilla, musk",
        "notes": "lavender, cardamom, bergamot, tobacco, cinnamon, cedar, iris, vanilla, musk",
        "shortNotes": "iris \u00b7 tobacco \u00b7 vanilla",
        "memory": "confident evening",
        "description": "An aromatic fougere with a lavender-tobacco heart and smooth vanilla base. Warm, powdery and punches above its price.",
        "occasion": "date night, evening, casual",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRSH-11.png"
    },
    {
        "name": "Bombshell / 12",
        "code": "FRU/12",
        "topNotes": "passionfruit, grapefruit, strawberry, tangerine",
        "heartNotes": "peony, vanilla orchid, jasmine",
        "baseNotes": "musk, woody notes",
        "notes": "passionfruit, grapefruit, strawberry, tangerine, peony, vanilla orchid, jasmine, musk, woody notes",
        "shortNotes": "fruit \u00b7 peony \u00b7 musk",
        "memory": "summer glow",
        "description": "A bright fruity-floral with a tropical burst that dries into soft floral musk. Vibrant, feminine and instantly recognizable.",
        "occasion": "casual, daily wear, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRU-12.png"
    },
    {
        "name": "Belle Paris / 13",
        "code": "FRU/13",
        "topNotes": "strawberry, raspberry, pear, bergamot",
        "heartNotes": "datura, peony, jasmine sambac",
        "baseNotes": "white musk, ambroxan, patchouli",
        "notes": "strawberry, raspberry, pear, bergamot, datura, peony, jasmine sambac, white musk, ambroxan, patchouli",
        "shortNotes": "berry \u00b7 peony \u00b7 musk",
        "memory": "city night",
        "description": "A modern chypre-fruity floral with a dazzling berry opening and a provocative patchouli base. Seductive and Parisian.",
        "occasion": "date night, evening, casual",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FRU-13.png"
    },
    {
        "name": "Ocean Drift / 14",
        "code": "AQUA/14",
        "topNotes": "mint, lavender, coriander",
        "heartNotes": "geranium, neroli, jasmine",
        "baseNotes": "amber, musk, cedar, sandalwood",
        "notes": "mint, lavender, coriander, geranium, neroli, jasmine, amber, musk, cedar, sandalwood",
        "shortNotes": "mint \u00b7 aquatic \u00b7 woods",
        "memory": "cold wave",
        "description": "A pioneering aquatic defined by cool mint and aromatic herbs over a warm woody-musk base. Crisp and enduringly versatile.",
        "occasion": "daily wear, casual, work",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/AQUA-14.png"
    },
    {
        "name": "Oud Noir / 15",
        "code": "OUD/15",
        "topNotes": "saffron, bergamot",
        "heartNotes": "rose, oud",
        "baseNotes": "sandalwood, musk, amber",
        "notes": "saffron, bergamot, rose, oud, sandalwood, musk, amber",
        "shortNotes": "oud \u00b7 saffron \u00b7 amber",
        "memory": "dusk smoke",
        "description": "A rich African-inspired oud with saffron and rose over warm amber and sandalwood. Deep, smoky and mesmerizing.",
        "occasion": "evening, occasions, fall/winter",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/OUD-15.png"
    },
    {
        "name": "Havana / 16",
        "code": "SMK/16",
        "topNotes": "bergamot, rum",
        "heartNotes": "tobacco, leather, cedarwood",
        "baseNotes": "vanilla, amber, oakmoss",
        "notes": "bergamot, rum, tobacco, leather, cedarwood, vanilla, amber, oakmoss",
        "shortNotes": "tobacco \u00b7 leather \u00b7 rum",
        "memory": "private lounge",
        "description": "A bold fragrance evoking rum, tobacco and aged leather with a warm vanilla-amber drydown. Confident, sensuous and unmistakable.",
        "occasion": "evening, date night, fall/winter",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/SMK-16.png"
    },
    {
        "name": "Sanaya / 17",
        "code": "FLR/17",
        "topNotes": "bergamot, citrus",
        "heartNotes": "rose, jasmine, oud",
        "baseNotes": "musk, amber, sandalwood",
        "notes": "bergamot, citrus, rose, jasmine, oud, musk, amber, sandalwood",
        "shortNotes": "rose \u00b7 oud \u00b7 amber",
        "memory": "warm intimacy",
        "description": "A Middle Eastern floral-woody balancing jasmine and rose with rich oud and warm amber musk. Intimate, warm and long-lasting.",
        "occasion": "evening, date night, casual",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/FLR-17.png"
    },
    {
        "name": "Weekend Men / 18",
        "code": "CIT/18",
        "topNotes": "lemon, grapefruit, bergamot, pineapple, melon",
        "heartNotes": "ivy, oakmoss, sandalwood",
        "baseNotes": "honey, musk, amber",
        "notes": "lemon, grapefruit, bergamot, pineapple, melon, ivy, oakmoss, sandalwood, honey, musk, amber",
        "shortNotes": "citrus \u00b7 green \u00b7 musk",
        "memory": "slow saturday",
        "description": "A citrus-driven casual with a fresh fruity opening and warm honey-musk drydown. Easy, relaxed and supremely wearable.",
        "occasion": "casual, daily wear, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/CIT-18.png"
    },
    {
        "name": "Icon Absolute / 19",
        "code": "OUD/19",
        "topNotes": "black pepper, bergamot",
        "heartNotes": "saffron, black rose, jasmine",
        "baseNotes": "oud, leather, tobacco",
        "notes": "black pepper, bergamot, saffron, black rose, jasmine, oud, leather, tobacco",
        "shortNotes": "pepper \u00b7 oud \u00b7 leather",
        "memory": "dark power",
        "description": "A dark oriental woody with saffron and black rose over deep oud and leather. Bold, masculine and unforgettable.",
        "occasion": "evening, formal, date night",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/OUD-19.png"
    },
    {
        "name": "Dao Wood / 20",
        "code": "WDS/20",
        "topNotes": "cypress, spices",
        "heartNotes": "myrtle, rosewood, sandalwood",
        "baseNotes": "sandalwood, white musk, cedar",
        "notes": "cypress, spices, myrtle, rosewood, sandalwood, white musk, cedar",
        "shortNotes": "sandal \u00b7 cedar \u00b7 spice",
        "memory": "ancient forest",
        "description": "A serene woody fragrance centered on precious sandalwood and cedar. Calm, natural and beautifully understated.",
        "occasion": "casual, daily wear, work",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/WDS-20.png"
    },
    {
        "name": "Icon / 21",
        "code": "WDS/21",
        "topNotes": "grapefruit, bergamot, juniper",
        "heartNotes": "rose, guaiac wood",
        "baseNotes": "vetiver, musk, sandalwood, cedar",
        "notes": "grapefruit, bergamot, juniper, rose, guaiac wood, vetiver, musk, sandalwood, cedar",
        "shortNotes": "citrus \u00b7 wood \u00b7 vetiver",
        "memory": "first impression",
        "description": "A fresh woody aromatic with crisp citrus opening and a sophisticated rose-wood heart. Clean, modern and quietly impressive.",
        "occasion": "work, casual, date night",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/WDS-21.png"
    },
    {
        "name": "Mizan / 22",
        "code": "OUD/22",
        "topNotes": "saffron, spices",
        "heartNotes": "rose, jasmine, oud",
        "baseNotes": "musk, ambergris, sandalwood",
        "notes": "saffron, spices, rose, jasmine, oud, musk, ambergris, sandalwood",
        "shortNotes": "saffron \u00b7 oud \u00b7 musk",
        "memory": "amber tradition",
        "description": "An authentic oriental attar with creamy saffron and sandalwood accord. Traditional, deeply complex and exceptional value.",
        "occasion": "evening, date night, occasions",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/OUD-22.png"
    },
    {
        "name": "Night Lounge / 23",
        "code": "JZC/23",
        "topNotes": "pink pepper, neroli, lemon",
        "heartNotes": "rum, vetiver, clary sage",
        "baseNotes": "tobacco leaf, vanilla, styrax",
        "notes": "pink pepper, neroli, lemon, rum, vetiver, clary sage, tobacco leaf, vanilla, styrax",
        "shortNotes": "rum \u00b7 tobacco \u00b7 vanilla",
        "memory": "dim jazz bar",
        "description": "A warm-spicy fragrance inspired by a Brooklyn jazz club. Rum and tobacco over soft vanilla \u2014 intimate and effortlessly cool.",
        "occasion": "evening, date night, fall/winter",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/JZC-23.png"
    },
    {
        "name": "Blue Sea / 24",
        "code": "AQUA/24",
        "topNotes": "lime, lemon, bergamot, neroli, mandarin",
        "heartNotes": "sea notes, jasmine, rosemary, calone",
        "baseNotes": "white musk, cedar, patchouli, amber",
        "notes": "lime, lemon, bergamot, neroli, mandarin, sea notes, jasmine, rosemary, calone, white musk, cedar, patchouli, amber",
        "shortNotes": "citrus \u00b7 marine \u00b7 musk",
        "memory": "mediterranean sea",
        "description": "The iconic aquatic that started a revolution. Bright citrus and sea spray dry into a warm woody musk. Universally loved and effortlessly wearable.",
        "occasion": "daily wear, casual, spring/summer",
        "price": "\u20b9799",
        "samplePrice": "",
        "image": "Products/AQUA-24.png"
    },
    {
        "name": "Vanilla Luxe / 01",
        "code": "VAN/01",
        "topNotes": "vanilla, brown sugar",
        "heartNotes": "orchid, tonka bean",
        "baseNotes": "amber, sandalwood, musk",
        "notes": "vanilla, brown sugar, orchid, tonka bean, amber, sandalwood, musk",
        "shortNotes": "vanilla \u00b7 amber \u00b7 musk",
        "memory": "golden maturation",
        "description": "A smooth vanilla built around warmth and softness. Skin-close, sweet and deeply addictive.",
        "occasion": "Daily Wear",
        "price": "\u20b918,500",
        "samplePrice": "\u20b911,100",
        "image": "Products/VAN-01.png"
    },
    {
        "name": "White Bloom / 07",
        "code": "FLR/07",
        "topNotes": "tuberose, jasmine",
        "heartNotes": "gardenia, honeysuckle",
        "baseNotes": "musk, sandalwood",
        "notes": "tuberose, jasmine, gardenia, honeysuckle, musk, sandalwood",
        "shortNotes": "tuberose \u00b7 jasmine \u00b7 musk",
        "memory": "monastic devotion",
        "description": "Dense white florals — natural, grand, and full. Rich spring bloom captured without any sharp edges.",
        "occasion": "Day, Signature",
        "price": "\u20b921,000",
        "samplePrice": "\u20b912,600",
        "image": "Products/FLR-07.png"
    },
    {
        "name": "Oud Royal / 09",
        "code": "OUD/09",
        "topNotes": "indonesian oud, saffron",
        "heartNotes": "leather, pepper, spice",
        "baseNotes": "resin, amber, sandalwood",
        "notes": "indonesian oud, saffron, leather, resin, pepper, spice, amber, sandalwood",
        "shortNotes": "oud \u00b7 saffron \u00b7 leather",
        "memory": "sovereign essence",
        "description": "A deep, sovereign essence constructed around pure Indonesian Oud wood. Maturing in silence for twelve months, it is lifted with Kashmir Saffron, peppered with warm spices, and wrapped in rich, masculine leather and dark resin.",
        "occasion": "Signature",
        "price": "\u20b924,000",
        "samplePrice": "",
        "image": "Products/OUD-09.png"
    },
    {
        "name": "Dark Amber / 12",
        "code": "AMB/12",
        "topNotes": "amber, incense",
        "heartNotes": "pepper, labdanum",
        "baseNotes": "cedar, vetiver, musk",
        "notes": "amber, incense, pepper, labdanum, cedar, vetiver, musk",
        "shortNotes": "amber \u00b7 incense \u00b7 musk",
        "memory": "winter evening",
        "description": "Dark, smoky, and deep. Built for strong presence and long-lasting trail.",
        "occasion": "Evening, Winter",
        "price": "\u20b926,500",
        "samplePrice": "\u20b915,900",
        "image": "Products/AMB-12.png"
    },
    {
        "name": "Oud Intense / 15",
        "code": "OUDI/15",
        "topNotes": "oud, leather",
        "heartNotes": "pepper, cardamom",
        "baseNotes": "patchouli, amber, sandalwood",
        "notes": "oud, leather, pepper, cardamom, patchouli, amber, sandalwood",
        "shortNotes": "oud \u00b7 leather \u00b7 amber",
        "memory": "quiet dominance",
        "description": "Strong oud composition with spicy lift and smooth base. Power held back, quiet dominance.",
        "occasion": "Luxury, Evening",
        "price": "\u20b928,000",
        "samplePrice": "\u20b916,800",
        "image": "Products/OUD-15.png"
    }
];

let loadedProducts = [];
try {
    // Clear stale cache that may contain originalName from previous versions
    const cached = JSON.parse(localStorage.getItem('si_products'));
    // Invalidate if cached entries still have the banned originalName field
    if (cached && Array.isArray(cached) && cached.length > 0 && !cached[0].hasOwnProperty('originalName')) {
        loadedProducts = cached;
    } else {
        loadedProducts = null;
    }
} catch (e) {
    loadedProducts = null;
}

if (!loadedProducts || !Array.isArray(loadedProducts) || loadedProducts.length === 0) {
    loadedProducts = [...baseProducts];
    localStorage.setItem('si_products', JSON.stringify(baseProducts));
}

// Extremely robust ES6 CSV parser
function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i+1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') {
                i++;
            }
            lines.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') {
        lines.push(row);
    }

    if (lines.length < 2) return [];

    const headers = lines[0].map(h => h.trim());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i];
        if (values.length < headers.length) continue;

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = (values[index] || '').trim();
        });

        const code = obj['Code'] || '';
        if (!code) continue;

        const rawPrice = obj['Price 50mL'] || '799';
        const formattedPrice = rawPrice.startsWith('₹') 
            ? rawPrice 
            : '₹' + parseInt(rawPrice.replace(/[^\d]/g, ''), 10).toLocaleString('en-IN');

        const samplePriceVal = obj['Sample 30 mL'] ? obj['Sample 30 mL'].replace(/[^\d]/g, '') : '';
        const formattedSamplePrice = samplePriceVal
            ? '₹' + parseInt(samplePriceVal, 10).toLocaleString('en-IN')
            : '';

        items.push({
            name: obj['Name'] || '',
            // NOTE: 'Original Name' (competitor brand names) and 'Previous Names' are
            // intentionally NOT included — only the Sugandh Ink 'Name' is used everywhere.
            code: code,
            topNotes: obj['Top Notes'] || '',
            heartNotes: obj['Heart Notes'] || '',
            baseNotes: obj['Base Notes'] || '',
            notes: obj['Full Notes'] || '',
            shortNotes: obj['Short Notes'] || '',
            memory: obj['Memory'] || '',
            description: obj['Description'] || '',
            occasion: obj['Occasion'] || '',
            price: formattedPrice,
            samplePrice: formattedSamplePrice,
            image: `Products/${code.replace('/', '-')}.png`
        });
    }
    return items;
}

// Background sync to fetch from unified data-perfume.csv database dynamically
async function syncWithCSV() {
    try {
        const pathPrefix = window.location.pathname.includes('/admin.sugandhink.in') ? '../sugandhink.in/' : '';
        const response = await fetch(pathPrefix + 'data-perfume.csv');
        if (!response.ok) return;
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        if (parsed && parsed.length > 0) {
            localStorage.setItem('si_products', JSON.stringify(parsed));
            // Update loaded array in memory in-place
            loadedProducts.length = 0;
            loadedProducts.push(...parsed);
            window.dispatchEvent(new CustomEvent('products:updated', { detail: parsed }));
        }
    } catch (e) {
        console.warn('Background CSV sync failed, using static product definitions.', e);
    }
}

// Run background sync
syncWithCSV();

export const products = loadedProducts;
