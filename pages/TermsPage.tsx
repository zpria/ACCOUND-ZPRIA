
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white py-32 px-6 md:px-20 lg:px-40">
      <div className="max-w-[1400px] mx-auto reveal-node flex flex-col items-center">
        <header className="mb-32 flex flex-col items-center text-center">
          <Link to="/"><ZPRIA_MAIN_LOGO className="w-[300px] h-[300px] md:w-[420px] md:h-[420px] mb-16 hover:scale-110 transition-transform" /></Link>
          <h1 className="text-[64px] md:text-[120px] font-black tracking-tighter text-gray-900 leading-[0.8] mb-12 uppercase">
            Terms of <span className="text-blue-500">Service</span>
          </h1>
          <p className="text-[24px] md:text-[32px] text-gray-400 font-medium max-w-4xl leading-relaxed">
            The comprehensive structural framework of the ZPRIA global identity network.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-24 border-t-2 border-gray-100 pt-32 w-full">
          {[
            { id: "01", title: "Universal Access", text: "Verified ZPRIA ID credentials are required for all creative suite interactions. You are responsible for maintaining the sanctity of your @progod.com identity." },
            { id: "02", title: "Creative Rights", text: "ZPRIA Studio provides industrial tools; you provide the vision. All intellectual property generated remains under your absolute legal sovereignty." },
            { id: "03", title: "Global Security", text: "Security passes must remain confidential. Multi-factor verification is mandatory for high-tier studio features and identity vault management." },
            { id: "04", title: "Node Protocol", text: "We reserve the right to optimize identity resolution across global server nodes to ensure zero-latency performance for creators." },
            { id: "05", title: "Ethical Conduct", text: "Misuse of the identity system for unauthorized data mining or ecosystem exploitation will result in immediate identity revocation." },
            { id: "06", title: "System Updates", text: "Structural updates to the ZPRIA domain occur synchronously across all global territories to maintain ecosystem integrity." }
          ].map((item) => (
            <section key={item.id} className="space-y-8">
              <div className="text-[16px] font-black text-blue-500 uppercase tracking-[0.5em]">PROTOCOL {item.id}</div>
              <h2 className="text-[42px] font-black text-gray-900 tracking-tight uppercase leading-none">{item.title}</h2>
              <p className="text-gray-500 text-[22px] leading-relaxed font-medium">
                {item.text}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-48 pt-24 border-t-2 border-gray-100 flex flex-col items-center w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="px-32 py-8 btn-premium text-white font-black rounded-full text-[26px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            Return to Portal
          </button>
          <div className="mt-24 flex flex-wrap justify-center gap-16 opacity-30">
            <span className="text-[14px] font-black uppercase tracking-[0.6em]">ZPRIA.V5.MASTER.AGREEMENT.2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;
