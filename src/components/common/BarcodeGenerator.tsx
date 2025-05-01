import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [error, setError] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  // Generowanie kodu kreskowego
  useEffect(() => {
    if (!assets || !assets.length || !barcodeRef.current) return;

    try {
      JsBarcode(barcodeRef.current, assets[currentIndex].pyrcode, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: '#FFFFFF',
        lineColor: '#000000',
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        text: assets[currentIndex].pyrcode
      });
    } catch (err) {
      console.error('Błąd podczas generowania kodu kreskowego:', err);
      setError('Nie udało się wygenerować kodu kreskowego');
    }
  }, [assets, currentIndex]);

  const handleDownloadPDF = async () => {
    if (!barcodeRef.current) return;
    setIsGenerating(true);

    try {
      // Pobierz dane z canvas jako PNG
      const barcodeDataUrl = barcodeRef.current.toDataURL('image/png', 1.0);

      // Utwórz element do generowania PDF
      const element = document.createElement('div');
      element.style.padding = '10mm';
      element.style.textAlign = 'center';
      element.style.backgroundColor = 'white';
      element.style.width = '80mm';
      element.style.height = '50mm';
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';

      // Dodaj kod kreskowy jako obraz
      const img = document.createElement('img');
      img.src = barcodeDataUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      element.appendChild(img);

      // Dodaj pyrcode jako tekst
      const text = document.createElement('div');
      text.style.marginTop = '5mm';
      text.style.fontSize = '12px';
      text.textContent = assets[currentIndex].pyrcode;
      element.appendChild(text);

      // Konfiguracja PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [40, 80]
      });

      // Oblicz wymiary i pozycję kodu kreskowego
      const pdfWidth = 80;
      const pdfHeight = 40;
      const barcodeWidth = 60;
      const barcodeHeight = 25;
      const x = (pdfWidth - barcodeWidth) / 2;
      const y = (pdfHeight - barcodeHeight) / 2;

      // Dodaj tylko kod kreskowy (tekst jest już częścią obrazu z canvas)
      doc.addImage(barcodeDataUrl, 'PNG', x, y, barcodeWidth, barcodeHeight);

      // Zapisz PDF
      doc.save(`barcode-${assets[currentIndex].pyrcode}.pdf`);
      setIsGenerating(false);
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
      setError('Nie udało się wygenerować PDF');
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!barcodeRef.current) return;
    setIsGenerating(true);

    try {
      const printCanvas = document.createElement('canvas');
      const ctx = printCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Nie można utworzyć kontekstu canvas');
      }

      // Ustawiamy rozmiar canvasu - mniejszy dla drukarki termicznej
      printCanvas.width = 300;
      printCanvas.height = 150;

      // Wypełniamy tło na biało
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

      // Centrujemy kod kreskowy
      const scale = Math.min(1, printCanvas.width / barcodeRef.current.width);
      const scaledWidth = barcodeRef.current.width * scale;
      const scaledHeight = barcodeRef.current.height * scale;
      const x = (printCanvas.width - scaledWidth) / 2;
      const y = (printCanvas.height - scaledHeight) / 2;

      // Rysujemy kod kreskowy
      ctx.drawImage(
        barcodeRef.current,
        x,
        y,
        scaledWidth,
        scaledHeight
      );

      // Tworzymy element do drukowania
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Nie można otworzyć okna drukowania');
      }

      // Dodajemy style i zawartość
      printWindow.document.write(`
        <html>
          <head>
            <title>Drukuj kod kreskowy</title>
            <style>
              @page {
                size: 80mm 50mm;
                margin: 0;
              }
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
              img {
                max-width: 90%;
                height: auto;
                display: block;
                margin: auto;
                transform-origin: center center;
              }
            </style>
          </head>
          <body>
            <img src="${printCanvas.toDataURL('image/png', 1.0)}" />
          </body>
        </html>
      `);

      printWindow.document.close();
      
      await new Promise(resolve => {
        const img = printWindow.document.querySelector('img');
        if (img) {
          img.onload = resolve;
        } else {
          resolve(null);
        }
      });

      printWindow.print();
      printWindow.close();
    } catch (err) {
      console.error('Błąd podczas drukowania:', err);
      setError('Nie udało się wydrukować');
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

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Generowanie kodów kreskowych
            </Typography>
            
            {error && (
              <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '300px',
              margin: '0 auto',
              mb: 3
            }}>
              <canvas 
                ref={barcodeRef} 
                style={{
                  width: '100%',
                  height: 'auto',
                  backgroundColor: 'white'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Element {currentIndex + 1} z {assets.length}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: '300px', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  sx={{ flex: 1 }}
                >
                  Poprzedni
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleNext}
                  disabled={currentIndex === assets.length - 1}
                  sx={{ flex: 1 }}
                >
                  Następny
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '300px' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  fullWidth
                >
                  {isGenerating ? 'Generowanie...' : 'Pobierz PDF'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePrint}
                  disabled={isGenerating}
                  fullWidth
                >
                  {isGenerating ? 'Generowanie...' : 'Drukuj'}
                </Button>
                {onClose && (
                  <Button 
                    variant="outlined"
                    onClick={onClose}
                    fullWidth
                  >
                    Zamknij
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}; 