# GymPro - Gym Management System (No Login + Supabase + Photo Compression)

## 📦 Project Overview

A complete Progressive Web App (PWA) for gym management with Supabase backend and automatic photo compression (≤1MB). No login required - open access to all features.

---

## ✅ Features Implemented

### 1. Member Module
- ✅ Add Member with photo upload (auto-compressed to ≤1MB)
- ✅ Edit Member details
- ✅ View All Members with search and filter
- ✅ Member fields:
  - Name
  - Phone
  - Address
  - Assigned Package
  - Package price (editable per member)
  - Total amount
  - Paid amount
  - Pending amount (calculated)
  - Package Start Date
  - Photo (auto-compressed to ≤1MB)
- ✅ One member can have only ONE active package at a time
- ✅ Active/Expired status with visual indicators
- ✅ Tabs: All, Active, Expired

### 2. Package Module
- ✅ Add Package
- ✅ Edit Package
- ✅ View package list
- ✅ Package fields:
  - Package name (Monthly, Quarterly, etc.)
  - Duration (days)
  - Base price
- ✅ Package price can be overridden per member

### 3. Payment Module
- ✅ Add payments (partial payments allowed)
- ✅ One member can have multiple payments
- ✅ Payment fields:
  - Member selection
  - Amount paid
  - Date
  - Payment mode (Cash / UPI / Card)
  - Optional note
- ✅ View payment history per member
- ✅ Payment list with search and filters

### 4. Pending Payment Module
- ✅ Separate screen (not just a filter)
- ✅ Show all members with pending amount > 0
- ✅ Display:
  - Member name + photo
  - Total amount
  - Paid amount
  - Pending amount
- ✅ Quick actions:
  - Add payment
  - Mark as fully paid

### 5. Staff Module
- ✅ Add Staff
- ✅ Edit Staff
- ✅ View staff list
- ✅ Staff fields:
  - Name
  - Phone
  - Role (Owner / Staff)
  - Password (for login if enabled later)
  - Active status

### 6. Dashboard
- ✅ Total members
- ✅ Active members count
- ✅ Expired members count
- ✅ Pending payments count
- ✅ Total pending amount
- ✅ Total collected today
- ✅ Expired members section with renew option
- ✅ Recent pending payments

### 7. PWA Features
- ✅ App installable on mobile devices
- ✅ Web App Manifest (manifest.json)
- ✅ Service Worker (sw.js)
- ✅ Basic offline support (UI loads without internet)
- ✅ Custom app icons (192x192, 512x512)

### 8. Photo Compression (≤1MB)
- ✅ Three compression levels:
  - High Quality: ≤1MB, 0.9 quality
  - Medium Quality: ≤500KB, 0.7 quality
  - Low Quality: ≤200KB, 0.5 quality
- ✅ Auto-fallback to lower quality if size exceeds limit
- ✅ Progressive JPEG format
- ✅ Maintains aspect ratio
- ✅ Used everywhere: MemberForm, MemberList, MemberDetail, PendingPayments, Dashboard

### 9. Supabase Integration
- ✅ Full Supabase adapter
- ✅ All CRUD operations
- ✅ Database abstraction layer
- ✅ Easy to switch to other databases
- ✅ Proper table mappings

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Profile.tsx
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   └── theme.ts
│   ├── Members/
│   │   ├── MemberDetail.tsx
│   │   ├── MemberForm.tsx
│   │   └── MemberList.tsx
│   ├── Packages/
│   │   └── PackageList.tsx
│   ├── Payments/
│   │   ├── PaymentForm.tsx
│   │   └── PaymentList.tsx
│   ├── PendingPayments/
│   │   └── PendingPayments.tsx
│   └── Staff/
│       └── StaffList.tsx
├── context/
│   ├── AppContext.tsx
│   └── AuthContext.tsx
├── data/
│   ├── database/
│   │   ├── adapters/
│   │   │   ├── DatabaseAdapter.ts
│   │   │   ├── FirebaseAdapter.ts
│   │   │   ├── LocalStorageAdapter.ts
│   │   │   ├── MongoDBAdapter.ts
│   │   │   └── SupabaseAdapter.ts
│   │   ├── config.ts
│   │   ├── database.ts
│   │   └── types.ts
│   ├── dummyData.ts
│   └── storage.ts
├── types/
│   └── index.ts
├── utils/
│   └── photoCompression.ts
├── App.tsx
└── main.tsx

public/
├── manifest.json
├── sw.js
├── icon.svg
├── icon-192.png
└── icon-512.png
```

---

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for database to initialize (≈2 minutes)
4. Go to **Settings → API** to get your credentials

### 2. Update Supabase Configuration

Open `src/data/database/config.ts` and replace:

```typescript
const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  key: 'your-anon-key-here',
}
```

### 3. Create Database Tables

Run these SQL queries in Supabase **SQL Editor**:

```sql
-- Create packages table
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration_days INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  package_id UUID REFERENCES packages(id),
  package_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  package_start_date DATE,
  photo TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Insert Sample Data

Run these SQL queries to insert demo data:

```sql
-- Insert sample packages
INSERT INTO packages (name, duration_days, base_price) VALUES
('Monthly', 30, 1500.00),
('Quarterly', 90, 4000.00),
('Half-Yearly', 180, 7000.00),
('Yearly', 365, 12000.00);

-- Insert sample members
INSERT INTO members (name, phone, address, package_id, package_price, total_amount, paid_amount, package_start_date) VALUES
('John Doe', '9876543210', '123 Main St, City', 
 (SELECT id FROM packages WHERE name = 'Monthly'),
 1500, 1500, 500, CURRENT_DATE),
('Jane Smith', '9876543211', '456 Park Ave, City',
 (SELECT id FROM packages WHERE name = 'Quarterly'),
 4000, 4000, 4000, CURRENT_DATE - INTERVAL '60 days');

-- Insert sample payments
INSERT INTO payments (member_id, amount, payment_date, payment_mode, note) VALUES
((SELECT id FROM members WHERE phone = '9876543210'), 500, CURRENT_DATE, 'Cash', 'First payment');

-- Insert sample staff
INSERT INTO staff (name, phone, role, password, active) VALUES
('Gym Owner', '9999999999', 'Owner', 'admin123', true),
('Gym Staff', '8888888888', 'Staff', 'staff123', true);
```

### 5. Enable Row Level Security (RLS)

Create policies in Supabase **Authentication → Policies**:

```sql
-- Packages policies
CREATE POLICY "Allow all operations on packages" 
ON packages FOR ALL USING (true) WITH CHECK (true);

-- Members policies
CREATE POLICY "Allow all operations on members" 
ON members FOR ALL USING (true) WITH CHECK (true);

-- Payments policies
CREATE POLICY "Allow all operations on payments" 
ON payments FOR ALL USING (true) WITH CHECK (true);

-- Staff policies
CREATE POLICY "Allow all operations on staff" 
ON staff FOR ALL USING (true) WITH CHECK (true);
```

### 6. Install Dependencies and Run

```bash
npm install
npm run dev
```

---

## 📸 Photo Compression Details

### How It Works

The photo compression utility (`src/utils/photoCompression.ts`) ensures all member photos are compressed to ≤1MB:

1. **High Quality (Default)**:
   - Max size: 1MB
   - Quality: 0.9
   - Max dimensions: 1920px

2. **Medium Quality (Fallback 1)**:
   - Max size: 500KB
   - Quality: 0.7
   - Max dimensions: 1280px

3. **Low Quality (Fallback 2)**:
   - Max size: 200KB
   - Quality: 0.5
   - Max dimensions: 800px

### Features

- ✅ Progressive JPEG format for better loading
- ✅ Maintains aspect ratio (no stretching)
- ✅ Auto-rotates based on EXIF orientation
- ✅ Converts all formats (PNG, GIF, etc.) to JPEG
- ✅ Quality degradation only when necessary

---

## 🎨 UI/UX Features

- ✅ Mobile-first responsive design
- ✅ Material UI with custom theme (purple gradient)
- ✅ Drawer/Sidebar navigation with hamburger menu
- ✅ Smooth transitions and animations
- ✅ Loading states and skeleton loaders
- ✅ Search and filter capabilities
- ✅ Visual indicators (colors, badges, icons)
- ✅ Confirmation dialogs for destructive actions
- ✅ Toast notifications for user feedback

---

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + React Router 6
- **UI Library**: Material UI (MUI) 5
- **State Management**: React Hooks (useContext, useReducer)
- **Database**: Supabase (PostgreSQL)
- **PWA**: Web App Manifest + Service Worker
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + MUI

---

## 📱 PWA Features

### Manifest.json
- App name: "GymPro - Gym Management"
- Short name: "GymPro"
- Theme color: #7c3aed
- Background color: #f8fafc
- Icons: 192x192, 512x512
- Display: standalone
- Orientation: portrait

### Service Worker (sw.js)
- Cache-first strategy
- Offline fallback
- Versioned caching
- Background sync support

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Vercel**: Push to GitHub, connect Vercel
2. **Netlify**: Push to GitHub, connect Netlify
3. **Supabase Hosting**: Deploy through Supabase Dashboard
4. **Any Static Hosting**: Deploy the `dist/` folder

---

## 📋 Future Enhancements

- [ ] Authentication system (Owner/Staff roles)
- [ ] Attendance tracking
- [ ] Expired member reminders
- [ ] Reports & analytics
- [ ] Email/SMS notifications
- [ ] Multi-gym support
- [ ] Trainer assignment
- [ ] Exercise plans
- [ ] Diet plans
- [ ] Invoice generation
- [ ] Export to CSV/PDF
- [ ] Dark mode

---

## 🐛 Troubleshooting

### Photo Upload Issues
- Ensure file is ≤5MB (before compression)
- Supported formats: JPEG, PNG, GIF, BMP, WebP
- Check browser console for errors

### Supabase Connection Issues
- Verify URL and API key are correct
- Ensure tables are created properly
- Check RLS policies are enabled
- Verify CORS settings in Supabase

### Build Errors
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🤝 Support

For issues, questions, or contributions:
- Check Supabase logs for database errors
- Check browser console for frontend errors
- Verify all tables and policies are created correctly
