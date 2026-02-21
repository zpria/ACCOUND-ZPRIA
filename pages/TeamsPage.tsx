
import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';
import { dataIds, colors } from '../config';

const TeamsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-32 px-6 reveal-node">
      <div className="max-w-[1000px] mx-auto text-center">
        <header className="mb-20 reveal-stagger">
          {/* Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO */}
          <ZPRIA_MAIN_LOGO className="w-20 h-20 mx-auto mb-10" />
          <h1 className="text-[54px] md:text-[72px] font-black tracking-tighter text-gray-900 leading-none uppercase">
            ZPRIA <span className="text-blue-500">Teams</span>
          </h1>
          <p className="text-2xl text-gray-400 font-medium mt-6">Collaborative sovereignty for industrial creative units.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 reveal-stagger">
           <div className="p-12 bg-[#f5f5f7] rounded-[48px] text-left border border-transparent hover:border-blue-500 transition-all">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Enterprise Mesh</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">Synchronize up to 500 ZPRIA IDs under a single structural creative node.</p>
              <button className="px-10 py-4 bg-[#1d1d1f] text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">Initialize Cluster</button>
           </div>
           <div className="p-12 bg-[#f5f5f7] rounded-[48px] text-left border border-transparent hover:border-indigo-500 transition-all">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Studio Access</h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">Shared vault permissions for real-time collaborative IP production.</p>
              <button className="px-10 py-4 bg-blue-500 text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">Configure Rights</button>
           </div>
        </div>

        <div className="mt-20">
           <Link to="/" className="text-blue-500 font-black uppercase tracking-[0.2em] text-[12px] hover:underline">Return to Identity Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
