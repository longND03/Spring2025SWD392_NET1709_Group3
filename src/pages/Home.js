import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from "../api/axios";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5296/api/product?PageSize=4');
        setBestSellers(response.data.items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://static.vecteezy.com/system/resources/previews/050/508/298/non_2x/natural-skincare-products-with-flowers-and-stones-photo.jpg"
            alt="Beauty Care"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className={`relative container mx-auto px-4 h-full flex items-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Discover Your Natural Beauty
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Premium skincare products for your daily beauty routine. Find the perfect match for your skin type.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/skin-test">
                <button className="px-8 py-4 bg-[#E91E63] hover:bg-pink-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                  Take Skin Test
                </button>
              </Link>
              <Link to="/products">
                <button className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-[#1B2028]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Why Choose BeautyCare</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-[#2A303C] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skincare Test Banner */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-[#E91E63]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-white mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Sure About Your Skin Type?</h2>
              <p className="text-lg text-pink-100 mb-6">Take our professional skin analysis test to discover the perfect products for your unique skin type.</p>
              <Link to="/skin-test">
                <button className="px-8 py-4 bg-white text-[#E91E63] hover:bg-pink-100 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Take Skin Test Now
                </button>
              </Link>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://t3.ftcdn.net/jpg/06/76/28/82/360_F_676288295_47mfVBtgdIM7WSfPhFSuWwFDFNcpUHuv.jpg" 
                alt="Skin Test" 
                className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Best Sellers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {bestSellers.map((p) => (
              <div
                key={p.id}
                className="group relative bg-white dark:bg-[#2A303C] rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-w-1 aspect-h-1 w-full h-48 overflow-hidden">
                  <img
                    src={p.productImages[0]}
                    alt={p.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2 dark:text-white line-clamp-1">{p.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">{p.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xl font-bold text-[#E91E63]">${p.price}</span>
                    <button className="px-4 py-2 bg-[#E91E63] hover:bg-pink-700 text-white rounded-full text-sm transition-colors duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#E91E63]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-pink-100 mb-8">
              Subscribe to our newsletter for exclusive offers and beauty tips
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white hover:bg-gray-100 text-[#E91E63] rounded-full font-medium transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

// Data for features section
const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-[#E91E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Natural Ingredients",
    description: "We use only the finest natural ingredients for healthy and glowing skin."
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#E91E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Free Shipping",
    description: "Free shipping on all orders over $50. Fast and secure delivery."
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#E91E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    title: "100% Satisfaction",
    description: "Love it or get your money back with our 30-day guarantee."
  }
];

export default Home;