const ingredientData = [
    {
        id: 'amber',
        name: 'Amber',
        scentProfile: 'base',
        description: 'A warm, sweet, resinous accord traditionally composed from labdanum, benzoin, and vanilla. Amber provides depth, sensuality, and lasting power to fragrance compositions. True Baltic amber is fossilised tree resin; modern perfumery recreates its character through carefully balanced botanical accords.',
        origin: 'Fossil resin (Baltic) / Botanical accord',
        usage: 'Used as a foundational base note in oriental, gourmand, and woody compositions. Provides warmth, depth, and excellent fixative properties.',
        products: ['AMB/12'],
        productsList: ['Dark Amber / 12']
    },
    {
        id: 'ambrette',
        name: 'Ambrette',
        scentProfile: 'base',
        description: 'Derived from the seeds of the Abelmoschus moschatus plant, ambrette seed oil produces a musky, floral-sweet aroma with subtle wine-like undertones. It is one of the few plant-based materials that genuinely mimics animalic musk, making it a prized ingredient in natural perfumery.',
        origin: 'India, Ecuador',
        usage: 'Used as a natural alternative to animal musk in base accords. Adds a warm, skin-like sensuality to compositions.',
        products: [],
        productsList: []
    },
    {
        id: 'ambroxan',
        name: 'Ambroxan',
        scentProfile: 'base',
        description: 'A synthetic molecule first isolated from ambergris - a rare whale byproduct. Ambroxan carries a clean, salty-sweet, woody character with remarkable diffusive power. It is the defining molecule behind many modern fresh-woody fragrances and provides excellent longevity and sillage.',
        origin: 'Synthetic (ambergris analogue)',
        usage: 'Used as a base and heart note to add clean woody warmth, lift, and projection. Often forms the backbone of fresh-woody masculine compositions.',
        products: ['FRSH/01'],
        productsList: ['Wild Blue / 01']
    },
    {
        id: 'bergamot',
        name: 'Bergamot',
        scentProfile: 'top',
        description: 'A citrus fruit grown primarily in Calabria, Italy, whose cold-pressed peel yields a bright, complex essential oil. Bergamot is distinguished from other citrus notes by its green, slightly floral character and subtle lavender-like undertone from naturally occurring linalool and linalyl acetate.',
        origin: 'Calabria, Italy',
        usage: 'One of the most widely used top notes in perfumery. Provides an immediate fresh, sparkling opening that bridges citrus and floral accords.',
        products: ['FRSH/01', 'SPC/02', 'FRSH/03', 'WDS/04', 'SPC/10', 'FRSH/11', 'FRU/13', 'SMK/16', 'FLR/17', 'CIT/18', 'OUD/19', 'WDS/21', 'AQUA/24', 'OUD/15'],
        productsList: ['Wild Blue / 01', 'Declaration / 02', 'Eternity Men / 03', 'Bleu Noir / 04', 'Royal Hayati / 10', 'CR Seven / 11', 'Belle Paris / 13', 'Havana / 16', 'Sanaya / 17', 'Weekend Men / 18', 'Icon Absolute / 19', 'Icon / 21', 'Blue Sea / 24', 'Oud Noir / 15']
    },
    {
        id: 'cardamom',
        name: 'Cardamom',
        scentProfile: 'heart',
        description: 'A spice derived from the seeds of Elettaria cardamomum, native to the Western Ghats of India and Sri Lanka. Cardamom essential oil presents a warm, aromatic, slightly camphoraceous character with citrus and eucalyptus-like facets. It bridges spice and citrus families with elegance.',
        origin: 'Western Ghats, India; Sri Lanka',
        usage: 'Used primarily in heart notes to add aromatic warmth, complexity, and a subtle spicy-fresh lift. Features in oriental, fougere, and woody compositions.',
        products: ['SPC/02', 'FRSH/11', 'OUDI/15'],
        productsList: ['Declaration / 02', 'CR Seven / 11', 'Oud Intense / 15']
    },
    {
        id: 'cedar',
        name: 'Cedar',
        scentProfile: 'base',
        description: 'Distilled from the wood of various cedar species (primarily Cedrus atlantica and Juniperus virginiana). Cedarwood oil is warm, dry, woody, and slightly smoky with a persistent, calming character. It is one of the most versatile base notes in perfumery, providing structure and longevity.',
        origin: 'Atlas Mountains, Morocco; North America',
        usage: 'A foundational base note that provides dry woody structure, longevity, and subtle smoky undertones. Essential in woody, fougere, and fresh compositions.',
        products: ['FRSH/01', 'SPC/02', 'WDS/04', 'AQUA/06', 'SPC/10', 'FRSH/11', 'AMB/12', 'AQUA/14', 'WDS/20', 'WDS/21', 'AQUA/24'],
        productsList: ['Wild Blue / 01', 'Declaration / 02', 'Bleu Noir / 04', 'Voyage / 06', 'Royal Hayati / 10', 'CR Seven / 11', 'Dark Amber / 12', 'Ocean Drift / 14', 'Dao Wood / 20', 'Icon / 21', 'Blue Sea / 24']
    },
    {
        id: 'cinnamon',
        name: 'Cinnamon',
        scentProfile: 'heart',
        description: 'Derived from the inner bark of Cinnamomum cassia or Cinnamomum verum trees. Cinnamon essential oil is warm, sweet, and intensely spicy with a distinctive woody undertone. In perfumery, it adds a radiant, sensual heat that evokes comfort and exoticism.',
        origin: 'Sri Lanka, India, China',
        usage: 'Used in heart notes to impart warmth, spiciness, and a sweet woody character. Features prominently in oriental, gourmand, and spicy compositions.',
        products: ['SPC/02', 'FRSH/11'],
        productsList: ['Declaration / 02', 'CR Seven / 11']
    },
    {
        id: 'frankincense',
        name: 'Frankincense',
        scentProfile: 'heart',
        description: 'A resin harvested from Boswellia trees native to the Arabian Peninsula and the Horn of Africa. Frankincense essential oil is balsamic, slightly citrusy, and deeply meditative with a clean, ethereal quality. It has been revered for millennia in spiritual and medicinal traditions.',
        origin: 'Oman, Somalia, Ethiopia',
        usage: 'Used in heart and base accords to provide a resinous, meditative, slightly citrus-balsamic character. Central to incense-themed and contemplative compositions.',
        products: [],
        productsList: []
    },
    {
        id: 'geranium',
        name: 'Geranium',
        scentProfile: 'heart',
        description: 'Distilled from the leaves of Pelargonium graveolens, primarily cultivated in Egypt, Reunion, and India. Geranium oil offers a green, floral-rosy character with minty and slightly fruity undertones. It functions as a beautiful bridge between rose-like florals and aromatic green notes.',
        origin: 'Egypt, Reunion Island, India',
        usage: 'A middle note that adds green floralcy, balancing rose-like sweetness with fresh minty undertones. Used extensively in fougere and chypre compositions.',
        products: ['FRSH/01', 'FRSH/03', 'AQUA/14'],
        productsList: ['Wild Blue / 01', 'Eternity Men / 03', 'Ocean Drift / 14']
    },
    {
        id: 'grapefruit',
        name: 'Grapefruit',
        scentProfile: 'top',
        description: 'Cold-pressed from the peel of Citrus paradisi. Grapefruit essential oil is bright, tart, and slightly bitter with a characteristic sulphurous note that adds distinctiveness. It provides an energetic, modern opening that feels both fresh and sophisticated.',
        origin: 'Florida, USA; Israel, Brazil',
        usage: 'A top note that delivers a bright, bitter-citrus opening with excellent projection. Often used in fresh, aquatic, and modern woody compositions.',
        products: ['WDS/04', 'FRU/12', 'CIT/18', 'WDS/21'],
        productsList: ['Bleu Noir / 04', 'Bombshell / 12', 'Weekend Men / 18', 'Icon / 21']
    },
    {
        id: 'jasmine',
        name: 'Jasmine',
        scentProfile: 'heart',
        description: 'Two primary species are used in perfumery: Jasminum grandiflorum (delicate, honeyed) and Jasminum sambac (heady, fruity). Harvested by hand before dawn, jasmine is the most labour-intensive floral material in existence. Its complex aroma contains indolic, floral, and fruity facets.',
        origin: 'Grasse, France; India; Egypt',
        usage: 'The most important floral heart note in perfumery. Adds rich, intoxicating floralcy with indolic depth. Central to white floral and oriental compositions.',
        products: ['WDS/04', 'FRU/08', 'FRU/09', 'FRU/12', 'AQUA/14', 'FLR/17', 'OUD/19', 'OUD/22', 'AQUA/24', 'FLR/07'],
        productsList: ['Bleu Noir / 04', 'Viva Juicy / 08', 'Her Bloom / 09', 'Bombshell / 12', 'Ocean Drift / 14', 'Sanaya / 17', 'Icon Absolute / 19', 'Mizan / 22', 'Blue Sea / 24', 'White Bloom / 07']
    },
    {
        id: 'labdanum',
        name: 'Labdanum',
        scentProfile: 'base',
        description: 'A resin obtained from the leaves and twigs of Cistus ladaniferus, a shrub native to the Mediterranean. Labdanum produces a warm, amber-sweet, leathery aroma with subtle fruity and animalic undertones. It is the single most important material for creating amber accords in natural perfumery.',
        origin: 'Mediterranean basin (Spain, Portugal, Greece)',
        usage: 'The primary building block of amber accords. Provides warmth, sweetness, and tenacity to base notes. Adds a subtle leather-animalic depth.',
        products: ['FRSH/01', 'WDS/04', 'SPC/10', 'AMB/12'],
        productsList: ['Wild Blue / 01', 'Bleu Noir / 04', 'Royal Hayati / 10', 'Dark Amber / 12']
    },
    {
        id: 'lavender',
        name: 'Lavender',
        scentProfile: 'top',
        description: 'Steam-distilled from Lavandula angustifolia, primarily cultivated in Provence, France, and Kashmir, India. Lavender essential oil is clean, herbaceous, floral-sweet with subtle camphoraceous undertones. It is the defining note of the fougere family and a staple of classical perfumery.',
        origin: 'Provence, France; Kashmir, India',
        usage: 'A versatile top and heart note that provides clean herbaceous floralcy. Essential in fougere, aromatic, and fresh compositions.',
        products: ['FRSH/01', 'FRSH/03', 'FRSH/11', 'AQUA/14'],
        productsList: ['Wild Blue / 01', 'Eternity Men / 03', 'CR Seven / 11', 'Ocean Drift / 14']
    },
    {
        id: 'leather',
        name: 'Leather',
        scentProfile: 'base',
        description: 'In perfumery, leather is typically a complex accord built from birch tar, styrax, castoreum analogues, and woody materials. The scent evokes tanned hide, smoke, and warm animalic textures. It conveys rugged luxury, sophistication, and quiet authority.',
        origin: 'Accord (birch tar, styrax, tobacco)',
        usage: 'A powerful base note that adds smoky, animalic warmth and sophistication. Central to leather, chypre, and oriental compositions.',
        products: ['SPC/02', 'SMK/16', 'OUD/19', 'OUD/09', 'OUDI/15'],
        productsList: ['Declaration / 02', 'Havana / 16', 'Icon Absolute / 19', 'Oud Royal / 09', 'Oud Intense / 15']
    },
    {
        id: 'lemon',
        name: 'Lemon',
        scentProfile: 'top',
        description: 'Cold-pressed from the peel of Citrus limon. Lemon essential oil is sharp, bright, and cleansing with a characteristic zesty freshness. It is among the most universally recognised and appreciated scents, providing immediate lift and clarity to any composition.',
        origin: 'Sicily, Italy; California, USA; India',
        usage: 'A classic top note that provides sharp, clean citrus lift. Pairs exceptionally well with lavender, herbs, and woody bases.',
        products: ['FRSH/03', 'WDS/04', 'CIT/18', 'AQUA/24'],
        productsList: ['Eternity Men / 03', 'Bleu Noir / 04', 'Weekend Men / 18', 'Blue Sea / 24']
    },
    {
        id: 'musk',
        name: 'Musk',
        scentProfile: 'base',
        description: 'Modern perfumery uses synthetic musks (white musks, nitro musks) and plant-based alternatives like ambrette seed to achieve the elusive warm, animalic-sweet character. Musk conveys clean skin, warmth, and intimacy. It is the invisible thread that binds a fragrance to the wearer.',
        origin: 'Synthetic / botanical alternatives',
        usage: 'The ultimate fixative and base note. Adds warmth, softness, and skin-like sensuality. Present in nearly all fragrance families to provide cohesion and longevity.',
        products: ['FRSH/03', 'AQUA/06', 'FRU/07', 'FRU/08', 'FRU/09', 'SPC/10', 'FRSH/11', 'FRU/12', 'AQUA/14', 'OUD/15', 'FLR/17', 'CIT/18', 'WDS/20', 'WDS/21', 'AQUA/24', 'VAN/01', 'FLR/07', 'AMB/12', 'OUD/22'],
        productsList: ['Eternity Men / 03', 'Voyage / 06', 'Circe / 07', 'Viva Juicy / 08', 'Her Bloom / 09', 'Royal Hayati / 10', 'CR Seven / 11', 'Bombshell / 12', 'Ocean Drift / 14', 'Oud Noir / 15', 'Sanaya / 17', 'Weekend Men / 18', 'Dao Wood / 20', 'Icon / 21', 'Blue Sea / 24', 'Vanilla Luxe / 01', 'White Bloom / 07', 'Dark Amber / 12', 'Mizan / 22']
    },
    {
        id: 'neroli',
        name: 'Neroli',
        scentProfile: 'top',
        description: 'Steam-distilled from the blossoms of the bitter orange tree (Citrus aurantium). Neroli is a complex citrus-floral note with honeyed, metallic, and green facets. It is more refined and floral than orange blossom absolute, with greater lift and radiance.',
        origin: 'Tunisia, Morocco, Egypt, Italy',
        usage: 'A top note prized for its radiant, floral-citrus character. Used in classical colognes, fougeres, and floral compositions for its refined freshness.',
        products: ['SPC/02', 'AQUA/14', 'AQUA/24', 'JZC/23'],
        productsList: ['Declaration / 02', 'Ocean Drift / 14', 'Blue Sea / 24', 'Night Lounge / 23']
    },
    {
        id: 'oakmoss',
        name: 'Oakmoss',
        scentProfile: 'base',
        description: 'A lichen (Evernia prunastri) that grows on oak trees, primarily harvested in the Balkans and Southern France. Oakmoss absolute provides a deep, woody-earthy, slightly leathery character with a distinctive forest-floor complexity. It is the defining base note of the chypre family.',
        origin: 'Balkans, Southern France',
        usage: 'A foundational base note that provides earthy, woody depth with a distinctive leathery-green character. Essential in chypre and fougere compositions.',
        products: ['AQUA/06', 'SMK/16', 'CIT/18'],
        productsList: ['Voyage / 06', 'Havana / 16', 'Weekend Men / 18']
    },
    {
        id: 'oud',
        name: 'Oud',
        scentProfile: 'base',
        description: 'Agarwood resin formed when Aquilaria trees respond to fungal infection by producing a dark, fragrant resin. Oud is among the most expensive natural materials on earth, prized for its complex, smoky, animalic, and deeply woody character. It is the soul of Middle Eastern and Indian perfumery.',
        origin: 'Assam, India; Cambodia, Laos, Indonesia',
        usage: 'A powerful base note that provides deep, smoky, animalic-woody character. Central to oriental, leather, and woody compositions. Used in both traditional attars and contemporary perfumes.',
        products: ['OUD/15', 'FLR/17', 'OUD/19', 'OUD/22', 'OUD/09', 'OUDI/15'],
        productsList: ['Oud Noir / 15', 'Sanaya / 17', 'Icon Absolute / 19', 'Mizan / 22', 'Oud Royal / 09', 'Oud Intense / 15']
    },
    {
        id: 'patchouli',
        name: 'Patchouli',
        scentProfile: 'base',
        description: 'Steam-distilled from the fermented leaves of Pogostemon cablin, primarily cultivated in Indonesia, India, and the Philippines. Patchouli oil is rich, earthy, camphoraceous, and slightly sweet with a distinctive dark chocolate-like undertone. It improves significantly with ageing.',
        origin: 'Indonesia, India, Philippines',
        usage: 'A versatile base note that provides earthy, woody depth and excellent longevity. Used in oriental, chypre, woody, and gourmand compositions as both a foundation and modifier.',
        products: ['WDS/04', 'FRU/13', 'AQUA/24', 'OUDI/15'],
        productsList: ['Bleu Noir / 04', 'Belle Paris / 13', 'Blue Sea / 24', 'Oud Intense / 15']
    },
    {
        id: 'pepper',
        name: 'Pepper',
        scentProfile: 'top',
        description: 'Steam-distilled from black peppercorns (Piper nigrum), primarily from Kerala and Sri Lanka. Black pepper essential oil is sharp, hot, and incisively spicy with a characteristic woody-piney freshness. It provides an energising, radiant sparkle that lifts entire compositions.',
        origin: 'Kerala, India; Sri Lanka, Vietnam',
        usage: 'A top and heart note that adds incisive spice, lift, and modern freshness. Essential in spicy, woody, and fresh compositions for its radiant character.',
        products: ['FRSH/01', 'SPC/10', 'OUD/09', 'OUDI/15', 'OUD/19', 'AMB/12'],
        productsList: ['Wild Blue / 01', 'Royal Hayati / 10', 'Oud Royal / 09', 'Oud Intense / 15', 'Icon Absolute / 19', 'Dark Amber / 12']
    },
    {
        id: 'rose',
        name: 'Rose',
        scentProfile: 'heart',
        description: 'Rose absolute and essential oil are produced from Rosa damascena and Rosa centifolia. The rose is the most storied flower in perfumery, offering an astonishingly complex aroma with honeyed, spicy, fruity, and green facets. Indian damask roses possess a particular warmth and depth.',
        origin: 'Rajasthan & Kannauj, India; Bulgaria, Turkey, Grasse',
        usage: 'The most important floral heart note alongside jasmine. Provides rich, complex floralcy ranging from honeyed sweetness to spicy-green depth. Central to floral, oriental, and chypre families.',
        products: ['OUD/15', 'FLR/17', 'WDS/21', 'OUD/22', 'OUD/19'],
        productsList: ['Oud Noir / 15', 'Sanaya / 17', 'Icon / 21', 'Mizan / 22', 'Icon Absolute / 19']
    },
    {
        id: 'saffron',
        name: 'Saffron',
        scentProfile: 'heart',
        description: 'The three stigmas of Crocus sativus, harvested entirely by hand during a two-week annual window. Kashmir saffron is considered the world\'s finest - warm, leathery, slightly sweet-hay, and honeyed. It imparts a rich, gourmand-spicy character unique among natural materials.',
        origin: 'Kashmir, India; Iran, Spain',
        usage: 'A precious heart note that adds a warm, leathery-spicy character with subtle honeyed sweetness. Central to oriental and oud compositions, often paired with rose.',
        products: ['OUD/15', 'OUD/19', 'OUD/22', 'OUD/09'],
        productsList: ['Oud Noir / 15', 'Icon Absolute / 19', 'Mizan / 22', 'Oud Royal / 09']
    },
    {
        id: 'sandalwood',
        name: 'Sandalwood',
        scentProfile: 'base',
        description: 'Mysore sandalwood (Santalum album) is the world benchmark for quality - creamy, milky, warm, and sweetly woody. It does not merely carry other materials but elevates them. Aged sandalwood oil forms the base of all Sugandh Ink traditional attars.',
        origin: 'Mysore, Karnataka, India',
        usage: 'The premier base note in Indian perfumery. Provides creamy, milky warmth and outstanding fixative properties. Forms the foundation of traditional attars and features in contemporary woody compositions.',
        products: ['FRSH/03', 'WDS/04', 'FRU/07', 'FRU/08', 'AQUA/14', 'OUD/15', 'FLR/17', 'CIT/18', 'WDS/20', 'WDS/21', 'VAN/01', 'FLR/07', 'OUD/09', 'OUDI/15', 'OUD/22'],
        productsList: ['Eternity Men / 03', 'Bleu Noir / 04', 'Circe / 07', 'Viva Juicy / 08', 'Ocean Drift / 14', 'Oud Noir / 15', 'Sanaya / 17', 'Weekend Men / 18', 'Dao Wood / 20', 'Icon / 21', 'Vanilla Luxe / 01', 'White Bloom / 07', 'Oud Royal / 09', 'Oud Intense / 15', 'Mizan / 22']
    },
    {
        id: 'tobacco',
        name: 'Tobacco',
        scentProfile: 'base',
        description: 'Tobacco in perfumery is achieved through tobacco leaf absolute (from Nicotiana tabacum), combined with hay, honey, and leather-like materials. The aroma is rich, warm, slightly sweet-hay, and deeply comforting with subtle smoky undertones.',
        origin: 'Cuba, USA, India (accord)',
        usage: 'A base note that adds warm, hay-sweet, slightly smoky character. Central to oriental, gourmand, and leather compositions. Evokes comfort, nostalgia, and quiet luxury.',
        products: ['FRSH/11', 'SMK/16', 'OUD/19', 'JZC/23'],
        productsList: ['CR Seven / 11', 'Havana / 16', 'Icon Absolute / 19', 'Night Lounge / 23']
    },
    {
        id: 'tonka',
        name: 'Tonka Bean',
        scentProfile: 'base',
        description: 'The seed of Dipteryx odorata, a tree native to South America. Tonka bean absolute is strikingly rich in coumarin, imparting a sweet, warm, vanilla-like character with almond, cinnamon, and hay-like nuances. It is an essential material in gourmand and oriental perfumery.',
        origin: 'Venezuela, Brazil, Guyana',
        usage: 'A base note that provides sweet warmth, almond-vanilla richness, and subtle spicy depth. Used extensively in gourmand, oriental, and amber compositions.',
        products: ['VAN/01'],
        productsList: ['Vanilla Luxe / 01']
    },
    {
        id: 'tuberose',
        name: 'Tuberose',
        scentProfile: 'heart',
        description: 'The essence of Polianthes tuberosa, extracted through solvent enfleurage. Tuberose absolute is intoxicating, rich, and narcotic - simultaneously creamy, green, and slightly camphoraceous. It is among the most powerful white floral materials in existence.',
        origin: 'Kannauj, India; Grasse, France',
        usage: 'A powerful heart note that provides rich, narcotic white floral character. Central to white floral compositions and adds voluptuous depth to any floral blend.',
        products: ['FLR/05', 'FLR/07'],
        productsList: ['Bloom Rouge / 05', 'White Bloom / 07']
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        scentProfile: 'base',
        description: 'Vanilla planifolia, cured and extracted as absolute or oleoresin. True vanilla absolute is far more complex than its synthetic imitations - warm, balsamic, slightly smoky, with subtle floral and fruity undertones. Madagascar bourbon vanilla is the most prized variety.',
        origin: 'Madagascar, Mexico, India',
        usage: 'A universal base note that provides sweet, warm, balsamic richness. Essential in gourmand, amber, and oriental compositions. Softens and rounds harsh edges.',
        products: ['FRU/07', 'FRU/08', 'FRSH/11', 'SMK/16', 'VAN/01', 'JZC/23'],
        productsList: ['Circe / 07', 'Viva Juicy / 08', 'CR Seven / 11', 'Havana / 16', 'Vanilla Luxe / 01', 'Night Lounge / 23']
    },
    {
        id: 'vetiver',
        name: 'Vetiver',
        scentProfile: 'base',
        description: 'Steam-distilled from the aged roots of Chrysopogon zizanioides, primarily from Kerala and the Nilgiris. Indian vetiver (known as Khas) is distinctly earthy, woody, green, and smoky - quite different from Haitian or Sri Lankan varieties. It provides unmatched longevity in fragrance compositions.',
        origin: 'Kerala & Nilgiris, India; Haiti, Indonesia',
        usage: 'A foundational base note that provides earthy, woody depth with green and smoky facets. Excellent fixative that anchors fresh and woody compositions.',
        products: ['SPC/02', 'WDS/21', 'AMB/12', 'JZC/23'],
        productsList: ['Declaration / 02', 'Icon / 21', 'Dark Amber / 12', 'Night Lounge / 23']
    }
];

const __imgPrefix = window.location.pathname.includes('/pages/') ? '../' : '';

const __glossaryProductMap = [
    {code:'FRSH/01', name:'Wild Blue / 01', price:'₹799', image:__imgPrefix+'assets/images/products/FRSH-01.png'},
    {code:'SPC/02', name:'Declaration / 02', price:'₹799', image:__imgPrefix+'assets/images/products/SPC-02.png'},
    {code:'FRSH/03', name:'Eternity Men / 03', price:'₹799', image:__imgPrefix+'assets/images/products/FRSH-03.png'},
    {code:'WDS/04', name:'Bleu Noir / 04', price:'₹799', image:__imgPrefix+'assets/images/products/WDS-04.png'},
    {code:'FLR/05', name:'Bloom Rouge / 05', price:'₹799', image:__imgPrefix+'assets/images/products/FLR-05.png'},
    {code:'AQUA/06', name:'Voyage / 06', price:'₹799', image:__imgPrefix+'assets/images/products/AQUA-06.png'},
    {code:'FRU/07', name:'Circe / 07', price:'₹799', image:__imgPrefix+'assets/images/products/FRU-07.png'},
    {code:'FRU/08', name:'Viva Juicy / 08', price:'₹799', image:__imgPrefix+'assets/images/products/FRU-08.png'},
    {code:'FRU/09', name:'Her Bloom / 09', price:'₹799', image:__imgPrefix+'assets/images/products/FRU-09.png'},
    {code:'SPC/10', name:'Royal Hayati / 10', price:'₹799', image:__imgPrefix+'assets/images/products/SPC-10.png'},
    {code:'FRSH/11', name:'CR Seven / 11', price:'₹799', image:__imgPrefix+'assets/images/products/FRSH-11.png'},
    {code:'FRU/12', name:'Bombshell / 12', price:'₹799', image:__imgPrefix+'assets/images/products/FRU-12.png'},
    {code:'FRU/13', name:'Belle Paris / 13', price:'₹799', image:__imgPrefix+'assets/images/products/FRU-13.png'},
    {code:'AQUA/14', name:'Ocean Drift / 14', price:'₹799', image:__imgPrefix+'assets/images/products/AQUA-14.png'},
    {code:'OUD/15', name:'Oud Noir / 15', price:'₹799', image:__imgPrefix+'assets/images/products/OUD-15.png'},
    {code:'SMK/16', name:'Havana / 16', price:'₹799', image:__imgPrefix+'assets/images/products/SMK-16.png'},
    {code:'FLR/17', name:'Sanaya / 17', price:'₹799', image:__imgPrefix+'assets/images/products/FLR-17.png'},
    {code:'CIT/18', name:'Weekend Men / 18', price:'₹799', image:__imgPrefix+'assets/images/products/CIT-18.png'},
    {code:'OUD/19', name:'Icon Absolute / 19', price:'₹799', image:__imgPrefix+'assets/images/products/OUD-19.png'},
    {code:'WDS/20', name:'Dao Wood / 20', price:'₹799', image:__imgPrefix+'assets/images/products/WDS-20.png'},
    {code:'WDS/21', name:'Icon / 21', price:'₹799', image:__imgPrefix+'assets/images/products/WDS-21.png'},
    {code:'OUD/22', name:'Mizan / 22', price:'₹799', image:__imgPrefix+'assets/images/products/OUD-22.png'},
    {code:'JZC/23', name:'Night Lounge / 23', price:'₹799', image:__imgPrefix+'assets/images/products/JZC-23.png'},
    {code:'AQUA/24', name:'Blue Sea / 24', price:'₹799', image:__imgPrefix+'assets/images/products/AQUA-24.png'},
    {code:'VAN/01', name:'Vanilla Luxe / 01', price:'₹18,500', image:__imgPrefix+'assets/images/products/VAN-01.png'},
    {code:'FLR/07', name:'White Bloom / 07', price:'₹21,000', image:__imgPrefix+'assets/images/products/FLR-07.png'},
    {code:'OUD/09', name:'Oud Royal / 09', price:'₹24,000', image:__imgPrefix+'assets/images/products/OUD-09.png'},
    {code:'AMB/12', name:'Dark Amber / 12', price:'₹26,500', image:__imgPrefix+'assets/images/products/AMB-12.png'},
    {code:'OUDI/15', name:'Oud Intense / 15', price:'₹28,000', image:__imgPrefix+'assets/images/products/OUD-15.png'}
];

function getProductsByIngredient(ingredientId) {
    const ing = ingredientData.find(i => i.id === ingredientId);
    if (!ing) return [];
    const codes = ing.products || [];
    return codes.map(code => __glossaryProductMap.find(p => p.code === code)).filter(Boolean);
}

function renderGlossary(searchQuery = '') {
    const container = document.querySelector('.glossary-entries');
    if (!container) return;

    const query = searchQuery.toLowerCase().trim();
    let filtered = ingredientData;
    if (query) {
        filtered = ingredientData.filter(ing =>
            ing.name.toLowerCase().includes(query) ||
            ing.description.toLowerCase().includes(query) ||
            ing.origin.toLowerCase().includes(query)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="glossary-empty"><p>No ingredients found for "<strong>${escGlossary(query)}</strong>". Try a different search term.</p></div>`;
        return;
    }

    let html = '';
    filtered.forEach(ing => {
        const matched = getProductsByIngredient(ing.id);
        const profileLabels = { top: 'Top Note', heart: 'Heart Note', base: 'Base Note' };
        const profileLabel = profileLabels[ing.scentProfile] || '';

        let productsHtml = '';
        if (matched.length > 0) {
            productsHtml = '<div class="glossary-products"><span class="gp-heading">Found in:</span><div class="gp-list">';
            matched.forEach(p => {
                productsHtml += `<a href="../collection.html?note=${encodeURIComponent(ing.id)}" class="gp-item">
                    <div class="gp-thumb"><img src="${p.image}" alt="${escGlossary(p.name)}" loading="lazy"></div>
                    <div class="gp-info">
                        <span class="gp-name">${escGlossary(p.name)}</span>
                        <span class="gp-price">${p.price}</span>
                    </div>
                </a>`;
            });
            productsHtml += '</div></div>';
        } else {
            productsHtml = '<div class="glossary-products"><span class="gp-heading gp-empty">Featured in select compositions</span></div>';
        }

        html += `<div class="glossary-entry" id="ing-${ing.id}">
            <div class="glossary-entry-header">
                <h3 class="ge-name">${escGlossary(ing.name)}</h3>
                <span class="ge-profile ge-${ing.scentProfile}">${profileLabel}</span>
            </div>
            <div class="ge-origin">${escGlossary(ing.origin)}</div>
            <p class="ge-description">${escGlossary(ing.description)}</p>
            <div class="ge-usage">${escGlossary(ing.usage)}</div>
            ${productsHtml}
        </div>`;
    });

    container.innerHTML = html;
}

function renderLetterNav() {
    const nav = document.querySelector('.glossary-letters');
    if (!nav) return;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const available = new Set(ingredientData.map(i => i.name[0].toUpperCase()));
    let html = '';
    letters.forEach(l => {
        const active = available.has(l) ? ' active' : '';
        html += `<button class="gl-letter${active}" data-letter="${l}" ${!available.has(l) ? 'disabled' : ''}>${l}</button>`;
    });
    nav.innerHTML = html;

    nav.querySelectorAll('.gl-letter:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const letter = btn.dataset.letter;
            const entry = document.querySelector(`#ing-${letter.toLowerCase()}`);
            if (entry) {
                entry.scrollIntoView({ behavior: 'smooth', block: 'start' });
                entry.classList.add('glossary-highlight');
                setTimeout(() => entry.classList.remove('glossary-highlight'), 1500);
            } else {
                const firstWithLetter = document.querySelector(`.glossary-entry[data-letter-start="${letter}"]`);
                if (firstWithLetter) {
                    firstWithLetter.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    ingredientData.forEach(ing => {
        const firstLetter = ing.name[0].toUpperCase();
        const el = document.querySelector(`#ing-${ing.id}`);
        if (el) {
            el.dataset.letterStart = firstLetter;
        }
    });
}

function setupGlossarySearch() {
    const input = document.getElementById('glossary-search');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            renderGlossary(input.value);
            scrollToFirstEntry();
        }, 250);
    });
}

function scrollToFirstEntry() {
    const first = document.querySelector('.glossary-entry');
    if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function escGlossary(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initGlossary() {
    renderLetterNav();
    renderGlossary();
    setupGlossarySearch();
}

document.addEventListener('DOMContentLoaded', initGlossary);
