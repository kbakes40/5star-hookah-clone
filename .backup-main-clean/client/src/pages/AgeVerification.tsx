import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AgeVerification() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-display font-black mb-6">AGE VERIFICATION</h1>
          <div className="brutalist-border bg-secondary p-12">
            <p className="text-2xl font-bold mb-4">21+ Only</p>
            <p className="mb-6">You must be 21 years or older to purchase tobacco products.</p>
            <p>Age verification is conducted at checkout through a third-party service.</p>
            <p className="mt-6 text-sm">By using this site, you confirm you are of legal age in your jurisdiction.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
