-- Database alterations for Sugandh Ink to support shipping address fields without dropping tables
-- Copy and paste this script directly into your Supabase SQL Editor.

-- 1. Alter Customers Table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 2. Alter Orders Table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 3. Alter Invoices Table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS zip_code TEXT;
