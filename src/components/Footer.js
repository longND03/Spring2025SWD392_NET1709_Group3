import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#1B2028] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
                Diana Shop
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your trusted destination for premium beauty products and expert skincare advice.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-[#E91E63] dark:text-gray-500 dark:hover:text-[#E91E63] transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-[#E91E63] dark:text-gray-500 dark:hover:text-[#E91E63] transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2.2c3.2,0,3.6,0,4.9,0.1c3.3,0.1,4.8,1.7,4.9,4.9c0.1,1.3,0.1,1.6,0.1,4.8c0,3.2,0,3.6-0.1,4.8c-0.1,3.2-1.7,4.8-4.9,4.9c-1.3,0.1-1.6,0.1-4.9,0.1c-3.2,0-3.6,0-4.8-0.1c-3.3-0.1-4.8-1.7-4.9-4.9c-0.1-1.3-0.1-1.6-0.1-4.8c0-3.2,0-3.6,0.1-4.8c0.1-3.2,1.7-4.8,4.9-4.9C8.4,2.2,8.8,2.2,12,2.2z M12,0C8.7,0,8.3,0,7.1,0.1c-4.4,0.2-6.8,2.6-7,7C0,8.3,0,8.7,0,12s0,3.7,0.1,4.9c0.2,4.4,2.6,6.8,7,7C8.3,24,8.7,24,12,24s3.7,0,4.9-0.1c4.4-0.2,6.8-2.6,7-7C24,15.7,24,15.3,24,12s0-3.7-0.1-4.9c-0.2-4.4-2.6-6.8-7-7C15.7,0,15.3,0,12,0z M12,5.8c-3.4,0-6.2,2.8-6.2,6.2s2.8,6.2,6.2,6.2s6.2-2.8,6.2-6.2S15.4,5.8,12,5.8z M12,16c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S14.2,16,12,16z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-[#E91E63] dark:text-gray-500 dark:hover:text-[#E91E63] transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/skin-test" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Skin Test
                </Link>
              </li>
              {/* <li>
                <Link to="/consultation" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Consultation
                </Link>
              </li> */}
              <li>
                <Link to="/about" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Help & Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              {/* <li>
                <Link to="/shipping" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Returns Policy
                </Link>
              </li> */}
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg 
                         bg-white dark:bg-[#2A303C]
                         border border-gray-300 dark:border-gray-600
                         text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-[#E91E63]
                         placeholder-gray-500 dark:placeholder-gray-400
                         transition-colors duration-200"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg 
                         bg-[#E91E63] hover:bg-pink-700 
                         text-white font-medium
                         transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Diana Shop. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-[#E91E63] dark:text-gray-400 dark:hover:text-[#E91E63] transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;