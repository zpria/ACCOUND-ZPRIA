import React, { useEffect, useState } from 'react';
import { dataIds, colors } from '../config';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 bg-white/80 backdrop-blur-xl z-[9999] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Only SVG Animation - Device Centered */}
      <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
        <g transform="translate(100, 100)">
          <rect x="-42" y="-35" width="50" height="50" fill="#7C3AED" rx="8">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="1s" repeatCount="indefinite"/>
          </rect>
          <rect x="-15" y="-18" width="50" height="50" fill="#06B6D4" rx="8" opacity="0.85">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="1s" begin="0.2s" repeatCount="indefinite"/>
          </rect>
          <circle cx="18" cy="15" r="12" fill="white" opacity="0.25"/>
          <circle cx="-39" cy="23" r="3.5" fill="#EC4899">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="-30" cy="23" r="3.5" fill="#EC4899">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="0.8s" begin="0.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="-21" cy="23" r="3.5" fill="#EC4899">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="0.8s" begin="0.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="30" cy="28" r="7" fill="#10B981">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="1s" begin="0.4s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default LoadingOverlay;
