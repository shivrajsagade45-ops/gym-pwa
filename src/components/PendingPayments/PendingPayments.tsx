import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { MemberWithPending } from '../../types';

export const PendingPayments: React.FC = () => {
  const navigate = useNavigate();
  const { getMembersWithPending, updateMember } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [markPaidDialog, setMarkPaidDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithPending | null>(null);

  const pendingMembers = getMembersWithPending()
    .filter((m) => m.pendingAmount > 0)
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery)
    )
    .sort((a, b) => b.pendingAmount - a.pendingAmount);

  const totalPending = pendingMembers.reduce((sum, m) => sum + m.pendingAmount, 0);

  const handleMarkPaidClick = (member: MemberWithPending) => {
    setSelectedMember(member);
    setMarkPaidDialog(true);
  };

  const handleMarkPaidConfirm = () => {
    if (selectedMember) {
      updateMember(selectedMember.id, {
        paidAmount: selectedMember.totalAmount,
      });
    }
    setMarkPaidDialog(false);
    setSelectedMember(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h5" fontWeight={700}>
            Pending Payments
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {pendingMembers.length} members with pending payments • Total: {formatCurrency(totalPending)}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </CardContent>
      </Card>

      {pendingMembers.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchQuery
                  ? 'No pending payments found matching your search.'
                  : 'All payments are cleared! 🎉'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {pendingMembers.map((member, index) => (
              <ListItem
                key={member.id}
                divider={index < pendingMembers.length - 1}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: { xs: 2, sm: 0 } }}>
                  <Avatar 
                    src={member.photo || undefined}
                    sx={{ 
                      bgcolor: 'error.main', 
                      mr: 2,
                      border: '2px solid',
                      borderColor: 'error.main',
                    }}
                  >
                    {getInitials(member.name)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>{member.name}</Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {member.phone}
                          {member.packageName && ` • ${member.packageName}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Total: ${formatCurrency(member.totalAmount)}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Paid: ${formatCurrency(member.paidAmount)}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                          <Chip
                            label={`Pending: ${formatCurrency(member.pendingAmount)}`}
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </Box>
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 0, sm: 16 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' },
                    display: 'flex',
                    gap: 1,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PaymentIcon />}
                    onClick={() => navigate(`/payments/add?memberId=${member.id}`)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Payment
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleMarkPaidClick(member)}
                    sx={{ borderRadius: 2 }}
                  >
                    Mark Paid
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Mark as Paid Confirmation Dialog */}
      <Dialog open={markPaidDialog} onClose={() => setMarkPaidDialog(false)}>
        <DialogTitle>Mark as Fully Paid</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to mark {selectedMember?.name}'s payment as fully paid?
          </Typography>
          {selectedMember && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This will add {formatCurrency(selectedMember.pendingAmount)} to their paid amount.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkPaidDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkPaidConfirm} variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
