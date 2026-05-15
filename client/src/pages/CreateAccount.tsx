// Create Account Page - Demo Registration
import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";

export default function CreateAccount() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Demo registration - save to localStorage
    localStorage.setItem("demoUser", JSON.stringify({
      email: email,
      name: name,
      loggedIn: true,
      createdAt: new Date().toISOString()
    }));
    
    toast.success("Account created successfully!");
    setLocation("/account");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container max-w-md">
          <div className="brutalist-border bg-background p-8">
            <h1 className="text-4xl font-display font-black mb-2">CREATE ACCOUNT</h1>
            <p className="text-muted-foreground mb-8">
              Join us and start shopping premium hookah products.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2">
                  FULL NAME
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="brutalist-border"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2">
                  EMAIL ADDRESS
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="brutalist-border"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold mb-2">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="brutalist-border"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">
                  CONFIRM PASSWORD
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="brutalist-border"
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" className="brutalist-border mt-1" required />
                <label className="text-sm">
                  I agree to the <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-lg font-black"
              >
                CREATE ACCOUNT
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-primary hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-8 border-t-3 border-border">
              <p className="text-xs text-center text-muted-foreground">
                🎭 <strong>DEMO MODE:</strong> Enter any details to create a demo account
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
