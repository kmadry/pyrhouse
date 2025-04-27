import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Typography, Tabs, Tab, Box, Paper, ButtonGroup, Button } from '@mui/material';
import { AddAssetForm } from './AddAssetForm';
import { AddStockForm } from './AddStockForm';
import { BulkAddAssetForm } from './BulkAddAssetForm';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';
import { useCategories } from '../../hooks/useCategories';
import LazyIcon from '../ui/LazyIcon';

const Laptop = lazy(() => import('@mui/icons-material/Laptop'));
const Inventory = lazy(() => import('@mui/icons-material/Inventory'));

const AddItemPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0 = "Wartościowe", 1 = "Zasoby"
  const [isBulkMode, setIsBulkMode] = useState(false);
  const { categories, error, loading } = useCategories();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();

  // Wyświetl snackbar tylko raz, gdy pojawi się error
  useEffect(() => {
    if (error) {
      showSnackbar('error', error, undefined, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dodaj Przedmiot
      </Typography>

      <Tabs value={currentTab} onChange={(_e,newValue) => setCurrentTab(newValue)} sx={{ mt: 2 }}>
        <Tab 
          icon={<LazyIcon><Suspense fallback={null}><Laptop /></Suspense></LazyIcon>} 
          label={<Box>Sprzęt z kodem PYR</Box>} 
        />
        <Tab 
          icon={<LazyIcon><Suspense fallback={null}><Inventory /></Suspense></LazyIcon>} 
          label={<Box>Zasoby magazynowe</Box>} 
        />
      </Tabs>

      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      {currentTab === 0 && (
        <Paper sx={{ mt: 1, p: { xs: 2, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ButtonGroup variant="outlined" color="primary">
              <Button
                variant={!isBulkMode ? 'contained' : 'outlined'}
                onClick={() => setIsBulkMode(false)}
              >
                Pojedynczy
              </Button>
              <Button
                variant={isBulkMode ? 'contained' : 'outlined'}
                onClick={() => setIsBulkMode(true)}
              >
                Grupowy - kilka naraz
              </Button>
            </ButtonGroup>
          </Box>
          {isBulkMode ? (
            <BulkAddAssetForm categories={categories} />
          ) : (
            <AddAssetForm categories={categories} loading={loading} />
          )}
        </Paper>
      )}
      {currentTab === 1 && (
        <Paper sx={{ mt: 3, p: { xs: 2, sm: 3 } }}>
          <AddStockForm categories={categories} loading={loading} />
        </Paper>
      )}
    </Container>
  );
};

export default AddItemPage;
