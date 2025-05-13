import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Chip, Card, Grid, Button, TextField, InputAdornment, Tabs, Tab, Avatar, CircularProgress, Alert, IconButton, Select, MenuItem, Dialog, Divider, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Menu } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, OpenInNew as OpenInNewIcon, Task as TaskIcon, ViewModule as ViewModuleIcon, ViewList as ViewListIcon } from '@mui/icons-material';
import { getApiUrl } from '../../config/api';
import ServiceDeskForm from './ServiceDeskForm';
import RoomIcon from '@mui/icons-material/Room';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Tooltip from '@mui/material/Tooltip';
import { getUsersAPI } from '../../services/userService';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';

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
        setRequests(data);
      })
      .catch(e => setError(e.message || 'Błąd pobierania zgłoszeń'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [status]);

  // Filtrowanie lokalne:
  const filteredRequests = search
    ? requests.filter((r: any) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        (r.location && r.location.toLowerCase().includes(search.toLowerCase()))
      )
    : requests;

  return { requests: filteredRequests, loading, error, refresh: fetchRequests };
};

const ServiceDeskPage: React.FC = () => {
  const [status, setStatus] = useState('new');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { types, loading: typesLoading, error: typesError } = useServiceDeskTypes();
  const { requests, loading, error, refresh } = useServiceDeskRequests(status, search);
  const isPageVisible = usePageVisibility();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();
  const [users, setUsers] = useState<any[]>([]);
  const [, setUsersLoading] = useState(false);
  const [, setUsersError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [assignDropdownOpenId, setAssignDropdownOpenId] = useState<string | null>(null);
  const assignButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [menuWidth, setMenuWidth] = useState<number>(220);
  const isEditable = selectedRequest && selectedRequest.status !== 'closed' && selectedRequest.status !== 'resolved';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const changeStatus = async (id: string, newStatus: string, onSuccess?: () => void) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(getApiUrl(`/service-desk/requests/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Błąd zmiany statusu');
      showSnackbar('success', 'Status zmieniony pomyślnie');
      onSuccess?.();
    } catch (e) {
      showSnackbar('error', 'Nie udało się zmienić statusu');
    }
  };

  const assignUser = async (id: string, assigned_to_id: number, onSuccess?: () => void) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(getApiUrl(`/service-desk/requests/${id}/assign`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assigned_to_id }),
      });
      if (!res.ok) throw new Error('Błąd przypisywania użytkownika');
      showSnackbar('success', 'Użytkownik przypisany pomyślnie');
      onSuccess?.();
    } catch (e) {
      showSnackbar('error', 'Nie udało się przypisać użytkownika');
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    changeStatus(id, newStatus, () => {
      refresh();
      if (selectedRequest) {
        setSelectedRequest((prev: any) => ({ ...prev, status: newStatus }));
      }
    });
  };

  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };

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

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await getUsersAPI();
        setUsers(data);
      } catch (e: any) {
        setUsersError(e.message || 'Błąd pobierania użytkowników');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!assignDropdownOpenId) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        assignDropdownOpenId &&
        assignButtonRefs.current[assignDropdownOpenId] &&
        !assignButtonRefs.current[assignDropdownOpenId]?.contains(event.target as Node)
      ) {
        setAssignDropdownOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [assignDropdownOpenId]);

  const handleTabChange = (_: any, value: string) => setStatus(value);

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'cards' | 'list') => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleAssignSave = async (user: any) => {
    if (!selectedRequest) return;
    setAssignDropdownOpenId(null);
    await assignUser(selectedRequest.id, user.id, () => {
      refresh();
      if (selectedRequest) {
        setSelectedRequest((prev: any) => ({ ...prev, assigned_to_user: user }));
      }
    });
  };

  const handleAssignDropdownOpen = (reqId: string) => {
    setAssignDropdownOpenId(reqId);
    setTimeout(() => {
      const btn = assignButtonRefs.current[reqId];
      if (btn) setMenuWidth(btn.offsetWidth);
    }, 0);
  };

  const handleAssignDropdownClose = () => setAssignDropdownOpenId(null);

  const renderCardsView = () => (
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
              cursor: 'pointer',
            }}
            onClick={() => handleOpenDetails(req)}
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
                <Box
                  ref={el => assignButtonRefs.current[req.id] = el as HTMLDivElement | null}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                  onClick={() => isEditable && handleAssignDropdownOpen(req.id)}
                  tabIndex={isEditable ? 0 : -1}
                  aria-disabled={!isEditable}
                  role="button"
                >
                  <Avatar sx={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                    {req.assigned_to_user ? req.assigned_to_user.username[0]?.toUpperCase() : <PersonAddIcon fontSize="small" />}
                  </Avatar>
                  <Typography variant="body2" fontWeight={500} color="text.secondary">
                    {req.assigned_to_user ? req.assigned_to_user.username : 'Nie przypisano'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Tooltip title="Szczegóły">
                  <IconButton size="small" sx={{ color: theme => theme.palette.primary.main, p: 0.5 }}>
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 6 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tytuł</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priorytet</TableCell>
            <TableCell>Typ</TableCell>
            <TableCell>Zgłosił</TableCell>
            <TableCell>Data utworzenia</TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Alert severity="info">Brak zgłoszeń.</Alert>
              </TableCell>
            </TableRow>
          ) : requests.map(req => (
            <TableRow
              key={req.id}
              hover
              onClick={() => handleOpenDetails(req)}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: theme => theme.palette.action.hover } }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {req.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={req.status === 'new' ? 'Nowe' : 
                         req.status === 'in_progress' ? 'W trakcie' :
                         req.status === 'waiting' ? 'Oczekuje' :
                         req.status === 'resolved' ? 'Rozwiązane' : 'Zamknięte'}
                  size="small"
                  color={req.status === 'new' ? 'primary' :
                         req.status === 'in_progress' ? 'info' :
                         req.status === 'waiting' ? 'warning' :
                         req.status === 'resolved' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={req.priority === 'high' ? 'Wysoki' : req.priority === 'medium' ? 'Średni' : 'Niski'}
                  size="small"
                  color={req.priority === 'high' ? 'error' : req.priority === 'medium' ? 'warning' : 'default'}
                />
              </TableCell>
              <TableCell>
                {req.type && types[req.type] && (
                  <Chip
                    label={types[req.type].name}
                    size="small"
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 13 }}>
                    {req.created_by_user?.username?.[0] || '?'}
                  </Avatar>
                  <Typography variant="body2">
                    {req.created_by_user?.username || req.created_by}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(req.created_at).toLocaleString('pl-PL')}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDetails(req);
                }}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 0.5, sm: 1, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between', 
        mb: 3,
        gap: { xs: 2, sm: 2 },
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: 26, sm: 32 } }}>
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
              fontSize: { xs: '1rem', sm: '1.1rem' },
              px: 1.5,
              py: 1,
              color: theme => theme.palette.primary.main,
              background: 'none',
              boxShadow: 'none',
              textTransform: 'none',
              alignItems: 'center',
              gap: 1.5,
              width: { xs: '100%', sm: 'auto' },
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '1.1rem', sm: '1rem' },
              py: { xs: 1.5, sm: 1 },
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            + Nowe zgłoszenie
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '1.1rem', sm: '1rem' },
              py: { xs: 1.2, sm: 1 },
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            Odśwież
          </Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="tryb widoku"
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <ToggleButton value="cards" aria-label="widok kart" sx={{ width: { xs: '50%', sm: 'auto' } }}>
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="widok listy" sx={{ width: { xs: '50%', sm: 'auto' } }}>
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
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
        sx={{ mb: 3, fontSize: { xs: 16, sm: 18 } }}
      />
      {typesError && <Alert severity="error">{typesError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {(loading || typesLoading) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        viewMode === 'cards' ? renderCardsView() : renderListView()
      )}
      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Dialog
        open={isDetailsModalOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: theme => ({
            borderRadius: isMobile ? 0 : 4,
            background: theme.palette.mode === 'dark' ? 'rgba(32,32,40,0.98)' : 'rgba(255,255,255,0.98)',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
            backdropFilter: 'blur(10px)',
            boxShadow: isMobile ? 0 : 24,
            p: 0,
            maxWidth: isMobile ? '100vw' : 900,
            mx: 'auto',
            overflow: 'visible',
          })
        }}
      >
        {selectedRequest && (
          <Box sx={{ minHeight: isMobile ? '100vh' : 400, display: 'flex', flexDirection: 'column', height: isMobile ? '100dvh' : 'auto', position: 'relative' }}>
            {/* HEADER: X tylko na mobile sticky, na desktopie absolutny */}
            {isMobile ? (
              <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                bgcolor: 'background.paper',
                borderBottom: theme => `1px solid ${theme.palette.divider}`,
                px: { xs: 2, sm: 3, md: 4 },
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48,
                gap: 1,
              }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    fontSize: 20,
                    color: 'primary.main',
                    flex: 1,
                    textAlign: 'left',
                    pr: 2,
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: 56,
                  }}
                >
                  {selectedRequest.title}
                </Typography>
                <IconButton onClick={handleCloseDetails} size="large" aria-label="Zamknij" sx={{ ml: 1 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>×</span>
                </IconButton>
              </Box>
            ) : (
              <IconButton onClick={handleCloseDetails} size="large" aria-label="Zamknij" sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                zIndex: 30,
                bgcolor: 'rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.18)' },
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>×</span>
              </IconButton>
            )}
            {/* CONTENT */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 3, md: 4 }, pt: isMobile ? 1 : 3, pb: isMobile ? 2 : 4 }}>
              {isMobile ? (
                <>
                  {/* Priorytet i status na górze */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 1 }}>
                    <Chip
                      label={selectedRequest.priority === 'high' ? 'Wysoki' : selectedRequest.priority === 'medium' ? 'Średni' : 'Niski'}
                      color={selectedRequest.priority === 'high' ? 'error' : selectedRequest.priority === 'medium' ? 'warning' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2 }}
                    />
                    <Select
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2, bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="new">Nowe</MenuItem>
                      <MenuItem value="in_progress">W trakcie</MenuItem>
                      <MenuItem value="waiting">Oczekuje</MenuItem>
                      <MenuItem value="resolved">Rozwiązane</MenuItem>
                      <MenuItem value="closed">Zamknięte</MenuItem>
                    </Select>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.primary', wordBreak: 'break-word', fontSize: 15 }}>
                    {selectedRequest.description || 'Brak opisu'}
                  </Typography>
                  <Box sx={{ bgcolor: 'background.default', borderRadius: 3, minHeight: 60, color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', fontSize: 13, mb: 3, p: 2 }}>
                    Aktywność / komentarze (wkrótce)
                  </Box>
                  {/* Przypisanie użytkownika */}
                  <Box
                    ref={el => assignButtonRefs.current[selectedRequest.id] = el as HTMLDivElement | null}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                    onClick={() => isEditable && handleAssignDropdownOpen(selectedRequest.id)}
                    tabIndex={isEditable ? 0 : -1}
                    aria-disabled={!isEditable}
                    role="button"
                  >
                    <Avatar sx={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                      {selectedRequest.assigned_to_user ? selectedRequest.assigned_to_user.username[0]?.toUpperCase() : <PersonAddIcon fontSize="small" />}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {selectedRequest.assigned_to_user ? selectedRequest.assigned_to_user.username : 'Nie przypisano'}
                    </Typography>
                  </Box>
                  <Menu
                    anchorEl={selectedRequest?.id ? assignButtonRefs.current[selectedRequest.id] ?? undefined : undefined}
                    open={assignDropdownOpenId === selectedRequest.id}
                    onClose={handleAssignDropdownClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{ sx: { minWidth: menuWidth } }}
                  >
                    {users.map(user => (
                      <MenuItem
                        key={user.id}
                        selected={selectedRequest?.assigned_to_user?.id === user.id}
                        onClick={() => {
                          handleAssignSave(user);
                          handleAssignDropdownClose();
                        }}
                        disabled={!isEditable}
                      >
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{user.username[0]?.toUpperCase()}</Avatar>
                        {user.username}
                      </MenuItem>
                    ))}
                  </Menu>
                  {/* Zgłaszający */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                      {selectedRequest.created_by_user?.username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRequest.created_by_user?.username || selectedRequest.created_by}
                    </Typography>
                  </Box>
                  {/* Pozostałe szczegóły ... */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Priorytet</Typography>
                    <Chip label={selectedRequest.priority === 'high' ? 'Wysoki' : selectedRequest.priority === 'medium' ? 'Średni' : 'Niski'} color={selectedRequest.priority === 'high' ? 'error' : selectedRequest.priority === 'medium' ? 'warning' : 'default'} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Select
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 120, fontWeight: 500 }}
                    >
                      <MenuItem value="new">Nowe</MenuItem>
                      <MenuItem value="in_progress">W trakcie</MenuItem>
                      <MenuItem value="waiting">Oczekuje</MenuItem>
                      <MenuItem value="resolved">Rozwiązane</MenuItem>
                      <MenuItem value="closed">Zamknięte</MenuItem>
                    </Select>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Typ</Typography>
                    {selectedRequest.type && types[selectedRequest.type] && (
                      <Chip label={types[selectedRequest.type].name} size="small" variant="outlined" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Lokalizacja</Typography>
                    <Typography variant="body2">{selectedRequest.location || 'Brak'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Data utworzenia</Typography>
                    <Typography variant="body2">{new Date(selectedRequest.created_at).toLocaleString('pl-PL')}</Typography>
                  </Box>
                </>
              ) : (
                <Grid container spacing={0} alignItems="flex-start" wrap="nowrap">
                  {/* Lewa kolumna: tytuł, opis, aktywność */}
                  <Grid item xs={12} md={7} sx={{ pr: 4, minWidth: 0 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: 'primary.main', wordBreak: 'break-word', fontSize: { xs: 20, sm: 24 } }}>
                      {selectedRequest.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: 'text.primary', wordBreak: 'break-word', fontSize: 16 }}>
                      {selectedRequest.description || 'Brak opisu'}
                    </Typography>
                    <Box sx={{ bgcolor: 'background.default', borderRadius: 3, minHeight: 80, color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', fontSize: 15, mb: 3, p: 2 }}>
                      Aktywność / komentarze (wkrótce)
                    </Box>
                  </Grid>
                  {/* Divider pionowy */}
                  <Grid item sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch' }}>
                    <Divider orientation="vertical" flexItem sx={{ height: '100%', minHeight: 320, mx: 0 }} />
                  </Grid>
                  {/* Prawa kolumna: szczegóły zgłoszenia */}
                  <Grid item xs={12} md={5} sx={{ pl: 4, minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.secondary', letterSpacing: 1, fontSize: 16 }}>
                      Szczegóły
                    </Typography>
                    {/* Przypisanie użytkownika */}
                    <Box
                      ref={el => assignButtonRefs.current[selectedRequest.id] = el as HTMLDivElement | null}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                      onClick={() => isEditable && handleAssignDropdownOpen(selectedRequest.id)}
                      tabIndex={isEditable ? 0 : -1}
                      aria-disabled={!isEditable}
                      role="button"
                    >
                      <Avatar sx={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                        {selectedRequest.assigned_to_user ? selectedRequest.assigned_to_user.username[0]?.toUpperCase() : <PersonAddIcon fontSize="small" />}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500} color="text.secondary">
                        {selectedRequest.assigned_to_user ? selectedRequest.assigned_to_user.username : 'Nie przypisano'}
                      </Typography>
                    </Box>
                    <Menu
                      anchorEl={selectedRequest?.id ? assignButtonRefs.current[selectedRequest.id] ?? undefined : undefined}
                      open={assignDropdownOpenId === selectedRequest.id}
                      onClose={handleAssignDropdownClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      PaperProps={{ sx: { minWidth: menuWidth } }}
                    >
                      {users.map(user => (
                        <MenuItem
                          key={user.id}
                          selected={selectedRequest?.assigned_to_user?.id === user.id}
                          onClick={() => {
                            handleAssignSave(user);
                            handleAssignDropdownClose();
                          }}
                          disabled={!isEditable}
                        >
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{user.username[0]?.toUpperCase()}</Avatar>
                          {user.username}
                        </MenuItem>
                      ))}
                    </Menu>
                    {/* Zgłaszający */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                        {selectedRequest.created_by_user?.username?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedRequest.created_by_user?.username || selectedRequest.created_by}
                      </Typography>
                    </Box>
                    {/* Pozostałe szczegóły ... */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Priorytet</Typography>
                      <Chip label={selectedRequest.priority === 'high' ? 'Wysoki' : selectedRequest.priority === 'medium' ? 'Średni' : 'Niski'} color={selectedRequest.priority === 'high' ? 'error' : selectedRequest.priority === 'medium' ? 'warning' : 'default'} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Select
                        value={selectedRequest.status}
                        onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120, fontWeight: 500 }}
                      >
                        <MenuItem value="new">Nowe</MenuItem>
                        <MenuItem value="in_progress">W trakcie</MenuItem>
                        <MenuItem value="waiting">Oczekuje</MenuItem>
                        <MenuItem value="resolved">Rozwiązane</MenuItem>
                        <MenuItem value="closed">Zamknięte</MenuItem>
                      </Select>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Typ</Typography>
                      {selectedRequest.type && types[selectedRequest.type] && (
                        <Chip label={types[selectedRequest.type].name} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Lokalizacja</Typography>
                      <Typography variant="body2">{selectedRequest.location || 'Brak'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Data utworzenia</Typography>
                      <Typography variant="body2">{new Date(selectedRequest.created_at).toLocaleString('pl-PL')}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        )}
      </Dialog>
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
