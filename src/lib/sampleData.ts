// Sample seed data for KiliShop

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isOnSale?: boolean;
  badge?: string;
  description?: string;
  brand?: string;
  specs?: Record<string, string>;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export const CATEGORIES: Category[] = [
{ id: 'electronics', name: 'Electronics', icon: '📱', count: 1240, color: '#3B82F6' },
{ id: 'fashion', name: 'Fashion', icon: '👗', count: 3560, color: '#EC4899' },
{ id: 'home', name: 'Home & Living', icon: '🏠', count: 890, color: '#F59E0B' },
{ id: 'beauty', name: 'Beauty', icon: '💄', count: 670, color: '#8B5CF6' },
{ id: 'sports', name: 'Sports', icon: '⚽', count: 445, color: '#10B981' },
{ id: 'baby', name: 'Baby & Kids', icon: '🍼', count: 320, color: '#F97316' },
{ id: 'automotive', name: 'Automotive', icon: '🚗', count: 230, color: '#6366F1' },
{ id: 'grocery', name: 'Grocery', icon: '🛒', count: 1100, color: '#22C55E' }];


export const PRODUCTS: Product[] = [
{
  id: 'p1',
  name: 'Samsung Galaxy A54 5G Smartphone',
  price: 28999,
  originalPrice: 35999,
  discount: 19,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d2fba53a-1773598765031.png",
  images: [
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],

  category: 'electronics',
  subcategory: 'phones',
  rating: 4.5,
  reviewCount: 234,
  sold: 1820,
  stock: 45,
  isFeatured: true,
  isTrending: true,
  isOnSale: true,
  badge: 'HOT',
  brand: 'Samsung',
  description: 'Experience blazing-fast 5G connectivity with the Samsung Galaxy A54. Features a stunning 6.4" Super AMOLED display, triple camera system with 50MP main sensor, and a powerful 5000mAh battery.',
  specs: {
    'Display': '6.4" Super AMOLED, 120Hz',
    'Processor': 'Exynos 1380',
    'RAM': '8GB',
    'Storage': '256GB',
    'Camera': '50MP + 12MP + 5MP',
    'Battery': '5000mAh',
    'OS': 'Android 13',
    'Network': '5G'
  },
  tags: ['smartphone', '5g', 'samsung', 'android']
},
{
  id: 'p2',
  name: 'Wireless Bluetooth Earbuds Pro',
  price: 3499,
  originalPrice: 5999,
  discount: 42,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1099f262d-1773908592995.png",
  category: 'electronics',
  subcategory: 'audio',
  rating: 4.3,
  reviewCount: 156,
  sold: 3420,
  stock: 120,
  isFeatured: true,
  isOnSale: true,
  badge: '42% OFF',
  brand: 'TechSound',
  description: 'Premium wireless earbuds with Active Noise Cancellation, 30-hour total battery life, and IPX5 water resistance.',
  specs: {
    'Driver': '10mm dynamic',
    'Frequency': '20Hz - 20kHz',
    'Battery': '8hrs + 22hrs case',
    'Connectivity': 'Bluetooth 5.2',
    'Water Resistance': 'IPX5',
    'ANC': 'Active Noise Cancellation'
  },
  tags: ['earbuds', 'wireless', 'bluetooth', 'audio']
},
{
  id: 'p3',
  name: 'Men\'s Classic Polo Shirt',
  price: 1299,
  originalPrice: 1999,
  discount: 35,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6563532-1772188489335.png",
  category: 'fashion',
  subcategory: 'men',
  rating: 4.2,
  reviewCount: 89,
  sold: 560,
  stock: 200,
  isFeatured: true,
  isOnSale: true,
  brand: 'StyleKe',
  description: 'Premium cotton polo shirt with embroidered logo. Available in multiple colors.',
  specs: {
    'Material': '100% Cotton Pique',
    'Fit': 'Regular Fit',
    'Collar': 'Ribbed polo collar',
    'Care': 'Machine washable'
  },
  tags: ['polo', 'men', 'shirt', 'fashion']
},
{
  id: 'p4',
  name: 'Non-Stick Cookware Set (6 Piece)',
  price: 5499,
  originalPrice: 8999,
  discount: 39,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c484a99a-1772305233671.png",
  category: 'home',
  subcategory: 'kitchen',
  rating: 4.6,
  reviewCount: 312,
  sold: 890,
  stock: 60,
  isFeatured: true,
  isOnSale: true,
  badge: 'BEST SELLER',
  brand: 'KitchenPro',
  description: '6-piece non-stick cookware set with granite coating. PFOA-free and dishwasher safe.',
  specs: {
    'Pieces': '6 (2 pots, 2 pans, 2 lids)',
    'Material': 'Aluminum with granite coating',
    'Compatible': 'Gas, electric, ceramic',
    'Dishwasher': 'Safe'
  },
  tags: ['cookware', 'kitchen', 'non-stick', 'home']
},
{
  id: 'p5',
  name: 'Vitamin C Brightening Face Serum',
  price: 1899,
  originalPrice: 2499,
  discount: 24,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_16e93a330-1773435795312.png",
  category: 'beauty',
  subcategory: 'skincare',
  rating: 4.7,
  reviewCount: 445,
  sold: 2100,
  stock: 85,
  isNew: true,
  isFeatured: true,
  badge: 'NEW',
  brand: 'GlowAfrica',
  description: 'Concentrated Vitamin C serum for brighter, even-toned skin. Formulated for African skin tones.',
  specs: {
    'Key Ingredient': '20% Vitamin C',
    'Skin Type': 'All skin types',
    'Volume': '30ml',
    'Cruelty-free': 'Yes'
  },
  tags: ['serum', 'vitamin c', 'skincare', 'beauty']
},
{
  id: 'p6',
  name: 'Nike Air Max 270 Sneakers',
  price: 12999,
  originalPrice: 16999,
  discount: 24,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_14cbd9cbc-1772107877679.png",
  category: 'sports',
  subcategory: 'footwear',
  rating: 4.8,
  reviewCount: 678,
  sold: 1340,
  stock: 30,
  isFeatured: true,
  isTrending: true,
  badge: 'TRENDING',
  brand: 'Nike',
  description: 'The Nike Air Max 270 features Nike\'s biggest heel Air unit yet for a super-cushioned ride.',
  specs: {
    'Upper': 'Mesh and synthetic',
    'Sole': 'Max Air unit',
    'Closure': 'Lace-up',
    'Available sizes': 'UK 6-12'
  },
  tags: ['nike', 'sneakers', 'sports', 'shoes']
},
{
  id: 'p7',
  name: 'HP Pavilion Laptop 15.6"',
  price: 65999,
  originalPrice: 79999,
  discount: 18,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12d3fe116-1772267193126.png",
  category: 'electronics',
  subcategory: 'computers',
  rating: 4.4,
  reviewCount: 189,
  sold: 450,
  stock: 15,
  isFeatured: true,
  isTrending: true,
  brand: 'HP',
  description: 'HP Pavilion laptop with Intel Core i5 processor, 8GB RAM, 512GB SSD. Perfect for work and study.',
  specs: {
    'Processor': 'Intel Core i5-1235U',
    'RAM': '8GB DDR4',
    'Storage': '512GB SSD',
    'Display': '15.6" FHD IPS',
    'OS': 'Windows 11',
    'Battery': '41Wh'
  },
  tags: ['laptop', 'hp', 'computer', 'electronics']
},
{
  id: 'p8',
  name: 'Ankara Print Wrap Dress',
  price: 2199,
  originalPrice: 3499,
  discount: 37,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_155875300-1772209910724.png",
  category: 'fashion',
  subcategory: 'women',
  rating: 4.5,
  reviewCount: 123,
  sold: 780,
  stock: 95,
  isNew: true,
  isFeatured: true,
  badge: 'NEW',
  brand: 'AfriStyle',
  description: 'Beautiful Ankara print wrap dress, perfect for any occasion. Made with authentic African fabric.',
  specs: {
    'Material': '100% Cotton Ankara',
    'Fit': 'Wrap style, adjustable',
    'Length': 'Midi (below knee)',
    'Care': 'Hand wash recommended'
  },
  tags: ['ankara', 'dress', 'women', 'african fashion']
},
{
  id: 'p9',
  name: 'Smart LED TV 43" 4K Ultra HD',
  price: 34999,
  originalPrice: 44999,
  discount: 22,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10246bf9b-1771247074144.png",
  category: 'electronics',
  subcategory: 'tv',
  rating: 4.3,
  reviewCount: 267,
  sold: 620,
  stock: 22,
  isOnSale: true,
  badge: 'FLASH DEAL',
  brand: 'TCL',
  description: '43-inch 4K Smart TV with Android TV, built-in Chromecast, and Dolby Audio.',
  specs: {
    'Screen Size': '43 inches',
    'Resolution': '4K UHD (3840x2160)',
    'Smart Platform': 'Android TV 11',
    'HDR': 'HDR10, Dolby Vision',
    'Audio': 'Dolby Audio, 24W'
  },
  tags: ['tv', 'smart tv', '4k', 'electronics']
},
{
  id: 'p10',
  name: 'Organic Shea Butter Body Lotion',
  price: 899,
  originalPrice: 1299,
  discount: 31,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c1dae358-1774955103435.png",
  category: 'beauty',
  subcategory: 'bodycare',
  rating: 4.6,
  reviewCount: 334,
  sold: 1890,
  stock: 150,
  isTrending: true,
  brand: 'NaturalGlow',
  description: 'Pure organic shea butter body lotion, enriched with Vitamin E and natural African oils.',
  specs: {
    'Key Ingredient': 'Shea Butter, Vitamin E',
    'Volume': '400ml',
    'Skin Type': 'All skin types',
    'Paraben-free': 'Yes'
  },
  tags: ['shea butter', 'lotion', 'organic', 'beauty']
},
{
  id: 'p11',
  name: 'Electric Pressure Cooker 6L',
  price: 6999,
  originalPrice: 9999,
  discount: 30,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1802d18f1-1775643039701.png",
  category: 'home',
  subcategory: 'kitchen',
  rating: 4.4,
  reviewCount: 198,
  sold: 567,
  stock: 40,
  isOnSale: true,
  brand: 'HomeChef',
  description: '6L multi-function electric pressure cooker with 12 cooking programs. Perfect for ugali, stews, and more.',
  specs: {
    'Capacity': '6 Liters',
    'Programs': '12 cooking modes',
    'Power': '1000W',
    'Safety': '10 safety mechanisms'
  },
  tags: ['pressure cooker', 'kitchen', 'home', 'electric']
},
{
  id: 'p12',
  name: 'Adidas Running Shorts Men',
  price: 1799,
  originalPrice: 2499,
  discount: 28,
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_108b07030-1772839542511.png",
  category: 'sports',
  subcategory: 'clothing',
  rating: 4.2,
  reviewCount: 67,
  sold: 230,
  stock: 180,
  brand: 'Adidas',
  description: 'Lightweight Adidas running shorts with moisture-wicking technology and built-in brief.',
  specs: {
    'Material': 'Recycled polyester',
    'Technology': 'Climalite moisture-wicking',
    'Pockets': '2 side pockets',
    'Length': '7-inch inseam'
  },
  tags: ['adidas', 'shorts', 'running', 'sports']
}];


export const FLASH_DEALS: Product[] = PRODUCTS.filter((p) => p.isOnSale).slice(0, 4);
export const FEATURED_PRODUCTS: Product[] = PRODUCTS.filter((p) => p.isFeatured).slice(0, 8);
export const TRENDING_PRODUCTS: Product[] = PRODUCTS.filter((p) => p.isTrending);

export const REVIEWS: Review[] = [
{
  id: 'r1',
  productId: 'p1',
  userId: 'u1',
  userName: 'Amara Osei',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_171f40cb3-1772285499702.png",
  rating: 5,
  comment: 'Excellent phone! The camera quality is amazing and battery lasts all day. Fast delivery too!',
  date: '2026-03-15',
  helpful: 24
},
{
  id: 'r2',
  productId: 'p1',
  userId: 'u2',
  userName: 'Kwame Mensah',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1cd696ae1-1772285499835.png",
  rating: 4,
  comment: 'Great value for money. 5G is super fast in Nairobi. Would recommend to anyone looking for a mid-range phone.',
  date: '2026-03-10',
  helpful: 18
},
{
  id: 'r3',
  productId: 'p1',
  userId: 'u3',
  userName: 'Fatima Al-Hassan',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17c6a3df0-1765047883515.png",
  rating: 5,
  comment: 'Perfect phone for everyday use. The display is gorgeous and the performance is smooth.',
  date: '2026-02-28',
  helpful: 12
}];


export const formatPrice = (price: number): string => {
  return `KSh ${price.toLocaleString('en-KE')}`;
};

export const calculateDiscount = (original: number, current: number): number => {
  return Math.round((original - current) / original * 100);
};