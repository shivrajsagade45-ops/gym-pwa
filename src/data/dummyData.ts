import { Member, Package, Payment, Staff } from '../types';

export const dummyPackages: Package[] = [
  {
    id: 'pkg-1',
    name: 'Monthly',
    durationDays: 30,
    basePrice: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pkg-2',
    name: 'Quarterly',
    durationDays: 90,
    basePrice: 2500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pkg-3',
    name: 'Half Yearly',
    durationDays: 180,
    basePrice: 4500,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pkg-4',
    name: 'Yearly',
    durationDays: 365,
    basePrice: 8000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Helper to get date strings
const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const dummyMembers: Member[] = [
  {
    id: 'mem-1',
    name: 'Rahul Sharma',
    phone: '9876543210',
    address: '123 Main Street, Mumbai',
    packageId: 'pkg-1',
    packageStartDate: daysAgo(15), // Started 15 days ago - Active (30 day package)
    packagePrice: 1000,
    totalAmount: 1000,
    paidAmount: 500,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'mem-2',
    name: 'Priya Patel',
    phone: '9876543211',
    address: '456 Park Avenue, Delhi',
    packageId: 'pkg-2',
    packageStartDate: daysAgo(100), // Started 100 days ago - Expired (90 day package)
    packagePrice: 2500,
    totalAmount: 2500,
    paidAmount: 2500,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'mem-3',
    name: 'Amit Kumar',
    phone: '9876543212',
    address: '789 Lake View, Bangalore',
    packageId: 'pkg-4',
    packageStartDate: daysAgo(30), // Started 30 days ago - Active (365 day package)
    packagePrice: 7500,
    totalAmount: 7500,
    paidAmount: 3000,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'mem-4',
    name: 'Sneha Gupta',
    phone: '9876543213',
    address: '321 Hill Road, Pune',
    packageId: 'pkg-3',
    packageStartDate: daysAgo(200), // Started 200 days ago - Expired (180 day package)
    packagePrice: 4500,
    totalAmount: 4500,
    paidAmount: 4500,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'mem-5',
    name: 'Ravi Desai',
    phone: '9876543214',
    address: '555 Garden Road, Chennai',
    packageId: 'pkg-1',
    packageStartDate: daysAgo(5), // Started 5 days ago - Active
    packagePrice: 1000,
    totalAmount: 1000,
    paidAmount: 1000,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'mem-6',
    name: 'Anjali Mehta',
    phone: '9876543215',
    address: '777 Ocean View, Goa',
    packageId: null,
    packageStartDate: null, // No package assigned
    packagePrice: 0,
    totalAmount: 0,
    paidAmount: 0,
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
];

export const dummyPayments: Payment[] = [
  {
    id: 'pay-1',
    memberId: 'mem-1',
    amount: 500,
    date: '2024-01-15',
    mode: 'Cash',
    note: 'First installment',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'pay-2',
    memberId: 'mem-2',
    amount: 2500,
    date: '2024-01-20',
    mode: 'UPI',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'pay-3',
    memberId: 'mem-3',
    amount: 3000,
    date: '2024-02-01',
    mode: 'Card',
    note: 'Partial payment',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'pay-4',
    memberId: 'mem-4',
    amount: 4500,
    date: '2024-02-10',
    mode: 'UPI',
    createdAt: '2024-02-10T00:00:00Z',
  },
];

export const dummyStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Vikram Singh',
    phone: '9999999999',
    password: 'admin123',
    role: 'Owner',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'staff-2',
    name: 'Neha Verma',
    phone: '8888888888',
    password: 'staff123',
    role: 'Staff',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];
