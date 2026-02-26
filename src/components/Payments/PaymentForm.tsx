import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { PaymentMode } from '../../types';

export const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId');
  const { members, addPayment, getMemberById } = useApp();

  const [formData, setFormData] = useState({
    memberId: preselectedMemberId || '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    mode: 'Cash' as PaymentMode,
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMember = formData.memberId ? getMemberById(formData.memberId) : undefined;
  const pendingAmount = selectedMember
    ? selectedMember.totalAmount - selectedMember.paidAmount
    : 0;

  useEffect(() => {
    if (preselectedMemberId) {
      setFormData((prev) => ({ ...prev, memberId: preselectedMemberId }));
    }
  }, [preselectedMemberId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (formData.amount > pendingAmount && pendingAmount > 0) {
      newErrors.amount = `Amount cannot exceed pending amount (₹${pendingAmount})`;
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addPayment({
        memberId: formData.memberId,
        amount: formData.amount,
        date: formData.date,
        mode: formData.mode,
        note: formData.note || undefined,
      });
      navigate('/payments');
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handlePayFull = () => {
    if (pendingAmount > 0) {
      setFormData((prev) => ({ ...prev, amount: pendingAmount }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/payments')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Add Payment
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
            <FormControl fullWidth margin="normal" error={Boolean(errors.memberId)}>
              <InputLabel>Member *</InputLabel>
              <Select
                value={formData.memberId}
                label="Member *"
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              >
                {members.map((member) => {
                  const memberPending = member.totalAmount - member.paidAmount;
                  return (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                      {memberPending > 0 && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="error"
                          sx={{ ml: 1 }}
                        >
                          (Pending: {formatCurrency(memberPending)})
                        </Typography>
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.memberId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.memberId}
                </Typography>
              )}
            </FormControl>

            {selectedMember && (
              <Alert
                severity={pendingAmount > 0 ? 'info' : 'success'}
                sx={{ my: 2 }}
                action={
                  pendingAmount > 0 && (
                    <Button color="inherit" size="small" onClick={handlePayFull}>
                      Pay Full
                    </Button>
                  )
                }
              >
                {pendingAmount > 0 ? (
                  <>
                    <strong>Pending:</strong> {formatCurrency(pendingAmount)} | 
                    <strong> Paid:</strong> {formatCurrency(selectedMember.paidAmount)} / 
                    {formatCurrency(selectedMember.totalAmount)}
                  </>
                ) : (
                  'No pending amount for this member!'
                )}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              margin="normal"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={Boolean(errors.date)}
              helperText={errors.date}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payment Mode *
              </Typography>
              <ToggleButtonGroup
                value={formData.mode}
                exclusive
                onChange={(_, value) => value && setFormData({ ...formData, mode: value })}
                fullWidth
              >
                <ToggleButton value="Cash" sx={{ py: 1.5 }}>
                  Cash
                </ToggleButton>
                <ToggleButton value="UPI" sx={{ py: 1.5 }}>
                  UPI
                </ToggleButton>
                <ToggleButton value="Card" sx={{ py: 1.5 }}>
                  Card
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              label="Note (Optional)"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              placeholder="e.g., First installment, Balance payment..."
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ borderRadius: 2 }}
                disabled={pendingAmount === 0 && selectedMember !== undefined}
              >
                Add Payment
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/payments')}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
