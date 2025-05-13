import React from 'react';
import { Dialog, Box, Typography, IconButton, Chip, Select, MenuItem, Avatar, Divider, Grid, Menu } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface ServiceDeskDetailsModalProps {
  open: boolean;
  request: any;
  types: Record<string, any>;
  users: any[];
  isMobile: boolean;
  onClose: () => void;
  onAssign: (requestId: string, user: any) => void;
  assignDropdownOpenId: string | null;
  assignButtonRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  menuWidth: number;
  handleAssignDropdownOpen: (reqId: string) => void;
  handleAssignDropdownClose: () => void;
  isEditable: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
}

const ServiceDeskDetailsModal: React.FC<ServiceDeskDetailsModalProps> = ({
  open,
  request,
  types,
  users,
  isMobile,
  onClose,
  onAssign,
  assignDropdownOpenId,
  assignButtonRefs,
  menuWidth,
  handleAssignDropdownOpen,
  handleAssignDropdownClose,
  isEditable,
  onStatusChange
}) => {
  if (!request) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              {request.title}
            </Typography>
            <IconButton onClick={onClose} size="large" aria-label="Zamknij" sx={{ ml: 1 }}>
              <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>×</span>
            </IconButton>
          </Box>
        ) : (
          <IconButton onClick={onClose} size="large" aria-label="Zamknij" sx={{
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
                  label={request.priority === 'high' ? 'Wysoki' : request.priority === 'medium' ? 'Średni' : 'Niski'}
                  color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'}
                  size="medium"
                  sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2 }}
                />
                <Select
                  value={request.status}
                  onChange={(e) => onStatusChange(request.id, e.target.value)}
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
                {request.description || 'Brak opisu'}
              </Typography>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 3, minHeight: 60, color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', fontSize: 13, mb: 3, p: 2 }}>
                Aktywność / komentarze (wkrótce)
              </Box>
              {/* Przypisanie użytkownika */}
              <Box
                ref={el => { if (request.id) assignButtonRefs.current[request.id] = el as HTMLDivElement | null; }}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                onClick={() => isEditable && handleAssignDropdownOpen(request.id)}
                tabIndex={isEditable ? 0 : -1}
                aria-disabled={!isEditable}
                role="button"
              >
                <Avatar sx={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                  {request.assigned_to_user ? request.assigned_to_user.username[0]?.toUpperCase() : <PersonAddIcon fontSize="small" />}
                </Avatar>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  {request.assigned_to_user ? request.assigned_to_user.username : 'Nie przypisano'}
                </Typography>
              </Box>
              <Menu
                anchorEl={request?.id ? assignButtonRefs.current[request.id] ?? undefined : undefined}
                open={assignDropdownOpenId === request.id}
                onClose={handleAssignDropdownClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { minWidth: menuWidth } }}
              >
                {users.map(user => (
                  <MenuItem
                    key={user.id}
                    selected={request.assigned_to_user?.id === user.id}
                    onClick={() => {
                      onAssign(request.id, user);
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
                  {request.created_by_user?.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {request.created_by_user?.username || request.created_by}
                </Typography>
              </Box>
              {/* Pozostałe szczegóły ... */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Priorytet</Typography>
                <Chip label={request.priority === 'high' ? 'Wysoki' : request.priority === 'medium' ? 'Średni' : 'Niski'} color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'} size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Select
                  value={request.status}
                  onChange={(e) => onStatusChange(request.id, e.target.value)}
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
                {request.type && types[request.type] && (
                  <Chip label={types[request.type].name} size="small" variant="outlined" />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Lokalizacja</Typography>
                <Typography variant="body2">{request.location || 'Brak'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Data utworzenia</Typography>
                <Typography variant="body2">{new Date(request.created_at).toLocaleString('pl-PL')}</Typography>
              </Box>
            </>
          ) : (
            <Grid container spacing={0} alignItems="flex-start" wrap="nowrap">
              {/* Lewa kolumna: tytuł, opis, aktywność */}
              <Grid item xs={12} md={7} sx={{ pr: 4, minWidth: 0 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: 'primary.main', wordBreak: 'break-word', fontSize: { xs: 20, sm: 24 } }}>
                  {request.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.primary', wordBreak: 'break-word', fontSize: 16 }}>
                  {request.description || 'Brak opisu'}
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
                  ref={el => { if (request.id) assignButtonRefs.current[request.id] = el as HTMLDivElement | null; }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                  onClick={() => isEditable && handleAssignDropdownOpen(request.id)}
                  tabIndex={isEditable ? 0 : -1}
                  aria-disabled={!isEditable}
                  role="button"
                >
                  <Avatar sx={{ width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, bgcolor: 'background.default', color: 'text.primary', fontWeight: 600 }}>
                    {request.assigned_to_user ? request.assigned_to_user.username[0]?.toUpperCase() : <PersonAddIcon fontSize="small" />}
                  </Avatar>
                  <Typography variant="body2" fontWeight={500} color="text.secondary">
                    {request.assigned_to_user ? request.assigned_to_user.username : 'Nie przypisano'}
                  </Typography>
                </Box>
                <Menu
                  anchorEl={request?.id ? assignButtonRefs.current[request.id] ?? undefined : undefined}
                  open={assignDropdownOpenId === request.id}
                  onClose={handleAssignDropdownClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ sx: { minWidth: menuWidth } }}
                >
                  {users.map(user => (
                    <MenuItem
                      key={user.id}
                      selected={request.assigned_to_user?.id === user.id}
                      onClick={() => {
                        onAssign(request.id, user);
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
                    {request.created_by_user?.username?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Typography variant="body2" fontWeight={500}>
                    {request.created_by_user?.username || request.created_by}
                  </Typography>
                </Box>
                {/* Pozostałe szczegóły ... */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Priorytet</Typography>
                  <Chip label={request.priority === 'high' ? 'Wysoki' : request.priority === 'medium' ? 'Średni' : 'Niski'} color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Select
                    value={request.status}
                    onChange={(e) => onStatusChange(request.id, e.target.value)}
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
                  {request.type && types[request.type] && (
                    <Chip label={types[request.type].name} size="small" variant="outlined" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Lokalizacja</Typography>
                  <Typography variant="body2">{request.location || 'Brak'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Data utworzenia</Typography>
                  <Typography variant="body2">{new Date(request.created_at).toLocaleString('pl-PL')}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default ServiceDeskDetailsModal; 