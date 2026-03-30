import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Avatar,
  IconButton,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const MemberForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { packages, addMember, updateMember, getMemberById } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isManualEndDate, setIsManualEndDate] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    photo: '',
    packageId: '',
    packageStartDate: new Date().toISOString().split('T')[0],
    packageEndDate: '',
    packagePrice: 0,
    totalAmount: 0,
    paidAmount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const member = getMemberById(id);
      if (member) {
        setFormData({
          name: member.name,
          phone: member.phone,
          address: member.address,
          photo: member.photo || '',
          packageId: member.packageId || '',
          packageStartDate: member.packageStartDate || new Date().toISOString().split('T')[0],
           packageEndDate: member.packageEndDate || '',
          packagePrice: member.packagePrice,
          totalAmount: member.totalAmount,
          paidAmount: member.paidAmount,
        });
        if (member.photo) {
          setPhotoPreview(member.photo);
        }
      }
    }
  }, [id, isEdit, getMemberById]);

  const calculateEndDate = (startDate: string, durationDays: number): string => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + durationDays);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
  if (
    formData.packageId &&
    formData.packageStartDate &&
    !isManualEndDate   // ✅ THIS IS THE FIX
  ) {
    const pkg = packages.find((p) => p.id === formData.packageId);
    if (pkg) {
      setFormData((prev) => ({
        ...prev,
        packageEndDate: calculateEndDate(prev.packageStartDate, pkg.durationDays)
      }));
    }
  }
}, [formData.packageId, formData.packageStartDate, packages, isManualEndDate]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Image size should be less than 2MB' }));
        return;
      }

      // Clear any previous photo errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });

      // Read and compress the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 300px)
          const maxSize = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setPhotoPreview(compressedBase64);
          setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = packages.find((p) => p.id === packageId);
    setIsManualEndDate(false);
    if (selectedPackage) {
      setFormData((prev) => ({
        ...prev,
        packageId,
        packagePrice: selectedPackage.basePrice,
        totalAmount: selectedPackage.basePrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        packageId: '',
        packagePrice: 0,
        totalAmount: 0,
      }));
    }
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
    }
    if (!formData.packageId) {
      newErrors.packageId = 'Please select a package';
    }
    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }
    if (formData.paidAmount < 0) {
      newErrors.paidAmount = 'Paid amount cannot be negative';
    }
    if (formData.paidAmount > formData.totalAmount) {
      newErrors.paidAmount = 'Paid amount cannot exceed total amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("🔥 SUBMIT CLICKED");
    //if (!validate()) return;

    const memberData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      photo: formData.photo || undefined,
      packageId: formData.packageId,
      packageStartDate: formData.packageStartDate,
      packageEndDate: formData.packageEndDate,
      packagePrice: formData.packagePrice,
      totalAmount: formData.totalAmount,
      paidAmount: formData.paidAmount,
    };
    console.log("📦 DATA:", memberData);

    try {
      if (isEdit && id) {
        await updateMember(id, memberData);
      } else {
        await addMember(memberData);
      }
      navigate('/members');
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const pendingAmount = formData.totalAmount - formData.paidAmount;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/members')}
        >
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Member' : 'Add New Member'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
            {/* Photo Upload Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
              />
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 36,
                      height: 36,
                    }}
                    onClick={handlePhotoClick}
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  src={photoPreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    bgcolor: 'grey.200',
                    border: '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                  onClick={handlePhotoClick}
                >
                  {!photoPreview && <PersonIcon sx={{ fontSize: 60, color: 'grey.400' }} />}
                </Avatar>
              </Badge>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Click to upload photo (Auto compressed)
              </Typography>
              
              {photoPreview && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemovePhoto}
                  sx={{ mt: 1 }}
                >
                  Remove Photo
                </Button>
              )}
              
              {errors.photo && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.photo}
                </Typography>
              )}
            </Box>

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
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              margin="normal"
              required
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />

            <FormControl fullWidth margin="normal" error={Boolean(errors.packageId)}>
              <InputLabel>Package *</InputLabel>
              <Select
                value={formData.packageId}
                label="Package *"
                onChange={(e) => handlePackageChange(e.target.value)}
              >
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - ₹{pkg.basePrice} ({pkg.durationDays} days)
                  </MenuItem>
                ))}
              </Select>
              {errors.packageId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.packageId}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Package Start Date"
              type="date"
              value={formData.packageStartDate}
              onChange={(e) => setFormData({ ...formData, packageStartDate: e.target.value })}
              error={Boolean(errors.packageStartDate)}
              helperText={errors.packageStartDate || 'When the membership starts'}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Package End Date"
              type="date"
              value={formData.packageEndDate}
              onChange={(e) => {
  setIsManualEndDate(true); // ✅ mark manual override
  setFormData({ ...formData, packageEndDate: e.target.value });
}}
              error={Boolean(errors.packageEndDate)}
              helperText={errors.packageEndDate || 'Automatically calculated'}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Package Price (can override)"
              type="number"
              value={formData.packagePrice}
              onChange={(e) => {
                const price = Number(e.target.value);
                setFormData({
                  ...formData,
                  packagePrice: price,
                  totalAmount: price,
                });
              }}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Total Amount"
              type="number"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: Number(e.target.value) })
              }
              error={Boolean(errors.totalAmount)}
              helperText={errors.totalAmount}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              label="Paid Amount"
              type="number"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: Number(e.target.value) })
              }
              error={Boolean(errors.paidAmount)}
              helperText={errors.paidAmount}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />

            <Alert
              severity={pendingAmount > 0 ? 'warning' : 'success'}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2">
                <strong>Pending Amount:</strong> ₹{pendingAmount}
              </Typography>
            </Alert>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
  onClick={() => {
    console.log("BUTTON CLICKED");   // 🔥 debug
    handleSubmit();
  }}
  variant="contained"
  startIcon={<SaveIcon  />}
                sx={{ borderRadius: 2 }}
              >
                {isEdit ? 'Update Member' : 'Add Member'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/members')}
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
