
import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Decorative Canvas Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0071e3] blur-3xl opacity-20 animate-pulse rounded-full"></div>
            {/* Fix: Use ZPRIA_MAIN_LOGO and remove color prop */}
            <ZPRIA_MAIN_LOGO className="w-28 h-28 shadow-2xl rounded-[2rem] relative z-10" />
          </div>
          <h1 className="text-8xl font-black tracking-tighter text-slate-900 leading-none">
            ZPRIA <span className="text-[#0071e3]">ID</span>
          </h1>
          <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            The universal identity for creators. Access your <strong>@progod.com</strong> workspace from anywhere.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-16">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 hover:border-[#0071e3] transition-all transform hover:-translate-y-3 group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-[#0071e3]/10 transition-colors">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">New Identity</h3>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">Secure your professional creative identity at @progod.com.</p>
            <Link 
              to="/signup" 
              className="block w-full py-5 px-8 bg-[#0071e3] text-white rounded-2xl font-black text-xl hover:opacity-90 transition-opacity shadow-xl shadow-[#0071e3]/20 uppercase tracking-widest"
            >
              Registration Now
            </Link>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 hover:border-[#0071e3] transition-all transform hover:-translate-y-3 group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-[#0071e3]/10 transition-colors">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            </div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Workspace</h3>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">Continue your projects in the ZPRIA creative suite.</p>
            <Link 
              to="/signin" 
              className="block w-full py-5 px-8 border-4 border-[#0071e3] text-[#0071e3] rounded-2xl font-black text-xl hover:bg-[#0071e3] hover:text-white transition-all shadow-xl shadow-[#0071e3]/5 uppercase tracking-widest"
            >
              Login Now
            </Link>
          </div>
        </div>

        <footer className="pt-24 text-slate-300 font-black text-[10px] flex justify-center space-x-12 uppercase tracking-[0.2em]">
          <span className="cursor-default">Privacy Protocol</span>
          <span className="cursor-default">Creative License</span>
          <span className="cursor-default">Ecosystem Hub</span>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
