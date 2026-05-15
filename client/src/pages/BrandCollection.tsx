// Brand Collection Page - Shows products filtered by category and brand
import { useParams, useLocation } from "wouter";
import { getProductsByCategoryAndBrand } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BrandCollection() {
  const params = useParams();
  const [location] = useLocation();
  
  // Extract category and brand from URL
  // URL format: /shisha/al-fakher or /vapes/breeze
  const pathParts = location.split('/').filter(Boolean);
  const category = pathParts[0];
  const brandSlug = pathParts[1];
  
  // Convert brand slug back to proper brand name
  const brandName = brandSlug
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const products = getProductsByCategoryAndBrand(category, brandName || '');
  
  const categoryTitles: Record<string, string> = {
    'shisha': 'Shisha',
    'vapes': 'Vapes',
    'charcoal': 'Charcoal',
    'hookahs': 'Hookahs',
    'accessories': 'Accessories',
    'bowls': 'Hookah Bowls'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-display font-black mb-4">
              {brandName} {categoryTitles[category]}
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse our selection of {brandName} products
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl font-bold mb-2">No products found</p>
              <p className="text-muted-foreground">
                We couldn't find any {brandName} products in this category.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
