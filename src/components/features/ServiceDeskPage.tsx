import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Chip, Card, CardContent, Grid, Button, TextField, InputAdornment, Tabs, Tab, Avatar, CircularProgress, Alert } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getApiUrl } from '../../config/api';

const STATUS_LABELS: Record<string, string> = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  waiting: 'Oczekuje',
  resolved: 'Rozwiązane',
  closed: 'Zamknięte',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'info' | 'success' | 'error'> = {
  new: 'primary',
  in_progress: 'info',
  waiting: 'warning',
  resolved: 'success',
  closed: 'default',
};

const REQUESTS_API = '/service-desk/requests';
const TYPES_API = '/service-desk/request-types';

const useServiceDeskTypes = () => {
  const [types, setTypes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('serviceDeskTypes');
    if (cached) {
      setTypes(JSON.parse(cached));
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(getApiUrl(TYPES_API), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const map: Record<string, any> = {};
        data.forEach((t: any) => { map[t.id] = t; });
        setTypes(map);
        sessionStorage.setItem('serviceDeskTypes', JSON.stringify(map));
      })
      .catch(e => setError('Błąd pobierania typów zgłoszeń'))
      .finally(() => setLoading(false));
  }, []);
  return { types, loading, error };
};

const useServiceDeskRequests = (status: string, search: string) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    fetch(getApiUrl(`${REQUESTS_API}?${params.toString()}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania zgłoszeń');
        return res.json();
      })
      .then(data => {
        setRequests(
          search
            ? data.filter((r: any) =>
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase()) ||
                (r.location && r.location.toLowerCase().includes(search.toLowerCase()))
              )
            : data
        );
      })
      .catch(e => setError(e.message || 'Błąd pobierania zgłoszeń'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [status]);
  useEffect(() => { if (!loading) fetchRequests(); }, [search]);

  return { requests, loading, error, refresh: fetchRequests };
};

const ServiceDeskPage: React.FC = () => {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const { types, loading: typesLoading, error: typesError } = useServiceDeskTypes();
  const { requests, loading, error, refresh } = useServiceDeskRequests(status, search);

  const handleTabChange = (_: any, value: string) => setStatus(value);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Service Desk</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading}>Odśwież</Button>
        </Box>
      </Box>
      <Tabs value={status} onChange={handleTabChange} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Nowe" value="new" />
        <Tab label="W trakcie" value="in_progress" />
        <Tab label="Oczekuje" value="waiting" />
        <Tab label="Rozwiązane" value="resolved" />
        <Tab label="Zamknięte" value="closed" />
        <Tab label="Wszystkie" value="all" />
      </Tabs>
      <TextField
        fullWidth
        placeholder="Szukaj po tytule, opisie lub lokalizacji..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 3 }}
      />
      {typesError && <Alert severity="error">{typesError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {(loading || typesLoading) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {requests.length === 0 ? (
            <Grid item xs={12}><Alert severity="info">Brak zgłoszeń.</Alert></Grid>
          ) : requests.map(req => (
            <Grid item xs={12} sm={6} md={4} key={req.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2, borderRadius: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label={STATUS_LABELS[req.status] || req.status} color={STATUS_COLORS[req.status] || 'default'} size="small" sx={{ fontWeight: 600 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{new Date(req.created_at).toLocaleString()}</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{req.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{req.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {req.type && types[req.type] && (
                      <Chip label={types[req.type].name} variant="outlined" size="small" />
                    )}
                    {req.priority && (
                      <Chip label={req.priority === 'high' ? 'Wysoki priorytet' : req.priority === 'medium' ? 'Średni priorytet' : 'Niski priorytet'} color={req.priority === 'high' ? 'error' : req.priority === 'medium' ? 'warning' : 'default'} size="small" />
                    )}
                    {req.location && (
                      <Chip label={req.location} icon={<Avatar sx={{ width: 18, height: 18, fontSize: 12 }}>{req.location[0]}</Avatar>} size="small" />
                    )}
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #eee' }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>{req.created_by_user?.fullname?.[0] || '?'}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{req.created_by_user?.fullname || req.created_by_user?.username || 'Użytkownik'}</Typography>
                    <Typography variant="caption" color="text.secondary">Zgłoszono: {new Date(req.created_at).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ServiceDeskPage;
