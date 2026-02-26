// Database Configuration
// Configure your database provider here

import { DatabaseConfig } from './types';

/*
 * HOW TO CONFIGURE YOUR DATABASE:
 * 
 * 1. LOCAL STORAGE (Default - No setup required):
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'local',
 *    };
 * 
 * 2. FIREBASE:
 *    - Install: npm install firebase
 *    - Get config from Firebase Console > Project Settings
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
 * 3. SUPABASE:
 *    - Install: npm install @supabase/supabase-js
 *    - Get config from Supabase Dashboard > Settings > API
 *    - Run the SQL schema (see SupabaseAdapter.ts)
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'supabase',
 *      supabase: {
 *        url: 'https://your-project.supabase.co',
 *        anonKey: 'your-anon-key',
 *      },
 *    };
 * 
 * 4. MONGODB (via Data API):
 *    - No installation required (uses REST API)
 *    - Enable Data API in MongoDB Atlas
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'mongodb',
 *      mongodb: {
 *        apiUrl: 'https://data.mongodb-api.com/app/your-app/endpoint/data/v1',
 *        apiKey: 'your-api-key',
 *        dataSource: 'Cluster0',
 *        database: 'gym_management',
 *      },
 *    };
 * 
 * 5. CUSTOM REST API:
 *    - No installation required
 *    - Build your own backend
 *    export const databaseConfig: DatabaseConfig = {
 *      provider: 'custom',
 *      custom: {
 *        baseUrl: 'https://your-api.com/api',
 *        headers: {
 *          'Authorization': 'Bearer your-token',
 *        },
 *      },
 *    };
 */

// ============================================
// CURRENT CONFIGURATION (Change this!)
// ============================================

export const databaseConfig: DatabaseConfig = {
  provider: 'supabase', // Change to 'firebase', 'supabase', 'mongodb', or 'custom'
  
  // Uncomment and fill in the appropriate config:
  
  // firebase: {
  //   apiKey: '',
  //   authDomain: '',
  //   projectId: '',
  //   storageBucket: '',
  //   messagingSenderId: '',
  //   appId: '',
  // },
  
  supabase: {
   url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
  // mongodb: {
  //   apiUrl: '',
  //   apiKey: '',
  //   dataSource: '',
  //   database: '',
  // },
  
  // custom: {
  //   baseUrl: '',
  //   headers: {},
  // },
};

// Environment-based configuration (optional)
// You can use environment variables for sensitive data:
// 
// export const databaseConfig: DatabaseConfig = {
//   provider: (import.meta.env.VITE_DB_PROVIDER as any) || 'local',
//   firebase: {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
//     appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
//   },
// };
