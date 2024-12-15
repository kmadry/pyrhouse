import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useCategories } from '../hooks/useCategories';
import { ErrorMessage } from './ErrorMessage';

const CategoryManagementPage: React.FC = () => {
  const { categories, loading, error, addCategory, deleteCategory } = useCategories();

  // State for managing add modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', label: '', type: '' });
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
    setFormError('');
    setNewCategory({ name: '', label: '', type: '' });
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.label || !newCategory.type) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await addCategory(newCategory);
      handleCloseAddModal(); // Close modal on success
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Zarządzanie Kategoriami
      </Typography>

      {error && <ErrorMessage message={error} />}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          Dodaj Kategorię
        </Button>
      </Box>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.label}</TableCell>
                <TableCell>{category.type}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => deleteCategory(category.id)}>
                    <DeleteIcon />
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Category Modal */}
      <Modal open={isAddModalOpen} onClose={handleCloseAddModal}>
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
            Dodaj Kategorię
          </Typography>

          {formError && <ErrorMessage message={formError} />}

          <TextField
            label="Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Label"
            value={newCategory.label}
            onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleCloseAddModal}>
              Anuluj
            </Button>
            <Button variant="contained" color="primary" onClick={handleAddCategory} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Dodaj'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CategoryManagementPage;
