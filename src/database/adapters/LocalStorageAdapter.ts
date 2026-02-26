// Local Storage Database Adapter
// This is the default adapter that stores data in browser localStorage

import { v4 as uuidv4 } from 'uuid';
import { Member, Package, Payment, Staff } from '../../types';
import { DatabaseAdapter } from '../types';
import { dummyMembers, dummyPackages, dummyPayments, dummyStaff } from '../../data/dummyData';

const STORAGE_KEYS = {
  MEMBERS: 'gym_members',
  PACKAGES: 'gym_packages',
  PAYMENTS: 'gym_payments',
  STAFF: 'gym_staff',
  INITIALIZED: 'gym_initialized',
  DATA_VERSION: 'gym_data_version',
};

// Increment this to force refresh staff data (for password support)
const CURRENT_DATA_VERSION = 4;

export class LocalStorageAdapter implements DatabaseAdapter {
  private connected: boolean = false;

  private getFromStorage<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async initialize(): Promise<void> {
    // Check data version to force refresh staff data when needed
    const storedVersionStr = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 0;
    const needsRefresh = storedVersion < CURRENT_DATA_VERSION;
    
    // Initialize with dummy data if first time
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    
    if (!initialized) {
      this.saveToStorage(STORAGE_KEYS.MEMBERS, dummyMembers);
      this.saveToStorage(STORAGE_KEYS.PACKAGES, dummyPackages);
      this.saveToStorage(STORAGE_KEYS.PAYMENTS, dummyPayments);
      this.saveToStorage(STORAGE_KEYS.STAFF, dummyStaff);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, String(CURRENT_DATA_VERSION));
    } else if (needsRefresh) {
      // Refresh staff data to include passwords
      console.log('Refreshing staff data for password support...');
      this.saveToStorage(STORAGE_KEYS.STAFF, dummyStaff);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, String(CURRENT_DATA_VERSION));
    }
    
    this.connected = true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return this.getFromStorage<Member>(STORAGE_KEYS.MEMBERS);
  }

  async getMemberById(id: string): Promise<Member | null> {
    const members = await this.getMembers();
    return members.find(m => m.id === id) || null;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const now = new Date().toISOString();
    const member: Member = {
      ...memberData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    const members = await this.getMembers();
    members.push(member);
    this.saveToStorage(STORAGE_KEYS.MEMBERS, members);
    
    return member;
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const members = await this.getMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error('Member not found');
    }
    
    const updated = {
      ...members[index],
      ...memberData,
      updatedAt: new Date().toISOString(),
    };
    members[index] = updated;
    this.saveToStorage(STORAGE_KEYS.MEMBERS, members);
    
    return updated;
  }

  async deleteMember(id: string): Promise<void> {
    const members = await this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    this.saveToStorage(STORAGE_KEYS.MEMBERS, filtered);
    
    // Also delete related payments
    const payments = await this.getPayments();
    const filteredPayments = payments.filter(p => p.memberId !== id);
    this.saveToStorage(STORAGE_KEYS.PAYMENTS, filteredPayments);
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    return this.getFromStorage<Package>(STORAGE_KEYS.PACKAGES);
  }

  async getPackageById(id: string): Promise<Package | null> {
    const packages = await this.getPackages();
    return packages.find(p => p.id === id) || null;
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const now = new Date().toISOString();
    const pkg: Package = {
      ...packageData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    const packages = await this.getPackages();
    packages.push(pkg);
    this.saveToStorage(STORAGE_KEYS.PACKAGES, packages);
    
    return pkg;
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    const packages = await this.getPackages();
    const index = packages.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Package not found');
    }
    
    const updated = {
      ...packages[index],
      ...packageData,
      updatedAt: new Date().toISOString(),
    };
    packages[index] = updated;
    this.saveToStorage(STORAGE_KEYS.PACKAGES, packages);
    
    return updated;
  }

  async deletePackage(id: string): Promise<void> {
    const packages = await this.getPackages();
    const filtered = packages.filter(p => p.id !== id);
    this.saveToStorage(STORAGE_KEYS.PACKAGES, filtered);
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return this.getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    const payments = await this.getPayments();
    return payments.filter(p => p.memberId === memberId);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    const payments = await this.getPayments();
    payments.push(payment);
    this.saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    
    // Update member's paid amount
    const member = await this.getMemberById(paymentData.memberId);
    if (member) {
      await this.updateMember(member.id, {
        paidAmount: member.paidAmount + paymentData.amount,
      });
    }
    
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const payments = await this.getPayments();
    const filtered = payments.filter(p => p.id !== id);
    this.saveToStorage(STORAGE_KEYS.PAYMENTS, filtered);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return this.getFromStorage<Staff>(STORAGE_KEYS.STAFF);
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const staff = await this.getStaff();
    return staff.find(s => s.id === id) || null;
  }

  async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const now = new Date().toISOString();
    const staff: Staff = {
      ...staffData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    const allStaff = await this.getStaff();
    allStaff.push(staff);
    this.saveToStorage(STORAGE_KEYS.STAFF, allStaff);
    
    return staff;
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    const allStaff = await this.getStaff();
    const index = allStaff.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Staff not found');
    }
    
    const updated = {
      ...allStaff[index],
      ...staffData,
      updatedAt: new Date().toISOString(),
    };
    allStaff[index] = updated;
    this.saveToStorage(STORAGE_KEYS.STAFF, allStaff);
    
    return updated;
  }

  async deleteStaff(id: string): Promise<void> {
    const allStaff = await this.getStaff();
    const filtered = allStaff.filter(s => s.id !== id);
    this.saveToStorage(STORAGE_KEYS.STAFF, filtered);
  }

  // Batch sync
  async syncAll(): Promise<{
    members: Member[];
    packages: Package[];
    payments: Payment[];
    staff: Staff[];
  }> {
    return {
      members: await this.getMembers(),
      packages: await this.getPackages(),
      payments: await this.getPayments(),
      staff: await this.getStaff(),
    };
  }
}
