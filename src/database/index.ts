// Database Module - Main Export File
// 
// This module provides a backend-agnostic database abstraction layer
// that supports multiple database providers out of the box.

export * from './types';
export * from './config';
export { databaseManager, getDatabase } from './DatabaseManager';

// Adapters (imported on-demand to reduce bundle size)
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
// Firebase, Supabase, MongoDB, and Custom adapters are loaded dynamically

/*
 * QUICK START GUIDE:
 * 
 * 1. Configure your database in src/database/config.ts
 * 
 * 2. Initialize the database in your app entry point:
 *    
 *    import { databaseManager, databaseConfig } from './database';
 *    
 *    async function initApp() {
 *      await databaseManager.initialize(databaseConfig);
 *      // Start your app
 *    }
 * 
 * 3. Use the database in your components/context:
 *    
 *    import { getDatabase } from './database';
 *    
 *    const db = getDatabase();
 *    const members = await db.getMembers();
 *    await db.createMember({ ... });
 * 
 * 
 * AVAILABLE PROVIDERS:
 * 
 * - 'local': Browser localStorage (default, no setup required)
 * - 'firebase': Firebase Firestore (requires firebase package)
 * - 'supabase': Supabase (requires @supabase/supabase-js package)
 * - 'mongodb': MongoDB Data API (no additional packages)
 * - 'custom': Any REST API backend (no additional packages)
 * 
 * 
 * SWITCHING DATABASES:
 * 
 * The database layer is designed to be easily swappable. Just change
 * the configuration in config.ts and your app will work with the new
 * database without any code changes!
 * 
 * 
 * CREATING A CUSTOM ADAPTER:
 * 
 * 1. Create a new class that implements DatabaseAdapter interface
 * 2. Add it to DatabaseManager.ts
 * 3. Use it by setting provider: 'custom' with your config
 */
