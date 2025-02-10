import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-[#1B2028] transition-colors duration-300`}>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}; 