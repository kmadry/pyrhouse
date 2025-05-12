import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Card, Grid, Button, TextField, InputAdornment, Tabs, Tab, Avatar, CircularProgress, Alert, IconButton } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, OpenInNew as OpenInNewIcon, Task as TaskIcon } from '@mui/icons-material';
import { getApiUrl } from '../../config/api';
import Dialog from '@mui/material/Dialog';
import ServiceDeskForm from './ServiceDeskForm';
import RoomIcon from '@mui/icons-material/Room';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Tooltip from '@mui/material/Tooltip';

const REQUESTS_API = '/service-desk/requests';
const TYPES_API = '/service-desk/request-types';

const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

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
      .catch(e => setError(e.message || 'Błąd pobierania typów zgłoszeń'))
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
  const [status, setStatus] = useState('new');
  const [search, setSearch] = useState('');
  const { types, loading: typesLoading, error: typesError } = useServiceDeskTypes();
  const { requests, loading, error, refresh } = useServiceDeskRequests(status, search);
  const isPageVisible = usePageVisibility();

  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPageVisible) {
      intervalId = setInterval(() => {
        refresh();
      }, 3 * 60 * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPageVisible, refresh]);

  const handleTabChange = (_: any, value: string) => setStatus(value);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 2, md: 4 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        mb: 3,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Service Desk
          </Typography>
          <Button
            variant="text"
            color="primary"
            startIcon={<OpenInNewIcon sx={{ color: theme => theme.palette.primary.main }} />}
            onClick={() => window.open('/servicedesk/request', '_blank', 'noopener,noreferrer')}
            sx={{
              mt: 1,
              mb: 2,
              fontWeight: 500,
              fontSize: '1rem',
              px: 1.5,
              py: 1,
              color: theme => theme.palette.primary.main,
              background: 'none',
              boxShadow: 'none',
              textTransform: 'none',
              alignItems: 'center',
              gap: 1.5,
              '&:hover': {
                textDecoration: 'underline',
                background: 'none',
                color: theme => theme.palette.primary.dark,
              },
            }}
          >
            Otwórz publiczny formularz
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>
            + Nowe zgłoszenie
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading}>
            Odśwież
          </Button>
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
        <Grid container spacing={3}>
          {requests.length === 0 ? (
            <Grid item xs={12}><Alert severity="info">Brak zgłoszeń.</Alert></Grid>
          ) : requests.map(req => (
            <Grid item xs={12} sm={6} md={4} key={req.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: 6,
                  bgcolor: theme => theme.palette.background.paper,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  p: 0,
                  '&:hover': {
                    boxShadow: 12,
                    transform: 'translateY(-4px) scale(1.02)',
                  },
                }}
              >
                <Box sx={{ p: 2, pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Nagłówek: tytuł + badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ flex: 1, color: theme => theme.palette.text.primary, fontSize: 20, lineHeight: 1.2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{req.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0 }}>
                    <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary, fontStyle: 'italic' }}>
                      {new Date(req.created_at).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {/* Opis */}
                  <Typography variant="body2" sx={{ color: theme => theme.palette.text.secondary, mb: 2, minHeight: 40, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {req.description}
                  </Typography>
                  {/* Priorytet i typ */}
                  <Box sx={{ gap: 0.5, mb: 1 }}>
                    <Chip label={req.priority === 'high' ? 'Wysoki priorytet' : req.priority === 'medium' ? 'Średni priorytet' : 'Niski priorytet'} color={req.priority === 'high' ? 'error' : req.priority === 'medium' ? 'warning' : 'default'} size="small" sx={{ fontWeight: 600 }} />
                    {req.type && types[req.type] && (
                      <Chip 
                        label={types[req.type].name} variant="outlined" size="small" sx={{ bgcolor: theme => theme.palette.background.default, color: theme => theme.palette.text.primary, borderColor: theme => theme.palette.divider }} />
                    )}
                    <Chip 
                      label={req.location || 'Brak lokalizacji'} 
                      variant="outlined" 
                      size="small" 
                      icon={<RoomIcon sx={{ color: theme => theme.palette.primary.main, fontSize: 18 }} />}
                      sx={{ 
                        bgcolor: theme => theme.palette.background.default, 
                        color: theme => theme.palette.text.primary, 
                        borderColor: theme => theme.palette.divider 
                      }}
                    />
                  </Box>
                </Box>

                {/* Stopka: zgłosił + buttony */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderTop: theme => `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 13, bgcolor: theme => theme.palette.background.default, color: theme => theme.palette.text.primary }}>{req.created_by_user?.username?.[0] || '?'}</Avatar>
                      <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary }}>Zgłosił: {req.created_by_user?.username || req.created_by}</Typography>
                    </Box>
                    {/* Przypisany użytkownik lub przycisk przypisania */}
                    {req.assigned_user ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: 12, bgcolor: theme => theme.palette.background.default, color: theme => theme.palette.text.primary }}>{req.assigned_user.username?.[0] || '?'}</Avatar>
                        <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary }}>Przypisany: {req.assigned_user.username || req.assigned_user.username}</Typography>
                      </Box>
                    ) : (
                      <Tooltip title="Przypisz użytkownika">
                        <IconButton size="small" sx={{ color: theme => theme.palette.text.secondary, p: 0.5, mt: 0.5 }}>
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Box>
                    <Tooltip title="Szczegóły">
                      <IconButton size="small" sx={{ color: theme => theme.palette.primary.main, p: 0.5 }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: theme => ({
            borderRadius: 4,
            background: theme.palette.mode === 'dark' ? 'rgba(32,32,40,0.98)' : 'rgba(255,255,255,0.98)',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
            backdropFilter: 'blur(10px)',
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            maxWidth: 520,
            mx: 'auto',
            overflow: 'visible',
          })
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(30,30,40,0.45)',
            backdropFilter: 'blur(2px)',
          }
        }}
      >
        <Box sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TaskIcon color="warning" sx={{ fontSize: 36, mr: 1 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Nowe zgłoszenie
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Utwórz zgłoszenie jako zalogowany użytkownik
          </Typography>
          <ServiceDeskForm
            title=""
            subtitle=""
            onSuccess={() => { setOpenForm(false); refresh(); }}
            onError={() => {}}
            className="servicedesk-modal-form"
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default ServiceDeskPage;
