import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Footer from './components/Footer';
import SkinTest from './pages/SkinTest';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Products from './pages/Products';
import Cart from './components/Cart';
import StaffProductManagement from './components/StaffProductManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Checkout from './pages/Checkout';

import StaffManager from './components/StaffManager';

import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';


function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-[#1B2028] dark:text-white transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/skin-test" element={<SkinTest />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route
                  path="/admindashboard"
                  element={
                    <PrivateRoute requiredRole="Manager">
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/staff/products"
                  element={
                    <PrivateRoute requiredRole="Staff">
                      <StaffProductManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <UserProfile />
                    </PrivateRoute>
                  }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/staff-manager"
                  element={
                    <PrivateRoute requiredRole={ "Staff"}>
                      <StaffManager />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              stacked
              hideProgressBar
              newestOnTop={true}
              closeOnClick
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              autoClose={2000}
            />
          </div>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;