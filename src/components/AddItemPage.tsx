import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab } from '@mui/material';
import { AddAssetForm } from './AddAssetForm';
import { AddStockForm } from './AddStockForm';
import { ErrorMessage } from './ErrorMessage';
import { useCategories } from './useCategories';

const AddItemPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0 = "Wartościowe", 1 = "Zasoby"
  const { categories, error, loading } = useCategories();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dodaj Przedmiot
      </Typography>

      <Tabs value={currentTab} onChange={(_e,newValue) => setCurrentTab(newValue)}>
        <Tab label="Wartościowe (Sprzęt)" />
        <Tab label="Zasoby (Magazyn)" />
      </Tabs>

      {error && <ErrorMessage message={error} />}

      {currentTab === 0 && <AddAssetForm categories={categories} loading={loading} />}
      {currentTab === 1 && <AddStockForm categories={categories} loading={loading} />}
    </Container>
  );
};

export default AddItemPage;
