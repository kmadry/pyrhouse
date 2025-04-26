import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useCategories } from '../../hooks/useCategories';
import { ErrorMessage } from '../ui/ErrorMessage';
import * as Icons from '@mui/icons-material';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';

const CategoryManagementPage: React.FC = () => {
  const { categories, loading, error, addCategory, deleteCategory, setError } = useCategories();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for managing add modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', label: '', type: '', pyr_id: '' });
  const [formError, setFormError] = useState('');
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for delete confirmation modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
    setFormError('');
    setNewCategory({ name: '', label: '', type: '', pyr_id: '' });
    setShowAdditionalOptions(false);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.label || !newCategory.type) {
      setFormError('Label i Typ są wymagane.');
      return;
    }

    const payload: { label: string; type: 'asset' | 'stock'; name?: string; pyr_id?: string } = {
      label: newCategory.label,
      type: newCategory.type as 'asset' | 'stock',
    };

    if (newCategory.name.trim()) {
      payload.name = newCategory.name;
    }

    if (newCategory.pyr_id.trim()) {
      payload.pyr_id = newCategory.pyr_id;
    }

    try {
      await addCategory(payload);
      handleCloseAddModal();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleOpenDeleteModal = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        showSnackbar('success', 'Kategoria została usunięta pomyślnie!', undefined, 3000);
        handleCloseDeleteModal();
      } catch (err: any) {
        if (err && typeof err === 'object' && 'message' in err) {
          showSnackbar('error', err.message, err.details, null);
        } else {
          showSnackbar('error', err.message || 'Wystąpił nieoczekiwany błąd podczas usuwania kategorii.', undefined, null);
        }
        handleCloseDeleteModal();
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (category.pyr_id && category.pyr_id.toLowerCase().includes(searchQuery.toLowerCase()))
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
            {['ID', 'Label (Name)', 'PyrID', 'Typ', 'Akcje'].map((field) => (
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
          {filteredCategories.map((category) => (
            <TableRow 
              key={category.id}
              sx={{ 
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              <TableCell>
                <Typography component="div" sx={{ fontWeight: 500 }}>
                  {category.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div">
                  {category.label} {category.name ? `(${category.name})` : ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div" color="text.secondary">
                  {category.pyr_id || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={category.type} 
                  color={category.type === 'asset' ? 'primary' : 'secondary'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => handleOpenDeleteModal(category.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {filteredCategories.map((category) => (
        <Grid item xs={12} key={category.id}>
          <Card 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              transition: 'background-color 0.2s ease'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                  ID: {category.id}
                </Typography>
                <Chip 
                  label={category.type} 
                  color={category.type === 'asset' ? 'primary' : 'secondary'}
                  size="small"
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Label:</Typography>
                  <Typography variant="body2">{category.label}</Typography>
                </Box>
                {category.name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                    <Typography variant="body2">{category.name}</Typography>
                  </Box>
                )}
                {category.pyr_id && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">PyrID:</Typography>
                    <Typography variant="body2">{category.pyr_id}</Typography>
                  </Box>
                )}
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 1,
                  justifyContent: 'flex-end',
                  mt: 2
                }}
              >
                <IconButton
                  color="error"
                  onClick={() => handleOpenDeleteModal(category.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (typeof setError === 'function') setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

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
          Kategorie
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{
            borderRadius: 1,
            px: 3
          }}
        >
          Dodaj Kategorię
        </Button>
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
          label="Szukaj kategorii"
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
            Ładowanie kategorii...
          </Typography>
        </Box>
      ) : filteredCategories.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 5,
          backgroundColor: 'background.default',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak kategorii
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Dodaj nową kategorię'}
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
        open={isAddModalOpen} 
        onClose={handleCloseAddModal}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: 400 }
          }
        }}
      >
        <DialogTitle>
          Dodaj Kategorię
        </DialogTitle>
        <DialogContent>
          {formError && (
            <ErrorMessage message={formError} />
          )}

          <TextField
            label="Label"
            value={newCategory.label}
            onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />

          <Select
            value={newCategory.type}
            onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
            displayEmpty
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Wybierz typ
            </MenuItem>
            <MenuItem value="stock">Stock</MenuItem>
            <MenuItem value="asset">Asset</MenuItem>
          </Select>

          <Button
            variant="text"
            color="primary"
            onClick={() => setShowAdditionalOptions((prev) => !prev)}
            sx={{ mb: 2 }}
          >
            {showAdditionalOptions ? (
              <>
                <ExpandLessIcon /> Ukryj dodatkowe opcje
              </>
            ) : (
              <>
                <ExpandMoreIcon /> Pokaż dodatkowe opcje
              </>
            )}
          </Button>

          <Collapse in={showAdditionalOptions}>
            <TextField
              label="PyrID (Opcjonalne)"
              value={newCategory.pyr_id}
              onChange={(e) => setNewCategory({ ...newCategory, pyr_id: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Name (Opcjonalne)"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseAddModal}
            sx={{ borderRadius: 1 }}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{ borderRadius: 1 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
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
          <DialogContentText>
            Czy na pewno chcesz usunąć tę kategorię?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} variant="outlined">
            Anuluj
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagementPage;
