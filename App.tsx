
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthState, UserProfile, LogoVariant } from './types';
import { DEFAULT_THEME, LOGO_VARIANTS, ZPRIA_CORNER_LOGO } from './constants';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';

// Lazy load secondary pages
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));
const VerifyPhonePage = React.lazy(() => import('./pages/VerifyPhonePage'));
const SigninPage = React.lazy(() => import('./pages/SigninPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const ProductHubPage = React.lazy(() => import('./pages/ProductHubPage'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const AccountServicesPage = React.lazy(() => import('./pages/AccountServicesPage'));
const DiagnosticsPage = React.lazy(() => import('./pages/DiagnosticsPage'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'));
const TeamsPage = React.lazy(() => import('./pages/TeamsPage'));
const ThemeSelectionPage = React.lazy(() => import('./pages/ThemeSelectionPage'));

const AccountPopover = ({ user, onLogout, onClose }: { user: UserProfile, onLogout: () => void, onClose: () => void }) => {
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={popoverRef}
      className="absolute top-[64px] right-0 w-full max-w-[360px] md:w-[400px] bg-[#202124] rounded-[28px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] border border-[#3c4043] z-[1000] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right text-white font-sans"
    >
      <div className="flex justify-between items-center p-4">
        <span className="text-[13px] font-medium text-[#9aa0a6] px-4 truncate">{user.login_id}</span>
        <button onClick={onClose} className="p-2 hover:bg-[#3c4043] rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex flex-col items-center px-6 pb-6">
        <div className="relative mb-4 group cursor-pointer">
          <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-[#303134]" style={{ backgroundColor: '#004d40' }}>
            {user.firstName[0]}
          </div>
          <div className="absolute bottom-0 right-0 bg-[#303134] border border-[#3c4043] p-1.5 rounded-full shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
        </div>
        
        <h3 className="text-[22px] font-medium text-white mb-6">Hi, {user.firstName}!</h3>
        
        <button 
          onClick={() => { navigate('/account-services'); onClose(); }}
          className="px-8 py-2.5 border border-[#3c4043] rounded-full text-[14px] font-medium text-[#8ab4f8] hover:bg-[#303134] transition-colors mb-8"
        >
          Manage your ZPRIA Account
        </button>

        <div className="flex gap-2 w-full mb-4">
          <button 
            onClick={() => { navigate('/signin'); onClose(); }}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#303134] hover:bg-[#3c4043] rounded-l-[16px] rounded-r-[4px] transition-colors text-[14px] font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add account
          </button>
          <button 
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#303134] hover:bg-[#3c4043] rounded-r-[16px] rounded-l-[4px] transition-colors text-[14px] font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign out
          </button>
        </div>

        <button 
          onClick={() => { navigate('/support'); onClose(); }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-[#303134] hover:bg-[#3c4043] rounded-[16px] transition-colors text-[14px] font-medium text-[#bdc1c6]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Support & Help
        </button>
      </div>

      <div className="px-6 py-4 bg-[#303134] flex items-center justify-center gap-4 border-t border-[#3c4043]">
        <Link to="/privacy" onClick={onClose} className="text-[12px] font-medium text-[#9aa0a6] hover:text-white transition-colors">Privacy Policy</Link>
        <span className="w-1 h-1 bg-[#5f6368] rounded-full"></span>
        <Link to="/terms" onClick={onClose} className="text-[12px] font-medium text-[#9aa0a6] hover:text-white transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
};

const GlobalHeader = () => (
  <nav className="h-[40px] md:h-[44px] bg-[#1c1c1e] flex items-center justify-between px-3 md:px-4 text-white relative z-[110] w-full font-sans shadow-lg">
     <div className="flex items-center h-full">
        <Link to="/" className="flex items-center transition-transform active:scale-90 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-1">
           <ZPRIA_CORNER_LOGO className="h-[20px] md:h-[24px] w-auto" />
        </Link>
     </div>
     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-black text-[10px] md:text-[12px] tracking-[0.4em] md:tracking-[0.6em] uppercase whitespace-nowrap text-center leading-none">
          Z I P R A
        </span>
     </div>
     <div className="w-[30px] md:w-[40px]"></div>
  </nav>
);

const SubHeader = ({ user, onLogout }: { user: UserProfile | null, onLogout: () => void }) => {
  const { pathname } = useLocation();
  const [showPopover, setShowPopover] = useState(false);
  
  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `
      px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl transition-all duration-300 
      uppercase font-black text-[10px] md:text-[11px] tracking-widest 
      flex items-center justify-center whitespace-nowrap outline-none
      focus-visible:ring-4 focus-visible:ring-blue-500/20 border-2
      ${isActive 
        ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-lg scale-[1.02]' 
        : 'bg-white text-[#1d1d1f] border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
    `;
  };

  return (
    <header className="h-[64px] md:h-[72px] bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-center px-4 md:px-8 sticky top-0 z-[100] transition-all shadow-sm">
      <div className="max-w-[1200px] w-full flex justify-between items-center">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg p-1">
           <ZPRIA_CORNER_LOGO className="h-[24px] md:h-[30px] w-auto text-[#1d1d1f]" />
        </Link>
        <nav className="flex items-center gap-2 md:gap-4 overflow-visible relative">
          {!user ? (
            <>
              <Link to="/signin" className={navItemClass('/signin')}>Sign In</Link>
              <Link to="/signup" className={navItemClass('/signup')}>Sign Up</Link>
              <Link to="/help" className={navItemClass('/help')}>Help</Link>
            </>
          ) : (
            <>
              <Link to="/help" className={navItemClass('/help')}>Help</Link>
              <div className="relative">
                <button 
                  onClick={() => setShowPopover(!showPopover)}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-black transition-transform active:scale-90 shadow-md ring-2 ring-white ring-offset-2 hover:ring-gray-200 overflow-hidden"
                  style={{ backgroundColor: '#004d40' }}
                >
                  {user.firstName[0].toUpperCase()}
                </button>
                {showPopover && (
                  <AccountPopover 
                    user={user} 
                    onLogout={() => { onLogout(); setShowPopover(false); }} 
                    onClose={() => setShowPopover(false)} 
                  />
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="py-12 md:py-20 bg-[#f5f5f7] border-t border-[#d2d2d7] px-6 text-[9px] md:text-[11px] text-[#86868b] text-center font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
    <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
      <p className="text-[#1d1d1f]">© 2025 ZPRIA Inc. All rights reserved.</p>
      <div className="flex space-x-6 md:space-x-12">
        <Link to="/privacy" className="hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded p-1">Privacy</Link>
        <Link to="/terms" className="hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded p-1">Terms</Link>
        <Link to="/legal" className="hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded p-1">Legal</Link>
      </div>
    </div>
  </footer>
);

const Layout = ({ children, user, onLogout }: { children?: React.ReactNode, user: UserProfile | null, onLogout: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GlobalHeader />
      <SubHeader user={user} onLogout={onLogout} />
      <main className="flex-1 relative w-full max-w-[1200px] mx-auto py-8 md:py-16">
        <Suspense fallback={<LoadingPage />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('zpria_user');
    const savedThemeId = localStorage.getItem('zpria_theme_id');
    const theme = LOGO_VARIANTS.find(v => v.id === savedThemeId) || DEFAULT_THEME;
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser,
      theme
    };
  });

  const login = (user: UserProfile) => {
    localStorage.setItem('zpria_user', JSON.stringify(user));
    const theme = LOGO_VARIANTS.find(v => v.id === user.themePreference) || DEFAULT_THEME;
    localStorage.setItem('zpria_theme_id', theme.id);
    setAuthState({ user, isAuthenticated: true, theme });
  };

  const logout = () => {
    localStorage.removeItem('zpria_user');
    localStorage.removeItem('zpria_theme_id');
    setAuthState({ user: null, isAuthenticated: false, theme: DEFAULT_THEME });
  };

  const updateTheme = (variant: LogoVariant) => {
    setAuthState(prev => ({ ...prev, theme: variant }));
  };

  return (
    <Router>
      <ScrollToTop />
      <Layout user={authState.user} onLogout={logout}>
        <Routes>
          <Route path="/" element={authState.isAuthenticated ? <ProductHubPage user={authState.user} onLogout={logout} /> : <DashboardPage user={null} theme={authState.theme} onLogout={logout} />} />
          <Route path="/signin" element={<SigninPage onLogin={login} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-phone" element={<VerifyPhonePage onLogin={login} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage onLogin={login} />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/privacy" element={<PolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/account-services" element={<AccountServicesPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/theme" element={<ThemeSelectionPage onSelectTheme={updateTheme} currentTheme={authState.theme} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
