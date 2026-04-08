-- KiliShop Full E-Commerce Schema
-- Tables: categories, products, inventory, carts, wishlists, orders, order_items, reviews
-- Builds on existing user_profiles table

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

DROP TYPE IF EXISTS public.payment_method CASCADE;
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'card', 'cod');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#6366F1',
    description TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(12,2),
    discount INTEGER DEFAULT 0,
    image_url TEXT DEFAULT '',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT DEFAULT '',
    specs JSONB DEFAULT '{}'::JSONB,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    stock INTEGER NOT NULL DEFAULT 0,
    sold INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    badge TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- Wishlist items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_items_user_product ON public.wishlist_items(user_id, product_id);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    status public.order_status DEFAULT 'pending'::public.order_status,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_method public.payment_method DEFAULT 'mpesa'::public.payment_method,
    payment_status TEXT DEFAULT 'pending',
    delivery_address JSONB DEFAULT '{}'::JSONB,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT DEFAULT '',
    price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product ON public.reviews(user_id, product_id);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_trending ON public.products(is_trending);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- ============================================================
-- 4. FUNCTIONS (before RLS policies)
-- ============================================================

-- Admin check (already exists but recreate for safety)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (au.raw_user_meta_data->>'role' = 'admin'
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    num TEXT;
BEGIN
    num := 'KS-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    RETURN num;
END;
$$;

-- Update product rating after review insert/update/delete
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_id UUID;
BEGIN
    p_id := COALESCE(NEW.product_id, OLD.product_id);
    UPDATE public.products
    SET
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE product_id = p_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = p_id)
    WHERE id = p_id;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Reduce stock after order
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.products
    SET
        stock = GREATEST(0, stock - NEW.quantity),
        sold = sold + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$;

-- Update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- Categories: public read, admin write
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_manage_categories" ON public.categories;
CREATE POLICY "admin_manage_categories" ON public.categories
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Products: public read active, admin manage all
DROP POLICY IF EXISTS "public_read_active_products" ON public.products;
CREATE POLICY "public_read_active_products" ON public.products
FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_products" ON public.products;
CREATE POLICY "admin_manage_products" ON public.products
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Cart items: users manage own
DROP POLICY IF EXISTS "users_manage_own_cart_items" ON public.cart_items;
CREATE POLICY "users_manage_own_cart_items" ON public.cart_items
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_read_all_cart_items" ON public.cart_items;
CREATE POLICY "admin_read_all_cart_items" ON public.cart_items
FOR SELECT TO authenticated
USING (public.is_admin_from_auth());

-- Wishlist items: users manage own
DROP POLICY IF EXISTS "users_manage_own_wishlist_items" ON public.wishlist_items;
CREATE POLICY "users_manage_own_wishlist_items" ON public.wishlist_items
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Orders: users see own, admin sees all
DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
CREATE POLICY "users_manage_own_orders" ON public.orders
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_all_orders" ON public.orders;
CREATE POLICY "admin_manage_all_orders" ON public.orders
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Order items: users see own via order, admin sees all
DROP POLICY IF EXISTS "users_read_own_order_items" ON public.order_items;
CREATE POLICY "users_read_own_order_items" ON public.order_items
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_insert_own_order_items" ON public.order_items;
CREATE POLICY "users_insert_own_order_items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "admin_manage_all_order_items" ON public.order_items;
CREATE POLICY "admin_manage_all_order_items" ON public.order_items
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Reviews: public read, users manage own
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_reviews" ON public.reviews;
CREATE POLICY "users_manage_own_reviews" ON public.reviews
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_all_reviews" ON public.reviews;
CREATE POLICY "admin_manage_all_reviews" ON public.reviews
FOR ALL TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_product_rating_insert ON public.reviews;
CREATE TRIGGER trigger_update_product_rating_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

DROP TRIGGER IF EXISTS trigger_update_product_rating_update ON public.reviews;
CREATE TRIGGER trigger_update_product_rating_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

DROP TRIGGER IF EXISTS trigger_update_product_rating_delete ON public.reviews;
CREATE TRIGGER trigger_update_product_rating_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

DROP TRIGGER IF EXISTS trigger_reduce_stock_on_order ON public.order_items;
CREATE TRIGGER trigger_reduce_stock_on_order
    AFTER INSERT ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_order();

-- ============================================================
-- 8. SEED DATA
-- ============================================================
DO $$
DECLARE
    cat_electronics UUID;
    cat_fashion UUID;
    cat_home UUID;
    cat_beauty UUID;
    cat_sports UUID;
    cat_baby UUID;
    cat_automotive UUID;
    cat_grocery UUID;
    p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID; p7 UUID; p8 UUID;
BEGIN
    -- Categories
    INSERT INTO public.categories (id, name, slug, icon, color, sort_order) VALUES
        (gen_random_uuid(), 'Electronics', 'electronics', '📱', '#3B82F6', 1),
        (gen_random_uuid(), 'Fashion', 'fashion', '👗', '#EC4899', 2),
        (gen_random_uuid(), 'Home & Living', 'home', '🏠', '#F59E0B', 3),
        (gen_random_uuid(), 'Beauty', 'beauty', '💄', '#8B5CF6', 4),
        (gen_random_uuid(), 'Sports', 'sports', '⚽', '#10B981', 5),
        (gen_random_uuid(), 'Baby & Kids', 'baby', '🍼', '#F97316', 6),
        (gen_random_uuid(), 'Automotive', 'automotive', '🚗', '#6366F1', 7),
        (gen_random_uuid(), 'Grocery', 'grocery', '🛒', '#22C55E', 8)
    ON CONFLICT (slug) DO NOTHING;

    -- Get category IDs
    SELECT id INTO cat_electronics FROM public.categories WHERE slug = 'electronics' LIMIT 1;
    SELECT id INTO cat_fashion FROM public.categories WHERE slug = 'fashion' LIMIT 1;
    SELECT id INTO cat_home FROM public.categories WHERE slug = 'home' LIMIT 1;
    SELECT id INTO cat_beauty FROM public.categories WHERE slug = 'beauty' LIMIT 1;
    SELECT id INTO cat_sports FROM public.categories WHERE slug = 'sports' LIMIT 1;

    -- Products
    p1 := gen_random_uuid();
    p2 := gen_random_uuid();
    p3 := gen_random_uuid();
    p4 := gen_random_uuid();
    p5 := gen_random_uuid();
    p6 := gen_random_uuid();
    p7 := gen_random_uuid();
    p8 := gen_random_uuid();

    INSERT INTO public.products (
        id, name, slug, description, price, original_price, discount,
        image_url, images, category_id, brand, specs, tags,
        stock, sold, rating, review_count,
        is_active, is_featured, is_trending, is_on_sale, is_new, badge
    ) VALUES
    (p1, 'Samsung Galaxy A54 5G Smartphone', 'samsung-galaxy-a54-5g',
     'Experience blazing-fast 5G connectivity with the Samsung Galaxy A54. Features a stunning 6.4" Super AMOLED display, triple camera system with 50MP main sensor, and a powerful 5000mAh battery.',
     28999, 35999, 19,
     'https://img.rocket.new/generatedImages/rocket_gen_img_1d2fba53a-1773598765031.png',
     ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
           'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
     cat_electronics, 'Samsung',
     '{"Display":"6.4\" Super AMOLED, 120Hz","Processor":"Exynos 1380","RAM":"8GB","Storage":"256GB","Camera":"50MP + 12MP + 5MP","Battery":"5000mAh","OS":"Android 13","Network":"5G"}'::JSONB,
     ARRAY['smartphone','5g','samsung','android'],
     45, 1820, 4.5, 234, true, true, true, true, false, 'HOT'),
    (p2, 'Wireless Bluetooth Earbuds Pro', 'wireless-bluetooth-earbuds-pro',
     'Premium wireless earbuds with Active Noise Cancellation, 30-hour total battery life, and IPX5 water resistance.',
     3499, 5999, 42,
     'https://img.rocket.new/generatedImages/rocket_gen_img_1099f262d-1773908592995.png',
     ARRAY[]::TEXT[], cat_electronics, 'TechSound',
     '{"Driver":"10mm dynamic","Frequency":"20Hz - 20kHz","Battery":"8hrs + 22hrs case","Connectivity":"Bluetooth 5.2","Water Resistance":"IPX5","ANC":"Active Noise Cancellation"}'::JSONB,
     ARRAY['earbuds','wireless','bluetooth','audio'],
     120, 3420, 4.3, 156, true, true, false, true, false, '42% OFF'),
    (p3, 'Men''s Classic Polo Shirt', 'mens-classic-polo-shirt',
     'Premium cotton polo shirt with embroidered logo. Available in multiple colors.',
     1299, 1999, 35,
     'https://img.rocket.new/generatedImages/rocket_gen_img_1d6563532-1772188489335.png',
     ARRAY[]::TEXT[], cat_fashion, 'StyleKe',
     '{"Material":"100% Cotton Pique","Fit":"Regular Fit","Collar":"Ribbed polo collar","Care":"Machine washable"}'::JSONB,
     ARRAY['polo','men','shirt','fashion'],
     200, 560, 4.2, 89, true, true, false, true, false, ''),
    (p4, 'Non-Stick Cookware Set (6 Piece)', 'non-stick-cookware-set-6-piece',
     '6-piece non-stick cookware set with granite coating. PFOA-free and dishwasher safe.',
     5499, 8999, 39,
     'https://img.rocket.new/generatedImages/rocket_gen_img_1c484a99a-1772305233671.png',
     ARRAY[]::TEXT[], cat_home, 'KitchenPro',
     '{"Pieces":"6 (2 pots, 2 pans, 2 lids)","Material":"Aluminum with granite coating","Compatible":"Gas, electric, ceramic","Dishwasher":"Safe"}'::JSONB,
     ARRAY['cookware','kitchen','non-stick','home'],
     60, 890, 4.6, 312, true, true, false, true, false, 'BEST SELLER'),
    (p5, 'Vitamin C Brightening Face Serum', 'vitamin-c-brightening-face-serum',
     'Concentrated Vitamin C serum for brighter, even-toned skin. Formulated for African skin tones.',
     1899, 2499, 24,
     'https://img.rocket.new/generatedImages/rocket_gen_img_16e93a330-1773435795312.png',
     ARRAY[]::TEXT[], cat_beauty, 'GlowAfrica',
     '{"Key Ingredient":"20% Vitamin C","Skin Type":"All skin types","Volume":"30ml","Cruelty-free":"Yes"}'::JSONB,
     ARRAY['serum','vitamin c','skincare','beauty'],
     85, 2100, 4.7, 445, true, true, false, false, true, 'NEW'),
    (p6, 'Nike Air Max 270 Sneakers', 'nike-air-max-270-sneakers',
     'The Nike Air Max 270 features Nike biggest heel Air unit yet for a super-cushioned ride.',
     12999, 16999, 24,
     'https://img.rocket.new/generatedImages/rocket_gen_img_14cbd9cbc-1772107877679.png',
     ARRAY[]::TEXT[], cat_sports, 'Nike',
     '{"Upper":"Mesh and synthetic","Sole":"Max Air unit","Closure":"Lace-up","Available sizes":"UK 6-12"}'::JSONB,
     ARRAY['nike','sneakers','sports','shoes'],
     30, 1340, 4.8, 678, true, true, true, false, false, 'TRENDING'),
    (p7, 'HP Pavilion Laptop 15.6"', 'hp-pavilion-laptop-15-6',
     'HP Pavilion laptop with Intel Core i5 processor, 8GB RAM, 512GB SSD. Perfect for work and study.',
     65999, 79999, 18,
     'https://img.rocket.new/generatedImages/rocket_gen_img_12d3fe116-1772267193126.png',
     ARRAY[]::TEXT[], cat_electronics, 'HP',
     '{"Processor":"Intel Core i5-1235U","RAM":"8GB DDR4","Storage":"512GB SSD","Display":"15.6\" FHD IPS","OS":"Windows 11","Battery":"41Wh"}'::JSONB,
     ARRAY['laptop','hp','computer','windows'],
     15, 450, 4.4, 189, true, true, true, true, false, ''),
    (p8, 'African Print Ankara Dress', 'african-print-ankara-dress',
     'Beautiful Ankara print dress with modern cut. Perfect for casual and semi-formal occasions.',
     3299, 4500, 27,
     'https://images.unsplash.com/photo-1594938298603-c8148c4b4c4e?w=600&auto=format&fit=crop&q=80',
     ARRAY[]::TEXT[], cat_fashion, 'AfriStyle',
     '{"Material":"100% Cotton Ankara","Fit":"A-line","Length":"Midi","Care":"Hand wash cold"}'::JSONB,
     ARRAY['ankara','dress','african','fashion'],
     75, 320, 4.5, 98, true, false, true, true, true, 'NEW')
    ON CONFLICT (slug) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;

-- Storage bucket for product images (created via SQL)
-- Note: Create bucket named "product-images" in Supabase Storage dashboard with public access
