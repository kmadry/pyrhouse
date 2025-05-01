import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result, Exception } from '@zxing/browser';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

interface BarcodeScannerProps {
  onScan: (pyrcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      reader
        .decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: 'environment' }
          },
          videoRef.current,
          (result: Result | null, error: Exception | null) => {
            if (result) {
              const scannedCode = result.getText();
              if (scannedCode.startsWith('PYR')) {
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

  const handleOpen = () => setIsOpen(true);
  
  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsOpen(false);
    setError(null);
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
      >
        <DialogTitle>
          Skanuj kod kreskowy
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error ? (
            <Typography color="error" variant="body1" align="center">
              {error}
            </Typography>
          ) : (
            <Box sx={{ width: '100%', position: 'relative' }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'cover'
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
                  pointerEvents: 'none'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Anuluj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BarcodeScanner; 