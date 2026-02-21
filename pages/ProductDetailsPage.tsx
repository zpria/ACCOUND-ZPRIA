
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ZipraProduct } from '../types';
import { supabase } from '../services/supabaseService';
import { ZPRIA_MAIN_LOGO } from '../constants';
import { dataIds, colors } from '../config';

const Badge = ({ children, color = 'blue' }: { children?: React.ReactNode, color?: 'blue' | 'gray' | 'green' | 'indigo' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-500',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${colors[color]}`}>
      {children}
    </span>
  );
};

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ZipraProduct | null>(null);
  const [allProducts, setAllProducts] = useState<ZipraProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const { data: pData, error: pError } = await supabase
          .from('zipra_products')
          .select('*')
          .eq('product_id', id)
          .maybeSingle();

        if (pError) throw pError;
        setProduct(pData);

        const { data: allData } = await supabase
          .from('zipra_products')
          .select('*')
          .eq('is_active', true)
          .neq('product_id', id)
          .order('display_order');
        
        if (allData) setAllProducts(allData);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <ZPRIA_MAIN_LOGO className="w-16 h-16 animate-pulse opacity-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-white">
        <h2 className="text-[32px] font-black text-[#1d1d1f] uppercase tracking-tighter mb-4">Node Not Found</h2>
        <button onClick={() => navigate('/')} className="px-16 py-5 bg-[#1d1d1f] text-white rounded-full font-black text-[13px] uppercase tracking-widest">Return to Hub</button>
      </div>
    );
  }

  const getArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { return []; }
    }
    return [];
  };

  return (
    <div className="reveal-node px-4 md:px-6 pb-60 max-w-[1300px] mx-auto pt-4 md:pt-10 bg-white font-sans overflow-x-hidden">
      {/* 1. TOP HEADER - NAVIGATION & STATS */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 border-b border-gray-100 pb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-[11px] font-black text-[#86868b] uppercase tracking-[0.4em] hover:text-[#1d1d1f] transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            Global registry
          </button>
          
          <div className="flex gap-4 sm:gap-10 items-center">
            <div className="text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
               <p className="text-[20px] font-black text-[#1d1d1f] leading-none">{product.rating || '4.7'}</p>
               <p className="text-[8px] font-bold text-blue-500 uppercase mt-1">{product.review_count || '340'} Reviews</p>
            </div>
            <div className="text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Userbase</p>
               <p className="text-[20px] font-black text-[#1d1d1f] leading-none">{(product.total_users / 1000).toFixed(1)}K+</p>
               <p className="text-[8px] font-bold text-green-500 uppercase mt-1">Authorized</p>
            </div>
            <div className="text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Deployed</p>
               <p className="text-[20px] font-black text-[#1d1d1f] leading-none">{product.launched_at ? new Date(product.launched_at).getFullYear() : '2023'}</p>
               <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Sync Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <Link to="/support" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap">Support Node</Link>
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest opacity-40">Revision {product.version || '2.4.1'}</span>
        </div>
      </div>

      {/* 2. HERO AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 items-start mb-40">
        <div className="lg:col-span-5 relative">
           <div className="aspect-square rounded-[56px] md:rounded-[72px] bg-[#fbfbfd] border border-gray-100 shadow-2xl overflow-hidden flex items-center justify-center relative group">
              {product.icon_url ? (
                <img 
                  src={product.icon_url} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.target as HTMLImageElement).src = '/facebook-icon.png'}
                />
              ) : (
                <ZPRIA_MAIN_LOGO className="w-32 h-32 opacity-10" />
              )}
              <div className="absolute top-10 left-10 flex flex-col gap-2">
                {product.is_featured && <Badge color="green">Featured Protocol</Badge>}
                <Badge color="gray">{product.target_audience || 'Universal Access'}</Badge>
              </div>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
               <Badge color="blue">{product.type_label || product.product_type}</Badge>
               <span className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] my-auto">● {product.pricing_type} deployment</span>
            </div>
            <h1 className="text-[54px] md:text-[98px] font-black text-[#1d1d1f] tracking-tighter leading-[0.85] uppercase">
              {product.product_name}
            </h1>
            <p className="text-[22px] md:text-[28px] text-gray-400 font-medium leading-tight max-w-2xl">
              {product.description}
            </p>
          </div>

          <div className="p-10 md:p-14 bg-[#fbfbfd] rounded-[56px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
             <div className="space-y-1 relative z-10 text-center md:text-left">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Protocol Cost</p>
                <h3 className="text-[38px] md:text-[48px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-none">
                  {product.price > 0 ? `${product.currency} ${product.price}` : 'Sovereign Access'}
                </h3>
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-2">Encryption layer included</p>
             </div>
             <a 
                href={product.product_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto px-20 py-6 bg-[#0071e3] text-white rounded-full font-black text-[17px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#0077ed] transition-all hover:scale-105 active:scale-95 text-center relative z-10"
              >
                Visit Now
              </a>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL REGISTRY (RED BOX 3 - NEATLY CATEGORIZED) */}
      <div className="space-y-40 mb-60">
        
        {/* Architectural Vision & Metadata */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 mb-16">
            <div className="lg:col-span-5">
               <h4 className="text-[12px] font-black text-[#86868b] uppercase tracking-[0.6em] mb-8">Architectural Vision</h4>
               <p className="text-[18px] md:text-[22px] text-[#1d1d1f] leading-relaxed font-medium">
                 {product.long_description || product.description}
               </p>
            </div>
            
            <div className="lg:col-span-7 bg-gray-50/50 p-10 md:p-14 rounded-[56px] border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Audience</h5>
                    <p className="text-[15px] font-bold text-[#1d1d1f] uppercase">{product.target_audience || 'Universal Creator'}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deployment Region</h5>
                    <p className="text-[15px] font-bold text-[#1d1d1f] uppercase">Global Territories</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Identity Scale</h5>
                    <p className="text-[15px] font-bold text-[#1d1d1f] uppercase">Enterprise Layer Active</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metadata Clusters</h5>
                    <div className="flex flex-wrap gap-2">
                       {(product.tags || 'Productivity, Creative, Engine').split(',').map((tag: string, i: number) => (
                         <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm">#{tag.trim()}</span>
                       ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Keywords</h5>
                    <p className="text-[13px] font-medium text-gray-500 italic">{product.keywords || 'ZPRIA, Universal, Studio, Node'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Visual Registry (Play Store Style Gallery) */}
          {getArray(product.screenshot_urls).length > 0 && (
            <div className="mt-16">
              <h4 className="text-[12px] font-black text-[#86868b] uppercase tracking-[0.6em] mb-10">Visual Interface Registry</h4>
              <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                  {getArray(product.screenshot_urls).map((url: string, i: number) => (
                    <div key={i} className="min-w-[320px] md:min-w-[620px] aspect-video rounded-[48px] overflow-hidden bg-gray-50 border border-gray-100 shadow-xl group shrink-0 transition-all hover:scale-[1.02]">
                       <img 
                         src={url} 
                         alt={`${product.product_name} preview ${i}`} 
                         className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105" 
                         crossOrigin="anonymous"
                         referrerPolicy="no-referrer"
                         onError={(e) => (e.target as HTMLImageElement).src = '/facebook-icon.png'}
                       />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* Benefits & Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
           <div className="space-y-12">
              <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] border-b border-gray-100 pb-4">Core Benefits</h5>
              <div className="space-y-6">
                 {getArray(product.benefits).map((b: string, i: number) => (
                   <div key={i} className="flex gap-6 items-start group">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">0{i+1}</div>
                      <p className="text-[17px] text-[#424245] font-medium pt-1 leading-snug">{b}</p>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-12">
              <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] border-b border-gray-100 pb-4">Node Features</h5>
              <div className="grid grid-cols-1 gap-4">
                 {getArray(product.features).map((f: string, i: number) => (
                   <div key={i} className="px-8 py-5 bg-[#fbfbfd] border border-gray-100 rounded-[32px] hover:border-indigo-100 transition-colors">
                      <p className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-tight">{f}</p>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-12">
              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] border-b border-gray-100 pb-4">Provisioning Flow</h5>
              <div className="space-y-4">
                 {getArray(product.process_steps).map((step: string, i: number) => (
                   <div key={i} className="flex gap-5 items-center px-6 py-4 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-100 transition-colors">
                      <span className="text-2xl font-black text-gray-200 shrink-0">{i+1}</span>
                      <p className="text-[13px] font-black text-[#1d1d1f] uppercase tracking-tighter leading-none">{step}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Requirements & Documentation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
           <div className="lg:col-span-8 bg-[#1d1d1f] text-white p-14 md:p-20 rounded-[64px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                 <ZPRIA_MAIN_LOGO className="w-24 h-24" />
              </div>
              <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em] mb-12">Technical Setup Protocol</h4>
              <div className="text-[17px] md:text-[21px] leading-relaxed font-mono font-medium text-gray-400 whitespace-pre-wrap">
                 {product.setup_guide || 'Follow the universal ZPRIA handshake sequence. All metadata is cryptographically sealed.'}
              </div>
              <div className="mt-16 pt-10 border-t border-white/10">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">System Requirements</p>
                 <p className="text-[15px] text-gray-300 font-medium italic">{product.requirements || 'Standard ZPRIA authorized hardware node required.'}</p>
              </div>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              <a href={product.documentation_url} target="_blank" className="p-10 bg-blue-50 rounded-[48px] text-center hover:bg-blue-100 transition-colors group flex-1 flex flex-col justify-center">
                 <p className="text-[13px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Documentation ↗</p>
              </a>
              <a href={product.support_url} target="_blank" className="p-10 bg-indigo-50 rounded-[48px] text-center hover:bg-indigo-100 transition-colors group flex-1 flex flex-col justify-center">
                 <p className="text-[13px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Engineering Hub ↗</p>
              </a>
           </div>
        </section>

        {/* 4. EXPLORE ZPRIA (REPLICATED ECOSYSTEM GRID) */}
        <section className="pt-40 border-t border-gray-100">
           <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-10">
              <div className="text-center md:text-left">
                 <h4 className="text-[12px] font-black text-[#86868b] uppercase tracking-[0.6em] mb-3">Ecosystem Exploration</h4>
                 <h3 className="text-[48px] md:text-[62px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-none">Explore ZPRIA</h3>
              </div>
              <button onClick={() => navigate('/')} className="px-14 py-5 border-2 border-[#1d1d1f] rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-[#1d1d1f] hover:text-white transition-all">
                Global Hub
              </button>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-24 justify-items-center">
             {allProducts.slice(0, 12).map((p) => (
               <div key={p.id} className="group flex flex-col items-center">
                  <div 
                    onClick={() => { navigate(`/product/${p.product_id}`); window.scrollTo(0,0); }}
                    className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center rounded-[28px] md:rounded-[40px] bg-white border border-gray-50 shadow-sm overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-110 cursor-pointer active:scale-95"
                  >
                    <img 
                      src={p.icon_url} 
                      alt={p.product_name} 
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.target as HTMLImageElement).src = '/facebook-icon.png'}
                    />
                  </div>
                  <div className="mt-6 text-center">
                     <p className="text-[12px] font-black text-[#1d1d1f] uppercase tracking-tighter group-hover:text-blue-600 transition-colors truncate w-32">{p.product_name}</p>
                     <p className="text-[9px] font-bold text-[#86868b] uppercase tracking-[0.2em] mt-1">{p.pricing_type}</p>
                  </div>
               </div>
           ))}
           </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="mt-60 pt-32 border-t border-gray-100 flex flex-col lg:flex-row gap-24 items-start">
        <div className="lg:w-1/2 space-y-14">
          <ZPRIA_MAIN_LOGO className="w-20 h-20 opacity-30 hover:opacity-100 transition-opacity duration-1000" />
          <div className="space-y-8">
            <h4 className="text-[48px] md:text-[64px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-[0.85]">The Sovereign <br /> Network.</h4>
            <p className="text-[20px] text-gray-500 font-medium leading-relaxed max-w-lg">
              ZPRIA is architected in Dhaka, Bangladesh. A unified digital sovereignty for global creators.
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 bg-[#fbfbfd] p-16 md:p-20 rounded-[80px] space-y-12 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-80 h-80 bg-white/40 blur-[120px] rounded-full -translate-x-40 -translate-y-40"></div>
           <h5 className="text-[15px] font-black uppercase tracking-[0.6em] text-[#86868b] relative z-10">System Origin</h5>
           <p className="text-[20px] md:text-[22px] font-bold text-[#1d1d1f] leading-relaxed relative z-10">
             Architected in Dhaka, Bangladesh. Optimized for global synchronization. The ZPRIA identity mesh currently powers creative workflows in over 180 server clusters worldwide.
           </p>
           <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-white hover:scale-105 transition-transform duration-500">
                <p className="text-[38px] font-black text-[#1d1d1f] tracking-tighter">2025</p>
                <p className="text-[12px] font-black text-[#86868b] uppercase tracking-widest">Master Protocol</p>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-white hover:scale-105 transition-transform duration-500">
                <p className="text-[38px] font-black text-[#1d1d1f] tracking-tighter">14M+</p>
                <p className="text-[12px] font-black text-[#86868b] uppercase tracking-widest">Active Nodes</p>
              </div>
           </div>
           <div className="text-center pt-10">
              <span className="text-[11px] font-black text-gray-300 uppercase tracking-[1em]">ZPRIA.IDENTITY.MESH.V5</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailsPage;
