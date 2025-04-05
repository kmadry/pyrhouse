import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { jsPDF } from 'jspdf';
import bwipjs from 'bwip-js';

interface Asset {
  id: number;
  serial: string;
  location: {
    id: number;
    name: string;
    details: string | null;
  };
  category: {
    id: number;
    name: string;
    label: string;
    pyr_id: string;
    type: string;
  };
  status: string;
  pyrcode: string;
  origin?: string;
}

interface BarcodeGeneratorProps {
  assets: Asset[];
  onClose?: () => void;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ assets, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [pdf, setPdf] = React.useState<jsPDF | null>(null);
  const [error, setError] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  // Inicjalizacja PDF
  useEffect(() => {
    try {
      const newPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      setPdf(newPdf);
    } catch (err) {
      console.error('Błąd podczas inicjalizacji PDF:', err);
      setError('Nie udało się zainicjalizować PDF');
    }
  }, []);

  // Automatyczne generowanie wszystkich kodów kreskowych
  useEffect(() => {
    if (!assets || !assets.length) {
      console.error('Brak zasobów do wygenerowania kodów kreskowych');
      setError('Brak zasobów do wygenerowania kodów kreskowych');
      return;
    }

    const generateAllBarcodes = async () => {
      setIsGenerating(true);
      
      try {
        const newBarcodes: {imgData: string, asset: Asset}[] = [];
        
        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];
          
          if (!asset.pyrcode) {
            console.error('Brak kodu PYR dla zasobu:', asset);
            continue;
          }
          
          if (!canvasRef.current) {
            console.error('Brak elementu canvas');
            continue;
          }
          
          // Generowanie kodu kreskowego
          bwipjs.toCanvas(canvasRef.current, {
            bcid: 'code128',
            text: asset.pyrcode,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
            backgroundcolor: 'FFFFFF',
            padding: 10,
          });
          
          const imgData = canvasRef.current.toDataURL('image/png');
          newBarcodes.push({ imgData, asset });
          
          // Aktualizuj indeks dla podglądu
          setCurrentIndex(i);
          
          // Krótka przerwa między generowaniem kodów
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Po wygenerowaniu wszystkich kodów, ustaw je w stanie
        // Generuj PDF z nowymi kodami kreskowymi
        generatePDF(newBarcodes);
        setIsReady(true);
      } catch (err) {
        console.error('Błąd podczas generowania kodów kreskowych:', err);
        setError('Błąd podczas generowania kodów kreskowych');
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateAllBarcodes();
  }, [assets]);

  // Generowanie PDF
  const generatePDF = (barcodes: {imgData: string, asset: Asset}[]) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const newPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      barcodes.forEach((barcode, index) => {
        // Dodaj nową stronę dla każdego kodu kreskowego (oprócz pierwszego)
        if (index > 0) {
          newPdf.addPage();
        }

        const pageWidth = newPdf.internal.pageSize.getWidth();
        const pageHeight = newPdf.internal.pageSize.getHeight();
        
        // Oblicz wymiary kodu kreskowego - zajmuje 70% szerokości strony
        const barcodeWidth = pageWidth * 0.7;
        const barcodeHeight = barcodeWidth * 0.3; // proporcja 3:1 dla kodu kreskowego
        
        // Wycentruj kod kreskowy na stronie
        const x = (pageWidth - barcodeWidth) / 2;
        const y = (pageHeight - barcodeHeight - 30) / 2; // 30mm na tekst pod kodem

        // Konwertuj base64 na Uint8Array
        const base64Data = barcode.imgData.split(',')[1];
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }

        // Dodaj obraz do PDF
        newPdf.addImage(
          array, 
          'PNG', 
          x, 
          y, 
          barcodeWidth, 
          barcodeHeight
        );
      });

      setPdf(newPdf);
    } catch (err) {
      console.error('Błąd podczas generowania PDF:', err);
      setError('Nie udało się wygenerować PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Przejście do następnego elementu
  const handleNext = () => {
    if (currentIndex < assets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Przejście do poprzedniego elementu
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdf) {
      console.error('Brak wygenerowanego PDF');
      return;
    }
    try {
      pdf.save('kody-kreskowe.pdf');
    } catch (err) {
      console.error('Błąd podczas zapisywania PDF:', err);
      setError('Nie udało się zapisać PDF');
    }
  };

  const handlePrint = () => {
    if (!pdf) {
      console.error('Brak wygenerowanego PDF');
      return;
    }
    try {
      const pdfUrl = URL.createObjectURL(
        new Blob([pdf.output('blob')], { type: 'application/pdf' })
      );
      
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err) {
      console.error('Błąd podczas drukowania:', err);
      setError('Nie udało się wydrukować PDF');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Generowanie kodów kreskowych
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {assets[currentIndex]?.pyrcode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assets[currentIndex]?.serial} - {assets[currentIndex]?.category.label}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1">
                Element {currentIndex + 1} z {assets.length}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  Poprzedni
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleNext}
                  disabled={currentIndex === assets.length - 1}
                >
                  Następny
                </Button>
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownloadPDF}
                disabled={!isReady || isGenerating}
                sx={{ mt: 2 }}
              >
                {isGenerating ? 'Generowanie...' : 'Pobierz PDF'}
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handlePrint}
                disabled={!isReady || isGenerating}
              >
                {isGenerating ? 'Generowanie...' : 'Drukuj'}
              </Button>
              {onClose && (
                <Button 
                  variant="outlined" 
                  onClick={onClose}
                  sx={{ mt: 1 }}
                >
                  Zamknij
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}; 