// Database abstraction layer types
import { Member, Package, Payment, Staff } from '../types';

// Database configuration types
export type DatabaseProvider = 'local' | 'firebase' | 'supabase' | 'mongodb' | 'custom';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  firebase?: FirebaseConfig;
  supabase?: SupabaseConfig;
  mongodb?: MongoDBConfig;
  custom?: CustomAPIConfig;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface MongoDBConfig {
  apiUrl: string; // MongoDB Data API URL
  apiKey: string;
  dataSource: string;
  database: string;
}

export interface CustomAPIConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

// Database adapter interface - implement this for each database
export interface DatabaseAdapter {
  // Initialize the database connection
  initialize(): Promise<void>;
  
  // Check if connected
  isConnected(): boolean;

  // Members
  getMembers(): Promise<Member[]>;
  getMemberById(id: string): Promise<Member | null>;
  createMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member>;
  updateMember(id: string, member: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;

  // Packages
  getPackages(): Promise<Package[]>;
  getPackageById(id: string): Promise<Package | null>;
  createPackage(pkg: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package>;
  updatePackage(id: string, pkg: Partial<Package>): Promise<Package>;
  deletePackage(id: string): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPaymentsByMemberId(memberId: string): Promise<Payment[]>;
  createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | null>;
  createStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff>;
  updateStaff(id: string, staff: Partial<Staff>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;

  // Batch operations (optional, for efficiency)
  syncAll?(): Promise<{
    members: Member[];
    packages: Package[];
    payments: Payment[];
    staff: Staff[];
  }>;
}

// Event types for real-time sync (optional)
export type DataChangeEvent = {
  type: 'create' | 'update' | 'delete';
  collection: 'members' | 'packages' | 'payments' | 'staff';
  data: unknown;
  id: string;
};

export type DataChangeListener = (event: DataChangeEvent) => void;
