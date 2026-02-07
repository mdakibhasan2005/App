
import { Task, TaskStatus, Transaction, Submission } from './types';

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Facebook 2FA Setup',
    rate: 7,
    rateType: 'ID',
    buttonText: 'Submit',
    limit: 50,
    completed: 12,
    icon: '👤',
    color: 'bg-blue-500',
    category: 'Social',
    description: ''
  },
  {
    id: 't2',
    title: 'Instagram ID Follow',
    rate: 3,
    rateType: '1K',
    buttonText: 'Submit',
    limit: 100,
    completed: 45,
    icon: '📸',
    color: 'bg-pink-500',
    category: 'Social',
    description: ''
  },
  {
    id: 't3',
    title: 'Survey Submission',
    rate: 5,
    rateType: 'STAR',
    buttonText: 'Earn Now',
    limit: 10,
    completed: 2,
    icon: '📝',
    color: 'bg-amber-500',
    category: 'Survey',
    description: ''
  },
  {
    id: 't4',
    title: 'YouTube Sub & Like',
    rate: 4,
    rateType: '1K',
    buttonText: 'Start',
    limit: 200,
    completed: 88,
    icon: '🎬',
    color: 'bg-red-500',
    category: 'Social',
    description: ''
  }
];

// Added userEmail to mock transactions to satisfy Transaction interface requirements
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', userEmail: 'rahat@test.com', taskName: 'Facebook 2FA Setup', amount: 7, date: '2023-10-24', status: TaskStatus.APPROVED },
  { id: 'tr2', userEmail: 'rahat@test.com', taskName: 'Instagram ID Follow', amount: 3, date: '2023-10-24', status: TaskStatus.PENDING },
  { id: 'tr3', userEmail: 'rahat@test.com', taskName: 'Survey Submission', amount: 5, date: '2023-10-23', status: TaskStatus.APPROVED },
  { id: 'tr4', userEmail: 'rahat@test.com', taskName: 'YouTube Sub & Like', amount: 4, date: '2023-10-22', status: TaskStatus.REJECTED },
];

// Added userEmail to mock submissions to satisfy Submission interface requirements
export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub1',
    userId: 'u101',
    userEmail: 'rahat@test.com',
    userName: 'Rahat Islam',
    taskId: 't1',
    taskTitle: 'Facebook 2FA Setup',
    rate: 7,
    rateType: 'ID',
    userQuantity: 1,
    amount: 7,
    details: 'rahat.fb.22 - Security enabled with code +88017XXXXXXXX',
    status: TaskStatus.PENDING,
    timestamp: new Date().toISOString()
  },
  {
    id: 'sub2',
    userId: 'u102',
    userEmail: 'sadia@test.com',
    userName: 'Sadia Sultana',
    taskId: 't2',
    taskTitle: 'Instagram ID Follow',
    rate: 3,
    rateType: '1K',
    userQuantity: 1,
    amount: 3,
    details: '@sadia_clicks - Followed and liked recent posts',
    status: TaskStatus.PENDING,
    timestamp: new Date().toISOString()
  },
  {
    id: 'sub3',
    userId: 'u103',
    userEmail: 'tanvir@test.com',
    userName: 'Tanvir Hossain',
    taskId: 't3',
    taskTitle: 'Survey Submission',
    rate: 5,
    rateType: 'STAR',
    userQuantity: 1,
    amount: 5,
    details: 'Submitted via form link #882. Location: Dhaka. Age: 24. Interest: Tech.',
    status: TaskStatus.PENDING,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];
