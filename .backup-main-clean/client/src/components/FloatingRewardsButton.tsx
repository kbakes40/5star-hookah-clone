import { ShoppingBag, Heart, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "./ui/button";

export default function FloatingRewardsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-white text-foreground brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 flex items-center justify-center z-50 group"
        aria-label="Member Rewards"
      >
        <div className="relative">
          <ShoppingBag className="h-8 w-8" />
          <Heart 
            className="h-4 w-4 absolute -top-1 -right-1 fill-current" 
            strokeWidth={0}
          />
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-background brutalist-border brutalist-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-foreground text-background p-6 flex items-center justify-between border-b-3 border-border sticky top-0 z-10">
              <h1 className="text-2xl font-display font-black">BOSS HOOKAH REWARDS</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:scale-110 transition-transform duration-150"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Join Section */}
              <div className="bg-primary text-primary-foreground p-8 brutalist-border text-center">
                <h2 className="text-3xl font-display font-black mb-4">JOIN NOW</h2>
                <p className="mb-6 text-lg">Start earning rewards with every purchase!</p>
                <Link href="/create-account">
                  <Button 
                    className="bg-background text-foreground hover:bg-secondary brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    CREATE ACCOUNT
                  </Button>
                </Link>
                <p className="mt-4 text-sm">
                  Already have an account? <Link href="/sign-in" className="underline font-bold" onClick={() => setIsOpen(false)}>Sign in</Link>
                </p>
              </div>

              {/* Stars Section */}
              <div>
                <h2 className="text-2xl font-display font-black mb-4">Stars</h2>
                <p className="text-muted-foreground mb-6">
                  Earn more Stars for different actions, and turn those Stars into awesome rewards!
                </p>

                <div className="space-y-4">
                  <button className="w-full flex items-center gap-4 p-4 brutalist-border hover:bg-secondary transition-colors duration-150">
                    <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <span className="text-lg font-bold flex-1 text-left">Ways to earn</span>
                    <span className="text-muted-foreground">→</span>
                  </button>

                  <button className="w-full flex items-center gap-4 p-4 brutalist-border hover:bg-secondary transition-colors duration-150">
                    <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <span className="text-lg font-bold flex-1 text-left">Ways to redeem</span>
                    <span className="text-muted-foreground">→</span>
                  </button>
                </div>
              </div>

              {/* Referrals Section */}
              <div>
                <h2 className="text-2xl font-display font-black mb-4">Referrals</h2>
                <p className="text-muted-foreground mb-6">
                  Give your friends a reward and claim your own when they make a purchase.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 brutalist-border bg-secondary">
                    <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">They get</p>
                      <p className="text-sm text-muted-foreground">16% off coupon</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 brutalist-border bg-secondary">
                    <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center">
                      <span className="text-2xl">💵</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">You get</p>
                      <p className="text-sm text-muted-foreground">$10 off coupon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
