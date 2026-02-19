
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';

const StatsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pt-20 px-6 reveal-node pb-40">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        <header className="text-center mb-24 flex flex-col items-center">
          <ZPRIA_MAIN_LOGO className="w-[300px] h-[300px] md:w-[420px] md:h-[420px] mb-8" />
          <h1 className="text-[54px] md:text-[68px] font-black tracking-tighter text-[#1d1d1f] leading-none mb-6 uppercase">
            ZPRIA <span className="text-blue-500">Help</span>
          </h1>
          <p className="text-[15px] text-[#86868b] font-black uppercase tracking-[0.4em] opacity-60">Architectural Protocol & FAQ</p>
        </header>

        <div className="space-y-20 max-w-[800px] w-full">
          {/* Section: How to Create */}
          <section className="border-t border-gray-100 pt-16">
            <h3 className="text-[22px] font-black text-[#1d1d1f] mb-6 tracking-tight uppercase">Account Creation Workflow</h3>
            <p className="text-[18px] leading-relaxed text-[#424245] font-medium">
              ZPRIA accounts are provisioned through a multi-step verification process. You select a unique username which becomes your <strong>@progod.com</strong> identifier. During registration, your recovery information is verified via high-entropy OTP codes to ensure legitimate human ownership. Once provisioned, your identity node is synchronized across the global ZPRIA creative mesh.
            </p>
          </section>

          <section className="border-t border-gray-100 pt-16">
            <h3 className="text-[22px] font-black text-[#1d1d1f] mb-6 tracking-tight uppercase">Privacy Architecture</h3>
            <p className="text-[18px] leading-relaxed text-[#424245] font-medium">
              Privacy is enforced at the kernel level. We utilize a <strong>Z to A</strong> protocol where data encryption begins at the zero-point (Z) of input and remains hardened until the final output (A). Your metadata is never utilized for behavioral modeling. We serve as zero-knowledge custodians; your creative vault is accessible only by your verified biometric or cryptographic keys.
            </p>
          </section>

          <section className="border-t border-gray-100 pt-16">
            <h3 className="text-[22px] font-black text-[#1d1d1f] mb-6 tracking-tight uppercase">Security & Sovereignty Protocol</h3>
            <p className="text-[18px] leading-relaxed text-[#424245] font-medium">
              We employ hardened AES-256 encryption. Your digital footprint is a sovereign territory; we provide the walls, you hold the only master key. Multi-factor verification ensures that your creative IP remains under your absolute control.
            </p>
          </section>

          <section className="border-t border-gray-100 pt-16">
            <h3 className="text-[22px] font-black text-[#1d1d1f] mb-6 tracking-tight uppercase">Ecosystem Cost</h3>
            <p className="text-[18px] leading-relaxed text-[#424245] font-medium">
              Initialization of a ZPRIA ID is free for individual creators. High-tier studio bandwidth and industrial identity resolution may require professional node allocation.
            </p>
          </section>
        </div>

        <div className="mt-32 p-12 md:p-16 bg-[#f5f5f7] rounded-[40px] md:rounded-[48px] text-center border border-gray-100 w-full flex flex-col items-center">
           <ZPRIA_MAIN_LOGO className="w-16 h-16 mb-8" />
           <p className="text-[12px] text-[#86868b] font-black uppercase tracking-[0.5em] mb-12">ZPRIA.FAQ.CORE.PROTOCOL.2025</p>
           {/* Primary Button changed to OK with navigate(-1) */}
           <button 
             onClick={() => navigate(-1)} 
             className="px-24 py-5 bg-[#1d1d1f] text-white rounded-2xl font-black text-[18px] tracking-[0.3em] uppercase hover:bg-black transition-all shadow-2xl focus-visible:ring-4 focus-visible:ring-blue-500/30 btn-premium"
           >
             OK
           </button>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
