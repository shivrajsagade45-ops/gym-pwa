import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Member, Package, Payment, Staff, MemberWithPending, DashboardStats, MembershipStatus } from '../types';
import { databaseManager, databaseConfig, DatabaseAdapter } from '../database';

// Helper function to calculate membership status
const calculateMembershipStatus = (
  packageStartDate: string | null,
  durationDays: number | null
): { status: MembershipStatus; expiryDate: string | null; daysRemaining: number | null } => {
  if (!packageStartDate || !durationDays) {
    return { status: 'no-package', expiryDate: null, daysRemaining: null };
  }

  const startDate = new Date(packageStartDate);
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    status: daysRemaining > 0 ? 'active' : 'expired',
    expiryDate: expiryDate.toISOString().split('T')[0],
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
  };
};

interface AppContextType {
  // Members
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  getMembersWithPending: () => MemberWithPending[];

  // Packages
  packages: Package[];
  addPackage: (pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackageById: (id: string) => Package | undefined;

  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  getPaymentsByMember: (memberId: string) => Payment[];

  // Staff
  staff: Staff[];
  addStaff: (staffMember: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStaff: (id: string, staffMember: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  // Dashboard
  getDashboardStats: () => DashboardStats;

  // Loading state
  isLoading: boolean;
  
  // Database info
  databaseProvider: string;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<DatabaseAdapter | null>(null);

  // Load all data from database
  const loadData = useCallback(async (database: DatabaseAdapter) => {
    try {
      if (database.syncAll) {
        const data = await database.syncAll();
        setMembers(data.members);
        setPackages(data.packages);
        setPayments(data.payments);
        setStaff(data.staff);
      } else {
        const [membersData, packagesData, paymentsData, staffData] = await Promise.all([
          database.getMembers(),
          database.getPackages(),
          database.getPayments(),
          database.getStaff(),
        ]);
        setMembers(membersData);
        setPackages(packagesData);
        setPayments(paymentsData);
        setStaff(staffData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await databaseManager.initialize(databaseConfig);
        const database = databaseManager.getAdapter();
        setDb(database);
        await loadData(database);
      } catch (error) {
        console.error('Database initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, [loadData]);

  // Refresh data from database
  const refreshData = useCallback(async () => {
    if (db) {
      setIsLoading(true);
      await loadData(db);
      setIsLoading(false);
    }
  }, [db, loadData]);

  // Member functions
  const addMember = useCallback(async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return;
    const newMember = await db.createMember(memberData);
    setMembers((prev) => [...prev, newMember]);
  }, [db]);

  const updateMember = useCallback(async (id: string, memberData: Partial<Member>) => {
    if (!db) return;
    const updated = await db.updateMember(id, memberData);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, [db]);

  const deleteMember = useCallback(async (id: string) => {
    if (!db) return;
    await db.deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setPayments((prev) => prev.filter((p) => p.memberId !== id));
  }, [db]);

  const getMemberById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  const getMembersWithPending = useCallback((): MemberWithPending[] => {
    return members.map((member) => {
      const pkg = packages.find((p) => p.id === member.packageId);
      const durationDays = pkg?.durationDays || null;
      const { status, expiryDate, daysRemaining } = calculateMembershipStatus(
        member.packageStartDate,
        durationDays
      );
      
      return {
        ...member,
        pendingAmount: member.totalAmount - member.paidAmount,
        packageName: pkg?.name || null,
        packageDurationDays: durationDays,
        packageExpiryDate: expiryDate,
        membershipStatus: status,
        daysRemaining,
      };
    });
  }, [members, packages]);

  // Package functions
  const addPackage = useCallback(async (pkgData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return;
    const newPackage = await db.createPackage(pkgData);
    setPackages((prev) => [...prev, newPackage]);
  }, [db]);

  const updatePackage = useCallback(async (id: string, pkgData: Partial<Package>) => {
    if (!db) return;
    const updated = await db.updatePackage(id, pkgData);
    setPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, [db]);

  const deletePackage = useCallback(async (id: string) => {
    if (!db) return;
    await db.deletePackage(id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }, [db]);

  const getPackageById = useCallback(
    (id: string) => packages.find((p) => p.id === id),
    [packages]
  );

  // Payment functions
  const addPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!db) return;
    const newPayment = await db.createPayment(paymentData);
    setPayments((prev) => [...prev, newPayment]);

    // Update member's paid amount locally
    setMembers((prev) =>
      prev.map((m) =>
        m.id === paymentData.memberId
          ? {
              ...m,
              paidAmount: m.paidAmount + paymentData.amount,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
  }, [db]);

  const getPaymentsByMember = useCallback(
    (memberId: string) => payments.filter((p) => p.memberId === memberId),
    [payments]
  );

  // Staff functions
  const addStaff = useCallback(async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) return;
    const newStaff = await db.createStaff(staffData);
    setStaff((prev) => [...prev, newStaff]);
  }, [db]);

  const updateStaff = useCallback(async (id: string, staffData: Partial<Staff>) => {
    if (!db) return;
    const updated = await db.updateStaff(id, staffData);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, [db]);

  const deleteStaff = useCallback(async (id: string) => {
    if (!db) return;
    await db.deleteStaff(id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, [db]);

  // Dashboard stats
  const getDashboardStats = useCallback((): DashboardStats => {
    const membersWithPending = getMembersWithPending();
    const pendingMembers = membersWithPending.filter((m) => m.pendingAmount > 0);
    const totalPendingAmount = pendingMembers.reduce((sum, m) => sum + m.pendingAmount, 0);
    const totalCollected = members.reduce((sum, m) => sum + m.paidAmount, 0);
    const activeMembers = membersWithPending.filter((m) => m.membershipStatus === 'active').length;
    const expiredMembers = membersWithPending.filter((m) => m.membershipStatus === 'expired').length;

    return {
      totalMembers: members.length,
      activeMembers,
      expiredMembers,
      pendingPaymentsCount: pendingMembers.length,
      totalPendingAmount,
      totalCollected,
    };
  }, [members, getMembersWithPending]);

  const value: AppContextType = {
    members,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    getMembersWithPending,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    getPackageById,
    payments,
    addPayment,
    getPaymentsByMember,
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    getDashboardStats,
    isLoading,
    databaseProvider: databaseManager.getProvider(),
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
