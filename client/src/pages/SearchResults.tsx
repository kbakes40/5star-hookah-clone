import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, Product, ProductVariant } from "@/lib/products";

export default function SearchResults() {
  const [location] = useLocation();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Extract search query from URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    setSearchQuery(query);

    if (query.trim()) {
      // Search across all products
      const results = products.filter((product: Product) => {
        const searchTerm = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          // Search in variants if they exist
          (product.variants &&
            product.variants.some((variant: ProductVariant) =>
              variant.name.toLowerCase().includes(searchTerm)
            )) ||
          // Search in description if it exists
          (product.description &&
            product.description.toLowerCase().includes(searchTerm))
        );
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container">
          {/* Search Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-display font-black mb-4">
              SEARCH RESULTS
            </h1>
            {searchQuery && (
              <p className="text-lg">
                {searchResults.length > 0 ? (
                  <>
                    Found <span className="font-bold">{searchResults.length}</span>{" "}
                    {searchResults.length === 1 ? "result" : "results"} for{" "}
                    <span className="font-bold">"{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    No results found for{" "}
                    <span className="font-bold">"{searchQuery}"</span>
                  </>
                )}
              </p>
            )}
            {!searchQuery && (
              <p className="text-lg text-muted-foreground">
                Enter a search term to find products
              </p>
            )}
          </div>

          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-display font-black mb-4">
                  NO PRODUCTS FOUND
                </h2>
                <p className="text-muted-foreground mb-8">
                  Try searching with different keywords or browse our collections
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/collections/hookahs"
                    className="brutalist-border bg-background hover:bg-secondary px-6 py-3 font-bold transition-colors"
                  >
                    BROWSE HOOKAHS
                  </a>
                  <a
                    href="/collections/vapes"
                    className="brutalist-border bg-background hover:bg-secondary px-6 py-3 font-bold transition-colors"
                  >
                    BROWSE VAPES
                  </a>
                  <a
                    href="/collections/charcoal"
                    className="brutalist-border bg-background hover:bg-secondary px-6 py-3 font-bold transition-colors"
                  >
                    BROWSE CHARCOAL
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
