import React, { useState } from 'react';
import { CartItem, User, Address, Order } from '../types';
import { ShieldCheck, Truck, CreditCard, CheckCircle, AlertCircle, ChevronRight, Lock, MapPin } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { INDIAN_STATES_AND_UTS, validateIndianPIN, validateIndianPhone } from '../utils/indianLocation';

interface CheckoutViewProps {
  cart: CartItem[];
  currentUser: User | null;
  onOrderSuccess: (order: Order) => void;
  onCancel: () => void;
  onOpenAuth: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  currentUser,
  onOrderSuccess,
  onCancel,
  onOpenAuth
}) => {
  const [shippingAddress, setShippingAddress] = useState<Address>(() => {
    const existing = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];
    return existing || {
      name: currentUser?.name || 'Customer Name',
      street: 'Flat 402, Prestige Palms, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560038',
      country: 'India',
      phone: '+91 98765 43210'
    };
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'prime_standard' | 'express'>('prime_standard');
  const [paymentMethod, setPaymentMethod] = useState('UPI / NetBanking / Cards (Demo Sandbox)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Numerical calculations in INR
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'express' ? 149 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST for Indian apparel
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    setError('');

    // Form Validation for Indian Delivery
    if (!shippingAddress.name.trim()) {
      setError('Please provide your recipient name.');
      return;
    }
    if (!shippingAddress.street.trim()) {
      setError('Please provide flat/house number and street address.');
      return;
    }
    if (!shippingAddress.city.trim()) {
      setError('Please specify the city/town.');
      return;
    }
    if (!shippingAddress.state.trim()) {
      setError('Please select an Indian state or union territory.');
      return;
    }
    if (!validateIndianPIN(shippingAddress.zipCode)) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 560001, 400001).');
      return;
    }
    if (shippingAddress.phone && !validateIndianPhone(shippingAddress.phone)) {
      setError('Please enter a valid 10-digit Indian contact phone number.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('omnifit_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })),
          shippingAddress: {
            ...shippingAddress,
            country: 'India'
          },
          deliveryMethod,
          paymentMethod,
          customerName: shippingAddress.name,
          customerEmail: currentUser?.email || 'customer@example.in'
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      onOrderSuccess(data.order);
    } catch (err: any) {
      setError(err.message || 'Error processing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
      {/* Checkout Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-[#007185]" />
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">OmniFit Secure Indian Checkout</h1>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#007185] hover:underline font-bold cursor-pointer"
        >
          Return to Cart
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#131921] text-white text-xs flex items-center justify-center font-bold">1</span>
                Delivery Address (India)
              </h3>
              {!currentUser && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs text-[#007185] hover:underline font-bold cursor-pointer"
                >
                  Sign in to use saved addresses
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Contact Number *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={shippingAddress.phone || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Flat, House no., Building, Apartment *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 301, Tower B, Lotus Greens"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City / Town / District *</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State / Union Territory *</label>
                <select
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none bg-white"
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES_AND_UTS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">PIN Code (6 digits) *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Options */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#131921] text-white text-xs flex items-center justify-center font-bold">2</span>
              Choose Delivery Option
            </h3>

            <div className="space-y-3">
              <label 
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'prime_standard' ? 'border-[#e77600] bg-orange-50/40' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === 'prime_standard'}
                  onChange={() => setDeliveryMethod('prime_standard')}
                  className="mt-1 text-[#e77600] focus:ring-[#e77600]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-green-700">FREE Prime Delivery</span>
                    <span className="text-xs bg-[#00a8e1] text-white font-bold px-1.5 py-0.5 rounded">prime</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Guaranteed 2-3 business days across Indian postal codes</p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'express' ? 'border-[#e77600] bg-orange-50/40' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === 'express'}
                  onChange={() => setDeliveryMethod('express')}
                  className="mt-1 text-[#e77600] focus:ring-[#e77600]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">Next-Day Express Priority ({formatINR(149)})</span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Fastest</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Dispatched via air express logistics directly to your doorstep</p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#131921] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Mode (Indian Gateway Simulation)
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer border-[#e77600] bg-orange-50/40">
                <input
                  type="radio"
                  name="payment"
                  checked={true}
                  readOnly
                  className="text-[#e77600]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <CreditCard size={16} className="text-[#007185]" />
                    <span>UPI / NetBanking / Cards / Cash On Delivery (Demo Mode)</span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Safe evaluation mode: order is logged immediately into backend and inventory without debiting actual bank funds.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary in INR */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5 sticky top-24">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 rounded-full font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Confirming Order...' : `Place Your Order in INR • ${formatINR(total)}`}
          </button>
          <p className="text-[11px] text-gray-500 text-center leading-snug">
            By placing your order, you agree to OmniFit India's conditions of use and privacy notice.
          </p>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-xs">
            <h4 className="font-bold text-sm text-gray-900 mb-3">Order Summary</h4>
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)}):</span>
              <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges:</span>
              <span className="font-semibold text-gray-900">{deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Apparel GST (5%):</span>
              <span className="font-semibold text-gray-900">{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#b12704] border-t border-gray-200 pt-3">
              <span>Order Total:</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {/* Cart Item Previews */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h5 className="font-bold text-xs text-gray-700">Review Items ({cart.length})</h5>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-2.5 items-center text-xs">
                  <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded bg-gray-50 border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-500 text-[11px]">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                    <p className="text-[#b12704] font-semibold">{formatINR(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
