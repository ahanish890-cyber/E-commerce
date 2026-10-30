import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  RefreshCw, 
  ArrowLeft, 
  Download, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  SlidersHorizontal,
  Check,
  UserCheck
} from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { 
  TryOnProduct, 
  tryOnProducts, 
  getTryOnConfigForProduct, 
  getAllSupportedTryOnProducts 
} from '../utils/tryOnConfig';

export interface VirtualTryOnModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onProductChange?: (product: Product) => void;
}

type Stage = 'upload' | 'processing' | 'result';

const PROCESSING_STEPS = [
  'Analyzing your photo...',
  'Identifying garment details...',
  'Preparing your virtual look...',
  'Finalizing preview...'
];

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  product: initialProduct,
  onClose,
  onAddToCart,
  onProductChange
}) => {
  // Current active product
  const [activeProduct, setActiveProduct] = useState<Product>(initialProduct);
  
  // TryOn scenario config (if supported)
  const currentConfig = getTryOnConfigForProduct(activeProduct);
  const isSupported = !!currentConfig?.supported;

  // Modal Stage
  const [stage, setStage] = useState<Stage>('upload');
  
  // Photo states
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [isDemoPhoto, setIsDemoPhoto] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  // Result view states
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);

  // File input ref & timers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const objectUrlRef = useRef<string | null>(null);

  // Cleanup object URLs and timers
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      cleanupObjectUrl();
    };
  }, []);

  // Sync if initialProduct prop changes from outside
  useEffect(() => {
    setActiveProduct(initialProduct);
    // Reset preview if switching product
    if (stage === 'result') {
      setStage('upload');
    }
  }, [initialProduct]);

  // Automatically load the appropriate demo photo when user chooses or when scenario changes in demo mode
  const loadDemoPhotoForProduct = (prod: Product) => {
    cleanupObjectUrl();
    const cfg = getTryOnConfigForProduct(prod);
    if (cfg?.demoPhoto) {
      setPersonImage(cfg.demoPhoto);
      setIsDemoPhoto(true);
      setErrorMessage('');
    }
  };

  // Switch between supported demo garments
  const handleSelectOutfit = (scenarioKey: 'redCheckeredShirt' | 'rustBlouse') => {
    clearAllTimers();
    setIsProcessing(false);
    setStage('upload');
    setErrorMessage('');
    setIsAddedToCart(false);

    const cfg = tryOnProducts[scenarioKey];
    if (!cfg) return;

    // Create / derive a Product-compatible object
    const newProduct: Product = {
      id: cfg.catalogId,
      name: cfg.name,
      brand: cfg.brand,
      gender: cfg.gender,
      category: 'clothing',
      subcategory: cfg.gender === 'men' ? 'casual_shirts' : 'tops',
      price: cfg.price,
      image: cfg.productImage,
      description: cfg.description,
      colors: cfg.gender === 'men' ? ['Red', 'Black'] : ['Rust', 'Cream'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.8,
      reviewCount: 42,
      hasTryOn: true
    };

    setActiveProduct(newProduct);
    if (onProductChange) {
      onProductChange(newProduct);
    }

    // If demo photo was active, update to the matching model photo
    if (isDemoPhoto) {
      setPersonImage(cfg.demoPhoto);
    }
  };

  // Handle local file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type: accept image/png, image/jpeg, image/jpg
    const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validMimeTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      setErrorMessage('Unsupported file format. Please upload a PNG, JPG, or JPEG image.');
      if (event.target) event.target.value = '';
      return;
    }

    // Validate file size: 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage('File size exceeds the 10 MB limit. Please select a smaller photo.');
      if (event.target) event.target.value = '';
      return;
    }

    // Success: revoke previous and set new preview URL
    cleanupObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setPersonImage(objectUrl);
    setIsDemoPhoto(false);
    setErrorMessage('');

    // Reset input value so re-uploading the same file works
    if (event.target) event.target.value = '';
  };

  const handleRemovePhoto = () => {
    cleanupObjectUrl();
    setPersonImage(null);
    setIsDemoPhoto(false);
    setErrorMessage('');
  };

  // Start simulated Virtual Try-On workflow
  const handleGenerateTryOn = () => {
    if (!personImage || !isSupported || isProcessing) return;

    clearAllTimers();
    setIsProcessing(true);
    setStage('processing');
    setCurrentStepIndex(0);
    setProgressPercent(15);
    setErrorMessage('');

    // Step 1: Analyzing (0ms - 750ms)
    const t1 = window.setTimeout(() => {
      setCurrentStepIndex(1); // "Identifying garment details..."
      setProgressPercent(45);
    }, 750);

    // Step 2: Preparing look (750ms - 1500ms)
    const t2 = window.setTimeout(() => {
      setCurrentStepIndex(2); // "Preparing your virtual look..."
      setProgressPercent(75);
    }, 1500);

    // Step 3: Finalizing preview (1500ms - 2250ms)
    const t3 = window.setTimeout(() => {
      setCurrentStepIndex(3); // "Finalizing preview..."
      setProgressPercent(95);
    }, 2250);

    // Step 4: Complete and show result (3000ms)
    const t4 = window.setTimeout(() => {
      setProgressPercent(100);
      setIsProcessing(false);
      setStage('result');
    }, 3000);

    timersRef.current = [t1, t2, t3, t4];
  };

  // Determine the result image based on current configuration
  const resultImageSrc = currentConfig?.resultImage || '';

  // Download result image
  const handleDownload = () => {
    if (!resultImageSrc) return;
    const link = document.createElement('a');
    link.href = resultImageSrc;
    link.download = `tryon-${activeProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add to cart action
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(activeProduct);
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden text-white font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-xl shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/25 shrink-0">
              <Sparkles size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">Virtual Try-On</h1>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider">
                  AI Demo
                </span>
              </div>
              <p className="text-zinc-400 text-xs">AI-Powered Garment Transfer</p>
            </div>
          </div>

          {/* Outfit Switcher Tabs in Header for Convenient Faculty / Demo Testing */}
          <div className="hidden md:flex items-center bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
            <button
              onClick={() => handleSelectOutfit('redCheckeredShirt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeProduct.id === 'm-shirt-1' || activeProduct.id === 'redCheckeredShirt'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>👔</span> Men's Checkered Shirt
            </button>
            <button
              onClick={() => handleSelectOutfit('rustBlouse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeProduct.id === 'w-top-3' || activeProduct.id === 'rustBlouse'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>👚</span> Women's Peplum Blouse
            </button>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="bg-zinc-800/80 hover:bg-zinc-700 p-2.5 rounded-full text-zinc-300 hover:text-white transition-colors border border-zinc-700/60 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Modal Body */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
        {/* Mobile Outfit Switcher */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-4 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => handleSelectOutfit('redCheckeredShirt')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeProduct.id === 'm-shirt-1' || activeProduct.id === 'redCheckeredShirt'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400'
            }`}
          >
            Men's Shirt
          </button>
          <button
            onClick={() => handleSelectOutfit('rustBlouse')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeProduct.id === 'w-top-3' || activeProduct.id === 'rustBlouse'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400'
            }`}
          >
            Women's Blouse
          </button>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm animate-fadeIn">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <p className="flex-1 font-medium">{errorMessage}</p>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-red-200 text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 1: UPLOAD & GARMENT REVIEW                                    */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'upload' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              
              {/* LEFT PANEL: Step 1: Upload Your Photo */}
              <section className="bg-zinc-900/90 rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                      <Upload size={20} />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Step 1: Upload Your Photo</h2>
                      <p className="text-zinc-400 text-xs">Upload your picture or select our studio model</p>
                    </div>
                  </div>

                  {/* "Use Demo Photo" Button */}
                  <button
                    onClick={() => loadDemoPhotoForProduct(activeProduct)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 text-xs font-semibold px-3 py-2 rounded-xl border border-purple-500/40 transition-all active:scale-95 shadow-sm"
                  >
                    <UserCheck size={14} className="text-purple-400" />
                    Use Demo Photo
                  </button>
                </div>

                {/* Photo Upload / Preview Container */}
                <div className="relative aspect-[3/4] max-h-[460px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center group">
                  {personImage ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                      <img 
                        src={personImage} 
                        alt="User Input Photo" 
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Demo photo indicator pill */}
                      {isDemoPhoto && (
                        <div className="absolute top-3 left-3 bg-zinc-900/90 border border-purple-500/40 backdrop-blur-md px-3 py-1 rounded-full text-purple-300 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <Sparkles size={12} className="text-purple-400" />
                          Demo Model Loaded
                        </div>
                      )}

                      {/* Floating actions over image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-3 rounded-lg border border-zinc-700/80 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          <Upload size={14} />
                          Replace Photo
                        </button>
                        <button
                          onClick={handleRemovePhoto}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2.5 rounded-lg border border-red-500/30 backdrop-blur-md transition-all shadow-lg"
                          title="Remove Photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty Upload Dropzone */
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all border-2 border-dashed border-zinc-800 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Upload size={30} className="text-purple-400" />
                      </div>
                      <p className="text-white font-bold text-base mb-1">Click to Upload Photo</p>
                      <p className="text-zinc-400 text-xs mb-3">or drag and drop here</p>
                      <div className="inline-block bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-[11px] text-zinc-400">
                        PNG, JPG, or JPEG • Max 10 MB
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-800/80 w-full max-w-xs">
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          No photo ready? Click <span className="text-purple-400 font-semibold">"Use Demo Photo"</span> above to try with our studio models.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hidden Native File Input */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png,image/jpeg,image/jpg" 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                </div>

                {/* Helpful Guidelines */}
                <div className="mt-4 bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex items-start gap-2.5 text-zinc-400 text-xs leading-relaxed">
                  <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    A clear, full-body or half-body portrait with good lighting and neutral clothing produces the most authentic garment transfer.
                  </span>
                </div>
              </section>

              {/* RIGHT PANEL: Selected Item */}
              <section className="bg-zinc-900/90 rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">Selected Item</h2>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      In Stock
                    </span>
                  </div>

                  {/* Garment Image Preview */}
                  <div className="relative aspect-[3/4] max-h-[300px] w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 mb-4 flex items-center justify-center p-3">
                    <img 
                      src={currentConfig?.productImage || activeProduct.image} 
                      alt={activeProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Garment Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-bold text-base sm:text-lg leading-tight">
                          {currentConfig?.name || activeProduct.name}
                        </h3>
                        <p className="text-zinc-400 text-xs mt-0.5">
                          {currentConfig?.brand || activeProduct.brand} • OmniFit Verified
                        </p>
                      </div>
                      <span className="text-xl font-bold text-white shrink-0">
                        {formatINR(currentConfig?.price || activeProduct.price)}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {currentConfig?.description || activeProduct.description}
                    </p>
                  </div>

                  {/* Garment Specifications */}
                  {currentConfig?.details && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-800/80 text-center">
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 block uppercase">Fit</span>
                        <span className="text-xs font-semibold text-zinc-300">{currentConfig.details.fit}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 block uppercase">Material</span>
                        <span className="text-xs font-semibold text-zinc-300 truncate block">{currentConfig.details.material}</span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 block uppercase">Pattern</span>
                        <span className="text-xs font-semibold text-zinc-300">{currentConfig.details.pattern}</span>
                      </div>
                    </div>
                  )}

                  {/* Unsupported Product Notice (if opened from any catalog item not in demo) */}
                  {!isSupported && (
                    <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle size={15} />
                        <span>Featured Demo Garment Notice</span>
                      </div>
                      <p className="text-amber-200/90 leading-relaxed">
                        The prototype currently supports our 2 calibrated showcase garments with instant studio results. Please select a supported garment to preview:
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSelectOutfit('redCheckeredShirt')}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors border border-amber-500/30"
                        >
                          Men's Checkered Shirt
                        </button>
                        <button
                          onClick={() => handleSelectOutfit('rustBlouse')}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors border border-amber-500/30"
                        >
                          Women's Peplum Blouse
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-6 border-t border-zinc-800/80 mt-6">
                  <button
                    onClick={handleGenerateTryOn}
                    disabled={!personImage || !isSupported || isProcessing}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                      !personImage || !isSupported || isProcessing
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/40'
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    <Sparkles size={20} className={personImage && isSupported ? 'animate-bounce' : ''} />
                    Generate Virtual Try-On
                  </button>

                  {/* Subtext when button is disabled */}
                  {!personImage && (
                    <p className="text-center text-zinc-500 text-xs mt-2.5">
                      Upload a photo or click <span className="text-purple-400 font-semibold cursor-pointer" onClick={() => loadDemoPhotoForProduct(activeProduct)}>Use Demo Photo</span> to activate try-on
                    </p>
                  )}
                </div>
              </section>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 2: PROCESSING (2-4 SECOND SIMULATION WITH STATUS SEQUENCE)   */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'processing' && (
          <div className="max-w-2xl mx-auto py-8 sm:py-12">
            <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-8 sm:p-10 border border-zinc-800 shadow-2xl text-center space-y-8">
              
              {/* Animated AI Rings */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Rotating gradient outer ring */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" 
                  style={{ animationDuration: '2s' }}
                />
                {/* Pulsing glow ring */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-purple-600/20 to-pink-600/20 animate-pulse border border-purple-500/30" />
                {/* Center icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
                  <Sparkles size={36} className="text-purple-400 animate-pulse" />
                </div>
              </div>

              {/* Status Header and Dynamic Sequential Messages */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Simulating AI Garment Transfer
                </h2>
                
                {/* Current Status Message from required 4-step sequence */}
                <div className="h-8 flex items-center justify-center">
                  <p className="text-purple-300 font-semibold text-base transition-all duration-300 transform scale-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                    {PROCESSING_STEPS[currentStepIndex]}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 max-w-md mx-auto">
                <div className="w-full bg-zinc-950 rounded-full h-3 p-0.5 border border-zinc-800 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm shadow-purple-500/50"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-400 px-1 font-mono">
                  <span>Step {currentStepIndex + 1} of 4</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 gap-3 text-left pt-2 border-t border-zinc-800/80">
                <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Target Garment</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block mt-0.5">
                    {currentConfig?.name || activeProduct.name}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Input Photo</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block mt-0.5">
                    {isDemoPhoto ? 'Studio Model (Neutral White Tee)' : 'Custom User Upload'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STAGE 3: RESULT VIEW (HIGH FIDELITY PRE-GENERATED RESULT)          */}
        {/* ------------------------------------------------------------------ */}
        {stage === 'result' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header & Subtitle */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Sparkles size={14} className="text-purple-400" />
                Virtual Try-On Preview
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentConfig?.name || activeProduct.name}
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Tailored preview based on selected garment specs and studio lighting.
              </p>
            </div>

            {/* Custom Photo Disclaimer Note (Section 5 requirement) */}
            {!isDemoPhoto && (
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3 text-blue-200 text-xs">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-blue-300">Sample Demonstration Preview:</strong> Displaying calibrated studio garment transfer for {activeProduct.name}. In this prototype demo, custom photos run through the full interaction journey while previewing sample model transfer results.
                </p>
              </div>
            )}

            {/* Main Result Display Box */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-2xl space-y-4">
              
              {/* Toggle Comparison View */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Result Showcase
                </span>
                {personImage && (
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20"
                  >
                    <SlidersHorizontal size={14} />
                    {showComparison ? 'View Single Result' : 'Interactive Before / After'}
                  </button>
                )}
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-[3/4] max-h-[520px] w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                {showComparison && personImage ? (
                  /* Interactive Before/After Split Slider */
                  <div className="relative w-full h-full select-none overflow-hidden flex items-center justify-center">
                    {/* Before Image (Background) */}
                    <img 
                      src={personImage} 
                      alt="Before" 
                      className="absolute inset-0 w-full h-full object-contain"
                    />

                    {/* After Image (Clipped) */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img 
                        src={resultImageSrc} 
                        alt="After (Virtual Try-On)" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Draggable Divider Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-zinc-900 shadow-xl flex items-center justify-center pointer-events-auto">
                        <SlidersHorizontal size={16} />
                      </div>
                    </div>

                    {/* Slider overlay input for full touch/mouse responsiveness */}
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-300 border border-zinc-700/60 z-10 pointer-events-none">
                      Before (Input)
                    </div>
                    <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-300 border border-purple-500/40 z-10 pointer-events-none">
                      After (Virtual Try-On)
                    </div>
                  </div>
                ) : (
                  /* Standard Result View - Full Model Without Cropping */
                  <div className="relative w-full h-full flex items-center justify-center p-2 bg-zinc-950">
                    <img 
                      src={resultImageSrc} 
                      alt={`Virtual Try-On for ${activeProduct.name}`} 
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />

                    {/* Corner Badge */}
                    <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 shadow-lg">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span>{currentConfig?.details?.fit || 'Tailored Look'}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons Row (Section 3 Step 5 & Section 12 criteria) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Try Another Outfit */}
              <button
                onClick={() => {
                  const otherKey = (activeProduct.id === 'm-shirt-1' || activeProduct.id === 'redCheckeredShirt')
                    ? 'rustBlouse'
                    : 'redCheckeredShirt';
                  handleSelectOutfit(otherKey);
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw size={16} />
                Try Another Outfit
              </button>

              {/* 2. Back to Upload */}
              <button
                onClick={() => setStage('upload')}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ArrowLeft size={16} />
                Back to Upload
              </button>

              {/* 3. Download Image */}
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={16} />
                Download Result
              </button>

              {/* 4. Add to Cart / Close */}
              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-95"
              >
                {isAddedToCart ? (
                  <>
                    <Check size={16} className="text-white" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Cart • {formatINR(activeProduct.price)}
                  </>
                )}
              </button>
            </div>

            {/* Bottom Close Button */}
            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold py-2 px-4 transition-colors"
              >
                Close Virtual Try-On
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

