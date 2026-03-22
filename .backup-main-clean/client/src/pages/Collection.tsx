// Collection Page - Neo-Brutalism meets Luxury Retail
// Features: Product grid, filters, sorting

import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, products } from "@/lib/products";
import { Button } from "@/components/ui/button";

export default function Collection() {
  const [location] = useLocation();
  const [, paramsFromRoute] = useRoute("/collections/:category");
  
  // Extract category from URL path
  const getCategoryFromPath = () => {
    if (paramsFromRoute?.category) return paramsFromRoute.category;
    const path = location.split('/')[1];
    return path || 'all';
  };
  
  const category = getCategoryFromPath();
  const [priceMin, setPriceMin] = useState("0");
  const [priceMax, setPriceMax] = useState("999");
  const [sortBy, setSortBy] = useState("best-selling");
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  const displayProducts = category === "all" 
    ? products 
    : getProductsByCategory(category);

  const filteredProducts = displayProducts.filter(p => {
    const price = p.salePrice || p.price;
    const inPriceRange = price >= parseFloat(priceMin) && price <= parseFloat(priceMax);
    const stockFilter = (!showInStock && !showOutOfStock) || 
                       (showInStock && p.inStock) || 
                       (showOutOfStock && !p.inStock);
    return inPriceRange && stockFilter;
  });

  const inStockCount = displayProducts.filter(p => p.inStock).length;
  const outOfStockCount = displayProducts.filter(p => !p.inStock).length;

  const categoryTitle = category === "all" ? "All Products" : 
                       category === "bowls" ? "Hookah Bowls" : 
                       category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{categoryTitle}</span>
          </div>

          {/* Page Title & Description */}
          <div className="mb-8">
            <h1 className="text-5xl font-display font-black mb-4">
              {categoryTitle}
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Discover an exceptional range of premium products from top brands worldwide. 
              Experience rich, long-lasting sessions with these high-quality items crafted for perfection.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-secondary brutalist-border p-6 sticky top-24">
                <h3 className="font-display font-bold text-lg mb-4">FILTERS</h3>

                {/* Sort */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2 text-sm">Sort by:</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full brutalist-border px-3 py-2 bg-background"
                  >
                    <option value="best-selling">Best selling</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-sm">Availability</h4>
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showInStock}
                      onChange={(e) => setShowInStock(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">In stock ({inStockCount})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={showOutOfStock}
                      onChange={(e) => setShowOutOfStock(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Out of stock ({outOfStockCount})</span>
                  </label>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Price</h4>
                    <button 
                      onClick={() => {
                        setPriceMin("0");
                        setPriceMax("999");
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full brutalist-border px-2 py-1 text-sm"
                    />
                    <span className="text-sm">to</span>
                    <input 
                      type="number" 
                      placeholder="999"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full brutalist-border px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                <Button className="w-full brutalist-border bg-primary text-primary-foreground">
                  APPLY FILTERS
                </Button>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} products
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-2xl font-display font-bold mb-2">No products found</p>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
