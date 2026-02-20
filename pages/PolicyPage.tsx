
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from './constants';

const PolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const handleAccept = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/signin');
  };

  return (
    <div className="bg-white py-20 px-6 reveal-node">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        <ZPRIA_MAIN_LOGO className="w-[300px] h-[300px] md:w-[420px] md:h-[420px] mb-10" />
        
        <div className="max-w-[800px] w-full">
          <div className="flex flex-col items-center mb-20 text-center">
            <h1 className="text-[54px] md:text-[72px] font-black text-gray-900 tracking-tighter leading-tight mb-4 uppercase">Identity Policy</h1>
            <p className="text-[20px] text-gray-400 font-medium max-w-lg">One identity. Total creative sovereignty.</p>
          </div>

          <div className="space-y-20">
            <section className="group">
              <h3 className="text-[22px] font-black text-gray-900 mb-4 tracking-tight uppercase border-l-4 border-blue-500 pl-8 group-hover:border-blue-600 transition-colors">1. Universal ZPRIA ID</h3>
              <p className="text-[18px] leading-[1.8] text-gray-500 font-medium">Your ZPRIA ID is the master key to the ecosystem. It provides verified access to @progod.com mail, cloud studio projects, and global identity resolution services.</p>
            </section>
            <section className="group">
              <h3 className="text-[22px] font-black text-gray-900 mb-4 tracking-tight uppercase border-l-4 border-blue-500 pl-8 group-hover:border-blue-600 transition-colors">2. Privacy Sovereignty</h3>
              <p className="text-[18px] leading-[1.8] text-gray-500 font-medium">We do not sell your personal metadata. Your ID is encrypted using hardened AES-256 protocols. Your recovery information is your own, used only for restoring access to your creative vault.</p>
            </section>
            <section className="group">
              <h3 className="text-[22px] font-black text-gray-900 mb-4 tracking-tight uppercase border-l-4 border-blue-500 pl-8 group-hover:border-blue-600 transition-colors">3. IP Integrity</h3>
              <p className="text-[18px] leading-[1.8] text-gray-500 font-medium">All creations within the ZPRIA Studio remain your absolute property. We provide the structural tools, but you retain 100% ownership of your vision and output.</p>
            </section>
          </div>

          <div className="mt-40 pt-16 border-t border-gray-100 flex flex-col items-center">
             <button onClick={handleAccept} className="px-24 py-6 bg-[#0071e3] text-white rounded-full font-black text-[20px] tracking-tight uppercase shadow-2xl hover:scale-105 transition-transform">
               Accept and Return
             </button>
             <p className="mt-12 text-[10px] text-gray-300 font-black uppercase tracking-[0.5em]">ZPRIA.PRIVACY.PROTOCOLS.2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
