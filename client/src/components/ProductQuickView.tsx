import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/products";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log(`Added ${quantity}x ${product.name} to cart`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="bg-secondary p-8 flex items-center justify-center border-r-3 border-border">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-[500px] object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="p-8">
            <DialogTitle className="text-3xl font-display font-black mb-2">
              {product.name}
            </DialogTitle>

            {product.brand && (
              <p className="text-sm text-muted-foreground mb-4 font-bold">
                {product.brand}
              </p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              {product.salePrice ? (
                <>
                  <span className="text-4xl font-black text-primary">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-black text-primary">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Product Attributes */}
            <div className="space-y-3 mb-6 pb-6 border-b-2 border-border">
              {product.category && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
              )}
              {product.inStock !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Availability:</span>
                  <span className={product.inStock ? "text-primary" : "text-destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center brutalist-border">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors border-r-3 border-border"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 h-10 flex items-center justify-center font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors border-l-3 border-border"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="lg"
              className="w-full brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {!product.inStock && (
              <p className="text-sm text-destructive text-center mt-3">
                This item is currently out of stock
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
