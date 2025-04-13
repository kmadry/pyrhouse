import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { ErrorMessage } from './ErrorMessage';
import { getApiUrl } from '../config/api';

const LocationManagementPage: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', details: '' });
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{ name?: string; details?: string }>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);
  const [deleteLocationName, setDeleteLocationName] = useState('');
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/locations'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch locations');

      const data = await response.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/locations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLocation),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(JSON.stringify(errorResponse, null, 2));
      }

      const data = await response.json();
      setLocations((prev) => [...prev, data]);
      setAddModalOpen(false);
      setNewLocation({ name: '', details: '' });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocation = (id: number, name: string, details: string | null) => {
    setEditingLocationId(id);
    setEditingValues({ name, details: details || '' });
  };

  const handleSaveLocation = async () => {
    if (!editingLocationId || !Object.keys(editingValues).length) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/locations/${editingLocationId}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingValues),
        }
      );

      if (!response.ok) throw new Error('Failed to update location');

      const updatedLocation = await response.json();
      setLocations((prev) =>
        prev.map((loc) => (loc.id === editingLocationId ? updatedLocation : loc))
      );

      setEditingLocationId(null);
      setEditingValues({});
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (id: number, name: string) => {
    setDeleteLocationId(id);
    setDeleteLocationName(name);
    setConfirmDeleteName('');
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteLocationId(null);
    setDeleteLocationName('');
  };

  const handleDeleteLocation = async () => {
    if (confirmDeleteName !== deleteLocationName) {
      setError('Confirmation name does not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/locations/${deleteLocationId}`),
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(JSON.stringify(errorResponse, null, 2));
      }

      setLocations((prev) => prev.filter((location) => location.id !== deleteLocationId));
      handleCloseDeleteModal();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Zarządzanie Lokalizacjami
      </Typography>

      {error && <ErrorMessage message={error} />}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          Dodaj Lokalizację
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nazwa Lokalizacji</TableCell>
              <TableCell>Detale</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>{location.id}</TableCell>
                <TableCell>
                  {editingLocationId === location.id ? (
                    <TextField
                      value={editingValues.name || ''}
                      onChange={(e) =>
                        setEditingValues((prev) => ({ ...prev, name: e.target.value }))
                      }
                      fullWidth
                    />
                  ) : (
                    location.name
                  )}
                </TableCell>
                <TableCell>
                  {editingLocationId === location.id ? (
                    <TextField
                      value={editingValues.details || ''}
                      onChange={(e) =>
                        setEditingValues((prev) => ({ ...prev, details: e.target.value }))
                      }
                      fullWidth
                    />
                  ) : (
                    location.details || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingLocationId === location.id ? (
                    <Button color="primary" onClick={handleSaveLocation} disabled={loading}>
                      <SaveIcon /> Zapisz
                    </Button>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        onClick={() => handleEditLocation(location.id, location.name, location.details)}
                      >
                        <EditIcon /> Edytuj
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleOpenDeleteModal(location.id, location.name)}
                      >
                        <DeleteIcon /> Usuń
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <DialogTitle>Dodaj Lokalizację</DialogTitle>
        <DialogContent>
          <TextField
            label="Nazwa Lokalizacji"
            value={newLocation.name}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Detale"
            value={newLocation.details}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, details: e.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)} color="secondary">
            Anuluj
          </Button>
          <Button onClick={handleAddLocation} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <Typography>
            Aby usunąć lokalizację <b>{deleteLocationName}</b>, wpisz jej nazwę poniżej:
          </Typography>
          <TextField
            label="Potwierdź nazwę lokalizacji"
            value={confirmDeleteName}
            onChange={(e) => setConfirmDeleteName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleDeleteLocation}>
            Usuń
          </Button>
          <Button variant="outlined" onClick={handleCloseDeleteModal}>
            Anuluj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationManagementPage;
