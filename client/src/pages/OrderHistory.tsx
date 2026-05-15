// Order History Page - Supabase Auth
import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, Package, MapPin, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { useSupabaseAuth } from "@/lib/SupabaseAuthProvider";

// Mock order data (replace with real DB query when orders are stored in Supabase)
const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-02-03",
    status: "Delivered",
    total: 89.97,
    items: [
      { name: "Premium Tobacco Blend 250g", quantity: 2, price: 19.99 },
      { name: "Modern Glass Hookah", quantity: 1, price: 49.99 }
    ]
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-28",
    status: "In Transit",
    total: 124.96,
    items: [
      { name: "Designer Hookah Premium", quantity: 1, price: 99.99 },
      { name: "Classic Tobacco 250g", quantity: 2, price: 14.99 }
    ]
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-15",
    status: "Delivered",
    total: 67.95,
    items: [
      { name: "Blonde Leaf Tobacco 250g", quantity: 3, price: 17.99 },
      { name: "Hookah Accessories Kit", quantity: 1, price: 14.98 }
    ]
  }
];

export default function OrderHistory() {
  const [, setLocation] = useLocation();
  const { user, loading, signOut, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/sign-in");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500 text-white";
      case "In Transit":
        return "bg-blue-500 text-white";
      case "Processing":
        return "bg-yellow-500 text-foreground";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-display font-black">ORDER HISTORY</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="brutalist-border gap-2"
            >
              <LogOut className="h-4 w-4" />
              LOGOUT
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar Navigation */}
            <div className="space-y-3">
              <Link href="/account" className="block">
                <div className="brutalist-border p-4 hover:bg-secondary hover:translate-x-1 transition-all">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span className="font-bold">Profile</span>
                  </div>
                </div>
              </Link>

              <Link href="/orders" className="block">
                <div className="brutalist-border p-4 bg-primary text-primary-foreground hover:translate-x-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    <span className="font-bold">Order History</span>
                  </div>
                </div>
              </Link>

              <div className="brutalist-border p-4 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <span className="font-bold">Addresses</span>
                </div>
              </div>

              <div className="brutalist-border p-4 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-bold">Payment Methods</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {mockOrders.length === 0 ? (
                <div className="brutalist-border bg-background p-16 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-display font-black mb-2">NO ORDERS YET</h2>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Link href="/">
                    <Button className="brutalist-border brutalist-shadow bg-primary text-primary-foreground">
                      START SHOPPING
                    </Button>
                  </Link>
                </div>
              ) : (
                mockOrders.map((order) => (
                  <div key={order.id} className="brutalist-border bg-background p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b-3 border-border">
                      <div>
                        <h3 className="text-xl font-display font-black mb-1">
                          {order.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className={`px-3 py-1 brutalist-border text-sm font-bold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="price-tag font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t-3 border-border">
                      <span className="font-display font-black text-lg">TOTAL</span>
                      <span className="price-tag font-black text-xl">
                        ${order.total.toFixed(2)} USD
                      </span>
                    </div>

                    {/* Order Actions */}
                    <div className="flex gap-3 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 brutalist-border gap-2"
                        onClick={() => alert(`View details for ${order.id}`)}
                      >
                        VIEW DETAILS
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      {order.status === "Delivered" && (
                        <Button
                          variant="outline"
                          className="flex-1 brutalist-border"
                          onClick={() => alert(`Reorder items from ${order.id}`)}
                        >
                          REORDER
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
