import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box, Button } from '@mui/material';
import { AddAssetForm } from './AddAssetForm';
import { AddStockForm } from './AddStockForm';
import { BulkAddAssetForm } from './BulkAddAssetForm';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useCategories } from '../../hooks/useCategories';

const AddItemPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0 = "Wartościowe", 1 = "Zasoby"
  const [isBulkMode, setIsBulkMode] = useState(false);
  const { categories, error, loading } = useCategories();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dodaj Przedmiot
      </Typography>

      <Tabs value={currentTab} onChange={(_e,newValue) => setCurrentTab(newValue)}>
        <Tab label="Sprzęt (pyr_code)" />
        <Tab label="Zasoby (Magazyn)" />
      </Tabs>

      {error && <ErrorMessage message={error} />}

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
