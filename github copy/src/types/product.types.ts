// Perfume-specific product types with luxury metadata

export type Discount = {
  amount: number;
  percentage: number;
};

export type ScentNote = {
  name: string;
  description?: string;
};

export type ScentPyramid = {
  top: ScentNote[];
  heart: ScentNote[];
  base: ScentNote[];
};

export type Occasion = 
  | "daily-wear" 
  | "date-night" 
  | "formal" 
  | "evening" 
  | "casual" 
  | "work"
  | "all-season"
  | "spring-summer"
  | "fall-winter";

export type ScentFamily =
  | "fresh"
  | "citrus"
  | "floral"
  | "fruity"
  | "woody"
  | "oriental"
  | "spicy"
  | "aquatic"
  | "oud"
  | "gourmand";

export type Product = {
  id: number;
  title: string;
  code: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  samplePrice?: number; // For 30ml samples
  discount: Discount;
  rating: number;
  reviews?: number;
  
  // Perfume-specific fields
  scentFamily: ScentFamily;
  scentPyramid: ScentPyramid;
  shortNotes: string; // e.g., "bergamot · pepper · cedar"
  memory?: string; // e.g., "open desert"
  occasions: Occasion[];
  description: string;
  longevity?: "light" | "moderate" | "long-lasting" | "extreme";
  sillage?: "soft" | "moderate" | "strong" | "overwhelming";
  concentration?: "eau-de-cologne" | "eau-de-toilette" | "eau-de-parfum" | "extrait";
  year?: number;
  designer?: string;
  availability?: "in-stock" | "low-stock" | "pre-order";
};

export type Review = {
  id: string;
  productId: number;
  author: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  size: "sample-30ml" | "full-50ml";
  selectedPrice: number;
};
