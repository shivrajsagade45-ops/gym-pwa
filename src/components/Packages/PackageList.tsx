import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { Package } from '../../types';

export const PackageList: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: 30,
    basePrice: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenDialog = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        durationDays: pkg.durationDays,
        basePrice: pkg.basePrice,
      });
    } else {
      setEditingPackage(null);
      setFormData({ name: '', durationDays: 30, basePrice: 0 });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPackage(null);
    setFormData({ name: '', durationDays: 30, basePrice: 0 });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.durationDays <= 0) {
      newErrors.durationDays = 'Duration must be greater than 0';
    }
    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Price must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editingPackage) {
      updatePackage(editingPackage.id, formData);
    } else {
      addPackage(formData);
    }
    handleCloseDialog();
  };

  const handleDeleteClick = (pkg: Package) => {
    setEditingPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (editingPackage) {
      deletePackage(editingPackage.id);
    }
    setDeleteDialogOpen(false);
    setEditingPackage(null);
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Packages ({packages.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Package
        </Button>
      </Box>

      {packages.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No packages yet. Add your first package!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid key={pkg.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {pkg.name}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(pkg)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(pkg)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {formatCurrency(pkg.basePrice)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {pkg.durationDays} days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Package Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={Boolean(errors.name)}
            helperText={errors.name}
            margin="normal"
            placeholder="e.g., Monthly, Quarterly"
          />
          <TextField
            fullWidth
            label="Duration (Days)"
            type="number"
            value={formData.durationDays}
            onChange={(e) =>
              setFormData({ ...formData, durationDays: Number(e.target.value) })
            }
            error={Boolean(errors.durationDays)}
            helperText={errors.durationDays}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Base Price"
            type="number"
            value={formData.basePrice}
            onChange={(e) =>
              setFormData({ ...formData, basePrice: Number(e.target.value) })
            }
            error={Boolean(errors.basePrice)}
            helperText={errors.basePrice}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPackage ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Package</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the "{editingPackage?.name}" package?
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
