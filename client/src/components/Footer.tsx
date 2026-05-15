// Footer Component - Neo-Brutalism meets Luxury Retail
// Features: Collapsible dropdown menus for Links, Store Location, and Social

import { Link } from "wouter";
import { Instagram, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [linksOpen, setLinksOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  return (
    <footer className="bg-background border-t-3 border-border mt-20">
      {/* Gift Card Banner */}
      <div className="bg-secondary border-b-3 border-border py-12">
        <div className="container text-center">
          <h3 className="text-3xl font-display font-black mb-2">NEED THE PERFECT GIFT?</h3>
            <Link href="/gift-cards" className="text-primary hover:underline font-semibold">
              Send a gift card →
            </Link>
        </div>
      </div>

      {/* Main Footer Content - Dropdown Menus */}
      <div className="container py-8">
        {/* Links Dropdown */}
        <div className="border-b-3 border-border">
          <button
            onClick={() => setLinksOpen(!linksOpen)}
            className="w-full flex items-center justify-between py-4 font-display font-bold text-lg hover:text-primary transition-colors"
          >
            <span>Links</span>
            {linksOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {linksOpen && (
            <div className="pb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/contact" className="hover:text-primary transition-colors py-1">Contact Us</Link>
              <Link href="/returns" className="hover:text-primary transition-colors py-1">Return Policy</Link>
              <Link href="/account" className="hover:text-primary transition-colors py-1">Account</Link>
              <Link href="/wishlist" className="hover:text-primary transition-colors py-1">Wishlist</Link>
              <Link href="/terms" className="hover:text-primary transition-colors py-1">Terms & Conditions</Link>
              <Link href="/age-verification" className="hover:text-primary transition-colors py-1">Age Verification</Link>
              <Link href="/military" className="hover:text-primary transition-colors py-1">Military Discount</Link>
              <Link href="/about" className="hover:text-primary transition-colors py-1">About Us</Link>
            </div>
          )}
        </div>

        {/* Store Location Dropdown */}
        <div className="border-b-3 border-border">
          <button
            onClick={() => setLocationOpen(!locationOpen)}
            className="w-full flex items-center justify-between py-4 font-display font-bold text-lg hover:text-primary transition-colors"
          >
            <span>Store Location & Hours</span>
            {locationOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {locationOpen && (
            <div className="pb-6 space-y-4">
              <div>
                <p className="font-semibold">The Boss Hookah Wholesale</p>
                <p>6520 Greenfield Rd</p>
                <p>Dearborn, MI 48126</p>
                <a href="tel:+13134066589" className="mt-2 inline-block hover:text-primary transition-colors">(313) 406-6589</a>
              </div>
              <div>
                <p className="font-semibold">Store Hours</p>
                <p>Open Daily</p>
                <p>Closes 1:00 AM</p>
              </div>
              <div>
                <a 
                  href="https://maps.app.goo.gl/2sXDxnhukx8pzuW3A" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-primary hover:underline font-semibold"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Social Dropdown */}
        <div className="border-b-3 border-border">
          <button
            onClick={() => setSocialOpen(!socialOpen)}
            className="w-full flex items-center justify-between py-4 font-display font-bold text-lg hover:text-primary transition-colors"
          >
            <span>Social</span>
            {socialOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {socialOpen && (
            <div className="pb-6 flex gap-4 flex-wrap">
              <a href="https://www.instagram.com/bosshookahshop/" target="_blank" rel="noopener noreferrer" 
                 className="w-12 h-12 bg-foreground text-background flex items-center justify-center brutalist-border hover:bg-primary hover:border-primary transition-colors duration-150"
                 title="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="/blog" 
                 className="w-12 h-12 bg-foreground text-background flex items-center justify-center brutalist-border hover:bg-primary hover:border-primary transition-colors duration-150"
                 title="Blog">
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-3 border-border py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <select className="brutalist-border px-4 py-2 bg-background">
              <option>United States (USD $)</option>
              <option>Canada (CAD $)</option>
              <option>United Kingdom (GBP £)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">Payment Methods:</span>
            <div className="flex gap-2">
              <div className="w-10 h-6 brutalist-border bg-secondary flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="w-10 h-6 brutalist-border bg-secondary flex items-center justify-center text-xs font-bold">MC</div>
              <div className="w-10 h-6 brutalist-border bg-secondary flex items-center justify-center text-xs font-bold">AMEX</div>
            </div>
          </div>

          <p className="text-sm">© 2026, Boss Hookah Wholesale</p>
        </div>
      </div>


    </footer>
  );
}
