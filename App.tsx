import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Screen, Task, TaskStatus, Transaction, Submission, TutorialConfig, UserProfile, AppAnalytics, AdminCredentials, UserAccount, UserBalance, AppConfig } from './types';
import { MOCK_TASKS } from './constants';
import HomeScreen from './components/HomeScreen';
import WalletScreen from './components/WalletScreen';
import SubmitTaskScreen from './components/SubmitTaskScreen';
import WithdrawScreen from './components/WithdrawScreen';
import AdminScreen from './components/AdminScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import ProfileScreen from './components/ProfileScreen';
import LoginScreen from './components/LoginScreen';
import TutorialScreen from './components/TutorialScreen';
import AccountSettingsScreen from './components/AccountSettingsScreen';
import { Home, Wallet, User, Bell, PlayCircle, Sparkles, X, MessageSquare, Send, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // STORAGE KEYS
  const STORAGE_KEY_USERS = 'akibpay_users';
  const STORAGE_KEY_TASKS = 'akibpay_tasks';
  const STORAGE_KEY_BALANCES = 'akibpay_user_balances';
  const STORAGE_KEY_SUBMISSIONS = 'akibpay_submissions';
  const STORAGE_KEY_TRANSACTIONS = 'akibpay_transactions';
  const STORAGE_KEY_TUTORIAL = 'akibpay_tutorial_config';
  const STORAGE_KEY_CONFIG = 'akibpay_app_config';

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : [{ name: 'Rahat Islam', email: 'rahat@test.com', password: 'password123' }];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [userBalances, setUserBalances] = useState<Record<string, UserBalance>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BALANCES);
    return saved ? JSON.parse(saved) : {};
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    const defaultConfig: AppConfig = {
      minWithdrawal: 20,
      withdrawalMethods: [
        { id: 'bKash', name: 'bKash', icon: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo.png', color: 'border-[#D12053]', activeBg: 'bg-[#D12053]/5' },
        { id: 'Nagad', name: 'Nagad', icon: 'https://freelogopng.com/images/all_img/1656234832nagad-logo-png.png', color: 'border-[#F7941D]', activeBg: 'bg-[#F7941D]/5' },
        { id: 'Rocket', name: 'Rocket', icon: 'https://freelogopng.com/images/all_img/1656234907rocket-logo-png.png', color: 'border-[#8C3494]', activeBg: 'bg-[#8C3494]/5' },
        { id: 'Binance', name: 'Binance', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/1024px-Binance_logo.svg.png', color: 'border-[#F3BA2F]', activeBg: 'bg-[#F3BA2F]/5' },
      ]
    };
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  const [tutorialConfig, setTutorialConfig] = useState<TutorialConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TUTORIAL);
    const defaultTutorial = {
      heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      supportTelegram: 'AkibPaySupport',
      telegramChannel: 'AkibPayOfficial',
      steps: [
        { id: '1', title: 'Complete Profile', desc: 'Ensure your account is verified for higher payouts.', iconType: 'check' },
        { id: '2', title: 'Select a Task', desc: 'Browse daily inventory and choose tasks you like.', iconType: 'book' },
        { id: '3', title: 'Submit Evidence', desc: 'Take screenshots as proof of your work completion.', iconType: 'info' },
        { id: '4', title: 'Request Payout', desc: 'Withdraw your earnings instantly to bKash or Nagad.', iconType: 'star' },
      ]
    };
    return saved ? JSON.parse(saved) : defaultTutorial;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    email: '',
    phone: '',
    joinDate: 'Oct 2023'
  });

  const activeBalance = userBalances[userProfile.email] || { total: 0, available: 0, pending: 0 };

  useEffect(() => localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registeredUsers)), [registeredUsers]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(userBalances)), [userBalances]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions)), [submissions]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TUTORIAL, JSON.stringify(tutorialConfig)), [tutorialConfig]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(appConfig)), [appConfig]);

  const [adminCreds, setAdminCreds] = useState<AdminCredentials>({
    username: 'akibneel',
    password: 'Akib@100'
  });

  const [analytics, setAnalytics] = useState<AppAnalytics>({
    totalSignups: registeredUsers.length,
    activeLast72h: 124,
    currentlyOnline: 18,
    tutorialViewsLast72h: 456,
    uninstalls: 5
  });

  const [notification, setNotification] = useState<{show: boolean, title: string, body: string} | null>(null);

  const showSmsNotification = (title: string, body: string) => {
    setNotification({ show: true, title, body });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAskAi = async () => {
    if (!aiMessage.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User is using Akib Pay, a task earning app in Bangladesh. User asks: "${aiMessage}". 
        Give a short, helpful response in Bengali and English (mixed) about how they can earn more or solve their issue. 
        Current available balance: ৳${activeBalance.available}. Min withdrawal: ৳${appConfig.minWithdrawal}.`,
        config: {
          systemInstruction: "You are the Akib Pay Earning Assistant. You help users maximize their daily income from micro-tasks in Bangladesh. Be polite and encouraging."
        }
      });
      setAiResponse(response.text || "Sorry, I couldn't process that. Please try again.");
    } catch (err) {
      setAiResponse("Assistant error: Ensure API_KEY is set in Netlify Environment Variables.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setCurrentScreen('SUBMIT_TASK');
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    showSmsNotification("Task Created", `Successfully added "${newTask.title}".`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    showSmsNotification("Task Updated", `Changes to "${updatedTask.title}" saved.`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    showSmsNotification("Task Removed", "Task deleted from inventory.");
  };

  const handleSubmitTask = (taskId: string, details: string, amount: number, screenshot?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const submissionId = `sub-${Date.now()}`;
    const userQuantity = Math.round(amount / task.rate);

    const newSubmission: Submission = {
      id: submissionId,
      userId: 'currentUser',
      userEmail: userProfile.email,
      userName: userProfile.name,
      taskId: task.id,
      taskTitle: task.title,
      rate: task.rate,
      rateType: task.rateType,
      userQuantity: userQuantity,
      amount: amount,
      details,
      screenshot,
      status: TaskStatus.PENDING,
      timestamp: new Date().toISOString()
    };

    const newTransaction: Transaction = {
      id: `tr-${Date.now()}`,
      userEmail: userProfile.email,
      taskName: task.title,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: TaskStatus.PENDING,
      details: details,
      type: 'EARNING'
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    setTransactions(prev => [newTransaction, ...prev]);
    
    setUserBalances(prev => {
      const current = prev[userProfile.email] || { total: 0, available: 0, pending: 0 };
      return { ...prev, [userProfile.email]: { ...current, pending: current.pending + amount } };
    });

    showSmsNotification("Submission Received", "Your task is under review.");
    setCurrentScreen('HOME');
  };

  const handleLogin = (user: UserAccount) => {
    setUserProfile({ name: user.name, email: user.email, phone: '', joinDate: 'Oct 2023' });
    setIsLoggedIn(true);
    setCurrentScreen('HOME');
  };

  const handleSignup = (user: UserAccount) => {
    setRegisteredUsers(prev => [...prev, user]);
    showSmsNotification("Welcome!", "Account created successfully.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminAuthenticated(false);
    setCurrentScreen('HOME');
  };

  const handleAdminAction = (id: string, status: TaskStatus, approvedQuantity?: number) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, userQuantity: approvedQuantity ?? s.userQuantity } : s));
    setTransactions(prev => prev.map(tx => (tx.userEmail === sub.userEmail && tx.taskName === sub.taskTitle && tx.status === TaskStatus.PENDING) ? { ...tx, status, amount: approvedQuantity ? approvedQuantity * sub.rate : tx.amount } : tx));

    if (status === TaskStatus.APPROVED) {
        const finalAmount = approvedQuantity ? approvedQuantity * sub.rate : sub.amount;
        setUserBalances(prev => {
            const current = prev[sub.userEmail] || { total: 0, available: 0, pending: 0 };
            return {
                ...prev,
                [sub.userEmail]: {
                    total: current.total + finalAmount,
                    available: current.available + finalAmount,
                    pending: Math.max(0, current.pending - sub.amount)
                }
            };
        });
    } else if (status === TaskStatus.REJECTED) {
        setUserBalances(prev => {
            const current = prev[sub.userEmail] || { total: 0, available: 0, pending: 0 };
            return { ...prev, [sub.userEmail]: { ...current, pending: Math.max(0, current.pending - sub.amount) } };
        });
    }
  };

  const handleWithdrawAction = (id: string, status: TaskStatus) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status } : tx));
  };

  const handleWithdrawSubmit = (method: string, account: string, amount: number) => {
    const newTx: Transaction = {
      id: `wd-${Date.now()}`,
      userEmail: userProfile.email,
      taskName: 'Withdrawal Request',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: TaskStatus.PENDING,
      details: `Account: ${account}`,
      type: 'WITHDRAWAL',
      method: method
    };

    setTransactions(prev => [newTx, ...prev]);
    setUserBalances(prev => {
      const current = prev[userProfile.email];
      return { ...prev, [userProfile.email]: { ...current, available: current.available - amount } };
    });

    showSmsNotification("Withdrawal Requested", `Payout of ৳${amount} processing.`);
    setCurrentScreen('HOME');
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    showSmsNotification("Profile Updated", "Changes saved.");
    setCurrentScreen('PROFILE');
  };

  const renderScreen = () => {
    if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} users={registeredUsers} />;
    if (currentScreen === 'ADMIN_LOGIN' && !isAdminAuthenticated) return <AdminLoginScreen credentials={adminCreds} onLoginSuccess={() => setIsAdminAuthenticated(true)} onBack={() => setCurrentScreen('PROFILE')} />;
    if (isAdminAuthenticated && currentScreen === 'ADMIN') {
      return (
        <AdminScreen 
          analytics={analytics} submissions={submissions} withdrawals={transactions.filter(t => t.type === 'WITHDRAWAL')} tasks={tasks}
          tutorialConfig={tutorialConfig} appConfig={appConfig} adminCredentials={adminCreds} onUpdateAdminCredentials={setAdminCreds}
          onAction={handleAdminAction} onWithdrawAction={handleWithdrawAction} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask} onUpdateTutorialConfig={setTutorialConfig} onUpdateAppConfig={setAppConfig}
        />
      );
    }

    switch (currentScreen) {
      case 'HOME': return <HomeScreen balance={activeBalance} tasks={tasks} onTaskClick={handleTaskClick} userName={userProfile.name} />;
      case 'WALLET': return <WalletScreen balance={activeBalance} appConfig={appConfig} transactions={transactions.filter(t => t.userEmail === userProfile.email)} onWithdrawClick={() => setCurrentScreen('WITHDRAW')} />;
      case 'SUBMIT_TASK': return selectedTask ? <SubmitTaskScreen task={selectedTask} onSubmit={handleSubmitTask} onBack={() => setCurrentScreen('HOME')} /> : <HomeScreen balance={activeBalance} tasks={tasks} onTaskClick={handleTaskClick} userName={userProfile.name} />;
      case 'WITHDRAW': return <WithdrawScreen availableBalance={activeBalance.available} appConfig={appConfig} onSubmit={handleWithdrawSubmit} onBack={() => setCurrentScreen('WALLET')} />;
      case 'PROFILE': return <ProfileScreen userProfile={userProfile} supportTelegram={tutorialConfig.supportTelegram} telegramChannel={tutorialConfig.telegramChannel} onAdminClick={() => isAdminAuthenticated ? setCurrentScreen('ADMIN') : setCurrentScreen('ADMIN_LOGIN')} onSettingsClick={() => setCurrentScreen('ACCOUNT_SETTINGS')} onLogout={handleLogout} />;
      case 'TUTORIAL': return <TutorialScreen config={tutorialConfig} />;
      case 'ACCOUNT_SETTINGS': return <AccountSettingsScreen profile={userProfile} onSave={handleSaveProfile} onBack={() => setCurrentScreen('PROFILE')} />;
      default: return <HomeScreen balance={activeBalance} tasks={tasks} onTaskClick={handleTaskClick} userName={userProfile.name} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative flex flex-col font-sans">
      {/* AI Assistant Floating Bubble (The requested Bubble) */}
      {isLoggedIn && (
        <div className="ai-bubble" onClick={() => setIsAiOpen(true)}>
          <div className="ai-pulse"></div>
          <BrainCircuit size={28} />
        </div>
      )}

      {/* AI Assistant Drawer */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight leading-none">Smart Assistant</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Powered Support</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                <p className="text-[12px] text-emerald-800 font-medium leading-relaxed">
                  Hi {userProfile.name}! I am your personal AI guide. Ask me how to earn more or how to withdraw!
                </p>
              </div>

              {aiResponse && (
                <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl animate-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Gemini Response</span>
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pb-4">
              <div className="relative group">
                <input 
                  type="text" 
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAi()}
                  placeholder="Ask me anything..."
                  className="w-full bg-slate-100 p-5 pr-14 rounded-3xl font-bold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button 
                  onClick={handleAskAi}
                  disabled={isAiLoading || !aiMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
                >
                  {isAiLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[200] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4 items-start">
             <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20"><Bell size={18} /></div>
             <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{notification.title}</h4>
                <p className="text-[10px] text-white/60 font-medium leading-tight mt-1">{notification.body}</p>
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">{renderScreen()}</div>

      {isLoggedIn && currentScreen !== 'SUBMIT_TASK' && currentScreen !== 'WITHDRAW' && currentScreen !== 'ADMIN' && currentScreen !== 'ADMIN_LOGIN' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
          <button onClick={() => setCurrentScreen('HOME')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'HOME' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <Home size={22} /><span className="text-[8px] font-black uppercase tracking-tighter">Tasks</span>
          </button>
          <button onClick={() => setCurrentScreen('WALLET')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'WALLET' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <Wallet size={22} /><span className="text-[8px] font-black uppercase tracking-tighter">Wallet</span>
          </button>
          <button onClick={() => setCurrentScreen('TUTORIAL')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'TUTORIAL' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <PlayCircle size={22} /><span className="text-[8px] font-black uppercase tracking-tighter">Learn</span>
          </button>
          <button onClick={() => setCurrentScreen('PROFILE')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'PROFILE' ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
            <User size={22} /><span className="text-[8px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;