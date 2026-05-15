// Header Component - Neo-Brutalism Style
// Features: Sticky header, navigation with brand dropdowns, search, cart icon

import { ShoppingCart, Search, Menu, User, X, ChevronDown, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import PromoBar from "./PromoBar";
import { getBrandsByCategory } from "@/lib/products";
import { useSupabaseAuth } from "@/lib/SupabaseAuthProvider";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const { cartCount, openCart } = useCart();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, signInWithGoogle, signInWithApple, logout } = useSupabaseAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Categories with dropdown menus
  const categoriesWithDropdowns = ['shisha', 'vapes', 'charcoal'];

  const handleMouseEnter = (category: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    if (categoriesWithDropdowns.includes(category)) {
      setActiveDropdown(category);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimeout(timeout);
  };

  // Derive display name from Supabase user metadata
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Account";

  return (
    <>
      {/* Promotional Banner */}
      <PromoBar />
      
      {/* Warning Banner */}
      <div className="bg-foreground text-background py-2 text-center text-sm font-medium">
        <span className="text-primary">WARNING:</span> THIS PRODUCT CONTAINS NICOTINE. NICOTINE IS AN ADDICTIVE CHEMICAL.
      </div>

      {/* Announcement Bar */}
      <div className="bg-secondary py-2 text-center text-sm border-b-3 border-border">
        <Link href="/">
          <span className="hover:text-primary transition-colors duration-150 cursor-pointer">
            New Premium Hookahs Available! Check it out →
          </span>
        </Link>
      </div>

      {/* Main Header */}
      <header className="bg-background border-b-3 border-border sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <Link href="/" className="flex items-center gap-3">
                <div className="font-display font-black text-2xl tracking-tight">
                  BOSS HOOKAH
                  <span className="block text-xs font-bold tracking-wider text-primary">WHOLESALE</span>
                </div>
              </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full brutalist-border pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </button>
              </form>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Icon + Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={isAuthenticated ? "text-primary" : ""}
                >
                  <User className="h-5 w-5" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-background border-3 border-border brutalist-shadow z-[60]">
                    {isAuthenticated ? (
                      /* ── Logged-in state ── */
                      <>
                        {/* Greeting */}
                        <div className="px-4 py-3 border-b-3 border-border bg-secondary">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Signed in as</p>
                          <p className="font-black text-sm truncate">{displayName}</p>
                        </div>
                        <Link 
                          href="/account" 
                          className="flex items-center gap-2 px-4 py-3 hover:bg-secondary border-b-3 border-border font-semibold text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                        <Link 
                          href="/orders" 
                          className="flex items-center gap-2 px-4 py-3 hover:bg-secondary border-b-3 border-border font-semibold text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          Order History
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-3 hover:bg-secondary font-semibold text-sm text-left text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      /* ── Logged-out state ── */
                      <>
                        <div className="px-4 py-3 border-b-3 border-border">
                          <p className="font-black text-sm uppercase tracking-tight">Sign In</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Track orders & manage your account</p>
                        </div>

                        {/* Google Sign-In */}
                        <button
                          onClick={() => { signInWithGoogle(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary border-b border-border font-semibold text-sm transition-colors duration-100"
                        >
                          <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
                            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.9 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
                          </svg>
                          Continue with Google
                        </button>

                        {/* Apple Sign-In */}
                        <button
                          onClick={() => { signInWithApple(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary border-b-3 border-border font-semibold text-sm transition-colors duration-100"
                        >
                          <svg width="14" height="16" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" className="shrink-0 fill-current">
                            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.8 0 134.2 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                          </svg>
                          Continue with Apple
                        </button>

                        {/* View full sign-in page */}
                        <Link
                          href="/sign-in"
                          className="block px-4 py-2.5 text-xs text-center text-muted-foreground hover:text-foreground transition-colors duration-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          More sign-in options →
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Navigation Bar with Dropdowns */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-4 border-t-3 border-border relative">
            <Link href="/hookahs" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">🫖</span>
              <span className="text-sm font-semibold">Hookahs</span>
            </Link>
            
            {/* Shisha with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('shisha')}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/shisha" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
                <span className="text-2xl">🍃</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">Shisha</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Link>
              {activeDropdown === 'shisha' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border-3 border-border brutalist-shadow z-50">
                  <div className="p-4">
                    <div className="font-bold text-sm mb-2 text-primary">SHOP BY BRAND</div>
                    {getBrandsByCategory('shisha').map((brand) => (
                      <Link
                        key={brand}
                        href={`/shisha/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block py-2 px-3 hover:bg-secondary transition-colors duration-150 font-medium text-sm"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Charcoal with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('charcoal')}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/charcoal" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
                <span className="text-2xl">⚫</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">Charcoal</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Link>
              {activeDropdown === 'charcoal' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border-3 border-border brutalist-shadow z-50">
                  <div className="p-4">
                    <div className="font-bold text-sm mb-2 text-primary">SHOP BY BRAND</div>
                    {getBrandsByCategory('charcoal').map((brand) => (
                      <Link
                        key={brand}
                        href={`/charcoal/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block py-2 px-3 hover:bg-secondary transition-colors duration-150 font-medium text-sm"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vapes with Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('vapes')}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/vapes" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
                <span className="text-2xl">💨</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">Vapes</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Link>
              {activeDropdown === 'vapes' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border-3 border-border brutalist-shadow z-50">
                  <div className="p-4">
                    <div className="font-bold text-sm mb-2 text-primary">SHOP BY BRAND</div>
                    {getBrandsByCategory('vapes').map((brand) => (
                      <Link
                        key={brand}
                        href={`/vapes/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block py-2 px-3 hover:bg-secondary transition-colors duration-150 font-medium text-sm"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/accessories" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">🔧</span>
              <span className="text-sm font-semibold">Accessories</span>
            </Link>
            <Link href="/bowls" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">🥣</span>
              <span className="text-sm font-semibold">Hookah Bowls</span>
            </Link>
            <Link href="/bundles" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">📦</span>
              <span className="text-sm font-semibold">Bundles</span>
            </Link>
            <Link href="/deals" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">🏷️</span>
              <span className="text-sm font-semibold">Deals</span>
            </Link>
            <Link href="/wholesale" className="flex flex-col items-center gap-1 hover:text-primary transition-colors duration-150">
              <span className="text-2xl">🚚</span>
              <span className="text-sm font-semibold">Wholesale</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-[60] lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b-3 border-border">
              <span className="font-display font-black text-xl">MENU</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              {/* Mobile auth section */}
              {isAuthenticated ? (
                <div className="mb-4 pb-4 border-b-3 border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Signed in as</p>
                  <p className="font-black text-sm mb-3">{displayName}</p>
                  <Link href="/account" className="flex items-center gap-2 py-2 font-semibold text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2 py-2 font-semibold text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    Order History
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 py-2 font-semibold text-sm text-destructive">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="mb-4 pb-4 border-b-3 border-border">
                  <p className="font-black text-sm uppercase tracking-tight mb-3">Sign In</p>
                  <button
                    onClick={() => { signInWithGoogle(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full py-3 px-4 border-2 border-border mb-2 font-semibold text-sm bg-white"
                    style={{ boxShadow: "3px 3px 0 0 #0A0A0A" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.9 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    onClick={() => { signInWithApple(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full py-3 px-4 border-2 border-border font-semibold text-sm bg-foreground text-background"
                    style={{ boxShadow: "3px 3px 0 0 #10B981" }}
                  >
                    <svg width="13" height="15" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.8 0 134.2 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                    </svg>
                    Continue with Apple
                  </button>
                </div>
              )}

              <Link href="/hookahs" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🫖</span>
                <span className="font-semibold">Hookahs</span>
              </Link>
              <Link href="/shisha" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🍃</span>
                <span className="font-semibold">Shisha</span>
              </Link>
              <Link href="/charcoal" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">⚫</span>
                <span className="font-semibold">Charcoal</span>
              </Link>
              <Link href="/vapes" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">💨</span>
                <span className="font-semibold">Vapes</span>
              </Link>
              <Link href="/accessories" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🔧</span>
                <span className="font-semibold">Accessories</span>
              </Link>
              <Link href="/bowls" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🥣</span>
                <span className="font-semibold">Hookah Bowls</span>
              </Link>
              <Link href="/bundles" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">📦</span>
                <span className="font-semibold">Bundles</span>
              </Link>
              <Link href="/deals" className="flex items-center gap-3 py-4 border-b-3 border-border hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🏷️</span>
                <span className="font-semibold">Deals</span>
              </Link>
              <Link href="/wholesale" className="flex items-center gap-3 py-4 hover:text-primary transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl">🚚</span>
                <span className="font-semibold">Wholesale</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-background z-[60] md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 p-4 border-b-3 border-border">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
              <form onSubmit={handleSearch} className="flex-1">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full brutalist-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
