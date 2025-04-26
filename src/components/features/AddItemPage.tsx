import React, { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Box, Button } from '@mui/material';
import { AddAssetForm } from './AddAssetForm';
import { AddStockForm } from './AddStockForm';
import { BulkAddAssetForm } from './BulkAddAssetForm';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';
import { useCategories } from '../../hooks/useCategories';

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

      <Tabs value={currentTab} onChange={(_e,newValue) => setCurrentTab(newValue)}>
        <Tab label="Sprzęt (pyr_code)" />
        <Tab label="Zasoby (Magazyn)" />
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
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant={isBulkMode ? "contained" : "outlined"}
              onClick={() => setIsBulkMode(!isBulkMode)}
            >
              {isBulkMode ? "Tryb pojedynczy" : "Tryb masowy"}
            </Button>
          </Box>
          {isBulkMode ? (
            <BulkAddAssetForm categories={categories} />
          ) : (
            <AddAssetForm categories={categories} loading={loading} />
          )}
        </Box>
      )}
      {currentTab === 1 && <AddStockForm categories={categories} loading={loading} />}
    </Container>
  );
};

export default AddItemPage;
