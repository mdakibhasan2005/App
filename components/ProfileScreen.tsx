
import React from 'react';
import { User, Settings, Shield, LogOut, ChevronRight, Send, Megaphone } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  supportTelegram?: string;
  telegramChannel?: string;
  onAdminClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  userProfile, 
  supportTelegram,
  telegramChannel,
  onAdminClick, 
  onSettingsClick, 
  onLogout 
}) => {
  const handleTelegramSupport = () => {
    if (supportTelegram) {
      window.open(`https://t.me/${supportTelegram}`, '_blank');
    }
  };

  const handleTelegramChannel = () => {
    if (telegramChannel) {
      window.open(`https://t.me/${telegramChannel}`, '_blank');
    }
  };

  const menuItems = [
    { icon: <Shield size={18} className="text-blue-500" />, label: 'Admin Dashboard', action: onAdminClick, show: true },
    { icon: <Settings size={18} className="text-slate-500" />, label: 'Account Settings', action: onSettingsClick, show: true },
    { 
      icon: <Send size={18} className="text-emerald-500" />, 
      label: 'Telegram Support', 
      action: handleTelegramSupport, 
      show: !!supportTelegram 
    },
    { 
      icon: <Megaphone size={18} className="text-amber-500" />, 
      label: 'Telegram Channel', 
      action: handleTelegramChannel, 
      show: !!telegramChannel 
    },
    { icon: <LogOut size={18} className="text-red-500" />, label: 'Log Out', action: onLogout, show: true, isLast: true },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-6 animate-in slide-in-from-left-10 duration-500">
      <div className="flex flex-col items-center mb-10 mt-8">
        <div className="w-28 h-28 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-[35px] flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-green-100 mb-4 border-4 border-white">
          {getInitials(userProfile.name)}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
      </div>

      <div className="bg-white rounded-3xl custom-shadow overflow-hidden">
        {menuItems.filter(i => i.show).map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className={`w-full flex items-center gap-4 p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left ${idx !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
          >
            <div className="bg-slate-50 p-2 rounded-xl">
              {item.icon}
            </div>
            <span className={`flex-1 font-bold text-sm ${item.isLast ? 'text-red-500' : 'text-slate-700'}`}>
              {item.label}
            </span>
            {!item.isLast && <ChevronRight size={18} className="text-slate-300" />}
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[4px]">Akib Pay v3.1.2</p>
      </div>
      
      <div className="h-24"></div>
    </div>
  );
};

export default ProfileScreen;
