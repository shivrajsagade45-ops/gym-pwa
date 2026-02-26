// Supabase Database Adapter
// Implements DatabaseAdapter interface for Supabase
//
// INSTALLATION REQUIRED: npm install @supabase/supabase-js
// This adapter will only work after installing the supabase package

import { v4 as uuidv4 } from 'uuid';
import { Member, Package, Payment, Staff } from '../../types';
import { DatabaseAdapter, SupabaseConfig } from '../types';
import { createClient } from '@supabase/supabase-js';

export class SupabaseAdapter implements DatabaseAdapter {
  private config: SupabaseConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any = null;
  private connected: boolean = false;

  constructor(config: SupabaseConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamic import - will fail if @supabase/supabase-js is not installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.supabase = createClient(this.config.url, this.config.anonKey);
      this.connected = true;
      console.log('Supabase connected successfully');
    } catch (error) {
      console.error('Supabase initialization error:', error);
      throw new Error('Failed to initialize Supabase. Run: npm install @supabase/supabase-js');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Members
  async getMembers(): Promise<Member[]> {
    const { data, error } = await this.supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return this.transformFromSnakeCase<Member>(data || []);
  }

  async getMemberById(id: string): Promise<Member | null> {
    const { data, error } = await this.supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformFromSnakeCase<Member>([data])[0] : null;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const now = new Date().toISOString();
    const member = {
      id: uuidv4(),
      ...this.transformToSnakeCase(memberData),
      created_at: now,
      updated_at: now,
    };
    
    const { data, error } = await this.supabase
      .from('members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Member>([data])[0];
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const { data, error } = await this.supabase
      .from('members')
      .update({
        ...this.transformToSnakeCase(memberData),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Member>([data])[0];
  }

  async deleteMember(id: string): Promise<void> {
    // Delete related payments first
    await this.supabase
      .from('payments')
      .delete()
      .eq('member_id', id);
    
    const { error } = await this.supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    const { data, error } = await this.supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return this.transformFromSnakeCase<Package>(data || []);
  }

  async getPackageById(id: string): Promise<Package | null> {
    const { data, error } = await this.supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformFromSnakeCase<Package>([data])[0] : null;
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const now = new Date().toISOString();
    const pkg = {
      id: uuidv4(),
      ...this.transformToSnakeCase(packageData),
      created_at: now,
      updated_at: now,
    };
    
    const { data, error } = await this.supabase
      .from('packages')
      .insert(pkg)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Package>([data])[0];
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    const { data, error } = await this.supabase
      .from('packages')
      .update({
        ...this.transformToSnakeCase(packageData),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Package>([data])[0];
  }

  async deletePackage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('packages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return this.transformFromSnakeCase<Payment>(data || []);
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return this.transformFromSnakeCase<Payment>(data || []);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment = {
      id: uuidv4(),
      ...this.transformToSnakeCase(paymentData),
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await this.supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update member's paid amount
    const member = await this.getMemberById(paymentData.memberId);
    if (member) {
      await this.updateMember(member.id, {
        paidAmount: member.paidAmount + paymentData.amount,
      });
    }
    
    return this.transformFromSnakeCase<Payment>([data])[0];
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const { data, error } = await this.supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return this.transformFromSnakeCase<Staff>(data || []);
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const { data, error } = await this.supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformFromSnakeCase<Staff>([data])[0] : null;
  }

  async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const now = new Date().toISOString();
    const staff = {
      id: uuidv4(),
      ...this.transformToSnakeCase(staffData),
      created_at: now,
      updated_at: now,
    };
    
    const { data, error } = await this.supabase
      .from('staff')
      .insert(staff)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Staff>([data])[0];
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    const { data, error } = await this.supabase
      .from('staff')
      .update({
        ...this.transformToSnakeCase(staffData),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformFromSnakeCase<Staff>([data])[0];
  }

  async deleteStaff(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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

  // Helper functions for snake_case <-> camelCase conversion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformToSnakeCase(obj: Record<string, any>): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = value;
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFromSnakeCase<T>(data: Record<string, any>[]): T[] {
    return data.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(item)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = value;
      }
      return result as T;
    });
  }
}

/*
 * SUPABASE SETUP INSTRUCTIONS:
 * 
 * 1. Install Supabase: npm install @supabase/supabase-js
 * 
 * 2. Create a Supabase project at https://supabase.com
 * 
 * 3. Run this SQL in the SQL Editor to create tables:
 * 
 * -- Members table
 * CREATE TABLE members (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   phone TEXT NOT NULL,
 *   address TEXT,
 *   photo TEXT,
 *   package_id UUID REFERENCES packages(id),
 *   package_start_date DATE,
 *   package_price DECIMAL(10,2) DEFAULT 0,
 *   total_amount DECIMAL(10,2) DEFAULT 0,
 *   paid_amount DECIMAL(10,2) DEFAULT 0,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Packages table
 * CREATE TABLE packages (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   duration_days INTEGER NOT NULL,
 *   base_price DECIMAL(10,2) NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Payments table
 * CREATE TABLE payments (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   member_id UUID REFERENCES members(id) ON DELETE CASCADE,
 *   amount DECIMAL(10,2) NOT NULL,
 *   date DATE NOT NULL,
 *   mode TEXT NOT NULL CHECK (mode IN ('Cash', 'UPI', 'Card')),
 *   note TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Staff table
 * CREATE TABLE staff (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   phone TEXT NOT NULL,
 *   role TEXT NOT NULL CHECK (role IN ('Owner', 'Staff')),
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * 4. Get your config from Settings > API:
 *    - URL: Project URL
 *    - Anon Key: anon public key
 * 
 * 5. Configure in src/database/config.ts:
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'supabase',
 *      supabase: {
 *        url: 'https://your-project.supabase.co',
 *        anonKey: 'your-anon-key',
 *      },
 *    };
 */
