import React, { useState, useEffect } from 'react';
import { Product, Order, User } from '../types';
import { 
  Shield, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle,
  Truck
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onClose: () => void;
  onRefreshCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onClose, onRefreshCatalog }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');

  // New product form state
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    brand: 'OmniFit Studio',
    gender: 'women',
    category: 'clothing',
    subcategory: 'dresses',
    price: 99.99,
    image: '/Dress-1.png',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Navy'],
    stock: { S: 10, M: 10, L: 10 },
    hasTryOn: true,
    description: 'High-quality garment crafted for comfort and elegance.'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('omnifit_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers })
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (orderData.success) setOrders(orderData.orders || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const lowStockCount = products.filter(p => {
    if (!p.stock) return false;
    const total = Object.values(p.stock).reduce<number>((a, b) => a + Number(b), 0);
    return total < 10;
  }).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('omnifit_token');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProd)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Product added to catalog successfully!');
        setIsAddModalOpen(false);
        fetchData();
        onRefreshCatalog();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const token = localStorage.getItem('omnifit_token');
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Product updated successfully!');
        setEditingProduct(null);
        fetchData();
        onRefreshCatalog();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from catalog?')) return;
    const token = localStorage.getItem('omnifit_token');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Product deleted.');
        fetchData();
        onRefreshCatalog();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('omnifit_token');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          note: `Status updated by Admin to ${newStatus}` 
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Order ${orderId} marked as ${newStatus}.`);
        fetchData();
      } else {
        alert(data.error || 'Status update failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-[#131921] text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">OmniFit Store Operations & Admin</h1>
            <p className="text-xs text-gray-300">Catalog inventory control, order fulfillment, and metrics</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-colors"
        >
          Exit Admin Dashboard
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Total Revenue</span>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">${totalRevenue.toFixed(2)}</p>
          <span className="text-[11px] text-green-700 font-semibold">Active Store Volume</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Customer Orders</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{orders.length}</p>
          <span className="text-[11px] text-blue-700 font-semibold">Total transactions logged</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Active Catalog</span>
            <ShoppingBag size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{products.length}</p>
          <span className="text-[11px] text-purple-700 font-semibold">Verified fashion styles</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Low Stock Alert</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{lowStockCount}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Under 10 units remaining</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'products' ? 'bg-[#131921] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Product & Inventory Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'orders' ? 'bg-[#131921] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Fulfillment & Orders ({orders.length})
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-base">Store Catalog Items</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Add New Fashion Item
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Gender / Category</th>
                    <th className="p-3">Subcategory</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Variant Stock</th>
                    <th className="p-3">Try-On</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => {
                    const totalUnits = p.stock ? Object.values(p.stock).reduce<number>((a, b) => a + Number(b), 0) : 'N/A';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-3 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-[11px] text-gray-400">{p.brand} • #{p.id}</p>
                          </div>
                        </td>
                        <td className="p-3 capitalize">
                          <span className="font-semibold text-gray-800">{p.gender}</span> / {p.category}
                        </td>
                        <td className="p-3 capitalize font-medium">{p.subcategory}</td>
                        <td className="p-3 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            typeof totalUnits === 'number' && totalUnits < 10 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {totalUnits} units total
                          </span>
                        </td>
                        <td className="p-3">
                          {p.hasTryOn ? (
                            <span className="text-indigo-600 font-bold">Yes (Ready)</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Store Customer Orders</h3>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <span className="font-black text-sm text-gray-900">ORDER {order.id}</span>
                    <span className="text-gray-500 ml-2">Customer: {order.customerName} ({order.customerEmail})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900">Total: ${order.total.toFixed(2)}</span>
                    <span className="px-2.5 py-1 rounded-full font-bold bg-neutral-100 border text-gray-800">
                      Current: {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <img src={it.image} alt={it.name} className="w-10 h-12 object-cover rounded bg-white shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{it.name}</p>
                        <p className="text-gray-500">Size: {it.selectedSize} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status progression bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Ship to: {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-700 mr-1">Update Status:</span>
                    {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(order.id, st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          order.status === st 
                            ? 'bg-[#131921] text-white shadow-xs' 
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base">Add New Fashion Product</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Gender</label>
                  <select
                    value={newProd.gender}
                    onChange={(e) => setNewProd({ ...newProd, gender: e.target.value as any })}
                    className="w-full p-2 border rounded capitalize"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={newProd.subcategory}
                    onChange={(e) => setNewProd({ ...newProd, subcategory: e.target.value.toLowerCase() })}
                    placeholder="e.g. dresses, shirts, jackets"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#ffd814] font-bold rounded text-sm hover:bg-[#f7ca00]"
              >
                Save & Publish to Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base">Edit: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Virtual Try-On Compatible</label>
                <input
                  type="checkbox"
                  checked={editingProduct.hasTryOn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, hasTryOn: e.target.checked })}
                  className="rounded text-indigo-600 mr-2"
                />
                <span>Enable Try-On for this product</span>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#131921] text-white font-bold rounded text-sm hover:bg-[#232f3e]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
