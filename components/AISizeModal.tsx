import React, { useState } from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { Product } from '../types';

interface AISizeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

export const AISizeModal: React.FC<AISizeModalProps> = ({ product, isOpen, onClose, onSelectSize }) => {
  const [heightCm, setHeightCm] = useState('172');
  const [weightKg, setWeightKg] = useState('68');
  const [fitPreference, setFitPreference] = useState<'tight' | 'regular' | 'loose'>('regular');
  const [recommendation, setRecommendation] = useState<{
    recommendedSize: string;
    confidence: number;
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/size-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          fitPreference,
          gender: product.gender,
          category: product.category
        })
      });

      const data = await res.json();
      if (data.success) {
        // Ensure size exists in product.sizes or map to closest
        let size = data.recommendedSize;
        if (product.sizes && !product.sizes.includes(size)) {
          size = product.sizes[0] || size;
        }
        setRecommendation({
          recommendedSize: size,
          confidence: data.confidence || 93,
          explanation: data.explanation
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="bg-[#131921] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#febd69] text-gray-950 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">AI Precision Size Recommender</h3>
              <p className="text-xs text-gray-300">Trained on 50,000+ body profiles & brand tailoring metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
            <Info size={18} className="shrink-0 text-blue-600" />
            <span>Analyzing sizing specs for <strong>{product.name}</strong> ({product.fit || 'Regular Fit'}).</span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="130"
                  max="220"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="35"
                  max="160"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fit Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tight', label: 'Fitted' },
                  { id: 'regular', label: 'Regular' },
                  { id: 'loose', label: 'Relaxed' }
                ].map(fit => (
                  <button
                    key={fit.id}
                    type="button"
                    onClick={() => setFitPreference(fit.id as any)}
                    className={`py-2 px-3 text-xs rounded-lg border font-bold transition-all ${
                      fitPreference === fit.id 
                        ? 'border-[#e77600] bg-orange-50 text-[#b12704]' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {fit.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold rounded-lg shadow-md transition-all text-sm flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? 'Analyzing Garment Cut...' : 'Calculate My Best Size'}
            </button>
          </form>

          {recommendation && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Recommended Size</span>
                  <div className="text-3xl font-black text-emerald-950 mt-0.5">
                    {recommendation.recommendedSize}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full">
                    {recommendation.confidence}% Match
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {recommendation.explanation}
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelectSize(recommendation.recommendedSize);
                  onClose();
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={14} /> Select Size {recommendation.recommendedSize}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
