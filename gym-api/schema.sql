CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT,
  duration_days INTEGER,
  base_price REAL,
  active INTEGER,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  address TEXT,
  package_id TEXT,
  package_price REAL,
  total_amount REAL,
  paid_amount REAL,
  package_start_date TEXT,
  package_end_date TEXT,
  photo TEXT,
  active INTEGER,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  amount REAL,
  payment_date TEXT,
  payment_mode TEXT,
  note TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT,
  password TEXT,
  active INTEGER,
  created_at TEXT
);