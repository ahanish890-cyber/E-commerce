import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { Package, Clock, CheckCircle2, RotateCcw, AlertTriangle, ChevronRight, Truck, MapPin } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateTimeIST } from '../utils/indianLocation';

interface OrdersViewProps {
  onContinueShopping: () => void;
  onSelectProductById?: (productId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onContinueShopping, onSelectProductById }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('omnifit_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', { headers });
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? Item stock will be immediately restored.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation via portal' })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setActionSuccess(`Order ${orderId} has been successfully cancelled.`);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    const reason = prompt('Please specify return reason (e.g., Size fit issue, Style mismatch):');
    if (!reason) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setActionSuccess(`Return request for ${orderId} submitted. Prepaid shipping label generated!`);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to request return');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Packed': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Confirmed': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Placed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'Return Requested': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders & Returns</h1>
          <p className="text-xs text-gray-500 mt-1">Track shipments across Indian PIN codes, manage delivery, and initiate returns</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-5 py-2.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-xs font-bold hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-500 text-sm">
          <Clock className="mx-auto text-gray-400 animate-spin mb-2" size={24} />
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-4">
          <Package size={48} className="mx-auto text-gray-300" />
          <h3 className="text-lg font-bold text-gray-800">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders in this account yet. Explore our fashion catalog and start filling your cart!
          </p>
          <button
            onClick={onContinueShopping}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold px-8 py-3 rounded-full text-xs shadow-md cursor-pointer"
          >
            Start Browsing
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Order summary bar */}
              <div className="bg-neutral-100 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap gap-6 text-gray-600">
                  <div>
                    <span className="block text-gray-400 uppercase font-semibold text-[10px]">Order Date (IST)</span>
                    <span className="font-bold text-gray-800">{formatDateTimeIST(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase font-semibold text-[10px]">Total Amount</span>
                    <span className="font-bold text-gray-900 text-sm">{formatINR(order.total)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase font-semibold text-[10px]">Delivery Destination</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <MapPin size={12} className="text-[#007185]" />
                      {order.shippingAddress?.city || 'India'} {order.shippingAddress?.zipCode ? `(${order.shippingAddress.zipCode})` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-mono text-[11px]">ORDER #{order.id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onSelectProductById && onSelectProductById(item.productId)}
                      className={`flex gap-4 items-start pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 transition-colors ${
                        onSelectProductById ? 'cursor-pointer hover:bg-neutral-50/80 p-2 rounded-lg group' : ''
                      }`}
                      title={onSelectProductById ? "Click to view product details" : undefined}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-24 object-cover rounded-md bg-gray-50 shrink-0 group-hover:scale-105 transition-transform border border-gray-100" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#007185] transition-colors flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-xs text-[#007185] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            View product →
                          </span>
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">Brand: {item.brand}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Size: <strong className="text-gray-900">{item.selectedSize}</strong> | Color: <strong className="text-gray-900">{item.selectedColor}</strong> | Qty: {item.quantity}
                        </p>
                        <p className="font-bold text-sm text-[#b12704] mt-2">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                    <h5 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                      <Truck size={14} className="text-[#007185]" /> Tracking & Activity Timeline:
                    </h5>
                    <div className="space-y-1.5 pl-2 border-l-2 border-[#007185]/40 ml-1">
                      {order.timeline.map((step, sIdx) => (
                        <div key={sIdx} className="text-xs text-gray-600 pl-3 relative">
                          <span className="w-2 h-2 rounded-full bg-[#007185] absolute -left-[17px] top-1.5" />
                          <strong className="text-gray-900">{step.status}:</strong> {step.note}
                          <span className="text-[10px] text-gray-400 ml-2">
                            {formatDateTimeIST(step.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Payment mode: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                  </div>

                  <div className="flex gap-2">
                    {(order.status === 'Placed' || order.status === 'Confirmed') && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'Delivered' && (
                      <button
                        onClick={() => handleReturnOrder(order.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-800 rounded-md hover:bg-gray-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} /> Return or Replace Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
