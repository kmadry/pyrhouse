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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      console.log('Inicjalizacja skanera...');
      setIsLoading(true);
      setError(null);
      setIsCameraReady(false);
      
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const videoElement = videoRef.current;

      // Sprawdź dostępność kamery
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(() => {
          console.log('Dostęp do kamery uzyskany');
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
              videoElement,
              (result: Result | null, error: Exception | null) => {
                if (!isCameraReady) {
                  console.log('Kamera gotowa do skanowania');
                  setIsLoading(false);
                  setIsCameraReady(true);
                }
                
                if (result) {
                  console.log('Zeskanowany kod:', result.getText());
                  const scannedCode = result.getText();
                  if (scannedCode.toLowerCase().includes('pyr')) {
                    onScan(scannedCode);
                    handleClose();
                  }
                }
                if (error) {
                  console.warn('Błąd skanowania:', error);
                }
              }
            )
            .catch((err: Error) => {
              console.error('Błąd inicjalizacji czytnika:', err);
              setError('Błąd inicjalizacji skanera. Spróbuj ponownie.');
              setIsLoading(false);
            });
        })
        .catch((err: Error) => {
          console.error('Błąd dostępu do kamery:', err);
          setError('Nie można uzyskać dostępu do kamery. Upewnij się, że udzielono odpowiednich uprawnień i odśwież stronę.');
          setIsLoading(false);
        });

      return () => {
        console.log('Zamykanie skanera...');
        if (readerRef.current) {
          readerRef.current.reset();
        }
      };
    }
  }, [isOpen, onScan, isCameraReady]);

  const handleOpen = () => {
    console.log('Otwieranie skanera...');
    setIsOpen(true);
    setError(null);
    setIsLoading(true);
    setIsCameraReady(false);
  };
  
  const handleClose = () => {
    console.log('Zamykanie skanera...');
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsOpen(false);
    setError(null);
    setIsLoading(false);
    setIsCameraReady(false);
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
          {isLoading && !isCameraReady && !error && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              textAlign: 'center'
            }}>
              <CircularProgress color="primary" sx={{ mb: 2 }} />
              <Typography color="white" variant="body2">
                Inicjalizacja kamery...
              </Typography>
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
                autoPlay
                playsInline
              />
              {isCameraReady && (
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
              )}
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