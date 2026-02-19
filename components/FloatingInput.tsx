
import React, { useState } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  isSelect?: boolean;
  isInvalid?: boolean;
  children?: React.ReactNode;
}

const FloatingInput: React.FC<Props> = ({ 
  label, 
  isSelect, 
  isInvalid,
  children, 
  className = '', 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const value = props.value?.toString() || '';
  const hasValue = value.length > 0 && value !== '00' && value !== '0000' && value !== '';
  
  const isFloating = isFocused || hasValue;

  const containerClasses = `
    relative w-full transition-all duration-300 border rounded-[14px] md:rounded-[18px] bg-white
    ${isInvalid ? 'border-[#ff3b30] bg-[#fff9f9] shadow-[0_0_0_1px_#ff3b30]' : 
      isFocused ? 'border-[#0071e3] ring-[1px] ring-[#0071e3]' : 'border-[#d2d2d7] hover:border-[#86868b]'}
    ${props.disabled ? 'opacity-50 cursor-not-allowed bg-[#f5f5f7]' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 md:left-5 transition-all duration-200 pointer-events-none select-none
    ${isFloating 
      ? 'top-[8px] md:top-[11px] text-[9px] md:text-[10px] font-bold text-[#86868b] uppercase tracking-[0.15em]' 
      : 'top-1/2 -translate-y-1/2 text-[15px] md:text-[17px] text-[#86868b] font-normal'}
    ${isFocused ? '!text-[#0071e3]' : ''}
    ${isInvalid ? '!text-[#ff3b30]' : ''}
  `;

  // Reduced height on mobile (h-[64px] vs h-[74px]) for "DPI reduction" feel
  const inputClasses = `
    w-full px-4 md:px-5 pb-1 md:pb-2 pt-[28px] md:pt-[32px] bg-transparent outline-none text-[15px] md:text-[17px] text-[#1d1d1f] font-normal h-[64px] md:h-[74px]
    ${isSelect ? 'appearance-none cursor-pointer' : ''}
    ${isSelect && !isFloating ? 'text-transparent' : ''}
  `;

  return (
    <div className="w-full">
      <div className={containerClasses}>
        {isSelect ? (
          <select
            {...(props as any)}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            className={inputClasses}
          >
            {children}
          </select>
        ) : (
          <input
            {...(props as any)}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            className={inputClasses}
            placeholder=""
          />
        )}
        <label className={labelClasses}>{label}</label>
        
        {isSelect && (
          <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
             <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
             </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingInput;
