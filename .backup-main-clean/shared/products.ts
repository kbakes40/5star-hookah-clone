/**
 * Stripe Product and Price Configuration
 * This file defines the products available for purchase
 */

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  image?: string;
}

// Note: In production, you would create these products in Stripe Dashboard
// and reference their actual price IDs here. For now, we'll create them dynamically.

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: "product_hookah_premium",
    name: "Premium Hookah Set",
    description: "Luxury hookah set with premium accessories",
    priceInCents: 29999, // $299.99
    currency: "usd",
  },
  {
    id: "product_shisha_tobacco",
    name: "Premium Tobacco Blend",
    description: "250g premium tobacco blend",
    priceInCents: 1999, // $19.99
    currency: "usd",
  },
  {
    id: "product_charcoal",
    name: "Natural Coconut Charcoal",
    description: "1kg natural coconut charcoal",
    priceInCents: 1499, // $14.99
    currency: "usd",
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(p => p.id === id);
}
