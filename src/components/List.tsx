import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Paper, TextField } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

interface Location {
  id: number;
  name: string;
}

interface Equipment {
  id: number;
  category: string;
  quantity?: number;
  location: Location;
  state: string;
  pyr_id?: string;
  origin: string;
}

const generateRandomEquipment = (count: number): Equipment[] => {
  const categories = ['laptop', 'monitor', 'keyboard', 'mouse', 'headphones'];
  const locations = [
    { id: 1, name: 'Magazyn' },
    { id: 2, name: 'Biuro A' },
    { id: 3, name: 'Biuro B' },
  ];
  const states = ['sprawny', 'zablokowany', 'uszkodzony'];
  const origins = ['druga-era/probis', 'pierwsza-era/nexus', 'trzecia-era/omnis'];

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const origin = origins[Math.floor(Math.random() * origins.length)];

    // Randomly decide whether to include quantity or pyr_id
    if (Math.random() > 0.5) {
      return { id, category, quantity: Math.floor(Math.random() * 100) + 1, location, state, origin };
    } else {
      return { id, category, pyr_id: `PYR${id.toString().padStart(4, '0')}`, location, state, origin };
    }
  });
};

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(generateRandomEquipment(100));
  const [filter, setFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const filteredEquipment = equipment.filter((item) => {
    return (
      item.category.toLowerCase().includes(filter.toLowerCase()) ||
      item.state.toLowerCase().includes(filter.toLowerCase()) ||
      item.origin.toLowerCase().includes(filter.toLowerCase())
    );
  });

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const valueA = a[sortField as keyof Equipment] || '';
    const valueB = b[sortField as keyof Equipment] || '';

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Equipment List
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <TextField
          label="Filter"
          variant="outlined"
          value={filter}
          onChange={handleFilterChange}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['id', 'category', 'quantity', 'location.name', 'state', 'pyr_id', 'origin'].map((field) => (
                <TableCell key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <strong>{field.toUpperCase()}</strong>
                    {sortField === field && (
                      sortOrder === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEquipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity ?? '-'}</TableCell>
                <TableCell>{item.location.name}</TableCell>
                <TableCell>{item.state}</TableCell>
                <TableCell>{item.pyr_id ?? '-'}</TableCell>
                <TableCell>{item.origin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EquipmentList;
