-- Add selected_color column to cart_items for color selection persistence
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS selected_color TEXT DEFAULT NULL;
