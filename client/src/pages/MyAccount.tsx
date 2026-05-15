// My Account Page - Supabase Auth
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";
import { User, Package, MapPin, CreditCard, LogOut } from "lucide-react";
import { useSupabaseAuth } from "@/lib/SupabaseAuthProvider";

export default function MyAccount() {
  const [, setLocation] = useLocation();
  const { user, loading, signOut, isAuthenticated } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/sign-in");
    }
    if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || "");
      setEmail(user.email || "");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleSaveProfile = () => {
    // Profile editing is read-only for OAuth users; just close edit mode
    setIsEditing(false);
    toast.info("Profile is managed by your Google/Apple account.");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Today";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-display font-black">MY ACCOUNT</h1>
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
                <div className="brutalist-border p-4 bg-primary text-primary-foreground hover:translate-x-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span className="font-bold">Profile</span>
                  </div>
                </div>
              </Link>

              <Link href="/orders" className="block">
                <div className="brutalist-border p-4 hover:bg-secondary hover:translate-x-1 transition-all">
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
            <div className="md:col-span-2">
              <div className="brutalist-border bg-background p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-black">PROFILE INFORMATION</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-muted-foreground">
                      FULL NAME
                    </label>
                    <p className="text-lg font-semibold">{displayName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-muted-foreground">
                      EMAIL ADDRESS
                    </label>
                    <p className="text-lg font-semibold">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-muted-foreground">
                      MEMBER SINCE
                    </label>
                    <p className="text-lg font-semibold">{memberSince}</p>
                  </div>

                  {user.app_metadata?.provider && (
                    <div>
                      <label className="block text-sm font-bold mb-2 text-muted-foreground">
                        SIGNED IN WITH
                      </label>
                      <p className="text-lg font-semibold capitalize">{user.app_metadata.provider}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t-3 border-border">
                  <h3 className="text-lg font-display font-black mb-4">ACCOUNT ACTIONS</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start brutalist-border"
                      onClick={() => toast.info("Email preferences coming soon")}
                    >
                      Email Preferences
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start brutalist-border text-destructive"
                      onClick={() => toast.info("Please contact support to delete your account")}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
