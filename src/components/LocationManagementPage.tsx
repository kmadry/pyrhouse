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
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { ErrorMessage } from './ErrorMessage';

const LocationManagementPage: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);
  const [deleteLocationName, setDeleteLocationName] = useState('');
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingLocationName, setEditingLocationName] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations', {
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
    if (!newLocation.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newLocation.trim() }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(JSON.stringify(errorResponse, null, 2));
      }

      const data = await response.json();
      setLocations((prev) => [...prev, data]);
      setNewLocation('');
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
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations/${deleteLocationId}`,
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

  const handleEditLocation = (id: number, name: string) => {
    setEditingLocationId(id);
    setEditingLocationName(name);
  };

  const handleSaveLocation = async () => {
    if (!editingLocationName.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations/${editingLocationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: editingLocationName.trim() }),
        }
      );

      if (!response.ok) throw new Error('Failed to update location');

      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === editingLocationId ? { ...loc, name: editingLocationName.trim() } : loc
        )
      );

      setEditingLocationId(null);
      setEditingLocationName('');
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Nowa lokalizacja"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddLocation}
          disabled={!newLocation.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Dodaj'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nazwa Lokalizacji</TableCell>
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
                      value={editingLocationName}
                      onChange={(e) => setEditingLocationName(e.target.value)}
                      fullWidth
                    />
                  ) : (
                    location.name
                  )}
                </TableCell>
                <TableCell>
                  {editingLocationId === location.id ? (
                    <Button color="primary" onClick={handleSaveLocation}>
                      <SaveIcon /> Zapisz
                    </Button>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        onClick={() => handleEditLocation(location.id, location.name)}
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
