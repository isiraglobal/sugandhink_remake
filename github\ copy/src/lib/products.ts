import { Product } from '@/types/product.types';

/**
 * Sample Perfume Products with Rich Metadata
 * Based on CSV data from sugandhink.in
 */
export const perfumeProducts: Product[] = [
  {
    id: 1,
    title: 'Wild Blue / 01',
    code: 'FRSH/01',
    srcUrl:
      'https://images.unsplash.com/photo-1594983618433-5adc2b1e9f36?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1594983618433-5adc2b1e9f36?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=800&fit=crop',
    ],
    price: 799,
    samplePrice: 399,
    discount: { amount: 100, percentage: 12 },
    rating: 4.5,
    reviews: 128,
    scentFamily: 'fresh',
    scentPyramid: {
      top: [
        { name: 'Calabrian Bergamot' },
        { name: 'Pepper' },
      ],
      heart: [
        { name: 'Sichuan Pepper' },
        { name: 'Lavender' },
        { name: 'Geranium' },
      ],
      base: [
        { name: 'Ambroxan' },
        { name: 'Cedar' },
        { name: 'Labdanum' },
      ],
    },
    shortNotes: 'bergamot · pepper · cedar',
    memory: 'open desert',
    occasions: ['daily-wear', 'date-night', 'all-season'],
    description:
      'A sharp fresh-spicy fragrance defined by bergamot and pepper, grounded in the warmth of ambroxan. Bold, modern, and magnetic.',
    longevity: 'long-lasting',
    sillage: 'strong',
    concentration: 'eau-de-parfum',
    designer: 'Sugandhink Perfumery',
    availability: 'in-stock',
  },
  {
    id: 2,
    title: 'Declaration / 02',
    code: 'SPC/02',
    srcUrl:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
    ],
    price: 799,
    samplePrice: 399,
    discount: { amount: 80, percentage: 10 },
    rating: 4.7,
    reviews: 156,
    scentFamily: 'spicy',
    scentPyramid: {
      top: [
        { name: 'Bergamot' },
        { name: 'Neroli' },
        { name: 'Bitter Orange' },
      ],
      heart: [
        { name: 'Cardamom' },
        { name: 'Iris' },
        { name: 'Ginger' },
        { name: 'Cinnamon' },
      ],
      base: [
        { name: 'Vetiver' },
        { name: 'Tea' },
        { name: 'Cedar' },
        { name: 'Leather' },
        { name: 'Amber' },
      ],
    },
    shortNotes: 'vetiver · iris · spice',
    memory: 'ink and wood',
    occasions: ['work', 'formal', 'evening'],
    description:
      'A sophisticated spicy-woody with a distinctive iris and vetiver drydown. Complex, refined and unmistakably classic.',
    longevity: 'long-lasting',
    sillage: 'moderate',
    concentration: 'eau-de-toilette',
    designer: 'Sugandhink Perfumery',
    availability: 'in-stock',
  },
  {
    id: 3,
    title: 'Bleu Noir / 04',
    code: 'WDS/04',
    srcUrl:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1590080876-b9e0c1c4c5d8?w=800&h=800&fit=crop',
    ],
    price: 799,
    samplePrice: 399,
    discount: { amount: 120, percentage: 15 },
    rating: 4.8,
    reviews: 203,
    scentFamily: 'woody',
    scentPyramid: {
      top: [
        { name: 'Grapefruit' },
        { name: 'Lemon' },
        { name: 'Mint' },
        { name: 'Bergamot' },
        { name: 'Pink Pepper' },
      ],
      heart: [
        { name: 'Ginger' },
        { name: 'Nutmeg' },
        { name: 'Jasmine' },
      ],
      base: [
        { name: 'Incense' },
        { name: 'Amber' },
        { name: 'Cedar' },
        { name: 'Sandalwood' },
        { name: 'Patchouli' },
        { name: 'Labdanum' },
      ],
    },
    shortNotes: 'citrus · ginger · incense',
    memory: 'tailored suit',
    occasions: ['work', 'formal', 'date-night', 'all-season'],
    description:
      'A refined woody-aromatic that balances crisp citrus with deep incense and amber woods. Sophisticated, versatile and eternally elegant.',
    longevity: 'extreme',
    sillage: 'strong',
    concentration: 'eau-de-parfum',
    designer: 'Sugandhink Perfumery',
    availability: 'in-stock',
  },
  {
    id: 4,
    title: 'Bloom Rouge / 05',
    code: 'FLR/05',
    srcUrl:
      'https://images.unsplash.com/photo-1624874270267-c00cffb6d0cd?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1624874270267-c00cffb6d0cd?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578926078328-123456789012?w=800&h=800&fit=crop',
    ],
    price: 799,
    samplePrice: 399,
    discount: { amount: 0, percentage: 0 },
    rating: 4.6,
    reviews: 98,
    scentFamily: 'floral',
    scentPyramid: {
      top: [{ name: 'Rangoon Creeper' }],
      heart: [
        { name: 'Tuberose' },
        { name: 'Jasmine Sambac' },
        { name: 'Nandia Flower' },
      ],
      base: [
        { name: 'Musk' },
        { name: 'Sandalwood' },
      ],
    },
    shortNotes: 'sandal · jasmine · musk',
    memory: 'garden at dusk',
    occasions: ['date-night', 'evening', 'spring-summer'],
    description:
      'A bold lush white floral built on tuberose and jasmine sambac. Rich, feminine and unapologetically full.',
    longevity: 'long-lasting',
    sillage: 'overwhelming',
    concentration: 'eau-de-parfum',
    designer: 'Sugandhink Perfumery',
    availability: 'in-stock',
  },
  {
    id: 5,
    title: 'Oud Noir / 15',
    code: 'OUD/15',
    srcUrl:
      'https://images.unsplash.com/photo-1591159682518-1f1e6e621f0b?w=400&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1591159682518-1f1e6e621f0b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1582109386476-7f2cc2f8d5ff?w=800&h=800&fit=crop',
    ],
    price: 799,
    samplePrice: 399,
    discount: { amount: 150, percentage: 19 },
    rating: 4.9,
    reviews: 267,
    scentFamily: 'oud',
    scentPyramid: {
      top: [
        { name: 'Saffron' },
        { name: 'Bergamot' },
      ],
      heart: [
        { name: 'Rose' },
        { name: 'Oud' },
      ],
      base: [
        { name: 'Sandalwood' },
        { name: 'Musk' },
        { name: 'Amber' },
      ],
    },
    shortNotes: 'oud · saffron · amber',
    memory: 'dusk smoke',
    occasions: ['evening', 'fall-winter'],
    description:
      'A rich African-inspired oud with saffron and rose over warm amber and sandalwood. Deep, smoky and mesmerizing.',
    longevity: 'extreme',
    sillage: 'strong',
    concentration: 'extrait',
    designer: 'Sugandhink Perfumery',
    availability: 'in-stock',
  },
];

/**
 * Get product by ID
 */
export const getProductById = (id: number): Product | undefined => {
  return perfumeProducts.find((product) => product.id === id);
};

/**
 * Get products by scent family
 */
export const getProductsByFamily = (family: string): Product[] => {
  return perfumeProducts.filter((product) => product.scentFamily === family);
};

/**
 * Get products by occasion
 */
export const getProductsByOccasion = (occasion: string): Product[] => {
  return perfumeProducts.filter((product) =>
    product.occasions.includes(occasion as any)
  );
};

/**
 * Search products
 */
export const searchProducts = (query: string): Product[] => {
  const lowercase = query.toLowerCase();
  return perfumeProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(lowercase) ||
      product.description.toLowerCase().includes(lowercase) ||
      product.shortNotes.toLowerCase().includes(lowercase) ||
      product.memory?.toLowerCase().includes(lowercase)
  );
};
