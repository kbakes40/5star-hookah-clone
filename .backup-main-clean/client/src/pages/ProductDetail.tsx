// Product Detail Page - Neo-Brutalism meets Luxury Retail
// Features: Image gallery, product info, add to cart, related products

import { useState } from "react";
import { useRoute, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductById, products } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const product = getProductById(params?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0]?.id || ""
  );
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display font-black mb-4">Product Not Found</h1>
            <Link href="/">
              <a className="text-primary hover:underline">Return to Home</a>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(p => 
    p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // Get current variant image or use product default image
  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const currentImage = currentVariant?.image || product.image;
  const images = [currentImage]; // Use variant-specific image

  const handleAddToCart = () => {
    if (product) {
      // Pass selected variant ID to cart
      addToCart(product, quantity, selectedVariant || undefined);
      
      // Build toast message with variant name if applicable
      const variantName = selectedVariant 
        ? product.variants?.find(v => v.id === selectedVariant)?.name 
        : null;
      const itemName = variantName 
        ? `${product.name} - ${variantName}` 
        : product.name;
      
      toast.success(`Added ${quantity} × ${itemName} to cart`);
      
      // Haptic vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // 50ms vibration
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <div>
              <div className="bg-secondary brutalist-border aspect-square mb-4 overflow-hidden">
                <img 
                  src={currentImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square brutalist-border overflow-hidden ${
                      selectedImage === idx ? 'border-primary' : ''
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.brand}
              </p>
              <h1 className="text-4xl font-display font-black mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                {product.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl price-tag font-black text-primary">
                      ${product.salePrice.toFixed(2)}
                    </span>
                    <span className="text-xl price-tag line-through text-muted-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl price-tag font-black">
                    ${product.price.toFixed(2)} USD
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="w-3 h-3 bg-primary"></div>
                    <span className="font-semibold">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <div className="w-3 h-3 bg-destructive"></div>
                    <span className="font-semibold">Sold Out</span>
                  </div>
                )}
              </div>

              {/* Flavor Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block font-semibold mb-3">Select Flavor</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant.id);
                          setSelectedImage(0); // Reset to first image when variant changes
                        }}
                        className={`px-4 py-2.5 brutalist-border font-semibold transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 ${
                          selectedVariant === variant.id
                            ? "bg-primary text-primary-foreground brutalist-shadow"
                            : "bg-background hover:bg-secondary"
                        }`}
                        title={variant.description}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Notice */}
              <div className="bg-secondary brutalist-border p-4 mb-6">
                <p className="text-sm font-semibold">
                  Spend $100 to FREE SHIPPING Use Code <span className="text-primary">FREESHIP</span>
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center brutalist-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-10 text-center border-x-3 border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 h-12 text-lg font-bold"
                >
                  {product.inStock ? 'ADD TO CART' : 'SOLD OUT'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="brutalist-border h-12 w-12"
                  onClick={() => toast.success('Added to wishlist')}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Share */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => toast.success('Link copied to clipboard')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {/* Product Description */}
              <div className="mt-8 pt-8 border-t-3 border-border">
                <h3 className="font-display font-bold text-lg mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Experience premium quality with this carefully crafted product. 
                  Designed for enthusiasts who demand the best, featuring superior materials 
                  and expert craftsmanship. Perfect for both beginners and experienced users.
                </p>
              </div>

              {/* Disclaimer */}
              {product.category === 'shisha' && (
                <div className="mt-6 bg-muted brutalist-border p-4">
                  <p className="text-xs text-muted-foreground">
                    This product is excluded from all discounts and promotions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="py-16 border-t-3 border-border">
              <h2 className="text-3xl font-display font-black mb-8">YOU MAY ALSO LIKE</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
