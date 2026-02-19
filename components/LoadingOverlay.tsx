import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'ZPRIA PROCESSING' 
}) => {
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
      className={`fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="relative flex flex-col items-center scale-75 md:scale-100">
        {/* Geometric Blocks Loading Animation */}
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
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

        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="w-32 h-[2px] bg-gray-100 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-[#7C3AED] animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
          <p className="text-[10px] md:text-[11px] font-black text-[#86868b] uppercase tracking-[0.6em] animate-pulse">
            {message}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { left: -100%; width: 20%; }
          50% { left: 20%; width: 50%; }
          100% { left: 100%; width: 20%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
