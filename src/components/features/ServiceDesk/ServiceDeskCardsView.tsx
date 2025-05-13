import React from 'react';
import { Grid, Card, Box, Typography, Chip, Avatar, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface ServiceDeskCardsViewProps {
  requests: any[];
  types: Record<string, any>;
  users: any[];
  isMobile: boolean;
  onOpenDetails: (request: any) => void;
  onAssign: (requestId: string, user: any) => void;
  assignDropdownOpenId: string | null;
  assignButtonRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  menuWidth: number;
  handleAssignDropdownOpen: (reqId: string) => void;
  handleAssignDropdownClose: () => void;
  isEditable: boolean;
}

const ServiceDeskCardsView: React.FC<ServiceDeskCardsViewProps> = ({
  requests,
  types,
  users,
  isMobile,
  onOpenDetails,
  onAssign,
  assignDropdownOpenId,
  assignButtonRefs,
  menuWidth,
  handleAssignDropdownOpen,
  handleAssignDropdownClose,
  isEditable
}) => {
  return (
    <Grid container spacing={3}>
      {requests.length === 0 ? (
        <Grid item xs={12}><Typography variant="body2">Brak zgłoszeń.</Typography></Grid>
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
            onClick={() => onOpenDetails(req)}
          >
            <Box sx={{ p: 2, pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ flex: 1, color: theme => theme.palette.text.primary, fontSize: 20, lineHeight: 1.2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{req.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0 }}>
                <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary, fontStyle: 'italic' }}>
                  {new Date(req.created_at).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: theme => theme.palette.text.secondary, mb: 2, minHeight: 40, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {req.description}
              </Typography>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderTop: theme => `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 13, bgcolor: theme => theme.palette.background.default, color: theme => theme.palette.text.primary }}>{req.created_by_user?.username?.[0] || '?'}</Avatar>
                  <Typography variant="caption" sx={{ color: theme => theme.palette.text.secondary }}>Zgłosił: {req.created_by_user?.username || req.created_by}</Typography>
                </Box>
                <Box
                  ref={el => { if (req.id) assignButtonRefs.current[req.id] = el as HTMLDivElement | null; }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, cursor: isEditable ? 'pointer' : 'not-allowed', opacity: isEditable ? 1 : 0.7, borderRadius: 2, px: 1, py: 0.5, '&:hover': isEditable ? { bgcolor: 'action.hover' } : {}, transition: 'background 0.2s' }}
                  onClick={e => { e.stopPropagation(); if (isEditable) handleAssignDropdownOpen(req.id); }}
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
                <Menu
                  anchorEl={req?.id ? assignButtonRefs.current[req.id] ?? undefined : undefined}
                  open={assignDropdownOpenId === req.id}
                  onClose={handleAssignDropdownClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ sx: { minWidth: menuWidth } }}
                >
                  {users.map(user => (
                    <MenuItem
                      key={user.id}
                      selected={req.assigned_to_user?.id === user.id}
                      onClick={() => {
                        onAssign(req.id, user);
                        handleAssignDropdownClose();
                      }}
                      disabled={!isEditable}
                    >
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{user.username[0]?.toUpperCase()}</Avatar>
                      {user.username}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Box>
                <Tooltip title="Szczegóły">
                  <IconButton size="small" sx={{ color: theme => theme.palette.primary.main, p: 0.5 }} onClick={e => { e.stopPropagation(); onOpenDetails(req); }}>
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
};

export default ServiceDeskCardsView; 