// Database Manager - Central point for database operations
// Handles initialization and provides the active database adapter

import { DatabaseAdapter, DatabaseConfig, DatabaseProvider } from './types';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';

// Lazy load other adapters to avoid bundling unused code
async function getFirebaseAdapter(config: DatabaseConfig['firebase']) {
  const { FirebaseAdapter } = await import('./adapters/FirebaseAdapter');
  return new FirebaseAdapter(config!);
}

async function getSupabaseAdapter(config: DatabaseConfig['supabase']) {
  const { SupabaseAdapter } = await import('./adapters/SupabaseAdapter');
  return new SupabaseAdapter(config!);
}

async function getMongoDBAdapter(config: DatabaseConfig['mongodb']) {
  const { MongoDBAdapter } = await import('./adapters/MongoDBAdapter');
  return new MongoDBAdapter(config!);
}

async function getCustomAPIAdapter(config: DatabaseConfig['custom']) {
  const { CustomAPIAdapter } = await import('./adapters/CustomAPIAdapter');
  return new CustomAPIAdapter(config!);
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private adapter: DatabaseAdapter | null = null;
  private config: DatabaseConfig | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(config: DatabaseConfig): Promise<void> {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.config = config;

    this.initPromise = (async () => {
      try {
        switch (config.provider) {
          case 'firebase':
            if (!config.firebase) throw new Error('Firebase config required');
            this.adapter = await getFirebaseAdapter(config.firebase);
            break;

          case 'supabase':
            if (!config.supabase) throw new Error('Supabase config required');
            this.adapter = await getSupabaseAdapter(config.supabase);
            break;

          case 'mongodb':
            if (!config.mongodb) throw new Error('MongoDB config required');
            this.adapter = await getMongoDBAdapter(config.mongodb);
            break;

          case 'custom':
            if (!config.custom) throw new Error('Custom API config required');
            this.adapter = await getCustomAPIAdapter(config.custom);
            break;

          case 'local':
          default:
            this.adapter = new LocalStorageAdapter();
            break;
        }

        await this.adapter.initialize();
        console.log(`Database initialized with provider: ${config.provider}`);
      } catch (error) {
        console.error('Database initialization failed:', error);
        // Fallback to localStorage if database connection fails
        console.log('Falling back to localStorage...');
        this.adapter = new LocalStorageAdapter();
        await this.adapter.initialize();
      }
    })();

    return this.initPromise;
  }

  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  getProvider(): DatabaseProvider {
    return this.config?.provider || 'local';
  }

  isConnected(): boolean {
    return this.adapter?.isConnected() || false;
  }

  // Utility method to reset and reinitialize with different config
  async reset(newConfig: DatabaseConfig): Promise<void> {
    this.adapter = null;
    this.initPromise = null;
    await this.initialize(newConfig);
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export convenience function for getting the adapter
export function getDatabase(): DatabaseAdapter {
  return databaseManager.getAdapter();
}
