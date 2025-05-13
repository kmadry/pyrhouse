import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Tabs, Tab, CircularProgress, Alert, Dialog, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, OpenInNew as OpenInNewIcon, Task as TaskIcon, ViewModule as ViewModuleIcon, ViewList as ViewListIcon } from '@mui/icons-material';
import { getApiUrl } from '../../config/api';
import ServiceDeskForm from './ServiceDeskForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';
import { useServiceDeskTypes } from '../../hooks/useServiceDeskTypes';
import { useServiceDeskRequests } from '../../hooks/useServiceDeskRequests';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { useServiceDeskUsers } from '../../hooks/useServiceDeskUsers';
import ServiceDeskCardsView from './ServiceDesk/ServiceDeskCardsView';
import ServiceDeskListView from './ServiceDesk/ServiceDeskListView';
import ServiceDeskDetailsModal from './ServiceDesk/ServiceDeskDetailsModal';

const ServiceDeskPage: React.FC = () => {
  const [status, setStatus] = useState('new');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const { types, loading: typesLoading, error: typesError } = useServiceDeskTypes();
  const { requests, loading, error, refresh } = useServiceDeskRequests(status, search);
  const isPageVisible = usePageVisibility();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();
  const { users } = useServiceDeskUsers();

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

  const handleAssignDropdownOpen = (reqId: string) => {
    setAssignDropdownOpenId(reqId);
    setTimeout(() => {
      const btn = assignButtonRefs.current[reqId];
      if (btn) setMenuWidth(btn.offsetWidth);
    }, 0);
  };

  const handleAssignDropdownClose = () => setAssignDropdownOpenId(null);

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
              borderRadius: 1,
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
              borderRadius: 1,
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
        viewMode === 'cards' ? (
          <ServiceDeskCardsView
            requests={requests}
            types={types}
            users={users}
            isMobile={isMobile}
            onOpenDetails={handleOpenDetails}
            onAssign={async (requestId, user) => {
              await assignUser(requestId, user.id, () => {
                refresh();
                if (selectedRequest && selectedRequest.id === requestId) {
                  setSelectedRequest((prev: any) => ({ ...prev, assigned_to_user: user }));
                }
              });
            }}
            assignDropdownOpenId={assignDropdownOpenId}
            assignButtonRefs={assignButtonRefs}
            menuWidth={menuWidth}
            handleAssignDropdownOpen={handleAssignDropdownOpen}
            handleAssignDropdownClose={handleAssignDropdownClose}
            isEditable={isEditable}
          />
        ) : (
          <ServiceDeskListView
            requests={requests}
            types={types}
            users={users}
            isMobile={isMobile}
            onOpenDetails={handleOpenDetails}
            onAssign={async (requestId, user) => {
              await assignUser(requestId, user.id, () => {
                refresh();
                if (selectedRequest && selectedRequest.id === requestId) {
                  setSelectedRequest((prev: any) => ({ ...prev, assigned_to_user: user }));
                }
              });
            }}
            assignDropdownOpenId={assignDropdownOpenId}
            assignButtonRefs={assignButtonRefs}
            menuWidth={menuWidth}
            handleAssignDropdownOpen={handleAssignDropdownOpen}
            handleAssignDropdownClose={handleAssignDropdownClose}
            isEditable={isEditable}
          />
        )
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
      <ServiceDeskDetailsModal
        open={isDetailsModalOpen}
        request={selectedRequest}
        types={types}
        users={users}
        isMobile={isMobile}
        onClose={handleCloseDetails}
        onAssign={async (requestId, user) => {
          await assignUser(requestId, user.id, () => {
            refresh();
            if (selectedRequest && selectedRequest.id === requestId) {
              setSelectedRequest((prev: any) => ({ ...prev, assigned_to_user: user }));
            }
          });
        }}
        assignDropdownOpenId={assignDropdownOpenId}
        assignButtonRefs={assignButtonRefs}
        menuWidth={menuWidth}
        handleAssignDropdownOpen={handleAssignDropdownOpen}
        handleAssignDropdownClose={handleAssignDropdownClose}
        isEditable={isEditable}
        onStatusChange={handleStatusChange}
      />
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
