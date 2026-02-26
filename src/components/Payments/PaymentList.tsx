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
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const PaymentList: React.FC = () => {
  const navigate = useNavigate();
  const { payments, members } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || 'Unknown Member';
  };

  const filteredPayments = payments
    .filter((payment) => {
      const memberName = getMemberName(payment.memberId).toLowerCase();
      const matchesSearch = memberName.includes(searchQuery.toLowerCase());
      const matchesMode = modeFilter === 'all' || payment.mode === modeFilter;
      return matchesSearch && matchesMode;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const getModeColor = (mode: string): 'default' | 'primary' | 'secondary' | 'success' => {
    switch (mode) {
      case 'Cash':
        return 'success';
      case 'UPI':
        return 'primary';
      case 'Card':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Payments ({filteredPayments.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {formatCurrency(totalAmount)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/payments/add')}
          sx={{ borderRadius: 2 }}
        >
          Add Payment
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by member name..."
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
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FilterIcon fontSize="small" />
                  Mode
                </Box>
              </InputLabel>
              <Select
                value={modeFilter}
                label="Mode"
                onChange={(e) => setModeFilter(e.target.value)}
              >
                <MenuItem value="all">All Modes</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card>
        {filteredPayments.length === 0 ? (
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchQuery || modeFilter !== 'all'
                  ? 'No payments found matching your filters.'
                  : 'No payments yet.'}
              </Typography>
            </Box>
          </CardContent>
        ) : (
          <List disablePadding>
            {filteredPayments.map((payment, index) => {
              const memberName = getMemberName(payment.memberId);
              return (
                <ListItem
                  key={payment.id}
                  divider={index < filteredPayments.length - 1}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    py: 2,
                  }}
                  onClick={() => navigate(`/members/${payment.memberId}`)}
                >
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    {getInitials(memberName)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography fontWeight={600}>{memberName}</Typography>
                        <Chip
                          label={formatCurrency(payment.amount)}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(payment.date)}
                        </Typography>
                        <Chip
                          label={payment.mode}
                          size="small"
                          variant="outlined"
                          color={getModeColor(payment.mode)}
                        />
                        {payment.note && (
                          <Typography variant="body2" color="text.secondary">
                            • {payment.note}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Card>
    </Box>
  );
};
