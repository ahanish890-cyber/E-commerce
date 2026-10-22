import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  User as UserIcon, 
  Menu, 
  ChevronDown, 
  Sparkles, 
  Camera, 
  LogOut, 
  Package, 
  Heart, 
  Shield 
} from 'lucide-react';
import { User } from '../types';
import { GENDER_TABS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  currentUser: User | null;
  activeGender: string;
  onSelectGender: (genderId: string) => void;
  onViewCart: () => void;
  onGoHome: () => void;
  onViewOrders: () => void;
  onViewWishlist: () => void;
  onViewAdmin: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onSearch: (query: string, department: string) => void;
  onOpenAIAssistant: () => void;
  onOpenVisualSearch: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  cartCount, 
  currentUser,
  activeGender,
  onSelectGender,
  onViewCart, 
  onGoHome,
  onViewOrders,
  onViewWishlist,
  onViewAdmin,
  onOpenAuth,
  onSignOut,
  onSearch,
  onOpenAIAssistant,
  onOpenVisualSearch
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('all');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue, searchDepartment);
  };

  const deliveryAddress = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Primary Header */}
      <header className="amazon-blue text-white px-4 py-2 flex items-center gap-3 md:gap-4 sticky top-0 z-50">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer p-2 border border-transparent hover:border-white rounded select-none shrink-0"
          onClick={onGoHome}
        >
          <span className="text-2xl font-black tracking-tight text-white">OmniFit<span className="text-[#febd69]">.com</span></span>
        </div>

        {/* Deliver To */}
        <div className="hidden md:flex flex-col text-xs p-2 border border-transparent hover:border-white rounded cursor-pointer shrink-0">
          <span className="text-gray-400">Deliver to {currentUser ? currentUser.name.split(' ')[0] : ''}</span>
          <div className="flex items-center gap-1 font-bold text-white">
            <MapPin size={14} className="text-[#febd69]" /> 
            <span>{deliveryAddress ? `${deliveryAddress.city} ${deliveryAddress.zipCode}` : 'New York 10001'}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="flex w-full group">
            <select
              value={searchDepartment}
              onChange={(e) => setSearchDepartment(e.target.value)}
              className="bg-gray-100 text-gray-700 text-xs px-2 md:px-3 rounded-l border-r border-gray-300 focus:outline-none hover:bg-gray-200 cursor-pointer hidden sm:block shrink-0"
            >
              <option value="all">All Departments</option>
              <option value="women">Women's Fashion</option>
              <option value="men">Men's Fashion</option>
              <option value="kids">Kids & Baby</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
            </select>
            <input 
              type="text" 
              className="flex-1 px-3 py-2 text-black text-sm focus:outline-none bg-white min-w-0 rounded-l sm:rounded-l-none" 
              placeholder="Search OmniFit catalog, clothing, brands, materials..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button 
              type="submit"
              className="amazon-orange px-4 py-2 rounded-r hover:bg-[#f3a847] text-black shrink-0 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Account & Lists */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAccountMenuOpen(true)}
          onMouseLeave={() => setIsAccountMenuOpen(false)}
        >
          <div 
            onClick={currentUser ? undefined : onOpenAuth}
            className="flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer text-xs"
          >
            <span className="text-gray-400">
              {currentUser ? `Hello, ${currentUser.name.split(' ')[0]}` : 'Hello, Sign in'}
            </span>
            <span className="font-bold flex items-center gap-0.5 text-white">
              Account & Lists <ChevronDown size={12} />
            </span>
          </div>

          {/* Account Dropdown */}
          {isAccountMenuOpen && (
            <div className="absolute right-0 top-full pt-1 w-64 z-50">
              <div className="bg-white text-gray-900 rounded-md shadow-2xl border border-gray-200 p-4 text-sm animate-in fade-in duration-150">
                {!currentUser ? (
                  <div className="text-center pb-3 border-b border-gray-200">
                    <button
                      onClick={() => { setIsAccountMenuOpen(false); onOpenAuth(); }}
                      className="w-full py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold rounded-md shadow-sm transition-all text-sm mb-2"
                    >
                      Sign in
                    </button>
                    <p className="text-xs text-gray-600">
                      New customer?{' '}
                      <span 
                        onClick={() => { setIsAccountMenuOpen(false); onOpenAuth(); }}
                        className="text-[#007185] hover:underline cursor-pointer font-semibold"
                      >
                        Start here.
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="pb-3 border-b border-gray-200">
                    <p className="font-bold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    {currentUser.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                        Store Administrator
                      </span>
                    )}
                  </div>
                )}

                <div className="py-2 space-y-1">
                  <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider px-2">Your Account</h5>
                  <button
                    onClick={() => { setIsAccountMenuOpen(false); onViewOrders(); }}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-xs font-medium text-gray-700"
                  >
                    <Package size={14} className="text-[#007185]" /> Your Orders & Tracking
                  </button>
                  <button
                    onClick={() => { setIsAccountMenuOpen(false); onViewWishlist(); }}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-xs font-medium text-gray-700"
                  >
                    <Heart size={14} className="text-red-500" /> Your Wishlist
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => { setIsAccountMenuOpen(false); onViewAdmin(); }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-purple-50 text-xs font-bold text-purple-700"
                    >
                      <Shield size={14} className="text-purple-600" /> Admin Dashboard
                    </button>
                  )}
                </div>

                {currentUser && (
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => { setIsAccountMenuOpen(false); onSignOut(); }}
                      className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-red-50 text-xs font-medium text-red-600"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Returns & Orders */}
        <div 
          onClick={onViewOrders}
          className="hidden sm:flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer text-xs shrink-0"
        >
          <span className="text-gray-400">Returns</span>
          <span className="font-bold text-white">& Orders</span>
        </div>

        {/* Cart */}
        <div 
          className="flex items-end gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer relative shrink-0"
          onClick={onViewCart}
        >
          <div className="relative">
            <ShoppingCart size={32} className="text-white" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-black text-[#febd69]">
              {cartCount}
            </span>
          </div>
          <span className="font-bold hidden md:block text-sm text-white">Cart</span>
        </div>
      </header>

      {/* Sub Header / Gender Navigation */}
      <nav className="amazon-light-blue text-white px-4 py-2 flex items-center justify-between text-xs overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[#37475a]">
        <div className="flex items-center gap-1 md:gap-2">
          {GENDER_TABS.map(tab => {
            const isActive = activeGender === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectGender(tab.id)}
                className={`px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1 ${
                  isActive 
                    ? 'bg-[#febd69] text-gray-900 font-bold shadow-sm' 
                    : 'border border-transparent hover:border-white text-gray-200 hover:text-white'
                }`}
              >
                {tab.id === 'all' && <Menu size={14} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* OmniFit AI Signature Features Shortcuts */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={onOpenVisualSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/20"
          >
            <Camera size={14} className="text-[#febd69]" /> Visual Garment Search
          </button>
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-gray-950 font-black shadow-md transition-all"
          >
            <Sparkles size={14} /> OmniFit Stylist
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div 
          className="bg-[#37475a] text-white py-3 text-center cursor-pointer hover:bg-[#485769] text-xs font-semibold" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
        </div>
        <div className="amazon-light-blue text-white py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">Get to Know Us</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">Careers</li>
                <li className="hover:underline cursor-pointer">About OmniFit AI</li>
                <li className="hover:underline cursor-pointer">Sustainability & Materials</li>
                <li className="hover:underline cursor-pointer">Virtual Fitting Lab</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">OmniFit AR & AI</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li onClick={onOpenVisualSearch} className="hover:underline cursor-pointer text-[#febd69]">Visual Garment Search</li>
                <li onClick={onOpenAIAssistant} className="hover:underline cursor-pointer text-[#febd69]">AI Fashion Stylist</li>
                <li className="hover:underline cursor-pointer">Virtual Try-On System</li>
                <li className="hover:underline cursor-pointer">AI Size Predictor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">OmniFit Payment</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">OmniFit Rewards Card</li>
                <li className="hover:underline cursor-pointer">Shop with Points</li>
                <li className="hover:underline cursor-pointer">Reload Your Balance</li>
                <li className="hover:underline cursor-pointer">Instant Demo Checkout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">Let Us Help You</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li onClick={onViewOrders} className="hover:underline cursor-pointer">Your Orders & Returns</li>
                <li className="hover:underline cursor-pointer">Shipping Rates & Policies</li>
                <li className="hover:underline cursor-pointer">30-Day Free Return Guarantee</li>
                <li className="hover:underline cursor-pointer">Customer Service 24/7</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="amazon-blue text-white py-6 text-center border-t border-gray-700 text-xs">
          <div className="flex justify-center gap-6 mb-3 text-gray-400">
            <span className="hover:underline cursor-pointer">Conditions of Use</span>
            <span className="hover:underline cursor-pointer">Privacy Notice</span>
            <span className="hover:underline cursor-pointer">Your Ads Privacy Choices</span>
          </div>
          <p className="text-gray-400">© 2026 OmniFit.com, Inc. or its affiliates. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
