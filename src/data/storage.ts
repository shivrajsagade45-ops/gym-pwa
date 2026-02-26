// Local storage abstraction layer for easy backend migration
// This can be replaced with API calls to Firebase, Supabase, MongoDB, etc.

const STORAGE_KEYS = {
  MEMBERS: 'gym_members',
  PACKAGES: 'gym_packages',
  PAYMENTS: 'gym_payments',
  STAFF: 'gym_staff',
  DATA_VERSION: 'gym_data_version',
};

// Increment this when you need to force update the demo data
const CURRENT_DATA_VERSION = 3;

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  keys: STORAGE_KEYS,
};

// Reset all data to defaults
export const resetAllData = (
  dummyMembers: unknown[],
  dummyPackages: unknown[],
  dummyPayments: unknown[],
  dummyStaff: unknown[]
): void => {
  storage.set(STORAGE_KEYS.MEMBERS, dummyMembers);
  storage.set(STORAGE_KEYS.PACKAGES, dummyPackages);
  storage.set(STORAGE_KEYS.PAYMENTS, dummyPayments);
  storage.set(STORAGE_KEYS.STAFF, dummyStaff);
  storage.set(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
};

// Initialize storage with dummy data if empty or outdated
export const initializeStorage = (
  dummyMembers: unknown[],
  dummyPackages: unknown[],
  dummyPayments: unknown[],
  dummyStaff: unknown[]
): void => {
  const storedVersion = storage.get<number>(STORAGE_KEYS.DATA_VERSION);
  
  // If version is outdated, reset staff data to include passwords
  if (!storedVersion || storedVersion < CURRENT_DATA_VERSION) {
    // Keep members, packages, payments but update staff for login
    storage.set(STORAGE_KEYS.STAFF, dummyStaff);
    storage.set(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
  }
  
  if (!storage.get(STORAGE_KEYS.MEMBERS)) {
    storage.set(STORAGE_KEYS.MEMBERS, dummyMembers);
  }
  if (!storage.get(STORAGE_KEYS.PACKAGES)) {
    storage.set(STORAGE_KEYS.PACKAGES, dummyPackages);
  }
  if (!storage.get(STORAGE_KEYS.PAYMENTS)) {
    storage.set(STORAGE_KEYS.PAYMENTS, dummyPayments);
  }
  if (!storage.get(STORAGE_KEYS.STAFF)) {
    storage.set(STORAGE_KEYS.STAFF, dummyStaff);
  }
};
