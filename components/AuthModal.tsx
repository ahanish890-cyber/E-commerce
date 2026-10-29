import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(isLogin ? 'Signed in successfully!' : 'Account created successfully!');
      setTimeout(() => {
        onSuccess(data.user, data.token);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'admin') => {
    setError('');
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@omnifit.com' : 'jane@example.com';
    const demoPassword = role === 'admin' ? 'admin123' : 'password';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Demo login failed');
      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[#131921] text-white p-6 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold tracking-tight">OmniFit<span className="text-[#febd69]">.com</span></span>
            <p className="text-xs text-gray-300 mt-1">
              {isLogin ? 'Sign in to access your account & orders' : 'Create an OmniFit customer account'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">
              <CheckCircle size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and last name"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold rounded-md shadow-sm transition-all text-sm active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create your OmniFit account')}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="py-1.5 px-3 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <UserIcon size={14} className="text-[#007185]" /> Customer Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-1.5 px-3 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Shield size={14} className="text-purple-600" /> Admin Demo
              </button>
            </div>
          </div>

          {/* Toggle */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-[#007185] hover:underline font-semibold"
            >
              {isLogin ? "New to OmniFit? Create your account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
