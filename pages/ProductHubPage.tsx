
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserProfile, ZipraProduct, ProductType } from '../types';
import { supabase } from '../services/supabaseService';
import { ZPRIA_MAIN_LOGO } from '../constants';

interface Props {
  user: UserProfile | null;
  onLogout: () => void;
}

const ProductHubPage: React.FC<Props> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ZipraProduct[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: typesData } = await supabase
          .from('product_types')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        const { data: productsData } = await supabase
          .from('zipra_products')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (typesData) setTypes(typesData);
        if (productsData) setProducts(productsData);
      } catch (error) {
        console.error("Data fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return <Navigate to="/signin" />;

  const filteredProducts = selectedType === 'All' 
    ? products 
    : products.filter(p => p.product_type === selectedType);

  const ProductIconCard: React.FC<{ product: ZipraProduct }> = ({ product }) => (
    <div className="group relative flex flex-col items-center">
      {/* Icon Container - Fixed size and background for consistent display */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 group-hover:shadow-xl">
        {/* Actual Image from Database icon_url */}
        {product.icon_url ? (
          <img 
            src={product.icon_url} 
            alt={product.product_name} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-20 group-hover:blur-sm"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ZPRIA';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:opacity-20 transition-all">
            <ZPRIA_MAIN_LOGO className="w-10 h-10 opacity-10" />
          </div>
        )}

        {/* Action Buttons Overlay - Pop up on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto px-4">
          <a 
            href={product.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-2 bg-[#0071e3] text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full text-center hover:bg-[#0077ed] transition-colors"
          >
            Open
          </a>
          <button 
            onClick={() => navigate(`/product/${product.product_id}`)}
            className="w-full py-2 bg-[#1d1d1f] text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full text-center hover:bg-black transition-colors"
          >
            Details
          </button>
        </div>
      </div>

      {/* Label - visible on hover or always */}
      <div className="mt-4 text-center">
        <p className="text-[11px] font-black text-[#1d1d1f] uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
          {product.product_name}
        </p>
        <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-widest">
          {product.pricing_type}
        </p>
      </div>
    </div>
  );

  return (
    <div className="reveal-node px-6 pb-40 max-w-[1200px] mx-auto pt-4 md:pt-10">
      {/* Identity Bar */}
      <div className="flex justify-between items-center mb-16 border-b border-gray-50 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ring-4 ring-green-50"></div>
          <span className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.4em]">Node Authorized</span>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.3em] mb-1 opacity-60">Identity Verified</p>
          <p className="text-[16px] md:text-[18px] font-black text-[#1d1d1f] uppercase tracking-tighter">Hi, {user.firstName} {user.lastName}</p>
        </div>
      </div>

      {/* Hero Management */}
      <div className="bg-[#fbfbfd] p-8 md:p-14 rounded-[48px] border border-gray-100 shadow-sm mb-20 flex flex-col md:flex-row items-center justify-between gap-12 group hover:border-blue-500 transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="space-y-6 text-center md:text-left relative z-10">
          <h2 className="text-[36px] md:text-[52px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-[0.9]">
            Identity <br className="hidden md:block" /> Control.
          </h2>
          <p className="text-[16px] md:text-[18px] text-gray-500 font-medium max-w-sm leading-relaxed">
            Provision security nodes, update your creative profile, and monitor your ID diagnostics.
          </p>
          <button 
            onClick={() => navigate('/account-services')}
            className="px-12 py-4 bg-[#1d1d1f] text-white rounded-full font-black text-[12px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            Manage Account
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#004d40] to-[#00695c] flex items-center justify-center text-white text-5xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-700 ring-8 ring-white">
            {user.firstName[0]}
          </div>
          <div className="px-6 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest text-[#86868b]">
             ZPRIA ID: {user.username}
          </div>
        </div>
      </div>

      {/* Filter Navigation - As requested with "All" and dynamic group names */}
      <div className="mb-16 flex flex-wrap gap-3 md:gap-4 items-center justify-center md:justify-start">
        <button 
          onClick={() => setSelectedType('All')}
          className={`px-8 md:px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedType === 'All' ? 'bg-[#1d1d1f] text-white shadow-xl scale-105 ring-4 ring-gray-100' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-gray-200'}`}
        >
          All Products
        </button>
        {types.map((type) => (
          <button 
            key={type.type_id}
            onClick={() => setSelectedType(type.type_name)}
            className={`px-8 md:px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedType === type.type_name ? 'bg-[#1d1d1f] text-white shadow-xl scale-105 ring-4 ring-gray-100' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-gray-200'}`}
          >
            {type.type_name}
          </button>
        ))}
      </div>

      {/* Product Icon Grid */}
      <div className="min-h-[40vh]">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-12 justify-items-center">
            {[1,2,3,4,5,6].map(i => <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-[32px] animate-pulse" />)}
          </div>
        ) : (
          <div className="reveal-stagger">
            <div className="mb-16 text-center md:text-left">
               <h3 className="text-[28px] md:text-[36px] font-black text-[#1d1d1f] tracking-tighter uppercase mb-2">
                 {selectedType === 'All' ? 'Global Ecosystem' : (types.find(t => t.type_name === selectedType)?.type_question || selectedType)}
               </h3>
               <p className="text-[12px] text-[#86868b] font-black uppercase tracking-[0.4em] opacity-60 max-w-2xl leading-relaxed">
                 {selectedType === 'All' ? 'Provision access across all authorized ZPRIA identity nodes.' : (types.find(t => t.type_name === selectedType)?.type_description)}
               </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-24 justify-items-center">
              {filteredProducts.map((p) => (
                <ProductIconCard key={p.id} product={p} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
                <p className="text-[#86868b] font-black uppercase tracking-[0.3em]">No registered nodes found in this sector.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Corporate About Section */}
      <div className="mt-60 pt-24 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-10">
            <ZPRIA_MAIN_LOGO className="w-20 h-20 opacity-40 hover:opacity-100 transition-opacity duration-700" />
            <div className="space-y-6">
              <h4 className="text-[36px] md:text-[44px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-[0.9]">
                The Sovereign <br /> Network.
              </h4>
              <p className="text-[18px] text-gray-500 font-medium leading-relaxed max-w-lg">
                ZPRIA is a unified digital architecture for creators. Our mission is to provide zero-knowledge identity protocols that ensure complete sovereignty from Point Z (Input) to Point A (Final Render).
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              <Link to="/support" className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-600 hover:underline">Engineering Guide</Link>
              <Link to="/legal" className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-600 hover:underline">Privacy Charter</Link>
              <Link to="/contact" className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-600 hover:underline">Security Hub</Link>
            </div>
          </div>
          
          <div className="bg-[#f5f5f7] p-12 md:p-16 rounded-[56px] space-y-10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/50 blur-[80px] rounded-full translate-x-32 translate-y-32"></div>
            <h5 className="text-[14px] font-black uppercase tracking-[0.5em] text-[#86868b] relative z-10">System Origin</h5>
            <p className="text-[16px] md:text-[18px] font-bold text-[#1d1d1f] leading-relaxed relative z-10">
              Architected in Dhaka, Bangladesh. Optimized for global synchronization. 
              The ZPRIA identity mesh currently powers creative workflows in over 180 server clusters worldwide.
            </p>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-white hover:scale-105 transition-transform">
                <p className="text-[28px] font-black text-[#1d1d1f] tracking-tighter">2025</p>
                <p className="text-[11px] font-black text-[#86868b] uppercase tracking-widest">Master Protocol</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-white hover:scale-105 transition-transform">
                <p className="text-[28px] font-black text-[#1d1d1f] tracking-tighter">14M+</p>
                <p className="text-[11px] font-black text-[#86868b] uppercase tracking-widest">Active Nodes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHubPage;
