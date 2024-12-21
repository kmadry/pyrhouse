import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocations } from '../hooks/useLocations';
import { useStocks } from '../hooks/useStocks';
import { validatePyrCodeAPI, createTransferAPI } from '../services/transferService';
import { ErrorMessage } from './ErrorMessage';

const TransferPage: React.FC = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      fromLocation: '',
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const fromLocation = watch('fromLocation');
  const items = watch('items');

  const { locations, error: locationError } = useLocations();
  const { stocks, fetchStocks, error: stockError } = useStocks();

  useEffect(() => {
    if (fromLocation) {
      fetchStocks(fromLocation);
    }
  }, [fromLocation, fetchStocks]);

  const handleValidatePyrCode = async (index: number, pyrcode: string) => {
    try {
      const response = await validatePyrCodeAPI(pyrcode);
      setValue(`items.${index}.id`, response.id);
      setValue(`items.${index}.status`, 'success');
    } catch (err: any) {
      console.error('Validation failed:', err.message);
      setValue(`items.${index}.status`, 'failure');
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      const payload = {
        from_location_id: Number(formData.fromLocation),
        location_id: Number(formData.toLocation),
        assets: formData.items
          .filter((item: any) => item.type === 'pyr_code' && item.status === 'success')
          .map((item: any) => ({ id: item.id })),
        stocks: formData.items
          .filter((item: any) => item.type === 'stock')
          .map((item: any) => ({ id: item.id, quantity: Number(item.quantity) })),
      };

      if (!payload.assets?.length) delete payload.assets;
      if (!payload.stocks?.length) delete payload.stocks;

      await createTransferAPI(payload);
      reset();
    } catch (err: any) {
      console.error('Failed to create transfer:', err.message);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Utwórz Transfer
      </Typography>

      {/* Display Errors */}
      {locationError && <ErrorMessage message="Error loading locations" details={locationError} />}
      {stockError && <ErrorMessage message="Error loading stocks" details={stockError} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Controller
            name="fromLocation"
            control={control}
            render={({ field }) => (
              <Select {...field} displayEmpty fullWidth>
                <MenuItem value="" disabled>
                  Wybierz lokalizację źródłową
                </MenuItem>
                {locations.map((location: any) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="toLocation"
            control={control}
            render={({ field }) => (
              <Select {...field} displayEmpty fullWidth>
                <MenuItem value="" disabled>
                  Wybierz lokalizację docelową
                </MenuItem>
                {locations.map((location: any) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Typ</TableCell>
                <TableCell>ID / Kategoria</TableCell>
                <TableCell>Ilość</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Controller
                      name={`items.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select {...field} fullWidth>
                          <MenuItem value="pyr_code">Pyr Code</MenuItem>
                          <MenuItem value="stock">Stock</MenuItem>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {items[index].type === 'pyr_code' && (
                      <Controller
                        name={`items.${index}.pyrcode`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Pyr Code"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleValidatePyrCode(index, field.value);
                              }
                            }}
                            fullWidth
                          />
                        )}
                      />
                    )}
                    {items[index].type === 'stock' && (
                      <Controller
                        name={`items.${index}.id`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} fullWidth>
                            <MenuItem value="" disabled>
                              Wybierz zasób
                            </MenuItem>
                            {stocks.map((stock: any) => (
                              <MenuItem key={stock.id} value={stock.id}>
                                {stock.category.label} (Dostępne: {stock.quantity})
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {items[index].type === 'stock' && (
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Ilość"
                            fullWidth
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {items[index].status === 'success' && <CheckCircleIcon color="success" />}
                    {items[index].status === 'failure' && (
                      <Typography color="error">Błąd</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' })
          }
          sx={{ mt: 2 }}
        >
          Dodaj Wiersz
        </Button>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!fromLocation || items.length === 0}
          sx={{ mt: 2, ml: 2 }}
        >
          Utwórz Transfer
        </Button>
      </form>
    </Container>
  );
};

export default TransferPage;
