import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to Skincare System</h1>
      <p className="text-lg mb-8">
        Discover your skin type and find the perfect products for your skincare routine
      </p>
      <Link to="/skin-test">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200">
          TAKE SKIN TYPE TEST
        </button>
      </Link>
    </div>
  );
};

export default Home; 