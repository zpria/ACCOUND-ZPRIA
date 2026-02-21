
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserProfile, LogoVariant } from '../types';
import { ZPRIA_MAIN_LOGO } from '../constants';
import { dataIds, colors } from '../config';

interface Props {
  user: UserProfile | null;
  theme: LogoVariant;
  onLogout: () => void;
}

const DashboardPage: React.FC<Props> = ({ user, theme, onLogout }) => {
  const navigate = useNavigate();
  // State for the dedicated Intro Animation sequence
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if we've already shown the intro in this session to avoid repetition
    // Key corrected to ZPRIA
    const hasSeenIntro = sessionStorage.getItem('zpria_intro_seen');
    
    if (hasSeenIntro) {
      setShowIntro(false);
      return;
    }

    // Fixed duration to ensure full 1.8s SVG sequence completes with a hold (Total 2s)
    const introDuration = 2000; 
    
    const startTime = Date.now();
    
    const handleCompletion = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, introDuration - elapsedTime);
      
      setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('zpria_intro_seen', 'true');
      }, remainingTime);
    };

    // If network is slow, it waits for window load. If fast, it respects the 2s timer.
    if (document.readyState === 'complete') {
      handleCompletion();
    } else {
      window.addEventListener('load', handleCompletion);
    }

    return () => {
      window.removeEventListener('load', handleCompletion);
    };
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center scale-75 md:scale-100">
          {/* Intro Animation SVG (Assembly Sequence) */}
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <g transform="translate(100, 100)">
              <rect x="-42" y="-35" width="50" height="50" fill="#7C3AED" rx="8" opacity="0">
                <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                <animateTransform attributeName="transform" type="scale" values="0;1" dur="0.6s" fill="freeze"/>
              </rect>
              <rect x="-15" y="-18" width="50" height="50" fill="#06B6D4" rx="8" opacity="0">
                <animate attributeName="opacity" values="0;0.85" begin="0.3s" dur="0.5s" fill="freeze"/>
                <animateTransform attributeName="transform" type="scale" values="0;1" begin="0.3s" dur="0.6s" fill="freeze"/>
              </rect>
              <circle cx="18" cy="15" r="12" fill="white" opacity="0">
                <animate attributeName="opacity" values="0;0.25" begin="0.6s" dur="0.3s" fill="freeze"/>
              </circle>
              <circle cx="-39" cy="23" r="3.5" fill="#EC4899" opacity="0">
                <animate attributeName="opacity" values="0;1" begin="0.9s" dur="0.2s" fill="freeze"/>
              </circle>
              <circle cx="-30" cy="23" r="3.5" fill="#EC4899" opacity="0">
                <animate attributeName="opacity" values="0;1" begin="1.0s" dur="0.2s" fill="freeze"/>
              </circle>
              <circle cx="-21" cy="23" r="3.5" fill="#EC4899" opacity="0">
                <animate attributeName="opacity" values="0;1" begin="1.1s" dur="0.2s" fill="freeze"/>
              </circle>
              <circle cx="30" cy="28" r="7" fill="#10B981" opacity="0">
                <animate attributeName="opacity" values="0;1" begin="1.3s" dur="0.3s" fill="freeze"/>
              </circle>
              <rect x="-8" y="0" width="22" height="3" fill="white" rx="1.5" opacity="0">
                <animate attributeName="opacity" values="0;0.25" begin="1.5s" dur="0.3s" fill="freeze"/>
              </rect>
            </g>
          </svg>

          <div className="mt-8 overflow-hidden text-center">
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-0 reveal-node bg-white min-h-[80vh]">
      {/* Hero Brand Identity Section */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-[1400px] py-12 md:py-16">
        <ZPRIA_MAIN_LOGO className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] relative z-10 transition-transform hover:scale-105 duration-700" />
      </div>

      {/* Hero Content Section */}
      <div className="text-center max-w-[1000px] px-6 mb-16 md:mb-24 relative z-20">
        <h1 className="text-[42px] md:text-[88px] font-black text-[#1d1d1f] tracking-tighter leading-[0.9] md:leading-[0.85] mb-6 md:mb-8 uppercase">
          Welcome to <br /> ZPRIA.
        </h1>
        <p className="text-[18px] md:text-[24px] text-[#424245] leading-relaxed mb-10 md:mb-12 max-w-3xl mx-auto font-medium tracking-tight">
          One account for everything ZPRIA.
        </p>
        
        {!user ? (
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <button 
              onClick={() => navigate('/signin')}
              className="w-full sm:w-auto px-16 md:px-24 py-4 md:py-5 bg-[#0071e3] text-white rounded-full text-[18px] md:text-[20px] font-black hover:bg-[#0077ed] transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-[0.2em]"
            >
              Sign In
            </button>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-[13px] md:text-[15px] text-[#86868b] font-medium tracking-tight">Create Your Zipra Account</p>
              <Link to="/signup" className="text-[#0071e3] font-black uppercase text-[12px] md:text-[13px] tracking-[0.3em] hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10 md:gap-12">
            <Link 
              to="/theme"
              className="w-full sm:w-auto px-16 md:px-24 py-4 md:py-5 bg-[#1d1d1f] text-white rounded-full text-[18px] md:text-[20px] font-black hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-[0.2em] btn-premium"
            >
              Enter Workspace
            </Link>
            <div className="flex flex-col items-center">
              <p className="text-[#86868b] font-bold uppercase text-[10px] md:text-[12px] tracking-[0.4em] mb-1">ACTIVE IDENTITY PROVISIONED</p>
              <p className="text-[#1d1d1f] font-black text-[18px] md:text-[20px] uppercase tracking-tighter">{user.firstName} {user.lastName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Origin & Engineering Section */}
      <div className="w-full bg-[#fbfbfd] py-20 md:py-32 border-t border-[#d2d2d7]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
              <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
                Identity Origin
              </div>
              <h2 className="text-[36px] md:text-[48px] font-black text-[#1d1d1f] leading-[1] md:leading-[0.9] tracking-tighter uppercase">
                Z to A <br className="hidden md:block" /> Privacy <br className="hidden md:block" /> Protocol.
              </h2>
              <div className="space-y-4 md:space-y-6">
                <p className="text-[16px] md:text-[18px] text-[#424245] leading-relaxed font-medium">
                  ZPRIA was architected in <strong>Dhaka, Bangladesh</strong>.
                </p>
                <p className="text-[14px] md:text-[16px] text-[#86868b] leading-relaxed font-medium">
                  Our name reflects our core mission: <strong>Z to A Privacy</strong>. From the foundational zero-point (Z) of your data to the final software output (A), we provide absolute privacy across every product in the ZPRIA ecosystem.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl border border-gray-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700"></div>
               <h3 className="text-[20px] md:text-[22px] font-black text-[#1d1d1f] mb-4 md:mb-6 uppercase tracking-tight">Why ZPRIA?</h3>
               <p className="text-[14px] md:text-[16px] text-[#424245] leading-relaxed mb-6 md:mb-8 font-medium">
                 Privacy isn't a feature—it's the foundation. Built in Dhaka for the global creative community, ZPRIA provides a single secure account to access all our professional tools.
               </p>
               <ul className="space-y-3 md:space-y-4">
                  {[
                    "Z to A Encryption Architecture",
                    "Dhaka-Born Identity Mesh",
                    "Unified Sovereign Ecosystem",
                    "Zero-Knowledge Data Vault"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[12px] md:text-[14px] font-bold text-[#1d1d1f] uppercase tracking-tight">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                      {item}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA for New Users */}
      {!user && (
        <div className="w-full py-16 md:py-24 text-center px-6">
          <h3 className="text-[20px] md:text-[24px] font-black text-[#1d1d1f] mb-4 md:mb-6 uppercase tracking-tighter leading-tight">Ready to provision your @progod account?</h3>
          <div className="flex flex-col items-center gap-4">
            <Link 
              to="/signup" 
              className="text-[#0071e3] font-black text-[13px] md:text-[15px] uppercase tracking-[0.4em] hover:underline"
            >
              INITIALIZE REGISTRATION ↗
            </Link>
            <Link 
              to="/support" 
              className="text-[#86868b] font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#1d1d1f] transition-colors"
            >
              Support Page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
