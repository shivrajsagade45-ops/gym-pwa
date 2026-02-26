import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { Staff, StaffRole } from '../../types';

export const StaffList: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Staff' as StaffRole,
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, staffMember: Staff) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staffMember);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        phone: staffMember.phone,
        password: '', // Don't show existing password
        confirmPassword: '',
        role: staffMember.role,
        isActive: staffMember.isActive,
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', phone: '', password: '', confirmPassword: '', role: 'Staff', isActive: true });
    }
    setErrors({});
    setShowPassword(false);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
    setFormData({ name: '', phone: '', password: '', confirmPassword: '', role: 'Staff', isActive: true });
    setShowPassword(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    } else {
      // Check if phone already exists (for other staff)
      const existingStaff = staff.find(s => s.phone === formData.phone && s.id !== editingStaff?.id);
      if (existingStaff) {
        newErrors.phone = 'Phone number already exists';
      }
    }
    
    // Password validation - required for new staff, optional for edit
    if (!editingStaff) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      // If editing and password is provided, validate it
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editingStaff) {
      const updateData: Partial<Staff> = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };
      // Only update password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateStaff(editingStaff.id, updateData);
    } else {
      addStaff({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
      });
    }
    handleCloseDialog();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedStaff) {
      deleteStaff(selectedStaff.id);
    }
    setDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleResetPasswordClick = () => {
    setResetPasswordDialogOpen(true);
    setNewPassword('');
    setShowNewPassword(false);
    handleMenuClose();
  };

  const handleResetPasswordConfirm = () => {
    if (selectedStaff && newPassword.length >= 6) {
      updateStaff(selectedStaff.id, { password: newPassword });
      setResetPasswordDialogOpen(false);
      setSelectedStaff(null);
      setNewPassword('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: StaffRole): 'primary' | 'default' => {
    return role === 'Owner' ? 'primary' : 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Staff ({staff.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Staff
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Staff members can login using their phone number and password.
      </Alert>

      {staff.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No staff members yet. Add your first staff member!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {staff.map((staffMember, index) => (
              <ListItem
                key={staffMember.id}
                divider={index < staff.length - 1}
                sx={{ 
                  py: 2,
                  opacity: staffMember.isActive ? 1 : 0.6,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: staffMember.role === 'Owner' ? 'primary.main' : 'grey.500',
                    mr: 2,
                  }}
                >
                  {getInitials(staffMember.name)}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography fontWeight={600}>{staffMember.name}</Typography>
                      <Chip
                        label={staffMember.role}
                        size="small"
                        color={getRoleColor(staffMember.role)}
                      />
                      {!staffMember.isActive && (
                        <Chip
                          label="Inactive"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {staffMember.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        • Login: {staffMember.phone}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, staffMember)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog(selectedStaff!)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleResetPasswordClick}>
          <KeyIcon sx={{ mr: 1 }} fontSize="small" />
          Reset Password
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone (Login Username)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            error={Boolean(errors.phone)}
            helperText={errors.phone || 'This will be used as login username'}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label={editingStaff ? "New Password (leave blank to keep current)" : "Password"}
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={Boolean(errors.password)}
            helperText={errors.password || (editingStaff ? 'Leave blank to keep current password' : 'Minimum 6 characters')}
            margin="normal"
            required={!editingStaff}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {(formData.password || !editingStaff) && (
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              margin="normal"
              required={!editingStaff}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as StaffRole })
              }
            >
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Staff">Staff</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={formData.isActive ? "Active (Can Login)" : "Inactive (Cannot Login)"}
            sx={{ mt: 1 }}
          />

          {editingStaff && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Login credentials: Phone <strong>{formData.phone}</strong> with password
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStaff ? 'Update' : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Reset password for <strong>{selectedStaff?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={newPassword.length > 0 && newPassword.length < 6}
            helperText={newPassword.length > 0 && newPassword.length < 6 ? 'Minimum 6 characters' : ''}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordConfirm} 
            variant="contained"
            disabled={newPassword.length < 6}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Staff</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedStaff?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove their login access.
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
