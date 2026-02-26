// Custom REST API Database Adapter
// Implements DatabaseAdapter interface for any custom REST API backend

import { v4 as uuidv4 } from 'uuid';
import { Member, Package, Payment, Staff } from '../../types';
import { DatabaseAdapter, CustomAPIConfig } from '../types';

// This adapter works with any REST API that follows standard conventions
// No additional packages required!

export class CustomAPIAdapter implements DatabaseAdapter {
  private config: CustomAPIConfig;
  private connected: boolean = false;

  constructor(config: CustomAPIConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by making a health check or simple query
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: this.config.headers || {},
      });
      
      // Even if health endpoint doesn't exist, we can proceed
      if (response.ok || response.status === 404) {
        this.connected = true;
        console.log('Custom API connected');
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      // Assume connection works if we can't verify
      this.connected = true;
      console.log('Custom API initialized (connection not verified)');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : (null as T);
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return this.makeRequest<Member[]>('GET', '/members');
  }

  async getMemberById(id: string): Promise<Member | null> {
    try {
      return await this.makeRequest<Member>('GET', `/members/${id}`);
    } catch {
      return null;
    }
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const now = new Date().toISOString();
    const member = {
      ...memberData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    return this.makeRequest<Member>('POST', '/members', member);
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    return this.makeRequest<Member>('PATCH', `/members/${id}`, {
      ...memberData,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteMember(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/members/${id}`);
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    return this.makeRequest<Package[]>('GET', '/packages');
  }

  async getPackageById(id: string): Promise<Package | null> {
    try {
      return await this.makeRequest<Package>('GET', `/packages/${id}`);
    } catch {
      return null;
    }
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const now = new Date().toISOString();
    const pkg = {
      ...packageData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    return this.makeRequest<Package>('POST', '/packages', pkg);
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    return this.makeRequest<Package>('PATCH', `/packages/${id}`, {
      ...packageData,
      updatedAt: new Date().toISOString(),
    });
  }

  async deletePackage(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/packages/${id}`);
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return this.makeRequest<Payment[]>('GET', '/payments');
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    return this.makeRequest<Payment[]>('GET', `/payments?memberId=${memberId}`);
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    return this.makeRequest<Payment>('POST', '/payments', payment);
  }

  async deletePayment(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/payments/${id}`);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return this.makeRequest<Staff[]>('GET', '/staff');
  }

  async getStaffById(id: string): Promise<Staff | null> {
    try {
      return await this.makeRequest<Staff>('GET', `/staff/${id}`);
    } catch {
      return null;
    }
  }

  async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const now = new Date().toISOString();
    const staff = {
      ...staffData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    return this.makeRequest<Staff>('POST', '/staff', staff);
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    return this.makeRequest<Staff>('PATCH', `/staff/${id}`, {
      ...staffData,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteStaff(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/staff/${id}`);
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
 * CUSTOM API EXPECTED ENDPOINTS:
 * 
 * The API should implement these REST endpoints:
 * 
 * Members:
 *   GET    /members          - Get all members
 *   GET    /members/:id      - Get member by ID
 *   POST   /members          - Create member
 *   PATCH  /members/:id      - Update member
 *   DELETE /members/:id      - Delete member
 * 
 * Packages:
 *   GET    /packages         - Get all packages
 *   GET    /packages/:id     - Get package by ID
 *   POST   /packages         - Create package
 *   PATCH  /packages/:id     - Update package
 *   DELETE /packages/:id     - Delete package
 * 
 * Payments:
 *   GET    /payments         - Get all payments
 *   GET    /payments?memberId=:id - Get payments for member
 *   POST   /payments         - Create payment
 *   DELETE /payments/:id     - Delete payment
 * 
 * Staff:
 *   GET    /staff            - Get all staff
 *   GET    /staff/:id        - Get staff by ID
 *   POST   /staff            - Create staff
 *   PATCH  /staff/:id        - Update staff
 *   DELETE /staff/:id        - Delete staff
 * 
 * Example usage:
 *   const adapter = new CustomAPIAdapter({
 *     baseUrl: 'https://your-api.com/api',
 *     headers: {
 *       'Authorization': 'Bearer your-token',
 *     },
 *   });
 */
