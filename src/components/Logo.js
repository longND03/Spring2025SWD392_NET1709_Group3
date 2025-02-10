import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <svg 
          width="45" 
          height="45" 
          viewBox="0 0 45 45" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transform hover:scale-105 transition-all duration-300"
        >
          {/* Outer circle with subtle gradient */}
          <circle 
            cx="22.5" 
            cy="22.5" 
            r="20" 
            stroke="url(#gradient)"
            strokeWidth="2" 
            fill="none"
            className="animate-pulse-subtle"
          />
          
          {/* Inner circle */}
          <circle 
            cx="22.5" 
            cy="22.5" 
            r="18" 
            fill="none"
            stroke="#E91E63"
            strokeWidth="0.5"
            opacity="0.4"
          />

          {/* BC Text */}
          <text
            x="50%"
            y="52%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#E91E63"
            fontSize="18"
            fontWeight="700"
            fontFamily="'Montserrat', Arial, sans-serif"
            letterSpacing="1"
          >
            BC
          </text>

          {/* Subtle gradient */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E91E63" />
              <stop offset="100%" stopColor="#EC407A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand name with subtle hover effect */}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-[#E91E63] hover:text-pink-500 transition-colors duration-300 leading-none tracking-wide">
          Beauty
        </span>
        <span className="text-xl font-light text-[#E91E63] hover:text-pink-400 transition-colors duration-300 leading-none tracking-wider mt-0.5">
          Care
        </span>
      </div>
    </Link>
  );
};

export default Logo; 