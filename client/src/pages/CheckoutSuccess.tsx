// Checkout Success Page
// Displays confirmation after successful payment with pickup instructions

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { CheckCircle, MapPin, Phone, Clock, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function CheckoutSuccess() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("shipping");

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const method = params.get("delivery_method");
    if (sessionId) setOrderId(sessionId);
    if (method) setDeliveryMethod(method);
  }, [location]);

  // Fetch order details by session ID
  const { data: orderDetails } = trpc.store.getOrderBySessionId.useQuery(
    { sessionId: orderId || "" },
    { enabled: !!orderId }
  );

  // Fetch store settings for pickup instructions
  const { data: storeSettings } = trpc.store.getSettings.useQuery(undefined, {
    enabled: deliveryMethod === "pickup",
  });

  const isPickup = deliveryMethod === "pickup";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 brutalist-border">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="text-5xl font-display font-black mb-4">ORDER CONFIRMED!</h1>
            <p className="text-xl mb-2">
              Thank you for your purchase. Your order has been successfully processed.
            </p>
            {orderDetails && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Order Number: <span className="font-mono font-semibold text-lg text-primary">#{orderDetails.id}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Stripe Session: <span className="font-mono">{orderId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Pickup Instructions */}
          {isPickup && storeSettings ? (
            <div className="bg-white brutalist-border brutalist-shadow p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-display font-black">IN-STORE PICKUP</h2>
              </div>

              <div className="space-y-6">
                {/* Store Address */}
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Pickup Location</p>
                    <p className="text-gray-700">{storeSettings.storeName}</p>
                    <p className="text-gray-700">{storeSettings.address}</p>
                    <p className="text-gray-700">
                      {storeSettings.city}, {storeSettings.state} {storeSettings.zipCode}
                    </p>
                  </div>
                </div>

                {/* Store Hours */}
                <div className="flex gap-4">
                  <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Store Hours</p>
                    <div className="text-gray-700 whitespace-pre-line">{storeSettings.hours}</div>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Contact</p>
                    <p className="text-gray-700">{storeSettings.phone}</p>
                    {storeSettings.email && (
                      <p className="text-gray-700">{storeSettings.email}</p>
                    )}
                  </div>
                </div>

                {/* Pickup Instructions */}
                <div className="bg-primary/5 p-4 rounded-lg brutalist-border mt-6">
                  <p className="font-semibold mb-2">Pickup Instructions:</p>
                  <p className="text-gray-700 whitespace-pre-line">
                    {storeSettings.pickupInstructions}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Shipping Information */
            <div className="bg-secondary brutalist-border p-8 mb-8">
              <p className="font-semibold mb-4 text-lg">What's next?</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>You'll receive an order confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>We'll send tracking information once your order ships</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Estimated delivery: 3-5 business days</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button className="brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
