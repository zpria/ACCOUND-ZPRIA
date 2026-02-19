
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGO_VARIANTS } from '../constants';
import { LogoVariant } from '../types';

interface Props {
  onSelectTheme: (variant: LogoVariant) => void;
  currentTheme: LogoVariant;
}

const ThemeSelectionPage: React.FC<Props> = ({ onSelectTheme, currentTheme }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LogoVariant>(currentTheme);

  const handleContinue = () => {
    onSelectTheme(selected);
    const pending = sessionStorage.getItem('zpria_pending_user');
    if (pending) {
      const user = JSON.parse(pending);
      // Fix: Use themePreference instead of non-existent selectedLogoVariant
      user.themePreference = selected.id;
      localStorage.setItem('zpria_user', JSON.stringify(user));
      localStorage.setItem('zpria_theme_id', selected.id);
      sessionStorage.removeItem('zpria_pending_user');
      navigate('/dashboard');
      window.location.reload();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center py-20 px-6">
      <div className="max-w-[1000px] w-full bg-white rounded-3xl p-12 md:p-20 border border-gray-100 text-center">
        <h1 className="text-[40px] font-bold text-[#1d1d1f] tracking-tight mb-4">Personalize your ZPRIA ID</h1>
        <p className="text-[19px] text-[#424245] mb-12">Choose an identity theme that represents your creative style.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {LOGO_VARIANTS.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelected(variant)}
              className={`p-10 rounded-2xl apple-transition border-2 flex flex-col items-center justify-center space-y-4 ${
                selected.id === variant.id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="w-16 h-16 rounded-full shadow-md" style={{ background: variant.gradient }} />
              <span className="font-semibold text-[17px]">{variant.name}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-6">
           <button 
             onClick={handleContinue}
             className="px-20 py-4 bg-[#0071e3] text-white font-medium text-[19px] rounded-full hover:bg-[#0077ed]"
           >
             Use Theme
           </button>
           <button 
             onClick={() => navigate('/dashboard')}
             className="text-[15px] text-blue-500 hover:underline"
           >
             Skip for now
           </button>
        </div>
      </div>
      
      <div className="mt-12 text-[12px] text-gray-400">
         Personalization Studio replica
      </div>
    </div>
  );
};

export default ThemeSelectionPage;
