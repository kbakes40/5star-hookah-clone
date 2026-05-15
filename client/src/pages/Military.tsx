import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Military() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">MILITARY DISCOUNT</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">Coming Soon</p>
            <p className="mb-6">We're setting up our military verification system.</p>
            <p>Active duty, veterans, and military families will receive exclusive discounts.</p>
            <p className="mt-6 text-sm">Call us at <a href="tel:+13134066589" className="text-primary hover:underline">(313) 406-6589</a> for current offers.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
