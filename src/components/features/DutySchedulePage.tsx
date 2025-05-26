import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useDutySchedule } from '../../hooks/useDutySchedule';

const getColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const dayRegex = /^(Poniedziałek|Wtorek|Środa|Czwartek|Piątek|Sobota|Niedziela)/i;

const DutySchedulePage: React.FC = () => {
  const { data, loading, error } = useDutySchedule();
  const [selectedPerson, setSelectedPerson] = useState('');

  // Przetwarzanie slotów: rozdziel dzień i godzinę
  const slots = useMemo(() => {
    if (!data) return [];
    const headers = data.headers.slice(2);
    let currentDay = '';
    return headers.map(header => {
      if (dayRegex.test(header)) {
        if (header.match(/\d{2}:\d{2}/)) {
          // np. "Wtorek 11:00"
          const [day, ...hourParts] = header.split(' ');
          const hour = hourParts.join(' ');
          currentDay = day;
          return { day, hour };
        } else {
          // np. "Piątek"
          currentDay = header;
          return { day: currentDay, hour: '' };
        }
      } else if (header.match(/\d{2}:\d{2}/)) {
        // np. "00:00 - 01:00"
        return { day: currentDay, hour: header };
      } else {
        return { day: currentDay, hour: header };
      }
    });
  }, [data]);

  // Przygotuj magazyny (kolumny)
  const magazyny = useMemo(() => data ? data.rows.filter(row => row.length > 1).map(row => row[0]) : [], [data]);
  // Zbierz unikalne osoby
  const uniquePeople = useMemo(() => {
    if (!data) return [];
    const people = new Set<string>();
    data.rows.forEach(row => {
      row.slice(2).forEach(cell => {
        if (cell && cell.trim()) people.add(cell.trim());
      });
    });
    return Array.from(people).sort();
  }, [data]);
  // Dane: dla każdego slotu czasowego, dla każdego magazynu, osoba
  const slotRows = useMemo(() => {
    if (!data) return [];
    return slots.map((slot, slotIdx) => {
      const row: any = { ...slot };
      data.rows.forEach((magazynRow) => {
        if (magazynRow.length > 1) {
          row[magazynRow[0]] = magazynRow[slotIdx + 2];
        }
      });
      return row;
    });
  }, [data, slots]);

  // Filtrowanie po osobie
  const filteredSlotRows = useMemo(() => {
    // Najpierw filtruj po osobie (jeśli wybrana)
    let rows = slotRows;
    if (selectedPerson) {
      rows = rows.filter(row =>
        magazyny.some(magazyn => row[magazyn] && row[magazyn].trim().toLowerCase() === selectedPerson.toLowerCase())
      );
    }
    // Następnie usuń wiersze, gdzie w żadnym magazynie nie ma osoby
    return rows.filter(row =>
      magazyny.some(magazyn => row[magazyn] && row[magazyn].trim())
    );
  }, [slotRows, magazyny, selectedPerson]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;
  }
  if (!data) {
    return <Box sx={{ p: 4 }}><Typography>Brak danych o grafiku dyżurów.</Typography></Box>;
  }

  return (
    <Box sx={{ maxWidth: '100vw', mx: 'auto', mt: 4, overflowX: 'auto' }}>
      <Card>
        <CardHeader title="Grafik dyżurów" subheader="Sloty czasowe jako wiersze, magazyny jako kolumny" />
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
            <InputLabel>Filtruj po osobie</InputLabel>
            <Select
              value={selectedPerson}
              label="Filtruj po osobie"
              onChange={e => setSelectedPerson(e.target.value)}
            >
              <MenuItem value="">Wszyscy</MenuItem>
              {uniquePeople.map(person => (
                <MenuItem key={person} value={person}>{person}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableContainer component={Paper} sx={{ mt: 2, minWidth: 900 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText', minWidth: 80 }}>Dzień</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText', minWidth: 80 }}>Godzina</TableCell>
                  {magazyny.map((magazyn, idx) => (
                    <TableCell key={idx} sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText', minWidth: 90 }}>{magazyn}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSlotRows.map((row, ridx) => {
                  // Sprawdź, czy to pierwszy slot danego dnia
                  const isFirstOfDay =
                    ridx === 0 || row.day !== filteredSlotRows[ridx - 1].day;
                  return (
                    <TableRow
                      key={ridx}
                      sx={{
                        bgcolor: isFirstOfDay ? 'rgba(255, 215, 64, 0.08)' : 'background.default',
                        borderTop: isFirstOfDay ? '2px solid #FFD740' : '1px solid rgba(255,255,255,0.06)',
                        '&:last-child td, &:last-child th': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>
                        {isFirstOfDay ? row.day : ''}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>
                        {row.hour}
                      </TableCell>
                      {magazyny.map((magazyn, midx) => {
                        const osoba = row[magazyn];
                        return (
                          <TableCell key={midx}>
                            {osoba && osoba.trim() && (
                              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <FiberManualRecordIcon sx={{ color: getColor(osoba), fontSize: 16, mr: 0.5 }} />
                                <span style={{ fontSize: 13 }}>{osoba}</span>
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DutySchedulePage; 