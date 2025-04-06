import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import { ErrorMessage } from './ErrorMessage';
import { deleteLocation, updateLocation, createLocation } from '../services/locationService';
import { Location } from '../models/Location';

const LocationsPage: React.FC = () => {
  const { locations, error, refetch } = useLocations();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [dialogError, setDialogError] = useState<string | null>(null);

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({ name: location.name });
    } else {
      setEditingLocation(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setFormData({ name: '' });
    setDialogError(null);
  };

  const handleSubmit = async () => {
    try {
      setDialogError(null);
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData);
      }
      handleCloseDialog();
      refetch();
    } catch (err: any) {
      setDialogError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę lokalizację?')) {
      try {
        await deleteLocation(id);
        refetch();
      } catch (err: any) {
        console.error('Błąd podczas usuwania:', err.message);
      }
    }
  };

  if (error) {
    return (
      <Container>
        <ErrorMessage message="Błąd podczas ładowania lokalizacji" details={error} />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Lokalizacje
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Dodaj lokalizację
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nazwa</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow 
                key={location.id}
                onClick={() => navigate(`/locations/${location.id}`)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell>{location.id}</TableCell>
                <TableCell>{location.name}</TableCell>
                <TableCell align="right">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: 'flex-end'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(location)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(location.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingLocation ? 'Edytuj lokalizację' : 'Dodaj nową lokalizację'}
        </DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa lokalizacji"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingLocation ? 'Zapisz' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LocationsPage; 