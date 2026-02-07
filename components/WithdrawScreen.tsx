
import React, { useState } from 'react';
import { ArrowLeft, Send, Landmark, Smartphone, Wallet, Info, Check } from 'lucide-react';
import { AppConfig } from '../types';

interface WithdrawScreenProps {
  availableBalance: number;
  appConfig: AppConfig;
  onSubmit: (method: string, account: string, amount: number) => void;
  onBack: () => void;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ availableBalance, appConfig, onSubmit, onBack }) => {
  const [method, setMethod] = useState(appConfig.withdrawalMethods[0]?.id || '');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState(appConfig.minWithdrawal.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const canSubmit = numAmount >= appConfig.minWithdrawal && numAmount <= availableBalance && account.trim().length > 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(method, account, numAmount);
      setIsSubmitting(false);
    }, 1500);
  };

  const selectedMethod = appConfig.withdrawalMethods.find(m => m.id === method) || appConfig.withdrawalMethods[0];

  return (
    <div className="min-h-full bg-slate-50 animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white p-6 flex items-center gap-4 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Withdraw Funds</h2>
      </div>

      <div className="p-6">
        {/* Balance Preview */}
        <div className="bg-slate-900 p-7 rounded-[40px] text-white mb-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Withdrawal Wallet</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-400">৳</span>
              <h3 className="text-4xl font-black tracking-tight">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 p-4 text-white/5 rotate-12">
            <Landmark size={120} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Method Selection */}
          <div>
            <div className="flex justify-between items-end mb-4 px-1">
               <label className="block text-slate-900 font-black text-[11px] uppercase tracking-widest">Payment Gateway</label>
               <span className="text-[10px] font-bold text-slate-400">Secure Transfer</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {appConfig.withdrawalMethods.map((m) => {
                const isActive = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`relative p-5 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 active:scale-95 bg-white ${
                      isActive 
                        ? `${m.color} ${m.activeBg} shadow-xl shadow-slate-200` 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="h-10 w-full flex items-center justify-center">
                      <img 
                        src={m.icon} 
                        alt={m.name} 
                        className={`h-full object-contain transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-80'}`} 
                      />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      {m.name}
                    </span>
                    {isActive && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md ${m.color.replace('border-', 'bg-')}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Input */}
          <div className="space-y-3">
            <label className="block text-slate-900 font-black text-[11px] uppercase tracking-widest ml-1">Account Identification</label>
            <div className="relative group">
              <input 
                type="text"
                placeholder={method === 'Binance' ? "Enter Binance Pay ID" : `Enter 11-digit ${selectedMethod?.name || 'Account'} Number`}
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-slate-100 focus:border-slate-900 focus:outline-none transition-all shadow-sm text-black font-bold pl-16 placeholder:text-slate-300"
                required
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Smartphone size={22} />
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-slate-900 font-black text-[11px] uppercase tracking-widest ml-1">Transfer Amount</label>
            <div className="relative group">
              <input 
                type="number"
                min={appConfig.minWithdrawal}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white p-6 rounded-[32px] border-2 border-slate-100 focus:border-slate-900 focus:outline-none transition-all shadow-sm text-black font-black text-3xl pl-16 placeholder:text-slate-300"
                required
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl group-focus-within:text-slate-900 transition-colors">
                ৳
              </div>
            </div>
            <div className="flex justify-between mt-2 px-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Minimum: ৳{appConfig.minWithdrawal.toFixed(2)}</p>
              <button 
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(0))}
                className="text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline"
              >
                Use Full Balance
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full bg-slate-900 py-6 rounded-[32px] text-white font-black text-[13px] shadow-2xl active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-3 uppercase tracking-[3px]"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  Confirm Payout <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 p-7 bg-white rounded-[40px] border border-slate-100 flex gap-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
            <Info size={24} />
          </div>
          <div>
            <p className="text-slate-900 font-black text-[11px] uppercase tracking-widest mb-1.5">Payout Protocol</p>
            <p className="text-slate-500 text-[10px] leading-relaxed font-bold uppercase tracking-tight opacity-70">
              Funds are disbursed via secure gateway within 24-72 hours. Ensure account details match your official registration.
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-32"></div>
    </div>
  );
};

export default WithdrawScreen;
