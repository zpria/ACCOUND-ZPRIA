
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, LogOut, User, Check, X } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { logActivity } from '../services/deviceDetection';

interface Account {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  theme_preference: string;
  is_active: boolean;
}

interface AccountSwitcherProps {
  currentUser: any;
  onSwitchAccount: (account: Account) => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ currentUser, onSwitchAccount }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAccounts = async () => {
    try {
      // Get all saved accounts from localStorage
      const savedAccounts = localStorage.getItem('zpria_accounts');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        // Mark current account as active
        const updated = parsed.map((acc: Account) => ({
          ...acc,
          is_active: acc.id === currentUser?.id
        }));
        setAccounts(updated);
      } else if (currentUser) {
        // If no saved accounts, create from current user
        const account: Account = {
          id: currentUser.id,
          username: currentUser.username || currentUser.login_id,
          email: currentUser.email,
          first_name: currentUser.firstName || '',
          last_name: currentUser.lastName || '',
          avatar_url: currentUser.avatar_url,
          theme_preference: currentUser.theme_preference || 'purple',
          is_active: true
        };
        setAccounts([account]);
        saveAccountsToStorage([account]);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const saveAccountsToStorage = (accs: Account[]) => {
    localStorage.setItem('zpria_accounts', JSON.stringify(accs));
  };

  const handleSwitchAccount = async (account: Account) => {
    if (account.id === currentUser?.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setSwitchError(null);

    try {
      // Log logout for current account
      if (currentUser) {
        await logActivity(currentUser.id, 'logout', { reason: 'account_switch' });
      }

      // Fetch full user data for the selected account
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', account.id)
        .single();

      if (error) throw error;

      if (data) {
        // Convert to UserProfile format
        const userProfile = {
          id: data.id,
          username: data.username,
          login_id: data.login_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          mobile: data.mobile,
          address: data.address,
          dob: data.dob,
          gender: data.gender,
          isEmailVerified: data.is_email_verified,
          themePreference: data.theme_preference,
          accountStatus: data.account_status,

          avatarUrl: data.avatar_url
        };
        
        // Update localStorage with new user
        localStorage.setItem('zpria_user', JSON.stringify(userProfile));
        
        // Update accounts list
        const updatedAccounts = accounts.map(acc => ({
          ...acc,
          is_active: acc.id === account.id
        }));
        saveAccountsToStorage(updatedAccounts);

        // Log login for new account
        await logActivity(account.id, 'login', { method: 'account_switch' });

        // Notify parent
        onSwitchAccount(account);
        
        // Close dropdown and refresh
        setIsOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Failed to switch account:', err);
      setSwitchError(err.message || 'Failed to switch account. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleAddAccount = () => {
    setIsOpen(false);
    setShowAddAccount(true);
  };

  const handleSignOutAll = async () => {
    try {
      // Log logout for current account
      if (currentUser) {
        await logActivity(currentUser.id, 'logout', { reason: 'sign_out_all' });
      }

      // Clear all account data
      localStorage.removeItem('zpria_user');
      localStorage.removeItem('zpria_accounts');
      localStorage.removeItem('zpria_device_id');
      
      navigate('/signin');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const getInitials = (account: Account) => {
    return `${account.first_name?.[0] || ''}${account.last_name?.[0] || ''}`.toUpperCase() || 
           account.username?.[0]?.toUpperCase() || 'U';
  };

  if (!currentUser) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Current Account Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#0071e3' }}
          >
            {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="font-semibold text-[#1d1d1f]">{currentUser.email}</p>
            </div>

            {/* Error Message */}
            {switchError && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                <p className="text-xs text-red-600 text-center">{switchError}</p>
              </div>
            )}

            {/* Loading Overlay */}
            {isSwitching && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-600">Switching...</p>
                </div>
              </div>
            )}

            {/* Accounts List */}
            <div className="max-h-80 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSwitchAccount(account)}
                  disabled={isSwitching}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                    account.is_active ? 'bg-blue-50' : ''
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#0071e3' }}
                  >
                    {getInitials(account)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[#1d1d1f]">
                      {account.first_name} {account.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{account.email}</p>
                  </div>
                  {account.is_active && (
                    <Check className="w-5 h-5 text-[#0071e3]" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="p-2 border-t border-gray-100 space-y-1">
              <button
                onClick={handleAddAccount}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-[#1d1d1f]">Add another account</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/account-services');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-[#1d1d1f]">Manage your account</span>
              </button>

              <button
                onClick={handleSignOutAll}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-[#1d1d1f]">Sign out of all accounts</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Add Account</h3>
              <button
                onClick={() => setShowAddAccount(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[#86868b] mb-6">
              Sign in with a different ZPRIA account to add it to this device.
            </p>

            <button
              onClick={() => {
                setShowAddAccount(false);
                navigate('/signin?add_account=true');
              }}
              className="w-full py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-colors"
            >
              Sign in with another account
            </button>

            <button
              onClick={() => setShowAddAccount(false)}
              className="w-full py-4 mt-3 bg-gray-100 text-[#1d1d1f] rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSwitcher;
