export type Screen = 'AUTH' | 'HOME' | 'WALLET' | 'PROFILE' | 'SUBMIT_TASK' | 'ADMIN' | 'WITHDRAW' | 'TUTORIAL' | 'ACCOUNT_SETTINGS' | 'ADMIN_LOGIN';

export enum TaskStatus {
  PENDING = 'Pending',
  RECEIVED = 'Received',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface UserAccount {
  name: string;
  email: string;
  password: string;
  failedAttempts?: number;
  lockoutUntil?: string; // ISO string
}

export interface AppAnalytics {
  totalSignups: number;
  activeLast72h: number;
  currentlyOnline: number;
  tutorialViewsLast72h: number;
  uninstalls: number;
}

export interface Task {
  id: string;
  title: string;
  rate: number;
  rateType: string;
  buttonText: string;
  limit: number;
  completed: number;
  icon: string;
  color: string;
  category: 'Social' | 'Survey' | 'Ads' | 'Bonus';
  description: string;
  tutorialUrl?: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  desc: string;
  icon: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface TutorialConfig {
  heroVideoUrl: string;
  supportTelegram: string; 
  telegramChannel: string;
  steps: TutorialStep[];
}

export interface WithdrawalMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  activeBg: string;
}

export interface AppConfig {
  minWithdrawal: number;
  withdrawalMethods: WithdrawalMethod[];
}

export interface Transaction {
  id: string;
  userEmail: string; // Linked to user
  taskName: string;
  amount: number;
  date: string;
  status: TaskStatus;
  details?: string;
  submissionId?: string;
  type?: 'EARNING' | 'WITHDRAWAL' | 'EXCHANGE';
  method?: string;
}

export interface Submission {
  id: string;
  userId: string;
  userEmail: string; // Linked to user
  userName: string;
  taskId: string;
  taskTitle: string;
  rate: number;
  rateType: string;
  userQuantity: number;
  amount: number;
  details: string;
  screenshot?: string;
  status: TaskStatus;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
}

export interface UserBalance {
  total: number;
  available: number;
  pending: number;
}