import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CardGiftcard as PackageIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  CalendarToday as CalendarIcon,
  Refresh as RenewIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { MembershipStatus } from '../../types';

export const MemberDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getMembersWithPending, getPackageById, getPaymentsByMember } = useApp();

  const members = getMembersWithPending();
  const member = id ? members.find(m => m.id === id) : undefined;
  const memberPackage = member?.packageId ? getPackageById(member.packageId) : undefined;
  const payments = id ? getPaymentsByMember(id) : [];

  if (!member) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
          Back
        </Button>
        <Typography sx={{ mt: 2 }}>Member not found.</Typography>
      </Box>
    );
  }

  const pendingAmount = member.totalAmount - member.paidAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return <ActiveIcon />;
      case 'expired':
        return <ExpiredIcon />;
      default:
        return <PackageIcon />;
    }
  };

  const getAvatarColor = () => {
    if (member.membershipStatus === 'expired') return 'error.main';
    if (member.pendingAmount > 0) return 'warning.main';
    if (member.membershipStatus === 'active') return 'success.main';
    return 'grey.500';
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/members')}>
          Back
        </Button>
      </Box>

      {/* Membership Status Alert */}
      {member.membershipStatus === 'expired' && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RenewIcon />}
              onClick={() => navigate(`/members/${id}/edit`)}
            >
              Renew
            </Button>
          }
        >
          This membership has expired on {member.packageExpiryDate ? formatDate(member.packageExpiryDate) : 'N/A'}. Please renew to continue.
        </Alert>
      )}

      {member.membershipStatus === 'active' && member.daysRemaining !== null && member.daysRemaining <= 7 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Membership expiring soon! Only {member.daysRemaining} day{member.daysRemaining !== 1 ? 's' : ''} remaining.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={member.photo || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getAvatarColor(),
                    fontSize: '1.5rem',
                    border: '3px solid',
                    borderColor: member.membershipStatus === 'active' 
                      ? 'success.main' 
                      : member.membershipStatus === 'expired' 
                        ? 'error.main' 
                        : 'grey.400',
                  }}
                >
                  {getInitials(member.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {member.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {memberPackage && (
                      <Chip
                        label={memberPackage.name}
                        size="small"
                        icon={<PackageIcon />}
                      />
                    )}
                    <Chip
                      label={
                        member.membershipStatus === 'active'
                          ? `Active - ${member.daysRemaining} days left`
                          : member.membershipStatus === 'expired'
                            ? 'Expired'
                            : 'No Package'
                      }
                      size="small"
                      color={getStatusColor(member.membershipStatus)}
                      icon={getStatusIcon(member.membershipStatus)}
                    />
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/members/${id}/edit`)}
                >
                  Edit
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography fontWeight={500}>{member.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HomeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography fontWeight={500}>
                        {member.address || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Membership Dates */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Package Start Date
                      </Typography>
                      <Typography fontWeight={500}>
                        {member.packageStartDate ? formatDate(member.packageStartDate) : 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color={member.membershipStatus === 'expired' ? 'error' : 'action'} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Package Expiry Date
                      </Typography>
                      <Typography 
                        fontWeight={500}
                        color={member.membershipStatus === 'expired' ? 'error.main' : 'text.primary'}
                      >
                        {member.packageExpiryDate ? formatDate(member.packageExpiryDate) : 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Payment Info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Package Price
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(member.packagePrice)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(member.totalAmount)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Paid Amount
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    {formatCurrency(member.paidAmount)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={pendingAmount > 0 ? 'error.main' : 'success.main'}
                  >
                    {formatCurrency(pendingAmount)}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {pendingAmount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<PaymentIcon />}
                    onClick={() => navigate(`/payments/add?memberId=${id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Payment
                  </Button>
                )}
                {member.membershipStatus === 'expired' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<RenewIcon />}
                    onClick={() => navigate(`/members/${id}/edit`)}
                    sx={{ borderRadius: 2 }}
                  >
                    Renew Membership
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Payment History
              </Typography>
              {payments.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No payments yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {payments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment, index) => (
                      <ListItem
                        key={payment.id}
                        divider={index < payments.length - 1}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography fontWeight={600} color="success.main">
                                {formatCurrency(payment.amount)}
                              </Typography>
                              <Chip label={payment.mode} size="small" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <>
                              {formatDate(payment.date)}
                              {payment.note && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {payment.note}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
