
import { ErrorBoundary } from "./ErrorBoundary";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MemberList } from './components/Members/MemberList';
import { MemberForm } from './components/Members/MemberForm';
import { MemberDetail } from './components/Members/MemberDetail';
import { PackageList } from './components/Packages/PackageList';
import { PaymentList } from './components/Payments/PaymentList';
import { PaymentForm } from './components/Payments/PaymentForm';
import { PendingPayments } from './components/PendingPayments/PendingPayments';
import { StaffList } from './components/Staff/StaffList';


// Create MUI theme with custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ErrorBoundary>
  <AppProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="members" element={<MemberList />} />
        <Route path="members/add" element={<MemberForm />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="members/:id/edit" element={<MemberForm />} />
        <Route path="packages" element={<PackageList />} />
        <Route path="payments" element={<PaymentList />} />
        <Route path="payments/add" element={<PaymentForm />} />
        <Route path="pending-payments" element={<PendingPayments />} />
        <Route path="staff" element={<StaffList />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppProvider>
</ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}
