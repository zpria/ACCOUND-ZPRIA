
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';

const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white py-40 px-6 md:px-20 lg:px-40 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -mr-64 -mt-64"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10 reveal-node flex flex-col items-start">
        <header className="mb-32 flex flex-col items-start w-full">
          <Link to="/"><ZPRIA_MAIN_LOGO className="w-[300px] h-[300px] md:w-[420px] md:h-[420px] mb-16" /></Link>
          <h1 className="text-[72px] md:text-[130px] font-black tracking-tighter leading-[0.8] mb-12 text-gray-900 uppercase">
            Legal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Sovereignty</span>
          </h1>
          <p className="text-[26px] md:text-[36px] text-gray-400 font-medium max-w-4xl leading-relaxed">
            The definitive legal protocol protecting your digital rights within the ZPRIA identity network.
          </p>
        </header>

        <div className="space-y-48 w-full">
          {[
            { id: "01", title: "IP Vault Protection", text: "Every creative packet rendered within the ZPRIA Studio is automatically shielded under the Sovereign Creator Act. We serve as a zero-knowledge custodian, providing the hardened encryption layers (AES-256) necessary for industrial-grade creative production, while you retain the only master key to your intellectual property. No metadata or artistic fingerprint is ever sold or utilized for third-party optimization." },
            { id: "02", title: "Data Autonomy", text: "Our global legal framework enforces total data silence. No advertising nodes, tracking pixels, or algorithmic behavioral models are permitted to interact with your @progod.com identity. Your digital presence is a sovereign territory, protected by the ZPRIA Privacy Shield and enforced through localized node encryption across 180+ server regions." },
            { id: "03", title: "Ecosystem Ethics", text: "Participation in the ZPRIA network requires a legally binding commitment to creative integrity. Plagiarism, automated identity flooding, and malicious structural exploitation are grounds for immediate identity revocation. We protect the collective by hardening the individual, ensuring a workspace that values vision over noise." }
          ].map((item) => (
            <section key={item.id} className="flex flex-col md:flex-row gap-20 items-start">
                <div className="shrink-0 w-32 h-32 bg-blue-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                    <span className="text-blue-600 font-black text-5xl tracking-tighter">{item.id}</span>
                </div>
                <div>
                  <h3 className="text-[42px] md:text-[54px] font-black mb-8 tracking-tight text-gray-900 uppercase leading-none">{item.title}</h3>
                  <p className="text-gray-500 text-[24px] leading-relaxed font-medium">
                    {item.text}
                  </p>
                  <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
                    <div className="text-[11px] font-black uppercase tracking-[0.4em]">Node.SECURE.V5</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.4em]">AES.256.SALTED</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.4em]">ZERO.DATA.SALE</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.4em]">IDENTITY.MESH.V1</div>
                  </div>
                </div>
            </section>
          ))}
        </div>

        <div className="mt-64 p-24 bg-gray-50 rounded-[5rem] text-center border-2 border-gray-100 shadow-2xl w-full">
          <p className="text-[32px] text-gray-400 mb-16 italic font-medium">"Your vision is your sovereignty. We build the walls to protect it."</p>
          <button 
            onClick={() => navigate(-1)} 
            className="inline-block px-32 py-8 btn-premium text-white font-black rounded-full uppercase tracking-widest text-[24px] shadow-2xl hover:scale-105 transition-transform"
          >
            Finalize Consent
          </button>
          <div className="mt-20 text-[12px] text-gray-300 font-black tracking-[0.6em] uppercase">ZPRIA.LEGAL.DEPT.V5.2025.IDENTITY.PROTOCOL</div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
