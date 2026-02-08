import React, { useState, useEffect } from 'react';
import { Screen, Task, TaskStatus, Transaction, Submission, TutorialConfig, UserProfile, AppAnalytics, AdminCredentials, UserAccount, UserBalance, AppConfig } from './types.ts';
import { MOCK_TASKS } from './constants.tsx';
import HomeScreen from './components/HomeScreen.tsx';
import WalletScreen from './components/WalletScreen.tsx';
import SubmitTaskScreen from './components/SubmitTaskScreen.tsx';
import WithdrawScreen from './components/WithdrawScreen.tsx';
import AdminScreen from './components/AdminScreen.tsx';
import AdminLoginScreen from './components/AdminLoginScreen.tsx';
import ProfileScreen from './components/ProfileScreen.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import TutorialScreen from './components/TutorialScreen.tsx';
import AccountSettingsScreen from './components/AccountSettingsScreen.tsx';
import { Home, Wallet, User, Bell, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const STORAGE_KEY_USERS = 'akibpay_users';
  const STORAGE_KEY_TASKS = 'akibpay_tasks';
  const STORAGE_KEY_BALANCES = 'akibpay_user_balances';
  const STORAGE_KEY_SUBMISSIONS = 'akibpay_submissions';
  const STORAGE_KEY_TRANSACTIONS = 'akibpay_transactions';
  const STORAGE_KEY_TUTORIAL = 'akibpay_tutorial_config';
  const STORAGE_KEY_CONFIG = 'akibpay_app_config';
  const STORAGE_KEY_ADMIN = 'akibpay_admin_creds';
  const STORAGE_KEY_CURRENT_USER = 'akibpay_current_session';
  const STORAGE_KEY_THEME = 'akibpay_theme';

  const COOLDOWN_MS = 12 * 60 * 60 * 1000;

  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null' || item === '') return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error parsing ${key}:`, e);
      return fallback;
    }
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CURRENT_USER) !== null;
    } catch {
      return false;
    }
  });
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => 
    safeParse(STORAGE_KEY_USERS, [{ name: 'Rahat Islam', email: 'rahat@test.com', password: 'password123' }])
  );

  const [tasks, setTasks] = useState<Task[]>(() => safeParse(STORAGE_KEY_TASKS, MOCK_TASKS));
  const [userBalances, setUserBalances] = useState<Record<string, UserBalance>>(() => safeParse(STORAGE_KEY_BALANCES, {}));
  const [submissions, setSubmissions] = useState<Submission[]>(() => safeParse(STORAGE_KEY_SUBMISSIONS, []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse(STORAGE_KEY_TRANSACTIONS, []));

  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(() => 
    safeParse(STORAGE_KEY_ADMIN, { username: 'akibneel', password: 'Akib@100' })
  );

  const [appConfig, setAppConfig] = useState<AppConfig>(() => safeParse(STORAGE_KEY_CONFIG, {
    minWithdrawal: 20,
    withdrawalMethods: [
      { id: 'bKash', name: 'bKash', icon: 'https://freelogopng.com/images/all_img/1656234745bkash-app-logo.png', color: 'border-[#D12053]', activeBg: 'bg-[#D12053]/5' },
      { id: 'Nagad', name: 'Nagad', icon: 'https://freelogopng.com/images/all_img/1656234832nagad-logo-png.png', color: 'border-[#F7941D]', activeBg: 'bg-[#F7941D]/5' },
      { id: 'Rocket', name: 'Rocket', icon: 'https://freelogopng.com/images/all_img/1656234907rocket-logo-png.png', color: 'border-[#8C3494]', activeBg: 'bg-[#8C3494]/5' },
      { id: 'Binance', name: 'Binance', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/1024px-Binance_logo.svg.png', color: 'border-[#F3BA2F]', activeBg: 'bg-[#F3BA2F]/5' },
    ]
  }));

  const [tutorialConfig, setTutorialConfig] = useState<TutorialConfig>(() => safeParse(STORAGE_KEY_TUTORIAL, {
    heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    supportTelegram: 'AkibPaySupport',
    telegramChannel: 'AkibPayOfficial',
    steps: [
      { id: '1', title: 'Complete Profile', desc: 'Ensure your account is verified for higher payouts.', icon: '👤' },
      { id: '2', title: 'Select a Task', desc: 'Browse daily inventory and choose tasks you like.', icon: '📋' },
      { id: '3', title: 'Submit Evidence', desc: 'Take screenshots as proof of your work completion.', icon: '🖼️' },
      { id: '4', title: 'Request Payout', desc: 'Withdraw your earnings instantly to bKash or Nagad.', icon: '💸' },
    ]
  }));

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = safeParse<any>(STORAGE_KEY_CURRENT_USER, null);
    return saved ? { ...saved, phone: '', joinDate: 'Oct 2023' } : { name: 'Guest User', email: '', phone: '', joinDate: 'Oct 2023' };
  });

  const activeBalance = userBalances[userProfile.email] || { total: 0, available: 0, pending: 0 };

  useEffect(() => {
    if (registeredUsers.length > 0) localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registeredUsers));
  }, [registeredUsers]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(userBalances)), [userBalances]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions)), [submissions]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_TUTORIAL, JSON.stringify(tutorialConfig)), [tutorialConfig]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(appConfig)), [appConfig]);
  useEffect(() => localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminCreds)), [adminCreds]);

  const [notification, setNotification] = useState<{show: boolean, title: string, body: string} | null>(null);

  const showSmsNotification = (title: string, body: string) => {
    setNotification({ show: true, title, body });
    setTimeout(() => setNotification(null), 5000);
  };

  const getTaskCooldown = (taskId: string) => {
    const userSubmissions = submissions.filter(s => s.userEmail === userProfile.email && s.taskId === taskId);
    if (userSubmissions.length === 0) return null;
    const lastSub = userSubmissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const diff = Date.now() - new Date(lastSub.timestamp).getTime();
    return diff < COOLDOWN_MS ? COOLDOWN_MS - diff : null;
  };

  const handleAuthAttempt = (email: string, password?: string): { success: boolean, error?: string, user?: UserAccount } => {
    const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'Account not found.' };
    if (password === undefined) return { success: true, user };
    if (user.password === password) return { success: true, user };
    return { success: false, error: 'Invalid password.' };
  };

  const handleTaskClick = (task: Task) => {
    const cd = getTaskCooldown(task.id);
    if (cd) {
      showSmsNotification("Task Restricted", "You are currently in cooldown for this task.");
      return;
    }
    setSelectedTask(task);
    setCurrentScreen('SUBMIT_TASK');
  };

  const handleSubmitTask = (taskId: string, details: string, amount: number, screenshot?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      userId: 'currentUser',
      userEmail: userProfile.email,
      userName: userProfile.name,
      taskId: task.id,
      taskTitle: task.title,
      rate: task.rate,
      rateType: task.rateType,
      userQuantity: Math.round(amount / task.rate),
      amount,
      details,
      screenshot,
      status: TaskStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    const transaction: Transaction = {
      id: `tr-${Date.now()}`,
      userEmail: userProfile.email,
      taskName: task.title,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: TaskStatus.PENDING,
      type: 'EARNING'
    };
    setSubmissions(prev => [submission, ...prev]);
    setTransactions(prev => [transaction, ...prev]);
    setUserBalances(prev => {
      const cur = prev[userProfile.email] || { total: 0, available: 0, pending: 0 };
      return { ...prev, [userProfile.email]: { ...cur, pending: cur.pending + amount } };
    });
    showSmsNotification("Submission Received", "Your task is under review.");
    setCurrentScreen('HOME');
  };

  const handleAdminAction = (id: string, status: TaskStatus, approvedQuantity?: number) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, userQuantity: approvedQuantity ?? s.userQuantity } : s));
    if (status === TaskStatus.APPROVED) {
      const finalAmount = (approvedQuantity ?? sub.userQuantity) * sub.rate;
      setUserBalances(prev => {
        const cur = prev[sub.userEmail] || { total: 0, available: 0, pending: 0 };
        return {
          ...prev,
          [sub.userEmail]: {
            total: cur.total + finalAmount,
            available: cur.available + finalAmount,
            pending: Math.max(0, cur.pending - sub.amount)
          }
        };
      });
    } else if (status === TaskStatus.REJECTED) {
      setUserBalances(prev => {
        const cur = prev[sub.userEmail] || { total: 0, available: 0, pending: 0 };
        return { ...prev, [sub.userEmail]: { ...cur, pending: Math.max(0, cur.pending - sub.amount) } };
      });
    }
  };

  const handleWithdrawSubmit = (method: string, account: string, amount: number) => {
    const transaction: Transaction = {
      id: `wd-${Date.now()}`,
      userEmail: userProfile.email,
      taskName: `Withdrawal via ${method}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: TaskStatus.PENDING,
      type: 'WITHDRAWAL',
      method
    };
    setTransactions(prev => [transaction, ...prev]);
    setUserBalances(prev => {
      const cur = prev[userProfile.email];
      return { ...prev, [userProfile.email]: { ...cur, available: cur.available - amount } };
    });
    showSmsNotification("Withdrawal Requested", `Transfer of ৳${amount} is processing.`);
    setCurrentScreen('HOME');
  };

  const renderScreen = () => {
    if (!isLoggedIn) return <LoginScreen onLogin={u => {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(u));
      setUserProfile({ ...u, phone: '', joinDate: 'Oct 2023' });
      setIsLoggedIn(true);
      setCurrentScreen('HOME');
    }} onSignup={u => setRegisteredUsers(p => [...p, u])} onAuthAttempt={handleAuthAttempt} />;
    
    if (currentScreen === 'ADMIN_LOGIN' && !isAdminAuthenticated) {
      return <AdminLoginScreen credentials={adminCreds} onLoginSuccess={() => { setIsAdminAuthenticated(true); setCurrentScreen('ADMIN'); }} onBack={() => setCurrentScreen('PROFILE')} />;
    }

    if (isAdminAuthenticated && currentScreen === 'ADMIN') {
      return <AdminScreen 
        analytics={{ totalSignups: registeredUsers.length, activeLast72h: 0, currentlyOnline: 1, tutorialViewsLast72h: 0, uninstalls: 0 }}
        submissions={submissions} withdrawals={transactions.filter(t => t.type === 'WITHDRAWAL')} tasks={tasks}
        tutorialConfig={tutorialConfig} appConfig={appConfig} adminCredentials={adminCreds} onUpdateAdminCredentials={setAdminCreds}
        onAction={handleAdminAction} onWithdrawAction={(id, s) => setTransactions(p => p.map(t => t.id === id ? { ...t, status: s } : t))}
        onAddTask={t => setTasks(p => [...p, t])} onUpdateTask={t => setTasks(p => p.map(x => x.id === t.id ? t : x))} onDeleteTask={id => setTasks(p => p.filter(x => x.id !== id))}
        onUpdateTutorialConfig={setTutorialConfig} onUpdateAppConfig={setAppConfig} onBack={() => setCurrentScreen('PROFILE')}
      />;
    }

    switch (currentScreen) {
      case 'HOME': return <HomeScreen balance={activeBalance} tasks={tasks} onTaskClick={handleTaskClick} onNotificationClick={() => showSmsNotification("Notifications", "Zero new alerts.")} userName={userProfile.name} getTaskCooldown={getTaskCooldown} isAdminAuthenticated={isAdminAuthenticated} onUpdateTask={t => setTasks(p => p.map(x => x.id === t.id ? t : x))} />;
      case 'WALLET': return <WalletScreen balance={activeBalance} appConfig={appConfig} transactions={transactions.filter(t => t.userEmail === userProfile.email)} onWithdrawClick={() => setCurrentScreen('WITHDRAW')} />;
      case 'SUBMIT_TASK': return selectedTask ? <SubmitTaskScreen task={selectedTask} onSubmit={handleSubmitTask} onBack={() => setCurrentScreen('HOME')} /> : null;
      case 'WITHDRAW': return <WithdrawScreen availableBalance={activeBalance.available} appConfig={appConfig} onSubmit={handleWithdrawSubmit} onBack={() => setCurrentScreen('WALLET')} />;
      case 'PROFILE': return <ProfileScreen userProfile={userProfile} theme={theme} onToggleTheme={toggleTheme} supportTelegram={tutorialConfig.supportTelegram} telegramChannel={tutorialConfig.telegramChannel} onAdminClick={() => isAdminAuthenticated ? setCurrentScreen('ADMIN') : setCurrentScreen('ADMIN_LOGIN')} onSettingsClick={() => setCurrentScreen('ACCOUNT_SETTINGS')} onLogout={() => { localStorage.removeItem(STORAGE_KEY_CURRENT_USER); setIsLoggedIn(false); setIsAdminAuthenticated(false); setCurrentScreen('HOME'); }} />;
      case 'TUTORIAL': return <TutorialScreen config={tutorialConfig} />;
      case 'ACCOUNT_SETTINGS': return <AccountSettingsScreen profile={userProfile} onSave={p => setUserProfile(p)} onBack={() => setCurrentScreen('PROFILE')} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen shadow-2xl relative flex flex-col font-sans transition-colors duration-300">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[200] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4 items-start">
            <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg"><Bell size={18} /></div>
            <div>
                <h4 className="text-[11px] font-semibold text-white uppercase tracking-widest">{notification.title}</h4>
                <p className="text-[10px] text-white/70 font-medium leading-tight mt-1">{notification.body}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar">{renderScreen()}</div>
      {isLoggedIn && !['SUBMIT_TASK', 'WITHDRAW', 'ADMIN', 'ADMIN_LOGIN'].includes(currentScreen) && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50">
          <button onClick={() => setCurrentScreen('HOME')} className={`flex flex-col items-center gap-1 ${currentScreen === 'HOME' ? 'text-emerald-600' : 'text-slate-400'}`}><Home size={22} /><span className="text-[8px] font-bold uppercase">Tasks</span></button>
          <button onClick={() => setCurrentScreen('WALLET')} className={`flex flex-col items-center gap-1 ${currentScreen === 'WALLET' ? 'text-emerald-600' : 'text-slate-400'}`}><Wallet size={22} /><span className="text-[8px] font-bold uppercase">Wallet</span></button>
          <button onClick={() => setCurrentScreen('TUTORIAL')} className={`flex flex-col items-center gap-1 ${currentScreen === 'TUTORIAL' ? 'text-emerald-600' : 'text-slate-400'}`}><PlayCircle size={22} /><span className="text-[8px] font-bold uppercase">Learn</span></button>
          <button onClick={() => setCurrentScreen('PROFILE')} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-emerald-600' : 'text-slate-400'}`}><User size={22} /><span className="text-[8px] font-bold uppercase">Profile</span></button>
        </div>
      )}
    </div>
  );
};

export default App;