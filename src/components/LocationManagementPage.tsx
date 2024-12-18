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
  Modal,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    if (!newLocation) return;
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
        body: JSON.stringify({ name: newLocation }),
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

  return (
    <Box 
    className="full-width-container" 
    >
      <Typography variant="h4" gutterBottom sx={{ marginBottom: '40px'}}>
        Zarządzanie Lokalizacjami
      </Typography>

      {error && <ErrorMessage message={error} />}

      <Box 
      className="button-container"
          sx={{
            display: 'flex',
            columnGap: '8px',
            marginBottom: '32px',
            
        }}>
        <TextField
          label="Nowa lokalizacja"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddLocation} disabled={loading}>
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
                <TableCell>{location.name}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleOpenDeleteModal(location.id, location.name)}
                  >
                    <DeleteIcon />
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Potwierdź usunięcie
          </Typography>
          <Typography gutterBottom>
            Aby usunąć lokalizację <b>{deleteLocationName}</b>, wpisz jej nazwę poniżej:
          </Typography>
          <TextField
            label="Potwierdź nazwę lokalizacji"
            value={confirmDeleteName}
            onChange={(e) => setConfirmDeleteName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" color="error" onClick={handleDeleteLocation}>
              Usuń
            </Button>
            <Button variant="outlined" onClick={handleCloseDeleteModal}>
              Anuluj
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default LocationManagementPage;
