# ⚡ Quick Start Guide - WhatsApp Checkout Setup

## Essential Configuration (3 Minutes)

### Step 1: Set Your WhatsApp Number
```bash
# Find and replace in the following files:
# '+918800xxxxxx' with your actual WhatsApp number

1. src/components/checkout/CheckoutPage.tsx (Line 8)
2. src/components/ui/CartAnimations.tsx (Line 78)
```

**Example:**
```typescript
// Before:
const WHATSAPP_NUMBER = '+918800xxxxxx';

// After:
const WHATSAPP_NUMBER = '+919876543210';
```

### Step 2: Update Product Data
Edit `src/lib/products.ts` and replace:
- Product images (image URLs)
- Prices
- Fragrance notes
- Descriptions

Or import from CSV:
```bash
cp sugandhink.in/assets/data/data-perfume.csv ./product-data.csv
# Then map CSV to products.ts format
```

### Step 3: Start Development
```bash
npm run dev
# Opens at http://localhost:3000
```

---

## 🎯 Key URLs After Setup

| Page | URL | Features |
|------|-----|----------|
| Home | `/` | Hero, featured products |
| Shop | `/shop` | All products, filters |
| Product | `/shop/product/[id]` | Details, gallery, pyramid |
| Cart | `/cart` | Items, summary |
| Checkout | `/checkout` | WhatsApp button |

---

## ✨ What's New - Features Summary

| Feature | Where to See | File |
|---------|--------------|------|
| **Magnetic Cursor** | Hover over buttons | `ui/MagneticCursor.tsx` |
| **Scroll Progress** | Top of page | `ui/ScrollProgress.tsx` |
| **Product Zoom** | Product gallery | `product-page/ProductGallery.tsx` |
| **Scent Pyramid** | Product details | `product-page/ScentNotesPyramid.tsx` |
| **Advanced Filters** | /shop page | `shop-page/AdvancedFilters.tsx` |
| **Quick View** | Product card hover | `product-page/QuickViewModal.tsx` |
| **Cart Toast** | When adding item | `ui/CartAnimations.tsx` |
| **Checkout** | /checkout page | `checkout/CheckoutPage.tsx` |

---

## 🔐 WhatsApp Message Format

When user clicks checkout, they get:
```
Hi! I would like to place an order:

Wild Blue / 01 (50ml) x1
Oud Noir / 15 (30ml) x2

Total: ₹1397

Please confirm availability and provide shipping options.
```

---

## 🎨 Customization Quick Tips

### Change Gold Color
Find in `tailwind.config.ts`:
```typescript
gold: "#d4af37",      // Current
gold: "#FFD700",      // Brighter
gold: "#C19A0D",      // Darker
```

### Adjust Cursor Size
Edit `ui/MagneticCursor.tsx`:
```typescript
className="w-10 h-10"  // Current (40px)
className="w-12 h-12"  // Larger (48px)
```

### Change Checkout Button Color
Edit `checkout/CheckoutPage.tsx`:
```typescript
className="bg-[#25D366]"  // WhatsApp green (current)
className="bg-[#9b7a42]"  // Gold
```

---

## 📊 Product Data Structure

Each product needs:
```json
{
  "id": 1,
  "title": "Wild Blue / 01",
  "code": "FRSH/01",
  "srcUrl": "https://...",
  "price": 799,
  "samplePrice": 399,
  "scentFamily": "fresh",
  "scentPyramid": {
    "top": [{"name": "Bergamot"}],
    "heart": [{"name": "Lavender"}],
    "base": [{"name": "Cedar"}]
  },
  "shortNotes": "bergamot · lavender · cedar",
  "occasions": ["daily-wear", "work"],
  "description": "...",
  "rating": 4.5,
  "reviews": 128
}
```

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Add luxury perfume features"
git push origin main

# 2. Connect to Vercel at vercel.com
# 3. Import your GitHub repo
# 4. Set Environment Variables (if needed)
# 5. Deploy!
```

---

## 🐛 Troubleshooting

**Q: WhatsApp link not opening?**
- Check number format: `+918800xxxxxx` (with country code)
- Ensure no spaces or hyphens

**Q: Images not loading?**
- Verify image URLs are accessible
- Check CORS settings if using external CDN

**Q: Animations not smooth?**
- Browser: Update to latest Chrome/Safari
- Performance: Close other tabs

**Q: Cursor not showing?**
- Check if browser allows custom cursor
- Works on: Chrome, Firefox, Safari, Edge
- May not work on some mobile browsers

---

## 📞 Need Help?

1. Check `LUXURY_ENHANCEMENT_GUIDE.md` for detailed docs
2. Review component files for examples
3. Look at product data structure in `src/lib/products.ts`
4. Test in development first: `npm run dev`

---

**Ready to go! Your luxury perfume e-commerce site is configured and ready to launch! 🎭✨**
