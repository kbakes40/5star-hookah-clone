import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Ultimate Guide to Setting Up Your First Hookah",
    slug: "ultimate-guide-hookah-setup",
    excerpt: "Learn how to properly set up your hookah for the perfect smoking session. From packing the bowl to managing heat, we cover everything you need to know.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 6, 2026",
    category: "Guides",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=800&q=80"
  },
  {
    id: "2",
    title: "Al Fakher vs Starbuzz: Which Shisha Brand is Right for You?",
    slug: "al-fakher-vs-starbuzz-comparison",
    excerpt: "Compare the two most popular shisha tobacco brands. Discover the differences in flavor profiles, cut, smoke output, and price to make an informed choice.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 5, 2026",
    category: "Reviews",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
  },
  {
    id: "3",
    title: "Top 10 Best Shisha Flavors to Try in 2026",
    slug: "best-shisha-flavors-2026",
    excerpt: "Explore the most popular and unique shisha flavors of 2026. From classic mint to exotic fruit blends, find your next favorite flavor.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 4, 2026",
    category: "Guides",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80"
  },
  {
    id: "4",
    title: "Natural Charcoal vs Quick Light: Which is Better?",
    slug: "natural-vs-quick-light-charcoal",
    excerpt: "Understanding the differences between coconut charcoal and quick-light charcoal. Learn which type is best for your hookah sessions.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 3, 2026",
    category: "Guides",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=800&q=80"
  },
  {
    id: "5",
    title: "How to Clean and Maintain Your Hookah for Longevity",
    slug: "hookah-cleaning-maintenance-guide",
    excerpt: "Proper maintenance is key to enjoying your hookah for years. Follow our step-by-step cleaning guide to keep your hookah in perfect condition.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 2, 2026",
    category: "Maintenance",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
  },
  {
    id: "6",
    title: "Hookah Wholesale: Starting Your Own Hookah Business",
    slug: "starting-hookah-wholesale-business",
    excerpt: "Thinking about starting a hookah business? Learn about wholesale pricing, licensing requirements, inventory management, and marketing strategies.",
    content: "",
    author: "Boss Hookah Team",
    date: "February 1, 2026",
    category: "Business",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
  }
];

export default function Blog() {
  useEffect(() => {
    document.title = "Hookah Blog - Tips, Guides & Reviews | Boss Hookah Wholesale";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container">
            <h1 className="text-5xl font-display font-black mb-4">HOOKAH BLOG</h1>
            <p className="text-xl max-w-2xl">
              Expert guides, product reviews, and tips for hookah enthusiasts. Stay updated with the latest trends in shisha, vapes, and accessories.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-background brutalist-border brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 overflow-hidden group"
                >
                  {/* Featured Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <span className="inline-block bg-primary text-white px-3 py-1 text-xs font-bold mb-3">
                      {post.category}
                    </span>

                    {/* Title */}
                    <h2 className="text-xl font-display font-bold mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More Link */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-150"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16 bg-secondary">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-display font-black mb-6">Why Read Our Hookah Blog?</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                Welcome to the Boss Hookah Wholesale blog, your ultimate resource for everything related to hookahs, shisha tobacco, vapes, and smoking accessories. Whether you're a beginner looking to set up your first hookah or an experienced enthusiast seeking advanced tips, our expert guides cover it all.
              </p>
              <p>
                Our team of hookah experts shares in-depth product reviews, flavor comparisons, maintenance guides, and industry insights to help you make informed purchasing decisions. We cover popular brands like Al Fakher, Starbuzz, and Snoop Dogg's signature tobacco blends, providing honest assessments of quality, flavor profiles, and value.
              </p>
              <p>
                Learn about the differences between natural coconut charcoal and quick-light options, discover the best hookah bowls for optimal heat management, and explore the latest trends in modern hookah designs. Our blog also features business advice for entrepreneurs looking to enter the hookah wholesale market, including licensing requirements, supplier relationships, and marketing strategies.
              </p>
              <p>
                Stay updated with new product launches, seasonal flavor releases, and exclusive deals from Boss Hookah Wholesale. Subscribe to our newsletter to receive the latest articles directly in your inbox and join our community of hookah enthusiasts across Dearborn, Michigan, and beyond.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
