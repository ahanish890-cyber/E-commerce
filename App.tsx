
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MOCK_PRODUCTS, DEFAULT_PRODUCT_IMAGE } from './constants';
import { Product, CartItem, ViewMode } from './types';
import { Star, ChevronRight, ShieldCheck, Truck, RotateCcw, Camera, Heart, CheckCircle } from 'lucide-react';
import { VirtualTryOn } from './components/VirtualTryOn';

/**
 * Reusable Product Image component with robust error handling and reactive src updates.
 */
interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallback = DEFAULT_PRODUCT_IMAGE, 
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  // Sync internal state when src prop changes
  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src, fallback]);

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className} 
      onError={handleError}
      {...props} 
    />
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.Home);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTryOnActive, setIsTryOnActive] = useState(false);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView(ViewMode.ProductDetail);
    window.scrollTo(0, 0);
  };

  const addToCart = (product: Product, size: string, color: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selectedSize === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setCurrentView(ViewMode.Cart);
  };

  const renderHome = () => (
    <div className="max-w-[1500px] mx-auto p-4 space-y-8">
      {/* Prime Banner */}
      <div className="relative h-[280px] md:h-[450px] bg-[#131921] rounded-lg overflow-hidden group">
        <ProductImage 
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1600" 
          alt="Luxury Fashion Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="relative h-full flex flex-col justify-center px-10 md:px-20 text-white max-w-3xl z-10">
          <div className="inline-block bg-[#febd69] text-black text-[10px] font-black px-2 py-1 rounded uppercase mb-4 tracking-tighter w-fit">
             OmniFit Exclusive
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">The Future of <br/>Fitting Rooms.</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 font-medium">Stop guessing your size. Start seeing yourself in our newest arrivals using live AR try-on technology.</p>
          <div className="flex gap-4">
            <button className="bg-[#febd69] text-black font-bold px-10 py-4 rounded-full hover:bg-[#f3a847] transition-all shadow-xl">
              Shop Now
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-10 py-4 rounded-full hover:bg-white/20 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
           Trending in <span className="text-[#007185]">New Arrivals</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {MOCK_PRODUCTS.map(product => (
            <div 
              key={product.id} 
              className="bg-white p-5 flex flex-col group cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-2xl transition-all rounded-lg"
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-[3/4] mb-4 overflow-hidden bg-gray-100 rounded-md relative">
                <ProductImage 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
              </div>
              <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-[#007185] transition-colors h-10">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex text-[#f08804]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-[#007185] font-medium">{product.reviewCount}</span>
              </div>
              <div className="mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm self-start font-bold mt-1">$</span>
                  <span className="text-2xl font-bold">{Math.floor(product.price)}</span>
                  <span className="text-sm font-bold mt-1">99</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 mt-1 mb-3">
                   <div className="bg-[#00a8e1] w-3 h-3 rounded-sm"></div> prime
                   <span>FREE delivery Tomorrow</span>
                </div>
                {product.hasTryOn && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase bg-indigo-600 px-3 py-1.5 rounded-full w-fit shadow-md">
                    <Camera size={12} /> Virtual Try-On
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="bg-white min-h-screen">
        <nav className="max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
           <span className="hover:underline cursor-pointer">Fashion</span>
           <ChevronRight size={12} />
           <span className="hover:underline cursor-pointer">{selectedProduct.category}</span>
           <ChevronRight size={12} />
           <span className="font-bold text-gray-900">{selectedProduct.name}</span>
        </nav>
        <div className="max-w-[1500px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-12">
          {/* Image Gallery */}
          <div className="flex-1">
            <div className="sticky top-[100px] flex gap-6">
              <div className="hidden md:flex flex-col gap-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-16 h-20 border rounded-md cursor-pointer hover:border-[#e77600] overflow-hidden p-1 bg-white">
                    <ProductImage src={selectedProduct.image} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-neutral-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-8">
                <ProductImage 
                  src={selectedProduct.image} 
                  className="max-h-[600px] object-contain"
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-[1.2] space-y-8">
            <div>
              <p className="text-[#007185] font-bold text-sm hover:underline cursor-pointer tracking-tight">Visit the {selectedProduct.brand} Store</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 leading-tight">{selectedProduct.name}</h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">4.8</span>
                  <div className="flex text-[#f08804]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                  </div>
                </div>
                <span className="text-[#007185] text-sm hover:underline cursor-pointer font-bold">2,143 ratings</span>
                <span className="text-gray-300">|</span>
                <span className="text-[#007185] text-sm hover:underline cursor-pointer font-bold">Search 40+ answered questions</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="bg-neutral-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-baseline gap-2 text-red-600">
                <span className="text-4xl font-light">-15%</span>
                <div className="flex items-baseline">
                  <span className="text-sm font-bold self-start mt-2">$</span>
                  <span className="text-5xl font-bold">{(selectedProduct.price * 0.85).toFixed(0)}</span>
                  <span className="text-xl font-bold mt-2">99</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Typical price: <span className="line-through">${selectedProduct.price.toFixed(2)}</span></p>
              <div className="flex items-center gap-2 mt-4 text-sm font-bold text-gray-700">
                 <div className="bg-[#00a8e1] w-4 h-4 rounded-sm"></div> Prime One-Day
              </div>
              <p className="text-xs text-gray-500 mt-1">FREE Returns and FREE Delivery tomorrow if ordered within 10 hrs</p>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-gray-500">Color: <span className="text-gray-900">{selectedProduct.colors[0]}</span></h4>
              <div className="flex gap-4">
                {selectedProduct.colors.map(c => (
                  <div key={c} className="w-14 h-18 border-2 rounded-lg p-1 cursor-pointer hover:border-[#e77600] transition-all bg-white shadow-sm overflow-hidden">
                     <div className={`w-full h-full rounded ${c.toLowerCase().includes('beige') ? 'bg-[#f5f5dc]' : c.toLowerCase().includes('black') ? 'bg-black' : 'bg-blue-900'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-gray-500">Select Size</h4>
              <div className="flex flex-wrap gap-4">
                {selectedProduct.sizes.map(s => (
                  <button key={s} className="min-w-[70px] px-6 py-4 border-2 rounded-xl hover:border-[#e77600] hover:bg-orange-50 text-sm font-bold transition-all text-gray-800 shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#007185] hover:underline cursor-pointer font-bold flex items-center gap-1">
                 <RotateCcw size={14} /> View Size & Fit Guide
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-900">About this item</h4>
              <ul className="list-disc list-outside text-base space-y-3 text-gray-700 ml-5">
                <li><span className="font-bold">Premium Build:</span> Crafted with high-grade materials for maximum durability.</li>
                <li><span className="font-bold">AR Ready:</span> Fully compatible with OmniFit Virtual Try-On systems.</li>
                <li><span className="font-bold">Eco-Friendly:</span> Ethically sourced components following global sustainability standards.</li>
                <li>{selectedProduct.description}</li>
              </ul>
            </div>
          </div>

          {/* Checkout Card */}
          <div className="w-full md:w-[350px] border border-gray-200 rounded-2xl p-6 space-y-6 h-fit sticky top-[100px] bg-white shadow-xl">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold self-start mt-1">$</span>
              <span className="text-4xl font-bold">{(selectedProduct.price * 0.85).toFixed(2)}</span>
            </div>
            <div className="space-y-1">
               <p className="text-sm text-[#007185] font-bold">FREE Returns</p>
               <p className="text-sm text-[#007185] font-bold">FREE delivery Tomorrow</p>
               <p className="text-lg font-bold text-green-700">In Stock</p>
            </div>
            
            <div className="space-y-4">
              {selectedProduct.hasTryOn && (
                <button 
                  onClick={() => setIsTryOnActive(true)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-full font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 group"
                >
                  <Camera size={20} className="group-hover:rotate-12 transition-transform" /> 
                  Try Virtually
                </button>
              )}
              <button 
                onClick={() => addToCart(selectedProduct, selectedProduct.sizes[0], selectedProduct.colors[0])}
                className="w-full py-4 bg-[#ffd814] rounded-full font-bold hover:bg-[#f7ca00] shadow-md transition-all active:scale-95 text-gray-900"
              >
                Add to Cart
              </button>
              <button className="w-full py-4 bg-[#ffa41c] rounded-full font-bold hover:bg-[#fa8900] shadow-md transition-all active:scale-95 text-gray-900">
                Buy Now
              </button>
            </div>

            <div className="text-xs space-y-3 text-gray-500 pt-4">
              <div className="flex justify-between items-center">
                <span>Ships from</span>
                <span className="text-gray-900 font-bold">OmniFit.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sold by</span>
                <span className="text-gray-900 font-bold">{selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Returns</span>
                <span className="text-[#007185] font-bold">30-day return policy</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-[#007185] font-bold hover:underline cursor-pointer">
                <div className="p-2 bg-blue-50 rounded-full"><ShieldCheck size={18} /></div> Secure transaction
              </div>
              <div className="flex items-center gap-3 text-sm text-[#007185] font-bold hover:underline cursor-pointer">
                <div className="p-2 bg-blue-50 rounded-full"><Truck size={18} /></div> Global Logistics
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Missing renderCart function implementation
   * Displays the list of items in the user's shopping cart.
   */
  const renderCart = () => (
    <div className="max-w-[1500px] mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-100">
          <p className="text-xl text-gray-600 mb-6">Your OmniFit cart is empty.</p>
          <button 
            onClick={() => setCurrentView(ViewMode.Home)}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-8 py-3 rounded-full transition-all shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 border border-gray-100">
                <div className="w-full sm:w-40 h-48 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => handleProductClick(item)}>
                  <ProductImage src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold cursor-pointer hover:text-[#007185]" onClick={() => handleProductClick(item)}>{item.name}</h3>
                    <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-green-700 font-bold">In Stock</p>
                  <p className="text-xs text-gray-500">Color: <span className="font-bold text-gray-700">{item.selectedColor}</span> | Size: <span className="font-bold text-gray-700">{item.selectedSize}</span></p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border rounded-md px-3 py-1 bg-gray-50">
                      <span className="text-sm mr-2 text-gray-500">Qty:</span>
                      <span className="font-bold">{item.quantity}</span>
                    </div>
                    <button 
                      className="text-xs text-[#007185] hover:underline font-medium"
                      onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                    >
                      Delete
                    </button>
                    <span className="text-gray-200">|</span>
                    <button className="text-xs text-[#007185] hover:underline font-medium">Save for later</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-[350px] bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit sticky top-[100px]">
            <div className="flex items-center gap-2 text-sm text-green-700 mb-4 font-medium">
              <CheckCircle size={18} className="text-green-600" />
              <span>Your order qualifies for FREE Shipping.</span>
            </div>
            <div className="text-xl mb-6">
              Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}): <span className="font-bold">${cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
            <button className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] rounded-full font-bold shadow-md transition-all text-sm mb-3 active:scale-95">
              Proceed to Checkout
            </button>
            <div className="p-3 border rounded-lg bg-gray-50 mt-4">
               <p className="text-xs text-gray-600">Secure transaction. We encrypt your info during transmission.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout 
      cartCount={cartCount} 
      onViewCart={() => setCurrentView(ViewMode.Cart)}
      onGoHome={() => setCurrentView(ViewMode.Home)}
    >
      {currentView === ViewMode.Home && renderHome()}
      {currentView === ViewMode.ProductDetail && renderProductDetail()}
      {currentView === ViewMode.Cart && renderCart()}

      {isTryOnActive && selectedProduct && (
        <VirtualTryOn 
          product={selectedProduct} 
          onClose={() => setIsTryOnActive(false)} 
        />
      )}
    </Layout>
  );
};

export default App;
