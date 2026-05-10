-- Product Images Migration
-- Adds product_images table and cover_image_url column to products
-- Creates product-images storage bucket with RLS policies

-- ============================================================
-- 1. ADD cover_image_url TO products TABLE
-- ============================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT '';

-- ============================================================
-- 2. CREATE product_images TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_cover ON public.product_images(is_cover);

-- ============================================================
-- 3. ENABLE RLS
-- ============================================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- Public can read product images
DROP POLICY IF EXISTS "public_read_product_images" ON public.product_images;
CREATE POLICY "public_read_product_images" ON public.product_images
FOR SELECT TO public USING (true);

-- Admins can manage product images
DROP POLICY IF EXISTS "admin_manage_product_images" ON public.product_images;
CREATE POLICY "admin_manage_product_images" ON public.product_images
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- ============================================================
-- 5. STORAGE BUCKET (via SQL insert into storage schema)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "public_read_product_images_storage" ON storage.objects;
CREATE POLICY "public_read_product_images_storage" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_upload_product_images_storage" ON storage.objects;
CREATE POLICY "admin_upload_product_images_storage" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin_from_auth());

DROP POLICY IF EXISTS "admin_update_product_images_storage" ON storage.objects;
CREATE POLICY "admin_update_product_images_storage" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_from_auth())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin_from_auth());

DROP POLICY IF EXISTS "admin_delete_product_images_storage" ON storage.objects;
CREATE POLICY "admin_delete_product_images_storage" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_from_auth());
