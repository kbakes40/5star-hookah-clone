import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">CONTACT US</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">Coming Soon</p>
            <p className="mb-6">We're building our contact form. In the meantime, reach us at:</p>
            <div className="space-y-3">
              <p><strong>Phone:</strong> <a href="tel:+13134066589" className="text-primary hover:underline">(313) 406-6589</a></p>
              <p><strong>Address:</strong> 6520 Greenfield Rd, Dearborn, MI 48126</p>
              <p><strong>Hours:</strong> Open Daily, Closes 1:00 AM</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
