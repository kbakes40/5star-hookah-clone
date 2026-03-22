// CartDrawer Component - Neo-Brutalism meets Luxury Retail
// Slide-out cart drawer with product list and checkout

import { useCart } from "@/contexts/CartContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Minus, Plus, Trash2, Truck, Store } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function CartDrawer() {
  const { items, cartTotal, cartCount, isOpen, closeCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "zelle" | "bitcoin" | "paypal">("card");
  const createCheckoutSession = trpc.checkout.createSession.useMutation();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-foreground/50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l-3 border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-3 border-border">
          <h2 className="text-2xl font-display font-black">YOUR CART ({cartCount})</h2>
          <button 
            onClick={closeCart}
            className="w-10 h-10 brutalist-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl font-display font-bold mb-4">Your cart is empty</p>
              <Button 
                onClick={closeCart}
                className="brutalist-border bg-primary text-primary-foreground"
              >
                CONTINUE SHOPPING
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedVariantId || 'default'}`} className="flex gap-4 pb-6 border-b-3 border-border last:border-0">
                  {/* Product Image */}
                  <Link href={`/product/${item.id}`} onClick={closeCart}>
                    <div className="w-24 h-24 bg-secondary brutalist-border flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`} onClick={closeCart}>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-primary">
                        {item.name}
                        {item.selectedVariantName && (
                          <span className="text-primary"> - {item.selectedVariantName}</span>
                        )}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-3">{item.brand}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center brutalist-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantId)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-x-3 border-border text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantId)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.selectedVariantId)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="price-tag font-bold">
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-3 border-border p-6 space-y-4">
            {/* Shipping Notice */}
            <div className="bg-secondary brutalist-border p-4 text-sm">
              <p className="font-semibold">
                {cartTotal >= 100 ? (
                  <span className="text-primary">✓ You qualify for FREE SHIPPING!</span>
                ) : (
                  <>Spend ${(100 - cartTotal).toFixed(2)} more for FREE SHIPPING</>
                )}
              </p>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-display font-bold">SUBTOTAL</span>
              <span className="price-tag font-black text-2xl">
                ${cartTotal.toFixed(2)} USD
              </span>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-2">
              <p className="font-display font-bold text-sm">DELIVERY METHOD</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod("shipping")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    deliveryMethod === "shipping" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <Truck className="h-5 w-5" />
                  <span className="text-sm font-bold">SHIPPING</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    deliveryMethod === "pickup" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <Store className="h-5 w-5" />
                  <span className="text-sm font-bold">PICKUP</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <p className="font-display font-bold text-sm">PAYMENT METHOD</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === "card" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-bold">CREDIT CARD</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("zelle")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === "zelle" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-bold">ZELLE</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("bitcoin")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === "bitcoin" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-bold">BITCOIN</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 brutalist-border flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === "paypal" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm font-bold">PAYPAL</span>
                </button>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              className="w-full h-14 brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-lg font-black"
              disabled={isCheckingOut}
              onClick={async () => {
                setIsCheckingOut(true);
                try {
                  if (paymentMethod === "zelle") {
                    // Navigate to Zelle checkout page using React Router (preserves state)
                    closeCart();
                    setLocation(`/zelle-checkout?delivery=${deliveryMethod}`);
                  } else if (paymentMethod === "bitcoin") {
                    // Bitcoin payment - demo placeholder
                    toast.info("Bitcoin payment is available upon request. Please contact us to arrange Bitcoin payment.");
                    setIsCheckingOut(false);
                    return;
                  } else if (paymentMethod === "paypal") {
                    // PayPal payment - demo placeholder
                    toast.info("PayPal payment is available upon request. Please contact us to arrange PayPal payment.");
                    setIsCheckingOut(false);
                    return;
                  } else {
                    // Stripe checkout
                    const checkoutItems = items.map(item => {
                      const itemName = item.selectedVariantName 
                        ? `${item.brand} - ${item.name} - ${item.selectedVariantName}`
                        : `${item.brand} - ${item.name}`;
                      
                      return {
                        name: itemName,
                        priceInCents: Math.round((item.salePrice || item.price) * 100),
                        quantity: item.quantity,
                        image: item.image,
                      };
                    });

                    const session = await createCheckoutSession.mutateAsync({
                      items: checkoutItems,
                      deliveryMethod,
                    });

                    if (session.url) {
                      toast.success("Redirecting to checkout...");
                      window.open(session.url, "_blank");
                      closeCart();
                    }
                  }
                } catch (error: any) {
                  if (error.message?.includes("login")) {
                    toast.error("Please log in to checkout");
                  } else {
                    toast.error("Failed to create checkout session");
                  }
                } finally {
                  setIsCheckingOut(false);
                }
              }}
            >
              {isCheckingOut ? "PROCESSING..." : "CHECKOUT"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
