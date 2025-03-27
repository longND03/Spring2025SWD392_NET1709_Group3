import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SpaIcon from '@mui/icons-material/Spa';
import FaceIcon from '@mui/icons-material/Face';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import cookieUtils from '../utils/cookies';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const AnimatedButton = motion(Button);

const StaffRoutine = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    Name: '',
    Description: '',
    RoutineSkinTypes: [],
    RoutineSteps: []
  });
  const [skinTypes, setSkinTypes] = useState([]);
  const [selectedSkinType, setSelectedSkinType] = useState({ 
    skinTypeId: '', 
    percentage: 100 
  });
  const [newStep, setNewStep] = useState({ 
    title: '', 
    description: '', 
    order: 1 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [dialogMode, setDialogMode] = useState('create');
  const [updatingRoutineId, setUpdatingRoutineId] = useState(null);

  useEffect(() => {
    const token = cookieUtils.getCookie('token');
    console.log('User token on load:', token);
    fetchRoutines(currentPage);
    fetchSkinTypes();
  }, [currentPage]);

  const fetchRoutines = async (page) => {
    try {
      const response = await fetch(`http://localhost:5296/api/skincareroutine?PageNumber=${page}&PageSize=${itemsPerPage}&IsDeleted=false`);
      const data = await response.json();
      console.log('Fetched Routines:', data);
      const activeRoutines = data.items.filter(routine => !routine.isDeleted);
      setRoutines(activeRoutines);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setLoading(false);
    }
  };

  const fetchSkinTypes = async () => {
    try {
      const response = await fetch('http://localhost:5296/api/skintype?IsDeleted=false');
      const data = await response.json();
      console.log('Fetched Skin Types:', data.items);
      setSkinTypes(data.items);
    } catch (error) {
      console.error('Error fetching skin types:', error);
    }
  };

  const createRoutine = async () => {
    try {
      const token = cookieUtils.getCookie('token');

      // Kiểm tra giá trị của newRoutine
      console.log('New Routine:', newRoutine);

      // Xác thực các trường bắt buộc
      if (!newRoutine.Name || !newRoutine.Description || newRoutine.RoutineSkinTypes.length === 0) {
        alert('Vui lòng điền tất cả các trường bắt buộc: Tên, Mô tả và ít nhất một loại da.');
        return;
      }

      if (newRoutine.RoutineSteps.length === 0) {
        alert('Vui lòng thêm ít nhất một bước vào quy trình.');
        return;
      }

      const formData = new FormData();
      formData.append('Name', newRoutine.Name.trim());
      formData.append('Description', newRoutine.Description.trim());

      // Thêm RoutineSkinTypes vào FormData
      newRoutine.RoutineSkinTypes.forEach(skinType => {
        formData.append('RoutineSkinTypes', JSON.stringify({
          skinTypeId: parseInt(skinType.skinTypeId, 10),
          percentage: Math.max(1, Math.min(100, parseInt(skinType.percentage, 10)))
        }));
      });

      // Thêm RoutineSteps vào FormData
      newRoutine.RoutineSteps.forEach((step, index) => {
        formData.append('RoutineSteps', JSON.stringify({
          title: step.title.trim(),
          description: step.description.trim(),
          order: index + 1
        }));
      });

      // Ghi lại nội dung FormData
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch('http://localhost:5296/api/skincareroutine', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không đặt Content-Type khi sử dụng FormData
        },
        body: formData,
      });

      if (response.ok) {
        const createdRoutine = await response.json(); // Lấy dữ liệu quy trình vừa tạo
        console.log('Created Routine:', createdRoutine); // Ghi lại quy trình vừa tạo
        fetchRoutines(currentPage); // Gọi lại hàm để lấy danh sách quy trình
        setOpenAddDialog(false);
        // Đặt lại biểu mẫu
        setNewRoutine({
          Name: '',
          Description: '',
          RoutineSkinTypes: [],
          RoutineSteps: []
        });
      } else {
        const errorData = await response.json();
        console.error('Tạo quy trình không thành công:', response.statusText, errorData);
        alert(`Lỗi: ${errorData.title}\nChi tiết: ${JSON.stringify(errorData.errors)}`);
      }
    } catch (error) {
      console.error('Lỗi khi tạo quy trình:', error);
    }
  };

  const handleAddSkinType = () => {
    console.log('Available Skin Types:', skinTypes);
    console.log('Selected Skin Type ID:', selectedSkinType.skinTypeId);

    // Validate skin type selection
    if (!selectedSkinType.skinTypeId) {
        alert('Please select a skin type');
        return;
    }

    if (selectedSkinType.percentage < 1 || selectedSkinType.percentage > 100) {
        alert('Percentage must be between 1-100');
        return;
    }

    // Convert selectedSkinType.skinTypeId to a number for comparison
    const selectedTypeId = parseInt(selectedSkinType.skinTypeId, 10);
    
    // Find selected skin type details
    const selectedType = skinTypes.find(type => type.id === selectedTypeId);
    console.log('Selected Type:', selectedType);

    if (!selectedType) {
        alert('Skin type not found');
        return;
    }

    // Create new skin type entry
    const newSkinTypeEntry = {
        skinTypeId: selectedType.id,
        skinTypeName: selectedType.name,
        percentage: parseInt(selectedSkinType.percentage)
    };

    // Update routine with new skin type
    setNewRoutine(prev => ({
        ...prev,
        RoutineSkinTypes: [
            ...prev.RoutineSkinTypes, 
            newSkinTypeEntry
        ]
    }));

    // Reset skin type selection
    setSelectedSkinType({ 
        skinTypeId: '', 
        percentage: 100 
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoutine(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this routine?")) {
      const token = cookieUtils.getCookie('token');

      fetch(`http://localhost:5296/api/skincareroutine/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.ok) {
          fetchRoutines(currentPage);
        } else {
          console.error('Failed to delete routine:', response.statusText);
        }
      })
      .catch(error => console.error('Error deleting routine:', error));
    }
  };

  const handleAddStep = () => {
    // Validate step
    if (!newStep.title || !newStep.description) {
      alert('Please fill in step title and description');
      return;
    }

    // Add new step to routine
    setNewRoutine(prev => ({
      ...prev,
      RoutineSteps: [
        ...prev.RoutineSteps, 
        { 
          ...newStep, 
          order: prev.RoutineSteps.length + 1 
        }
      ]
    }));

    // Reset step form
    setNewStep({ 
      title: '', 
      description: '', 
      order: 1 
    });
  };

  const handleUpdateClick = (routine) => {
    setNewRoutine({
      Name: routine.name,
      Description: routine.description,
      RoutineSkinTypes: routine.skinTypes,
      RoutineSteps: routine.routineSteps
    });
    setUpdatingRoutineId(routine.id);
    setDialogMode('update');
    setOpenAddDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setNewRoutine({
      Name: '',
      Description: '',
      RoutineSkinTypes: [],
      RoutineSteps: []
    });
    setDialogMode('create');
    setOpenAddDialog(true);
  };

  const updateRoutine = async () => {
    try {
      const token = cookieUtils.getCookie('token');

      // Validate required fields
      if (!newRoutine.Name || !newRoutine.Description || newRoutine.RoutineSkinTypes.length === 0) {
        alert('Please fill in all required fields: Name, Description, and at least one Skin Type.');
        return;
      }

      if (newRoutine.RoutineSteps.length === 0) {
        alert('Please add at least one step to the routine.');
        return;
      }

      console.log('New Routine:', newRoutine);

      const formData = new FormData();
      formData.append('Name', newRoutine.Name.trim());
      formData.append('Description', newRoutine.Description.trim());

      // Add RoutineSkinTypes to FormData
      newRoutine.RoutineSkinTypes.forEach(skinType => {
        formData.append('RoutineSkinTypes', JSON.stringify({
          skinTypeId: parseInt(skinType.skinTypeId, 10),
          percentage: Math.max(1, Math.min(100, parseInt(skinType.percentage, 10)))
        }));
      });

      // Add RoutineSteps to FormData
      newRoutine.RoutineSteps.forEach((step, index) => {
        formData.append('RoutineSteps', JSON.stringify({
          title: step.title.trim(),
          description: step.description.trim(),
          order: index + 1
        }));
      });

      const response = await fetch(`http://localhost:5296/api/skincareroutine/${updatingRoutineId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type when using FormData
        },
        body: formData,
      });

      if (response.ok) {
        const updatedRoutine = await response.json();
        console.log('Updated Routine:', updatedRoutine);
        fetchRoutines(currentPage); // Refresh the routine list immediately after update
        setOpenAddDialog(false); // Close the dialog
        // Reset the form
        setNewRoutine({
          Name: '',
          Description: '',
          RoutineSkinTypes: [],
          RoutineSteps: []
        });
        setUpdatingRoutineId(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to update routine:', response.statusText, errorData);
        alert(`Error: ${errorData.title}\nDetails: ${JSON.stringify(errorData.errors)}`);
      }
    } catch (error) {
      console.error('Error updating routine:', error);
    }
  };

  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: '#f4f6f8', 
      minHeight: '100vh' 
    }}>
      <StyledPaper elevation={3}>
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Grid 
            container 
            alignItems="center" 
            justifyContent="space-between" 
            sx={{ mb: 4 }}
          >
            <Grid item xs={12} sm={6} display="flex" alignItems="center">
              <FaceIcon 
                color="primary" 
                sx={{ fontSize: 40, mr: 2 }} 
              />
              <Box>
                <Typography 
                  variant="h4" 
                  color="primary" 
                  fontWeight="bold"
                >
                  Skincare Routines
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                >
                  Comprehensive routine management
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} textAlign="right">
              <AnimatedButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add New Routine
              </AnimatedButton>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Routine Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['ID', 'Name', 'Description', 'Skin Types', 'Steps', 'Actions'].map((header) => (
                    <StyledTableCell key={header} align="left">
                      {header}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Loading routines...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  routines.map((routine) => (
                    <TableRow 
                      key={routine.id} 
                      hover 
                      sx={{ 
                        transition: 'background-color 0.2s',
                        '&:hover': { 
                          backgroundColor: 'rgba(0,0,0,0.04)' 
                        }
                      }}
                    >
                      <TableCell>{routine.id}</TableCell>
                      <TableCell>{routine.name}</TableCell>
                      <TableCell>{routine.description}</TableCell>
                      <TableCell>
                        {routine.skinTypes.map((skin) => (
                          <Chip 
                            key={skin.skinTypeId}
                            label={`${skin.skinTypeName} (${skin.percentage}%)`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {routine.routineSteps.map((step) => (
                          <Card 
                            key={step.id} 
                            sx={{ 
                              mb: 1, 
                              background: 'rgba(0,0,0,0.02)', 
                              boxShadow: 'none',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }}
                          >
                            <CardContent sx={{ py: 1, px: 2 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold" 
                                color="text.primary"
                              >
                                Step {step.order}: {step.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                              >
                                {step.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={routine.isDeleted ? "Deleted" : "Active"}
                          color={routine.isDeleted ? "error" : "success"}
                          variant="filled"
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDelete(routine.id)}
                        >
                          Delete
                        </Button>
                        <Button onClick={() => handleUpdateClick(routine)}>Update Routine</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Typography>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Box>
        </Box>
      </StyledPaper>

      {/* Add Routine Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{dialogMode === 'create' ? "Create New Skincare Routine" : "Update Skincare Routine"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Routine Name"
            name="Name"
            value={newRoutine.Name}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            label="Description"
            name="Description"
            value={newRoutine.Description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          {/* Skin Type Selection */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <select 
              value={selectedSkinType.skinTypeId}
              onChange={(e) => setSelectedSkinType(prev => ({ 
                ...prev, 
                skinTypeId: e.target.value 
              }))}
              style={{ 
                marginRight: '16px', 
                padding: '8px', 
                width: '200px' 
              }}
            >
              <option value="">Choose Skin Type</option>
              {skinTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            
            <TextField
              label="Percentage"
              type="number"
              value={selectedSkinType.percentage}
              onChange={(e) => setSelectedSkinType(prev => ({ 
                ...prev, 
                percentage: e.target.value 
              }))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: '120px' }}
            />
            
            <Button 
              onClick={handleAddSkinType}
              variant="contained"
              color="primary"
              sx={{ ml: 2, height: '55px' }}
            >
              Add Skin Type
            </Button>
          </Box>

          {/* Selected Skin Types */}
          <Box sx={{ mb: 2 }}>
            {newRoutine.RoutineSkinTypes.map((skinType, index) => (
              <Chip 
                key={index}
                label={`${skinType.skinTypeName} (${skinType.percentage}%)`}
                onDelete={() => {
                  // Remove skin type
                  setNewRoutine(prev => ({
                    ...prev,
                    RoutineSkinTypes: prev.RoutineSkinTypes.filter((_, i) => i !== index)
                  }));
                }}
                sx={{ m: 1 }}
              />
            ))}
          </Box>

          {/* Step Input */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <TextField
              label="Step Title"
              value={newStep.title}
              onChange={(e) => setNewStep(prev => ({ 
                ...prev, 
                title: e.target.value 
              }))}
              fullWidth
            />
            <TextField
              label="Step Description"
              value={newStep.description}
              onChange={(e) => setNewStep(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              fullWidth
              multiline
              rows={3}
            />
            <Button 
              onClick={handleAddStep}
              variant="contained"
              color="secondary"
            >
              Add Step
            </Button>
          </Box>

          {/* Added Steps */}
          {newRoutine.RoutineSteps.map((step, index) => (
            <Card key={index} sx={{ mb: 1 }}>
              <CardContent>
                <Typography variant="subtitle2">
                  Step {step.order}: {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenAddDialog(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={dialogMode === 'create' ? createRoutine : updateRoutine} 
            color="primary" 
            variant="contained"
          >
            {dialogMode === 'create' ? "Create Routine" : "Update Routine"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffRoutine;