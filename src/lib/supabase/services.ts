// Centralized Supabase service layer for KiliShop
// All database operations go through this file

import { createClient } from '@/lib/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  images: string[];
  colors?: string[];
  categoryId?: string;
  category?: Category;
  brand: string;
  specs: Record<string, string>;
  tags: string[];
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  isNew: boolean;
  badge: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedColor?: string | null;
  product?: Product;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'mpesa' | 'card' | 'cod';
  paymentStatus: string;
  deliveryAddress: DeliveryAddress;
  notes: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DeliveryAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  notes?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  userProfile?: { fullName: string; avatarUrl: string };
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular' | 'relevance';
  page?: number;
  limit?: number;
}

// ============================================================
// HELPERS
// ============================================================

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discount: row.discount || 0,
    imageUrl: row.image_url || '',
    images: row.images || [],
    colors: row.colors || [],
    categoryId: row.category_id,
    category: row.categories ? mapCategory(row.categories) : undefined,
    brand: row.brand || '',
    specs: row.specs || {},
    tags: row.tags || [],
    stock: row.stock || 0,
    sold: row.sold || 0,
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isTrending: row.is_trending,
    isOnSale: row.is_on_sale,
    isNew: row.is_new,
    badge: row.badge || '',
    createdAt: row.created_at,
  };
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon || '📦',
    color: row.color || '#6366F1',
    description: row.description || '',
    isActive: row.is_active,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
  };
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    orderNumber: row.order_number,
    status: row.status,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    discountAmount: Number(row.discount_amount),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryAddress: row.delivery_address || {},
    notes: row.notes || '',
    items: row.order_items?.map(mapOrderItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image || '',
    price: Number(row.price),
    quantity: row.quantity,
    subtotal: Number(row.subtotal),
  };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapCategory);
}

export async function createCategory(input: Partial<Category>): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name,
      slug: input.name?.toLowerCase().replace(/\s+/g, '-') || '',
      icon: input.icon || '📦',
      color: input.color || '#6366F1',
      description: input.description || '',
    })
    .select()
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function updateCategory(id: string, input: Partial<Category>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      icon: input.icon,
      color: input.color,
      description: input.description,
      is_active: input.isActive,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
  const supabase = createClient();
  const {
    categorySlug, search, minPrice, maxPrice, minRating,
    inStock, isOnSale, isFeatured, isTrending, isNew,
    brands, sortBy = 'relevance', page = 1, limit = 12,
  } = filters;

  let query = supabase
    .from('products')
    .select('*, categories(*)', { count: 'exact' })
    .eq('is_active', true);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);
  if (minRating !== undefined) query = query.gte('rating', minRating);
  if (inStock) query = query.gt('stock', 0);
  if (isOnSale) query = query.eq('is_on_sale', true);
  if (isFeatured) query = query.eq('is_featured', true);
  if (isTrending) query = query.eq('is_trending', true);
  if (isNew) query = query.eq('is_new', true);
  if (brands && brands.length > 0) query = query.in('brand', brands);

  switch (sortBy) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'popular': query = query.order('sold', { ascending: false }); break;
    default: query = query.order('is_featured', { ascending: false }).order('sold', { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: (data || []).map(mapProduct), total: count || 0 };
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapProduct(data);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) return null;
  return mapProduct(data);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sold', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []).map(mapProduct);
}

export async function getFlashDeals(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('is_on_sale', true)
    .gt('discount', 0)
    .order('discount', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []).map(mapProduct);
}

export async function getTrendingProducts(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('is_trending', true)
    .order('sold', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []).map(mapProduct);
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit);
  if (error) return [];
  return (data || []).map(mapProduct);
}

// Admin product operations
export async function createProduct(input: Partial<Product> & { categoryId?: string }): Promise<Product> {
  const supabase = createClient();
  const slug = input.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      slug,
      description: input.description || '',
      price: input.price || 0,
      original_price: input.originalPrice || null,
      discount: input.discount || 0,
      image_url: input.imageUrl || '',
      images: input.images || [],
      category_id: input.categoryId || null,
      brand: input.brand || '',
      specs: input.specs || {},
      tags: input.tags || [],
      stock: input.stock || 0,
      is_active: input.isActive ?? true,
      is_featured: input.isFeatured ?? false,
      is_trending: input.isTrending ?? false,
      is_on_sale: input.isOnSale ?? false,
      is_new: input.isNew ?? false,
      badge: input.badge || '',
    })
    .select('*, categories(*)')
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id: string, input: Partial<Product> & { categoryId?: string }): Promise<void> {
  const supabase = createClient();
  const updates: Record<string, any> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.price !== undefined) updates.price = input.price;
  if (input.originalPrice !== undefined) updates.original_price = input.originalPrice;
  if (input.discount !== undefined) updates.discount = input.discount;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
  if (input.images !== undefined) updates.images = input.images;
  if (input.categoryId !== undefined) updates.category_id = input.categoryId;
  if (input.brand !== undefined) updates.brand = input.brand;
  if (input.specs !== undefined) updates.specs = input.specs;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.stock !== undefined) updates.stock = input.stock;
  if (input.isActive !== undefined) updates.is_active = input.isActive;
  if (input.isFeatured !== undefined) updates.is_featured = input.isFeatured;
  if (input.isTrending !== undefined) updates.is_trending = input.isTrending;
  if (input.isOnSale !== undefined) updates.is_on_sale = input.isOnSale;
  if (input.isNew !== undefined) updates.is_new = input.isNew;
  if (input.badge !== undefined) updates.badge = input.badge;
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
}

// ============================================================
// CART
// ============================================================

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*, categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    quantity: row.quantity,
    selectedColor: row.selected_color || null,
    product: row.products ? mapProduct(row.products) : undefined,
    createdAt: row.created_at,
  }));
}

export async function addToCart(userId: string, productId: string, quantity = 1, selectedColor?: string | null): Promise<void> {
  const supabase = createClient();
  // Check stock
  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single();
  if (!product || product.stock < quantity) throw new Error('Insufficient stock');

  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity, selected_color: selectedColor || null },
      { onConflict: 'user_id,product_id' }
    );
  if (error) throw error;
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<void> {
  const supabase = createClient();
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return;
  }
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);
  if (error) throw error;
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw error;
}

export async function clearCart(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

export async function getCartCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId);
  if (error) return 0;
  return (data || []).reduce((sum, item) => sum + item.quantity, 0);
}

// ============================================================
// WISHLIST
// ============================================================

export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, products(*, categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    product: row.products ? mapProduct(row.products) : undefined,
    createdAt: row.created_at,
  }));
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: userId, product_id: productId });
  if (error && !error.message.includes('duplicate')) throw error;
}

export async function removeFromWishlist(wishlistItemId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('wishlist_items').delete().eq('id', wishlistItemId);
  if (error) throw error;
}

export async function isInWishlist(userId: string, productId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
  return data?.id || null;
}

// ============================================================
// ORDERS
// ============================================================

export async function createOrder(
  userId: string,
  cartItems: CartItem[],
  deliveryAddress: DeliveryAddress,
  paymentMethod: 'mpesa' | 'card' | 'cod',
  shippingFee: number,
  discountAmount: number
): Promise<Order> {
  const supabase = createClient();

  // Validate stock
  for (const item of cartItems) {
    if (!item.product) throw new Error('Product data missing');
    if (item.product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const total = subtotal + shippingFee - discountAmount;
  const orderNumber = `KS-${Date.now().toString().slice(-6)}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total,
      payment_method: paymentMethod,
      payment_status: 'pending',
      delivery_address: deliveryAddress,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  // Create order items (trigger will reduce stock)
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.product?.name || '',
    product_image: item.product?.imageUrl || '',
    price: item.product?.price || 0,
    quantity: item.quantity,
    subtotal: (item.product?.price || 0) * item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Clear cart
  await clearCart(userId);

  return mapOrder(order);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function getAllOrders(): Promise<(Order & { userEmail?: string; userName?: string })[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), user_profiles(email, full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...mapOrder(row),
    userEmail: (row as any).user_profiles?.email,
    userName: (row as any).user_profiles?.full_name,
  }));
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

// ============================================================
// REVIEWS
// ============================================================

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user_profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    rating: row.rating,
    comment: row.comment,
    isVerified: row.is_verified,
    helpfulCount: row.helpful_count,
    createdAt: row.created_at,
    userProfile: row.user_profiles
      ? { fullName: row.user_profiles.full_name, avatarUrl: row.user_profiles.avatar_url }
      : undefined,
  }));
}

export async function addReview(
  productId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('reviews')
    .upsert(
      { product_id: productId, user_id: userId, rating, comment },
      { onConflict: 'user_id,product_id' }
    );
  if (error) throw error;
}

// ============================================================
// ADMIN STATS
// ============================================================

export async function getAdminStats() {
  const supabase = createClient();
  const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('total').eq('status', 'delivered'),
  ]);

  const revenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: ordersRes.count || 0,
    totalProducts: productsRes.count || 0,
    totalCustomers: usersRes.count || 0,
    totalRevenue: revenue,
  };
}

export async function getAllUsers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw error;
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// ============================================================
// UTILS
// ============================================================

export function formatPrice(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function getStockStatus(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-400/10' };
  if (stock <= 5) return { label: `Only ${stock} left!`, color: 'text-red-400 bg-red-400/10' };
  if (stock <= 20) return { label: 'Low Stock', color: 'text-yellow-400 bg-yellow-400/10' };
  return { label: 'In Stock', color: 'text-green-400 bg-green-400/10' };
}
