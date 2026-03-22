// PromoBar Component - Scrolling promotional banner
// Features: Auto-scrolling text with promotional messages

import { useEffect, useState } from "react";

const promoMessages = [
  "🔥 NEW ARRIVALS: Premium Hookahs Just Dropped!",
  "💨 FREE SHIPPING on orders over $75",
  "⭐ TRENDING: Exotic Shisha Flavors Now Available",
  "🎁 SPECIAL OFFER: Buy 2 Get 1 Free on Select Items",
  "🚚 WHOLESALE PRICING: Contact Us for Bulk Orders"
];

export default function PromoBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promoMessages.length);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-foreground text-background py-2 overflow-hidden border-b-3 border-border">
      <div className="container">
        <div className="flex items-center justify-center">
          <div className="animate-fade-in font-semibold text-sm md:text-base text-center">
            {promoMessages[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
