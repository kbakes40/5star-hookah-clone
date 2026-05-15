import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Gift, DollarSign, Users, X } from "lucide-react";
import { useLocation } from "wouter";

export default function MemberPerks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-display font-black">BOSS HOOKAH REWARDS</h1>
            <button
              onClick={() => setLocation("/")}
              className="w-12 h-12 brutalist-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Join CTA */}
          <div className="brutalist-card p-8 mb-8 bg-primary text-white">
            <h2 className="text-3xl font-display font-black mb-4">JOIN NOW</h2>
            <p className="text-lg mb-6">
              Start earning rewards and unlock exclusive benefits with every purchase.
            </p>
            <Button 
              size="lg"
              className="bg-white text-foreground hover:bg-secondary brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold"
            >
              CREATE ACCOUNT
            </Button>
            <p className="mt-4 text-sm">
              Already have an account?{" "}
              <button 
                onClick={() => setLocation("/sign-in")}
                className="underline font-bold hover:no-underline"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Stars Section */}
          <div className="brutalist-card p-8 mb-8">
            <h2 className="text-3xl font-display font-black mb-4">STARS</h2>
            <p className="text-lg mb-6 text-muted-foreground">
              Earn more Stars for different actions, and turn those Stars into awesome rewards!
            </p>

            {/* Ways to Earn */}
            <div className="mb-8">
              <button className="w-full flex items-center justify-between p-6 brutalist-border hover:bg-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 brutalist-border flex items-center justify-center bg-primary text-white">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg">Ways to earn</span>
                </div>
                <span className="text-2xl">→</span>
              </button>
            </div>

            {/* Ways to Redeem */}
            <div>
              <button className="w-full flex items-center justify-between p-6 brutalist-border hover:bg-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 brutalist-border flex items-center justify-center bg-primary text-white">
                    <Gift className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-lg">Ways to redeem</span>
                </div>
                <span className="text-2xl">→</span>
              </button>
            </div>
          </div>

          {/* Referrals Section */}
          <div className="brutalist-card p-8">
            <h2 className="text-3xl font-display font-black mb-4">REFERRALS</h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Give your friends a reward and claim your own when they make a purchase.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* They Get */}
              <div className="p-6 brutalist-border bg-secondary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 brutalist-border flex items-center justify-center bg-primary text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-xl">They get</h3>
                </div>
                <p className="text-3xl font-display font-black">16% off coupon</p>
              </div>

              {/* You Get */}
              <div className="p-6 brutalist-border bg-secondary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 brutalist-border flex items-center justify-center bg-primary text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-xl">You get</h3>
                </div>
                <p className="text-3xl font-display font-black">$10 off coupon</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
