// Checkout Cancel Page
// Displays message when user cancels checkout

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-2xl text-center">
          <div className="bg-secondary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 brutalist-border">
            <XCircle className="h-12 w-12 text-foreground" />
          </div>
          
          <h1 className="text-5xl font-display font-black mb-4">CHECKOUT CANCELLED</h1>
          <p className="text-xl mb-8">
            Your order was not completed. Your cart items are still saved.
          </p>
          
          <div className="bg-secondary brutalist-border p-8 mb-8">
            <p className="font-semibold mb-4">Need help?</p>
            <p className="text-sm text-muted-foreground">
              If you experienced any issues during checkout, please contact our support team.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="brutalist-border">
                CONTINUE SHOPPING
              </Button>
            </Link>
            <Button className="brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              TRY AGAIN
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
