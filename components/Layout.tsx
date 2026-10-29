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
  Shield,
  X,
  Info,
  HelpCircle,
  FileText,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import { GENDER_TABS } from '../constants';
import { AllNavDrawer } from './AllNavDrawer';
import { DeliveryAddressModal } from './DeliveryAddressModal';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  currentUser: User | null;
  activeGender: string;
  deliveryLocation: { city: string; zipCode: string };
  onUpdateDeliveryLocation: (loc: { city: string; zipCode: string }) => void;
  onSelectGender: (genderId: string) => void;
  onSelectSubcategory?: (subId: string, deptId: string) => void;
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
  deliveryLocation,
  onUpdateDeliveryLocation,
  onSelectGender,
  onSelectSubcategory,
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
  const [isAllDrawerOpen, setIsAllDrawerOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [footerModal, setFooterModal] = useState<'about' | 'fittingLab' | 'sustainability' | 'help' | 'legal' | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue, searchDepartment);
  };

  const deliveryAddress = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Primary Header */}
      <header className="amazon-blue text-white px-4 py-2 flex items-center gap-3 md:gap-4 sticky top-0 z-50">
        {/* Mobile All Menu Button */}
        <button 
          onClick={() => setIsAllDrawerOpen(true)}
          className="md:hidden p-1 text-white hover:text-[#febd69] rounded hover:bg-white/10 shrink-0"
          title="Open all navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer p-2 border border-transparent hover:border-white rounded select-none shrink-0"
          onClick={onGoHome}
        >
          <span className="text-2xl font-black tracking-tight text-white">OmniFit<span className="text-[#febd69]">.in</span></span>
        </div>

        {/* Deliver To */}
        <div 
          onClick={() => setIsDeliveryModalOpen(true)}
          className="hidden md:flex flex-col text-xs p-2 border border-transparent hover:border-white rounded cursor-pointer shrink-0 transition-colors"
          title="Click to change delivery destination"
        >
          <span className="text-gray-400">Deliver to {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}</span>
          <div className="flex items-center gap-1 font-bold text-white">
            <MapPin size={14} className="text-[#febd69]" /> 
            <span>{deliveryLocation ? `${deliveryLocation.city} ${deliveryLocation.zipCode}` : 'Bengaluru 560001'}</span>
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
              <option value="all">All Clothing</option>
              <option value="women">Women's Fashion</option>
              <option value="men">Men's Fashion</option>
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
                  <button
                    onClick={() => { setIsAccountMenuOpen(false); setIsDeliveryModalOpen(true); }}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-xs font-medium text-gray-700"
                  >
                    <MapPin size={14} className="text-[#007185]" /> Delivery Address
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

        {/* Admin Dashboard Quick Link */}
        {currentUser?.role === 'admin' && (
          <div
            onClick={onViewAdmin}
            className="flex flex-col p-2 border border-purple-400 bg-purple-900/40 hover:bg-purple-900/70 rounded cursor-pointer text-xs shrink-0 transition-colors"
            title="Open OmniFit Admin Operations Console"
          >
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <Shield size={12} className="text-purple-300" /> Admin
            </span>
            <span className="font-bold text-white text-[11px]">Dashboard</span>
          </div>
        )}

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
          {/* All Departments Mega Drawer Button */}
          <button
            onClick={() => setIsAllDrawerOpen(true)}
            className="px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 border border-white/20 hover:border-white text-white hover:bg-white/10 shrink-0 select-none cursor-pointer"
            title="Open all departments & features menu"
          >
            <Menu size={16} className="text-[#febd69]" />
            <span>All</span>
          </button>

          {GENDER_TABS.map(tab => {
            const isActive = activeGender === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectGender(tab.id)}
                className={`px-3 py-1.5 rounded transition-all font-semibold flex items-center gap-1 cursor-pointer ${
                  isActive 
                    ? 'bg-[#febd69] text-gray-900 font-bold shadow-sm' 
                    : 'border border-transparent hover:border-white text-gray-200 hover:text-white'
                }`}
              >
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
                <li onClick={() => setFooterModal('about')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <Info size={12} className="text-[#febd69]" /> About OmniFit AI
                </li>
                <li onClick={() => setFooterModal('fittingLab')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#febd69]" /> Virtual Fitting Lab
                </li>
                <li onClick={() => setFooterModal('sustainability')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-green-400" /> Sustainability & Fit
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">OmniFit AR & AI</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li onClick={onOpenVisualSearch} className="hover:underline cursor-pointer text-[#febd69] flex items-center gap-1.5">
                  <Camera size={12} /> Visual Garment Search
                </li>
                <li onClick={onOpenAIAssistant} className="hover:underline cursor-pointer text-[#febd69] flex items-center gap-1.5">
                  <Sparkles size={12} /> AI Fashion Stylist
                </li>
                <li onClick={() => setFooterModal('fittingLab')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-blue-400" /> Virtual Try-On Engine
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">OmniFit Services</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li onClick={onViewCart} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <ShoppingCart size={12} className="text-[#febd69]" /> Shopping Cart & Items
                </li>
                <li onClick={onViewOrders} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <Package size={12} className="text-blue-300" /> Track Orders & Returns
                </li>
                <li onClick={onViewWishlist} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <Heart size={12} className="text-red-400" /> Saved Wishlist
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm text-white">Let Us Help You</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li onClick={onViewOrders} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <RotateCcw size={12} className="text-[#007185]" /> Your Orders & Returns
                </li>
                <li onClick={() => setFooterModal('help')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <Truck size={12} className="text-blue-300" /> Shipping Rates & Policies
                </li>
                <li onClick={() => setFooterModal('help')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <HelpCircle size={12} className="text-amber-400" /> 30-Day Free Return Guarantee
                </li>
                <li onClick={() => setFooterModal('help')} className="hover:underline cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-400" /> Customer Support & FAQ
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="amazon-blue text-white py-6 text-center border-t border-gray-700 text-xs">
          <div className="flex justify-center gap-6 mb-3 text-gray-400">
            <span onClick={() => setFooterModal('legal')} className="hover:underline cursor-pointer">Conditions of Use</span>
            <span onClick={() => setFooterModal('legal')} className="hover:underline cursor-pointer">Privacy Notice</span>
            <span onClick={() => setFooterModal('legal')} className="hover:underline cursor-pointer">Sandbox Simulation Policies</span>
          </div>
          <p className="text-gray-400">© 2026 OmniFit.in, Inc. or its affiliates. All rights reserved.</p>
        </div>

        {/* Footer Informational Modals */}
        {footerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 border border-gray-100 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#febd69]/30 text-gray-950 rounded-lg">
                    {footerModal === 'help' ? <HelpCircle size={18} /> : footerModal === 'legal' ? <FileText size={18} /> : <Sparkles size={18} />}
                  </div>
                  <h3 className="font-bold text-base text-gray-900">
                    {footerModal === 'about' && 'About OmniFit AI'}
                    {footerModal === 'fittingLab' && 'Virtual Fitting Room Lab'}
                    {footerModal === 'sustainability' && 'Sustainability & Fit Accuracy'}
                    {footerModal === 'help' && 'Customer Help, Shipping & Returns'}
                    {footerModal === 'legal' && 'Conditions of Use & Privacy'}
                  </h3>
                </div>
                <button 
                  onClick={() => setFooterModal(null)} 
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
                {footerModal === 'about' && (
                  <>
                    <p className="font-semibold text-gray-800">
                      OmniFit is an AI-first fashion destination revolutionizing how people discover, fit, and shop apparel online.
                    </p>
                    <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-gray-100">
                      <p><strong className="text-gray-900">• Virtual Try-On:</strong> Calibrated body alignment allowing shoppers to visualize outfits directly on themselves.</p>
                      <p><strong className="text-gray-900">• AI Size Predictor:</strong> Multi-dimensional measurements matching body shape with verified garment grading.</p>
                      <p><strong className="text-gray-900">• Visual Garment Search:</strong> Visual feature extraction to locate similar apparel from any uploaded photo.</p>
                    </div>
                  </>
                )}

                {footerModal === 'fittingLab' && (
                  <>
                    <p className="font-semibold text-gray-800">
                      The OmniFit Virtual Fitting Lab blends real-time camera alignment with automated garment silhouette scaling.
                    </p>
                    <div className="space-y-2 bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-950">
                      <p><strong className="text-purple-900">1. Instant Smart Fit Mode:</strong> Runs locally with zero latency, zero cloud API fees, and total user privacy.</p>
                      <p><strong className="text-purple-900">2. Neural Diffusion Support:</strong> Compatible with specialized cloud neural try-on models when API credentials are provided.</p>
                      <p><strong className="text-purple-900">3. Interactive Split Slider:</strong> Real-time before/after comparison to inspect drape and silhouette fit.</p>
                    </div>
                  </>
                )}

                {footerModal === 'sustainability' && (
                  <>
                    <p className="font-semibold text-gray-800">
                      High return rates in fashion are one of e-commerce's largest environmental burdens. OmniFit solves this at the root.
                    </p>
                    <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-100 text-green-950">
                      <p><strong className="text-green-900">• 68% Reduction in Fit Returns:</strong> Accurate sizing and try-on previews eliminate the need to order multiple sizes.</p>
                      <p><strong className="text-green-900">• Certified Fabrics:</strong> Organic cotton, responsibly sourced wool, and certified recycled technical blends.</p>
                    </div>
                  </>
                )}

                {footerModal === 'help' && (
                  <>
                    <div className="space-y-3">
                      <div className="p-3 bg-neutral-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                          <Truck size={14} className="text-[#007185]" /> Shipping Methods
                        </h4>
                        <p>• Standard Express: FREE on all orders over ₹999.</p>
                        <p>• Express Priority Delivery: Flat ₹149 with real-time tracking across India.</p>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                          <RotateCcw size={14} className="text-[#007185]" /> 30-Day Hassle-Free Returns
                        </h4>
                        <p>Items in original condition are eligible for free returns within 30 days of delivery. Prepaid return QR codes are generated directly from Your Orders portal.</p>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                          <ShieldCheck size={14} className="text-green-700" /> Support Desk
                        </h4>
                        <p>24/7 automated support and live specialist assistance available through the AI Stylist drawer.</p>
                      </div>
                    </div>
                  </>
                )}

                {footerModal === 'legal' && (
                  <>
                    <p className="font-semibold text-gray-800">
                      Demo Simulation & Privacy Notice
                    </p>
                    <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-gray-100">
                      <p><strong className="text-gray-900">1. Sandbox Demonstration:</strong> This store functions in sandbox demo mode. No actual financial charges are incurred, and orders are processed in a simulated fulfillment environment.</p>
                      <p><strong className="text-gray-900">2. Image Privacy:</strong> Any photos uploaded for Virtual Try-On or Visual Search are kept strictly private in memory and are never sold or used for public training.</p>
                      <p><strong className="text-gray-900">3. Zero Tracking:</strong> We do not deploy third-party advertising tracking cookies.</p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setFooterModal(null)}
                  className="w-full py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Slide-over All Navigation Mega Drawer */}
      <AllNavDrawer
        isOpen={isAllDrawerOpen}
        onClose={() => setIsAllDrawerOpen(false)}
        currentUser={currentUser}
        cartCount={cartCount}
        deliveryLocation={deliveryLocation}
        onSelectDepartment={(deptId) => {
          onSelectGender(deptId);
        }}
        onSelectSubcategory={(subId, deptId) => {
          if (onSelectSubcategory) {
            onSelectSubcategory(subId, deptId);
          } else {
            onSelectGender(deptId);
          }
        }}
        onViewCart={onViewCart}
        onViewOrders={onViewOrders}
        onViewWishlist={onViewWishlist}
        onViewAdmin={onViewAdmin}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
        onOpenAIAssistant={onOpenAIAssistant}
        onOpenVisualSearch={onOpenVisualSearch}
        onOpenDeliveryModal={() => setIsDeliveryModalOpen(true)}
        onOpenFooterModal={(modal) => setFooterModal(modal)}
      />

      {/* Delivery Address & Zip Code Modal */}
      <DeliveryAddressModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        currentUser={currentUser}
        currentLocation={deliveryLocation}
        onSelectLocation={onUpdateDeliveryLocation}
      />
    </div>
  );
};
