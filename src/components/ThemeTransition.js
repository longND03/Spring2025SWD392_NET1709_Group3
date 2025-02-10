import { useTheme } from '../contexts/ThemeContext';

const ThemeTransition = () => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-[60] pointer-events-none transition-opacity duration-1000
                 ${darkMode ? 'bg-[#1B2028] opacity-0' : 'bg-gray-50 opacity-0'}`}
    />
  );
}; 