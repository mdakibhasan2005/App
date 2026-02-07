
import React from 'react';
import { Transaction, TaskStatus, AppConfig } from '../types';
import { ArrowDownLeft, ArrowUpRight, History, Wallet, Clock, CreditCard } from 'lucide-react';

interface WalletScreenProps {
  balance: { total: number; available: number; pending: number };
  appConfig: AppConfig;
  transactions: Transaction[];
  onWithdrawClick: () => void;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ balance, appConfig, transactions, onWithdrawClick }) => {
  return (
    <div className="p-6 animate-in slide-in-from-right-10 duration-500">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
          <Wallet size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">My Wallet</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Earnings & Payouts</p>
        </div>
      </div>

      {/* Hero Balance Card - Focus on Main Balance (Available) */}
      <div className="bg-slate-900 rounded-[40px] p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
        {/* Abstract background highlights */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">Main Balance (Available)</p>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-2xl font-black text-emerald-500">৳</span>
            <h1 className="text-5xl font-black tracking-tighter leading-none">{balance.available.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
          </div>
          
          <div className="w-full">
            <div className="bg-white/5 p-5 rounded-[28px] border border-white/10 backdrop-blur-md flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center">
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">In Review</p>
                  <p className="text-sm font-black text-white">৳{balance.pending.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Expected</p>
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">~24 Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Withdrawal */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={15} className="text-emerald-500" /> Withdrawal Gateways
          </h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Min ৳{appConfig.minWithdrawal}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {appConfig.withdrawalMethods.map((gateway) => (
            <button 
              key={gateway.id}
              onClick={onWithdrawClick}
              className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/20 transition-all group flex flex-col items-center justify-center gap-3 active:scale-95"
            >
              <div className="h-9 w-full flex items-center justify-center overflow-hidden">
                 <img src={gateway.icon} alt={gateway.name} className="h-full object-contain filter transition-all" />
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-600">{gateway.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent History Preview */}
      <div>
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <History size={15} className="text-emerald-500" /> Recent Activity
          </h3>
          <button className="text-emerald-600 text-[10px] font-black uppercase tracking-[2px] border-b-2 border-emerald-100 pb-0.5">Full View</button>
        </div>
        
        <div className="space-y-4">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-50 flex items-center gap-4 animate-in fade-in duration-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                tx.type === 'WITHDRAWAL' 
                  ? 'bg-rose-50 text-rose-500 border-rose-100' 
                  : tx.status === TaskStatus.APPROVED 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-500 border-amber-100'
              }`}>
                {tx.type === 'WITHDRAWAL' ? <ArrowDownLeft size={20} /> : tx.status === TaskStatus.APPROVED ? <ArrowUpRight size={20} /> : <Clock size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-[13px] truncate tracking-tight leading-none">{tx.taskName}</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tx.date}</p>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${tx.status === TaskStatus.APPROVED ? 'text-emerald-600' : tx.status === TaskStatus.PENDING ? 'text-amber-600' : 'text-rose-600'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <div className="text-right pl-2">
                <p className={`text-[15px] font-black tracking-tight ${tx.type === 'WITHDRAWAL' || tx.status === TaskStatus.REJECTED ? 'text-rose-600' : 'text-slate-900'}`}>
                  {tx.type === 'WITHDRAWAL' ? '-' : '+'}৳{tx.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="text-slate-200" size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Transactions will appear here</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-32"></div>
    </div>
  );
};

export default WalletScreen;
