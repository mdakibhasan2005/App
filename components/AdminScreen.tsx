
import React, { useState, useEffect, useRef } from 'react';
import { Submission, TaskStatus, Transaction, Task, TutorialConfig, TutorialStep, AppAnalytics, AdminCredentials, AppConfig, WithdrawalMethod } from '../types';
import { ShieldAlert, Check, X, User, Edit3, Wallet, CreditCard, Plus, Trash2, LayoutList, CheckCircle2, Image as ImageIcon, Upload, Info, ExternalLink, ArrowLeft, History as HistoryIcon, BadgeCheck, DollarSign, PlayCircle, Video, ListOrdered, Link, PlusCircle, Layout, MessageSquare, Megaphone, BarChart3, Users, Zap, PlaySquare, UserMinus, Activity, Shield, Lock, Save, Eye, EyeOff, Landmark } from 'lucide-react';

interface AdminScreenProps {
  analytics: AppAnalytics;
  submissions: Submission[];
  withdrawals: Transaction[];
  tasks: Task[];
  tutorialConfig: TutorialConfig;
  appConfig: AppConfig;
  adminCredentials: AdminCredentials;
  onUpdateAdminCredentials: (creds: AdminCredentials) => void;
  onAction: (id: string, status: TaskStatus, approvedQuantity?: number) => void;
  onWithdrawAction: (id: string, status: TaskStatus) => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTutorialConfig: (config: TutorialConfig) => void;
  onUpdateAppConfig: (config: AppConfig) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ analytics, submissions, withdrawals, tasks, tutorialConfig, appConfig, adminCredentials, onUpdateAdminCredentials, onAction, onWithdrawAction, onAddTask, onUpdateTask, onDeleteTask, onUpdateTutorialConfig, onUpdateAppConfig }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADS' | 'RECEIVED' | 'WITHDRAWALS' | 'TASKS' | 'TUTORIAL_MANAGE' | 'FINANCE' | 'SECURITY'>('OVERVIEW');
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Security State
  const [newAdminUser, setNewAdminUser] = useState(adminCredentials.username);
  const [newAdminPass, setNewAdminPass] = useState(adminCredentials.password);
  const [showPass, setShowPass] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Local Tutorial Edit State
  const [editTutorial, setEditTutorial] = useState<TutorialConfig>(tutorialConfig);

  // Local App Config State (Finance)
  const [editAppConfig, setEditAppConfig] = useState<AppConfig>(appConfig);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [newMethod, setNewMethod] = useState<WithdrawalMethod>({
    id: '',
    name: '',
    icon: '',
    color: 'border-slate-200',
    activeBg: 'bg-slate-50'
  });

  const boxColors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-900', accent: 'bg-blue-600' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', accent: 'bg-emerald-600' },
    { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', accent: 'bg-amber-600' },
    { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-900', accent: 'bg-purple-600' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-900', accent: 'bg-rose-600' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', accent: 'bg-indigo-600' },
    { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-900', accent: 'bg-teal-600' },
  ];

  const getTaskStyle = (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      let hash = 0;
      for (let i = 0; i < taskId.length; i++) {
        hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
      }
      return boxColors[Math.abs(hash) % boxColors.length];
    }
    return boxColors[taskIndex % boxColors.length];
  };

  const pendingLeads = submissions.filter(s => s.status === TaskStatus.PENDING);
  const receivedLeads = submissions.filter(s => s.status === TaskStatus.RECEIVED);
  const approvedLeads = submissions.filter(s => s.status === TaskStatus.APPROVED);
  
  const waitingPayoutValue = receivedLeads.reduce((acc, curr) => acc + curr.amount, 0);

  const [formTask, setFormTask] = useState<{
    title: string;
    rate: string;
    rateType: string;
    buttonText: string;
    limit: string;
    icon: string;
    color: string;
    category: 'Social' | 'Survey' | 'Ads' | 'Bonus';
    tutorialUrl: string;
  }>({
    title: '',
    rate: '5',
    rateType: 'ID',
    buttonText: 'Submit',
    limit: '100',
    icon: '📋',
    color: 'bg-slate-200',
    category: 'Social',
    tutorialUrl: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormTask({
        title: editingTask.title,
        rate: editingTask.rate.toString(),
        rateType: editingTask.rateType,
        buttonText: editingTask.buttonText || 'Submit',
        limit: editingTask.limit.toString(),
        icon: editingTask.icon,
        color: editingTask.color,
        category: editingTask.category,
        tutorialUrl: editingTask.tutorialUrl || ''
      });
      setShowTaskForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [editingTask]);

  const resetForm = () => {
    setFormTask({
      title: '',
      rate: '5',
      rateType: 'ID',
      buttonText: 'Submit',
      limit: '100',
      icon: '📋',
      color: 'bg-slate-200',
      category: 'Social',
      tutorialUrl: ''
    });
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleOpenNewTaskForm = () => {
    resetForm();
    setActiveTab('TASKS');
    setShowTaskForm(true);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormTask(prev => ({ 
          ...prev, 
          icon: reader.result as string,
          color: 'bg-white' 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMethodIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMethod(prev => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMethod = () => {
    if (!newMethod.name || !newMethod.icon) return;
    const methodId = newMethod.name.toLowerCase().replace(/\s+/g, '-');
    setEditAppConfig({
      ...editAppConfig,
      withdrawalMethods: [...editAppConfig.withdrawalMethods, { ...newMethod, id: methodId }]
    });
    setNewMethod({ id: '', name: '', icon: '', color: 'border-slate-200', activeBg: 'bg-slate-50' });
    setShowMethodForm(false);
  };

  const handleRemoveMethod = (id: string) => {
    setEditAppConfig({
      ...editAppConfig,
      withdrawalMethods: editAppConfig.withdrawalMethods.filter(m => m.id !== id)
    });
  };

  const handleSaveFinanceConfig = () => {
    onUpdateAppConfig(editAppConfig);
    alert("Financial settings updated successfully!");
  };

  const renderIcon = (icon: string, className: string = "w-full h-full object-cover rounded-xl") => {
    if (icon.startsWith('data:image') || icon.startsWith('http')) {
      return <img src={icon} alt="Icon" className={className} />;
    }
    return <span className="text-xl">{icon}</span>;
  };

  const getUnitLabel = (type: string) => {
    return `1 ${type}`;
  };

  const handleQuantityChange = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    setEditedQuantities(prev => ({ ...prev, [id]: num }));
  };

  const getHeaderDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTask.title) return;

    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        title: formTask.title,
        rate: parseFloat(formTask.rate),
        rateType: formTask.rateType,
        buttonText: formTask.buttonText,
        limit: parseInt(formTask.limit),
        icon: formTask.icon,
        color: formTask.color,
        category: formTask.category,
        tutorialUrl: formTask.tutorialUrl,
        description: '' 
      };
      onUpdateTask(updatedTask);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: formTask.title,
        rate: parseFloat(formTask.rate),
        rateType: formTask.rateType,
        buttonText: formTask.buttonText,
        limit: parseInt(formTask.limit),
        completed: 0,
        icon: formTask.icon,
        color: formTask.color,
        category: formTask.category,
        tutorialUrl: formTask.tutorialUrl,
        description: '' 
      };
      onAddTask(newTask);
    }
    resetForm();
  };

  const handleTutorialUpdateStep = (idx: number, field: keyof TutorialStep, val: string) => {
    const newSteps = [...editTutorial.steps];
    newSteps[idx] = { ...newSteps[idx], [field]: val };
    setEditTutorial({ ...editTutorial, steps: newSteps });
  };

  const handleAddRoadmapStep = () => {
    const newStep: TutorialStep = {
      id: `step-${Date.now()}`,
      title: 'New Roadmap Step',
      desc: 'Explain what the user needs to do here.',
      iconType: 'check',
      buttonText: 'Watch Tutorial',
      buttonUrl: ''
    };
    setEditTutorial({ ...editTutorial, steps: [...editTutorial.steps, newStep] });
  };

  const handleRemoveRoadmapStep = (idx: number) => {
    const newSteps = editTutorial.steps.filter((_, i) => i !== idx);
    setEditTutorial({ ...editTutorial, steps: newSteps });
  };

  const handleSaveTutorialConfig = () => {
    onUpdateTutorialConfig(editTutorial);
    alert("Global Hub configuration updated successfully!");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser || !newAdminPass) return;
    
    setIsSavingSecurity(true);
    setTimeout(() => {
      onUpdateAdminCredentials({
        username: newAdminUser,
        password: newAdminPass
      });
      setIsSavingSecurity(false);
      alert("Admin credentials updated successfully!");
    }, 1500);
  };

  const groupedPending = pendingLeads.reduce((groups, sub) => {
    const dateKey = sub.timestamp.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(sub);
    return groups;
  }, {} as Record<string, Submission[]>);

  const groupedReceived = receivedLeads.reduce((groups, sub) => {
    const dateKey = sub.timestamp.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(sub);
    return groups;
  }, {} as Record<string, Submission[]>);

  const SubmissionList = ({ groupedItems, tabType }: { groupedItems: Record<string, Submission[]>, tabType: 'LEADS' | 'RECEIVED' }) => {
    return (
      <div className="space-y-8">
        {Object.keys(groupedItems).sort((a,b)=>b.localeCompare(a)).map((dateKey) => (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{getHeaderDate(dateKey)} {tabType === 'RECEIVED' ? 'RECEIVED' : 'QUEUE'}</span>
            </div>
            <div className="space-y-4">
              {groupedItems[dateKey].map((sub) => {
                const currentQuantity = editedQuantities[sub.id] ?? sub.userQuantity;
                const currentTotal = sub.rate * currentQuantity;
                const style = getTaskStyle(sub.taskId);
                return (
                  <div key={sub.id} className={`${style.bg} ${style.border} rounded-[32px] p-5 border shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden">
                          <User size={18} />
                        </div>
                        <div>
                          <h4 className={`font-black text-[13px] ${style.text} leading-none truncate tracking-tight`}>{sub.userName}</h4>
                          <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Submitter</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-white/50 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{sub.taskTitle}</h5>
                        <p className="text-[10px] font-black text-emerald-600">৳{sub.rate}/{getUnitLabel(sub.rateType)}</p>
                      </div>
                      <p className="text-slate-700 font-bold text-[11px] leading-relaxed break-words bg-slate-50/50 p-2 rounded-xl">{sub.details}</p>
                      {sub.screenshot && (
                        <button onClick={() => setViewingScreenshot(sub.screenshot || null)} className="mt-3 flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 active:scale-95 transition-all w-full justify-center">
                          <ImageIcon size={14} /> View Proof Screenshot
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Qty Control</p>
                          <input 
                            type="number"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(sub.id, e.target.value)}
                            className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="text-right border-l border-slate-100 pl-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Final Value</p>
                          <p className={`text-[13px] font-black ${tabType === 'RECEIVED' ? 'text-blue-700' : 'text-emerald-700'}`}>৳{currentTotal.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onAction(sub.id, TaskStatus.REJECTED)} className="w-12 h-12 bg-white text-rose-500 rounded-2xl border border-rose-100 flex items-center justify-center shadow-sm active:scale-90 transition-all"><X size={20} /></button>
                        {tabType === 'LEADS' ? (
                          <button onClick={() => onAction(sub.id, TaskStatus.RECEIVED, currentQuantity)} className="px-4 h-12 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-90 transition-all font-black uppercase text-[10px] tracking-widest">
                            <Check size={16} /> Receive
                          </button>
                        ) : (
                          <button onClick={() => onAction(sub.id, TaskStatus.APPROVED, currentQuantity)} className="px-4 h-12 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-90 transition-all font-black uppercase text-[10px] tracking-widest">
                            <Check size={16} /> Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 animate-in fade-in duration-500">
      {/* Screenshot Viewer Overlay */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <button onClick={() => setViewingScreenshot(null)} className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full">
            <X size={32} />
          </button>
          <img src={viewingScreenshot} alt="Submission Screenshot" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
          <p className="text-white/60 text-xs font-black uppercase mt-4 tracking-widest">User Submission Proof</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Admin Panel</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Hub</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`p-3 rounded-2xl shadow-xl transition-all ${activeTab === 'SECURITY' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}
          >
            <Shield size={18} />
          </button>
          <button 
            onClick={handleOpenNewTaskForm}
            className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">New Task</span>
          </button>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-[22px] mb-6 overflow-x-auto no-scrollbar gap-1">
        <button 
          onClick={() => { setActiveTab('OVERVIEW'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => { setActiveTab('LEADS'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'LEADS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Queue
        </button>
        <button 
          onClick={() => { setActiveTab('RECEIVED'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'RECEIVED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Received
        </button>
        <button 
          onClick={() => { setActiveTab('WITHDRAWALS'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'WITHDRAWALS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Payouts
        </button>
        <button 
          onClick={() => { setActiveTab('TASKS'); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'TASKS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => { setActiveTab('TUTORIAL_MANAGE'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'TUTORIAL_MANAGE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Global Hub
        </button>
        <button 
          onClick={() => { setActiveTab('FINANCE'); setShowTaskForm(false); }}
          className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 rounded-[18px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'FINANCE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          Finance
        </button>
      </div>

      {activeTab === 'SECURITY' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
             
             <div className="flex items-center gap-4 mb-8 relative z-10">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                 <Shield size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-black tracking-tight leading-none text-white">Security Console</h3>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Update Master Credentials</p>
               </div>
             </div>

             <form onSubmit={handleSaveSecurity} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">New Administrator Username</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-3xl text-white font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/10"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">New Administrative Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPass ? 'text' : 'password'}
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-5 pl-12 pr-12 rounded-3xl text-white font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/10"
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingSecurity}
                  className="w-full bg-indigo-600 py-6 rounded-3xl text-white font-black text-[11px] uppercase tracking-[3px] shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSavingSecurity ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Update Admin Access <Save size={18} /></>
                  )}
                </button>
             </form>
           </div>
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Landmark size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">Financial Control</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Withdrawal Limits & Gateways</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Min Withdrawal Config */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
                <label className="block text-[9px] font-black text-white/40 uppercase tracking-[2px] mb-3 ml-1">Minimum Payout Limit (৳)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">৳</span>
                    <input 
                      type="number"
                      value={editAppConfig.minWithdrawal}
                      onChange={(e) => setEditAppConfig({...editAppConfig, minWithdrawal: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-xl font-black focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Methods List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} /> Active Gateways
                  </h4>
                  <button 
                    onClick={() => setShowMethodForm(true)}
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add Method
                  </button>
                </div>

                {showMethodForm && (
                  <div className="bg-white/10 border border-white/10 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">New Method Setup</span>
                      <button onClick={() => setShowMethodForm(false)} className="text-white/40"><X size={16} /></button>
                    </div>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={newMethod.name}
                        onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none" 
                        placeholder="Method Name (e.g. PayPal)" 
                      />
                      <div className="flex items-center gap-3">
                        <div onClick={() => fileInputRef.current?.click()} className="flex-1 bg-black/20 border border-dashed border-white/20 rounded-xl h-24 flex flex-col items-center justify-center text-[10px] font-black uppercase cursor-pointer hover:bg-black/40">
                          {newMethod.icon ? (
                            <img src={newMethod.icon} alt="Preview" className="h-12 object-contain" />
                          ) : (
                            <>
                              <Upload size={20} className="mb-1 opacity-40" />
                              <span>Upload Logo</span>
                            </>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleMethodIconUpload} />
                      </div>
                      <button 
                        onClick={handleAddMethod}
                        className="w-full bg-emerald-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                      >
                        Add Gateway
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {editAppConfig.withdrawalMethods.map((method) => (
                    <div key={method.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                          <img src={method.icon} alt={method.name} className="h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[13px] font-black tracking-tight">{method.name}</p>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active System ID: {method.id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMethod(method.id)}
                        className="p-3 text-white/20 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSaveFinanceConfig}
                className="w-full bg-emerald-600 py-6 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[3px] shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all mt-4"
              >
                Sync Financial Hub <Save size={18} className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-5 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <Users className="text-emerald-500 mb-2" size={20} />
                 <h3 className="text-2xl font-black text-white tracking-tight">{analytics.totalSignups.toLocaleString()}</h3>
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Total Registered Users</p>
               </div>
               <BarChart3 className="absolute -bottom-4 -right-4 text-white/5" size={80} />
            </div>

            <div className="bg-slate-900 p-5 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <Activity className="text-blue-500 mb-2" size={20} />
                 <h3 className="text-2xl font-black text-white tracking-tight">{analytics.activeLast72h.toLocaleString()}</h3>
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Active Users (72h)</p>
               </div>
               <Zap className="absolute -bottom-4 -right-4 text-white/5" size={80} />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-[40px] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[2px]">Real-time Pulse</span>
              </div>
              <div className="bg-emerald-500/10 px-3 py-1 rounded-full">
                 <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Now</span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="text-5xl font-black text-white tracking-tighter">{analytics.currentlyOnline.toLocaleString()}</h2>
              <span className="text-emerald-500 font-black text-xs uppercase">Users Online</span>
            </div>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Global sessions currently active</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[32px] custom-shadow border border-slate-50 flex flex-col gap-2">
              <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600">
                <PlaySquare size={20} />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">{analytics.tutorialViewsLast72h.toLocaleString()}</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tutorial Views (72h)</p>
            </div>

            <div className="bg-white p-5 rounded-[32px] custom-shadow border border-slate-50 flex flex-col gap-2">
              <div className="bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center text-rose-600">
                <UserMinus size={20} />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">{analytics.uninstalls.toLocaleString()}</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Uninstalled Count</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LEADS' && (
        pendingLeads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <CheckCircle2 className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">All submissions reviewed</p>
          </div>
        ) : (
          <SubmissionList groupedItems={groupedPending} tabType="LEADS" />
        )
      )}

      {activeTab === 'RECEIVED' && (
        receivedLeads.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <HistoryIcon className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No received history</p>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-4 shadow-xl">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Received Status Hub</p>
               <h3 className="text-3xl font-black tracking-tight">৳{waitingPayoutValue.toLocaleString()}</h3>
               <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Value waiting for payout</p>
             </div>
             <SubmissionList groupedItems={groupedReceived} tabType="RECEIVED" />
          </div>
        )
      )}

      {activeTab === 'TASKS' && (
        <div className="space-y-6">
          {showTaskForm && (
            <div ref={formRef} className={`rounded-[40px] p-6 text-white custom-shadow transition-all animate-in slide-in-from-top-4 duration-300 ${editingTask ? 'bg-indigo-950' : 'bg-slate-900'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white/10 ${editingTask ? 'text-indigo-400' : 'text-emerald-400'}`}>
                    {editingTask ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    {editingTask ? 'Edit Task Listing' : 'Setup New Daily Task'}
                  </h3>
                </div>
                <button onClick={resetForm} className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div>
                  <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                  <input type="text" value={formTask.title} onChange={(e) => setFormTask({...formTask, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[13px] font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10" placeholder="e.g. Instagram Account Verification" required />
                </div>
                
                <div>
                  <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Tutorial Video Link (YouTube)</label>
                  <div className="relative">
                    <input type="text" value={formTask.tutorialUrl} onChange={(e) => setFormTask({...formTask, tutorialUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-[13px] font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20" placeholder="https://youtube.com/watch?v=..." />
                    <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 py-2">
                  <label className="w-full text-[9px] font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Icon / Illustration</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/40 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all overflow-hidden" >
                    {formTask.icon.startsWith('data:image') || formTask.icon.startsWith('http') ? (
                      <div className="relative w-full h-full group">
                        <img src={formTask.icon} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={24} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white/5 rounded-2xl mb-2"><Upload size={24} className="text-white/40" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Custom Icon</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Reward Rate (৳)</label>
                    <input type="number" value={formTask.rate} onChange={(e) => setFormTask({...formTask, rate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Reward Unit</label>
                    <input 
                      type="text" 
                      value={formTask.rateType} 
                      onChange={(e) => setFormTask({...formTask, rateType: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[13px] font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-white/40 text-white" 
                      placeholder="e.g. ID, 1K, STAR" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[2px] transition-all shadow-2xl active:scale-[0.98] ${editingTask ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>
                  {editingTask ? 'Confirm Task Updates' : 'Publish Daily Task'}
                </button>
              </form>
            </div>
          )}
          {!showTaskForm && (
            <button onClick={() => setShowTaskForm(true)} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all bg-white shadow-sm" >
              <div className="bg-slate-50 p-4 rounded-3xl"><Plus size={32} /></div>
              <span className="text-[11px] font-black uppercase tracking-[3px]">Create New Task Listing</span>
            </button>
          )}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest px-2"><LayoutList size={14} className="text-slate-400" /> Active Inventory ({tasks.length})</h3>
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-[30px] flex items-center gap-4 custom-shadow border border-slate-50 group transition-all">
                  <div className={`${task.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-white/10"></div>
                    {renderIcon(task.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-[13px] truncate tracking-tight leading-none">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-tighter">৳{task.rate}/{getUnitLabel(task.rateType)}</span>
                       {task.tutorialUrl && <span className="bg-blue-50 text-blue-600 font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1"><PlayCircle size={8}/> Video</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingTask(task)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => onDeleteTask(task.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TUTORIAL_MANAGE' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Video size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">Global Learner Hub</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Configure Onboarding & Support</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Task Entry Point */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Layout size={16} />
                   </div>
                   <h4 className="text-[11px] font-black uppercase tracking-widest">Inventory Control</h4>
                </div>
                <button 
                  onClick={() => { setActiveTab('TASKS'); setShowTaskForm(true); }}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <PlusCircle size={16} /> Add New Task to Inventory
                </button>
              </div>

              {/* Support Settings Section */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                      <MessageSquare size={16} />
                   </div>
                   <h4 className="text-[11px] font-black uppercase tracking-widest">Support Settings</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Support Telegram Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={editTutorial.supportTelegram} 
                        onChange={(e) => setEditTutorial({...editTutorial, supportTelegram: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-[13px] font-bold focus:outline-none focus:border-emerald-500 transition-all text-white" 
                        placeholder="TelegramUsername" 
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">@</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Official Telegram Channel</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={editTutorial.telegramChannel} 
                        onChange={(e) => setEditTutorial({...editTutorial, telegramChannel: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-[13px] font-bold focus:outline-none focus:border-amber-500 transition-all text-white" 
                        placeholder="ChannelUsername" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                         <Megaphone size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Main Landing Video (YouTube URL)</label>
                <input 
                  type="text" 
                  value={editTutorial.heroVideoUrl} 
                  onChange={(e) => setEditTutorial({...editTutorial, heroVideoUrl: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[13px] font-bold focus:outline-none focus:border-white/30 transition-all text-white" 
                  placeholder="https://..." 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <ListOrdered size={14} /> Roadmap Steps ({editTutorial.steps.length})
                  </label>
                  <button 
                    onClick={handleAddRoadmapStep}
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 hover:underline"
                  >
                    <PlusCircle size={12} /> Add Step
                  </button>
                </div>
                
                <div className="space-y-8">
                  {editTutorial.steps.map((step, idx) => (
                    <div key={step.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 relative group">
                      <button 
                        onClick={() => handleRemoveRoadmapStep(idx)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Step 0{idx + 1} Editor</span>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest">Title & Description</label>
                        <input 
                          type="text" 
                          value={step.title} 
                          onChange={(e) => handleTutorialUpdateStep(idx, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-black focus:outline-none focus:border-emerald-500 transition-all" 
                          placeholder="Step Title" 
                        />
                        <textarea 
                          value={step.desc} 
                          onChange={(e) => handleTutorialUpdateStep(idx, 'desc', e.target.value)}
                          className="w-full bg-transparent text-[11px] font-medium text-white/60 focus:outline-none resize-none h-16 border border-white/5 p-2 rounded-xl mt-1" 
                          placeholder="Step Description" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-2">
                          <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1"><Edit3 size={8}/> Button Label</label>
                          <input 
                            type="text" 
                            value={step.buttonText || ''} 
                            onChange={(e) => handleTutorialUpdateStep(idx, 'buttonText', e.target.value)}
                            className="w-full bg-white/5 rounded-xl px-3 py-2 text-[10px] font-black focus:outline-none focus:bg-white/10" 
                            placeholder="e.g. Watch Video" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1"><Link size={8}/> Action Link</label>
                          <input 
                            type="text" 
                            value={step.buttonUrl || ''} 
                            onChange={(e) => handleTutorialUpdateStep(idx, 'buttonUrl', e.target.value)}
                            className="w-full bg-white/5 rounded-xl px-3 py-2 text-[10px] font-black focus:outline-none focus:bg-white/10" 
                            placeholder="https://..." 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSaveTutorialConfig}
                className="w-full bg-emerald-600 py-6 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[3px] shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all mt-4"
              >
                Save All Config
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'WITHDRAWALS' && (
        withdrawals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <Wallet className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No payout requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((wd) => (
              <div key={wd.id} className="bg-white rounded-[32px] p-5 custom-shadow border border-slate-50 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-slate-900 leading-none tracking-tight">Withdrawal Hub</h4>
                      <p className="text-[10px] font-black text-emerald-600 uppercase mt-1.5 tracking-widest">{wd.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-black text-slate-900">৳{wd.amount}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Request Amount</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest flex items-center gap-1.5"><Info size={12} /> Account Verification Info</p>
                  <p className="text-[11px] font-black text-slate-800 break-all">{wd.details?.replace('Account: ', '')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => onWithdrawAction(wd.id, TaskStatus.REJECTED)} className="bg-white text-rose-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-50 active:scale-95 transition-all">Reject Payout</button>
                  <button onClick={() => onWithdrawAction(wd.id, TaskStatus.APPROVED)} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Confirm Payout</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      <div className="h-32"></div>
    </div>
  );
};

export default AdminScreen;
