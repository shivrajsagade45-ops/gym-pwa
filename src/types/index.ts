// Backend-agnostic data models for Gym Management

export interface Package {
  id: string;
  name: string;
  durationDays: number;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  photo?: string; // Base64 encoded photo or URL
  packageId: string | null;
  packageStartDate: string | null; // When the package was assigned
  packageEndDate?: string | null;
  packagePrice: number; // Can be overridden per member
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  note?: string;
  createdAt: string;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StaffRole = 'Owner' | 'Staff';

export type MembershipStatus = 'active' | 'expired' | 'no-package';

// Computed types
export interface MemberWithPending extends Member {
  pendingAmount: number;
  packageName: string | null;
  packageDurationDays: number | null;
  packageExpiryDate: string | null;
  membershipStatus: MembershipStatus;
  daysRemaining: number | null;
  photo?: string; // Inherited from Member but explicitly mentioned
}

// Dashboard stats
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  pendingPaymentsCount: number;
  totalPendingAmount: number;
  totalCollected: number;
}
