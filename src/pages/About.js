import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with gradient image */}
            <div className="relative h-[40vh] mb-16">
                {/* Placeholder for background image */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/80 to-purple-500/80">
                    {/* Image will be added here */}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-6xl font-bold text-white">
                        About Us
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Placeholder for future paragraph */}
                    <p className="text-lg text-gray-600 text-center mb-16">
                        At Diana Shop, we believe that skincare is more than just a routine—it's a form of self-care. 
                        Our e-commerce store offers a wide variety of skincare products tailored to different skin types and concerns. 
                        Whether you're looking for hydration, anti-aging, or brightening solutions, we have carefully curated products 
                        to meet your needs. Explore our blog for expert skincare tips, try our skin test to find the perfect match for 
                        your skin, and browse by tags to easily discover your favorites. At Diana Shop, we're dedicated to helping you 
                        achieve healthy, glowing skin with products that truly work!
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <Link
                        to="/products"
                        className="flex items-center justify-center px-6 py-4 bg-[#E91E63] hover:bg-pink-700 text-white rounded-lg transition-colors duration-200 text-lg font-semibold"
                    >
                        Products
                    </Link>
                    <Link
                        to="/skin-test"
                        className="flex items-center justify-center px-6 py-4 bg-[#E91E63] hover:bg-pink-700 text-white rounded-lg transition-colors duration-200 text-lg font-semibold"
                    >
                        Skin Test
                    </Link>
                    <Link
                        to="/blog"
                        className="flex items-center justify-center px-6 py-4 bg-[#E91E63] hover:bg-pink-700 text-white rounded-lg transition-colors duration-200 text-lg font-semibold"
                    >
                        Blog
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default About;