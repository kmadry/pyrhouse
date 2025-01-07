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
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useCategories } from '../hooks/useCategories';
import { ErrorMessage } from './ErrorMessage';

const CategoryManagementPage: React.FC = () => {
  const { categories, loading, error, addCategory, deleteCategory } = useCategories();

  // State for managing add modal
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', label: '', type: '', pyr_id: '' });
  const [formError, setFormError] = useState('');
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
    setFormError('');
    setNewCategory({ name: '', label: '', type: '', pyr_id: '' });
    setShowAdditionalOptions(false); // Reset additional options state
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.label || !newCategory.type) {
      setFormError('Label and Type are required.');
      return;
    }

    // Construct payload and cast type to match expected values
    const payload: { label: string; type: 'asset' | 'stock'; name?: string; pyr_id?: string } = {
      label: newCategory.label,
      type: newCategory.type as 'asset' | 'stock', // Explicitly cast the type
    };

    if (newCategory.name.trim()) {
      payload.name = newCategory.name;
    }

    if (newCategory.pyr_id.trim()) {
      payload.pyr_id = newCategory.pyr_id;
    }

    try {
      await addCategory(payload);
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
              <TableCell>Label (Name)</TableCell>
              <TableCell>PyrID</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>
                  {category.label} {category.name ? `(${category.name})` : ''}
                </TableCell>
                <TableCell>{category.pyr_id || '-'}</TableCell>
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

          {/* Toggle Additional Options */}
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

          {/* Additional Options */}
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
