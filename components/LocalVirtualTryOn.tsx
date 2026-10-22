import React, { useRef, useState } from 'react';
import { X, Sparkles, Download, RefreshCw, Check, AlertCircle, Upload } from 'lucide-react';
import { Product } from '../types';

interface LocalVirtualTryOnProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

type Stage = 'upload' | 'processing' | 'result';
type ProgressStage = 'uploading' | 'preparing' | 'generating' | 'loading';

export const LocalVirtualTryOn: React.FC<LocalVirtualTryOnProps> = ({ product, onClose, onAddToCart }) => {
  const personImageInputRef = useRef<HTMLInputElement>(null);
  
  const [stage, setStage] = useState<Stage>('upload');
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<ProgressStage>('uploading');
  const [progressPercent, setProgressPercent] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [apiConfigured, setApiConfigured] = useState(true);

  // Handle file selection
  const handlePersonImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Image must be smaller than 10MB');
      return;
    }

    // Read file as data URI
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setPersonImage(dataUri);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Map product category to garment category for the model
  const getGarmentCategory = (): string => {
    const subcategory = (product.subcategory || '').toLowerCase();
    if (subcategory.includes('dress')) return 'dresses';
    if (subcategory.includes('shirt') || subcategory.includes('top') || subcategory.includes('blouse')) return 'upper_body';
    if (subcategory.includes('pant') || subcategory.includes('jean') || subcategory.includes('trouser')) return 'lower_body';
    if (subcategory.includes('jacket') || subcategory.includes('coat')) return 'outer';
    return 'upper_body'; // default
  };

  // Fetch product garment image and convert to base64
  const getGarmentImageAsDataUri = async (): Promise<string> => {
    const garmentUrl = product.image;

    // If it's already a data URI, return it
    if (garmentUrl.startsWith('data:')) {
      return garmentUrl;
    }

    // If it's a relative path, make it absolute
    let absoluteUrl = garmentUrl;
    if (garmentUrl.startsWith('/')) {
      absoluteUrl = window.location.origin + garmentUrl;
    } else if (!garmentUrl.startsWith('http')) {
      absoluteUrl = window.location.origin + '/' + garmentUrl;
    }

    try {
      const response = await fetch(absoluteUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      throw new Error(`Failed to load product image: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Main try-on generation function
  const generateTryOn = async () => {
    if (!personImage) return;

    setStage('processing');
    setIsProcessing(true);
    setError('');
    setProgressPercent(0);

    try {
      // Step 1: Uploading / preparing images
      setCurrentProgress('uploading');
      setProgressPercent(10);

      let garmentImage: string;
      try {
        garmentImage = await getGarmentImageAsDataUri();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product image');
        setStage('upload');
        setIsProcessing(false);
        return;
      }

      setProgressPercent(20);

      // Step 2: Preparing garment
      setCurrentProgress('preparing');
      setProgressPercent(35);

      const garmentCategory = getGarmentCategory();

      setProgressPercent(50);

      // Step 3: Calling AI model
      setCurrentProgress('generating');
      setProgressPercent(60);

      const response = await fetch('/api/generate-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImage,
          garmentImage,
          garmentCategory
        })
      });

      setProgressPercent(80);

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 503) {
          setApiConfigured(false);
          setError('Virtual try-on is not configured. Please check server setup.');
        } else if (response.status === 401) {
          setApiConfigured(false);
          setError('Virtual try-on authentication failed. Please configure API credentials.');
        } else if (response.status === 429) {
          setError('Service is temporarily busy. Please wait a moment and try again.');
        } else if (response.status === 504) {
          setError('Request timed out. The model took too long. Please try again.');
        } else {
          setError(errorData.error || `Error (HTTP ${response.status})`);
        }

        setStage('upload');
        setIsProcessing(false);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to generate try-on');
        setStage('upload');
        setIsProcessing(false);
        return;
      }

      // Step 4: Loading result
      setCurrentProgress('loading');
      setProgressPercent(90);

      const imageToDisplay = result.resultImage || result.resultUrl;
      if (!imageToDisplay) {
        setError('No image returned from service');
        setStage('upload');
        setIsProcessing(false);
        return;
      }

      setGeneratedImage(imageToDisplay);
      setProgressPercent(100);
      await new Promise(r => setTimeout(r, 300)); // Brief pause to show 100%

      setStage('result');
    } catch (err) {
      console.error('Try-on error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download generated image
  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `virtual-tryon-${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  // Retry / upload new photo
  const tryAgain = () => {
    setPersonImage(null);
    setGeneratedImage(null);
    setStage('upload');
    setProgressPercent(0);
    setShowComparison(false);
    setError('');
  };

  if (error && stage !== 'processing') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setError('');
                setStage('upload');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Retry
            </button>
            <button 
              onClick={onClose}
              className="bg-[#febd69] text-black px-8 py-3 rounded-full font-bold hover:bg-[#f3a847] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Virtual Try-On</h1>
              <p className="text-gray-400 text-xs">AI-Powered Garment Transfer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all border border-white/20"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8 px-6 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Stage 1: Upload */}
          {stage === 'upload' && (
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Photo Upload */}
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <Upload size={24} className="text-purple-400" />
                    Step 1: Upload Your Photo
                  </h2>
                  
                  {personImage ? (
                    <div className="space-y-4">
                      <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4">
                        <img 
                          src={personImage}
                          alt="Uploaded person"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => personImageInputRef.current?.click()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={20} />
                        Choose Different Photo
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => personImageInputRef.current?.click()}
                      className="aspect-[3/4] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-dashed border-purple-400/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all p-6 text-center"
                    >
                      <Upload size={48} className="text-purple-400 mb-3" />
                      <p className="text-white font-bold text-lg mb-1">Click to Upload</p>
                      <p className="text-gray-400 text-sm">or drag and drop</p>
                      <p className="text-gray-500 text-xs mt-2">JPEG, PNG, or WebP • Max 10MB</p>
                    </div>
                  )}

                  <input
                    ref={personImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePersonImageSelect}
                    className="hidden"
                  />

                  <div className="mt-4 space-y-2">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm flex items-start gap-2">
                        <Check size={16} className="mt-0.5 flex-shrink-0" />
                        <span>Front-facing full-body photo works best. Good lighting improves results.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Preview */}
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-white text-xl font-bold mb-4">Selected Item</h2>
                  
                  <div className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden mb-4">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{product.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">${product.price}</span>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold">In Stock</span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    AI Virtual Try-On
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Real garment transfer (not an overlay)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Garment fits your body shape and pose</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Your face, pose, and background preserved</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Takes 30–90 seconds to process</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Button for Upload Stage */}
          {stage === 'upload' && personImage && (
            <div className="max-w-4xl mx-auto mt-8">
              <button
                onClick={generateTryOn}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 text-lg"
              >
                <Sparkles size={24} />
                {isProcessing ? 'Generating...' : 'Generate Virtual Try-On'}
              </button>
            </div>
          )}

          {/* Stage 2: Processing */}
          {stage === 'processing' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <div className="mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                      <Sparkles size={48} className="text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  
                  <h2 className="text-white text-2xl font-bold mb-2">Processing Your Try-On</h2>
                  <p className="text-gray-400">
                    {currentProgress === 'uploading' && 'Uploading images...'}
                    {currentProgress === 'preparing' && 'Preparing garment...'}
                    {currentProgress === 'generating' && 'Running AI model (this may take 30–90s)...'}
                    {currentProgress === 'loading' && 'Loading result...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-white font-bold mt-2">{progressPercent}%</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Method</p>
                    <p className="text-white font-bold text-sm">Real AI Transfer</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Service</p>
                    <p className="text-white font-bold text-sm">Replicate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Result */}
          {stage === 'result' && generatedImage && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-white text-3xl font-bold mb-2">Your Try-On is Ready! 🎉</h2>
                <p className="text-gray-400">See how you look in {product.name}</p>
              </div>

              {/* Result Image */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Result Preview</h3>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      {showComparison && personImage ? 'Hide' : 'Show'} Comparison
                    </button>
                  </div>

                  {showComparison && personImage ? (
                    <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden">
                      {/* Before Image */}
                      <img 
                        src={personImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* After Image with Slider */}
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img 
                          src={generatedImage}
                          alt="Generated"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Slider Control */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white pointer-events-auto cursor-ew-resize"
                          style={{ left: `${sliderPosition}%` }}
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const newX = moveEvent.clientX - rect.left;
                              const newPercent = Math.max(0, Math.min(100, (newX / rect.width) * 100));
                              setSliderPosition(newPercent);
                            };
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                            <RefreshCw size={20} className="text-gray-900" />
                          </div>
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                        Before
                      </div>
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                        After
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-black rounded-xl overflow-hidden">
                      <img 
                        src={generatedImage}
                        alt="Generated Try-On"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
                <button
                  onClick={downloadImage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
                >
                  <Download size={20} />
                  Download Image
                </button>
                
                <button
                  onClick={tryAgain}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Try Another Outfit
                </button>

                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(product);
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
