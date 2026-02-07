import React, { useState, useRef } from 'react';
import { Submission, TaskStatus, Task, TutorialConfig, TutorialStep, AppAnalytics, AdminCredentials, AppConfig, WithdrawalMethod, Transaction } from '../types';
import { ShieldAlert, Check, X, User, Edit3, Plus, Trash2, CheckCircle2, Image as ImageIcon, Upload, ArrowLeft, PlayCircle, Video, ListOrdered, Link, PlusCircle, Layout, MessageSquare, Megaphone, Users, Zap, PlaySquare, Lock, Save, FileText, Smartphone, DollarSign, Globe, ExternalLink, CreditCard, Landmark, Download } from 'lucide-react';

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
  onBack: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ 
  analytics, submissions, withdrawals, tasks, tutorialConfig, appConfig, adminCredentials, 
  onUpdateAdminCredentials, onAction, onWithdrawAction, onAddTask, onUpdateTask, 
  onDeleteTask, onUpdateTutorialConfig, onUpdateAppConfig, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADS' | 'RECEIVED' | 'TASKS' | 'TUTORIAL_MANAGE' | 'FINANCE' | 'SECURITY'>('OVERVIEW');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const taskLogoInputRef = useRef<HTMLInputElement>(null);
  
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, { quantity: number; rate: number }>>({});

  // Security Form State
  const [secUsername, setSecUsername] = useState(adminCredentials.username);
  const [secPassword, setSecPassword] = useState(adminCredentials.password);

  // Task Form State
  const [formTask, setFormTask] = useState<{
    title: string; rate: string; rateType: string; buttonText: string; limit: string; icon: string; color: string; category: 'Social' | 'Survey' | 'Ads' | 'Bonus'; tutorialUrl: string; description: string;
  }>({
    title: '', rate: '5', rateType: 'Per ID', buttonText: 'Submit', limit: '100', icon: '📋', color: 'bg-emerald-500', category: 'Social', tutorialUrl: '', description: ''
  });

  const resetForm = () => {
    setFormTask({ title: '', rate: '5', rateType: 'Per ID', buttonText: 'Submit', limit: '100', icon: '📋', color: 'bg-emerald-500', category: 'Social', tutorialUrl: '', description: '' });
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormTask({ title: task.title, rate: task.rate.toString(), rateType: task.rateType, buttonText: task.buttonText, limit: task.limit.toString(), icon: task.icon, color: task.color, category: task.category, tutorialUrl: task.tutorialUrl || '', description: task.description || '' });
    setShowTaskForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Task = {
      id: editingTask ? editingTask.id : `t${Date.now()}`,
      title: formTask.title, rate: parseFloat(formTask.rate), rateType: formTask.rateType, buttonText: formTask.buttonText, limit: parseInt(formTask.limit), completed: editingTask ? editingTask.completed : 0, icon: formTask.icon, color: formTask.color, category: formTask.category, tutorialUrl: formTask.tutorialUrl, description: formTask.description
    };
    if (editingTask) onUpdateTask(taskData);
    else onAddTask(taskData);
    resetForm();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormTask(prev => ({ ...prev, icon: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminCredentials({ username: secUsername, password: secPassword });
    alert("Security credentials updated!");
  };

  const handleDownloadFile = (dataUrl: string, userName: string, taskTitle: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    const mimeMatch = dataUrl.match(/^data:([^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    let ext = 'bin';
    if (mime.includes('image/png')) ext = 'png';
    else if (mime.includes('image/jpeg')) ext = 'jpg';
    else if (mime.includes('spreadsheet') || mime.includes('excel')) ext = 'xlsx';
    
    link.download = `Proof_${userName.replace(/\s+/g, '_')}_${taskTitle.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderIcon = (icon: string) => {
    if (icon.startsWith('data:image') || icon.startsWith('http')) {
      return <img src={icon} alt="Icon" className="w-full h-full object-cover rounded-xl" />;
    }
    return <span className="text-xl flex items-center justify-center">{icon}</span>;
  };

  const SubmissionList = ({ groupedItems, tabType }: { groupedItems: Record<string, Submission[]>, tabType: 'LEADS' | 'RECEIVED' }) => {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {Object.keys(groupedItems).sort((a,b)=>b.localeCompare(a)).map((dateKey) => (
          <div key={dateKey} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">{dateKey} {tabType}</span>
            </div>
            <div className="space-y-4">
              {groupedItems[dateKey].map((sub) => {
                const adj = manualAdjustments[sub.id] || { quantity: sub.userQuantity, rate: sub.rate };
                const isImg = sub.screenshot?.startsWith('data:image/');
                return (
                  <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-5 shadow-sm flex flex-col gap-5 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><User size={18} /></div>
                        <div>
                          <h4 className="font-bold text-[13px] dark:text-slate-100">{sub.userName}</h4>
                          <p className="text-[8px] font-medium text-slate-500 uppercase tracking-widest">{sub.userEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                         <h5 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase">{sub.taskTitle}</h5>
                         <div className="flex items-center gap-2">
                            {sub.screenshot && isImg && (
                              <button onClick={() => setViewingScreenshot(sub.screenshot!)} className="text-emerald-600 text-[9px] font-black uppercase flex items-center gap-1 hover:opacity-70"><ImageIcon size={12} /> View</button>
                            )}
                            {sub.screenshot && (
                              <button onClick={() => handleDownloadFile(sub.screenshot!, sub.userName, sub.taskTitle)} className="text-blue-600 text-[9px] font-black uppercase flex items-center gap-1 hover:opacity-70"><Download size={12} /> Download</button>
                            )}
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                          <input type="number" value={adj.quantity} onChange={(e) => setManualAdjustments({...manualAdjustments, [sub.id]: {...adj, quantity: parseInt(e.target.value) || 0}})} className="w-full bg-white dark:bg-slate-800 p-2 rounded-xl text-[11px] font-bold dark:text-white border border-transparent focus:border-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rate</label>
                          <input type="number" value={adj.rate} onChange={(e) => setManualAdjustments({...manualAdjustments, [sub.id]: {...adj, rate: parseFloat(e.target.value) || 0}})} className="w-full bg-white dark:bg-slate-800 p-2 rounded-xl text-[11px] font-bold dark:text-white border border-transparent focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1"><span className="text-[10px] text-slate-400 font-bold uppercase">Total</span><span className="text-[14px] font-black text-emerald-600">৳{(adj.quantity * adj.rate).toFixed(2)}</span></div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => onAction(sub.id, TaskStatus.REJECTED)} className="flex-1 bg-rose-50 dark:bg-rose-900/20 text-rose-500 h-11 rounded-2xl border border-rose-100 dark:border-rose-900/30 font-bold text-[10px] uppercase">Reject</button>
                       <button onClick={() => onAction(sub.id, tabType === 'LEADS' ? TaskStatus.RECEIVED : TaskStatus.APPROVED, adj.quantity)} className={`flex-1 ${tabType === 'LEADS' ? 'bg-blue-600' : 'bg-emerald-600'} text-white h-11 rounded-2xl shadow-lg font-bold text-[10px] uppercase transition-all`}>{tabType === 'LEADS' ? 'Receive' : 'Approve'}</button>
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

  const FinanceManagement = () => {
    const [minWithdrawal, setMinWithdrawal] = useState(appConfig.minWithdrawal.toString());
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[4px] mb-6">Withdrawal Threshold</h4>
           <div className="space-y-4">
              <div className="relative">
                <input type="number" value={minWithdrawal} onChange={e => setMinWithdrawal(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl text-xl font-black dark:text-white border-2 border-transparent focus:border-emerald-500 outline-none pl-12" />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xl">৳</span>
              </div>
              <button onClick={() => onUpdateAppConfig({ ...appConfig, minWithdrawal: parseFloat(minWithdrawal) || 0 })} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-3xl font-bold text-[11px] uppercase tracking-[3px] active:scale-95">Update Global Min</button>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {appConfig.withdrawalMethods.map(m => (
            <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <img src={m.icon} className="w-8 h-8 object-contain" />
              <span className="text-[10px] font-black dark:text-white uppercase truncate">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RoadmapManagement = () => {
    const [heroVideo, setHeroVideo] = useState(tutorialConfig.heroVideoUrl);
    const [supportTele, setSupportTele] = useState(tutorialConfig.supportTelegram);
    const [channelTele, setChannelTele] = useState(tutorialConfig.telegramChannel);
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-4">
           <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[4px]">Platform Metadata</h4>
           <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl"><Video className="text-slate-400" size={18} /><input type="text" placeholder="Hero Video" value={heroVideo} onChange={e => setHeroVideo(e.target.value)} className="w-full bg-transparent text-[11px] font-bold dark:text-white outline-none" /></div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl"><Smartphone className="text-slate-400" size={18} /><input type="text" placeholder="Telegram Support" value={supportTele} onChange={e => setSupportTele(e.target.value)} className="w-full bg-transparent text-[11px] font-bold dark:text-white outline-none" /></div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl"><Megaphone className="text-slate-400" size={18} /><input type="text" placeholder="Telegram Channel" value={channelTele} onChange={e => setChannelTele(e.target.value)} className="w-full bg-transparent text-[11px] font-bold dark:text-white outline-none" /></div>
              <button onClick={() => onUpdateTutorialConfig({...tutorialConfig, heroVideoUrl: heroVideo, supportTelegram: supportTele, telegramChannel: channelTele})} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase active:scale-95">Sync Meta Updates</button>
           </div>
        </div>
        <div className="space-y-3">
           {tutorialConfig.steps.map(step => (
             <div key={step.id} className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xl shrink-0">{renderIcon(step.icon)}</div>
               <div className="flex-1 truncate"><h5 className="text-[12px] font-bold dark:text-white truncate uppercase">{step.title}</h5></div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 transition-colors">
      {viewingScreenshot && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setViewingScreenshot(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-rose-500"><X size={32} /></button>
          <img src={viewingScreenshot} alt="Proof" className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl" />
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl dark:text-slate-100 shadow-sm active:scale-90 transition-all"><ArrowLeft size={22} /></button>
        <div className="flex flex-col">
          <h2 className="text-[17px] font-black dark:text-slate-100 uppercase tracking-tight">Admin Core</h2>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px]">Secure Access Level</p>
        </div>
      </div>
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[26px] mb-8 overflow-x-auto no-scrollbar gap-1.5 shadow-inner">
        {(['OVERVIEW', 'LEADS', 'RECEIVED', 'TASKS', 'TUTORIAL_MANAGE', 'FINANCE', 'SECURITY'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[85px] py-3.5 rounded-[22px] font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
            {tab.split('_')[0]}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
           <div className="bg-slate-900 p-6 rounded-[40px] text-white overflow-hidden relative border border-transparent dark:border-slate-800 shadow-xl">
               <h3 className="text-4xl font-black mb-1 leading-none">{analytics.totalSignups}</h3>
               <p className="text-[9px] font-black uppercase tracking-[3px] opacity-40">Registered</p>
               <Users className="absolute -bottom-6 -right-6 text-white/5 rotate-12" size={120} />
           </div>
           <div className="bg-emerald-600 p-6 rounded-[40px] text-white overflow-hidden relative shadow-xl">
               <h3 className="text-4xl font-black mb-1 leading-none">{analytics.currentlyOnline}</h3>
               <p className="text-[9px] font-black uppercase tracking-[3px] opacity-40">Live Feed</p>
               <Zap className="absolute -bottom-6 -right-6 text-white/5 rotate-12" size={120} />
           </div>
        </div>
      )}

      {activeTab === 'TASKS' && (
        <div className="space-y-6">
           <button onClick={() => { resetForm(); setShowTaskForm(true); }} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/10 active:scale-95">New Inventory Entry</button>
           {showTaskForm && (
             <div ref={formRef} className="bg-white dark:bg-slate-900 p-7 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
               <div className="flex gap-5 items-center">
                  <div onClick={() => taskLogoInputRef.current?.click()} className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden">{formTask.icon ? renderIcon(formTask.icon) : <ImageIcon size={32}/>}</div>
                  <input type="file" ref={taskLogoInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  <div className="flex-1 space-y-3">
                     <input type="text" placeholder="Task Name" value={formTask.title} onChange={e => setFormTask({...formTask, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-[12px] font-black dark:text-white border-none focus:ring-2 focus:ring-emerald-500 outline-none" required />
                     <input type="text" placeholder="Unit (e.g. ID)" value={formTask.rateType} onChange={e => setFormTask({...formTask, rateType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-[12px] font-black dark:text-white border-none focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.1" value={formTask.rate} onChange={e => setFormTask({...formTask, rate: e.target.value})} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-[12px] font-black dark:text-white outline-none border-none focus:ring-2 focus:ring-emerald-500" required />
                  <input type="number" value={formTask.limit} onChange={e => setFormTask({...formTask, limit: e.target.value})} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-[12px] font-black dark:text-white outline-none border-none focus:ring-2 focus:ring-emerald-500" required />
               </div>
               <button onClick={handleSaveTask} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-6 rounded-3xl font-black text-[12px] uppercase active:scale-95 transition-all">Deploy Configuration</button>
             </div>
           )}
           <div className="space-y-4">
             {tasks.map(task => (
               <div key={task.id} className="bg-white dark:bg-slate-900 p-5 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
                 <div className={`${task.color} w-16 h-16 rounded-[28px] flex items-center justify-center shrink-0 text-3xl overflow-hidden shadow-inner`}>{renderIcon(task.icon)}</div>
                 <div className="flex-1 truncate"><h5 className="text-[14px] font-black dark:text-white truncate">{task.title}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mt-1">৳{task.rate} • Limit {task.limit}</p></div>
                 <div className="flex gap-2"><button onClick={() => handleEditTask(task)} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:text-emerald-500 transition-all"><Edit3 size={18} /></button><button onClick={() => onDeleteTask(task.id)} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:text-rose-500 transition-all"><Trash2 size={18} /></button></div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'LEADS' && <SubmissionList groupedItems={submissions.filter(s => s.status === TaskStatus.PENDING).reduce((g, s) => { const d = s.timestamp.split('T')[0]; if(!g[d]) g[d] = []; g[d].push(s); return g; }, {} as Record<string, Submission[]>)} tabType="LEADS" />}
      {activeTab === 'RECEIVED' && <SubmissionList groupedItems={submissions.filter(s => s.status === TaskStatus.RECEIVED).reduce((g, s) => { const d = s.timestamp.split('T')[0]; if(!g[d]) g[d] = []; g[d].push(s); return g; }, {} as Record<string, Submission[]>)} tabType="RECEIVED" />}
      {activeTab === 'FINANCE' && <FinanceManagement />}
      {activeTab === 'TUTORIAL_MANAGE' && <RoadmapManagement />}

      {activeTab === 'SECURITY' && (
        <div className="bg-slate-950 dark:bg-slate-900 rounded-[40px] p-10 text-white relative animate-in slide-in-from-bottom-4 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Lock size={140} /></div>
          <h3 className="text-xl font-black tracking-tight mb-10 flex items-center gap-4 relative z-10"><Lock className="text-emerald-500" size={24}/> Credential Vault</h3>
          <form onSubmit={handleUpdateSecurity} className="space-y-6 relative z-10">
            <div className="space-y-2">
               <label className="text-[9px] font-black text-white/40 uppercase tracking-[4px]">System Username</label>
               <input type="text" value={secUsername} onChange={e => setSecUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-white/40 uppercase tracking-[4px]">Secret Access Key</label>
               <input type="password" value={secPassword} onChange={e => setSecPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full bg-white text-slate-900 py-6 rounded-3xl text-[12px] font-black uppercase tracking-[5px] shadow-2xl active:scale-95 transition-all">Commit Security Updates</button>
          </form>
        </div>
      )}
      <div className="h-32"></div>
    </div>
  );
};

export default AdminScreen;