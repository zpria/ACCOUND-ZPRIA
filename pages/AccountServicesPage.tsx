
import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Use ZPRIA_MAIN_LOGO instead of non-existent ZIPRA_LOGO
import { ZPRIA_MAIN_LOGO } from '../constants';

const AccountServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-[1000px] mx-auto reveal-node">
        <header className="mb-20">
          {/* Fix: Use ZPRIA_MAIN_LOGO and remove color prop */}
          <Link to="/support"><ZPRIA_MAIN_LOGO className="w-14 h-14 mb-10" /></Link>
          <h1 className="text-[54px] md:text-[72px] font-black tracking-tighter text-gray-900 leading-none">Account <span className="text-indigo-500">Services</span></h1>
          <p className="text-2xl text-gray-400 font-medium mt-6">Structural identity management for the ZPRIA ecosystem.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="p-10 bg-gray-50 rounded-[3rem] space-y-4">
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Profile Synchronization</h3>
             <p className="text-gray-500 text-lg leading-relaxed">Update your legal name, professional credentials, and avatar metadata across the entire @progod.com domain.</p>
             <button className="text-blue-500 font-black uppercase tracking-widest text-[11px] pt-4">Start Sync</button>
          </div>
          <div className="p-10 bg-gray-50 rounded-[3rem] space-y-4">
             <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Device Linking</h3>
             <p className="text-gray-500 text-lg leading-relaxed">Manage authorized hardware nodes and biometric security keys associated with your universal ID.</p>
             <button className="text-blue-500 font-black uppercase tracking-widest text-[11px] pt-4">Authorize Node</button>
          </div>
        </div>

        <div className="mt-20 text-center">
           <Link to="/support" className="text-blue-500 font-black uppercase tracking-[0.2em] text-[12px] hover:underline">Back to Support</Link>
        </div>
      </div>
    </div>
  );
};

export default AccountServicesPage;
