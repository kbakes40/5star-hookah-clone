import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Wishlist() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">WISHLIST</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">Coming Soon</p>
            <p>Save your favorite products and share your wishlist with friends.</p>
            <p className="mt-6">This feature is under development.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
