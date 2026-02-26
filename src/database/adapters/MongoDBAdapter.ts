// MongoDB Database Adapter (via REST API / MongoDB Data API)
// Implements DatabaseAdapter interface for MongoDB

import { v4 as uuidv4 } from 'uuid';
import { Member, Package, Payment, Staff } from '../../types';
import { DatabaseAdapter, MongoDBConfig } from '../types';

// This adapter uses MongoDB Data API (REST)
// No additional packages required!

export class MongoDBAdapter implements DatabaseAdapter {
  private config: MongoDBConfig;
  private connected: boolean = false;

  constructor(config: MongoDBConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by making a simple query
      await this.makeRequest('find', 'packages', { limit: 1 });
      this.connected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB initialization error:', error);
      throw new Error('Failed to connect to MongoDB. Check your API credentials.');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async makeRequest(action: string, collection: string, options: Record<string, unknown> = {}): Promise<unknown> {
    const response = await fetch(`${this.config.apiUrl}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        dataSource: this.config.dataSource,
        database: this.config.database,
        collection,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MongoDB API error: ${error}`);
    }

    return response.json();
  }

  // Members
  async getMembers(): Promise<Member[]> {
    const result = await this.makeRequest('find', 'members', {
      sort: { createdAt: -1 },
    }) as { documents: Member[] };
    return result.documents || [];
  }

  async getMemberById(id: string): Promise<Member | null> {
    const result = await this.makeRequest('findOne', 'members', {
      filter: { id },
    }) as { document: Member | null };
    return result.document;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    const now = new Date().toISOString();
    const member: Member = {
      ...memberData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await this.makeRequest('insertOne', 'members', {
      document: member,
    });

    return member;
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    await this.makeRequest('updateOne', 'members', {
      filter: { id },
      update: {
        $set: {
          ...memberData,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updated = await this.getMemberById(id);
    if (!updated) throw new Error('Member not found');
    return updated;
  }

  async deleteMember(id: string): Promise<void> {
    // Delete related payments first
    await this.makeRequest('deleteMany', 'payments', {
      filter: { memberId: id },
    });

    await this.makeRequest('deleteOne', 'members', {
      filter: { id },
    });
  }

  // Packages
  async getPackages(): Promise<Package[]> {
    const result = await this.makeRequest('find', 'packages', {
      sort: { createdAt: -1 },
    }) as { documents: Package[] };
    return result.documents || [];
  }

  async getPackageById(id: string): Promise<Package | null> {
    const result = await this.makeRequest('findOne', 'packages', {
      filter: { id },
    }) as { document: Package | null };
    return result.document;
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const now = new Date().toISOString();
    const pkg: Package = {
      ...packageData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await this.makeRequest('insertOne', 'packages', {
      document: pkg,
    });

    return pkg;
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    await this.makeRequest('updateOne', 'packages', {
      filter: { id },
      update: {
        $set: {
          ...packageData,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updated = await this.getPackageById(id);
    if (!updated) throw new Error('Package not found');
    return updated;
  }

  async deletePackage(id: string): Promise<void> {
    await this.makeRequest('deleteOne', 'packages', {
      filter: { id },
    });
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    const result = await this.makeRequest('find', 'payments', {
      sort: { createdAt: -1 },
    }) as { documents: Payment[] };
    return result.documents || [];
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    const result = await this.makeRequest('find', 'payments', {
      filter: { memberId },
      sort: { date: -1 },
    }) as { documents: Payment[] };
    return result.documents || [];
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    await this.makeRequest('insertOne', 'payments', {
      document: payment,
    });

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
    await this.makeRequest('deleteOne', 'payments', {
      filter: { id },
    });
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const result = await this.makeRequest('find', 'staff', {
      sort: { createdAt: -1 },
    }) as { documents: Staff[] };
    return result.documents || [];
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const result = await this.makeRequest('findOne', 'staff', {
      filter: { id },
    }) as { document: Staff | null };
    return result.document;
  }

  async createStaff(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const now = new Date().toISOString();
    const staff: Staff = {
      ...staffData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await this.makeRequest('insertOne', 'staff', {
      document: staff,
    });

    return staff;
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    await this.makeRequest('updateOne', 'staff', {
      filter: { id },
      update: {
        $set: {
          ...staffData,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updated = await this.getStaffById(id);
    if (!updated) throw new Error('Staff not found');
    return updated;
  }

  async deleteStaff(id: string): Promise<void> {
    await this.makeRequest('deleteOne', 'staff', {
      filter: { id },
    });
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
 * MONGODB SETUP INSTRUCTIONS:
 * 
 * 1. Go to MongoDB Atlas (https://cloud.mongodb.com)
 * 2. Create a new cluster (free tier available)
 * 3. Enable Data API:
 *    - Go to App Services > Data API
 *    - Enable Data API
 *    - Create an API Key
 * 4. Create the database and collections:
 *    - Database: gym_management
 *    - Collections: members, packages, payments, staff
 * 5. Configure your app:
 *    
 *    const config: MongoDBConfig = {
 *      apiUrl: 'https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1',
 *      apiKey: 'your-api-key',
 *      dataSource: 'Cluster0',
 *      database: 'gym_management',
 *    };
 */
