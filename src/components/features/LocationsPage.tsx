import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../../hooks/useLocations';
import { ErrorMessage } from '../ui/ErrorMessage';
import { deleteLocation, updateLocation, createLocation } from '../../services/locationService';
import { Location } from '../../models/Location';
import * as Icons from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const LocationsPage: React.FC = () => {
  const { locations, error, refetch, loading } = useLocations();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '', details: '' });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteErrorDetails, setDeleteErrorDetails] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  useEffect(() => {
    refetch();
  }, []);

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({ 
        name: location.name,
        details: location.details || ''
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', details: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setFormData({ name: '', details: '' });
    setDialogError(null);
  };

  const handleSubmit = async () => {
    try {
      setDialogError(null);
      if (editingLocation) {
        const updateData: Partial<Location> = {};
        
        // Dodaj do updateData tylko te pola, które się zmieniły
        if (formData.name !== editingLocation.name) {
          updateData.name = formData.name;
        }
        
        // Porównaj details z uwzględnieniem null i pustego stringa
        const currentDetails = formData.details.trim() || null;
        const originalDetails = editingLocation.details || null;
        if (currentDetails !== originalDetails) {
          updateData.details = currentDetails;
        }

        // Wykonaj aktualizację tylko jeśli są jakieś zmiany
        if (Object.keys(updateData).length > 0) {
          await updateLocation(editingLocation.id, updateData);
        }
      } else {
        await createLocation({
          name: formData.name,
          details: formData.details.trim() || null,
          lat: 0,
          lng: 0
        });
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
        setSuccessMessage('Lokalizacja została usunięta pomyślnie!');
        setDeleteError(null);
        setDeleteErrorDetails(null);
        refetch();
      } catch (err: any) {
        if (err && typeof err === 'object' && 'message' in err) {
          setDeleteError(err.message);
          setDeleteErrorDetails(err.details || null);
        } else {
          setDeleteError(err.message || 'Wystąpił nieoczekiwany błąd podczas usuwania lokalizacji.');
          setDeleteErrorDetails(null);
        }
      }
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTable = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            {['ID', 'Nazwa', 'Szczegóły', hasAdminAccess() ? 'Akcje' : ''].map((field) => (
              <TableCell 
                key={field} 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.contrastText',
                  py: 2
                }}
              >
                {field}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLocations.map((location) => (
            <TableRow 
              key={location.id}
              onClick={() => navigate(`/locations/${location.id}`)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              <TableCell>
                <Typography component="div" sx={{ fontWeight: 500 }}>
                  {location.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div">
                  {location.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div" color="text.secondary">
                  {location.details ? (
                    location.details.length > 48 
                      ? `${location.details.substring(0, 48)}...` 
                      : location.details
                  ) : '-'}
                </Typography>
              </TableCell>
              {hasAdminAccess() && (
                <TableCell>
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
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {filteredLocations.map((location) => (
        <Grid item xs={12} key={location.id}>
          <Card 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer',
              },
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => navigate(`/locations/${location.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                  ID: {location.id}
                </Typography>
                <Chip 
                  label="Lokalizacja" 
                  size="small" 
                  color="primary"
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Nazwa:</Typography>
                  <Typography variant="body2">{location.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Szczegóły:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {location.details ? (
                      location.details.length > 48 
                        ? `${location.details.substring(0, 48)}...` 
                        : location.details
                    ) : '-'}
                  </Typography>
                </Box>
              </Box>

              {hasAdminAccess() && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 1,
                    justifyContent: 'flex-end',
                    mt: 2
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
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <ErrorMessage message="Błąd podczas ładowania lokalizacji" details={error} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        marginBottom: 3,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: { xs: 1, sm: 0 }
          }}
        >
          Lokalizacje
        </Typography>
        {hasAdminAccess() && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 1,
              px: 3
            }}
          >
            Dodaj lokalizację
          </Button>
        )}
      </Box>

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
      </Box>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 5,
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Ładowanie lokalizacji...
          </Typography>
        </Box>
      ) : filteredLocations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 5,
          backgroundColor: 'background.default',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak lokalizacji
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Dodaj nową lokalizację'}
          </Typography>
          {searchQuery && (
            <Button 
              variant="outlined" 
              onClick={() => setSearchQuery('')}
              sx={{ 
                borderRadius: 1,
                px: 3
              }}
            >
              Wyczyść wyszukiwanie
            </Button>
          )}
        </Box>
      ) : (
        isMobile ? renderMobileCards() : renderTable()
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle>
          {editingLocation ? 'Edytuj lokalizację' : 'Dodaj nową lokalizację'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Nazwa lokalizacji"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="Szczegóły (opcjonalne)"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Dodaj dodatkowe informacje o lokalizacji..."
            />
          </Box>
          {dialogError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {dialogError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" size="small">
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
            size="small"
          >
            {editingLocation ? 'Zapisz' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!deleteError}
        autoHideDuration={null}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setDeleteError(null)}
          sx={{ borderRadius: 1, minWidth: 320 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="500">
              Wystąpił błąd
            </Typography>
            <Typography variant="body1">{deleteError}</Typography>
            {deleteErrorDetails && (
              <Typography variant="body2" color="text.secondary">{deleteErrorDetails}</Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage(null)}
          sx={{ borderRadius: 1, minWidth: 320 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="500">
              Sukces
            </Typography>
            <Typography variant="body1">
              {successMessage}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationsPage; 