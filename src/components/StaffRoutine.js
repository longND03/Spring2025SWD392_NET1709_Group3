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
    name: '',
    description: '',
    routineSkinTypes: [],
    routineSteps: []
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await fetch('http://localhost:5296/api/skincareroutine');
      const data = await response.json();
      setRoutines(data.items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setLoading(false);
    }
  };

  const createRoutine = async () => {
    try {
      const response = await fetch('http://localhost:5296/api/skincareroutine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(newRoutine),
      });

      if (response.ok) {
        fetchRoutines();
        setOpenAddDialog(false);
        setNewRoutine({
          name: '',
          description: '',
          routineSkinTypes: [],
          routineSteps: []
        });
      } else {
        console.error('Failed to create routine:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating routine:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoutine(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this routine?")) {
      fetch(`http://localhost:5296/api/skincareroutine/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.ok) {
          fetchRoutines();
        }
      })
      .catch(error => console.error('Error deleting routine:', error));
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
                onClick={() => setOpenAddDialog(true)}
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </StyledPaper>

      {/* Add Routine Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Skincare Routine</DialogTitle>
        <DialogContent>
          <TextField
            label="Routine Name"
            name="name"
            value={newRoutine.name}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={newRoutine.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenAddDialog(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={createRoutine} 
            color="primary" 
            variant="contained"
          >
            Create Routine
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffRoutine;