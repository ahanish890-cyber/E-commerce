import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { 
  MOCK_PRODUCTS, 
  DEFAULT_PRODUCT_IMAGE, 
  SUBCATEGORIES_BY_GENDER, 
  GENDER_TABS,
  DEPARTMENT_SIZES 
} from './constants';
import { filterAndSortCatalog } from './utils/catalogFilter';
import { formatINR } from './utils/currency';
import { 
  Product, 
  CartItem, 
  ViewMode, 
  User, 
  FilterState, 
  Review, 
  Order 
} from './types';
import { 
  Star, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Camera, 
  Heart, 
  CheckCircle, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  Info, 
  Filter, 
  ArrowUpDown,
  ShoppingBag,
  Clock,
  Send,
  X
} from 'lucide-react';

import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { FilterSidebar } from './components/FilterSidebar';
import { AuthModal } from './components/AuthModal';
import { AISizeModal } from './components/AISizeModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { AdminDashboard } from './components/AdminDashboard';

/**
 * Reusable Product Image component with error handling and reactive fallback.
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallback);
    setHasError(false);
  }, [src, fallback]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      setHasError(true);
      setCurrentSrc(fallback);
    }
  };

  return (
    <img 
      src={currentSrc} 
      alt={alt || "OmniFit Garment"} 
      className={className} 
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props} 
    />
  );
};

const App: React.FC = () => {
  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.Home);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Catalog & Filter State
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    gender: 'all',
    category: 'all',
    subcategory: 'all',
    search: '',
    sortBy: 'featured'
  });

  // User & Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Delivery Location State
  const [deliveryLocation, setDeliveryLocation] = useState<{ city: string; zipCode: string }>(() => {
    try {
      const saved = localStorage.getItem('omnifit_delivery_location');
      return saved ? JSON.parse(saved) : { city: 'Bengaluru', zipCode: '560001' };
    } catch {
      return { city: 'Bengaluru', zipCode: '560001' };
    }
  });

  const handleUpdateDeliveryLocation = (loc: { city: string; zipCode: string }) => {
    setDeliveryLocation(loc);
    localStorage.setItem('omnifit_delivery_location', JSON.stringify(loc));
    showToast(`Delivery location set to ${loc.city} ${loc.zipCode}`);
  };

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnifit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('omnifit_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnifit_saved_for_later');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected Product Detail Variants
  const [detailSelectedColor, setDetailSelectedColor] = useState<string>('');
  const [detailSelectedSize, setDetailSelectedSize] = useState<string>('');
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // Modals & Drawers
  const [isTryOnActive, setIsTryOnActive] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [isAISizeModalOpen, setIsAISizeModalOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist cart & wishlist
  useEffect(() => {
    localStorage.setItem('omnifit_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to backend when it changes (if user is logged in)
  useEffect(() => {
    localStorage.setItem('omnifit_wishlist', JSON.stringify(wishlist));
    
    if (!currentUser) return;
    
    const token = localStorage.getItem('omnifit_token');
    if (!token) return;

    const syncWishlist = async () => {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ wishlist })
        });
      } catch (err) {
        console.warn('Error syncing wishlist to backend:', err);
      }
    };

    syncWishlist();
  }, [wishlist, currentUser]);

  useEffect(() => {
    localStorage.setItem('omnifit_saved_for_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  // Load initial user session
  useEffect(() => {
    const token = localStorage.getItem('omnifit_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.wishlist && data.user.wishlist.length) {
            setWishlist(data.user.wishlist);
          }
        }
      })
      .catch(console.error);
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.subcategory !== 'all') params.append('subcategory', filters.subcategory);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Catalog API responded with HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setCatalog(data.products);
      } else {
        setCatalog(filterAndSortCatalog(MOCK_PRODUCTS, filters));
      }
    } catch (err) {
      console.error('Failed to fetch products, using fallback:', err);
      setCatalog(filterAndSortCatalog(MOCK_PRODUCTS, filters));
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Clean reset for filters
  const resetFilters = (preserveDepartment = false) => {
    setFilters({
      gender: preserveDepartment ? filters.gender : 'all',
      category: 'all',
      subcategory: 'all',
      search: '',
      sortBy: 'featured'
    });
  };

  // Fetch reviews when viewing product detail
  useEffect(() => {
    if (selectedProduct) {
      fetch(`/api/reviews/${selectedProduct.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success) setProductReviews(data.reviews || []);
        })
        .catch(console.error);
    }
  }, [selectedProduct]);

  // Derived counts
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // Navigation handlers
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailSelectedColor(product.colors[0] || 'Default');
    setDetailSelectedSize(product.sizes[0] || 'Standard');
    setDetailQuantity(1);
    setActiveGalleryImage(product.image);
    setCurrentView(ViewMode.ProductDetail);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenderSelect = (genderId: string) => {
    // Switching gender clears incompatible subcategory and sizes
    setFilters(prev => {
      const allowedSizes = DEPARTMENT_SIZES[genderId] || DEPARTMENT_SIZES['all'] || [];
      const currentSizes = prev.sizes || (prev.size ? prev.size.split(',').map(s => s.trim()) : []);
      const compatibleSizes = currentSizes.filter(s => allowedSizes.includes(s));

      return {
        ...prev,
        gender: genderId as any,
        category: 'all',
        subcategory: 'all',
        sizes: compatibleSizes,
        size: compatibleSizes.length > 0 ? compatibleSizes.join(',') : undefined
      };
    });
    setCurrentView(ViewMode.Home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubcategorySelect = (subId: string, targetGender?: string) => {
    setFilters(prev => {
      const newGender = targetGender || prev.gender;
      const allowedSizes = DEPARTMENT_SIZES[newGender] || DEPARTMENT_SIZES['all'] || [];
      const currentSizes = prev.sizes || (prev.size ? prev.size.split(',').map(s => s.trim()) : []);
      const compatibleSizes = currentSizes.filter(s => allowedSizes.includes(s));

      return {
        ...prev,
        gender: newGender as any,
        category: 'all',
        subcategory: prev.subcategory === subId && subId !== 'all' ? 'all' : subId,
        sizes: compatibleSizes,
        size: compatibleSizes.length > 0 ? compatibleSizes.join(',') : undefined
      };
    });
    setCurrentView(ViewMode.Home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string, department: string) => {
    setFilters(prev => {
      const allowedSizes = DEPARTMENT_SIZES[department] || DEPARTMENT_SIZES['all'] || [];
      const currentSizes = prev.sizes || (prev.size ? prev.size.split(',').map(s => s.trim()) : []);
      const compatibleSizes = currentSizes.filter(s => allowedSizes.includes(s));

      return {
        ...prev,
        search: query,
        gender: department as any,
        category: 'all',
        subcategory: 'all',
        sizes: compatibleSizes,
        size: compatibleSizes.length > 0 ? compatibleSizes.join(',') : undefined
      };
    });
    setCurrentView(ViewMode.Home);
  };

  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist');
      return updated;
    });
  };

  const addToCart = (product: Product, size: string, color: string, qty = 1) => {
    // Check variant stock
    const available = product.stock && product.stock[size] !== undefined ? product.stock[size] : 20;
    if (available <= 0) {
      showToast(`Size ${size} is currently out of stock`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, available);
        showToast(`Updated ${product.name} quantity to ${newQty}`);
        return prev.map(item => 
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      showToast(`Added ${product.name} (${size}) to Cart`);
      return [...prev, { ...product, quantity: Math.min(qty, available), selectedSize: size, selectedColor: color }];
    });
  };

  const handleBuyNow = (product: Product, size: string, color: string) => {
    addToCart(product, size, color, 1);
    setCurrentView(ViewMode.Checkout);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveForLater = (item: CartItem, idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
    setSavedForLater(prev => [...prev, item]);
    showToast(`Saved "${item.name}" for later`);
  };

  const handleMoveToCart = (item: CartItem, idx: number) => {
    setSavedForLater(prev => prev.filter((_, i) => i !== idx));
    addToCart(item, item.selectedSize, item.selectedColor, 1);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: newReviewRating,
          title: newReviewTitle,
          comment: newReviewComment,
          userName: currentUser ? currentUser.name : 'Verified Customer'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Thank you! Your review has been published.');
        setProductReviews(prev => [data.review, ...prev]);
        setIsWriteReviewOpen(false);
        setNewReviewTitle('');
        setNewReviewComment('');
        fetchProducts(); // Refresh average rating
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // VIEW: HOME / SHOPPING CATALOG
  // -------------------------------------------------------------
  const renderHome = () => {
    const activeSubcategories = SUBCATEGORIES_BY_GENDER[filters.gender] || SUBCATEGORIES_BY_GENDER['all'];

    return (
      <div className="max-w-[1500px] mx-auto p-4 space-y-8">
        {/* Prime Banner (Luxury editorial styling & resilient local asset) */}
        <div className="relative h-[280px] md:h-[450px] bg-gradient-to-r from-[#131921] via-[#1f2833] to-[#0f141d] rounded-2xl overflow-hidden group shadow-2xl border border-white/5">
          <ProductImage 
            src="/hero-banner.jpg" 
            alt="OmniFit Luxury Fashion Showcase" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
            fallback="/hero-banner.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131921]/90 via-[#131921]/60 to-transparent pointer-events-none" />
          <div className="relative h-full flex flex-col justify-center px-10 md:px-20 text-white max-w-3xl z-10">
            <div className="inline-block bg-[#febd69] text-black text-[10px] font-black px-2 py-1 rounded uppercase mb-4 tracking-tighter w-fit">
              OmniFit Exclusive
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              The Future of <br/>Fitting Rooms.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 font-medium">
              Stop guessing your size. Start seeing yourself in our newest arrivals using live AR try-on technology.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="bg-[#febd69] text-black font-bold px-10 py-4 rounded-full hover:bg-[#f3a847] transition-all shadow-xl active:scale-95"
              >
                Shop Now
              </button>
              <button 
                onClick={() => setIsAIAssistantOpen(true)}
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-10 py-4 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles size={18} className="text-[#febd69]" /> Consult AI Stylist
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories Horizontal Filter Bar */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 shrink-0">
            Categories:
          </span>
          {activeSubcategories.map(sub => {
            const isSelected = filters.subcategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected 
                    ? 'bg-[#131921] text-white font-bold shadow-xs' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Active Filters Chips Bar */}
        {/* Active Filter Chips */}
        {(() => {
          const hasActiveFilters = Boolean(filters.search) || (filters.subcategory && filters.subcategory !== 'all');

          if (!hasActiveFilters) return null;

          return (
            <div className="flex items-center gap-2 flex-wrap text-xs bg-orange-50/60 p-3 rounded-lg border border-orange-100">
              <span className="font-bold text-gray-700">Active Filters:</span>
              {filters.search && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-gray-300 flex items-center gap-1 font-medium">
                  Search: "{filters.search}"
                  <X size={12} className="cursor-pointer text-gray-500 hover:text-black" onClick={() => setFilters(prev => ({ ...prev, search: '' }))} />
                </span>
              )}
              {filters.subcategory && filters.subcategory !== 'all' && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-gray-300 flex items-center gap-1 font-medium capitalize">
                  Category: {filters.subcategory.replace('-', ' ')}
                  <X size={12} className="cursor-pointer text-gray-500 hover:text-black" onClick={() => setFilters(prev => ({ ...prev, subcategory: 'all' }))} />
                </span>
              )}
              <button
                onClick={() => resetFilters(true)}
                className="text-[#007185] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          );
        })()}

        {/* Main Grid: Sidebar + Product Grid */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
            onClearFilters={() => resetFilters(true)}
            totalProducts={catalog.length}
          />

          {/* Right Product Section */}
          <div className="flex-1 w-full space-y-4">
            {/* Header / Sort Row */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {filters.gender === 'all' ? 'All Fashion Arrivals' : filters.gender === 'women' ? "Women's Collection" : "Men's Collection"}
                  <span className="text-sm font-normal text-gray-500 ml-2">({catalog.length} results)</span>
                </h2>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-semibold">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="p-1.5 border border-gray-300 rounded bg-gray-50 font-medium focus:outline-none focus:border-[#e77600]"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Avg. Customer Review</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Loading / Empty / Product Cards */}
            {loadingProducts ? (
              <div className="py-24 text-center text-sm text-gray-500">
                <Clock className="mx-auto text-[#e77600] animate-spin mb-3" size={28} />
                Synchronizing live fashion catalog...
              </div>
            ) : catalog.length === 0 ? (
              /* Informative Empty State (No fallback to unrelated products) */
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-4">
                <Filter size={40} className="mx-auto text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900">No products match your active filters</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  We couldn't find items matching your criteria in this department. Try relaxing your size, color, or price range filters.
                </p>
                <button
                  onClick={() => resetFilters(true)}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {catalog.map(product => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div 
                      key={product.id} 
                      className="bg-white p-4 flex flex-col group cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-xl transition-all rounded-lg relative"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[3/4] mb-3 overflow-hidden bg-gray-100 rounded-md relative">
                        <ProductImage 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button 
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur transition-all ${
                            isWishlisted 
                              ? 'bg-red-50 text-red-600 shadow-md scale-110' 
                              : 'bg-white/80 text-gray-400 hover:text-red-500'
                          }`}
                          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>

                        {/* Gender / Category Badge */}
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                          {product.gender}
                        </span>
                      </div>

                      {/* Brand & Name */}
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{product.brand}</p>
                      <h3 className="text-xs md:text-sm font-semibold line-clamp-2 mb-1 group-hover:text-[#007185] transition-colors h-10 text-gray-900 leading-snug">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-[#f08804]">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={13} 
                              fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#007185] font-semibold">{product.reviewCount}</span>
                      </div>

                      {/* Price Section */}
                      <div className="mt-auto pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl md:text-2xl font-black text-gray-900">{formatINR(product.price)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatINR(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 mt-1 mb-2">
                          <div className="bg-[#00a8e1] w-3 h-3 rounded-xs shrink-0"></div> prime
                          <span className="truncate">FREE delivery Tomorrow</span>
                        </div>

                        {/* Virtual Try-On Badge & Action */}
                        {product.hasTryOn && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTryOnProduct(product);
                              setIsTryOnActive(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 text-[10px] font-black text-white uppercase bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-full shadow-xs transition-colors"
                          >
                            <Camera size={12} /> Try Virtually
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: PRODUCT DETAIL PAGE (Preserved Layout & Colors)
  // -------------------------------------------------------------
  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const isWishlisted = wishlist.includes(selectedProduct.id);
    const availableStock = selectedProduct.stock && selectedProduct.stock[detailSelectedSize] !== undefined
      ? selectedProduct.stock[detailSelectedSize]
      : 12;

    const imagesGallery = selectedProduct.images && selectedProduct.images.length > 0 
      ? selectedProduct.images 
      : [selectedProduct.image];

    return (
      <div className="bg-white min-h-screen">
        {/* Breadcrumb & Back Navigation */}
        <nav className="max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => {
              setCurrentView(ViewMode.Home);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors border border-gray-200 mr-2 cursor-pointer shrink-0"
            title="Return to products catalog"
          >
            <ChevronLeft size={14} /> Back to Catalog
          </button>
          <span 
            onClick={() => { resetFilters(); setCurrentView(ViewMode.Home); }} 
            className="hover:underline cursor-pointer"
          >
            Fashion
          </span>
          <ChevronRight size={12} />
          <span 
            onClick={() => handleGenderSelect(selectedProduct.gender)} 
            className="hover:underline cursor-pointer capitalize"
          >
            {selectedProduct.gender}'s {selectedProduct.category}
          </span>
          <ChevronRight size={12} />
          <span 
            onClick={() => handleSubcategorySelect(selectedProduct.subcategory, selectedProduct.gender)} 
            className="hover:underline cursor-pointer capitalize"
          >
            {selectedProduct.subcategory}
          </span>
          <ChevronRight size={12} />
          <span className="font-bold text-gray-900 truncate">{selectedProduct.name}</span>
        </nav>

        <div className="max-w-[1500px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="flex-1">
            <div className="sticky top-[100px] flex gap-4 md:gap-6">
              {/* Thumbnails */}
              <div className="flex flex-col gap-3 shrink-0">
                {imagesGallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveGalleryImage(img)}
                    className={`w-16 h-20 border-2 rounded-md cursor-pointer overflow-hidden p-1 bg-white transition-all ${
                      activeGalleryImage === img ? 'border-[#e77600] ring-1 ring-[#e77600]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <ProductImage src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Main Photo */}
              <div className="flex-1 bg-neutral-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-6 min-h-[420px]">
                <ProductImage 
                  src={activeGalleryImage || selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="max-h-[550px] object-contain transition-all duration-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Center Column: Info Section */}
          <div className="flex-[1.2] space-y-6">
            <div>
              <p 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    search: selectedProduct.brand,
                    gender: 'all',
                    category: 'all',
                    subcategory: 'all'
                  }));
                  setCurrentView(ViewMode.Home);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[#007185] font-bold text-sm hover:underline cursor-pointer tracking-tight"
                title={`View all products from ${selectedProduct.brand}`}
              >
                Visit the {selectedProduct.brand} Store
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900 leading-tight">
                {selectedProduct.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base">{selectedProduct.rating}</span>
                  <div className="flex text-[#f08804]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <span 
                  onClick={() => {
                    const el = document.getElementById('product-reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#007185] text-xs hover:underline cursor-pointer font-bold"
                  title="Scroll to customer reviews"
                >
                  {selectedProduct.reviewCount} customer ratings
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">Gender: <strong className="capitalize text-gray-800">{selectedProduct.gender}</strong></span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Price Box */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-baseline gap-2 text-red-600">
                {selectedProduct.discount && (
                  <span className="text-3xl font-light">-{selectedProduct.discount}%</span>
                )}
                <div className="flex items-baseline text-gray-900">
                  <span className="text-3xl md:text-4xl font-black">{formatINR(selectedProduct.price)}</span>
                </div>
              </div>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <p className="text-xs text-gray-500 mt-1">
                  Typical price: <span className="line-through">{formatINR(selectedProduct.originalPrice)}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-700">
                <div className="bg-[#00a8e1] w-3.5 h-3.5 rounded-xs shrink-0"></div> Prime One-Day
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                FREE Returns and FREE Delivery tomorrow if ordered within 10 hrs
              </p>
            </div>

            {/* Color Variant Selector */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">
                Color: <span className="text-gray-900">{detailSelectedColor}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.colors.map(c => {
                  const isSelected = detailSelectedColor === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDetailSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'border-[#e77600] bg-orange-50/50 text-[#b12704] shadow-xs ring-1 ring-[#e77600]' 
                          : 'border-gray-300 text-gray-800 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <CheckCircle size={12} className="text-[#e77600]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Variant Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">
                  Select Size: <span className="text-gray-900">{detailSelectedSize}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAISizeModalOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={14} /> AI Size Predictor
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map(s => {
                  const isSelected = detailSelectedSize === s;
                  const stockForSize = selectedProduct.stock ? selectedProduct.stock[s] : 10;
                  const isOutOfStock = stockForSize !== undefined && stockForSize <= 0;

                  return (
                    <button 
                      key={s}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setDetailSelectedSize(s)}
                      className={`min-w-[55px] px-4 py-2.5 border-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isOutOfStock 
                          ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through' 
                          : isSelected 
                            ? 'border-[#e77600] bg-orange-50 text-gray-950 ring-1 ring-[#e77600]' 
                            : 'border-gray-200 hover:border-gray-400 text-gray-800 bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <RotateCcw size={13} className="text-[#007185]" /> 
                True to size fit. Return eligibility: {selectedProduct.returnEligibility || '30 days'}.
              </p>
            </div>

            {/* Specifications & About Item */}
            <div className="space-y-3 pt-4 border-t border-gray-100 text-xs">
              <h4 className="font-bold text-sm text-gray-900">Product Specifications</h4>
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500">Material:</span>
                  <p className="font-bold text-gray-900">{selectedProduct.material || 'Premium Fashion Blend'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Fit:</span>
                  <p className="font-bold text-gray-900">{selectedProduct.fit || 'Regular'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Occasion:</span>
                  <p className="font-bold text-gray-900">{selectedProduct.occasion || 'Versatile'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Style:</span>
                  <p className="font-bold text-gray-900">{selectedProduct.style || 'Contemporary'}</p>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="font-bold text-xs text-gray-900 mb-2">About this item</h5>
                <ul className="list-disc list-outside text-gray-700 space-y-1.5 ml-4">
                  <li><span className="font-bold">Tailoring:</span> Ethically produced with precision sewing and reinforced seams.</li>
                  <li><span className="font-bold">AR Support:</span> Calibrated for OmniFit Virtual Try-On body alignment.</li>
                  <li>{selectedProduct.description}</li>
                </ul>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div id="product-reviews-section" className="pt-6 border-t border-gray-100 space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-gray-900">Customer Reviews</h4>
                  <p className="text-xs text-gray-500">{productReviews.length} verified reviews</p>
                </div>
                <button
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  Write a Customer Review
                </button>
              </div>

              {productReviews.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No reviews written yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-3">
                  {productReviews.map(rev => (
                    <div key={rev.id} className="p-3 bg-neutral-50 rounded-xl border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{rev.userName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#f08804]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                        <span className="font-bold text-gray-800 ml-1">{rev.title}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Sticky Card */}
          <div className="w-full lg:w-[350px] border border-gray-200 rounded-2xl p-6 space-y-5 h-fit sticky top-[100px] bg-white shadow-xl">
            <div className="flex items-baseline gap-1 text-gray-900">
              <span className="text-3xl font-black">{formatINR(selectedProduct.price)}</span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[#007185] font-bold">FREE Returns</p>
              <p className="text-[#007185] font-bold">FREE delivery Tomorrow</p>
              <p className={`text-sm font-bold ${availableStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {availableStock > 5 
                  ? 'In Stock' 
                  : availableStock > 0 
                    ? `Only ${availableStock} left in stock - order soon` 
                    : 'Currently Out of Stock'}
              </p>
            </div>

            {/* Quantity Selector */}
            {availableStock > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit bg-gray-50">
                  <button 
                    type="button"
                    onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                    className="p-2 hover:bg-gray-200 text-gray-700 rounded-l"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-xs font-bold">{detailQuantity}</span>
                  <button 
                    type="button"
                    onClick={() => setDetailQuantity(Math.min(availableStock, detailQuantity + 1))}
                    className="p-2 hover:bg-gray-200 text-gray-700 rounded-r"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {selectedProduct.hasTryOn && (
                <button 
                  onClick={() => {
                    setTryOnProduct(selectedProduct);
                    setIsTryOnActive(true);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 group shadow-purple-500/20"
                >
                  <Camera size={16} className="group-hover:rotate-12 transition-transform" /> 
                  AI Virtual Try-On
                </button>
              )}

              <button 
                disabled={availableStock <= 0}
                onClick={() => addToCart(selectedProduct, detailSelectedSize, detailSelectedColor, detailQuantity)}
                className="w-full py-3.5 bg-[#ffd814] rounded-full font-bold hover:bg-[#f7ca00] shadow-md transition-all active:scale-95 text-gray-950 text-sm disabled:opacity-50"
              >
                Add to Cart
              </button>

              <button 
                disabled={availableStock <= 0}
                onClick={() => handleBuyNow(selectedProduct, detailSelectedSize, detailSelectedColor)}
                className="w-full py-3.5 bg-[#ffa41c] rounded-full font-bold hover:bg-[#fa8900] shadow-md transition-all active:scale-95 text-gray-950 text-sm disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                className={`w-full py-2.5 border rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isWishlisted 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Merchant Details */}
            <div className="text-[11px] space-y-2 text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Ships from</span>
                <span className="text-gray-900 font-bold">OmniFit Seattle Hub</span>
              </div>
              <div className="flex justify-between">
                <span>Sold by</span>
                <span className="text-gray-900 font-bold">{selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between">
                <span>Returns</span>
                <span className="text-[#007185] font-bold">30-day return policy</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-[#007185] font-bold">
                <ShieldCheck size={16} /> Secure Transaction Encryption
              </div>
              <div className="flex items-center gap-2 text-xs text-[#007185] font-bold">
                <Truck size={16} /> Global OmniFit Logistics
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        <div className="max-w-[1500px] mx-auto p-4 md:p-8 pt-6 border-t border-gray-200 mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Customers Also Shopped in {selectedProduct.subcategory ? selectedProduct.subcategory.toUpperCase() : 'Fashion'}
              </h3>
              <p className="text-xs text-gray-500">Related garments from our verified fashion collection</p>
            </div>
            <button
              onClick={() => handleSubcategorySelect(selectedProduct.subcategory, selectedProduct.gender)}
              className="text-xs text-[#007185] hover:underline font-bold"
            >
              See all matching items →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(catalog.length > 0 ? catalog : MOCK_PRODUCTS)
              .filter(p => p.id !== selectedProduct.id && (p.subcategory === selectedProduct.subcategory || p.gender === selectedProduct.gender))
              .slice(0, 6)
              .map(relProduct => (
                <div
                  key={relProduct.id}
                  onClick={() => handleProductClick(relProduct)}
                  className="bg-white p-3 rounded-xl border border-gray-200 hover:border-[#e77600] hover:shadow-md transition-all cursor-pointer flex flex-col group"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <ProductImage src={relProduct.image} alt={relProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-[#007185] transition-colors">{relProduct.name}</h4>
                  <p className="text-[11px] text-gray-400 uppercase font-bold">{relProduct.brand}</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">{formatINR(relProduct.price)}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Write Review Modal */}
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-base">Write a Customer Review</h3>
                <button onClick={() => setIsWriteReviewOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Overall Rating</label>
                  <div className="flex gap-2 text-[#f08804]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star size={20} fill={star <= newReviewRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="e.g. Great fit and premium fabric!"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Review Comments</label>
                  <textarea
                    rows={4}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="What did you like or dislike? How was the fit and comfort?"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#ffd814] font-bold rounded text-sm hover:bg-[#f7ca00]"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: CART PAGE
  // -------------------------------------------------------------
  const renderCart = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const qualifyingThreshold = 999;
    const qualifiedForFreeShipping = subtotal >= qualifyingThreshold;

    return (
      <div className="max-w-[1500px] mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-200 space-y-4">
            <ShoppingBag size={48} className="mx-auto text-gray-300" />
            <p className="text-xl font-bold text-gray-700">Your OmniFit cart is empty.</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Your shopping cart lives to serve. Give it purpose — fill it with shirts, kurtas, jackets, and stylish Indian & western apparel!
            </p>
            <button 
              onClick={() => setCurrentView(ViewMode.Home)}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-8 py-3 rounded-full transition-all shadow-md text-xs"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cart.map((item, idx) => (
                <div 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} 
                  className="bg-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row gap-6 border border-gray-200"
                >
                  <div 
                    className="w-full sm:w-36 h-44 bg-gray-100 rounded-lg overflow-hidden shrink-0 cursor-pointer" 
                    onClick={() => handleProductClick(item)}
                  >
                    <ProductImage src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        className="text-lg font-bold cursor-pointer hover:text-[#007185] text-gray-900 leading-snug" 
                        onClick={() => handleProductClick(item)}
                      >
                        {item.name}
                      </h3>
                      <span className="text-xl font-bold text-gray-900">{formatINR(item.price * item.quantity)}</span>
                    </div>

                    <p className="text-xs text-gray-500">Brand: <strong className="text-gray-700">{item.brand}</strong></p>
                    <p className="text-xs text-green-700 font-bold">In Stock</p>
                    <p className="text-xs text-gray-500">
                      Color: <strong className="text-gray-800">{item.selectedColor}</strong> | Size: <strong className="text-gray-800">{item.selectedSize}</strong>
                    </p>

                    <div className="flex items-center gap-4 pt-4 text-xs">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-gray-300 rounded-md bg-gray-50">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity - 1 } : it));
                            } else {
                              setCart(prev => prev.filter((_, i) => i !== idx));
                            }
                          }}
                          className="px-2.5 py-1 hover:bg-gray-200 text-gray-700 rounded-l"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                          }}
                          className="px-2.5 py-1 hover:bg-gray-200 text-gray-700 rounded-r"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button 
                        className="text-[#007185] hover:underline font-semibold"
                        onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                      >
                        Delete
                      </button>

                      <span className="text-gray-300">|</span>

                      <button 
                        className="text-[#007185] hover:underline font-semibold"
                        onClick={() => handleSaveForLater(item, idx)}
                      >
                        Save for later
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Saved For Later Section */}
              {savedForLater.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6 space-y-4">
                  <h3 className="font-bold text-base text-gray-900">Saved for later ({savedForLater.length} items)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedForLater.map((savedItem, sIdx) => (
                      <div key={sIdx} className="p-3 border rounded-lg flex gap-3 text-xs group hover:border-gray-300 transition-colors">
                        <img 
                          src={savedItem.image} 
                          alt={savedItem.name} 
                          className="w-16 h-20 object-cover rounded bg-gray-50 cursor-pointer group-hover:scale-105 transition-transform" 
                          onClick={() => handleProductClick(savedItem)}
                          title="View product details"
                        />
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-bold text-gray-900 truncate cursor-pointer hover:text-[#007185] transition-colors"
                            onClick={() => handleProductClick(savedItem)}
                            title="View product details"
                          >
                            {savedItem.name}
                          </p>
                          <p className="font-bold text-gray-900 mt-1">{formatINR(savedItem.price)}</p>
                          <button
                            onClick={() => handleMoveToCart(savedItem, sIdx)}
                            className="mt-2 text-xs text-[#007185] font-bold hover:underline cursor-pointer"
                          >
                            Move to cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subtotal & Checkout Card */}
            <div className="w-full lg:w-[350px] bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-[100px] space-y-5">
              <div className="flex items-center gap-2 text-xs text-green-700 font-medium pb-2 border-b border-gray-100">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <span>
                  {qualifiedForFreeShipping 
                    ? "Your order qualifies for FREE Express Delivery across India." 
                    : `Add ${formatINR(qualifyingThreshold - subtotal)} more for FREE Delivery.`}
                </span>
              </div>

              <div className="text-lg text-gray-900">
                Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):{' '}
                <span className="font-black text-2xl text-gray-950">{formatINR(subtotal)}</span>
              </div>

              <button 
                onClick={() => setCurrentView(ViewMode.Checkout)}
                className="w-full py-3.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-black rounded-full shadow-md transition-all text-sm active:scale-98"
              >
                Proceed to Checkout
              </button>

              <div className="p-3 border border-gray-200 rounded-lg bg-neutral-50 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-gray-700">OmniFit Buyer Protection</p>
                <p>30-day money-back guarantee with free prepaid return pickup on all qualified items.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: WISHLIST VIEW
  // -------------------------------------------------------------
  const renderWishlist = () => {
    const wishlistedProducts = catalog.filter(p => wishlist.includes(p.id));

    return (
      <div className="max-w-[1500px] mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Saved Wishlist</h1>
            <p className="text-xs text-gray-500 mt-1">{wishlistedProducts.length} items saved for future shopping</p>
          </div>
          <button
            onClick={() => setCurrentView(ViewMode.Home)}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-5 py-2.5 rounded-full text-xs"
          >
            Continue Shopping
          </button>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center border border-gray-200 space-y-3">
            <Heart size={40} className="mx-auto text-gray-300" />
            <h3 className="font-bold text-lg text-gray-700">Your Wishlist is Empty</h3>
            <p className="text-xs text-gray-500">Click the heart icon on any product to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {wishlistedProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col">
                <div 
                  className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 cursor-pointer"
                  onClick={() => handleProductClick(p)}
                >
                  <ProductImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-xs line-clamp-1">{p.name}</h4>
                <p className="font-black text-sm text-gray-900 mt-1">{formatINR(p.price)}</p>
                <div className="mt-auto pt-3 space-y-1.5">
                  <button
                    onClick={() => {
                      addToCart(p, p.sizes[0], p.colors[0], 1);
                      toggleWishlist(p.id);
                    }}
                    className="w-full py-1.5 bg-[#ffd814] text-gray-950 font-bold rounded text-xs hover:bg-[#f7ca00]"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="w-full py-1 text-gray-400 hover:text-red-600 text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout 
      cartCount={cartCount} 
      currentUser={currentUser}
      activeGender={filters.gender}
      deliveryLocation={deliveryLocation}
      onUpdateDeliveryLocation={handleUpdateDeliveryLocation}
      onSelectGender={handleGenderSelect}
      onSelectSubcategory={handleSubcategorySelect}
      onViewCart={() => {
        setCurrentView(ViewMode.Cart);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onGoHome={() => {
        resetFilters();
        setCurrentView(ViewMode.Home);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onViewOrders={() => {
        setCurrentView(ViewMode.Orders);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onViewWishlist={() => {
        setCurrentView(ViewMode.Wishlist);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onViewAdmin={() => {
        setCurrentView(ViewMode.Admin);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      onSignOut={() => {
        localStorage.removeItem('omnifit_token');
        setCurrentUser(null);
        showToast('Signed out of OmniFit');
      }}
      onSearch={handleSearch}
      onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131921] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-[#febd69] text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle size={16} className="text-[#febd69]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      {currentView === ViewMode.Home && renderHome()}
      {currentView === ViewMode.ProductDetail && renderProductDetail()}
      {currentView === ViewMode.Cart && renderCart()}
      {currentView === ViewMode.Wishlist && renderWishlist()}

      {currentView === ViewMode.Checkout && (
        <CheckoutView
          cart={cart}
          currentUser={currentUser}
          onOrderSuccess={(order) => {
            setCart([]);
            showToast(`Order ${order.id} placed successfully!`);
            setCurrentView(ViewMode.Orders);
          }}
          onCancel={() => setCurrentView(ViewMode.Cart)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {currentView === ViewMode.Orders && (
        <OrdersView
          onContinueShopping={() => {
            setCurrentView(ViewMode.Home);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectProductById={async (id) => {
            let p = catalog.find(item => item.id === id) || MOCK_PRODUCTS.find(item => item.id === id);
            if (!p) {
              try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.success && data.product) p = data.product;
              } catch {}
            }
            if (p) {
              handleProductClick(p);
            } else {
              showToast('Product details could not be found');
            }
          }}
        />
      )}

      {currentView === ViewMode.Admin && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setCurrentView(ViewMode.Home)}
          onRefreshCatalog={fetchProducts}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSelectProduct={(p) => handleProductClick(p)}
        />
      )}

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user, token) => {
            localStorage.setItem('omnifit_token', token);
            setCurrentUser(user);
            showToast(`Welcome, ${user.name}!`);
          }}
        />
      )}

      {isTryOnActive && tryOnProduct && (
        <VirtualTryOnModal 
          product={tryOnProduct} 
          onClose={() => setIsTryOnActive(false)}
          onAddToCart={(p) => addToCart(p, p.sizes[0], p.colors[0], 1)}
          onProductChange={(p) => setTryOnProduct(p)}
        />
      )}

      {isAISizeModalOpen && selectedProduct && (
        <AISizeModal
          product={selectedProduct}
          isOpen={isAISizeModalOpen}
          onClose={() => setIsAISizeModalOpen(false)}
          onSelectSize={(size) => {
            setDetailSelectedSize(size);
            showToast(`Selected recommended size: ${size}`);
          }}
        />
      )}

      {isVisualSearchOpen && (
        <VisualSearchModal
          isOpen={isVisualSearchOpen}
          onClose={() => setIsVisualSearchOpen(false)}
          onSelectProduct={(p) => handleProductClick(p)}
        />
      )}

      {isAIAssistantOpen && (
        <AIAssistantDrawer
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          activeGender={filters.gender}
          onSelectProduct={(p) => handleProductClick(p)}
          onAddToCart={(p) => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Standard', 1)}
        />
      )}
    </Layout>
  );
};

export default App;
