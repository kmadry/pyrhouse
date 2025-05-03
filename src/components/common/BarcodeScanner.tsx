import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, Result, Exception } from '@zxing/browser';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, CircularProgress, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

interface BarcodeScannerProps {
  onScan: (pyrcode: string) => void;
  onClose?: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  const cleanupVideo = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      try {
        video.pause();
        video.srcObject = null;
        video.removeAttribute('src');
        video.removeAttribute('srcObject');
        video.load();
        
        // Dodatkowe czyszczenie
        const mediaStream = video.srcObject as MediaStream | null;
        if (mediaStream instanceof MediaStream) {
          mediaStream.getTracks().forEach(track => {
            track.enabled = false;
            track.stop();
          });
        }
        
        // Wymuszamy odświeżenie elementu video
        video.style.display = 'none';
        setTimeout(() => {
          if (video) {
            video.style.display = '';
          }
        }, 100);
      } catch (e) {
        console.log('Błąd podczas czyszczenia video:', e);
      }
    }
  }, []);

  const forceStopCamera = useCallback(async () => {
    console.log('Wymuszenie zatrzymania kamery...');
    
    try {
      // Zatrzymujemy reader
      if (readerRef.current) {
        readerRef.current = null;
      }

      // Zatrzymujemy strumień wideo
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        for (const track of tracks) {
          try {
            track.enabled = false;
            track.stop();
            streamRef.current.removeTrack(track);
          } catch (e) {
            console.log('Błąd podczas zatrzymywania tracku:', e);
          }
        }
        streamRef.current = null;
      }

      // Czyścimy video element
      cleanupVideo();

      // Dodatkowe czyszczenie dla iOS
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        for (const device of videoDevices) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: device.deviceId } }
            });
            stream.getTracks().forEach(track => {
              track.enabled = false;
              track.stop();
            });
          } catch (e) {
            console.log('Błąd podczas czyszczenia urządzenia:', e);
          }
        }
      } catch (e) {
        console.log('Błąd podczas dodatkowego czyszczenia:', e);
      }

      // Wymuszamy garbage collection na referencjach
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsCameraReady(false);
      setIsScanning(false);
    } catch (err) {
      console.error('Błąd podczas wymuszania zatrzymania kamery:', err);
    }
  }, [cleanupVideo]);

  const cleanupResources = useCallback(async () => {
    if (!mountedRef.current) return;
    
    console.log('Czyszczenie zasobów...');
    await forceStopCamera();
    
    setIsLoading(false);
    setError(null);
  }, [forceStopCamera]);

  const handleClose = useCallback(async () => {
    if (!mountedRef.current || isScanning) return;
    
    console.log('Zamykanie skanera...');
    await forceStopCamera();
    
    if (onClose && mountedRef.current) {
      onClose();
    }
  }, [forceStopCamera, onClose, isScanning]);

  const handleScan = useCallback(async (result: Result | null, error: Exception | null) => {
    if (!mountedRef.current || !readerRef.current || isScanning) {
      return;
    }

    if (error) {
      if (!error.message.includes('No MultiFormat Readers')) {
        console.log('❌ Błąd skanowania:', error.message);
      }
      return;
    }

    if (result) {
      const scannedCode = result.getText().toUpperCase();
      
      if (scannedCode.includes('PYR')) {
        setIsScanning(true);
        
        console.log('🎯 Zeskanowano kod:', {
          kod: scannedCode,
          czyPYR: true,
          czasSkanowania: new Date().toISOString()
        });

        // Natychmiast zatrzymujemy kamerę
        try {
          await forceStopCamera();
          
          if (!mountedRef.current) return;
          
          onScan(scannedCode);
          
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(
              getApiUrl(`/assets/pyrcode/${scannedCode.trim()}`),
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.status === 404) {
              setError('Nie znaleziono sprzętu o podanym kodzie Pyrcode.');
              return;
            }

            if (!response.ok) {
              throw new Error('Nie udało się pobrać szczegółów sprzętu.');
            }

            const data = await response.json();
            navigate(`/equipment/${data.id}?type=${data.category.type || 'asset'}`);
          } catch (err: any) {
            setError(err.message || 'Wystąpił nieoczekiwany błąd.');
          }

          handleClose();
        } catch (err) {
          console.error('Błąd podczas zatrzymywania kamery:', err);
          // Próbujemy ponownie zatrzymać kamerę
          await forceStopCamera();
        }
      }
    }
  }, [handleClose, onScan, navigate, isScanning, forceStopCamera]);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      });

      if (!mountedRef.current || !videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      return true;
    } catch (err) {
      console.error('Błąd podczas inicjalizacji kamery:', err);
      return false;
    }
  }, []);

  const initScanner = useCallback(async () => {
    if (initializingRef.current || !mountedRef.current || isScanning) return;
    
    initializingRef.current = true;
    console.log('Inicjalizacja skanera...');
    setIsLoading(true);
    setError(null);

    try {
      // Najpierw czyścimy zasoby
      await cleanupResources();

      if (!mountedRef.current) return;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        setError('Skaner kodów kreskowych jest dostępny tylko na urządzeniach mobilnych.');
        setIsLoading(false);
        return;
      }

      // Upewniamy się, że kamera jest wyłączona przed inicjalizacją
      await forceStopCamera();

      const cameraInitialized = await initCamera();
      if (!cameraInitialized || !mountedRef.current || !videoRef.current) {
        throw new Error('Nie udało się zainicjalizować kamery');
      }

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      await reader.decodeFromConstraints(
        {
          video: { 
            facingMode: 'environment',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        },
        videoRef.current,
        handleScan
      );

      setIsLoading(false);
      setIsCameraReady(true);
    } catch (err) {
      console.error('Błąd podczas inicjalizacji:', err);
      if (mountedRef.current) {
        setError('Wystąpił błąd podczas inicjalizacji skanera. Spróbuj ponownie.');
      }
      await cleanupResources();
    } finally {
      initializingRef.current = false;
      setIsLoading(false);
    }
  }, [cleanupResources, handleScan, isScanning, initCamera, forceStopCamera]);

  useEffect(() => {
    mountedRef.current = true;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        initScanner().catch(console.error);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      forceStopCamera().catch(console.error);
    };
  }, [initScanner, forceStopCamera]);

  useEffect(() => {
    const cleanup = () => {
      forceStopCamera().catch(console.error);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      cleanup();
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('blur', cleanup);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('blur', cleanup);
      cleanup();
    };
  }, [forceStopCamera]);

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        onExited: () => {
          forceStopCamera().catch(console.error);
        },
        onExit: () => {
          forceStopCamera().catch(console.error);
        },
        onEnter: () => {
          // Upewniamy się, że kamera jest wyłączona przed otwarciem
          forceStopCamera().catch(console.error);
        }
      }}
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
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          {isLoading && (
            <CircularProgress />
          )}
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isCameraReady ? 'block' : 'none'
            }}
            playsInline
            muted
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Zamknij
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner; 