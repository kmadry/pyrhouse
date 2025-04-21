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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { ErrorMessage } from './ErrorMessage';
import { getApiUrl } from '../config/api';
import * as Icons from '@mui/icons-material';

const LocationManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.details && location.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderLocationList = () => {
    if (isMobile) {
      return (
        <Stack spacing={2}>
          {filteredLocations.map((location) => (
            <Card key={location.id} variant="outlined">
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID: {location.id}
                  </Typography>
                  <Typography variant="h6">
                    {editingLocationId === location.id ? (
                      <TextField
                        value={editingValues.name || ''}
                        onChange={(e) =>
                          setEditingValues((prev) => ({ ...prev, name: e.target.value }))
                        }
                        fullWidth
                        size="small"
                      />
                    ) : (
                      location.name
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingLocationId === location.id ? (
                      <TextField
                        value={editingValues.details || ''}
                        onChange={(e) =>
                          setEditingValues((prev) => ({ ...prev, details: e.target.value }))
                        }
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      location.details || '-'
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingLocationId === location.id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveLocation}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      <SaveIcon sx={{ mr: 1 }} /> Zapisz
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditLocation(location.id, location.name, location.details)}
                        fullWidth
                        size="small"
                      >
                        <EditIcon sx={{ mr: 1 }} /> Edytuj
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenDeleteModal(location.id, location.name)}
                        fullWidth
                        size="small"
                      >
                        <DeleteIcon sx={{ mr: 1 }} /> Usuń
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
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
            {filteredLocations.map((location) => (
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
                      size="small"
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
                      size="small"
                    />
                  ) : (
                    location.details || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingLocationId === location.id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveLocation}
                      disabled={loading}
                      size="small"
                    >
                      <SaveIcon sx={{ mr: 1 }} /> Zapisz
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditLocation(location.id, location.name, location.details)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon sx={{ mr: 1 }} /> Edytuj
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleOpenDeleteModal(location.id, location.name)}
                        size="small"
                      >
                        <DeleteIcon sx={{ mr: 1 }} /> Usuń
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {error && <ErrorMessage message={error} />}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2, 
        marginBottom: 3,
        backgroundColor: 'background.default',
        p: 2,
        borderRadius: 1
      }}>
        <TextField
          label="Szukaj lokalizacji"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            sx: { 
              borderRadius: 1,
              height: '36px',
              '& input': {
                height: '36px',
                padding: '0 12px',
              }
            },
            startAdornment: (
              <Icons.Search sx={{ color: 'text.secondary', mr: 1 }} />
            )
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{ height: '36px' }}
        >
          Dodaj Lokalizację
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredLocations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'Brak lokalizacji pasujących do wyszukiwania' : 'Brak lokalizacji'}
          </Typography>
        </Paper>
      ) : (
        renderLocationList()
      )}

      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle>Dodaj Lokalizację</DialogTitle>
        <DialogContent>
          <TextField
            label="Nazwa Lokalizacji"
            value={newLocation.name}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Detale"
            value={newLocation.details}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, details: e.target.value }))}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setAddModalOpen(false)} 
            variant="outlined"
            size="small"
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleAddLocation} 
            variant="contained"
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={20} /> : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteModalOpen} 
        onClose={handleCloseDeleteModal}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
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
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDeleteModal}
            size="small"
          >
            Anuluj
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteLocation}
            size="small"
          >
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationManagementPage;
