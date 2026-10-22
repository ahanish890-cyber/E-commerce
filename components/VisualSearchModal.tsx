import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Search, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedStyleTag, setSelectedStyleTag] = useState('');

  if (!isOpen) return null;

  const sampleLooks = [
    { label: 'Navy Trench & Outerwear', color: 'Navy', style: 'Classic' },
    { label: 'Black Velvet Evening Dress', color: 'Black', style: 'Glamour' },
    { label: 'Oxford Cotton Shirt', color: 'Blue', style: 'Smart' },
    { label: 'White Heritage Sneakers', color: 'White', style: 'Sneakers' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = reader.result as string;
      setPreviewImage(img);
      performSearch('Navy', 'Classic');
    };
    reader.readAsDataURL(file);
  };

  const performSearch = async (colorTag: string, styleTag: string) => {
    setLoading(true);
    setSelectedStyleTag(`${colorTag} ${styleTag}`);
    try {
      const res = await fetch('/api/ai/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorTag, styleTag })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="bg-[#131921] text-white p-5 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#febd69] text-gray-950 rounded-lg">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">Visual Garment Search</h3>
              <p className="text-xs text-gray-300">Upload a screenshot or photo to find matching items in our catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#e77600] transition-colors bg-neutral-50 relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {previewImage ? (
              <div className="flex flex-col items-center">
                <img 
                  src={previewImage} 
                  alt="Search query" 
                  className="w-32 h-32 object-cover rounded-lg shadow-md mb-2 border border-gray-200" 
                />
                <span className="text-xs text-[#007185] font-bold">Click to choose another photo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-orange-100/60 text-[#b12704] rounded-full mb-3">
                  <Upload size={24} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Drag & drop outfit photo here</h4>
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, WEBP. We extract palette, cut, and texture.</p>
              </div>
            )}
          </div>

          {/* Sample quick tags */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Or search by trending fashion looks:</h4>
            <div className="flex flex-wrap gap-2">
              {sampleLooks.map(look => (
                <button
                  key={look.label}
                  type="button"
                  onClick={() => performSearch(look.color, look.style)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#e77600] hover:bg-orange-50 transition-all"
                >
                  {look.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              <Sparkles size={24} className="mx-auto text-[#e77600] animate-spin mb-2" />
              Scanning fashion catalog for visual matches...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="font-bold text-sm text-gray-900">
                Matching OmniFit Products ({results.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="border border-gray-200 rounded-lg p-3 hover:border-[#e77600] hover:shadow-md transition-all cursor-pointer bg-white flex flex-col"
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden bg-gray-100 mb-2">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                    <p className="text-[11px] text-gray-500">{prod.brand}</p>
                    <div className="mt-auto pt-1 flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">${prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-[#007185] font-bold flex items-center">
                        View <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
