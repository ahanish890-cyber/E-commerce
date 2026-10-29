import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  ChevronRight, 
  Sparkles, 
  Camera, 
  ShoppingBag, 
  Package, 
  Heart, 
  MapPin, 
  Shield, 
  LogOut, 
  LogIn, 
  HelpCircle, 
  Info, 
  Truck, 
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User } from '../types';
import { GENDER_TABS, SUBCATEGORIES_BY_GENDER } from '../constants';

interface AllNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  cartCount: number;
  deliveryLocation: { city: string; zipCode: string };
  onSelectDepartment: (deptId: string) => void;
  onSelectSubcategory: (subId: string, deptId: string) => void;
  onViewCart: () => void;
  onViewOrders: () => void;
  onViewWishlist: () => void;
  onViewAdmin: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenAIAssistant: () => void;
  onOpenVisualSearch: () => void;
  onOpenDeliveryModal: () => void;
  onOpenFooterModal: (modal: 'about' | 'fittingLab' | 'sustainability' | 'help' | 'legal') => void;
}

export const AllNavDrawer: React.FC<AllNavDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  cartCount,
  deliveryLocation,
  onSelectDepartment,
  onSelectSubcategory,
  onViewCart,
  onViewOrders,
  onViewWishlist,
  onViewAdmin,
  onOpenAuth,
  onSignOut,
  onOpenAIAssistant,
  onOpenVisualSearch,
  onOpenDeliveryModal,
  onOpenFooterModal
}) => {
  const [expandedDept, setExpandedDept] = useState<string | null>('women');

  if (!isOpen) return null;

  const toggleDept = (deptId: string) => {
    setExpandedDept(prev => prev === deptId ? null : deptId);
  };

  const departments = [
    { id: 'women', label: "Women's Fashion", icon: '👗' },
    { id: 'men', label: "Men's Fashion", icon: '👔' },
    { id: 'kids', label: 'Kids & Baby', icon: '🧒' },
    { id: 'footwear', label: 'Footwear & Shoes', icon: '👟' },
    { id: 'accessories', label: 'Bags & Accessories', icon: '👜' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Menu Panel */}
      <div className="relative w-full max-w-[360px] sm:max-w-[380px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* User Account Header */}
        <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div 
            onClick={() => {
              onClose();
              if (currentUser) onViewOrders();
              else onOpenAuth();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#febd69] group-hover:text-black flex items-center justify-center transition-colors">
              <UserIcon size={20} />
            </div>
            <div>
              <span className="text-sm font-black group-hover:text-[#febd69] transition-colors block">
                {currentUser ? `Hello, ${currentUser.name}` : 'Hello, Sign In'}
              </span>
              <span className="text-[11px] text-gray-300">
                {currentUser ? (currentUser.role === 'admin' ? 'Store Administrator' : 'Customer Account') : 'Browse or sign in'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-xs">
          {/* Quick Deliver To Banner */}
          <div 
            onClick={() => { onClose(); onOpenDeliveryModal(); }}
            className="p-3.5 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#e77600]" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Deliver to</span>
                <span className="font-bold text-gray-900">{deliveryLocation.city} {deliveryLocation.zipCode}</span>
              </div>
            </div>
            <span className="text-[11px] text-[#007185] font-bold">Change</span>
          </div>

          {/* Section 1: AI Fashion Innovations */}
          <div className="p-4 space-y-2">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-400 px-2 mb-2">
              OmniFit AI Features
            </h4>
            <button
              onClick={() => { onClose(); onOpenAIAssistant(); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-orange-50/60 text-gray-800 hover:text-[#b12704] transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 font-bold">
                <Sparkles size={16} className="text-[#e77600]" /> OmniFit AI Stylist
              </span>
              <span className="bg-[#febd69]/40 text-black text-[10px] font-black px-1.5 py-0.5 rounded">NEW</span>
            </button>

            <button
              onClick={() => { onClose(); onOpenVisualSearch(); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-orange-50/60 text-gray-800 hover:text-[#b12704] transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 font-bold">
                <Camera size={16} className="text-[#007185]" /> Visual Garment Search
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button
              onClick={() => { onClose(); onOpenFooterModal('fittingLab'); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 text-gray-800 hover:text-purple-900 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5 font-bold">
                <Layers size={16} className="text-purple-600" /> Virtual Fitting Room Lab
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Section 2: Shop by Department */}
          <div className="p-4 space-y-1">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-400 px-2 mb-2">
              Shop by Department
            </h4>

            {/* All Products Link */}
            <button
              onClick={() => {
                onSelectDepartment('all');
                onClose();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 font-bold text-gray-900 text-left"
            >
              <span className="flex items-center gap-2">
                <span>🌟</span> All Fashion Catalog
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            {departments.map((dept) => {
              const isExpanded = expandedDept === dept.id;
              const subcategories = SUBCATEGORIES_BY_GENDER[dept.id] || [];

              return (
                <div key={dept.id} className="rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                    <button
                      onClick={() => {
                        onSelectDepartment(dept.id);
                        onClose();
                      }}
                      className="flex-1 flex items-center gap-2 font-bold text-gray-800 text-left group-hover:text-[#007185]"
                    >
                      <span>{dept.icon}</span> {dept.label}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDept(dept.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Subcategories accordion */}
                  {isExpanded && subcategories.length > 0 && (
                    <div className="pl-7 pr-2 py-1.5 space-y-1 bg-neutral-50/70 border-l-2 border-[#febd69] ml-4 my-1 rounded-r-lg">
                      {subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            if (sub.id === 'all') {
                              onSelectDepartment(dept.id);
                            } else {
                              onSelectSubcategory(sub.id, dept.id);
                            }
                            onClose();
                          }}
                          className="w-full text-left py-1 px-2 rounded text-gray-700 hover:text-[#007185] hover:bg-white font-medium text-xs flex items-center justify-between"
                        >
                          <span>{sub.label}</span>
                          <span className="text-[10px] text-gray-400">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 3: Programs & Your Account */}
          <div className="p-4 space-y-1">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-400 px-2 mb-2">
              Your Account & Activity
            </h4>

            <button
              onClick={() => { onClose(); onViewOrders(); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-gray-800 font-medium text-left"
            >
              <span className="flex items-center gap-2">
                <Package size={16} className="text-[#007185]" /> Your Orders & Tracking
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button
              onClick={() => { onClose(); onViewWishlist(); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-gray-800 font-medium text-left"
            >
              <span className="flex items-center gap-2">
                <Heart size={16} className="text-red-500" /> Saved Wishlist
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button
              onClick={() => { onClose(); onViewCart(); }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-gray-800 font-medium text-left"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#febd69]" /> Shopping Cart
              </span>
              <span className="font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
                {cartCount}
              </span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { onClose(); onViewAdmin(); }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 text-purple-700 font-bold text-left"
              >
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-purple-600" /> Admin Console
                </span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 rounded">OPS</span>
              </button>
            )}
          </div>

          {/* Section 4: Help & Policies */}
          <div className="p-4 space-y-1">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-gray-400 px-2 mb-2">
              Help & Policies
            </h4>

            <button
              onClick={() => { onClose(); onOpenFooterModal('help'); }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 text-left"
            >
              <Truck size={15} className="text-blue-500" /> Shipping & Delivery Times
            </button>

            <button
              onClick={() => { onClose(); onOpenFooterModal('help'); }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 text-left"
            >
              <RotateCcw size={15} className="text-green-600" /> 30-Day Free Returns
            </button>

            <button
              onClick={() => { onClose(); onOpenFooterModal('about'); }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 text-left"
            >
              <Info size={15} className="text-amber-500" /> About OmniFit
            </button>
          </div>

          {/* Section 5: Auth Action */}
          <div className="p-4">
            {currentUser ? (
              <button
                onClick={() => { onClose(); onSignOut(); }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors"
              >
                <LogOut size={16} /> Sign Out of OmniFit
              </button>
            ) : (
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold text-xs shadow-sm transition-all"
              >
                <LogIn size={16} /> Sign In to Your Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
