import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, onClick }) => (
  <Card
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': onClick
        ? { transform: 'translateY(-4px)', boxShadow: 4 }
        : {},
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: bgColor,
            color: color,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getDashboardStats, getMembersWithPending } = useApp();
  const stats = getDashboardStats();
  const allMembers = getMembersWithPending();
  const pendingMembers = allMembers
    .filter((m) => m.pendingAmount > 0)
    .slice(0, 5);
  const expiredMembers = allMembers
    .filter((m) => m.membershipStatus === 'expired')
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome to GymPro 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's what's happening with your gym today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/members/add')}
          sx={{ borderRadius: 2 }}
        >
          Add Member
        </Button>
      </Box>

      {/* Main Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<PeopleIcon />}
            color="#2563eb"
            bgColor="#dbeafe"
            onClick={() => navigate('/members')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon={<ActiveIcon />}
            color="#16a34a"
            bgColor="#dcfce7"
            onClick={() => navigate('/members')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Expired Members"
            value={stats.expiredMembers}
            icon={<ExpiredIcon />}
            color="#dc2626"
            bgColor="#fee2e2"
            onClick={() => navigate('/members')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Pending Payments"
            value={stats.pendingPaymentsCount}
            icon={<WarningIcon />}
            color="#f59e0b"
            bgColor="#fef3c7"
            onClick={() => navigate('/pending-payments')}
          />
        </Grid>
      </Grid>

      {/* Financial Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Total Pending Amount"
            value={formatCurrency(stats.totalPendingAmount)}
            icon={<WalletIcon />}
            color="#f59e0b"
            bgColor="#fef3c7"
            onClick={() => navigate('/pending-payments')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Total Collected"
            value={formatCurrency(stats.totalCollected)}
            icon={<TrendingUpIcon />}
            color="#16a34a"
            bgColor="#dcfce7"
            onClick={() => navigate('/payments')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Payments */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" fontWeight={600}>
                    Pending Payments
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/pending-payments')}
                >
                  View All
                </Button>
              </Box>
              {pendingMembers.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No pending payments! 🎉
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {pendingMembers.map((member, index) => (
                    <ListItem
                      key={member.id}
                      divider={index < pendingMembers.length - 1}
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <Avatar
                        src={member.photo || undefined}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          bgcolor: 'warning.main',
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.packageName || 'No package'}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={formatCurrency(member.pendingAmount)}
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expired Memberships */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExpiredIcon color="error" />
                  <Typography variant="h6" fontWeight={600}>
                    Expired Memberships
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/members')}
                >
                  View All
                </Button>
              </Box>
              {expiredMembers.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No expired memberships! 🎉
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {expiredMembers.map((member, index) => (
                    <ListItem
                      key={member.id}
                      divider={index < expiredMembers.length - 1}
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <Avatar
                        src={member.photo || undefined}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          bgcolor: 'error.main',
                          border: '2px solid',
                          borderColor: 'error.main',
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={member.name}
                        secondary={
                          <Box component="span">
                            {member.packageName} • Expired: {member.packageExpiryDate ? new Date(member.packageExpiryDate).toLocaleDateString('en-IN') : 'N/A'}
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/members/${member.id}/edit`);
                          }}
                        >
                          Renew
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/members/add')}
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Add Member
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WalletIcon />}
                    onClick={() => navigate('/payments/add')}
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Add Payment
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/packages')}
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Manage Packages
                  </Button>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/staff')}
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Manage Staff
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
