import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface BarcodeScannerProps {
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const mountedRef = useRef(true);
  const initAttemptRef = useRef(0);

  const initializeCamera = async () => {
    if (!mountedRef.current) {
      console.log('⚠️ Komponent został odmontowany przed inicjalizacją kamery');
      return;
    }

    try {
      console.log('📹 Próba uzyskania dostępu do kamery...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      console.log('✅ Dostęp do kamery uzyskany');

      if (videoRef.current) {
        console.log('📹 Konfiguracja elementu video...');
        videoRef.current.srcObject = stream;
        
        try {
          console.log('▶️ Próba uruchomienia wideo...');
          await videoRef.current.play();
          console.log('✅ Wideo uruchomione pomyślnie');
          setIsInitialized(true);
        } catch (error) {
          console.error('❌ Błąd podczas uruchamiania wideo:', error);
          stopCamera();
        }
      }
    } catch (error) {
      console.error('❌ Błąd podczas inicjalizacji kamery:', error);
      stopCamera();
    }
  };

  const stopCamera = () => {
    console.log('🔴 Wyłączanie kamery...');
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log(`📹 Znaleziono ${tracks.length} tracków kamery do wyłączenia`);
      
      tracks.forEach((track, index) => {
        console.log(`📹 Wyłączanie tracku #${index + 1} (${track.kind})`);
        track.stop();
        console.log(`✅ Track #${index + 1} wyłączony`);
      });
      
      streamRef.current = null;
      console.log('✅ Strumień kamery wyczyszczony');
    } else {
      console.log('ℹ️ Brak aktywnego strumienia kamery');
    }

    if (videoRef.current) {
      console.log('📹 Czyszczenie elementu video...');
      videoRef.current.srcObject = null;
      videoRef.current.pause();
      console.log('✅ Element video wyczyszczony');
    } else {
      console.log('ℹ️ Brak referencji do elementu video');
    }

    setIsInitialized(false);
    console.log('✅ Stan inicjalizacji zresetowany');
  };

  useEffect(() => {
    mountedRef.current = true;
    console.log('🟢 Montowanie komponentu BarcodeScanner');
    
    // Opóźniona inicjalizacja kamery
    const timer = setTimeout(() => {
      initializeCamera();
    }, 100);

    return () => {
      console.log('🟡 Odmontowywanie komponentu BarcodeScanner');
      mountedRef.current = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  const handleClose = () => {
    console.log('🟡 Zamykanie modalu skanera...');
    stopCamera();
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Skaner kodów kreskowych
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: '300px',
          bgcolor: '#000',
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Odbicie lustrzane dla lepszej ergonomii
            }}
            autoPlay
            playsInline
            muted
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default BarcodeScanner; 