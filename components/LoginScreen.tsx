
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Star, Users, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserAccount) => void;
  onSignup: (user: UserAccount) => void;
  users: UserAccount[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, users }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate Server Round-trip
    setTimeout(() => {
      const emailLower = formData.email.toLowerCase().trim();
      
      if (authMode === 'LOGIN') {
        const foundUser = users.find(u => u.email.toLowerCase().trim() === emailLower && u.password === formData.password);
        if (foundUser) {
          onLogin(foundUser);
        } else {
          setError('Invalid username/email or password.');
          setIsLoading(false);
        }
      } else {
        // Signup Mode
        const exists = users.find(u => u.email.toLowerCase().trim() === emailLower);
        if (exists) {
          setError('This email is already in use.'); // Requested message
          setIsLoading(false);
        } else {
          const newUser: UserAccount = {
            name: formData.fullName,
            email: emailLower,
            password: formData.password
          };
          onSignup(newUser);
          setAuthMode('LOGIN');
          setFormData({ fullName: '', email: '', password: '' });
          setIsLoading(false);
        }
      }
    }, 1800); // Mimic server latency
  };

  return (
    <div className="min-h-screen bg-white flex flex-col animate-in fade-in duration-700">
      {/* Top Banner / Social Proof */}
      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between overflow-hidden relative">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 border-slate-900 ring-1 ring-white/10 ${i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Synchronized</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <ShieldCheck size={10} fill="currentColor" />
          <span className="text-[10px] font-black italic uppercase">Verified API</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 pb-12 pt-10 overflow-y-auto no-scrollbar">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-green-200 mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
            <span className="text-white text-3xl font-black relative z-10">৳</span>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-1">
            {authMode === 'LOGIN' ? 'Access Secure Server' : 'Cloud Registration'}
          </h1>
          <p className="text-slate-500 text-center text-xs font-medium max-w-[280px]">
            {authMode === 'LOGIN' 
              ? 'Enter credentials to fetch your cloud profile.' 
              : 'Data will be automatically saved to our global server.'}
          </p>
        </div>

        {/* Professional Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex mb-6 relative">
          <div 
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${authMode === 'SIGNUP' ? 'translate-x-full' : 'translate-x-0'}`}
          />
          <button 
            onClick={() => { if(!isLoading) { setAuthMode('LOGIN'); setError(null); } }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${authMode === 'LOGIN' ? 'text-slate-900' : 'text-slate-400'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => { if(!isLoading) { setAuthMode('SIGNUP'); setError(null); } }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${authMode === 'SIGNUP' ? 'text-slate-900' : 'text-slate-400'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Messaging */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
            <div className="bg-rose-500 p-1 rounded-lg shrink-0">
               <AlertCircle className="text-white" size={14} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest leading-none mb-1">Authorization Failed</h4>
              <p className="text-rose-600 text-[11px] font-bold leading-tight">{error}</p>
            </div>
          </div>
        )}

        {/* Official Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'SIGNUP' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Full Legal Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email"
                required
                disabled={isLoading}
                placeholder="name@server.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Password</label>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-green-500 focus:bg-white transition-all shadow-sm disabled:opacity-50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 p-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <RefreshCw className="text-emerald-500 animate-spin" size={18} />
                <span className="font-black text-white text-[10px] uppercase tracking-[2px]">Syncing with Server...</span>
              </div>
            ) : (
              <>
                <span className="font-black text-white text-[12px] uppercase tracking-[2px]">
                  {authMode === 'LOGIN' ? 'Authorized Access' : 'Save to Cloud'}
                </span>
                <ArrowRight size={18} className="text-white/60" />
              </>
            )}
          </button>
        </form>

        <div className="mt-auto pt-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] bg-slate-100 flex-1"></div>
            <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Server Persistence Active
            </div>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>
          
          <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
               <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Multi-Device Access</p>
              <p className="text-[10px] text-slate-500 leading-tight font-medium">
                Your account is saved on our decentralized server. Once registered, you can log in from any smartphone using these credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
