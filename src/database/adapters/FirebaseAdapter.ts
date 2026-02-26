// Firebase Database Adapter
// Implements DatabaseAdapter interface for Firebase Firestore
//
// INSTALLATION REQUIRED: npm install firebase
// This adapter will only work after installing the firebase package

import { v4 as uuidv4 } from 'uuid';
import { Member, Package, Payment, Staff } from '../../types';
import { DatabaseAdapter, FirebaseConfig } from '../types';

export class FirebaseAdapter implements DatabaseAdapter {
  private config: FirebaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private firestore: any = null;
  private connected: boolean = false;

  constructor(config: FirebaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamic import - will fail if firebase is not installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firebaseApp: any = await Function('return import("firebase/app")')();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firebaseFirestore: any = await Function('return import("firebase/firestore")')();
      
      const app = firebaseApp.initializeApp(this.config);
      this.db = firebaseFirestore.getFirestore(app);
      this.firestore = firebaseFirestore;
      
      this.connected = true;
      console.log('Firebase connected successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase. Run: npm install firebase');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get fs(): any {
    return this.firestore;
  }

  // Members
  async getMembers(): Promise<Member[]> {
    const snapshot = await this.fs.getDocs(this.fs.collection(this.db, 'members'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Member));
  }

  async getMemberById(id: string): Promise<Member | null> {
    const docRef = this.fs.doc(this.db, 'members', id);
    const docSnap = await this.fs.getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Member;
    }
    return null;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const member: Member = {
      ...memberData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.fs.setDoc(this.fs.doc(this.db, 'members', id), member);
    return member;
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const docRef = this.fs.doc(this.db, 'members', id);
    
    await this.fs.updateDoc(docRef, {
      ...memberData,
      updatedAt: new Date().toISOString(),
    });
    
    const updated = await this.fs.getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Member;
  }

  async deleteMember(id: string): Promise<void> {
    // Delete member
    await this.fs.deleteDoc(this.fs.doc(this.db, 'members', id));
    
    // Delete related payments
    const paymentsQuery = this.fs.query(
      this.fs.collection(this.db, 'payments'), 
      this.fs.where('memberId', '==', id)
    );
    const payments = await this.fs.getDocs(paymentsQuery);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const payment of payments.docs) {
      await this.fs.deleteDoc(this.fs.doc(this.db, 'payments', payment.id));
    }
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    const snapshot = await this.fs.getDocs(this.fs.collection(this.db, 'packages'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Package));
  }

  async getPackageById(id: string): Promise<Package | null> {
    const docRef = this.fs.doc(this.db, 'packages', id);
    const docSnap = await this.fs.getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Package;
    }
    return null;
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const pkg: Package = {
      ...packageData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.fs.setDoc(this.fs.doc(this.db, 'packages', id), pkg);
    return pkg;
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    const docRef = this.fs.doc(this.db, 'packages', id);
    
    await this.fs.updateDoc(docRef, {
      ...packageData,
      updatedAt: new Date().toISOString(),
    });
    
    const updated = await this.fs.getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Package;
  }

  async deletePackage(id: string): Promise<void> {
    await this.fs.deleteDoc(this.fs.doc(this.db, 'packages', id));
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const snapshot = await this.fs.getDocs(this.fs.collection(this.db, 'payments'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Payment));
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    const q = this.fs.query(
      this.fs.collection(this.db, 'payments'), 
      this.fs.where('memberId', '==', memberId)
    );
    const snapshot = await this.fs.getDocs(q);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Payment));
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const id = uuidv4();
    
    const payment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date().toISOString(),
    };
    
    await this.fs.setDoc(this.fs.doc(this.db, 'payments', id), payment);
    
    // Update member's paid amount
    const memberRef = this.fs.doc(this.db, 'members', paymentData.memberId);
    const memberSnap = await this.fs.getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const member = memberSnap.data() as Member;
      await this.fs.updateDoc(memberRef, {
        paidAmount: member.paidAmount + paymentData.amount,
        updatedAt: new Date().toISOString(),
      });
    }
    
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await this.fs.deleteDoc(this.fs.doc(this.db, 'payments', id));
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const snapshot = await this.fs.getDocs(this.fs.collection(this.db, 'staff'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Staff));
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const docRef = this.fs.doc(this.db, 'staff', id);
    const docSnap = await this.fs.getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Staff;
    }
    return null;
  }

  async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const staff: Staff = {
      ...staffData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.fs.setDoc(this.fs.doc(this.db, 'staff', id), staff);
    return staff;
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    const docRef = this.fs.doc(this.db, 'staff', id);
    
    await this.fs.updateDoc(docRef, {
      ...staffData,
      updatedAt: new Date().toISOString(),
    });
    
    const updated = await this.fs.getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Staff;
  }

  async deleteStaff(id: string): Promise<void> {
    await this.fs.deleteDoc(this.fs.doc(this.db, 'staff', id));
  }

  // Batch sync
  async syncAll(): Promise<{
    members: Member[];
    packages: Package[];
    payments: Payment[];
    staff: Staff[];
  }> {
    const [members, packages, payments, staff] = await Promise.all([
      this.getMembers(),
      this.getPackages(),
      this.getPayments(),
      this.getStaff(),
    ]);
    
    return { members, packages, payments, staff };
  }
}

/*
 * FIREBASE SETUP INSTRUCTIONS:
 * 
 * 1. Install Firebase: npm install firebase
 * 
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 
 * 3. Enable Firestore:
 *    - Go to Build > Firestore Database
 *    - Create database (start in test mode for development)
 * 
 * 4. Get your config:
 *    - Go to Project Settings > General
 *    - Scroll down to "Your apps"
 *    - Click the web icon (</>)
 *    - Copy the config object
 * 
 * 5. Configure in src/database/config.ts:
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'firebase',
 *      firebase: {
 *        apiKey: 'your-api-key',
 *        authDomain: 'your-project.firebaseapp.com',
 *        projectId: 'your-project-id',
 *        storageBucket: 'your-project.appspot.com',
 *        messagingSenderId: 'your-sender-id',
 *        appId: 'your-app-id',
 *      },
 *    };
 * 
 * Collections that will be created:
 * - members
 * - packages
 * - payments
 * - staff
 */
