// Zelle Payment Instructions Page
// Shows Zelle payment details and creates pending order

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, CheckCircle2, MapPin, Phone, Mail } from "lucide-react";

export default function ZelleCheckout() {
  const [, setLocation] = useLocation();
  const { items, cartTotal, clearCart } = useCart();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format phone number as XXX-XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10);
    
    // Format with dashes
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };
  
  const storeSettings = trpc.store.getSettings.useQuery();
  const createZelleOrder = trpc.checkout.createZelleOrder.useMutation();

  // Get delivery method from URL params
  const params = new URLSearchParams(window.location.search);
  const deliveryMethod = (params.get("delivery") as "shipping" | "pickup") || "shipping";

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      setLocation("/");
      return;
    }
  }, [items, setLocation]);

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    // Validate phone number has 10 digits
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        name: item.selectedVariantName 
          ? `${item.brand} - ${item.name} - ${item.selectedVariantName}`
          : `${item.brand} - ${item.name}`,
        priceInCents: Math.round((item.salePrice || item.price) * 100),
        quantity: item.quantity,
      }));

      const result = await createZelleOrder.mutateAsync({
        items: orderItems,
        deliveryMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        totalAmount: Math.round(cartTotal * 100), // Convert to cents
      });

      setOrderId(result.orderId);
      toast.success("Order created! Please send payment via Zelle");
    } catch (error) {
      toast.error("Failed to create order");
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const zelleEmail = storeSettings.data?.zelleEmail || "payment@bosshookah.com";
  const zellePhone = storeSettings.data?.zellePhone || "313-406-6589";

  // Show customer info form if order not created yet
  if (!orderId) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-2xl">
          <div className="bg-card brutalist-border brutalist-shadow p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 brutalist-border">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-black">ZELLE PAYMENT</h1>
              <p className="text-muted-foreground">
                Enter your details to complete your order
              </p>
            </div>

            {/* Customer Info Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold mb-2">
                    FULL NAME *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="brutalist-border"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold mb-2">
                    PHONE NUMBER *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="313-555-1234"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    className="brutalist-border"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-display font-bold">ORDER SUMMARY</h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} {item.selectedVariantName && `- ${item.selectedVariantName}`} x {item.quantity}
                      </span>
                      <span className="font-bold">
                        ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t-3 border-border pt-2 flex justify-between font-display font-bold text-lg">
                    <span>TOTAL</span>
                    <span className="text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-secondary brutalist-border p-4">
                <p className="font-bold text-sm mb-2">
                  {deliveryMethod === "pickup" ? "IN-STORE PICKUP" : "SHIPPING"}
                </p>
                {deliveryMethod === "pickup" && storeSettings.data && (
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{storeSettings.data.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{storeSettings.data.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="flex-1 brutalist-border"
                disabled={isSubmitting}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSubmitOrder}
                className="flex-1 brutalist-border brutalist-shadow bg-primary text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? "CREATING ORDER..." : "CONTINUE TO PAYMENT"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show payment instructions after order is created
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        <div className="bg-card brutalist-border brutalist-shadow p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 brutalist-border">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black">ZELLE PAYMENT</h1>
            <p className="text-muted-foreground">
              Order #{orderId} Created
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-6">
            <div className="bg-secondary brutalist-border p-6 space-y-4">
              <h2 className="font-display font-bold text-lg">PAYMENT INSTRUCTIONS</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open your banking app and select Zelle</li>
                <li>Send ${cartTotal.toFixed(2)} to one of the following:</li>
              </ol>

              {/* Zelle Email */}
              <div className="bg-background brutalist-border p-4 space-y-2">
                <p className="text-xs font-bold text-muted-foreground">EMAIL</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-lg">{zelleEmail}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(zelleEmail)}
                    className="brutalist-border"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Zelle Phone */}
              <div className="bg-background brutalist-border p-4 space-y-2">
                <p className="text-xs font-bold text-muted-foreground">PHONE</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-lg">{zellePhone}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(zellePhone)}
                    className="brutalist-border"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <ol start={3} className="list-decimal list-inside space-y-2 text-sm">
                <li>Include your order number (#{orderId}) in the payment note</li>
                <li>We'll confirm your order once payment is received</li>
              </ol>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-display font-bold">ORDER SUMMARY</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} {item.selectedVariantName && `- ${item.selectedVariantName}`} x {item.quantity}
                    </span>
                    <span className="font-bold">
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t-3 border-border pt-2 flex justify-between font-display font-bold text-lg">
                  <span>TOTAL</span>
                  <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-secondary brutalist-border p-4">
              <p className="font-bold text-sm mb-2">
                {deliveryMethod === "pickup" ? "IN-STORE PICKUP" : "SHIPPING"}
              </p>
              {deliveryMethod === "pickup" && storeSettings.data && (
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{storeSettings.data.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{storeSettings.data.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                clearCart();
                setLocation("/");
              }}
              className="flex-1 brutalist-border brutalist-shadow bg-primary text-primary-foreground"
            >
              DONE
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Questions? Contact us at {storeSettings.data?.phone || "313-406-6589"}
          </p>
        </div>
      </div>
    </div>
  );
}
