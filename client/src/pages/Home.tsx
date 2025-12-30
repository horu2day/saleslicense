import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Github, Zap, Shield, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";

/**
 * Design Philosophy: Playful Modernism with Bold Personality
 * - Clean white background with vibrant magenta/pink accents (#E91E8C)
 * - Bold Poppins typography for headlines, clean Inter for body
 * - Floating geometric shapes for visual interest
 * - Smooth transitions and hover effects
 * - Generous whitespace and asymmetric layouts
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [floatingY, setFloatingY] = useState(0);

  // Floating animation for decorative elements
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingY((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const softwareProducts = [
    {
      id: 1,
      name: "Pro Design Suite",
      category: "Design Tools",
      price: "$49.99",
      icon: "🎨",
      description: "Professional design software with advanced features",
    },
    {
      id: 2,
      name: "Code Master IDE",
      category: "Development",
      price: "$79.99",
      icon: "💻",
      description: "Powerful IDE for modern development",
    },
    {
      id: 3,
      name: "Video Editor Pro",
      category: "Video",
      price: "$99.99",
      icon: "🎬",
      description: "Professional video editing software",
    },
    {
      id: 4,
      name: "Audio Studio",
      category: "Audio",
      price: "$59.99",
      icon: "🎵",
      description: "Complete audio production suite",
    },
    {
      id: 5,
      name: "3D Modeler",
      category: "3D Graphics",
      price: "$129.99",
      icon: "🎭",
      description: "Advanced 3D modeling and rendering",
    },
    {
      id: 6,
      name: "Data Analytics",
      category: "Analytics",
      price: "$89.99",
      icon: "📊",
      description: "Powerful data analysis and visualization",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Indie Developer",
      quote:
        "I sold my first software license within 24 hours. The process was incredibly simple.",
      earnings: "$5,234",
    },
    {
      name: "Marcus Johnson",
      role: "Designer",
      quote:
        "This platform helped me monetize my design tools and reach thousands of customers.",
      earnings: "$12,450",
    },
    {
      name: "Elena Rodriguez",
      role: "Software Engineer",
      quote:
        "I can focus on building great software while the platform handles all the sales.",
      earnings: "$18,900",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Instant license delivery and activation for your customers",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "Enterprise-grade security and fraud protection built-in",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Scale Easily",
      description: "Handle thousands of transactions without breaking a sweat",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
              SoftHub
            </div>
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded font-medium">
              Software Licenses
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              Discover
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              Blog
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">{user?.name || "User"}</span>
                <a href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={logout}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Log in
                </Button>
              </>
            )}
            <Button className="bg-black text-white hover:bg-gray-900 transition-colors duration-200">
              Start selling
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        {/* Floating shapes background - animated */}
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-400 opacity-20 blur-3xl transition-transform duration-1000"
          style={{ transform: `translateY(${floatingY * 0.5}px)` }}
        ></div>
        <div
          className="absolute top-40 right-20 w-48 h-48 rounded-full bg-pink-300 opacity-15 blur-3xl transition-transform duration-1000"
          style={{ transform: `translateY(${-floatingY * 0.3}px)` }}
        ></div>
        <div
          className="absolute bottom-10 left-1/3 w-40 h-40 rounded-full bg-pink-200 opacity-20 blur-3xl transition-transform duration-1000"
          style={{ transform: `translateY(${floatingY * 0.4}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-black leading-tight">
              Go from 0 to $1
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Anyone can earn their first dollar online. Just start with what you
              know, see what sticks, and get paid. It's that easy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button className="bg-black text-white hover:bg-gray-900 px-8 py-6 text-lg font-medium transition-all duration-200 hover:shadow-lg">
                Start selling
              </Button>
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search marketplace ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 px-4 py-3 border-2 border-gray-300 rounded focus:border-pink-500 focus:outline-none transition-colors duration-200"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-pink-600 transition-colors">
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Contribute or fork on{" "}
              <a
                href="#"
                className="text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1 justify-center transition-colors"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-200"
              >
                <div className="text-pink-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-black">Sell anything</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Software licenses, courses, templates, plugins, or anything
                digital. Our platform was created to help you experiment with all
                kinds of ideas and formats.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">One-time purchases or subscriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">Automatic license key generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">Instant delivery to customers</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-lg border border-pink-200 hover:shadow-lg transition-shadow">
              <div className="text-6xl text-center mb-4">💻</div>
              <p className="text-center text-gray-700 font-medium">
                Professional software licensing platform
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200 hover:shadow-lg transition-shadow order-2 md:order-1">
              <div className="text-6xl text-center mb-4">🚀</div>
              <p className="text-center text-gray-700 font-medium">
                Launch your software business today
              </p>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-4 text-black">Make your own road</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Whether you need more balance, flexibility, or just a different
                gig, we make it easy to chart a new path. Sell software licenses
                on your own terms.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">Set your own prices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">Keep 95% of your earnings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 font-bold mt-1 text-lg">✓</span>
                  <span className="text-gray-700">No setup fees or hidden costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Software Products Showcase */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center text-black">
            Popular Software Licenses
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover the best-selling software licenses and tools from our
            community of creators
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {softwareProducts.map((product) => (
              <Card
                key={product.id}
                className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-pink-300 bg-white"
              >
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-black">{product.name}</h3>
                <p className="text-sm text-pink-600 font-medium mb-3">
                  {product.category}
                </p>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-black">
                    {product.price}
                  </span>
                  <Button className="bg-black text-white hover:bg-gray-900 transition-colors">
                    Buy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center text-black">
            Success Stories
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Join thousands of creators earning money from their software
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 border border-gray-200 hover:border-pink-300 transition-all duration-200 bg-white hover:shadow-md"
              >
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-black">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 mb-3">{testimonial.role}</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {testimonial.earnings}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to start selling software?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            You don't have to be a tech expert. Just take what you know and
            sell it. It's that simple.
          </p>
          <Button className="bg-pink-600 text-white hover:bg-pink-700 px-8 py-6 text-lg font-medium transition-colors duration-200">
            Start selling now
          </Button>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-6xl font-bold text-black mb-4">$2,847,392</p>
            <p className="text-gray-600 text-lg">
              Total earnings by software creators this week
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors">
              <p className="text-4xl font-bold text-pink-600 mb-2">12,500+</p>
              <p className="text-gray-600">Software products sold</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors">
              <p className="text-4xl font-bold text-pink-600 mb-2">45,000+</p>
              <p className="text-gray-600">Active creators</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors">
              <p className="text-4xl font-bold text-pink-600 mb-2">500,000+</p>
              <p className="text-gray-600">Happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 SoftHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
