// Product image upload helper for Supabase Storage
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'product-images';

export interface ProductImageRecord {
  id: string;
  productId: string;
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

/**
 * Upload a single file to Supabase Storage and return the public URL.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteProductImageFromStorage(imageUrl: string): Promise<void> {
  const supabase = createClient();
  // Extract path from URL: everything after /object/public/product-images/
  const marker = `/object/public/${BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const path = imageUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Fetch all product_images rows for a product, ordered by sort_order.
 */
export async function getProductImages(productId: string): Promise<ProductImageRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    imageUrl: row.image_url,
    isCover: row.is_cover,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }));
}

/**
 * Insert a product_images row.
 */
export async function saveProductImageRecord(
  productId: string,
  imageUrl: string,
  isCover: boolean,
  sortOrder: number
): Promise<ProductImageRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, image_url: imageUrl, is_cover: isCover, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    productId: data.product_id,
    imageUrl: data.image_url,
    isCover: data.is_cover,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
  };
}

/**
 * Delete a product_images row and optionally remove the file from storage.
 */
export async function deleteProductImageRecord(
  id: string,
  imageUrl: string,
  removeFromStorage = true
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('product_images').delete().eq('id', id);
  if (error) throw error;
  if (removeFromStorage) {
    await deleteProductImageFromStorage(imageUrl);
  }
}

/**
 * Set a specific product_images row as the cover (unsets others).
 */
export async function setProductCoverImage(productId: string, imageId: string, imageUrl: string): Promise<void> {
  const supabase = createClient();
  // Unset all covers for this product
  await supabase.from('product_images').update({ is_cover: false }).eq('product_id', productId);
  // Set the new cover
  await supabase.from('product_images').update({ is_cover: true }).eq('id', imageId);
  // Also update products.cover_image_url
  await supabase.from('products').update({ cover_image_url: imageUrl, image_url: imageUrl }).eq('id', productId);
}

/**
 * Upload multiple gallery images and save records.
 * Returns array of saved records.
 */
export async function uploadAndSaveGalleryImages(
  productId: string,
  files: File[],
  startSortOrder = 0
): Promise<ProductImageRecord[]> {
  const results: ProductImageRecord[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadProductImage(files[i], productId);
    const record = await saveProductImageRecord(productId, url, false, startSortOrder + i);
    results.push(record);
  }
  return results;
}
