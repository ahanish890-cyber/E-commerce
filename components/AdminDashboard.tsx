import React, { useState, useEffect, useMemo } from 'react';
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
  Truck,
  Eye,
  Search,
  Filter,
  Users,
  Calendar,
  CreditCard,
  MapPin,
  Clock
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDateTimeIST, INDIAN_STATES_AND_UTS } from '../utils/indianLocation';

interface AdminDashboardProps {
  currentUser: User | null;
  onClose: () => void;
  onRefreshCatalog: () => void;
  onOpenAuth?: () => void;
  onSelectProduct?: (product: Product) => void;
}

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  addresses?: any[];
  orderCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser, 
  onClose, 
  onRefreshCatalog,
  onOpenAuth,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');

  // Orders Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');

  // New product form state with INR pricing
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    brand: 'OmniFit Studio',
    gender: 'women',
    category: 'clothing',
    subcategory: 'dresses',
    price: 2499,
    originalPrice: 2999,
    image: '/catalog/w-dress-midnight.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    stock: { S: 15, M: 20, L: 15, XL: 10 },
    hasTryOn: true,
    description: 'High-quality garment crafted for comfort, style, and everyday elegance in India.'
  });

  const fetchData = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('omnifit_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [prodRes, orderRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers }),
        fetch('/api/admin/users', { headers })
      ]);

      const prodData = await prodRes.json().catch(() => ({}));
      const orderData = await orderRes.json().catch(() => ({}));
      const usersData = await usersRes.json().catch(() => ({}));

      if (prodData.success) setProducts(prodData.products || []);
      if (orderData.success) setOrders(orderData.orders || []);
      if (usersData.success) setCustomers(usersData.users || []);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Key metrics calculated in INR
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      if (!p.stock) return false;
      const total = Object.values(p.stock).reduce<number>((a, b) => a + Number(b), 0);
      return total < 10;
    }).length;
  }, [products]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Search filter (order ID, customer name, customer email)
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesName = (order.customerName || '').toLowerCase().includes(q);
        const matchesEmail = (order.customerEmail || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail) return false;
      }

      // 2. Status filter
      if (orderStatusFilter !== 'all') {
        if (order.status.toLowerCase() !== orderStatusFilter.toLowerCase()) return false;
      }

      // 3. Date filter
      if (orderDateFilter !== 'all') {
        const orderTime = new Date(order.createdAt).getTime();
        const now = Date.now();
        if (orderDateFilter === 'today') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - orderTime > oneDay) return false;
        } else if (orderDateFilter === '7days') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (now - orderTime > sevenDays) return false;
        } else if (orderDateFilter === '30days') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (now - orderTime > thirtyDays) return false;
        }
      }

      return true;
    });
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter]);

  // Product CRUD
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
        body: JSON.stringify({
          ...newProd,
          price: Number(newProd.price) || 999,
          originalPrice: Number(newProd.originalPrice) || Number(newProd.price) || 1299
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setMessage('New garment added to catalog successfully!');
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
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price)
        })
      });
      const data = await res.json().catch(() => ({}));
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
    if (!confirm('Are you sure you want to remove this garment from the active catalog?')) return;
    const token = localStorage.getItem('omnifit_token');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setMessage('Product removed from catalog.');
        fetchData();
        onRefreshCatalog();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Order status update
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
          note: `Status updated by Admin to ${newStatus} on ${formatDateTimeIST(new Date())}` 
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setMessage(`Order ${orderId} marked as ${newStatus}. Updated immediately across portals!`);
        fetchData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(data.error || 'Status update failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
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

  // Unauthorized view
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Shield size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Administrator Access Required</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {!currentUser 
              ? 'You must be signed in with an administrative account to view store metrics, manage inventory, and update order fulfillment.' 
              : `Current account (${currentUser.email}) has role "${currentUser.role}". Administrator privileges are required to access this console.`}
          </p>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-900 text-left max-w-md mx-auto space-y-1">
          <p className="font-bold">Authorized Admin Credentials:</p>
          <p>• Email: <code className="bg-purple-100 px-1 py-0.5 rounded font-mono">admin@omnifit.com</code></p>
          <p>• Password: <code className="bg-purple-100 px-1 py-0.5 rounded font-mono">admin123</code></p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Sign In as Admin
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-bold text-xs transition-colors cursor-pointer"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-gray-300">Indian catalog control, synchronized order fulfillment, and metrics</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
        >
          Exit Admin Dashboard
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-center justify-between">
          <span className="font-semibold">{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Metrics Row in INR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales (INR)</span>
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{formatINR(totalRevenue)}</p>
          <span className="text-[11px] text-green-700 font-semibold">Active Store Volume</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{orders.length}</p>
          <span className="text-[11px] text-blue-700 font-semibold">{pendingOrdersCount} pending fulfillment</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Catalogue</span>
            <ShoppingBag size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{products.length}</p>
          <span className="text-[11px] text-purple-700 font-semibold">Men's & Women's clothing</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <Users size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{customers.length}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Registered Indian accounts</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#131921] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products' ? 'bg-[#131921] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Clothing Catalogue ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'customers' ? 'bg-[#131921] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Customer Accounts ({customers.length})
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex-1 min-w-[260px] relative">
              <Search size={15} className="text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-[#e77600]"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-2.5 py-1">
                <Filter size={13} className="text-gray-500" />
                <span className="font-semibold text-gray-600">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border rounded-lg px-2.5 py-1">
                <Calendar size={13} className="text-gray-500" />
                <span className="font-semibold text-gray-600">Date:</span>
                <select
                  value={orderDateFilter}
                  onChange={(e) => setOrderDateFilter(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border text-center text-gray-500 text-xs">
                No orders match your active search or filter criteria.
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 text-xs">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-black text-sm text-gray-900 font-mono">ORDER #{order.id}</span>
                      <span className="text-gray-600 ml-2 font-medium">
                        • {order.customerName} ({order.customerEmail})
                      </span>
                      <span className="text-gray-400 text-[11px] block mt-0.5">
                        Placed on {formatDateTimeIST(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-base text-[#b12704]">{formatINR(order.total)}</span>
                      <span className={`px-2.5 py-1 rounded-full font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye size={13} /> Details
                      </button>
                    </div>
                  </div>

                  {/* Order Items & Quick Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Items snippet */}
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 items-center">
                          <img src={it.image} alt={it.name} className="w-9 h-11 object-cover rounded bg-white shrink-0 border" />
                          <div className="min-w-0 pr-1">
                            <p className="font-bold text-gray-900 truncate max-w-[140px]">{it.name}</p>
                            <p className="text-[11px] text-gray-500">Size: {it.selectedSize} • Qty: {it.quantity}</p>
                            <p className="text-[11px] text-gray-900 font-semibold">{formatINR(it.price * it.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Status Updater */}
                    <div className="p-3 bg-neutral-50 rounded-lg border border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
                        Update Fulfillment Status
                      </span>
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="flex-1 p-1.5 bg-white border rounded text-xs font-bold text-gray-800 focus:outline-none focus:border-[#e77600] cursor-pointer"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} • PIN {order.shippingAddress?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Products Catalogue Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-base">Store Clothing Catalogue (Men & Women)</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={16} /> Add Garment
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Garment</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Subcategory</th>
                    <th className="p-3">Price (INR)</th>
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
                          <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0 border" />
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-[11px] text-gray-400">{p.brand} • #{p.id}</p>
                          </div>
                        </td>
                        <td className="p-3 capitalize font-bold text-gray-800">{p.gender}</td>
                        <td className="p-3 capitalize font-medium">{p.subcategory.replace(/_/g, ' ')}</td>
                        <td className="p-3 font-bold text-gray-900">{formatINR(p.price)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            typeof totalUnits === 'number' && totalUnits < 10 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {totalUnits} units
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-indigo-600 font-bold">Enabled</span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {onSelectProduct && (
                            <button
                              onClick={() => {
                                onSelectProduct(p);
                                onClose();
                              }}
                              className="p-1.5 text-gray-600 hover:text-[#007185] hover:bg-gray-100 rounded cursor-pointer"
                              title="View in Customer Storefront"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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

      {/* Tab 3: Customers Management */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Registered Customer Accounts ({customers.length})</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Account Role</th>
                    <th className="p-3">Joined Date (IST)</th>
                    <th className="p-3">Total Orders</th>
                    <th className="p-3">Primary Indian Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map(c => {
                    const defaultAddr = c.addresses?.find(a => a.isDefault) || c.addresses?.[0];
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{c.name || 'Unnamed Customer'}</td>
                        <td className="p-3 font-mono text-gray-600">{c.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.role || 'customer'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{formatDateTimeIST(c.createdAt)}</td>
                        <td className="p-3 font-bold text-gray-900">{c.orderCount}</td>
                        <td className="p-3 text-gray-600">
                          {defaultAddr ? (
                            <span>{defaultAddr.city}, {defaultAddr.state} ({defaultAddr.zipCode})</span>
                          ) : (
                            <span className="text-gray-400 italic">None saved yet</span>
                          )}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="bg-[#131921] text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-black text-lg">Order #{selectedOrder.id} Details</h3>
                <p className="text-xs text-gray-300">Placed on {formatDateTimeIST(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-gray-800">
              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Customer Info</h4>
                  <p className="font-bold text-sm text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                  <p className="text-gray-600 mt-1">Phone: {selectedOrder.shippingAddress?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Delivery Address (India)</h4>
                  <p className="font-medium text-gray-900">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-gray-700">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p className="text-gray-700 font-bold">PIN: {selectedOrder.shippingAddress?.zipCode} • India</p>
                </div>
              </div>

              {/* Status controller */}
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-gray-900 block text-xs">Fulfillment Status:</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold text-xs border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Update to:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="p-2 bg-white border rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-[#e77600] cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Ordered Products</h4>
                <div className="space-y-2 border rounded-xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center gap-3 bg-white">
                      <img src={it.image} alt={it.name} className="w-12 h-14 object-cover rounded bg-gray-50 border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{it.name}</p>
                        <p className="text-gray-500 text-[11px]">Size: <strong className="text-gray-800">{it.selectedSize}</strong> • Color: {it.selectedColor} • Qty: {it.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">{formatINR(it.price * it.quantity)}</p>
                        <p className="text-[10px] text-gray-400">{formatINR(it.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 bg-neutral-50 rounded-xl space-y-1.5 border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatINR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.deliveryFee === 0 ? 'FREE' : formatINR(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Apparel GST (5%):</span>
                  <span className="font-semibold text-gray-900">{formatINR(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#b12704] border-t border-gray-200 pt-2 mt-2">
                  <span>Final Total:</span>
                  <span>{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">Add New Clothing Garment</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Oxford Formal Shirt"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Department</label>
                  <select
                    value={newProd.gender}
                    onChange={(e) => setNewProd({ ...newProd, gender: e.target.value as any })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none bg-white"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Subcategory</label>
                  <select
                    value={newProd.subcategory}
                    onChange={(e) => setNewProd({ ...newProd, subcategory: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none bg-white"
                  >
                    <option value="dresses">Dresses</option>
                    <option value="casual_shirts">Casual Shirts</option>
                    <option value="formal_shirts">Formal Shirts</option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="polo_tshirts">Polo T-Shirts</option>
                    <option value="jeans">Jeans</option>
                    <option value="trousers">Trousers</option>
                    <option value="chinos">Chinos</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="sweatshirts">Sweatshirts</option>
                    <option value="jackets">Jackets</option>
                    <option value="kurtas">Kurtas</option>
                    <option value="kurtis">Kurtis</option>
                    <option value="ethnic_sets">Ethnic Sets</option>
                    <option value="coord_sets">Co-ord Sets</option>
                    <option value="skirts">Skirts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Retail Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1999"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2499"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Image URL / Path</label>
                <input
                  type="text"
                  required
                  placeholder="/catalog/m-formal-oxford.jpg"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 rounded-lg font-bold cursor-pointer"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">Edit Garment #{editingProduct.id}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Price in INR (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Image URL / Path</label>
                <input
                  type="text"
                  required
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:border-[#e77600] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 rounded-lg font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
