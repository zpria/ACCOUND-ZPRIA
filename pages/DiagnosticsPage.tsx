
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';
import { dataIds, colors } from '../config';
import { supabase } from '../services/supabaseService';

const DiagnosticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-[1000px] mx-auto reveal-node">
        <header className="mb-20">
          {/* Fix: Use ZPRIA_MAIN_LOGO and remove color prop */}
          <Link to="/support"><ZPRIA_MAIN_LOGO className="w-14 h-14 mb-10" /></Link>
          <h1 className="text-[54px] md:text-[72px] font-black tracking-tighter text-gray-900 leading-none">ID <span className="text-slate-500">Diagnostics</span></h1>
          <p className="text-2xl text-gray-400 font-medium mt-6">Real-time health of the ZPRIA identity network.</p>
        </header>

        <div className="space-y-6">
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Global Resolution</h4>
                 <p className="text-gray-400 font-medium">Identity handshake latency across 14 server regions.</p>
              </div>
              <span className="text-3xl font-black text-green-500">12ms</span>
           </div>
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Vault Persistence</h4>
                 <p className="text-gray-400 font-medium">Encryption layer availability and structural integrity.</p>
              </div>
              <span className="text-3xl font-black text-green-500">99.9%</span>
           </div>
           <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl">
              <div>
                 <h4 className="text-xl font-black text-gray-900 uppercase">Node Sync Rate</h4>
                 <p className="text-gray-400 font-medium">Active device synchronization and biometric updates.</p>
              </div>
              <span className="text-3xl font-black text-blue-500">OPTIMAL</span>
           </div>
        </div>

        <div className="mt-20 text-center">
           <Link to="/support" className="text-blue-500 font-black uppercase tracking-[0.2em] text-[12px] hover:underline">Back to Support</Link>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
