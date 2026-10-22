import React, { useState } from 'react';
import { CartItem, User, Address, Order } from '../types';
import { ShieldCheck, Truck, CreditCard, CheckCircle, AlertCircle, ChevronRight, Lock } from 'lucide-react';

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
      name: currentUser?.name || 'Jane Doe',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      country: 'United States',
      phone: '+1 (555) 234-5678'
    };
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'prime_standard' | 'express'>('prime_standard');
  const [paymentMethod, setPaymentMethod] = useState('Demo Credit Card (ending 4242)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'express' ? 9.99 : 0.00;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  const handlePlaceOrder = async () => {
    setError('');
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
          shippingAddress,
          deliveryMethod,
          paymentMethod,
          customerName: shippingAddress.name,
          customerEmail: currentUser?.email || 'customer@example.com'
        })
      });

      const data = await res.json();
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
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">OmniFit Secure Checkout</h1>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#007185] hover:underline font-bold"
        >
          Return to Cart
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Steps */}
        <div className="flex-1 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#131921] text-white text-xs flex items-center justify-center font-bold">1</span>
                Shipping Address
              </h3>
              {!currentUser && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs text-[#007185] hover:underline font-bold"
                >
                  Sign in to use saved addresses
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className="w-full p-2 border rounded-md focus:border-[#e77600] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full p-2 border rounded-md focus:border-[#e77600] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full p-2 border rounded-md focus:border-[#e77600] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full p-2 border rounded-md focus:border-[#e77600] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full p-2 border rounded-md focus:border-[#e77600] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Options */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                    <span className="font-bold text-sm text-green-700">FREE Prime Tomorrow</span>
                    <span className="text-xs bg-[#00a8e1] text-white font-bold px-1.5 py-0.5 rounded">prime</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Guaranteed next-business-day delivery via OmniFit Logistics</p>
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
                    <span className="font-bold text-sm text-gray-900">Same-Day Priority Express (+$9.99)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Delivered within 6 hours by local courier</p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#131921] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <strong>Demo Environment:</strong> Transactions are simulated for demonstration purposes. No real credit card charge will occur.
            </div>

            <div className="space-y-2">
              {[
                { id: 'Demo Credit Card (ending 4242)', label: 'Visa ending in 4242 (Demo Verified)', icon: CreditCard },
                { id: 'OmniFit Pay Instant', label: 'OmniFit One-Click Pay', icon: ShieldCheck },
                { id: 'Cash on Delivery', label: 'Cash on Delivery (Pay upon arrival)', icon: Truck }
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-xs font-semibold ${
                    paymentMethod === opt.id ? 'border-[#e77600] bg-orange-50 text-gray-900' : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="text-[#e77600] focus:ring-[#e77600]"
                  />
                  <opt.icon size={16} className="text-[#007185]" />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[380px] bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-[100px] space-y-5">
          <h3 className="font-bold text-lg text-gray-900 pb-3 border-b border-gray-100">Order Summary</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items ({cart.reduce((a, b) => a + b.quantity, 0)}):</span>
              <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping & Handling:</span>
              <span className="font-bold text-green-700">
                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Sales Tax (8%):</span>
              <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-black text-[#b12704]">
              <span>Order Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full py-3.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-black rounded-full shadow-md transition-all text-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Validating & Placing Order...' : 'Place Your Order'}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-tight">
            By placing your order, you agree to OmniFit's privacy notice and conditions of use.
          </p>

          {/* Cart review in summary */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-800">Review Items in Order:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-2 text-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-50 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity} • Size: {item.selectedSize}</p>
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
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
