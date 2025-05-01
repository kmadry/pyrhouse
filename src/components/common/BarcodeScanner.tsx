import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result, Exception } from '@zxing/browser';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface BarcodeScannerProps {
  onScan: (pyrcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setIsLoading(true);
      setError(null);
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      reader
        .decodeFromConstraints(
          {
            audio: false,
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          videoRef.current,
          (result: Result | null, error: Exception | null) => {
            setIsLoading(false);
            if (result) {
              const scannedCode = result.getText();
              if (scannedCode.toLowerCase().includes('pyr')) {
                onScan(scannedCode);
                handleClose();
              }
            }
            if (error) {
              console.error('Błąd skanowania:', error);
            }
          }
        )
        .catch((err: Error) => {
          setIsLoading(false);
          setError('Nie można uzyskać dostępu do kamery. Upewnij się, że udzielono odpowiednich uprawnień.');
          console.error('Błąd inicjalizacji kamery:', err);
        });

      return () => {
        if (readerRef.current) {
          readerRef.current.reset();
        }
      };
    }
  }, [isOpen, onScan]);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
    setIsLoading(true);
  };
  
  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsOpen(false);
    setError(null);
    setIsLoading(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        startIcon={<QrCodeScannerIcon />}
        sx={{
          borderRadius: 2,
          height: '36px',
          minWidth: '100px'
        }}
      >
        Skanuj
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Skanuj kod kreskowy
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0, 
          backgroundColor: 'black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          {isLoading && !error && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {error ? (
            <Typography color="error" variant="body1" align="center" sx={{ p: 3 }}>
              {error}
            </Typography>
          ) : (
            <Box sx={{ width: '100%', position: 'relative', backgroundColor: 'black' }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'cover',
                  backgroundColor: 'black'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  height: '150px',
                  border: '2px solid #00ff00',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'black' }}>
          <Button onClick={handleClose} sx={{ color: 'white' }}>
            Anuluj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BarcodeScanner; 