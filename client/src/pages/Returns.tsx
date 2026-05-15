import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Returns() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">RETURN POLICY</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">Coming Soon</p>
            <p>We're finalizing our return and exchange policy.</p>
            <p className="mt-6 text-sm">For return inquiries, call <a href="tel:+13134066589" className="text-primary hover:underline">(313) 406-6589</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
