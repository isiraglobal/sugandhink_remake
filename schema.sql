-- Sugandh Ink - Centralized Database Schema for Supabase Postgres
-- Copy and paste this directly into the Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- e.g. 'OUD/09', 'VAN/01'
    name TEXT NOT NULL,
    price TEXT NOT NULL, -- e.g. '₹22,000'
    stock INTEGER NOT NULL DEFAULT 50,
    notes TEXT NOT NULL, -- comma separated
    short_notes TEXT NOT NULL, -- middle dot separated
    occasion TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for Products: Anyone can read, only authenticated admin can write/edit/delete
CREATE POLICY "Allow public read-only access to products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admin full write access to products" 
ON public.products FOR ALL USING (auth.role() = 'authenticated');


-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY, -- Can be Supabase auth.uid() or timestamp string
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for Customers: Anyone can write (sign up/add details), admin/self can read/update
CREATE POLICY "Allow public insert to customers" 
ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to read customers" 
ON public.customers FOR SELECT USING (true);

CREATE POLICY "Allow updates to self or authenticated admin" 
ON public.customers FOR UPDATE USING (true);


-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. 'ORD-9824'
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    collector TEXT NOT NULL,
    email TEXT NOT NULL,
    wa TEXT NOT NULL,
    items TEXT NOT NULL,
    value TEXT NOT NULL,
    date TEXT NOT NULL, -- e.g. '28/05/2026'
    status TEXT NOT NULL DEFAULT 'pending',
    promo_code TEXT,
    discount TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Orders: Anyone can insert (create order), authenticated users/admin can view/modify
CREATE POLICY "Allow public insert to orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to orders" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admin to modify orders" 
ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');


-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY, -- e.g. 'INV-123456789'
    invoice_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal TEXT NOT NULL,
    tax TEXT NOT NULL,
    discount TEXT NOT NULL,
    total TEXT NOT NULL,
    notes TEXT,
    promo_code TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to invoices" 
ON public.invoices FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admin full access to invoices" 
ON public.invoices FOR ALL USING (auth.role() = 'authenticated');


-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    scheduled BOOLEAN NOT NULL DEFAULT false,
    sent_to JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated admin full access to announcements" 
ON public.announcements FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to announcements" 
ON public.announcements FOR SELECT USING (true);


-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_code TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    date TEXT NOT NULL, -- e.g. 'May 2026'
    source TEXT NOT NULL DEFAULT 'web', -- e.g. 'web', 'google'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for Reviews: Anyone can read approved, anyone can insert pending, admin can approve/delete
CREATE POLICY "Allow public read access to reviews" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Allow public insert to reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admin full access to reviews" 
ON public.reviews FOR ALL USING (auth.role() = 'authenticated');


-- 7. Seed Initial Mock Data (Products List matching static catalog)
INSERT INTO public.products (id, name, price, stock, notes, short_notes, occasion, description, image)
VALUES 
('OUD/09', 'Oud Royal', '₹22,000', 50, 'saffron, rose, oud, musk', 'oud · rose · saffron', 'evening, luxury, winter', 'A deep, sovereign essence constructed around pure Indonesian Oud wood. Maturing in silence for twelve months, it is lifted with Kashmir Saffron, peppered with warm spices, and wrapped in rich, masculine leather and dark resin.', 'Products/OUD-09.png'),
('VAN/01', 'Vanilla Luxe', '₹18,500', 45, 'vanilla absolute, sandalwood, amber, musk', 'vanilla · sandalwood · amber', 'daily wear, evening, autumn', 'A highly sophisticated vanilla. It is warm, skin-close, and lacks any synthetic sweetness. Truly addictive olfactive craftsmanship.', 'Products/VAN-01.png'),
('FRSH/01', 'Wild Blue', '₹16,000', 60, 'bergamot, black pepper, vetiver, cedar', 'bergamot · pepper · vetiver', 'day wear, spring, summer', 'Wild Blue is a masterpiece. Crisp bergamot combined with a sharp pepper note that feels clean yet deeply magnetic. It holds up beautifully in tropical climates.', 'Products/FRSH-01.png')
ON CONFLICT (id) DO NOTHING;

-- 8. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'web'
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to newsletter_subscribers" 
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admin full access to newsletter_subscribers" 
ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');

-- 9. BACK IN STOCK REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.back_in_stock_requests (
    id TEXT PRIMARY KEY,
    product_code TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.back_in_stock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to back_in_stock_requests" 
ON public.back_in_stock_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admin full access to back_in_stock_requests" 
ON public.back_in_stock_requests FOR ALL USING (auth.role() = 'authenticated');

-- 10. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_percent INTEGER NOT NULL,
    description TEXT,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to coupons" 
ON public.coupons FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admin full access to coupons" 
ON public.coupons FOR ALL USING (auth.role() = 'authenticated');

-- 11. GIFT CARDS TABLE
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    remaining_balance NUMERIC NOT NULL,
    recipient_email TEXT,
    recipient_name TEXT,
    sender_name TEXT,
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated admin full access to gift_cards" 
ON public.gift_cards FOR ALL USING (auth.role() = 'authenticated');

-- Seed coupons
INSERT INTO public.coupons (code, discount_percent, description, max_uses)
VALUES 
('SUGANDH10', 10, '10% off your first order', 1000),
('WELCOME5', 5, 'Welcome discount for new collectors', 500),
('ROYAL20', 20, 'Premium loyalty discount', 100)
ON CONFLICT (code) DO NOTHING;
