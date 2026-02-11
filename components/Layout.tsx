
import React, { useState } from 'react';
import { Search, ShoppingCart, MapPin, User, Menu, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  onViewCart: () => void;
  onGoHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, cartCount, onViewCart, onGoHome }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Primary Header */}
      <header className="amazon-blue text-white px-4 py-2 flex items-center gap-4 sticky top-0 z-50">
        <div 
          className="flex items-center cursor-pointer p-2 border border-transparent hover:border-white rounded"
          onClick={onGoHome}
        >
          <span className="text-2xl font-bold tracking-tight">OmniFit<span className="text-[#febd69]">.com</span></span>
        </div>

        <div className="hidden md:flex flex-col text-xs p-2 border border-transparent hover:border-white rounded cursor-pointer">
          <span className="text-gray-400">Deliver to</span>
          <div className="flex items-center gap-1 font-bold">
            <MapPin size={14} /> New York 10001
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="flex w-full group">
            <button className="bg-gray-100 text-gray-700 text-xs px-3 rounded-l border-r border-gray-300 flex items-center gap-1 hover:bg-gray-200">
              All <ChevronDown size={14} />
            </button>
            <input 
              type="text" 
              className="flex-1 px-3 py-2 text-black focus:outline-none" 
              placeholder="Search OmniFit"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="amazon-orange p-2 rounded-r hover:bg-[#f3a847] text-black">
              <Search size={24} />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div className="flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer">
            <span className="text-gray-400">Hello, Sign in</span>
            <span className="font-bold flex items-center">Account & Lists <ChevronDown size={14} /></span>
          </div>
          <div className="flex flex-col p-2 border border-transparent hover:border-white rounded cursor-pointer">
            <span className="text-gray-400">Returns</span>
            <span className="font-bold">& Orders</span>
          </div>
        </div>

        <div 
          className="flex items-end gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer relative"
          onClick={onViewCart}
        >
          <div className="relative">
            <ShoppingCart size={32} />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-bold text-[#f08804]">
              {cartCount}
            </span>
          </div>
          <span className="font-bold hidden md:block">Cart</span>
        </div>
      </header>

      {/* Sub Header */}
      <nav className="amazon-light-blue text-white px-4 py-2 flex items-center gap-4 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button className="flex items-center gap-1 font-bold border border-transparent hover:border-white p-1 px-2 rounded">
          <Menu size={20} /> All
        </button>
        {['Medical Care', 'Best Sellers', 'Amazon Basics', 'Today\'s Deals', 'New Releases', 'Registry', 'Customer Service', 'Gift Cards', 'Sell'].map(item => (
          <button key={item} className="border border-transparent hover:border-white p-1 px-2 rounded">
            {item}
          </button>
        ))}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="bg-[#37475a] text-white py-4 text-center cursor-pointer hover:bg-[#485769]" onClick={() => window.scrollTo(0, 0)}>
          Back to top
        </div>
        <div className="amazon-light-blue text-white py-12 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Get to Know Us</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">Careers</li>
                <li className="hover:underline cursor-pointer">About OmniFit</li>
                <li className="hover:underline cursor-pointer">Investor Relations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Make Money with Us</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">Sell on OmniFit</li>
                <li className="hover:underline cursor-pointer">Supply to OmniFit</li>
                <li className="hover:underline cursor-pointer">Become an Affiliate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">OmniFit Payment Products</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">OmniFit Business Card</li>
                <li className="hover:underline cursor-pointer">Shop with Points</li>
                <li className="hover:underline cursor-pointer">Reload Your Balance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Let Us Help You</h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="hover:underline cursor-pointer">Your Account</li>
                <li className="hover:underline cursor-pointer">Your Orders</li>
                <li className="hover:underline cursor-pointer">Shipping Rates</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="amazon-blue text-white py-8 text-center border-t border-gray-700 text-xs">
          <div className="flex justify-center gap-6 mb-4">
            <span className="hover:underline cursor-pointer">Conditions of Use</span>
            <span className="hover:underline cursor-pointer">Privacy Notice</span>
            <span className="hover:underline cursor-pointer">Your Ads Privacy Choices</span>
          </div>
          <p>© 1996-2024, OmniFit.com, Inc. or its affiliates</p>
        </div>
      </footer>
    </div>
  );
};
