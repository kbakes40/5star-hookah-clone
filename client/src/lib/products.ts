// Product data structure for the e-commerce site
// Design Philosophy: Neo-Brutalism meets Luxury Retail
import { charcoalProducts } from './charcoal-products';
import { vapeProducts } from './vape-products';
import { wholesaleProducts } from './wholesale-products';

export interface ProductVariant {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  category: string;
  image: string;
  badge?: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
  description?: string;
  specs?: string[];
  variants?: ProductVariant[];
}

export const categories = [
  { id: 'hookahs', name: 'Hookahs', icon: '🫖' },
  { id: 'shisha', name: 'Shisha', icon: '🍃' },
  { id: 'charcoal', name: 'Charcoal', icon: '⚫' },
  { id: 'vapes', name: 'Vapes', icon: '/images/icons/vape-icon.png' },
  { id: 'accessories', name: 'Accessories', icon: '🔧' },
  { id: 'bowls', name: 'Hookah Bowls', icon: '🥣' },
];

export const products: Product[] = [
  // Shisha/Tobacco Products
  { id: '1', name: 'Premium Tobacco Blend 250g', brand: 'Luxury Brand', price: 19.99, category: 'shisha', image: '/images/hWG7feLP4G9A.webp', badge: 'TRENDING', inStock: true, trending: true },
  { id: '2', name: 'Classic Tobacco 250g', brand: 'Heritage', price: 14.99, category: 'shisha', image: '/images/PICmJfphbkW2.jpg', badge: 'TRENDING', inStock: true, trending: true },
  { id: '3', name: 'Blonde Leaf Tobacco 250g', brand: 'Premium', price: 17.99, category: 'shisha', image: '/images/5RRmLYAQuT6v.png', badge: 'TRENDING', inStock: true, trending: true },
  { id: '4', name: 'Signature Tobacco 250g', brand: 'Elite', price: 19.99, category: 'shisha', image: '/images/hWG7feLP4G9A.webp', badge: 'TRENDING', inStock: true, trending: true },
  { id: '5', name: 'Traditional Tobacco 250g', brand: 'Classic', price: 17.99, category: 'shisha', image: '/images/PICmJfphbkW2.jpg', badge: 'TRENDING', inStock: true, trending: true },
  { id: '6', name: 'Light Tobacco 100g', brand: 'Smooth', price: 10.99, salePrice: 9.99, category: 'shisha', image: '/images/5RRmLYAQuT6v.png', badge: 'SALE', inStock: true, trending: true },
  
  // Snoop x Al Fakher - Consolidated with flavor variants
  { 
    id: '50', 
    name: 'Snoop x Al Fakher Shisha Tobacco 1kg', 
    brand: 'Al Fakher', 
    price: 64.99, 
    category: 'shisha', 
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663313071830/vkrqOhGKCSEelOUP.jpg', 
    badge: 'NEW', 
    inStock: true, 
    featured: true,
    variants: [
      { id: 'thagzmix', name: 'Tha G\'z Mix', description: 'Premium blend with signature flavor' },
      { id: 'cloud92', name: 'Cloud 92', description: 'Tropical fruits with cooling finish' },
      { id: 'doggsdelight', name: 'Dogg\'s Delight', description: 'Mango passionfruit with icy twist' },
      { id: 'midnightblues', name: 'Midnight Blues', description: 'Blueberry blackberry with ice' },
      { id: 'moneyhoney', name: 'Money Honey', description: 'Honeydew melon with ice' }
    ]
  },
  
  // Hookahs
  // Starbuzz Mini - Consolidated with color variants
  {
    id: '100',
    name: 'Starbuzz Mini Complete Set',
    brand: 'Starbuzz',
    price: 149.99,
    category: 'hookahs',
    image: '/images/starbuzz-mini/bright-pink.png',
    badge: 'NEW',
    inStock: true,
    featured: true,
    variants: [
      { id: 'antique-bronze', name: 'ANTIQUE BRONZE', image: '/images/starbuzz-mini/antique-bronze.png' },
      { id: 'bright-pink', name: 'Bright Pink', image: '/images/starbuzz-mini/bright-pink.png' },
      { id: 'gunmetal', name: 'Gunmetal', image: '/images/starbuzz-mini/vibrant-orange.png' },
      { id: 'jet-black', name: 'Jet Black', image: '/images/starbuzz-mini/jet-black.png' },
      { id: 'lime-green', name: 'Lime Green', image: '/images/starbuzz-mini/lime-green.png' },
      { id: 'marsala-red', name: 'MARSALA RED', image: '/images/starbuzz-mini/marsala-red.png' },
      { id: 'spartan-blue', name: 'Spartan Blue', image: '/images/starbuzz-mini/spartan-blue.png' },
      { id: 'vibrant-orange', name: 'VIBRANT ORANGE', image: '/images/starbuzz-mini/gunmetal.png' },
      { id: 'ultramarine-blue', name: 'ULTRAMARINE BLUE', image: '/images/starbuzz-mini/ultramarine-blue.png' }
    ]
  },

  { id: '8', name: 'Modern Glass Hookah', brand: 'Contemporary', price: 549.99, category: 'hookahs', image: '/images/YYJ0jfpn8sr2.jpg', inStock: true, featured: true },
  { id: '9', name: 'Traditional Brass Hookah', brand: 'Heritage', price: 399.99, category: 'hookahs', image: '/images/osJ2wAX3W81I.jpg', inStock: true, featured: true },
  { id: '10', name: 'Designer Hookah Premium', brand: 'Elite', price: 651.99, category: 'hookahs', image: '/images/5Ws20RGhEkJh.jpg', inStock: true, featured: true },
  
  // Accessories
  { id: '11', name: 'Premium Charcoal Holder', brand: 'Essential', price: 29.99, category: 'accessories', image: '/images/WDVKxXHEP5m8.jpg', inStock: true },
  
  // Charcoal products imported from charcoal-products.ts
  ...charcoalProducts,
  
  // Vape products imported from vape-products.ts
  ...vapeProducts,
  
  // Bowls
  { id: '15', name: 'Ceramic Bowl Premium', brand: 'Artisan', price: 49.99, category: 'bowls', image: '/images/osJ2wAX3W81I.jpg', inStock: true },
  { id: '16', name: 'Silicone Bowl Modern', brand: 'Tech', price: 39.99, category: 'bowls', image: '/images/YYJ0jfpn8sr2.jpg', inStock: true },
  
  // Wholesale Products - ROR Tobacco 1kg (all 41 flavors)
  ...wholesaleProducts
];

export const getTrendingProducts = () => products.filter(p => p.trending);
export const getFeaturedProducts = () => products.filter(p => p.featured);
export const getProductsByCategory = (category: string) => products.filter(p => p.category === category);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getBrandsByCategory = (category: string) => {
  const categoryProducts = products.filter(p => p.category === category);
  const brands = Array.from(new Set(categoryProducts.map(p => p.brand)));
  return brands.sort();
};
export const getProductsByCategoryAndBrand = (category: string, brand: string) => 
  products.filter(p => p.category === category && p.brand === brand);
