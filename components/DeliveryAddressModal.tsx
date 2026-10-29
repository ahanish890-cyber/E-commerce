import React, { useState } from 'react';
import { X, MapPin, Check, Building, Compass } from 'lucide-react';
import { User, Address } from '../types';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentLocation: { city: string; zipCode: string };
  onSelectLocation: (loc: { city: string; zipCode: string }) => void;
}

const POPULAR_LOCATIONS = [
  { city: 'New York', zipCode: '10001', state: 'NY' },
  { city: 'Los Angeles', zipCode: '90001', state: 'CA' },
  { city: 'Chicago', zipCode: '60601', state: 'IL' },
  { city: 'Seattle', zipCode: '98101', state: 'WA' },
  { city: 'Miami', zipCode: '33101', state: 'FL' },
  { city: 'Austin', zipCode: '78701', state: 'TX' },
  { city: 'San Francisco', zipCode: '94102', state: 'CA' },
  { city: 'London', zipCode: 'SW1A 1AA', state: 'UK' }
];

export const DeliveryAddressModal: React.FC<DeliveryAddressModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLocation,
  onSelectLocation
}) => {
  const [zipInput, setZipInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput.trim() && !cityInput.trim()) {
      setError('Please enter a valid City or ZIP code');
      return;
    }
    const city = cityInput.trim() || 'Custom Location';
    const zipCode = zipInput.trim() || '00000';
    onSelectLocation({ city, zipCode });
    onClose();
  };

  const handleSelectPreset = (preset: { city: string; zipCode: string }) => {
    onSelectLocation(preset);
    onClose();
  };

  const handleSelectAddress = (address: Address) => {
    onSelectLocation({
      city: address.city,
      zipCode: address.zipCode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#131921] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#febd69] text-gray-950 rounded-lg">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Choose your delivery location</h3>
              <p className="text-[11px] text-gray-300">Delivery options & speeds for your area</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Current Selection Status */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
                Current Delivery Destination
              </span>
              <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mt-0.5">
                <MapPin size={14} className="text-[#007185]" />
                {currentLocation.city} {currentLocation.zipCode}
              </span>
            </div>
            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* User's Saved Addresses if logged in */}
          {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
                <Building size={14} className="text-[#007185]" /> Your Saved Addresses:
              </h4>
              <div className="space-y-2">
                {currentUser.addresses.map((addr, idx) => {
                  const isCurrent = currentLocation.zipCode === addr.zipCode;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isCurrent 
                          ? 'border-[#e77600] bg-orange-50/50 ring-1 ring-[#e77600]' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-900">{addr.name}</p>
                        <p className="text-gray-600 mt-0.5">{addr.street}</p>
                        <p className="text-gray-500 font-medium">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                      {isCurrent ? (
                        <Check size={16} className="text-[#e77600] shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-[10px] text-[#007185] font-bold hover:underline">Select</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Zip Code Input */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">Enter a US City or ZIP Code:</h4>
            <form onSubmit={handleApplyCustom} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City (e.g. Dallas)"
                  value={cityInput}
                  onChange={(e) => { setCityInput(e.target.value); setError(''); }}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e77600] text-xs"
                />
                <input
                  type="text"
                  placeholder="ZIP (e.g. 75201)"
                  value={zipInput}
                  onChange={(e) => { setZipInput(e.target.value); setError(''); }}
                  className="w-28 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#e77600] text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold rounded-lg transition-colors shadow-xs"
                >
                  Apply
                </button>
              </div>
              {error && <p className="text-red-600 text-[11px] font-semibold">{error}</p>}
            </form>
          </div>

          {/* Popular Cities Preset Pills */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
              <Compass size={14} className="text-[#007185]" /> Or pick a major metropolitan destination:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.map((preset) => {
                const isCurrent = currentLocation.zipCode === preset.zipCode;
                return (
                  <button
                    key={preset.zipCode}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isCurrent 
                        ? 'border-[#e77600] bg-orange-50 font-bold text-[#b12704]' 
                        : 'border-gray-200 hover:border-gray-400 bg-neutral-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{preset.city}, {preset.state}</p>
                      <p className="text-[10px] text-gray-400">{preset.zipCode}</p>
                    </div>
                    {isCurrent && <Check size={14} className="text-[#e77600]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
