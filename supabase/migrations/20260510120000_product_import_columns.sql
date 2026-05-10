-- Product Import Columns Migration
-- Adds colors, has_variants, variant_type, supplier, supplier_url to products table
-- Required for n8n product import API

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variant_type TEXT DEFAULT '';

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT '';

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS supplier_url TEXT DEFAULT '';
