import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">ABOUT US</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">Boss Hookah Wholesale</p>
            <p className="mb-6">Premium hookahs, shisha tobacco, vapes, and accessories in Dearborn, MI.</p>
            <p className="mb-4">Open Daily until 1:00 AM</p>
            <p className="text-sm">More about our story coming soon...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
