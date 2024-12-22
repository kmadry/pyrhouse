import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import ErrorIcon from '@mui/icons-material/Error';
import { getTransferDetailsAPI, confirmTransferAPI } from '../services/transferService';
import { ErrorMessage } from './ErrorMessage';

const steps = ['Created', 'In Transit', 'Delivered'];

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const numericId = Number(id);

  useEffect(() => {
    if (isNaN(numericId)) {
      setError('Invalid transfer ID');
      setLoading(false);
      return;
    }

    const fetchTransferDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTransferDetailsAPI(numericId);
        setTransfer(data);

        // Set the current step based on the transfer status
        switch (data.status) {
          case 'in_transit':
            setCurrentStep(1);
            break;
          case 'completed':
            setCurrentStep(2);
            break;
          default:
            setCurrentStep(0);
        }
      } catch (err: any) {
        setError(err.message || 'Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransferDetails();
  }, [numericId]);

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await confirmTransferAPI(numericId, { status: 'completed' });
      if (response.status === 'completed') {
        setCurrentStep(2); // Move to the last step
        setTransfer((prev: any) => ({ ...prev, status: 'completed' }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm transfer.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <LocalShippingIcon sx={{ color: 'orange', ml: 2 }} />;
      case 'delivered':
        return <CheckCircleIcon sx={{ color: 'green', ml: 2 }} />;
      case 'returned':
        return <UTurnLeftIcon sx={{ color: 'orange', ml: 2 }} />;
      default:
        return <ErrorIcon sx={{ color: 'red', ml: 2 }} />;
    }
  };

  if (loading) return <CircularProgress />;

  if (error) return <ErrorMessage message={error} />;

  if (!transfer) return <Typography>No transfer details available.</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Transfer Details
      </Typography>

      {/* Stepper */}
      <Box sx={{ mt: 2 }}>
        <Stepper activeStep={currentStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Transfer Information */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6">Transfer Information</Typography>
        <Typography>From: {transfer.from_location?.name}</Typography>
        <Typography>To: {transfer.to_location?.name}</Typography>
        <Typography>Status: {transfer.status}</Typography>
        <Typography>Date: {new Date(transfer.transfer_date).toLocaleString()}</Typography>
      </Paper>

      {/* Assets */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6">Assets</Typography>
        {transfer.assets && transfer.assets.length > 0 ? (
          <List>
            {transfer.assets.map((asset: any) => (
              <ListItem key={asset.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary={`PyrCode: ${asset.pyrcode}`}
                  secondary={`Typ: ${asset.category?.label || 'N/A'}, Pochodzenie: ${asset.origin || 'N/A'}`}
                />
                {getStatusIcon(asset.status)}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No assets in this transfer.</Typography>
        )}
      </Paper>

      {/* Stock Items */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6">Stock Items</Typography>
        {transfer.stock_items && transfer.stock_items.length > 0 ? (
          <List>
            {transfer.stock_items.map((stock: any) => (
              <ListItem key={stock.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary={`Category: ${stock.category?.label || 'N/A'}`}
                  secondary={`Origin: ${stock.origin || 'N/A'}`}
                />
                <Chip
                  label={`Qty: ${stock.quantity}`}
                  color="primary"
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No stock items in this transfer.</Typography>
        )}
      </Paper>

      {/* Confirm Delivery Button */}
      {transfer.status !== 'completed' && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Confirm delivery when all items are delivered
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmTransfer}
            disabled={loading}
          >
            Confirm Delivery
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default TransferDetailsPage;
