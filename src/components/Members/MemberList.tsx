import { sendWhatsAppMessage } from "../../utils/whatsapp";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
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
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
  HelpOutline as NoPackageIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { MemberWithPending, MembershipStatus } from '../../types';

type TabValue = 'all' | 'active' | 'expired';

export const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const { getMembersWithPending, deleteMember } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<MemberWithPending | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  const members = getMembersWithPending();
  
  // Filter by tab
  const getFilteredByTab = () => {
    switch (activeTab) {
      case 'active':
        return members.filter(m => m.membershipStatus === 'active');
      case 'expired':
        return members.filter(m => m.membershipStatus === 'expired');
      default:
        return members;
    }
  };

  // Then filter by search
  const filteredMembers = getFilteredByTab().filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
  );

  // Count members by status
  const activeCount = members.filter(m => m.membershipStatus === 'active').length;
  const expiredCount = members.filter(m => m.membershipStatus === 'expired').length;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: MemberWithPending) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    if (selectedMember) {
      navigate(`/members/${selectedMember.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedMember) {
      navigate(`/members/${selectedMember.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedMember) {
      deleteMember(selectedMember.id);
    }
    setDeleteDialogOpen(false);
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
        return <ActiveIcon sx={{ fontSize: 14 }} />;
      case 'expired':
        return <ExpiredIcon sx={{ fontSize: 14 }} />;
      default:
        return <NoPackageIcon sx={{ fontSize: 14 }} />;
    }
  };

  const getAvatarColor = (status: MembershipStatus, hasPending: boolean) => {
    if (status === 'expired') return 'error.main';
    if (hasPending) return 'warning.main';
    if (status === 'active') return 'success.main';
    return 'grey.500';
  };

  const getAvatarBorderColor = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return 'success.main';
      case 'expired':
        return 'error.main';
      default:
        return 'grey.400';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Members ({members.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/members/add')}
          sx={{ borderRadius: 2 }}
        >
          Add Member
        </Button>
      </Box>

      {/* Status Tabs */}
      <Card sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All
                <Chip label={members.length} size="small" />
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ActiveIcon sx={{ fontSize: 18, color: 'success.main' }} />
                Active
                <Chip label={activeCount} size="small" color="success" />
              </Box>
            } 
            value="active" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExpiredIcon sx={{ fontSize: 18, color: 'error.main' }} />
                Expired
                <Chip label={expiredCount} size="small" color="error" />
              </Box>
            } 
            value="expired" 
          />
        </Tabs>
      </Card>

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

      <Card>
        {filteredMembers.length === 0 ? (
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchQuery 
                  ? 'No members found matching your search.' 
                  : activeTab === 'active'
                    ? 'No active members found.'
                    : activeTab === 'expired'
                      ? 'No expired memberships. Great!'
                      : 'No members yet. Add your first member!'}
              </Typography>
            </Box>
          </CardContent>
        ) : (
          <List disablePadding>
            {filteredMembers.map((member, index) => (
              <ListItem
                key={member.id}
                divider={index < filteredMembers.length - 1}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  py: 2,
                }}
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <Avatar
                  src={member.photo || undefined}
                  sx={{
                    bgcolor: getAvatarColor(member.membershipStatus, member.pendingAmount > 0),
                    mr: 2,
                    border: '2px solid',
                    borderColor: getAvatarBorderColor(member.membershipStatus),
                  }}
                >
                  {getInitials(member.name)}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography fontWeight={600}>{member.name}</Typography>
                      <Chip
                        icon={getStatusIcon(member.membershipStatus)}
                        label={
                          member.membershipStatus === 'active' 
                            ? `${member.daysRemaining} days left`
                            : member.membershipStatus === 'expired'
                              ? 'Expired'
                              : 'No Package'
                        }
                        color={getStatusColor(member.membershipStatus)}
                        size="small"
                        variant={member.membershipStatus === 'no-package' ? 'outlined' : 'filled'}
                      />
                      {member.pendingAmount > 0 && (
                        <Chip
                          label={`Due: ${formatCurrency(member.pendingAmount)}`}
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.phone}
                        </Typography>
                      </Box>
                      {member.packageName && (
                        <Chip label={member.packageName} size="small" variant="outlined" />
                      )}
                      {member.packageExpiryDate && (
                        <Typography variant="caption" color="text.secondary">
                          Expires: {new Date(member.packageExpiryDate).toLocaleDateString('en-IN')}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
  {/* WhatsApp Button */}
  <IconButton
    edge="end"
    color="success"
    onClick={(e) => {
      e.stopPropagation(); // Prevent list item click
      sendWhatsAppMessage(
        member.phone,
        `Hi ${member.name}, this is a reminder from the gym regarding your membership. Please contact us for renewal 💪`
      );
    }}
    sx={{ mr: 1 }}
  >
    <WhatsAppIcon />
  </IconButton>

  {/* More Menu Button */}
  <IconButton
    edge="end"
    onClick={(e) => handleMenuOpen(e, member)}
  >
    <MoreVertIcon />
  </IconButton>
</ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedMember?.name}? This will also delete all their payment history.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
