import React, { useState } from 'react';
import { X, MapPin, Check, Building, Compass, AlertCircle } from 'lucide-react';
import { User, Address } from '../types';
import { POPULAR_INDIAN_LOCATIONS, validateIndianPIN } from '../utils/indianLocation';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentLocation: { city: string; zipCode: string };
  onSelectLocation: (loc: { city: string; zipCode: string }) => void;
}

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
    setError('');

    const pin = zipInput.trim();
    const city = cityInput.trim();

    if (!pin && !city) {
      setError('Please enter a City or 6-digit Indian PIN code');
      return;
    }

    if (pin && !validateIndianPIN(pin)) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 560001, 400001)');
      return;
    }

    const resolvedCity = city || (pin.startsWith('56') ? 'Bengaluru' : pin.startsWith('40') ? 'Mumbai' : pin.startsWith('11') ? 'New Delhi' : 'India');
    const resolvedPin = pin || '560001';

    onSelectLocation({ city: resolvedCity, zipCode: resolvedPin });
    onClose();
  };

  const handleSelectPreset = (preset: { city: string; zipCode: string }) => {
    onSelectLocation({ city: preset.city, zipCode: preset.zipCode });
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
              <h3 className="font-bold text-sm">Choose delivery location in India</h3>
              <p className="text-[11px] text-gray-300">Fast delivery options & speeds across Indian PIN codes</p>
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

          {/* User Saved Addresses */}
          {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wider">
                Your Saved Indian Addresses
              </span>
              <div className="space-y-1.5">
                {currentUser.addresses.map((addr, idx) => {
                  const isSelected = currentLocation.zipCode === addr.zipCode;
                  return (
                    <button
                      key={addr.id || idx}
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#e77600] bg-orange-50/50 shadow-xs' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 pr-2 truncate">
                        <p className="font-bold text-gray-900 truncate">{addr.name || currentUser.name}</p>
                        <p className="text-gray-600 truncate text-[11px]">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                      {isSelected ? (
                        <Check size={16} className="text-[#e77600] shrink-0" />
                      ) : (
                        <span className="text-[10px] text-[#007185] font-semibold hover:underline shrink-0">Deliver here</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enter Indian PIN Code / City */}
          <form onSubmit={handleApplyCustom} className="space-y-2">
            <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wider">
              Enter Indian PIN code or City
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="6-digit PIN (e.g. 560001)"
                maxLength={6}
                value={zipInput}
                onChange={(e) => {
                  setZipInput(e.target.value);
                  setError('');
                }}
                className="flex-1 p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs"
              >
                Apply
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-[11px] flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </form>

          {/* Popular Major Cities in India */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wider">
              Popular Cities in India
            </span>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_INDIAN_LOCATIONS.map((preset) => {
                const isSelected = currentLocation.zipCode === preset.zipCode;
                return (
                  <button
                    key={preset.zipCode}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#e77600] bg-orange-50 font-bold text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">{preset.city}</p>
                      <p className="text-[10px] text-gray-500">{preset.state} • {preset.zipCode}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-[#e77600] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
